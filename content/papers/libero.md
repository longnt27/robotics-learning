## Vì sao cần nghiên cứu này?

Lifelong learning không chỉ hỏi “nhiệm vụ mới làm được bao nhiêu %”, mà còn hỏi hai câu khó hơn: **học nhiệm vụ cũ có giúp học nhiệm vụ mới nhanh hơn không**, và **học nhiệm vụ mới có làm quên nhiệm vụ cũ không**. Các benchmark robot trước đó không tách rõ kiến thức khai báo như vật thể/quan hệ không gian với kiến thức quy trình như chuyển động/chuỗi mục tiêu. LIBERO được xây để kiểm tra chính xác các dạng chuyển giao đó trong môi trường thao tác robot có kiểm soát.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/libero/figure-1.webp)

*Hình 1, trang 2. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2306.03310#page=2).*

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Benchmark kiểm tra robot có giữ được kỹ năng và chuyển giao giữa các nhiệm vụ liên tiếp hay không. LIBERO được xây để kiểm tra chính xác các dạng chuyển giao đó trong môi trường thao tác robot có kiểm soát.

**Vấn đề khoa học nằm ở đâu?** Một điểm success trên một task không phản ánh lifelong learning hay transfer. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Thay một bảng điểm bằng nhiều loại chuyển giao kiến thức là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Phân tách object, spatial, goal và long-horizon để biết policy đang chuyển giao kiểu gì. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Học nhiệm vụ mới có thể làm policy quên nhiệm vụ cũ

**Luận điểm.** Một điểm success trên một task không phản ánh lifelong learning hay transfer. Lifelong learning không chỉ hỏi “nhiệm vụ mới làm được bao nhiêu %”, mà còn hỏi hai câu khó hơn: học nhiệm vụ cũ có giúp học nhiệm vụ mới nhanh hơn không, và học nhiệm vụ mới có làm quên nhiệm vụ cũ không.

**Tại sao lỗi này có hệ quả lớn?** Benchmark một task không đo được catastrophic forgetting. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân học nhiệm vụ mới có thể làm policy quên nhiệm vụ cũ vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Lifelong learning không chỉ hỏi “nhiệm vụ mới làm được bao nhiêu %”, mà còn hỏi hai câu khó hơn: học nhiệm vụ cũ có giúp học nhiệm vụ mới nhanh hơn không, và học nhiệm vụ mới có làm quên nhiệm vụ cũ không. là lý do ta phải xem điều kiện test trước khi đọc con số success.

### Đào sâu: Benchmark một task không đo được catastrophic forgetting

**Luận điểm.** Random split trong cùng scene khiến mô hình được đo trên bối cảnh quá giống training. Các benchmark robot trước đó không tách rõ kiến thức khai báo như vật thể/quan hệ không gian với kiến thức quy trình như chuyển động/chuỗi mục tiêu.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Thay một bảng điểm bằng nhiều loại chuyển giao kiến thức. Thay đổi trọng tâm là: Thay một bảng điểm bằng nhiều loại chuyển giao kiến thức. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Phân tách object, spatial, goal và long-horizon để biết policy đang chuyển giao kiểu gì.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Học liên tục (lifelong/continual learning) khác học đa nhiệm (multi-task learning): nhiệm vụ **đến tuần tự**, mô hình được cập nhật sau mỗi nhiệm vụ và có thể quên nhiệm vụ đã học. Benchmark phải tách hai câu hỏi: chuyển kiến thức sang nhiệm vụ mới có nhanh hơn không, và sau khi học nhiệm vụ mới mô hình có còn làm được nhiệm vụ cũ không.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Benchmark phải tách hai câu hỏi: chuyển kiến thức sang nhiệm vụ mới có nhanh hơn không, và sau khi học nhiệm vụ mới mô hình có còn làm được nhiệm vụ cũ không.

**Khái niệm thành cấu trúc tính toán.** Continual learning: Học lần lượt và giữ lại kỹ năng trước.. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Benchmark phải tách hai câu hỏi: chuyển kiến thức sang nhiệm vụ mới có nhanh hơn không, và sau khi học nhiệm vụ mới mô hình có còn làm được nhiệm vụ cũ không. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

LIBERO có **130 nhiệm vụ** và tạo nhiệm vụ theo quy tắc. Các suite chính gồm **LIBERO-Spatial**, **LIBERO-Object**, **LIBERO-Goal** và **LIBERO-100**; phần long-horizon dùng một split riêng từ LIBERO-100. Mỗi nhiệm vụ có khoảng **50 demonstration chất lượng cao do con người điều khiển từ xa**. Điều kiện hoàn thành nhiệm vụ được được mô tả chính thức bằng predicates kiểu `Open`, `TurnOff`, `On`, `In`.

Bài báo gốc đánh giá các thuật toán học liên tục như sequential fine-tuning, replay, EWC và PackNet. Các chỉ số không chỉ đo tỷ lệ hoàn thành nhiệm vụ mà còn **Forward Transfer (FWT)**, **Negative Backward Transfer (NBT)** và AUC để đo diễn biến học tập qua chuỗi nhiệm vụ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/libero/figure-2.webp)

*Hình 2, trang 4. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2306.03310#page=4).*

### Đào sâu: Thay một bảng điểm bằng nhiều loại chuyển giao kiến thức

**Luận điểm.** Phân tách object, spatial, goal và long-horizon để biết policy đang chuyển giao kiểu gì. LIBERO có 130 nhiệm vụ và tạo nhiệm vụ theo quy tắc. Các suite chính gồm LIBERO-Spatial, LIBERO-Object, LIBERO-Goal và LIBERO-100; phần long-horizon dùng một split riêng từ LIBERO-100.

**Giải thích không dùng tên model.** Phân tách object, spatial, goal và long-horizon để biết policy đang chuyển giao kiểu gì. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Benchmark kiểm tra robot có giữ được kỹ năng và chuyển giao giữa các nhiệm vụ liên tiếp hay không.. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Benchmark kiểm tra robot có giữ được kỹ năng và chuyển giao giữa các nhiệm vụ liên tiếp hay không. Điều kiện hoàn thành nhiệm vụ được được mô tả chính thức bằng predicates kiểu Open, TurnOff, On, In.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Task suite + demos → Huấn luyện theo thứ tự → Rollout từng task → Transfer + forgetting metrics. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Điều kiện hoàn thành nhiệm vụ được được mô tả chính thức bằng predicates kiểu Open, TurnOff, On, In. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Nhiệm vụ mô phỏng có chỉ dẫn và success predicate rõ. Bài báo gốc đánh giá các thuật toán học liên tục như sequential fine-tuning, replay, EWC và PackNet.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Nhiều family task đánh giá các năng lực khác nhau.. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Bài báo gốc đánh giá các thuật toán học liên tục như sequential fine-tuning, replay, EWC và PackNet. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** BC-RNN/Transformer và các continual-learning baselines. Các chỉ số không chỉ đo tỷ lệ hoàn thành nhiệm vụ mà còn Forward Transfer (FWT), Negative Backward Transfer (NBT) và AUC để đo diễn biến học tập qua chuỗi nhiệm vụ.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Thay task sequence và mức dữ liệu để đo ảnh hưởng.. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Các chỉ số không chỉ đo tỷ lệ hoàn thành nhiệm vụ mà còn Forward Transfer (FWT), Negative Backward Transfer (NBT) và AUC để đo diễn biến học tập qua chuỗi nhiệm vụ. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** So cách học theo chuỗi với cách giữ dữ liệu cũ (replay). Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Forgetting âm khi success của task cũ giảm sau quá trình học. Chỉ số này là minh họa hướng đánh giá. Các suite chính gồm LIBERO-Spatial, LIBERO-Object, LIBERO-Goal và LIBERO-100; phần long-horizon dùng một split riêng từ LIBERO-100.

$$
F=\frac{1}{N-1}\sum_{i=1}^{N-1}\Big(S_i^{\mathrm{after}}-S_i^{\mathrm{before}}\Big)
$$

**Công thức đang mô tả thứ gì?** Forgetting âm khi success của task cũ giảm sau quá trình học. Chỉ số này là minh họa hướng đánh giá. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Các suite chính gồm LIBERO-Spatial, LIBERO-Object, LIBERO-Goal và LIBERO-100; phần long-horizon dùng một split riêng từ LIBERO-100. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Không diễn giải chỉ số tổng hợp thành safety hay khả năng robot thật.. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Huấn luyện một policy lần lượt trên mở ngăn kéo, nhặt mug, đặt mug vào bát. Sau mỗi nhiệm vụ, chạy đánh giá trên tất cả nhiệm vụ trước. Nếu nhiệm vụ mới được 90% nhưng nhiệm vụ cũ tụt về 10%, mô hình đang **catastrophically forgetting**. LIBERO cung cấp nhóm nhiệm vụ và thước đo chuyển giao/retention, nhưng thành tích benchmark không tự chứng minh robot generalist ngoài đời.

Khi chạy env, thành công phải đến từ **closed-loop rollout và điều kiện hoàn thành trong simulator**, không phải loss khi huấn luyện.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Đưa image/state và task instruction vào policy. Khi chạy env, thành công phải đến từ closed-loop rollout và điều kiện hoàn thành trong simulator, không phải loss khi huấn luyện.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Policy thực thi theo simulator physics.. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Khi chạy env, thành công phải đến từ closed-loop rollout và điều kiện hoàn thành trong simulator, không phải loss khi huấn luyện. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Tổng hợp tỷ lệ thành công trước và sau khi học thêm task. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Một kết quả khá trái trực giác là **naive sequential fine-tuning có FWT tốt**, tức biểu diễn học từ nhiệm vụ trước đôi khi giúp nhiệm vụ sau, dù nó quên nhiệm vụ cũ. PackNet bảo vệ retention khá tốt nhưng đổi lại dung lượng biểu diễn của mô hình bị chia nhỏ. Experience Replay là lựa chọn tương đối ổn định, còn EWC không nổi bật trong thiết lập này. Bài báo cũng thử BERT/CLIP/GPT-style embedding của nhiệm vụ và thấy **không có khác biệt lớn so với TaskID** trong nhiều thiết lập.

Một kết quả đáng nhớ khác: pretraining có giám sát trên LIBERO-90 **không tự động giúp** downstream lifelong learning trên 10 nhiệm vụ long-horizon, thậm chí có thể gây negative chuyển giao. Điều đó cảnh báo rất sớm rằng “pretrain nhiều hơn” không đủ; phân phối/mục tiêu huấn luyện phải đúng.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** LIBERO tổ chức benchmark theo loại tri thức cần chuyển giao. Một kết quả đáng nhớ khác: pretraining có giám sát trên LIBERO-90 không tự động giúp downstream lifelong learning trên 10 nhiệm vụ long-horizon, thậm chí có thể gây negative chuyển giao.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Các phương pháp continual learning cho trade-off khác nhau giữa transfer và forgetting.. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Một kết quả đáng nhớ khác: pretraining có giám sát trên LIBERO-90 không tự động giúp downstream lifelong learning trên 10 nhiệm vụ long-horizon, thậm chí có thể gây negative chuyển giao. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Mục tiêu là tạo thước đo lặp lại được thay vì phô một success rate.. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** So cách học theo chuỗi với cách giữ dữ liệu cũ (replay). Điều đó cảnh báo rất sớm rằng “pretrain nhiều hơn” không đủ; phân phối/mục tiêu huấn luyện phải đúng.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: So loss huấn luyện với rollout success để thấy lỗi compounding.. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Điều đó cảnh báo rất sớm rằng “pretrain nhiều hơn” không đủ; phân phối/mục tiêu huấn luyện phải đúng. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Điều đó cảnh báo rất sớm rằng “pretrain nhiều hơn” không đủ; phân phối/mục tiêu huấn luyện phải đúng.. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** đây là mô phỏng benchmark với phạm vi vật thể/nhiệm vụ và mô phỏng vật lý có giới hạn; tác giả coi benchmark là nền để cộng đồng tiếp tục mở rộng kiến trúc, thuật toán và pretraining.

**Phê bình thêm:** đến 2026, LIBERO đã gần **bão hòa** với các VLA hàng đầu, nhiều mô hình nằm vùng 95-99% tỷ lệ thành công trung bình. Vì thế nó vẫn rất hữu ích như regression/unit test nhưng khó phân biệt hiệu năng của các VLA hàng đầu. Cộng đồng còn thường chỉ báo cáo một tỷ lệ thành công trung bình duy nhất và bỏ qua mục tiêu lifelong ban đầu của benchmark, tức biến LIBERO thành thứ nó không được thiết kế để làm. Bối cảnh tĩnh, tabletop và mục tiêu predicates sạch cũng không test môi trường luôn thay đổi, mobile manipulation, bất định khi tiếp xúc vật thể, phục hồi hay nhận thức trong điều kiện thực tế. Một mô hình 98% LIBERO vẫn có thể kém hiệu quả ngoài nhà bếp thật, chuyện này con người đáng lẽ không cần benchmark để nhắc nhưng lịch sử vẫn cho thấy là cần.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Bài báo thừa nhận: đây là mô phỏng benchmark với phạm vi vật thể/nhiệm vụ và mô phỏng vật lý có giới hạn; tác giả coi benchmark là nền để cộng đồng tiếp tục mở rộng kiến trúc, thuật toán và pretraining.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: benchmark vẫn là simulator, chủ yếu tabletop manipulation.. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Bài báo thừa nhận: đây là mô phỏng benchmark với phạm vi vật thể/nhiệm vụ và mô phỏng vật lý có giới hạn; tác giả coi benchmark là nền để cộng đồng tiếp tục mở rộng kiến trúc, thuật toán và pretraining. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: success predicate và vật lý mô phỏng không bảo đảm chuyển giao sang robot ngoài đời.. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [OpenVLA](/paper/openvla)
- [RoboCasa](/paper/robocasa)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm OpenVLA, RoboCasa. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: RoboCasa mở rộng đánh giá qua nhiều nội thất/nhiệm vụ.. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: OpenVLA và π0.5 được đánh giá trên các bộ nhiệm vụ kiểu LIBERO.. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm OpenVLA, RoboCasa. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chạy một nhiệm vụ BC-RNN trong repo LIBERO chính thức trên T4, rồi thử 10 vs 50 demos. Sau đó chạy hai nhiệm vụ theo thứ tự để kiểm tra hiện tượng quên; báo cáo tỷ lệ thành công với nhiều random seed.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Đánh giá policy phải xác định loại generalization đang đo. Sau đó chạy hai nhiệm vụ theo thứ tự để kiểm tra hiện tượng quên; báo cáo tỷ lệ thành công với nhiều random seed.

**Chọn điều cần mang sang dự án thật.** Giữ task splits công khai và chạy rollout để so sánh.. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Đánh giá policy phải xác định loại generalization đang đo.

**Tái hiện tối thiểu.** Sau đó chạy hai nhiệm vụ theo thứ tự để kiểm tra hiện tượng quên; báo cáo tỷ lệ thành công với nhiều random seed. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. LIBERO được xây để kiểm tra chính xác các dạng chuyển giao đó trong môi trường thao tác robot có kiểm soát. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Học nhiệm vụ mới có thể làm policy quên nhiệm vụ cũ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Học nhiệm vụ mới có thể làm policy quên nhiệm vụ cũ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Lifelong learning không chỉ hỏi “nhiệm vụ mới làm được bao nhiêu %”, mà còn hỏi hai câu khó hơn: học nhiệm vụ cũ có giúp học nhiệm vụ mới nhanh hơn không, và học nhiệm vụ mới có làm quên nhiệm vụ cũ không. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

<!-- END EXTENDED WALKTHROUGH -->
