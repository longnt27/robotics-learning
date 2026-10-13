## Vì sao cần nghiên cứu này?

### Vì sao dự đoán token hành động có thể quá chậm?

Giả sử robot di chuyển tay theo một đường cong mượt, được ghi lại hàng trăm lần mỗi giây. Nếu mỗi giá trị lệnh được biến thành một token riêng, mô hình phải dự đoán rất nhiều token gần như giống nhau. Chuỗi dài khiến huấn luyện chậm và dễ sai ở tần số cao. **FAST tìm cách nén cả chuỗi hành động theo thời gian trước khi chuyển thành token**, thay vì mã hóa từng mẫu riêng lẻ.

Điểm cốt lõi: FAST là cách biểu diễn hành động, không phải một mô hình nhận biết ảnh hay chính sách điều khiển hoàn toàn độc lập. Nó giúp một kiểu mô hình sinh token làm việc hiệu quả hơn trên dữ liệu robot.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/fast/figure-1.webp)

![Hình 4 từ PDF gốc, trang 5](/paper-figures/fast/figure-4.webp)

![Hình 7 từ PDF gốc, trang 8](/paper-figures/fast/figure-7.webp)

## Kiến thức nền cần nắm

### Tần số và phép biến đổi DCT có ý nghĩa gì?

Một chuyển động mượt có nhiều mẫu thời gian nhưng phần lớn hình dạng được mô tả bằng vài thành phần biến thiên chậm. **Biến đổi cosin rời rạc (DCT)** chuyển chuỗi giá trị theo thời gian thành các hệ số tần số, cho phép giữ thông tin quan trọng bằng ít giá trị hơn.

**Lượng tử hóa** biến hệ số liên tục thành mã rời rạc; **BPE** ghép những mẫu mã thường gặp thành token để rút ngắn chuỗi. Nén quá mạnh có thể làm mất chi tiết tiếp xúc, nên không thể chỉ nhìn số token giảm mà kết luận mọi thứ đều tốt hơn.

![Hình 8 từ PDF gốc, trang 8](/paper-figures/fast/figure-8.webp)

![Hình 9 từ PDF gốc, trang 9](/paper-figures/fast/figure-9.webp)

## Phương pháp thực hiện

### FAST mã hóa và giải mã một đoạn hành động

Đầu tiên hệ thống lấy một đoạn hành động và chuẩn hóa để các chiều có biên độ phù hợp. Sau đó DCT chuyển nó sang miền tần số. Những hệ số được lượng tử hóa rồi ghép thành chuỗi mã, BPE tiếp tục nén thành token cuối cùng để mô hình tự hồi quy dự đoán.

Khi chạy, những token dự đoán được giải mã ngược: BPE → hệ số lượng tử → khôi phục hệ số → DCT ngược → chuỗi hành động theo thời gian → giải chuẩn hóa. Chỉ khi hoàn thành cả hai chiều chuyển đổi, robot mới nhận được lệnh vật lý đúng đơn vị.

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/fast/figure-2.webp)

![Hình 3 từ PDF gốc, trang 3](/paper-figures/fast/figure-3.webp)

![Hình 6 từ PDF gốc, trang 8](/paper-figures/fast/figure-6.webp)

## Ví dụ từng bước

### Ví dụ vẽ đường cong qua bốn điểm

Bạn có bốn điểm mốc và muốn mô tả một đường cong đi qua chúng. Nếu viết vị trí tại từng phần nghìn giây, bạn sẽ có một danh sách rất dài dù hình dạng tổng thể đơn giản. DCT cho phép ghi lại những thành phần hình dạng quan trọng hơn là từng điểm riêng lẻ.

Hình 3 thử tăng tần số lấy mẫu của đường cong. Cách chia giá trị từng bước thành khoảng rời rạc hoạt động ngày càng kém, trong khi FAST giữ dự đoán tốt hơn. Đây là một ví dụ sáng rõ về vấn đề biểu diễn, không cần nhớ công thức DCT ngay từ đầu.

![Hình 10 từ PDF gốc, trang 10](/paper-figures/fast/figure-10.webp)

## Kết quả thực nghiệm

### Đọc kết quả mà không nhầm tốc độ với chất lượng

Hình 6 so FAST, FSQ và cách chia giá trị thành các khoảng rời rạc. Các cách nén hành động giúp huấn luyện hiệu quả hơn; FAST đặc biệt có lợi ở thao tác robot thật cần sự khéo léo. Hình 9 so phiên bản π0 dùng diffusion với phiên bản giải mã FAST: tập nhỏ có thể gần nhau, tập lớn đôi khi hội tụ nhanh hơn.

FAST+ hướng tới một bộ mã hóa dùng chung cho nhiều kiểu robot. Khi đọc tỷ lệ thành công, vẫn cần xem số lần chạy và khoảng tin cậy. Tốc độ huấn luyện nhanh hơn không tự bảo đảm hành động cuối cùng chính xác hơn trong mọi nhiệm vụ.

### Số liệu và phạm vi kết luận

**Đối chiếu số liệu:** Trong một số thiết lập, dùng FAST cho phép huấn luyện mô hình sinh token hành động nhanh hơn tới khoảng năm lần so với cách chia từng mẫu thời gian thành token. Hình 6–11 vẫn đo tỷ lệ robot hoàn thành nhiệm vụ: nén nhanh hơn nhưng không giữ được chuyển động chính xác thì chẳng có ý nghĩa. FAST+ còn được đánh giá trên nhiều nguồn dữ liệu robot khác nhau nhằm kiểm tra tính dùng chung, thay vì chỉ tối ưu cho một kiểu tay máy.

![Hình 5 từ PDF gốc, trang 6](/paper-figures/fast/figure-5.webp)

![Hình 11 từ PDF gốc, trang 10](/paper-figures/fast/figure-11.webp)

## Hạn chế và câu hỏi còn mở

### Khi nào nén hành động có thể gây hại?

Một quỹ đạo đưa tay qua khoảng trống có thể rất mượt và dễ nén. Nhưng khi cắm linh kiện vào khe nhỏ hoặc khép kẹp robot ngay lúc chạm vật, thay đổi đột ngột có thể quan trọng. Nếu bộ mã hóa làm mất tín hiệu ấy, chính sách điều khiển sẽ sinh hành động mượt nhưng sai thời điểm.

Do đó nên đo sai số sau khi mã hóa–giải mã trên từng chiều và tại các đoạn có tiếp xúc. Cần kiểm tra cả kết quả robot thực hiện, không chỉ tỷ lệ nén.

## Liên hệ với nghiên cứu khác

### FAST liên quan thế nào tới OpenVLA và π0.5?

OpenVLA dùng token hành động, nhưng cách mã hóa từng giá trị có thể tạo chuỗi rất dài với dữ liệu tần số cao. FAST đề xuất nén ở cấp đoạn chuỗi. π0.5 tận dụng FAST trong một giai đoạn huấn luyện, rồi dùng flow matching để tạo chuỗi hành động liên tục ở giai đoạn sau.

Đây là các lựa chọn về định dạng mục tiêu và bộ sinh, không phải hai tên gọi cho cùng một kỹ thuật. Để so sánh, phải nhìn xem token đang mang thông tin gì.

### Những bài nên đọc tiếp

- [OpenVLA](/paper/openvla)
- [π0.5](/paper/pi-0-5)

## Đọc code và tự kiểm chứng

### Tự làm phép thử nhỏ trước khi huấn luyện chính sách điều khiển

Lấy 100 điểm vị trí của một chuyển động mượt. Áp dụng DCT, giữ số hệ số thấp rồi dựng lại đường. Đo sai số tổng thể và sai số ở chỗ chuyển hướng. Tiếp đó làm với một chuỗi có bước nhảy đột ngột tương ứng hành động đóng kẹp.

So hai kết quả sẽ thấy dữ liệu mượt dễ nén hơn; động tác tiếp xúc cần cẩn thận. Đây là phép thử giải thích FAST tốt hơn việc học thuộc rằng nó “nhanh hơn năm lần”.
