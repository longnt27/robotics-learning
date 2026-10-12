> **Bài do bạn cung cấp** (file tên `MoE.pdf`). Tên đầy đủ: [From Foundation to Application: Improving VLA Models in Practice](https://arxiv.org/abs/2607.06403), giới thiệu **LingBot-VLA 2.0**. Đừng để tên file làm nhầm rằng bài báo chỉ nói về MoE: nội dung là hệ thống gồm dữ liệu processing, unified biểu diễn action, MoE action expert, predictive distillation và đánh giá robot thật.

## Vì sao cần nghiên cứu này?

### Foundation VLA đẹp trên benchmark nhưng khó triển khai robot thật

Khi một công ty robot muốn deploy cùng policy lên cả robot hai tay, humanoid và mobile manipulator, họ gặp ít nhất ba vấn đề: (1) dữ liệu không đồng nhất không sạch và không chung schema, (2) một dense action mạng có thể bị nghẽn dung lượng mô hình khi nhiều robot/nhiệm vụ cạnh tranh, (3) robot phải hiểu **future consequences** thay vì chỉ matching next-action pattern. LingBot-VLA 2.0 chọn giải cả ba, trong một pipeline phù hợp cho production fleet.

Nó không cố chứng minh một kiến trúc magic nào đập tan π0.5. Contribution nằm ở **engineering research**: quy trình tuyển lọc dữ liệu hàng chục nghìn giờ, unified biểu diễn cho whole-body, sparse MoE để tăng dung lượng mô hình và auxiliary future-state learning. Đây rất gần công việc của một team VLA pretraining nội bộ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/lingbot-vla-2/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 tóm bốn mảnh ghép trong LingBot-VLA 2.0: tuyển lọc dữ liệu, chuẩn hoá action space 55 chiều, mở rộng action expert bằng sparse MoE và học biểu diễn trạng thái tương lai. Đọc hình như một hệ thống engineering research, không phải một block thần kỳ. Figure chỉ cho thấy các phần được ghép với nhau; muốn biết phần nào thực sự tạo gain phải xem ablation tách riêng data curation, normalization, MoE và predictive objective.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Một pipeline VLA hướng sản xuất: data curation, action 55D, sparse MoE và future-state feature prediction. Nó không cố chứng minh một kiến trúc đơn lẻ vượt xa π0.5. Contribution nằm ở engineering research: quy trình tuyển lọc dữ liệu hàng chục nghìn giờ, unified biểu diễn cho whole-body, sparse MoE để tăng dung lượng mô hình và auxiliary future-state learning.

**Vấn đề khoa học nằm ở đâu?** Pipeline robot đa embodiment phải xử lý cả nhãn video người, capacity model và khả năng dự đoán diễn tiến. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Chất lượng data + schema + capacity cùng tạo foundation VLA là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Curation nghiêm ngặt, unified 55D representation, sparse MoE và predictive distillation góp phần khác nhau. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail

**Luận điểm.** Pipeline robot đa embodiment phải xử lý cả nhãn video người, capacity model và khả năng dự đoán diễn tiến. Khi một công ty robot muốn deploy cùng policy lên cả robot hai tay, humanoid và mobile manipulator, họ gặp ít nhất ba vấn đề: (1) dữ liệu không đồng nhất không sạch và không chung schema, (2) một dense action mạng có thể bị nghẽn dung lượng mô hình khi nhiều robot/nhiệm vụ cạnh tranh, (3) robot phải hiểu future consequences thay vì chỉ matching next-action pattern.

**Tại sao lỗi này có hệ quả lớn?** Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality

**Luận điểm.** Canonical action theo một robot không phù hợp humanoid, mobile base và dexterous hand. Contribution nằm ở engineering research: quy trình tuyển lọc dữ liệu hàng chục nghìn giờ, unified biểu diễn cho whole-body, sparse MoE để tăng dung lượng mô hình và auxiliary future-state learning.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Canonical action theo một robot không phù hợp humanoid, mobile base và dexterous hand.. Thay đổi trọng tâm là: Chất lượng data + schema + capacity cùng tạo foundation VLA. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Curation nghiêm ngặt, unified 55D representation, sparse MoE và predictive distillation góp phần khác nhau.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

**Dense Transformer FFN:** mọi token đi qua cùng mạng; nhiều nhiệm vụ/embodiments có thể tranh chấp weights. **Mixture-of-Experts (MoE):** router chọn một vài FFN experts mỗi token, nhiều total parameters nhưng activation sparse. **Load balancing:** chống router dồn toàn bộ tokens vào một expert. **Body/DoF canonicalization:** ánh xạ những cơ cấu chấp hành khác nhau vào một schema chung và mask slots không dùng. **World-model proxy:** dự đoán future đặc trưng latent không nhất thiết reconstruct future RGB pixel.

Cần phân biệt **cross-embodiment representational alignment** và **actual vật lý chuyển giao**. Hai robot có shared 55D vector chưa có nghĩa một chuyển động trong robot A áp dụng hợp lệ cho robot B. Còn khi MoE route token đến expert 3, không thể tự khẳng định expert 3 chuyên grasping nếu chưa phân tích routing statistics.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Mixture-of-Experts (MoE): router chọn một vài FFN experts mỗi token, nhiều total parameters nhưng activation sparse.

**Khái niệm thành cấu trúc tính toán.** Sparse MoE: Tăng total parameters; chỉ kích hoạt một phần experts mỗi token. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Mixture-of-Experts (MoE): router chọn một vài FFN experts mỗi token, nhiều total parameters nhưng activation sparse. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

### 1. Quy trình xử lý dữ liệu: từ 90.000 giờ thô robot còn 50.000 giờ usable

Bài báo mô tả khoảng **90.000 giờ thô dữ liệu robot**, sau curation còn **50.000 giờ** trên **20 robot configurations**. Nguồn trải dài single arm, dual arm, half/full humanoid, dexterous hand và mobile setups. Họ bổ sung khoảng **10.000 giờ egocentric video con người** sau lọc từ khoảng 20.000 giờ thô. Tổng pretraining corpus được mô tả khoảng **60.000 giờ**.

Curation không phải dọn tên file. Filter video no interaction, walking-only, third-person, irrelevant hands hoặc tracking lỗi; tự động chia subtasks; align camera and hand các quỹ đạo. Nếu không làm, mô hình học quá nhiều idle/transit các khung hình, còn contact-rich events hiếm. **Figure 5** cho thấy phân phối nguyên thủy lệch rất mạnh vào *move* và *transit*, trong khi *cut/stir/detach* cực ít. Đây là long-tail bias phải giải bằng lấy mẫu, weighting hoặc task-specific downstream stages.

### 2. Headcam video → 3D hand quỹ đạo

Một con người egocentric clip nhìn từ đầu có camera chuyển động gây nhầm chuyển động. Bài báo dùng **SLAM** ước lượng camera pose theo thời gian và **MANO/hand pose estimation** để lấy cấu hình tay tương đối camera. Kết hợp hai thứ ra hand quỹ đạo trong world khung hình, rồi transform future quỹ đạo về **current camera coordinate** để huấn luyện. Logic:

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

SLAM có thể drift, MANO có thể fail khi occlusion hoặc tay chồng lên vật. Quality filters cần xử lý lỗi này. Đây không phải đơn giản lấy thô pixel flow làm action. Con người quỹ đạo cung cấp một dạng **surrogate action tín hiệu giám sát**, và schema phải hiểu surrogate đó không tương đương actuator torque.

### 3. Canonical whole-body action: 55 dimensions

Bài báo đề xuất một vector action cố định **55D** chia các vùng: arm joints (14), end-effector poses (14), gripper (2), hand joints (12), waist (4), head (2), mobile base (3) và reserved (4). Robot không có bộ phận nào thì slots đó padding/masking. Cách này giúp chung mô hình IO schema dù control phần cứng khác nhau.

```text
arm | EEF | gripper | fingers | waist | head | base | reserved
 14    14      2        12       4       2      3       4
```

Nhưng 55D mới là **container semantics**, không bảo chứng joint/EEF cùng một lệnh có nghĩa với mọi robot. Action preprocessing vẫn phải biết absolute/relative, units, coordinate các khung hình và inverse normalization. Bài báo có ablation joint vs EEF và action normalization rất đáng đọc vì nó đo rõ ảnh hưởng của những lựa chọn tưởng “plumbing”.

### 4. Sparse MoE bên trong action expert

Trong dense action expert, cùng FFN weights cập nhật từ nhiệm vụ có động lực học khác nhau. LingBot thay các FFN bằng **sparse Mixture-of-Experts**, gồm một **shared expert** luôn active và routed experts được chọn bằng token-level top-K router. Router không hard-code robot A → expert 1, tay trái → expert 2. Nó học specialization dựa trên hidden state của từng token.

Affinity score dùng **sigmoid routing**, thay vì softmax competition hoàn toàn giữa mọi experts. Để tránh load imbalance, tác giả sử dụng **auxiliary-loss-free balancing** lấy cảm hứng từ DeepSeek-V3: điều chỉnh expert-specific routing bias theo mức utilization, nhưng mixture weight chính vẫn dựa trên unmodified affinity scores. Vì không thêm load-balancing auxiliary loss vào primary mục tiêu huấn luyện, họ hạn chế gradient conflict với action loss.

Kiến trúc ablation giữ khoảng **0.6B active parameters**, so **dense ~0.6B total** với **MoE ~1.6B total / ~0.6B active**, cho validation action error/loss tốt hơn ở MoE. Lưu ý đây là tăng total parameter dung lượng mô hình dưới compute tương đương, **không phải phép so bằng nhau về total kích thước mô hình**. MoE còn có routing/communication overhead thực tế, nhất là khi distributed serving.

### 5. Dual-query predictive distillation

Bài báo bổ sung hai learnable queries: `Q_t` đại diện tình trạng hiện tại và `Q_{t+T}` đại diện future state. Hai teachers cung cấp tín hiệu giám sát: **LingBot-Depth** cho geometry/depth, **DINO-Video** cho ngữ nghĩa/motion-aware thị giác biểu diễn. DINO-Video kế thừa vision encoder DINOv3 và thêm theo thời gian processing, được huấn luyện trên millions of clips trong pipeline bài báo.

Thay vì bắt VLA sinh toàn bộ future pixels, student học **future đặc trưng latent**. Đấy là một **proxy mục tiêu huấn luyện** để hướng hidden state chứa thông tin về thay đổi bối cảnh. Nó có thể giúp mô hình lý giải: nếu tay đẩy cốc, cốc sẽ ở đâu sau một horizon. Nhưng loss đặc trưng dự đoán không chứng minh mô hình đã học full vật lý world model hoặc có khả năng counterfactual lập kế hoạch.

### 6. Action normalization và loss choices

Đây là phần bài báo rất đáng học: relative joint actions cho tỷ lệ thành công trung bình **55.0%**, absolute joint **33.7%** trong một ablation. Joint vs EEF average gần nhau (**55.0 vs 56.0**) nhưng từng nhiệm vụ có thể đảo chiều rất lớn; coordinate biểu diễn phù hợp loại contact/nhiệm vụ. MeanStd normalization báo khoảng **55.0%**, so MinMax **47.5%** và Q01-Q99 **47.4%** trên thiết lập tương ứng; L2 loss cũng báo hơn L1 ở average ablation. Những số này **không phải quy tắc phổ quát cho mọi robot**, mà evidence rằng preprocessing choices đáng làm ablation nghiêm túc.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/lingbot-vla-2/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 trực quan hoá tập dữ liệu nhiều robot, với kinematics và degrees of freedom khác nhau. Chính hình này giải thích vì sao 55D chỉ là schema/padded container: cùng slot 'arm joint' không bảo đảm cùng ý nghĩa cơ học ở hai robot. Masking, action units, frame transforms và mapping từ joint/EEF tới actuator thật phải được thiết kế rõ. Data pipeline càng đa dạng, nguy cơ lệch schema và gán nhãn sai càng đáng sợ; chỉ thêm parameters không sửa được những lỗi đó.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ xây hai robot giả lập: A có 7D EEF/gripper, B có 14D joint targets. Cả hai được đưa vào 55D có mask theo bộ phận, và target được normalize riêng theo convention. Kiểm tra encode→decode phải khôi phục action hợp lệ trước khi train. Sau đó dùng một action expert dense nhỏ làm baseline, đổi sang shared+routed MoE với active compute tương đương, theo dõi validation action error và router load balance. Cuối cùng mới thêm future-feature prediction bằng teacher cố định và kiểm tra nó có thật sự cải thiện các episode cần dự đoán hậu quả tiếp xúc không. Nếu thay tất cả cùng lúc, con số thành công không thể quy cho MoE.

### Đào sâu: Chất lượng data + schema + capacity cùng tạo foundation VLA

**Luận điểm.** Curation nghiêm ngặt, unified 55D representation, sparse MoE và predictive distillation góp phần khác nhau. Robot không có bộ phận nào thì slots đó padding/masking. Cách này giúp chung mô hình IO schema dù control phần cứng khác nhau.

**Giải thích không dùng tên model.** Curation nghiêm ngặt, unified 55D representation, sparse MoE và predictive distillation góp phần khác nhau. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Một pipeline VLA hướng sản xuất: data curation, action 55D, sparse MoE và future-state feature prediction. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Một pipeline VLA hướng sản xuất: data curation, action 55D, sparse MoE và future-state feature prediction. Thay vì bắt VLA sinh toàn bộ future pixels, student học future đặc trưng latent. Đấy là một proxy mục tiêu huấn luyện để hướng hidden state chứa thông tin về thay đổi bối cảnh.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự 90K h robot thô + video người → Curation + SLAM/MANO → 55D + VLM/MoE action expert → Flow actions + future features. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Thay vì bắt VLA sinh toàn bộ future pixels, student học future đặc trưng latent. Đấy là một proxy mục tiêu huấn luyện để hướng hidden state chứa thông tin về thay đổi bối cảnh. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Schema 55D gom arm, EEF, gripper, fingers, waist, head và mobile base. Bài báo đề xuất một vector action cố định 55D chia các vùng: arm joints (14), end-effector poses (14), gripper (2), hand joints (12), waist (4), head (2), mobile base (3) và reserved (4).

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Robot thiếu bộ phận sẽ mask vị trí đó. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Bài báo đề xuất một vector action cố định 55D chia các vùng: arm joints (14), end-effector poses (14), gripper (2), hand joints (12), waist (4), head (2), mobile base (3) và reserved (4). Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Khoảng 90K giờ robot thô → 50K giờ chọn lọc; thêm 10K giờ human egocentric video. LingBot thay các FFN bằng sparse Mixture-of-Experts, gồm một shared expert luôn active và routed experts được chọn bằng token-level top-K router.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Sparse MoE gồm shared expert + routed top-K experts, balancing không thêm auxiliary loss chính. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** LingBot thay các FFN bằng sparse Mixture-of-Experts, gồm một shared expert luôn active và routed experts được chọn bằng token-level top-K router. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Ablation action normalization: relative joints 55,0% vs absolute 33,7% trong setup được báo cáo. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Shared expert luôn hoạt động; router chọn thêm một ít chuyên gia phù hợp với token, không chạy mọi expert. Router không hard-code robot A → expert 1, tay trái → expert 2. Nó học specialization dựa trên hidden state của từng token.

$$
y=h_{\rm shared}(x)+\sum_{e\in\mathrm{TopK}(x)}w_e\,h_e(x)
$$

**Công thức đang mô tả thứ gì?** Shared expert luôn hoạt động; router chọn thêm một ít chuyên gia phù hợp với token, không chạy mọi expert. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Router không hard-code robot A → expert 1, tay trái → expert 2. Nó học specialization dựa trên hidden state của từng token. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Ký hiệu intuition của MoE; số expert/weight cụ thể xem bài gốc. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử công ty có Franka arm, dual-arm Magic và humanoid với mobile base. Dữ liệu từ mỗi robot đi qua adapter riêng: camera calibration, joints/EEF conventions và normalization. Episode dài được chia hành động `move`, `open`, `close`, `wipe`, `transit`... với ngôn ngữ labels. Robot/con người các quỹ đạo được map vào canonical biểu diễn kèm mask slots không hợp lệ. Khi batch action tokens đi qua action expert, router chọn sparse experts theo đặc trưng token, trong lúc shared expert giữ common dung lượng mô hình. Auxiliary queries còn học target đặc trưng latent cho hiện tại/tương lai.

Đến deployment, humanoid có thêm head/waist/base slots; Franka thì không. Nếu robot đầu ra sai normalization khiến gripper command gấp 100 lần, mô hình lớn không cứu được. Và nếu 80% dữ liệu là transit/move, mô hình không tự nhiên giỏi contact-rich độ chính xác mà thiếu rare events.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** VLM mã hóa instruction, ảnh và robot state. Khi batch action tokens đi qua action expert, router chọn sparse experts theo đặc trưng token, trong lúc shared expert giữ common dung lượng mô hình.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Router chọn expert theo hidden tokens; flow head sinh actions. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Khi batch action tokens đi qua action expert, router chọn sparse experts theo đặc trưng token, trong lúc shared expert giữ common dung lượng mô hình. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Bắt buộc inverse-normalize và xử lý schema đúng robot đang deploy. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

**MoE scaling:** Figure 7 cho loss khi huấn luyện và lỗi dự đoán action trên tập validation của sparse MoE thấp hơn dense với chi phí tính toán khi chạy gần tương đương. Đây là bằng chứng hữu ích về hiệu quả của việc tăng dung lượng mô hình, chưa trực tiếp tách toàn bộ gain trong thế giới thực thành contribution của MoE.

**GM-100 bimanual đánh giá:** Trên Agilex Cobot Magic, báo cáo average *progress/thành công* khoảng **66.2 / 34.4** cho LingBot 2.0, so **59.1 / 32.2** cho π0.5 trong cùng bảng. Galaxea có khoảng **34.6 / 15.6** so π0.5 **27.4 / 8.9**. Gain thành công hiện hữu nhưng không phải thắng tuyệt đối mọi nhiệm vụ; một số nhiệm vụ vẫn thành công **0%**.

**Long-horizon mobile manipulation:** bài báo thử refrigerator organization và stove cleaning, đo cả in-domain/out-of-domain (OOD). OOD thành công thấp hơn nhiều in-domain. Ví dụ refrigerator OOD LingBot khoảng **13.3%**, π0.5 khoảng **6.7%**. Đây là một con số rất đáng để nhớ vì nó cho thấy generalist vẫn cực nhạy khi đổi vật thể/start configuration.

**Kết quả cần phân biệt:** nhiệm vụ progress là hoàn thành một phần chuỗi, tỷ lệ thành công của nhiệm vụ là hoàn thành mục tiêu cuối. Trong 11-step household nhiệm vụ, mô hình có thể làm được 8 bước nhưng fail bước đặt cuối, tạo progress tốt song thành công thấp. Vì vậy claim production-ready phải nhìn cả độ chính xác, phục hồi và contact thành công, không chỉ progress averages.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** MoE ~1,6B total / ~0,6B active giảm validation action loss so dense ~0,6B. MoE scaling: Figure 7 cho loss khi huấn luyện và lỗi dự đoán action trên tập validation của sparse MoE thấp hơn dense với chi phí tính toán khi chạy gần tương đương.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: GM-100 Agilex: progress/success 66,2/34,4; π0.5 59,1/32,2 (cùng bảng). Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. MoE scaling: Figure 7 cho loss khi huấn luyện và lỗi dự đoán action trên tập validation của sparse MoE thấp hơn dense với chi phí tính toán khi chạy gần tương đương. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Refrigerator OOD: success khoảng 13,3%, cho thấy long-horizon transfer vẫn rất khó. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Ablation action normalization: relative joints 55,0% vs absolute 33,7% trong setup được báo cáo. GM-100 bimanual đánh giá: Trên Agilex Cobot Magic, báo cáo average progress/thành công khoảng 66.2 / 34.4 cho LingBot 2.0, so 59.1 / 32.2 cho π0.5 trong cùng bảng.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Progress khác success; MoE loss gain không tự chứng minh hiệu quả từng module trên real robot. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. GM-100 bimanual đánh giá: Trên Agilex Cobot Magic, báo cáo average progress/thành công khoảng 66.2 / 34.4 cho LingBot 2.0, so 59.1 / 32.2 cho π0.5 trong cùng bảng. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** GM-100 bimanual đánh giá: Trên Agilex Cobot Magic, báo cáo average progress/thành công khoảng 66.2 / 34.4 cho LingBot 2.0, so 59.1 / 32.2 cho π0.5 trong cùng bảng. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Từ bài báo và phạm vi thí nghiệm:** Heterogeneous video con người action labels cần SLAM/hand tracking có noise. Mô hình cần đại lượng pretraining corpus và deployment calibration lớn. OOD thành công còn khiêm tốn trên vài long-horizon nhiệm vụ; không phải robot generalist đã solved.

**Phê bình độc lập:**

- **MoE specialization chưa interpretable:** token-level experts có thể route theo camera/phông nền hơn là body part hoặc kỹ năng; cần analyze expert distributions mới khẳng định semantics.
- **Confounded gains:** quy trình tuyển lọc dữ liệu, action schema, MoE và predictive objectives cùng thay đổi. Nếu thiếu thí nghiệm ablation theo đầy đủ các tổ hợp, không thể quy tất cả mức cải thiện trên robot thật cho một component.
- **Canonicalization có mất mát:** một 55D padded vector không đủ biểu diễn mọi morphology/contact force tactile dữ liệu; nhiều hands cần DoFs hoặc phản hồi không hiện diện.
- **Teacher đặc trưng dự đoán có lỗ hổng:** predicting DINO/depth latent có thể học shortcut từ bối cảnh static, không thực sự encode causal consequences của chosen action.
- **Long-tail vẫn còn:** 10.000 giờ video curated nhưng primitive hiếm rất ít. Scale thô hours không đồng nghĩa scale kỹ năng hiếm.
- **So sánh phần cứng/nhiệm vụ:** công bố hiệu năng dưới những calibration và post-training riêng; muốn chứng minh universal khả năng khái quát phải đánh giá new robots/new nhiệm vụ đồng thời, với budget ngang nhau.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Canonicalization có mất mát: một 55D padded vector không đủ biểu diễn mọi morphology/contact force tactile dữ liệu; nhiều hands cần DoFs hoặc phản hồi không hiện diện.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: video tracking nhiễu, cần curation và OOD long-horizon performance còn thấp. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Canonicalization có mất mát: một 55D padded vector không đủ biểu diễn mọi morphology/contact force tactile dữ liệu; nhiều hands cần DoFs hoặc phản hồi không hiện diện. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: 55D không biểu diễn mọi contact/tactile, sparse experts chưa chắc chuyên biệt theo kỹ năng thật. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [Open X-Embodiment](/paper/open-x-embodiment) là tiền đề để nghĩ về mixture đa morphology và semantics action.
- [GR00T N1](/paper/groot-n1) cũng dùng VLM+action expert và video con người nhưng kiến trúc dữ liệu/experts khác.
- [Qwen-VLA](/paper/qwen-vla) giải cùng bài toán generalist, dùng embodiment description thay vì chỉ phụ thuộc 55D schema.
- [Diffusion Policy](/paper/diffusion-policy) và [RDT-1B](/paper/rdt-1b) cung cấp nền generative action learning.
- [DROID](/paper/droid) cho góc nhìn thu dữ liệu robot ở nhiều environment đời thật.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm Open X-Embodiment, GR00T N1, Qwen-VLA, Diffusion Policy, RDT-1B. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: GR00T N1 là họ dual-system action experts cho humanoid. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: π0.5 làm baseline mạnh cho long-horizon và cross-environment comparison. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm Open X-Embodiment, GR00T N1, Qwen-VLA, Diffusion Policy, RDT-1B. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Tạo một **toy 55D action adapter** cho hai robot giả lập: Robot A 7D EEF/gripper, Robot B 14D joint + grippers. Unit-test mask và inverse normalization. Thử `MeanStd` vs `MinMax` trước khi động vào MoE. Sau đó triển khai một MoE action MLP nhỏ với 4 routed FFNs + 1 shared FFN, top-2 gating và histogram expert usage theo body-part/nhiệm vụ label. Cuối cùng thêm auxiliary loss future đặc trưng thị giác và ablate, nhưng luôn giữ **dữ liệu budget, active compute và per-task đánh giá giống nhau**. Đó là cách học đúng từ bài báo thay vì chép mỗi kiến trúc 1.6B parameters.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Foundation VLA thành công cần data engineering tương đương model engineering. Cuối cùng thêm auxiliary loss future đặc trưng thị giác và ablate, nhưng luôn giữ dữ liệu budget, active compute và per-task đánh giá giống nhau.

**Chọn điều cần mang sang dự án thật.** Phân biệt số giờ raw với giờ usable và score progress với score success. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Foundation VLA thành công cần data engineering tương đương model engineering.

**Tái hiện tối thiểu.** Cuối cùng thêm auxiliary loss future đặc trưng thị giác và ablate, nhưng luôn giữ dữ liệu budget, active compute và per-task đánh giá giống nhau. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Nó không cố chứng minh một kiến trúc đơn lẻ vượt xa π0.5. Contribution nằm ở engineering research: quy trình tuyển lọc dữ liệu hàng chục nghìn giờ, unified biểu diễn cho whole-body, sparse MoE để tăng dung lượng mô hình và auxiliary future-state learning. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khi một công ty robot muốn deploy cùng policy lên cả robot hai tay, humanoid và mobile manipulator, họ gặp ít nhất ba vấn đề: (1) dữ liệu không đồng nhất không sạch và không chung schema, (2) một dense action mạng có thể bị nghẽn dung lượng mô hình khi nhiều robot/nhiệm vụ cạnh tranh, (3) robot phải hiểu future consequences thay vì chỉ matching next-action pattern. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Contribution nằm ở engineering research: quy trình tuyển lọc dữ liệu hàng chục nghìn giờ, unified biểu diễn cho whole-body, sparse MoE để tăng dung lượng mô hình và auxiliary future-state learning. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Chất lượng data + schema + capacity cùng tạo foundation VLA: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Chất lượng data + schema + capacity cùng tạo foundation VLA', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Robot không có bộ phận nào thì slots đó padding/masking. Cách này giúp chung mô hình IO schema dù control phần cứng khác nhau. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ba khái niệm để nắm: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ba khái niệm để nắm', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Mixture-of-Experts (MoE): router chọn một vài FFN experts mỗi token, nhiều total parameters nhưng activation sparse. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kiến trúc trong một sơ đồ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kiến trúc trong một sơ đồ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Thay vì bắt VLA sinh toàn bộ future pixels, student học future đặc trưng latent. Đấy là một proxy mục tiêu huấn luyện để hướng hidden state chứa thông tin về thay đổi bối cảnh. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mô hình biểu diễn cái gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mô hình biểu diễn cái gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Bài báo đề xuất một vector action cố định 55D chia các vùng: arm joints (14), end-effector poses (14), gripper (2), hand joints (12), waist (4), head (2), mobile base (3) và reserved (4). Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model học như thế nào?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model học như thế nào?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. LingBot thay các FFN bằng sparse Mixture-of-Experts, gồm một shared expert luôn active và routed experts được chọn bằng token-level top-K router. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một lần inference xảy ra ra sao?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một lần inference xảy ra ra sao?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khi batch action tokens đi qua action expert, router chọn sparse experts theo đặc trưng token, trong lúc shared expert giữ common dung lượng mô hình. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mathematical Intuition: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mathematical Intuition', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Router không hard-code robot A → expert 1, tay trái → expert 2. Nó học specialization dựa trên hidden state của từng token. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kết quả nói lên điều gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kết quả nói lên điều gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. MoE scaling: Figure 7 cho loss khi huấn luyện và lỗi dự đoán action trên tập validation của sparse MoE thấp hơn dense với chi phí tính toán khi chạy gần tương đương. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ablation và bằng chứng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ablation và bằng chứng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. GM-100 bimanual đánh giá: Trên Agilex Cobot Magic, báo cáo average progress/thành công khoảng 66.2 / 34.4 cho LingBot 2.0, so 59.1 / 32.2 cho π0.5 trong cùng bảng. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Hạn chế cần nói thẳng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Hạn chế cần nói thẳng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Canonicalization có mất mát: một 55D padded vector không đủ biểu diễn mọi morphology/contact force tactile dữ liệu; nhiều hands cần DoFs hoặc phản hồi không hiện diện. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Bài này đứng ở đâu trong lĩnh vực?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Bài này đứng ở đâu trong lĩnh vực?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Đọc thêm Open X-Embodiment, GR00T N1, Qwen-VLA, Diffusion Policy, RDT-1B. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Nếu chỉ nhớ ba điều: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Nếu chỉ nhớ ba điều', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Cuối cùng thêm auxiliary loss future đặc trưng thị giác và ablate, nhưng luôn giữ dữ liệu budget, active compute và per-task đánh giá giống nhau. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Điểm cốt lõi: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Một pipeline VLA hướng sản xuất: data curation, action 55D, sparse MoE và future-state feature prediction. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Pipeline robot đa embodiment phải xử lý cả nhãn video người, capacity model và khả năng dự đoán diễn tiến. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Canonical action theo một robot không phù hợp humanoid, mobile base và dexterous hand. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Chất lượng data + schema + capacity cùng tạo foundation VLA: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Curation nghiêm ngặt, unified 55D representation, sparse MoE và predictive distillation góp phần khác nhau. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ba khái niệm để nắm: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Hiểu ba khái niệm này trước khi đọc thuật toán. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kiến trúc trong một sơ đồ: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Một pipeline VLA hướng sản xuất: data curation, action 55D, sparse MoE và future-state feature prediction. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mô hình biểu diễn cái gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Schema 55D gom arm, EEF, gripper, fingers, waist, head và mobile base. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Model học như thế nào?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Khoảng 90K giờ robot thô → 50K giờ chọn lọc; thêm 10K giờ human egocentric video. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Một lần inference xảy ra ra sao?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. VLM mã hóa instruction, ảnh và robot state. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Mathematical Intuition: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Shared expert luôn hoạt động; router chọn thêm một ít chuyên gia phù hợp với token, không chạy mọi expert. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Kết quả nói lên điều gì?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. MoE ~1,6B total / ~0,6B active giảm validation action loss so dense ~0,6B. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Ablation và bằng chứng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Ablation action normalization: relative joints 55,0% vs absolute 33,7% trong setup được báo cáo. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Hạn chế cần nói thẳng: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Bài này đứng ở đâu trong lĩnh vực?: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Không đọc paper như một hòn đảo riêng. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Nếu chỉ nhớ ba điều: Một phản ví dụ có ích

Giả sử có hai episode cùng mục tiêu nhưng điều kiện bắt đầu hơi khác. Trong một episode, dữ liệu huấn luyện che phủ đầy đủ quỹ đạo; ở episode còn lại, robot gặp trạng thái hiếm hoặc vật thể dịch chuyển. Foundation VLA thành công cần data engineering tương đương model engineering. Nên ghi lại thời điểm hành vi tách khỏi mục tiêu rồi tìm đúng nguồn lỗi thay vì chấm cả hai bằng một con số trung bình.

#### Điểm cốt lõi: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Nó không cố chứng minh một kiến trúc đơn lẻ vượt xa π0.5. Contribution nằm ở engineering research: quy trình tuyển lọc dữ liệu hàng chục nghìn giờ, unified biểu diễn cho whole-body, sparse MoE để tăng dung lượng mô hình và auxiliary future-state learning. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Khi một công ty robot muốn deploy cùng policy lên cả robot hai tay, humanoid và mobile manipulator, họ gặp ít nhất ba vấn đề: (1) dữ liệu không đồng nhất không sạch và không chung schema, (2) một dense action mạng có thể bị nghẽn dung lượng mô hình khi nhiều robot/nhiệm vụ cạnh tranh, (3) robot phải hiểu future consequences thay vì chỉ matching next-action pattern. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Contribution nằm ở engineering research: quy trình tuyển lọc dữ liệu hàng chục nghìn giờ, unified biểu diễn cho whole-body, sparse MoE để tăng dung lượng mô hình và auxiliary future-state learning. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Chất lượng data + schema + capacity cùng tạo foundation VLA: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Robot không có bộ phận nào thì slots đó padding/masking. Cách này giúp chung mô hình IO schema dù control phần cứng khác nhau. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Ba khái niệm để nắm: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Mixture-of-Experts (MoE): router chọn một vài FFN experts mỗi token, nhiều total parameters nhưng activation sparse. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Kiến trúc trong một sơ đồ: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Thay vì bắt VLA sinh toàn bộ future pixels, student học future đặc trưng latent. Đấy là một proxy mục tiêu huấn luyện để hướng hidden state chứa thông tin về thay đổi bối cảnh. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Mô hình biểu diễn cái gì?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Bài báo đề xuất một vector action cố định 55D chia các vùng: arm joints (14), end-effector poses (14), gripper (2), hand joints (12), waist (4), head (2), mobile base (3) và reserved (4). Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Model học như thế nào?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. LingBot thay các FFN bằng sparse Mixture-of-Experts, gồm một shared expert luôn active và routed experts được chọn bằng token-level top-K router. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Một lần inference xảy ra ra sao?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Khi batch action tokens đi qua action expert, router chọn sparse experts theo đặc trưng token, trong lúc shared expert giữ common dung lượng mô hình. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Mathematical Intuition: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Router không hard-code robot A → expert 1, tay trái → expert 2. Nó học specialization dựa trên hidden state của từng token. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Kết quả nói lên điều gì?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. MoE scaling: Figure 7 cho loss khi huấn luyện và lỗi dự đoán action trên tập validation của sparse MoE thấp hơn dense với chi phí tính toán khi chạy gần tương đương. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Ablation và bằng chứng: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. GM-100 bimanual đánh giá: Trên Agilex Cobot Magic, báo cáo average progress/thành công khoảng 66.2 / 34.4 cho LingBot 2.0, so 59.1 / 32.2 cho π0.5 trong cùng bảng. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Hạn chế cần nói thẳng: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Canonicalization có mất mát: một 55D padded vector không đủ biểu diễn mọi morphology/contact force tactile dữ liệu; nhiều hands cần DoFs hoặc phản hồi không hiện diện. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Bài này đứng ở đâu trong lĩnh vực?: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Đọc thêm Open X-Embodiment, GR00T N1, Qwen-VLA, Diffusion Policy, RDT-1B. Nên so sánh cách tiếp cận, dữ liệu huấn luyện và phạm vi khái quát của từng công trình. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Nếu chỉ nhớ ba điều: Dữ liệu và độ lệch phân phối

Nếu train và test dùng cùng camera, vật thể và background, một mô hình có thể học shortcut mà không thật sự khái quát. Hãy tạo held-out scene, held-out object hoặc held-out episode theo đúng mục đích đánh giá của paper. Cuối cùng thêm auxiliary loss future đặc trưng thị giác và ablate, nhưng luôn giữ dữ liệu budget, active compute và per-task đánh giá giống nhau. Cách chia tập phải làm trước bước cắt sliding windows để tránh cùng một trajectory xuất hiện ở cả train và test.

#### Điểm cốt lõi: Kiểm tra tính đúng của action

Một tensor có shape hợp lệ chưa chắc là lệnh vật lý hợp lệ. Hãy kiểm tra số bậc tự do, đơn vị, hệ tọa độ, giới hạn từng chiều và quy trình inverse-normalize. Trong Điểm cốt lõi, một lỗi scale ở gripper hoặc thiếu đồng bộ timestamp có thể làm toàn episode thất bại mà loss offline không phát hiện rõ.

#### Có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail: Kiểm tra tính đúng của action

Một tensor có shape hợp lệ chưa chắc là lệnh vật lý hợp lệ. Hãy kiểm tra số bậc tự do, đơn vị, hệ tọa độ, giới hạn từng chiều và quy trình inverse-normalize. Trong Có nhiều dữ liệu nhưng nhiễu, khác schema và thiên lệch long-tail, một lỗi scale ở gripper hoặc thiếu đồng bộ timestamp có thể làm toàn episode thất bại mà loss offline không phát hiện rõ.

#### Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality: Kiểm tra tính đúng của action

Một tensor có shape hợp lệ chưa chắc là lệnh vật lý hợp lệ. Hãy kiểm tra số bậc tự do, đơn vị, hệ tọa độ, giới hạn từng chiều và quy trình inverse-normalize. Trong Dense expert và dữ liệu trộn thô có bottleneck về capacity/quality, một lỗi scale ở gripper hoặc thiếu đồng bộ timestamp có thể làm toàn episode thất bại mà loss offline không phát hiện rõ.

<!-- END EXTENDED WALKTHROUGH -->
