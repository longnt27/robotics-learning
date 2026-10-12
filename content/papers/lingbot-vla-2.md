> **Bài do bạn cung cấp** (file tên `MoE.pdf`). Tên đầy đủ: [From Foundation to Application: Improving VLA Models in Practice](https://arxiv.org/abs/2607.06403), giới thiệu **LingBot-VLA 2.0**. Đừng để tên file làm nhầm rằng paper chỉ nói về MoE: nội dung là hệ thống gồm data processing, unified action representation, MoE action expert, predictive distillation và đánh giá robot thật.

## Why

### Foundation VLA đẹp trên benchmark nhưng khó triển khai robot thật

Khi một công ty robot muốn deploy cùng policy lên cả robot hai tay, humanoid và mobile manipulator, họ gặp ít nhất ba vấn đề: (1) heterogeneous data không sạch và không chung schema, (2) một dense action network có thể bị nghẽn capacity khi nhiều robot/task cạnh tranh, (3) robot phải hiểu **future consequences** thay vì chỉ matching next-action pattern. LingBot-VLA 2.0 chọn giải cả ba, trong một pipeline phù hợp cho production fleet.

Nó không cố chứng minh một kiến trúc magic nào đập tan π0.5. Contribution nằm ở **engineering research**: data curation hàng chục nghìn giờ, unified representation cho whole-body, sparse MoE để tăng capacity và auxiliary future-state learning. Đây rất gần công việc của một team VLA pretraining nội bộ.

## Kiến thức nền

**Dense Transformer FFN:** mọi token đi qua cùng network; nhiều tasks/embodiments có thể tranh chấp weights. **Mixture-of-Experts (MoE):** router chọn một vài FFN experts mỗi token, nhiều total parameters nhưng activation sparse. **Load balancing:** chống router dồn toàn bộ tokens vào một expert. **Body/DoF canonicalization:** ánh xạ những cơ cấu chấp hành khác nhau vào một schema chung và mask slots không dùng. **World-model proxy:** predict future latent features không nhất thiết reconstruct future RGB pixel.

Cần phân biệt **cross-embodiment representational alignment** và **actual physical transfer**. Hai robot có shared 55D vector chưa có nghĩa một motion trong robot A áp dụng hợp lệ cho robot B. Còn khi MoE route token đến expert 3, không thể tự khẳng định expert 3 chuyên grasping nếu chưa phân tích routing statistics.

## How

### 1. Data pipeline: từ 90.000 giờ raw robot còn 50.000 giờ usable

Paper mô tả khoảng **90.000 giờ raw robot data**, sau curation còn **50.000 giờ** trên **20 robot configurations**. Nguồn trải dài single arm, dual arm, half/full humanoid, dexterous hand và mobile setups. Họ bổ sung khoảng **10.000 giờ egocentric human video** sau lọc từ khoảng 20.000 giờ raw. Tổng pretraining corpus được mô tả khoảng **60.000 giờ**.

Curation không phải dọn tên file. Filter video no interaction, walking-only, third-person, irrelevant hands hoặc tracking lỗi; tự động chia subtasks; align camera and hand trajectories. Nếu không làm, model học quá nhiều idle/transit frames, còn contact-rich events hiếm. **Figure 5** cho thấy phân phối nguyên thủy lệch rất mạnh vào *move* và *transit*, trong khi *cut/stir/detach* cực ít. Đây là long-tail bias phải giải bằng sampling, weighting hoặc task-specific downstream stages.

### 2. Headcam video → 3D hand trajectory

Một human egocentric clip nhìn từ đầu có camera motion gây nhầm chuyển động. Paper dùng **SLAM** ước lượng camera pose theo thời gian và **MANO/hand pose estimation** để lấy cấu hình tay tương đối camera. Kết hợp hai thứ ra hand trajectory trong world frame, rồi transform future trajectory về **current camera coordinate** để train. Logic:

```text
headcam frames ───────────┬──────────────┐
                          │              │
                       SLAM          hand pose
                          │              │
                   camera motion     hand in camera
                          └─────┬────────┘
                                 ▼
                      world-space hand track
                                 ▼
                    action relative to current view
```

SLAM có thể drift, MANO có thể fail khi occlusion hoặc tay chồng lên vật. Quality filters cần xử lý lỗi này. Đây không phải đơn giản lấy raw pixel flow làm action. Human trajectory cung cấp một dạng **surrogate action supervision**, và schema phải hiểu surrogate đó không tương đương actuator torque.

### 3. Canonical whole-body action: 55 dimensions

Paper đề xuất một vector action cố định **55D** chia các vùng: arm joints (14), end-effector poses (14), gripper (2), hand joints (12), waist (4), head (2), mobile base (3) và reserved (4). Robot không có bộ phận nào thì slots đó padding/masking. Cách này giúp chung model IO schema dù control hardware khác nhau.

```text
arm | EEF | gripper | fingers | waist | head | base | reserved
 14    14      2        12       4       2      3       4
```

Nhưng 55D mới là **container semantics**, không bảo chứng joint/EEF cùng một lệnh có nghĩa với mọi robot. Action preprocessing vẫn phải biết absolute/relative, units, coordinate frames và inverse normalization. Paper có ablation joint vs EEF và action normalization rất đáng đọc vì nó đo rõ ảnh hưởng của những lựa chọn tưởng “plumbing”.

### 4. Sparse MoE bên trong action expert

Trong dense action expert, cùng FFN weights cập nhật từ task có dynamics khác nhau. LingBot thay các FFN bằng **sparse Mixture-of-Experts**, gồm một **shared expert** luôn active và routed experts được chọn bằng token-level top-K router. Router không hard-code robot A → expert 1, tay trái → expert 2. Nó học specialization dựa trên hidden state của từng token.

Affinity score dùng **sigmoid routing**, thay vì softmax competition hoàn toàn giữa mọi experts. Để tránh load imbalance, tác giả sử dụng **auxiliary-loss-free balancing** lấy cảm hứng từ DeepSeek-V3: điều chỉnh expert-specific routing bias theo mức utilization, nhưng mixture weight chính vẫn dựa trên unmodified affinity scores. Vì không thêm load-balancing auxiliary loss vào primary objective, họ hạn chế gradient conflict với action loss.

Architecture ablation giữ khoảng **0.6B active parameters**, so **dense ~0.6B total** với **MoE ~1.6B total / ~0.6B active**, cho validation action error/loss tốt hơn ở MoE. Lưu ý đây là tăng total parameter capacity dưới compute tương đương, **không phải phép so bằng nhau về total model size**. MoE còn có routing/communication overhead thực tế, nhất là khi distributed serving.

### 5. Dual-query predictive distillation

Paper bổ sung hai learnable queries: `Q_t` đại diện tình trạng hiện tại và `Q_{t+T}` đại diện future state. Hai teachers cung cấp supervision: **LingBot-Depth** cho geometry/depth, **DINO-Video** cho semantic/motion-aware visual representations. DINO-Video kế thừa vision encoder DINOv3 và thêm temporal processing, được train trên millions of clips trong pipeline paper.

Thay vì bắt VLA sinh toàn bộ future pixels, student học **future latent features**. Đấy là một **proxy objective** để hướng hidden state chứa thông tin về thay đổi scene. Nó có thể giúp model lý giải: nếu tay đẩy cốc, cốc sẽ ở đâu sau một horizon. Nhưng loss feature prediction không chứng minh model đã học full physical world model hoặc có khả năng counterfactual planning.

### 6. Action normalization và loss choices

Đây là phần paper rất đáng học: relative joint actions cho average success **55.0%**, absolute joint **33.7%** trong một ablation. Joint vs EEF average gần nhau (**55.0 vs 56.0**) nhưng từng task có thể đảo chiều rất lớn; coordinate representation phù hợp loại contact/task. MeanStd normalization báo khoảng **55.0%**, so MinMax **47.5%** và Q01-Q99 **47.4%** trên setting tương ứng; L2 loss cũng báo hơn L1 ở average ablation. Những số này **không phải quy tắc phổ quát cho mọi robot**, mà evidence rằng preprocessing choices đáng làm ablation nghiêm túc.

## Ví dụ từng bước

Giả sử công ty có Franka arm, dual-arm Magic và humanoid với mobile base. Data từ mỗi robot đi qua adapter riêng: camera calibration, joints/EEF conventions và normalization. Episode dài được chia hành động `move`, `open`, `close`, `wipe`, `transit`... với language labels. Robot/human trajectories được map vào canonical representation kèm mask slots không hợp lệ. Khi batch action tokens đi qua action expert, router chọn sparse experts theo feature token, trong lúc shared expert giữ common capacity. Auxiliary queries còn học target latent features cho hiện tại/tương lai.

Đến deployment, humanoid có thêm head/waist/base slots; Franka thì không. Nếu robot output sai normalization khiến gripper command gấp 100 lần, mô hình lớn không cứu được. Và nếu 80% data là transit/move, model không tự nhiên giỏi contact-rich precision mà thiếu rare events.

## Results

**MoE scaling:** Figure 7 cho training loss và action validation error của sparse MoE thấp hơn dense với active-compute gần tương đương. Đây là evidence hữu ích cho capacity scaling, chưa trực tiếp tách toàn bộ gain real-world thành contribution của MoE.

**GM-100 bimanual evaluation:** Trên Agilex Cobot Magic, report average *progress/success* khoảng **66.2 / 34.4** cho LingBot 2.0, so **59.1 / 32.2** cho π0.5 trong cùng bảng. Galaxea có khoảng **34.6 / 15.6** so π0.5 **27.4 / 8.9**. Gain success hiện hữu nhưng không phải thắng tuyệt đối mọi task; một số task vẫn success **0%**.

**Long-horizon mobile manipulation:** paper thử refrigerator organization và stove cleaning, đo cả in-domain/out-of-domain (OOD). OOD success thấp hơn nhiều in-domain. Ví dụ refrigerator OOD LingBot khoảng **13.3%**, π0.5 khoảng **6.7%**. Đây là một con số rất đáng để nhớ vì nó cho thấy generalist vẫn cực nhạy khi đổi object/start configuration.

**Kết quả cần phân biệt:** task progress là hoàn thành một phần chuỗi, task success là hoàn thành mục tiêu cuối. Trong 11-step household task, model có thể làm được 8 bước nhưng fail bước đặt cuối, tạo progress tốt song success thấp. Vì vậy claim production-ready phải nhìn cả precision, recovery và contact success, không chỉ progress averages.

## Limitations

**Từ paper và phạm vi experiments:** Heterogeneous human video action labels cần SLAM/hand tracking có noise. Model cần đại lượng pretraining corpus và deployment calibration lớn. OOD success còn khiêm tốn trên vài long-horizon tasks; không phải robot generalist đã solved.

**Phê bình độc lập:**

- **MoE specialization chưa interpretable:** token-level experts có thể route theo camera/background hơn là body part hoặc skill; cần analyze expert distributions mới khẳng định semantics.
- **Confounded gains:** data curation, action schema, MoE và predictive objectives cùng thay đổi. Nếu thiếu full factorial ablation, không thể quy tất cả real-world gains cho một component.
- **Canonicalization có mất mát:** một 55D padded vector không đủ biểu diễn mọi morphology/contact force tactile data; nhiều hands cần DoFs hoặc feedback không hiện diện.
- **Teacher feature prediction có lỗ hổng:** predicting DINO/depth latent có thể học shortcut từ scene static, không thực sự encode causal consequences của chosen action.
- **Long-tail vẫn còn:** 10.000 giờ video curated nhưng primitive hiếm rất ít. Scale raw hours không đồng nghĩa scale kỹ năng hiếm.
- **So sánh hardware/task:** công bố performance dưới những calibration và post-training riêng; muốn chứng minh universal generalization phải đánh giá new robots/new tasks đồng thời, với budget ngang nhau.

## Connections

- [Open X-Embodiment](/paper/open-x-embodiment) là tiền đề để nghĩ về mixture đa morphology và semantics action.
- [GR00T N1](/paper/groot-n1) cũng dùng VLM+action expert và human video nhưng kiến trúc data/experts khác.
- [Qwen-VLA](/paper/qwen-vla) giải cùng bài toán generalist, dùng embodiment description thay vì chỉ phụ thuộc 55D schema.
- [Diffusion Policy](/paper/diffusion-policy) và [RDT-1B](/paper/rdt-1b) cung cấp nền generative action learning.
- [DROID](/paper/droid) cho góc nhìn thu dữ liệu robot ở nhiều environment đời thật.

## Đọc code và tự kiểm chứng

Tạo một **toy 55D action adapter** cho hai robot giả lập: Robot A 7D EEF/gripper, Robot B 14D joint + grippers. Unit-test mask và inverse normalization. Thử `MeanStd` vs `MinMax` trước khi động vào MoE. Sau đó triển khai một MoE action MLP nhỏ với 4 routed FFNs + 1 shared FFN, top-2 gating và histogram expert usage theo body-part/task label. Cuối cùng thêm auxiliary loss future visual features và ablate, nhưng luôn giữ **data budget, active compute và per-task evaluation giống nhau**. Đó là cách học đúng từ paper thay vì chép mỗi kiến trúc 1.6B parameters.
