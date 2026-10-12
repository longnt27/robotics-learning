> **Bài do bạn cung cấp.** Bản gốc: [GR00T N1, arXiv:2503.14734](https://arxiv.org/abs/2503.14734). Đọc cùng sơ đồ kiến trúc ở **Figure 3** và bảng kết quả thực nghiệm ở **Section 4**. Bài giải thích dưới đây phân biệt những gì tác giả chứng minh với suy luận kỹ thuật.

## Vì sao cần nghiên cứu này?

### Một mô hình biết nhìn chưa chắc biết điều khiển

Robot humanoid có thể sở hữu camera, hai cánh tay, thân, cổ tay và gripper, nhưng việc biến lời nói “gấp chiếc áo này” thành hàng trăm lệnh điều khiển vẫn rất khó. Truyền thống, mỗi robot/nhiệm vụ được huấn luyện bằng behavior cloning trên một tập demonstrations tương ứng. Cách này đắt: tạo một kỹ năng mới lại cần thu video, ghi joint actions, tune policy, sửa integration. Trong khi đó, trên Internet có vô số video con người thao tác, và VLM đã học được rất nhiều tri thức về vật, bối cảnh và ngôn ngữ.

Mâu thuẫn là **video người không có nhãn motor command của robot**. Người cầm cốc bằng tay năm ngón, robot dùng gripper; người có thân và camera thay đổi; robot có joint limits và kinematics khác. Không thể copy khớp của con người angles sang robot joints một cách trực tiếp. Do đó bài toán của GR00T N1 là: làm sao tận dụng **đa nguồn dữ liệu** để xây dựng một policy có khả năng hiểu ngữ nghĩa lẫn khả năng sinh liên tục motor actions, sau đó thích nghi nhanh cho robot thật?

NVIDIA chọn kiến trúc hai hệ thống: một phần hiểu thông tin và một phần tạo chuyển động. Đây là lời đáp thực dụng cho câu hỏi “VLM lớn có đủ để trực tiếp điều khiển robot không?”: tác giả không bắt text decoder gánh mọi thứ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/groot-n1/figure-1.webp)

*Hình 1, trang 2. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2503.14734#page=2).*

#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là tháp dữ liệu, không phải sơ đồ network. Ở đáy có những nguồn nhiều nhưng không mang đầy đủ action label robot; phía trên là các loại dữ liệu gần nhiệm vụ và embodiment hơn, thường đắt hơn. Ý tưởng cốt lõi: không thể đòi mọi video người ngoài đời cung cấp joint torque của một humanoid. Mỗi tầng dữ liệu nên cung cấp tín hiệu supervision phù hợp với thứ thực sự quan sát được. Đó là lý do cần đọc data recipe song song với kiến trúc dual-system.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** VLM lo hiểu ngữ nghĩa, action expert lo chuyển động: pretraining video người bổ sung kinh nghiệm cho robot. Không thể copy khớp của con người angles sang robot joints một cách trực tiếp. Do đó bài toán của GR00T N1 là: làm sao tận dụng đa nguồn dữ liệu để xây dựng một policy có khả năng hiểu ngữ nghĩa lẫn khả năng sinh liên tục motor actions, sau đó thích nghi nhanh cho robot thật?

**Vấn đề khoa học nằm ở đâu?** Một mô hình vừa phải hiểu nhiệm vụ vừa phải phát lệnh motor liên tục, nhưng hai phần có demands khác nhau. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Dual-system architecture chia việc theo bản chất là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là System 2 mã hóa image/language thành condition; System 1 là flow-based action expert sinh quỹ đạo. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Robot demonstrations đắt, đa embodiment khó cùng huấn luyện

**Luận điểm.** Một mô hình vừa phải hiểu nhiệm vụ vừa phải phát lệnh motor liên tục, nhưng hai phần có demands khác nhau. Truyền thống, mỗi robot/nhiệm vụ được huấn luyện bằng behavior cloning trên một tập demonstrations tương ứng.

**Tại sao lỗi này có hệ quả lớn?** VLM giỏi nghĩa nhưng không sẵn sàng điều khiển khớp. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân robot demonstrations đắt, đa embodiment khó cùng huấn luyện vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: VLM giỏi nghĩa nhưng không sẵn sàng điều khiển khớp

**Luận điểm.** Robot-only BC thiếu dữ liệu quy mô và khó mở rộng ra nhiều thiết bị. Robot humanoid có thể sở hữu camera, hai cánh tay, thân, cổ tay và gripper, nhưng việc biến lời nói “gấp chiếc áo này” thành hàng trăm lệnh điều khiển vẫn rất khó.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Robot-only BC thiếu dữ liệu quy mô và khó mở rộng ra nhiều thiết bị.. Thay đổi trọng tâm là: Dual-system architecture chia việc theo bản chất. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. System 2 mã hóa image/language thành condition; System 1 là flow-based action expert sinh quỹ đạo.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

**Mô hình thị giác-ngôn ngữ (VLM)** học biểu diễn từ hình ảnh và text. Nó mạnh ở bối cảnh understanding, nhận dạng vật thể, chỉ dẫn following nhưng không tự có quỹ đạo control prior chính xác. **Diffusion/flow action policy** học phân phối nhiều quỹ đạo liên tục khả thi từ demonstrations; một quan sát có thể tương ứng nhiều cách grasp khác nhau. **Action chunk** là tensor `A ∈ R^{H × D}`, trong đó H là số bước tương lai dự đoán, D là action dimensions; không phải một token duy nhất.

**Pretraining** nhằm tích lũy biểu diễn/hành vi priors từ nhiều nguồn. **Post-training** thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì thành công ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Post-training thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì thành công ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream.

**Khái niệm thành cấu trúc tính toán.** System 2: Visual-language context, không phải chatbot nghĩ thành tiếng. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Post-training thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì thành công ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

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

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/groot-n1/figure-2.webp)

*Hình 2, trang 3. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2503.14734#page=3).*

#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 mới là sơ đồ GR00T N1: thành phần thị giác–ngôn ngữ tạo context, action expert biến context thành trajectory liên tục. System 2 ở đây là mô hình hiểu ảnh/lệnh, không phải lời tự thoại suy luận; System 1 dùng cơ chế sinh action như flow để thực thi. Cần phân biệt action chunk output, điều kiện robot state và quá trình lấy mẫu. Nếu gặp claim về latency, kiểm tra nó tính riêng sampler hay cả encode ảnh và servo loop.

#### Ví dụ từng bước để hiểu cơ chế

Giả sử lệnh là cầm chiếc cốc, đặt lên khay. Bộ phận VLM phải phân biệt đâu là cốc, đâu là khay, đâu là constraint ngôn ngữ; action expert phải tạo đường đi khớp/EEF phù hợp với robot hiện tại. Video người có thể hỗ trợ prior về ngữ cảnh và chuyển động, nhưng không trực tiếp chỉ ra torque của khớp robot. Vì vậy khi huấn luyện và fine-tune cần chọn đúng nguồn supervision, coordinate transform và embodiment adapter. Một chính sách có vẻ hiểu lệnh mà gripper không đóng đúng lúc vẫn không giải được nhiệm vụ.

### Đào sâu: Dual-system architecture chia việc theo bản chất

**Luận điểm.** System 2 mã hóa image/language thành condition; System 1 là flow-based action expert sinh quỹ đạo. Hệ thống 2 dùng VLM encode ảnh và ngôn ngữ thành context, rồi cung cấp context cho Hệ thống 1; Hệ thống 1 là một Transformer chuyên sinh action quỹ đạo bằng quá trình flow-based sinh.

**Giải thích không dùng tên model.** System 2 mã hóa image/language thành condition; System 1 là flow-based action expert sinh quỹ đạo. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** VLM lo hiểu ngữ nghĩa, action expert lo chuyển động: pretraining video người bổ sung kinh nghiệm cho robot. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** VLM lo hiểu ngữ nghĩa, action expert lo chuyển động: pretraining video người bổ sung kinh nghiệm cho robot. Đây là điểm liên hệ mạnh nhất với hoạt động thu headcam video: đầu vào người đa dạng có giá trị, nhưng value phụ thuộc vào filtering, chuyển động/hand state reconstruction và mapping sang biểu diễn mà action expert học được.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Camera + lệnh + state → VLM / System 2 → Flow action expert / System 1 → Quỹ đạo H × D. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Đây là điểm liên hệ mạnh nhất với hoạt động thu headcam video: đầu vào người đa dạng có giá trị, nhưng value phụ thuộc vào filtering, chuyển động/hand state reconstruction và mapping sang biểu diễn mà action expert học được. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Thông tin robot state, embodiment và images được đưa vào condition. Vì action quỹ đạo bao gồm nhiều bước, mô hình có thể phối hợp chuyển động tay trái/tay phải và giữ tính liên tục về thời gian trong chunk.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Output là continuous action chunk, không phải token text. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Vì action quỹ đạo bao gồm nhiều bước, mô hình có thể phối hợp chuyển động tay trái/tay phải và giữ tính liên tục về thời gian trong chunk. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Mixture robot demonstrations, video con người và vision-language data. Một mạng đã pretrain chưa hiểu chắc robot target. Post-training dùng demonstrations đặc thù để calibrate action scaling, gripper convention, camera viewpoint và kinematics.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Flow matching học biến noisy action thành motor trajectory. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Một mạng đã pretrain chưa hiểu chắc robot target. Post-training dùng demonstrations đặc thù để calibrate action scaling, gripper convention, camera viewpoint và kinematics. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** So pretraining + adaptation với train từ đầu ở từng demo budget. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Tưởng tượng chuyển từ nhiễu ε sang một trajectory A*: flow model học hướng di chuyển trong không gian action. Ở inference, bắt đầu noise, tích phân qua nhiều flow time steps để lấy một plausible chunk.

$$
A_\tau=(1-\tau)\epsilon+\tau A^\star
$$

**Công thức đang mô tả thứ gì?** Tưởng tượng chuyển từ nhiễu ε sang một trajectory A*: flow model học hướng di chuyển trong không gian action. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Ở inference, bắt đầu noise, tích phân qua nhiều flow time steps để lấy một plausible chunk. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Cách viết intuition của linear flow interpolation. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử robot hai tay cần **gấp áo trên bàn**. Observation ban đầu cho thấy hai mép áo lệch vị trí; chỉ dẫn “fold the shirt” xác định mục tiêu. VLM trích xuất context gồm áo, bàn, tay robot và từ khóa nhiệm vụ. Action expert lấy robot trạng thái khớp hiện tại, sampled action noise và context rồi sinh chunk chứa các bước đưa hai tay xuống, kẹp mép, kéo và đặt. Robot thực thi một phần, observe lại và sinh chunk mới. Nếu áo trượt, đầu ra cần thay đổi dựa trên khung hình mới.

Với video con người, ta có thể thấy người nắm mép áo và fold theo cách tương tự, nhưng **tay người không đồng nghĩa với gripper action**. Representation phải tách ngữ nghĩa/theo thời gian structure dùng chung khỏi chi tiết chuyển động bộ điều khiển phụ thuộc embodiment. Đây là lý do biểu diễn action và quy trình xử lý dữ liệu đáng học ngang kiến trúc VLM.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** System 2 xử lý ngữ nghĩa và context ảnh. VLM trích xuất context gồm áo, bàn, tay robot và từ khóa nhiệm vụ. Action expert lấy robot trạng thái khớp hiện tại, sampled action noise và context rồi sinh chunk chứa các bước đưa hai tay xuống, kẹp mép, kéo và đặt.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: System 1 chạy vài bước flow sampling để sinh chunk. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. VLM trích xuất context gồm áo, bàn, tay robot và từ khóa nhiệm vụ. Action expert lấy robot trạng thái khớp hiện tại, sampled action noise và context rồi sinh chunk chứa các bước đưa hai tay xuống, kẹp mép, kéo và đặt. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Robot servo thực thi chunk; độ trễ còn phụ thuộc phần cứng và runtime. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo đánh giá nhiều môi trường mô phỏng và trên humanoid thật. Phần công bố báo GR00T N1 đã pretrain thường tốt hơn các phương pháp imitation learning đối chứng được huấn luyện từ đầu ở những chế độ ít demonstrations, và cho thấy adaptation trên Fourier GR-1. **Table 2** so sánh mô phỏng theo số demonstrations, **Table 3** là các nhiệm vụ trên GR-1 ngoài đời thực. Abstract không có nghĩa policy có thể làm mọi việc zero-shot; cần đọc từng nhiệm vụ, metric, split và lượng dữ liệu post-training.

Bài báo cũng nêu phiên bản GR00T N1-2B gồm khoảng 2B parameters và độ trễ sampled chunk khoảng 63.9 ms trên một GPU L40 trong thiết lập được báo cáo. Đây là measurement của một cấu hình cụ thể, không phải realtime guarantee trên consumer GPU và mọi robot. Vì vậy khi so hiệu năng với Qwen-VLA hoặc π0.5, bắt buộc giữ cố định nhiệm vụ, benchmark và target phần cứng.

**Một cách đọc kết quả có trách nhiệm:** xem biểu đồ pretraining vs scratch theo từng dữ liệu regime. Nếu gain lớn ở 30 demos nhưng nhỏ dần ở 300 demos, đóng góp nổi bật là dữ liệu efficiency, chưa chắc policy ceiling cao hơn trong mọi trường hợp.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Pretrain rồi adapt cho thấy lợi ích khi số demos đích ít hơn. Bài báo đánh giá nhiều môi trường mô phỏng và trên humanoid thật. Phần công bố báo GR00T N1 đã pretrain thường tốt hơn các phương pháp imitation learning đối chứng được huấn luyện từ đầu ở những chế độ ít demonstrations, và cho thấy adaptation trên Fourier GR-1.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Báo cáo GR00T N1-2B khoảng 2B parameters. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Bài báo đánh giá nhiều môi trường mô phỏng và trên humanoid thật. Phần công bố báo GR00T N1 đã pretrain thường tốt hơn các phương pháp imitation learning đối chứng được huấn luyện từ đầu ở những chế độ ít demonstrations, và cho thấy adaptation trên Fourier GR-1. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Chunk sampling khoảng 63,9 ms trên một GPU L40 trong setup cụ thể của bài báo. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** So pretraining + adaptation với train từ đầu ở từng demo budget. Một cách đọc kết quả có trách nhiệm: xem biểu đồ pretraining vs scratch theo từng dữ liệu regime.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Cần tách gain do architecture khỏi gain do tuyển lọc data mixture. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Một cách đọc kết quả có trách nhiệm: xem biểu đồ pretraining vs scratch theo từng dữ liệu regime. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Một cách đọc kết quả có trách nhiệm: xem biểu đồ pretraining vs scratch theo từng dữ liệu regime. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Phạm vi tác giả thể hiện:** Kết quả tập trung trên các embodiment/nhiệm vụ đã chọn; foundation policy vẫn cần post-training cho phần cứng/kỹ năng cụ thể. Video con người không tự giải quyết việc ánh xạ sang robot actions. Tập dữ liệu mixture và huấn luyện vẫn rất lớn, ít phòng thí nghiệm có thể tái lập toàn bộ pipeline.

**Phê bình độc lập:**

- **Bottleneck dữ liệu ẩn sau kiến trúc:** lượng dữ liệu và bộ lọc tạo ra hành vi prior có thể quyết định hiệu năng hơn một lựa chọn attention block; nếu không có ablation kiểm soát chặt giữa pipeline dữ liệu, khó quy công riêng cho Hệ thống 1/Hệ thống 2.
- **Robot-specific bias:** test có thể nằm gần morphology và phân phối nhiệm vụ post-training. Cross-embodiment claim cần split khó hơn: phần cứng mới, contact mô hình khác và các loại vật thể mới đồng thời.
- **Tỷ lệ thành công che lỗi động học:** hoàn thành nhiệm vụ không luôn đo continuity, velocity spike, collision margin hay safety. Khi độ trễ inference dao động, một policy chunking cần runtime tốt, không chỉ validation loss tốt.
- **Physics reasoning chưa được chứng minh:** hiệu năng có thể đến từ pattern matching các quỹ đạo; mô hình không nhất thiết đã học nhân quả vật lý đủ dùng để lập kế hoạch dài.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Phạm vi tác giả thể hiện: Kết quả tập trung trên các embodiment/nhiệm vụ đã chọn; foundation policy vẫn cần post-training cho phần cứng/kỹ năng cụ thể.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: vẫn cần post-training; human video không tự tạo ra action labels tương đương robot. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Phạm vi tác giả thể hiện: Kết quả tập trung trên các embodiment/nhiệm vụ đã chọn; foundation policy vẫn cần post-training cho phần cứng/kỹ năng cụ thể. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: success rate không bao gồm mọi jerk/collision, và bài toán mapping cross-embodiment còn mở. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [RT-2](/paper/rt-2) đi từ VLM sang action tokens; GR00T tách liên tục generative action expert.
- [Diffusion Policy](/paper/diffusion-policy) cung cấp mô hình tư duy về denoising action chuỗi.
- [Open X-Embodiment](/paper/open-x-embodiment) giúp hiểu lý do và thách thức của hỗn hợp dữ liệu đa morphology.
- [Qwen-VLA](/paper/qwen-vla) dùng cùng bài toán multi-embodiment nhưng có embodiment-conditioned prompts và DiT action liên tục head.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) mở rộng theo hướng sparse MoE, whole-body action vector và predictive động lực học tín hiệu giám sát.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RT-2, Diffusion Policy, Open X-Embodiment, Qwen-VLA, LingBot-VLA 2.0. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: π0.5 cũng kết hợp vision-language condition và flow action expert. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: LingBot-VLA 2.0 thêm action canonicalization, sparse MoE và predictive features. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RT-2, Diffusion Policy, Open X-Embodiment, Qwen-VLA, LingBot-VLA 2.0. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Bắt đầu từ [NVIDIA Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T). Trước khi huấn luyện, đọc `observation` schema, normalization và policy đầu vào/đầu ra shapes; lập một bảng `robot state / image / language / action`. Chạy một inference example, log shape trước và sau VLM và action expert; thay khung hình nhưng giữ chỉ dẫn để xem đầu ra thay đổi, rồi làm ngược lại. Mục tiêu không phải một lần chạy thành công, mà là **biết chính xác dữ liệu đi qua subsystem nào và action về robot được diễn giải ra sao**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Tách ngữ nghĩa khỏi motor generation là cấu trúc hữu ích. Bắt đầu từ NVIDIA Isaac GR00T. Trước khi huấn luyện, đọc observation schema, normalization và policy đầu vào/đầu ra shapes; lập một bảng robot state / image / language / action.

**Chọn điều cần mang sang dự án thật.** Dùng GR00T để nghiên cứu robot+human video pretraining. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Tách ngữ nghĩa khỏi motor generation là cấu trúc hữu ích.

**Tái hiện tối thiểu.** Bắt đầu từ NVIDIA Isaac GR00T. Trước khi huấn luyện, đọc observation schema, normalization và policy đầu vào/đầu ra shapes; lập một bảng robot state / image / language / action. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Không thể copy khớp của con người angles sang robot joints một cách trực tiếp. Do đó bài toán của GR00T N1 là: làm sao tận dụng đa nguồn dữ liệu để xây dựng một policy có khả năng hiểu ngữ nghĩa lẫn khả năng sinh liên tục motor actions, sau đó thích nghi nhanh cho robot thật? Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Robot demonstrations đắt, đa embodiment khó cùng huấn luyện: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Robot demonstrations đắt, đa embodiment khó cùng huấn luyện', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Truyền thống, mỗi robot/nhiệm vụ được huấn luyện bằng behavior cloning trên một tập demonstrations tương ứng. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### VLM giỏi nghĩa nhưng không sẵn sàng điều khiển khớp: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'VLM giỏi nghĩa nhưng không sẵn sàng điều khiển khớp', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Robot humanoid có thể sở hữu camera, hai cánh tay, thân, cổ tay và gripper, nhưng việc biến lời nói “gấp chiếc áo này” thành hàng trăm lệnh điều khiển vẫn rất khó. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Dual-system architecture chia việc theo bản chất: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Dual-system architecture chia việc theo bản chất', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Hệ thống 2 dùng VLM encode ảnh và ngôn ngữ thành context, rồi cung cấp context cho Hệ thống 1; Hệ thống 1 là một Transformer chuyên sinh action quỹ đạo bằng quá trình flow-based sinh. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ba khái niệm để nắm: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ba khái niệm để nắm', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Post-training thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì thành công ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kiến trúc trong một sơ đồ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kiến trúc trong một sơ đồ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đây là điểm liên hệ mạnh nhất với hoạt động thu headcam video: đầu vào người đa dạng có giá trị, nhưng value phụ thuộc vào filtering, chuyển động/hand state reconstruction và mapping sang biểu diễn mà action expert học được. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mô hình biểu diễn cái gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mô hình biểu diễn cái gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Vì action quỹ đạo bao gồm nhiều bước, mô hình có thể phối hợp chuyển động tay trái/tay phải và giữ tính liên tục về thời gian trong chunk. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model học như thế nào?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model học như thế nào?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Một mạng đã pretrain chưa hiểu chắc robot target. Post-training dùng demonstrations đặc thù để calibrate action scaling, gripper convention, camera viewpoint và kinematics. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một lần inference xảy ra ra sao?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một lần inference xảy ra ra sao?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. VLM trích xuất context gồm áo, bàn, tay robot và từ khóa nhiệm vụ. Action expert lấy robot trạng thái khớp hiện tại, sampled action noise và context rồi sinh chunk chứa các bước đưa hai tay xuống, kẹp mép, kéo và đặt. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mathematical Intuition: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mathematical Intuition', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Ở inference, bắt đầu noise, tích phân qua nhiều flow time steps để lấy một plausible chunk. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kết quả nói lên điều gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kết quả nói lên điều gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Bài báo đánh giá nhiều môi trường mô phỏng và trên humanoid thật. Phần công bố báo GR00T N1 đã pretrain thường tốt hơn các phương pháp imitation learning đối chứng được huấn luyện từ đầu ở những chế độ ít demonstrations, và cho thấy adaptation trên Fourier GR-1. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ablation và bằng chứng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ablation và bằng chứng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Một cách đọc kết quả có trách nhiệm: xem biểu đồ pretraining vs scratch theo từng dữ liệu regime. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Hạn chế cần nói thẳng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Hạn chế cần nói thẳng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Phạm vi tác giả thể hiện: Kết quả tập trung trên các embodiment/nhiệm vụ đã chọn; foundation policy vẫn cần post-training cho phần cứng/kỹ năng cụ thể. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Bài này đứng ở đâu trong lĩnh vực?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Bài này đứng ở đâu trong lĩnh vực?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đọc thêm RT-2, Diffusion Policy, Open X-Embodiment, Qwen-VLA, LingBot-VLA 2.0. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Nếu chỉ nhớ ba điều: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Nếu chỉ nhớ ba điều', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Bắt đầu từ NVIDIA Isaac GR00T. Trước khi huấn luyện, đọc observation schema, normalization và policy đầu vào/đầu ra shapes; lập một bảng robot state / image / language / action. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Điểm cốt lõi: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. VLM lo hiểu ngữ nghĩa, action expert lo chuyển động: pretraining video người bổ sung kinh nghiệm cho robot. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Robot demonstrations đắt, đa embodiment khó cùng huấn luyện: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Một mô hình vừa phải hiểu nhiệm vụ vừa phải phát lệnh motor liên tục, nhưng hai phần có demands khác nhau. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### VLM giỏi nghĩa nhưng không sẵn sàng điều khiển khớp: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Robot-only BC thiếu dữ liệu quy mô và khó mở rộng ra nhiều thiết bị. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Dual-system architecture chia việc theo bản chất: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. System 2 mã hóa image/language thành condition; System 1 là flow-based action expert sinh quỹ đạo. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ba khái niệm để nắm: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Hiểu ba khái niệm này trước khi đọc thuật toán. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kiến trúc trong một sơ đồ: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. VLM lo hiểu ngữ nghĩa, action expert lo chuyển động: pretraining video người bổ sung kinh nghiệm cho robot. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mô hình biểu diễn cái gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Thông tin robot state, embodiment và images được đưa vào condition. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Model học như thế nào?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Mixture robot demonstrations, video con người và vision-language data. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Một lần inference xảy ra ra sao?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. System 2 xử lý ngữ nghĩa và context ảnh. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mathematical Intuition: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Tưởng tượng chuyển từ nhiễu ε sang một trajectory A*: flow model học hướng di chuyển trong không gian action. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kết quả nói lên điều gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Pretrain rồi adapt cho thấy lợi ích khi số demos đích ít hơn. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ablation và bằng chứng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. So pretraining + adaptation với train từ đầu ở từng demo budget. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Hạn chế cần nói thẳng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Bài này đứng ở đâu trong lĩnh vực?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Không đọc paper như một hòn đảo riêng. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Nếu chỉ nhớ ba điều: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Tách ngữ nghĩa khỏi motor generation là cấu trúc hữu ích. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Điểm cốt lõi: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Không thể copy khớp của con người angles sang robot joints một cách trực tiếp. Do đó bài toán của GR00T N1 là: làm sao tận dụng đa nguồn dữ liệu để xây dựng một policy có khả năng hiểu ngữ nghĩa lẫn khả năng sinh liên tục motor actions, sau đó thích nghi nhanh cho robot thật? Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Robot demonstrations đắt, đa embodiment khó cùng huấn luyện: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Truyền thống, mỗi robot/nhiệm vụ được huấn luyện bằng behavior cloning trên một tập demonstrations tương ứng. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### VLM giỏi nghĩa nhưng không sẵn sàng điều khiển khớp: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Robot humanoid có thể sở hữu camera, hai cánh tay, thân, cổ tay và gripper, nhưng việc biến lời nói “gấp chiếc áo này” thành hàng trăm lệnh điều khiển vẫn rất khó. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Dual-system architecture chia việc theo bản chất: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Hệ thống 2 dùng VLM encode ảnh và ngôn ngữ thành context, rồi cung cấp context cho Hệ thống 1; Hệ thống 1 là một Transformer chuyên sinh action quỹ đạo bằng quá trình flow-based sinh. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Ba khái niệm để nắm: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Post-training thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì thành công ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Kiến trúc trong một sơ đồ: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Đây là điểm liên hệ mạnh nhất với hoạt động thu headcam video: đầu vào người đa dạng có giá trị, nhưng value phụ thuộc vào filtering, chuyển động/hand state reconstruction và mapping sang biểu diễn mà action expert học được. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Mô hình biểu diễn cái gì?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Vì action quỹ đạo bao gồm nhiều bước, mô hình có thể phối hợp chuyển động tay trái/tay phải và giữ tính liên tục về thời gian trong chunk. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

<!-- END EXTENDED WALKTHROUGH -->
