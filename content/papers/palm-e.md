## Why

Robot trước PaLM-E thường có perception, planning và language ở những module khá tách rời. Trong khi đó, LLM đã chứng minh một model lớn có thể gom nhiều loại knowledge và transfer giữa task. Vấn đề là LLM thuần text không trực tiếp “nhìn” camera, state robot hay point cloud. PaLM-E đặt câu hỏi: **có thể nhét continuous sensor observations vào cùng token stream của một pretrained language model để nó reasoning về thế giới vật lý mà vẫn giữ được năng lực ngôn ngữ không?**

## Kiến thức nền cần nắm

Phân biệt **embodied reasoning** với **low-level motor policy**. Một LLM hiểu câu "cốc nằm trong ngăn kéo" có thể suy ra trình tự tìm cốc, nhưng chưa có nghĩa nó đã học torque hay gripper velocity. Sensor tokens là vector continuous được project vào không gian embedding của language model; chúng không trở thành từ thật, chỉ dùng chung attention stream.

## How

PaLM-E lấy pretrained PaLM rồi biến image embeddings, 3D/sensor embeddings và robot state thành những “multimodal tokens” có thể được interleave cùng text. Thay vì xây một planner riêng, model được train end-to-end trên mixture gồm robotics, VQA, captioning và language tasks. Phiên bản lớn nhất lên tới **562B parameters**. Điều đáng chú ý là paper không chỉ train embodied data, mà cố giữ web-scale prior bằng multi-task co-training, một pattern sau này quay lại rất nhiều trong RT-2, OpenVLA và Qwen-VLA.

Trong robotics, PaLM-E thường đóng vai trò high-level embodied reasoner: đọc scene + instruction, phân tích mục tiêu, rồi gọi/condition các low-level skills đã có. Vì vậy nó không giống π0 hay Qwen-VLA hiện tại, nơi action generation được nhét thẳng vào foundation model stack.

## Ví dụ từng bước

Robot được hỏi "mang đồ uống ở phía sau cái hộp tới đây". Camera embeddings cung cấp vị trí tương đối, text định nghĩa đối tượng và mục tiêu, model tạo plan hoặc instruction cho skill controller. Nếu vật mới xuất hiện sau một lần quan sát, model cần grounding lại; phần action thường phụ thuộc skill primitive đã có.

Để hiểu PaLM-E, hãy vẽ sơ đồ token sequence `text → image embedding → robot state embedding → text output` và đánh dấu nơi loss ngôn ngữ khác loss điều khiển.

## Results

Paper cho thấy một model duy nhất xử lý được nhiều robot platform lẫn các task VQA/captioning/language. Khi tăng scale, catastrophic forgetting của language capability giảm rõ, và bản 562B vẫn giữ được năng lực general language tốt dù đã học thêm embodied inputs. Joint training giữa vision-language và robotics tạo **positive transfer**, thay vì robotics làm hỏng foundation knowledge như người ta có thể lo.

Một kết quả có ý nghĩa lịch sử hơn cả metric là: pretrained language/vision knowledge thực sự giúp embodied reasoning. Đây là tiền đề trực tiếp cho thesis của RT-2 rằng Internet knowledge có thể đi xa hơn, từ reasoning sang cả action generation.

## Limitations

**Paper thừa nhận:** PaLM-E vẫn phụ thuộc mạnh vào low-level policy library. Nếu robot chưa có skill vật lý tương ứng, ví dụ một motion mới hoàn toàn, language model không thể chỉ “nghĩ ra” controller đáng tin cậy. Những goal chỉ mô tả bằng text cũng khó khi cần grounding vào một instance cụ thể trong scene. Model còn kế thừa hallucination và bias của LLM/VLM backbone.

**Phê bình thêm:** PaLM-E chứng minh embodied reasoning nhiều hơn là chứng minh VLA motor control. Nhiều thành công phụ thuộc vào controller/skill bên dưới, nên rất dễ đánh đồng “model biết phải làm gì” với “robot biết làm nó”. 562B cũng là compute regime mà đa số robotics lab không thể reproduce. Cuối cùng, việc giữ language benchmark tốt không tự động nghĩa representation đã hiểu physics; nó có thể reasoning rất hay rồi vẫn thất bại ở 2 mm cuối cùng khi cắm một cái plug.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [rt 2](/paper/rt-2)
- [qwen vla](/paper/qwen-vla)

## Đọc code và tự kiểm chứng

Tự dựng một multimodal prompt encoder toy: project vectors ảnh 512D và state 12D vào cùng hidden dimension rồi xen kẽ token vào Transformer. Kiểm chứng shape, positional encoding và attention mask trước khi nghĩ đến robot thật.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
