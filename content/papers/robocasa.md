## Vì sao cần nghiên cứu này?

Thu hàng trăm nghìn lượt robot làm việc trong những căn bếp thật tốn nhiều thời gian, công sức và phần cứng. Mô phỏng có thể giúp, nhưng một môi trường chỉ có vài căn bếp và ít đồ vật sẽ khiến robot học thuộc bố cục. **RoboCasa tạo một bộ môi trường bếp mô phỏng phong phú với nhiều đồ vật, thiết bị có thể tương tác và nhiệm vụ tự động sinh**, để huấn luyện những kỹ năng có cơ hội chuyển sang môi trường mới. Bài báo còn đánh giá việc kết hợp dữ liệu mô phỏng với ít demonstration robot thật, bởi chuyển động đẹp trong mô phỏng chưa đủ chứng minh làm được ngoài đời.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 9 từ PDF gốc, trang 8](/paper-figures/robocasa/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/robocasa/figure-1.webp)


### Vì sao robot cần luyện trong nhiều căn bếp?

Dạy robot mở ngăn kéo trong một căn bếp mẫu không có nghĩa nó sẽ mở được mọi ngăn kéo. Tay nắm có thể khác, đồ vật đặt ở vị trí mới, lò vi sóng có cửa mở hướng khác. Thu đủ demonstration ngoài đời cho mọi biến thể rất tốn kém. **RoboCasa tạo nhiều căn bếp, đồ vật và nhiệm vụ trong mô phỏng** để robot được thực hành trước khi chuyển sang môi trường mới.

Đây là nền tảng mô phỏng và nguồn dữ liệu, không phải policy duy nhất. Khi nói RoboCasa làm policy tốt hơn, thực chất ta đang kiểm tra dữ liệu hoặc môi trường huấn luyện tạo từ RoboCasa có giúp chính sách điều khiển hay không.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Thu hàng trăm nghìn lần robot làm việc trong bếp thật rất tốn kém. Mô phỏng giúp tái tạo nhiều tình huống, nhưng **ảnh đẹp trong mô phỏng không đồng nghĩa robot làm được ngoài đời**. Cần phân biệt sự phong phú về bố cục, màu sắc, vật thể với độ chính xác của ma sát, lực và tiếp xúc.

RoboCasa tạo nhiều căn bếp có thiết bị tương tác được và cho phép thay đổi mặt bằng, vật thể, vị trí và câu lệnh. Nó là môi trường sinh dữ liệu và kiểm tra chính sách điều khiển, không phải một mô hình VLA duy nhất.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu bốn thành phần của RoboCasa

**Môi trường** là căn bếp với mặt bằng, tủ, thiết bị và bề mặt. **Đồ vật** là các mô hình ba chiều robot có thể nhặt, đặt hoặc tương tác. **Nhiệm vụ** xác định trạng thái cần đạt, ví dụ bỏ đồ vào ngăn kéo rồi đóng lại. **Demonstration** là chuỗi quan sát và hành động thể hiện cách hoàn thành việc đó.

RoboCasa có các thiết bị thực sự thay đổi trạng thái trong mô phỏng: cửa lò vi sóng mở được, núm bếp xoay được và đầu đốt bật tắt. Điều đó quan trọng hơn việc chỉ dựng căn bếp có ảnh đẹp, vì robot phải tạo ra thay đổi vật lý có thể kiểm tra.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RoboCasa cung cấp khoảng **120 bố cục bếp**, hơn **2.500 mô hình đồ vật** thuộc trên 150 nhóm và cỡ **100 nhiệm vụ**. Hệ thống dùng quy tắc tạo cảnh, công cụ sinh đồ vật/hình ảnh và mô hình ngôn ngữ lớn để gợi ý các công việc bếp có ý nghĩa. Từ số ít thao tác mẫu, phương pháp sinh quỹ đạo có thể tạo nhiều lượt thực thi trong các bối cảnh khác nhau.

Bản công bố có hơn **100.000 quỹ đạo**. Khi huấn luyện, một nhiệm vụ như mở ngăn kéo có thể xuất hiện trên nhiều loại tủ, vị trí tay nắm và nền bếp. Mục tiêu là chính sách học được quan hệ giữa robot và đồ vật thay vì nhớ một tọa độ cố định.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 4](/paper-figures/robocasa/figure-4.webp)
![Hình 6 từ PDF gốc, trang 6](/paper-figures/robocasa/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 3 gốc từ PDF bài báo, trang 4](/paper-figures/robocasa/figure-3.webp)


### Mô phỏng được biến thành dữ liệu huấn luyện ra sao?

Nhóm tác giả xây nhiều mặt bằng bếp, đặt đồ vật và thiết bị có cơ cấu hoạt động, rồi định nghĩa nhiệm vụ. Mô hình ngôn ngữ lớn hỗ trợ gợi ý những việc hợp lý trong bếp; tuy nhiên môi trường vẫn cần quy tắc thực thi và tiêu chí hoàn thành rõ ràng.

Robot hoặc công cụ sinh quỹ đạo thực hiện các nhiệm vụ nhỏ, từ mở cửa tủ tới chuyển vật vào khay. Các quỹ đạo được ghi lại cùng quan sát và câu lệnh. Policy sau đó học bắt chước hoặc được tinh chỉnh trên nguồn dữ liệu này. Một phần đánh giá được thực hiện trên robot thật để kiểm tra liệu kỹ năng mô phỏng có chuyển được hay không.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Chọn thao tác **mở ngăn kéo**. Ở lần thứ nhất, tay nắm nằm bên trái mặt bàn trắng; lần khác là tủ tối màu, robot nhìn từ góc khác và tay nắm đặt cao hơn. Môi trường vẫn biết khi nào ngăn kéo thực sự mở đủ để tính hoàn thành.

Huấn luyện trên một nhóm căn bếp rồi thử ở bố cục chưa thấy. Nếu policy mở đúng trong mô phỏng nhưng khi sang nhà thật lại kẹp trượt tay nắm, nguyên nhân có thể là khác biệt lực tiếp xúc hoặc vị trí camera. Cần đánh giá hai phần riêng thay vì coi mô phỏng là bằng chứng đủ.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 8 từ PDF gốc, trang 7](/paper-figures/robocasa/figure-8.webp)
![Hình 10 từ PDF gốc, trang 8](/paper-figures/robocasa/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ chuẩn bị lò vi sóng để hấp rau

Nhiệm vụ có thể chia thành mở cửa lò, đặt bát rau vào, đóng cửa, chọn chế độ và bật lò. Nếu chỉ học thao tác “đặt bát”, robot chưa chắc biết mở/đóng cửa hoặc xoay núm. Vì vậy cần nhiều nhiệm vụ thành phần và cách ghép chúng thành công việc dài.

RoboCasa có thể thay kích thước bếp, vị trí lò và mẫu đồ vật để policy không học thuộc một tọa độ. Nhưng mô phỏng chỉ hữu ích nếu các chuyển động/tiếp xúc quan trọng có tính chất đủ gần thiết bị thật.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Các phép thử cho thấy tăng lượng dữ liệu sinh trong mô phỏng có thể giúp chính sách học bắt chước tốt hơn. Khi chuyển sang một số nhiệm vụ robot thật, huấn luyện **kết hợp dữ liệu thật và mô phỏng** được báo cáo đạt khoảng **24,4%** trên vật quen so với **13,6%** khi chỉ dùng dữ liệu thật; trên vật mới là khoảng **9,3% so với 2,6%**.

Đây là mức cải thiện có ý nghĩa trong phép thử, nhưng tỷ lệ thành công tuyệt đối vẫn thấp. Nhiệm vụ nhiều bước cũng khó hơn rõ rệt so với thao tác đơn. Vì vậy kết luận hợp lý là mô phỏng giúp bổ sung dữ liệu, chưa phải đã giải xong bài toán làm việc nhà.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 5](/paper-figures/robocasa/figure-5.webp)
![Hình 7 từ PDF gốc, trang 7](/paper-figures/robocasa/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả dữ liệu sinh tự động

Hình 7 so học từ 50 demonstration người với các tập máy sinh gồm 100, 300 hoặc 3.000 lượt cho từng nhiệm vụ nhỏ. Khi số lượt máy sinh tăng, tỷ lệ thành công nhìn chung tăng và có thể vượt tập người trong những điều kiện thử. Điều này ủng hộ hướng dùng dữ liệu sinh tự động quy mô lớn, nhưng không có nghĩa một demonstration máy sinh luôn tốt hơn một demonstration người.

Hình 8 thử nhiệm vụ ghép nhiều bước. Dữ liệu các bước nhỏ giúp tinh chỉnh tốt hơn huấn luyện từ đầu, song kết quả vẫn chưa thật bền. Đó là khoảng cách từ biết từng kỹ năng tới hoàn thành một chuỗi công việc phức tạp.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Quỹ đạo sinh tự động vẫn có thể giật hoặc va chạm dù môi trường tính là thành công. Mô hình ngôn ngữ lớn có thể gợi ý nhiệm vụ, nhưng các điều kiện và quy tắc thực thi vẫn cần được con người kiểm tra. Các tình huống vật mềm, thao tác hai tay và lực phức tạp chưa được bao phủ hết.

Đặc biệt, **tăng số quỹ đạo không bù được một mô phỏng có sai lệch vật lý cố định**. Nếu ma sát hoặc cảm biến khác ngoài đời, sinh thêm một triệu mẫu cùng lỗi ấy có thể khiến model học nhầm chắc hơn. Kết quả phải kiểm chứng trên robot thật và nhiệm vụ đích.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Khoảng cách giữa mô phỏng và đời thật

Trong mô phỏng, vật không hoàn toàn giống thật về ma sát, độ mềm, lực tiếp xúc hay camera. Một policy mở cửa lò hoàn hảo trong phần mềm có thể làm trượt tay nắm khi dùng robot thật. Hiện tượng ấy thường được gọi là khoảng cách mô phỏng–thực tế.

Hình 10 đánh giá lợi ích khi kết hợp dữ liệu mô phỏng với ít demonstration thật. Kết luận có thể nêu là hỗ trợ chuyển giao trong những nhiệm vụ được thử, không phải mô phỏng đã giải quyết triệt để mọi khác biệt vật lý.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [LIBERO](/paper/libero)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Liên hệ với LIBERO và những bộ dữ liệu thật

LIBERO nhấn mạnh cách đánh giá robot học nhiều nhiệm vụ theo thời gian trong môi trường mô phỏng. RoboCasa xây hệ thống sinh cảnh và dữ liệu nhiều căn bếp để học thao tác, rồi nghiên cứu lợi ích khi chuyển sang robot thật. BridgeData V2 và DROID lại ghi demonstration vật lý tại các môi trường thực tế.

Một pipeline có thể dùng cả hai: mô phỏng để bao phủ nhiều biến thể và dữ liệu thật để chỉnh những sai khác về hình ảnh, lực và cơ cấu. Đừng đánh đồng mô phỏng sinh nhiệm vụ với dữ liệu được kiểm chứng trên phần cứng.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Sinh hai nhóm dữ liệu cho nhiệm vụ mở ngăn kéo: một nhóm từ cùng một bố cục, nhóm khác từ nhiều bố cục nhưng có số lượt bằng nhau. Kiểm tra video hoặc ảnh để biết chính xác những yếu tố nào đã thay đổi, ví dụ tay nắm, vật cản hay màu tủ.

Huấn luyện cùng một chính sách rồi thử trên căn bếp chưa dùng để học. Nếu kết quả khác, phân tích robot chọn sai vị trí tay nắm hay gặp lỗi lúc kéo. Phép thử ấy hữu ích hơn chỉ đếm số ảnh tổng hợp đã tạo.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài tập thiết kế nhiệm vụ mô phỏng có ích

Chọn thao tác mở ngăn kéo. Liệt kê ba thứ sẽ thay: vị trí tay nắm, độ mở của ngăn và vật cản trước mặt. Mỗi thay đổi tạo một bài kiểm tra xem policy học quan hệ với đối tượng hay chỉ nhớ tọa độ.

Sau đó giữ số demonstration tương đương giữa hai tập: một tập chỉ dùng một căn bếp, tập kia dùng nhiều mặt bằng. Chạy thử trong căn bếp chưa thấy và đo thành công theo từng bước: tiếp cận tay nắm, kẹp đúng, kéo mở. Cách này cho biết nguồn lỗi rõ hơn một điểm tổng hợp.

<!-- END EXTENDED WALKTHROUGH -->

