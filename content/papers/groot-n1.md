> **Bài do bạn cung cấp.** Bản gốc: [GR00T N1, arXiv:2503.14734](https://arxiv.org/abs/2503.14734). Đọc cùng sơ đồ kiến trúc ở **Figure 3** và bảng kết quả thực nghiệm ở **Section 4**. Bài giải thích dưới đây phân biệt những gì tác giả chứng minh với suy luận kỹ thuật.

## Vì sao cần nghiên cứu này?

### Một mô hình biết nhìn chưa chắc biết điều khiển

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 7](/paper-figures/groot-n1/figure-5.webp)
![Hình 6 từ PDF gốc, trang 10](/paper-figures/groot-n1/figure-6.webp)
![Hình 14 từ PDF gốc, trang 25](/paper-figures/groot-n1/figure-14.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Robot humanoid có thể sở hữu camera, hai cánh tay, thân, cổ tay và gripper, nhưng việc biến lời nói “gấp chiếc áo này” thành hàng trăm lệnh điều khiển vẫn rất khó. Truyền thống, mỗi robot/nhiệm vụ được huấn luyện bằng behavior cloning trên một tập demonstrations tương ứng. Cách này đắt: tạo một kỹ năng mới lại cần thu video, ghi joint actions, tune policy, sửa integration. Trong khi đó, trên Internet có vô số video con người thao tác, và VLM đã học được rất nhiều tri thức về vật, bối cảnh và ngôn ngữ.

Robot hình người có thể học điều gì từ video người? Người có bàn tay năm ngón, còn một robot có thể chỉ dùng kẹp hai ngón; chiều dài tay, giới hạn khớp và cách cảm nhận thế giới cũng khác nhau. Vì thế không thể lấy nguyên góc khớp người rồi gửi xuống robot. **GR00T N1 tìm cách tận dụng nhiều nguồn dữ liệu để học cả cách hiểu nhiệm vụ lẫn cách tạo hành động phù hợp với từng loại robot.** Công trình chia việc thành phần xử lý ảnh và ngôn ngữ cùng phần chuyên sinh chuyển động, rồi kiểm tra khả năng thích nghi với robot thật.

NVIDIA chọn kiến trúc hai hệ thống: một phần hiểu thông tin và một phần tạo chuyển động. Đây là lời đáp thực dụng cho câu hỏi “VLM lớn có đủ để trực tiếp điều khiển robot không?”: tác giả không bắt text decoder gánh mọi thứ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/groot-n1/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là tháp dữ liệu, không phải sơ đồ network. Ở đáy có những nguồn nhiều nhưng không mang đầy đủ action label robot; phía trên là các loại dữ liệu gần nhiệm vụ và embodiment hơn, thường đắt hơn. Ý tưởng cốt lõi: không thể đòi mọi video người ngoài đời cung cấp joint torque của một humanoid. Mỗi tầng dữ liệu nên cung cấp tín hiệu supervision phù hợp với thứ thực sự quan sát được. Đó là lý do cần đọc data recipe song song với kiến trúc dual-system.

### Vì sao robot hình người không thể chỉ học từ một tập demonstration nhỏ?

Robot hai tay, robot di động và robot hình người có số khớp, kiểu kẹp và cảm biến rất khác nhau. Thu hàng triệu lượt thực hành đúng với mỗi phần cứng sẽ cực kỳ tốn kém. GR00T N1 tìm cách khai thác nhiều tầng dữ liệu: video người dễ thu, video tạo tổng hợp, demonstration robot nhiều loại và dữ liệu chi tiết của robot mục tiêu.

Bài toán không đơn giản là “mô hình nhìn video rồi bắt chước tay người”. Video người có thể giúp hiểu thứ tự và mục tiêu chuyển động, nhưng lệnh motor vẫn phải thích ứng với cấu trúc robot. Vì vậy GR00T có phần xử lý ảnh/câu lệnh và phần chuyên sinh hành động vận động.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

**Mô hình thị giác-ngôn ngữ (VLM)** học biểu diễn từ hình ảnh và text. Nó mạnh ở bối cảnh understanding, nhận dạng vật thể, chỉ dẫn following nhưng không tự có quỹ đạo control prior chính xác. **Diffusion/flow action policy** học phân phối nhiều quỹ đạo liên tục khả thi từ demonstrations; một quan sát có thể tương ứng nhiều cách grasp khác nhau. **Action chunk** là tensor `A ∈ R^{H × D}`, trong đó H là số bước tương lai dự đoán, D là action dimensions; không phải một token duy nhất.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/groot-n1/figure-3.webp)
![Hình 4 từ PDF gốc, trang 6](/paper-figures/groot-n1/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
**Pretraining** nhằm tích lũy biểu diễn/hành vi priors từ nhiều nguồn. **Post-training** thích nghi vào robot và nhiệm vụ đích bằng demonstrations chuyên biệt. Hai bước này cần phân biệt vì thành công ở robot cuối không chỉ do foundation pretraining, mà còn do dữ liệu và setup ở downstream.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tách hiểu cảnh khỏi tạo chuyển động

Trong GR00T N1, **VLM** đọc ảnh và lệnh để hình thành biểu diễn ngữ nghĩa: vật cần nhặt là gì, mục tiêu ở đâu. **Action expert** dùng thông tin ấy, cùng trạng thái khớp và loại robot, để dự đoán chuyển động. Action expert được xây bằng Diffusion Transformer; nó sinh hành động chứ không viết câu trả lời cho người dùng.

**Biểu diễn nhận biết robot** giúp phần sinh lệnh hiểu đang điều khiển cánh tay đơn hay hệ hai tay nhiều khớp. Hai robot có thể chia sẻ ý tưởng “dịch tay sang trái”, nhưng góc khớp cụ thể không giống nhau. Đó là lý do mạng có bộ mã hóa riêng cho trạng thái và hành động theo từng cấu trúc.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

### 1. Kiến trúc dual-system

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 8 từ PDF gốc, trang 13](/paper-figures/groot-n1/figure-8.webp)
![Hình 11 từ PDF gốc, trang 21](/paper-figures/groot-n1/figure-11.webp)
![Hình 12 từ PDF gốc, trang 21](/paper-figures/groot-n1/figure-12.webp)

<!-- END ADDITIONAL PDF FIGURES -->
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


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 mới là sơ đồ GR00T N1: thành phần thị giác–ngôn ngữ tạo context, action expert biến context thành trajectory liên tục. System 2 ở đây là mô hình hiểu ảnh/lệnh, không phải lời tự thoại suy luận; System 1 dùng cơ chế sinh action như flow để thực thi. Cần phân biệt action chunk output, điều kiện robot state và quá trình lấy mẫu. Nếu gặp claim về latency, kiểm tra nó tính riêng sampler hay cả encode ảnh và servo loop.

#### Ví dụ từng bước để hiểu cơ chế

Giả sử lệnh là cầm chiếc cốc, đặt lên khay. Bộ phận VLM phải phân biệt đâu là cốc, đâu là khay, đâu là constraint ngôn ngữ; action expert phải tạo đường đi khớp/EEF phù hợp với robot hiện tại. Video người có thể hỗ trợ prior về ngữ cảnh và chuyển động, nhưng không trực tiếp chỉ ra torque của khớp robot. Vì vậy khi huấn luyện và fine-tune cần chọn đúng nguồn supervision, coordinate transform và embodiment adapter. Một chính sách có vẻ hiểu lệnh mà gripper không đóng đúng lúc vẫn không giải được nhiệm vụ.

### Những gì diễn ra từ câu lệnh đến lệnh motor

Giả sử câu lệnh là “chuyển quả táo từ tay trái sang tay phải rồi đặt vào giỏ”. Camera ghi cảnh và trạng thái khớp ghi vị trí hiện tại. Mô hình VLM Eagle-2 biến ảnh/câu lệnh thành đặc trưng, sau đó chuyển thông tin liên quan sang các khối DiT bằng chú ý chéo.

Action expert nhận thêm biểu diễn trạng thái của robot và chuỗi hành động nhiễu, liên tục chỉnh chuỗi cho tới khi tạo ra đoạn lệnh vận động. Lệnh cần được chuyển về đúng dạng phần cứng thực thi. Robot nhận quan sát mới khi di chuyển. Mạng ngữ nghĩa giúp chọn việc cần làm; bộ sinh hành động mới quyết định quỹ đạo thực tế.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử robot hai tay cần **gấp áo trên bàn**. Observation ban đầu cho thấy hai mép áo lệch vị trí; chỉ dẫn “fold the shirt” xác định mục tiêu. VLM trích xuất context gồm áo, bàn, tay robot và từ khóa nhiệm vụ. Action expert lấy robot trạng thái khớp hiện tại, sampled action noise và context rồi sinh chunk chứa các bước đưa hai tay xuống, kẹp mép, kéo và đặt. Robot thực thi một phần, observe lại và sinh chunk mới. Nếu áo trượt, đầu ra cần thay đổi dựa trên khung hình mới.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 7 từ PDF gốc, trang 11](/paper-figures/groot-n1/figure-7.webp)
![Hình 13 từ PDF gốc, trang 22](/paper-figures/groot-n1/figure-13.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Với video con người, ta có thể thấy người nắm mép áo và fold theo cách tương tự, nhưng **tay người không đồng nghĩa với gripper action**. Representation phải tách ngữ nghĩa/theo thời gian structure dùng chung khỏi chi tiết chuyển động bộ điều khiển phụ thuộc embodiment. Đây là lý do biểu diễn action và quy trình xử lý dữ liệu đáng học ngang kiến trúc VLM.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ hai tay chuyền quả táo

Robot đang giữ táo bằng tay trái, tay phải phải đưa tới đúng vị trí, kẹp chắc rồi tay trái mới thả. Một mạng chỉ biết “đưa táo vào giỏ” chưa đủ nếu không dự đoán đúng thứ tự phối hợp hai tay. Hình 11 cho thấy một ví dụ robot chưa tinh chỉnh vẫn hoàn thành chuyển tay trong bố cục mới, nhưng chuyển động còn giật.

Điều này cho thấy kiến thức từ giai đoạn huấn luyện rộng có thể hữu ích trước khi học riêng nhiệm vụ. Tuy nhiên một lượt thành công mang tính minh họa chưa thay thế đánh giá trên nhiều vị trí, vật và số lượt thử.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo đánh giá nhiều môi trường mô phỏng và trên humanoid thật. Phần công bố báo GR00T N1 đã pretrain thường tốt hơn các phương pháp imitation learning đối chứng được huấn luyện từ đầu ở những chế độ ít demonstrations, và cho thấy adaptation trên Fourier GR-1. **Table 2** so sánh mô phỏng theo số demonstrations, **Table 3** là các nhiệm vụ trên GR-1 ngoài đời thực. Abstract không có nghĩa policy có thể làm mọi việc zero-shot; cần đọc từng nhiệm vụ, metric, split và lượng dữ liệu post-training.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 9 từ PDF gốc, trang 16](/paper-figures/groot-n1/figure-9.webp)
![Hình 10 từ PDF gốc, trang 20](/paper-figures/groot-n1/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Bài báo cũng nêu phiên bản GR00T N1-2B gồm khoảng 2B parameters và độ trễ sampled chunk khoảng 63.9 ms trên một GPU L40 trong thiết lập được báo cáo. Đây là measurement của một cấu hình cụ thể, không phải realtime guarantee trên consumer GPU và mọi robot. Vì vậy khi so hiệu năng với Qwen-VLA hoặc π0.5, bắt buộc giữ cố định nhiệm vụ, benchmark và target phần cứng.

**Một cách đọc kết quả có trách nhiệm:** xem biểu đồ pretraining vs scratch theo từng dữ liệu regime. Nếu gain lớn ở 30 demos nhưng nhỏ dần ở 300 demos, đóng góp nổi bật là dữ liệu efficiency, chưa chắc policy ceiling cao hơn trong mọi trường hợp.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Dữ liệu video tổng hợp thực sự giúp gì?

Hình 5 và Hình 13 trình bày các video được mô hình sinh từ ảnh ban đầu cùng prompt thay đổi. Mục tiêu là tạo thêm quỹ đạo/hình ảnh cho những việc khó hoặc đắt nếu phải quay bằng robot thật. Có thể tạo các góc nhìn khác nhau, thay vật thể hoặc nối nhiều đoạn thành nhiệm vụ dài.

Hình 9 kiểm tra riêng việc bổ sung quỹ đạo sinh ở các chế độ dữ liệu ít/nhiều. Điều quan trọng là video tổng hợp không tự có nhãn hành động robot chính xác; cần suy ra lệnh bằng phương pháp phù hợp, chẳng hạn mô hình động học ngược, và xác minh chất lượng. Nếu nhãn sai, thêm dữ liệu còn có thể làm policy kém.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Phạm vi tác giả thể hiện:** Kết quả tập trung trên các embodiment/nhiệm vụ đã chọn; foundation policy vẫn cần post-training cho phần cứng/kỹ năng cụ thể. Video con người không tự giải quyết việc ánh xạ sang robot actions. Tập dữ liệu mixture và huấn luyện vẫn rất lớn, ít phòng thí nghiệm có thể tái lập toàn bộ pipeline.

**Phê bình độc lập:**

- **Bottleneck dữ liệu ẩn sau kiến trúc:** lượng dữ liệu và bộ lọc tạo ra hành vi prior có thể quyết định hiệu năng hơn một lựa chọn attention block; nếu không có ablation kiểm soát chặt giữa pipeline dữ liệu, khó quy công riêng cho Hệ thống 1/Hệ thống 2.
- **Robot-specific bias:** test có thể nằm gần morphology và phân phối nhiệm vụ post-training. Cross-embodiment claim cần split khó hơn: phần cứng mới, contact mô hình khác và các loại vật thể mới đồng thời.
- **Tỷ lệ thành công che lỗi động học:** hoàn thành nhiệm vụ không luôn đo continuity, velocity spike, collision margin hay safety. Khi độ trễ inference dao động, một policy chunking cần runtime tốt, không chỉ validation loss tốt.
- **Physics reasoning chưa được chứng minh:** hiệu năng có thể đến từ pattern matching các quỹ đạo; mô hình không nhất thiết đã học nhân quả vật lý đủ dùng để lập kế hoạch dài.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những điều chưa nên suy rộng

Robot hình người phải thỏa các ràng buộc cân bằng, tiếp xúc, giới hạn lực và an toàn mà dữ liệu video đơn thuần không mô tả đầy đủ. Khả năng vận động tay tốt trong một vài nhiệm vụ chưa có nghĩa robot tự giữ thăng bằng và làm được mọi việc nhà.

Các loại dữ liệu khác nhau cũng có độ tin cậy khác nhau. Video tạo sinh có thể chứa chuyển động không tuân theo vật lý; demonstration thật thì hiếm. Kết quả cần xem cả nguồn dữ liệu, loại robot thử và điều kiện khởi tạo, không chỉ tổng số giờ huấn luyện.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [RT-2](/paper/rt-2) đi từ VLM sang action tokens; GR00T tách liên tục generative action expert.
- [Diffusion Policy](/paper/diffusion-policy) cung cấp mô hình tư duy về denoising action chuỗi.
- [Open X-Embodiment](/paper/open-x-embodiment) giúp hiểu lý do và thách thức của hỗn hợp dữ liệu đa morphology.
- [Qwen-VLA](/paper/qwen-vla) dùng cùng bài toán multi-embodiment nhưng có embodiment-conditioned prompts và DiT action liên tục head.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) mở rộng theo hướng sparse MoE, whole-body action vector và predictive động lực học tín hiệu giám sát.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### So với PaLM-E, RDT và π0.5

PaLM-E tập trung đưa cảm giác từ thế giới thật vào suy luận đa phương thức. RDT chú trọng sinh đoạn hành động phối hợp hai tay bằng DiT. GR00T N1 dùng thiết kế hai phần: VLM hiểu cảnh và action expert sinh chuyển động, đồng thời trộn nhiều loại dữ liệu để học robot khác nhau.

π0.5 cũng quan tâm nguồn dữ liệu đa dạng và phân tầng nhiệm vụ dài, nhưng quy trình học và đối tượng đánh giá khác. Khi so, phải hỏi từng mạng đang dùng dữ liệu nào và có phải huấn luyện bổ sung cho robot đích không.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Bắt đầu từ [NVIDIA Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T). Trước khi huấn luyện, đọc `observation` schema, normalization và policy đầu vào/đầu ra shapes; lập một bảng `robot state / image / language / action`. Chạy một inference example, log shape trước và sau VLM và action expert; thay khung hình nhưng giữ chỉ dẫn để xem đầu ra thay đổi, rồi làm ngược lại. Mục tiêu không phải một lần chạy thành công, mà là **biết chính xác dữ liệu đi qua subsystem nào và action về robot được diễn giải ra sao**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Cách tự phân tích sơ đồ GR00T N1

Vẽ hai ô: phần hiểu ảnh/câu lệnh và phần sinh lệnh vận động. Từ đó đặt trạng thái robot, ảnh camera, câu lệnh và hành động nhiễu vào đúng vị trí đầu vào. Tiếp theo chỉ ra tại sao cần mã hóa khác nhau cho robot một tay và hai tay.

Để kiểm chứng giá trị của video tổng hợp, thử so policy được huấn luyện với cùng số demonstration thật, có và không bổ sung video sinh. Đo tỷ lệ hoàn thành trên tình huống chưa gặp. Nếu không giữ số lượt và thiết lập thử tương đương, khó biết lợi ích đến từ đâu.

<!-- END EXTENDED WALKTHROUGH -->

