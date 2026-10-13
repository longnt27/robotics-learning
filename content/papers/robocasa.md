## Vì sao cần nghiên cứu này?

### Vì sao robot cần luyện trong nhiều căn bếp?

Dạy robot mở ngăn kéo trong một căn bếp mẫu không có nghĩa nó sẽ mở được mọi ngăn kéo. Tay nắm có thể khác, đồ vật đặt ở vị trí mới, lò vi sóng có cửa mở hướng khác. Thu đủ lần làm mẫu ngoài đời cho mọi biến thể rất tốn kém. **RoboCasa tạo nhiều căn bếp, đồ vật và nhiệm vụ trong mô phỏng** để robot được thực hành trước khi chuyển sang môi trường mới.

Đây là nền tảng mô phỏng và nguồn dữ liệu, không phải chính sách điều khiển duy nhất. Khi nói RoboCasa làm chính sách điều khiển tốt hơn, thực chất ta đang kiểm tra dữ liệu hoặc môi trường huấn luyện tạo từ RoboCasa có giúp chính sách điều khiển hay không.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/robocasa/figure-1.webp)

![Hình 9 từ PDF gốc, trang 8](/paper-figures/robocasa/figure-9.webp)

## Kiến thức nền cần nắm

### Hiểu bốn thành phần của RoboCasa

**Môi trường mô phỏng** là căn bếp với mặt bằng, tủ, thiết bị và bề mặt. **Đồ vật** là các mô hình ba chiều robot có thể nhặt, đặt hoặc tương tác. **Nhiệm vụ** xác định trạng thái cần đạt, ví dụ bỏ đồ vào ngăn kéo rồi đóng lại. **Lần làm mẫu** là chuỗi quan sát và hành động thể hiện cách hoàn thành việc đó.

RoboCasa có các thiết bị thực sự thay đổi trạng thái trong mô phỏng: cửa lò vi sóng mở được, núm bếp xoay được và đầu đốt bật tắt. Điều đó quan trọng hơn việc chỉ dựng căn bếp có ảnh đẹp, vì robot phải tạo ra thay đổi vật lý có thể kiểm tra.

### Một căn bếp giống thật chưa đủ làm môi trường huấn luyện

Hình bếp có thể rất đẹp, nhưng robot cần tác động được lên đồ vật và nhận phản hồi. Khi mở cửa lò vi sóng, bản lề phải quay; khi đặt vật vào trong, vị trí của vật phải đổi; khi đóng cửa, hệ thống phải kiểm tra trạng thái cuối. Vì vậy RoboCasa không chỉ tạo hình ảnh căn bếp mà xây **môi trường mô phỏng có tương tác** cùng điều kiện thành công cho từng nhiệm vụ. Chính sự kết hợp giữa cảnh, đồ vật có cơ cấu hoạt động và quy tắc nhiệm vụ mới cho phép tạo dữ liệu thao tác dùng để huấn luyện robot.


## Phương pháp thực hiện

### Mô phỏng được biến thành dữ liệu huấn luyện ra sao?

Nhóm tác giả xây nhiều mặt bằng bếp, đặt đồ vật và thiết bị có cơ cấu hoạt động, rồi định nghĩa nhiệm vụ. Mô hình ngôn ngữ lớn hỗ trợ gợi ý những việc hợp lý trong bếp; tuy nhiên môi trường vẫn cần quy tắc thực thi và tiêu chí hoàn thành rõ ràng.

Robot hoặc công cụ sinh quỹ đạo thực hiện các nhiệm vụ nhỏ, từ mở cửa tủ tới chuyển vật vào khay. Các quỹ đạo được ghi lại cùng quan sát và câu lệnh. Chính sách điều khiển sau đó học bắt chước hoặc được tinh chỉnh trên nguồn dữ liệu này. Một phần đánh giá được thực hiện trên robot thật để kiểm tra liệu kỹ năng mô phỏng có chuyển được hay không.

### Dữ liệu thao tác được tạo và kiểm tra ra sao?

Giả sử nhiệm vụ là mở lò vi sóng, đặt bát vào rồi đóng cửa. Bộ tạo nhiệm vụ phải biết trạng thái đầu, vị trí bát và khi nào từng bước được xem là hoàn thành. Quỹ đạo thực thi thành công được ghi lại dưới dạng ảnh, trạng thái và lệnh điều khiển. Chính sách robot học bắt chước từ đó. Tuy nhiên, nếu chuyển động trong mô phỏng dựa vào tiếp xúc quá lý tưởng, robot thật có thể không cầm được tay nắm hoặc đóng cửa lệch. Vì vậy dữ liệu mô phỏng cần đi cùng phép đánh giá ngoài đời, không chỉ kiểm tra xem video mô phỏng có giống việc bếp hay không.

![Hình 3 gốc từ PDF bài báo, trang 4](/paper-figures/robocasa/figure-3.webp)

![Hình 4 từ PDF gốc, trang 4](/paper-figures/robocasa/figure-4.webp)

![Hình 6 từ PDF gốc, trang 6](/paper-figures/robocasa/figure-6.webp)

## Ví dụ từng bước

### Ví dụ chuẩn bị lò vi sóng để hấp rau

Nhiệm vụ có thể chia thành mở cửa lò, đặt bát rau vào, đóng cửa, chọn chế độ và bật lò. Nếu chỉ học thao tác “đặt bát”, robot chưa chắc biết mở/đóng cửa hoặc xoay núm. Vì vậy cần nhiều nhiệm vụ thành phần và cách ghép chúng thành công việc dài.

RoboCasa có thể thay kích thước bếp, vị trí lò và mẫu đồ vật để chính sách điều khiển không học thuộc một tọa độ. Nhưng mô phỏng chỉ hữu ích nếu các chuyển động/tiếp xúc quan trọng có tính chất đủ gần thiết bị thật.

![Hình 8 từ PDF gốc, trang 7](/paper-figures/robocasa/figure-8.webp)

![Hình 10 từ PDF gốc, trang 8](/paper-figures/robocasa/figure-10.webp)

## Kết quả thực nghiệm

### Đọc kết quả dữ liệu sinh tự động

Hình 7 so học từ 50 lần làm mẫu người với các tập máy sinh gồm 100, 300 hoặc 3.000 lượt cho từng nhiệm vụ nhỏ. Khi số lượt máy sinh tăng, tỷ lệ thành công nhìn chung tăng và có thể vượt tập người trong những điều kiện thử. Điều này ủng hộ hướng dùng dữ liệu sinh tự động quy mô lớn, nhưng không có nghĩa một lần làm mẫu máy sinh luôn tốt hơn một lần làm mẫu người.

Hình 8 thử nhiệm vụ ghép nhiều bước. Dữ liệu các bước nhỏ giúp tinh chỉnh tốt hơn huấn luyện từ đầu, song kết quả vẫn chưa thật bền. Đó là khoảng cách từ biết từng kỹ năng tới hoàn thành một chuỗi công việc phức tạp.

### Tỷ lệ chuyển từ mô phỏng sang thật còn thấp

Một phép thử chuyển từ mô phỏng sang bếp thật ghi nhận cách kết hợp dữ liệu thật và mô phỏng đạt khoảng 24,4% thành công trên vật quen, so với 13,6% của cách chỉ dùng dữ liệu thật; trên vật mới là khoảng 9,3% so với 2,6%. Mức tăng tương đối đáng chú ý nhưng tỷ lệ tuyệt đối còn thấp. Đây là minh chứng hợp lý rằng mô phỏng giúp bổ sung dữ liệu, chứ chưa chứng minh nhiệm vụ làm bếp đã được giải quyết.

### Cải thiện tương đối lớn vẫn có thể là tỷ lệ tuyệt đối nhỏ

Trên một phép thử chuyển sang bếp thật, mức thành công 24,4% so với 13,6% trên vật quen cho thấy dữ liệu mô phỏng có thể giúp. Nhưng 24,4% đồng nghĩa phần lớn lượt chạy vẫn chưa hoàn thành. Với vật mới, cặp số 9,3% và 2,6% càng cho thấy khoảng cách từ dữ liệu mô phỏng sang thao tác thật còn khó. Cần tách hai kết luận: **thêm mô phỏng có ích trong phép thử này** và **mô hình đã đủ tin cậy để làm bếp**. Chỉ kết luận thứ nhất được hỗ trợ bởi những tỷ lệ ấy.

![Hình 5 từ PDF gốc, trang 5](/paper-figures/robocasa/figure-5.webp)

![Hình 7 từ PDF gốc, trang 7](/paper-figures/robocasa/figure-7.webp)

## Hạn chế và câu hỏi còn mở

### Khoảng cách giữa mô phỏng và đời thật

Trong mô phỏng, vật không hoàn toàn giống thật về ma sát, độ mềm, lực tiếp xúc hay camera. Một chính sách điều khiển mở cửa lò hoàn hảo trong phần mềm có thể làm trượt tay nắm khi dùng robot thật. Hiện tượng ấy thường được gọi là khoảng cách mô phỏng–thực tế.

Hình 10 đánh giá lợi ích khi kết hợp dữ liệu mô phỏng với ít lần làm mẫu thật. Kết luận có thể nêu là hỗ trợ chuyển giao trong những nhiệm vụ được thử, không phải mô phỏng đã giải quyết triệt để mọi khác biệt vật lý.

## Liên hệ với nghiên cứu khác

### Liên hệ với LIBERO và những bộ dữ liệu thật

LIBERO nhấn mạnh cách đánh giá robot học nhiều nhiệm vụ theo thời gian trong môi trường mô phỏng. RoboCasa xây hệ thống sinh cảnh và dữ liệu nhiều căn bếp để học thao tác, rồi nghiên cứu lợi ích khi chuyển sang robot thật. BridgeData V2 và DROID lại ghi lần làm mẫu vật lý tại các môi trường thực tế.

Một quy trình có thể dùng cả hai: mô phỏng để bao phủ nhiều biến thể và dữ liệu thật để chỉnh những sai khác về hình ảnh, lực và cơ cấu. Đừng đánh đồng mô phỏng sinh nhiệm vụ với dữ liệu được kiểm chứng trên phần cứng.

### Những bài nên đọc tiếp

- [LIBERO](/paper/libero)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc mã nguồn và tự kiểm chứng

### Bài tập thiết kế nhiệm vụ mô phỏng có ích

Chọn thao tác mở ngăn kéo. Liệt kê ba thứ sẽ thay: vị trí tay nắm, độ mở của ngăn và vật cản trước mặt. Mỗi thay đổi tạo một bài kiểm tra xem chính sách điều khiển học quan hệ với đối tượng hay chỉ nhớ tọa độ.

Sau đó giữ số lần làm mẫu tương đương giữa hai tập: một tập chỉ dùng một căn bếp, tập kia dùng nhiều mặt bằng. Chạy thử trong căn bếp chưa thấy và đo thành công theo từng bước: tiếp cận tay nắm, kẹp đúng, kéo mở. Cách này cho biết nguồn lỗi rõ hơn một điểm tổng hợp.
