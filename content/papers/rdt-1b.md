## Vì sao cần nghiên cứu này?

Để chuyển một khối từ tay phải sang tay trái, robot phải phối hợp hai tay: một tay giữ chắc cho đến khi tay kia đã kẹp được. Những chuyển động này có nhiều cách thực hiện đúng, nhưng chỉ cần lệch thời điểm cũng có thể làm rơi vật. **RDT-1B dùng Diffusion Transformer để học và sinh cả đoạn hành động phối hợp hai tay**, từ hình ảnh, câu lệnh và trạng thái khớp. Công trình còn nghiên cứu cách biểu diễn dữ liệu cho nhiều cấu trúc robot và giữ quá trình huấn luyện ổn định khi mô hình có quy mô lớn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rdt-1b/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 là sơ đồ diffusion Transformer khoảng một tỷ tham số có điều kiện theo dữ liệu quan sát và ngôn ngữ để sinh action cho hai tay. Đọc sơ đồ từ image/state/language condition tới chuỗi action được denoise thay vì nghĩ rằng tất cả khối mạng đều trực tiếp phát joint command. Sự khác biệt chính so với một mạng hồi quy đơn là mô hình học một phân phối chuỗi chuyển động khả thi; với thao tác hai tay, tính phối hợp theo thời gian có thể quan trọng không kém độ chính xác ở một timestep.

### Vì sao thao tác hai tay có nhiều cách đúng hơn?

Một robot một tay gắp khối có thể tiếp cận từ vài hướng. Robot hai tay còn phải quyết định tay nào giữ, tay nào di chuyển, có chuyển vật từ tay này sang tay kia không. Cùng một đích có thể có rất nhiều chuỗi cử động hợp lệ. Nếu mạng lấy trung bình những chuỗi khác nhau, hai tay có thể đi vào nhau hoặc làm rơi vật.

RDT-1B dùng Diffusion Transformer để học và sinh các đoạn hành động hai tay có tính phối hợp, nhận điều kiện từ ảnh, câu lệnh và trạng thái robot. Nó còn nghiên cứu cách học từ nhiều cấu hình robot.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Autoregressive discrete action có thể mất độ chính xác khi thao tác hai tay phức tạp. Diffusion Transformer đưa một prior action liên tục mạnh hơn, nhưng cần giải nghĩa heterogeneous trạng thái robot/action. Canonical vật lý biểu diễn chính là nỗ lực quản lý sự đa dạng đó.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/rdt-1b/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những phần của bài toán cần phân biệt

**Diffusion** là cách khởi đầu bằng hành động nhiễu rồi chỉnh dần thành quỹ đạo hợp lệ. **Transformer** xử lý quan hệ giữa các thời điểm và nguồn thông tin; khi dùng cho khử nhiễu hành động thường được gọi là DiT. **Trạng thái robot** gồm thông tin khớp hiện tại, giúp mạng biết hai tay đang ở đâu.

**Không gian hành động chung** cho phép kết hợp dữ liệu nhiều robot, nhưng phải có cách mã hóa phù hợp từng loại. Cùng một chiều số trong vector không mặc nhiên đại diện cho cùng khớp giữa hai robot.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RDT-1B là khoảng **1.2B-parameter diffusion Transformer**. Bài báo đưa ra **Physically Interpretable Unified Action Space** để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên dữ liệu không đồng nhất robot và post-train bằng hơn **6 nghìn bimanual episodes** cho target platform. Vision, ngôn ngữ và state được điều kiện vào diffusion action generator thay vì bắt action đi qua ngôn ngữ token vocabulary.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 6](/paper-figures/rdt-1b/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Kiến trúc được thiết kế để scale width/depth và exploit multimodal conditioning. Với few-shot adaptation, mô hình tận dụng đã pretrain prior về chuyển động rồi chỉ cần một lượng demonstration rất nhỏ cho nhiệm vụ mới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rdt-1b/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 đối chiếu sự phức tạp của bimanual manipulation với một tay: hai nhánh kinematics cùng tiếp xúc một vật và ảnh hưởng lẫn nhau. Một tay nhấc vật trong khi tay kia giữ hoặc căn chỉnh vị trí có thể tạo lực và ràng buộc khác hoàn toàn một tay tự thao tác. Đây là lý do hình học, action representation và đồng bộ timing của hai tay cần được xem kỹ khi đọc RDT-1B. Một action vector dài không tự bảo đảm mô hình hiểu constraints giữa hai gripper.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ hai tay giữ hai đầu một thanh dài và đặt vào gá. Nếu dự đoán tay trái/pha nâng độc lập với tay phải, thanh có thể nghiêng và va chạm. Ta có thể biểu diễn một action chunk liên tục cho tất cả khớp hai tay, thêm condition từ ảnh và proprioception, rồi sampling bằng diffusion để tìm quỹ đạo nhất quán. Nhưng performance không chỉ nằm ở chất lượng score model: action cần đưa về đúng joint range và controller phải giữ tương tác cơ học ổn định. Đo task success, alignment error, collision và jerk chứ không chỉ denoising MSE.

### Từ ảnh, câu lệnh và nhiễu đến hai tay robot

Mô hình nhận ảnh từ camera ngoài và camera hai cổ tay, câu lệnh nhiệm vụ, trạng thái khớp và một chuỗi lệnh còn nhiễu. Nó còn nhận bước thời gian diffusion để biết đang ở giai đoạn khử nhiễu nào, cùng tần số điều khiển để hiểu nhịp hành động.

DiT kết hợp những điều kiện ấy và liên tục dự đoán cách chỉnh chuỗi hành động. Sau nhiều bước, mô hình thu được đoạn lệnh cho hai tay. Robot thực hiện và có thể lấy quan sát mới cho lần dự đoán sau. Các phần chuẩn hóa như QKNorm/RMSNorm góp phần giữ huấn luyện ổn định; chúng không phải những lệnh motor độc lập.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Với một bimanual folding kỹ năng, mạng điều kiện hình ảnh + ngôn ngữ + trạng thái robot rồi mẫu cả action chunk cho hai tay. Đồng thời, tập dữ liệu robot khác có DoF/coordinate các khung hình khác; preprocessing phải quyết định joint/EEF conventions và mask cho dimension vắng.

Phải đọc riêng **vật lý of action schema** và **DiT kiến trúc**. Nếu canonical schema sai, scale mô hình chỉ học sai nhanh hơn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ hai tay cùng chuyển một khối

Giả sử robot cần đưa khối từ tay phải sang tay trái. Một tay phải kẹp chắc trong khi tay kia tới vị trí nhận, rồi hai tay phối hợp chuyển lực giữ. Nếu tay bên nhận kẹp quá sớm hoặc tay bên giao buông trước, khối có thể rơi.

Dự đoán từng tay độc lập khó giữ ràng buộc theo thời gian. RDT sinh một đoạn chuyển động chung để học mối liên hệ giữa các bước hai tay. Đây là lợi ích trực giác, nhưng vẫn cần đánh giá ngoài đời vì mô hình không tự có cảm biến lực hoàn hảo.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo báo RDT-1B cải thiện tỷ lệ thành công của nhiệm vụ trung bình khoảng **56%** so với các các phương pháp đối chứng được dùng trong đánh giá. Nó thể hiện zero-shot robustness tốt hơn trước vật thể chưa xuất hiện khi huấn luyện/bối cảnh và đặc biệt mạnh trong bimanual kỹ năng. Ở một số few-shot thí nghiệm chỉ **1-5 demonstrations**, RDT-1B đã làm được các hành vi như handover/folding mà scratch hoặc smaller các phương pháp đối chứng gần như không làm được.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 8](/paper-figures/rdt-1b/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Kết quả khiến diffusion foundation policy trở thành một hướng nghiêm túc song song với autoregressive VLA. Nó cũng cho thấy **motor scaling** có thể cần kiến trúc khác ngữ nghĩa VLM scaling.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu thí nghiệm và hình biểu diễn

Hình 4 kiểm tra độ ổn định khi bỏ QKNorm/RMSNorm và vai trò của một số thành phần đầu ra. Nếu đường loss dao động mạnh, tối ưu hóa có thể gặp khó ngay trước khi robot thực thi. Các phép thử điều khiển còn tách kỹ năng đi thẳng và rót chính xác lượng nước.

Hình 5 nêu trạng thái ban đầu, mức thay đổi và mục tiêu từng nhiệm vụ. Đừng chỉ nhìn ảnh cuối; cần xem điều kiện thành công có đòi đúng lượng nước hay chỉ làm chuyển động gần đúng.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** bài báo không có một limitations section mạnh, nhưng phạm vi thí nghiệm chủ yếu vẫn quanh bimanual manipulation và target phần cứng family; general long-horizon/mobile hành vi chưa phải trọng tâm.

**Phê bình thêm:** “unified action không gian” vẫn dựa trên giả định rằng các nguồn dữ liệu có vật lý semantics đủ tương thích để map vào canonical biểu diễn. Một mô hình 1.2B + pretraining corpus lớn cũng có compute/dữ liệu barrier đáng kể. Diffusion lấy mẫu đem độ trễ riêng. Claims few-shot rất hấp dẫn nhưng số nhiệm vụ/embodiment chưa đủ để suy ra universal chuyển giao. RDT giải rất tốt **liên tục bimanual prior**, nhưng semantics, world kiến thức, phục hồi và long-horizon lập kế hoạch vẫn cần tầng khác.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Các giới hạn của RDT-1B

Mô hình lớn và quá trình khử nhiễu nhiều bước tiêu tốn tài nguyên tính toán, có thể gây trễ trong vòng điều khiển. Khả năng xử lý hai tay không tự đảm bảo mọi vật tiếp xúc đều an toàn, nhất là khi lực kẹp và ma sát thay đổi.

Huấn luyện đa robot vẫn đòi chuẩn hóa và ánh xạ hành động cẩn thận. Sai đơn vị một chiều có thể phá hỏng kết quả dù phần Transformer được huấn luyện đúng.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Diffusion Policy](/paper/diffusion-policy)
- [GR00T N1](/paper/groot-n1)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### So RDT-1B với ACT và Diffusion Policy

ACT cũng học chuỗi hành động nhiều bước cho hai tay, nhưng dùng Transformer và CVAE. Diffusion Policy học phân phối các chuỗi lệnh qua khử nhiễu, không nhất thiết chỉ dành cho hai tay. RDT áp dụng hướng Diffusion Transformer ở quy mô lớn hơn, điều kiện hóa nhiều nguồn tín hiệu và chú trọng phối hợp hai tay.

Việc tăng số tham số không phải đóng góp duy nhất: khả năng biểu diễn nhiều robot và huấn luyện ổn định là những quyết định thiết kế quan trọng.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Trace một batch qua action normalization/vật lý mask; thay các giá trị NaN/padded joints để chắc loss không ăn nhầm. Test inverse transform để bảo toàn vị trí/độ mở gripper.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài tập kiểm chứng đơn giản

Vẽ một nhiệm vụ chuyển khối từ tay phải sang tay trái và liệt kê thứ tự tiếp cận, kẹp nhận, chuyển lực giữ, buông giao. Ghi xem lệnh của tay nào phụ thuộc tay nào tại mỗi bước. Nếu chỉ dự đoán hai tay độc lập, bước nào dễ bị lệch nhịp nhất?

Sau đó đọc Hình 3 và chỉ ra ảnh cổ tay, trạng thái khớp, nhiễu hành động và tần số điều khiển được đưa vào ở đâu. Những câu hỏi này giúp nối sơ đồ mạng với công việc thật.

<!-- END EXTENDED WALKTHROUGH -->

