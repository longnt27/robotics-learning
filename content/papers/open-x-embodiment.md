## Vì sao cần nghiên cứu này?

Mỗi robotics phòng thí nghiệm thường có một robot, một bộ điều khiển, một schema action và một tập dữ liệu riêng. Nếu dữ liệu của Franka không giúp WidowX và dữ liệu của Kuka không giúp mobile manipulator thì robotics không thể scale kiểu foundation mô hình; mỗi embodiment sẽ mãi là một silo. Open X-Embodiment hỏi: **có thể chuẩn hóa kinh nghiệm của nhiều robot đủ để huấn luyện một policy chung và tạo positive chuyển giao hay không?**

## Kiến thức nền cần nắm

Cross-embodiment không phải chỉ concat mọi `action` vào một tensor. Các robot khác nhau về degrees of freedom, tần số điều khiển, camera convention, proprioception và gripper command semantics. Tập dữ liệu mixture có thể scale kiến thức nhưng cũng dễ tạo conflict nếu không thống nhất biểu diễn.

## Phương pháp thực hiện

Dự án gom dữ liệu từ **22 robot embodiments và 21 tổ chức**, tổng cộng hơn **1 triệu các quỹ đạo/episodes**, hàng trăm kỹ năng và nhiệm vụ instances. Các tập dữ liệu khác nhau được chuyển về một interface chuẩn, trong khi vẫn giữ metadata/action semantics cần thiết. Trên corpus đó, consortium huấn luyện **RT-1-X** và **RT-2-X**, tức các phiên bản cross-embodiment của RT-1/RT-2.

Quan trọng về mặt infrastructure là bài báo không cố ép mọi robot thành cùng một phần cứng. Nó xây một format và hỗn hợp dữ liệu huấn luyện để mô hình có thể học biểu diễn dùng chung, rồi đo xem dữ liệu từ robot A có giúp robot B hay không.

## Ví dụ từng bước

Robot A điều khiển EEF delta XYZ + gripper, robot B điều khiển joint angles; trộn thô vectors sẽ khiến action channel 1 mang hai nghĩa. RT-X-style huấn luyện phải gắn embodiment, normalize, map hoặc giữ schema tương ứng; inference cần biết policy đầu ra được robot nhận theo convention nào.

So sánh multi-dataset checkpoint với single-dataset checkpoint trên cùng robot target giúp tách chuyển giao thật với lợi ích chỉ do thêm mẫu.

## Kết quả thực nghiệm

RT-1-X đạt tỷ lệ thành công trung bình cao hơn khoảng **50%** so với việc chỉ dùng phương pháp/tập dữ liệu riêng lẻ trong aggregate comparison của bài báo. RT-2-X cho khả năng khái quát mạnh hơn rất rõ, có thiết lập khoảng **3x** so với mô hình chỉ huấn luyện trên embodiment được đánh giá. Ablation trên Bridge và các subsets cho thấy dữ liệu từ embodiment khác có thể tạo **positive chuyển giao**, và gains tăng khi mô hình đủ dung lượng mô hình để hấp thụ heterogeneity.

Bài báo này không chứng minh “mọi robot đều học lẫn nhau”, nhưng nó chứng minh đủ để thay đổi hướng field: cross-embodiment pretraining từ đó trở thành một assumption hợp lý để đầu tư thay vì một fantasy.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** morphology/cảm biến/action sự đa dạng vẫn chưa phủ những embodiment thật sự cực khác nhau. Bài báo cũng chưa giải được criterion nào dự đoán dữ liệu source nào sẽ positive chuyển giao và source nào sẽ gây negative chuyển giao. Generalization sang một robot hoàn toàn mới chưa được test theo nghĩa mạnh nhất.

**Phê bình thêm:** tập dữ liệu contribution rất lệch về quantity và phân phối nhiệm vụ giữa các phòng thí nghiệm. Nhiều robot vẫn là tabletop manipulators với abstraction EEF/gripper tương đối giống nhau, nên “22 embodiments” nghe rộng hơn mức độ đa dạng đặc tính vật lý thật. Chuẩn hóa action có thể che hoặc làm méo morphology-specific semantics. RT-2-X lại cực lớn và khó reproduce. Open X chứng minh pooling **có thể** hữu ích, chưa chứng minh một universal action không gian đã được giải.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Octo](/paper/octo)
- [OpenVLA](/paper/openvla)
- [LingBot-VLA 2.0](/paper/lingbot-vla-2)

## Đọc code và tự kiểm chứng

Đọc schema RLDS của hai embodiments, liệt kê từng field/units/action khung hình và viết validator. Chạy thống kê phân phối per robot trước khi nghĩ đến huấn luyện scale lớn.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
