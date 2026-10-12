> **Bài do bạn cung cấp.** [Qwen-VLA: Unifying Vision-Language-Action Modeling across Tasks, Environments, and Robot Embodiments](https://arxiv.org/abs/2605.30280), Qwen Team, arXiv 2026. Đọc song song với **Figure 2** về kiến trúc, **Tables 1–2** về hỗn hợp dữ liệu/embodiment, và **Tables 4–6** về kết quả. Tên “Qwen-VLA” không có nghĩa mọi capability đã khái quát ngang nhau.

## Vì sao cần nghiên cứu này?

### Một mô hình cho manipulation, navigation và quỹ đạo dự đoán?

Các nhánh embodied learning thường sống trong ba hệ sinh thái tương đối riêng: robot manipulation với gripper/arms, mobile navigation với vị trí/hướng đi và quỹ đạo nhiệm vụ với kiểu trạng thái đầu ra khác nhau. Ngay trong manipulation, mỗi robot có số DoF, hệ toạ độ, action frequency và convention riêng. Nếu phải huấn luyện một checkpoint cho mỗi robot/nhiệm vụ, **dữ liệu không chia sẻ prior** một cách hiệu quả; sự hiểu biết về cái cốc ở một robot không dễ sang robot khác.

Trong khi đó, đã pretrain Qwen VLM đã học nhận diện vật, ngôn ngữ, không gian và nhiều quan hệ ngữ nghĩa. Câu hỏi của Qwen-VLA là liệu có thể **dùng chung một vision-language-action foundation** cho các dạng embodied decision-making khác nhau, thay vì duy trì riêng robot policy, mô hình navigation và quỹ đạo predictor. Nó muốn unified không chỉ ở phần perception/understanding mà còn tại **action liên tục/quỹ đạo sinh**.

Khó khăn là **action semantics không đồng nhất**. Một vector 7 chiều có thể là end-effector translation/rotation/gripper; robot khác 14 joint angles; agent navigation lại xuất waypoint và heading. Đưa tất cả vào cùng tensor padding mà không mô tả embodiment sẽ khiến mô hình học mapping mơ hồ. Vì vậy kiến trúc phải đồng thời giải VLM grounding, biểu diễn/conditioning và sinh action.

## Kiến thức nền

**Embodiment** là cấu hình vật lý và control interface: joints, gripper, camera mounts, coordinates, proprioception. **End-effector (EEF) action** mô tả thao tác trong Cartesian không gian; **joint action** mô tả góc/velocity của từng khớp; hai loại cần inverse kinematics hoặc bộ điều khiển khác nhau để thực thi. **DiT** là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép điều kiện trên đặc trưng từ VLM. **Flow matching** là cách huấn luyện generative động lực học from noise to clean quỹ đạo; lấy mẫu qua vài Euler steps để sinh chuỗi action liên tục.

Một **embodiment prompt** chỉ cung cấp metadata rõ ràng cho mô hình về hành động mà nó đang dự đoán. Prompt không sửa được vật lý calibration sai, không tạo joint từ không khí, và không phải chứng minh khả năng chuyển giao giữa các cấu hình robot tuyệt đối.

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

## Ví dụ từng bước

Giả sử quan sát chứa một đĩa trên bàn, chỉ dẫn **“đưa chiếc đĩa vào bồn rửa”**. Với robot hai tay, mô hình cần các quỹ đạo đầu ra cho EEF/joints và grippers. Với robot mobile-base, cùng mục tiêu có thể yêu cầu base navigation, căn camera vào sink, rồi thao tác arm. Thông tin bối cảnh và mục tiêu huấn luyện có thể chia sẻ; action schema và horizon không thể coi là cùng một vector đơn giản. Embodiment prompt giúp mô hình biết dự đoán target, DiT action decoder sinh các quỹ đạo conditional trên quan sát và prompt.

Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một mô hình lý tưởng cũng không thể dự đoán đúng lệnh thực thi. Đây là lý do khi đọc code phải nhìn **action preprocessing**, không chỉ backbone Transformer.

## Kết quả thực nghiệm

Bài báo báo kết quả manipulation, navigation và benchmark liên quan đến dự đoán quỹ đạo. Trong thiết lập ALOHA trên robot thật, **Qwen-VLA-ALOHA có pretraining** được báo cáo tỷ lệ trung bình **83.6%** tỷ lệ thành công in-domain, so với **48.5%** cho một phiên bản đối chứng ở Bảng 5; ở OOD manipulations, tác giả nêu average **76.9%** ở Bảng 6. Đó là kết quả **trong các nhiệm vụ và quy trình của tác giả**, không chứng minh một mô hình ngẫu nhiên tải về sẽ đạt tương tự trên robot khác.

Trong benchmark động DOMINO, abstract nhắc **26.6% tỷ lệ thành công zero-shot**, một con số hữu ích vì nhắc ta rằng nhiệm vụ phân phối mới có thể vẫn rất khó. Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA đạt tỷ lệ thành công 80% trên thế giới thật”.

**So sánh specialist/generalist:** bài báo có các phép so với specialized các phương pháp đối chứng và những kiến trúc gần như GR00T. Một mô hình đa nhiệm không đương nhiên hơn mô hình chuyên biệt ở từng thiết lập. Điều đáng nghiên cứu là **đường trade-off** giữa shared dữ liệu pretraining, dữ liệu thích nghi robot và tỷ lệ thành công theo từng nhiệm vụ. Nếu một generalist thắng ở vài nhiệm vụ nhưng thua ở nhiệm vụ đòi hỏi tiếp xúc vật lý phức tạp, chúng ta cần xem biểu diễn action và token/flow budget.

## Hạn chế và câu hỏi còn mở

**Từ phạm vi bài báo:** mô hình được đánh giá trên một số robot, nhóm nhiệm vụ và bench định trước. Việc unify interface chưa có nghĩa hỗ trợ bất kỳ embodiment mới nào zero-shot. Inference với large VLM+DiT vẫn có độ trễ và VRAM cost. Thị giác navigation và dexterous manipulation có yêu cầu control khác xa nhau.

**Phê bình độc lập:**

- **Embodiment prompt có trần:** text có thể xác định control schema nhưng không học động học robot mới nếu không có demonstrations phù hợp.
- **Mixed-objective interference:** lấy mẫu ratio giữa manipulation/navigation/VLM rất quan trọng; hiệu năng chung không cho biết từng domain phải trả bao nhiêu dung lượng mô hình.
- **Đánh giá comparability:** benchmarks từ nhiều nhóm có action rate, hình ảnh resolution và điều kiện hoàn thành nhiệm vụ khác nhau; một aggregate không đại diện open-world ability.
- **Action động lực học:** unified quỹ đạo dự đoán chưa chứng minh vật lý tiếp xúc, phục hồi và safety constraints được khái quát tương đương ngữ nghĩa grounding.
- **Dữ liệu provenance:** video con người dễ có noise lớn ở tracking/label alignment; nếu không có công bố chi tiết filtering, người đọc khó quy kết gains cho video hay dữ liệu robot.
- **Serving:** khi dùng trên robot thật, mô hình mạnh nhưng độ trễ dao động vẫn cần RTC-like runtime strategy hoặc inference acceleration.

## Liên hệ với nghiên cứu khác

- [PaLM-E](/paper/palm-e) mở hướng đưa thị giác/đầu vào cảm biến vào mô hình ngôn ngữ đã pretrain.
- [RT-2](/paper/rt-2) và [OpenVLA](/paper/openvla) là nhánh VLM-to-action discrete tokens.
- [Diffusion Policy](/paper/diffusion-policy), [RDT-1B](/paper/rdt-1b) và [GR00T N1](/paper/groot-n1) giúp hiểu liên tục generative action heads.
- [Open X-Embodiment](/paper/open-x-embodiment) là bài học cốt lõi về hỗn hợp dữ liệu và embodiment alignment.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) cũng xử lý multi-embodiment, nhưng chọn canonical whole-body action và sparse MoE.

## Đọc code và tự kiểm chứng

Vào [Qwen-VLA official code](https://github.com/QwenLM/Qwen-VLA). Đừng huấn luyện toàn bộ ngay. Theo một mẫu qua `dataset → processor → multimodal backbone → DiT action decoder → normalization inverse → control`. Log shapes tại từng đoạn, rồi thay embodiment prompt nhưng **giữ nguyên hình ảnh + chỉ dẫn** để kiểm tra mô hình interface và đầu ra conventions. Một thí nghiệm quan trọng: cố tình dùng sai action normalization và xem kết quả vỡ ra sao. Nếu muốn ablation, so đầu ra variance khi bỏ prompt embodiment trên hai robot khác control modes, nhưng không đưa ra claim nhân quả chỉ từ một mẫu.
