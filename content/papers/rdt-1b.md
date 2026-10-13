## Vì sao cần nghiên cứu này?

### Vì sao thao tác hai tay có nhiều cách đúng hơn?

Một robot một tay gắp khối có thể tiếp cận từ vài hướng. Robot hai tay còn phải quyết định tay nào giữ, tay nào di chuyển, có chuyển vật từ tay này sang tay kia không. Cùng một đích có thể có rất nhiều chuỗi cử động hợp lệ. Nếu mạng lấy trung bình những chuỗi khác nhau, hai tay có thể đi vào nhau hoặc làm rơi vật.

RDT-1B dùng Diffusion Transformer để học và sinh các đoạn hành động hai tay có tính phối hợp, nhận điều kiện từ ảnh, câu lệnh và trạng thái robot. Nó còn nghiên cứu cách học từ nhiều cấu hình robot.

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rdt-1b/figure-1.webp)

## Kiến thức nền cần nắm

### Những phần của bài toán cần phân biệt

**Sinh hành động bằng khử nhiễu (diffusion)** bắt đầu từ một chuỗi lệnh ngẫu nhiên rồi chỉnh qua nhiều vòng để tạo quỹ đạo phù hợp với quan sát. **Transformer** xử lý quan hệ giữa các thời điểm và nguồn thông tin; khi dùng cho khử nhiễu hành động thường được gọi là DiT. **Trạng thái robot** gồm thông tin khớp hiện tại, giúp mạng biết hai tay đang ở đâu.

**Không gian hành động chung** cho phép kết hợp dữ liệu nhiều robot, nhưng phải có cách mã hóa phù hợp từng loại. Cùng một chiều số trong vector không mặc nhiên đại diện cho cùng khớp giữa hai robot.

### ### Hai tay không chỉ làm hai việc độc lập

Giả sử một tay giữ hộp, tay kia đặt vật vào hộp. Nếu tay giữ buông trước khi tay còn lại đặt xong, cả chuỗi thất bại mặc dù mỗi tay có thể đã đi tới vị trí riêng đúng. Robot hai tay phải học **mối liên hệ về thời điểm và vị trí** giữa các khớp. RDT-1B sinh một đoạn hành động chung cho hai tay thay vì coi mỗi chuyển động là một dự đoán tách biệt. Thách thức còn lớn hơn khi dữ liệu đến từ nhiều robot có độ dài tay và kiểu kẹp khác nhau.

![Hình 3 từ PDF gốc, trang 4](/paper-figures/rdt-1b/figure-3.webp)

## Phương pháp thực hiện

### Từ ảnh, câu lệnh và nhiễu đến hai tay robot

Mô hình nhận ảnh từ camera ngoài và camera hai cổ tay, câu lệnh nhiệm vụ, trạng thái khớp và một chuỗi lệnh còn nhiễu. Nó còn nhận bước thời gian diffusion để biết đang ở giai đoạn khử nhiễu nào, cùng tần số điều khiển để hiểu nhịp hành động.

DiT kết hợp những điều kiện ấy và liên tục dự đoán cách chỉnh chuỗi hành động. Sau nhiều bước, mô hình thu được đoạn lệnh cho hai tay. Robot thực hiện và có thể lấy quan sát mới cho lần dự đoán sau. Các phần chuẩn hóa như QKNorm/RMSNorm góp phần giữ huấn luyện ổn định; chúng không phải những lệnh điều khiển động cơ độc lập.

### ### Vì sao mạng cần cả ảnh, trạng thái khớp và nhịp điều khiển?

Ảnh camera cho biết đồ vật đang ở đâu; camera cổ tay giúp thấy vùng kẹp khi tiếp xúc. Trạng thái khớp cho biết tay đang ở vị trí nào để tránh dự đoán lệnh không thể thực hiện ngay. Tần số điều khiển cho biết khoảng thời gian giữa hai lệnh: cùng một độ dịch chuyển có ý nghĩa khác nếu lệnh được gửi rất nhanh hay rất chậm. Bộ sinh DiT dùng những thông tin ấy khi khử nhiễu chuỗi hành động. Các kỹ thuật ổn định như QKNorm và RMSNorm giúp mô hình học thuận lợi hơn, nhưng chúng không thay thế được thông tin camera hay trạng thái khớp.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rdt-1b/figure-2.webp)

![Hình 4 từ PDF gốc, trang 6](/paper-figures/rdt-1b/figure-4.webp)

## Ví dụ từng bước

### Ví dụ hai tay cùng chuyển một khối

Giả sử robot cần đưa khối từ tay phải sang tay trái. Một tay phải kẹp chắc trong khi tay kia tới vị trí nhận, rồi hai tay phối hợp chuyển lực giữ. Nếu tay bên nhận kẹp quá sớm hoặc tay bên giao buông trước, khối có thể rơi.

Dự đoán từng tay độc lập khó giữ ràng buộc theo thời gian. RDT sinh một đoạn chuyển động chung để học mối liên hệ giữa các bước hai tay. Đây là lợi ích trực giác, nhưng vẫn cần đánh giá ngoài đời vì mô hình không tự có cảm biến lực hoàn hảo.

## Kết quả thực nghiệm

### Hiểu thí nghiệm và hình biểu diễn

Hình 4 kiểm tra độ ổn định khi bỏ QKNorm/RMSNorm và vai trò của một số thành phần đầu ra. Nếu đường hàm mất mát dao động mạnh, tối ưu hóa có thể gặp khó ngay trước khi robot thực thi. Các phép thử điều khiển còn tách kỹ năng đi thẳng và rót chính xác lượng nước.

Hình 5 nêu trạng thái ban đầu, mức thay đổi và mục tiêu từng nhiệm vụ. Đừng chỉ nhìn ảnh cuối; cần xem điều kiện thành công có đòi đúng lượng nước hay chỉ làm chuyển động gần đúng.

### 56% tương đối chỉ có ý nghĩa với phép so gốc

Bài báo báo cáo RDT-1B cải thiện tỷ lệ thành công trung bình khoảng 56% tương đối so với các phương pháp đối chứng được chọn. Những phép thử ít dữ liệu, có trường hợp chỉ một đến năm lần làm mẫu, cho thấy giá trị của việc huấn luyện trước đối với kỹ năng phối hợp hai tay. Khi đọc kết quả, cần phân biệt nhiệm vụ mẫu trong mô phỏng, robot thật và phép thử không cần tinh chỉnh; không nên lấy một mức tăng gộp để khẳng định mọi thao tác hai tay đều dễ hơn tương ứng.

### ### Đọc thử nghiệm ổn định khác thử nghiệm thành công

Một đường hàm mất mát ổn định trong Hình 4 cho thấy quá trình huấn luyện có khả năng hội tụ thuận lợi hơn. Nó **chưa chứng minh** tay robot sẽ kẹp đúng vật hay rót đúng lượng nước. Các nhiệm vụ thực thi trong Hình 5 và bảng kết quả mới kiểm tra khả năng vận động. Tương tự, mức cải thiện trung bình khoảng 56% tương đối phải gắn với tập đối chứng và cách tính của tác giả; nếu phương pháp đối chứng đạt 25%, tăng 56% tương đối nghĩa là khoảng 39%, chứ không phải 81%. Ví dụ số học này chỉ để giải thích cách đọc tỷ lệ.

![Hình 5 từ PDF gốc, trang 8](/paper-figures/rdt-1b/figure-5.webp)

## Hạn chế và câu hỏi còn mở

### Các giới hạn của RDT-1B

Mô hình lớn và quá trình khử nhiễu nhiều bước tiêu tốn tài nguyên tính toán, có thể gây trễ trong vòng điều khiển. Khả năng xử lý hai tay không tự đảm bảo mọi vật tiếp xúc đều an toàn, nhất là khi lực kẹp và ma sát thay đổi.

Huấn luyện đa robot vẫn đòi chuẩn hóa và ánh xạ hành động cẩn thận. Sai đơn vị một chiều có thể phá hỏng kết quả dù phần Transformer được huấn luyện đúng.

## Liên hệ với nghiên cứu khác

### So RDT-1B với ACT và Diffusion Policy

ACT cũng học chuỗi hành động nhiều bước cho hai tay, nhưng dùng Transformer và CVAE. Diffusion Policy học phân phối các chuỗi lệnh qua khử nhiễu, không nhất thiết chỉ dành cho hai tay. RDT áp dụng hướng Diffusion Transformer ở quy mô lớn hơn, điều kiện hóa nhiều nguồn tín hiệu và chú trọng phối hợp hai tay.

Việc tăng số tham số không phải đóng góp duy nhất: khả năng biểu diễn nhiều robot và huấn luyện ổn định là những quyết định thiết kế quan trọng.

### Những bài nên đọc tiếp

- [Diffusion Policy](/paper/diffusion-policy)
- [GR00T N1](/paper/groot-n1)

## Đọc mã nguồn và tự kiểm chứng

### Bài tập kiểm chứng đơn giản

Vẽ một nhiệm vụ chuyển khối từ tay phải sang tay trái và liệt kê thứ tự tiếp cận, kẹp nhận, chuyển lực giữ, buông giao. Ghi xem lệnh của tay nào phụ thuộc tay nào tại mỗi bước. Nếu chỉ dự đoán hai tay độc lập, bước nào dễ bị lệch nhịp nhất?

Sau đó đọc Hình 3 và chỉ ra ảnh cổ tay, trạng thái khớp, nhiễu hành động và tần số điều khiển được đưa vào ở đâu. Những câu hỏi này giúp nối sơ đồ mạng với công việc thật.
