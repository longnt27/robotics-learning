> **Bài do bạn cung cấp.** [Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339), NeurIPS 2025. Đây là bài báo về **runtime của policy**, không phải một backbone pretraining mới. Đọc cùng **Figure 2–3**, **Section 3**, **Section 4** và **Appendix A**.

## Vì sao cần nghiên cứu này?

### Mô hình nghĩ 100 ms, robot cần action mỗi 20 ms

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 7](/paper-figures/rtc-inference/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Một robot có thể cần lệnh mới mỗi 20 mili giây, nhưng mô hình VLA lại mất cả trăm mili giây mới tính xong đoạn hành động tiếp theo. Nếu robot đứng yên chờ, thao tác quẹt diêm hoặc giữ vật có thể bị phá hỏng. Nếu robot chạy tiếp rồi đột ngột chuyển sang đoạn mới, hai đoạn có thể khác hướng và gây giật mạnh. **RTC giải bài toán nối các đoạn hành động khi mô hình suy luận chậm:** cho robot tiếp tục thực thi trong khi mạng tính toán, đồng thời giữ các lệnh đã cam kết và điều chỉnh phần chuyển động còn lại để đường đi liên tục.

**Action chunking** giải quyết được một nửa bài toán. Thay vì chỉ dự đoán lệnh ở một thời điểm, policy sinh cả đoạn hành động tiếp theo, nhờ đó robot có thể tiếp tục chạy các lệnh đang có trong bộ đệm ngay cả khi mạng bận tính toán. Nhưng khi đoạn mới đến, hai cách tổ chức thực thi thông thường vẫn gây vấn đề:

1. **Chạy tuần tự:** robot thực hiện xong đoạn A rồi dừng chờ mạng sinh đoạn B. Thời gian chờ có thể phá hỏng thao tác đang cần lực hoặc chuyển động liên tục.
2. **Chạy song song đơn giản:** mạng tạo đoạn B trong khi robot chạy A, nhưng B có thể chọn một hướng đi khác ngay tại điểm nối, khiến robot đổi tốc độ hoặc gia tốc đột ngột.

Ví dụ tránh chướng ngại: chunk cũ đi vòng **phía trên**, chunk mới đi vòng **phía dưới**. Cả hai quỹ đạo riêng lẻ có thể đúng. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Averaging hai quỹ đạo cũng không chắc hữu ích: trung bình giữa “trái” và “phải” có thể là “đi thẳng vào vật cản”.

Vì vậy vấn đề bài báo thật sự giải không phải chỉ **độ trễ**, mà là **online replanning với các action đã commit trong thế giới vật lý**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rtc-inference/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 minh hoạ nhiệm vụ robot cần phối hợp liên tục dù policy sinh action chunk chậm, chẳng hạn đánh lửa bằng diêm. Với hành động nhạy thời gian, đứng yên đợi một inference mới có thể phá timing hoặc contact. RTC cho robot tiếp tục thực thi chunk cũ trong khi model tính chunk mới, nhưng phải đảm bảo lệnh mới nối được với những action đã cam kết. Đó là lý do đây là bài toán điều khiển thời gian thực chứ không chỉ tối ưu throughput của GPU.

### Vấn đề không chỉ là mô hình chậm

Robot cần lệnh mới ở tần số 50 Hz, tức mỗi 20 mili giây. Nhưng mô hình VLA có thể mất 100–300 mili giây để sinh một đoạn hành động. Nếu bắt robot đứng yên chờ, việc quẹt diêm, rót chất lỏng hoặc giữ vật có thể bị hỏng giữa chừng. Nếu để robot tiếp tục đoạn cũ rồi lập tức chuyển sang đoạn mới, lại có nguy cơ giật mạnh vì hai đoạn được tính từ quan sát khác nhau.

**RTC giải vấn đề nối hai đoạn hành động trong khi robot đang chạy.** Nó không làm VLM hiểu ảnh tốt hơn hay thay đổi mục tiêu nhiệm vụ. Trọng tâm là giữ những lệnh robot đã bắt đầu thực hiện, rồi sinh phần tương lai còn có thể thay đổi sao cho chuyển động không đứt đoạn.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

Action chunk là tensor `H × D`. `H` là dự đoán horizon, `D` là số action dimensions. `s` thường biểu diễn thực thi horizon: số action robot dùng từ chunk trước khi xin chunk mới. Controller timestep `Δt` là thời gian vật lý giữa action, còn số denoising steps là số vòng thuật toán khi sinh.

**Flow matching** xây một map từ noise sang action quỹ đạo bằng velocity field learned từ demonstrations. Trong lấy mẫu, quỹ đạo thay đổi qua nhiều **flow-time** `τ`, không đồng nhất với thời gian vật lý `t`. Cơ chế sửa mẫu trong quá trình denoise cho phép **inpainting**: giữ cố định vùng đã biết và sinh phần còn lại phù hợp. RTC tận dụng đúng tính chất này.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu tiền tố đã cam kết và độ trễ

**Action chunk** là đoạn gồm nhiều lệnh liên tiếp. **Độ trễ suy luận d** là số bước robot đi được trong lúc mô hình tạo đoạn mới. **Tiền tố đã cam kết** là các lệnh cũ mà controller chắc chắn sẽ thực hiện trước khi kết quả mới xuất hiện. Ta không thể xóa chúng bằng một dự đoán được sinh trễ.

Ví dụ mạng bắt đầu nghĩ khi robot đang ở bước 3 và phải mất bốn bước mới xong. Khi mạng trả lời, robot đã thực thi bước 4–7. Đoạn mới cần phù hợp với quá khứ không còn sửa được này. Những lệnh tiếp theo thuộc vùng chồng nhau có thể được điều chỉnh mềm; các lệnh vượt khỏi đoạn cũ phải sinh mới.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

### 1. Hai loop chạy đồng thời

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/rtc-inference/figure-3.webp)
![Hình 6 từ PDF gốc, trang 8](/paper-figures/rtc-inference/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
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


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 thể hiện một trường hợp hai action chunks phân nhánh khi inference bắt đầu giữa chuỗi và chunk mới không biết chính xác robot đã đi được tới đâu. Những bước trong chunk cũ vốn đã thực thi không thể sửa bằng cách tái tạo ảnh cũ. RTC dùng điều kiện prefix/inpainting để ràng buộc các hành động đã cam kết, đồng thời sinh postfix phù hợp sau điểm nối. Đây là nơi cần phân biệt độ trễ sampling với độ trễ camera/controller: estimator sai ở một trong hai cũng khiến prefix lệch thực tế.

#### Ví dụ từng bước để hiểu cơ chế

Giả sử controller chạy 50 Hz, tức mỗi action cách nhau 20 ms. Policy bắt đầu tính chunk mới nhưng mất 160 ms mới trả kết quả: trong thời gian ấy robot đã thực thi thêm khoảng 8 action cũ. Không thể đơn giản thay toàn bộ chunk từ timestep ban đầu, vì 8 bước đầu đã xảy ra. Hãy đưa prefix gồm các action cam kết vào điều kiện sinh chunk mới, rồi kiểm tra tính liên tục tại mốc nối và task success dưới nhiều mức latency giả lập. Đây là phép kiểm tra đúng bản chất RTC, không chỉ xem video có giật hay không.

### RTC trong một vòng điều khiển thực tế

**Bước 1:** robot đang thực thi đoạn A trong bộ đệm; mô hình nhận quan sát mới và bắt đầu tính đoạn B. Hai việc diễn ra đồng thời, không bắt robot dừng. **Bước 2:** ước tính d để xác định những bước của A sẽ được thực hiện trước khi B xong. Đặt ràng buộc rất mạnh cho các bước ấy.

**Bước 3:** ở phần A còn chồng với B nhưng chưa cam kết, dùng mức ràng buộc giảm dần thay vì bắt B bằng A hoàn toàn. **Bước 4:** phần cuối B ngoài độ dài A được sinh mới. **Bước 5:** khi B tới, controller nối vào vị trí đang thực thi, lấy lại quan sát và bắt đầu tính đoạn tiếp.

Điểm khác cách bất đồng bộ ngây thơ: B không được tự chọn một quỹ đạo hoàn toàn mâu thuẫn với phần A đã chạy.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot đang cắm cáp Ethernet vào port. Chunk A đang tiến lên theo trục X và nghiêng cổ tay nhẹ. Inference bắt đầu khi còn một số bước chưa thực thi, nên RTC khóa các bước A chắc chắn sẽ xảy ra. Camera mới cho thấy đầu cáp hơi lệch phải: phần future của B nên hiệu chỉnh nhẹ về phải, nhưng không được thay tức thời các bước vừa được robot commit. Soft mask cho phép gradient chỉnh góc tiếp cận dần dần. Kết quả mong muốn: không pause, không snap quỹ đạo, vẫn responsive với quan sát mới.

Ngược lại, nếu mô hình tự do sinh chunk B mà không nhìn overlap, nó có thể chọn tư thế đưa cáp vào từ hướng khác. Đây không phải vì mô hình “sai” ở mỗi chunk; nó sai ở **giao thức nối hai phương án hợp lệ qua thời gian thật**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ đi vòng vật cản theo hai hướng

Đoạn A dự định cho tay robot vòng trên vật cản. Mạng tính đoạn B từ quan sát mới và tự chọn vòng dưới. Nếu chuyển từ bước 10 của A sang bước 11 của B, tay có thể đổi hướng tức thì với gia tốc rất lớn. Nếu lấy trung bình hai vị trí, đường giữa lại có thể đâm vào vật cản.

RTC không chỉ làm mượt đầu ra bằng trung bình số học. Nó hướng quá trình sinh B sao cho những phần đã cam kết tiếp tục đúng và các phần chưa thực hiện thay đổi dần. Khi xem Hình 2–4, hãy phân biệt ràng buộc cứng cho những bước không thể sửa và ràng buộc mềm cho phần còn quyền lựa chọn.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

**Simulation:** Tác giả thiết kế 12 nhiệm vụ động lực học trong Kinetix để khuếch đại tác hại của pause/jerk, thay vì chỉ chọn bench thao tác quasi-static vốn quá dễ bão hòa. RTC được so với synchronous, naive asynchronous, temporal ensembling và các cách inpainting/consistency khác. Các plot cho thấy RTC có độ bền cao hơn khi delay tăng; temporal ensembling có thể thất bại vì averaging giữa hai mode hợp lệ.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 5](/paper-figures/rtc-inference/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
**Robot thật:** Sử dụng π0.5 điều khiển hai arm 6-DoF với grippers, 50 Hz (`Δt=20 ms`), horizon khoảng 50 actions và 5 denoising steps. Bài báo báo vanilla π0.5 lấy mẫu độ trễ khoảng **76 ms**, RTC lấy mẫu khoảng **97 ms** trong thiết lập tương ứng, chưa tính mạng 10–20 ms. Tức bản thân lấy mẫu **chậm hơn**, nhưng vì overlap computation với thực thi nên robot có thể hoàn thành nhiệm vụ hiệu quả hơn.

Các nhiệm vụ gồm thắp nến bằng que diêm, cắm Ethernet, gấp áo, gấp đồ nhàu, dọn bát và dọn giường. Họ còn inject **+100 ms và +200 ms** độ trễ để kiểm tra robustness. Throughput RTC nhìn chung tốt hơn hoặc bền hơn trong các thiết lập này; một số biến thể temporal ensembling có dao động đủ mạnh để trigger protective stop của robot. Một điểm quan trọng là ngay cả khi tách thời gian pause ra khỏi metric, ít lỗi/retry hơn vẫn giúp RTC.

**Đọc số liệu đúng:** throughput và thành công của mỗi nhiệm vụ không đồng nhất; chỉ nhìn average 6 nhiệm vụ dễ che một vài nhiệm vụ thất bại. Không được so 76 và 97 ms rồi kết luận RTC không hiệu quả; metric quan trọng là **nhiệm vụ throughput, thành công và quỹ đạo continuity của toàn loop**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hình kết quả đo điều gì?

Hình 1 cho thấy ví dụ robot quẹt diêm: cần chuyển động liên tục dù GPU có độ trễ. Hình 5 thay độ trễ suy luận và độ dài thực thi trên bài mô phỏng có điều kiện hoàn thành rõ ràng. Nếu đoạn thực thi quá dài, robot phản ứng chậm; nếu quá ngắn so với d, đoạn mới không kịp đến. Hình 3 nêu các giới hạn của độ dài thực thi s theo d và H.

Hình 6 đo tiến độ theo thời gian và thông lượng thực hiện. Không nên chỉ nhìn số hành động/giây: robot phát lệnh liên tục nhưng không hoàn thành công việc vẫn là thất bại. Độ mượt, thời gian hoàn thành và tỷ lệ thành công phải được xem cùng nhau.

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

### Giới hạn quan trọng của RTC khi triển khai

RTC cần ước lượng độ trễ. Nếu mạng đột nhiên chậm hơn dự đoán, những lệnh được cho là còn thay đổi được có thể đã tới tay bộ điều khiển. Nếu mô hình quá chậm so với độ dài chunk, việc chỉ chỉnh mặt nạ không đủ để bảo đảm an toàn.

Ngoài ra, tính liên tục về vị trí chưa luôn bảo đảm giới hạn vận tốc, gia tốc, lực hoặc va chạm. Khi chạy robot thật, cần log độ trễ cực đại, điểm nối lệnh và cơ chế dừng bảo vệ. RTC là một kỹ thuật điều khiển thời gian thực, không phải chứng nhận an toàn.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [ACT / ALOHA](/paper/act) giới thiệu action chunking và temporal aggregation, nền của bài toán.
- [Diffusion Policy](/paper/diffusion-policy) giải thích liên tục generative action policy có thể inpaint.
- [π0.5](/paper/pi-0-5) là policy nền trong real-robot thí nghiệm.
- [Training-time RTC](/paper/rtc-training) chuyển constraint từ inference guidance sang huấn luyện mục tiêu huấn luyện. Hai bài báo nên đọc liền nhau.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### RTC suy luận khác RTC huấn luyện ra sao?

RTC phiên bản đầu dùng mô hình đã học bình thường, rồi đưa các ràng buộc vào **ngay trong quá trình sinh chunk** bằng cách điều chỉnh quá trình lấy mẫu. RTC huấn luyện sẵn dạy mạng từ đầu cách nhận phần tiền tố đã biết và sinh phần tiếp theo tương thích.

Hai cách có cùng mục tiêu nối hành động liên tục nhưng chi phí suy luận và cách đưa điều kiện vào mạng khác nhau. Đọc bài thứ hai sau khi hiểu các đoạn A/B, d và tiền tố đã cam kết của bài này sẽ dễ hơn nhiều.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Làm một simulator đơn giản với `H=50`, `Δt=20 ms`, artificial inference delay `d=5...15`. So ba chiến lược: synchronous (có pause), naive async (thay chunk ngay), RTC-style hard-prefix blending (sau đó thêm soft decay). Plot quỹ đạo, velocity, acceleration, jerk và thành công. **Đặt hai mode đối nghịch** trên cùng quan sát để chứng minh average có thể sai. Khi đã quan sát được chunk boundary spike, mới đọc kỹ Equation/Algorithm trong Section 3 về guided lấy mẫu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự tính một ví dụ với 12 bước

Cho đoạn A có H = 12 hành động, mỗi hành động kéo dài 20 ms. Mô hình mất khoảng 80 ms để tính B, tương đương d = 4 bước. Nếu controller đã bắt đầu dùng A, bốn bước tiếp theo gần như chắc chắn được thực hiện trước khi B sẵn sàng. Hãy đánh dấu bốn bước ấy màu đỏ và các bước còn lại có thể điều chỉnh màu vàng.

Bây giờ tăng d lên 7. Đoạn được phép sinh thêm sẽ ngắn hơn như thế nào? Khi nào không còn đủ vùng chồng nhau? Nếu trả lời được bằng một trục thời gian, bạn đã hiểu động lực chính của RTC.

<!-- END EXTENDED WALKTHROUGH -->

