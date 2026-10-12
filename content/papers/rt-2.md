## Vì sao cần nghiên cứu này?

RT-1 học dữ liệu robot rất tốt nhưng chỉ biết những concept mà robot tập dữ liệu đủ lớn để dạy nó. Dữ liệu robot đắt và ngữ nghĩa coverage nghèo hơn dữ liệu trên web hàng nghìn lần. Trong khi đó VLM đã biết “banana”, “trash”, “Taylor Swift”, spatial ngôn ngữ, loại vật thể và nhiều abstraction khác mà robot có thể chưa từng thấy. RT-2 hỏi câu cực tham vọng: **có thể chuyển giao web-scale vision-language kiến thức thẳng vào action policy, thay vì huấn luyện khả năng hiểu ngữ nghĩa lại bằng robot demonstrations không?**

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rt-2/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là câu trả lời trực quan cho ý tưởng trung tâm của RT-2: action robot có thể biểu diễn như token văn bản trong cùng interface với mô hình vision-language đã học kiến thức trên web. Co-finetuning trộn dữ liệu web và robot để model dùng tri thức nhận biết vật thể/mối quan hệ khi sinh action. Hình này nói về chuyển giao ngữ nghĩa, không chứng minh mô hình tự có kỹ năng motor mới chỉ nhờ đọc văn bản web. Skill vận động vẫn cần supervision từ robot demonstrations.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Tri thức thị giác–ngôn ngữ học trên web có thể chuyển thành lựa chọn action của robot. RT-2 hỏi câu cực tham vọng: có thể chuyển giao web-scale vision-language kiến thức thẳng vào action policy, thay vì huấn luyện khả năng hiểu ngữ nghĩa lại bằng robot demonstrations không?

**Vấn đề khoa học nằm ở đâu?** Một policy chỉ nhìn robot dữ liệu khó hiểu những loại vật thể và mệnh lệnh chưa từng được annotate. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Đối xử action như một dạng token trong VLM là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Co-training VLM tasks và robotics tasks để kiến thức web sống trong policy điều khiển. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Robot demo dạy được kỹ năng nhưng nghèo tri thức ngữ nghĩa

**Luận điểm.** Một policy chỉ nhìn robot dữ liệu khó hiểu những loại vật thể và mệnh lệnh chưa từng được annotate. Dữ liệu robot đắt và ngữ nghĩa coverage nghèo hơn dữ liệu trên web hàng nghìn lần. Trong khi đó VLM đã biết “banana”, “trash”, “Taylor Swift”, spatial ngôn ngữ, loại vật thể và nhiều abstraction khác mà robot có thể chưa từng thấy.

**Tại sao lỗi này có hệ quả lớn?** RT-1 biết thao tác trong các nhiệm vụ đã huấn luyện. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân robot demo dạy được kỹ năng nhưng nghèo tri thức ngữ nghĩa vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: RT-1 biết thao tác trong các nhiệm vụ đã huấn luyện

**Luận điểm.** Nhưng knowledge về vật thể/cấu trúc thế giới kém đa dạng hơn vốn học từ web của VLM. Nếu chỉ fine-tune VLM trên robot action dữ liệu, mô hình dễ quên kiến thức từ web. Nếu chỉ bolt-on một action head, biểu diễn alignment không mạnh bằng việc cùng huấn luyện trong một token interface.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Nhưng knowledge về vật thể/cấu trúc thế giới kém đa dạng hơn vốn học từ web của VLM.. Thay đổi trọng tâm là: Đối xử action như một dạng token trong VLM. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Co-training VLM tasks và robotics tasks để kiến thức web sống trong policy điều khiển.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 3 từ PDF gốc, trang 7](/paper-figures/rt-2/figure-3.webp)


![Hình 8 từ PDF gốc, trang 22](/paper-figures/rt-2/figure-8.webp)


![Hình 9 từ PDF gốc, trang 23](/paper-figures/rt-2/figure-9.webp)


![Hình 10 từ PDF gốc, trang 25](/paper-figures/rt-2/figure-10.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Kiến thức nền cần nắm

RT-1 học image-to-action theo demonstration. VLM đã nhìn lượng ảnh và text rộng hơn robot nhiều bậc độ lớn. RT-2 đưa ra giả thuyết: **web ngữ nghĩa priors** có thể giúp robot hiểu vật thể/mục tiêu chưa được annotate trong robot tập dữ liệu nếu action được biểu diễn chung như đầu ra tokens.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. VLM đã nhìn lượng ảnh và text rộng hơn robot nhiều bậc độ lớn. RT-2 đưa ra giả thuyết: web ngữ nghĩa priors có thể giúp robot hiểu vật thể/mục tiêu chưa được annotate trong robot tập dữ liệu nếu action được biểu diễn chung như đầu ra tokens.

**Khái niệm thành cấu trúc tính toán.** VLM: Mô hình thị giác và ngôn ngữ đã học tri thức web. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. VLM đã nhìn lượng ảnh và text rộng hơn robot nhiều bậc độ lớn. RT-2 đưa ra giả thuyết: web ngữ nghĩa priors có thể giúp robot hiểu vật thể/mục tiêu chưa được annotate trong robot tập dữ liệu nếu action được biểu diễn chung như đầu ra tokens. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RT-2 bắt đầu từ các VLM lớn như PaLI-X/PaLM-E family rồi **co-finetune trên hai loại dữ liệu cùng lúc**: web vision-language dữ liệu và robot các quỹ đạo. Trick đơn giản nhưng quan trọng là robot actions được discretize và biểu diễn như token trong cùng autoregressive vocabulary. Như vậy dự đoán “move x, rotate y, close gripper” về mặt optimization trở thành một dạng ngôn ngữ modeling đặc biệt.

Co-finetuning là chi tiết sống còn. Nếu chỉ fine-tune VLM trên robot action dữ liệu, mô hình dễ quên kiến thức từ web. Nếu chỉ bolt-on một action head, biểu diễn alignment không mạnh bằng việc cùng huấn luyện trong một token interface.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 5](/paper-figures/rt-2/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 tập hợp các ví dụ tình huống RT-2 được kiểm tra khả năng hiểu chỉ dẫn mang tính suy luận hoặc vật thể chưa gặp trong robot data. Các ảnh ví dụ gợi ý cách đánh giá semantic generalization, nhưng khi đọc cần hỏi tập test có bao nhiêu task, cách chọn vật thể, số lần thử và baseline RT-1 được chạy dưới điều kiện nào. Một vài qualitative examples rất có giá trị minh hoạ, song không thể đại diện cho toàn bộ khả năng điều khiển trong môi trường mở.

#### Ví dụ từng bước để hiểu cơ chế

Đưa robot vào cảnh có lon rỗng, khăn và đồ chơi, rồi hỏi 'hãy bỏ rác vào thùng'. VLM biết lon rỗng có thể thuộc nhóm rác; action supervision từ robot dạy thao tác pick/place. Ta kiểm tra trước xem policy chọn đúng vật thể, sau đó mới đo gripper có cầm được lon và đặt vào thùng hay không. Nếu nhận diện đúng nhưng grasp fail, đó là vấn đề motor/geometry chứ không phải semantic reasoning. Để tái hiện, tách evaluation thành seen instructions, novel object semantics và actual manipulation success.

### Đào sâu: Đối xử action như một dạng token trong VLM

**Luận điểm.** Co-training VLM tasks và robotics tasks để kiến thức web sống trong policy điều khiển. Co-finetuning là chi tiết sống còn. Nếu chỉ fine-tune VLM trên robot action dữ liệu, mô hình dễ quên kiến thức từ web.

**Giải thích không dùng tên model.** Co-training VLM tasks và robotics tasks để kiến thức web sống trong policy điều khiển. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Tri thức thị giác–ngôn ngữ học trên web có thể chuyển thành lựa chọn action của robot. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Tri thức thị giác–ngôn ngữ học trên web có thể chuyển thành lựa chọn action của robot. Như vậy dự đoán “move x, rotate y, close gripper” về mặt optimization trở thành một dạng ngôn ngữ modeling đặc biệt.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Web VLM + robot demos → Co-finetune chung → Action tokens → Decode → robot movement. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Như vậy dự đoán “move x, rotate y, close gripper” về mặt optimization trở thành một dạng ngôn ngữ modeling đặc biệt. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Action liên tục được discretize theo dimension rồi token hóa. Trick đơn giản nhưng quan trọng là robot actions được discretize và biểu diễn như token trong cùng autoregressive vocabulary.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Cùng decoder dự đoán từ ngữ và action sequence. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Trick đơn giản nhưng quan trọng là robot actions được discretize và biểu diễn như token trong cùng autoregressive vocabulary. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Trộn robot demonstrations với vision-language web tasks. RT-2 bắt đầu từ các VLM lớn như PaLI-X/PaLM-E family rồi co-finetune trên hai loại dữ liệu cùng lúc: web vision-language dữ liệu và robot các quỹ đạo.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Fine-tune VLM thành VLA trong cùng interface token. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** RT-2 bắt đầu từ các VLM lớn như PaLI-X/PaLM-E family rồi co-finetune trên hai loại dữ liệu cùng lúc: web vision-language dữ liệu và robot các quỹ đạo. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Co-finetuning khác fine-tune robot-only: dữ liệu web giúp giữ priors. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** VLM dự đoán chuỗi action như một chuỗi token được điều kiện hóa bởi ảnh I và lệnh ℓ. Nếu chỉ bolt-on một action head, biểu diễn alignment không mạnh bằng việc cùng huấn luyện trong một token interface.

$$
p_\theta(a_{1:T}\mid I,\ell)
$$

**Công thức đang mô tả thứ gì?** VLM dự đoán chuỗi action như một chuỗi token được điều kiện hóa bởi ảnh I và lệnh ℓ. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Nếu chỉ bolt-on một action head, biểu diễn alignment không mạnh bằng việc cùng huấn luyện trong một token interface. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Biểu thức mô tả khung tự hồi quy, không khẳng định model học được motor skills từ web. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 5 từ PDF gốc, trang 9](/paper-figures/rt-2/figure-5.webp)


![Hình 7 từ PDF gốc, trang 11](/paper-figures/rt-2/figure-7.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Ví dụ từng bước

Yêu cầu robot "bỏ rác vào thùng" trong khi robot demos có pick/place nhưng không có vật thể tên "rác" cụ thể. VLM biết một lon rỗng và giấy vụn liên quan đến khái niệm rác; robotics action tín hiệu giám sát dạy cách pick/place. Khi text/web examples và robot các quỹ đạo co-train, mô hình có thể dùng prior để chọn mục tiêu. Tuy nhiên, chuyển giao ngữ nghĩa không đảm bảo kẹp được vật lạ.

Điểm cần theo dõi trong source code/diagram là các action dimensions được **serialize** thành tokens; loss huấn luyện có thể chia sẻ decoder với đầu ra ngôn ngữ, nhưng vật lý meaning đến từ robot examples.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Nhận ảnh robot và một lệnh ngôn ngữ. Điểm cần theo dõi trong source code/diagram là các action dimensions được serialize thành tokens; loss huấn luyện có thể chia sẻ decoder với đầu ra ngôn ngữ, nhưng vật lý meaning đến từ robot examples.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Sử dụng semantic knowledge từ pretraining để chọn mục tiêu. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Điểm cần theo dõi trong source code/diagram là các action dimensions được serialize thành tokens; loss huấn luyện có thể chia sẻ decoder với đầu ra ngôn ngữ, nhưng vật lý meaning đến từ robot examples. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Sinh action tokens để executor điều khiển thao tác đã học. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên seen nhiệm vụ thao tác, RT-2 vẫn giữ hiệu năng cạnh tranh với RT-1. Điểm thắng nằm ở **vật thể mới, unseen chỉ dẫn và khái quát về ngữ nghĩa**. Bài báo báo hiệu năng khái quát gần **gấp đôi** một số phương pháp đối chứng mạnh và, trong nhóm “emergent suy luận ngữ nghĩa” được thiết kế để test kiến thức từ web chuyển giao, RT-2-PaLI-X đạt tỷ lệ thành công trung bình cao hơn RT-1 nhiều lần, có nhóm hơn **3x**.

Các qualitative examples gây ảnh hưởng lớn vì robot có thể hiểu những concept không xuất hiện rõ trong dữ liệu robot, như chọn vật thể theo ngữ nghĩa category hoặc kết hợp kiến thức từ web với action. Đây là proof-of-concept khiến cả field tin rằng VLM không chỉ làm planner phía trên mà có thể trở thành chính policy backbone.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Generalization với vật thể hoặc lệnh mới mạnh hơn các baseline robot-only. Bài báo báo hiệu năng khái quát gần gấp đôi một số phương pháp đối chứng mạnh và, trong nhóm “emergent suy luận ngữ nghĩa” được thiết kế để test kiến thức từ web chuyển giao, RT-2-PaLI-X đạt tỷ lệ thành công trung bình cao hơn RT-1 nhiều lần, có nhóm hơn 3x.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Một số nhóm emergent semantic reasoning được báo cáo cải thiện trên 3 lần RT-1. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Bài báo báo hiệu năng khái quát gần gấp đôi một số phương pháp đối chứng mạnh và, trong nhóm “emergent suy luận ngữ nghĩa” được thiết kế để test kiến thức từ web chuyển giao, RT-2-PaLI-X đạt tỷ lệ thành công trung bình cao hơn RT-1 nhiều lần, có nhóm hơn 3x. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Kết quả trên các nhóm seen tasks vẫn cạnh tranh với RT-1. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Co-finetuning khác fine-tune robot-only: dữ liệu web giúp giữ priors. Điểm thắng nằm ở vật thể mới, unseen chỉ dẫn và khái quát về ngữ nghĩa. Bài báo báo hiệu năng khái quát gần gấp đôi một số phương pháp đối chứng mạnh và, trong nhóm “emergent suy luận ngữ nghĩa” được thiết kế để test kiến thức từ web chuyển giao, RT-2-PaLI-X đạt tỷ lệ thành công trung bình cao hơn RT-1 nhiều lần, có nhóm hơn 3x.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Semantic gain không chứng minh học được động tác vật lý mới không có trong robot demos. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Điểm thắng nằm ở vật thể mới, unseen chỉ dẫn và khái quát về ngữ nghĩa. Bài báo báo hiệu năng khái quát gần gấp đôi một số phương pháp đối chứng mạnh và, trong nhóm “emergent suy luận ngữ nghĩa” được thiết kế để test kiến thức từ web chuyển giao, RT-2-PaLI-X đạt tỷ lệ thành công trung bình cao hơn RT-1 nhiều lần, có nhóm hơn 3x. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Điểm thắng nằm ở vật thể mới, unseen chỉ dẫn và khái quát về ngữ nghĩa. Bài báo báo hiệu năng khái quát gần gấp đôi một số phương pháp đối chứng mạnh và, trong nhóm “emergent suy luận ngữ nghĩa” được thiết kế để test kiến thức từ web chuyển giao, RT-2-PaLI-X đạt tỷ lệ thành công trung bình cao hơn RT-1 nhiều lần, có nhóm hơn 3x. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 4 từ PDF gốc, trang 8](/paper-figures/rt-2/figure-4.webp)


![Hình 6 từ PDF gốc, trang 10](/paper-figures/rt-2/figure-6.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** kiến thức từ web không tự tạo ra kỹ năng vận động mới. Nếu robot chưa từng học động tác vật lý tương ứng, biết nghĩa của chỉ dẫn không đủ. Inference với VLM lớn cũng gây nút thắt về độ trễ và compute, đặc biệt với control tần số cao.

**Phê bình thêm:** tokenized autoregressive actions là một interface rất tiện nhưng không phải biểu diễn lý tưởng cho điều khiển liên tục, vì quantization và sequential decoding cùng giới hạn độ chính xác/speed. Những “emergent” evaluations tương đối nhỏ và được con người thiết kế để lộ đúng loại kiến thức ngữ nghĩa mà VLM mạnh. Mô hình/dữ liệu không thật sự mở nên khó reproduce. Quan trọng hơn, RT-2 chứng minh **chuyển giao ngữ nghĩa** mạnh hơn nhiều so với việc chứng minh vật lý chuyển giao; phần contact-rich motor intelligence vẫn chủ yếu đến từ robot demonstrations.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Bài báo thừa nhận: kiến thức từ web không tự tạo ra kỹ năng vận động mới. Nếu robot chưa từng học động tác vật lý tương ứng, biết nghĩa của chỉ dẫn không đủ.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: inference VLM lớn tốn compute; web knowledge không tự dạy kỹ năng cơ khí. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Bài báo thừa nhận: kiến thức từ web không tự tạo ra kỹ năng vận động mới. Nếu robot chưa từng học động tác vật lý tương ứng, biết nghĩa của chỉ dẫn không đủ. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: benchmark semantic tương đối nhỏ và mô hình/dữ liệu không thật sự reproducible công khai. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-1](/paper/rt-1)
- [OpenVLA](/paper/openvla)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RT-1, OpenVLA, Qwen-VLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: PaLM-E giải thích sensor grounding trong ngôn ngữ model. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: OpenVLA và Qwen-VLA tiếp tục nghiên cứu open/flow VLA và action representation. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RT-1, OpenVLA, Qwen-VLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Trên một VLM nhỏ tự thêm vocabulary cho 7 action dimensions; so sánh quantization error theo bins. Từ đó đọc OpenVLA như một implementation có thể chạy lại thay vì chỉ đọc diagram RT-2.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** VLA có thể tận dụng tri thức web để làm rõ “làm gì với cái gì”. Trên một VLM nhỏ tự thêm vocabulary cho 7 action dimensions; so sánh quantization error theo bins.

**Chọn điều cần mang sang dự án thật.** Dùng chung web/robot data khi fine-tune để kiểm soát forgetting. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. VLA có thể tận dụng tri thức web để làm rõ “làm gì với cái gì”.

**Tái hiện tối thiểu.** Trên một VLM nhỏ tự thêm vocabulary cho 7 action dimensions; so sánh quantization error theo bins. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

