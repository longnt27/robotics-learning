> **Bài do bạn cung cấp.** [Training-Time Action Conditioning for Efficient Real-Time Chunking](https://arxiv.org/abs/2512.05964), Vật lý Intelligence. Bài báo ngắn nhưng tinh tế: nó **thay đổi dữ liệu/mục tiêu huấn luyện lúc huấn luyện** để giảm overhead runtime của inference-time RTC. Nên đọc ngay sau [RTC đầu tiên](/paper/rtc-inference).

## Vì sao cần nghiên cứu này?

RTC inference-time chạy được với existing flow action policy, nhưng để ép chunk mới khớp prefix đã commit, sampler phải thêm guided inpainting. Những bước gradient/vector-Jacobian product khiến mô hình vốn sinh ra để che độ trễ lại **mất thêm độ trễ**. Nó đặc biệt bất lợi khi inference delay lớn vì committed prefix dài hơn. Tác giả hỏi: nếu policy đã được huấn luyện để biết rằng một đoạn quỹ đạo có thể được cho trước, liệu có thể loại bỏ guidance ở runtime không?

Đây là biến thể của một nguyên lý ML rộng hơn: **biến deployment constraint thành phân phối dữ liệu huấn luyện**, thay vì sửa đầu ra bằng heuristic sau khi huấn luyện xong. Robot không điều khiển trong thế giới đồng bộ lý tưởng; độ trễ thay đổi giữa các lần inference, vì compute, mạng và serving queue.

## Kiến thức nền

Gọi `A = [a_1,...,a_H]` là action chunk. `k` là số bước đầu đã/đang được robot thực thi bằng chunk cũ. Việc sinh chunk mới thực chất là học phân phối điều kiện:

```text
p(a_{k+1:H} | observation, a_{1:k}, k)
```

Chú ý: **không phải flow từ action a_k đi tới action a_H** như đang nội suy quỹ đạo vật lý. Mô hình flow vẫn map **noise → phân phối dữ liệu sạch action**, nhưng chỉ đối với phần postfix chưa biết; prefix đã có giá trị. Đây chính là conceptual distinction quan trọng nhất.

Trong convention của bài báo, flow time `τ=0` là noise và `τ=1` là clean action. `τ` là noise/flow coordinate, không phải bộ điều khiển time `t`. Một timestep bộ điều khiển là 20 ms ở 50 Hz, nhưng flow sampler có thể có 5 Euler integration steps chỉ trong một mạng call.

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

## Ví dụ từng bước

Robot đang dựng một hộp carton. Observation tại thời điểm `t` cho thấy tay đang ép một mép hộp; chunk cũ còn 8 actions chưa thực thi. Network server estimate sẽ mất khoảng 100 ms, tức `k=5` ở 50 Hz. Robot sẽ thực thi 5 actions của chunk cũ trong lúc mạng sinh chunk mới. Inference đầu vào nhận `a_1...a_5` sạch. Mô hình chỉ phải sinh `a_6...a_H` sao cho điều kiện trên quan sát và prefix; khi kết quả tới, robot tiếp tục quỹ đạo hợp lý mà không hard switch sang một mode khác.

Trong huấn luyện, mô hình đã thấy các mẫu với k=0,1,2,...10 (không chỉ 5), nên forward call với `k=5` không phải trường hợp đặc biệt. Nếu độ trễ hôm sau lên `k=7`, policy vẫn làm được trong phân phối đã huấn luyện. Đây là **domain randomization trên inference delay**, tương tự sim-to-real randomize mass/friction, nhưng uncertainty nằm trong hệ thống computing.

## Kết quả thực nghiệm

**Simulation:** Tác giả dùng 12 nhiệm vụ động trong Kinetix từ RTC trước. So inference-time RTC với training-time RTC theo delay. Kết quả báo cáo cho thấy training-time method có lợi thế rõ khi delay tăng (`d≥2` trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng phương pháp đối chứng. Đây không phải một chiến thắng tuyệt đối trên mọi k.

**Robot thật:** Fine-tune từ **π0.6** cho box building và espresso making, so synchronous, inference-time RTC và training-time RTC. Bài báo báo training-time approach giữ thành công/duration gần với inference-time RTC, nhưng độ trễ end-to-end khoảng **108 ms** so với **135 ms** trong thiết lập được đo. Chênh lệch 27 ms lớn hơn một bộ điều khiển step 20 ms. Tuy vậy, không nên suy từ hai số đo đó rằng mọi GPU/robot đều tiết kiệm đúng 27 ms.

**Điểm quan trọng:** đây là trade-off giữa một ít huấn luyện adaptation và việc tránh compute gradient tại runtime. Nếu ứng dụng lặp inference hàng triệu lần, chi phí huấn luyện thêm có thể dễ chấp nhận hơn chi phí trả thêm trong mọi action chunk.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** Huấn luyện phải chọn delay phân phối tương đối phù hợp môi trường deploy. Nó không tận dụng soft guidance trên toàn phần overlapping future chunk tinh vi như RTC đầu tiên. Khi huấn luyện nhiều delays, tín hiệu giám sát phân bố không đều giữa action positions; tác giả thừa nhận huấn luyện specialist riêng cho từng k có thể cải thiện một số thiết lập.

**Phê bình độc lập:**

- **Capacity interference:** một mô hình chung học conditional across k; với compute hữu hạn, specialist cho fixed độ trễ có thể fit tốt hơn. Nhưng GPU routing nhiều checkpoints cũng gây complexity.
- **Latency OOD:** một policy được huấn luyện `0..10` không có guarantee ở `k=25`, đặc biệt nếu backend stall.
- **Ground-truth prefix mismatch:** trong huấn luyện prefix lấy từ demonstration; trong deploy prefix là actions do policy sinh. Error trong prefix sẽ đưa mô hình vào phân phối khác huấn luyện.
- **Action commitment phụ thuộc robot thực:** sensor-feedback và servo bộ điều khiển có thể khác lệnh đã gửi; committed action command không đảm bảo actuator thực hiện chính xác do contact/saturation.
- **Fine-tuning costs:** một mô hình đã dùng cho nhiều nhiệm vụ có thể cần additional dữ liệu/method integration để duy trì điều kiện k mà không quên action quality ban đầu.

## Liên hệ với nghiên cứu khác

- [RTC inference-time](/paper/rtc-inference) là phương pháp đối chứng trực tiếp và nơi giải thích guided inpainting.
- [ACT](/paper/act) giúp hiểu temporal aggregation và chunk boundary.
- [Diffusion Policy](/paper/diffusion-policy) giải thích flow/diffusion conditional quỹ đạo lấy mẫu.
- [π0.5](/paper/pi-0-5) là representative modern flow-based VLA stack; bài báo training-time này đánh giá trực tiếp π0.6.

## Đọc code và tự kiểm chứng

Bắt đầu bằng một toy mô hình có điều kiện flow trên vector `A ∈ R^{20 × 3}`. Mỗi huấn luyện batch mẫu `k∼Uniform(0,6)`, set prefix `τ=1` và postfix `τ∈[0,1]`; mask flow loss trên suffix. **Ablation quan trọng:** huấn luyện (A) k fixed 3, (B) k random 0..6, (C) k random nhưng oversample k=3. Đánh giá MSE/thành công theo từng k, không chỉ average. Thêm artificial under-/over-estimated delays ở runtime và đo jerk. Đây là thí nghiệm nhỏ vừa đủ để hiểu bài báo mà không cần H100 hay humanoid.
