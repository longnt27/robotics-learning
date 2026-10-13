## Vì sao cần nghiên cứu này?

### Một chính sách điều khiển có thể điều khiển nhiều robot không?

Mỗi loại robot có camera, lệnh và nhiệm vụ khác nhau. Nếu chỉ huấn luyện một chính sách điều khiển cho mỗi thiết bị, ta rất khó tận dụng kinh nghiệm chung về nhặt, đặt và di chuyển vật. Octo dùng một mạng Transformer đã học từ nhiều nguồn dữ liệu, sau đó cho phép tinh chỉnh nhanh với một robot mới.

Đóng góp ở đây không phải tuyên bố mọi robot dùng được cùng một vector lệnh. Điều đáng chú ý là **kiến trúc có thể thay phần đầu vào và đầu ra mà vẫn tái sử dụng được phần học chung**.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/octo/figure-1.webp)

![Hình 3 từ PDF gốc, trang 4](/paper-figures/octo/figure-3.webp)

## Kiến thức nền cần nắm

### Hiểu mạng nền và các phần gắn thêm

**Lõi mạng (backbone)** là phần xử lý thông tin dùng chung; trong Octo, phần đó được xây bằng Transformer. **Token nhiệm vụ** biểu diễn yêu cầu người dùng, còn **token quan sát** biểu diễn ảnh camera. **Nhánh đầu ra** biến biểu diễn đã học thành lệnh phù hợp với robot đích.

Hai robot có thể cùng hiểu “đặt cốc vào khay” nhưng một bên nhận lệnh vị trí đầu kẹp, bên kia nhận góc khớp. Phần nhánh đầu ra giúp xử lý sự khác biệt ấy, nhưng vẫn phải chọn đúng biểu diễn và chuẩn hóa hành động.

### Dùng chung phần hiểu cảnh khác dùng chung góc khớp

Cùng yêu cầu “đặt chiếc cốc vào khay”, một robot có thể cần dịch đầu kẹp theo ba trục, còn robot khác cần điều khiển từng góc khớp riêng. Hai máy vẫn có thể chia sẻ kiến thức về cốc, khay và mục tiêu đặt đồ, nhưng **dãy số điều khiển** không tự nhiên trùng nhau. Octo tách phần xử lý thông tin chung khỏi phần nhận dạng đầu vào và sinh lệnh phù hợp thiết bị. Nhờ vậy nó có cơ hội tận dụng dữ liệu robot khác mà không giả định chỉ cần sao chép nguyên một lệnh đã học.

![Hình 4 từ PDF gốc, trang 6](/paper-figures/octo/figure-4.webp)

## Phương pháp thực hiện

### Octo xử lý đầu vào và đầu ra thế nào?

Đầu tiên mô tả nhiệm vụ được mã hóa bằng mô hình ngôn ngữ đã học trước; camera được một mạng ảnh gọn chuyển thành đặc trưng. Transformer xử lý cả hai nhóm token và lịch sử cần thiết, tạo các token trung gian cho nhánh dự đoán hành động.

Khi chuyển sang robot mới, ta có thể thêm quan sát như cảm biến lực hoặc đổi nhánh lệnh điều khiển mà không phải thay toàn bộ mạng nền. Một số tham số vẫn cần tinh chỉnh bằng lần làm mẫu của robot đích. Chính cách tách phần chung và phần riêng làm Octo phù hợp cho nghiên cứu thích nghi nhiều thiết bị.

### Điều gì được giữ lại khi chuyển Octo sang robot mới?

Hãy hình dung lõi Transformer giống phần đã học cách liên hệ ảnh, câu lệnh và động tác trong nhiều ví dụ. Khi sang tay máy mới, các ảnh có thể đến từ góc khác, còn lệnh cuối có số chiều khác. Ta thay hoặc bổ sung phần tiếp nhận tín hiệu và nhánh xuất hành động, rồi tinh chỉnh bằng một số lượt làm mẫu của robot đích. Điều này khác hoàn toàn với việc đặt một bản mô hình đã lưu lên thiết bị mới và mong nó hoạt động ngay. Nếu nhánh hành động giải mã sai đơn vị, mạng vẫn có thể chọn đúng vật nhưng tay máy di chuyển sai hướng.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/octo/figure-2.webp)

![Hình 5 từ PDF gốc, trang 6](/paper-figures/octo/figure-5.webp)

## Ví dụ từng bước

### Ví dụ từ tay máy đơn sang robot hai tay

Một chính sách điều khiển từng học nhiều nhiệm vụ nhặt và đặt bằng tay máy đơn. Khi chuyển sang robot hai tay, khái niệm vị trí đích hoặc quan sát vật thể có thể hữu ích, nhưng lệnh hai tay phối hợp có số chiều và ràng buộc khác. Người nghiên cứu cần gắn nhánh đầu ra phù hợp và đưa lần làm mẫu về hai tay để tinh chỉnh.

Nếu chỉ lấy lệnh cũ gửi xuống robot mới, chuyển động có thể sai hoàn toàn. Vì vậy khả năng tinh chỉnh nhanh phải được chứng minh bằng dữ liệu robot đích và tỷ lệ thành công sau khi tinh chỉnh, không chỉ nhìn tên kiến trúc.

## Kết quả thực nghiệm

### Đọc các thí nghiệm Octo

Hình 4 thể hiện nhiều loại nhiệm vụ trên chín thiết lập robot thật, gồm nhặt đồ, thao tác dài và lắp vật chính xác. Hình 5 kiểm tra việc dùng bản mô hình đã lưu trực tiếp trong những môi trường nằm trong nguồn học trước; điều này khác với thử trên môi trường hoàn toàn chưa thấy.

Hình 6 cho thấy tăng kích thước mô hình giúp cải thiện trong một số phép thử, nhưng số lượt ở từng nhiệm vụ cần được đọc cùng kết quả. Quan trọng nhất là tách điểm của mô hình chưa tinh chỉnh khỏi điểm sau khi sử dụng dữ liệu đích.

### Phải tách chạy trực tiếp và tinh chỉnh trên robot đích

Trong một số phép thử chưa tinh chỉnh, Octo đạt tỷ lệ thành công trung bình cao hơn RT-1-X khoảng 29% tương đối theo cách tính trong bài báo. Lợi thế quan trọng hơn là thích nghi: sau khi tinh chỉnh bằng cỡ 100 lần làm mẫu của robot đích, Octo có thể vượt một số phương pháp huấn luyện từ đầu trong các thiết lập được báo cáo. Khi xem Hình 4–6, phải tách kết quả dùng trực tiếp checkpoint và kết quả sau tinh chỉnh; số dữ liệu dành cho robot mới quyết định ý nghĩa phép so.

### Có hai câu hỏi đánh giá phải trả lời riêng

Một là mô hình **chưa tinh chỉnh** có làm được việc trong bối cảnh mới không. Hai là sau một lượng dữ liệu robot đích nhất định, nó **thích nghi nhanh** đến đâu so với huấn luyện từ đầu. Những con số trong bài về dùng trực tiếp và tinh chỉnh bằng khoảng 100 lượt làm mẫu trả lời hai câu hỏi khác nhau. Để so công bằng, hãy ghi rõ số lượt mẫu được phép dùng, kiến trúc đầu ra và robot đánh giá. Mức tăng trung bình so với RT-1-X cũng chỉ có ý nghĩa trong tập nhiệm vụ và quy ước so sánh được tác giả sử dụng.

![Hình 6 từ PDF gốc, trang 8](/paper-figures/octo/figure-6.webp)

## Hạn chế và câu hỏi còn mở

### Những giới hạn phải giữ trong đầu

Octo học từ một tập con được chọn của Open X, nên không phải tất cả robot và kỹ năng ngoài đời đều có mặt. Khi đổi cảm biến hoặc hành động, nhánh mới có thể cần dữ liệu đủ tốt; chỉ linh hoạt về cấu trúc không bảo đảm robot hoạt động thành công.

Tốc độ suy luận và an toàn của lệnh điều khiển động cơ cũng cần kiểm tra trên phần cứng. Một chính sách điều khiển tổng quát rất tốt trên dữ liệu ghi sẵn vẫn có thể chậm hoặc thiếu chính xác ở bài toán kẹp nhỏ.

## Liên hệ với nghiên cứu khác

### So Octo với OpenVLA và RT-X

RT-X là hướng thử học chung từ dữ liệu nhiều robot. Octo phát triển kiến trúc mở có thể thay quan sát/đầu ra; OpenVLA dùng lõi mô hình ảnh–ngôn ngữ để dự đoán token lệnh. Các mô hình khác về kiến trúc và cách tinh chỉnh, không chỉ khác tên.

Khi chọn nền tảng để nghiên cứu, hãy xét bộ dữ liệu hỗ trợ robot đích, dạng lệnh đầu ra, chi phí huấn luyện và số lần làm mẫu cần cho một nhiệm vụ mới.

### Những bài nên đọc tiếp

- [Open X-Embodiment](/paper/open-x-embodiment)
- [OpenVLA](/paper/openvla)

## Đọc mã nguồn và tự kiểm chứng

### Tự thử xây một phép đánh giá

Chọn hai robot có cùng nhiệm vụ “nhặt và đặt” nhưng nhận lệnh khác nhau. Trên robot thứ hai, so chính sách điều khiển từ đầu với Octo được tinh chỉnh bằng cùng 20, 50 hoặc 100 lần làm mẫu. Đo tỷ lệ thành công theo lượng dữ liệu tăng.

Nếu thêm camera cổ tay, hãy xem việc mở rộng đầu vào thực sự có cải thiện so với cấu hình không thêm không. Đây là cách thử đóng góp của kiến trúc thay vì chỉ kể rằng Octo hỗ trợ nhiều loại tín hiệu.
