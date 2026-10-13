## Vì sao cần nghiên cứu này?

Bimanual manipulation khó ở hai phía cùng lúc: phần cứng teleoperation đắt và imitation learning có horizon rất dài. Nếu dự đoán từng action 50 Hz, một nhiệm vụ vài chục giây có hàng nghìn decision, nên chỉ cần policy hơi lệch một chút là compounding error đủ giết cả episode. Bài báo muốn chứng minh rằng **low-cost phần cứng + một biểu diễn theo thời gian tốt hơn** có thể học các kỹ năng hai tay khá tinh vi với lượng demo nhỏ.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 4](/paper-figures/act/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/act/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 không chỉ khoe một cánh tay robot. Phần bên trái cho thấy cơ chế leader–follower: người vận hành dịch chuyển hai tay leader, robot follower tái hiện chuyển động và hệ camera ghi lại thao tác. Các ảnh bên phải tách kỹ năng teleoperation khỏi kỹ năng policy đã học. Đây là hai đóng góp khác nhau: ALOHA giải bài toán tạo demonstration chất lượng với giá dễ tiếp cận hơn; ACT giải bài toán học chuỗi hành động từ những demonstration đó. Nếu chỉ có hardware tốt mà policy còn dự đoán từng bước thiếu ổn định, kết quả cuối vẫn có thể fail.

### Vì sao thao tác hai tay khó hơn nhiều so với một tay?

Hình dung robot một tay giữ túi nilon, tay kia kéo miệng túi để mở. Nếu mỗi lần mạng chỉ nghĩ tới đúng một lệnh, hai tay rất dễ lệch nhịp: tay trái buông quá sớm hoặc tay phải kéo khi túi chưa được giữ chắc. Sai lệch nhỏ làm vật trượt, kẹt hoặc biến dạng. ACT khắc phục một phần bằng cách **dự đoán trước cả một đoạn chuyển động**, để các bước liên tiếp phối hợp được với nhau.

Bài báo còn giới thiệu ALOHA, hệ thống để người vận hành trực tiếp hai tay robot với chi phí tương đối thấp. ALOHA giúp thu dữ liệu động tác của người; ACT là mô hình học lại những động tác ấy. Đừng nhầm phần cứng thu dữ liệu với thuật toán điều khiển.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Một lần dự đoán `a_t` ở 50 Hz nghĩa là 50 decisions/giây, dễ sai số tích luỹ. **Action chunking** chuyển thành dự đoán `A_{t:t+H}`, giảm tần suất query nhưng vẫn có khả năng đóng vòng nếu overlap. **CVAE** mã hoá style của demonstration; latent `z` giúp phân biệt những chuyển động hai tay khác nhau cùng đạt mục đích.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những khái niệm cần biết trước khi đọc sơ đồ

**Action chunking** là dự đoán nhiều lệnh liên tiếp thay vì lệnh kế tiếp duy nhất. **Transformer** học mối quan hệ giữa ảnh, trạng thái khớp và các thời điểm trong đoạn chuyển động. **CVAE** dùng biến ẩn z để học sự khác nhau giữa những demonstration đều thành công, chẳng hạn người này mở túi nhanh hơn người kia.

**Temporal ensembling** là kết hợp các dự đoán bị chồng ở cùng một thời điểm để chuyển động mượt hơn. Nó không có nghĩa lấy trung bình tùy tiện hai cách đi hoàn toàn đối lập. Điểm quan trọng nhất là phân biệt ba công dụng: chunking giữ sự phối hợp theo thời gian, CVAE biểu diễn độ đa dạng demonstration, còn ensembling giảm dao động khi thực thi.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

ALOHA là hệ leader-follower giá thấp cho teleoperation hai tay ở **50 Hz**. Về learning, bài báo đưa ra **Action chunking with Transformers (ACT)**. Thay vì dự đoán một action, ACT dự đoán một chunk `a_t ... a_{t+k}`. CVAE latent variable hấp thụ multimodality/style variation giữa demonstrations, còn Transformer xử lý hình ảnh/state và sinh cả chuỗi.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 5](/paper-figures/act/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Khi chạy, ACT query policy lặp lại và dùng **temporal ensembling** giữa các chunk overlap để làm chuyển động mượt. Đây chính là ancestor của vấn đề mà RTC bài báo sau này nghiên cứu: chunk giúp theo thời gian coherence nhưng tạo câu hỏi “khi chunk mới đến thì nối với chunk cũ thế nào?”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 3 gốc từ PDF bài báo, trang 3](/paper-figures/act/figure-3.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 3 giải thích nguồn quan sát trong hệ ALOHA: camera tổng thể, camera chính diện và hai wrist cameras không nhìn cùng một thứ. Camera tổng thể cho ngữ cảnh vị trí vật; wrist cameras giúp quan sát gần gripper, đặc biệt khi tiếp xúc hoặc vật bị che khuất. Phần cơ cấu gripper minh họa vì sao chất lượng demonstration còn phụ thuộc phần cứng. Khi đọc ACT, nên vẽ thêm mũi tên từ các camera và joint states tới encoder rồi tới action chunk; đừng nhầm Figure 3 là sơ đồ mạng Transformer.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ tự nghĩ: hai tay giữ túi, tay trái mở miệng túi trong khi tay phải đưa vật vào. Nếu mỗi timestep chỉ đoán một action độc lập, sai số pha nhỏ có thể khiến tay phải lao tới trước khi túi mở đủ. Với chunk length H, mạng sinh các joint targets cho cả hai tay trong một khoảng, giúp các bước có quan hệ thời gian. Khi query lại ở timestep tiếp theo, các chunk chồng nhau được tổng hợp để chuyển động không giật. Nhưng nếu vật đột ngột trượt, một chunk dài cũng tạo rủi ro phản ứng muộn. Vì vậy phải đánh giá cả success rate lẫn khả năng phục hồi khi trạng thái đổi.

### ACT học và sinh lệnh robot như thế nào?

**Khi huấn luyện**, dữ liệu có ảnh camera, vị trí các khớp và chuỗi hành động do người điều khiển thực hiện. Bộ mã hóa CVAE nhìn chuỗi lệnh mẫu để tạo z, rồi bộ giải mã cùng Transformer dùng ảnh, trạng thái và z để dự đoán lại đoạn chuyển động. Từ đó mô hình học cách các bước hành động có liên hệ.

**Khi chạy thật**, không có sẵn chuỗi tương lai của người. Bộ mã hóa CVAE được bỏ đi, z thường đặt bằng 0; policy nhận ảnh và trạng thái robot rồi sinh đoạn hành động. Những dự đoán chồng nhau có thể được tổng hợp theo trọng số trước khi phát lệnh. Đây là lý do sơ đồ có hai nhánh huấn luyện và thực thi: không phải mọi thành phần đều cần chạy trên robot.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Hai tay cầm mép áo và kéo. Policy stepwise dễ rung khi hai tay chỉ cần lệch pha một chút; ACT sinh 50 actions tương quan để tay trái và phải di chuyển cùng nhịp. Ở mỗi quan sát, ACT tạo chunk mới chồng lên chunk cũ. **Temporal ensembling** dùng weighted average cho các action dự đoán cùng timestep.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 7 từ PDF gốc, trang 7](/paper-figures/act/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Đây cũng là nơi xuất hiện vấn đề RTC sẽ sửa: average nhiều action modes đôi khi tạo action sai; nếu mô hình chạy chậm, chunk stitching có thể gây jerk.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Theo dõi một nhiệm vụ mở túi có khóa kéo

Robot dùng tay trái ghì túi, tay phải cầm miệng túi. Hai tay phải di chuyển cùng nhịp: tay trái giữ căng trong lúc tay phải kéo. Khi sinh cả đoạn hành động, ACT có cơ hội học chuỗi giữ–kéo thay vì quyết định từng tay một cách rời rạc.

Giả sử ngón kẹp tay phải bị trượt trước khi kéo. Nếu robot cứ phát tiếp các lệnh trong đoạn cũ, thao tác sẽ thất bại. Khi có quan sát mới, policy cần điều chỉnh ở lần dự đoán tiếp theo. Ví dụ này cho thấy chunking giúp giữ sự nhất quán nhưng không thay thế nhu cầu quan sát và sửa sai.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

ACT vượt các phương pháp đối chứng imitation-learning trước đó rất mạnh trong mô phỏng lẫn real bimanual nhiệm vụ. Bài báo báo second-best các phương pháp đối chứng có thể kém ACT tới hàng chục điểm, với chênh lệch khoảng **59, 49 và 29 điểm** ở một số thiết lập mô phỏng. Ablation cho thấy action chunking là yếu tố cực lớn: khi horizon tăng hợp lý, thành công có thể nhảy từ gần như không làm được lên mức đáng kể. Trên con người demonstration dữ liệu, bỏ CVAE cũng làm hiệu năng rơi rất mạnh, cho thấy multimodality của teleoperation không phải chuyện trang trí.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 5](/paper-figures/act/figure-6.webp)
![Hình 8 từ PDF gốc, trang 8](/paper-figures/act/figure-8.webp)
![Hình 9 từ PDF gốc, trang 11](/paper-figures/act/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Một điểm thực dụng là nhiều nhiệm vụ chỉ cần khoảng **10-20 phút demonstration** thay vì hàng giờ. Điều đó khiến ALOHA + ACT trở thành một recipe cực kỳ phổ biến cho phòng thí nghiệm nhỏ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những thí nghiệm nào chứng minh từng thành phần có ích?

Hình 9 kiểm tra các ý tưởng riêng rẽ: thêm action chunking vào mô hình khác, dùng hoặc không dùng temporal ensembling, và có hoặc bỏ phần huấn luyện CVAE. Chunking giúp cả hai phương pháp đối chứng được thử. Ensembling giúp một số policy nhưng khiến VINN kém hơn, nên không phải cứ thêm vào là tốt. Khi bỏ CVAE, kết quả học từ dữ liệu con người giảm trong thiết lập được thử.

Bài báo còn khảo sát tốc độ điều khiển từ xa: giảm tần số người ra lệnh từ 50 Hz xuống 5 Hz kéo dài thời gian hoàn thành. Đó là minh chứng rằng thời gian và sự phối hợp chuyển động là thành phần thật của bài toán, không chỉ là một chỉ số GPU.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** phần cứng không xử lý tốt high-force, multifinger hoặc những tương tác rất tinh vi. Các nhiệm vụ deformable/contact khó như mở wrapper, ziploc có thể fail dù những substep đơn giản như pick/pull đã làm được. 50 demos vẫn không đủ cho mọi nhiệm vụ và tác giả chỉ ra perception/pretraining/dữ liệu scale là hướng tiếp theo.

**Phê bình thêm:** chunking đổi một loại lỗi lấy một loại lỗi khác: nó giảm compounding error nhưng giảm reactivity giữa chunk. Theo thời gian averaging có thể average hai mode action hợp lệ thành quỹ đạo không hợp lệ, đúng vấn đề RTC bài báo sau này nêu. Joint-space action và cấu hình phần cứng cũng khá embodiment-specific. ACT là một policy motor rất tốt, nhưng **không phải general VLA**, không giải ngôn ngữ understanding, cross-embodiment hay open-world khái quát về ngữ nghĩa.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### ACT chưa giải quyết được những gì?

Một đoạn hành động dài có thể mượt nhưng không kịp phản ứng nếu vật bị đổi vị trí hoặc robot cầm hụt. Khi mạng tính đoạn mới chậm, robot vẫn có nguy cơ phải dừng để chờ. Đây là vấn đề các nghiên cứu RTC xử lý, chứ không phải một tính năng tự động có được từ chunking.

Mô hình cũng bị giới hạn bởi dữ liệu do người vận hành thu: một động tác không từng được biểu diễn đầy đủ thì khó bắt chước chính xác. Độ trễ camera, lực kẹp và cấu trúc khớp mới có thể làm policy thất bại dù lỗi dự đoán offline nhỏ.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RTC (inference)](/paper/rtc-inference)
- [RTC (training)](/paper/rtc-training)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### ACT khác Diffusion Policy và RTC ở chỗ nào?

ACT và Diffusion Policy đều sinh đoạn hành động. ACT sử dụng Transformer và CVAE; Diffusion Policy bắt đầu từ chuỗi nhiễu rồi chỉnh thành chuyển động hợp lệ. Cả hai đều cố tránh hiện tượng dự đoán từng bước làm chuyển động giật hoặc mất nhất quán.

RTC giải tầng thực thi: model mất thời gian sinh đoạn tiếp theo thì robot có phải đứng chờ không, và đoạn mới nối vào đoạn cũ như thế nào? Nhìn ba bài như ba câu hỏi về **học chuyển động, sinh chuyển động và thực thi liên tục** giúp hiểu mối liên hệ giữa chúng.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chạy một nhiệm vụ ALOHA mô phỏng, thử chunk 10/50/100, bật tắt temporal aggregation. Quan sát cả action smoothness lẫn rollout đạt yêu cầu. Log giới hạn VRAM và inferred control độ trễ.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự kiểm tra bằng một bảng ba cột

Hãy lập bảng gồm quan sát hiện tại, chuỗi lệnh dự đoán và lệnh robot đang chạy. Thêm trường hợp tay phải trượt khỏi túi giữa một đoạn. Đánh dấu những lệnh nên hủy hoặc cập nhật. Bài tập này giải thích vì sao không thể chỉ nhìn một đoạn video mượt để kết luận policy có phản hồi tốt.

Sau đó trả lời ba câu: CVAE làm gì trong lúc học? Bộ mã hóa CVAE có còn chạy khi điều khiển robot không? Temporal ensembling có luôn cải thiện mọi policy không?

<!-- END EXTENDED WALKTHROUGH -->

