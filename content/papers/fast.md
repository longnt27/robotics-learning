## Why

Autoregressive VLA có một vấn đề hơi ngu nhưng chí mạng: continuous action stream ở 20-50 Hz tạo quá nhiều tokens nếu discretize từng dimension từng timestep. Sequence dài làm training chậm, inference chậm và đặc biệt tệ ở dexterous/high-frequency trajectories. Nếu nén action quá mạnh thì lại mất precision. FAST hỏi: **có representation nào nén smooth robot trajectories thành ít tokens mà vẫn bảo toàn motor detail đủ tốt không?**

## Kiến thức nền cần nắm

Autoregressive VLA thường token hóa mỗi action dimension mỗi timestep. Nếu horizon 50 và robot có nhiều DoF, số tokens tăng cực nhanh, latency/memory tệ. Nhưng robot trajectories khá mượt, nên có **temporal redundancy** có thể khai thác.

## How

FAST lợi dụng fact rằng robot trajectories thường smooth theo thời gian. Nó dùng **Discrete Cosine Transform (DCT)** để chuyển action chunk sang frequency domain, nơi phần lớn năng lượng nằm ở ít low-frequency coefficients, rồi tokenize/entropy-code các coefficients đó. **FAST+** là universal action tokenizer được train trên khoảng **1 triệu robot trajectories** thuộc nhiều action spaces và frequencies thay vì train tokenizer riêng cho mỗi dataset.

Sau đó FAST được ghép với π-style autoregressive VLA. Vì mỗi chunk dùng ít tokens hơn rất nhiều, action prediction không còn kéo sequence length lên phi lý.

## Ví dụ từng bước

Tạo action tensor `(T=50, D=7)`. Normalize, biến mỗi dimension theo DCT từ time domain sang frequency coefficients, giữ coefficients mang nhiều năng lượng và lượng tử hóa thành token sequence. Decode đảo quy trình để reconstruct actions. Với trajectory mượt, high-frequency coefficients nhỏ; với trajectory giật, compression khó hơn.

Đây không phải thần kỳ: DCT chỉ là thay basis. Việc tokenizer giữ đủ thông tin về những chuyển động contact-critical mới quyết định policy thành công.

## Results

Paper cho thấy FAST/FAST+ cho phép autoregressive VLA scale tới cỡ **10 nghìn giờ robot data** và đạt performance gần hoặc ngang flow/diffusion VLA trong các benchmark của họ, trong khi **training có thể nhanh hơn tới khoảng 5x** so với naive action tokenization. Gains rõ nhất ở high-frequency và dexterous settings, nơi per-timestep binning tạo sequence quá dài.

FAST+ gần dataset-specific tokenizers dù phải cover nhiều robot/action spaces. Đây là kết quả quan trọng vì nó biến tokenizer thành một reusable foundation component chứ không phải thứ phải hand-tune cho từng arm.

## Limitations

**Paper thừa nhận:** evaluations chủ yếu vẫn là static manipulation; mobile, humanoid và dexterous scaling rộng hơn được để lại cho tương lai. π0-FAST autoregressive inference vẫn chậm hơn flow-based π0 trong runtime, nên dynamic tasks cần decoder nhanh hơn. Authors cũng thừa nhận discrete/autoregressive so với continuous diffusion chưa có winner cuối cùng.

**Phê bình thêm:** DCT dựa vào temporal smoothness; abrupt contact corrections hoặc high-frequency phenomena chính là phần có thể bị nén tệ nhất. Training nhanh không đồng nghĩa control latency nhanh. Universal tokenizer còn phải đối mặt với action distribution rất khác nhau giữa joint, EEF, hand và base. FAST giải sequence compression rất đẹp, nhưng vẫn giữ **autoregressive exposure/latency problem** ở tầng decoder.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [openvla](/paper/openvla)
- [pi 0 5](/paper/pi-0-5)

## Đọc code và tự kiểm chứng

Chạy FAST tokenizer trên Mac M4 với synthetic smooth và noisy trajectories; plot raw vs reconstructed; sweep chunk length/precision và đo reconstruction MAE, token count.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
