> **Bài do bạn cung cấp.** Bản gốc: [GR00T N1, arXiv:2503.14734](https://arxiv.org/abs/2503.14734). Đọc cùng sơ đồ kiến trúc ở **Figure 3** và bảng kết quả thực nghiệm ở **Section 4**. Bài giải thích dưới đây phân biệt những gì tác giả chứng minh với suy luận kỹ thuật.

## Vì sao cần nghiên cứu này?

### Một mô hình biết nhìn chưa chắc biết điều khiển

Robot humanoid có thể sở hữu camera, hai cánh tay, thân, cổ tay và gripper, nhưng việc biến lời nói “gấp chiếc áo này” thành hàng trăm lệnh điều khiển vẫn rất khó. Truyền thống, mỗi robot/nhiệm vụ được huấn luyện bằng behavior cloning trên một tập demonstrations tương ứng. Cách này đắt: tạo một kỹ năng mới lại cần thu video, ghi joint actions, tune policy, sửa integration. Trong khi đó, trên Internet có vô số video con người thao tác, và VLM đã học được rất nhiều tri thức về vật, bối cảnh và ngôn ngữ.

Mâu thuẫn là **video người không có nhãn motor command của robot**. Người cầm cốc bằng tay năm ngón, robot dùng gripper; người có thân và camera thay đổi; robot có joint limits và kinematics khác. Không thể copy khớp của con người angles sang robot joints một cách trực tiếp. Do đó bài toán của GR00T N1 là: làm sao tận dụng **đa nguồn dữ liệu** để xây dựng một policy có khả năng hiểu ngữ nghĩa lẫn khả năng sinh liên tục motor actions, sau đó thích nghi nhanh cho robot thật?

NVIDIA chọn kiến trúc hai hệ thống: một phần hiểu thông tin và một phần tạo chuyển động. Đây là lời đáp thực dụng cho câu hỏi “VLM lớn có đủ để trực tiếp điều khiển robot không?”: tác giả không bắt text decoder gánh mọi thứ.

## Kiến thức nền

**Mô hình thị giác-ngôn ngữ (VLM)** học biểu diễn từ hình ảnh và text. Nó mạnh ở bối cảnh understanding, nhận dạng vật thể, chỉ dẫn following nhưng không tự có quỹ đạo control prior chính xác. **Diffusion/flow action policy** học phân phối nhiều quỹ đạo liên tục khả thi từ demonstrations; một quan sát có thể tương ứng nhiều cách grasp khác nhau. **Action chunk** là tensor `A ∈ R^{H × D}`, trong đó H là số bước tương lai dự đoán, D là action dimensions; không phải một token duy nhất.

**Pretraining** nhằm tích lũy biểu diễn/hành vi priors từ nhiều nguồn. **Post-training** thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì thành công ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream.

## Phương pháp thực hiện

### 1. Kiến trúc dual-system

Bài báo gọi tầng hiểu là **Hệ thống 2**, tầng sinh action là **Hệ thống 1**. Đầu vào gồm khung hình camera, chỉ dẫn và trạng thái robot/proprioception tuỳ embodiment. Hệ thống 2 dùng VLM encode ảnh và ngôn ngữ thành context, rồi cung cấp context cho Hệ thống 1; Hệ thống 1 là một Transformer chuyên sinh action quỹ đạo bằng quá trình flow-based sinh. Hai phần có thể joint huấn luyện, vì gradient của bài toán control ảnh hưởng tới biểu diễn của context.

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

Không nên hiểu nhầm Hệ thống 2 như một chatbot ngồi suy nghĩ ra kế hoạch dài bằng văn bản ở mọi timestep. Nó là mạng cung cấp **conditioned đặc trưng thị giác-ngôn ngữ**, còn action head học mapping sang chuyển động. Cách gọi “fast/slow” là một cách tổ chức ý tưởng, không chứng minh hai subsystem có reasoning giống não người.

### 2. Flow matching trên action

Thay vì regress một vector action duy nhất, GR00T tạo quỹ đạo nhiều bước. Xét ground-truth chuỗi `A_1` và nhiễu Gaussian `A_0`, có thể nội suy một trạng thái `A_τ` giữa noise và dữ liệu. Network học một velocity field `v_θ(A_τ, τ, c)` với điều kiện `c` từ hình ảnh, ngôn ngữ và trạng thái robot. Ở inference, bắt đầu noise, tích phân qua nhiều flow time steps để lấy một plausible chunk. Flow time là **thời gian sinh mẫu**, không phải số ms điều khiển robot.

Vì action quỹ đạo bao gồm nhiều bước, mô hình có thể phối hợp chuyển động tay trái/tay phải và giữ tính liên tục về thời gian trong chunk. Dù vậy, khi nối **hai chunk khác nhau ở runtime**, một bài toán khác xuất hiện, về sau được RTC tập trung giải quyết.

### 3. Dữ liệu robot, người và synthetic

Tài sản lớn của GR00T N1 không phải riêng kiến trúc. Bài báo tập hợp robot các quỹ đạo thuộc nhiều embodiments, dữ liệu con người activities và synthetic các quỹ đạo. Các nguồn được chuyển về các tín hiệu giám sát thích hợp, không phải mỗi khung hình Internet đều cung cấp chính xác lệnh cho humanoid. Bài báo mô tả cách khai thác latent action / neural các quỹ đạo và những bước dữ liệu phục vụ cross-embodiment huấn luyện.

Đây là điểm liên hệ mạnh nhất với hoạt động thu headcam video: **đầu vào người đa dạng có giá trị, nhưng value phụ thuộc vào filtering, chuyển động/hand state reconstruction và mapping sang biểu diễn mà action expert học được**. Một video không có interaction hữu ích có thể góp nhiều về bối cảnh understanding nhưng rất ít về manipulation kỹ năng. Trộn tất cả video mà không kiểm soát coverage sẽ dễ làm tập dữ liệu lớn về giờ nhưng nghèo về actionable hành vi.

### 4. Pretrain rồi post-train

Một mạng đã pretrain chưa hiểu chắc robot target. Post-training dùng demonstrations đặc thù để calibrate action scaling, gripper convention, camera viewpoint và kinematics. Trong đánh giá, tác giả thử các dữ liệu regimes như 30, 100 và 300 demonstrations mỗi nhiệm vụ ở một số thiết lập, rồi so với policy được huấn luyện từ đầu. Đây là cách hợp lý để đo một giá trị thực: **pretraining giúp tiết kiệm bao nhiêu dữ liệu downstream robot?**

## Ví dụ từng bước

Giả sử robot hai tay cần **gấp áo trên bàn**. Observation ban đầu cho thấy hai mép áo lệch vị trí; chỉ dẫn “fold the shirt” xác định mục tiêu. VLM trích xuất context gồm áo, bàn, tay robot và từ khóa nhiệm vụ. Action expert lấy robot trạng thái khớp hiện tại, sampled action noise và context rồi sinh chunk chứa các bước đưa hai tay xuống, kẹp mép, kéo và đặt. Robot thực thi một phần, observe lại và sinh chunk mới. Nếu áo trượt, đầu ra cần thay đổi dựa trên khung hình mới.

Với video con người, ta có thể thấy người nắm mép áo và fold theo cách tương tự, nhưng **tay người không đồng nghĩa với gripper action**. Representation phải tách ngữ nghĩa/theo thời gian structure dùng chung khỏi chi tiết chuyển động bộ điều khiển phụ thuộc embodiment. Đây là lý do biểu diễn action và quy trình xử lý dữ liệu đáng học ngang kiến trúc VLM.

## Kết quả thực nghiệm

Bài báo đánh giá nhiều môi trường mô phỏng và trên humanoid thật. Phần công bố báo GR00T N1 đã pretrain thường tốt hơn các phương pháp imitation learning đối chứng được huấn luyện từ đầu ở những chế độ ít demonstrations, và cho thấy adaptation trên Fourier GR-1. **Table 2** so sánh mô phỏng theo số demonstrations, **Table 3** là các nhiệm vụ trên GR-1 ngoài đời thực. Abstract không có nghĩa policy có thể làm mọi việc zero-shot; cần đọc từng nhiệm vụ, metric, split và lượng dữ liệu post-training.

Bài báo cũng nêu phiên bản GR00T N1-2B gồm khoảng 2B parameters và độ trễ sampled chunk khoảng 63.9 ms trên một GPU L40 trong thiết lập được báo cáo. Đây là measurement của một cấu hình cụ thể, không phải realtime guarantee trên consumer GPU và mọi robot. Vì vậy khi so hiệu năng với Qwen-VLA hoặc π0.5, bắt buộc giữ cố định nhiệm vụ, benchmark và target phần cứng.

**Một cách đọc kết quả có trách nhiệm:** xem biểu đồ pretraining vs scratch theo từng dữ liệu regime. Nếu gain lớn ở 30 demos nhưng nhỏ dần ở 300 demos, đóng góp nổi bật là dữ liệu efficiency, chưa chắc policy ceiling cao hơn trong mọi trường hợp.

## Hạn chế và câu hỏi còn mở

**Phạm vi tác giả thể hiện:** Kết quả tập trung trên các embodiment/nhiệm vụ đã chọn; foundation policy vẫn cần post-training cho phần cứng/kỹ năng cụ thể. Video con người không tự giải quyết việc ánh xạ sang robot actions. Tập dữ liệu mixture và huấn luyện vẫn rất lớn, ít phòng thí nghiệm có thể tái lập toàn bộ pipeline.

**Phê bình độc lập:**

- **Bottleneck dữ liệu ẩn sau kiến trúc:** lượng dữ liệu và bộ lọc tạo ra hành vi prior có thể quyết định hiệu năng hơn một lựa chọn attention block; nếu không có ablation kiểm soát chặt giữa pipeline dữ liệu, khó quy công riêng cho Hệ thống 1/Hệ thống 2.
- **Robot-specific bias:** test có thể nằm gần morphology và phân phối nhiệm vụ post-training. Cross-embodiment claim cần split khó hơn: phần cứng mới, contact mô hình khác và các loại vật thể mới đồng thời.
- **Tỷ lệ thành công che lỗi động học:** hoàn thành nhiệm vụ không luôn đo continuity, velocity spike, collision margin hay safety. Khi độ trễ inference dao động, một policy chunking cần runtime tốt, không chỉ validation loss tốt.
- **Physics reasoning chưa được chứng minh:** hiệu năng có thể đến từ pattern matching các quỹ đạo; mô hình không nhất thiết đã học nhân quả vật lý đủ dùng để lập kế hoạch dài.

## Liên hệ với nghiên cứu khác

- [RT-2](/paper/rt-2) đi từ VLM sang action tokens; GR00T tách liên tục generative action expert.
- [Diffusion Policy](/paper/diffusion-policy) cung cấp mô hình tư duy về denoising action chuỗi.
- [Open X-Embodiment](/paper/open-x-embodiment) giúp hiểu lý do và thách thức của hỗn hợp dữ liệu đa morphology.
- [Qwen-VLA](/paper/qwen-vla) dùng cùng bài toán multi-embodiment nhưng có embodiment-conditioned prompts và DiT action liên tục head.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) mở rộng theo hướng sparse MoE, whole-body action vector và predictive động lực học tín hiệu giám sát.

## Đọc code và tự kiểm chứng

Bắt đầu từ [NVIDIA Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T). Trước khi huấn luyện, đọc `observation` schema, normalization và policy đầu vào/đầu ra shapes; lập một bảng `robot state / image / language / action`. Chạy một inference example, log shape trước và sau VLM và action expert; thay khung hình nhưng giữ chỉ dẫn để xem đầu ra thay đổi, rồi làm ngược lại. Mục tiêu không phải một lần chạy thành công, mà là **biết chính xác dữ liệu đi qua subsystem nào và action về robot được diễn giải ra sao**.
