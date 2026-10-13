> **Bài do bạn cung cấp.** [Qwen-VLA: Unifying Vision-Language-Action Modeling across Tasks, Environments, and Robot Embodiments](https://arxiv.org/abs/2605.30280), Qwen Team, arXiv 2026. Đọc song song với **Figure 2** về kiến trúc, **Tables 1–2** về hỗn hợp dữ liệu/embodiment, và **Tables 4–6** về kết quả. Tên “Qwen-VLA” không có nghĩa mọi capability đã khái quát ngang nhau.

## Vì sao cần nghiên cứu này?

### Một mô hình có thể vừa thao tác vật vừa điều hướng không?

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 17](/paper-figures/qwen-vla/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Robot có thể được nghiên cứu theo ba nhóm lớn: cánh tay thao tác vật, robot tự di chuyển và mô hình dự đoán quỹ đạo. Mỗi nhóm thường dùng kiểu cảm biến và dạng lệnh riêng. Ngay cả trong thao tác tay máy, hai robot có thể khác số khớp, hệ tọa độ và tần số điều khiển. Nếu phải huấn luyện một checkpoint riêng cho mỗi cấu hình, rất nhiều kiến thức về đồ vật và cách thực hiện công việc không được chia sẻ. Qwen-VLA tìm cách xây phần biểu diễn chung, đồng thời vẫn nhận biết robot nào đang được điều khiển.

Một robot có thể phải nhặt đồ vật, di chuyển trong phòng hoặc trả lời câu hỏi về thứ camera đang nhìn thấy. Các việc ấy đòi những dạng kết quả khác nhau, trong khi nhiều kiến thức về đồ vật và ngôn ngữ có thể dùng chung. **Qwen-VLA tổ chức việc học thành nhiều giai đoạn để kết nối hiểu ảnh–ngôn ngữ với sinh hành động robot.** Bộ sinh hành động trước hết học cấu trúc chuyển động từ mô tả bằng chữ, sau đó học liên hệ với ảnh thật, tiếp tục tinh chỉnh theo nhiệm vụ và cuối cùng có thể tối ưu bằng phần thưởng khi robot tương tác với môi trường.

Khó khăn là **action semantics không đồng nhất**. Một vector 7 chiều có thể là end-effector translation/rotation/gripper; robot khác 14 joint angles; agent navigation lại xuất waypoint và heading. Đưa tất cả vào cùng tensor padding mà không mô tả embodiment sẽ khiến mô hình học mapping mơ hồ. Vì vậy kiến trúc phải đồng thời giải VLM grounding, biểu diễn/conditioning và sinh action.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/qwen-vla/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là bản đồ của một mô hình embodied chung có cả manipulation, navigation và vision-language understanding. Những khả năng này không có cùng action space hay mức supervision. Quan sát từ camera, mô tả embodiment, instruction và điều kiện nhiệm vụ phải được căn chỉnh để action decoder biết đang phục vụ robot nào. Nếu chỉ nhìn một backbone lớn rồi kết luận policy chạy trên mọi robot, ta đã bỏ qua lớp action interface và việc dữ liệu đến từ các nhóm nhiệm vụ rất khác nhau.

### Vì sao một mô hình cần hiểu nhiều loại nhiệm vụ robot?

Một robot có thể được giao “Nhặt chiếc cốc đỏ”, “Đi tới cạnh bàn” hoặc “Chiếc cốc nào gần cửa hơn?”. Các yêu cầu có đầu ra khác nhau: thao tác tay, điều hướng hoặc câu trả lời. Nếu mỗi loại dùng mạng hoàn toàn riêng, dữ liệu và kiến thức khó chia sẻ. Qwen-VLA nghiên cứu một mô hình có thể học từ nhiều nhóm dữ liệu, kết hợp hiểu ảnh–ngôn ngữ với sinh hành động robot.

Điểm quan trọng là **hiểu được lời yêu cầu không đồng nghĩa biết ngay cách cử động**. Vì thế phương pháp huấn luyện không chỉ cho model học câu chữ, mà còn xây một bộ sinh action có kiến thức về cấu trúc chuyển động rồi gắn kiến thức ấy với ảnh thực tế.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

**Embodiment** là cấu hình vật lý và control interface: joints, gripper, camera mounts, coordinates, proprioception. **End-effector (EEF) action** mô tả thao tác trong Cartesian không gian; **joint action** mô tả góc/velocity của từng khớp; hai loại cần inverse kinematics hoặc bộ điều khiển khác nhau để thực thi. **DiT** là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép điều kiện trên đặc trưng từ VLM. **Flow matching** là cách huấn luyện generative động lực học from noise to clean quỹ đạo; lấy mẫu qua vài Euler steps để sinh chuỗi action liên tục.

Một **embodiment prompt** chỉ cung cấp metadata rõ ràng cho mô hình về hành động mà nó đang dự đoán. Prompt không sửa được vật lý calibration sai, không tạo joint từ không khí, và không phải chứng minh khả năng chuyển giao giữa các cấu hình robot tuyệt đối.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Phân biệt các giai đoạn học của Qwen-VLA

**T2A** là huấn luyện dự đoán hành động từ mô tả bằng chữ, chưa dùng ảnh: bộ giải mã DiT học hình dạng của những chuỗi chuyển động hợp lý. **CPT** tiếp tục huấn luyện với ảnh để gắn kiến thức vận động ấy vào vật thể và bối cảnh cụ thể. **SFT** học có giám sát theo nhiệm vụ với dữ liệu robot được chọn lọc. **RL** tiếp tục tối ưu nhờ phần thưởng sau khi robot thực thi.

Các tên viết tắt có thể khiến người mới tưởng là bốn kiến trúc khác nhau. Thực ra chúng là **bốn bước trong cùng quy trình học**, được thiết kế để tránh phải học cả nhận biết ảnh và cấu trúc chuyển động từ đầu trong một lần.

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


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 giải thích recipe huấn luyện nhiều giai đoạn, đặc biệt T2A trước khi huấn luyện policy có điều kiện đầy đủ theo ảnh: action decoder học cấu trúc của chuỗi hành động trước, sau đó mới kết hợp sâu với tín hiệu vision-language. Hãy phân biệt pretraining một action prior với bằng chứng robot có thể grounding tốt vào ảnh. Model có thể sinh quỹ đạo khá trơn từ text nhưng chưa chắc đúng với vật thể hiện tại; conditioning từ ảnh và state mới giúp chọn chuyển động phù hợp tình huống.

#### Ví dụ từng bước để hiểu cơ chế

Tạo một ví dụ chung lệnh 'đưa tay tới cốc' ở hai robot: robot A đặt cạnh bàn, robot B có camera khác và gripper khác. Trước hết xác nhận output action thuộc đúng hệ quy chiếu của mỗi robot; tiếp theo đặt cùng một lệnh nhưng đổi ảnh cốc từ trái sang phải, xem hướng action có đổi không. Đánh giá loss T2A riêng, loss action condition on vision riêng và rollout success riêng. Nếu T2A tốt mà robot vẫn đưa tay lệch, cần kiểm tra visual grounding hoặc action conversion trước khi kết luận action prior vô dụng.

### Một lệnh điều khiển được hình thành ra sao?

Giả sử người dùng nói “Đặt hai chiếc dập ghim xanh lá cạnh nhau”. Ảnh camera cho biết hai vật đang ở đâu, phần thị giác–ngôn ngữ xử lý câu lệnh và cảnh. Bộ giải mã hành động DiT nhận điều kiện ấy cùng thông tin robot, tạo chuỗi chuyển động: tiếp cận vật thứ nhất, kẹp, đặt, rồi làm với vật thứ hai.

Trong lúc tiền huấn luyện T2A, mạng sinh hành động từ văn bản để học những mẫu chuyển động chung. Đến CPT/SFT, ảnh mới được gắn vào để chọn hành động đúng vị trí thực. Giai đoạn RL đánh giá kết quả khi robot chạy trong môi trường và đưa tín hiệu cải thiện. Không nên đồng nhất loss T2A với tỷ lệ hoàn thành nhiệm vụ thật.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử quan sát chứa một đĩa trên bàn, chỉ dẫn **“đưa chiếc đĩa vào bồn rửa”**. Với robot hai tay, mô hình cần các quỹ đạo đầu ra cho EEF/joints và grippers. Với robot mobile-base, cùng mục tiêu có thể yêu cầu base navigation, căn camera vào sink, rồi thao tác arm. Thông tin bối cảnh và mục tiêu huấn luyện có thể chia sẻ; action schema và horizon không thể coi là cùng một vector đơn giản. Embodiment prompt giúp mô hình biết dự đoán target, DiT action decoder sinh các quỹ đạo conditional trên quan sát và prompt.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 11](/paper-figures/qwen-vla/figure-3.webp)
![Hình 5 từ PDF gốc, trang 21](/paper-figures/qwen-vla/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một mô hình lý tưởng cũng không thể dự đoán đúng lệnh thực thi. Đây là lý do khi đọc code phải nhìn **action preprocessing**, không chỉ backbone Transformer.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ phân chia nhiệm vụ dọn bàn

Câu lệnh “Gom các chai đồ uống, để miếng bọt biển riêng” cần nhiều lần nhặt và đặt. Ở cấp nhiệm vụ, robot phải biết nhóm đồ nào cần gom, vật nào không đụng tới và khi nào đã xong. Ở cấp vận động, nó phải thực hiện từng đoạn tiến tới, kẹp, đưa sang vị trí đích và thả.

Hình 3 có ví dụ ngắn và dài để cho thấy độ khó tăng theo số bước. Nếu model chọn đúng chai nhưng bỏ vào vùng dành cho miếng bọt biển, lỗi nằm ở cách hiểu nhiệm vụ/đích đặt. Nếu nó chọn đúng đích nhưng làm rơi chai, lỗi có thể ở bộ điều khiển và dữ liệu vận động.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo báo kết quả manipulation, navigation và benchmark liên quan đến dự đoán quỹ đạo. Trong thiết lập ALOHA trên robot thật, **Qwen-VLA-ALOHA có pretraining** được báo cáo tỷ lệ trung bình **83.6%** tỷ lệ thành công in-domain, so với **48.5%** cho một phiên bản đối chứng ở Bảng 5; ở OOD manipulations, tác giả nêu average **76.9%** ở Bảng 6. Đó là kết quả **trong các nhiệm vụ và quy trình của tác giả**, không chứng minh một mô hình ngẫu nhiên tải về sẽ đạt tương tự trên robot khác.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 22](/paper-figures/qwen-vla/figure-6.webp)
![Hình 7 từ PDF gốc, trang 24](/paper-figures/qwen-vla/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Trong benchmark động DOMINO, abstract nhắc **26.6% tỷ lệ thành công zero-shot**, một con số hữu ích vì nhắc ta rằng nhiệm vụ phân phối mới có thể vẫn rất khó. Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA đạt tỷ lệ thành công 80% trên thế giới thật”.

**So sánh specialist/generalist:** bài báo có các phép so với specialized các phương pháp đối chứng và những kiến trúc gần như GR00T. Một mô hình đa nhiệm không đương nhiên hơn mô hình chuyên biệt ở từng thiết lập. Điều đáng nghiên cứu là **đường trade-off** giữa shared dữ liệu pretraining, dữ liệu thích nghi robot và tỷ lệ thành công theo từng nhiệm vụ. Nếu một generalist thắng ở vài nhiệm vụ nhưng thua ở nhiệm vụ đòi hỏi tiếp xúc vật lý phức tạp, chúng ta cần xem biểu diễn action và token/flow budget.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Thí nghiệm nào nói rõ vai trò từng bước học?

Hình 6 kiểm tra trực tiếp giai đoạn T2A. Thay tỷ lệ dữ liệu tổng hợp, cách dự đoán cả chuỗi hay theo đoạn và phân phối thời gian flow matching; bản dự đoán cả chuỗi với khoảng 20% dữ liệu tổng hợp cho kết quả tốt nhất trong những cấu hình được thử. Nếu học T2A quá lâu, hiệu quả còn có thể giảm do học quá sát dữ liệu nguồn.

Hình 7 thử việc học chung dữ liệu ảnh–ngôn ngữ với dữ liệu action. Trên bài dễ, lợi ích ít thấy; trên bài phải phân biệt vật tinh vi hoặc hiểu lệnh ghép nhiều điều kiện, hiệu quả tăng rõ. Đây là bằng chứng **loại dữ liệu giúp nhóm năng lực tương ứng**, không phải càng trộn nhiều thứ càng tốt trong mọi trường hợp.

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

### Những kết luận chưa nên rút ra

Huấn luyện nhiều giai đoạn phức tạp hơn, tốn công cân bằng dữ liệu và khó xác định nguyên nhân khi một bước làm hiệu quả giảm. Một model giỏi trả lời câu hỏi hoặc điều hướng chưa chắc thực hiện được thao tác tiếp xúc chính xác trên mọi gripper.

Cách biểu diễn lệnh phải phù hợp loại robot đang chạy. Nếu đổi camera, khớp hoặc bộ điều khiển, cần kiểm chứng lại quá trình giải mã và an toàn. Tỷ lệ thành công trên một bộ nhiệm vụ ALOHA chưa đồng nghĩa có thể chuyển nguyên checkpoint sang mọi robot thật.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [PaLM-E](/paper/palm-e) mở hướng đưa thị giác/đầu vào cảm biến vào mô hình ngôn ngữ đã pretrain.
- [RT-2](/paper/rt-2) và [OpenVLA](/paper/openvla) là nhánh VLM-to-action discrete tokens.
- [Diffusion Policy](/paper/diffusion-policy), [RDT-1B](/paper/rdt-1b) và [GR00T N1](/paper/groot-n1) giúp hiểu liên tục generative action heads.
- [Open X-Embodiment](/paper/open-x-embodiment) là bài học cốt lõi về hỗn hợp dữ liệu và embodiment alignment.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) cũng xử lý multi-embodiment, nhưng chọn canonical whole-body action và sparse MoE.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Qwen-VLA liên hệ thế nào với RT-2 và π0.5?

RT-2 chứng minh hướng chuyển kiến thức ảnh–ngôn ngữ sang token hành động. π0.5 tách nguồn dữ liệu đa dạng và mức nhiệm vụ cao/thấp, dùng các phương pháp biểu diễn action khác nhau ở từng giai đoạn. Qwen-VLA cũng kết hợp nhiều nguồn tri thức nhưng tổ chức thành một quy trình T2A → CPT → SFT → RL có mục tiêu rõ cho từng bước.

Điều nên so sánh là *từng giai đoạn giải thiếu sót gì*, có giúp robot hiểu vật mới hay sinh chuyển động tốt hơn không. Một sơ đồ có nhiều khối không tự chứng minh hệ thống mạnh hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Vào [Qwen-VLA official code](https://github.com/QwenLM/Qwen-VLA). Đừng huấn luyện toàn bộ ngay. Theo một mẫu qua `dataset → processor → multimodal backbone → DiT action decoder → normalization inverse → control`. Log shapes tại từng đoạn, rồi thay embodiment prompt nhưng **giữ nguyên hình ảnh + chỉ dẫn** để kiểm tra mô hình interface và đầu ra conventions. Một thí nghiệm quan trọng: cố tình dùng sai action normalization và xem kết quả vỡ ra sao. Nếu muốn ablation, so đầu ra variance khi bỏ prompt embodiment trên hai robot khác control modes, nhưng không đưa ra claim nhân quả chỉ từ một mẫu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự thiết kế phép thử tách ảnh hưởng của prompt

Giữ cùng ảnh hai vật và cùng bộ giải mã, thử hai prompt: “Đặt hai vật cạnh nhau” và “Đặt vật xanh bên trái vật đỏ”. Nếu robot bỏ qua quan hệ trong prompt, hai chuỗi thao tác có thể giống nhau sai mục tiêu. Tiếp tục giữ câu lệnh nhưng đổi vị trí vật để kiểm tra mạng dùng ảnh hay nhớ chỗ cũ.

Khi đọc ablation, hãy diễn đạt “thử bỏ hoặc đổi cơ chế để đo tác dụng”, không dịch thành “mài mòn”. Ghi rõ thay prompt, giai đoạn T2A hay việc trộn dữ liệu để không nhầm nguồn cải thiện.

<!-- END EXTENDED WALKTHROUGH -->

