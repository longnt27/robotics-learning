> **Bài do bạn cung cấp.** [Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339), NeurIPS 2025. Đây là bài báo về **runtime của policy**, không phải một backbone pretraining mới. Đọc cùng **Figure 2–3**, **Section 3**, **Section 4** và **Appendix A**.

## Vì sao cần nghiên cứu này?

### Mô hình nghĩ 100 ms, robot cần action mỗi 20 ms

Một VLA có thể dự đoán action rất tốt nhưng vẫn điều khiển robot tệ vì quá chậm. Ví dụ bộ điều khiển chạy 50 Hz, cứ 20 ms cần action mới. Trong khi đó, mạng gồm VLM và flow action expert có thể mất 80–300 ms cho một forward/lấy mẫu. Một chatbot có thể chờ, nhưng robot đang giữ vật, cân bằng hay đẩy một vật ma sát **không có nút pause cho GPU**.

**Action chunking** giải được một nửa: thay vì dự đoán `a_t` rồi query mô hình ở timestep tiếp theo, policy trả về `A_t = (a_t,...,a_{t+H-1})`. Robot có thể liên tục thực thi các action đã có trong buffer. Nhưng có hai kiểu scheduling đều có vấn đề:

1. **Synchronous:** thực thi hết phần được chọn của chunk A rồi chờ mô hình sinh B. Robot pause, momentum mất, trạng thái vật thể tiếp tục thay đổi.
2. **Naive asynchronous:** mô hình sinh B trong lúc robot đang chạy A. Không pause, nhưng B có thể chọn một strategy khác A ngay tại chunk boundary, gây discontinuity, acceleration spike hoặc jerk.

Ví dụ tránh chướng ngại: chunk cũ đi vòng **phía trên**, chunk mới đi vòng **phía dưới**. Cả hai quỹ đạo riêng lẻ có thể đúng. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Averaging hai quỹ đạo cũng không chắc hữu ích: trung bình giữa “trái” và “phải” có thể là “đi thẳng vào vật cản”.

Vì vậy vấn đề bài báo thật sự giải không phải chỉ **độ trễ**, mà là **online replanning với các action đã commit trong thế giới vật lý**.

## Kiến thức nền

Action chunk là tensor `H × D`. `H` là dự đoán horizon, `D` là số action dimensions. `s` thường biểu diễn thực thi horizon: số action robot dùng từ chunk trước khi xin chunk mới. Controller timestep `Δt` là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi sinh.

**Flow matching** xây một map từ noise sang action quỹ đạo bằng velocity field learned từ demonstrations. Trong lấy mẫu, quỹ đạo thay đổi qua nhiều **flow-time** `τ`, không đồng nhất với thời gian vật lý `t`. Cơ chế sửa mẫu trong quá trình denoise cho phép **inpainting**: giữ cố định vùng đã biết và sinh phần còn lại phù hợp. RTC tận dụng đúng tính chất này.

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

## Ví dụ từng bước

Robot đang cắm cáp Ethernet vào port. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa thực thi, nên RTC khóa các bước A chắc chắn sẽ xảy ra. Camera mới cho thấy đầu cáp hơi lệch phải: phần future của B nên hiệu chỉnh nhẹ về phải, nhưng không được thay tức thời các bước vừa được robot commit. Soft mask cho phép gradient chỉnh góc tiếp cận dần dần. Kết quả mong muốn: không pause, không snap quỹ đạo, vẫn responsive với quan sát mới.

Ngược lại, nếu mô hình tự do sinh chunk B mà không nhìn overlap, nó có thể chọn tư thế đưa cáp vào từ hướng khác. Đây không phải vì mô hình “sai” ở mỗi chunk; nó sai ở **giao thức nối hai phương án hợp lệ qua thời gian thật**.

## Kết quả thực nghiệm

**Simulation:** Tác giả thiết kế 12 nhiệm vụ động lực học trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ bão hòa. RTC được so với synchronous, naive asynchronous, temporal ensembling và các cách inpainting/consistency khác. Các plot cho thấy RTC có độ bền cao hơn khi delay tăng; temporal ensembling có thể thất bại vì averaging giữa hai mode hợp lệ.

**Robot thật:** Sử dụng π0.5 điều khiển hai arm 6-DoF với grippers, 50 Hz (`Δt=20 ms`), horizon khoảng 50 actions và 5 denoising steps. Bài báo báo vanilla π0.5 lấy mẫu độ trễ khoảng **76 ms**, RTC lấy mẫu khoảng **97 ms** trong thiết lập tương ứng, chưa tính mạng 10–20 ms. Tức bản thân lấy mẫu **chậm hơn**, nhưng vì overlap computation với thực thi nên robot có thể hoàn thành nhiệm vụ hiệu quả hơn.

Các nhiệm vụ gồm thắp nến bằng que diêm, cắm Ethernet, gấp áo, gấp đồ nhàu, dọn bát và dọn giường. Họ còn inject **+100 ms và +200 ms** độ trễ để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các thiết lập này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot. Một điểm quan trọng là ngay cả khi tách thời gian pause ra khỏi metric, ít lỗi/retry hơn vẫn giúp RTC.

**Đọc số liệu đúng:** throughput và thành công của mỗi nhiệm vụ không đồng nhất; chỉ nhìn average 6 nhiệm vụ dễ che một vài nhiệm vụ thất bại. Không được so 76 và 97 ms rồi kết luận RTC không hiệu quả; metric quan trọng là **nhiệm vụ throughput, thành công và quỹ đạo continuity của toàn loop**.

## Hạn chế và câu hỏi còn mở

**Tác giả thừa nhận:** Runtime thêm overhead do guidance/backprop; cách làm phù hợp các diffusion/flow-based policies chứ không drop-in cho mọi autoregressive policy. Latency estimate và phân phối delay runtime ảnh hưởng hiệu năng.

**Phê bình độc lập:**

- **Conservative độ trễ budgeting đánh đổi reactivity:** estimate trễ thì robot được dạy phải giữ quá nhiều action cũ.
- **Soft mask không tương đương safety guarantee:** smooth không có nghĩa collision-free, force-safe hoặc đảm bảo constraints động lực học.
- **Delay spikes:** mạng hoặc GPU stall vượt budget có thể làm chunk buffer cạn; lúc ấy vẫn cần fallback bộ điều khiển, không có trong bài toán learning policy.
- **Benchmark selection:** kết quả 12 Kinetix nhiệm vụ và sáu robot nhiệm vụ mang tính thuyết phục, nhưng chưa đại diện cho locomotion/high-contact deformables và các miền dynamical khác.
- **Dịch chuyển phân phối dữ liệu:** trạng thái robot khi chunk mới tới không nhất thiết trùng state mà new policy điều kiện từ camera trước đó; đây là bản chất stale quan sát under độ trễ.

## Liên hệ với nghiên cứu khác

- [ACT / ALOHA](/paper/act) giới thiệu action chunking và temporal aggregation, nền của bài toán.
- [Diffusion Policy](/paper/diffusion-policy) giải thích liên tục generative action policy có thể inpaint.
- [π0.5](/paper/pi-0-5) là policy nền trong real-robot thí nghiệm.
- [Training-time RTC](/paper/rtc-training) chuyển constraint từ inference guidance sang huấn luyện mục tiêu huấn luyện. Hai bài báo nên đọc liền nhau.

## Đọc code và tự kiểm chứng

Làm một simulator đơn giản với `H=50`, `Δt=20 ms`, artificial inference delay `d=5...15`. So ba chiến lược: synchronous (có pause), naive async (thay chunk ngay), RTC-style hard-prefix blending (sau đó thêm soft decay). Plot quỹ đạo, velocity, acceleration, jerk và thành công. **Đặt hai mode đối nghịch** trên cùng quan sát để chứng minh average có thể sai. Khi đã quan sát được chunk boundary spike, mới đọc kỹ Equation/Algorithm trong Section 3 về guided lấy mẫu.
