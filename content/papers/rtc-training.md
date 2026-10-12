> **Bài do bạn cung cấp.** [Training-Time Action Conditioning for Efficient Real-Time Chunking](https://arxiv.org/abs/2512.05964), Vật lý Intelligence. Bài báo ngắn nhưng tinh tế: nó **thay đổi dữ liệu/mục tiêu huấn luyện lúc huấn luyện** để giảm overhead runtime của inference-time RTC. Nên đọc ngay sau [RTC đầu tiên](/paper/rtc-inference).

## Vì sao cần nghiên cứu này?

RTC inference-time chạy được với existing flow action policy, nhưng để ép chunk mới khớp prefix đã commit, sampler phải thêm guided inpainting. Những bước gradient/vector-Jacobian product khiến mô hình vốn sinh ra để che độ trễ lại **mất thêm độ trễ**. Nó đặc biệt bất lợi khi inference delay lớn vì committed prefix dài hơn. Tác giả hỏi: nếu policy đã được huấn luyện để biết rằng một đoạn quỹ đạo có thể được cho trước, liệu có thể loại bỏ guidance ở runtime không?

Đây là biến thể của một nguyên lý ML rộng hơn: **biến deployment constraint thành phân phối dữ liệu huấn luyện**, thay vì sửa đầu ra bằng heuristic sau khi huấn luyện xong. Robot không điều khiển trong thế giới đồng bộ lý tưởng; độ trễ thay đổi giữa các lần inference, vì compute, mạng và serving queue.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rtc-training/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 cho thấy hai action chunk chồng lên nhau và đoạn d action đầu tiên của chunk mới bị ràng buộc bởi các lệnh từ chunk trước đã phát ra. Trong một hệ thực tế, đây không phải optional smoothing: actuator không thể hoàn tác một chuyển động đã xảy ra trong lúc GPU còn tính toán. Training-time RTC muốn dạy model coi phần prefix ấy là điều kiện thay vì để inference tự tối ưu tốn kém mỗi lần nhận chunk mới.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Dạy model ngay lúc training cách tiếp nối committed prefix để inference không cần guidance đắt đỏ. Nó đặc biệt bất lợi khi inference delay lớn vì committed prefix dài hơn. Tác giả hỏi: nếu policy đã được huấn luyện để biết rằng một đoạn quỹ đạo có thể được cho trước, liệu có thể loại bỏ guidance ở runtime không?

**Vấn đề khoa học nằm ở đâu?** Guided inpainting có vector–Jacobian/backprop overhead dù robot chỉ cần một policy prediction. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Condition policy theo prefix ngay từ huấn luyện là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Randomize độ dài prefix k; khóa phần đã committed, flow loss chỉ học suffix còn lại. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: RTC inference-time trả thêm compute ở mọi chunk

**Luận điểm.** Guided inpainting có vector–Jacobian/backprop overhead dù robot chỉ cần một policy prediction. RTC inference-time chạy được với existing flow action policy, nhưng để ép chunk mới khớp prefix đã commit, sampler phải thêm guided inpainting.

**Tại sao lỗi này có hệ quả lớn?** Model flow thông thường không biết action prefix đã cam kết. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân rtc inference-time trả thêm compute ở mọi chunk vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Model flow thông thường không biết action prefix đã cam kết

**Luận điểm.** Runtime phải ép mẫu sinh khớp chunk cũ; rút ngắn latency bằng hack serving có giới hạn. Đây là biến thể của một nguyên lý ML rộng hơn: biến deployment constraint thành phân phối dữ liệu huấn luyện, thay vì sửa đầu ra bằng heuristic sau khi huấn luyện xong.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Runtime phải ép mẫu sinh khớp chunk cũ; rút ngắn latency bằng hack serving có giới hạn.. Thay đổi trọng tâm là: Condition policy theo prefix ngay từ huấn luyện. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Randomize độ dài prefix k; khóa phần đã committed, flow loss chỉ học suffix còn lại.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

Gọi `A = [a_1,...,a_H]` là action chunk. `k` là số bước đầu đã/đang được robot thực thi bằng chunk cũ. Việc sinh chunk mới thực chất là học phân phối điều kiện:

```text
p(a_{k+1:H} | observation, a_{1:k}, k)
```

Chú ý: **không phải flow từ action a_k đi tới action a_H** như đang nội suy quỹ đạo vật lý. Mô hình flow vẫn map **noise → phân phối dữ liệu sạch action**, nhưng chỉ đối với phần postfix chưa biết; prefix đã có giá trị. Đây chính là conceptual distinction quan trọng nhất.

Trong convention của bài báo, flow time `τ=0` là noise và `τ=1` là clean action. `τ` là noise/flow coordinate, không phải bộ điều khiển time `t`. Một timestep bộ điều khiển là 20 ms ở 50 Hz, nhưng flow sampler có thể có 5 Euler integration steps chỉ trong một mạng call.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Mô hình flow vẫn map noise → phân phối dữ liệu sạch action, nhưng chỉ đối với phần postfix chưa biết; prefix đã có giá trị.

**Khái niệm thành cấu trúc tính toán.** Prefix length k: Số action cũ mà robot sẽ thực thi trước khi output tới. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Mô hình flow vẫn map noise → phân phối dữ liệu sạch action, nhưng chỉ đối với phần postfix chưa biết; prefix đã có giá trị. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

### 1. Randomize prefix length trong huấn luyện

Với mỗi huấn luyện example gồm quan sát và demo action chunk ground-truth, mẫu một delay `k` từ phân phối đã định. Chẳng hạn cho robot 50 Hz:

```text
k = 0: [ noise noise noise noise noise noise ]
k = 2: [ a1 a2 | noise noise noise noise ]
k = 4: [ a1 a2 a3 a4 | noise noise ]
```

Trong thí nghiệm trên robot thật, tác giả huấn luyện với delay phân bố đều từ **0 đến 10 bước điều khiển**, bao phủ khoảng độ trễ dự kiến đến **200 ms** ở 50 Hz. Điều này cho policy nhìn thấy nhiều độ dài prefix. Nó không học một giá trị cố định `k=5`, mà học **một bộ sinh có điều kiện dùng chung cho nhiều k**.

### 2. Per-token flow time

Trong flow matching bình thường, tất cả action tokens cùng có flow timestamp `τ`. Bài báo đổi thành **prefix tokens có `τ_i=1`**, còn postfix tokens dùng random sampled `τ`. Vì `τ=1` tương đương dữ liệu sạch, prefix đưa vào mạng nguyên bản, không nhiễu. Trong mỗi flow lấy mẫu vòng lặp inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác.

```text
input:  observation + task instruction + robot state
        clean prefix a1...ak
        noisy postfix a{k+1}...aH
        per-position flow times

network: velocity field on postfix
loss:    only postfix positions
```

Tức loss có masking: tác giả **không phạt mạng vì không reconstruct một prefix vốn đã được cung cấp sẵn**. Learning signal tập trung vào quỹ đạo phải sinh mới. Dữ liệu và ground-truth chunks vẫn đến từ robot demos; không cần tập dữ liệu mới ghi nhãn “RTC”.

### 3. Inference runtime gần như không đổi

Runtime vẫn đo/estimate inference delay bằng recent độ trễ history (để chọn `k`) và vẫn asynchronously sinh chunk mới trong lúc chạy chunk cũ. Khác ở chỗ nó đưa clean committed prefix vào mạng rồi sinh postfix conditional bằng forward passes, **không cần vector-Jacobian guidance**. Bài báo nói rõ không yêu cầu thay đổi kiến trúc mô hình hay robot runtime; quy trình huấn luyện và cách điều kiện lấy mẫu thay đổi.

### 4. Quan hệ giữa `k_est` và `k_real`

Đây là chi tiết cần hiểu nếu định tự implement.

- `k_est > k_real`: mô hình bị buộc giữ lâu hơn cần thiết, thường giảm reactivity nhưng continuity tương đối dễ giữ.
- `k_est < k_real`: robot đã thực thi thêm action chưa được điều kiện vào prefix của chunk mới. New postfix có thể đã đi từ một history sai; boundary lại có nguy cơ discontinuity.
- `k_real > maximum trained k`: policy đang extrapolate prefix length. Không có guarantee khả năng khái quát ngoài simulated độ trễ range.

Do đó huấn luyện randomize `k` không thay thế độ trễ estimator/runtime scheduling. Nó chỉ giúp mạng **biết cách xử lý nhiều loại prefix** mà estimator đưa ra.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/rtc-training/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 trình bày chỗ conditioning được gắn vào action expert dạng diffusion Transformer: những action đã cam kết được mã hoá/mask và đưa vào mô hình để sinh phần postfix tương thích. Điều này khác hard-overwrite output ở cuối: model phải nhìn prefix trong quá trình học để tạo quỹ đạo còn lại hợp lý. Vì prefix đã thuộc runtime, cần sampling nhiều độ dài chờ và nhiều trạng thái nối trong training, tránh để mô hình chỉ thành thạo một trường hợp latency cố định.

#### Ví dụ từng bước để hiểu cơ chế

Tưởng tượng action chunk dài 32 và inference mới đến muộn 6 tick. Sáu lệnh đầu không thể sửa; cách naive cắt ghép có thể tạo cú nhảy giữa lệnh thứ 6 và thứ 7. Trong training, lấy demonstration chunk, đánh dấu một prefix dài d, đưa prefix vào condition cùng ảnh/state rồi yêu cầu model dự đoán phần còn lại sao cho khớp cả task và trạng thái cam kết. Đánh giá d=0,4,8,12, xem success, jerk ở boundary và inference latency. Nếu model chỉ tốt d=0, nó chưa học được mục tiêu của training-time RTC.

### Đào sâu: Condition policy theo prefix ngay từ huấn luyện

**Luận điểm.** Randomize độ dài prefix k; khóa phần đã committed, flow loss chỉ học suffix còn lại. Do đó huấn luyện randomize k không thay thế độ trễ estimator/runtime scheduling. Nó chỉ giúp mạng biết cách xử lý nhiều loại prefix mà estimator đưa ra.

**Giải thích không dùng tên model.** Randomize độ dài prefix k; khóa phần đã committed, flow loss chỉ học suffix còn lại. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Dạy model ngay lúc training cách tiếp nối committed prefix để inference không cần guidance đắt đỏ. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Dạy model ngay lúc training cách tiếp nối committed prefix để inference không cần guidance đắt đỏ. Vì τ=1 tương đương dữ liệu sạch, prefix đưa vào mạng nguyên bản, không nhiễu. Trong mỗi flow lấy mẫu vòng lặp inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Demo chunk + sampled k → Giữ prefix sạch → Noise + train suffix flow → Inference completion trực tiếp. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Vì τ=1 tương đương dữ liệu sạch, prefix đưa vào mạng nguyên bản, không nhiễu. Trong mỗi flow lấy mẫu vòng lặp inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Tensor chunk có mask chia committed vs future positions. k_est > k_real: mô hình bị buộc giữ lâu hơn cần thiết, thường giảm reactivity nhưng continuity tương đối dễ giữ. k_est < k_real: robot đã thực thi thêm action chưa được điều kiện vào prefix của chunk mới.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Prefix trong train lấy từ ground-truth demonstration. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. k_est > k_real: mô hình bị buộc giữ lâu hơn cần thiết, thường giảm reactivity nhưng continuity tương đối dễ giữ. k_est < k_real: robot đã thực thi thêm action chưa được điều kiện vào prefix của chunk mới. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Mẫu ngẫu nhiên k theo delay distribution. Trong thí nghiệm trên robot thật, tác giả huấn luyện với delay phân bố đều từ 0 đến 10 bước điều khiển, bao phủ khoảng độ trễ dự kiến đến 200 ms ở 50 Hz.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Trong real robot experiment, k được train trong khoảng 0–10 steps (0–200 ms ở 50 Hz). Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Trong thí nghiệm trên robot thật, tác giả huấn luyện với delay phân bố đều từ 0 đến 10 bước điều khiển, bao phủ khoảng độ trễ dự kiến đến 200 ms ở 50 Hz. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Train k cố định vs sampled trên dải delay. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Chỉ tối ưu các action tương lai i>k; prefix a₁:k là phần không được sửa. Trong mỗi flow lấy mẫu vòng lặp inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác.

$$
\mathcal L\propto\sum_{i>k}\|v_\theta(x_i,\,a_{1:k})-v_i^\star\|^2
$$

**Công thức đang mô tả thứ gì?** Chỉ tối ưu các action tương lai i>k; prefix a₁:k là phần không được sửa. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Trong mỗi flow lấy mẫu vòng lặp inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Đây là intuition của masked flow loss; xem bài gốc để biết chính xác parametrization. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 3 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-3.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Ví dụ từng bước

Robot đang dựng một hộp carton. Observation tại thời điểm `t` cho thấy tay đang ép một mép hộp; chunk cũ còn 8 actions chưa thực thi. Network server estimate sẽ mất khoảng 100 ms, tức `k=5` ở 50 Hz. Robot sẽ thực thi 5 actions của chunk cũ trong lúc mạng sinh chunk mới. Inference đầu vào nhận `a_1...a_5` sạch. Mô hình chỉ phải sinh `a_6...a_H` sao cho điều kiện trên quan sát và prefix; khi kết quả tới, robot tiếp tục quỹ đạo hợp lý mà không hard switch sang một mode khác.

Trong huấn luyện, mô hình đã thấy các mẫu với k=0,1,2,...10 (không chỉ 5), nên forward call với `k=5` không phải trường hợp đặc biệt. Nếu độ trễ hôm sau lên `k=7`, policy vẫn làm được trong phân phối đã huấn luyện. Đây là **domain randomization trên inference delay**, tương tự sim-to-real randomize mass/friction, nhưng uncertainty nằm trong hệ thống computing.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Servo tiếp tục chạy buffer cũ trong khi model sinh suffix phù hợp committed prefix. Inference đầu vào nhận a_1...a_5 sạch. Mô hình chỉ phải sinh a_6...a_H sao cho điều kiện trên quan sát và prefix; khi kết quả tới, robot tiếp tục quỹ đạo hợp lý mà không hard switch sang một mode khác.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Model nhận prefix và observation, sinh suffix phù hợp ngay trong forward sampling. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Inference đầu vào nhận a_1...a_5 sạch. Mô hình chỉ phải sinh a_6...a_H sao cho điều kiện trên quan sát và prefix; khi kết quả tới, robot tiếp tục quỹ đạo hợp lý mà không hard switch sang một mode khác. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Không cần gradient-based guidance ở runtime như RTC inference-time. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

**Simulation:** Tác giả dùng 12 nhiệm vụ động trong Kinetix từ RTC trước. So inference-time RTC với training-time RTC theo delay. Kết quả báo cáo cho thấy training-time method có lợi thế rõ khi delay tăng (`d≥2` trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng phương pháp đối chứng. Đây không phải một chiến thắng tuyệt đối trên mọi k.

**Robot thật:** Fine-tune từ **π0.6** cho box building và espresso making, so synchronous, inference-time RTC và training-time RTC. Bài báo báo training-time approach giữ thành công/duration gần với inference-time RTC, nhưng độ trễ end-to-end khoảng **108 ms** so với **135 ms** trong thiết lập được đo. Chênh lệch 27 ms lớn hơn một bộ điều khiển step 20 ms. Tuy vậy, không nên suy từ hai số đo đó rằng mọi GPU/robot đều tiết kiệm đúng 27 ms.

**Điểm quan trọng:** đây là trade-off giữa một ít huấn luyện adaptation và việc tránh compute gradient tại runtime. Nếu ứng dụng lặp inference hàng triệu lần, chi phí huấn luyện thêm có thể dễ chấp nhận hơn chi phí trả thêm trong mọi action chunk.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Simulation Kinetix: tốt hơn rõ trong nhiều thiết lập delay cao, không thắng mọi k. Simulation: Tác giả dùng 12 nhiệm vụ động trong Kinetix từ RTC trước. So inference-time RTC với training-time RTC theo delay.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Real robot box building/espresso với π0.6: latency khoảng 108 ms so 135 ms RTC inference-time. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Simulation: Tác giả dùng 12 nhiệm vụ động trong Kinetix từ RTC trước. So inference-time RTC với training-time RTC theo delay. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Chênh 27 ms đáng kể với servo 50 Hz (chu kỳ 20 ms). Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Train k cố định vs sampled trên dải delay. So inference-time RTC với training-time RTC theo delay. Kết quả báo cáo cho thấy training-time method có lợi thế rõ khi delay tăng (d≥2 trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng phương pháp đối chứng.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: So outcome và runtime overhead, không chỉ flow validation loss. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. So inference-time RTC với training-time RTC theo delay. Kết quả báo cáo cho thấy training-time method có lợi thế rõ khi delay tăng (d≥2 trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng phương pháp đối chứng. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** So inference-time RTC với training-time RTC theo delay. Kết quả báo cáo cho thấy training-time method có lợi thế rõ khi delay tăng (d≥2 trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng phương pháp đối chứng. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 4 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-4.webp)


![Hình 5 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-5.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** Huấn luyện phải chọn delay phân phối tương đối phù hợp môi trường deploy. Nó không tận dụng soft guidance trên toàn phần overlapping future chunk tinh vi như RTC đầu tiên. Khi huấn luyện nhiều delays, tín hiệu giám sát phân bố không đều giữa action positions; tác giả thừa nhận huấn luyện specialist riêng cho từng k có thể cải thiện một số thiết lập.

**Phê bình độc lập:**

- **Capacity interference:** một mô hình chung học conditional across k; với compute hữu hạn, specialist cho fixed độ trễ có thể fit tốt hơn. Nhưng GPU routing nhiều checkpoints cũng gây complexity.
- **Latency OOD:** một policy được huấn luyện `0..10` không có guarantee ở `k=25`, đặc biệt nếu backend stall.
- **Ground-truth prefix mismatch:** trong huấn luyện prefix lấy từ demonstration; trong deploy prefix là actions do policy sinh. Error trong prefix sẽ đưa mô hình vào phân phối khác huấn luyện.
- **Action commitment phụ thuộc robot thực:** sensor-feedback và servo bộ điều khiển có thể khác lệnh đã gửi; committed action command không đảm bảo actuator thực hiện chính xác do contact/saturation.
- **Fine-tuning costs:** một mô hình đã dùng cho nhiều nhiệm vụ có thể cần additional dữ liệu/method integration để duy trì điều kiện k mà không quên action quality ban đầu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Error trong prefix sẽ đưa mô hình vào phân phối khác huấn luyện. Action commitment phụ thuộc robot thực: sensor-feedback và servo bộ điều khiển có thể khác lệnh đã gửi; committed action command không đảm bảo actuator thực hiện chính xác do contact/saturation.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: delay distribution và prefix conditioning có thể lệch serving thực. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Error trong prefix sẽ đưa mô hình vào phân phối khác huấn luyện. Action commitment phụ thuộc robot thực: sensor-feedback và servo bộ điều khiển có thể khác lệnh đã gửi; committed action command không đảm bảo actuator thực hiện chính xác do contact/saturation. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: output policy cũ có sai số; committed command khác actual actuator state khi contact. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [RTC inference-time](/paper/rtc-inference) là phương pháp đối chứng trực tiếp và nơi giải thích guided inpainting.
- [ACT](/paper/act) giúp hiểu temporal aggregation và chunk boundary.
- [Diffusion Policy](/paper/diffusion-policy) giải thích flow/diffusion conditional quỹ đạo lấy mẫu.
- [π0.5](/paper/pi-0-5) là representative modern flow-based VLA stack; bài báo training-time này đánh giá trực tiếp π0.6.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RTC inference-time, ACT, Diffusion Policy, π0.5. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: RTC inference-time dùng sampler guidance để giữ prefix. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: Diffusion Policy và π0.5 đặt nền generative action chunks. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RTC inference-time, ACT, Diffusion Policy, π0.5. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Bắt đầu bằng một toy mô hình có điều kiện flow trên vector `A ∈ R^{20 × 3}`. Mỗi huấn luyện batch mẫu `k∼Uniform(0,6)`, set prefix `τ=1` và postfix `τ∈[0,1]`; mask flow loss trên suffix. **Ablation quan trọng:** huấn luyện (A) k fixed 3, (B) k random 0..6, (C) k random nhưng oversample k=3. Đánh giá MSE/thành công theo từng k, không chỉ average. Thêm artificial under-/over-estimated delays ở runtime và đo jerk. Đây là thí nghiệm nhỏ vừa đủ để hiểu bài báo mà không cần H100 hay humanoid.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Chuyển runtime constraint thành training condition có thể giảm serving cost. Đánh giá MSE/thành công theo từng k, không chỉ average. Thêm artificial under-/over-estimated delays ở runtime và đo jerk.

**Chọn điều cần mang sang dự án thật.** Train dải delay phản ánh thực tế hệ thống inference. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Chuyển runtime constraint thành training condition có thể giảm serving cost.

**Tái hiện tối thiểu.** Đánh giá MSE/thành công theo từng k, không chỉ average. Thêm artificial under-/over-estimated delays ở runtime và đo jerk. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Nó đặc biệt bất lợi khi inference delay lớn vì committed prefix dài hơn. Tác giả hỏi: nếu policy đã được huấn luyện để biết rằng một đoạn quỹ đạo có thể được cho trước, liệu có thể loại bỏ guidance ở runtime không? Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### RTC inference-time trả thêm compute ở mọi chunk: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'RTC inference-time trả thêm compute ở mọi chunk', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. RTC inference-time chạy được với existing flow action policy, nhưng để ép chunk mới khớp prefix đã commit, sampler phải thêm guided inpainting. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model flow thông thường không biết action prefix đã cam kết: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model flow thông thường không biết action prefix đã cam kết', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đây là biến thể của một nguyên lý ML rộng hơn: biến deployment constraint thành phân phối dữ liệu huấn luyện, thay vì sửa đầu ra bằng heuristic sau khi huấn luyện xong. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Condition policy theo prefix ngay từ huấn luyện: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Condition policy theo prefix ngay từ huấn luyện', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Do đó huấn luyện randomize k không thay thế độ trễ estimator/runtime scheduling. Nó chỉ giúp mạng biết cách xử lý nhiều loại prefix mà estimator đưa ra. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ba khái niệm để nắm: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ba khái niệm để nắm', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Mô hình flow vẫn map noise → phân phối dữ liệu sạch action, nhưng chỉ đối với phần postfix chưa biết; prefix đã có giá trị. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kiến trúc trong một sơ đồ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kiến trúc trong một sơ đồ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Vì τ=1 tương đương dữ liệu sạch, prefix đưa vào mạng nguyên bản, không nhiễu. Trong mỗi flow lấy mẫu vòng lặp inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mô hình biểu diễn cái gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mô hình biểu diễn cái gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. k_est > k_real: mô hình bị buộc giữ lâu hơn cần thiết, thường giảm reactivity nhưng continuity tương đối dễ giữ. k_est < k_real: robot đã thực thi thêm action chưa được điều kiện vào prefix của chunk mới. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model học như thế nào?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model học như thế nào?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Trong thí nghiệm trên robot thật, tác giả huấn luyện với delay phân bố đều từ 0 đến 10 bước điều khiển, bao phủ khoảng độ trễ dự kiến đến 200 ms ở 50 Hz. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một lần inference xảy ra ra sao?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một lần inference xảy ra ra sao?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Inference đầu vào nhận a_1...a_5 sạch. Mô hình chỉ phải sinh a_6...a_H sao cho điều kiện trên quan sát và prefix; khi kết quả tới, robot tiếp tục quỹ đạo hợp lý mà không hard switch sang một mode khác. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mathematical Intuition: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mathematical Intuition', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Trong mỗi flow lấy mẫu vòng lặp inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kết quả nói lên điều gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kết quả nói lên điều gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Simulation: Tác giả dùng 12 nhiệm vụ động trong Kinetix từ RTC trước. So inference-time RTC với training-time RTC theo delay. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ablation và bằng chứng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ablation và bằng chứng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. So inference-time RTC với training-time RTC theo delay. Kết quả báo cáo cho thấy training-time method có lợi thế rõ khi delay tăng (d≥2 trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng phương pháp đối chứng. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Hạn chế cần nói thẳng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Hạn chế cần nói thẳng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Error trong prefix sẽ đưa mô hình vào phân phối khác huấn luyện. Action commitment phụ thuộc robot thực: sensor-feedback và servo bộ điều khiển có thể khác lệnh đã gửi; committed action command không đảm bảo actuator thực hiện chính xác do contact/saturation. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Bài này đứng ở đâu trong lĩnh vực?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Bài này đứng ở đâu trong lĩnh vực?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đọc thêm RTC inference-time, ACT, Diffusion Policy, π0.5. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Nếu chỉ nhớ ba điều: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Nếu chỉ nhớ ba điều', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đánh giá MSE/thành công theo từng k, không chỉ average. Thêm artificial under-/over-estimated delays ở runtime và đo jerk. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Điểm cốt lõi: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Dạy model ngay lúc training cách tiếp nối committed prefix để inference không cần guidance đắt đỏ. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### RTC inference-time trả thêm compute ở mọi chunk: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Guided inpainting có vector–Jacobian/backprop overhead dù robot chỉ cần một policy prediction. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Model flow thông thường không biết action prefix đã cam kết: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Runtime phải ép mẫu sinh khớp chunk cũ; rút ngắn latency bằng hack serving có giới hạn. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Condition policy theo prefix ngay từ huấn luyện: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Randomize độ dài prefix k; khóa phần đã committed, flow loss chỉ học suffix còn lại. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ba khái niệm để nắm: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Hiểu ba khái niệm này trước khi đọc thuật toán. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kiến trúc trong một sơ đồ: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Dạy model ngay lúc training cách tiếp nối committed prefix để inference không cần guidance đắt đỏ. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mô hình biểu diễn cái gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Tensor chunk có mask chia committed vs future positions. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Model học như thế nào?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Mẫu ngẫu nhiên k theo delay distribution. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Một lần inference xảy ra ra sao?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Servo tiếp tục chạy buffer cũ trong khi model sinh suffix phù hợp committed prefix. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mathematical Intuition: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Chỉ tối ưu các action tương lai i>k; prefix a₁:k là phần không được sửa. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kết quả nói lên điều gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Simulation Kinetix: tốt hơn rõ trong nhiều thiết lập delay cao, không thắng mọi k. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

<!-- END EXTENDED WALKTHROUGH -->

