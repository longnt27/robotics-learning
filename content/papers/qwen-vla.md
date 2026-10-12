> **Bài do bạn cung cấp.** [Qwen-VLA: Unifying Vision-Language-Action Modeling across Tasks, Environments, and Robot Embodiments](https://arxiv.org/abs/2605.30280), Qwen Team, arXiv 2026. Đọc song song với **Figure 2** về kiến trúc, **Tables 1–2** về hỗn hợp dữ liệu/embodiment, và **Tables 4–6** về kết quả. Tên “Qwen-VLA” không có nghĩa mọi capability đã khái quát ngang nhau.

## Vì sao cần nghiên cứu này?

### Một mô hình cho manipulation, navigation và quỹ đạo dự đoán?

Các nhánh embodied learning thường sống trong ba hệ sinh thái tương đối riêng: robot manipulation với gripper/arms, mobile navigation với vị trí/hướng đi và quỹ đạo nhiệm vụ với kiểu trạng thái đầu ra khác nhau. Ngay trong manipulation, mỗi robot có số DoF, hệ toạ độ, action frequency và convention riêng. Nếu phải huấn luyện một checkpoint cho mỗi robot/nhiệm vụ, **dữ liệu không chia sẻ prior** một cách hiệu quả; sự hiểu biết về cái cốc ở một robot không dễ sang robot khác.

Trong khi đó, đã pretrain Qwen VLM đã học nhận diện vật, ngôn ngữ, không gian và nhiều quan hệ ngữ nghĩa. Câu hỏi của Qwen-VLA là liệu có thể **dùng chung một vision-language-action foundation** cho các dạng embodied decision-making khác nhau, thay vì duy trì riêng robot policy, mô hình navigation và quỹ đạo predictor. Nó muốn unified không chỉ ở phần perception/understanding mà còn tại **action liên tục/quỹ đạo sinh**.

Khó khăn là **action semantics không đồng nhất**. Một vector 7 chiều có thể là end-effector translation/rotation/gripper; robot khác 14 joint angles; agent navigation lại xuất waypoint và heading. Đưa tất cả vào cùng tensor padding mà không mô tả embodiment sẽ khiến mô hình học mapping mơ hồ. Vì vậy kiến trúc phải đồng thời giải VLM grounding, biểu diễn/conditioning và sinh action.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/qwen-vla/figure-1.webp)

*Hình 1, trang 1. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2605.30280#page=1).*

#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là bản đồ của một mô hình embodied chung có cả manipulation, navigation và vision-language understanding. Những khả năng này không có cùng action space hay mức supervision. Quan sát từ camera, mô tả embodiment, instruction và điều kiện nhiệm vụ phải được căn chỉnh để action decoder biết đang phục vụ robot nào. Nếu chỉ nhìn một backbone lớn rồi kết luận policy chạy trên mọi robot, ta đã bỏ qua lớp action interface và việc dữ liệu đến từ các nhóm nhiệm vụ rất khác nhau.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Kết hợp Qwen VLM, mô tả embodiment và DiT flow expert để điều khiển nhiều loại robot. Trong khi đó, đã pretrain Qwen VLM đã học nhận diện vật, ngôn ngữ, không gian và nhiều quan hệ ngữ nghĩa.

**Vấn đề khoa học nằm ở đâu?** Một VLA chung phải biết action nào mang nghĩa gì khi chuyển giữa arm, mobile manipulator và navigation. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Embodiment-aware prompting + continuous action expert là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Text mô tả robot/control schema điều kiện hóa Qwen backbone; DiT sinh chunk liên tục. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Robot khác nhau về khớp, camera và command conventions

**Luận điểm.** Một VLA chung phải biết action nào mang nghĩa gì khi chuyển giữa arm, mobile manipulator và navigation. Các nhánh embodied learning thường sống trong ba hệ sinh thái tương đối riêng: robot manipulation với gripper/arms, mobile navigation với vị trí/hướng đi và quỹ đạo nhiệm vụ với kiểu trạng thái đầu ra khác nhau.

**Tại sao lỗi này có hệ quả lớn?** Hardcode expert cho mỗi robot làm mất lợi thế pretraining chung. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân robot khác nhau về khớp, camera và command conventions vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Hardcode expert cho mỗi robot làm mất lợi thế pretraining chung

**Luận điểm.** Autoregressive action tokens còn vướng độ chính xác và latency khi output dài. Nó muốn unified không chỉ ở phần perception/understanding mà còn tại action liên tục/quỹ đạo sinh.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Autoregressive action tokens còn vướng độ chính xác và latency khi output dài.. Thay đổi trọng tâm là: Embodiment-aware prompting + continuous action expert. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Text mô tả robot/control schema điều kiện hóa Qwen backbone; DiT sinh chunk liên tục.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

**Embodiment** là cấu hình vật lý và control interface: joints, gripper, camera mounts, coordinates, proprioception. **End-effector (EEF) action** mô tả thao tác trong Cartesian không gian; **joint action** mô tả góc/velocity của từng khớp; hai loại cần inverse kinematics hoặc bộ điều khiển khác nhau để thực thi. **DiT** là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép điều kiện trên đặc trưng từ VLM. **Flow matching** là cách huấn luyện generative động lực học from noise to clean quỹ đạo; lấy mẫu qua vài Euler steps để sinh chuỗi action liên tục.

Một **embodiment prompt** chỉ cung cấp metadata rõ ràng cho mô hình về hành động mà nó đang dự đoán. Prompt không sửa được vật lý calibration sai, không tạo joint từ không khí, và không phải chứng minh khả năng chuyển giao giữa các cấu hình robot tuyệt đối.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. DiT là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép điều kiện trên đặc trưng từ VLM.

**Khái niệm thành cấu trúc tính toán.** Embodiment prompt: Text khai báo thiết bị và quy ước điều khiển. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. DiT là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép điều kiện trên đặc trưng từ VLM. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

### 1. VLM backbone cho cả understanding và control

Qwen-VLA mở rộng Qwen vision-language stack. Đầu vào có hình ảnh/video context, text chỉ dẫn và thông tin robot. Đặc trưng được đưa cho action decoder theo kiến trúc DiT, nơi random action/quỹ đạo tensor được iteratively updated để ra liên tục quỹ đạo. **Không nên nhầm action liên tục head với việc mô hình ngôn ngữ autoregressively sinh các số dưới dạng text.** Đây là khác biệt rõ với hướng discrete-token của OpenVLA.

```text
instruction + embodiment description + visual input
                            │
                 Qwen visual-language backbone
                            │ conditioned features
                            ▼
                 DiT action / trajectory expert
                 noisy actions + flow time τ
                            │ multiple Euler steps
                            ▼
                continuous chunk / waypoint / trajectory
                            │
                    embodiment-specific adapter
```

### 2. Embodiment-aware prompting

Thay vì huấn luyện hardcoded expert cho mỗi robot ngay từ đầu, Qwen-VLA đưa **mô tả dạng text về embodiment và control convention** vào prompt. Ví dụ đầu vào nói robot A có dual arms, lệnh điều khiển relative EEF deltas; robot B là mobile manipulator với base chuyển động. Mô hình học cùng ngữ nghĩa bối cảnh và task-conditioned biểu diễn nhưng hiểu đầu ra command đang nằm trong convention nào.

Điều này hấp dẫn vì cùng backbone có thể nhận nhiều platform. Nhưng text prompt phải chính xác, và các tập dữ liệu vẫn cần đúng normalization, action masks, coordinate transforms, time horizon. **Một câu văn mô tả robot không thay thế calibration/canonicalization.**

### 3. Joint pretraining mixture

Bài báo trộn robot manipulation các quỹ đạo, con người egocentric demonstrations, synthetic/dữ liệu mô phỏng, vision-language dữ liệu navigation, trajectory-centric tín hiệu giám sát và auxiliary vision-language nhiệm vụ. **Table 1** nêu mixture và lấy mẫu weights; **Table 2** cho thấy robot khác nhau về EEF/joint control, arm setup và theo thời gian horizon. Đây là thiết kế pretraining khá gần một hệ thống product-oriented: không tập trung một benchmark mà cố duy trì đa nhiệm vụ trong cùng foundation stack.

Tại sao phải có auxiliary VLM dữ liệu? Nếu finetune VLM quá mạnh vào robot actions, mô hình có thể mất vocabulary và visual-semantic capabilities có sẵn. Mix thêm VLM objectives giúp duy trì grounded understanding, nhưng đồng nghĩa tranh chấp batch budget: một batch navigation sẽ không trực tiếp update bimanual contact kỹ năng.

### 4. Đưa video con người vào policy, nhưng không ngộ nhận action labels

Video headcam thường cho theo thời gian mục tiêu/chuyển động evidence rất tốt, nhưng không đi kèm robot joint commands. Pipeline Qwen-VLA dùng con người ego demos như một nguồn tín hiệu giám sát bên cạnh dữ liệu robot, không hứa video người thay thế hoàn toàn robotic post-training. Vấn đề nghiên cứu quan trọng là **alignment giữa biểu diễn chuyển động con người, đặc trưng thị giác và action không gian của robot**. Nó giống bài toán của MimicPlay và GR00T ở high level, nhưng recipe không nhất thiết trùng nhau.

### 5. Unified huấn luyện, specialized đánh giá

Khi một mô hình được huấn luyện đa embodiment, phải đánh giá cả **per-domain tỷ lệ thành công của nhiệm vụ** lẫn dấu hiệu negative chuyển giao: một domain cải thiện có làm domain khác tụt không? Bài báo so một shared policy với specialists được huấn luyện chuyên vào benchmark/platform. Những kết quả được tác giả báo cao ở ALOHA và một số mô phỏng nhiệm vụ đáng chú ý, nhưng chỉ có nghĩa trong chính setup đánh giá đó.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/qwen-vla/figure-2.webp)

*Hình 2, trang 6. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2605.30280#page=6).*

#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 giải thích recipe huấn luyện nhiều giai đoạn, đặc biệt T2A trước khi huấn luyện policy có điều kiện đầy đủ theo ảnh: action decoder học cấu trúc của chuỗi hành động trước, sau đó mới kết hợp sâu với tín hiệu vision-language. Hãy phân biệt pretraining một action prior với bằng chứng robot có thể grounding tốt vào ảnh. Model có thể sinh quỹ đạo khá trơn từ text nhưng chưa chắc đúng với vật thể hiện tại; conditioning từ ảnh và state mới giúp chọn chuyển động phù hợp tình huống.

#### Ví dụ từng bước để hiểu cơ chế

Tạo một ví dụ chung lệnh 'đưa tay tới cốc' ở hai robot: robot A đặt cạnh bàn, robot B có camera khác và gripper khác. Trước hết xác nhận output action thuộc đúng hệ quy chiếu của mỗi robot; tiếp theo đặt cùng một lệnh nhưng đổi ảnh cốc từ trái sang phải, xem hướng action có đổi không. Đánh giá loss T2A riêng, loss action condition on vision riêng và rollout success riêng. Nếu T2A tốt mà robot vẫn đưa tay lệch, cần kiểm tra visual grounding hoặc action conversion trước khi kết luận action prior vô dụng.

### Đào sâu: Embodiment-aware prompting + continuous action expert

**Luận điểm.** Text mô tả robot/control schema điều kiện hóa Qwen backbone; DiT sinh chunk liên tục. Thay vì huấn luyện hardcoded expert cho mỗi robot ngay từ đầu, Qwen-VLA đưa mô tả dạng text về embodiment và control convention vào prompt.

**Giải thích không dùng tên model.** Text mô tả robot/control schema điều kiện hóa Qwen backbone; DiT sinh chunk liên tục. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Kết hợp Qwen VLM, mô tả embodiment và DiT flow expert để điều khiển nhiều loại robot. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Kết hợp Qwen VLM, mô tả embodiment và DiT flow expert để điều khiển nhiều loại robot. Qwen-VLA mở rộng Qwen vision-language stack. Đầu vào có hình ảnh/video context, text chỉ dẫn và thông tin robot.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Ảnh + lệnh + robot schema → Qwen vision-language backbone → DiT / flow action expert → Action adapter robot cụ thể. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Qwen-VLA mở rộng Qwen vision-language stack. Đầu vào có hình ảnh/video context, text chỉ dẫn và thông tin robot. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Dữ liệu gồm context ảnh/video, text, robot state và action format. Điều này hấp dẫn vì cùng backbone có thể nhận nhiều platform. Nhưng text prompt phải chính xác, và các tập dữ liệu vẫn cần đúng normalization, action masks, coordinate transforms, time horizon.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Embodiment text không tự giải dynamics chưa nhìn thấy. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Điều này hấp dẫn vì cùng backbone có thể nhận nhiều platform. Nhưng text prompt phải chính xác, và các tập dữ liệu vẫn cần đúng normalization, action masks, coordinate transforms, time horizon. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Pretraining multimodal trên hỗn hợp robot/nhiệm vụ. Bài báo trộn robot manipulation các quỹ đạo, con người egocentric demonstrations, synthetic/dữ liệu mô phỏng, vision-language dữ liệu navigation, trajectory-centric tín hiệu giám sát và auxiliary vision-language nhiệm vụ.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: DiT learns conditional continuous trajectories; adaptation cho ALOHA/robot test. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Bài báo trộn robot manipulation các quỹ đạo, con người egocentric demonstrations, synthetic/dữ liệu mô phỏng, vision-language dữ liệu navigation, trajectory-centric tín hiệu giám sát và auxiliary vision-language nhiệm vụ. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Không gộp 83,6% in-domain có post-training với 26,6% zero-shot khác benchmark. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Trajectory phụ thuộc camera I, lệnh ℓ và mô tả embodiment e; expert học hướng cập nhật action Aτ. Khi một mô hình được huấn luyện đa embodiment, phải đánh giá cả per-domain tỷ lệ thành công của nhiệm vụ lẫn dấu hiệu negative chuyển giao: một domain cải thiện có làm domain khác tụt không?

$$
v_\theta(A_\tau\mid I,\ell,e,\tau)
$$

**Công thức đang mô tả thứ gì?** Trajectory phụ thuộc camera I, lệnh ℓ và mô tả embodiment e; expert học hướng cập nhật action Aτ. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Khi một mô hình được huấn luyện đa embodiment, phải đánh giá cả per-domain tỷ lệ thành công của nhiệm vụ lẫn dấu hiệu negative chuyển giao: một domain cải thiện có làm domain khác tụt không? Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Ký hiệu mô tả condition của flow action expert. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử quan sát chứa một đĩa trên bàn, chỉ dẫn **“đưa chiếc đĩa vào bồn rửa”**. Với robot hai tay, mô hình cần các quỹ đạo đầu ra cho EEF/joints và grippers. Với robot mobile-base, cùng mục tiêu có thể yêu cầu base navigation, căn camera vào sink, rồi thao tác arm. Thông tin bối cảnh và mục tiêu huấn luyện có thể chia sẻ; action schema và horizon không thể coi là cùng một vector đơn giản. Embodiment prompt giúp mô hình biết dự đoán target, DiT action decoder sinh các quỹ đạo conditional trên quan sát và prompt.

Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một mô hình lý tưởng cũng không thể dự đoán đúng lệnh thực thi. Đây là lý do khi đọc code phải nhìn **action preprocessing**, không chỉ backbone Transformer.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** VLM lấy visual-language embedding có hiểu robot schema. Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một mô hình lý tưởng cũng không thể dự đoán đúng lệnh thực thi.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Action expert denoise/flow sample một continuous chunk. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một mô hình lý tưởng cũng không thể dự đoán đúng lệnh thực thi. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Robot-specific adapter xử lý action convention/units khi thực thi. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo báo kết quả manipulation, navigation và benchmark liên quan đến dự đoán quỹ đạo. Trong thiết lập ALOHA trên robot thật, **Qwen-VLA-ALOHA có pretraining** được báo cáo tỷ lệ trung bình **83.6%** tỷ lệ thành công in-domain, so với **48.5%** cho một phiên bản đối chứng ở Bảng 5; ở OOD manipulations, tác giả nêu average **76.9%** ở Bảng 6. Đó là kết quả **trong các nhiệm vụ và quy trình của tác giả**, không chứng minh một mô hình ngẫu nhiên tải về sẽ đạt tương tự trên robot khác.

Trong benchmark động DOMINO, abstract nhắc **26.6% tỷ lệ thành công zero-shot**, một con số hữu ích vì nhắc ta rằng nhiệm vụ phân phối mới có thể vẫn rất khó. Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA đạt tỷ lệ thành công 80% trên thế giới thật”.

**So sánh specialist/generalist:** bài báo có các phép so với specialized các phương pháp đối chứng và những kiến trúc gần như GR00T. Một mô hình đa nhiệm không đương nhiên hơn mô hình chuyên biệt ở từng thiết lập. Điều đáng nghiên cứu là **đường trade-off** giữa shared dữ liệu pretraining, dữ liệu thích nghi robot và tỷ lệ thành công theo từng nhiệm vụ. Nếu một generalist thắng ở vài nhiệm vụ nhưng thua ở nhiệm vụ đòi hỏi tiếp xúc vật lý phức tạp, chúng ta cần xem biểu diễn action và token/flow budget.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** ALOHA in-domain: báo cáo 83,6% trung bình vs 48,5% baseline trong Table 5. Trong thiết lập ALOHA trên robot thật, Qwen-VLA-ALOHA có pretraining được báo cáo tỷ lệ trung bình 83.6% tỷ lệ thành công in-domain, so với 48.5% cho một phiên bản đối chứng ở Bảng 5; ở OOD manipulations, tác giả nêu average 76.9% ở Bảng 6.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: OOD ALOHA: khoảng 76,9% trong Table 6. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Trong thiết lập ALOHA trên robot thật, Qwen-VLA-ALOHA có pretraining được báo cáo tỷ lệ trung bình 83.6% tỷ lệ thành công in-domain, so với 48.5% cho một phiên bản đối chứng ở Bảng 5; ở OOD manipulations, tác giả nêu average 76.9% ở Bảng 6. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Dynamic DOMINO zero-shot: 26,6%, nhắc rằng OOD thực sự còn rất khó. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Không gộp 83,6% in-domain có post-training với 26,6% zero-shot khác benchmark. Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA đạt tỷ lệ thành công 80% trên thế giới thật”.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Pretraining giúp nhưng specialist/generalist vẫn có trade-off theo task. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA đạt tỷ lệ thành công 80% trên thế giới thật”. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA đạt tỷ lệ thành công 80% trên thế giới thật”. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Từ phạm vi bài báo:** mô hình được đánh giá trên một số robot, nhóm nhiệm vụ và bench định trước. Việc unify interface chưa có nghĩa hỗ trợ bất kỳ embodiment mới nào zero-shot. Inference với large VLM+DiT vẫn có độ trễ và VRAM cost. Thị giác navigation và dexterous manipulation có yêu cầu control khác xa nhau.

**Phê bình độc lập:**

- **Embodiment prompt có trần:** text có thể xác định control schema nhưng không học động học robot mới nếu không có demonstrations phù hợp.
- **Mixed-objective interference:** lấy mẫu ratio giữa manipulation/navigation/VLM rất quan trọng; hiệu năng chung không cho biết từng domain phải trả bao nhiêu dung lượng mô hình.
- **Đánh giá comparability:** benchmarks từ nhiều nhóm có action rate, hình ảnh resolution và điều kiện hoàn thành nhiệm vụ khác nhau; một aggregate không đại diện open-world ability.
- **Action động lực học:** unified quỹ đạo dự đoán chưa chứng minh vật lý tiếp xúc, phục hồi và safety constraints được khái quát tương đương ngữ nghĩa grounding.
- **Dữ liệu provenance:** video con người dễ có noise lớn ở tracking/label alignment; nếu không có công bố chi tiết filtering, người đọc khó quy kết gains cho video hay dữ liệu robot.
- **Serving:** khi dùng trên robot thật, mô hình mạnh nhưng độ trễ dao động vẫn cần RTC-like runtime strategy hoặc inference acceleration.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Việc unify interface chưa có nghĩa hỗ trợ bất kỳ embodiment mới nào zero-shot. Inference với large VLM+DiT vẫn có độ trễ và VRAM cost.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: chưa chứng minh zero-shot cho mọi embodiment, cost VLM+DiT còn lớn. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Việc unify interface chưa có nghĩa hỗ trợ bất kỳ embodiment mới nào zero-shot. Inference với large VLM+DiT vẫn có độ trễ và VRAM cost. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: text robot schema không thay thế dữ liệu vận động; navigation và manipulation có dynamics/latency khác nhau. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [PaLM-E](/paper/palm-e) mở hướng đưa thị giác/đầu vào cảm biến vào mô hình ngôn ngữ đã pretrain.
- [RT-2](/paper/rt-2) và [OpenVLA](/paper/openvla) là nhánh VLM-to-action discrete tokens.
- [Diffusion Policy](/paper/diffusion-policy), [RDT-1B](/paper/rdt-1b) và [GR00T N1](/paper/groot-n1) giúp hiểu liên tục generative action heads.
- [Open X-Embodiment](/paper/open-x-embodiment) là bài học cốt lõi về hỗn hợp dữ liệu và embodiment alignment.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) cũng xử lý multi-embodiment, nhưng chọn canonical whole-body action và sparse MoE.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm PaLM-E, RT-2, OpenVLA, Diffusion Policy, RDT-1B. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: RT-2/OpenVLA là hướng VLM-to-action tokens trước đó. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: GR00T N1 và LingBot có các dạng continuous action experts khác để đối chiếu. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm PaLM-E, RT-2, OpenVLA, Diffusion Policy, RDT-1B. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Vào [Qwen-VLA official code](https://github.com/QwenLM/Qwen-VLA). Đừng huấn luyện toàn bộ ngay. Theo một mẫu qua `dataset → processor → multimodal backbone → DiT action decoder → normalization inverse → control`. Log shapes tại từng đoạn, rồi thay embodiment prompt nhưng **giữ nguyên hình ảnh + chỉ dẫn** để kiểm tra mô hình interface và đầu ra conventions. Một thí nghiệm quan trọng: cố tình dùng sai action normalization và xem kết quả vỡ ra sao. Nếu muốn ablation, so đầu ra variance khi bỏ prompt embodiment trên hai robot khác control modes, nhưng không đưa ra claim nhân quả chỉ từ một mẫu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Embodiment description là tín hiệu cần nhưng chưa đủ cho universal transfer. Log shapes tại từng đoạn, rồi thay embodiment prompt nhưng giữ nguyên hình ảnh + chỉ dẫn để kiểm tra mô hình interface và đầu ra conventions.

**Chọn điều cần mang sang dự án thật.** Kiểm tra action frames, masks và units trước khi đo benchmark. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Embodiment description là tín hiệu cần nhưng chưa đủ cho universal transfer.

**Tái hiện tối thiểu.** Log shapes tại từng đoạn, rồi thay embodiment prompt nhưng giữ nguyên hình ảnh + chỉ dẫn để kiểm tra mô hình interface và đầu ra conventions. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Trong khi đó, đã pretrain Qwen VLM đã học nhận diện vật, ngôn ngữ, không gian và nhiều quan hệ ngữ nghĩa. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Robot khác nhau về khớp, camera và command conventions: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Robot khác nhau về khớp, camera và command conventions', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Các nhánh embodied learning thường sống trong ba hệ sinh thái tương đối riêng: robot manipulation với gripper/arms, mobile navigation với vị trí/hướng đi và quỹ đạo nhiệm vụ với kiểu trạng thái đầu ra khác nhau. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Hardcode expert cho mỗi robot làm mất lợi thế pretraining chung: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Hardcode expert cho mỗi robot làm mất lợi thế pretraining chung', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Nó muốn unified không chỉ ở phần perception/understanding mà còn tại action liên tục/quỹ đạo sinh. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Embodiment-aware prompting + continuous action expert: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Embodiment-aware prompting + continuous action expert', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Thay vì huấn luyện hardcoded expert cho mỗi robot ngay từ đầu, Qwen-VLA đưa mô tả dạng text về embodiment và control convention vào prompt. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ba khái niệm để nắm: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ba khái niệm để nắm', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. DiT là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép điều kiện trên đặc trưng từ VLM. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kiến trúc trong một sơ đồ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kiến trúc trong một sơ đồ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Qwen-VLA mở rộng Qwen vision-language stack. Đầu vào có hình ảnh/video context, text chỉ dẫn và thông tin robot. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mô hình biểu diễn cái gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mô hình biểu diễn cái gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Điều này hấp dẫn vì cùng backbone có thể nhận nhiều platform. Nhưng text prompt phải chính xác, và các tập dữ liệu vẫn cần đúng normalization, action masks, coordinate transforms, time horizon. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model học như thế nào?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model học như thế nào?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Bài báo trộn robot manipulation các quỹ đạo, con người egocentric demonstrations, synthetic/dữ liệu mô phỏng, vision-language dữ liệu navigation, trajectory-centric tín hiệu giám sát và auxiliary vision-language nhiệm vụ. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một lần inference xảy ra ra sao?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một lần inference xảy ra ra sao?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một mô hình lý tưởng cũng không thể dự đoán đúng lệnh thực thi. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mathematical Intuition: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mathematical Intuition', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khi một mô hình được huấn luyện đa embodiment, phải đánh giá cả per-domain tỷ lệ thành công của nhiệm vụ lẫn dấu hiệu negative chuyển giao: một domain cải thiện có làm domain khác tụt không? Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kết quả nói lên điều gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kết quả nói lên điều gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Trong thiết lập ALOHA trên robot thật, Qwen-VLA-ALOHA có pretraining được báo cáo tỷ lệ trung bình 83.6% tỷ lệ thành công in-domain, so với 48.5% cho một phiên bản đối chứng ở Bảng 5; ở OOD manipulations, tác giả nêu average 76.9% ở Bảng 6. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ablation và bằng chứng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ablation và bằng chứng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA đạt tỷ lệ thành công 80% trên thế giới thật”. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Hạn chế cần nói thẳng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Hạn chế cần nói thẳng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Việc unify interface chưa có nghĩa hỗ trợ bất kỳ embodiment mới nào zero-shot. Inference với large VLM+DiT vẫn có độ trễ và VRAM cost. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Bài này đứng ở đâu trong lĩnh vực?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Bài này đứng ở đâu trong lĩnh vực?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đọc thêm PaLM-E, RT-2, OpenVLA, Diffusion Policy, RDT-1B. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Nếu chỉ nhớ ba điều: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Nếu chỉ nhớ ba điều', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Log shapes tại từng đoạn, rồi thay embodiment prompt nhưng giữ nguyên hình ảnh + chỉ dẫn để kiểm tra mô hình interface và đầu ra conventions. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Điểm cốt lõi: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Kết hợp Qwen VLM, mô tả embodiment và DiT flow expert để điều khiển nhiều loại robot. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Robot khác nhau về khớp, camera và command conventions: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Một VLA chung phải biết action nào mang nghĩa gì khi chuyển giữa arm, mobile manipulator và navigation. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Hardcode expert cho mỗi robot làm mất lợi thế pretraining chung: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Autoregressive action tokens còn vướng độ chính xác và latency khi output dài. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Embodiment-aware prompting + continuous action expert: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Text mô tả robot/control schema điều kiện hóa Qwen backbone; DiT sinh chunk liên tục. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ba khái niệm để nắm: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Hiểu ba khái niệm này trước khi đọc thuật toán. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kiến trúc trong một sơ đồ: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Kết hợp Qwen VLM, mô tả embodiment và DiT flow expert để điều khiển nhiều loại robot. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mô hình biểu diễn cái gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Dữ liệu gồm context ảnh/video, text, robot state và action format. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Model học như thế nào?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Pretraining multimodal trên hỗn hợp robot/nhiệm vụ. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Một lần inference xảy ra ra sao?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. VLM lấy visual-language embedding có hiểu robot schema. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mathematical Intuition: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Trajectory phụ thuộc camera I, lệnh ℓ và mô tả embodiment e; expert học hướng cập nhật action Aτ. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kết quả nói lên điều gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. ALOHA in-domain: báo cáo 83,6% trung bình vs 48,5% baseline trong Table 5. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ablation và bằng chứng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Không gộp 83,6% in-domain có post-training với 26,6% zero-shot khác benchmark. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Hạn chế cần nói thẳng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Bài này đứng ở đâu trong lĩnh vực?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Không đọc paper như một hòn đảo riêng. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Nếu chỉ nhớ ba điều: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Embodiment description là tín hiệu cần nhưng chưa đủ cho universal transfer. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Điểm cốt lõi: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Trong khi đó, đã pretrain Qwen VLM đã học nhận diện vật, ngôn ngữ, không gian và nhiều quan hệ ngữ nghĩa. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Robot khác nhau về khớp, camera và command conventions: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Các nhánh embodied learning thường sống trong ba hệ sinh thái tương đối riêng: robot manipulation với gripper/arms, mobile navigation với vị trí/hướng đi và quỹ đạo nhiệm vụ với kiểu trạng thái đầu ra khác nhau. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Hardcode expert cho mỗi robot làm mất lợi thế pretraining chung: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Nó muốn unified không chỉ ở phần perception/understanding mà còn tại action liên tục/quỹ đạo sinh. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Embodiment-aware prompting + continuous action expert: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Thay vì huấn luyện hardcoded expert cho mỗi robot ngay từ đầu, Qwen-VLA đưa mô tả dạng text về embodiment và control convention vào prompt. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Ba khái niệm để nắm: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. DiT là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép điều kiện trên đặc trưng từ VLM. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Kiến trúc trong một sơ đồ: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Qwen-VLA mở rộng Qwen vision-language stack. Đầu vào có hình ảnh/video context, text chỉ dẫn và thông tin robot. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Mô hình biểu diễn cái gì?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Điều này hấp dẫn vì cùng backbone có thể nhận nhiều platform. Nhưng text prompt phải chính xác, và các tập dữ liệu vẫn cần đúng normalization, action masks, coordinate transforms, time horizon. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Model học như thế nào?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Bài báo trộn robot manipulation các quỹ đạo, con người egocentric demonstrations, synthetic/dữ liệu mô phỏng, vision-language dữ liệu navigation, trajectory-centric tín hiệu giám sát và auxiliary vision-language nhiệm vụ. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Một lần inference xảy ra ra sao?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một mô hình lý tưởng cũng không thể dự đoán đúng lệnh thực thi. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

<!-- END EXTENDED WALKTHROUGH -->
