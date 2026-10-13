> **Bài do bạn cung cấp.** [Training-Time Action Conditioning for Efficient Real-Time Chunking](https://arxiv.org/abs/2512.05964), Vật lý Intelligence. Bài báo ngắn nhưng tinh tế: nó **thay đổi dữ liệu/mục tiêu huấn luyện lúc huấn luyện** để giảm overhead runtime của inference-time RTC. Nên đọc ngay sau [RTC đầu tiên](/paper/rtc-inference).

## Vì sao cần nghiên cứu này?

RTC inference-time chạy được với existing flow action policy, nhưng để ép chunk mới khớp prefix đã commit, sampler phải thêm guided inpainting. Những bước gradient/vector-Jacobian product khiến mô hình vốn sinh ra để che độ trễ lại **mất thêm độ trễ**. Nó đặc biệt bất lợi khi inference delay lớn vì committed prefix dài hơn. Tác giả hỏi: nếu policy đã được huấn luyện để biết rằng một đoạn quỹ đạo có thể được cho trước, liệu có thể loại bỏ guidance ở runtime không?

Đây là biến thể của một nguyên lý ML rộng hơn: **biến deployment constraint thành phân phối dữ liệu huấn luyện**, thay vì sửa đầu ra bằng heuristic sau khi huấn luyện xong. Robot không điều khiển trong thế giới đồng bộ lý tưởng; độ trễ thay đổi giữa các lần inference, vì compute, mạng và serving queue.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rtc-training/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 cho thấy hai action chunk chồng lên nhau và đoạn d action đầu tiên của chunk mới bị ràng buộc bởi các lệnh từ chunk trước đã phát ra. Trong một hệ thực tế, đây không phải optional smoothing: actuator không thể hoàn tác một chuyển động đã xảy ra trong lúc GPU còn tính toán. Training-time RTC muốn dạy model coi phần prefix ấy là điều kiện thay vì để inference tự tối ưu tốn kém mỗi lần nhận chunk mới.

### Tại sao RTC phiên bản đầu vẫn tốn công lúc chạy?

RTC ở thời điểm suy luận có thể lấy một mạng sinh hành động đã học trước rồi thêm ràng buộc để nối đoạn. Nhưng khi quá trình sinh phải chỉnh nhiều lần để giữ phần đã cam kết, chi phí tính toán tăng. **Training-time RTC chuyển việc học cách tôn trọng tiền tố sang giai đoạn huấn luyện**, để đến lúc chạy mô hình biết sinh phần tương lai từ các lệnh đã biết.

Đây là bài tiếp nối RTC đầu tiên, không phải thuật toán hoàn toàn không liên quan. Câu hỏi mới là: thay vì “sửa” chuỗi sinh ra để khớp đoạn cũ mỗi lần, liệu có thể huấn luyện policy ngay từ đầu cho bài toán ấy không?

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

Gọi `A = [a_1,...,a_H]` là action chunk. `k` là số bước đầu đã/đang được robot thực thi bằng chunk cũ. Việc sinh chunk mới thực chất là học phân phối điều kiện:

```text
p(a_{k+1:H} | observation, a_{1:k}, k)
```

Chú ý: **không phải flow từ action a_k đi tới action a_H** như đang nội suy quỹ đạo vật lý. Mô hình flow vẫn map **noise → phân phối dữ liệu sạch action**, nhưng chỉ đối với phần postfix chưa biết; prefix đã có giá trị. Đây chính là conceptual distinction quan trọng nhất.

Trong convention của bài báo, flow time `τ=0` là noise và `τ=1` là clean action. `τ` là noise/flow coordinate, không phải bộ điều khiển time `t`. Một timestep bộ điều khiển là 20 ms ở 50 Hz, nhưng flow sampler có thể có 5 Euler integration steps chỉ trong một mạng call.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Phân biệt tiền tố với phần tiếp theo

**Tiền tố** là những hành động đã hoặc sẽ chắc chắn thực thi trước khi mô hình tính xong. **Hậu tố** là phần hành động tiếp theo cần dự đoán để robot tiếp tục. Gọi d là độ trễ theo số bước và H là độ dài chunk; s là số bước thực thi của một lần cập nhật. Để tiền tố còn nằm trong vùng hai chunk chồng nhau, cần thỏa d ≤ H − s.

Trong RTC huấn luyện sẵn, mạng không được tự sửa tiền tố. Nó nhìn những hành động cố định ở đầu chuỗi rồi học cách sinh các bước sau tương thích. Đây là sự khác nhau với mô hình chỉ nhìn ảnh mà không biết controller đang thực thi lệnh nào.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

### 1. Randomize prefix length trong huấn luyện

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
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

### Huấn luyện bộ sinh để hiểu những lệnh đã cam kết

Trong giai đoạn train, người nghiên cứu lấy một chuỗi hành động đúng, chọn một phần đầu làm tiền tố giả định đã được controller thực hiện. Các giá trị tiền tố này được đưa vào mạng ở dạng thật, không thêm nhiễu. Phần hậu tố mới được thêm nhiễu để mạng học khử nhiễu và sinh ra những bước tiếp theo.

Mô hình còn được thông báo độ trễ tương ứng để hiểu tiền tố dài hay ngắn. Trong một DiT dùng flow matching, có thể dùng bước thời gian khác nhau cho token tiền tố và token cần sinh. Nhờ vậy khi chạy, policy không phải sửa một đoạn mới hoàn toàn tự do cho vừa với lệnh cũ.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot đang dựng một hộp carton. Observation tại thời điểm `t` cho thấy tay đang ép một mép hộp; chunk cũ còn 8 actions chưa thực thi. Network server estimate sẽ mất khoảng 100 ms, tức `k=5` ở 50 Hz. Robot sẽ thực thi 5 actions của chunk cũ trong lúc mạng sinh chunk mới. Inference đầu vào nhận `a_1...a_5` sạch. Mô hình chỉ phải sinh `a_6...a_H` sao cho điều kiện trên quan sát và prefix; khi kết quả tới, robot tiếp tục quỹ đạo hợp lý mà không hard switch sang một mode khác.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Trong huấn luyện, mô hình đã thấy các mẫu với k=0,1,2,...10 (không chỉ 5), nên forward call với `k=5` không phải trường hợp đặc biệt. Nếu độ trễ hôm sau lên `k=7`, policy vẫn làm được trong phân phối đã huấn luyện. Đây là **domain randomization trên inference delay**, tương tự sim-to-real randomize mass/friction, nhưng uncertainty nằm trong hệ thống computing.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ robot pha espresso trong lúc model đang tính

Robot đang đưa dụng cụ nén cà phê xuống. Mô hình nhận ảnh mới, nhưng trong 100 ms tiếp theo tay robot vẫn tiếp tục chuyển động theo lệnh đã phát. Nếu mạng tạo ngay quỹ đạo nâng dụng cụ lên từ một vị trí chưa tới, chỗ nối sẽ giật hoặc sai lực nén.

Training-time RTC được học từ các ví dụ “phần đầu đã xảy ra như thế này, hãy sinh phần sau”. Trong nhiệm vụ pha espresso còn có xay, nén, chiết và rót; nối chuyển động liên tục là quan trọng vì một thao tác sai có thể phá cả chuỗi.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

**Simulation:** Tác giả dùng 12 nhiệm vụ động trong Kinetix từ RTC trước. So inference-time RTC với training-time RTC theo delay. Kết quả báo cáo cho thấy training-time method có lợi thế rõ khi delay tăng (`d≥2` trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng phương pháp đối chứng. Đây không phải một chiến thắng tuyệt đối trên mọi k.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
**Robot thật:** Fine-tune từ **π0.6** cho box building và espresso making, so synchronous, inference-time RTC và training-time RTC. Bài báo báo training-time approach giữ thành công/duration gần với inference-time RTC, nhưng độ trễ end-to-end khoảng **108 ms** so với **135 ms** trong thiết lập được đo. Chênh lệch 27 ms lớn hơn một bộ điều khiển step 20 ms. Tuy vậy, không nên suy từ hai số đo đó rằng mọi GPU/robot đều tiết kiệm đúng 27 ms.

**Điểm quan trọng:** đây là trade-off giữa một ít huấn luyện adaptation và việc tránh compute gradient tại runtime. Nếu ứng dụng lặp inference hàng triệu lần, chi phí huấn luyện thêm có thể dễ chấp nhận hơn chi phí trả thêm trong mọi action chunk.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Kết quả phiên bản huấn luyện nên đọc thế nào?

Hình 3 đo độ trễ so với tỷ lệ giải xong trong mô phỏng; từ một số mức trễ, mạng được huấn luyện tiền tố làm tốt hơn bản phải áp ràng buộc ở suy luận. Nhưng Hình 5 ở robot thật cho thấy hai phiên bản RTC gần nhau về tỷ lệ thành công và thời gian; cả hai đều nhanh hơn cách chờ tuần tự.

Hai kết quả không mâu thuẫn. Lợi thế có thể phụ thuộc nhiệm vụ, độ trễ, phần cứng và cách sinh chunk. Khi đọc biểu đồ phải xem số lượt thử và khoảng sai số, không nên lấy ưu thế ở mô phỏng để tuyên bố mọi robot thật đều nhanh hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** Huấn luyện phải chọn delay phân phối tương đối phù hợp môi trường deploy. Nó không tận dụng soft guidance trên toàn phần overlapping future chunk tinh vi như RTC đầu tiên. Khi huấn luyện nhiều delays, tín hiệu giám sát phân bố không đều giữa action positions; tác giả thừa nhận huấn luyện specialist riêng cho từng k có thể cải thiện một số thiết lập.

**Phê bình độc lập:**

- **Capacity interference:** một mô hình chung học conditional across k; với compute hữu hạn, specialist cho fixed độ trễ có thể fit tốt hơn. Nhưng GPU routing nhiều checkpoints cũng gây complexity.
- **Latency OOD:** một policy được huấn luyện `0..10` không có guarantee ở `k=25`, đặc biệt nếu backend stall.
- **Ground-truth prefix mismatch:** trong huấn luyện prefix lấy từ demonstration; trong deploy prefix là actions do policy sinh. Error trong prefix sẽ đưa mô hình vào phân phối khác huấn luyện.
- **Action commitment phụ thuộc robot thực:** sensor-feedback và servo bộ điều khiển có thể khác lệnh đã gửi; committed action command không đảm bảo actuator thực hiện chính xác do contact/saturation.
- **Fine-tuning costs:** một mô hình đã dùng cho nhiều nhiệm vụ có thể cần additional dữ liệu/method integration để duy trì điều kiện k mà không quên action quality ban đầu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn của việc biết tiền tố ngay từ lúc học

Huấn luyện mạng hiểu tiền tố đòi dữ liệu và cách lấy mẫu phù hợp với độ trễ khi triển khai. Nếu thời gian suy luận thật thay đổi rất khác các trường hợp đã học, policy có thể dự đoán không chính xác. Không thể chỉ dùng một độ trễ lý tưởng rồi mặc định GPU luôn đúng giờ.

Việc giữ tiền tố cũng không giải quyết phát hiện vật mới, camera mất khung hình hoặc nguy cơ va chạm. Đây là một thành phần của hệ điều khiển, vẫn cần bộ đệm lệnh và kiểm tra an toàn bên ngoài.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [RTC inference-time](/paper/rtc-inference) là phương pháp đối chứng trực tiếp và nơi giải thích guided inpainting.
- [ACT](/paper/act) giúp hiểu temporal aggregation và chunk boundary.
- [Diffusion Policy](/paper/diffusion-policy) giải thích flow/diffusion conditional quỹ đạo lấy mẫu.
- [π0.5](/paper/pi-0-5) là representative modern flow-based VLA stack; bài báo training-time này đánh giá trực tiếp π0.6.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### So sánh hai cách RTC bằng một câu

RTC suy luận: **mạng sinh bình thường, quá trình lấy mẫu được ràng buộc để khớp hành động cũ**. RTC huấn luyện: **mạng đã được dạy cách nhận những hành động cũ và sinh tiếp**, nên thường ít cần chỉnh lại trong lúc chạy.

Cả hai khác ACT và Diffusion Policy ở trọng tâm nghiên cứu: ACT và Diffusion Policy học cách tạo hành động có cấu trúc; RTC học cách thực thi các đoạn đó liên tục khi inference chậm. Nếu chưa biết phân biệt các tầng ấy, rất dễ so sai bản chất đóng góp.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Bắt đầu bằng một toy mô hình có điều kiện flow trên vector `A ∈ R^{20 × 3}`. Mỗi huấn luyện batch mẫu `k∼Uniform(0,6)`, set prefix `τ=1` và postfix `τ∈[0,1]`; mask flow loss trên suffix. **Ablation quan trọng:** huấn luyện (A) k fixed 3, (B) k random 0..6, (C) k random nhưng oversample k=3. Đánh giá MSE/thành công theo từng k, không chỉ average. Thêm artificial under-/over-estimated delays ở runtime và đo jerk. Đây là thí nghiệm nhỏ vừa đủ để hiểu bài báo mà không cần H100 hay humanoid.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài tập đánh dấu tiền tố

Giả sử chunk dài H = 16, mô hình chậm d = 5 bước, controller định thực thi s = 7 bước mỗi lần. Kiểm tra điều kiện d ≤ H − s: 5 ≤ 9 nên vẫn có vùng chồng hợp lệ. Hãy tô đỏ năm bước đã cam kết, tô vàng các bước còn chồng nhưng chưa thực thi và tô xanh những bước cần sinh mới.

Sau đó tưởng tượng mạng không được biết năm bước màu đỏ khi huấn luyện. Nó có thể chọn một quỹ đạo mới mâu thuẫn thế nào? Bài tập trục thời gian này là chìa khóa để hiểu Hình 1–2.

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
