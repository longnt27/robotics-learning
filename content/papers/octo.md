## Vì sao cần nghiên cứu này?

Một phòng thí nghiệm nhỏ khó có đủ dữ liệu và GPU để huấn luyện mô hình điều khiển robot từ đầu. Nhưng họ có thể có vài chục hoặc vài trăm demonstration của robot mình. **Octo cung cấp một policy nguồn mở đã học trên nhiều loại nhiệm vụ robot, rồi cho phép tinh chỉnh nhanh trên dữ liệu mới.** Kiến trúc được thiết kế để có thể thay đổi loại quan sát hoặc dạng lệnh đầu ra mà không nhất thiết phải huấn luyện lại toàn bộ phần mạng chung. Tất nhiên vẫn phải kiểm tra cách chuyển lệnh cho phần cứng đích; một checkpoint không tự chạy được với mọi cấu trúc robot.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/octo/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/octo/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 giới thiệu Octo như một generalist policy pretrained trên nhiều trajectory robot với goal/instruction khác nhau rồi có thể fine-tune. Đọc hình từ phía dữ liệu tới nhiệm vụ đích: lợi ích chính là shared representation và initialization có thể tái sử dụng, không phải giả định rằng một checkpoint chạy ngay được trên mọi robot. Nếu embodiment khác, action adapter và sự khác biệt camera vẫn cần xử lý.

### Một policy có thể điều khiển nhiều robot không?

Mỗi loại robot có camera, lệnh và nhiệm vụ khác nhau. Nếu chỉ huấn luyện một policy cho mỗi thiết bị, ta rất khó tận dụng kinh nghiệm chung về nhặt, đặt và di chuyển vật. Octo dùng một mạng Transformer đã học từ nhiều nguồn dữ liệu, sau đó cho phép tinh chỉnh nhanh với một robot mới.

Đóng góp ở đây không phải tuyên bố mọi robot dùng được cùng một vector lệnh. Điều đáng chú ý là **kiến trúc có thể thay phần đầu vào và đầu ra mà vẫn tái sử dụng được phần học chung**.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Mục tiêu của Octo là **generalist đã pretrain policy có thể fine-tune**, không nhất thiết một mô hình zero-shot làm mọi robot. Nó học reusable behaviors từ đa tập dữ liệu rồi điều chỉnh lại theo embodiment mới. Đây là khác biệt quan trọng với claim "universal robot bộ điều khiển".

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 6](/paper-figures/octo/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu backbone và các phần gắn thêm

**Backbone** là phần mạng xử lý thông tin chung; Octo dùng Transformer. **Token nhiệm vụ** biểu diễn yêu cầu người dùng, còn **token quan sát** biểu diễn ảnh camera. **Nhánh đầu ra** biến biểu diễn đã học thành lệnh phù hợp với robot đích.

Hai robot có thể cùng hiểu “đặt cốc vào khay” nhưng một bên nhận lệnh vị trí đầu kẹp, bên kia nhận góc khớp. Phần nhánh đầu ra giúp xử lý sự khác biệt ấy, nhưng vẫn phải chọn đúng biểu diễn và chuẩn hóa hành động.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Octo là Transformer policy khoảng 93M parameters, pretrain trên khoảng **800 nghìn episodes** từ **25 các tập dữ liệu** trong Open X-Embodiment. Kiến trúc được thiết kế modular: nhận ngôn ngữ hoặc mục tiêu hình ảnh, nhiều camera, proprioception và có readout/action heads thay được. Sinh action dùng diffusion-style head, tránh phải ép mọi action liên tục thành autoregressive text tokens.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/octo/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Điểm đáng giá là tác giả coi **fine-tuning interface** là first-class design mục tiêu. Người dùng có thể thay quan sát/action head và adapt mô hình sang new embodiment mà không huấn luyện toàn bộ stack từ zero.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/octo/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 giải thích cách observation và task specification được token hóa rồi đưa qua Transformer trước khi sinh action. Lệnh ngôn ngữ, goal image và proprioception có vai trò khác nhau; không nên gộp thành một cụm 'multimodal' rồi bỏ qua sự khác biệt. Khi kiểm tra code, xác định đầu vào nào optional, token mask thế nào và action horizon được chọn theo task nào.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ một robot mới có camera đặt cao hơn dữ liệu pretrain và gripper khác chuẩn. Ta chạy frozen encoder trước để xem feature có phản ứng hợp lý với vật thể mới không, kiểm tra action shape/normalization, rồi fine-tune với vài demonstration. So với random initialization, lợi ích cần đo ở sample efficiency và held-out test. Nếu train và test chia theo frame trong cùng episode, success cao sẽ không đáng tin; split đúng episode và environment mới có ý nghĩa.

### Octo xử lý đầu vào và đầu ra thế nào?

Đầu tiên mô tả nhiệm vụ được mã hóa bằng mô hình ngôn ngữ đã học trước; camera được một mạng ảnh gọn chuyển thành đặc trưng. Transformer xử lý cả hai nhóm token và lịch sử cần thiết, tạo các token trung gian cho nhánh dự đoán hành động.

Khi chuyển sang robot mới, ta có thể thêm quan sát như cảm biến lực hoặc đổi nhánh lệnh điều khiển mà không phải thay toàn bộ backbone. Một số tham số vẫn cần tinh chỉnh bằng demonstration của robot đích. Chính cách tách phần chung và phần riêng làm Octo phù hợp cho nghiên cứu thích nghi nhiều thiết bị.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Một policy đã pretrain thấy nhiều kiểu pick-place. Khi có robot mới với gripper/camera geometry khác, fine-tune một subset episodes thay vì huấn luyện scratch. Policy nhận vision, nhiệm vụ conditioning (ngôn ngữ/mục tiêu) và state rồi dự đoán chunks. Thí nghiệm nên đo **dữ liệu efficiency** theo số demos tại target phần cứng; chỉ đo huấn luyện thành công sẽ đánh giá sai ý nghĩa pretraining.

Octo tách khái niệm `task token` và biểu diễn action; đọc code cần tìm nơi prepare quan sát history và nơi đầu ra adapter biến policy action thành robot-specific commands.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ từ tay máy đơn sang robot hai tay

Policy từng học nhiều nhiệm vụ nhặt và đặt bằng tay máy đơn. Khi chuyển sang robot hai tay, khái niệm vị trí đích hoặc quan sát vật thể có thể hữu ích, nhưng lệnh hai tay phối hợp có số chiều và ràng buộc khác. Người nghiên cứu cần gắn nhánh đầu ra phù hợp và đưa demonstration về hai tay để tinh chỉnh.

Nếu chỉ lấy lệnh cũ gửi xuống robot mới, chuyển động có thể sai hoàn toàn. Vì vậy khả năng tinh chỉnh nhanh phải được chứng minh bằng dữ liệu robot đích và tỷ lệ thành công sau khi tinh chỉnh, không chỉ nhìn tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Ở zero-shot evaluations qua nhiều platform, Octo đạt tỷ lệ thành công trung bình cao hơn **RT-1-X khoảng 29%** trong comparison của bài báo và có thiết lập cạnh tranh với RT-2-X 55B dù mô hình nhỏ hơn rất nhiều. Goal-image conditioning trên một số WidowX thiết lập tốt hơn ngôn ngữ khoảng **25 điểm**, phản ánh hỗn hợp dữ liệu huấn luyện của Octo.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 8](/paper-figures/octo/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Phần mạnh nhất là adaptation: với cỡ **100 demonstrations**, fine-tuned Octo vượt các phương pháp đối chứng huấn luyện từ đầu hoặc chuyên biệt mạnh trên nhiều domain, có mức cải thiện tổng hợp mà tác giả nêu lên đến **52%** so với phương pháp đối chứng tốt nhất tiếp theo. Ablations cho thấy độ đa dạng dữ liệu pretraining, dung lượng biểu diễn của mô hình và diffusion action head đều đóng góp.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc các thí nghiệm Octo

Hình 4 thể hiện nhiều loại nhiệm vụ trên chín thiết lập robot thật, gồm nhặt đồ, thao tác dài và lắp vật chính xác. Hình 5 kiểm tra việc dùng checkpoint trực tiếp trong những môi trường nằm trong nguồn học trước; điều này khác với thử trên môi trường hoàn toàn chưa thấy.

Hình 6 cho thấy tăng kích thước model giúp cải thiện trong một số phép thử, nhưng số lượt ở từng nhiệm vụ cần được đọc cùng kết quả. Quan trọng nhất là tách điểm của model chưa tinh chỉnh khỏi điểm sau khi sử dụng dữ liệu đích.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** wrist-camera và ngôn ngữ hiệu năng yếu hơn mong muốn vì hỗn hợp dữ liệu huấn luyện chỉ có tỷ lệ tương đối nhỏ mẫu chứa các modality đó. Dữ liệu phần lớn là optimal/successful demonstrations nên phục hồi chưa được học tốt. Pretraining chủ yếu single-/dual-arm manipulators, chưa mobile/navigation/dexterous rộng.

**Phê bình thêm:** Octo mạnh nhất ở **fine-tuning**, không phải zero-shot universal control. 93M parameters giúp practical nhưng suy luận ngữ nghĩa kém xa VLM-based VLA lớn. Heterogeneous OXE dữ liệu vẫn có imbalance/action-convention problem, và modular heads nghĩa là một phần cross-embodiment alignment được xử lý thủ công ở interface. Vì vậy Octo rất giống “BERT cho robot policy” ở workflow, nhưng chưa phải “GPT-4 của vật lý intelligence”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những giới hạn phải giữ trong đầu

Octo học từ một tập con được chọn của Open X, nên không phải tất cả robot và kỹ năng ngoài đời đều có mặt. Khi đổi cảm biến hoặc hành động, nhánh mới có thể cần dữ liệu đủ tốt; chỉ linh hoạt về cấu trúc không bảo đảm robot hoạt động thành công.

Tốc độ suy luận và an toàn của lệnh motor cũng cần kiểm tra trên phần cứng. Một policy tổng quát rất tốt offline vẫn có thể chậm hoặc thiếu chính xác ở bài toán kẹp nhỏ.

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

## Đọc code và tự kiểm chứng

Chạy đã pretrain Octo trên một small tập dữ liệu, debug preprocessing trước. Nếu GPU không đủ, chỉ chạy dữ liệu loader và action mask tests trên Mac rồi inference trên Colab.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự thử xây một phép đánh giá

Chọn hai robot có cùng nhiệm vụ “nhặt và đặt” nhưng nhận lệnh khác nhau. Trên robot thứ hai, so policy từ đầu với Octo được tinh chỉnh bằng cùng 20, 50 hoặc 100 demonstration. Đo tỷ lệ thành công theo lượng dữ liệu tăng.

Nếu thêm camera cổ tay, hãy xem việc mở rộng đầu vào thực sự có cải thiện so với cấu hình không thêm không. Đây là cách thử đóng góp của kiến trúc thay vì chỉ kể rằng Octo hỗ trợ nhiều loại tín hiệu.

<!-- END EXTENDED WALKTHROUGH -->

