## Vì sao cần nghiên cứu này?

### Vì sao không thể huấn luyện riêng một mô hình cho từng công việc?

Một robot phục vụ trong bếp có thể cần nhặt cốc, mở ngăn kéo, đặt bát, gom rác và hàng trăm việc khác. Nếu mỗi việc có một mô hình riêng, mỗi khi đổi vị trí đồ vật hay cách nói lệnh ta lại phải thu thêm dữ liệu và huấn luyện lại. Cách đó nhanh chóng trở nên quá đắt. **RT-1 hỏi liệu một chính sách điều khiển duy nhất có thể học nhiều thao tác từ nhiều lần người điều khiển robot làm mẫu thật hay không.**

Khác với bài toán nhận diện ảnh, hành động sai sẽ làm thay đổi thế giới. Nếu kẹp lệch một chút, chiếc cốc có thể trượt; quan sát ở bước sau sẽ khác hẳn dữ liệu mẫu. Vì vậy mô hình cần vừa hiểu câu lệnh vừa phát lệnh đủ nhanh để giữ điều khiển liên tục. Đóng góp RT-1 không chỉ là kiến trúc Transformer, mà là dữ liệu robot đa nhiệm được tổ chức để học chung.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rt-1/figure-1.webp)

![Hình 3 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-3.webp)

## Kiến thức nền cần nắm

### Ba khái niệm trước khi đi vào mạng

**Học bắt chước (behavior cloning)** nghĩa là cho robot xem các cặp “camera nhìn thấy gì” và “người điều khiển đã làm gì”, rồi học dự đoán hành động tương ứng. **Điều kiện hóa theo câu lệnh** nghĩa là cùng một ảnh nhưng yêu cầu khác phải dẫn tới hành động khác. Trên cùng chiếc bàn, “nhặt cốc đỏ” khác “mở ngăn kéo”.

**Token hành động** là cách chuyển các giá trị lệnh liên tục thành những mã rời rạc mà Transformer có thể dự đoán. Sau khi mạng sinh token, hệ thống giải mã chúng thành lệnh robot thật. **Dữ liệu đa dạng** quan trọng vì một nghìn lần nhặt đúng một cốc ở đúng một chỗ không tương đương một nghìn lượt với nhiều đồ vật, vị trí và cách diễn đạt. Cần đọc cả số lượng lẫn sự phong phú của lần làm mẫu.


### ### Học bắt chước không phải học thuộc một đường đi

Hãy tưởng tượng người vận hành làm mẫu thao tác “đặt cốc vào bồn” ở nhiều vị trí cốc khác nhau. Mạng không được chỉ nhớ rằng luôn dịch tay 20 cm sang trái; nó phải học liên hệ giữa **ảnh hiện tại**, **yêu cầu** và **lệnh người đã chọn**. Cũng bởi vậy, tập dữ liệu có hàng nghìn lượt nhặt cùng một chiếc cốc ở đúng một vị trí vẫn có thể kém hữu ích hơn một tập nhỏ hơn nhưng đa dạng hơn về vật, bố cục và câu nói. Mục tiêu của RT-1 là làm chung nhiều việc, chứ không chứng minh robot có thể suy ra mọi kỹ năng mới từ một câu chữ.

## Phương pháp thực hiện

### Đi theo đường đi của một câu lệnh

**Bước 1:** người dùng đưa câu “Đặt chiếc cốc đỏ vào bồn rửa”; camera gửi những ảnh gần đây nhất. **Bước 2:** mô hình mã hóa câu lệnh bằng USE để có biểu diễn ý nghĩa, sau đó dùng FiLM điều chỉnh cách EfficientNet xử lý ảnh theo câu lệnh ấy. Nói cụ thể hơn, FiLM thay đổi cách các kênh đặc trưng ảnh được xử lý theo câu lệnh: yêu cầu “cốc đỏ” và “mở ngăn kéo” tạo điều kiện khác nhau dù camera nhìn cùng một cảnh.

**Bước 3:** TokenLearner rút gọn những đặc trưng ảnh–ngôn ngữ trước khi đưa vào Transformer, tránh phải xử lý quá nhiều token ở mỗi bước. **Bước 4:** Transformer dự đoán token hành động; chúng được giải mã thành lệnh dịch chuyển đầu công tác và điều khiển kẹp. **Bước 5:** robot thực thi lệnh, nhận quan sát mới và quyết định tiếp. Lỗi nhỏ ở một bước có thể làm cảnh thay đổi nên vòng lặp quan sát rất quan trọng.

Nếu chỉ nhớ một điều về sơ đồ RT-1, hãy nhớ **mỗi bộ phận giải quyết một trở ngại cụ thể: hiểu câu lệnh, lọc ảnh, rút gọn thông tin và sinh lệnh đủ nhanh.**


### ### Mỗi thành phần của RT-1 gỡ một nút thắt khác nhau

USE biến câu lệnh thành biểu diễn ngôn ngữ; FiLM dùng biểu diễn ấy để điều chỉnh cách EfficientNet xử lý ảnh. TokenLearner rút gọn số đặc trưng quan trọng để Transformer không phải xử lý toàn bộ ảnh như một chuỗi khổng lồ. Cuối cùng, Transformer dự đoán các mã hành động có thể giải ngược thành lệnh robot. Thử bỏ từng khối sẽ trả lời câu hỏi cụ thể: robot mất khả năng phân biệt yêu cầu, quá chậm để điều khiển, hay mất chất lượng dự đoán theo thời gian? Nói “đưa ảnh qua Transformer rồi ra hành động” bỏ qua chính lý do từng bộ phận được thiết kế.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rt-1/figure-2.webp)

## Ví dụ từng bước

### Ví dụ robot nhặt đồ trong bếp mới

Robot từng học nhặt cốc trên bàn trắng. Sang một bếp có khăn trải hoa, người dùng vẫn ra lệnh nhặt cốc nhưng còn nhiều vật gây nhiễu xung quanh. Đầu tiên, RT-1 phải tìm đúng cốc; tiếp theo là xác định hướng tiếp cận không vướng đồ khác; cuối cùng mới kẹp và nâng. Mỗi bước đều có thể sai vì hình ảnh khác các ví dụ huấn luyện.

Một lần chạy thành công trong bếp mới chỉ là một quan sát. Để biết mô hình có thực sự bền, cần lặp lại nhiều lần, đổi vị trí cốc, loại khăn và cả cách diễn đạt câu lệnh. Vì vậy bài báo thiết kế các nhóm thử về vật gây nhiễu, phông nền và môi trường khác nhau.

![Hình 4 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-4.webp)

## Kết quả thực nghiệm

### Vì sao đa dạng dữ liệu quan trọng hơn đếm số lượt?

Hãy tưởng tượng hai tập đều có 10.000 lần robot thao tác. Tập A lặp lại một kiểu bếp và ít đồ vật; tập B có nhiều kỹ năng, đồ vật và cách đặt khác nhau. Tập A có thể cho hàm mất mát rất đẹp trên bối cảnh cũ nhưng dễ gặp sai ở bếp mới. Tập B buộc mô hình chú ý tới đặc điểm liên quan tới nhiệm vụ thay vì ghi nhớ nền.

Hình 6 là các thí nghiệm thay đổi cấu trúc dữ liệu, đo riêng tỷ lệ thành công trên nhiệm vụ đã gặp, chưa gặp và lúc có vật gây nhiễu. Kết luận có căn cứ là sự đa dạng góp phần lớn vào hiệu quả và khả năng khái quát *trong những nhóm thử này*. Không nên diễn đạt thành “tăng dữ liệu bao nhiêu cũng vô ích”; thêm dữ liệu vẫn có thể giúp nếu mẫu mới mang thông tin hữu ích.



### Đọc tỷ lệ 97% cùng điều kiện thu dữ liệu

Trên nhóm hơn 700 cách chỉ dẫn đã được học, RT-1 đạt khoảng 97% tỷ lệ thành công theo báo cáo. Những phép thử với đồ vật gây nhiễu, nền mới và nhiệm vụ mới cho kết quả khác nhau, nên không thể dùng 97% để mô tả mọi điều kiện. Một thí nghiệm bổ sung dữ liệu nhặt đồ trong thùng từ robot Kuka cũng cho thấy dữ liệu mới có thể hỗ trợ kỹ năng liên quan mà không làm giảm mạnh hiệu quả của các công việc gốc. Điều cần học từ đây là cách thiết kế các tập kiểm tra tách biệt.


### ### Thử đổi đúng một yếu tố để hiểu kết quả khái quát

Giữ nguyên chiếc bàn và đồ vật, đổi lệnh từ “nhặt cốc đỏ” sang “nhặt cốc xanh” để kiểm tra điều kiện hóa theo ngôn ngữ. Giữ nguyên lệnh nhưng thay khăn trải bàn và thêm vật gây nhiễu để kiểm tra khả năng thích nghi thị giác. Cuối cùng, yêu cầu một việc chưa có trong dữ liệu làm mẫu để kiểm tra giới hạn học nhiệm vụ mới. Ba trường hợp này không giống nhau. Vì thế tỷ lệ thành công khoảng 97% ở nhóm chỉ dẫn quen thuộc của RT-1 không thể tự động dùng để mô tả cả ba nhóm thử.

![Hình 5 từ PDF gốc, trang 7](/paper-figures/rt-1/figure-5.webp)

![Hình 6 từ PDF gốc, trang 9](/paper-figures/rt-1/figure-6.webp)

## Hạn chế và câu hỏi còn mở

### Những điều RT-1 chưa chứng minh

RT-1 học trên một hệ robot, một phạm vi camera và môi trường thu dữ liệu cụ thể. Khi đổi sang robot khác, hệ tọa độ lệnh, độ mở kẹp và vị trí camera thay đổi, nên không thể chỉ sao chép bản mô hình đã lưu rồi bảo robot mới chạy giống hệt.

Một chính sách điều khiển cũng có thể thất bại vì độ trễ hoặc giới hạn cơ học, dù nó hiểu đúng câu lệnh. Hãy tách lỗi chọn sai vật, lỗi quỹ đạo, lỗi kẹp và lỗi do môi trường thay đổi. Đọc video thành công cùng tỷ lệ thành công có số lần thử mới tránh được ấn tượng sai do vài đoạn quay đẹp.

## Liên hệ với nghiên cứu khác

### RT-1 nằm ở đâu trong lịch sử VLA?

VIMA nhấn mạnh cách mô tả mục tiêu bằng prompt đa phương thức trong mô phỏng. RT-1 xây bằng chứng cho việc huấn luyện chính sách điều khiển từ lượng lớn dữ liệu robot thật với câu lệnh ngôn ngữ. RT-2 tiến thêm một bước: dùng phần tri thức đã học từ dữ liệu ảnh và chữ trên Internet để hỗ trợ hiểu những yêu cầu robot mới.

RT-1 và Open X-Embodiment cũng liên hệ trực tiếp: khi dữ liệu đến từ nhiều kiểu robot, ngoài hình ảnh còn có vấn đề **lệnh điều khiển của hai phần cứng không có cùng ý nghĩa**. Chính vì vậy kết quả một chính sách điều khiển đa nhiệm là một bước tiến, không phải lời giải cuối cùng của chuyển giao sang mọi robot.

### Những bài nên đọc tiếp

- [RT-2](/paper/rt-2)
- [OpenVLA](/paper/openvla)

## Đọc mã nguồn và tự kiểm chứng

### Thử nghiệm nhỏ để tự kiểm tra

Lấy một cảnh có hai cốc và một ngăn kéo. Thử ra ba câu lệnh khác nhau trên cùng ảnh và ghi xem mô hình hướng tới đối tượng nào. Tiếp đó giữ câu lệnh cố định, thay khăn trải bàn hoặc đưa thêm vật gây nhiễu. Nếu hiệu quả giảm mạnh ở bước hai, vấn đề có thể nằm ở sự phụ thuộc vào bối cảnh chứ không hẳn ở việc hiểu từ ngữ.

Khi đọc lại RT-1, hãy tự trả lời: USE làm gì? FiLM thay đổi điều gì? Vì sao TokenLearner có ích cho tốc độ? Biểu đồ dữ liệu có đủ điều kiện để nói đa dạng quan trọng hay chưa? Trả lời được bốn câu ấy là đã hiểu phần xương sống.
