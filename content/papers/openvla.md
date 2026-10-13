## Vì sao cần nghiên cứu này?

Một mô hình VLA mạnh nhưng không có mã nguồn và checkpoint sẽ rất khó được các phòng thí nghiệm nhỏ nghiên cứu, kiểm chứng hoặc điều chỉnh cho robot riêng. **OpenVLA cung cấp một mô hình ảnh–ngôn ngữ–hành động nguồn mở khoảng bảy tỷ tham số**, đã học từ nhiều lượt robot thao tác. Nhóm nghiên cứu có thể tải mô hình, tinh chỉnh bằng dữ liệu của robot đích và so sánh với những chính sách chuyên biệt. Điều cần chú ý là mô hình vẫn phải được chuyển đúng dạng lệnh cho phần cứng mới; nguồn mở không có nghĩa tự tương thích với mọi robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/openvla/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 giới thiệu OpenVLA theo cách nên đọc từ dữ liệu huấn luyện tới khả năng sử dụng: VLA 7B học trên gần một triệu robot episodes thuộc tập Open X-Embodiment, rồi được fine-tune cho task và robot đích. Đây là bằng chứng về một recipe mở có khả năng tái sử dụng chứ không phải tuyên bố chỉ tải checkpoint là sẽ điều khiển ngay mọi phần cứng. Ngay trong hình, hãy phân biệt phần học tri thức thị giác-ngôn ngữ trước đó với supervision từ robot, bởi kiến thức nhìn vật thể và khả năng thực sự kẹp/di chuyển vật thể là hai thứ khác nhau.

### Vì sao một mô hình VLA nguồn mở đáng chú ý?

Một nhóm nghiên cứu muốn dạy robot nhặt đồ có thể phải tự thu dữ liệu lớn và tự thiết kế mạng từ đầu. OpenVLA cung cấp mô hình đã được huấn luyện trên gần một triệu lượt robot cùng mã nguồn và checkpoint công khai. Người dùng có thể **tinh chỉnh mô hình nền bằng dữ liệu robot của mình** thay vì bắt đầu từ số không.

Nhưng “nguồn mở” không đồng nghĩa “cắm vào robot nào cũng chạy”. Model vẫn cần ảnh đúng kiểu, câu lệnh phù hợp và cách giải mã hành động tương ứng với phần cứng đích.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

RT-2 đã cho thấy cách kết hợp mô hình ảnh–ngôn ngữ với hành động robot, nhưng không cung cấp mọi thứ để các phòng thí nghiệm tự tái tạo. OpenVLA công khai mô hình, mã nguồn và trọng số để nhóm nghiên cứu có thể kiểm chứng và **tinh chỉnh cho thiết bị của mình**.

Khi chạy robot, mô hình sinh token đại diện các giá trị hành động. Những token cần được giải mã, rồi khôi phục đơn vị và biên độ đúng cho phần cứng. LoRA là một cách tinh chỉnh chỉ cập nhật một phần nhỏ tham số; nó giúp giảm chi phí, không tự xử lý lỗi camera hay lệnh khớp.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Các thành phần của OpenVLA là gì?

OpenVLA kết hợp hai bộ mã hóa ảnh DINOv2 và SigLIP để nhận thông tin hình học/thị giác cùng ngữ nghĩa; một bộ ánh xạ chuyển các đặc trưng đó sang dạng mà mô hình ngôn ngữ dùng được; rồi lõi Llama 2 dự đoán token hành động.

Mỗi token hành động là mã cho giá trị điều khiển, không phải chữ giải thích cho người. Trước khi gửi lệnh xuống robot, cần giải mã và khôi phục đơn vị/hệ tọa độ đúng. Số bảy chiều trong đầu ra của nghiên cứu là một quy ước cụ thể, không có nghĩa mọi robot đều có đúng bảy khớp.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

OpenVLA dùng lõi ngôn ngữ **Llama 2 khoảng 7 tỷ tham số**, kết hợp đặc trưng ảnh từ **DINOv2 và SigLIP**. Mô hình được huấn luyện trên khoảng **970.000 lượt thao tác robot** thuộc Open X-Embodiment. Các giá trị lệnh liên tục được chuyển thành token rời rạc, để mạng dự đoán tuần tự như khi sinh token ngôn ngữ.

Nhóm tác giả còn thử nhiều phương án tinh chỉnh: cập nhật toàn bộ tham số, LoRA và lượng tử hóa 4 hoặc 8 bit để tiết kiệm bộ nhớ. Khi đánh giá phải đo cả tỷ lệ thành công, thời gian và tài nguyên, không chỉ xem mô hình có tạo đúng số chiều hành động.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 10](/paper-figures/openvla/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/openvla/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 là chỗ phải hiểu đường đi của action: ảnh quan sát và lệnh ngôn ngữ đi qua VLM, decoder sinh các token tương ứng với những chiều trong action robot, và bước giải mã chuyển token trở lại lệnh điều khiển 7 chiều. Đây không phải sinh văn bản 'nhặt cốc' rồi robot tự biết làm. Action tokenization phải có quy tắc discretization, normalization và thứ tự chiều nhất quán với dataloader lẫn executor. Nếu lẫn giá trị gripper với rotation, mô hình vẫn có thể cho ra token hợp lệ nhưng hành động sẽ sai.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ dùng một trajectory có delta position xyz, delta rotation ba chiều và gripper. Đầu tiên encode action thật thành token ID theo đúng bin và cách chuẩn hóa của OpenVLA; sau đó decode lại mà chưa chạy model để đo quantization error. Tiếp theo cố định ảnh, thay instruction, xem distribution của action tokens có đổi tương ứng hay không. Cuối cùng fine-tune trên một tập demonstration nhỏ và so với random initialization; so accuracy token, sai số action liên tục sau decode và rollout success. Những phép thử này tách lỗi tokenizer khỏi lỗi semantic grounding và lỗi control.

### Một lần chạy mô hình trên robot diễn ra ra sao?

**Bước 1:** camera cung cấp ảnh, người dùng đưa câu lệnh, chẳng hạn “Bỏ quả táo vào khay”. **Bước 2:** bộ mã hóa ảnh chuyển cảnh thành đặc trưng. **Bước 3:** mạng ánh xạ biểu diễn ảnh để lõi ngôn ngữ có thể kết hợp với câu lệnh. **Bước 4:** lõi mô hình dự đoán token hành động; hệ thống giải mã token thành lệnh vận động.

Robot thực hiện lệnh, lấy ảnh tiếp theo và tiếp tục. Nếu đem model sang robot mới, ta cần fine-tune trên demonstration của robot ấy và kiểm tra cách mã hóa/giải mã hành động. Lỗi ở bước chuyển đổi lệnh có thể khiến một model có loss đẹp tạo chuyển động sai.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Người dùng nói **“Bỏ quả táo vào khay”**. Camera gửi ảnh cho bộ mã hóa thị giác; lõi mô hình kết hợp với câu lệnh và sinh token hành động. Hệ thống giải mã token thành các giá trị dịch chuyển, xoay hoặc đóng kẹp. Trước khi gửi xuống robot, những giá trị này phải được **giải chuẩn hóa bằng thống kê của đúng robot/tập dữ liệu**.

Nếu lấy thống kê của robot khác, cùng token có thể dẫn đến lệnh quá lớn hoặc sai hướng. Đó là lỗi chuyển đổi đầu ra, không nhất thiết do mô hình hiểu sai quả táo hay câu lệnh.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ tinh chỉnh trên tay máy Franka

Giả sử robot Franka cần nhặt những đồ vật khác với tập huấn luyện gốc. Ta ghi các lượt người điều khiển Franka thực hiện nhiệm vụ, chuyển ảnh, câu lệnh và hành động vào định dạng dữ liệu model nhận. Sau đó tinh chỉnh một phần hoặc toàn bộ tham số.

Khi kiểm tra, không chỉ xem model có nhặt đúng vật quen thuộc không mà còn thử vật gây nhiễu, câu nói khác và vị trí mới. Nếu nó hiểu đúng vật nhưng kẹp hụt, cần xác minh camera và cách biến token thành lệnh trước khi quy kết cho khả năng suy luận.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên các nhóm nhiệm vụ robot thật được so sánh, OpenVLA có kết quả tốt hơn một số chính sách tổng quát trước đó; mức chênh lệch phụ thuộc robot và nhiệm vụ. Khi tinh chỉnh cho robot đích, mô hình đặc biệt hữu ích ở tình huống có nhiều câu lệnh và vật gây nhiễu, nhưng một chính sách chuyên biệt như Diffusion Policy vẫn có thể mạnh ở nhiệm vụ hẹp.

Một kết quả thực dụng là **LoRA chỉ cập nhật khoảng 1,4% tham số** trong một thiết lập mà giữ kết quả gần tinh chỉnh toàn bộ. Lượng tử hóa còn giúp giảm đáng kể bộ nhớ. Tuy nhiên cần phân biệt những kết quả này với khả năng của checkpoint chưa từng được tinh chỉnh.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 7](/paper-figures/openvla/figure-3.webp)
![Hình 4 từ PDF gốc, trang 8](/paper-figures/openvla/figure-4.webp)
![Hình 5 từ PDF gốc, trang 9](/paper-figures/openvla/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Khi nào OpenVLA thực sự hơn mô hình khác?

Trên các phép thử WidowX và Google Robot, OpenVLA đạt kết quả tốt so với các policy tổng quát được đem đối chiếu. Tuy nhiên kết quả không giống nhau ở mọi nhóm; ví dụ một số kiểm tra khái quát ngữ nghĩa vẫn có đối thủ tốt hơn.

Khi thích nghi robot mới, Diffusion Policy huấn luyện riêng có thể mạnh ở một nhiệm vụ hẹp, còn mô hình tổng quát đã học trước như Octo và OpenVLA có lợi thế trên tập lệnh/phông nền đa dạng. Hãy so các hệ thống cùng dữ liệu tinh chỉnh và cùng số lượt chạy, thay vì coi một điểm tổng hợp là lời khẳng định tuyệt đối.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

OpenVLA sử dụng quan sát ảnh còn khá hạn chế trong thiết lập công bố, thiếu lịch sử dài, nhiều góc camera và thông tin trạng thái phong phú ở một số trường hợp. Sinh token hành động tuần tự có thể gây độ trễ và sai số lượng tử hóa, nhất là nhiệm vụ cần tần số điều khiển cao.

Nguồn mở không đồng nghĩa hoạt động ổn định trên mọi robot. Một chính sách bảy tỷ tham số có thể hiểu chỉ dẫn tốt nhưng vẫn kẹp lệch hoặc phản ứng quá chậm. Cần đo hiệu quả trên robot thật, kiểm tra lệnh vượt giới hạn và báo cáo riêng trước/sau tinh chỉnh.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn và chi phí triển khai

Mô hình bảy tỷ tham số thường tốn bộ nhớ và thời gian suy luận đáng kể. Lượng tử hóa có thể giúp nhanh/nhẹ hơn, nhưng cần kiểm tra sai số hành động và độ trễ toàn bộ hệ thống, không chỉ thời gian chạy một lượt mạng.

Dữ liệu từ nhiều loại robot còn đặt ra bài toán không gian hành động không đồng nhất. Trước khi chạy thực, hãy kiểm tra biên độ lệnh, an toàn khớp, giới hạn vùng làm việc và cách chuẩn hóa từng chiều.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [FAST](/paper/fast)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### So OpenVLA với Octo và RT-2

Cả RT-2 và OpenVLA đều dùng kiến thức ảnh–ngôn ngữ để hỗ trợ sinh hành động robot. OpenVLA nổi bật ở khả năng truy cập mã/khối lượng của checkpoint để nghiên cứu và tinh chỉnh. Octo cũng là mô hình mở nhưng kiến trúc hướng khả năng thay quan sát, đầu ra linh hoạt theo robot.

Việc một mạng dùng lõi mô hình ngôn ngữ không tự khiến nó giỏi hơn mọi chính sách diffusion ở mọi thao tác. Các lựa chọn phải dựa trên nhiệm vụ, phần cứng, dữ liệu và chi phí suy luận cụ thể.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Trước khi huấn luyện lớn, thử chạy suy luận một vài ảnh trên cấu hình GPU vừa đủ. Ghi lại ảnh/câu lệnh đầu vào, token hành động được sinh, vector sau giải mã và **vector sau giải chuẩn hóa**. Kiểm tra đơn vị, hệ tọa độ và giới hạn an toàn trước khi cho robot thật chuyển động.

Nếu GPU hạn chế, thử lượng tử hóa rồi đo bộ nhớ và độ trễ. Chỉ nên tinh chỉnh sau khi quy trình dữ liệu, normalizer và bộ giải mã lệnh được xác minh, tránh tốn tài nguyên để học trên các nhãn sai.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Danh sách kiểm tra trước khi tự tinh chỉnh

Bạn có ảnh và câu lệnh cùng thời điểm với hành động không? Dữ liệu đã chia train/test theo lượt thực thi chưa? Vector lệnh là vị trí, độ thay đổi vị trí hay vận tốc? Đã ghi đúng giá trị trung bình/độ lệch chuẩn để giải chuẩn hóa chưa? Đã thử cho model học một số ít demonstration để bắt lỗi pipeline trước chưa?

Sau khi ổn, đánh giá cả tỷ lệ hoàn thành ngoài đời lẫn độ trễ và lệnh vượt giới hạn. Đó mới là cách nói một checkpoint đã dùng được trên robot đích.

<!-- END EXTENDED WALKTHROUGH -->

