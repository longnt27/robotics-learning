> **Bài do bạn cung cấp.** [Qwen-VLA: Unifying Vision-Language-Action Modeling across Tasks, Environments, and Robot Embodiments](https://arxiv.org/abs/2605.30280), Qwen Team, arXiv 2026. Đọc song song với **Figure 2** về architecture, **Tables 1–2** về data mixture/embodiment, và **Tables 4–6** về kết quả. Tên “Qwen-VLA” không có nghĩa mọi capability đã generalize ngang nhau.

## Why

### Một model cho manipulation, navigation và trajectory prediction?

Các nhánh embodied learning thường sống trong ba hệ sinh thái tương đối riêng: robot manipulation với gripper/arms, mobile navigation với vị trí/hướng đi và trajectory tasks với kiểu trạng thái đầu ra khác nhau. Ngay trong manipulation, mỗi robot có số DoF, hệ toạ độ, action frequency và convention riêng. Nếu phải train một checkpoint cho mỗi robot/task, **data không chia sẻ prior** một cách hiệu quả; sự hiểu biết về cái cốc ở một robot không dễ sang robot khác.

Trong khi đó, pretrained Qwen VLM đã học nhận diện vật, ngôn ngữ, không gian và nhiều quan hệ semantic. Câu hỏi của Qwen-VLA là liệu có thể **dùng chung một vision-language-action foundation** cho các dạng embodied decision-making khác nhau, thay vì duy trì riêng robot policy, navigation model và trajectory predictor. Nó muốn unified không chỉ ở phần perception/understanding mà còn tại **continuous action/trajectory generation**.

Khó khăn là **action semantics không đồng nhất**. Một vector 7 chiều có thể là end-effector translation/rotation/gripper; robot khác 14 joint angles; agent navigation lại xuất waypoint và heading. Đưa tất cả vào cùng tensor padding mà không mô tả embodiment sẽ khiến model học mapping mơ hồ. Vì vậy kiến trúc phải đồng thời giải VLM grounding, representation/conditioning và action generation.

## Kiến thức nền

**Embodiment** là cấu hình vật lý và control interface: joints, gripper, camera mounts, coordinates, proprioception. **End-effector (EEF) action** mô tả thao tác trong Cartesian space; **joint action** mô tả góc/velocity của từng khớp; hai loại cần inverse kinematics hoặc controller khác nhau để execute. **DiT** là Diffusion Transformer: dùng attention làm action generator thay vì pure MLP/U-Net, cho phép condition trên features từ VLM. **Flow matching** là cách train generative dynamics from noise to clean trajectory; sampling qua vài Euler steps để sinh continuous actions.

Một **embodiment prompt** chỉ cung cấp metadata rõ ràng cho model về hành động mà nó đang dự đoán. Prompt không sửa được physical calibration sai, không tạo joint từ không khí, và không phải chứng minh cross-embodiment transfer tuyệt đối.

## How

### 1. VLM backbone cho cả understanding và control

Qwen-VLA mở rộng Qwen vision-language stack. Input có images/video context, text instruction và thông tin robot. Features được đưa cho action decoder theo kiến trúc DiT, nơi random action/trajectory tensor được iteratively updated để ra continuous trajectory. **Không nên nhầm continuous action head với việc language model autoregressively sinh các số dưới dạng text.** Đây là khác biệt rõ với hướng discrete-token của OpenVLA.

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

Thay vì train hardcoded expert cho mỗi robot ngay từ đầu, Qwen-VLA đưa **mô tả dạng text về embodiment và control convention** vào prompt. Ví dụ input nói robot A có dual arms, lệnh điều khiển relative EEF deltas; robot B là mobile manipulator với base motion. Model học cùng semantic scene và task-conditioned representations nhưng hiểu output command đang nằm trong convention nào.

Điều này hấp dẫn vì cùng backbone có thể nhận nhiều platform. Nhưng text prompt phải chính xác, và datasets vẫn cần đúng normalization, action masks, coordinate transforms, time horizon. **Một câu văn mô tả robot không thay thế calibration/canonicalization.**

### 3. Joint pretraining mixture

Paper trộn robot manipulation trajectories, human egocentric demonstrations, synthetic/simulation data, vision-language navigation data, trajectory-centric supervision và auxiliary vision-language tasks. **Table 1** nêu mixture và sampling weights; **Table 2** cho thấy robot khác nhau về EEF/joint control, arm setup và temporal horizon. Đây là thiết kế pretraining khá gần một hệ thống product-oriented: không tập trung một benchmark mà cố duy trì đa nhiệm vụ trong cùng foundation stack.

Tại sao phải có auxiliary VLM data? Nếu finetune VLM quá mạnh vào robot actions, model có thể mất vocabulary và visual-semantic capabilities có sẵn. Mix thêm VLM objectives giúp duy trì grounded understanding, nhưng đồng nghĩa tranh chấp batch budget: một batch navigation sẽ không trực tiếp update bimanual contact skill.

### 4. Đưa human video vào policy, nhưng không ngộ nhận action labels

Video headcam thường cho temporal goal/motion evidence rất tốt, nhưng không đi kèm robot joint commands. Pipeline Qwen-VLA dùng human ego demos như một nguồn supervision bên cạnh robot data, không hứa video người thay thế hoàn toàn robotic post-training. Vấn đề nghiên cứu quan trọng là **alignment giữa biểu diễn chuyển động con người, visual features và action space của robot**. Nó giống bài toán của MimicPlay và GR00T ở high level, nhưng recipe không nhất thiết trùng nhau.

### 5. Unified training, specialized evaluation

Khi một model được train đa embodiment, phải đánh giá cả **per-domain task success** lẫn dấu hiệu negative transfer: một domain cải thiện có làm domain khác tụt không? Paper so một shared policy với specialists được train chuyên vào benchmark/platform. Những kết quả được tác giả báo cao ở ALOHA và một số simulation task đáng chú ý, nhưng chỉ có nghĩa trong chính setup evaluation đó.

## Ví dụ từng bước

Giả sử observation chứa một đĩa trên bàn, instruction **“move the plate into the sink”**. Với robot hai tay, model cần output trajectories cho EEF/joints và grippers. Với robot mobile-base, cùng goal có thể yêu cầu base navigation, căn camera vào sink, rồi thao tác arm. Thông tin scene và objective có thể chia sẻ; action schema và horizon không thể coi là cùng một vector đơn giản. Embodiment prompt giúp model biết prediction target, DiT action decoder sinh trajectories conditional trên observation và prompt.

Cùng một từ “left” có thể chỉ camera-left, world-left hoặc robot base-left. Nếu coordinate convention không rõ, ngay cả một model lý tưởng cũng không thể predict đúng lệnh thực thi. Đây là lý do khi đọc code phải nhìn **action preprocessing**, không chỉ backbone Transformer.

## Results

Paper báo kết quả manipulation, navigation và trajectory-related benchmarks. Trong real-world ALOHA setting, **Qwen-VLA-ALOHA có pretraining** được báo đạt average **83.6%** in-domain success, so với **48.5%** cho một version đối chứng trong Table 5; ở OOD manipulations, paper báo average **76.9%** trong Table 6. Đó là kết quả **trong các task và quy trình của tác giả**, không chứng minh một model ngẫu nhiên tải về sẽ đạt tương tự trên robot khác.

Trong benchmark động DOMINO, abstract nhắc **26.6% zero-shot success**, một con số hữu ích vì nhắc ta rằng task phân phối mới có thể vẫn rất khó. Khi một bảng báo 83.6% cho supervised/post-trained ALOHA và một benchmark khác chỉ 26.6% zero-shot, không nên gộp thành “Qwen-VLA thành công 80% trên thế giới thật”.

**So sánh specialist/generalist:** paper có các phép so với specialized baselines và những architecture gần như GR00T. Một generalist không đương nhiên hơn specialist ở từng setting. Điều đáng nghiên cứu là **đường trade-off** giữa shared pretraining data, adapted robot data và per-task success. Nếu một generalist thắng ở vài task nhưng thua ở contact-intensive tasks, chúng ta cần xem action representation và token/flow budget.

## Limitations

**Từ phạm vi paper:** model được đánh giá trên một số robot, task families và bench định trước. Việc unify interface chưa có nghĩa hỗ trợ bất kỳ embodiment mới nào zero-shot. Inference với large VLM+DiT vẫn có latency và VRAM cost. Visual navigation và dexterous manipulation có yêu cầu control khác xa nhau.

**Phê bình độc lập:**

- **Embodiment prompt có trần:** text có thể xác định control schema nhưng không học động học robot mới nếu không có demonstrations phù hợp.
- **Mixed-objective interference:** sampling ratio giữa manipulation/navigation/VLM rất quan trọng; performance chung không cho biết từng domain phải trả bao nhiêu capacity.
- **Evaluation comparability:** benchmarks từ nhiều nhóm có action rate, image resolution và success predicate khác nhau; một aggregate không đại diện open-world ability.
- **Action dynamics:** unified trajectory prediction chưa chứng minh contact physics, recovery và safety constraints được generalize tương đương semantic grounding.
- **Data provenance:** human videos dễ có noise lớn ở tracking/label alignment; nếu không có công bố chi tiết filtering, người đọc khó quy kết gains cho video hay robot data.
- **Serving:** khi dùng trên robot thật, model mạnh nhưng latency dao động vẫn cần RTC-like runtime strategy hoặc inference acceleration.

## Connections

- [PaLM-E](/paper/palm-e) mở hướng đưa visual/sensor input vào pretrained language model.
- [RT-2](/paper/rt-2) và [OpenVLA](/paper/openvla) là nhánh VLM-to-action discrete tokens.
- [Diffusion Policy](/paper/diffusion-policy), [RDT-1B](/paper/rdt-1b) và [GR00T N1](/paper/groot-n1) giúp hiểu continuous generative action heads.
- [Open X-Embodiment](/paper/open-x-embodiment) là bài học cốt lõi về data mixture và embodiment alignment.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) cũng xử lý multi-embodiment, nhưng chọn canonical whole-body action và sparse MoE.

## Đọc code và tự kiểm chứng

Vào [Qwen-VLA official code](https://github.com/QwenLM/Qwen-VLA). Đừng train toàn bộ ngay. Theo một sample qua `dataset → processor → multimodal backbone → DiT action decoder → normalization inverse → control`. Log shapes tại từng đoạn, rồi thay embodiment prompt nhưng **giữ nguyên image + instruction** để kiểm tra model interface và output conventions. Một experiment quan trọng: cố tình dùng sai action normalization và xem kết quả vỡ ra sao. Nếu muốn ablation, so output variance khi bỏ prompt embodiment trên hai robot khác control modes, nhưng không đưa ra claim nhân quả chỉ từ một sample.
