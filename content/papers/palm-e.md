## Vì sao cần nghiên cứu này?

Một robot hiểu câu lệnh “Hãy mang chiếc cốc lại đây” phải kết hợp hai nguồn thông tin: câu chữ cho biết mục tiêu và camera cho biết chiếc cốc đang ở đâu. Mô hình ngôn ngữ chỉ đọc văn bản có thể biết cốc là gì, nhưng không tự nhìn thấy căn phòng hiện tại. **PaLM-E nghiên cứu cách đưa hình ảnh và trạng thái robot vào cùng chuỗi đầu vào của mô hình ngôn ngữ**, để tận dụng kiến thức đã học cho suy luận về thế giới vật lý. Cần nhớ PaLM-E thường hỗ trợ hiểu và lập kế hoạch; việc biến kế hoạch thành góc khớp chính xác còn phụ thuộc bộ điều khiển robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/palm-e/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 định vị PaLM-E như một mô hình ngôn ngữ đa phương thức nhận dữ liệu cảm biến của thế giới thật cùng văn bản. Ảnh, trạng thái robot và các tín hiệu khác được biến thành embedding có thể điều kiện hóa quá trình sinh ngôn ngữ. Điều cần tránh là nhìn thấy robot trong hình rồi tưởng PaLM-E tự xuất lệnh servo liên tục: paper nhấn mạnh embodied reasoning, planning và khả năng kết hợp tri thức ngôn ngữ với quan sát, không đồng nghĩa một bộ điều khiển torque end-to-end.

### PaLM-E có thực sự điều khiển robot trực tiếp?

Điều quan trọng nhất là phân biệt **suy luận mục tiêu** với **điều khiển động cơ**. Người dùng bảo “Hãy lấy đồ ăn nhẹ cho tôi”; robot cần quan sát đồ vật, nhận biết chỗ để đồ, quyết định bước nào làm trước. PaLM-E được nghiên cứu để giúp hệ thống kết hợp câu chữ với ảnh và trạng thái vật lý khi lập kế hoạch, không phải để xuất mô-men từng khớp trong mọi thí nghiệm.

Bài báo đặt câu hỏi liệu tri thức của mô hình ngôn ngữ lớn, kết hợp mạng nhìn ảnh, có ích khi đưa vào môi trường robot hay không. Đây là bước nối giữa việc “hiểu yêu cầu bằng ngôn ngữ” và “biết thế giới đang ở trạng thái nào”.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Phân biệt **embodied reasoning** với **low-level motor policy**. Một LLM hiểu câu "cốc nằm trong ngăn kéo" có thể suy ra trình tự tìm cốc, nhưng chưa có nghĩa nó đã học torque hay gripper velocity. Sensor tokens là vector liên tục được project vào không gian embedding của mô hình ngôn ngữ; chúng không trở thành từ thật, chỉ dùng chung attention stream.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ba mảnh thông tin cần phân biệt

**Token ngôn ngữ** biểu diễn câu người dùng nói. **Biểu diễn ảnh** mang thông tin về vật thể, bố cục và đặc điểm cảnh. **Trạng thái robot** có thể gồm những số cảm biến hoặc biểu diễn ba chiều cho biết robot đang ở đâu, đã cầm vật chưa. PaLM-E đưa các tín hiệu này vào chuỗi đầu vào chung để mô hình suy luận trên chúng.

Trong sơ đồ, những màu khác nhau không phải chỉ để trang trí: chúng đánh dấu token đến từ nguồn nào. Khi đọc kết quả, hãy hỏi tín hiệu ảnh và trạng thái có thật sự được dùng hay mô hình chỉ đoán theo câu chữ. Chính vì vậy cần các phép thử thay đầu vào hoặc thay nguồn dữ liệu.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

PaLM-E lấy đã pretrain PaLM rồi biến hình ảnh embeddings, 3D/cảm biến embeddings và trạng thái robot thành những “multimodal tokens” có thể được interleave cùng text. Thay vì xây một planner riêng, mô hình được huấn luyện end-to-end trên mixture gồm robotics, VQA, captioning và ngôn ngữ nhiệm vụ. Phiên bản lớn nhất lên tới **562B parameters**. Điều đáng chú ý là bài báo không chỉ huấn luyện embodied dữ liệu, mà cố giữ web-scale prior bằng multi-task co-training, một pattern sau này quay lại rất nhiều trong RT-2, OpenVLA và Qwen-VLA.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 7](/paper-figures/palm-e/figure-3.webp)
![Hình 4 từ PDF gốc, trang 8](/paper-figures/palm-e/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Trong robotics, PaLM-E thường đóng vai trò high-level embodied reasoner: đọc bối cảnh + chỉ dẫn, phân tích mục tiêu, rồi gọi/điều kiện các low-level kỹ năng đã có. Vì vậy nó không giống π0 hay Qwen-VLA hiện tại, nơi sinh action được nhét thẳng vào mô hình nền tảng stack.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/palm-e/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 tập trung vào transfer learning: dùng pretraining thị giác và ngôn ngữ làm điểm khởi đầu, rồi đo khả năng chuyển sang những nhóm bài toán robot khác nhau. Hãy đọc chiều mũi tên giữa các domain thay vì chỉ nhìn tên model lớn. Nếu một model giải thích đúng vị trí đồ vật qua ảnh, nó có thể giúp planner chọn đúng mục tiêu, nhưng policy vận động vẫn cần học từ dữ liệu và hành động thật. Khả năng chuyển tri thức của backbone cần được phân biệt với khả năng chuyển kỹ năng cơ học.

#### Ví dụ từng bước để hiểu cơ chế

Giả sử robot được hỏi 'vật nào dùng để lau bàn?' giữa một cái khăn và một chiếc cốc. Hệ vision-language phải quan sát và dùng tri thức để nhận ra khăn. Đó là bài toán grounding/suy luận. Phần robot còn phải điều khiển gripper cầm khăn rồi tạo đường lau phù hợp. Để kiểm tra vai trò PaLM-E, so kết quả lựa chọn vật thể hoặc kế hoạch theo ảnh/instruction trước, rồi mới nối planner với một controller đã có. Nếu controller fail vì khăn biến dạng, không nên gán lỗi ấy trực tiếp cho kết luận về embodied language reasoning.

### Một lượt sử dụng PaLM-E hoạt động thế nào?

**Bước 1:** nhận chỉ dẫn, ví dụ “Đem chiếc cốc sạch tới bàn”. **Bước 2:** đọc hình ảnh môi trường và dữ liệu cảm biến, chuyển thành biểu diễn mạng có thể xử lý. **Bước 3:** ghép biểu diễn ấy vào chuỗi chứa lời chỉ dẫn. **Bước 4:** mô hình suy luận ra đối tượng và bước tiếp theo ở mức kế hoạch, chẳng hạn tìm cốc, tiếp cận cốc, cầm và mang tới bàn.

**Bước 5:** chính sách điều khiển cấp thấp hoặc bộ thực thi bên ngoài biến các bước ấy thành chuyển động robot, lấy thêm quan sát khi cần. Đừng nhầm “mô hình biết phải cầm cốc” với “mô hình biết ngay 7 góc khớp cần chuyển tới”; đó là hai bài toán kỹ thuật khác nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot được hỏi "mang đồ uống ở phía sau cái hộp tới đây". Camera embeddings cung cấp vị trí tương đối, text định nghĩa đối tượng và mục tiêu, mô hình tạo plan hoặc chỉ dẫn cho kỹ năng bộ điều khiển. Nếu vật mới xuất hiện sau một lần quan sát, mô hình cần grounding lại; phần action thường phụ thuộc kỹ năng primitive đã có.

Để hiểu PaLM-E, hãy vẽ sơ đồ token chuỗi `text → image embedding → robot state embedding → text output` và đánh dấu nơi loss ngôn ngữ khác loss điều khiển.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ giữa hai căn bếp khác nhau

Ở bếp thứ nhất, cốc nằm cạnh vòi nước. Ở bếp thứ hai, nó nằm trên kệ. Câu lệnh vẫn giống nhau nhưng tọa độ khác, nên hệ thống phải dựa trên quan sát chứ không thể nhớ một chuỗi lệnh cố định. Nếu đã học kiến thức rằng cốc dùng để uống và kệ là nơi để đồ, mô hình có thể tận dụng tri thức ngôn ngữ/hình ảnh để chọn hướng tìm kiếm hợp lý hơn.

Đó là ý tưởng chuyển giao tri thức của PaLM-E. Nhưng để kiểm chứng, phải đo hiệu quả thực sự trên môi trường mới; không thể suy ra từ một đoạn câu trả lời nghe hợp lý.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo cho thấy một mô hình duy nhất xử lý được nhiều robot platform lẫn các nhiệm vụ VQA/captioning/ngôn ngữ. Khi tăng scale, catastrophic forgetting của ngôn ngữ capability giảm rõ, và bản 562B vẫn giữ được năng lực general ngôn ngữ tốt dù đã học thêm embodied inputs. Huấn luyện chung giữa vision-language và robotics tạo **positive chuyển giao**, thay vì robotics làm hỏng kiến thức nền tảng như người ta có thể lo.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 9](/paper-figures/palm-e/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Một kết quả có ý nghĩa lịch sử hơn cả metric là: đã pretrain ngôn ngữ/kiến thức thị giác thực sự giúp embodied reasoning. Đây là tiền đề trực tiếp cho thesis của RT-2 rằng kiến thức trên Internet có thể đi xa hơn, từ reasoning sang cả sinh action.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Cách hiểu kết quả chuyển giao

Hình 2–3 so sánh những cấu hình dùng hoặc không dùng tiền huấn luyện và trộn dữ liệu ảnh–ngôn ngữ với dữ liệu robot. Mục tiêu là tìm xem nguồn tri thức ngoài robot có giúp tác vụ robot khi demonstration rất ít hay không. Thí nghiệm với 1% dữ liệu là một điều kiện khắt khe, nhưng phải giữ đúng điều kiện của phép so khi diễn giải.

Hình 5 đánh giá thêm khả năng ngôn ngữ vốn có: học thao tác robot có làm mạng quên khả năng trả lời câu hỏi bằng chữ không? Khi mô hình lớn hơn, mức quên được báo cáo giảm. Điều đó cho thấy công trình quan tâm cả hai chiều chuyển giao, không chỉ điểm điều khiển robot.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** PaLM-E vẫn phụ thuộc mạnh vào low-level policy library. Nếu robot chưa có kỹ năng vật lý tương ứng, ví dụ một chuyển động mới hoàn toàn, mô hình ngôn ngữ không thể chỉ “nghĩ ra” bộ điều khiển đáng tin cậy. Những mục tiêu chỉ mô tả bằng text cũng khó khi cần grounding vào một instance cụ thể trong bối cảnh. Mô hình còn kế thừa hallucination và bias của LLM/VLM backbone.

**Phê bình thêm:** PaLM-E chứng minh embodied reasoning nhiều hơn là chứng minh VLA motor control. Nhiều thành công phụ thuộc vào bộ điều khiển/kỹ năng bên dưới, nên rất dễ đánh đồng “mô hình biết phải làm gì” với “robot biết làm nó”. 562B cũng là compute regime mà đa số robotics phòng thí nghiệm không thể reproduce. Cuối cùng, việc giữ ngôn ngữ benchmark tốt không tự động nghĩa biểu diễn đã hiểu vật lý; nó có thể reasoning rất hay rồi vẫn thất bại ở 2 mm cuối cùng khi cắm một cái plug.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Điều PaLM-E chưa chứng minh

Mô hình có thể lập ra kế hoạch đúng nhưng robot vẫn không gắp nổi vật do sai vị trí hoặc giới hạn kẹp. Đồng thời một mô hình có hàng tỷ tham số có thể chậm và tốn bộ nhớ, không phù hợp chạy trực tiếp trong mọi vòng điều khiển nhanh.

Các thí nghiệm kết hợp nhiều nhiệm vụ nhưng không chứng minh rằng một mô hình duy nhất thay thế mọi thành phần cảm biến và điều khiển. Khi đọc kết quả, phải phân biệt phần nào do PaLM-E sinh và phần nào do hệ thống hành động cấp thấp đảm nhiệm.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Liên hệ với RT-2 và GR00T

PaLM-E nhấn mạnh việc biến quan sát thành một phần đầu vào của mô hình ngôn ngữ để hỗ trợ suy luận về môi trường vật lý. RT-2 xem token hành động như một phần đầu ra của mô hình ảnh–ngôn ngữ; GR00T N1 lại tách rõ phần hiểu ảnh/câu lệnh khỏi mô-đun chuyên sinh chuyển động.

Ba phương án không thể so trực tiếp bằng số tham số hoặc một tỷ lệ thành công lấy từ các thiết lập khác nhau. Hãy đối chiếu vị trí mô hình trong toàn hệ thống robot: *nó đang hiểu và lập kế hoạch, hay trực tiếp phát lệnh vận động?*

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Tự dựng một multimodal prompt encoder toy: project vectors ảnh 512D và state 12D vào cùng hidden dimension rồi xen kẽ token vào Transformer. Kiểm chứng shape, positional encoding và attention mask trước khi nghĩ đến robot thật.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự trả lời ba câu trước khi sang bài mới

Nếu camera không cho thấy chiếc cốc ở vị trí hiện tại, PaLM-E có thể suy ra ngay vị trí khớp cần gắp không? Vì sao? Nếu bỏ dữ liệu ảnh nhưng giữ câu lệnh, kỳ vọng loại lỗi nào tăng lên? Nếu trộn dữ liệu robot và dữ liệu ảnh–ngôn ngữ đem lại lợi ích, cần giữ những điều kiện nào giống nhau trong phép thử?

Một cách ghi chép hữu ích là vẽ ba ô: **hiểu câu lệnh**, **hiểu cảnh**, **điều khiển vật lý**. Ghi mô-đun nào giải từng phần, rồi đánh dấu phần nào đã được thí nghiệm thực tế chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

