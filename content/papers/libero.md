## Why

Lifelong learning không chỉ hỏi “task mới làm được bao nhiêu %”, mà còn hỏi hai câu khó hơn: **học task cũ có giúp học task mới nhanh hơn không**, và **học task mới có làm quên task cũ không**. Các benchmark robot trước đó không tách rõ declarative knowledge như object/spatial relation với procedural knowledge như motion/goal sequence. LIBERO được xây để test đúng các dạng transfer đó trong một môi trường manipulation có kiểm soát.

## Kiến thức nền cần nắm

Lifelong/continual learning khác multi-task learning: task **đến tuần tự**, model update sau mỗi task và có thể quên task đã học. Benchmark phải tách hai câu hỏi: chuyển kiến thức sang task mới có nhanh hơn không, và sau khi học task mới model có còn làm được task cũ không.

## How

LIBERO có **130 tasks** và procedural task generation. Các suite chính gồm **LIBERO-Spatial**, **LIBERO-Object**, **LIBERO-Goal** và **LIBERO-100**; phần long-horizon dùng một split riêng từ LIBERO-100. Mỗi task có khoảng **50 high-quality human teleoperation demonstrations**. Goal conditions được formalize bằng predicates kiểu `Open`, `TurnOff`, `On`, `In`.

Paper gốc đánh giá lifelong algorithms như sequential fine-tuning, replay, EWC và PackNet. Metrics không chỉ có success mà còn **Forward Transfer (FWT)**, **Negative Backward Transfer (NBT)** và AUC để đo learning trajectory qua sequence task.

## Ví dụ từng bước

Train một policy lần lượt trên mở ngăn kéo, nhặt mug, đặt mug vào bát. Sau mỗi task, chạy evaluation trên tất cả task trước. Nếu task mới được 90% nhưng task cũ tụt về 10%, model đang **catastrophically forgetting**. LIBERO cung cấp nhóm task và thước đo transfer/retention, nhưng thành tích benchmark không tự chứng minh robot generalist ngoài đời.

Khi chạy env, success phải đến từ **closed-loop rollout và simulator predicate**, không phải training loss.

## Results

Một kết quả khá trái trực giác là **naive sequential fine-tuning có FWT tốt**, tức representation từ task trước đôi khi giúp task sau, dù nó quên task cũ. PackNet bảo vệ retention khá tốt nhưng đổi lại capacity bị chia nhỏ. Experience Replay là lựa chọn tương đối robust, còn EWC không nổi bật trong setting này. Paper cũng thử BERT/CLIP/GPT-style task embeddings và thấy **không có khác biệt lớn so với TaskID** trong nhiều setting.

Một kết quả đáng nhớ khác: supervised pretraining trên LIBERO-90 **không tự động giúp** downstream lifelong learning trên 10 long-horizon tasks, thậm chí có thể gây negative transfer. Điều đó cảnh báo rất sớm rằng “pretrain nhiều hơn” không đủ; distribution/objective phải đúng.

## Limitations

**Paper thừa nhận:** đây là simulation benchmark với phạm vi object/task và physics hữu hạn; authors coi benchmark là nền để cộng đồng tiếp tục mở rộng architecture, algorithm và pretraining.

**Phê bình thêm:** đến 2026, LIBERO đã gần **saturate** với frontier VLAs, nhiều model nằm vùng 95-99% average success. Vì thế nó vẫn rất hữu ích như regression/unit test nhưng discriminator frontier yếu. Cộng đồng còn thường report một average success duy nhất và bỏ qua mục tiêu lifelong ban đầu của benchmark, tức biến LIBERO thành thứ nó không được thiết kế để làm. Scene tĩnh, tabletop và goal predicates sạch cũng không test dynamic world, mobile manipulation, contact uncertainty, recovery hay real-world perception. Một model 98% LIBERO vẫn có thể kém hiệu quả ngoài nhà bếp thật, chuyện này con người đáng lẽ không cần benchmark để nhắc nhưng lịch sử vẫn cho thấy là cần.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [openvla](/paper/openvla)
- [robocasa](/paper/robocasa)

## Đọc code và tự kiểm chứng

Chạy một task BC-RNN trong official LIBERO trên T4, rồi thử 10 vs 50 demos. Sau đó chạy hai task sequential để kiểm tra forgetting; report success với nhiều seeds.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
