> **Bài do bạn cung cấp.** [Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339), NeurIPS 2025. Đây là paper về **runtime của policy**, không phải một backbone pretraining mới. Đọc cùng **Figure 2–3**, **Section 3**, **Section 4** và **Appendix A**.

## Why

### Model nghĩ 100 ms, robot cần action mỗi 20 ms

Một VLA có thể predict action rất tốt nhưng vẫn điều khiển robot tệ vì quá chậm. Ví dụ controller chạy 50 Hz, cứ 20 ms cần action mới. Trong khi đó, network gồm VLM và flow action expert có thể mất 80–300 ms cho một forward/sampling. Một chatbot có thể chờ, nhưng robot đang giữ vật, cân bằng hay đẩy một vật ma sát **không có nút pause cho GPU**.

**Action chunking** giải được một nửa: thay vì predict `a_t` rồi query model ở timestep tiếp theo, policy trả về `A_t = (a_t,...,a_{t+H-1})`. Robot có thể liên tục execute các action đã có trong buffer. Nhưng có hai kiểu scheduling đều có vấn đề:

1. **Synchronous:** execute hết phần được chọn của chunk A rồi chờ model sinh B. Robot pause, momentum mất, trạng thái vật thể tiếp tục thay đổi.
2. **Naive asynchronous:** model sinh B trong lúc robot đang chạy A. Không pause, nhưng B có thể chọn một strategy khác A ngay tại chunk boundary, gây discontinuity, acceleration spike hoặc jerk.

Ví dụ tránh chướng ngại: chunk cũ đi vòng **phía trên**, chunk mới đi vòng **phía dưới**. Cả hai quỹ đạo riêng lẻ có thể đúng. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Averaging hai trajectory cũng không chắc hữu ích: trung bình giữa “trái” và “phải” có thể là “đi thẳng vào vật cản”.

Vì vậy vấn đề paper thật sự giải không phải chỉ **latency**, mà là **online replanning với các action đã commit trong thế giới vật lý**.

## Kiến thức nền

Action chunk là tensor `H × D`. `H` là prediction horizon, `D` là số action dimensions. `s` thường biểu diễn execution horizon: số action robot dùng từ chunk trước khi xin chunk mới. Controller timestep `Δt` là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi generate.

**Flow matching** xây một map từ noise sang action trajectory bằng velocity field learned từ demonstrations. Trong sampling, trajectory thay đổi qua nhiều **flow-time** `τ`, không đồng nhất với thời gian vật lý `t`. Cơ chế sửa sample trong quá trình denoise cho phép **inpainting**: giữ cố định vùng đã biết và sinh phần còn lại phù hợp. RTC tận dụng đúng tính chất này.

## How

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

Control loop không block để đợi network. Trong lúc ấy inference loop xử lý observation mới và tạo chunk kế tiếp. Timing budget `d` là số controller steps mà model có thể mất trước khi kết quả sẵn sàng, được estimate bảo thủ từ lịch sử latency. Không có phương pháp nào ở đây dự đoán tương lai vật lý chính xác như tiên tri; runtime chỉ quản lý những gì chắc chắn sẽ execute trong lúc model tính toán.

### 2. Committed prefix

Giả sử controller đang execute chunk cũ:

```text
OLD:   a0 a1 a2 a3 a4 a5 a6 a7 a8 a9 ...
              ↑ inference starts
             └──── d steps of latency ────┐
NEW:           [fixed actions] [future...]
```

Tại thời điểm request, biết một phần của chunk cũ sẽ được execute trước khi model xong. Những action đó là **committed prefix**. Chunk mới không được tự ý thay chúng, vì chúng đã hoặc sẽ xảy ra mà không thể undo. Đây là constraint có tính vật lý, không phải heuristic bình thường.

RTC xây một masked action trajectory: prefix được giữ cứng, phần tương lai mới là vùng cần generate. Khi flow model update sample, guidance điều chỉnh sample để consistency với committed actions. Mấu chốt: model không được pretrain với conditional prefix, nên RTC phải thêm conditioning tại **inference time** bằng kỹ thuật gần với gradient-based inpainting.

### 3. Soft mask cho phần overlap chưa commit

Chỉ hard-freeze `d` actions đầu chưa đảm bảo action ngay sau prefix nối mượt. Chunk cũ có thể đang đẩy sang phải với vận tốc lớn, nhưng chunk mới muốn bẻ trái ngay sau hành động thứ `d`. Vì vậy RTC tiếp tục sử dụng phần overlap của chunk cũ như **soft reference**.

```text
NEW ACTION HORIZON
| hard-frozen | soft overlap / decaying guidance | free future |
      1.0             0.9 → 0.6 → 0.2             0
```

Các action càng gần hiện tại càng bị ràng buộc mạnh, các action xa tương lai càng được phép đổi vì observation mới có thể tiết lộ một tình huống khác. Paper thử các decay schedules và sử dụng exponential soft masking; linear khá gần. Đây là sự cân bằng giữa **continuity** và **reactivity**.

### 4. Inpainting trong flow sampler

Nếu action policy dùng flow-based `v_θ`, sampling cập nhật trajectory từ noise qua các flow-time steps. RTC cần thêm guidance dựa trên khác biệt giữa predicted chunk và reference chunk tại các vị trí có mask. Gradient/Jacobian đưa constraint đó vào vector field sampling. **Không cần train lại model**, nhưng phải trả giá bằng compute ở inference.

Điểm này lý giải tại sao RTC hợp với diffusion/flow action heads mà không drop-in cho autoregressive discrete actions. Khi token đã autoregressively sinh theo thứ tự, không có trajectory tensor liên tục để sửa toàn bộ bằng gradient-guided inpainting theo cùng cách.

### 5. Latency estimate không hoàn hảo

Nếu dự đoán `d_est` dài hơn thực tế, robot giữ continuity nhưng bỏ lỡ cơ hội replan sớm. Nếu `d_est` ngắn hơn, model có thể trả chunk giả định một số action chưa xảy ra, nhưng robot đã execute chúng. Runtime cần buffer và conservative estimate để tránh underrun. Đây là giới hạn thực sự của asynchronous control, không có sampling trick nào xóa được.

## Ví dụ từng bước

Robot đang cắm cáp Ethernet vào port. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa execute, nên RTC khóa các bước A chắc chắn sẽ xảy ra. Camera mới cho thấy đầu cáp hơi lệch phải: phần future của B nên hiệu chỉnh nhẹ về phải, nhưng không được thay tức thời các bước vừa được robot commit. Soft mask cho phép gradient chỉnh góc tiếp cận dần dần. Kết quả mong muốn: không pause, không snap trajectory, vẫn responsive với observation mới.

Ngược lại, nếu model tự do generate chunk B mà không nhìn overlap, nó có thể chọn tư thế đưa cáp vào từ hướng khác. Đây không phải vì model “sai” ở mỗi chunk; nó sai ở **giao thức nối hai phương án hợp lệ qua thời gian thật**.

## Results

**Simulation:** Authors thiết kế 12 task dynamics trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ saturate. RTC được so với synchronous, naive asynchronous, temporal ensembling và các cách inpainting/consistency khác. Các plot cho thấy RTC có độ bền cao hơn khi delay tăng; temporal ensembling có thể thất bại vì averaging giữa hai mode hợp lệ.

**Robot thật:** Sử dụng π0.5 điều khiển hai arm 6-DoF với grippers, 50 Hz (`Δt=20 ms`), horizon khoảng 50 actions và 5 denoising steps. Paper báo vanilla π0.5 sampling latency khoảng **76 ms**, RTC sampling khoảng **97 ms** trong setting tương ứng, chưa tính network 10–20 ms. Tức bản thân sampling **chậm hơn**, nhưng vì overlap computation với execution nên robot có thể hoàn thành task hiệu quả hơn.

Các task gồm thắp nến bằng que diêm, cắm Ethernet, gấp áo, gấp đồ nhàu, dọn bát và dọn giường. Họ còn inject **+100 ms và +200 ms** latency để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các setting này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot. Một điểm quan trọng là ngay cả khi tách thời gian pause ra khỏi metric, ít lỗi/retry hơn vẫn giúp RTC.

**Đọc số liệu đúng:** throughput và success của mỗi task không đồng nhất; chỉ nhìn average 6 tasks dễ che một vài task thất bại. Không được so 76 và 97 ms rồi kết luận RTC không hiệu quả; metric quan trọng là **task throughput, success và trajectory continuity của toàn loop**.

## Limitations

**Tác giả thừa nhận:** Runtime thêm overhead do guidance/backprop; cách làm phù hợp các diffusion/flow-based policies chứ không drop-in cho mọi autoregressive policy. Latency estimate và phân phối delay runtime ảnh hưởng hiệu năng.

**Phê bình độc lập:**

- **Conservative latency budgeting đánh đổi reactivity:** estimate trễ thì robot được dạy phải giữ quá nhiều action cũ.
- **Soft mask không tương đương safety guarantee:** smooth không có nghĩa collision-free, force-safe hoặc đảm bảo constraints động lực học.
- **Delay spikes:** mạng hoặc GPU stall vượt budget có thể làm chunk buffer cạn; lúc ấy vẫn cần fallback controller, không có trong bài toán learning policy.
- **Benchmark selection:** kết quả 12 Kinetix tasks và sáu robot tasks mang tính thuyết phục, nhưng chưa đại diện cho locomotion/high-contact deformables và các miền dynamical khác.
- **Distribution shift:** robot state khi chunk mới tới không nhất thiết trùng state mà new policy condition từ camera trước đó; đây là bản chất stale observation under latency.

## Connections

- [ACT / ALOHA](/paper/act) giới thiệu action chunking và temporal aggregation, nền của bài toán.
- [Diffusion Policy](/paper/diffusion-policy) giải thích continuous generative action policy có thể inpaint.
- [π0.5](/paper/pi-0-5) là policy nền trong real-robot experiments.
- [Training-time RTC](/paper/rtc-training) chuyển constraint từ inference guidance sang training objective. Hai paper nên đọc liền nhau.

## Đọc code và tự kiểm chứng

Làm một simulator đơn giản với `H=50`, `Δt=20 ms`, artificial inference delay `d=5...15`. So ba chiến lược: synchronous (có pause), naive async (thay chunk ngay), RTC-style hard-prefix blending (sau đó thêm soft decay). Plot trajectory, velocity, acceleration, jerk và success. **Đặt hai mode đối nghịch** trên cùng observation để chứng minh average có thể sai. Khi đã quan sát được chunk boundary spike, mới đọc kỹ Equation/Algorithm trong Section 3 về guided sampling.
