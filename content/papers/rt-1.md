## Why

Trước RT-1, phần lớn robot learning vẫn có mental model kiểu “một task, một policy”, hoặc cùng lắm là một nhóm task tương đối gần nhau. Cái thiếu không chỉ là architecture tốt hơn, mà là bằng chứng rằng recipe đã thành công ở NLP/vision - gom data lớn, đa dạng rồi train một model chung - cũng có thể scale trong robotics. Khó ở chỗ robot action phải chạy real-time, data đắt hơn Internet rất nhiều, và distribution shift giữa object, background, task và scene dễ làm policy chết ngay. RT-1 vì thế hỏi một câu rất nền tảng: **nếu ta thật sự scale real-robot data và dùng một Transformer đủ lớn, generalization có tăng một cách có hệ thống không?**

## Kiến thức nền cần nắm

RT-1 là **behavior cloning có điều kiện ngôn ngữ**: mạng nhận frame ảnh `o_t` và instruction `l`, xuất action `a_t`. Khác supervised classification thông thường, lỗi dự đoán tự làm thay đổi observation về sau: khi gripper lệch 2 cm, camera nhìn một scene khác với demo, dẫn tới **compounding error**. Một policy đa nhiệm phải giải cả grounding (instruction ám chỉ vật nào), perception và điều khiển trong một lần forward.

Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer. Quantization gây sai số và ảnh hưởng lớn ở chuyển động có độ chính xác cao.

## How

RT-1 train một Transformer policy khoảng 35M tham số trên khoảng **130 nghìn episode**, thu trong **17 tháng** bằng **13 robot** và phủ hơn **700 instruction/task**. Ảnh đi qua EfficientNet, language instruction đi vào FiLM conditioning, sau đó TokenLearner nén visual tokens để Transformer vẫn chạy đủ nhanh cho robot. Actions được discretize thành tokens thay vì regress continuous vector trực tiếp. Policy chạy ở khoảng 3 Hz, nên đây đã là một bài toán systems chứ không chỉ accuracy offline.

Điểm quan trọng hơn architecture là cách paper làm ablation data. Họ tách ảnh hưởng của **data quantity**, **task diversity**, **model size** và bổ sung thêm data ngoài distribution chính. Nhờ vậy RT-1 không chỉ nói “model hoạt động tốt”, mà cung cấp một trong những bằng chứng sớm rằng **diversity của experience quan trọng ít nhất ngang raw sample count**.

## Ví dụ từng bước

Giả sử lệnh **"lấy quả táo đỏ đặt vào bát"**. `EfficientNet` mã hoá ảnh có nhiều đồ vật; instruction đi vào FiLM để reweight visual features theo từ "táo đỏ" và "bát". `TokenLearner` rút gọn spatial tokens. Transformer dự đoán các thành phần action như dịch chuyển gripper, góc quay, độ mở kẹp và terminate. Sau khi execute, robot chụp frame mới và lặp lại. Đây là **closed-loop behavior cloning** chứ không phải sequence planning dài.

Khi chuyển robot sang một căn bếp khác, failure có thể do illumination, placement, grasp geometry hoặc task knowledge. Không thể chỉ nhìn tổng success rate để biết nút thắt nằm ở đâu.

## Results

Trên tập hơn 700 instruction đã train, RT-1 đạt khoảng **97% success**. Ở các nhóm generalization như task mới, distractor mới và background mới, paper báo mức cải thiện lớn so với baseline trước đó, lần lượt khoảng **25, 36 và 18 điểm** trong các thiết lập được báo cáo. Một thí nghiệm rất đáng nhớ là khi thêm data bin-picking từ Kuka vào mixture: khả năng generalize sang bin-picking tăng gần gấp đôi mà performance trên tập task gốc không bị phá đáng kể.

Ablation cũng cho thấy giảm **task diversity** gây hại generalization rất mạnh. Có những setting mà bỏ 25% số task gây tổn thất tương tự hoặc lớn hơn việc bỏ một lượng sample đáng kể nhưng vẫn giữ diversity. Đây là lý do RT-1 thường được nhắc như evidence sớm cho câu: **robotics cần scale breadth, không chỉ repeat cùng một skill 100 nghìn lần**.

## Limitations

**Paper thừa nhận:** RT-1 vẫn là imitation learning, nên về nguyên tắc khó vượt quá phạm vi behavior của demonstrator. “Unseen task” phần lớn là recombination của motion primitives đã thấy, không phải robot tự phát minh kỹ năng vật lý mới. Kitchen mới vẫn có cấu trúc khá gần training distribution, và các manipulation task chưa đòi hỏi dexterity/contact cực cao. Model lớn hơn cũng nhanh chóng gặp bottleneck latency vì control phải chạy real-time.

**Phê bình thêm:** RT-1 gần như chưa chứng minh cross-embodiment transfer theo nghĩa hiện đại; 13 robot vẫn là cùng family/hardware setup hơn là 13 morphology độc lập. Discrete action tokens và control rate thấp cũng đặt trần cho những task cần high-frequency correction. Dataset rất lớn cho năm 2023 nhưng vẫn được collect theo ontology task do con người thiết kế, nên “generalist” vẫn là generalist bên trong một chiếc hộp khá gọn. Cuối cùng, success rate cao trên task train dễ khiến người đọc quên rằng **recovery từ lỗi, force reasoning và long-horizon memory** gần như chưa được đụng tới.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [rt 2](/paper/rt-2)
- [openvla](/paper/openvla)

## Đọc code và tự kiểm chứng

Làm một thử nghiệm nhỏ: train BC trên ảnh + state với hai phiên bản `shared policy` và `separate policy per task`, đo held-out scene success. Đặt số demonstration cố định nhưng thay tỷ lệ task diversity. Quan sát success so với data breadth, không chỉ training loss.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
