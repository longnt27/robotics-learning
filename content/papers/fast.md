## Vì sao cần nghiên cứu này?

Autoregressive VLA có một vấn đề hơi ngu nhưng chí mạng: action liên tục stream ở 20-50 Hz tạo quá nhiều tokens nếu discretize từng dimension từng timestep. Sequence dài làm huấn luyện chậm, inference chậm và đặc biệt tệ ở dexterous/high-frequency các quỹ đạo. Nếu nén action quá mạnh thì lại mất độ chính xác. FAST hỏi: **có biểu diễn nào nén smooth robot các quỹ đạo thành ít tokens mà vẫn bảo toàn motor detail đủ tốt không?**

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 5](/paper-figures/fast/figure-4.webp)
![Hình 7 từ PDF gốc, trang 8](/paper-figures/fast/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/fast/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 giải thích lý do FAST tồn tại: action liên tục có tần số cao nhưng token autoregressive được sinh tuần tự, khiến chuỗi dài, tốn thời gian và khó scale. FAST tận dụng đặc trưng trơn theo thời gian của trajectory, dùng biến đổi miền tần số rồi lượng tử hóa các hệ số quan trọng. Khi hành động thay đổi tương đối chậm, phần lớn tín hiệu nằm ở tần số thấp; ta không nhất thiết cần một token cho từng giá trị joint ở từng frame.

### Vì sao dự đoán token hành động có thể quá chậm?

Giả sử robot di chuyển tay theo một đường cong mượt, được ghi lại hàng trăm lần mỗi giây. Nếu mỗi giá trị lệnh được biến thành một token riêng, mô hình phải dự đoán rất nhiều token gần như giống nhau. Chuỗi dài khiến huấn luyện chậm và dễ sai ở tần số cao. **FAST tìm cách nén cả chuỗi hành động theo thời gian trước khi chuyển thành token**, thay vì mã hóa từng mẫu riêng lẻ.

Điểm cốt lõi: FAST là cách biểu diễn hành động, không phải một mô hình nhận biết ảnh hay policy hoàn toàn độc lập. Nó giúp một kiểu mô hình sinh token làm việc hiệu quả hơn trên dữ liệu robot.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Autoregressive VLA thường token hóa mỗi action dimension mỗi timestep. Nếu horizon 50 và robot có nhiều DoF, số tokens tăng cực nhanh, độ trễ/memory tệ. Nhưng robot các quỹ đạo khá mượt, nên có **theo thời gian redundancy** có thể khai thác.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 8 từ PDF gốc, trang 8](/paper-figures/fast/figure-8.webp)
![Hình 9 từ PDF gốc, trang 9](/paper-figures/fast/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tần số và phép biến đổi DCT có ý nghĩa gì?

Một chuyển động mượt có nhiều mẫu thời gian nhưng phần lớn hình dạng được mô tả bằng vài thành phần biến thiên chậm. **Biến đổi cosin rời rạc (DCT)** chuyển chuỗi giá trị theo thời gian thành các hệ số tần số, cho phép giữ thông tin quan trọng bằng ít giá trị hơn.

**Lượng tử hóa** biến hệ số liên tục thành mã rời rạc; **BPE** ghép những mẫu mã thường gặp thành token để rút ngắn chuỗi. Nén quá mạnh có thể làm mất chi tiết tiếp xúc, nên không thể chỉ nhìn số token giảm mà kết luận mọi thứ đều tốt hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

FAST lợi dụng fact rằng robot các quỹ đạo thường smooth theo thời gian. Nó dùng **Discrete Cosine Transform (DCT)** để chuyển action chunk sang frequency domain, nơi phần lớn năng lượng nằm ở ít low-frequency coefficients, rồi tokenize/entropy-code các coefficients đó. **FAST+** là universal action tokenizer được huấn luyện trên khoảng **1 triệu robot các quỹ đạo** thuộc nhiều action spaces và frequencies thay vì huấn luyện tokenizer riêng cho mỗi tập dữ liệu.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 3](/paper-figures/fast/figure-3.webp)
![Hình 6 từ PDF gốc, trang 8](/paper-figures/fast/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Sau đó FAST được ghép với π-style autoregressive VLA. Vì mỗi chunk dùng ít tokens hơn rất nhiều, dự đoán action không còn kéo chuỗi length lên phi lý.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/fast/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 mô tả nơi FAST đứng trong VLA autoregressive: trước khi model dự đoán next token, trajectory đã được nén thành một chuỗi biểu diễn gọn hơn. Sau sampling phải giải mã về action liên tục đúng shape, đơn vị và horizon. Điều này khác hẳn việc thay robot controller bằng Transformer; model học phân phối trên mã hành động, còn decoder phải khôi phục lệnh có thể thực thi.

#### Ví dụ từng bước để hiểu cơ chế

Thử một trajectory 50 timestep và 7 chiều có chuyển động trơn. Chạy DCT theo trục thời gian, sắp xếp hệ số theo tần số, chỉ giữ những hệ số cần thiết rồi inverse DCT. Đo sai số tái tạo từng joint, đặc biệt đoạn tiếp xúc hoặc chuyển gripper trạng thái. Sau đó thử quỹ đạo có va đập/ngắt quãng: tín hiệu nhiều high frequency có thể mất nhiều thông tin hơn ở cùng compression ratio. Đây là cách hiểu trade-off của FAST chứ không chỉ nhìn vào token-count reduction.

### FAST mã hóa và giải mã một đoạn hành động

Đầu tiên hệ thống lấy một đoạn hành động và chuẩn hóa để các chiều có biên độ phù hợp. Sau đó DCT chuyển nó sang miền tần số. Những hệ số được lượng tử hóa rồi ghép thành chuỗi mã, BPE tiếp tục nén thành token cuối cùng để mô hình tự hồi quy dự đoán.

Khi chạy, những token dự đoán được giải mã ngược: BPE → hệ số lượng tử → khôi phục hệ số → DCT ngược → chuỗi hành động theo thời gian → giải chuẩn hóa. Chỉ khi hoàn thành cả hai chiều chuyển đổi, robot mới nhận được lệnh vật lý đúng đơn vị.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Tạo action tensor `(T=50, D=7)`. Normalize, biến mỗi dimension theo DCT từ time domain sang frequency coefficients, giữ coefficients mang nhiều năng lượng và lượng tử hóa thành token chuỗi. Decode đảo quy trình để reconstruct actions. Với quỹ đạo mượt, high-frequency coefficients nhỏ; với quỹ đạo giật, compression khó hơn.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 10 từ PDF gốc, trang 10](/paper-figures/fast/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Đây không phải thần kỳ: DCT chỉ là thay basis. Việc tokenizer giữ đủ thông tin về những chuyển động contact-critical mới quyết định policy thành công.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ vẽ đường cong qua bốn điểm

Bạn có bốn điểm mốc và muốn mô tả một đường cong đi qua chúng. Nếu viết vị trí tại từng phần nghìn giây, bạn sẽ có một danh sách rất dài dù hình dạng tổng thể đơn giản. DCT cho phép ghi lại những thành phần hình dạng quan trọng hơn là từng điểm riêng lẻ.

Hình 3 thử tăng tần số lấy mẫu của đường cong. Cách chia giá trị từng bước thành khoảng rời rạc hoạt động ngày càng kém, trong khi FAST giữ dự đoán tốt hơn. Đây là một ví dụ sáng rõ về vấn đề biểu diễn, không cần nhớ công thức DCT ngay từ đầu.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo cho thấy FAST/FAST+ cho phép autoregressive VLA scale tới cỡ **10 nghìn giờ dữ liệu robot** và đạt hiệu năng gần hoặc ngang flow/diffusion VLA trong các benchmark của họ, trong khi **huấn luyện có thể nhanh hơn tới khoảng 5x** so với naive action tokenization. Gains rõ nhất ở high-frequency và dexterous thiết lập, nơi per-timestep binning tạo chuỗi quá dài.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/fast/figure-5.webp)
![Hình 11 từ PDF gốc, trang 10](/paper-figures/fast/figure-11.webp)

<!-- END ADDITIONAL PDF FIGURES -->
FAST+ gần dataset-specific tokenizers dù phải cover nhiều robot/action spaces. Đây là kết quả quan trọng vì nó biến tokenizer thành một reusable foundation component chứ không phải thứ phải hand-tune cho từng arm.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả mà không nhầm tốc độ với chất lượng

Hình 6 so FAST, FSQ và cách chia giá trị thành các khoảng rời rạc. Các cách nén hành động giúp huấn luyện hiệu quả hơn; FAST đặc biệt có lợi ở thao tác robot thật cần sự khéo léo. Hình 9 so phiên bản π0 dùng diffusion với phiên bản giải mã FAST: tập nhỏ có thể gần nhau, tập lớn đôi khi hội tụ nhanh hơn.

FAST+ hướng tới một bộ mã hóa dùng chung cho nhiều kiểu robot. Khi đọc tỷ lệ thành công, vẫn cần xem số lần chạy và khoảng tin cậy. Tốc độ huấn luyện nhanh hơn không tự bảo đảm hành động cuối cùng chính xác hơn trong mọi nhiệm vụ.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** evaluations chủ yếu vẫn là static manipulation; mobile, humanoid và dexterous scaling rộng hơn được để lại cho tương lai. π0-FAST autoregressive inference vẫn chậm hơn flow-based π0 trong runtime, nên dynamic nhiệm vụ cần decoder nhanh hơn. Tác giả cũng thừa nhận discrete/autoregressive so với liên tục diffusion chưa có winner cuối cùng.

**Phê bình thêm:** DCT dựa vào theo thời gian smoothness; abrupt contact corrections hoặc high-frequency phenomena chính là phần có thể bị nén tệ nhất. Huấn luyện nhanh không đồng nghĩa control độ trễ nhanh. Universal tokenizer còn phải đối mặt với phân phối action rất khác nhau giữa joint, EEF, hand và base. FAST giải chuỗi compression rất đẹp, nhưng vẫn giữ **autoregressive exposure/độ trễ problem** ở tầng decoder.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Khi nào nén hành động có thể gây hại?

Một quỹ đạo đưa tay qua khoảng trống có thể rất mượt và dễ nén. Nhưng khi cắm linh kiện vào khe nhỏ hoặc khép gripper ngay lúc chạm vật, thay đổi đột ngột có thể quan trọng. Nếu bộ mã hóa làm mất tín hiệu ấy, policy sẽ sinh hành động mượt nhưng sai thời điểm.

Do đó nên đo sai số sau khi mã hóa–giải mã trên từng chiều và tại các đoạn có tiếp xúc. Cần kiểm tra cả kết quả robot thực hiện, không chỉ tỷ lệ nén.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [OpenVLA](/paper/openvla)
- [π0.5](/paper/pi-0-5)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### FAST liên quan thế nào tới OpenVLA và π0.5?

OpenVLA dùng token hành động, nhưng cách mã hóa từng giá trị có thể tạo chuỗi rất dài với dữ liệu tần số cao. FAST đề xuất nén ở cấp đoạn chuỗi. π0.5 tận dụng FAST trong một giai đoạn huấn luyện, rồi dùng flow matching để tạo chuỗi hành động liên tục ở giai đoạn sau.

Đây là các lựa chọn về định dạng mục tiêu và bộ sinh, không phải hai tên gọi cho cùng một kỹ thuật. Để so sánh, phải nhìn xem token đang mang thông tin gì.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chạy FAST tokenizer trên Mac M4 với synthetic smooth và noisy các quỹ đạo; plot thô vs reconstructed; sweep chunk length/độ chính xác và đo reconstruction MAE, token count.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự làm phép thử nhỏ trước khi huấn luyện policy

Lấy 100 điểm vị trí của một chuyển động mượt. Áp dụng DCT, giữ số hệ số thấp rồi dựng lại đường. Đo sai số tổng thể và sai số ở chỗ chuyển hướng. Tiếp đó làm với một chuỗi có bước nhảy đột ngột tương ứng hành động đóng kẹp.

So hai kết quả sẽ thấy dữ liệu mượt dễ nén hơn; động tác tiếp xúc cần cẩn thận. Đây là phép thử giải thích FAST tốt hơn việc học thuộc rằng nó “nhanh hơn năm lần”.

<!-- END EXTENDED WALKTHROUGH -->

