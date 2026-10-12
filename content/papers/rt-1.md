## Vì sao cần nghiên cứu này?

Trước RT-1, phần lớn robot learning vẫn theo cách tiếp cận kiểu “một nhiệm vụ, một policy”, hoặc cùng lắm là một nhóm nhiệm vụ tương đối gần nhau. Cái thiếu không chỉ là kiến trúc tốt hơn, mà là bằng chứng rằng cách tiếp cận từng thành công ở NLP/vision - gom dữ liệu lớn, đa dạng rồi huấn luyện một mô hình chung - cũng có thể mở rộng quy mô trong robot học. Khó ở chỗ action của robot phải được tính và thực thi theo thời gian thực, dữ liệu đắt hơn Internet rất nhiều, và dịch chuyển phân phối dữ liệu giữa vật thể, phông nền, nhiệm vụ và bối cảnh dễ làm policy thất bại ngay. RT-1 vì thế hỏi một câu rất nền tảng: **nếu ta thật sự mở rộng quy mô dữ liệu robot thật và dùng một Transformer đủ lớn, khả năng khái quát có tăng một cách có hệ thống không?**

## Kiến thức nền cần nắm

RT-1 là **behavior cloning có điều kiện ngôn ngữ**: mạng nhận khung hình `o_t` và chỉ dẫn `l`, xuất action `a_t`. Khác phân loại có giám sát thông thường, lỗi dự đoán tự làm thay đổi quan sát về sau: khi gripper lệch 2 cm, camera nhìn một bối cảnh khác với demo, dẫn tới **compounding error**. Một policy đa nhiệm phải giải cả grounding (chỉ dẫn ám chỉ vật nào), perception và điều khiển trong một lần chạy forward.

Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer. Lượng tử hóa gây sai số và ảnh hưởng lớn ở chuyển động có độ chính xác cao.

## Phương pháp thực hiện

RT-1 huấn luyện một Transformer policy khoảng 35M tham số trên khoảng **130 nghìn episode**, thu trong **17 tháng** bằng **13 robot** và phủ hơn **700 chỉ dẫn/nhiệm vụ**. Ảnh đi qua EfficientNet, chỉ dẫn ngôn ngữ đi vào FiLM conditioning, sau đó TokenLearner nén token thị giác để Transformer vẫn chạy đủ nhanh cho robot. Các action được lượng tử hóa thành token thay vì hồi quy trực tiếp vector liên tục. Policy chạy ở khoảng 3 Hz, nên đây còn là một bài toán hệ thống chứ không chỉ độ chính xác khi đánh giá offline.

Điểm quan trọng hơn kiến trúc là cách bài báo làm ablation dữ liệu. Họ tách ảnh hưởng của **lượng dữ liệu**, **độ đa dạng nhiệm vụ**, **kích thước mô hình** và bổ sung thêm dữ liệu ngoài phân phối chính. Nhờ vậy RT-1 không chỉ nói “mô hình hoạt động tốt”, mà cung cấp một trong những bằng chứng sớm rằng **sự đa dạng của kinh nghiệm quan trọng ít nhất ngang tổng số mẫu thô**.

## Ví dụ từng bước

Giả sử lệnh **"lấy quả táo đỏ đặt vào bát"**. `EfficientNet` mã hoá ảnh có nhiều đồ vật; chỉ dẫn đi vào FiLM để điều chỉnh trọng số các đặc trưng thị giác theo từ "táo đỏ" và "bát". `TokenLearner` rút gọn token không gian. Transformer dự đoán các thành phần action như dịch chuyển gripper, góc quay, độ mở kẹp và terminate. Sau khi thực thi, robot chụp khung hình mới và lặp lại. Đây là **behavior cloning trong vòng lặp kín** chứ không phải việc lập kế hoạch cho chuỗi hành động dài.

Khi chuyển robot sang một căn bếp khác, thất bại có thể do điều kiện chiếu sáng, vị trí đặt vật, hình học thao tác gắp hoặc hiểu biết về nhiệm vụ. Không thể chỉ nhìn tổng tỷ lệ thành công để biết nút thắt nằm ở đâu.

## Kết quả thực nghiệm

Trên tập hơn 700 chỉ dẫn đã huấn luyện, RT-1 đạt khoảng **97% thành công**. Ở các nhóm kiểm tra khả năng khái quát như nhiệm vụ mới, distractor mới và phông nền mới, tác giả nêu mức cải thiện lớn so với phương pháp đối chứng trước đó, lần lượt khoảng **25, 36 và 18 điểm** trong các thiết lập được báo cáo. Một thí nghiệm rất đáng nhớ là khi thêm dữ liệu bin-picking từ Kuka vào mixture: khả năng khái quát sang bin-picking tăng gần gấp đôi mà hiệu năng trên tập nhiệm vụ gốc không bị phá đáng kể.

Các thí nghiệm ablation cũng cho thấy giảm **độ đa dạng nhiệm vụ** gây hại khả năng khái quát rất mạnh. Có những thiết lập mà bỏ 25% số nhiệm vụ gây tổn thất tương tự hoặc lớn hơn việc bỏ một lượng mẫu đáng kể nhưng vẫn giữ sự đa dạng. Đây là lý do RT-1 thường được nhắc như một bằng chứng sớm cho câu: **robotics cần mở rộng độ bao phủ nhiệm vụ, không chỉ lặp lại cùng một kỹ năng 100 nghìn lần**.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** RT-1 vẫn là imitation learning, nên về nguyên tắc khó vượt quá phạm vi hành vi của demonstrator. “Nhiệm vụ chưa xuất hiện khi huấn luyện” phần lớn là sự kết hợp lại các động tác cơ bản đã thấy, không phải robot tự phát minh kỹ năng vật lý mới. Căn bếp mới vẫn có cấu trúc khá gần phân phối dữ liệu huấn luyện, và những nhiệm vụ thao tác chưa đòi hỏi dexterity/contact cực cao. Mô hình lớn hơn cũng nhanh chóng gặp nút thắt về độ trễ vì control phải chạy thời gian thực.

**Phê bình thêm:** RT-1 gần như chưa chứng minh khả năng chuyển giao giữa những cấu trúc robot khác nhau theo nghĩa hiện đại; 13 robot vẫn là cùng họ thiết bị và cấu hình phần cứng hơn là 13 cấu trúc cơ khí khác biệt. Discrete action tokens và tần số điều khiển thấp cũng đặt trần cho những nhiệm vụ cần các điều chỉnh ở tần số cao. Tập dữ liệu rất lớn cho năm 2023 nhưng vẫn được thu thập theo hệ thống phân loại nhiệm vụ do con người thiết kế, nên tính đa nhiệm của nó vẫn giới hạn trong một tập bài toán tương đối hẹp. Cuối cùng, tỷ lệ thành công cao trên nhiệm vụ huấn luyện dễ khiến người đọc quên rằng **phục hồi sau sai sót, suy luận liên quan đến lực và trí nhớ trong nhiệm vụ kéo dài** gần như chưa được đụng tới.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [OpenVLA](/paper/openvla)

## Đọc code và tự kiểm chứng

Làm một thử nghiệm nhỏ: huấn luyện BC trên ảnh + state với hai phiên bản `shared policy` và `separate policy per task`, đánh giá tỷ lệ thành công trên những bối cảnh thuộc tập kiểm tra. Đặt số demonstration cố định nhưng thay mức độ đa dạng nhiệm vụ. Quan sát thành công so với dữ liệu breadth, không chỉ loss khi huấn luyện.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
