## Vì sao cần nghiên cứu này?

Một robot thực tế không phải lúc nào cũng nhận nhiệm vụ dưới một string cố định. User có thể đưa text, ảnh mục tiêu, ảnh vật thể, hoặc một demonstration làm ví dụ. Những policy cũ thường xây interface riêng cho từng loại conditioning, nên rất khó có một mô hình chung và khó đo khả năng khái quát một cách có hệ thống. VIMA hỏi: **nếu mọi nhiệm vụ đặc tả đều được biểu diễn như một multimodal prompt, robot có thể học một interface chung giống mô hình nền tảng không?**

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/vima/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 cho thấy nhiệm vụ robot có thể chỉ định bằng prompt đa phương thức: không chỉ một câu lệnh mà còn hình ảnh đối tượng tham chiếu hoặc ví dụ hành động. Điều này giải quyết một hạn chế của task ID hay label cố định: 'đặt vật giống hình vào khu vực kia' cần model hiểu mối quan hệ giữa prompt và scene. Nhưng prompt giúp diễn đạt mục tiêu phong phú hơn, không có nghĩa robot đã học được mọi thao tác vật lý; VIMA chủ yếu được nghiên cứu trong môi trường mô phỏng có cấu trúc.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Robot nhận nhiệm vụ qua prompt có cả text, hình và ví dụ thao tác, chứ không chỉ câu lệnh. Một robot thực tế không phải lúc nào cũng nhận nhiệm vụ dưới một string cố định. User có thể đưa text, ảnh mục tiêu, ảnh vật thể, hoặc một demonstration làm ví dụ.

**Vấn đề khoa học nằm ở đâu?** Nhiều thao tác cần chỉ đối tượng bằng ảnh, ví dụ hoặc quan hệ không gian. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Prompt là một chương trình đặc tả nhiệm vụ đa phương thức là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Transformer cross-attend từ trạng thái thế giới vào text và object tokens của prompt. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Người dùng không luôn mô tả nhiệm vụ bằng một câu

**Luận điểm.** Nhiều thao tác cần chỉ đối tượng bằng ảnh, ví dụ hoặc quan hệ không gian. User có thể đưa text, ảnh mục tiêu, ảnh vật thể, hoặc một demonstration làm ví dụ. Những policy cũ thường xây interface riêng cho từng loại conditioning, nên rất khó có một mô hình chung và khó đo khả năng khái quát một cách có hệ thống.

**Tại sao lỗi này có hệ quả lớn?** Text-only instruction interface bỏ lỡ thông tin thị giác của prompt. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân người dùng không luôn mô tả nhiệm vụ bằng một câu vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Text-only instruction interface bỏ lỡ thông tin thị giác của prompt

**Luận điểm.** Các policy riêng theo prompt format làm việc chuyển giao khó hơn. Prompt có thể chứa text lẫn token thị giác. Kiến trúc dùng đã pretrain text encoder, object-centric token thị giác và Transformer để cross-attend vào prompt rồi autoregressively sinh action.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Các policy riêng theo prompt format làm việc chuyển giao khó hơn.. Thay đổi trọng tâm là: Prompt là một chương trình đặc tả nhiệm vụ đa phương thức. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Transformer cross-attend từ trạng thái thế giới vào text và object tokens của prompt.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Trong VIMA, **prompt** là đặc tả của nhiệm vụ, không chỉ sentence. Nó có thể gồm hình ảnh của mục tiêu và vật thể tham chiếu; những thành phần này cần fusion với quan sát hiện tại. Object-centric tokens đưa một inductive bias mạnh: bài toán từ toàn ảnh chuyển thành tập vật thể được nhận diện/segment sẵn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Object-centric tokens đưa một inductive bias mạnh: bài toán từ toàn ảnh chuyển thành tập vật thể được nhận diện/segment sẵn.

**Khái niệm thành cấu trúc tính toán.** Object-centric tokens: Mô tả vật thể thay vì toàn ảnh không có cấu trúc. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Object-centric tokens đưa một inductive bias mạnh: bài toán từ toàn ảnh chuyển thành tập vật thể được nhận diện/segment sẵn. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Bài báo giới thiệu **VIMA-Bench**, gồm 17 nhóm nhiệm vụ, hơn **600 nghìn expert các quỹ đạo** và nhiều level khả năng khái quát ngày càng khó. Prompt có thể chứa text lẫn token thị giác. Kiến trúc dùng đã pretrain text encoder, object-centric token thị giác và Transformer để cross-attend vào prompt rồi autoregressively sinh action.

Một điểm quan trọng là benchmark cố tách nhiều kiểu OOD: novel placement, vật thể mới combination, novel nhiệm vụ composition và level khó nhất là nhiệm vụ templates mới. Mô hình được scale từ cỡ nhỏ đến khoảng 200M parameters để xem hiệu năng có obey scaling trend không.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/vima/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 định nghĩa nhiều mức generalization của VIMA-BENCH. Đây mới là bản chất benchmark: test model trên nhiệm vụ/tổ hợp chưa gặp trong training chứ không chỉ xem nó tái hiện ví dụ quen thuộc. Khi đọc hình, hãy xác định yếu tố nào được giữ nguyên và yếu tố nào thay đổi ở từng level, rồi xem success rate có giảm khi compositional novelty tăng không. Một metric gộp duy nhất có thể che mất chuyện model chỉ giỏi các tổ hợp gần training distribution.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ prompt gồm ảnh chiếc khối có hoa văn, một lệnh 'đặt vật giống như mẫu vào bên trái vật màu xanh', và ảnh scene hiện tại có nhiều khối tương tự. Hệ phải grounding được tham chiếu hình ảnh, quan hệ 'bên trái' và kế hoạch chuyển động của gripper. Tạo ba mức test: đúng kiểu vật và vị trí từng gặp, vật mới nhưng quan hệ quen, rồi tổ hợp cả vật và quan hệ mới. Nếu model chỉ thành công mức đầu, không được gọi đó là generalization theo prompt chỉ vì interface đầu vào là multimodal.

### Đào sâu: Prompt là một chương trình đặc tả nhiệm vụ đa phương thức

**Luận điểm.** Transformer cross-attend từ trạng thái thế giới vào text và object tokens của prompt. Kiến trúc dùng đã pretrain text encoder, object-centric token thị giác và Transformer để cross-attend vào prompt rồi autoregressively sinh action.

**Giải thích không dùng tên model.** Transformer cross-attend từ trạng thái thế giới vào text và object tokens của prompt. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Robot nhận nhiệm vụ qua prompt có cả text, hình và ví dụ thao tác, chứ không chỉ câu lệnh. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Robot nhận nhiệm vụ qua prompt có cả text, hình và ví dụ thao tác, chứ không chỉ câu lệnh. Một điểm quan trọng là benchmark cố tách nhiều kiểu OOD: novel placement, vật thể mới combination, novel nhiệm vụ composition và level khó nhất là nhiệm vụ templates mới.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Text + ảnh prompt → Object encoder → Cross-attention policy → Pick/place actions. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Một điểm quan trọng là benchmark cố tách nhiều kiểu OOD: novel placement, vật thể mới combination, novel nhiệm vụ composition và level khó nhất là nhiệm vụ templates mới. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Prompt được mã hóa bằng text và visual object tokens. Mô hình được scale từ cỡ nhỏ đến khoảng 200M parameters để xem hiệu năng có obey scaling trend không.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Môi trường mô phỏng cung cấp biểu diễn đối tượng/quan hệ khá rõ. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Mô hình được scale từ cỡ nhỏ đến khoảng 200M parameters để xem hiệu năng có obey scaling trend không. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** VIMA-Bench gồm 17 nhóm nhiệm vụ và hơn 600 nghìn expert trajectories. Bài báo giới thiệu VIMA-Bench, gồm 17 nhóm nhiệm vụ, hơn 600 nghìn expert các quỹ đạo và nhiều level khả năng khái quát ngày càng khó.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Train policy trên nhiều tổ hợp prompt/action. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Bài báo giới thiệu VIMA-Bench, gồm 17 nhóm nhiệm vụ, hơn 600 nghìn expert các quỹ đạo và nhiều level khả năng khái quát ngày càng khó. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Object-centric conditioning mang lại inductive bias hữu ích. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Thay lệnh text đơn nhất bằng prompt kết hợp chữ và hình; action phụ thuộc cả hai. Trong VIMA, prompt là đặc tả của nhiệm vụ, không chỉ sentence. Nó có thể gồm hình ảnh của mục tiêu và vật thể tham chiếu; những thành phần này cần fusion với quan sát hiện tại.

$$
\pi_\theta(a\mid o,\underbrace{p_{\rm text},p_{\rm vision}}_{\rm prompt})
$$

**Công thức đang mô tả thứ gì?** Thay lệnh text đơn nhất bằng prompt kết hợp chữ và hình; action phụ thuộc cả hai. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Trong VIMA, prompt là đặc tả của nhiệm vụ, không chỉ sentence. Nó có thể gồm hình ảnh của mục tiêu và vật thể tham chiếu; những thành phần này cần fusion với quan sát hiện tại. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Biểu thức mô tả cách đặt điều kiện, không phải claim về tối ưu. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Prompt kiểu `Put [ảnh cốc xanh] next to [ảnh hộp đỏ]` tách thành đoạn text và vật thể tokens. Transformer nhìn bối cảnh hiện tại, cross-attend vào prompt và sinh thao tác pick/place. Lúc đánh giá, thay cốc xanh bằng vật mới hoặc đổi quan hệ không gian để đo prompt khả năng khái quát.

Level khó nhất của VIMA-Bench không đồng nghĩa open-world: nhiệm vụ vẫn thuộc grammar mô phỏng, dù hoán đổi vật thể/combination.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Đọc prompt đa phương thức và state hiện tại. Lúc đánh giá, thay cốc xanh bằng vật mới hoặc đổi quan hệ không gian để đo prompt khả năng khái quát.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Chọn object, suy ra quan hệ trong prompt, dự đoán thao tác. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Lúc đánh giá, thay cốc xanh bằng vật mới hoặc đổi quan hệ không gian để đo prompt khả năng khái quát. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Đánh giá zero-shot bằng level held-out tăng dần độ khó. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

VIMA outperform các alternative kiến trúc cùng dữ liệu khá mạnh trên hard zero-shot splits. Bài báo báo có thiết lập **tới 2.9x tỷ lệ thành công của nhiệm vụ** so với kiến trúc thay thế ở cùng dữ liệu budget, và **2.7x hiệu năng với ít hơn 10x dữ liệu** trong một số comparison. Kích thước mô hình và dữ liệu size đều giúp systematic khả năng khái quát, không chỉ memorization huấn luyện nhiệm vụ.

Quan trọng hơn, level khả năng khái quát càng xa huấn luyện grammar thì hiệu năng vẫn tụt rõ. Điều đó vừa là kết quả tốt vừa là warning: multimodal prompting giúp rất nhiều, nhưng không biến robot thành GPT cho vật lý chỉ sau một đêm.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Ở một số so sánh báo cáo, tỷ lệ thành công cao hơn baseline tới 2,9 lần. Bài báo báo có thiết lập tới 2.9x tỷ lệ thành công của nhiệm vụ so với kiến trúc thay thế ở cùng dữ liệu budget, và 2.7x hiệu năng với ít hơn 10x dữ liệu trong một số comparison.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Với mức dữ liệu ít hơn đáng kể, có so sánh hiệu năng cao hơn 2,7 lần. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Bài báo báo có thiết lập tới 2.9x tỷ lệ thành công của nhiệm vụ so với kiến trúc thay thế ở cùng dữ liệu budget, và 2.7x hiệu năng với ít hơn 10x dữ liệu trong một số comparison. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Các level OOD khó nhất vẫn làm kết quả tụt mạnh. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Object-centric conditioning mang lại inductive bias hữu ích. Kích thước mô hình và dữ liệu size đều giúp systematic khả năng khái quát, không chỉ memorization huấn luyện nhiệm vụ.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Nhiều dữ liệu và model lớn cải thiện cả các mức generalization khó. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Kích thước mô hình và dữ liệu size đều giúp systematic khả năng khái quát, không chỉ memorization huấn luyện nhiệm vụ. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Kích thước mô hình và dữ liệu size đều giúp systematic khả năng khái quát, không chỉ memorization huấn luyện nhiệm vụ. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** perception dựa vào vật thể detector riêng nên có thể fail khi occlusion/OOD. VIMA-Bench là mô phỏng với action primitives khá sạch, chưa phản ánh toàn bộ contact động lực học của robot thật. Nhóm nhiệm vụ tuy đa dạng nhưng vẫn procedurally được tạo ra từ một grammar tương đối rõ.

**Phê bình thêm:** object-centric biểu diễn đã cho mô hình một inductive bias cực mạnh, tức một phần bài toán perception khó ngoài đời đã được giải hộ. Action không gian có các primitive tương đối high-level nên độ chính xác control, force, độ trễ và phục hồi bị che đi. “Novel nhiệm vụ” vẫn nằm trong thế giới Ravens/VIMA chứ chưa phải open-world nhiệm vụ. Do đó VIMA rất mạnh để học **khả năng khái quát structure**, nhưng không nên dùng nó làm evidence rằng một policy đã sẵn sàng cho household robotics.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Bài báo thừa nhận: perception dựa vào vật thể detector riêng nên có thể fail khi occlusion/OOD.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: perception dựa detector; benchmark chủ yếu mô phỏng với action primitive sạch. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Bài báo thừa nhận: perception dựa vào vật thể detector riêng nên có thể fail khi occlusion/OOD. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: thế giới mô phỏng giàu cấu trúc không thay thế được contact dynamics và lỗi cảm biến ngoài đời. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [LIBERO](/paper/libero)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RT-2, LIBERO. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: LIBERO kiểm tra chuyển giao và học liên tục ở benchmark manipulation. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: RT-2 mở rộng prompt/image semantics sang robot control. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RT-2, LIBERO. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chạy VIMA-Bench trên một prompt type. Giữ chuyển động primitive không đổi rồi thay modality của prompt: chỉ text, text + vật thể hình ảnh. Log thành công theo mức OOD. Để debugging, visualize attention từ quan sát vật thể token đến prompt vật thể token.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Prompt có thể là cấu trúc multimodal thay vì chỉ một chuỗi text. Chạy VIMA-Bench trên một prompt type. Giữ chuyển động primitive không đổi rồi thay modality của prompt: chỉ text, text + vật thể hình ảnh.

**Chọn điều cần mang sang dự án thật.** Dùng benchmark phân tầng OOD để đo đúng kiểu tổng quát hóa. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Prompt có thể là cấu trúc multimodal thay vì chỉ một chuỗi text.

**Tái hiện tối thiểu.** Chạy VIMA-Bench trên một prompt type. Giữ chuyển động primitive không đổi rồi thay modality của prompt: chỉ text, text + vật thể hình ảnh. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

