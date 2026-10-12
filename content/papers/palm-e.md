## Vì sao cần nghiên cứu này?

Robot trước PaLM-E thường có perception, lập kế hoạch và ngôn ngữ ở những module khá tách rời. Trong khi đó, LLM đã chứng minh một mô hình lớn có thể gom nhiều loại kiến thức và chuyển giao giữa nhiệm vụ. Vấn đề là LLM thuần text không trực tiếp “nhìn” camera, state robot hay point cloud. PaLM-E đặt câu hỏi: **có thể nhét liên tục cảm biến quan sát vào cùng token stream của một mô hình ngôn ngữ đã pretrain để nó reasoning về thế giới vật lý mà vẫn giữ được năng lực ngôn ngữ không?**

## Kiến thức nền cần nắm

Phân biệt **embodied reasoning** với **low-level motor policy**. Một LLM hiểu câu "cốc nằm trong ngăn kéo" có thể suy ra trình tự tìm cốc, nhưng chưa có nghĩa nó đã học torque hay gripper velocity. Sensor tokens là vector liên tục được project vào không gian embedding của mô hình ngôn ngữ; chúng không trở thành từ thật, chỉ dùng chung attention stream.

## Phương pháp thực hiện

PaLM-E lấy đã pretrain PaLM rồi biến hình ảnh embeddings, 3D/cảm biến embeddings và trạng thái robot thành những “multimodal tokens” có thể được interleave cùng text. Thay vì xây một planner riêng, mô hình được huấn luyện end-to-end trên mixture gồm robotics, VQA, captioning và ngôn ngữ nhiệm vụ. Phiên bản lớn nhất lên tới **562B parameters**. Điều đáng chú ý là bài báo không chỉ huấn luyện embodied dữ liệu, mà cố giữ web-scale prior bằng multi-task co-training, một pattern sau này quay lại rất nhiều trong RT-2, OpenVLA và Qwen-VLA.

Trong robotics, PaLM-E thường đóng vai trò high-level embodied reasoner: đọc bối cảnh + chỉ dẫn, phân tích mục tiêu, rồi gọi/điều kiện các low-level kỹ năng đã có. Vì vậy nó không giống π0 hay Qwen-VLA hiện tại, nơi sinh action được nhét thẳng vào mô hình nền tảng stack.

## Ví dụ từng bước

Robot được hỏi "mang đồ uống ở phía sau cái hộp tới đây". Camera embeddings cung cấp vị trí tương đối, text định nghĩa đối tượng và mục tiêu, mô hình tạo plan hoặc chỉ dẫn cho kỹ năng bộ điều khiển. Nếu vật mới xuất hiện sau một lần quan sát, mô hình cần grounding lại; phần action thường phụ thuộc kỹ năng primitive đã có.

Để hiểu PaLM-E, hãy vẽ sơ đồ token chuỗi `text → image embedding → robot state embedding → text output` và đánh dấu nơi loss ngôn ngữ khác loss điều khiển.

## Kết quả thực nghiệm

Bài báo cho thấy một mô hình duy nhất xử lý được nhiều robot platform lẫn các nhiệm vụ VQA/captioning/ngôn ngữ. Khi tăng scale, catastrophic forgetting của ngôn ngữ capability giảm rõ, và bản 562B vẫn giữ được năng lực general ngôn ngữ tốt dù đã học thêm embodied inputs. Huấn luyện chung giữa vision-language và robotics tạo **positive chuyển giao**, thay vì robotics làm hỏng kiến thức nền tảng như người ta có thể lo.

Một kết quả có ý nghĩa lịch sử hơn cả metric là: đã pretrain ngôn ngữ/kiến thức thị giác thực sự giúp embodied reasoning. Đây là tiền đề trực tiếp cho thesis của RT-2 rằng kiến thức trên Internet có thể đi xa hơn, từ reasoning sang cả sinh action.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** PaLM-E vẫn phụ thuộc mạnh vào low-level policy library. Nếu robot chưa có kỹ năng vật lý tương ứng, ví dụ một chuyển động mới hoàn toàn, mô hình ngôn ngữ không thể chỉ “nghĩ ra” bộ điều khiển đáng tin cậy. Những mục tiêu chỉ mô tả bằng text cũng khó khi cần grounding vào một instance cụ thể trong bối cảnh. Mô hình còn kế thừa hallucination và bias của LLM/VLM backbone.

**Phê bình thêm:** PaLM-E chứng minh embodied reasoning nhiều hơn là chứng minh VLA motor control. Nhiều thành công phụ thuộc vào bộ điều khiển/kỹ năng bên dưới, nên rất dễ đánh đồng “mô hình biết phải làm gì” với “robot biết làm nó”. 562B cũng là compute regime mà đa số robotics phòng thí nghiệm không thể reproduce. Cuối cùng, việc giữ ngôn ngữ benchmark tốt không tự động nghĩa biểu diễn đã hiểu vật lý; nó có thể reasoning rất hay rồi vẫn thất bại ở 2 mm cuối cùng khi cắm một cái plug.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc code và tự kiểm chứng

Tự dựng một multimodal prompt encoder toy: project vectors ảnh 512D và state 12D vào cùng hidden dimension rồi xen kẽ token vào Transformer. Kiểm chứng shape, positional encoding và attention mask trước khi nghĩ đến robot thật.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
