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

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Nén action chunk trong miền tần số để autoregressive VLA cần ít token hơn nhiều. Autoregressive VLA có một vấn đề quan trọng: action liên tục stream ở 20-50 Hz tạo quá nhiều tokens nếu discretize từng dimension từng timestep.

**Vấn đề khoa học nằm ở đâu?** Tần số robot cao và nhiều DoF làm next-token action decoding cực đắt. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Chuyển trajectory sang frequency domain để giữ cái thay đổi chậm là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là DCT gom chuyển động trơn vào vài hệ số tần số thấp, rồi token hóa chúng. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Một action stream có thể phình thành hàng nghìn tokens

**Luận điểm.** Tần số robot cao và nhiều DoF làm next-token action decoding cực đắt. Nếu nén action quá mạnh thì lại mất độ chính xác. FAST hỏi: có biểu diễn nào nén smooth robot các quỹ đạo thành ít tokens mà vẫn bảo toàn motor detail đủ tốt không?

**Tại sao lỗi này có hệ quả lớn?** Quantize từng chiều ở từng timestep gây sequence rất dài. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân một action stream có thể phình thành hàng nghìn tokens vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Quantize từng chiều ở từng timestep gây sequence rất dài

**Luận điểm.** Phần lớn robot trajectories mượt; cách biểu diễn cũ lặp lại thông tin thời gian. FAST lợi dụng fact rằng robot các quỹ đạo thường smooth theo thời gian. Nó dùng Discrete Cosine Transform (DCT) để chuyển action chunk sang frequency domain, nơi phần lớn năng lượng nằm ở ít low-frequency coefficients, rồi tokenize/entropy-code các coefficients đó.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Phần lớn robot trajectories mượt; cách biểu diễn cũ lặp lại thông tin thời gian.. Thay đổi trọng tâm là: Chuyển trajectory sang frequency domain để giữ cái thay đổi chậm. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. DCT gom chuyển động trơn vào vài hệ số tần số thấp, rồi token hóa chúng.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Autoregressive VLA thường token hóa mỗi action dimension mỗi timestep. Nếu horizon 50 và robot có nhiều DoF, số tokens tăng cực nhanh, độ trễ/memory tệ. Nhưng robot các quỹ đạo khá mượt, nên có **theo thời gian redundancy** có thể khai thác.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 8 từ PDF gốc, trang 8](/paper-figures/fast/figure-8.webp)
![Hình 9 từ PDF gốc, trang 9](/paper-figures/fast/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Nếu horizon 50 và robot có nhiều DoF, số tokens tăng cực nhanh, độ trễ/memory tệ. Nhưng robot các quỹ đạo khá mượt, nên có theo thời gian redundancy có thể khai thác.

**Khái niệm thành cấu trúc tính toán.** DCT: Đổi chuỗi thời gian thành các thành phần tần số. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Nếu horizon 50 và robot có nhiều DoF, số tokens tăng cực nhanh, độ trễ/memory tệ. Nhưng robot các quỹ đạo khá mượt, nên có theo thời gian redundancy có thể khai thác. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

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

### Đào sâu: Chuyển trajectory sang frequency domain để giữ cái thay đổi chậm

**Luận điểm.** DCT gom chuyển động trơn vào vài hệ số tần số thấp, rồi token hóa chúng. Nó dùng Discrete Cosine Transform (DCT) để chuyển action chunk sang frequency domain, nơi phần lớn năng lượng nằm ở ít low-frequency coefficients, rồi tokenize/entropy-code các coefficients đó.

**Giải thích không dùng tên model.** DCT gom chuyển động trơn vào vài hệ số tần số thấp, rồi token hóa chúng. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Nén action chunk trong miền tần số để autoregressive VLA cần ít token hơn nhiều. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Nén action chunk trong miền tần số để autoregressive VLA cần ít token hơn nhiều. Sau đó FAST được ghép với π-style autoregressive VLA. Vì mỗi chunk dùng ít tokens hơn rất nhiều, dự đoán action không còn kéo chuỗi length lên phi lý.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Action chunk T × D → Discrete Cosine Transform → Quantize hệ số → Ít autoregressive tokens. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Sau đó FAST được ghép với π-style autoregressive VLA. Vì mỗi chunk dùng ít tokens hơn rất nhiều, dự đoán action không còn kéo chuỗi length lên phi lý. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Thay chuỗi action thô bằng compressed frequency coefficients. FAST+ là universal action tokenizer được huấn luyện trên khoảng 1 triệu robot các quỹ đạo thuộc nhiều action spaces và frequencies thay vì huấn luyện tokenizer riêng cho mỗi tập dữ liệu.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Hệ số thấp mô tả xu hướng chuyển động mượt; hệ số cao mang biến động nhanh. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. FAST+ là universal action tokenizer được huấn luyện trên khoảng 1 triệu robot các quỹ đạo thuộc nhiều action spaces và frequencies thay vì huấn luyện tokenizer riêng cho mỗi tập dữ liệu. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Huấn luyện FAST+ trên khoảng 1 triệu robot trajectories. Bài báo cho thấy FAST/FAST+ cho phép autoregressive VLA scale tới cỡ 10 nghìn giờ dữ liệu robot và đạt hiệu năng gần hoặc ngang flow/diffusion VLA trong các benchmark của họ, trong khi huấn luyện có thể nhanh hơn tới khoảng 5x so với naive action tokenization.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Tokenizer cung cấp targets ngắn hơn cho autoregressive VLA. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Bài báo cho thấy FAST/FAST+ cho phép autoregressive VLA scale tới cỡ 10 nghìn giờ dữ liệu robot và đạt hiệu năng gần hoặc ngang flow/diffusion VLA trong các benchmark của họ, trong khi huấn luyện có thể nhanh hơn tới khoảng 5x so với naive action tokenization. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** So smooth vs noisy trajectories theo rate/distortion. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Không dự đoán mọi timestep riêng: nén các hệ số DCT quan trọng thành M token, thường M nhỏ hơn nhiều T×D. Vì mỗi chunk dùng ít tokens hơn rất nhiều, dự đoán action không còn kéo chuỗi length lên phi lý.

$$
A_{1:T}\xrightarrow{\mathrm{DCT}}c_{1:K}\xrightarrow{\mathrm{tokenize}}z_{1:M}
$$

**Công thức đang mô tả thứ gì?** Không dự đoán mọi timestep riêng: nén các hệ số DCT quan trọng thành M token, thường M nhỏ hơn nhiều T×D. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Vì mỗi chunk dùng ít tokens hơn rất nhiều, dự đoán action không còn kéo chuỗi length lên phi lý. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Sơ đồ biểu diễn; M không phải hằng số chung cho mọi dữ liệu. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Tạo action tensor `(T=50, D=7)`. Normalize, biến mỗi dimension theo DCT từ time domain sang frequency coefficients, giữ coefficients mang nhiều năng lượng và lượng tử hóa thành token chuỗi. Decode đảo quy trình để reconstruct actions. Với quỹ đạo mượt, high-frequency coefficients nhỏ; với quỹ đạo giật, compression khó hơn.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 10 từ PDF gốc, trang 10](/paper-figures/fast/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Đây không phải thần kỳ: DCT chỉ là thay basis. Việc tokenizer giữ đủ thông tin về những chuyển động contact-critical mới quyết định policy thành công.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** VLM sinh chuỗi action tokens đã nén. Tạo action tensor (T=50, D=7). Normalize, biến mỗi dimension theo DCT từ time domain sang frequency coefficients, giữ coefficients mang nhiều năng lượng và lượng tử hóa thành token chuỗi.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: FAST decoder khôi phục trajectory liên tục. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Tạo action tensor (T=50, D=7). Normalize, biến mỗi dimension theo DCT từ time domain sang frequency coefficients, giữ coefficients mang nhiều năng lượng và lượng tử hóa thành token chuỗi. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Autoregressive generation vẫn phải sinh token theo thứ tự. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo cho thấy FAST/FAST+ cho phép autoregressive VLA scale tới cỡ **10 nghìn giờ dữ liệu robot** và đạt hiệu năng gần hoặc ngang flow/diffusion VLA trong các benchmark của họ, trong khi **huấn luyện có thể nhanh hơn tới khoảng 5x** so với naive action tokenization. Gains rõ nhất ở high-frequency và dexterous thiết lập, nơi per-timestep binning tạo chuỗi quá dài.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/fast/figure-5.webp)
![Hình 11 từ PDF gốc, trang 10](/paper-figures/fast/figure-11.webp)

<!-- END ADDITIONAL PDF FIGURES -->
FAST+ gần dataset-specific tokenizers dù phải cover nhiều robot/action spaces. Đây là kết quả quan trọng vì nó biến tokenizer thành một reusable foundation component chứ không phải thứ phải hand-tune cho từng arm.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** FAST/FAST+ được áp dụng trên robot data ở quy mô tới khoảng 10 nghìn giờ. FAST+ gần dataset-specific tokenizers dù phải cover nhiều robot/action spaces. Đây là kết quả quan trọng vì nó biến tokenizer thành một reusable foundation component chứ không phải thứ phải hand-tune cho từng arm.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Một số thiết lập training nhanh hơn tới khoảng 5 lần so với tokenization thô. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. FAST+ gần dataset-specific tokenizers dù phải cover nhiều robot/action spaces. Đây là kết quả quan trọng vì nó biến tokenizer thành một reusable foundation component chứ không phải thứ phải hand-tune cho từng arm. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Hiệu quả của autoregressive action modeling tiến gần generative flow baseline trong các benchmark tác giả dùng. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** So smooth vs noisy trajectories theo rate/distortion. Gains rõ nhất ở high-frequency và dexterous thiết lập, nơi per-timestep binning tạo chuỗi quá dài.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Số token giảm phải đối chiếu với sai số reconstruct và success thực. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Gains rõ nhất ở high-frequency và dexterous thiết lập, nơi per-timestep binning tạo chuỗi quá dài. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Gains rõ nhất ở high-frequency và dexterous thiết lập, nơi per-timestep binning tạo chuỗi quá dài. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** evaluations chủ yếu vẫn là static manipulation; mobile, humanoid và dexterous scaling rộng hơn được để lại cho tương lai. π0-FAST autoregressive inference vẫn chậm hơn flow-based π0 trong runtime, nên dynamic nhiệm vụ cần decoder nhanh hơn. Tác giả cũng thừa nhận discrete/autoregressive so với liên tục diffusion chưa có winner cuối cùng.

**Phê bình thêm:** DCT dựa vào theo thời gian smoothness; abrupt contact corrections hoặc high-frequency phenomena chính là phần có thể bị nén tệ nhất. Huấn luyện nhanh không đồng nghĩa control độ trễ nhanh. Universal tokenizer còn phải đối mặt với phân phối action rất khác nhau giữa joint, EEF, hand và base. FAST giải chuỗi compression rất đẹp, nhưng vẫn giữ **autoregressive exposure/độ trễ problem** ở tầng decoder.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Bài báo thừa nhận: evaluations chủ yếu vẫn là static manipulation; mobile, humanoid và dexterous scaling rộng hơn được để lại cho tương lai.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: evaluation chưa bao phủ đủ mobile/dexterous dynamic tasks. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Bài báo thừa nhận: evaluations chủ yếu vẫn là static manipulation; mobile, humanoid và dexterous scaling rộng hơn được để lại cho tương lai. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: nén tần số có thể làm mờ motion hiếm nhưng contact-critical, autoregressive inference vẫn có latency. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [OpenVLA](/paper/openvla)
- [π0.5](/paper/pi-0-5)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm OpenVLA, π0.5. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: OpenVLA biểu diễn per-dimension action tokens. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: π0.5/π0-FAST dùng FAST làm một hướng so sánh với flow action head. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm OpenVLA, π0.5. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chạy FAST tokenizer trên Mac M4 với synthetic smooth và noisy các quỹ đạo; plot thô vs reconstructed; sweep chunk length/độ chính xác và đo reconstruction MAE, token count.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Action tokenizer là một quyết định modeling quan trọng, không chỉ preprocess. Chạy FAST tokenizer trên Mac M4 với synthetic smooth và noisy các quỹ đạo; plot thô vs reconstructed; sweep chunk length/độ chính xác và đo reconstruction MAE, token count.

**Chọn điều cần mang sang dự án thật.** Chạy FAST trên Mac M4 để hiểu DCT–compression–reconstruction. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Action tokenizer là một quyết định modeling quan trọng, không chỉ preprocess.

**Tái hiện tối thiểu.** Chạy FAST tokenizer trên Mac M4 với synthetic smooth và noisy các quỹ đạo; plot thô vs reconstructed; sweep chunk length/độ chính xác và đo reconstruction MAE, token count. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

