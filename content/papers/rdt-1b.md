## Vì sao cần nghiên cứu này?

Bimanual manipulation khó hơn gripper-arm control vì action dimension lớn, coordination giữa hai tay phức tạp và demonstration dữ liệu càng hiếm. VLA autoregressive tokenization cũng không phải lựa chọn tự nhiên cho liên tục chuyển động nhiều chiều. RDT-1B hỏi: **nếu dùng một diffusion Transformer rất lớn và một biểu diễn vật lý thống nhất, có thể pretrain foundation motor policy cho bimanual manipulation không?**

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rdt-1b/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là sơ đồ diffusion Transformer khoảng một tỷ tham số có điều kiện theo dữ liệu quan sát và ngôn ngữ để sinh action cho hai tay. Đọc sơ đồ từ image/state/language condition tới chuỗi action được denoise thay vì nghĩ rằng tất cả khối mạng đều trực tiếp phát joint command. Sự khác biệt chính so với một mạng hồi quy đơn là mô hình học một phân phối chuỗi chuyển động khả thi; với thao tác hai tay, tính phối hợp theo thời gian có thể quan trọng không kém độ chính xác ở một timestep.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Diffusion Transformer quy mô lớn sinh action liên tục với điều kiện thị giác–ngôn ngữ đa robot. RDT-1B hỏi: nếu dùng một diffusion Transformer rất lớn và một biểu diễn vật lý thống nhất, có thể pretrain foundation motor policy cho bimanual manipulation không?

**Vấn đề khoa học nằm ở đâu?** Các embodiment khác nhau và high-dimensional actions khó ép vào một scheme autoregressive thô. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Scale action generative modeling bằng Transformer là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Conditioned diffusion sinh action chunk ở không gian liên tục, tận dụng visual-language knowledge. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Action tokens không biểu diễn tốt mọi chuyển động liên tục

**Luận điểm.** Các embodiment khác nhau và high-dimensional actions khó ép vào một scheme autoregressive thô. VLA autoregressive tokenization cũng không phải lựa chọn tự nhiên cho liên tục chuyển động nhiều chiều.

**Tại sao lỗi này có hệ quả lớn?** Discretized autoregression chịu quantization và latency. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân action tokens không biểu diễn tốt mọi chuyển động liên tục vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Discretized autoregression chịu quantization và latency

**Luận điểm.** Diffusion nhỏ hoặc robot-specific policy thiếu khả năng scale đa embodiment. Bimanual manipulation khó hơn gripper-arm control vì action dimension lớn, coordination giữa hai tay phức tạp và demonstration dữ liệu càng hiếm.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Diffusion nhỏ hoặc robot-specific policy thiếu khả năng scale đa embodiment.. Thay đổi trọng tâm là: Scale action generative modeling bằng Transformer. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Conditioned diffusion sinh action chunk ở không gian liên tục, tận dụng visual-language knowledge.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Autoregressive discrete action có thể mất độ chính xác khi thao tác hai tay phức tạp. Diffusion Transformer đưa một prior action liên tục mạnh hơn, nhưng cần giải nghĩa heterogeneous trạng thái robot/action. Canonical vật lý biểu diễn chính là nỗ lực quản lý sự đa dạng đó.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Diffusion Transformer đưa một prior action liên tục mạnh hơn, nhưng cần giải nghĩa heterogeneous trạng thái robot/action.

**Khái niệm thành cấu trúc tính toán.** Diffusion Transformer: Transformer học hướng loại nhiễu trên action sequence. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Diffusion Transformer đưa một prior action liên tục mạnh hơn, nhưng cần giải nghĩa heterogeneous trạng thái robot/action. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RDT-1B là khoảng **1.2B-parameter diffusion Transformer**. Bài báo đưa ra **Physically Interpretable Unified Action Space** để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên dữ liệu không đồng nhất robot và post-train bằng hơn **6 nghìn bimanual episodes** cho target platform. Vision, ngôn ngữ và state được điều kiện vào diffusion action generator thay vì bắt action đi qua ngôn ngữ token vocabulary.

Kiến trúc được thiết kế để scale width/depth và exploit multimodal conditioning. Với few-shot adaptation, mô hình tận dụng đã pretrain prior về chuyển động rồi chỉ cần một lượng demonstration rất nhỏ cho nhiệm vụ mới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rdt-1b/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 đối chiếu sự phức tạp của bimanual manipulation với một tay: hai nhánh kinematics cùng tiếp xúc một vật và ảnh hưởng lẫn nhau. Một tay nhấc vật trong khi tay kia giữ hoặc căn chỉnh vị trí có thể tạo lực và ràng buộc khác hoàn toàn một tay tự thao tác. Đây là lý do hình học, action representation và đồng bộ timing của hai tay cần được xem kỹ khi đọc RDT-1B. Một action vector dài không tự bảo đảm mô hình hiểu constraints giữa hai gripper.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ hai tay giữ hai đầu một thanh dài và đặt vào gá. Nếu dự đoán tay trái/pha nâng độc lập với tay phải, thanh có thể nghiêng và va chạm. Ta có thể biểu diễn một action chunk liên tục cho tất cả khớp hai tay, thêm condition từ ảnh và proprioception, rồi sampling bằng diffusion để tìm quỹ đạo nhất quán. Nhưng performance không chỉ nằm ở chất lượng score model: action cần đưa về đúng joint range và controller phải giữ tương tác cơ học ổn định. Đo task success, alignment error, collision và jerk chứ không chỉ denoising MSE.

### Đào sâu: Scale action generative modeling bằng Transformer

**Luận điểm.** Conditioned diffusion sinh action chunk ở không gian liên tục, tận dụng visual-language knowledge. Vision, ngôn ngữ và state được điều kiện vào diffusion action generator thay vì bắt action đi qua ngôn ngữ token vocabulary.

**Giải thích không dùng tên model.** Conditioned diffusion sinh action chunk ở không gian liên tục, tận dụng visual-language knowledge. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Diffusion Transformer quy mô lớn sinh action liên tục với điều kiện thị giác–ngôn ngữ đa robot. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Diffusion Transformer quy mô lớn sinh action liên tục với điều kiện thị giác–ngôn ngữ đa robot. RDT-1B là khoảng 1.2B-parameter diffusion Transformer. Bài báo đưa ra Physically Interpretable Unified Action Space để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên dữ liệu không đồng nhất robot và post-train bằng hơn 6 nghìn bimanual episodes cho target platform.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Robot datasets hỗn hợp → Vision-language features → RDT-1B diffusion Transformer → Action chunk liên tục. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** RDT-1B là khoảng 1.2B-parameter diffusion Transformer. Bài báo đưa ra Physically Interpretable Unified Action Space để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên dữ liệu không đồng nhất robot và post-train bằng hơn 6 nghìn bimanual episodes cho target platform. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Action chunk giữ giá trị liên tục thay vì bins từng chiều. Bài báo đưa ra Physically Interpretable Unified Action Space để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên dữ liệu không đồng nhất robot và post-train bằng hơn 6 nghìn bimanual episodes cho target platform.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Dữ liệu nhiều action semantics đòi chuẩn hóa, mask và alignment. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Bài báo đưa ra Physically Interpretable Unified Action Space để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên dữ liệu không đồng nhất robot và post-train bằng hơn 6 nghìn bimanual episodes cho target platform. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Pretraining ở quy mô mô hình khoảng 1B parameters. Kiến trúc được thiết kế để scale width/depth và exploit multimodal conditioning. Với few-shot adaptation, mô hình tận dụng đã pretrain prior về chuyển động rồi chỉ cần một lượng demonstration rất nhỏ cho nhiệm vụ mới.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Training denoising/flow-style loss trên robot actions dưới điều kiện multimodal. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Kiến trúc được thiết kế để scale width/depth và exploit multimodal conditioning. Với few-shot adaptation, mô hình tận dụng đã pretrain prior về chuyển động rồi chỉ cần một lượng demonstration rất nhỏ cho nhiệm vụ mới. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Phân biệt đóng góp của pretraining corpus và diffusion Transformer. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Mạng học cách nhận ra nhiễu trong action đang bị xáo trộn theo observation và instruction. Với few-shot adaptation, mô hình tận dụng đã pretrain prior về chuyển động rồi chỉ cần một lượng demonstration rất nhỏ cho nhiệm vụ mới.

$$
\epsilon_\theta(A_k, k\mid o,\ell)
$$

**Công thức đang mô tả thứ gì?** Mạng học cách nhận ra nhiễu trong action đang bị xáo trộn theo observation và instruction. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Với few-shot adaptation, mô hình tận dụng đã pretrain prior về chuyển động rồi chỉ cần một lượng demonstration rất nhỏ cho nhiệm vụ mới. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Ký hiệu khái niệm của denoising, không đóng vai trò thay bảng loss trong paper. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 3 từ PDF gốc, trang 4](/paper-figures/rdt-1b/figure-3.webp)


![Hình 4 từ PDF gốc, trang 6](/paper-figures/rdt-1b/figure-4.webp)


![Hình 8 từ PDF gốc, trang 26](/paper-figures/rdt-1b/figure-8.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Ví dụ từng bước

Với một bimanual folding kỹ năng, mạng điều kiện hình ảnh + ngôn ngữ + trạng thái robot rồi mẫu cả action chunk cho hai tay. Đồng thời, tập dữ liệu robot khác có DoF/coordinate các khung hình khác; preprocessing phải quyết định joint/EEF conventions và mask cho dimension vắng.

Phải đọc riêng **vật lý of action schema** và **DiT kiến trúc**. Nếu canonical schema sai, scale mô hình chỉ học sai nhanh hơn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Quan sát và instruction đi qua encoders. Với một bimanual folding kỹ năng, mạng điều kiện hình ảnh + ngôn ngữ + trạng thái robot rồi mẫu cả action chunk cho hai tay.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Diffusion Transformer iterative denoise action chunk. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Với một bimanual folding kỹ năng, mạng điều kiện hình ảnh + ngôn ngữ + trạng thái robot rồi mẫu cả action chunk cho hai tay. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Chunk điều khiển robot; inference cost tăng theo số denoising steps. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo báo RDT-1B cải thiện tỷ lệ thành công của nhiệm vụ trung bình khoảng **56%** so với các các phương pháp đối chứng được dùng trong đánh giá. Nó thể hiện zero-shot robustness tốt hơn trước vật thể chưa xuất hiện khi huấn luyện/bối cảnh và đặc biệt mạnh trong bimanual kỹ năng. Ở một số few-shot thí nghiệm chỉ **1-5 demonstrations**, RDT-1B đã làm được các hành vi như handover/folding mà scratch hoặc smaller các phương pháp đối chứng gần như không làm được.

Kết quả khiến diffusion foundation policy trở thành một hướng nghiêm túc song song với autoregressive VLA. Nó cũng cho thấy **motor scaling** có thể cần kiến trúc khác ngữ nghĩa VLM scaling.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Bài báo báo lợi ích khi mở rộng mô hình/dữ liệu cho policy sinh action. Bài báo báo RDT-1B cải thiện tỷ lệ thành công của nhiệm vụ trung bình khoảng 56% so với các các phương pháp đối chứng được dùng trong đánh giá.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Đa nhiệm và multi-robot pretraining tạo prior hữu dụng cho downstream manipulation. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Bài báo báo RDT-1B cải thiện tỷ lệ thành công của nhiệm vụ trung bình khoảng 56% so với các các phương pháp đối chứng được dùng trong đánh giá. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Lợi thế cần so ở cùng data/compute budget để không nhầm hiệu quả kiến trúc với scale. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Phân biệt đóng góp của pretraining corpus và diffusion Transformer. Nó thể hiện zero-shot robustness tốt hơn trước vật thể chưa xuất hiện khi huấn luyện/bối cảnh và đặc biệt mạnh trong bimanual kỹ năng.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Đánh giá latency theo số denoising steps và horizon. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Nó thể hiện zero-shot robustness tốt hơn trước vật thể chưa xuất hiện khi huấn luyện/bối cảnh và đặc biệt mạnh trong bimanual kỹ năng. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Nó thể hiện zero-shot robustness tốt hơn trước vật thể chưa xuất hiện khi huấn luyện/bối cảnh và đặc biệt mạnh trong bimanual kỹ năng. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 5 từ PDF gốc, trang 8](/paper-figures/rdt-1b/figure-5.webp)


![Hình 10 từ PDF gốc, trang 28](/paper-figures/rdt-1b/figure-10.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** bài báo không có một limitations section mạnh, nhưng phạm vi thí nghiệm chủ yếu vẫn quanh bimanual manipulation và target phần cứng family; general long-horizon/mobile hành vi chưa phải trọng tâm.

**Phê bình thêm:** “unified action không gian” vẫn dựa trên giả định rằng các nguồn dữ liệu có vật lý semantics đủ tương thích để map vào canonical biểu diễn. Một mô hình 1.2B + pretraining corpus lớn cũng có compute/dữ liệu barrier đáng kể. Diffusion lấy mẫu đem độ trễ riêng. Claims few-shot rất hấp dẫn nhưng số nhiệm vụ/embodiment chưa đủ để suy ra universal chuyển giao. RDT giải rất tốt **liên tục bimanual prior**, nhưng semantics, world kiến thức, phục hồi và long-horizon lập kế hoạch vẫn cần tầng khác.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Phê bình thêm: “unified action không gian” vẫn dựa trên giả định rằng các nguồn dữ liệu có vật lý semantics đủ tương thích để map vào canonical biểu diễn.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: cần nhiều GPU/dữ liệu, phụ thuộc action conventions nhất quán. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Phê bình thêm: “unified action không gian” vẫn dựa trên giả định rằng các nguồn dữ liệu có vật lý semantics đủ tương thích để map vào canonical biểu diễn. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: 1B active params và iterative sampling vẫn là thách thức cho thiết bị edge. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 6 từ PDF gốc, trang 23](/paper-figures/rdt-1b/figure-6.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Diffusion Policy](/paper/diffusion-policy)
- [GR00T N1](/paper/groot-n1)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm Diffusion Policy, GR00T N1. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: Diffusion Policy cho công thức nền về action generation. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: π0.5 và GR00T N1 triển khai flow/action expert với cấu trúc khác. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm Diffusion Policy, GR00T N1. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Trace một batch qua action normalization/vật lý mask; thay các giá trị NaN/padded joints để chắc loss không ăn nhầm. Test inverse transform để bảo toàn vị trí/độ mở gripper.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Continuous generative action giúp tránh lượng tử hóa thô. Trace một batch qua action normalization/vật lý mask; thay các giá trị NaN/padded joints để chắc loss không ăn nhầm.

**Chọn điều cần mang sang dự án thật.** Dùng RDT-1B để nghiên cứu model/data scaling cho action policies. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Continuous generative action giúp tránh lượng tử hóa thô.

**Tái hiện tối thiểu.** Trace một batch qua action normalization/vật lý mask; thay các giá trị NaN/padded joints để chắc loss không ăn nhầm. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

