> **Bài do bạn cung cấp.** [Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339), NeurIPS 2025. Đây là bài báo về **runtime của policy**, không phải một backbone pretraining mới. Đọc cùng **Figure 2–3**, **Section 3**, **Section 4** và **Appendix A**.

## Vì sao cần nghiên cứu này?

### Mô hình nghĩ 100 ms, robot cần action mỗi 20 ms

Một VLA có thể dự đoán action rất tốt nhưng vẫn điều khiển robot tệ vì quá chậm. Ví dụ bộ điều khiển chạy 50 Hz, cứ 20 ms cần action mới. Trong khi đó, mạng gồm VLM và flow action expert có thể mất 80–300 ms cho một forward/lấy mẫu. Một chatbot có thể chờ, nhưng robot đang giữ vật, cân bằng hay đẩy một vật ma sát **không có nút pause cho GPU**.

**Action chunking** giải được một nửa: thay vì dự đoán `a_t` rồi query mô hình ở timestep tiếp theo, policy trả về `A_t = (a_t,...,a_{t+H-1})`. Robot có thể liên tục thực thi các action đã có trong buffer. Nhưng có hai kiểu scheduling đều có vấn đề:

1. **Synchronous:** thực thi hết phần được chọn của chunk A rồi chờ mô hình sinh B. Robot pause, momentum mất, trạng thái vật thể tiếp tục thay đổi.
2. **Naive asynchronous:** mô hình sinh B trong lúc robot đang chạy A. Không pause, nhưng B có thể chọn một strategy khác A ngay tại chunk boundary, gây discontinuity, acceleration spike hoặc jerk.

Ví dụ tránh chướng ngại: chunk cũ đi vòng **phía trên**, chunk mới đi vòng **phía dưới**. Cả hai quỹ đạo riêng lẻ có thể đúng. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Averaging hai quỹ đạo cũng không chắc hữu ích: trung bình giữa “trái” và “phải” có thể là “đi thẳng vào vật cản”.

Vì vậy vấn đề bài báo thật sự giải không phải chỉ **độ trễ**, mà là **online replanning với các action đã commit trong thế giới vật lý**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rtc-inference/figure-1.webp)

*Hình 1, trang 1. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2506.07339#page=1).*

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Không để robot dừng mỗi khi model nghĩ: action chunk mới phải khớp phần chuyển động đã cam kết. Synchronous: thực thi hết phần được chọn của chunk A rồi chờ mô hình sinh B. Robot pause, momentum mất, trạng thái vật thể tiếp tục thay đổi.

**Vấn đề khoa học nằm ở đâu?** Robot cần action mỗi 20 ms, trong khi VLA có thể mất 76–100 ms để sinh một chunk. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Giữ committed prefix, chỉ sinh lại tương lai là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Trong khi inference diễn ra, robot vẫn chạy buffer cũ; chunk mới bị constraint khớp phần chắc chắn đã/đang thực thi. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Policy inference chậm hơn nhịp điều khiển 50 Hz

**Luận điểm.** Robot cần action mỗi 20 ms, trong khi VLA có thể mất 76–100 ms để sinh một chunk. Naive asynchronous: mô hình sinh B trong lúc robot đang chạy A. Không pause, nhưng B có thể chọn một strategy khác A ngay tại chunk boundary, gây discontinuity, acceleration spike hoặc jerk.

**Tại sao lỗi này có hệ quả lớn?** Synchronous gây pause; naive asynchronous gây giật ở ranh giới. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân policy inference chậm hơn nhịp điều khiển 50 hz vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Synchronous gây pause; naive asynchronous gây giật ở ranh giới

**Luận điểm.** Temporal averaging còn có thể trộn hai quỹ đạo hợp lệ thành chuyển động không hợp lệ. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Averaging hai quỹ đạo cũng không chắc hữu ích: trung bình giữa “trái” và “phải” có thể là “đi thẳng vào vật cản”.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Temporal averaging còn có thể trộn hai quỹ đạo hợp lệ thành chuyển động không hợp lệ.. Thay đổi trọng tâm là: Giữ committed prefix, chỉ sinh lại tương lai. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Trong khi inference diễn ra, robot vẫn chạy buffer cũ; chunk mới bị constraint khớp phần chắc chắn đã/đang thực thi.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

Action chunk là tensor `H × D`. `H` là dự đoán horizon, `D` là số action dimensions. `s` thường biểu diễn thực thi horizon: số action robot dùng từ chunk trước khi xin chunk mới. Controller timestep `Δt` là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi sinh.

**Flow matching** xây một map từ noise sang action quỹ đạo bằng velocity field learned từ demonstrations. Trong lấy mẫu, quỹ đạo thay đổi qua nhiều **flow-time** `τ`, không đồng nhất với thời gian vật lý `t`. Cơ chế sửa mẫu trong quá trình denoise cho phép **inpainting**: giữ cố định vùng đã biết và sinh phần còn lại phù hợp. RTC tận dụng đúng tính chất này.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Controller timestep Δt là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi sinh.

**Khái niệm thành cấu trúc tính toán.** Control loop: Servo chạy nhịp cố định, không chờ model. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Controller timestep Δt là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi sinh. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

### 1. Hai loop chạy đồng thời

```text
CONTROL LOOP (50 Hz)                  INFERENCE LOOP
  observe current state                receive observation
  execute next buffered action         estimate latency d
  observe next state                    use committed actions
  execute next buffered action         guided flow sampling
               ...                     publish next chunk
  swap when new chunk ready  <────────────┘
```

Control loop không block để đợi mạng. Trong lúc ấy inference loop xử lý quan sát mới và tạo chunk kế tiếp. Timing budget `d` là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ. Không có phương pháp nào ở đây dự đoán tương lai vật lý chính xác như tiên tri; runtime chỉ quản lý những gì chắc chắn sẽ thực thi trong lúc mô hình tính toán.

### 2. Committed prefix

Giả sử bộ điều khiển đang thực thi chunk cũ:

```text
OLD:   a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 ...
              ↑ inference starts
             └──── d steps of latency ────┐
NEW:           [fixed actions] [future...]
```

Tại thời điểm request, biết một phần của chunk cũ sẽ được thực thi trước khi mô hình xong. Những action đó là **committed prefix**. Chunk mới không được tự ý thay chúng, vì chúng đã hoặc sẽ xảy ra mà không thể undo. Đây là constraint có tính vật lý, không phải heuristic bình thường.

RTC xây một masked action quỹ đạo: prefix được giữ cứng, phần tương lai mới là vùng cần sinh. Khi mô hình flow update mẫu, guidance điều chỉnh mẫu để consistency với committed actions. Mấu chốt: mô hình không được pretrain với conditional prefix, nên RTC phải thêm conditioning tại **thời gian inference** bằng kỹ thuật gần với gradient-based inpainting.

### 3. Soft mask cho phần overlap chưa commit

Chỉ hard-freeze `d` actions đầu chưa đảm bảo action ngay sau prefix nối mượt. Chunk cũ có thể đang đẩy sang phải với vận tốc lớn, nhưng chunk mới muốn bẻ trái ngay sau hành động thứ `d`. Vì vậy RTC tiếp tục sử dụng phần overlap của chunk cũ như **soft reference**.

```text
NEW ACTION HORIZON
| hard-frozen | soft overlap / decaying guidance | free future |
      1.0             0.9 → 0.6 → 0.2             0
```

Các action càng gần hiện tại càng bị ràng buộc mạnh, các action xa tương lai càng được phép đổi vì quan sát mới có thể tiết lộ một tình huống khác. Bài báo thử các decay schedules và sử dụng exponential soft masking; linear khá gần. Đây là sự cân bằng giữa **continuity** và **reactivity**.

### 4. Inpainting trong flow sampler

Nếu action policy dùng flow-based `v_θ`, lấy mẫu cập nhật quỹ đạo từ noise qua các flow-time steps. RTC cần thêm guidance dựa trên khác biệt giữa được dự đoán chunk và reference chunk tại các vị trí có mask. Gradient/Jacobian đưa constraint đó vào vector field lấy mẫu. **Không cần huấn luyện lại mô hình**, nhưng phải trả giá bằng compute ở inference.

Điểm này lý giải tại sao RTC hợp với diffusion/flow action heads mà không drop-in cho autoregressive discrete actions. Khi token đã autoregressively sinh theo thứ tự, không có quỹ đạo tensor liên tục để sửa toàn bộ bằng gradient-guided inpainting theo cùng cách.

### 5. Latency estimate không hoàn hảo

Nếu dự đoán `d_est` dài hơn thực tế, robot giữ continuity nhưng bỏ lỡ cơ hội replan sớm. Nếu `d_est` ngắn hơn, mô hình có thể trả chunk giả định một số action chưa xảy ra, nhưng robot đã thực thi chúng. Runtime cần buffer và conservative estimate để tránh underrun. Đây là giới hạn thực sự của asynchronous control, không có lấy mẫu trick nào xóa được.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rtc-inference/figure-2.webp)

*Hình 2, trang 3. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://arxiv.org/pdf/2506.07339#page=3).*

### Đào sâu: Giữ committed prefix, chỉ sinh lại tương lai

**Luận điểm.** Trong khi inference diễn ra, robot vẫn chạy buffer cũ; chunk mới bị constraint khớp phần chắc chắn đã/đang thực thi. Chỉ hard-freeze d actions đầu chưa đảm bảo action ngay sau prefix nối mượt. Chunk cũ có thể đang đẩy sang phải với vận tốc lớn, nhưng chunk mới muốn bẻ trái ngay sau hành động thứ d.

**Giải thích không dùng tên model.** Trong khi inference diễn ra, robot vẫn chạy buffer cũ; chunk mới bị constraint khớp phần chắc chắn đã/đang thực thi. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Không để robot dừng mỗi khi model nghĩ: action chunk mới phải khớp phần chuyển động đã cam kết. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Không để robot dừng mỗi khi model nghĩ: action chunk mới phải khớp phần chuyển động đã cam kết. Trong lúc ấy inference loop xử lý quan sát mới và tạo chunk kế tiếp. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Đọc camera mới → Robot tiếp tục chunk cũ → Guided flow inpainting → Nối chunk mới liên tục. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Trong lúc ấy inference loop xử lý quan sát mới và tạo chunk kế tiếp. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Chuỗi action H×D, chia thành prefix đã cam kết và suffix có thể sinh lại. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Delay d được quy sang số bước điều khiển. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** RTC inference-time không yêu cầu train lại policy gốc. Nếu action policy dùng flow-based v_θ, lấy mẫu cập nhật quỹ đạo từ noise qua các flow-time steps.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Biết các steps sẽ chạy khi model còn tính toán. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Nếu action policy dùng flow-based v_θ, lấy mẫu cập nhật quỹ đạo từ noise qua các flow-time steps. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** So synchronous, naive async, temporal ensembling và guided prefix. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Inference tốn T_infer; servo có chu kỳ Δt. Trong thời gian đợi, khoảng d action cũ đã phải được thực thi. Mấu chốt: mô hình không được pretrain với conditional prefix, nên RTC phải thêm conditioning tại thời gian inference bằng kỹ thuật gần với gradient-based inpainting.

$$
d\approx\left\lceil\frac{T_{\rm infer}}{\Delta t}\right\rceil
$$

**Công thức đang mô tả thứ gì?** Inference tốn T_infer; servo có chu kỳ Δt. Trong thời gian đợi, khoảng d action cũ đã phải được thực thi. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Mấu chốt: mô hình không được pretrain với conditional prefix, nên RTC phải thêm conditioning tại thời gian inference bằng kỹ thuật gần với gradient-based inpainting. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Đây là phép đổi latency thành số bước điều khiển. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot đang cắm cáp Ethernet vào port. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa thực thi, nên RTC khóa các bước A chắc chắn sẽ xảy ra. Camera mới cho thấy đầu cáp hơi lệch phải: phần future của B nên hiệu chỉnh nhẹ về phải, nhưng không được thay tức thời các bước vừa được robot commit. Soft mask cho phép gradient chỉnh góc tiếp cận dần dần. Kết quả mong muốn: không pause, không snap quỹ đạo, vẫn responsive với quan sát mới.

Ngược lại, nếu mô hình tự do sinh chunk B mà không nhìn overlap, nó có thể chọn tư thế đưa cáp vào từ hướng khác. Đây không phải vì mô hình “sai” ở mỗi chunk; nó sai ở **giao thức nối hai phương án hợp lệ qua thời gian thật**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Hai loop chạy song song: servo và policy inference. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa thực thi, nên RTC khóa các bước A chắc chắn sẽ xảy ra.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Estimate latency d rồi cố định committed actions. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa thực thi, nên RTC khóa các bước A chắc chắn sẽ xảy ra. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Nối suffix được generate thành chunk tiếp theo; controller không phải pause. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

**Simulation:** Tác giả thiết kế 12 nhiệm vụ động lực học trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ bão hòa. RTC được so với synchronous, naive asynchronous, temporal ensembling và các cách inpainting/consistency khác. Các plot cho thấy RTC có độ bền cao hơn khi delay tăng; temporal ensembling có thể thất bại vì averaging giữa hai mode hợp lệ.

**Robot thật:** Sử dụng π0.5 điều khiển hai arm 6-DoF với grippers, 50 Hz (`Δt=20 ms`), horizon khoảng 50 actions và 5 denoising steps. Bài báo báo vanilla π0.5 lấy mẫu độ trễ khoảng **76 ms**, RTC lấy mẫu khoảng **97 ms** trong thiết lập tương ứng, chưa tính mạng 10–20 ms. Tức bản thân lấy mẫu **chậm hơn**, nhưng vì overlap computation với thực thi nên robot có thể hoàn thành nhiệm vụ hiệu quả hơn.

Các nhiệm vụ gồm thắp nến bằng que diêm, cắm Ethernet, gấp áo, gấp đồ nhàu, dọn bát và dọn giường. Họ còn inject **+100 ms và +200 ms** độ trễ để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các thiết lập này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot. Một điểm quan trọng là ngay cả khi tách thời gian pause ra khỏi metric, ít lỗi/retry hơn vẫn giúp RTC.

**Đọc số liệu đúng:** throughput và thành công của mỗi nhiệm vụ không đồng nhất; chỉ nhìn average 6 nhiệm vụ dễ che một vài nhiệm vụ thất bại. Không được so 76 và 97 ms rồi kết luận RTC không hiệu quả; metric quan trọng là **nhiệm vụ throughput, thành công và quỹ đạo continuity của toàn loop**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Thí nghiệm 12 nhiệm vụ động trong Kinetix và 6 nhiệm vụ robot thật. Simulation: Tác giả thiết kế 12 nhiệm vụ động lực học trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ bão hòa.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Thiết lập 50 Hz: π0.5 khoảng 76 ms, có RTC khoảng 97 ms riêng sampler. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Simulation: Tác giả thiết kế 12 nhiệm vụ động lực học trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ bão hòa. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Dù sampler chậm hơn, overlap giúp giảm pause/jerk và cải thiện throughput ở nhiều tác vụ. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** So synchronous, naive async, temporal ensembling và guided prefix. Họ còn inject +100 ms và +200 ms độ trễ để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các thiết lập này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Bơm thêm +100 hoặc +200 ms delay để đo robustness thay vì chỉ success nominal. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Họ còn inject +100 ms và +200 ms độ trễ để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các thiết lập này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Họ còn inject +100 ms và +200 ms độ trễ để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các thiết lập này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Tác giả thừa nhận:** Runtime thêm overhead do guidance/backprop; cách làm phù hợp các diffusion/flow-based policies chứ không drop-in cho mọi autoregressive policy. Latency estimate và phân phối delay runtime ảnh hưởng hiệu năng.

**Phê bình độc lập:**

- **Conservative độ trễ budgeting đánh đổi reactivity:** estimate trễ thì robot được dạy phải giữ quá nhiều action cũ.
- **Soft mask không tương đương safety guarantee:** smooth không có nghĩa collision-free, force-safe hoặc đảm bảo constraints động lực học.
- **Delay spikes:** mạng hoặc GPU stall vượt budget có thể làm chunk buffer cạn; lúc ấy vẫn cần fallback bộ điều khiển, không có trong bài toán learning policy.
- **Benchmark selection:** kết quả 12 Kinetix nhiệm vụ và sáu robot nhiệm vụ mang tính thuyết phục, nhưng chưa đại diện cho locomotion/high-contact deformables và các miền dynamical khác.
- **Dịch chuyển phân phối dữ liệu:** trạng thái robot khi chunk mới tới không nhất thiết trùng state mà new policy điều kiện từ camera trước đó; đây là bản chất stale quan sát under độ trễ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Tác giả thừa nhận: Runtime thêm overhead do guidance/backprop; cách làm phù hợp các diffusion/flow-based policies chứ không drop-in cho mọi autoregressive policy.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: guidance có chi phí runtime; latency estimator ảnh hưởng hiệu năng. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Tác giả thừa nhận: Runtime thêm overhead do guidance/backprop; cách làm phù hợp các diffusion/flow-based policies chứ không drop-in cho mọi autoregressive policy. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: smooth không có nghĩa force-safe; delay spike lớn hơn buffer vẫn cần fallback controller. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [ACT / ALOHA](/paper/act) giới thiệu action chunking và temporal aggregation, nền của bài toán.
- [Diffusion Policy](/paper/diffusion-policy) giải thích liên tục generative action policy có thể inpaint.
- [π0.5](/paper/pi-0-5) là policy nền trong real-robot thí nghiệm.
- [Training-time RTC](/paper/rtc-training) chuyển constraint từ inference guidance sang huấn luyện mục tiêu huấn luyện. Hai bài báo nên đọc liền nhau.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm ACT / ALOHA, Diffusion Policy, π0.5, Training-time RTC. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: ACT khởi đầu action chunking và temporal aggregation. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: RTC training dời chi phí consistency từ inference sang training. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm ACT / ALOHA, Diffusion Policy, π0.5, Training-time RTC. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Làm một simulator đơn giản với `H=50`, `Δt=20 ms`, artificial inference delay `d=5...15`. So ba chiến lược: synchronous (có pause), naive async (thay chunk ngay), RTC-style hard-prefix blending (sau đó thêm soft decay). Plot quỹ đạo, velocity, acceleration, jerk và thành công. **Đặt hai mode đối nghịch** trên cùng quan sát để chứng minh average có thể sai. Khi đã quan sát được chunk boundary spike, mới đọc kỹ Equation/Algorithm trong Section 3 về guided lấy mẫu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Real-time VLA là bài toán systems/control, không chỉ model accuracy. Làm một simulator đơn giản với H=50, Δt=20 ms, artificial inference delay d=5...15. So ba chiến lược: synchronous (có pause), naive async (thay chunk ngay), RTC-style hard-prefix blending (sau đó thêm soft decay).

**Chọn điều cần mang sang dự án thật.** Đảm bảo prefix đã gửi không bị thay đổi bởi output mới. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Real-time VLA là bài toán systems/control, không chỉ model accuracy.

**Tái hiện tối thiểu.** Làm một simulator đơn giản với H=50, Δt=20 ms, artificial inference delay d=5...15. So ba chiến lược: synchronous (có pause), naive async (thay chunk ngay), RTC-style hard-prefix blending (sau đó thêm soft decay). Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Synchronous: thực thi hết phần được chọn của chunk A rồi chờ mô hình sinh B. Robot pause, momentum mất, trạng thái vật thể tiếp tục thay đổi. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Policy inference chậm hơn nhịp điều khiển 50 Hz: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Policy inference chậm hơn nhịp điều khiển 50 Hz', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Naive asynchronous: mô hình sinh B trong lúc robot đang chạy A. Không pause, nhưng B có thể chọn một strategy khác A ngay tại chunk boundary, gây discontinuity, acceleration spike hoặc jerk. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Synchronous gây pause; naive asynchronous gây giật ở ranh giới: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Synchronous gây pause; naive asynchronous gây giật ở ranh giới', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Averaging hai quỹ đạo cũng không chắc hữu ích: trung bình giữa “trái” và “phải” có thể là “đi thẳng vào vật cản”. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Giữ committed prefix, chỉ sinh lại tương lai: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Giữ committed prefix, chỉ sinh lại tương lai', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Chỉ hard-freeze d actions đầu chưa đảm bảo action ngay sau prefix nối mượt. Chunk cũ có thể đang đẩy sang phải với vận tốc lớn, nhưng chunk mới muốn bẻ trái ngay sau hành động thứ d. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ba khái niệm để nắm: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ba khái niệm để nắm', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Controller timestep Δt là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi sinh. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kiến trúc trong một sơ đồ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kiến trúc trong một sơ đồ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Trong lúc ấy inference loop xử lý quan sát mới và tạo chunk kế tiếp. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mô hình biểu diễn cái gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mô hình biểu diễn cái gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model học như thế nào?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model học như thế nào?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Nếu action policy dùng flow-based v_θ, lấy mẫu cập nhật quỹ đạo từ noise qua các flow-time steps. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một lần inference xảy ra ra sao?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một lần inference xảy ra ra sao?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa thực thi, nên RTC khóa các bước A chắc chắn sẽ xảy ra. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mathematical Intuition: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mathematical Intuition', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Mấu chốt: mô hình không được pretrain với conditional prefix, nên RTC phải thêm conditioning tại thời gian inference bằng kỹ thuật gần với gradient-based inpainting. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kết quả nói lên điều gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kết quả nói lên điều gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Simulation: Tác giả thiết kế 12 nhiệm vụ động lực học trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ bão hòa. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ablation và bằng chứng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ablation và bằng chứng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Họ còn inject +100 ms và +200 ms độ trễ để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các thiết lập này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Hạn chế cần nói thẳng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Hạn chế cần nói thẳng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Tác giả thừa nhận: Runtime thêm overhead do guidance/backprop; cách làm phù hợp các diffusion/flow-based policies chứ không drop-in cho mọi autoregressive policy. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Bài này đứng ở đâu trong lĩnh vực?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Bài này đứng ở đâu trong lĩnh vực?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đọc thêm ACT / ALOHA, Diffusion Policy, π0.5, Training-time RTC. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Nếu chỉ nhớ ba điều: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Nếu chỉ nhớ ba điều', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Làm một simulator đơn giản với H=50, Δt=20 ms, artificial inference delay d=5...15. So ba chiến lược: synchronous (có pause), naive async (thay chunk ngay), RTC-style hard-prefix blending (sau đó thêm soft decay). Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Điểm cốt lõi: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Không để robot dừng mỗi khi model nghĩ: action chunk mới phải khớp phần chuyển động đã cam kết. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Policy inference chậm hơn nhịp điều khiển 50 Hz: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Robot cần action mỗi 20 ms, trong khi VLA có thể mất 76–100 ms để sinh một chunk. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Synchronous gây pause; naive asynchronous gây giật ở ranh giới: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Temporal averaging còn có thể trộn hai quỹ đạo hợp lệ thành chuyển động không hợp lệ. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Giữ committed prefix, chỉ sinh lại tương lai: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Trong khi inference diễn ra, robot vẫn chạy buffer cũ; chunk mới bị constraint khớp phần chắc chắn đã/đang thực thi. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ba khái niệm để nắm: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Hiểu ba khái niệm này trước khi đọc thuật toán. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kiến trúc trong một sơ đồ: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Không để robot dừng mỗi khi model nghĩ: action chunk mới phải khớp phần chuyển động đã cam kết. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mô hình biểu diễn cái gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Chuỗi action H×D, chia thành prefix đã cam kết và suffix có thể sinh lại. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Model học như thế nào?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. RTC inference-time không yêu cầu train lại policy gốc. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Một lần inference xảy ra ra sao?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Hai loop chạy song song: servo và policy inference. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mathematical Intuition: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Inference tốn T_infer; servo có chu kỳ Δt. Trong thời gian đợi, khoảng d action cũ đã phải được thực thi. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kết quả nói lên điều gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Thí nghiệm 12 nhiệm vụ động trong Kinetix và 6 nhiệm vụ robot thật. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ablation và bằng chứng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. So synchronous, naive async, temporal ensembling và guided prefix. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Hạn chế cần nói thẳng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Bài này đứng ở đâu trong lĩnh vực?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Không đọc paper như một hòn đảo riêng. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Nếu chỉ nhớ ba điều: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Real-time VLA là bài toán systems/control, không chỉ model accuracy. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Điểm cốt lõi: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Synchronous: thực thi hết phần được chọn của chunk A rồi chờ mô hình sinh B. Robot pause, momentum mất, trạng thái vật thể tiếp tục thay đổi. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Policy inference chậm hơn nhịp điều khiển 50 Hz: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Naive asynchronous: mô hình sinh B trong lúc robot đang chạy A. Không pause, nhưng B có thể chọn một strategy khác A ngay tại chunk boundary, gây discontinuity, acceleration spike hoặc jerk. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Synchronous gây pause; naive asynchronous gây giật ở ranh giới: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Averaging hai quỹ đạo cũng không chắc hữu ích: trung bình giữa “trái” và “phải” có thể là “đi thẳng vào vật cản”. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Giữ committed prefix, chỉ sinh lại tương lai: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Chỉ hard-freeze d actions đầu chưa đảm bảo action ngay sau prefix nối mượt. Chunk cũ có thể đang đẩy sang phải với vận tốc lớn, nhưng chunk mới muốn bẻ trái ngay sau hành động thứ d. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Ba khái niệm để nắm: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Controller timestep Δt là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi sinh. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Kiến trúc trong một sơ đồ: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Trong lúc ấy inference loop xử lý quan sát mới và tạo chunk kế tiếp. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Mô hình biểu diễn cái gì?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Timing budget d là số bộ điều khiển steps mà mô hình có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử độ trễ. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Model học như thế nào?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Nếu action policy dùng flow-based v_θ, lấy mẫu cập nhật quỹ đạo từ noise qua các flow-time steps. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Một lần inference xảy ra ra sao?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa thực thi, nên RTC khóa các bước A chắc chắn sẽ xảy ra. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Mathematical Intuition: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Mấu chốt: mô hình không được pretrain với conditional prefix, nên RTC phải thêm conditioning tại thời gian inference bằng kỹ thuật gần với gradient-based inpainting. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Kết quả nói lên điều gì?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Simulation: Tác giả thiết kế 12 nhiệm vụ động lực học trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ bão hòa. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

<!-- END EXTENDED WALKTHROUGH -->
