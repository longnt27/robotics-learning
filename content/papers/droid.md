## Vì sao cần nghiên cứu này?

Nhiều robot tập dữ liệu lớn vẫn được thu thập trong vài phòng thí nghiệm setup được dựng cẩn thận. Mô hình có thể thấy nhiều các quỹ đạo nhưng bối cảnh statistics gần như giống nhau, nên nó học shortcut về phông nền/camera/table thay vì manipulation invariants. DROID muốn kiểm tra thesis: **nếu cùng một robot được mang đi rất nhiều tòa nhà, phòng, operator và vật thể setup, khả năng khái quát có tăng đáng kể không?**

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/droid/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 giới thiệu một chiến lược thu dữ liệu khác việc dựng vài scene sạch trong phòng lab: robot được đưa tới nhiều công trình và môi trường thật. DROID công bố khoảng 76.000 trajectories, 350 giờ dữ liệu với đa dạng bối cảnh đáng kể. Điểm đáng học không chỉ là số giờ mà là phân phối: ánh sáng, nền, đồ vật, operator và cách sắp xếp cảnh thay đổi. Chính sự thay đổi này giúp đánh giá khả năng model chú ý đến affordance của vật thay vì nhớ texture của chiếc bàn.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Chất lượng dữ liệu robot không chỉ nằm ở số giờ, mà ở độ đa dạng của thế giới thật. Nhiều robot tập dữ liệu lớn vẫn được thu thập trong vài phòng thí nghiệm setup được dựng cẩn thận.

**Vấn đề khoa học nằm ở đâu?** Ánh sáng, vật thể, operator và bố cục thay đổi nhiều hơn những gì dataset tập trung trong phòng lab phản ánh. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Tăng environment diversity có thể giá trị hơn tăng lặp lại là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Thu thập robot demonstrations ngoài lab bằng protocol và phần cứng tương đối chuẩn hóa. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Robot giỏi trong lab có thể thất bại ở phòng khác

**Luận điểm.** Ánh sáng, vật thể, operator và bố cục thay đổi nhiều hơn những gì dataset tập trung trong phòng lab phản ánh. Mô hình có thể thấy nhiều các quỹ đạo nhưng bối cảnh statistics gần như giống nhau, nên nó học shortcut về phông nền/camera/table thay vì manipulation invariants.

**Tại sao lỗi này có hệ quả lớn?** Dữ liệu nhiều episode nhưng ít environments học shortcut thị giác. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân robot giỏi trong lab có thể thất bại ở phòng khác vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Dữ liệu nhiều episode nhưng ít environments học shortcut thị giác

**Luận điểm.** Model có thể nhận dạng màu bàn thay vì affordance của vật cần thao tác. DROID muốn kiểm tra thesis: nếu cùng một robot được mang đi rất nhiều tòa nhà, phòng, operator và vật thể setup, khả năng khái quát có tăng đáng kể không?

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Model có thể nhận dạng màu bàn thay vì affordance của vật cần thao tác.. Thay đổi trọng tâm là: Tăng environment diversity có thể giá trị hơn tăng lặp lại. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Thu thập robot demonstrations ngoài lab bằng protocol và phần cứng tương đối chuẩn hóa.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 9 từ PDF gốc, trang 10](/paper-figures/droid/figure-9.webp)


![Hình 12 từ PDF gốc, trang 17](/paper-figures/droid/figure-12.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Kiến thức nền cần nắm

Bottleneck thực tế là thu dữ liệu robot **ngoài phòng phòng thí nghiệm**: lighting, vật thể, operator kỹ năng và phông nền thay đổi làm phân phối phức tạp hơn số lượng episode. DROID tập trung vào protocol thu thập để policy học từ nhiều cảnh đời thực.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Bottleneck thực tế là thu dữ liệu robot ngoài phòng phòng thí nghiệm: lighting, vật thể, operator kỹ năng và phông nền thay đổi làm phân phối phức tạp hơn số lượng episode.

**Khái niệm thành cấu trúc tính toán.** In-the-wild collection: Thu dữ liệu qua rất nhiều nơi/điều kiện thật. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Bottleneck thực tế là thu dữ liệu robot ngoài phòng phòng thí nghiệm: lighting, vật thể, operator kỹ năng và phông nền thay đổi làm phân phối phức tạp hơn số lượng episode. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

DROID thu khoảng **76 nghìn các quỹ đạo / 350 giờ**, trong **564 bối cảnh**, **86 nhiệm vụ**, **52 buildings** với khoảng **50 collectors**. Hardware được chuẩn hóa quanh Franka + camera setup để nhiều institution có thể thu dữ liệu nhưng action không gian vẫn thống nhất. Tập dữ liệu cố tình ưu tiên “in-the-wild” environmental variation thay vì chỉ tăng quỹ đạo count trong một phòng thí nghiệm.

Bài báo huấn luyện diffusion-style policies và làm matched-data ablation: cùng số demonstrations nhưng chọn từ nhiều bối cảnh hơn hoặc ít bối cảnh hơn. Điều này cho phép tách **quantity** khỏi **environment sự đa dạng**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/droid/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 thể hiện một thiết kế tưởng như mâu thuẫn: dùng nền tảng phần cứng tương đối thống nhất để nhiều nhóm ở nhiều nơi thu thập. Thống nhất robot/camera giúp action space và logging nhất quán; thay đổi environment mới là biến nghiên cứu. Nếu mỗi phòng dùng phần cứng khác nhau, khó biết performance gain đến từ dữ liệu đa dạng hay từ khác biệt trong controller, frequency và sensor. Đây là một bài học về thiết kế thí nghiệm, không chỉ logistics.

#### Ví dụ từng bước để hiểu cơ chế

Khi kiểm tra một subset DROID, hãy vẽ timestamp giữa image, proprioception và action; xem vài episode cạnh nhau để phát hiện camera lệch hoặc robot đứng im quá lâu. Với mô hình baseline, đánh giá một tập test cùng environment và một tập test khác environment. Nếu accuracy của action tăng mà success rate không tăng, cần xem có bị lệch temporal synchronization hoặc action normalization không. Đừng gộp mọi episode thành một score rồi kết luận dataset đã giải quyết vấn đề khái quát.

### Đào sâu: Tăng environment diversity có thể giá trị hơn tăng lặp lại

**Luận điểm.** Thu thập robot demonstrations ngoài lab bằng protocol và phần cứng tương đối chuẩn hóa. Hardware được chuẩn hóa quanh Franka + camera setup để nhiều institution có thể thu dữ liệu nhưng action không gian vẫn thống nhất.

**Giải thích không dùng tên model.** Thu thập robot demonstrations ngoài lab bằng protocol và phần cứng tương đối chuẩn hóa. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Chất lượng dữ liệu robot không chỉ nằm ở số giờ, mà ở độ đa dạng của thế giới thật. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Chất lượng dữ liệu robot không chỉ nằm ở số giờ, mà ở độ đa dạng của thế giới thật. DROID thu khoảng 76 nghìn các quỹ đạo / 350 giờ, trong 564 bối cảnh, 86 nhiệm vụ, 52 buildings với khoảng 50 collectors.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Franka + cameras → 50 collectors / 52 buildings → 76K trajectories → Diverse-scene policy tests. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** DROID thu khoảng 76 nghìn các quỹ đạo / 350 giờ, trong 564 bối cảnh, 86 nhiệm vụ, 52 buildings với khoảng 50 collectors. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Observation có góc nhìn/ánh sáng/scene khác nhau. Tập dữ liệu cố tình ưu tiên “in-the-wild” environmental variation thay vì chỉ tăng quỹ đạo count trong một phòng thí nghiệm.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Một họ robot phần cứng giữ action tương đối nhất quán. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Tập dữ liệu cố tình ưu tiên “in-the-wild” environmental variation thay vì chỉ tăng quỹ đạo count trong một phòng thí nghiệm. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Khoảng 76.000 trajectories, 350 giờ dữ liệu trong 564 bối cảnh. Bài báo huấn luyện diffusion-style policies và làm matched-data ablation: cùng số demonstrations nhưng chọn từ nhiều bối cảnh hơn hoặc ít bối cảnh hơn.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Training kết hợp DROID và target-task data. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Bài báo huấn luyện diffusion-style policies và làm matched-data ablation: cùng số demonstrations nhưng chọn từ nhiều bối cảnh hơn hoặc ít bối cảnh hơn. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Giữ số trajectories, thay số environments xuất hiện. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Model học từ cảnh đa dạng sẽ bớt lệ thuộc background; công thức chỉ mô tả hướng phụ thuộc, không phải fit thực nghiệm. Nhưng dữ liệu còn phụ thuộc vào con người operator và phần cứng robot; action frequency/camera alignment có thể trở thành confound.

$$
\Delta\mathrm{OOD}\approx f(\mathrm{coverage},\,\mathrm{quality})
$$

**Công thức đang mô tả thứ gì?** Model học từ cảnh đa dạng sẽ bớt lệ thuộc background; công thức chỉ mô tả hướng phụ thuộc, không phải fit thực nghiệm. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Nhưng dữ liệu còn phụ thuộc vào con người operator và phần cứng robot; action frequency/camera alignment có thể trở thành confound. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Không phải phương trình gốc hoặc lời hứa rằng càng nhiều cảnh luôn tốt. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 3 từ PDF gốc, trang 5](/paper-figures/droid/figure-3.webp)


![Hình 4 từ PDF gốc, trang 6](/paper-figures/droid/figure-4.webp)


![Hình 5 từ PDF gốc, trang 6](/paper-figures/droid/figure-5.webp)


![Hình 6 từ PDF gốc, trang 7](/paper-figures/droid/figure-6.webp)


![Hình 8 từ PDF gốc, trang 9](/paper-figures/droid/figure-8.webp)


![Hình 10 từ PDF gốc, trang 10](/paper-figures/droid/figure-10.webp)


![Hình 11 từ PDF gốc, trang 16](/paper-figures/droid/figure-11.webp)


![Hình 16 từ PDF gốc, trang 22](/paper-figures/droid/figure-16.webp)


![Hình 18 từ PDF gốc, trang 24](/paper-figures/droid/figure-18.webp)


![Hình 19 từ PDF gốc, trang 25](/paper-figures/droid/figure-19.webp)


![Hình 20 từ PDF gốc, trang 26](/paper-figures/droid/figure-20.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Ví dụ từng bước

Ở cùng nhiệm vụ pick-place, một bối cảnh có bàn kính phản quang, bối cảnh khác có khăn và đồ vật cluttered. DROID-style collection khiến thị giác encoder phải học affordance thay vì memorize màu bàn. Nhưng dữ liệu còn phụ thuộc vào con người operator và phần cứng robot; action frequency/camera alignment có thể trở thành confound.

Trong dữ liệu audit, inspect synchronization giữa RGB khung hình timestamps và proprioception/action timestamps; lệch vài khung hình cũng có thể tạo label noise rất lớn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Policy chạy trên các cảnh có độ nhiễu/thay đổi thật. DROID-style collection khiến thị giác encoder phải học affordance thay vì memorize màu bàn.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Đo success in-domain và out-of-domain. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. DROID-style collection khiến thị giác encoder phải học affordance thay vì memorize màu bàn. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Dữ liệu mục tiêu vẫn cần để adapt; không phải zero-shot universal robot. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Khi thêm DROID vào dữ liệu của nhiệm vụ đích theo mixture, tác giả báo cáo mức cải thiện khoảng **22 điểm ở in-domain** và **17 điểm ở out-of-domain** so với thiết lập đối chứng tốt thứ hai trong các nhiệm vụ được đánh giá. Toàn bộ DROID tốt hơn subset nhỏ, nhưng điểm quan trọng hơn là **tập con có nhiều bối cảnh tốt hơn tập con ít đa dạng với cùng số mẫu**. Nói cách khác, 7 nghìn quỹ đạo đi khắp nơi có thể đáng hơn 7 nghìn quỹ đạo quay đi quay lại trong 20 bối cảnh.

Đây là một evidence rất trực tiếp cho data-collection strategy mà người đọc đang thấy ở headcam: coverage của phân phối có giá trị độc lập với số giờ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Bộ dữ liệu: khoảng 76K trajectories/350 giờ qua 564 scenes và 86 nhiệm vụ. Khi thêm DROID vào dữ liệu của nhiệm vụ đích theo mixture, tác giả báo cáo mức cải thiện khoảng 22 điểm ở in-domain và 17 điểm ở out-of-domain so với thiết lập đối chứng tốt thứ hai trong các nhiệm vụ được đánh giá.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Một số thiết lập mixture tăng khoảng 22 điểm in-domain và 17 điểm out-of-domain. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Khi thêm DROID vào dữ liệu của nhiệm vụ đích theo mixture, tác giả báo cáo mức cải thiện khoảng 22 điểm ở in-domain và 17 điểm ở out-of-domain so với thiết lập đối chứng tốt thứ hai trong các nhiệm vụ được đánh giá. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Ở cùng số mẫu, subset trải rộng nhiều scenes tốt hơn subset tập trung. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Giữ số trajectories, thay số environments xuất hiện. Đây là một evidence rất trực tiếp cho data-collection strategy mà người đọc đang thấy ở headcam: coverage của phân phối có giá trị độc lập với số giờ.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Mức cải thiện đến từ environmental diversity không chỉ dataset size. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Đây là một evidence rất trực tiếp cho data-collection strategy mà người đọc đang thấy ở headcam: coverage của phân phối có giá trị độc lập với số giờ. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Đây là một evidence rất trực tiếp cho data-collection strategy mà người đọc đang thấy ở headcam: coverage của phân phối có giá trị độc lập với số giờ. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 7 từ PDF gốc, trang 8](/paper-figures/droid/figure-7.webp)


![Hình 13 từ PDF gốc, trang 19](/paper-figures/droid/figure-13.webp)


![Hình 14 từ PDF gốc, trang 20](/paper-figures/droid/figure-14.webp)


![Hình 15 từ PDF gốc, trang 21](/paper-figures/droid/figure-15.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** DROID vẫn dùng một main robot phần cứng, nên chủ yếu giải bối cảnh/độ đa dạng nhiệm vụ chứ không giải cross-embodiment. Scope manipulation vẫn tabletop-ish và chưa chạm hết dynamic/deformable/contact-rich world.

**Phê bình thêm:** 350 giờ là lớn với real robot 2024 nhưng nhỏ so với 10k-50k giờ pretraining corpora 2026. Policies trong bài báo vẫn cần target-task demonstrations, nên DROID là prior chứ không tạo zero-shot generalist. Tập dữ liệu chủ yếu lọc successful/usable các quỹ đạo, thiếu thất bại/phục hồi. Real đánh giá cũng chỉ có số nhiệm vụ và rollouts hạn chế, nên con số gain không nên extrapolate thành “độ đa dạng bối cảnh giải khả năng khái quát”. Nó giải một phần rất quan trọng, nhưng chỉ một phần.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Phê bình thêm: 350 giờ là lớn với real robot 2024 nhưng nhỏ so với 10k-50k giờ pretraining corpora 2026.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: chủ yếu một platform robot; chưa bao phủ mọi tương tác giàu lực. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Phê bình thêm: 350 giờ là lớn với real robot 2024 nhưng nhỏ so với 10k-50k giờ pretraining corpora 2026. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: 350 giờ còn nhỏ so với các VLA corpora 2026, nhiều fail/recovery behaviors chưa được mô hình hóa. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 17 từ PDF gốc, trang 22](/paper-figures/droid/figure-17.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Open X-Embodiment](/paper/open-x-embodiment)
- [RoboCasa](/paper/robocasa)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm Open X-Embodiment, RoboCasa. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: BridgeData V2 nhấn mạnh skill/environment coverage trước đó. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: Open X-Embodiment đưa thêm độ khác biệt giữa các embodiment. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm Open X-Embodiment, RoboCasa. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Dùng mẫu DROID video + state, plot timestamp delta, quỹ đạo smoothness và coverage. Xây 1 trang data-quality báo cáo trước khi huấn luyện policy.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Thiết kế data collection theo scene coverage có thể đáng giá hơn replay. Dùng mẫu DROID video + state, plot timestamp delta, quỹ đạo smoothness và coverage. Xây 1 trang data-quality báo cáo trước khi huấn luyện policy.

**Chọn điều cần mang sang dự án thật.** Cần split held-out environments và đo thật closed-loop. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Thiết kế data collection theo scene coverage có thể đáng giá hơn replay.

**Tái hiện tối thiểu.** Dùng mẫu DROID video + state, plot timestamp delta, quỹ đạo smoothness và coverage. Xây 1 trang data-quality báo cáo trước khi huấn luyện policy. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

