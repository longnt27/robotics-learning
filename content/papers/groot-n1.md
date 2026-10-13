## Vì sao cần nghiên cứu này?

### Vì sao robot hình người không thể chỉ học từ một tập lượt thao tác mẫu nhỏ?

Robot hai tay, robot di động và robot hình người có số khớp, kiểu kẹp và cảm biến rất khác nhau. Thu hàng triệu lượt thực hành đúng với mỗi phần cứng sẽ cực kỳ tốn kém. GR00T N1 tìm cách khai thác nhiều tầng dữ liệu: video người dễ thu, video tạo tổng hợp, lượt thao tác mẫu robot nhiều loại và dữ liệu chi tiết của robot mục tiêu.

Bài toán không đơn giản là “mô hình nhìn video rồi bắt chước tay người”. Video người có thể giúp hiểu thứ tự và mục tiêu chuyển động, nhưng lệnh motor vẫn phải thích ứng với cấu trúc robot. Vì vậy GR00T có phần xử lý ảnh/câu lệnh và phần chuyên sinh hành động vận động.

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/groot-n1/figure-1.webp)

![Hình 5 từ PDF gốc, trang 7](/paper-figures/groot-n1/figure-5.webp)

![Hình 6 từ PDF gốc, trang 10](/paper-figures/groot-n1/figure-6.webp)

![Hình 14 từ PDF gốc, trang 25](/paper-figures/groot-n1/figure-14.webp)

## Kiến thức nền

### Tách hiểu cảnh khỏi tạo chuyển động

Trong GR00T N1, **VLM** đọc ảnh và lệnh để hình thành biểu diễn ngữ nghĩa: vật cần nhặt là gì, mục tiêu ở đâu. **Action expert** dùng thông tin ấy, cùng trạng thái khớp và loại robot, để dự đoán chuyển động. Action expert được xây bằng Diffusion Transformer; nó sinh hành động chứ không viết câu trả lời cho người dùng.

**Biểu diễn nhận biết robot** giúp phần sinh lệnh hiểu đang điều khiển cánh tay đơn hay hệ hai tay nhiều khớp. Hai robot có thể chia sẻ ý tưởng “dịch tay sang trái”, nhưng góc khớp cụ thể không giống nhau. Đó là lý do mạng có bộ mã hóa riêng cho trạng thái và hành động theo từng cấu trúc.

![Hình 3 từ PDF gốc, trang 4](/paper-figures/groot-n1/figure-3.webp)

![Hình 4 từ PDF gốc, trang 6](/paper-figures/groot-n1/figure-4.webp)

## Phương pháp thực hiện

### Những gì diễn ra từ câu lệnh đến lệnh motor

Giả sử câu lệnh là “chuyển quả táo từ tay trái sang tay phải rồi đặt vào giỏ”. Camera ghi cảnh và trạng thái khớp ghi vị trí hiện tại. Mô hình VLM Eagle-2 biến ảnh/câu lệnh thành đặc trưng, sau đó chuyển thông tin liên quan sang các khối DiT bằng chú ý chéo.

Action expert nhận thêm biểu diễn trạng thái của robot và chuỗi hành động nhiễu, liên tục chỉnh chuỗi cho tới khi tạo ra đoạn lệnh vận động. Lệnh cần được chuyển về đúng dạng phần cứng thực thi. Robot nhận quan sát mới khi di chuyển. Mạng ngữ nghĩa giúp chọn việc cần làm; bộ sinh hành động mới quyết định quỹ đạo thực tế.

### Theo dõi một đoạn hành động qua hai nhánh mạng

Có thể hình dung hệ thống như hai người cùng làm việc. Người thứ nhất nhìn camera và đọc yêu cầu để nhận ra chiếc hộp nào cần mở, chiếc cốc nào cần đặt vào. Người thứ hai nhận mục tiêu ấy cùng vị trí khớp hiện tại rồi tính cách chuyển động. Trong GR00T N1, phần đầu do mô hình ảnh–ngôn ngữ đảm nhiệm, phần sau do mạng DiT chuyên sinh hành động thực hiện. Kết nối bằng chú ý chéo cho phép nhánh vận động sử dụng thông tin thị giác thay vì tự suy ra mục tiêu từ nhiễu.

Dữ liệu huấn luyện cũng có các vai trò khác nhau. Video người giúp học trình tự và hình dạng thao tác; lượt thao tác mẫu robot giúp học lệnh khớp khả thi; quỹ đạo tổng hợp mở rộng cảnh nhưng cần kiểm tra nhãn vận động suy ra có đúng không. Khó khăn lớn là cùng một hành vi ở hai robot có thể cần góc khớp hoàn toàn khác. Việc mã hóa loại robot và giải chuẩn hóa hành động là bước kỹ thuật bắt buộc.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/groot-n1/figure-2.webp)

![Hình 8 từ PDF gốc, trang 13](/paper-figures/groot-n1/figure-8.webp)

![Hình 11 từ PDF gốc, trang 21](/paper-figures/groot-n1/figure-11.webp)

![Hình 12 từ PDF gốc, trang 21](/paper-figures/groot-n1/figure-12.webp)

## Ví dụ từng bước

### Ví dụ hai tay chuyền quả táo

Robot đang giữ táo bằng tay trái, tay phải phải đưa tới đúng vị trí, kẹp chắc rồi tay trái mới thả. Một mạng chỉ biết “đưa táo vào giỏ” chưa đủ nếu không dự đoán đúng thứ tự phối hợp hai tay. Hình 11 cho thấy một ví dụ robot chưa tinh chỉnh vẫn hoàn thành chuyển tay trong bố cục mới, nhưng chuyển động còn giật.

Điều này cho thấy kiến thức từ giai đoạn huấn luyện rộng có thể hữu ích trước khi học riêng nhiệm vụ. Tuy nhiên một lượt thành công mang tính minh họa chưa thay thế đánh giá trên nhiều vị trí, vật và số lượt thử.

![Hình 7 từ PDF gốc, trang 11](/paper-figures/groot-n1/figure-7.webp)

![Hình 13 từ PDF gốc, trang 22](/paper-figures/groot-n1/figure-13.webp)

## Kết quả thực nghiệm

### Dữ liệu video tổng hợp thực sự giúp gì?

Hình 5 và Hình 13 trình bày các video được mô hình sinh từ ảnh ban đầu cùng prompt thay đổi. Mục tiêu là tạo thêm quỹ đạo/hình ảnh cho những việc khó hoặc đắt nếu phải quay bằng robot thật. Có thể tạo các góc nhìn khác nhau, thay vật thể hoặc nối nhiều đoạn thành nhiệm vụ dài.

Hình 9 kiểm tra riêng việc bổ sung quỹ đạo sinh ở các chế độ dữ liệu ít/nhiều. Điều quan trọng là video tổng hợp không tự có nhãn hành động robot chính xác; cần suy ra lệnh bằng phương pháp phù hợp, chẳng hạn mô hình động học ngược, và xác minh chất lượng. Nếu nhãn sai, thêm dữ liệu còn có thể làm chính sách điều khiển kém.

### Hiệu năng phải gắn với phần cứng và dữ liệu

Bài báo có phiên bản GR00T N1 khoảng hai tỷ tham số; một thiết lập báo thời gian sinh đoạn hành động khoảng 63,9 mili giây trên GPU L40. Đây không phải độ trễ bảo đảm cho mọi máy. Kết quả so mô hình đã huấn luyện trước với mô hình học từ đầu cần đặt cạnh số lượt thao tác mẫu của từng nhiệm vụ, ví dụ 30 hay 300 lượt. Nếu khoảng cách giảm khi có nhiều mẫu hơn, lợi ích nổi bật của huấn luyện trước có thể là tiết kiệm dữ liệu chứ chưa chắc đạt giới hạn cao hơn ở mọi nhiệm vụ.

Khi đọc các ảnh ví dụ, chú ý phân biệt trường hợp robot chưa tinh chỉnh và trường hợp đã được học thêm dữ liệu của robot đích. Hai điều kiện này trả lời hai câu hỏi nghiên cứu khác nhau.

![Hình 9 từ PDF gốc, trang 16](/paper-figures/groot-n1/figure-9.webp)

![Hình 10 từ PDF gốc, trang 20](/paper-figures/groot-n1/figure-10.webp)

## Hạn chế và câu hỏi còn mở

### Những điều chưa nên suy rộng

Robot hình người phải thỏa các ràng buộc cân bằng, tiếp xúc, giới hạn lực và an toàn mà dữ liệu video đơn thuần không mô tả đầy đủ. Khả năng vận động tay tốt trong một vài nhiệm vụ chưa có nghĩa robot tự giữ thăng bằng và làm được mọi việc nhà.

Các loại dữ liệu khác nhau cũng có độ tin cậy khác nhau. Video tạo sinh có thể chứa chuyển động không tuân theo vật lý; lượt thao tác mẫu thật thì hiếm. Kết quả cần xem cả nguồn dữ liệu, loại robot thử và điều kiện khởi tạo, không chỉ tổng số giờ huấn luyện.

## Liên hệ với nghiên cứu khác

### So với PaLM-E, RDT và π0.5

PaLM-E tập trung đưa cảm giác từ thế giới thật vào suy luận đa phương thức. RDT chú trọng sinh đoạn hành động phối hợp hai tay bằng DiT. GR00T N1 dùng thiết kế hai phần: VLM hiểu cảnh và action expert sinh chuyển động, đồng thời trộn nhiều loại dữ liệu để học robot khác nhau.

π0.5 cũng quan tâm nguồn dữ liệu đa dạng và phân tầng nhiệm vụ dài, nhưng quy trình học và đối tượng đánh giá khác. Khi so, phải hỏi từng mạng đang dùng dữ liệu nào và có phải huấn luyện bổ sung cho robot đích không.

### Những bài nên đọc tiếp

- [RT-2](/paper/rt-2)
- [Diffusion Policy](/paper/diffusion-chính sách điều khiển)
- [Open X-Embodiment](/paper/open-x-cấu hình cơ thể robot)
- [Qwen-VLA](/paper/qwen-vla)
- [LingBot-VLA 2.0](/paper/lingbot-vla-2)

## Đọc mã nguồn và tự kiểm chứng

### Cách tự phân tích sơ đồ GR00T N1

Vẽ hai ô: phần hiểu ảnh/câu lệnh và phần sinh lệnh vận động. Từ đó đặt trạng thái robot, ảnh camera, câu lệnh và hành động nhiễu vào đúng vị trí đầu vào. Tiếp theo chỉ ra tại sao cần mã hóa khác nhau cho robot một tay và hai tay.

Để kiểm chứng giá trị của video tổng hợp, thử so chính sách điều khiển được huấn luyện với cùng số lượt thao tác mẫu thật, có và không bổ sung video sinh. Đo tỷ lệ hoàn thành trên tình huống chưa gặp. Nếu không giữ số lượt và thiết lập thử tương đương, khó biết lợi ích đến từ đâu.
