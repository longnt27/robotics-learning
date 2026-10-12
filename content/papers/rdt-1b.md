## Vì sao cần nghiên cứu này?

Bimanual manipulation khó hơn gripper-arm control vì action dimension lớn, coordination giữa hai tay phức tạp và demonstration dữ liệu càng hiếm. VLA autoregressive tokenization cũng không phải lựa chọn tự nhiên cho liên tục chuyển động nhiều chiều. RDT-1B hỏi: **nếu dùng một diffusion Transformer rất lớn và một biểu diễn vật lý thống nhất, có thể pretrain foundation motor policy cho bimanual manipulation không?**

## Kiến thức nền cần nắm

Autoregressive discrete action có thể mất độ chính xác khi thao tác hai tay phức tạp. Diffusion Transformer đưa một prior action liên tục mạnh hơn, nhưng cần giải nghĩa heterogeneous trạng thái robot/action. Canonical vật lý biểu diễn chính là nỗ lực quản lý sự đa dạng đó.

## Phương pháp thực hiện

RDT-1B là khoảng **1.2B-parameter diffusion Transformer**. Bài báo đưa ra **Physically Interpretable Unified Action Space** để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên dữ liệu không đồng nhất robot và post-train bằng hơn **6 nghìn bimanual episodes** cho target platform. Vision, ngôn ngữ và state được điều kiện vào diffusion action generator thay vì bắt action đi qua ngôn ngữ token vocabulary.

Kiến trúc được thiết kế để scale width/depth và exploit multimodal conditioning. Với few-shot adaptation, mô hình tận dụng đã pretrain prior về chuyển động rồi chỉ cần một lượng demonstration rất nhỏ cho nhiệm vụ mới.

## Ví dụ từng bước

Với một bimanual folding kỹ năng, mạng điều kiện hình ảnh + ngôn ngữ + trạng thái robot rồi mẫu cả action chunk cho hai tay. Đồng thời, tập dữ liệu robot khác có DoF/coordinate các khung hình khác; preprocessing phải quyết định joint/EEF conventions và mask cho dimension vắng.

Phải đọc riêng **vật lý of action schema** và **DiT kiến trúc**. Nếu canonical schema sai, scale mô hình chỉ học sai nhanh hơn.

## Kết quả thực nghiệm

Bài báo báo RDT-1B cải thiện tỷ lệ thành công của nhiệm vụ trung bình khoảng **56%** so với các các phương pháp đối chứng được dùng trong đánh giá. Nó thể hiện zero-shot robustness tốt hơn trước vật thể chưa xuất hiện khi huấn luyện/bối cảnh và đặc biệt mạnh trong bimanual kỹ năng. Ở một số few-shot thí nghiệm chỉ **1-5 demonstrations**, RDT-1B đã làm được các hành vi như handover/folding mà scratch hoặc smaller các phương pháp đối chứng gần như không làm được.

Kết quả khiến diffusion foundation policy trở thành một hướng nghiêm túc song song với autoregressive VLA. Nó cũng cho thấy **motor scaling** có thể cần kiến trúc khác ngữ nghĩa VLM scaling.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** bài báo không có một limitations section mạnh, nhưng phạm vi thí nghiệm chủ yếu vẫn quanh bimanual manipulation và target phần cứng family; general long-horizon/mobile hành vi chưa phải trọng tâm.

**Phê bình thêm:** “unified action không gian” vẫn dựa trên giả định rằng các nguồn dữ liệu có vật lý semantics đủ tương thích để map vào canonical biểu diễn. Một mô hình 1.2B + pretraining corpus lớn cũng có compute/dữ liệu barrier đáng kể. Diffusion lấy mẫu đem độ trễ riêng. Claims few-shot rất hấp dẫn nhưng số nhiệm vụ/embodiment chưa đủ để suy ra universal chuyển giao. RDT giải rất tốt **liên tục bimanual prior**, nhưng semantics, world kiến thức, phục hồi và long-horizon lập kế hoạch vẫn cần tầng khác.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Diffusion Policy](/paper/diffusion-policy)
- [GR00T N1](/paper/groot-n1)

## Đọc code và tự kiểm chứng

Trace một batch qua action normalization/vật lý mask; thay các giá trị NaN/padded joints để chắc loss không ăn nhầm. Test inverse transform để bảo toàn vị trí/độ mở gripper.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
