## Vì sao cần nghiên cứu này?

Lifelong learning không chỉ hỏi “nhiệm vụ mới làm được bao nhiêu %”, mà còn hỏi hai câu khó hơn: **học nhiệm vụ cũ có giúp học nhiệm vụ mới nhanh hơn không**, và **học nhiệm vụ mới có làm quên nhiệm vụ cũ không**. Các benchmark robot trước đó không tách rõ kiến thức khai báo như vật thể/quan hệ không gian với kiến thức quy trình như chuyển động/chuỗi mục tiêu. LIBERO được xây để kiểm tra chính xác các dạng chuyển giao đó trong môi trường thao tác robot có kiểm soát.

## Kiến thức nền cần nắm

Học liên tục (lifelong/continual learning) khác học đa nhiệm (multi-task learning): nhiệm vụ **đến tuần tự**, mô hình được cập nhật sau mỗi nhiệm vụ và có thể quên nhiệm vụ đã học. Benchmark phải tách hai câu hỏi: chuyển kiến thức sang nhiệm vụ mới có nhanh hơn không, và sau khi học nhiệm vụ mới mô hình có còn làm được nhiệm vụ cũ không.

## Phương pháp thực hiện

LIBERO có **130 nhiệm vụ** và tạo nhiệm vụ theo quy tắc. Các suite chính gồm **LIBERO-Spatial**, **LIBERO-Object**, **LIBERO-Goal** và **LIBERO-100**; phần long-horizon dùng một split riêng từ LIBERO-100. Mỗi nhiệm vụ có khoảng **50 demonstration chất lượng cao do con người điều khiển từ xa**. Điều kiện hoàn thành nhiệm vụ được được mô tả chính thức bằng predicates kiểu `Open`, `TurnOff`, `On`, `In`.

Bài báo gốc đánh giá các thuật toán học liên tục như sequential fine-tuning, replay, EWC và PackNet. Các chỉ số không chỉ đo tỷ lệ hoàn thành nhiệm vụ mà còn **Forward Transfer (FWT)**, **Negative Backward Transfer (NBT)** và AUC để đo diễn biến học tập qua chuỗi nhiệm vụ.

## Ví dụ từng bước

Huấn luyện một policy lần lượt trên mở ngăn kéo, nhặt mug, đặt mug vào bát. Sau mỗi nhiệm vụ, chạy đánh giá trên tất cả nhiệm vụ trước. Nếu nhiệm vụ mới được 90% nhưng nhiệm vụ cũ tụt về 10%, mô hình đang **catastrophically forgetting**. LIBERO cung cấp nhóm nhiệm vụ và thước đo chuyển giao/retention, nhưng thành tích benchmark không tự chứng minh robot generalist ngoài đời.

Khi chạy env, thành công phải đến từ **closed-loop rollout và điều kiện hoàn thành trong simulator**, không phải loss khi huấn luyện.

## Kết quả thực nghiệm

Một kết quả khá trái trực giác là **naive sequential fine-tuning có FWT tốt**, tức biểu diễn học từ nhiệm vụ trước đôi khi giúp nhiệm vụ sau, dù nó quên nhiệm vụ cũ. PackNet bảo vệ retention khá tốt nhưng đổi lại dung lượng biểu diễn của mô hình bị chia nhỏ. Experience Replay là lựa chọn tương đối ổn định, còn EWC không nổi bật trong thiết lập này. Bài báo cũng thử BERT/CLIP/GPT-style embedding của nhiệm vụ và thấy **không có khác biệt lớn so với TaskID** trong nhiều thiết lập.

Một kết quả đáng nhớ khác: pretraining có giám sát trên LIBERO-90 **không tự động giúp** downstream lifelong learning trên 10 nhiệm vụ long-horizon, thậm chí có thể gây negative chuyển giao. Điều đó cảnh báo rất sớm rằng “pretrain nhiều hơn” không đủ; phân phối/mục tiêu huấn luyện phải đúng.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** đây là mô phỏng benchmark với phạm vi vật thể/nhiệm vụ và mô phỏng vật lý có giới hạn; tác giả coi benchmark là nền để cộng đồng tiếp tục mở rộng kiến trúc, thuật toán và pretraining.

**Phê bình thêm:** đến 2026, LIBERO đã gần **bão hòa** với các VLA hàng đầu, nhiều mô hình nằm vùng 95-99% tỷ lệ thành công trung bình. Vì thế nó vẫn rất hữu ích như regression/unit test nhưng khó phân biệt hiệu năng của các VLA hàng đầu. Cộng đồng còn thường chỉ báo cáo một tỷ lệ thành công trung bình duy nhất và bỏ qua mục tiêu lifelong ban đầu của benchmark, tức biến LIBERO thành thứ nó không được thiết kế để làm. Bối cảnh tĩnh, tabletop và mục tiêu predicates sạch cũng không test môi trường luôn thay đổi, mobile manipulation, bất định khi tiếp xúc vật thể, phục hồi hay nhận thức trong điều kiện thực tế. Một mô hình 98% LIBERO vẫn có thể kém hiệu quả ngoài nhà bếp thật, chuyện này con người đáng lẽ không cần benchmark để nhắc nhưng lịch sử vẫn cho thấy là cần.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [OpenVLA](/paper/openvla)
- [RoboCasa](/paper/robocasa)

## Đọc code và tự kiểm chứng

Chạy một nhiệm vụ BC-RNN trong repo LIBERO chính thức trên T4, rồi thử 10 vs 50 demos. Sau đó chạy hai nhiệm vụ theo thứ tự để kiểm tra hiện tượng quên; báo cáo tỷ lệ thành công với nhiều random seed.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
