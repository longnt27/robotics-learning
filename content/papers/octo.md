## Vì sao cần nghiên cứu này?

Một phòng thí nghiệm nhỏ khó có đủ dữ liệu và GPU để huấn luyện mô hình điều khiển robot từ đầu. Nhưng họ có thể có vài chục hoặc vài trăm lượt thao tác mẫu của robot mình. **Octo cung cấp một chính sách điều khiển nguồn mở đã học trên nhiều loại nhiệm vụ robot, rồi cho phép tinh chỉnh nhanh trên dữ liệu mới.** Kiến trúc được thiết kế để có thể thay đổi loại quan sát hoặc dạng lệnh đầu ra mà không nhất thiết phải huấn luyện lại toàn bộ phần mạng chung. Tất nhiên vẫn phải kiểm tra cách chuyển lệnh cho phần cứng đích; một bản trọng số đã lưu không tự chạy được với mọi cấu trúc robot.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/octo/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/octo/figure-1.webp)


### Một chính sách điều khiển có thể điều khiển nhiều robot không?

Mỗi loại robot có camera, lệnh và nhiệm vụ khác nhau. Nếu chỉ huấn luyện một chính sách điều khiển cho mỗi thiết bị, ta rất khó tận dụng kinh nghiệm chung về nhặt, đặt và di chuyển vật. Octo dùng một mạng Transformer đã học từ nhiều nguồn dữ liệu, sau đó cho phép tinh chỉnh nhanh với một robot mới.

Đóng góp ở đây không phải tuyên bố mọi robot dùng được cùng một vector lệnh. Điều đáng chú ý là **kiến trúc có thể thay phần đầu vào và đầu ra mà vẫn tái sử dụng được phần học chung**.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Octo là một **chính sách điều khiển robot đã được huấn luyện trước** trên nhiều nhiệm vụ, sau đó có thể tinh chỉnh bằng dữ liệu của robot mới. Mục tiêu không phải một bản trọng số đã lưu điều khiển ngay mọi loại phần cứng mà không cần kiểm tra gì.

Khi đổi robot, những kiến thức chung như nhận ra vật thể hoặc mục tiêu đặt vật có thể tái sử dụng. Tuy nhiên camera, trạng thái khớp và định dạng hành động khác nhau cần được xử lý ở các phần đầu vào/đầu ra tương ứng. Đây là lý do Octo quan tâm cả kiến trúc mạng lẫn giao diện để tinh chỉnh.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 6](/paper-figures/octo/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu backbone và các phần gắn thêm

**Backbone** là phần mạng xử lý thông tin chung; Octo dùng Transformer. **Token nhiệm vụ** biểu diễn yêu cầu người dùng, còn **token quan sát** biểu diễn ảnh camera. **Nhánh đầu ra** biến biểu diễn đã học thành lệnh phù hợp với robot đích.

Hai robot có thể cùng hiểu “đặt cốc vào khay” nhưng một bên nhận lệnh vị trí đầu kẹp, bên kia nhận góc khớp. Phần nhánh đầu ra giúp xử lý sự khác biệt ấy, nhưng vẫn phải chọn đúng biểu diễn và chuẩn hóa hành động.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Octo dùng Transformer khoảng **93 triệu tham số**, huấn luyện trước từ khoảng **800.000 lượt thực thi** thuộc **25 bộ dữ liệu** trong Open X-Embodiment. Mô hình nhận ảnh, câu lệnh hoặc ảnh mục tiêu, trạng thái robot và lịch sử quan sát. Các nhánh xử lý tín hiệu và nhánh dự đoán hành động được thiết kế để thay đổi khi chuyển sang robot khác.

Lệnh liên tục được sinh bằng một nhánh theo hướng diffusion, không cần biến mọi giá trị thành token văn bản. Khi muốn dùng một camera mới hoặc cấu trúc khớp mới, người nghiên cứu có thể thay bộ tiếp nhận hoặc nhánh hành động rồi tinh chỉnh bằng lượt thao tác mẫu của thiết bị đích.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/octo/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/octo/figure-2.webp)


### Octo xử lý đầu vào và đầu ra thế nào?

Đầu tiên mô tả nhiệm vụ được mã hóa bằng mô hình ngôn ngữ đã học trước; camera được một mạng ảnh gọn chuyển thành đặc trưng. Transformer xử lý cả hai nhóm token và lịch sử cần thiết, tạo các token trung gian cho nhánh dự đoán hành động.

Khi chuyển sang robot mới, ta có thể thêm quan sát như cảm biến lực hoặc đổi nhánh lệnh điều khiển mà không phải thay toàn bộ backbone. Một số tham số vẫn cần tinh chỉnh bằng demonstration của robot đích. Chính cách tách phần chung và phần riêng làm Octo phù hợp cho nghiên cứu thích nghi nhiều thiết bị.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot A từng học nhiều việc nhặt và đặt. Nay muốn dùng Octo cho robot B có camera đặt khác và kẹp rộng hơn. Trước tiên phải kiểm tra ảnh, trạng thái và lệnh của B có cùng quy ước với dữ liệu mô hình đã học không. Nếu khác, cần bộ chuyển đổi thích hợp.

Sau đó thu một số lượt thao tác mẫu của B để tinh chỉnh. Khi đánh giá, thử số lượng mẫu tăng dần, chẳng hạn 20, 50 và 100 lượt. Nếu bản trọng số đã lưu đã huấn luyện trước học nhanh hơn một chính sách điều khiển bắt đầu từ đầu với cùng dữ liệu B, đó mới là bằng chứng có ích về chuyển giao.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ từ tay máy đơn sang robot hai tay

chính sách điều khiển từng học nhiều nhiệm vụ nhặt và đặt bằng tay máy đơn. Khi chuyển sang robot hai tay, khái niệm vị trí đích hoặc quan sát vật thể có thể hữu ích, nhưng lệnh hai tay phối hợp có số chiều và ràng buộc khác. Người nghiên cứu cần gắn nhánh đầu ra phù hợp và đưa demonstration về hai tay để tinh chỉnh.

Nếu chỉ lấy lệnh cũ gửi xuống robot mới, chuyển động có thể sai hoàn toàn. Vì vậy khả năng tinh chỉnh nhanh phải được chứng minh bằng dữ liệu robot đích và tỷ lệ thành công sau khi tinh chỉnh, không chỉ nhìn tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên một số phép thử robot thật không cần tinh chỉnh, Octo có tỷ lệ hoàn thành trung bình tốt hơn RT-1-X và trong vài trường hợp cạnh tranh với RT-2-X lớn hơn nhiều. Tuy nhiên hiệu quả thay đổi theo kiểu robot và dạng chỉ dẫn. Có thiết lập dùng ảnh mục tiêu tốt hơn câu lệnh văn bản vì nguồn học trước có phân bố dữ liệu không đồng đều.

Lợi thế quan trọng của Octo là **tinh chỉnh với ít lượt thao tác mẫu** trên robot đích. Một số phép thử chỉ cần cỡ 100 lượt và đạt kết quả tốt hơn những chính sách huấn luyện từ đầu. Khi đọc biểu đồ, hãy tách rõ kết quả chưa tinh chỉnh với kết quả đã học thêm trên robot mới.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 8](/paper-figures/octo/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc các thí nghiệm Octo

Hình 4 thể hiện nhiều loại nhiệm vụ trên chín thiết lập robot thật, gồm nhặt đồ, thao tác dài và lắp vật chính xác. Hình 5 kiểm tra việc dùng checkpoint trực tiếp trong những môi trường nằm trong nguồn học trước; điều này khác với thử trên môi trường hoàn toàn chưa thấy.

Hình 6 cho thấy tăng kích thước mô hình giúp cải thiện trong một số phép thử, nhưng số lượt ở từng nhiệm vụ cần được đọc cùng kết quả. Quan trọng nhất là tách điểm của mô hình chưa tinh chỉnh khỏi điểm sau khi sử dụng dữ liệu đích.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Dữ liệu học trước của Octo không bao phủ đồng đều mọi loại camera và câu lệnh, nên những tín hiệu ít xuất hiện có thể cho kết quả kém. Bộ dữ liệu chủ yếu là những lần thao tác thành công; khả năng phục hồi sau lỗi chưa được dạy đầy đủ.

Kiến trúc có thể thay nhánh đầu ra không có nghĩa bộ chuyển đổi hành động tự đúng. Khi đổi robot, cần kiểm tra giới hạn khớp, đơn vị, chuẩn hóa và tần số điều khiển. Octo thích hợp làm nền để tinh chỉnh hơn là một bộ điều khiển phổ quát cắm vào đâu cũng chạy.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những giới hạn phải giữ trong đầu

Octo học từ một tập con được chọn của Open X, nên không phải tất cả robot và kỹ năng ngoài đời đều có mặt. Khi đổi cảm biến hoặc hành động, nhánh mới có thể cần dữ liệu đủ tốt; chỉ linh hoạt về cấu trúc không bảo đảm robot hoạt động thành công.

Tốc độ suy luận và an toàn của lệnh motor cũng cần kiểm tra trên phần cứng. Một chính sách điều khiển tổng quát rất tốt offline vẫn có thể chậm hoặc thiếu chính xác ở bài toán kẹp nhỏ.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Open X-Embodiment](/paper/open-x-embodiment)
- [OpenVLA](/paper/openvla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### So Octo với OpenVLA và RT-X

RT-X là hướng thử học chung từ dữ liệu nhiều robot. Octo phát triển kiến trúc mở có thể thay quan sát/đầu ra; OpenVLA dùng lõi mô hình ảnh–ngôn ngữ để dự đoán token lệnh. Các mô hình khác về kiến trúc và cách tinh chỉnh, không chỉ khác tên.

Khi chọn nền tảng để nghiên cứu, hãy xét bộ dữ liệu hỗ trợ robot đích, dạng lệnh đầu ra, chi phí huấn luyện và số demonstration cần cho một nhiệm vụ mới.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Lấy một tập dữ liệu robot nhỏ và trước tiên chạy bộ đọc dữ liệu, kiểm tra ảnh, trạng thái, lệnh và mặt nạ chiều hành động. Chỉ khi mọi đầu vào đúng mới tải bản trọng số đã lưu và thử suy luận. Nếu thiếu tài nguyên, có thể kiểm tra quy trình dữ liệu trên máy cá nhân trước, còn chạy mô hình trên GPU phù hợp.

So cùng nhiệm vụ giữa Octo tinh chỉnh và chính sách huấn luyện từ đầu, giữ số lượt thao tác mẫu bằng nhau. Ghi tỷ lệ thành công cùng thời gian và bộ nhớ cần thiết, không chỉ kiểm tra mô hình có xuất được một vector lệnh.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự thử xây một phép đánh giá

Chọn hai robot có cùng nhiệm vụ “nhặt và đặt” nhưng nhận lệnh khác nhau. Trên robot thứ hai, so chính sách điều khiển từ đầu với Octo được tinh chỉnh bằng cùng 20, 50 hoặc 100 demonstration. Đo tỷ lệ thành công theo lượng dữ liệu tăng.

Nếu thêm camera cổ tay, hãy xem việc mở rộng đầu vào thực sự có cải thiện so với cấu hình không thêm không. Đây là cách thử đóng góp của kiến trúc thay vì chỉ kể rằng Octo hỗ trợ nhiều loại tín hiệu.

<!-- END EXTENDED WALKTHROUGH -->

