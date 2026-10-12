## Why

Nhiều robot dataset lớn vẫn được collect trong vài lab setup được dựng cẩn thận. Model có thể thấy nhiều trajectories nhưng scene statistics gần như giống nhau, nên nó học shortcut về background/camera/table thay vì manipulation invariants. DROID muốn kiểm tra thesis: **nếu cùng một robot được mang đi rất nhiều tòa nhà, phòng, operator và object setup, generalization có tăng đáng kể không?**

## Kiến thức nền cần nắm

Bottleneck thực tế là thu robot data **ngoài phòng lab**: lighting, vật thể, operator skill và background thay đổi làm distribution phức tạp hơn số lượng episode. DROID tập trung vào protocol thu thập để policy học từ nhiều cảnh đời thực.

## How

DROID thu khoảng **76 nghìn trajectories / 350 giờ**, trong **564 scenes**, **86 tasks**, **52 buildings** với khoảng **50 collectors**. Hardware được chuẩn hóa quanh Franka + camera setup để nhiều institution có thể thu data nhưng action space vẫn thống nhất. Dataset cố tình ưu tiên “in-the-wild” environmental variation thay vì chỉ tăng trajectory count trong một lab.

Paper train diffusion-style policies và làm matched-data ablation: cùng số demonstrations nhưng chọn từ nhiều scene hơn hoặc ít scene hơn. Điều này cho phép tách **quantity** khỏi **environment diversity**.

## Ví dụ từng bước

Ở cùng task pick-place, một scene có bàn kính phản quang, scene khác có khăn và đồ vật cluttered. DROID-style collection khiến visual encoder phải học affordance thay vì memorize màu bàn. Nhưng dữ liệu còn phụ thuộc vào human operator và phần cứng robot; action frequency/camera alignment có thể trở thành confound.

Trong data audit, inspect synchronization giữa RGB frame timestamps và proprioception/action timestamps; lệch vài frame cũng có thể tạo label noise rất lớn.

## Results

Khi thêm DROID vào target-task data theo mixture, paper báo gains khoảng **22 điểm ở in-domain** và **17 điểm ở out-of-domain** so với next-best setup trong các task được đánh giá. Full DROID tốt hơn subset nhỏ, nhưng điểm quan trọng hơn là **diverse-scene subset tốt hơn matched-size low-diversity subset**. Nói cách khác, 7 nghìn trajectory đi khắp nơi có thể đáng hơn 7 nghìn trajectory quay đi quay lại trong 20 scene.

Đây là một evidence rất trực tiếp cho data-collection strategy mà người đọc đang thấy ở headcam: coverage của distribution có giá trị độc lập với số giờ.

## Limitations

**Paper thừa nhận:** DROID vẫn dùng một main robot hardware, nên chủ yếu giải scene/task diversity chứ không giải cross-embodiment. Scope manipulation vẫn tabletop-ish và chưa chạm hết dynamic/deformable/contact-rich world.

**Phê bình thêm:** 350 giờ là lớn với real robot 2024 nhưng nhỏ so với 10k-50k giờ pretraining corpora 2026. Policies trong paper vẫn cần target-task demonstrations, nên DROID là prior chứ không tạo zero-shot generalist. Dataset chủ yếu lọc successful/usable trajectories, thiếu failure/recovery. Real evaluation cũng chỉ có số task và rollouts hạn chế, nên con số gain không nên extrapolate thành “scene diversity giải generalization”. Nó giải một phần rất quan trọng, nhưng chỉ một phần.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [open x embodiment](/paper/open-x-embodiment)
- [robocasa](/paper/robocasa)

## Đọc code và tự kiểm chứng

Dùng sample DROID video + state, plot timestamp delta, trajectory smoothness và coverage. Xây 1 trang data-quality report trước khi training policy.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
