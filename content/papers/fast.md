## Vì sao cần nghiên cứu này?

Autoregressive VLA có một vấn đề hơi ngu nhưng chí mạng: action liên tục stream ở 20-50 Hz tạo quá nhiều tokens nếu discretize từng dimension từng timestep. Sequence dài làm huấn luyện chậm, inference chậm và đặc biệt tệ ở dexterous/high-frequency các quỹ đạo. Nếu nén action quá mạnh thì lại mất độ chính xác. FAST hỏi: **có biểu diễn nào nén smooth robot các quỹ đạo thành ít tokens mà vẫn bảo toàn motor detail đủ tốt không?**

## Kiến thức nền cần nắm

Autoregressive VLA thường token hóa mỗi action dimension mỗi timestep. Nếu horizon 50 và robot có nhiều DoF, số tokens tăng cực nhanh, độ trễ/memory tệ. Nhưng robot các quỹ đạo khá mượt, nên có **theo thời gian redundancy** có thể khai thác.

## Phương pháp thực hiện

FAST lợi dụng fact rằng robot các quỹ đạo thường smooth theo thời gian. Nó dùng **Discrete Cosine Transform (DCT)** để chuyển action chunk sang frequency domain, nơi phần lớn năng lượng nằm ở ít low-frequency coefficients, rồi tokenize/entropy-code các coefficients đó. **FAST+** là universal action tokenizer được huấn luyện trên khoảng **1 triệu robot các quỹ đạo** thuộc nhiều action spaces và frequencies thay vì huấn luyện tokenizer riêng cho mỗi tập dữ liệu.

Sau đó FAST được ghép với π-style autoregressive VLA. Vì mỗi chunk dùng ít tokens hơn rất nhiều, dự đoán action không còn kéo chuỗi length lên phi lý.

## Ví dụ từng bước

Tạo action tensor `(T=50, D=7)`. Normalize, biến mỗi dimension theo DCT từ time domain sang frequency coefficients, giữ coefficients mang nhiều năng lượng và lượng tử hóa thành token chuỗi. Decode đảo quy trình để reconstruct actions. Với quỹ đạo mượt, high-frequency coefficients nhỏ; với quỹ đạo giật, compression khó hơn.

Đây không phải thần kỳ: DCT chỉ là thay basis. Việc tokenizer giữ đủ thông tin về những chuyển động contact-critical mới quyết định policy thành công.

## Kết quả thực nghiệm

Bài báo cho thấy FAST/FAST+ cho phép autoregressive VLA scale tới cỡ **10 nghìn giờ dữ liệu robot** và đạt hiệu năng gần hoặc ngang flow/diffusion VLA trong các benchmark của họ, trong khi **huấn luyện có thể nhanh hơn tới khoảng 5x** so với naive action tokenization. Gains rõ nhất ở high-frequency và dexterous thiết lập, nơi per-timestep binning tạo chuỗi quá dài.

FAST+ gần dataset-specific tokenizers dù phải cover nhiều robot/action spaces. Đây là kết quả quan trọng vì nó biến tokenizer thành một reusable foundation component chứ không phải thứ phải hand-tune cho từng arm.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** evaluations chủ yếu vẫn là static manipulation; mobile, humanoid và dexterous scaling rộng hơn được để lại cho tương lai. π0-FAST autoregressive inference vẫn chậm hơn flow-based π0 trong runtime, nên dynamic nhiệm vụ cần decoder nhanh hơn. Tác giả cũng thừa nhận discrete/autoregressive so với liên tục diffusion chưa có winner cuối cùng.

**Phê bình thêm:** DCT dựa vào theo thời gian smoothness; abrupt contact corrections hoặc high-frequency phenomena chính là phần có thể bị nén tệ nhất. Huấn luyện nhanh không đồng nghĩa control độ trễ nhanh. Universal tokenizer còn phải đối mặt với phân phối action rất khác nhau giữa joint, EEF, hand và base. FAST giải chuỗi compression rất đẹp, nhưng vẫn giữ **autoregressive exposure/độ trễ problem** ở tầng decoder.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [OpenVLA](/paper/openvla)
- [π0.5](/paper/pi-0-5)

## Đọc code và tự kiểm chứng

Chạy FAST tokenizer trên Mac M4 với synthetic smooth và noisy các quỹ đạo; plot thô vs reconstructed; sweep chunk length/độ chính xác và đo reconstruction MAE, token count.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
