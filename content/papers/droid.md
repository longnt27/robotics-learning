## Vì sao cần nghiên cứu này?

Nhiều robot tập dữ liệu lớn vẫn được thu thập trong vài phòng thí nghiệm setup được dựng cẩn thận. Mô hình có thể thấy nhiều các quỹ đạo nhưng bối cảnh statistics gần như giống nhau, nên nó học shortcut về phông nền/camera/table thay vì manipulation invariants. DROID muốn kiểm tra thesis: **nếu cùng một robot được mang đi rất nhiều tòa nhà, phòng, operator và vật thể setup, khả năng khái quát có tăng đáng kể không?**

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 5](/paper-figures/droid/figure-3.webp)
![Hình 4 từ PDF gốc, trang 6](/paper-figures/droid/figure-4.webp)
![Hình 6 từ PDF gốc, trang 7](/paper-figures/droid/figure-6.webp)
![Hình 7 từ PDF gốc, trang 8](/paper-figures/droid/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/droid/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 giới thiệu một chiến lược thu dữ liệu khác việc dựng vài scene sạch trong phòng lab: robot được đưa tới nhiều công trình và môi trường thật. DROID công bố khoảng 76.000 trajectories, 350 giờ dữ liệu với đa dạng bối cảnh đáng kể. Điểm đáng học không chỉ là số giờ mà là phân phối: ánh sáng, nền, đồ vật, operator và cách sắp xếp cảnh thay đổi. Chính sự thay đổi này giúp đánh giá khả năng model chú ý đến affordance của vật thay vì nhớ texture của chiếc bàn.

### Vì sao dữ liệu thu ở một phòng lab chưa đủ?

Nếu robot luôn thực hành trên một chiếc bàn, dưới một dàn đèn và với người vận hành quen thuộc, nó có thể vô tình ghi nhớ bối cảnh. Sang căn bếp khác, camera nhìn từ góc mới và đồ vật chưa gặp, policy sẽ sai dù nhiệm vụ “nhặt rồi đặt” vẫn giống. **DROID mở rộng việc thu dữ liệu ra nhiều tòa nhà và phòng làm việc thật**, để mô hình học được sự đa dạng thường gặp khi triển khai.

Đóng góp quan trọng ở đây là cơ sở dữ liệu và phương pháp tổ chức thu thập trên nhiều địa điểm. Không nên nhầm DROID với một thuật toán sinh hành động mới.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Bottleneck thực tế là thu dữ liệu robot **ngoài phòng phòng thí nghiệm**: lighting, vật thể, operator kỹ năng và phông nền thay đổi làm phân phối phức tạp hơn số lượng episode. DROID tập trung vào protocol thu thập để policy học từ nhiều cảnh đời thực.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu ba cấp độ đa dạng

**Đa dạng nhiệm vụ** là robot được yêu cầu làm nhiều việc khác nhau. **Đa dạng cảnh** là cùng một việc diễn ra trên nhiều nền, ánh sáng và cách bố trí đồ. **Đa dạng góc nhìn** là camera quan sát cùng vật từ các vị trí khác nhau. Những loại đa dạng này có tác dụng khác nhau khi robot gặp điều kiện mới.

DROID ghi ảnh từ ba camera đồng bộ, có thông số hiệu chuẩn và dữ liệu độ sâu. Những chi tiết ấy quan trọng: nếu hai góc camera không khớp thời gian, mô hình có thể học nhầm quan hệ giữa vị trí vật và hành động.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

DROID thu khoảng **76 nghìn các quỹ đạo / 350 giờ**, trong **564 bối cảnh**, **86 nhiệm vụ**, **52 buildings** với khoảng **50 collectors**. Hardware được chuẩn hóa quanh Franka + camera setup để nhiều institution có thể thu dữ liệu nhưng action không gian vẫn thống nhất. Tập dữ liệu cố tình ưu tiên “in-the-wild” environmental variation thay vì chỉ tăng quỹ đạo count trong một phòng thí nghiệm.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 10 từ PDF gốc, trang 10](/paper-figures/droid/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Bài báo huấn luyện diffusion-style policies và làm matched-data ablation: cùng số demonstrations nhưng chọn từ nhiều bối cảnh hơn hoặc ít bối cảnh hơn. Điều này cho phép tách **quantity** khỏi **environment sự đa dạng**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/droid/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 thể hiện một thiết kế tưởng như mâu thuẫn: dùng nền tảng phần cứng tương đối thống nhất để nhiều nhóm ở nhiều nơi thu thập. Thống nhất robot/camera giúp action space và logging nhất quán; thay đổi environment mới là biến nghiên cứu. Nếu mỗi phòng dùng phần cứng khác nhau, khó biết performance gain đến từ dữ liệu đa dạng hay từ khác biệt trong controller, frequency và sensor. Đây là một bài học về thiết kế thí nghiệm, không chỉ logistics.

#### Ví dụ từng bước để hiểu cơ chế

Khi kiểm tra một subset DROID, hãy vẽ timestamp giữa image, proprioception và action; xem vài episode cạnh nhau để phát hiện camera lệch hoặc robot đứng im quá lâu. Với mô hình baseline, đánh giá một tập test cùng environment và một tập test khác environment. Nếu accuracy của action tăng mà success rate không tăng, cần xem có bị lệch temporal synchronization hoặc action normalization không. Đừng gộp mọi episode thành một score rồi kết luận dataset đã giải quyết vấn đề khái quát.

### DROID được thu như thế nào?

Nhóm nghiên cứu chuẩn hóa một bộ thiết bị có thể mang tới nhiều nơi: tay máy Franka, camera nổi gắn ngoài và ở cổ tay, cùng bộ điều khiển thực tế ảo. Người vận hành đưa robot tới phòng hoặc căn bếp mới, làm nhiệm vụ và ghi lại quỹ đạo với câu lệnh tương ứng. Cùng phần cứng chuẩn giúp giảm khác biệt do loại robot, trong khi bối cảnh được chủ động thay đổi.

Từ các quỹ đạo này, policy có thể được học chung với dữ liệu nhiệm vụ đích. Sau đó người ta đánh giá không chỉ ở bối cảnh quen mà còn với đồ vật hoặc vật gây nhiễu chưa thấy. Đây là phép thử xem nguồn dữ liệu rộng có thực sự giúp tăng độ bền không.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Ở cùng nhiệm vụ pick-place, một bối cảnh có bàn kính phản quang, bối cảnh khác có khăn và đồ vật cluttered. DROID-style collection khiến thị giác encoder phải học affordance thay vì memorize màu bàn. Nhưng dữ liệu còn phụ thuộc vào con người operator và phần cứng robot; action frequency/camera alignment có thể trở thành confound.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 9 từ PDF gốc, trang 10](/paper-figures/droid/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Trong dữ liệu audit, inspect synchronization giữa RGB khung hình timestamps và proprioception/action timestamps; lệch vài khung hình cũng có thể tạo label noise rất lớn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ nấu đậu lăng trong căn bếp mới

Robot phải mở nắp chảo, nhặt rồi đổ đậu lăng, sau đó bật bếp. Đây là nhiệm vụ dài, nhiều điểm có thể lỗi: nắm sai nắp, đổ lệch chảo hoặc thao tác nhầm núm bếp. Khi trong cảnh xuất hiện vật gây nhiễu, policy còn phải xác định đâu là vật cần thao tác.

Dữ liệu ở nhiều bếp giúp policy có cơ hội học những dấu hiệu ổn định hơn màu nền hoặc vị trí một chiếc bát cụ thể. Hình 9 so các lần robot chạy thật để thấy thao tác nào được cải thiện, thay vì chỉ xem tỷ lệ cuối.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Khi thêm DROID vào dữ liệu của nhiệm vụ đích theo mixture, tác giả báo cáo mức cải thiện khoảng **22 điểm ở in-domain** và **17 điểm ở out-of-domain** so với thiết lập đối chứng tốt thứ hai trong các nhiệm vụ được đánh giá. Toàn bộ DROID tốt hơn subset nhỏ, nhưng điểm quan trọng hơn là **tập con có nhiều bối cảnh tốt hơn tập con ít đa dạng với cùng số mẫu**. Nói cách khác, 7 nghìn quỹ đạo đi khắp nơi có thể đáng hơn 7 nghìn quỹ đạo quay đi quay lại trong 20 bối cảnh.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/droid/figure-5.webp)
![Hình 8 từ PDF gốc, trang 9](/paper-figures/droid/figure-8.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Đây là một evidence rất trực tiếp cho data-collection strategy mà người đọc đang thấy ở headcam: coverage của phân phối có giá trị độc lập với số giờ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc biểu đồ đa dạng cảnh

Hình 8 cho thấy học chung với DROID cải thiện tỷ lệ thành công ở cả điều kiện tương tự dữ liệu học và điều kiện khác dữ liệu. Mức tăng so phương án tốt thứ hai được báo cáo bằng điểm phần trăm tuyệt đối, không phải tăng bao nhiêu lần.

Hình 10 thực sự kiểm tra vai trò của số cảnh: so một phần dữ liệu DROID nhiều bối cảnh với phần chỉ từ 20 bối cảnh. Nếu nguồn đa dạng tốt hơn ở điều kiện mới, đó là bằng chứng hợp lý rằng thay cảnh trong huấn luyện giúp khả năng khái quát. Cần đọc số lần chạy và sai số trước khi kết luận mạnh hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** DROID vẫn dùng một main robot phần cứng, nên chủ yếu giải bối cảnh/độ đa dạng nhiệm vụ chứ không giải cross-embodiment. Scope manipulation vẫn tabletop-ish và chưa chạm hết dynamic/deformable/contact-rich world.

**Phê bình thêm:** 350 giờ là lớn với real robot 2024 nhưng nhỏ so với 10k-50k giờ pretraining corpora 2026. Policies trong bài báo vẫn cần target-task demonstrations, nên DROID là prior chứ không tạo zero-shot generalist. Tập dữ liệu chủ yếu lọc successful/usable các quỹ đạo, thiếu thất bại/phục hồi. Real đánh giá cũng chỉ có số nhiệm vụ và rollouts hạn chế, nên con số gain không nên extrapolate thành “độ đa dạng bối cảnh giải khả năng khái quát”. Nó giải một phần rất quan trọng, nhưng chỉ một phần.

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

## Đọc code và tự kiểm chứng

Dùng mẫu DROID video + state, plot timestamp delta, quỹ đạo smoothness và coverage. Xây 1 trang data-quality báo cáo trước khi huấn luyện policy.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài tập để kiểm tra độ phụ thuộc vào bối cảnh

Giữ cùng câu lệnh “nhặt túi khoai tây chiên”, nhưng đặt túi trên ba mặt bàn có màu và ánh sáng khác nhau. Huấn luyện từ cùng số demonstration, lần lượt chọn tập có ít cảnh và tập đa dạng. Đo tỷ lệ thành công trên cảnh chưa xuất hiện khi học.

Nếu policy thất bại khi thêm một vật giống túi khác bên cạnh, đó còn là vấn đề phân biệt vật đích. Việc ghi loại lỗi giúp hiểu DROID hỗ trợ phần nào, không chỉ nhận một điểm tổng hợp.

<!-- END EXTENDED WALKTHROUGH -->

