## Vì sao cần nghiên cứu này?

Bimanual manipulation khó ở hai phía cùng lúc: phần cứng teleoperation đắt và imitation learning có horizon rất dài. Nếu dự đoán từng action 50 Hz, một nhiệm vụ vài chục giây có hàng nghìn decision, nên chỉ cần policy hơi lệch một chút là compounding error đủ giết cả episode. Bài báo muốn chứng minh rằng **low-cost phần cứng + một biểu diễn theo thời gian tốt hơn** có thể học các kỹ năng hai tay khá tinh vi với lượng demo nhỏ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/act/figure-1.webp)

*Hình 1, trang 1. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://www.roboticsproceedings.org/rss19/p016.pdf#page=1).*

#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 không chỉ khoe một cánh tay robot. Phần bên trái cho thấy cơ chế leader–follower: người vận hành dịch chuyển hai tay leader, robot follower tái hiện chuyển động và hệ camera ghi lại thao tác. Các ảnh bên phải tách kỹ năng teleoperation khỏi kỹ năng policy đã học. Đây là hai đóng góp khác nhau: ALOHA giải bài toán tạo demonstration chất lượng với giá dễ tiếp cận hơn; ACT giải bài toán học chuỗi hành động từ những demonstration đó. Nếu chỉ có hardware tốt mà policy còn dự đoán từng bước thiếu ổn định, kết quả cuối vẫn có thể fail.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Một Transformer sinh cả action chunk giúp hai tay phối hợp ổn định hơn dự đoán từng bước. Nếu dự đoán từng action 50 Hz, một nhiệm vụ vài chục giây có hàng nghìn decision, nên chỉ cần policy hơi lệch một chút là compounding error đủ làm episode thất bại.

**Vấn đề khoa học nằm ở đâu?** Mỗi bước dự đoán sai một chút có thể làm hai tay lệch nhịp khi gấp áo, mở túi hoặc lắp ráp. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Dự đoán một đoạn chuyển động, không phải từng frame là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Transformer học action chunk có điều kiện theo ảnh và state; CVAE giữ được các style demonstration khác nhau. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Thao tác hai tay đòi sự phối hợp theo thời gian

**Luận điểm.** Mỗi bước dự đoán sai một chút có thể làm hai tay lệch nhịp khi gấp áo, mở túi hoặc lắp ráp. Bài báo muốn chứng minh rằng low-cost phần cứng + một biểu diễn theo thời gian tốt hơn có thể học các kỹ năng hai tay khá tinh vi với lượng demo nhỏ.

**Tại sao lỗi này có hệ quả lớn?** Stepwise behavior cloning tích lũy lỗi. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân thao tác hai tay đòi sự phối hợp theo thời gian vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Stepwise behavior cloning tích lũy lỗi

**Luận điểm.** Teleoperation hai tay từng đắt và dữ liệu ít; hỏi mạng mỗi timestep làm chuyển động thiếu nhất quán. Thay vì dự đoán một action, ACT dự đoán một chunk a_t ... a_{t+k}. CVAE latent variable hấp thụ multimodality/style variation giữa demonstrations, còn Transformer xử lý hình ảnh/state và sinh cả chuỗi.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Teleoperation hai tay từng đắt và dữ liệu ít; hỏi mạng mỗi timestep làm chuyển động thiếu nhất quán.. Thay đổi trọng tâm là: Dự đoán một đoạn chuyển động, không phải từng frame. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Transformer học action chunk có điều kiện theo ảnh và state; CVAE giữ được các style demonstration khác nhau.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Một lần dự đoán `a_t` ở 50 Hz nghĩa là 50 decisions/giây, dễ sai số tích luỹ. **Action chunking** chuyển thành dự đoán `A_{t:t+H}`, giảm tần suất query nhưng vẫn có khả năng đóng vòng nếu overlap. **CVAE** mã hoá style của demonstration; latent `z` giúp phân biệt những chuyển động hai tay khác nhau cùng đạt mục đích.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Một lần dự đoán a_t ở 50 Hz nghĩa là 50 decisions/giây, dễ sai số tích luỹ. Action chunking chuyển thành dự đoán A_{t:t+H}, giảm tần suất query nhưng vẫn có khả năng đóng vòng nếu overlap.

**Khái niệm thành cấu trúc tính toán.** Action chunking: Một lần dự đoán H action liên tiếp. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Một lần dự đoán a_t ở 50 Hz nghĩa là 50 decisions/giây, dễ sai số tích luỹ. Action chunking chuyển thành dự đoán A_{t:t+H}, giảm tần suất query nhưng vẫn có khả năng đóng vòng nếu overlap. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

ALOHA là hệ leader-follower giá thấp cho teleoperation hai tay ở **50 Hz**. Về learning, bài báo đưa ra **Action chunking with Transformers (ACT)**. Thay vì dự đoán một action, ACT dự đoán một chunk `a_t ... a_{t+k}`. CVAE latent variable hấp thụ multimodality/style variation giữa demonstrations, còn Transformer xử lý hình ảnh/state và sinh cả chuỗi.

Khi chạy, ACT query policy lặp lại và dùng **temporal ensembling** giữa các chunk overlap để làm chuyển động mượt. Đây chính là ancestor của vấn đề mà RTC bài báo sau này nghiên cứu: chunk giúp theo thời gian coherence nhưng tạo câu hỏi “khi chunk mới đến thì nối với chunk cũ thế nào?”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 3 gốc từ PDF bài báo, trang 3](/paper-figures/act/figure-3.webp)

*Hình 3, trang 3. Ảnh được cắt từ PDF gốc, không phải hình AI tái tạo. [Xem caption đầy đủ trong PDF](https://www.roboticsproceedings.org/rss19/p016.pdf#page=3).*

#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 3 giải thích nguồn quan sát trong hệ ALOHA: camera tổng thể, camera chính diện và hai wrist cameras không nhìn cùng một thứ. Camera tổng thể cho ngữ cảnh vị trí vật; wrist cameras giúp quan sát gần gripper, đặc biệt khi tiếp xúc hoặc vật bị che khuất. Phần cơ cấu gripper minh họa vì sao chất lượng demonstration còn phụ thuộc phần cứng. Khi đọc ACT, nên vẽ thêm mũi tên từ các camera và joint states tới encoder rồi tới action chunk; đừng nhầm Figure 3 là sơ đồ mạng Transformer.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ tự nghĩ: hai tay giữ túi, tay trái mở miệng túi trong khi tay phải đưa vật vào. Nếu mỗi timestep chỉ đoán một action độc lập, sai số pha nhỏ có thể khiến tay phải lao tới trước khi túi mở đủ. Với chunk length H, mạng sinh các joint targets cho cả hai tay trong một khoảng, giúp các bước có quan hệ thời gian. Khi query lại ở timestep tiếp theo, các chunk chồng nhau được tổng hợp để chuyển động không giật. Nhưng nếu vật đột ngột trượt, một chunk dài cũng tạo rủi ro phản ứng muộn. Vì vậy phải đánh giá cả success rate lẫn khả năng phục hồi khi trạng thái đổi.

### Đào sâu: Dự đoán một đoạn chuyển động, không phải từng frame

**Luận điểm.** Transformer học action chunk có điều kiện theo ảnh và state; CVAE giữ được các style demonstration khác nhau. CVAE latent variable hấp thụ multimodality/style variation giữa demonstrations, còn Transformer xử lý hình ảnh/state và sinh cả chuỗi.

**Giải thích không dùng tên model.** Transformer học action chunk có điều kiện theo ảnh và state; CVAE giữ được các style demonstration khác nhau. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Một Transformer sinh cả action chunk giúp hai tay phối hợp ổn định hơn dự đoán từng bước. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Một Transformer sinh cả action chunk giúp hai tay phối hợp ổn định hơn dự đoán từng bước. Đây chính là ancestor của vấn đề mà RTC bài báo sau này nghiên cứu: chunk giúp theo thời gian coherence nhưng tạo câu hỏi “khi chunk mới đến thì nối với chunk cũ thế nào?”.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự ALOHA thu demo → Ảnh + trạng thái khớp → ACT + CVAE → Chunk → temporal ensemble. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Đây chính là ancestor của vấn đề mà RTC bài báo sau này nghiên cứu: chunk giúp theo thời gian coherence nhưng tạo câu hỏi “khi chunk mới đến thì nối với chunk cũ thế nào?”. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Action joint-space của hai tay được xếp thành chuỗi H × D. Khi chạy, ACT query policy lặp lại và dùng temporal ensembling giữa các chunk overlap để làm chuyển động mượt.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: CVAE code đại diện biến thiên không quan sát trực tiếp trong demonstration. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Khi chạy, ACT query policy lặp lại và dùng temporal ensembling giữa các chunk overlap để làm chuyển động mượt. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** ALOHA leader–follower thu teleoperation 50 Hz với chi phí thấp. ALOHA là hệ leader-follower giá thấp cho teleoperation hai tay ở 50 Hz. Về learning, bài báo đưa ra Action chunking with Transformers (ACT).

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Transformer tối ưu reconstruction action chunk + regularization latent. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** ALOHA là hệ leader-follower giá thấp cho teleoperation hai tay ở 50 Hz. Về learning, bài báo đưa ra Action chunking with Transformers (ACT). Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Sửa chunk length: quá ngắn thì rung, quá dài thì stale. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Thay một quyết định aₜ bằng kế hoạch chuyển động H bước; người học thấy rõ tác dụng của horizon. Về learning, bài báo đưa ra Action chunking with Transformers (ACT). Thay vì dự đoán một action, ACT dự đoán một chunk a_t ... a_{t+k}.

$$
A_t=\big(a_t,a_{t+1},\ldots,a_{t+H-1}\big)
$$

**Công thức đang mô tả thứ gì?** Thay một quyết định aₜ bằng kế hoạch chuyển động H bước; người học thấy rõ tác dụng của horizon. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Về learning, bài báo đưa ra Action chunking with Transformers (ACT). Thay vì dự đoán một action, ACT dự đoán một chunk a_t ... a_{t+k}. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Đây là ký hiệu action chunk, không phải hàm loss. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Hai tay cầm mép áo và kéo. Policy stepwise dễ rung khi hai tay chỉ cần lệch pha một chút; ACT sinh 50 actions tương quan để tay trái và phải di chuyển cùng nhịp. Ở mỗi quan sát, ACT tạo chunk mới chồng lên chunk cũ. **Temporal ensembling** dùng weighted average cho các action dự đoán cùng timestep.

Đây cũng là nơi xuất hiện vấn đề RTC sẽ sửa: average nhiều action modes đôi khi tạo action sai; nếu mô hình chạy chậm, chunk stitching có thể gây jerk.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Nhận ảnh và state tại thời điểm hiện tại. Ở mỗi quan sát, ACT tạo chunk mới chồng lên chunk cũ. Temporal ensembling dùng weighted average cho các action dự đoán cùng timestep.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Xuất cả chuỗi hành động hai tay. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Ở mỗi quan sát, ACT tạo chunk mới chồng lên chunk cũ. Temporal ensembling dùng weighted average cho các action dự đoán cùng timestep. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Temporal ensembling dùng các dự đoán overlapping để giảm discontinuity. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

ACT vượt các phương pháp đối chứng imitation-learning trước đó rất mạnh trong mô phỏng lẫn real bimanual nhiệm vụ. Bài báo báo second-best các phương pháp đối chứng có thể kém ACT tới hàng chục điểm, với chênh lệch khoảng **59, 49 và 29 điểm** ở một số thiết lập mô phỏng. Ablation cho thấy action chunking là yếu tố cực lớn: khi horizon tăng hợp lý, thành công có thể nhảy từ gần như không làm được lên mức đáng kể. Trên con người demonstration dữ liệu, bỏ CVAE cũng làm hiệu năng rơi rất mạnh, cho thấy multimodality của teleoperation không phải chuyện trang trí.

Một điểm thực dụng là nhiều nhiệm vụ chỉ cần khoảng **10-20 phút demonstration** thay vì hàng giờ. Điều đó khiến ALOHA + ACT trở thành một recipe cực kỳ phổ biến cho phòng thí nghiệm nhỏ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** ACT vượt các baseline imitation learning trong simulation và thao tác hai tay thật. ACT vượt các phương pháp đối chứng imitation-learning trước đó rất mạnh trong mô phỏng lẫn real bimanual nhiệm vụ.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Trong một số setup mô phỏng, khoảng cách với baseline mạnh thứ hai lên tới hàng chục điểm. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. ACT vượt các phương pháp đối chứng imitation-learning trước đó rất mạnh trong mô phỏng lẫn real bimanual nhiệm vụ. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Ablation cho thấy bỏ chunking hoặc CVAE có thể làm performance giảm lớn. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Sửa chunk length: quá ngắn thì rung, quá dài thì stale. Trên con người demonstration dữ liệu, bỏ CVAE cũng làm hiệu năng rơi rất mạnh, cho thấy multimodality của teleoperation không phải chi tiết phụ.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Bỏ CVAE làm yếu khả năng học từ nhiều style teleoperation. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Trên con người demonstration dữ liệu, bỏ CVAE cũng làm hiệu năng rơi rất mạnh, cho thấy multimodality của teleoperation không phải chi tiết phụ. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Trên con người demonstration dữ liệu, bỏ CVAE cũng làm hiệu năng rơi rất mạnh, cho thấy multimodality của teleoperation không phải chi tiết phụ. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** phần cứng không xử lý tốt high-force, multifinger hoặc những tương tác rất tinh vi. Các nhiệm vụ deformable/contact khó như mở wrapper, ziploc có thể fail dù những substep đơn giản như pick/pull đã làm được. 50 demos vẫn không đủ cho mọi nhiệm vụ và tác giả chỉ ra perception/pretraining/dữ liệu scale là hướng tiếp theo.

**Phê bình thêm:** chunking đổi một loại lỗi lấy một loại lỗi khác: nó giảm compounding error nhưng giảm reactivity giữa chunk. Theo thời gian averaging có thể average hai mode action hợp lệ thành quỹ đạo không hợp lệ, đúng vấn đề RTC bài báo sau này nêu. Joint-space action và cấu hình phần cứng cũng khá embodiment-specific. ACT là một policy motor rất tốt, nhưng **không phải general VLA**, không giải ngôn ngữ understanding, cross-embodiment hay open-world khái quát về ngữ nghĩa.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Bài báo thừa nhận: phần cứng không xử lý tốt high-force, multifinger hoặc những tương tác rất tinh vi.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: ALOHA chưa phù hợp lực cao hoặc manipulation nhiều ngón tinh vi. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Bài báo thừa nhận: phần cứng không xử lý tốt high-force, multifinger hoặc những tương tác rất tinh vi. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: ensemble của hai action mode đôi khi tạo chuyển động không hợp lệ, dẫn tới bài toán RTC. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RTC (inference)](/paper/rtc-inference)
- [RTC (training)](/paper/rtc-training)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RTC (inference), RTC (training). Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: Diffusion Policy cung cấp action generation đa mode theo chunk. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: RTC xử lý nối action chunk khi policy chạy chậm hơn control loop. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RTC (inference), RTC (training). Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chạy một nhiệm vụ ALOHA mô phỏng, thử chunk 10/50/100, bật tắt temporal aggregation. Quan sát cả action smoothness lẫn rollout đạt yêu cầu. Log giới hạn VRAM và inferred control độ trễ.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Action chunking là một thay đổi lớn trong imitation learning control. Chạy một nhiệm vụ ALOHA mô phỏng, thử chunk 10/50/100, bật tắt temporal aggregation. Quan sát cả action smoothness lẫn rollout đạt yêu cầu.

**Chọn điều cần mang sang dự án thật.** Bắt đầu với mô phỏng ALOHA và sweep chunk_size/ensemble. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Action chunking là một thay đổi lớn trong imitation learning control.

**Tái hiện tối thiểu.** Chạy một nhiệm vụ ALOHA mô phỏng, thử chunk 10/50/100, bật tắt temporal aggregation. Quan sát cả action smoothness lẫn rollout đạt yêu cầu. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

