## Vì sao cần nghiên cứu này?

Một robot có thể làm việc rất tốt trong phòng thí nghiệm nhưng thất bại ngay khi gặp một chiếc bàn mới, ánh sáng khác hoặc nhiều đồ vật gây nhiễu. Nếu dữ liệu chỉ được thu tại vài nơi quen thuộc, mô hình có thể học thuộc phông nền thay vì học cách thao tác với vật. **DROID giải quyết vấn đề bằng cách thu lượt thao tác mẫu trên cùng một hệ phần cứng tại nhiều tòa nhà và bối cảnh thực tế.** Bài báo kiểm tra xem học từ những trải nghiệm phong phú ấy có giúp robot hoạt động tốt hơn ở địa điểm và tình huống chưa từng gặp hay không.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 5](/paper-figures/droid/figure-3.webp)
![Hình 4 từ PDF gốc, trang 6](/paper-figures/droid/figure-4.webp)
![Hình 6 từ PDF gốc, trang 7](/paper-figures/droid/figure-6.webp)
![Hình 7 từ PDF gốc, trang 8](/paper-figures/droid/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/droid/figure-1.webp)


### Vì sao dữ liệu thu ở một phòng lab chưa đủ?

Nếu robot luôn thực hành trên một chiếc bàn, dưới một dàn đèn và với người vận hành quen thuộc, nó có thể vô tình ghi nhớ bối cảnh. Sang căn bếp khác, camera nhìn từ góc mới và đồ vật chưa gặp, chính sách điều khiển sẽ sai dù nhiệm vụ “nhặt rồi đặt” vẫn giống. **DROID mở rộng việc thu dữ liệu ra nhiều tòa nhà và phòng làm việc thật**, để mô hình học được sự đa dạng thường gặp khi triển khai.

Đóng góp quan trọng ở đây là cơ sở dữ liệu và phương pháp tổ chức thu thập trên nhiều địa điểm. Không nên nhầm DROID với một thuật toán sinh hành động mới.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Robot ngoài phòng thí nghiệm gặp **nhiều ánh sáng, phông nền, đồ vật và vị trí camera khác nhau**. Dù có rất nhiều quỹ đạo, dữ liệu ghi mãi ở một bàn vẫn có thể khiến mô hình dựa vào dấu hiệu không liên quan, như màu tường. DROID ưu tiên sự đa dạng cảnh thật thay vì chỉ tăng số lượt làm cùng một việc.

Các bản ghi phải đồng bộ ảnh, trạng thái và lệnh. Khi thời điểm ảnh bị lệch so với hành động, chính sách điều khiển có thể học phản ứng muộn hoặc sai. Chất lượng thu thập và kiểm tra dữ liệu vì vậy quan trọng không kém số giờ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu ba cấp độ đa dạng

**Đa dạng nhiệm vụ** là robot được yêu cầu làm nhiều việc khác nhau. **Đa dạng cảnh** là cùng một việc diễn ra trên nhiều nền, ánh sáng và cách bố trí đồ. **Đa dạng góc nhìn** là camera quan sát cùng vật từ các vị trí khác nhau. Những loại đa dạng này có tác dụng khác nhau khi robot gặp điều kiện mới.

DROID ghi ảnh từ ba camera đồng bộ, có thông số hiệu chuẩn và dữ liệu độ sâu. Những chi tiết ấy quan trọng: nếu hai góc camera không khớp thời gian, mô hình có thể học nhầm quan hệ giữa vị trí vật và hành động.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

DROID thu khoảng **76.000 quỹ đạo, tương đương 350 giờ** thao tác, trong **564 bối cảnh, 86 nhiệm vụ và 52 tòa nhà**. Bộ thiết bị được chuẩn hóa với tay máy Franka cùng các camera, rồi mang đến nhiều tổ chức để thu ở không gian thực tế khác nhau. Nhờ đó dữ liệu thay đổi rộng về cảnh nhưng vẫn dễ dùng chung một kiểu lệnh robot.

Nhóm tác giả huấn luyện chính sách điều khiển trên dữ liệu này rồi so những tập con có **cùng lượng mẫu nhưng khác số bối cảnh**. Thiết kế đó cho phép kiểm tra liệu sự đa dạng môi trường có lợi ích riêng, thay vì mọi cải thiện đơn giản do dữ liệu nhiều hơn.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 10 từ PDF gốc, trang 10](/paper-figures/droid/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/droid/figure-2.webp)


### DROID được thu như thế nào?

Nhóm nghiên cứu chuẩn hóa một bộ thiết bị có thể mang tới nhiều nơi: tay máy Franka, camera nổi gắn ngoài và ở cổ tay, cùng bộ điều khiển thực tế ảo. Người vận hành đưa robot tới phòng hoặc căn bếp mới, làm nhiệm vụ và ghi lại quỹ đạo với câu lệnh tương ứng. Cùng phần cứng chuẩn giúp giảm khác biệt do loại robot, trong khi bối cảnh được chủ động thay đổi.

Từ các quỹ đạo này, chính sách điều khiển có thể được học chung với dữ liệu nhiệm vụ đích. Sau đó người ta đánh giá không chỉ ở bối cảnh quen mà còn với đồ vật hoặc vật gây nhiễu chưa thấy. Đây là phép thử xem nguồn dữ liệu rộng có thực sự giúp tăng độ bền không.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot phải nhặt một túi khoai tây chiên trên bàn. Trong phòng lab quen thuộc, túi nằm trên bàn gỗ sạch; khi đổi môi trường, bàn có khăn, phản chiếu ánh sáng và nhiều đồ khác. Nếu chỉ học thuộc vị trí và nền, mạng sẽ chọn sai vật hoặc đi sai hướng.

DROID cho mạng thấy nhiều kiểu cảnh để học dấu hiệu quan trọng hơn về vật và chỗ kẹp. Khi kiểm tra dữ liệu, cần đối chiếu thời gian của ảnh, trạng thái khớp và lệnh; lệch vài khung hình có thể gây nhiễu nhãn lớn dù mọi tệp vẫn đọc được.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 9 từ PDF gốc, trang 10](/paper-figures/droid/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ nấu đậu lăng trong căn bếp mới

Robot phải mở nắp chảo, nhặt rồi đổ đậu lăng, sau đó bật bếp. Đây là nhiệm vụ dài, nhiều điểm có thể lỗi: nắm sai nắp, đổ lệch chảo hoặc thao tác nhầm núm bếp. Khi trong cảnh xuất hiện vật gây nhiễu, chính sách điều khiển còn phải xác định đâu là vật cần thao tác.

Dữ liệu ở nhiều bếp giúp chính sách điều khiển có cơ hội học những dấu hiệu ổn định hơn màu nền hoặc vị trí một chiếc bát cụ thể. Hình 9 so các lần robot chạy thật để thấy thao tác nào được cải thiện, thay vì chỉ xem tỷ lệ cuối.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Khi huấn luyện chung với DROID, nhóm tác giả báo cáo mức cải thiện trung bình khoảng **22 điểm phần trăm** trong điều kiện gần dữ liệu học và **17 điểm phần trăm** ở tình huống khác dữ liệu, so với phương pháp đối chứng tốt thứ hai trong phép thử.

Điểm rất đáng chú ý: với số quỹ đạo gần tương đương, tập con ghi ở **nhiều bối cảnh hơn** có kết quả tốt hơn tập con chỉ từ ít địa điểm. Đó là bằng chứng trực tiếp rằng sự phong phú về cảnh mang giá trị riêng, không chỉ do tăng số lượt thao tác.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/droid/figure-5.webp)
![Hình 8 từ PDF gốc, trang 9](/paper-figures/droid/figure-8.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc biểu đồ đa dạng cảnh

Hình 8 cho thấy học chung với DROID cải thiện tỷ lệ thành công ở cả điều kiện tương tự dữ liệu học và điều kiện khác dữ liệu. Mức tăng so phương án tốt thứ hai được báo cáo bằng điểm phần trăm tuyệt đối, không phải tăng bao nhiêu lần.

Hình 10 thực sự kiểm tra vai trò của số cảnh: so một phần dữ liệu DROID nhiều bối cảnh với phần chỉ từ 20 bối cảnh. Nếu nguồn đa dạng tốt hơn ở điều kiện mới, đó là bằng chứng hợp lý rằng thay cảnh trong huấn luyện giúp khả năng khái quát. Cần đọc số lần chạy và sai số trước khi kết luận mạnh hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

DROID chủ yếu dùng một hệ robot chuẩn, nên nghiên cứu độ đa dạng cảnh và nhiệm vụ rõ hơn sự khác biệt giữa nhiều cấu trúc cơ khí. Dữ liệu vẫn thường là thao tác trên bàn; những việc cần lực lớn, vật mềm hoặc chuyển động toàn thân chưa được bao phủ đầy đủ.

Các chính sách điều khiển trong thí nghiệm vẫn cần lượt thao tác mẫu của nhiệm vụ đích; DROID không tự tạo ra một robot làm mọi việc mà không học thêm. Bộ dữ liệu cũng có ít ví dụ lỗi và phục hồi. Kết quả cần được hiểu trong phạm vi những cảnh, vật thể và số lần chạy đã kiểm tra.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### DROID vẫn có những điểm giới hạn

Các ví dụ được thu bằng một bộ thiết bị tương đối đồng nhất, vì vậy kết quả không chứng minh lệnh có thể chuyển trực tiếp sang robot có cấu trúc tay khác. Phần lớn demonstration cũng phản ánh những nơi và nhiệm vụ nhóm thu thập chọn, không phải phân phối đầy đủ của mọi nhà ở trên thế giới.

Một bộ dữ liệu nhiều quỹ đạo có thể có lỗi thời gian, calibration hoặc nhãn câu lệnh. Việc tuyển lọc và đánh giá trên robot thật vẫn bắt buộc trước khi dùng cho hệ thống vận hành thực tế.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Open X-Embodiment](/paper/open-x-embodiment)
- [RoboCasa](/paper/robocasa)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### DROID, BridgeData và Open X có vai trò gì?

BridgeData V2 mở rộng kỹ năng và cảnh trên một thiết lập thao tác tương đối nhất quán. DROID tăng mạnh số địa điểm thực tế cùng độ phong phú cảnh. Open X trộn thêm nhiều loại robot, vì thế có cả vấn đề thống nhất hành động.

Khi chọn dữ liệu cho một project, hãy hỏi lỗi cần giải là gặp đồ vật mới, gặp phòng mới hay đổi robot mới. Không nên chỉ tải nguồn có số quỹ đạo lớn nhất.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Lấy một ít dữ liệu DROID, vẽ khoảng cách thời gian giữa ảnh và lệnh robot để phát hiện khung hình bị lệch. Xem một số video từ các địa điểm khác nhau và ghi lại sự thay đổi về ánh sáng, bàn, vật và góc camera.

Tạo hai tập con có số lượt thao tác mẫu bằng nhau, nhưng một tập có nhiều cảnh hơn. Huấn luyện cùng chính sách rồi so kết quả trên địa điểm mới. Nếu tập đa dạng có lợi, ghi cụ thể loại thay đổi được thử thay vì chỉ kết luận chung rằng “nhiều dữ liệu hơn là tốt”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài tập để kiểm tra độ phụ thuộc vào bối cảnh

Giữ cùng câu lệnh “nhặt túi khoai tây chiên”, nhưng đặt túi trên ba mặt bàn có màu và ánh sáng khác nhau. Huấn luyện từ cùng số demonstration, lần lượt chọn tập có ít cảnh và tập đa dạng. Đo tỷ lệ thành công trên cảnh chưa xuất hiện khi học.

Nếu chính sách điều khiển thất bại khi thêm một vật giống túi khác bên cạnh, đó còn là vấn đề phân biệt vật đích. Việc ghi loại lỗi giúp hiểu DROID hỗ trợ phần nào, không chỉ nhận một điểm tổng hợp.

<!-- END EXTENDED WALKTHROUGH -->

