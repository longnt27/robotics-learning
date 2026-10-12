## Vì sao cần nghiên cứu này?

Robot trước PaLM-E thường có perception, lập kế hoạch và ngôn ngữ ở những module khá tách rời. Trong khi đó, LLM đã chứng minh một mô hình lớn có thể gom nhiều loại kiến thức và chuyển giao giữa nhiệm vụ. Vấn đề là LLM thuần text không trực tiếp “nhìn” camera, state robot hay point cloud. PaLM-E đặt câu hỏi: **có thể nhét liên tục cảm biến quan sát vào cùng token stream của một mô hình ngôn ngữ đã pretrain để nó reasoning về thế giới vật lý mà vẫn giữ được năng lực ngôn ngữ không?**

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/palm-e/figure-1.webp)

*Hình 1, trang 1. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://proceedings.mlr.press/v202/driess23a/driess23a.pdf#page=1).*

#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 định vị PaLM-E như một mô hình ngôn ngữ đa phương thức nhận dữ liệu cảm biến của thế giới thật cùng văn bản. Ảnh, trạng thái robot và các tín hiệu khác được biến thành embedding có thể điều kiện hóa quá trình sinh ngôn ngữ. Điều cần tránh là nhìn thấy robot trong hình rồi tưởng PaLM-E tự xuất lệnh servo liên tục: paper nhấn mạnh embodied reasoning, planning và khả năng kết hợp tri thức ngôn ngữ với quan sát, không đồng nghĩa một bộ điều khiển torque end-to-end.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Biến hình ảnh và trạng thái robot thành đầu vào của LLM để tận dụng reasoning đa phương thức. Vấn đề là LLM thuần text không trực tiếp “nhìn” camera, state robot hay point cloud. PaLM-E đặt câu hỏi: có thể nhét liên tục cảm biến quan sát vào cùng token stream của một mô hình ngôn ngữ đã pretrain để nó reasoning về thế giới vật lý mà vẫn giữ được năng lực ngôn ngữ không?

**Vấn đề khoa học nằm ở đâu?** Text thuần không đủ để lập kế hoạch theo vị trí, vật thể và trạng thái cảm biến đang thay đổi. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Gắn sensory tokens vào cùng không gian với language tokens là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Cho mô hình giải quyết bài toán ngữ nghĩa và không gian trong một chuỗi multimodal chung. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: LLM hiểu yêu cầu nhưng không nhìn thấy thế giới vật lý

**Luận điểm.** Text thuần không đủ để lập kế hoạch theo vị trí, vật thể và trạng thái cảm biến đang thay đổi. PaLM-E đặt câu hỏi: có thể nhét liên tục cảm biến quan sát vào cùng token stream của một mô hình ngôn ngữ đã pretrain để nó reasoning về thế giới vật lý mà vẫn giữ được năng lực ngôn ngữ không?

**Tại sao lỗi này có hệ quả lớn?** Pipeline mô tả ảnh thành chữ làm mất thông tin. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân llm hiểu yêu cầu nhưng không nhìn thấy thế giới vật lý vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Pipeline mô tả ảnh thành chữ làm mất thông tin

**Luận điểm.** Caption hóa toàn bộ state gây đứt liên kết giữa ngôn ngữ và quan sát liên tục. Trong khi đó, LLM đã chứng minh một mô hình lớn có thể gom nhiều loại kiến thức và chuyển giao giữa nhiệm vụ.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Caption hóa toàn bộ state gây đứt liên kết giữa ngôn ngữ và quan sát liên tục.. Thay đổi trọng tâm là: Gắn sensory tokens vào cùng không gian với language tokens. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Cho mô hình giải quyết bài toán ngữ nghĩa và không gian trong một chuỗi multimodal chung.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Phân biệt **embodied reasoning** với **low-level motor policy**. Một LLM hiểu câu "cốc nằm trong ngăn kéo" có thể suy ra trình tự tìm cốc, nhưng chưa có nghĩa nó đã học torque hay gripper velocity. Sensor tokens là vector liên tục được project vào không gian embedding của mô hình ngôn ngữ; chúng không trở thành từ thật, chỉ dùng chung attention stream.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Phân biệt embodied reasoning với low-level motor policy. Một LLM hiểu câu "cốc nằm trong ngăn kéo" có thể suy ra trình tự tìm cốc, nhưng chưa có nghĩa nó đã học torque hay gripper velocity.

**Khái niệm thành cấu trúc tính toán.** Embodied multimodality: Ảnh, trạng thái robot và text cùng tham gia dự đoán. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Phân biệt embodied reasoning với low-level motor policy. Một LLM hiểu câu "cốc nằm trong ngăn kéo" có thể suy ra trình tự tìm cốc, nhưng chưa có nghĩa nó đã học torque hay gripper velocity. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

PaLM-E lấy đã pretrain PaLM rồi biến hình ảnh embeddings, 3D/cảm biến embeddings và trạng thái robot thành những “multimodal tokens” có thể được interleave cùng text. Thay vì xây một planner riêng, mô hình được huấn luyện end-to-end trên mixture gồm robotics, VQA, captioning và ngôn ngữ nhiệm vụ. Phiên bản lớn nhất lên tới **562B parameters**. Điều đáng chú ý là bài báo không chỉ huấn luyện embodied dữ liệu, mà cố giữ web-scale prior bằng multi-task co-training, một pattern sau này quay lại rất nhiều trong RT-2, OpenVLA và Qwen-VLA.

Trong robotics, PaLM-E thường đóng vai trò high-level embodied reasoner: đọc bối cảnh + chỉ dẫn, phân tích mục tiêu, rồi gọi/điều kiện các low-level kỹ năng đã có. Vì vậy nó không giống π0 hay Qwen-VLA hiện tại, nơi sinh action được nhét thẳng vào mô hình nền tảng stack.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/palm-e/figure-2.webp)

*Hình 2, trang 6. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://proceedings.mlr.press/v202/driess23a/driess23a.pdf#page=6).*

#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 tập trung vào transfer learning: dùng pretraining thị giác và ngôn ngữ làm điểm khởi đầu, rồi đo khả năng chuyển sang những nhóm bài toán robot khác nhau. Hãy đọc chiều mũi tên giữa các domain thay vì chỉ nhìn tên model lớn. Nếu một model giải thích đúng vị trí đồ vật qua ảnh, nó có thể giúp planner chọn đúng mục tiêu, nhưng policy vận động vẫn cần học từ dữ liệu và hành động thật. Khả năng chuyển tri thức của backbone cần được phân biệt với khả năng chuyển kỹ năng cơ học.

#### Ví dụ từng bước để hiểu cơ chế

Giả sử robot được hỏi 'vật nào dùng để lau bàn?' giữa một cái khăn và một chiếc cốc. Hệ vision-language phải quan sát và dùng tri thức để nhận ra khăn. Đó là bài toán grounding/suy luận. Phần robot còn phải điều khiển gripper cầm khăn rồi tạo đường lau phù hợp. Để kiểm tra vai trò PaLM-E, so kết quả lựa chọn vật thể hoặc kế hoạch theo ảnh/instruction trước, rồi mới nối planner với một controller đã có. Nếu controller fail vì khăn biến dạng, không nên gán lỗi ấy trực tiếp cho kết luận về embodied language reasoning.

### Đào sâu: Gắn sensory tokens vào cùng không gian với language tokens

**Luận điểm.** Cho mô hình giải quyết bài toán ngữ nghĩa và không gian trong một chuỗi multimodal chung. PaLM-E lấy đã pretrain PaLM rồi biến hình ảnh embeddings, 3D/cảm biến embeddings và trạng thái robot thành những “multimodal tokens” có thể được interleave cùng text.

**Giải thích không dùng tên model.** Cho mô hình giải quyết bài toán ngữ nghĩa và không gian trong một chuỗi multimodal chung. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Biến hình ảnh và trạng thái robot thành đầu vào của LLM để tận dụng reasoning đa phương thức. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Biến hình ảnh và trạng thái robot thành đầu vào của LLM để tận dụng reasoning đa phương thức. Vì vậy nó không giống π0 hay Qwen-VLA hiện tại, nơi sinh action được nhét thẳng vào mô hình nền tảng stack.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Ảnh + trạng thái robot → Encoders / projections → Multimodal LLM → Đáp án / kế hoạch ở dạng text. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Vì vậy nó không giống π0 hay Qwen-VLA hiện tại, nơi sinh action được nhét thẳng vào mô hình nền tảng stack. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Ảnh và state vector được chuyển thành embeddings Thay vì xây một planner riêng, mô hình được huấn luyện end-to-end trên mixture gồm robotics, VQA, captioning và ngôn ngữ nhiệm vụ.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Tầng ngôn ngữ xử lý sensory embeddings như phần tử của context. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Thay vì xây một planner riêng, mô hình được huấn luyện end-to-end trên mixture gồm robotics, VQA, captioning và ngôn ngữ nhiệm vụ. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Kết hợp embodied tasks với language/vision-language tasks. Phiên bản lớn nhất lên tới 562B parameters. Điều đáng chú ý là bài báo không chỉ huấn luyện embodied dữ liệu, mà cố giữ web-scale prior bằng multi-task co-training, một pattern sau này quay lại rất nhiều trong RT-2, OpenVLA và Qwen-VLA.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Giữ vốn kiến thức rộng từ pretraining. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Phiên bản lớn nhất lên tới 562B parameters. Điều đáng chú ý là bài báo không chỉ huấn luyện embodied dữ liệu, mà cố giữ web-scale prior bằng multi-task co-training, một pattern sau này quay lại rất nhiều trong RT-2, OpenVLA và Qwen-VLA. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Điều tra ảnh hưởng tỷ lệ dữ liệu embodied và language. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Encoder E hiểu cảm biến; projection P đưa kết quả vào không gian embedding mà LLM có thể sử dụng. Trong robotics, PaLM-E thường đóng vai trò high-level embodied reasoner: đọc bối cảnh + chỉ dẫn, phân tích mục tiêu, rồi gọi/điều kiện các low-level kỹ năng đã có.

$$
z_{\mathrm{sensor}}=P(E(o))
$$

**Công thức đang mô tả thứ gì?** Encoder E hiểu cảm biến; projection P đưa kết quả vào không gian embedding mà LLM có thể sử dụng. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Trong robotics, PaLM-E thường đóng vai trò high-level embodied reasoner: đọc bối cảnh + chỉ dẫn, phân tích mục tiêu, rồi gọi/điều kiện các low-level kỹ năng đã có. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Biểu thức khái niệm để đọc kiến trúc, không phải loss mới. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot được hỏi "mang đồ uống ở phía sau cái hộp tới đây". Camera embeddings cung cấp vị trí tương đối, text định nghĩa đối tượng và mục tiêu, mô hình tạo plan hoặc chỉ dẫn cho kỹ năng bộ điều khiển. Nếu vật mới xuất hiện sau một lần quan sát, mô hình cần grounding lại; phần action thường phụ thuộc kỹ năng primitive đã có.

Để hiểu PaLM-E, hãy vẽ sơ đồ token chuỗi `text → image embedding → robot state embedding → text output` và đánh dấu nơi loss ngôn ngữ khác loss điều khiển.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Model nhận câu hỏi, cảm biến và bối cảnh hiện tại. Nếu vật mới xuất hiện sau một lần quan sát, mô hình cần grounding lại; phần action thường phụ thuộc kỹ năng primitive đã có.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Sinh mô tả, lý giải hoặc các bước kế hoạch. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Nếu vật mới xuất hiện sau một lần quan sát, mô hình cần grounding lại; phần action thường phụ thuộc kỹ năng primitive đã có. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Robot vẫn cần controller/executor riêng để biến kế hoạch thành động tác. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo cho thấy một mô hình duy nhất xử lý được nhiều robot platform lẫn các nhiệm vụ VQA/captioning/ngôn ngữ. Khi tăng scale, catastrophic forgetting của ngôn ngữ capability giảm rõ, và bản 562B vẫn giữ được năng lực general ngôn ngữ tốt dù đã học thêm embodied inputs. Huấn luyện chung giữa vision-language và robotics tạo **positive chuyển giao**, thay vì robotics làm hỏng kiến thức nền tảng như người ta có thể lo.

Một kết quả có ý nghĩa lịch sử hơn cả metric là: đã pretrain ngôn ngữ/kiến thức thị giác thực sự giúp embodied reasoning. Đây là tiền đề trực tiếp cho thesis của RT-2 rằng kiến thức trên Internet có thể đi xa hơn, từ reasoning sang cả sinh action.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Các nhóm embodied reasoning và multimodal benchmarks cho thấy lợi ích của dữ liệu hỗn hợp. Huấn luyện chung giữa vision-language và robotics tạo positive chuyển giao, thay vì robotics làm hỏng kiến thức nền tảng như người ta có thể lo.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Huấn luyện chung giữ được khả năng text/vision-language tương đối tốt. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Huấn luyện chung giữa vision-language và robotics tạo positive chuyển giao, thay vì robotics làm hỏng kiến thức nền tảng như người ta có thể lo. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Robot task demonstrations vẫn quan trọng; tri thức web không thay thế control. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Điều tra ảnh hưởng tỷ lệ dữ liệu embodied và language. Khi tăng scale, catastrophic forgetting của ngôn ngữ capability giảm rõ, và bản 562B vẫn giữ được năng lực general ngôn ngữ tốt dù đã học thêm embodied inputs.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Đọc kết quả như khả năng suy luận/planning, không đánh đồng với tỷ lệ thành công motor rollout. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Khi tăng scale, catastrophic forgetting của ngôn ngữ capability giảm rõ, và bản 562B vẫn giữ được năng lực general ngôn ngữ tốt dù đã học thêm embodied inputs. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Khi tăng scale, catastrophic forgetting của ngôn ngữ capability giảm rõ, và bản 562B vẫn giữ được năng lực general ngôn ngữ tốt dù đã học thêm embodied inputs. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** PaLM-E vẫn phụ thuộc mạnh vào low-level policy library. Nếu robot chưa có kỹ năng vật lý tương ứng, ví dụ một chuyển động mới hoàn toàn, mô hình ngôn ngữ không thể chỉ “nghĩ ra” bộ điều khiển đáng tin cậy. Những mục tiêu chỉ mô tả bằng text cũng khó khi cần grounding vào một instance cụ thể trong bối cảnh. Mô hình còn kế thừa hallucination và bias của LLM/VLM backbone.

**Phê bình thêm:** PaLM-E chứng minh embodied reasoning nhiều hơn là chứng minh VLA motor control. Nhiều thành công phụ thuộc vào bộ điều khiển/kỹ năng bên dưới, nên rất dễ đánh đồng “mô hình biết phải làm gì” với “robot biết làm nó”. 562B cũng là compute regime mà đa số robotics phòng thí nghiệm không thể reproduce. Cuối cùng, việc giữ ngôn ngữ benchmark tốt không tự động nghĩa biểu diễn đã hiểu vật lý; nó có thể reasoning rất hay rồi vẫn thất bại ở 2 mm cuối cùng khi cắm một cái plug.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Bài báo thừa nhận: PaLM-E vẫn phụ thuộc mạnh vào low-level policy library. Nếu robot chưa có kỹ năng vật lý tương ứng, ví dụ một chuyển động mới hoàn toàn, mô hình ngôn ngữ không thể chỉ “nghĩ ra” bộ điều khiển đáng tin cậy.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: model và thí nghiệm đòi compute rất lớn, khả năng low-level manipulation còn hạn chế. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Bài báo thừa nhận: PaLM-E vẫn phụ thuộc mạnh vào low-level policy library. Nếu robot chưa có kỹ năng vật lý tương ứng, ví dụ một chuyển động mới hoàn toàn, mô hình ngôn ngữ không thể chỉ “nghĩ ra” bộ điều khiển đáng tin cậy. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: pipeline đến action thật phụ thuộc nhiều thành phần bên ngoài, nên không tự chứng minh end-to-end generalist control. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RT-2, Qwen-VLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: RT-2 biến action thành token để đi tiếp từ reasoning đến điều khiển. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: GR00T N1 sử dụng VLM làm phần hiểu ngữ nghĩa trước action expert. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RT-2, Qwen-VLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Tự dựng một multimodal prompt encoder toy: project vectors ảnh 512D và state 12D vào cùng hidden dimension rồi xen kẽ token vào Transformer. Kiểm chứng shape, positional encoding và attention mask trước khi nghĩ đến robot thật.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Sensory tokens khiến LLM có grounding tốt hơn trong thế giới vật lý. Tự dựng một multimodal prompt encoder toy: project vectors ảnh 512D và state 12D vào cùng hidden dimension rồi xen kẽ token vào Transformer.

**Chọn điều cần mang sang dự án thật.** Thích hợp làm high-level reasoning/planning module. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Sensory tokens khiến LLM có grounding tốt hơn trong thế giới vật lý.

**Tái hiện tối thiểu.** Tự dựng một multimodal prompt encoder toy: project vectors ảnh 512D và state 12D vào cùng hidden dimension rồi xen kẽ token vào Transformer. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

