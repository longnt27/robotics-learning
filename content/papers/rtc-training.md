> **Bài do bạn cung cấp.** [Training-Time Action Conditioning for Efficient Real-Time Chunking](https://arxiv.org/abs/2512.05964), Physical Intelligence. Paper ngắn nhưng tinh tế: nó **thay đổi data/objective lúc train** để giảm overhead runtime của inference-time RTC. Nên đọc ngay sau [RTC đầu tiên](/paper/rtc-inference).

## Why

RTC inference-time chạy được với existing flow action policy, nhưng để ép chunk mới khớp prefix đã commit, sampler phải thêm guided inpainting. Những bước gradient/vector-Jacobian product khiến model vốn sinh ra để che latency lại **mất thêm latency**. Nó đặc biệt bất lợi khi inference delay lớn vì committed prefix dài hơn. Authors hỏi: nếu policy đã được train để biết rằng một đoạn trajectory có thể được cho trước, liệu có thể loại bỏ guidance ở runtime không?

Đây là biến thể của một nguyên lý ML rộng hơn: **biến deployment constraint thành training distribution**, thay vì sửa đầu ra bằng heuristic sau khi train xong. Robot không điều khiển trong thế giới đồng bộ lý tưởng; latency thay đổi giữa các lần inference, vì compute, network và serving queue.

## Kiến thức nền

Gọi `A = [a_1,...,a_H]` là action chunk. `k` là số bước đầu đã/đang được robot execute bằng chunk cũ. Việc sinh chunk mới thực chất là học phân phối điều kiện:

```text
p(a_{k+1:H} | observation, a_{1:k}, k)
```

Chú ý: **không phải flow từ action a_k đi tới action a_H** như đang nội suy quỹ đạo vật lý. Flow model vẫn map **noise → clean action distribution**, nhưng chỉ đối với phần postfix chưa biết; prefix đã có giá trị. Đây chính là conceptual distinction quan trọng nhất.

Trong convention của paper, flow time `τ=0` là noise và `τ=1` là clean action. `τ` là noise/flow coordinate, không phải controller time `t`. Một timestep controller là 20 ms ở 50 Hz, nhưng flow sampler có thể có 5 Euler integration steps chỉ trong một network call.

## How

### 1. Randomize prefix length trong train

Với mỗi training example gồm observation và demo action chunk ground-truth, sample một delay `k` từ distribution đã định. Chẳng hạn cho robot 50 Hz:

```text
k = 0: [ noise noise noise noise noise noise ]
k = 2: [ a1 a2 | noise noise noise noise ]
k = 4: [ a1 a2 a3 a4 | noise noise ]
```

Trong real-world experiments, tác giả train với delay phân bố đều từ **0 đến 10 controller steps**, bao phủ nominal range đến **200 ms** ở 50 Hz. Điều này cho policy nhìn thấy nhiều prefix lengths. Nó không học một hard-coded `k=5`, mà học **một conditional generator dùng chung cho nhiều k**.

### 2. Per-token flow time

Trong flow matching bình thường, tất cả action tokens cùng có flow timestamp `τ`. Paper đổi thành **prefix tokens có `τ_i=1`**, còn postfix tokens dùng random sampled `τ`. Vì `τ=1` tương đương clean data, prefix đưa vào mạng nguyên bản, không nhiễu. Trong mỗi flow sampling iteration inference, prefix cũng được overwrite bằng các action đã commit để đảm bảo chính xác.

```text
input:  observation + task instruction + robot state
        clean prefix a1...ak
        noisy postfix a{k+1}...aH
        per-position flow times

network: velocity field on postfix
loss:    only postfix positions
```

Tức loss có masking: tác giả **không phạt network vì không reconstruct một prefix vốn đã được cung cấp sẵn**. Learning signal tập trung vào quỹ đạo phải sinh mới. Data và ground-truth chunks vẫn đến từ robot demos; không cần dataset mới ghi nhãn “RTC”.

### 3. Inference runtime gần như không đổi

Runtime vẫn đo/estimate inference delay bằng recent latency history (để chọn `k`) và vẫn asynchronously generate chunk mới trong lúc chạy chunk cũ. Khác ở chỗ nó đưa clean committed prefix vào network rồi sinh postfix conditional bằng forward passes, **không cần vector-Jacobian guidance**. Paper nói rõ không yêu cầu thay đổi model architecture hay robot runtime; recipe huấn luyện và cách condition sampling thay đổi.

### 4. Quan hệ giữa `k_est` và `k_real`

Đây là chi tiết cần hiểu nếu định tự implement.

- `k_est > k_real`: model bị buộc giữ lâu hơn cần thiết, thường giảm reactivity nhưng continuity tương đối dễ giữ.
- `k_est < k_real`: robot đã execute thêm action chưa được condition vào prefix của chunk mới. New postfix có thể đã đi từ một history sai; boundary lại có nguy cơ discontinuity.
- `k_real > maximum trained k`: policy đang extrapolate prefix length. Không có guarantee generalization ngoài simulated latency range.

Do đó train randomize `k` không thay thế latency estimator/runtime scheduling. Nó chỉ giúp network **biết cách xử lý nhiều loại prefix** mà estimator đưa ra.

## Ví dụ từng bước

Robot đang dựng một hộp carton. Observation tại thời điểm `t` cho thấy tay đang ép một mép hộp; chunk cũ còn 8 actions chưa execute. Network server estimate sẽ mất khoảng 100 ms, tức `k=5` ở 50 Hz. Robot sẽ execute 5 actions của chunk cũ trong lúc network sinh chunk mới. Inference input nhận `a_1...a_5` sạch. Model chỉ phải generate `a_6...a_H` sao cho condition trên observation và prefix; khi kết quả tới, robot tiếp tục quỹ đạo hợp lý mà không hard switch sang một mode khác.

Trong train, model đã thấy các mẫu với k=0,1,2,...10 (không chỉ 5), nên forward call với `k=5` không phải trường hợp đặc biệt. Nếu latency hôm sau lên `k=7`, policy vẫn làm được trong distribution đã train. Đây là **domain randomization trên inference delay**, tương tự sim-to-real randomize mass/friction, nhưng uncertainty nằm trong hệ thống computing.

## Results

**Simulation:** Tác giả dùng 12 task động trong Kinetix từ RTC trước. So inference-time RTC với training-time RTC theo delay. Kết quả report cho thấy training-time method có lợi thế rõ khi delay tăng (`d≥2` trong mô phỏng được mô tả), trong khi ở delay rất nhỏ đôi khi không mạnh bằng baseline. Đây không phải một chiến thắng tuyệt đối trên mọi k.

**Robot thật:** Fine-tune từ **π0.6** cho box building và espresso making, so synchronous, inference-time RTC và training-time RTC. Paper báo training-time approach giữ success/duration gần với inference-time RTC, nhưng latency end-to-end khoảng **108 ms** so với **135 ms** trong setting được đo. Chênh lệch 27 ms lớn hơn một controller step 20 ms. Tuy vậy, không nên suy từ hai số đo đó rằng mọi GPU/robot đều tiết kiệm đúng 27 ms.

**Điểm quan trọng:** đây là trade-off giữa một ít training adaptation và việc tránh compute gradient tại runtime. Nếu ứng dụng lặp inference hàng triệu lần, chi phí train thêm có thể dễ chấp nhận hơn chi phí trả thêm trong mọi action chunk.

## Limitations

**Paper thừa nhận:** Training phải chọn delay distribution tương đối phù hợp môi trường deploy. Nó không tận dụng soft guidance trên toàn phần overlapping future chunk tinh vi như RTC đầu tiên. Khi train nhiều delays, supervision phân bố không đều giữa action positions; tác giả thừa nhận train specialist riêng cho từng k có thể cải thiện một số setting.

**Phê bình độc lập:**

- **Capacity interference:** một model chung học conditional across k; với compute hữu hạn, specialist cho fixed latency có thể fit tốt hơn. Nhưng GPU routing nhiều checkpoints cũng gây complexity.
- **Latency OOD:** một policy train `0..10` không có guarantee ở `k=25`, đặc biệt nếu backend stall.
- **Ground-truth prefix mismatch:** trong train prefix lấy từ demonstration; trong deploy prefix là actions do policy sinh. Error trong prefix sẽ đưa model vào distribution khác training.
- **Action commitment phụ thuộc robot thực:** sensor-feedback và servo controller có thể khác lệnh đã gửi; committed action command không đảm bảo actuator thực hiện chính xác do contact/saturation.
- **Fine-tuning costs:** một model đã dùng cho nhiều nhiệm vụ có thể cần additional data/method integration để duy trì điều kiện k mà không quên action quality ban đầu.

## Connections

- [RTC inference-time](/paper/rtc-inference) là baseline trực tiếp và nơi giải thích guided inpainting.
- [ACT](/paper/act) giúp hiểu temporal aggregation và chunk boundary.
- [Diffusion Policy](/paper/diffusion-policy) giải thích flow/diffusion conditional trajectory sampling.
- [π0.5](/paper/pi-0-5) là representative modern flow-based VLA stack; paper training-time này đánh giá trực tiếp π0.6.

## Đọc code và tự kiểm chứng

Bắt đầu bằng một toy conditional flow model trên vector `A ∈ R^{20 × 3}`. Mỗi training batch sample `k∼Uniform(0,6)`, set prefix `τ=1` và postfix `τ∈[0,1]`; mask flow loss trên suffix. **Ablation quan trọng:** train (A) k fixed 3, (B) k random 0..6, (C) k random nhưng oversample k=3. Đánh giá MSE/success theo từng k, không chỉ average. Thêm artificial under-/over-estimated delays ở runtime và đo jerk. Đây là experiment nhỏ vừa đủ để hiểu paper mà không cần H100 hay humanoid.
