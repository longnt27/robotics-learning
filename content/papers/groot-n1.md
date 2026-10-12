> **Bài do bạn cung cấp.** Bản gốc: [GR00T N1, arXiv:2503.14734](https://arxiv.org/abs/2503.14734). Đọc cùng sơ đồ architecture ở **Figure 3** và bảng kết quả thực nghiệm ở **Section 4**. Bài giải thích dưới đây phân biệt những gì tác giả chứng minh với suy luận kỹ thuật.

## Why

### Một mô hình biết nhìn chưa chắc biết điều khiển

Robot humanoid có thể sở hữu camera, hai cánh tay, thân, cổ tay và gripper, nhưng việc biến lời nói “gấp chiếc áo này” thành hàng trăm lệnh điều khiển vẫn rất khó. Truyền thống, mỗi robot/task được train bằng behavior cloning trên một tập demonstrations tương ứng. Cách này đắt: tạo một kỹ năng mới lại cần thu video, ghi joint actions, tune policy, sửa integration. Trong khi đó, trên Internet có vô số video con người thao tác, và VLM đã học được rất nhiều tri thức về vật, scene và ngôn ngữ.

Mâu thuẫn là **video người không có nhãn motor command của robot**. Người cầm cốc bằng tay năm ngón, robot dùng gripper; người có thân và camera thay đổi; robot có joint limits và kinematics khác. Không thể copy human joint angles sang robot joints một cách trực tiếp. Do đó bài toán của GR00T N1 là: làm sao tận dụng **đa nguồn dữ liệu** để xây dựng một policy có semantic understanding lẫn khả năng sinh continuous motor actions, sau đó thích nghi nhanh cho robot thật?

NVIDIA chọn kiến trúc hai hệ thống: một phần hiểu thông tin và một phần tạo chuyển động. Đây là lời đáp thực dụng cho câu hỏi “VLM lớn có đủ để trực tiếp điều khiển robot không?”: tác giả không bắt text decoder gánh mọi thứ.

## Kiến thức nền

**Vision-Language Model (VLM)** học biểu diễn từ image và text. Nó mạnh ở scene understanding, object recognition, instruction following nhưng không tự có trajectory control prior chính xác. **Diffusion/flow action policy** học phân phối nhiều quỹ đạo liên tục khả thi từ demonstrations; một observation có thể tương ứng nhiều cách grasp khác nhau. **Action chunk** là tensor `A ∈ R^{H × D}`, trong đó H là số bước tương lai dự đoán, D là action dimensions; không phải một token duy nhất.

**Pretraining** nhằm tích lũy representation/behavior priors từ nhiều nguồn. **Post-training** thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì success ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream.

## How

### 1. Kiến trúc dual-system

Paper gọi tầng hiểu là **System 2**, tầng sinh action là **System 1**. Input gồm camera frames, instruction và robot state/proprioception tuỳ embodiment. System 2 dùng VLM encode ảnh và ngôn ngữ thành context, rồi cung cấp context cho System 1; System 1 là một Transformer chuyên sinh action trajectory bằng quá trình flow-based generation. Hai phần có thể joint train, vì gradient của bài toán control ảnh hưởng tới representation của context.

```text
camera + instruction + robot state
                │
                ▼
      VLM / System 2
  semantic + visual features
                │
                ▼
    Action expert / System 1
    noisy action trajectory
                │
       flow matching sampler
                ▼
     H × D continuous actions
                │
                ▼
       robot controller
```

Không nên hiểu nhầm System 2 như một chatbot ngồi suy nghĩ ra kế hoạch dài bằng văn bản ở mọi timestep. Nó là mạng cung cấp **conditioned visual-language features**, còn action head học mapping sang chuyển động. Cách gọi “fast/slow” là một cách tổ chức ý tưởng, không chứng minh hai subsystem có reasoning giống não người.

### 2. Flow matching trên action

Thay vì regress một vector action duy nhất, GR00T tạo trajectory nhiều bước. Xét ground-truth sequence `A_1` và Gaussian noise `A_0`, có thể nội suy một trạng thái `A_τ` giữa noise và data. Network học một velocity field `v_θ(A_τ, τ, c)` với condition `c` từ image, language và robot state. Ở inference, bắt đầu noise, tích phân qua nhiều flow time steps để lấy một plausible chunk. Flow time là **thời gian sinh mẫu**, không phải số ms điều khiển robot.

Vì action trajectory bao gồm nhiều bước, model có thể phối hợp chuyển động tay trái/tay phải và giữ tính liên tục về thời gian trong chunk. Dù vậy, khi nối **hai chunk khác nhau ở runtime**, một bài toán khác xuất hiện, về sau được RTC tập trung giải quyết.

### 3. Dữ liệu robot, người và synthetic

Tài sản lớn của GR00T N1 không phải riêng architecture. Paper tập hợp robot trajectories thuộc nhiều embodiments, dữ liệu human activities và synthetic trajectories. Các nguồn được chuyển về các supervision thích hợp, không phải mỗi frame Internet đều cung cấp chính xác lệnh cho humanoid. Paper mô tả cách khai thác latent action / neural trajectories và những bước dữ liệu phục vụ cross-embodiment training.

Đây là điểm liên hệ mạnh nhất với hoạt động thu headcam video: **đầu vào người đa dạng có giá trị, nhưng value phụ thuộc vào filtering, motion/hand state reconstruction và mapping sang representation mà action expert học được**. Một video không có interaction hữu ích có thể góp nhiều về scene understanding nhưng rất ít về manipulation skill. Trộn tất cả video mà không kiểm soát coverage sẽ dễ làm dataset lớn về giờ nhưng nghèo về actionable behavior.

### 4. Pretrain rồi post-train

Một network pretrained chưa hiểu chắc robot target. Post-training dùng demonstrations đặc thù để calibrate action scaling, gripper convention, camera viewpoint và kinematics. Trong evaluation, tác giả thử các data regimes như 30, 100 và 300 demonstrations mỗi task ở một số setting, rồi so với policy train from scratch. Đây là cách hợp lý để đo một giá trị thực: **pretraining giúp tiết kiệm bao nhiêu downstream robot data?**

## Ví dụ từng bước

Giả sử robot hai tay cần **gấp áo trên bàn**. Observation ban đầu cho thấy hai mép áo lệch vị trí; instruction “fold the shirt” xác định goal. VLM trích xuất context gồm áo, bàn, tay robot và từ khóa nhiệm vụ. Action expert lấy robot joint state hiện tại, sampled action noise và context rồi sinh chunk chứa các bước đưa hai tay xuống, kẹp mép, kéo và đặt. Robot execute một phần, observe lại và generate chunk mới. Nếu áo trượt, output cần thay đổi dựa trên frame mới.

Với human video, ta có thể thấy người nắm mép áo và fold theo cách tương tự, nhưng **tay người không đồng nghĩa với gripper action**. Representation phải tách semantic/temporal structure dùng chung khỏi chi tiết motion controller phụ thuộc embodiment. Đây là lý do action representation và data pipeline đáng học ngang kiến trúc VLM.

## Results

Paper đánh giá nhiều simulator và trên humanoid thật. Phần công bố báo pretrained GR00T N1 thường tốt hơn imitation learning baselines được train from scratch ở những chế độ ít demonstrations, và cho thấy adaptation trên Fourier GR-1. **Table 2** so sánh simulation theo số demonstrations, **Table 3** là real-world GR-1 tasks. Abstract không có nghĩa policy có thể làm mọi việc zero-shot; cần đọc từng task, metric, split và lượng post-training data.

Paper cũng nêu phiên bản GR00T N1-2B gồm khoảng 2B parameters và latency sampled chunk khoảng 63.9 ms trên một GPU L40 trong setting được báo cáo. Đây là measurement của một cấu hình cụ thể, không phải realtime guarantee trên consumer GPU và mọi robot. Vì vậy khi so hiệu năng với Qwen-VLA hoặc π0.5, bắt buộc giữ cố định task, benchmark và target hardware.

**Một cách đọc kết quả có trách nhiệm:** xem biểu đồ pretraining vs scratch theo từng data regime. Nếu gain lớn ở 30 demos nhưng nhỏ dần ở 300 demos, đóng góp nổi bật là data efficiency, chưa chắc policy ceiling cao hơn trong mọi trường hợp.

## Limitations

**Phạm vi tác giả thể hiện:** Kết quả tập trung trên các embodiment/task đã chọn; foundation policy vẫn cần post-training cho hardware/skill cụ thể. Human video không tự giải quyết việc ánh xạ sang robot actions. Dataset mixture và huấn luyện vẫn rất lớn, ít lab có thể tái lập toàn bộ pipeline.

**Phê bình độc lập:**

- **Bottleneck dữ liệu ẩn sau architecture:** lượng dữ liệu và bộ lọc tạo ra behavior prior có thể quyết định hiệu năng hơn một lựa chọn attention block; nếu không có ablation kiểm soát chặt giữa pipeline dữ liệu, khó quy công riêng cho System 1/System 2.
- **Robot-specific bias:** test có thể nằm gần morphology và task distribution post-training. Cross-embodiment claim cần split khó hơn: hardware mới, contact model khác và object categories mới đồng thời.
- **Success rate che lỗi động học:** hoàn thành task không luôn đo continuity, velocity spike, collision margin hay safety. Khi inference latency dao động, một policy chunking cần runtime tốt, không chỉ validation loss tốt.
- **Physics reasoning chưa được chứng minh:** performance có thể đến từ pattern matching trajectories; mô hình không nhất thiết đã học nhân quả vật lý đủ dùng để planning dài.

## Connections

- [RT-2](/paper/rt-2) đi từ VLM sang action tokens; GR00T tách continuous generative action expert.
- [Diffusion Policy](/paper/diffusion-policy) cung cấp mental model về denoising action sequences.
- [Open X-Embodiment](/paper/open-x-embodiment) giúp hiểu lý do và thách thức của data mixture đa morphology.
- [Qwen-VLA](/paper/qwen-vla) dùng cùng bài toán multi-embodiment nhưng có embodiment-conditioned prompts và DiT continuous action head.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) mở rộng theo hướng sparse MoE, whole-body action vector và predictive dynamics supervision.

## Đọc code và tự kiểm chứng

Bắt đầu từ [NVIDIA Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T). Trước khi train, đọc `observation` schema, normalization và policy input/output shapes; lập một bảng `robot state / image / language / action`. Chạy một inference example, log shape trước và sau VLM và action expert; thay frame nhưng giữ instruction để xem output thay đổi, rồi làm ngược lại. Mục tiêu không phải một lần chạy thành công, mà là **biết chính xác dữ liệu đi qua subsystem nào và action về robot được diễn giải ra sao**.
