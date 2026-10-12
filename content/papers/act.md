## Why

Bimanual manipulation khó ở hai phía cùng lúc: hardware teleoperation đắt và imitation learning có horizon rất dài. Nếu predict từng action 50 Hz, một task vài chục giây có hàng nghìn decision, nên chỉ cần policy hơi lệch một chút là compounding error đủ giết cả episode. Paper muốn chứng minh rằng **low-cost hardware + một representation temporal tốt hơn** có thể học các skill hai tay khá tinh vi với lượng demo nhỏ.

## Kiến thức nền cần nắm

Một lần dự đoán `a_t` ở 50 Hz nghĩa là 50 decisions/giây, dễ sai số tích luỹ. **Action chunking** chuyển thành dự đoán `A_{t:t+H}`, giảm tần suất query nhưng vẫn có khả năng đóng vòng nếu overlap. **CVAE** mã hoá style của demonstration; latent `z` giúp phân biệt những chuyển động hai tay khác nhau cùng đạt mục đích.

## How

ALOHA là hệ leader-follower giá thấp cho teleoperation hai tay ở **50 Hz**. Về learning, paper đưa ra **Action Chunking with Transformers (ACT)**. Thay vì dự đoán một action, ACT predict một chunk `a_t ... a_{t+k}`. CVAE latent variable hấp thụ multimodality/style variation giữa demonstrations, còn Transformer xử lý image/state và sinh cả sequence.

Khi chạy, ACT query policy lặp lại và dùng **temporal ensembling** giữa các chunk overlap để làm motion mượt. Đây chính là ancestor của vấn đề mà RTC paper sau này nghiên cứu: chunk giúp temporal coherence nhưng tạo câu hỏi “khi chunk mới đến thì nối với chunk cũ thế nào?”.

## Ví dụ từng bước

Hai tay cầm mép áo và kéo. Policy stepwise dễ rung khi hai tay chỉ cần lệch pha một chút; ACT generate 50 actions tương quan để tay trái và phải di chuyển cùng nhịp. Ở mỗi observation, ACT tạo chunk mới chồng lên chunk cũ. **Temporal ensembling** dùng weighted average cho các action dự đoán cùng timestep.

Đây cũng là nơi xuất hiện vấn đề RTC sẽ sửa: average nhiều action modes đôi khi tạo action sai; nếu model chạy chậm, chunk stitching có thể gây jerk.

## Results

ACT vượt các baseline imitation-learning trước đó rất mạnh trong simulation lẫn real bimanual tasks. Paper báo second-best baselines có thể kém ACT tới hàng chục điểm, với chênh lệch khoảng **59, 49 và 29 điểm** ở một số setting simulation. Ablation cho thấy action chunking là yếu tố cực lớn: khi horizon tăng hợp lý, success có thể nhảy từ gần như không làm được lên mức đáng kể. Trên human demonstration data, bỏ CVAE cũng làm performance rơi rất mạnh, cho thấy multimodality của teleoperation không phải chuyện trang trí.

Một điểm thực dụng là nhiều task chỉ cần khoảng **10-20 phút demonstration** thay vì hàng giờ. Điều đó khiến ALOHA + ACT trở thành một recipe cực kỳ phổ biến cho lab nhỏ.

## Limitations

**Paper thừa nhận:** hardware không xử lý tốt high-force, multifinger hoặc những tương tác rất tinh vi. Các task deformable/contact khó như mở wrapper, ziploc có thể fail dù những substep đơn giản như pick/pull đã làm được. 50 demos vẫn không đủ cho mọi task và authors chỉ ra perception/pretraining/data scale là hướng tiếp theo.

**Phê bình thêm:** chunking đổi một loại lỗi lấy một loại lỗi khác: nó giảm compounding error nhưng giảm reactivity giữa chunk. Temporal averaging có thể average hai mode action hợp lệ thành trajectory không hợp lệ, đúng vấn đề RTC paper sau này nêu. Joint-space action và hardware setup cũng khá embodiment-specific. ACT là một policy motor rất tốt, nhưng **không phải general VLA**, không giải language understanding, cross-embodiment hay open-world semantic generalization.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [rtc inference](/paper/rtc-inference)
- [rtc training](/paper/rtc-training)

## Đọc code và tự kiểm chứng

Chạy một task ALOHA simulation, thử chunk 10/50/100, bật tắt temporal aggregation. Quan sát cả action smoothness lẫn rollout success. Log giới hạn VRAM và inferred control latency.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
