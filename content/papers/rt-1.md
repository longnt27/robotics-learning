## Vì sao cần nghiên cứu này?

Nếu mỗi công việc của robot đều cần một mô hình riêng, một chiếc robot phục vụ trong bếp sẽ phải được huấn luyện lại khi đổi từ nhặt cốc sang mở ngăn kéo, rồi lại từ đầu khi đổi bối cảnh. **RT-1 đặt câu hỏi liệu một mô hình duy nhất có thể học nhiều nhiệm vụ nhờ lượng lớn demonstration robot thật hay không.** Mô hình phải hiểu câu lệnh và ảnh camera, đồng thời sinh lệnh đủ nhanh để robot liên tục điều khiển. Khó khăn còn nằm ở khả năng làm việc khi vật thể, phông nền hoặc cách bố trí khác dữ liệu đã học. Vì thế đóng góp RT-1 gắn liền với cả kiến trúc lẫn sự đa dạng dữ liệu huấn luyện.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rt-1/figure-1.webp)


### Vì sao không thể huấn luyện riêng một mô hình cho từng công việc?

Một robot phục vụ trong bếp có thể cần nhặt cốc, mở ngăn kéo, đặt bát, gom rác và hàng trăm việc khác. Nếu mỗi việc có một mô hình riêng, mỗi khi đổi vị trí đồ vật hay cách nói lệnh ta lại phải thu thêm dữ liệu và huấn luyện lại. Cách đó nhanh chóng trở nên quá đắt. **RT-1 hỏi liệu một policy duy nhất có thể học nhiều thao tác từ nhiều demonstration robot thật hay không.**

Khác với bài toán nhận diện ảnh, hành động sai sẽ làm thay đổi thế giới. Nếu kẹp lệch một chút, chiếc cốc có thể trượt; quan sát ở bước sau sẽ khác hẳn dữ liệu mẫu. Vì vậy mô hình cần vừa hiểu câu lệnh vừa phát lệnh đủ nhanh để giữ điều khiển liên tục. Đóng góp RT-1 không chỉ là kiến trúc Transformer, mà là dữ liệu robot đa nhiệm được tổ chức để học chung.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

RT-1 học **bắt chước hành vi người điều khiển**: mạng nhận ảnh và câu lệnh, rồi dự đoán lệnh robot mà người vận hành đã thực hiện ở hoàn cảnh tương tự. Khác nhận diện ảnh thông thường, mỗi hành động sai có thể làm cảnh ở bước sau thay đổi; robot kẹp lệch hai centimét sẽ thấy một ảnh khác so với demonstration và có thể sai tiếp. Đó là **sai số tích lũy**.

RT-1 chuyển lệnh liên tục thành những mã rời rạc gọi là token hành động để Transformer dễ dự đoán. Đây chỉ là cách biểu diễn lệnh robot, không biến chuyển động vật lý thành một bài toán ngôn ngữ thuần túy. Việc lượng tử hóa thành các mức cũng có thể gây sai số khi cần thao tác chính xác.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ba khái niệm trước khi đi vào mạng

**Học bắt chước (behavior cloning)** nghĩa là cho robot xem các cặp “camera nhìn thấy gì” và “người điều khiển đã làm gì”, rồi học dự đoán hành động tương ứng. **Điều kiện hóa theo câu lệnh** nghĩa là cùng một ảnh nhưng yêu cầu khác phải dẫn tới hành động khác. Trên cùng chiếc bàn, “nhặt cốc đỏ” khác “mở ngăn kéo”.

**Token hành động** là cách chuyển các giá trị lệnh liên tục thành những mã rời rạc mà Transformer có thể dự đoán. Sau khi mạng sinh token, hệ thống giải mã chúng thành lệnh robot thật. **Dữ liệu đa dạng** quan trọng vì một nghìn lần nhặt đúng một cốc ở đúng một chỗ không tương đương một nghìn lượt với nhiều đồ vật, vị trí và cách diễn đạt. Cần đọc cả số lượng lẫn sự phong phú của demonstration.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RT-1 được huấn luyện với khoảng **130.000 lượt thực thi**, thu trong **17 tháng** bằng **13 robot cùng dòng**, bao phủ hơn **700 câu lệnh và nhiệm vụ**. EfficientNet xử lý ảnh; FiLM điều chỉnh cách xử lý ảnh theo câu lệnh để chú ý đúng đối tượng; TokenLearner rút gọn lượng thông tin trước khi đưa vào Transformer dự đoán lệnh.

Robot cần lấy ảnh rồi phát lệnh liên tục, nên hệ thống hướng tới tốc độ khoảng 3 Hz. Nhóm tác giả còn tách riêng các yếu tố như lượng dữ liệu, sự đa dạng nhiệm vụ và quy mô mô hình, để xác định thay đổi nào thực sự giúp robot làm tốt hơn khi gặp tình huống mới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rt-1/figure-2.webp)


### Đi theo đường đi của một câu lệnh

**Bước 1:** người dùng đưa câu “Đặt chiếc cốc đỏ vào bồn rửa”; camera gửi những ảnh gần đây nhất. **Bước 2:** mô hình mã hóa câu lệnh bằng USE để có biểu diễn ý nghĩa, sau đó dùng FiLM điều chỉnh cách EfficientNet xử lý ảnh theo câu lệnh ấy. Nói đơn giản, cùng một ảnh nhưng khi câu lệnh nhắc “cốc đỏ”, mạng sẽ được hướng chú ý nhiều hơn tới thông tin liên quan.

**Bước 3:** TokenLearner rút gọn những đặc trưng ảnh–ngôn ngữ trước khi đưa vào Transformer, tránh phải xử lý quá nhiều token ở mỗi bước. **Bước 4:** Transformer dự đoán token hành động; chúng được giải mã thành lệnh dịch chuyển đầu công tác và điều khiển kẹp. **Bước 5:** robot thực thi một bước, rồi lại quan sát và quyết định.

Nếu chỉ nhớ một điều về sơ đồ RT-1, hãy nhớ **mỗi bộ phận giải quyết một trở ngại cụ thể: hiểu câu lệnh, lọc ảnh, rút gọn thông tin và sinh lệnh đủ nhanh.**

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử lệnh là **“Lấy quả táo đỏ đặt vào bát.”** Camera ghi lại bàn có nhiều đồ vật. Phần nhận diện ảnh tạo đặc trưng, còn câu lệnh giúp mạng chú ý tới quả táo và cái bát. Sau khi TokenLearner rút gọn biểu diễn, Transformer sinh lệnh dịch đầu kẹp, xoay cổ tay, đóng hoặc mở kẹp.

Robot thực hiện một bước rồi chụp ảnh mới để quyết định bước kế tiếp. Khi chuyển sang căn bếp khác, nó có thể sai vì ánh sáng, bố cục, vị trí vật hoặc cách cầm khác dữ liệu cũ. Muốn chẩn đoán, phải kiểm tra riêng lỗi nhận vật và lỗi điều khiển, không chỉ nhìn điểm thành công cuối cùng.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ robot nhặt đồ trong bếp mới

Robot từng học nhặt cốc trên bàn trắng. Sang một bếp có khăn trải hoa, người dùng vẫn ra lệnh nhặt cốc nhưng còn nhiều vật gây nhiễu xung quanh. Đầu tiên, RT-1 phải tìm đúng cốc; tiếp theo là xác định hướng tiếp cận không vướng đồ khác; cuối cùng mới kẹp và nâng. Mỗi bước đều có thể sai vì hình ảnh khác các ví dụ huấn luyện.

Một lần chạy thành công trong bếp mới chỉ là một quan sát. Để biết mô hình có thực sự bền, cần lặp lại nhiều lần, đổi vị trí cốc, loại khăn và cả cách diễn đạt câu lệnh. Vì vậy bài báo thiết kế các nhóm thử về vật gây nhiễu, phông nền và môi trường khác nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên hơn **700 nhiệm vụ đã học**, RT-1 được báo cáo đạt khoảng **97% thành công**. Ở những phép thử khó hơn với vật gây nhiễu, nền và bố cục khác, nhóm tác giả cho thấy mức cải thiện đáng kể so với các phương pháp đối chứng trong cùng điều kiện. Việc bổ sung dữ liệu nhặt vật từ robot Kuka còn giúp một số kỹ năng chuyển giao mà không phá rõ rệt những nhiệm vụ gốc.

Điểm quan trọng là **độ đa dạng của dữ liệu**, không chỉ số lượng demonstration. Giảm số loại nhiệm vụ có thể làm khả năng xử lý tình huống mới suy giảm mạnh hơn việc bỏ bớt một phần mẫu nhưng vẫn giữ nhiều kỹ năng khác nhau.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 7](/paper-figures/rt-1/figure-5.webp)
![Hình 6 từ PDF gốc, trang 9](/paper-figures/rt-1/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Vì sao đa dạng dữ liệu quan trọng hơn đếm số lượt?

Hãy tưởng tượng hai tập đều có 10.000 lần robot thao tác. Tập A lặp lại một kiểu bếp và ít đồ vật; tập B có nhiều kỹ năng, đồ vật và cách đặt khác nhau. Tập A có thể cho loss rất đẹp trên bối cảnh cũ nhưng dễ gặp sai ở bếp mới. Tập B buộc mô hình chú ý tới đặc điểm liên quan tới nhiệm vụ thay vì ghi nhớ nền.

Hình 6 là các thí nghiệm thay đổi cấu trúc dữ liệu, đo riêng tỷ lệ thành công trên nhiệm vụ đã gặp, chưa gặp và lúc có vật gây nhiễu. Kết luận có căn cứ là sự đa dạng góp phần lớn vào hiệu quả và khả năng khái quát *trong những nhóm thử này*. Không nên diễn đạt thành “tăng dữ liệu bao nhiêu cũng vô ích”; thêm dữ liệu vẫn có thể giúp nếu mẫu mới mang thông tin hữu ích.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Giới hạn của RT-1:** đây vẫn là mô hình học bắt chước. Những nhiệm vụ mới chủ yếu tổ hợp lại các kỹ năng đã có trong dữ liệu, chứ không phải robot tự phát minh động tác hoàn toàn mới. Các môi trường đánh giá khác bối cảnh học nhưng chưa phải mọi tình huống ngoài đời.

**Điều cần tránh hiểu sai:** 13 robot thu dữ liệu phần lớn thuộc cùng dòng thiết bị, không phải 13 cơ cấu cơ khí khác nhau. Lệnh rời rạc và nhịp điều khiển còn giới hạn các thao tác cực nhanh. Tỷ lệ thành công cao trên việc quen không chứng minh robot xử lý được mọi tình huống kẹp trượt, va chạm hoặc yêu cầu lực chính xác.

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

Hãy thu cùng lượng demonstration cho hai cách học: một chính sách chung thực hiện ba nhiệm vụ, và ba chính sách riêng mỗi cái chỉ học một việc. Sau đó giữ nguyên số mẫu nhưng thay số loại vật và bố cục. Đo tỷ lệ thành công khi robot tự chạy trong những cảnh chưa xuất hiện lúc học.

Mỗi lần thất bại cần ghi rõ robot chọn sai vật, di chuyển sai hướng hay kẹp trượt. **Tự kiểm tra:** FiLM giúp sử dụng câu lệnh thế nào, TokenLearner giúp giảm chi phí gì, và vì sao ảnh cần được cập nhật sau mỗi bước?

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Thử nghiệm nhỏ để tự kiểm tra

Lấy một cảnh có hai cốc và một ngăn kéo. Thử ra ba câu lệnh khác nhau trên cùng ảnh và ghi xem mô hình hướng tới đối tượng nào. Tiếp đó giữ câu lệnh cố định, thay khăn trải bàn hoặc đưa thêm vật gây nhiễu. Nếu hiệu quả giảm mạnh ở bước hai, vấn đề có thể nằm ở sự phụ thuộc vào bối cảnh chứ không hẳn ở việc hiểu từ ngữ.

Khi đọc lại RT-1, hãy tự trả lời: USE làm gì? FiLM thay đổi điều gì? Vì sao TokenLearner có ích cho tốc độ? Biểu đồ dữ liệu có đủ điều kiện để nói đa dạng quan trọng hay chưa? Trả lời được bốn câu ấy là đã hiểu phần xương sống.

<!-- END EXTENDED WALKTHROUGH -->

