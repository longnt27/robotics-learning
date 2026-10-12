## Why

Behavior cloning kiểu regression thường giả định một observation có một action target “trung bình”. Nhưng robot demonstrations rất hay **multimodal**: cùng một scene có thể vòng obstacle bên trái hoặc bên phải, grasp object từ nhiều hướng, hoặc có nhiều trajectory đều hợp lệ. MSE regression có xu hướng average các mode và tạo ra action chẳng mode nào muốn, một cách khá sáng tạo để robot đâm đúng vào giữa chướng ngại vật. Ngoài ra actions có temporal correlation mạnh, nên predict từng timestep độc lập làm trajectory rung và dễ tích lũy lỗi.

## Kiến thức nền cần nắm

Vấn đề **multimodality**: cùng một scene có hai đường vòng chướng ngại hợp lệ. Regress với MSE một action trung bình có thể tạo con đường đi thẳng vào chướng ngại. Generative model dự đoán phân phối có nhiều đỉnh sẽ lấy sample thuộc một mode thay vì average.

Diffusion model học loại noise từ trajectory. **Denoising timestep** hoàn toàn khác **timestep robot**: một cái là số vòng generate, cái kia là thời gian vật lý trong action horizon. Nhầm hai thứ này là hiểu sai cả thuật toán.

## How

Diffusion Policy biểu diễn cả **action sequence/chunk** như một conditional diffusion process. Model bắt đầu từ noise rồi denoise thành một trajectory, condition trên visual observation và state. Nó dùng receding-horizon control: predict một horizon tương đối dài, execute một đoạn ngắn, rồi observe và replan. Paper thử cả CNN và Transformer temporal backbone.

Điểm bản chất không phải chỉ “dùng diffusion vì đang hot”, mà là diffusion có thể đại diện nhiều mode của action distribution và vẫn tạo trajectory temporal-coherent. Chính recipe này sau đó xuất hiện với biến thể flow matching trong π-series, RDT, GR00T, Qwen-VLA và một đống model khác.

## Ví dụ từng bước

Tạo demo Push-T: observation gồm tọa độ pusher và vật T. Với cùng start state, demonstrator có thể đi từ bên trái hoặc bên phải. Lúc train, lấy ground truth action sequence `A_0`, thêm Gaussian noise để có `A_k`, cho network dự đoán noise hoặc denoised trajectory. Inference bắt đầu từ noise, lặp nhiều bước đến action chunk hợp lệ. Robot chỉ execute `a_0...a_m`, chụp observation mới, rồi replan.

Điểm quan trọng: `prediction horizon` và `action horizon` **không giống nhau**. Tăng horizon dự đoán giúp temporal coherence nhưng có thể làm planning bị stale.

## Results

Trên **12 tasks thuộc 4 benchmark families**, paper báo cải thiện trung bình rất lớn so với các visuomotor-policy baselines, khoảng **46.9%** theo cách tổng hợp của tác giả. Với real-robot tasks như mug flipping, sauce pouring/spreading, diffusion policy đạt success cao trong khi một số LSTM-GMM/regression baselines thất bại hoặc kém rõ rệt. Training cũng ổn định hơn các energy-based alternatives mà paper so sánh.

Kết quả có sức ảnh hưởng nhất là qualitative: trajectory mượt nhưng vẫn giữ được nhiều mode, thay vì biến multimodality thành average motion. Từ sau paper này, câu hỏi của field đổi từ “diffusion có dùng được cho robot không?” sang “action diffusion/flow nên được ghép vào VLA thế nào và làm sao giảm latency?”.

## Limitations

**Paper thừa nhận:** đây vẫn là behavior cloning, nên bad demos hoặc thiếu coverage vẫn đặt trần. Iterative denoising làm inference đắt hơn one-shot regression, gây khó cho high-frequency control. Authors cũng chỉ ra hướng kết hợp negative data/RL và acceleration như việc cần làm tiếp.

**Phê bình thêm:** không phải mọi gain đều có thể quy cho diffusion; action horizon, receding-horizon control, temporal architecture và tuning cùng thay đổi. Real-world evaluation vẫn nhỏ so với độ rộng claim. Multimodality cũng không phải bottleneck chính của mọi task, nên diffusion có thể là overkill cho một số policy đơn giản. Quan trọng nhất cho VLA hiện đại: iterative denoising tạo ra latency và chunk-stitching problem, thứ mà các paper RTC người đọc vừa tìm hiểu phải đi chữa về sau.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [rdt 1b](/paper/rdt-1b)
- [groot n1](/paper/groot-n1)
- [pi 0 5](/paper/pi-0-5)
- [rtc inference](/paper/rtc-inference)

## Đọc code và tự kiểm chứng

Dùng Push-T state baseline trong repo chính thức. Plot 10 sampled trajectories cho cùng observation; thay số denoising steps 100/20/5, horizon và action horizon, đo success và latency. Đừng kết luận chỉ bằng offline MSE.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
