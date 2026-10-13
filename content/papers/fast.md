## Vì sao cần nghiên cứu này?

Robot có thể tạo hàng chục lệnh điều khiển mỗi giây. Nếu biến từng con số ở từng thời điểm thành một token riêng, mô hình phải dự đoán một chuỗi rất dài dù chuyển động thực tế chỉ là một đường cong tương đối mượt. Điều này khiến huấn luyện tốn công và khó xử lý chuyển động tần số cao. **FAST nén cả đoạn chuyển động trong miền tần số trước khi tạo token.** Hãy hình dung một đường cong có hàng trăm điểm: thay vì ghi từng điểm, ta lưu các thành phần mô tả hình dạng chung của đường. Khi giải mã, các thành phần ấy được đổi ngược thành lệnh ở từng thời điểm. Mục tiêu là giảm số token cần dự đoán mà vẫn giữ được chi tiết đủ chính xác để robot thực hiện những thao tác khéo léo.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 5](/paper-figures/fast/figure-4.webp)
![Hình 7 từ PDF gốc, trang 8](/paper-figures/fast/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/fast/figure-1.webp)


### Vì sao dự đoán token hành động có thể quá chậm?

Giả sử robot di chuyển tay theo một đường cong mượt, được ghi lại hàng trăm lần mỗi giây. Nếu mỗi giá trị lệnh được biến thành một token riêng, mô hình phải dự đoán rất nhiều token gần như giống nhau. Chuỗi dài khiến huấn luyện chậm và dễ sai ở tần số cao. **FAST tìm cách nén cả chuỗi hành động theo thời gian trước khi chuyển thành token**, thay vì mã hóa từng mẫu riêng lẻ.

Điểm cốt lõi: FAST là cách biểu diễn hành động, không phải một mô hình nhận biết ảnh hay chính sách điều khiển hoàn toàn độc lập. Nó giúp một kiểu mô hình sinh token làm việc hiệu quả hơn trên dữ liệu robot.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Nếu robot có bảy chiều hành động và ghi 50 thời điểm, cách mã hóa một token cho mỗi giá trị có thể tạo ra **350 token cho một đoạn chuyển động**. Với dữ liệu tần số cao, chuỗi càng dài khiến mô hình tự hồi quy dự đoán chậm và tốn bộ nhớ.

Một chuyển động mượt gồm nhiều vị trí liên tiếp gần giống nhau, nên nếu mã hóa từng giá trị riêng thì phải dự đoán rất nhiều thông tin lặp. Bộ mã hóa theo đoạn có thể biểu diễn hình dạng quỹ đạo ngắn gọn hơn. **FAST tận dụng điều đó để nén cả đoạn**, không cố biến từng số đo thành một token riêng. Đây là phương pháp biểu diễn lệnh, không phải một bộ điều khiển robot hoàn toàn mới.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 8 từ PDF gốc, trang 8](/paper-figures/fast/figure-8.webp)
![Hình 9 từ PDF gốc, trang 9](/paper-figures/fast/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tần số và phép biến đổi DCT có ý nghĩa gì?

Một chuyển động mượt có nhiều mẫu thời gian nhưng phần lớn hình dạng được mô tả bằng vài thành phần biến thiên chậm. **Biến đổi cosin rời rạc (DCT)** chuyển chuỗi giá trị theo thời gian thành các hệ số tần số, cho phép giữ thông tin quan trọng bằng ít giá trị hơn.

**Lượng tử hóa** biến hệ số liên tục thành mã rời rạc; **BPE** ghép những mẫu mã thường gặp thành token để rút ngắn chuỗi. Nén quá mạnh có thể làm mất chi tiết tiếp xúc, nên không thể chỉ nhìn số token giảm mà kết luận mọi thứ đều tốt hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

FAST trước tiên chuẩn hóa một đoạn lệnh, dùng **biến đổi cosin rời rạc (DCT)** đưa chuỗi từ miền thời gian sang miền tần số. Với chuyển động mượt, nhiều thông tin tập trung ở một số hệ số tần số thấp. Sau bước DCT, các hệ số được làm tròn về những mức rời rạc (lượng tử hóa), rồi nén tiếp bằng BPE để tạo token. Khi chạy, hệ thống làm ngược các bước ấy, khôi phục đoạn lệnh theo thời gian trước khi gửi cho robot.

Bản **FAST+** được huấn luyện trên khoảng **một triệu quỹ đạo** từ nhiều nguồn, hướng tới dùng chung bộ mã hóa thay vì tạo riêng cho mỗi robot. Khi robot chạy, token phải được giải mã và biến đổi ngược về chuỗi lệnh vật lý trước khi gửi tới bộ điều khiển.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 3](/paper-figures/fast/figure-3.webp)
![Hình 6 từ PDF gốc, trang 8](/paper-figures/fast/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/fast/figure-2.webp)


### FAST mã hóa và giải mã một đoạn hành động

Đầu tiên hệ thống lấy một đoạn hành động và chuẩn hóa để các chiều có biên độ phù hợp. Sau đó DCT chuyển nó sang miền tần số. Những hệ số được lượng tử hóa rồi ghép thành chuỗi mã, BPE tiếp tục nén thành token cuối cùng để mô hình tự hồi quy dự đoán.

Khi chạy, những token dự đoán được giải mã ngược: BPE → hệ số lượng tử → khôi phục hệ số → DCT ngược → chuỗi hành động theo thời gian → giải chuẩn hóa. Chỉ khi hoàn thành cả hai chiều chuyển đổi, robot mới nhận được lệnh vật lý đúng đơn vị.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử cánh tay robot di chuyển thành một đường cong gồm 50 điểm theo thời gian. Thay vì mô tả từng tọa độ, DCT biểu diễn hình dạng đường bằng những hệ số cho biến đổi nhanh/chậm. Giữ đủ hệ số quan trọng có thể tái tạo đường khá chính xác với ít thông tin hơn.

Đầu tiên chuẩn hóa lệnh, chuyển DCT, mã hóa các hệ số và nén thành token. Khi nhận token từ mô hình, giải mã rồi dùng DCT ngược để khôi phục 50 bước. Nếu robot phải đóng kẹp đúng khoảnh khắc chạm vật, tín hiệu có thể thay đổi đột ngột. Những thay đổi nhanh này khó nén hơn; bỏ mất chúng có thể khiến đường đi vẫn mượt nhưng kẹp sai thời điểm.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 10 từ PDF gốc, trang 10](/paper-figures/fast/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ vẽ đường cong qua bốn điểm

Bạn có bốn điểm mốc và muốn mô tả một đường cong đi qua chúng. Nếu viết vị trí tại từng phần nghìn giây, bạn sẽ có một danh sách rất dài dù hình dạng tổng thể đơn giản. DCT cho phép ghi lại những thành phần hình dạng quan trọng hơn là từng điểm riêng lẻ.

Hình 3 thử tăng tần số lấy mẫu của đường cong. Cách chia giá trị từng bước thành khoảng rời rạc hoạt động ngày càng kém, trong khi FAST giữ dự đoán tốt hơn. Đây là một ví dụ sáng rõ về vấn đề biểu diễn, không cần nhớ công thức DCT ngay từ đầu.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Các phép thử cho thấy FAST và FAST+ tạo chuỗi token ngắn hơn cách chia từng giá trị liên tục thành các mức rời rạc, đặc biệt với hành động ghi ở tần số cao. Nhóm tác giả báo cáo một số thiết lập **huấn luyện nhanh hơn khoảng năm lần** mà vẫn giữ chất lượng điều khiển cạnh tranh với các phương pháp sinh hành động liên tục được thử.

FAST+ dùng được cho nhiều tập dữ liệu mà không phải tạo bộ mã hóa riêng cho từng nguồn. Tuy vậy, tốc độ **huấn luyện** và độ trễ **suy luận lúc robot chạy** là hai chỉ số khác nhau; mô hình tự hồi quy vẫn cần sinh token tuần tự.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/fast/figure-5.webp)
![Hình 11 từ PDF gốc, trang 10](/paper-figures/fast/figure-11.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả mà không nhầm tốc độ với chất lượng

Hình 6 so FAST, FSQ và cách chia giá trị thành các khoảng rời rạc. Các cách nén hành động giúp huấn luyện hiệu quả hơn; FAST đặc biệt có lợi ở thao tác robot thật cần sự khéo léo. Hình 9 so phiên bản π0 dùng diffusion với phiên bản giải mã FAST: tập nhỏ có thể gần nhau, tập lớn đôi khi hội tụ nhanh hơn.

FAST+ hướng tới một bộ mã hóa dùng chung cho nhiều kiểu robot. Khi đọc tỷ lệ thành công, vẫn cần xem số lần chạy và khoảng tin cậy. Tốc độ huấn luyện nhanh hơn không tự bảo đảm hành động cuối cùng chính xác hơn trong mọi nhiệm vụ.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

DCT khai thác đặc tính chuyển động mượt. Khi robot cắm linh kiện vào khe nhỏ, va chạm hoặc đột ngột đóng kẹp, tín hiệu quan trọng có thể nằm ở những thay đổi nhanh theo thời gian. Nén không phù hợp sẽ làm mất chi tiết và khiến hành động mượt nhưng sai.

FAST cũng chưa tự loại bỏ mọi độ trễ của mô hình sinh token tuần tự. Bộ mã hóa dùng chung còn phải xử lý nhiều đơn vị và dạng lệnh giữa khớp, đầu kẹp, bàn tay hoặc bệ di động. Cần đánh giá cả sai số sau giải mã và tỷ lệ hoàn thành trên robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Khi nào nén hành động có thể gây hại?

Một quỹ đạo đưa tay qua khoảng trống có thể rất mượt và dễ nén. Nhưng khi cắm linh kiện vào khe nhỏ hoặc khép gripper ngay lúc chạm vật, thay đổi đột ngột có thể quan trọng. Nếu bộ mã hóa làm mất tín hiệu ấy, chính sách điều khiển sẽ sinh hành động mượt nhưng sai thời điểm.

Do đó nên đo sai số sau khi mã hóa–giải mã trên từng chiều và tại các đoạn có tiếp xúc. Cần kiểm tra cả kết quả robot thực hiện, không chỉ tỷ lệ nén.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [OpenVLA](/paper/openvla)
- [π0.5](/paper/pi-0-5)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### FAST liên quan thế nào tới OpenVLA và π0.5?

OpenVLA dùng token hành động, nhưng cách mã hóa từng giá trị có thể tạo chuỗi rất dài với dữ liệu tần số cao. FAST đề xuất nén ở cấp đoạn chuỗi. π0.5 tận dụng FAST trong một giai đoạn huấn luyện, rồi dùng flow matching để tạo chuỗi hành động liên tục ở giai đoạn sau.

Đây là các lựa chọn về định dạng mục tiêu và bộ sinh, không phải hai tên gọi cho cùng một kỹ thuật. Để so sánh, phải nhìn xem token đang mang thông tin gì.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Tạo hai đoạn lệnh giả lập: một đường cong chuyển động mượt và một chuỗi có thay đổi đột ngột khi đóng kẹp. Cho cả hai qua bộ mã hóa FAST rồi giải mã ngược, vẽ đường gốc và đường khôi phục.

Thay độ dài đoạn và mức nén, đo **số token**, sai số tái tạo và thời gian mã hóa/giải mã. Nếu tín hiệu quan trọng ở lúc tiếp xúc bị mất dù sai số trung bình nhỏ, bạn sẽ thấy vì sao chỉ tối ưu tỷ lệ nén chưa đủ cho robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự làm phép thử nhỏ trước khi huấn luyện chính sách điều khiển

Lấy 100 điểm vị trí của một chuyển động mượt. Áp dụng DCT, giữ số hệ số thấp rồi dựng lại đường. Đo sai số tổng thể và sai số ở chỗ chuyển hướng. Tiếp đó làm với một chuỗi có bước nhảy đột ngột tương ứng hành động đóng kẹp.

So hai kết quả sẽ thấy dữ liệu mượt dễ nén hơn; động tác tiếp xúc cần cẩn thận. Đây là phép thử giải thích FAST tốt hơn việc học thuộc rằng nó “nhanh hơn năm lần”.

<!-- END EXTENDED WALKTHROUGH -->

