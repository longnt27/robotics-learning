## Vì sao cần nghiên cứu này?

### Vì sao dự đoán token hành động có thể quá chậm?

Giả sử robot di chuyển tay theo một đường cong mượt, được ghi lại hàng trăm lần mỗi giây. Nếu mã hóa từng giá trị điều khiển ở từng mốc thời gian bằng token riêng, mô hình phải sinh một chuỗi rất dài dù tay robot đang di chuyển khá mượt. Chuỗi token càng dài, mô hình sinh từng token càng tốn bước tính; lỗi ở một mã cũng có thể ảnh hưởng những phần chuyển động được giải mã phía sau. **FAST tìm cách nén cả chuỗi hành động theo thời gian trước khi chuyển thành token**, thay vì mã hóa từng mẫu riêng lẻ.

Điểm cốt lõi: FAST là cách biểu diễn hành động, không phải một mô hình nhận biết ảnh hay chính sách điều khiển hoàn toàn độc lập. Nó giúp một kiểu mô hình sinh token làm việc hiệu quả hơn trên dữ liệu robot.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/fast/figure-1.webp)

![Hình 4 từ PDF gốc, trang 5](/paper-figures/fast/figure-4.webp)

![Hình 7 từ PDF gốc, trang 8](/paper-figures/fast/figure-7.webp)

## Kiến thức nền cần nắm

### Tần số và phép biến đổi DCT có ý nghĩa gì?

Một chuyển động mượt có nhiều mẫu thời gian nhưng phần lớn hình dạng được mô tả bằng vài thành phần biến thiên chậm. **Biến đổi cosin rời rạc (DCT)** chuyển chuỗi giá trị theo thời gian thành các hệ số tần số, cho phép giữ thông tin quan trọng bằng ít giá trị hơn.

**Lượng tử hóa** biến hệ số liên tục thành mã rời rạc; **BPE** ghép những mẫu mã thường gặp thành token để rút ngắn chuỗi. Nén quá mạnh có thể làm mất chi tiết tiếp xúc, nên không thể chỉ nhìn số token giảm mà kết luận mọi thứ đều tốt hơn.

### Hệ số tần số nói được điều gì về đường tay robot?

Hãy vẽ vị trí đầu kẹp theo thời gian. Một cú đưa tay dài, đều đặn tạo đường cong thay đổi chậm; một cú chạm nhanh hoặc đóng kẹp gấp tạo đoạn thay đổi đột ngột. Biến đổi cosin rời rạc (DCT) diễn tả chuỗi ấy bằng các thành phần biến thiên nhanh và chậm. Với chuyển động mượt, vài thành phần chậm có thể giữ được phần lớn hình dạng. Bởi vậy FAST nén ở **cấp cả đoạn chuyển động**, khác với việc lấy từng vị trí rồi chia vào những khoảng giá trị rời rạc. Hiểu điểm này quan trọng hơn việc nhớ tên DCT.

![Hình 8 từ PDF gốc, trang 8](/paper-figures/fast/figure-8.webp)

![Hình 9 từ PDF gốc, trang 9](/paper-figures/fast/figure-9.webp)

## Phương pháp thực hiện

### FAST mã hóa và giải mã một đoạn hành động

Đầu tiên hệ thống lấy một đoạn hành động và chuẩn hóa để các chiều có biên độ phù hợp. Sau đó DCT chuyển nó sang miền tần số. Những hệ số được lượng tử hóa rồi ghép thành chuỗi mã, BPE tiếp tục nén thành token cuối cùng để mô hình tự hồi quy dự đoán.

Khi chạy, những token dự đoán được giải mã ngược: BPE → hệ số lượng tử → khôi phục hệ số → DCT ngược → chuỗi hành động theo thời gian → giải chuẩn hóa. Chỉ khi hoàn thành cả hai chiều chuyển đổi, robot mới nhận được lệnh vật lý đúng đơn vị.

### Đi một vòng mã hóa rồi giải mã để hiểu FAST

Giả sử đoạn hành động có 100 mốc thời gian. FAST chuẩn hóa các chiều, biến chuỗi sang hệ số tần số, lượng tử hóa rồi ghép các mã thường gặp thành token. Mô hình sinh token thay vì sinh toàn bộ giá trị ở 100 mốc. Khi cần phát lệnh, bộ giải mã làm ngược các bước ấy để khôi phục chuỗi hành động liên tục. Nếu thao tác chỉ là đưa tay qua khoảng trống, sai số nhỏ có thể chấp nhận được. Nếu ngay một mốc robot phải khép kẹp đúng lúc tiếp xúc, mất một đỉnh thay đổi nhanh có thể làm hỏng cả việc. Vì thế nén tốt không đồng nghĩa điều khiển tốt.

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

### Tốc độ huấn luyện phải đi kèm sai số giải mã

Bài báo báo cáo π0-FAST cần ít giờ GPU huấn luyện hơn tới khoảng năm lần so với mô hình π0 sinh hành động bằng diffusion, trong khi đạt chất lượng tương đương ở những phép thử được công bố. Đây là phép so hai chính sách sinh hành động, **không phải** mức tăng tốc đo trực tiếp giữa FAST và cách chia từng mẫu thành token. Phép so bộ mã hóa token thông thường nằm ở Bảng I và Hình 6. Hình 6–11 vẫn đo tỷ lệ robot hoàn thành nhiệm vụ: nén nhanh hơn nhưng không giữ được chuyển động chính xác thì chẳng có ý nghĩa. FAST+ còn được đánh giá trên nhiều nguồn dữ liệu robot khác nhau nhằm kiểm tra tính dùng chung, thay vì chỉ tối ưu cho một kiểu tay máy.

### Cách kiểm tra liệu việc nén có thật sự đáng giá

Đầu tiên đo số token cần sinh và tốc độ huấn luyện với cùng dữ liệu. Tiếp đó cho một chuỗi hành động đi qua bộ mã hóa–giải mã mà **chưa cần huấn luyện mô hình**, rồi đo sai số khôi phục theo thời gian, đặc biệt ở lúc chạm và thả vật. Cuối cùng mới chạy robot để đo tỷ lệ hoàn thành. Nếu một phiên bản huấn luyện nhanh hơn nhưng thường kẹp lệch thời điểm, cải thiện về tốc độ không đáng đánh đổi. Ba tầng đánh giá này giải thích vì sao các hình kết quả của FAST không thể chỉ đọc một cột về thời gian tính toán.

![Hình 5 từ PDF gốc, trang 6](/paper-figures/fast/figure-5.webp)

![Hình 11 từ PDF gốc, trang 10](/paper-figures/fast/figure-11.webp)

## Hạn chế và câu hỏi còn mở

### Khi nào nén hành động có thể gây hại?

Một quỹ đạo đưa tay qua khoảng trống có thể rất mượt và dễ nén. Nhưng khi cắm linh kiện vào khe nhỏ hoặc khép kẹp robot ngay lúc chạm vật, thay đổi đột ngột có thể quan trọng. Nếu bộ mã hóa làm mất tín hiệu ấy, chính sách điều khiển sẽ sinh hành động mượt nhưng sai thời điểm.

Do đó nên đo sai số sau khi mã hóa–giải mã trên từng chiều và tại các đoạn có tiếp xúc. Cần kiểm tra cả kết quả robot thực hiện, không chỉ tỷ lệ nén.

**Một đánh đổi dễ bị bỏ qua:** FAST có thể giúp **huấn luyện nhanh hơn** nhưng không mặc nhiên giúp **suy luận nhanh hơn**. Mục VI-E của bài gốc báo phiên bản π0 sinh token bằng FAST cần khoảng **750 mili giây để tạo một đoạn hành động dài một giây** trên RTX 4090, trong khi phiên bản π0 dùng diffusion mất khoảng **100 mili giây**. Lý do là FAST phải sinh các token lần lượt bằng mạng ngôn ngữ lớn, còn diffusion dùng ít bước khử nhiễu hơn trong phép so đó. Hai con số thuộc một thiết lập cụ thể nhưng đủ để bác bỏ suy luận “nén được nhiều hơn thì robot chắc chắn điều khiển nhanh hơn”.

## Liên hệ với nghiên cứu khác

### FAST liên quan thế nào tới OpenVLA và π0.5?

OpenVLA dùng token hành động, nhưng cách mã hóa từng giá trị có thể tạo chuỗi rất dài với dữ liệu tần số cao. FAST đề xuất nén ở cấp đoạn chuỗi. π0.5 tận dụng FAST trong một giai đoạn huấn luyện, rồi dùng flow matching để tạo chuỗi hành động liên tục ở giai đoạn sau.

Đây là các lựa chọn về định dạng mục tiêu và bộ sinh, không phải hai tên gọi cho cùng một kỹ thuật. Để so sánh, phải nhìn xem token đang mang thông tin gì.

### Những bài nên đọc tiếp

- [OpenVLA](/paper/openvla)
- [π0.5](/paper/pi-0-5)

## Đọc mã nguồn và tự kiểm chứng

### Tự làm phép thử nhỏ trước khi huấn luyện chính sách điều khiển

Lấy 100 điểm vị trí của một chuyển động mượt. Áp dụng DCT, giữ số hệ số thấp rồi dựng lại đường. Đo sai số tổng thể và sai số ở chỗ chuyển hướng. Tiếp đó làm với một chuỗi có bước nhảy đột ngột tương ứng hành động đóng kẹp.

So hai kết quả sẽ thấy dữ liệu mượt dễ nén hơn; động tác tiếp xúc cần cẩn thận. Đây là phép thử giải thích FAST tốt hơn việc học thuộc rằng nó “nhanh hơn năm lần”.
