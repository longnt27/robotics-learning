## Vì sao cần nghiên cứu này?

RT-2 chứng minh VLA mạnh nhưng mô hình, dữ liệu và quy trình huấn luyện phần lớn đóng. Robotics community cần một open checkpoint đủ mạnh để nghiên cứu **fine-tuning, parameter-efficient adaptation, quantization và downstream deployment**. OpenVLA đặt mục tiêu tạo một 7B VLA open-source cạnh tranh với các closed VLAs nhưng practical hơn cho phòng thí nghiệm bình thường.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/openvla/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 giới thiệu OpenVLA theo cách nên đọc từ dữ liệu huấn luyện tới khả năng sử dụng: VLA 7B học trên gần một triệu robot episodes thuộc tập Open X-Embodiment, rồi được fine-tune cho task và robot đích. Đây là bằng chứng về một recipe mở có khả năng tái sử dụng chứ không phải tuyên bố chỉ tải checkpoint là sẽ điều khiển ngay mọi phần cứng. Ngay trong hình, hãy phân biệt phần học tri thức thị giác-ngôn ngữ trước đó với supervision từ robot, bởi kiến thức nhìn vật thể và khả năng thực sự kẹp/di chuyển vật thể là hai thứ khác nhau.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Một VLA mã nguồn mở nối pretrained VLM với action tokens và hỗ trợ fine-tuning robot-specific. Robotics community cần một open checkpoint đủ mạnh để nghiên cứu fine-tuning, parameter-efficient adaptation, quantization và downstream deployment.

**Vấn đề khoa học nằm ở đâu?** Đọc RT-2 mà không có weights/code làm cộng đồng khó thử ablation và evaluation thực sự. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Tận dụng open VLM rồi fine-tune thành action predictor là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Đưa ảnh và instruction vào VLM; dự đoán discretized action tokens và giải mã sang motor space. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Các VLA mạnh thường khó tải và fine-tune

**Luận điểm.** Đọc RT-2 mà không có weights/code làm cộng đồng khó thử ablation và evaluation thực sự. OpenVLA đặt mục tiêu tạo một 7B VLA open-source cạnh tranh với các closed VLAs nhưng practical hơn cho phòng thí nghiệm bình thường.

**Tại sao lỗi này có hệ quả lớn?** Policy robot-only thiếu world knowledge. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân các vla mạnh thường khó tải và fine-tune vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Policy robot-only thiếu world knowledge

**Luận điểm.** VLM-to-action đóng khó tái hiện experiment và không dễ phục vụ robot mới. OpenVLA dùng Llama 2 7B làm ngôn ngữ backbone và fuse đặc trưng thị giác từ DINOv2 + SigLIP, sau đó pretrain/fine-tune trên khoảng 970 nghìn robot demonstrations từ Open X-Embodiment.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: VLM-to-action đóng khó tái hiện experiment và không dễ phục vụ robot mới.. Thay đổi trọng tâm là: Tận dụng open VLM rồi fine-tune thành action predictor. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Đưa ảnh và instruction vào VLM; dự đoán discretized action tokens và giải mã sang motor space.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

RT-2 gợi ý VLM-to-action là khả thi nhưng không phải open reproducible mô hình cho nhiều phòng thí nghiệm. OpenVLA cung cấp implementation, weights và LoRA fine-tuning, giúp mở phần lớn hệ thống để kiểm chứng ở mức mô hình code.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. OpenVLA cung cấp implementation, weights và LoRA fine-tuning, giúp mở phần lớn hệ thống để kiểm chứng ở mức mô hình code.

**Khái niệm thành cấu trúc tính toán.** Prismatic VLM: Vision backbone và language model kết hợp. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. OpenVLA cung cấp implementation, weights và LoRA fine-tuning, giúp mở phần lớn hệ thống để kiểm chứng ở mức mô hình code. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

OpenVLA dùng **Llama 2 7B** làm ngôn ngữ backbone và fuse đặc trưng thị giác từ **DINOv2 + SigLIP**, sau đó pretrain/fine-tune trên khoảng **970 nghìn robot demonstrations** từ Open X-Embodiment. Liên tục robot actions được discretize thành tokens để mô hình dùng cùng autoregressive next-token mục tiêu huấn luyện với VLM.

Bài báo đặc biệt quan tâm tới adaptation. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/hiệu năng trade-off. Đây là lý do OpenVLA hữu ích như research substrate hơn là chỉ một leaderboard entry.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/openvla/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 là chỗ phải hiểu đường đi của action: ảnh quan sát và lệnh ngôn ngữ đi qua VLM, decoder sinh các token tương ứng với những chiều trong action robot, và bước giải mã chuyển token trở lại lệnh điều khiển 7 chiều. Đây không phải sinh văn bản 'nhặt cốc' rồi robot tự biết làm. Action tokenization phải có quy tắc discretization, normalization và thứ tự chiều nhất quán với dataloader lẫn executor. Nếu lẫn giá trị gripper với rotation, mô hình vẫn có thể cho ra token hợp lệ nhưng hành động sẽ sai.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ dùng một trajectory có delta position xyz, delta rotation ba chiều và gripper. Đầu tiên encode action thật thành token ID theo đúng bin và cách chuẩn hóa của OpenVLA; sau đó decode lại mà chưa chạy model để đo quantization error. Tiếp theo cố định ảnh, thay instruction, xem distribution của action tokens có đổi tương ứng hay không. Cuối cùng fine-tune trên một tập demonstration nhỏ và so với random initialization; so accuracy token, sai số action liên tục sau decode và rollout success. Những phép thử này tách lỗi tokenizer khỏi lỗi semantic grounding và lỗi control.

### Đào sâu: Tận dụng open VLM rồi fine-tune thành action predictor

**Luận điểm.** Đưa ảnh và instruction vào VLM; dự đoán discretized action tokens và giải mã sang motor space. Liên tục robot actions được discretize thành tokens để mô hình dùng cùng autoregressive next-token mục tiêu huấn luyện với VLM.

**Giải thích không dùng tên model.** Đưa ảnh và instruction vào VLM; dự đoán discretized action tokens và giải mã sang motor space. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Một VLA mã nguồn mở nối pretrained VLM với action tokens và hỗ trợ fine-tuning robot-specific. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Một VLA mã nguồn mở nối pretrained VLM với action tokens và hỗ trợ fine-tuning robot-specific. Bài báo đặc biệt quan tâm tới adaptation. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/hiệu năng trade-off.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Ảnh + instruction → Vision encoder → LLM action tokens → De-normalize → robot action. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Bài báo đặc biệt quan tâm tới adaptation. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/hiệu năng trade-off. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** 7D action thường bao gồm translation/rotation/gripper. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/hiệu năng trade-off.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Token bins lượng tử hóa normalized action. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/hiệu năng trade-off. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Sử dụng Open X robot data và VLM pretraining. PEFT là phần rất thực dụng: LoRA rank 32 đạt khoảng 68.2% so với 69.7% full fine-tuning nhưng chỉ huấn luyện khoảng 1.4% parameters và memory giảm mạnh.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Fine-tune VLM theo autoregressive action prediction. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** PEFT là phần rất thực dụng: LoRA rank 32 đạt khoảng 68.2% so với 69.7% full fine-tuning nhưng chỉ huấn luyện khoảng 1.4% parameters và memory giảm mạnh. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Kiểm tra gains của fine-tuning theo robot và lượng dữ liệu. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Token trong VLM không tự có đơn vị mét/radian: phải giải mã và phục hồi scale action của robot đích. RT-2 gợi ý VLM-to-action là khả thi nhưng không phải open reproducible mô hình cho nhiều phòng thí nghiệm.

$$
\hat a=\mathrm{Denorm}\!\big(\mathrm{Decode}(z_{\rm action})\big)
$$

**Công thức đang mô tả thứ gì?** Token trong VLM không tự có đơn vị mét/radian: phải giải mã và phục hồi scale action của robot đích. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. RT-2 gợi ý VLM-to-action là khả thi nhưng không phải open reproducible mô hình cho nhiều phòng thí nghiệm. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Biểu thức hệ thống hóa bước decode, không phải loss. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Đầu vào gồm hình ảnh và chỉ dẫn, backbone VLM tạo hidden đặc trưng, decoder sinh discrete tokens mã hóa các action dimensions. Tại inference, tokenizer decode token IDs về giá trị action đã normalize; phía robot phải unnormalize theo statistics của tập dữ liệu/phần cứng. Sai normalizer có thể tạo action vô lý dù token độ chính xác cao.

OpenVLA là contrast hữu ích với π0.5: OpenVLA thường autoregressive **discrete action**, còn π0-style policy sinh action liên tục chunks qua flow-based expert.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Ảnh đi qua vision backbone trước khi kết hợp instruction trong language backbone. Đầu vào gồm hình ảnh và chỉ dẫn, backbone VLM tạo hidden đặc trưng, decoder sinh discrete tokens mã hóa các action dimensions.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Instruction + image tokens được language backbone xử lý. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Đầu vào gồm hình ảnh và chỉ dẫn, backbone VLM tạo hidden đặc trưng, decoder sinh discrete tokens mã hóa các action dimensions. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Sinh action tokens rồi áp inverse normalization trước điều khiển. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên bộ 29 nhiệm vụ dùng để so generalist policies, OpenVLA báo tỷ lệ thành công trung bình cao hơn **RT-2-X khoảng 16.5 điểm** trong đánh giá của họ. Sau task-specific/multi-task fine-tuning, OpenVLA vượt Octo và Diffusion Policy đáng kể trên những thiết lập thao tác robot cần hiểu nhiều chỉ dẫn ngôn ngữ, tác giả nêu mức cải thiện tổng hợp khoảng **20.4%**.

PEFT là phần rất thực dụng: **LoRA rank 32** đạt khoảng **68.2%** so với **69.7%** full fine-tuning nhưng chỉ huấn luyện khoảng **1.4% parameters** và memory giảm mạnh. 4-bit quantization trong một thiết lập giữ hiệu năng gần bf16, thậm chí số đo dao động **71.9 vs 71.3**, trong khi mô hình memory giảm từ khoảng 16.8 GB xuống 7 GB. Điều đó chứng minh VLA adaptation không nhất thiết cần một cụm H100.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** OpenVLA 7B trở thành baseline mở để chạy inference và fine-tune. Trên bộ 29 nhiệm vụ dùng để so generalist policies, OpenVLA báo tỷ lệ thành công trung bình cao hơn RT-2-X khoảng 16.5 điểm trong đánh giá của họ.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Đánh giá đa nhiệm cho thấy tiềm năng transfer từ VLM sang robot control. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Trên bộ 29 nhiệm vụ dùng để so generalist policies, OpenVLA báo tỷ lệ thành công trung bình cao hơn RT-2-X khoảng 16.5 điểm trong đánh giá của họ. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Tương quan giữa chất lượng checkpoint và normalization/dataset rất lớn. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Kiểm tra gains của fine-tuning theo robot và lượng dữ liệu. Sau task-specific/multi-task fine-tuning, OpenVLA vượt Octo và Diffusion Policy đáng kể trên những thiết lập thao tác robot cần hiểu nhiều chỉ dẫn ngôn ngữ, tác giả nêu mức cải thiện tổng hợp khoảng 20.4%.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: So LoRA, quantized inference với precision/latency/memory thực tế. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Sau task-specific/multi-task fine-tuning, OpenVLA vượt Octo và Diffusion Policy đáng kể trên những thiết lập thao tác robot cần hiểu nhiều chỉ dẫn ngôn ngữ, tác giả nêu mức cải thiện tổng hợp khoảng 20.4%. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Sau task-specific/multi-task fine-tuning, OpenVLA vượt Octo và Diffusion Policy đáng kể trên những thiết lập thao tác robot cần hiểu nhiều chỉ dẫn ngôn ngữ, tác giả nêu mức cải thiện tổng hợp khoảng 20.4%. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** mô hình chỉ dùng single-image quan sát, thiếu quan sát history, multiview và proprioception phong phú. Autoregressive action inference chậm với high-frequency platforms như ALOHA. Reliability dưới 90% ở nhiều nhiệm vụ vẫn chưa đủ cho production, và do compute constraints bài báo không khám phá hết design không gian. Trên một số narrow dexterous nhiệm vụ, specialist Diffusion Policy vẫn mượt/tốt hơn.

**Phê bình thêm:** action tokenization là một nút thắt kép: quantization làm mất độ chính xác, autoregression làm mất speed. Dung lượng mô hình ngôn ngữ 7B tham số không tự động biến thành motor dung lượng mô hình. Kết quả fine-tuned mạnh đôi khi dễ bị đọc nhầm thành zero-shot foundation capability. OpenVLA cũng kế thừa toàn bộ imbalance và action-schema mess của OXE. Giá trị lớn nhất của nó là **mở ra hệ sinh thái**, không phải chứng minh action-as-text đã là endpoint của kiến trúc VLA.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Phê bình thêm: action tokenization là một nút thắt kép: quantization làm mất độ chính xác, autoregression làm mất speed.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: action tokenization và hardware/memory vẫn là bottleneck. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Phê bình thêm: action tokenization là một nút thắt kép: quantization làm mất độ chính xác, autoregression làm mất speed. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: 7B không phải lựa chọn tốt cho low-cost 50 Hz control; quantization làm tăng sai số. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [FAST](/paper/fast)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RT-2, FAST, Qwen-VLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: RT-2 là tiền đề VLM-to-action autoregression. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: FAST giảm token length của action sequence; π0.5 chuyển sang continuous flow. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RT-2, FAST, Qwen-VLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chỉ chạy 4-bit inference T4, log processor đầu vào, token thị giác, logits/token IDs, decoded normalized action và unnormalized action. Đừng đốt quota vào full fine-tune ngay.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** OpenVLA là nơi nên mở code để học VLA pipeline. Chỉ chạy 4-bit inference T4, log processor đầu vào, token thị giác, logits/token IDs, decoded normalized action và unnormalized action.

**Chọn điều cần mang sang dự án thật.** Luôn inspect action tokenizer và normalization trước rollout. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. OpenVLA là nơi nên mở code để học VLA pipeline.

**Tái hiện tối thiểu.** Chỉ chạy 4-bit inference T4, log processor đầu vào, token thị giác, logits/token IDs, decoded normalized action và unnormalized action. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

