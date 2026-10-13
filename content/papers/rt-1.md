## Vì sao cần nghiên cứu này?

Trước RT-1, phần lớn robot learning vẫn theo cách tiếp cận kiểu “một nhiệm vụ, một policy”, hoặc cùng lắm là một nhóm nhiệm vụ tương đối gần nhau. Cái thiếu không chỉ là kiến trúc tốt hơn, mà là bằng chứng rằng cách tiếp cận từng thành công ở NLP/vision - gom dữ liệu lớn, đa dạng rồi huấn luyện một mô hình chung - cũng có thể mở rộng quy mô trong robot học. Khó ở chỗ action của robot phải được tính và thực thi theo thời gian thực, dữ liệu đắt hơn Internet rất nhiều, và dịch chuyển phân phối dữ liệu giữa vật thể, phông nền, nhiệm vụ và bối cảnh dễ làm policy thất bại ngay. RT-1 vì thế hỏi một câu rất nền tảng: **nếu ta thật sự mở rộng quy mô dữ liệu robot thật và dùng một Transformer đủ lớn, khả năng khái quát có tăng một cách có hệ thống không?**

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rt-1/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 tổng hợp dữ liệu huấn luyện, Transformer policy và phạm vi đánh giá RT-1. Điểm quan trọng là real robot demonstrations được thu cho nhiều nhiệm vụ và instruction, chứ không chỉ mở rộng một kiến trúc network. Người đọc nên đặt câu hỏi cùng backbone nhưng ít đa dạng nhiệm vụ hơn thì thế nào, và data distribution có giới hạn ra sao. Những hình thành công trên robot thật cho biết policy có thể được triển khai trong thiết lập bài báo, không phải chứng minh mọi robot đều sẽ đạt cùng success rate.

### Vì sao không thể huấn luyện riêng một mô hình cho từng công việc?

Một robot phục vụ trong bếp có thể cần nhặt cốc, mở ngăn kéo, đặt bát, gom rác và hàng trăm việc khác. Nếu mỗi việc có một mô hình riêng, mỗi khi đổi vị trí đồ vật hay cách nói lệnh ta lại phải thu thêm dữ liệu và huấn luyện lại. Cách đó nhanh chóng trở nên quá đắt. **RT-1 hỏi liệu một policy duy nhất có thể học nhiều thao tác từ nhiều demonstration robot thật hay không.**

Khác với bài toán nhận diện ảnh, hành động sai sẽ làm thay đổi thế giới. Nếu kẹp lệch một chút, chiếc cốc có thể trượt; quan sát ở bước sau sẽ khác hẳn dữ liệu mẫu. Vì vậy mô hình cần vừa hiểu câu lệnh vừa phát lệnh đủ nhanh để giữ điều khiển liên tục. Đóng góp RT-1 không chỉ là kiến trúc Transformer, mà là dữ liệu robot đa nhiệm được tổ chức để học chung.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

RT-1 là **behavior cloning có điều kiện ngôn ngữ**: mạng nhận khung hình `o_t` và chỉ dẫn `l`, xuất action `a_t`. Khác phân loại có giám sát thông thường, lỗi dự đoán tự làm thay đổi quan sát về sau: khi gripper lệch 2 cm, camera nhìn một bối cảnh khác với demo, dẫn tới **compounding error**. Một policy đa nhiệm phải giải cả grounding (chỉ dẫn ám chỉ vật nào), perception và điều khiển trong một lần chạy forward.

Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer. Lượng tử hóa gây sai số và ảnh hưởng lớn ở chuyển động có độ chính xác cao.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ba khái niệm trước khi đi vào mạng

**Học bắt chước (behavior cloning)** nghĩa là cho robot xem các cặp “camera nhìn thấy gì” và “người điều khiển đã làm gì”, rồi học dự đoán hành động tương ứng. **Điều kiện hóa theo câu lệnh** nghĩa là cùng một ảnh nhưng yêu cầu khác phải dẫn tới hành động khác. Trên cùng chiếc bàn, “nhặt cốc đỏ” khác “mở ngăn kéo”.

**Token hành động** là cách chuyển các giá trị lệnh liên tục thành những mã rời rạc mà Transformer có thể dự đoán. Sau khi mạng sinh token, hệ thống giải mã chúng thành lệnh robot thật. **Dữ liệu đa dạng** quan trọng vì một nghìn lần nhặt đúng một cốc ở đúng một chỗ không tương đương một nghìn lượt với nhiều đồ vật, vị trí và cách diễn đạt. Cần đọc cả số lượng lẫn sự phong phú của demonstration.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RT-1 huấn luyện một Transformer policy khoảng 35M tham số trên khoảng **130 nghìn episode**, thu trong **17 tháng** bằng **13 robot** và phủ hơn **700 chỉ dẫn/nhiệm vụ**. Ảnh đi qua EfficientNet, chỉ dẫn ngôn ngữ đi vào FiLM conditioning, sau đó TokenLearner nén token thị giác để Transformer vẫn chạy đủ nhanh cho robot. Các action được lượng tử hóa thành token thay vì hồi quy trực tiếp vector liên tục. Policy chạy ở khoảng 3 Hz, nên đây còn là một bài toán hệ thống chứ không chỉ độ chính xác khi đánh giá offline.

Điểm quan trọng hơn kiến trúc là cách bài báo làm ablation dữ liệu. Họ tách ảnh hưởng của **lượng dữ liệu**, **độ đa dạng nhiệm vụ**, **kích thước mô hình** và bổ sung thêm dữ liệu ngoài phân phối chính. Nhờ vậy RT-1 không chỉ nói “mô hình hoạt động tốt”, mà cung cấp một trong những bằng chứng sớm rằng **sự đa dạng của kinh nghiệm quan trọng ít nhất ngang tổng số mẫu thô**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rt-1/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 cho thấy language instruction được mã hóa thành embedding và dùng để điều kiện hóa visual tokens, trước khi sequence modeling sinh action tokens. EfficientNet là phần trích đặc trưng thị giác; Transformer học mối liên hệ giữa các quan sát đã được token hóa và lệnh hành động. Thao tác token hóa output phải khớp với số chiều action, trong đó gripper và termination signal có semantics riêng. Nếu chỉ gọi đây là 'image-to-text' là đã bỏ sót tầng quan trọng nhất: giải mã token thành lệnh điều khiển robot.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ robot được yêu cầu 'đặt lon đỏ vào ngăn dưới'. Camera cho thấy lon đỏ và lon xanh ở vị trí khác nhau. Nếu encoder và instruction conditioning hoạt động, policy cần tập trung đúng lon đỏ thay vì chỉ phản xạ với vị trí vật thể xuất hiện nhiều nhất trong data. Mã hóa action thành từng chiều, điều khiển tới vật, grasp rồi place. Một phép kiểm thử đáng làm là thay instruction thành lon xanh mà giữ nguyên hình, và quan sát action distribution thay đổi thế nào. Nếu không đổi, có thể model chưa dùng đúng instruction.

### Đi theo đường đi của một câu lệnh

**Bước 1:** người dùng đưa câu “Đặt chiếc cốc đỏ vào bồn rửa”; camera gửi những ảnh gần đây nhất. **Bước 2:** mô hình mã hóa câu lệnh bằng USE để có biểu diễn ý nghĩa, sau đó dùng FiLM điều chỉnh cách EfficientNet xử lý ảnh theo câu lệnh ấy. Nói đơn giản, cùng một ảnh nhưng khi câu lệnh nhắc “cốc đỏ”, mạng sẽ được hướng chú ý nhiều hơn tới thông tin liên quan.

**Bước 3:** TokenLearner rút gọn những đặc trưng ảnh–ngôn ngữ trước khi đưa vào Transformer, tránh phải xử lý quá nhiều token ở mỗi bước. **Bước 4:** Transformer dự đoán token hành động; chúng được giải mã thành lệnh dịch chuyển đầu công tác và điều khiển kẹp. **Bước 5:** robot thực thi một bước, rồi lại quan sát và quyết định.

Nếu chỉ nhớ một điều về sơ đồ RT-1, hãy nhớ **mỗi bộ phận giải quyết một trở ngại cụ thể: hiểu câu lệnh, lọc ảnh, rút gọn thông tin và sinh lệnh đủ nhanh.**

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử lệnh **"lấy quả táo đỏ đặt vào bát"**. `EfficientNet` mã hoá ảnh có nhiều đồ vật; chỉ dẫn đi vào FiLM để điều chỉnh trọng số các đặc trưng thị giác theo từ "táo đỏ" và "bát". `TokenLearner` rút gọn token không gian. Transformer dự đoán các thành phần action như dịch chuyển gripper, góc quay, độ mở kẹp và terminate. Sau khi thực thi, robot chụp khung hình mới và lặp lại. Đây là **behavior cloning trong vòng lặp kín** chứ không phải việc lập kế hoạch cho chuỗi hành động dài.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Khi chuyển robot sang một căn bếp khác, thất bại có thể do điều kiện chiếu sáng, vị trí đặt vật, hình học thao tác gắp hoặc hiểu biết về nhiệm vụ. Không thể chỉ nhìn tổng tỷ lệ thành công để biết nút thắt nằm ở đâu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ robot nhặt đồ trong bếp mới

Robot từng học nhặt cốc trên bàn trắng. Sang một bếp có khăn trải hoa, người dùng vẫn ra lệnh nhặt cốc nhưng còn nhiều vật gây nhiễu xung quanh. Đầu tiên, RT-1 phải tìm đúng cốc; tiếp theo là xác định hướng tiếp cận không vướng đồ khác; cuối cùng mới kẹp và nâng. Mỗi bước đều có thể sai vì hình ảnh khác các ví dụ huấn luyện.

Một lần chạy thành công trong bếp mới chỉ là một quan sát. Để biết mô hình có thực sự bền, cần lặp lại nhiều lần, đổi vị trí cốc, loại khăn và cả cách diễn đạt câu lệnh. Vì vậy bài báo thiết kế các nhóm thử về vật gây nhiễu, phông nền và môi trường khác nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên tập hơn 700 chỉ dẫn đã huấn luyện, RT-1 đạt khoảng **97% thành công**. Ở các nhóm kiểm tra khả năng khái quát như nhiệm vụ mới, distractor mới và phông nền mới, tác giả nêu mức cải thiện lớn so với phương pháp đối chứng trước đó, lần lượt khoảng **25, 36 và 18 điểm** trong các thiết lập được báo cáo. Một thí nghiệm rất đáng nhớ là khi thêm dữ liệu bin-picking từ Kuka vào mixture: khả năng khái quát sang bin-picking tăng gần gấp đôi mà hiệu năng trên tập nhiệm vụ gốc không bị phá đáng kể.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 7](/paper-figures/rt-1/figure-5.webp)
![Hình 6 từ PDF gốc, trang 9](/paper-figures/rt-1/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Các thí nghiệm ablation cũng cho thấy giảm **độ đa dạng nhiệm vụ** gây hại khả năng khái quát rất mạnh. Có những thiết lập mà bỏ 25% số nhiệm vụ gây tổn thất tương tự hoặc lớn hơn việc bỏ một lượng mẫu đáng kể nhưng vẫn giữ sự đa dạng. Đây là lý do RT-1 thường được nhắc như một bằng chứng sớm cho câu: **robotics cần mở rộng độ bao phủ nhiệm vụ, không chỉ lặp lại cùng một kỹ năng 100 nghìn lần**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Vì sao đa dạng dữ liệu quan trọng hơn đếm số lượt?

Hãy tưởng tượng hai tập đều có 10.000 lần robot thao tác. Tập A lặp lại một kiểu bếp và ít đồ vật; tập B có nhiều kỹ năng, đồ vật và cách đặt khác nhau. Tập A có thể cho loss rất đẹp trên bối cảnh cũ nhưng dễ gặp sai ở bếp mới. Tập B buộc mô hình chú ý tới đặc điểm liên quan tới nhiệm vụ thay vì ghi nhớ nền.

Hình 6 là các thí nghiệm thay đổi cấu trúc dữ liệu, đo riêng tỷ lệ thành công trên nhiệm vụ đã gặp, chưa gặp và lúc có vật gây nhiễu. Kết luận có căn cứ là sự đa dạng góp phần lớn vào hiệu quả và khả năng khái quát *trong những nhóm thử này*. Không nên diễn đạt thành “tăng dữ liệu bao nhiêu cũng vô ích”; thêm dữ liệu vẫn có thể giúp nếu mẫu mới mang thông tin hữu ích.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** RT-1 vẫn là imitation learning, nên về nguyên tắc khó vượt quá phạm vi hành vi của demonstrator. “Nhiệm vụ chưa xuất hiện khi huấn luyện” phần lớn là sự kết hợp lại các động tác cơ bản đã thấy, không phải robot tự phát minh kỹ năng vật lý mới. Căn bếp mới vẫn có cấu trúc khá gần phân phối dữ liệu huấn luyện, và những nhiệm vụ thao tác chưa đòi hỏi dexterity/contact cực cao. Mô hình lớn hơn cũng nhanh chóng gặp nút thắt về độ trễ vì control phải chạy thời gian thực.

**Phê bình thêm:** RT-1 gần như chưa chứng minh khả năng chuyển giao giữa những cấu trúc robot khác nhau theo nghĩa hiện đại; 13 robot vẫn là cùng họ thiết bị và cấu hình phần cứng hơn là 13 cấu trúc cơ khí khác biệt. Discrete action tokens và tần số điều khiển thấp cũng đặt trần cho những nhiệm vụ cần các điều chỉnh ở tần số cao. Tập dữ liệu rất lớn cho năm 2023 nhưng vẫn được thu thập theo hệ thống phân loại nhiệm vụ do con người thiết kế, nên tính đa nhiệm của nó vẫn giới hạn trong một tập bài toán tương đối hẹp. Cuối cùng, tỷ lệ thành công cao trên nhiệm vụ huấn luyện dễ khiến người đọc quên rằng **phục hồi sau sai sót, suy luận liên quan đến lực và trí nhớ trong nhiệm vụ kéo dài** gần như chưa được đụng tới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những điều RT-1 chưa chứng minh

RT-1 học trên một hệ robot, một phạm vi camera và môi trường thu dữ liệu cụ thể. Khi đổi sang robot khác, hệ tọa độ lệnh, độ mở kẹp và vị trí camera thay đổi, nên không thể chỉ sao chép checkpoint rồi bảo robot mới chạy giống hệt.

Một chính sách điều khiển cũng có thể thất bại vì độ trễ hoặc giới hạn cơ học, dù nó hiểu đúng câu lệnh. Hãy tách lỗi chọn sai vật, lỗi quỹ đạo, lỗi kẹp và lỗi do môi trường thay đổi. Đọc video thành công cùng tỷ lệ thành công có số lần thử mới tránh được ấn tượng sai do vài đoạn quay đẹp.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [OpenVLA](/paper/openvla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### RT-1 nằm ở đâu trong lịch sử VLA?

VIMA nhấn mạnh cách mô tả mục tiêu bằng prompt đa phương thức trong mô phỏng. RT-1 xây bằng chứng cho việc huấn luyện policy từ lượng lớn dữ liệu robot thật với câu lệnh ngôn ngữ. RT-2 tiến thêm một bước: dùng phần tri thức đã học từ dữ liệu ảnh và chữ trên Internet để hỗ trợ hiểu những yêu cầu robot mới.

RT-1 và Open X-Embodiment cũng liên hệ trực tiếp: khi dữ liệu đến từ nhiều kiểu robot, ngoài hình ảnh còn có vấn đề **lệnh điều khiển của hai phần cứng không có cùng ý nghĩa**. Chính vì vậy kết quả một policy đa nhiệm là một bước tiến, không phải lời giải cuối cùng của chuyển giao sang mọi robot.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Làm một thử nghiệm nhỏ: huấn luyện BC trên ảnh + state với hai phiên bản `shared policy` và `separate policy per task`, đánh giá tỷ lệ thành công trên những bối cảnh thuộc tập kiểm tra. Đặt số demonstration cố định nhưng thay mức độ đa dạng nhiệm vụ. Quan sát thành công so với dữ liệu breadth, không chỉ loss khi huấn luyện.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Thử nghiệm nhỏ để tự kiểm tra

Lấy một cảnh có hai cốc và một ngăn kéo. Thử ra ba câu lệnh khác nhau trên cùng ảnh và ghi xem mô hình hướng tới đối tượng nào. Tiếp đó giữ câu lệnh cố định, thay khăn trải bàn hoặc đưa thêm vật gây nhiễu. Nếu hiệu quả giảm mạnh ở bước hai, vấn đề có thể nằm ở sự phụ thuộc vào bối cảnh chứ không hẳn ở việc hiểu từ ngữ.

Khi đọc lại RT-1, hãy tự trả lời: USE làm gì? FiLM thay đổi điều gì? Vì sao TokenLearner có ích cho tốc độ? Biểu đồ dữ liệu có đủ điều kiện để nói đa dạng quan trọng hay chưa? Trả lời được bốn câu ấy là đã hiểu phần xương sống.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Cái thiếu không chỉ là kiến trúc tốt hơn, mà là bằng chứng rằng cách tiếp cận từng thành công ở NLP/vision - gom dữ liệu lớn, đa dạng rồi huấn luyện một mô hình chung - cũng có thể mở rộng quy mô trong robot học. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một nhiệm vụ, một policy không thể mở rộng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một nhiệm vụ, một policy không thể mở rộng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khó ở chỗ action của robot phải được tính và thực thi theo thời gian thực, dữ liệu đắt hơn Internet rất nhiều, và dịch chuyển phân phối dữ liệu giữa vật thể, phông nền, nhiệm vụ và bối cảnh dễ làm policy thất bại ngay. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Policy chuyên biệt nhớ môi trường, không học được kỹ năng chung: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Policy chuyên biệt nhớ môi trường, không học được kỹ năng chung', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Trước RT-1, phần lớn robot learning vẫn theo cách tiếp cận kiểu “một nhiệm vụ, một policy”, hoặc cùng lắm là một nhóm nhiệm vụ tương đối gần nhau. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Scale dữ liệu robot thật trước khi chỉ scale tham số: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Scale dữ liệu robot thật trước khi chỉ scale tham số', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. RT-1 huấn luyện một Transformer policy khoảng 35M tham số trên khoảng 130 nghìn episode, thu trong 17 tháng bằng 13 robot và phủ hơn 700 chỉ dẫn/nhiệm vụ. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ba khái niệm để nắm: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ba khái niệm để nắm', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kiến trúc trong một sơ đồ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kiến trúc trong một sơ đồ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Ảnh đi qua EfficientNet, chỉ dẫn ngôn ngữ đi vào FiLM conditioning, sau đó TokenLearner nén token thị giác để Transformer vẫn chạy đủ nhanh cho robot. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mô hình biểu diễn cái gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mô hình biểu diễn cái gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khác phân loại có giám sát thông thường, lỗi dự đoán tự làm thay đổi quan sát về sau: khi gripper lệch 2 cm, camera nhìn một bối cảnh khác với demo, dẫn tới compounding error. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model học như thế nào?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model học như thế nào?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Điểm quan trọng hơn kiến trúc là cách bài báo làm ablation dữ liệu. Họ tách ảnh hưởng của lượng dữ liệu, độ đa dạng nhiệm vụ, kích thước mô hình và bổ sung thêm dữ liệu ngoài phân phối chính. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một lần inference xảy ra ra sao?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một lần inference xảy ra ra sao?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Giả sử lệnh "lấy quả táo đỏ đặt vào bát". EfficientNet mã hoá ảnh có nhiều đồ vật; chỉ dẫn đi vào FiLM để điều chỉnh trọng số các đặc trưng thị giác theo từ "táo đỏ" và "bát". Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.



<!-- END EXTENDED WALKTHROUGH -->
