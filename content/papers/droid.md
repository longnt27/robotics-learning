## Vì sao cần nghiên cứu này?

### Vì sao chỉ thu dữ liệu trong một phòng thí nghiệm là chưa đủ?

Nếu robot luôn thực hành trên một chiếc bàn, dưới một dàn đèn và với người vận hành quen thuộc, nó có thể vô tình ghi nhớ bối cảnh. Sang căn bếp khác, camera nhìn từ góc mới và đồ vật chưa gặp, chính sách điều khiển sẽ sai dù nhiệm vụ “nhặt rồi đặt” vẫn giống. **DROID mở rộng việc thu dữ liệu ra nhiều tòa nhà và phòng làm việc thật**, để mô hình học được sự đa dạng thường gặp khi triển khai.

Đóng góp quan trọng ở đây là cơ sở dữ liệu và phương pháp tổ chức thu thập trên nhiều địa điểm. Không nên nhầm DROID với một thuật toán sinh hành động mới.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/droid/figure-1.webp)

![Hình 3 từ PDF gốc, trang 5](/paper-figures/droid/figure-3.webp)

![Hình 4 từ PDF gốc, trang 6](/paper-figures/droid/figure-4.webp)

![Hình 6 từ PDF gốc, trang 7](/paper-figures/droid/figure-6.webp)

![Hình 7 từ PDF gốc, trang 8](/paper-figures/droid/figure-7.webp)

## Kiến thức nền cần nắm

### Hiểu ba cấp độ đa dạng

**Đa dạng nhiệm vụ** là robot được yêu cầu làm nhiều việc khác nhau. **Đa dạng cảnh** là cùng một việc diễn ra trên nhiều nền, ánh sáng và cách bố trí đồ. **Đa dạng góc nhìn** là camera quan sát cùng vật từ các vị trí khác nhau. Những loại đa dạng này có tác dụng khác nhau khi robot gặp điều kiện mới.

DROID ghi ảnh từ ba camera đồng bộ, có thông số hiệu chuẩn và dữ liệu độ sâu. Những chi tiết ấy quan trọng: nếu hai góc camera không khớp thời gian, mô hình có thể học nhầm quan hệ giữa vị trí vật và hành động.

## Phương pháp thực hiện

### DROID được thu như thế nào?

Nhóm nghiên cứu chuẩn hóa một bộ thiết bị có thể mang tới nhiều nơi: tay máy Franka, camera nổi gắn ngoài và ở cổ tay, cùng bộ điều khiển thực tế ảo. Người vận hành đưa robot tới phòng hoặc căn bếp mới, làm nhiệm vụ và ghi lại quỹ đạo với câu lệnh tương ứng. Cùng phần cứng chuẩn giúp giảm khác biệt do loại robot, trong khi bối cảnh được chủ động thay đổi.

Từ các quỹ đạo này, chính sách điều khiển có thể được học chung với dữ liệu nhiệm vụ đích. Sau đó người ta đánh giá không chỉ ở bối cảnh quen mà còn với đồ vật hoặc vật gây nhiễu chưa thấy. Đây là phép thử xem nguồn dữ liệu rộng có thực sự giúp tăng độ bền không.

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/droid/figure-2.webp)

![Hình 10 từ PDF gốc, trang 10](/paper-figures/droid/figure-10.webp)

## Ví dụ từng bước

### Ví dụ nấu đậu lăng trong căn bếp mới

Robot phải mở nắp chảo, nhặt rồi đổ đậu lăng, sau đó bật bếp. Đây là nhiệm vụ dài, nhiều điểm có thể lỗi: nắm sai nắp, đổ lệch chảo hoặc thao tác nhầm núm bếp. Khi trong cảnh xuất hiện vật gây nhiễu, chính sách điều khiển còn phải xác định đâu là vật cần thao tác.

Dữ liệu ở nhiều bếp giúp chính sách điều khiển có cơ hội học những dấu hiệu ổn định hơn màu nền hoặc vị trí một chiếc bát cụ thể. Hình 9 so các lần robot chạy thật để thấy thao tác nào được cải thiện, thay vì chỉ xem tỷ lệ cuối.

![Hình 9 từ PDF gốc, trang 10](/paper-figures/droid/figure-9.webp)

## Kết quả thực nghiệm

### Đọc biểu đồ đa dạng cảnh

Hình 8 cho thấy học chung với DROID cải thiện tỷ lệ thành công ở cả điều kiện tương tự dữ liệu học và điều kiện khác dữ liệu. Mức tăng so phương án tốt thứ hai được báo cáo bằng điểm phần trăm tuyệt đối, không phải tăng bao nhiêu lần.

Hình 10 thực sự kiểm tra vai trò của số cảnh: so một phần dữ liệu DROID nhiều bối cảnh với phần chỉ từ 20 bối cảnh. Nếu nguồn đa dạng tốt hơn ở điều kiện mới, đó là bằng chứng hợp lý rằng thay cảnh trong huấn luyện giúp khả năng khái quát. Cần đọc số lần chạy và sai số trước khi kết luận mạnh hơn.

### Số liệu và phạm vi kết luận

**Đối chiếu số liệu:** Khi bổ sung DROID vào dữ liệu huấn luyện nhiệm vụ đích, nhóm tác giả báo cáo mức tăng trung bình khoảng 22 điểm phần trăm trong điều kiện quen và 17 điểm phần trăm trong điều kiện ngoài phân phối so với phương án đối chứng tốt thứ hai. Hình 10 còn cho thấy tập con có nhiều cảnh thường tốt hơn tập con ít cảnh dù có số quỹ đạo tương tự. Điều này ủng hộ việc thu dữ liệu phong phú về bối cảnh, không chỉ cố kéo dài giờ thu ở một chiếc bàn.

![Hình 5 từ PDF gốc, trang 6](/paper-figures/droid/figure-5.webp)

![Hình 8 từ PDF gốc, trang 9](/paper-figures/droid/figure-8.webp)

## Hạn chế và câu hỏi còn mở

### DROID vẫn có những điểm giới hạn

Các ví dụ được thu bằng một bộ thiết bị tương đối đồng nhất, vì vậy kết quả không chứng minh lệnh có thể chuyển trực tiếp sang robot có cấu trúc tay khác. Phần lớn lần làm mẫu cũng phản ánh những nơi và nhiệm vụ nhóm thu thập chọn, không phải phân phối đầy đủ của mọi nhà ở trên thế giới.

Một bộ dữ liệu nhiều quỹ đạo có thể có lỗi thời gian, calibration hoặc nhãn câu lệnh. Việc tuyển lọc và đánh giá trên robot thật vẫn bắt buộc trước khi dùng cho hệ thống vận hành thực tế.

## Liên hệ với nghiên cứu khác

### DROID, BridgeData và Open X có vai trò gì?

BridgeData V2 mở rộng kỹ năng và cảnh trên một thiết lập thao tác tương đối nhất quán. DROID tăng mạnh số địa điểm thực tế cùng độ phong phú cảnh. Open X trộn thêm nhiều loại robot, vì thế có cả vấn đề thống nhất hành động.

Khi chọn dữ liệu cho một project, hãy hỏi lỗi cần giải là gặp đồ vật mới, gặp phòng mới hay đổi robot mới. Không nên chỉ tải nguồn có số quỹ đạo lớn nhất.

### Những bài nên đọc tiếp

- [Open X-Embodiment](/paper/open-x-embodiment)
- [RoboCasa](/paper/robocasa)

## Đọc mã nguồn và tự kiểm chứng

### Bài tập để kiểm tra độ phụ thuộc vào bối cảnh

Giữ cùng câu lệnh “nhặt túi khoai tây chiên”, nhưng đặt túi trên ba mặt bàn có màu và ánh sáng khác nhau. Huấn luyện từ cùng số lần làm mẫu, lần lượt chọn tập có ít cảnh và tập đa dạng. Đo tỷ lệ thành công trên cảnh chưa xuất hiện khi học.

Nếu chính sách điều khiển thất bại khi thêm một vật giống túi khác bên cạnh, đó còn là vấn đề phân biệt vật đích. Việc ghi loại lỗi giúp hiểu DROID hỗ trợ phần nào, không chỉ nhận một điểm tổng hợp.
