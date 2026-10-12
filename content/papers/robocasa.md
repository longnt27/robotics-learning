## Why

Real-robot data vừa đắt vừa chậm, còn các simulator cũ thường nghèo scene, object và task diversity. Nếu foundation robot policy cần hàng trăm nghìn hay hàng triệu trajectories thì con người không thể teleoperate tất cả. RoboCasa đặt câu hỏi: **có thể dùng simulation để tạo một distribution household manipulation đủ rộng và đủ tự động để synthetic data thật sự giúp generalist policy không?**

## Kiến thức nền cần nắm

Robot deployment tốn kém, còn evaluation ngoài đời không dễ chạy hàng trăm seeds. Simulators như RoboCasa cho procedural variation: layout, texture, object placement, tasks. Tuy vậy **simulator realism** khác **policy robustness ngoài đời**.

## How

RoboCasa xây khoảng **120 kitchen scenes**, hơn **2,500 object assets** thuộc hơn 150 categories và khoảng **100 tasks**. Hệ thống dùng MimicGen-style generation để biến một lượng nhỏ human demonstrations thành số lượng lớn synthetic trajectories, kết hợp procedural scene generation, generative textures/assets và LLM-assisted task generation. Release ban đầu có hơn **100 nghìn trajectories**.

Điểm đáng chú ý là RoboCasa không chỉ là benchmark. Nó là **data generator**: cùng task có thể được render ở nhiều kitchen layout, object instance, lighting và geometry, tạo distribution randomization để policy học invariance.

## Ví dụ từng bước

Một task mở ngăn kéo trong nhà bếp có thể randomize chất liệu tủ, hướng nhìn camera, vị trí robot, friction và object instances. Train trên một số house layouts, test trên held-out layout. Thành tích cao trong domain randomization chưa đảm bảo sim-to-real nếu camera, contact dynamics hoặc robot calibration sai.

RoboCasa nên được xem vừa là data generator vừa là stress-test environment, không phải một model VLA.

## Results

Các experiments cho thấy synthetic scaling giúp imitation performance và có transfer sang real robot. Trong một real-kitchen comparison, mixture **Real + Sim** đạt khoảng **24.4%** trên seen objects so với **13.6%** của Real-only, và khoảng **9.3%** trên unseen objects so với **2.6%**. Tuy absolute success còn thấp, relative gains cho thấy sim data không chỉ làm đẹp benchmark simulation.

RoboCasa cũng phơi ra một fact quan trọng: các **composite/longer-horizon tasks** khó hơn atomic tasks rất nhiều dù data generation scale được. Điều đó nhắc rằng số trajectories không tự giải task planning/recovery.

## Limitations

**Paper thừa nhận:** generated trajectories có thể jerky/collision-prone dù simulator đánh dấu success. LLM không tự sinh toàn bộ executable task logic; con người vẫn phải viết/kiểm tra phần code đáng kể. Domain ban đầu tập trung kitchen, chưa phủ dexterous hands, deformables và bimanual diversity đầy đủ. Authors cũng coi real/sim/video mixture là hướng tiếp theo.

**Phê bình thêm:** synthetic visual diversity không đồng nghĩa với **physical diversity**. Contact friction, deformable dynamics, force feedback và actuator imperfections là nơi simulator dễ nói dối nhất. Real-world transfer numbers trong paper còn khá thấp, nên không thể đọc thành “simulation solved data scarcity”. Một data engine có thể sinh 1 triệu trajectories cực nhanh, nhưng nếu simulator bias giống nhau thì ta chỉ vừa nhân rộng một lỗi lên 1 triệu lần.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [libero](/paper/libero)
- [qwen vla](/paper/qwen-vla)

## Đọc code và tự kiểm chứng

Generate 20 episodes hai scene variants, visualize variation axes. Với policy đơn giản, so sánh train random textures vs fixed textures và held-out layout success.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
