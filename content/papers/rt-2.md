## Vì sao cần nghiên cứu này?

Một robot đã học nhặt cốc có thể chưa từng nghe câu “Lấy vật dùng để uống nước”. Trong khi đó, mô hình ảnh–ngôn ngữ được học từ Internet có thể biết chiếc cốc dùng để làm gì. **RT-2 nghiên cứu việc chuyển kiến thức ngữ nghĩa từ mô hình ảnh–ngôn ngữ sang hệ điều khiển robot.** Phương pháp biểu diễn lệnh robot thành token để huấn luyện chung với dữ liệu ảnh và văn bản. Mục tiêu là robot không chỉ lặp lại những câu lệnh đã có demonstration, mà còn nhận ra một số ý nghĩa và vật thể chưa từng được dạy trực tiếp qua dữ liệu robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rt-2/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là câu trả lời trực quan cho ý tưởng trung tâm của RT-2: action robot có thể biểu diễn như token văn bản trong cùng interface với mô hình vision-language đã học kiến thức trên web. Co-finetuning trộn dữ liệu web và robot để model dùng tri thức nhận biết vật thể/mối quan hệ khi sinh action. Hình này nói về chuyển giao ngữ nghĩa, không chứng minh mô hình tự có kỹ năng motor mới chỉ nhờ đọc văn bản web. Skill vận động vẫn cần supervision từ robot demonstrations.

### Tri thức ngôn ngữ giúp robot làm gì?

Robot từng được dạy nhặt cốc, nhưng chưa từng nhận câu “Lấy vật mà tôi có thể uống từ đó”. Một mô hình ảnh–ngôn ngữ học từ web có thể biết chiếc cốc dùng để uống; policy robot biết cách kẹp cốc. **RT-2 tìm cách nối hai loại kiến thức** để robot hiểu những yêu cầu mới mà không phải thu thêm demonstration cho mọi cách diễn đạt.

RT-2 mã hóa lệnh chuyển động dưới dạng token để huấn luyện chung với dữ liệu ảnh và chữ. Điều này khác việc dùng chatbot chỉ nói robot nên làm gì: đầu ra cuối cùng vẫn được giải mã thành lệnh điều khiển vật lý.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

RT-1 học image-to-action theo demonstration. VLM đã nhìn lượng ảnh và text rộng hơn robot nhiều bậc độ lớn. RT-2 đưa ra giả thuyết: **web ngữ nghĩa priors** có thể giúp robot hiểu vật thể/mục tiêu chưa được annotate trong robot tập dữ liệu nếu action được biểu diễn chung như đầu ra tokens.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ba khái niệm cần phân biệt

**VLM** là mạng học quan hệ giữa hình ảnh và ngôn ngữ. **Token hành động** là mã rời rạc cho lệnh robot, phải giải mã về giá trị liên tục và đúng đơn vị. **Huấn luyện chung** cho mạng học cả dữ liệu web lẫn demonstration robot, dù hai nguồn có nhãn và mục đích khác nhau.

Biết rằng táo là trái cây hoặc cốc dùng để uống không đồng nghĩa biết lực kẹp bao nhiêu. Vì vậy cần phân biệt kiến thức ngữ nghĩa với kỹ năng vận động.

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

### Một lần điều khiển RT-2 xảy ra như thế nào?

Camera cung cấp ảnh, người dùng cung cấp câu lệnh. Mô hình xử lý ảnh cùng ngôn ngữ, rồi dự đoán một chuỗi token biểu diễn hành động. Bộ giải mã chuyển token thành các giá trị điều khiển phù hợp với robot, chẳng hạn dịch đầu công tác và điều khiển kẹp.

Robot thực hiện một phần lệnh, quan sát lại và tiếp tục. Nếu vật thay đổi vị trí, lệnh sau phải dựa vào ảnh mới. Token sinh bởi RT-2 không phải những câu để đọc cho người nghe; chúng là mã mà bộ điều khiển cần hiểu đúng.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Yêu cầu robot "bỏ rác vào thùng" trong khi robot demos có pick/place nhưng không có vật thể tên "rác" cụ thể. VLM biết một lon rỗng và giấy vụn liên quan đến khái niệm rác; robotics action tín hiệu giám sát dạy cách pick/place. Khi text/web examples và robot các quỹ đạo co-train, mô hình có thể dùng prior để chọn mục tiêu. Tuy nhiên, chuyển giao ngữ nghĩa không đảm bảo kẹp được vật lạ.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 7](/paper-figures/rt-2/figure-3.webp)
![Hình 5 từ PDF gốc, trang 9](/paper-figures/rt-2/figure-5.webp)
![Hình 7 từ PDF gốc, trang 11](/paper-figures/rt-2/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Điểm cần theo dõi trong source code/diagram là các action dimensions được **serialize** thành tokens; loss huấn luyện có thể chia sẻ decoder với đầu ra ngôn ngữ, nhưng vật lý meaning đến từ robot examples.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ “lấy đồ uống được” trên bàn

Cùng một bàn có cốc, đĩa và đồ chơi. Người dùng yêu cầu “Nhặt vật để uống nước”. Robot phải dùng kiến thức về công dụng để chọn cốc, rồi mới giải quyết việc đi tới, kẹp và nhấc lên. Nếu robot nhận đúng cốc nhưng đánh rơi, lỗi nằm ở vận động chứ không nhất thiết do hiểu ngôn ngữ.

Nếu nó kẹp một chiếc bát sai mục tiêu, vấn đề có thể nằm ở việc nối câu lệnh với vật thể. Tách hai lỗi giúp đọc RT-2 đúng hơn thay vì gom mọi thất bại thành “mô hình không thông minh”.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên seen nhiệm vụ thao tác, RT-2 vẫn giữ hiệu năng cạnh tranh với RT-1. Điểm thắng nằm ở **vật thể mới, unseen chỉ dẫn và khái quát về ngữ nghĩa**. Bài báo báo hiệu năng khái quát gần **gấp đôi** một số phương pháp đối chứng mạnh và, trong nhóm “emergent suy luận ngữ nghĩa” được thiết kế để test kiến thức từ web chuyển giao, RT-2-PaLI-X đạt tỷ lệ thành công trung bình cao hơn RT-1 nhiều lần, có nhóm hơn **3x**.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 8](/paper-figures/rt-2/figure-4.webp)
![Hình 6 từ PDF gốc, trang 10](/paper-figures/rt-2/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Các qualitative examples gây ảnh hưởng lớn vì robot có thể hiểu những concept không xuất hiện rõ trong dữ liệu robot, như chọn vật thể theo ngữ nghĩa category hoặc kết hợp kiến thức từ web với action. Đây là proof-of-concept khiến cả field tin rằng VLM không chỉ làm planner phía trên mà có thể trở thành chính policy backbone.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc các mức khái quát trong kết quả

RT-2 được thử trên nhiệm vụ đã học và những tình huống mới về đồ vật, nền, môi trường hoặc yêu cầu ngữ nghĩa. Hình 6 còn tách ảnh hưởng của quy mô mô hình và cách huấn luyện. Khi đọc, cần phân biệt dữ liệu robot chưa từng có thao tác tương ứng với dữ liệu web có thể đã từng chứa khái niệm ấy.

Một con số thành công cao trong một nhóm bài kiểm tra chưa có nghĩa mô hình có thể giải mọi câu lệnh chưa thấy. Phải xem từng dạng mới được đánh giá.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** kiến thức từ web không tự tạo ra kỹ năng vận động mới. Nếu robot chưa từng học động tác vật lý tương ứng, biết nghĩa của chỉ dẫn không đủ. Inference với VLM lớn cũng gây nút thắt về độ trễ và compute, đặc biệt với control tần số cao.

**Phê bình thêm:** tokenized autoregressive actions là một interface rất tiện nhưng không phải biểu diễn lý tưởng cho điều khiển liên tục, vì quantization và sequential decoding cùng giới hạn độ chính xác/speed. Những “emergent” evaluations tương đối nhỏ và được con người thiết kế để lộ đúng loại kiến thức ngữ nghĩa mà VLM mạnh. Mô hình/dữ liệu không thật sự mở nên khó reproduce. Quan trọng hơn, RT-2 chứng minh **chuyển giao ngữ nghĩa** mạnh hơn nhiều so với việc chứng minh vật lý chuyển giao; phần contact-rich motor intelligence vẫn chủ yếu đến từ robot demonstrations.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn của cách biến hành động thành token

Token chỉ giúp mô hình dùng chung một cách biểu diễn, không tự bảo đảm an toàn cho robot. Nếu đổi sang robot có số khớp khác, cùng các mã số có thể không còn ý nghĩa như cũ. Độ trễ suy luận, góc camera bị che và vật thể biến dạng vẫn là các trở ngại vật lý.

Vì thế checkpoint VLM mạnh về ảnh/ngôn ngữ chưa chắc phù hợp ngay với robot đích; cần xác minh action space và thực hiện kiểm tra từng bước trước khi chạy thật.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-1](/paper/rt-1)
- [OpenVLA](/paper/openvla)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### RT-2 khác PaLM-E, RT-1 và OpenVLA

RT-1 chứng minh khả năng học nhiều thao tác từ dữ liệu robot. PaLM-E đưa quan sát vào suy luận đa phương thức, thường ở mức kế hoạch. RT-2 kết hợp token hành động và dữ liệu ảnh–ngôn ngữ trong một mạng. OpenVLA tiếp tục phát triển hướng VLA có checkpoint nguồn mở, có thể tinh chỉnh cho robot mới.

Đọc các bài này không nên xếp hạng bằng số tham số. Cần hỏi mạng tạo câu trả lời, kế hoạch cấp cao hay lệnh vận động trực tiếp; dữ liệu và robot thử khác nhau thế nào.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Trên một VLM nhỏ tự thêm vocabulary cho 7 action dimensions; so sánh quantization error theo bins. Từ đó đọc OpenVLA như một implementation có thể chạy lại thay vì chỉ đọc diagram RT-2.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự kiểm tra bằng ba câu lệnh

Giữ nguyên cảnh, lần lượt yêu cầu “nhặt cốc”, “nhặt vật đựng nước” và “nhặt cốc đỏ”. So sánh vật được chọn. Sau đó giữ câu lệnh, thay vị trí đồ vật để xem model có bám vào camera hay chỉ nhớ tọa độ.

Cuối cùng kiểm tra các token hành động được giải mã bằng cách nào, có chuẩn hóa ngược không và có đúng hệ tọa độ robot không. Đây là phần cần hiểu trước khi nghĩ tới chạy RT-2 trên thiết bị thật.

<!-- END EXTENDED WALKTHROUGH -->

