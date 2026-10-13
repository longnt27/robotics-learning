## Vì sao cần nghiên cứu này?

### Vì sao lấy trung bình hành động có thể làm robot đâm vào vật?

Giả sử robot muốn đẩy một khối qua chướng ngại. Trong dữ liệu huấn luyện, một nửa người vận hành vòng bên trái và nửa còn lại vòng bên phải. Cả hai đều đúng. Nếu mạng học dự đoán một giá trị bằng cách giảm sai số bình phương, nó có thể chọn quỹ đạo ở giữa hai hướng, tức đi thẳng vào chướng ngại. Vấn đề không nằm ở thiếu nhãn, mà ở chỗ **một trạng thái có thể có nhiều đáp án vận động hợp lệ**.

Diffusion Policy không ép các lượt thao tác mẫu về một đường đi “trung bình”. Nó học cách tạo ra cả chuỗi hành động giống các đường đi hợp lệ, rồi lấy mẫu để chọn một đường nhất quán trong mỗi lần chạy. Đây là ý chính cần giữ khi đọc công thức khử nhiễu.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/diffusion-chính sách điều khiển/figure-1.webp)

![Hình 7 từ PDF gốc, trang 6](/paper-figures/diffusion-chính sách điều khiển/figure-7.webp)

## Kiến thức nền cần nắm

### Hiểu ba cách dự đoán trước khi nhìn công thức

**chính sách điều khiển tường minh** có thể nhận ảnh rồi dự đoán trực tiếp lệnh; khi nhiều cách thao tác cùng đúng, một giá trị trung bình dễ trở thành phương án tồi. **chính sách điều khiển ngầm** đánh giá xem một hành động phù hợp với quan sát tới mức nào rồi tìm hành động có điểm tốt. Cách này linh hoạt nhưng khâu tìm kiếm có thể khó tối ưu hoặc chạy không ổn định.

**Mô hình diffusion** bắt đầu từ một chuỗi lệnh ngẫu nhiên, rồi sửa đi sửa lại theo hướng mô hình đã học cho đến khi trông giống chuyển động hợp lệ trong dữ liệu. **Đoạn hành động (action đoạn hành động)** là nhiều bước liên tiếp được dự đoán cùng lúc. Nhờ vậy mô hình không cần tự chọn hướng mới một cách thiếu nhất quán ở từng khung hình.

## Phương pháp thực hiện

### Từ ảnh camera tới chuỗi chuyển động

**Bước 1:** lấy một số quan sát mới nhất từ camera và trạng thái robot. **Bước 2:** sinh một đoạn chuỗi hành động toàn nhiễu, coi như chưa biết robot sẽ đi đâu. **Bước 3:** mạng dự đoán phần nhiễu cần loại bỏ dựa trên hình ảnh và chuỗi hiện tại. Lặp nhiều lần, đoạn chuyển động dần trở nên có cấu trúc: tiếp cận khối, chạm đúng cạnh, rồi đẩy.

**Bước 4:** robot chỉ thực thi một phần đầu của đoạn đã sinh. Sau đó camera cung cấp ảnh mới và mô hình tạo đoạn tiếp theo. Đây là điều khiển có quan sát lại, khác với việc phát một quỹ đạo duy nhất rồi để robot chạy hết. Trong kiến trúc CNN, FiLM đưa thông tin quan sát vào các lớp xử lý; trong bản Transformer, chú ý chéo kết nối token hành động với đặc trưng quan sát.

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/diffusion-chính sách điều khiển/figure-2.webp)

![Hình 3 từ PDF gốc, trang 3](/paper-figures/diffusion-chính sách điều khiển/figure-3.webp)

![Hình 8 từ PDF gốc, trang 9](/paper-figures/diffusion-chính sách điều khiển/figure-8.webp)

## Ví dụ từng bước

### Hình dung bài toán đẩy khối chữ T

Trên bàn, khối chữ T cần được đẩy vào vùng đích. Robot có thể vòng một bên rồi đổi hướng đẩy, hoặc bắt đầu từ bên khác mà vẫn tới đúng chỗ. Diffusion Policy học sự khác biệt giữa những phương án này. Khi đã chọn tiếp cận từ bên phải trong một lần chạy, chuỗi lệnh cần tiếp tục theo cách đó, không đột nhiên nhảy sang trái ở bước kế.

Bây giờ người dùng xê dịch khối trong lúc robot đang đi tới vùng đích. Nếu camera cập nhật đủ nhanh, chính sách điều khiển có cơ hội nhận ra vị trí mới và tạo chuỗi lệnh sửa sai. Ví dụ ở Hình 9 cho thấy hiện tượng này trong thí nghiệm; nhưng nó không có nghĩa mọi loại nhiễu đều được xử lý tốt.

![Hình 4 từ PDF gốc, trang 4](/paper-figures/diffusion-chính sách điều khiển/figure-4.webp)

![Hình 9 từ PDF gốc, trang 9](/paper-figures/diffusion-chính sách điều khiển/figure-9.webp)

## Kết quả thực nghiệm

### Đọc kết quả và thí nghiệm tách thành phần

Điểm cần theo dõi không chỉ là tỷ lệ thành công tổng hợp. Hình 4 so khả năng giữ một cách đi xuyên suốt lần thực thi; Hình 5 thay loại lệnh vị trí/vận tốc; Hình 6 thay độ dài đoạn hành động và độ trễ. Một đoạn quá dài có thể mượt nhưng khó phản ứng với vật bị di chuyển; đoạn quá ngắn có thể cập nhật nhanh nhưng dễ dao động. Đấy là sự đánh đổi có ý nghĩa thực tế.

**Ablation** tức thử bỏ hoặc đổi riêng một thành phần để xem tác dụng của nó. Thí nghiệm này không phải “nghiên cứu phá vỡ”. Khi đọc các biểu đồ, hãy hỏi tỷ lệ thành công được đo trên bao nhiêu lượt chạy và đường sai số có lớn không. Kết quả hàm mất mát tốt hơn chưa chắc dẫn tới thao tác tốt hơn, như so sánh với IBC ở Hình 7.



### Số liệu và phạm vi kết luận

**Đối chiếu số liệu:** Nhóm tác giả kiểm tra 12 nhiệm vụ thuộc bốn nhóm bộ đánh giá, với kết quả tổng hợp cải thiện khoảng 46,9% theo quy ước so sánh của bài báo. Đây là con số gộp, không có nghĩa mọi robot và mọi nhiệm vụ đều tăng đúng 46,9 điểm phần trăm. Khi xem Hình 4–9, hãy chú ý riêng ba hiện tượng: quỹ đạo có giữ được một cách vòng vật cản nhất quán không, robot có biết đổi kế hoạch khi vật bị xê dịch không, và độ trễ tăng có khiến chuỗi hành động bị giật hoặc thất bại không.

![Hình 5 từ PDF gốc, trang 5](/paper-figures/diffusion-chính sách điều khiển/figure-5.webp)

![Hình 6 từ PDF gốc, trang 5](/paper-figures/diffusion-chính sách điều khiển/figure-6.webp)

![Hình 10 từ PDF gốc, trang 9](/paper-figures/diffusion-chính sách điều khiển/figure-10.webp)

![Hình 11 từ PDF gốc, trang 10](/paper-figures/diffusion-chính sách điều khiển/figure-11.webp)

## Hạn chế và câu hỏi còn mở

### Giới hạn của quá trình sinh nhiều bước

Sinh chuỗi bằng khử nhiễu thường cần nhiều lượt tính toán. Nếu robot cần lệnh mỗi vài chục mili giây mà GPU chậm, chính sách có thể không kịp trả lời. Dự đoán đoạn dài giúp che bớt độ trễ nhưng không xóa được sai số camera, tiếp xúc hoặc khác biệt phần cứng.

Ngoài ra, mô hình học các kiểu thao tác dựa trên dữ liệu quan sát. Nếu bài kiểm tra đòi dạng tiếp xúc hoàn toàn khác, mạng có thể sinh chuỗi trông mượt nhưng vẫn sai. Không nên dùng một video thao tác đẹp để suy ra mô hình đã hiểu đầy đủ vật lý của môi trường.

## Liên hệ với nghiên cứu khác

### Kết nối với ACT, FAST và RTC

ACT cũng dự đoán đoạn hành động nhưng dùng Transformer và CVAE để học từ lượt thao tác mẫu; Diffusion Policy dùng quá trình khử nhiễu để sinh chuỗi có nhiều khả năng. FAST lại không phải một chính sách điều khiển diffusion khác: nó là cách mã hóa và nén chuỗi hành động thành token để mô hình tự hồi quy dự đoán dễ hơn.

RTC giải bài toán triển khai nảy sinh sau đó: nếu phải mất thời gian mới sinh xong đoạn hành động tiếp theo, làm sao nối hai chuỗi mà robot không giật hoặc dừng? Ba hướng nghiên cứu bổ sung nhau: **sinh hành động → biểu diễn hành động → thực thi hành động đúng nhịp**.

### Những bài nên đọc tiếp

- [RDT-1B](/paper/rdt-1b)
- [GR00T N1](/paper/groot-n1)
- [π0.5](/paper/pi-0-5)
- [RTC (suy luận)](/paper/rtc-suy luận)

## Đọc mã nguồn và tự kiểm chứng

### Tự thử để thấy vì sao nhiều phương án là quan trọng

Vẽ hai đường đi tránh một khối trên giấy: một vòng trái, một vòng phải. Lấy trung bình điểm tương ứng của hai đường, rồi nhìn xem đường trung bình có đi qua vật cản không. Đây là cách hình dung đơn giản hạn chế của dự đoán hành động trung bình.

Tiếp tục đặt câu hỏi: tại mỗi lần cập nhật camera, diffusion sinh lại toàn bộ đoạn hay chỉ phần sẽ được thực thi? Nếu tăng độ dài đoạn, lỗi nào có thể xuất hiện? Nếu nguồn ảnh bị trễ, đường đi mượt có đủ chứng minh điều khiển an toàn? Trả lời được sẽ giúp đọc đúng hơn phần đánh giá thực nghiệm.
