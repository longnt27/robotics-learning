## Why

Mỗi robotics lab thường có một robot, một controller, một schema action và một dataset riêng. Nếu data của Franka không giúp WidowX và data của Kuka không giúp mobile manipulator thì robotics không thể scale kiểu foundation models; mỗi embodiment sẽ mãi là một silo. Open X-Embodiment hỏi: **có thể chuẩn hóa experience của nhiều robot đủ để train một policy chung và tạo positive transfer hay không?**

## Kiến thức nền cần nắm

Cross-embodiment không phải chỉ concat mọi `action` vào một tensor. Các robot khác nhau về degrees of freedom, control frequency, camera convention, proprioception và gripper command semantics. Dataset mixture có thể scale knowledge nhưng cũng dễ tạo conflict nếu không thống nhất representation.

## How

Dự án gom data từ **22 robot embodiments và 21 tổ chức**, tổng cộng hơn **1 triệu trajectories/episodes**, hàng trăm skills và task instances. Các dataset khác nhau được chuyển về một interface chuẩn, trong khi vẫn giữ metadata/action semantics cần thiết. Trên corpus đó, consortium train **RT-1-X** và **RT-2-X**, tức các phiên bản cross-embodiment của RT-1/RT-2.

Quan trọng về mặt infrastructure là paper không cố ép mọi robot thành cùng một hardware. Nó xây một format và training mixture để model có thể học representation dùng chung, rồi đo xem data từ robot A có giúp robot B hay không.

## Ví dụ từng bước

Robot A điều khiển EEF delta XYZ + gripper, robot B điều khiển joint angles; trộn raw vectors sẽ khiến action channel 1 mang hai nghĩa. RT-X-style training phải gắn embodiment, normalize, map hoặc giữ schema tương ứng; inference cần biết policy output được robot nhận theo convention nào.

So sánh multi-dataset checkpoint với single-dataset checkpoint trên cùng robot target giúp tách transfer thật với lợi ích chỉ do thêm samples.

## Results

RT-1-X đạt average success cao hơn khoảng **50%** so với việc chỉ dùng phương pháp/dataset riêng lẻ trong aggregate comparison của paper. RT-2-X cho generalization mạnh hơn rất rõ, có setting khoảng **3x** so với model chỉ train trên embodiment được đánh giá. Ablation trên Bridge và các subsets cho thấy data từ embodiment khác có thể tạo **positive transfer**, và gains tăng khi model đủ capacity để hấp thụ heterogeneity.

Paper này không chứng minh “mọi robot đều học lẫn nhau”, nhưng nó chứng minh đủ để thay đổi hướng field: cross-embodiment pretraining từ đó trở thành một assumption hợp lý để đầu tư thay vì một fantasy.

## Limitations

**Paper thừa nhận:** morphology/sensor/action diversity vẫn chưa phủ những embodiment thật sự cực khác nhau. Paper cũng chưa giải được criterion nào dự đoán data source nào sẽ positive transfer và source nào sẽ gây negative transfer. Generalization sang một robot hoàn toàn mới chưa được test theo nghĩa mạnh nhất.

**Phê bình thêm:** dataset contribution rất lệch về quantity và task distribution giữa các lab. Nhiều robot vẫn là tabletop manipulators với abstraction EEF/gripper tương đối giống nhau, nên “22 embodiments” nghe rộng hơn mức physical diversity thật. Chuẩn hóa action có thể che hoặc làm méo morphology-specific semantics. RT-2-X lại cực lớn và khó reproduce. Open X chứng minh pooling **có thể** hữu ích, chưa chứng minh một universal action space đã được giải.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [octo](/paper/octo)
- [openvla](/paper/openvla)
- [lingbot vla 2](/paper/lingbot-vla-2)

## Đọc code và tự kiểm chứng

Đọc schema RLDS của hai embodiments, liệt kê từng field/units/action frame và viết validator. Chạy thống kê distribution per robot trước khi nghĩ đến train scale lớn.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
