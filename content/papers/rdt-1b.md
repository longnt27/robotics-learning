## Why

Bimanual manipulation khó hơn gripper-arm control vì action dimension lớn, coordination giữa hai tay phức tạp và demonstration data càng hiếm. VLA autoregressive tokenization cũng không phải lựa chọn tự nhiên cho continuous high-dimensional motion. RDT-1B hỏi: **nếu dùng một diffusion Transformer rất lớn và một representation vật lý thống nhất, có thể pretrain foundation motor policy cho bimanual manipulation không?**

## Kiến thức nền cần nắm

Autoregressive discrete action có thể mất precision khi thao tác hai tay phức tạp. Diffusion Transformer đưa một prior continuous action mạnh hơn, nhưng cần giải nghĩa heterogeneous robot state/action. Canonical physical representation chính là nỗ lực quản lý sự đa dạng đó.

## How

RDT-1B là khoảng **1.2B-parameter diffusion Transformer**. Paper đưa ra **Physically Interpretable Unified Action Space** để chuẩn hóa state/action từ nhiều robot sources, rồi pretrain trên heterogeneous robot data và post-train bằng hơn **6 nghìn bimanual episodes** cho target platform. Vision, language và state được condition vào diffusion action generator thay vì bắt action đi qua language token vocabulary.

Architecture được thiết kế để scale width/depth và exploit multimodal conditioning. Với few-shot adaptation, model tận dụng pretrained motion prior rồi chỉ cần một lượng demonstration rất nhỏ cho task mới.

## Ví dụ từng bước

Với một bimanual folding skill, network condition image + language + robot state rồi sample cả action chunk cho hai tay. Đồng thời, dataset robot khác có DoF/coordinate frames khác; preprocessing phải quyết định joint/EEF conventions và mask cho dimension vắng.

Phải đọc riêng **physics of action schema** và **DiT architecture**. Nếu canonical schema sai, scale model chỉ học sai nhanh hơn.

## Results

Paper báo RDT-1B cải thiện task success trung bình khoảng **56%** so với các baselines được dùng trong evaluation. Nó thể hiện zero-shot robustness tốt hơn trước unseen objects/scenes và đặc biệt mạnh trong bimanual skills. Ở một số few-shot experiments chỉ **1-5 demonstrations**, RDT-1B đã làm được các behavior như handover/folding mà scratch hoặc smaller baselines gần như không làm được.

Kết quả khiến diffusion foundation policy trở thành một hướng nghiêm túc song song với autoregressive VLA. Nó cũng cho thấy **motor scaling** có thể cần architecture khác semantic VLM scaling.

## Limitations

**Paper thừa nhận:** paper không có một limitations section mạnh, nhưng phạm vi experiment chủ yếu vẫn quanh bimanual manipulation và target hardware family; general long-horizon/mobile behavior chưa phải trọng tâm.

**Phê bình thêm:** “unified action space” vẫn dựa trên giả định rằng các nguồn data có physical semantics đủ tương thích để map vào canonical representation. Một model 1.2B + pretraining corpus lớn cũng có compute/data barrier đáng kể. Diffusion sampling đem latency riêng. Claims few-shot rất hấp dẫn nhưng số task/embodiment chưa đủ để suy ra universal transfer. RDT giải rất tốt **continuous bimanual prior**, nhưng semantics, world knowledge, recovery và long-horizon planning vẫn cần tầng khác.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [diffusion policy](/paper/diffusion-policy)
- [groot n1](/paper/groot-n1)

## Đọc code và tự kiểm chứng

Trace một batch qua action normalization/physical mask; thay các giá trị NaN/padded joints để chắc loss không ăn nhầm. Test inverse transform để bảo toàn vị trí/độ mở gripper.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
