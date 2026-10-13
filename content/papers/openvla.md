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

RT-2 gợi ý VLM-to-action là khả thi nhưng không phải open reproducible mô hình cho nhiều phòng thí nghiệm. OpenVLA cung cấp implementation, weights và LoRA fine-tuning, giúp mở phần lớn hệ thống để kiểm chứng ở mức mô hình code.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Các thành phần của OpenVLA là gì?

OpenVLA kết hợp hai bộ mã hóa ảnh DINOv2 và SigLIP để nhận thông tin hình học/thị giác cùng ngữ nghĩa; một bộ ánh xạ chuyển các đặc trưng đó sang dạng mà mô hình ngôn ngữ dùng được; rồi lõi Llama 2 dự đoán token hành động.

Mỗi token hành động là mã cho giá trị điều khiển, không phải chữ giải thích cho người. Trước khi gửi lệnh xuống robot, cần giải mã và khôi phục đơn vị/hệ tọa độ đúng. Số bảy chiều trong đầu ra của nghiên cứu là một quy ước cụ thể, không có nghĩa mọi robot đều có đúng bảy khớp.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

OpenVLA dùng **Llama 2 7B** làm ngôn ngữ backbone và fuse đặc trưng thị giác từ **DINOv2 + SigLIP**, sau đó pretrain/fine-tune trên khoảng **970 nghìn robot demonstrations** từ Open X-Embodiment. Liên tục robot actions được discretize thành tokens để mô hình dùng cùng autoregressive next-token mục tiêu huấn luyện với VLM.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 10](/paper-figures/openvla/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Bài báo đặc biệt quan tâm tới adaptation. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/hiệu năng trade-off. Đây là lý do OpenVLA hữu ích như research substrate hơn là chỉ một leaderboard entry.

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

Đầu vào gồm hình ảnh và chỉ dẫn, backbone VLM tạo hidden đặc trưng, decoder sinh discrete tokens mã hóa các action dimensions. Tại inference, tokenizer decode token IDs về giá trị action đã normalize; phía robot phải unnormalize theo statistics của tập dữ liệu/phần cứng. Sai normalizer có thể tạo action vô lý dù token độ chính xác cao.

OpenVLA là contrast hữu ích với π0.5: OpenVLA thường autoregressive **discrete action**, còn π0-style policy sinh action liên tục chunks qua flow-based expert.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ tinh chỉnh trên tay máy Franka

Giả sử robot Franka cần nhặt những đồ vật khác với tập huấn luyện gốc. Ta ghi các lượt người điều khiển Franka thực hiện nhiệm vụ, chuyển ảnh, câu lệnh và hành động vào định dạng dữ liệu model nhận. Sau đó tinh chỉnh một phần hoặc toàn bộ tham số.

Khi kiểm tra, không chỉ xem model có nhặt đúng vật quen thuộc không mà còn thử vật gây nhiễu, câu nói khác và vị trí mới. Nếu nó hiểu đúng vật nhưng kẹp hụt, cần xác minh camera và cách biến token thành lệnh trước khi quy kết cho khả năng suy luận.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên bộ 29 nhiệm vụ dùng để so generalist policies, OpenVLA báo tỷ lệ thành công trung bình cao hơn **RT-2-X khoảng 16.5 điểm** trong đánh giá của họ. Sau task-specific/multi-task fine-tuning, OpenVLA vượt Octo và Diffusion Policy đáng kể trên những thiết lập thao tác robot cần hiểu nhiều chỉ dẫn ngôn ngữ, tác giả nêu mức cải thiện tổng hợp khoảng **20.4%**.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 7](/paper-figures/openvla/figure-3.webp)
![Hình 4 từ PDF gốc, trang 8](/paper-figures/openvla/figure-4.webp)
![Hình 5 từ PDF gốc, trang 9](/paper-figures/openvla/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
PEFT là phần rất thực dụng: **LoRA rank 32** đạt khoảng **68.2%** so với **69.7%** full fine-tuning nhưng chỉ huấn luyện khoảng **1.4% parameters** và memory giảm mạnh. 4-bit quantization trong một thiết lập giữ hiệu năng gần bf16, thậm chí số đo dao động **71.9 vs 71.3**, trong khi mô hình memory giảm từ khoảng 16.8 GB xuống 7 GB. Điều đó chứng minh VLA adaptation không nhất thiết cần một cụm H100.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Khi nào OpenVLA thực sự hơn mô hình khác?

Trên các phép thử WidowX và Google Robot, OpenVLA đạt kết quả tốt so với các policy tổng quát được đem đối chiếu. Tuy nhiên kết quả không giống nhau ở mọi nhóm; ví dụ một số kiểm tra khái quát ngữ nghĩa vẫn có đối thủ tốt hơn.

Khi thích nghi robot mới, Diffusion Policy huấn luyện riêng có thể mạnh ở một nhiệm vụ hẹp, còn mô hình tổng quát đã học trước như Octo và OpenVLA có lợi thế trên tập lệnh/phông nền đa dạng. Hãy so các hệ thống cùng dữ liệu tinh chỉnh và cùng số lượt chạy, thay vì coi một điểm tổng hợp là lời khẳng định tuyệt đối.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** mô hình chỉ dùng single-image quan sát, thiếu quan sát history, multiview và proprioception phong phú. Autoregressive action inference chậm với high-frequency platforms như ALOHA. Reliability dưới 90% ở nhiều nhiệm vụ vẫn chưa đủ cho production, và do compute constraints bài báo không khám phá hết design không gian. Trên một số narrow dexterous nhiệm vụ, specialist Diffusion Policy vẫn mượt/tốt hơn.

**Phê bình thêm:** action tokenization là một nút thắt kép: quantization làm mất độ chính xác, autoregression làm mất speed. Dung lượng mô hình ngôn ngữ 7B tham số không tự động biến thành motor dung lượng mô hình. Kết quả fine-tuned mạnh đôi khi dễ bị đọc nhầm thành zero-shot foundation capability. OpenVLA cũng kế thừa toàn bộ imbalance và action-schema mess của OXE. Giá trị lớn nhất của nó là **mở ra hệ sinh thái**, không phải chứng minh action-as-text đã là endpoint của kiến trúc VLA.

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

Chỉ chạy 4-bit inference T4, log processor đầu vào, token thị giác, logits/token IDs, decoded normalized action và unnormalized action. Đừng đốt quota vào full fine-tune ngay.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Danh sách kiểm tra trước khi tự tinh chỉnh

Bạn có ảnh và câu lệnh cùng thời điểm với hành động không? Dữ liệu đã chia train/test theo lượt thực thi chưa? Vector lệnh là vị trí, độ thay đổi vị trí hay vận tốc? Đã ghi đúng giá trị trung bình/độ lệch chuẩn để giải chuẩn hóa chưa? Đã thử cho model học một số ít demonstration để bắt lỗi pipeline trước chưa?

Sau khi ổn, đánh giá cả tỷ lệ hoàn thành ngoài đời lẫn độ trễ và lệnh vượt giới hạn. Đó mới là cách nói một checkpoint đã dùng được trên robot đích.

<!-- END EXTENDED WALKTHROUGH -->

