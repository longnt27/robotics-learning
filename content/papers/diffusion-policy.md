## Vì sao cần nghiên cứu này?

Behavior cloning kiểu regression thường giả định một quan sát có một action target “trung bình”. Nhưng robot demonstrations rất hay **multimodal**: cùng một bối cảnh có thể vòng obstacle bên trái hoặc bên phải, grasp vật thể từ nhiều hướng, hoặc có nhiều quỹ đạo đều hợp lệ. MSE regression có xu hướng average các mode và tạo ra action chẳng mode nào muốn, một cách khá sáng tạo để robot đâm đúng vào giữa chướng ngại vật. Ngoài ra actions có theo thời gian correlation mạnh, nên dự đoán từng timestep độc lập làm quỹ đạo rung và dễ tích lũy lỗi.

## Kiến thức nền cần nắm

Vấn đề **multimodality**: cùng một bối cảnh có hai đường vòng chướng ngại hợp lệ. Regress với MSE một action trung bình có thể tạo con đường đi thẳng vào chướng ngại. Generative mô hình dự đoán phân phối có nhiều đỉnh sẽ lấy mẫu thuộc một mode thay vì average.

Mô hình diffusion học loại noise từ quỹ đạo. **Denoising timestep** hoàn toàn khác **timestep robot**: một cái là số vòng sinh, cái kia là thời gian vật lý trong action horizon. Nhầm hai thứ này là hiểu sai cả thuật toán.

## Phương pháp thực hiện

Diffusion Policy biểu diễn cả **action chuỗi/chunk** như một conditional diffusion process. Mô hình bắt đầu từ noise rồi denoise thành một quỹ đạo, điều kiện trên thị giác quan sát và state. Nó dùng receding-horizon control: dự đoán một horizon tương đối dài, thực thi một đoạn ngắn, rồi observe và replan. Bài báo thử cả CNN và Transformer theo thời gian backbone.

Điểm bản chất không phải chỉ “dùng diffusion vì đang hot”, mà là diffusion có thể đại diện nhiều mode của phân phối action và vẫn tạo quỹ đạo temporal-coherent. Chính recipe này sau đó xuất hiện với biến thể flow matching trong π-series, RDT, GR00T, Qwen-VLA và một đống mô hình khác.

## Ví dụ từng bước

Tạo demo Push-T: quan sát gồm tọa độ pusher và vật T. Với cùng start state, demonstrator có thể đi từ bên trái hoặc bên phải. Lúc huấn luyện, lấy ground truth action chuỗi `A_0`, thêm nhiễu Gaussian để có `A_k`, cho mạng dự đoán noise hoặc denoised quỹ đạo. Inference bắt đầu từ noise, lặp nhiều bước đến action chunk hợp lệ. Robot chỉ thực thi `a_0...a_m`, chụp quan sát mới, rồi replan.

Điểm quan trọng: `prediction horizon` và `action horizon` **không giống nhau**. Tăng horizon dự đoán giúp theo thời gian coherence nhưng có thể làm lập kế hoạch bị stale.

## Kết quả thực nghiệm

Trên **12 nhiệm vụ thuộc 4 benchmark families**, tác giả nêu cải thiện trung bình rất lớn so với các phương pháp đối chứng điều khiển từ thị giác, khoảng **46.9%** theo cách tổng hợp của tác giả. Với nhiệm vụ trên robot thật như mug flipping, sauce pouring/spreading, diffusion policy đạt thành công cao trong khi một số phương pháp đối chứng LSTM-GMM hoặc hồi quy thất bại hoặc kém rõ rệt. Huấn luyện cũng ổn định hơn các energy-based alternatives mà bài báo so sánh.

Kết quả có sức ảnh hưởng nhất là qualitative: quỹ đạo mượt nhưng vẫn giữ được nhiều mode, thay vì biến multimodality thành average chuyển động. Từ sau bài báo này, câu hỏi của field đổi từ “diffusion có dùng được cho robot không?” sang “action diffusion/flow nên được ghép vào VLA thế nào và làm sao giảm độ trễ?”.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** đây vẫn là behavior cloning, nên bad demos hoặc thiếu coverage vẫn đặt trần. Iterative denoising làm inference đắt hơn one-shot regression, gây khó cho high-frequency control. Tác giả cũng chỉ ra hướng kết hợp dữ liệu gây tác động tiêu cực/RL và acceleration như việc cần làm tiếp.

**Phê bình thêm:** không phải mọi gain đều có thể quy cho diffusion; action horizon, receding-horizon control, kiến trúc xử lý chuỗi thời gian và tuning cùng thay đổi. Trong thế giới thực đánh giá vẫn nhỏ so với độ rộng claim. Tính đa phương thức cũng không phải nút thắt chính của mọi nhiệm vụ, nên diffusion có thể là quá phức tạp so với nhu cầu cho một số policy đơn giản. Quan trọng nhất cho VLA hiện đại: iterative denoising tạo ra độ trễ và vấn đề nối các action chunk, thứ mà các bài báo RTC người đọc vừa tìm hiểu phải đi chữa về sau.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RDT-1B](/paper/rdt-1b)
- [GR00T N1](/paper/groot-n1)
- [π0.5](/paper/pi-0-5)
- [RTC (inference)](/paper/rtc-inference)

## Đọc code và tự kiểm chứng

Dùng Push-T state phương pháp đối chứng trong repo chính thức. Plot 10 sampled các quỹ đạo cho cùng quan sát; thay số denoising steps 100/20/5, horizon và action horizon, đo thành công và độ trễ. Đừng kết luận chỉ bằng offline MSE.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
