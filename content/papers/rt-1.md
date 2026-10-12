## Vì sao cần nghiên cứu này?

Trước RT-1, phần lớn robot learning vẫn theo cách tiếp cận kiểu “một nhiệm vụ, một policy”, hoặc cùng lắm là một nhóm nhiệm vụ tương đối gần nhau. Cái thiếu không chỉ là kiến trúc tốt hơn, mà là bằng chứng rằng cách tiếp cận từng thành công ở NLP/vision - gom dữ liệu lớn, đa dạng rồi huấn luyện một mô hình chung - cũng có thể mở rộng quy mô trong robot học. Khó ở chỗ action của robot phải được tính và thực thi theo thời gian thực, dữ liệu đắt hơn Internet rất nhiều, và dịch chuyển phân phối dữ liệu giữa vật thể, phông nền, nhiệm vụ và bối cảnh dễ làm policy thất bại ngay. RT-1 vì thế hỏi một câu rất nền tảng: **nếu ta thật sự mở rộng quy mô dữ liệu robot thật và dùng một Transformer đủ lớn, khả năng khái quát có tăng một cách có hệ thống không?**

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rt-1/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 tổng hợp dữ liệu huấn luyện, Transformer policy và phạm vi đánh giá RT-1. Điểm quan trọng là real robot demonstrations được thu cho nhiều nhiệm vụ và instruction, chứ không chỉ mở rộng một kiến trúc network. Người đọc nên đặt câu hỏi cùng backbone nhưng ít đa dạng nhiệm vụ hơn thì thế nào, và data distribution có giới hạn ra sao. Những hình thành công trên robot thật cho biết policy có thể được triển khai trong thiết lập bài báo, không phải chứng minh mọi robot đều sẽ đạt cùng success rate.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Một policy có thể học hàng trăm chỉ dẫn robot khi dữ liệu đủ rộng và kiến trúc đủ nhanh. Cái thiếu không chỉ là kiến trúc tốt hơn, mà là bằng chứng rằng cách tiếp cận từng thành công ở NLP/vision - gom dữ liệu lớn, đa dạng rồi huấn luyện một mô hình chung - cũng có thể mở rộng quy mô trong robot học.

**Vấn đề khoa học nằm ở đâu?** Robot cần chia sẻ kỹ năng giữa nhiều công việc thay vì huấn luyện lại từ đầu cho từng yêu cầu. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Scale dữ liệu robot thật trước khi chỉ scale tham số là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Học chung nhiều chỉ dẫn bằng một Transformer nhỏ, conditioned theo ngôn ngữ và hình ảnh. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Một nhiệm vụ, một policy không thể mở rộng

**Luận điểm.** Robot cần chia sẻ kỹ năng giữa nhiều công việc thay vì huấn luyện lại từ đầu cho từng yêu cầu. Khó ở chỗ action của robot phải được tính và thực thi theo thời gian thực, dữ liệu đắt hơn Internet rất nhiều, và dịch chuyển phân phối dữ liệu giữa vật thể, phông nền, nhiệm vụ và bối cảnh dễ làm policy thất bại ngay.

**Tại sao lỗi này có hệ quả lớn?** Policy chuyên biệt nhớ môi trường, không học được kỹ năng chung. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân một nhiệm vụ, một policy không thể mở rộng vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: Policy chuyên biệt nhớ môi trường, không học được kỹ năng chung

**Luận điểm.** Nhiều demo giống nhau không bù được thiếu đa dạng nhiệm vụ; control còn phải chạy đủ nhanh. Trước RT-1, phần lớn robot learning vẫn theo cách tiếp cận kiểu “một nhiệm vụ, một policy”, hoặc cùng lắm là một nhóm nhiệm vụ tương đối gần nhau.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Nhiều demo giống nhau không bù được thiếu đa dạng nhiệm vụ; control còn phải chạy đủ nhanh.. Thay đổi trọng tâm là: Scale dữ liệu robot thật trước khi chỉ scale tham số. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Học chung nhiều chỉ dẫn bằng một Transformer nhỏ, conditioned theo ngôn ngữ và hình ảnh.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

RT-1 là **behavior cloning có điều kiện ngôn ngữ**: mạng nhận khung hình `o_t` và chỉ dẫn `l`, xuất action `a_t`. Khác phân loại có giám sát thông thường, lỗi dự đoán tự làm thay đổi quan sát về sau: khi gripper lệch 2 cm, camera nhìn một bối cảnh khác với demo, dẫn tới **compounding error**. Một policy đa nhiệm phải giải cả grounding (chỉ dẫn ám chỉ vật nào), perception và điều khiển trong một lần chạy forward.

Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer. Lượng tử hóa gây sai số và ảnh hưởng lớn ở chuyển động có độ chính xác cao.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer.

**Khái niệm thành cấu trúc tính toán.** Behavior cloning: Học action từ demonstration, không tự khám phá kỹ năng mới. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RT-1 huấn luyện một Transformer policy khoảng 35M tham số trên khoảng **130 nghìn episode**, thu trong **17 tháng** bằng **13 robot** và phủ hơn **700 chỉ dẫn/nhiệm vụ**. Ảnh đi qua EfficientNet, chỉ dẫn ngôn ngữ đi vào FiLM conditioning, sau đó TokenLearner nén token thị giác để Transformer vẫn chạy đủ nhanh cho robot. Các action được lượng tử hóa thành token thay vì hồi quy trực tiếp vector liên tục. Policy chạy ở khoảng 3 Hz, nên đây còn là một bài toán hệ thống chứ không chỉ độ chính xác khi đánh giá offline.

Điểm quan trọng hơn kiến trúc là cách bài báo làm ablation dữ liệu. Họ tách ảnh hưởng của **lượng dữ liệu**, **độ đa dạng nhiệm vụ**, **kích thước mô hình** và bổ sung thêm dữ liệu ngoài phân phối chính. Nhờ vậy RT-1 không chỉ nói “mô hình hoạt động tốt”, mà cung cấp một trong những bằng chứng sớm rằng **sự đa dạng của kinh nghiệm quan trọng ít nhất ngang tổng số mẫu thô**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rt-1/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 cho thấy language instruction được mã hóa thành embedding và dùng để điều kiện hóa visual tokens, trước khi sequence modeling sinh action tokens. EfficientNet là phần trích đặc trưng thị giác; Transformer học mối liên hệ giữa các quan sát đã được token hóa và lệnh hành động. Thao tác token hóa output phải khớp với số chiều action, trong đó gripper và termination signal có semantics riêng. Nếu chỉ gọi đây là 'image-to-text' là đã bỏ sót tầng quan trọng nhất: giải mã token thành lệnh điều khiển robot.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ robot được yêu cầu 'đặt lon đỏ vào ngăn dưới'. Camera cho thấy lon đỏ và lon xanh ở vị trí khác nhau. Nếu encoder và instruction conditioning hoạt động, policy cần tập trung đúng lon đỏ thay vì chỉ phản xạ với vị trí vật thể xuất hiện nhiều nhất trong data. Mã hóa action thành từng chiều, điều khiển tới vật, grasp rồi place. Một phép kiểm thử đáng làm là thay instruction thành lon xanh mà giữ nguyên hình, và quan sát action distribution thay đổi thế nào. Nếu không đổi, có thể model chưa dùng đúng instruction.

### Đào sâu: Scale dữ liệu robot thật trước khi chỉ scale tham số

**Luận điểm.** Học chung nhiều chỉ dẫn bằng một Transformer nhỏ, conditioned theo ngôn ngữ và hình ảnh. RT-1 huấn luyện một Transformer policy khoảng 35M tham số trên khoảng 130 nghìn episode, thu trong 17 tháng bằng 13 robot và phủ hơn 700 chỉ dẫn/nhiệm vụ.

**Giải thích không dùng tên model.** Học chung nhiều chỉ dẫn bằng một Transformer nhỏ, conditioned theo ngôn ngữ và hình ảnh. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Một policy có thể học hàng trăm chỉ dẫn robot khi dữ liệu đủ rộng và kiến trúc đủ nhanh. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Một policy có thể học hàng trăm chỉ dẫn robot khi dữ liệu đủ rộng và kiến trúc đủ nhanh. Ảnh đi qua EfficientNet, chỉ dẫn ngôn ngữ đi vào FiLM conditioning, sau đó TokenLearner nén token thị giác để Transformer vẫn chạy đủ nhanh cho robot.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Ảnh + chỉ dẫn → EfficientNet + FiLM → TokenLearner + Transformer → Action đã lượng tử hóa. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Ảnh đi qua EfficientNet, chỉ dẫn ngôn ngữ đi vào FiLM conditioning, sau đó TokenLearner nén token thị giác để Transformer vẫn chạy đủ nhanh cho robot. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Đầu vào: chuỗi ảnh camera + câu lệnh Khác phân loại có giám sát thông thường, lỗi dự đoán tự làm thay đổi quan sát về sau: khi gripper lệch 2 cm, camera nhìn một bối cảnh khác với demo, dẫn tới compounding error.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Đầu ra: các chiều chuyển động, quay và gripper dưới dạng action token. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Khác phân loại có giám sát thông thường, lỗi dự đoán tự làm thay đổi quan sát về sau: khi gripper lệch 2 cm, camera nhìn một bối cảnh khác với demo, dẫn tới compounding error. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Khoảng 130.000 episode robot thật trong 17 tháng. Điểm quan trọng hơn kiến trúc là cách bài báo làm ablation dữ liệu. Họ tách ảnh hưởng của lượng dữ liệu, độ đa dạng nhiệm vụ, kích thước mô hình và bổ sung thêm dữ liệu ngoài phân phối chính.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Một policy học hơn 700 chỉ dẫn/nhiệm vụ. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Điểm quan trọng hơn kiến trúc là cách bài báo làm ablation dữ liệu. Họ tách ảnh hưởng của lượng dữ liệu, độ đa dạng nhiệm vụ, kích thước mô hình và bổ sung thêm dữ liệu ngoài phân phối chính. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Bớt diversity nhiệm vụ gây tổn thất đáng kể. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Policy chọn action dựa trên những gì camera đã thấy và yêu cầu bằng ngôn ngữ. Các action được lượng tử hóa thành token thay vì hồi quy trực tiếp vector liên tục. Policy chạy ở khoảng 3 Hz, nên đây còn là một bài toán hệ thống chứ không chỉ độ chính xác khi đánh giá offline.

$$
p_\theta(a_t\mid o_{\le t},\ell)
$$

**Công thức đang mô tả thứ gì?** Policy chọn action dựa trên những gì camera đã thấy và yêu cầu bằng ngôn ngữ. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Các action được lượng tử hóa thành token thay vì hồi quy trực tiếp vector liên tục. Policy chạy ở khoảng 3 Hz, nên đây còn là một bài toán hệ thống chứ không chỉ độ chính xác khi đánh giá offline. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Đây là cách mô tả điều kiện của behavior cloning, không phải phương trình mới của tác giả. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử lệnh **"lấy quả táo đỏ đặt vào bát"**. `EfficientNet` mã hoá ảnh có nhiều đồ vật; chỉ dẫn đi vào FiLM để điều chỉnh trọng số các đặc trưng thị giác theo từ "táo đỏ" và "bát". `TokenLearner` rút gọn token không gian. Transformer dự đoán các thành phần action như dịch chuyển gripper, góc quay, độ mở kẹp và terminate. Sau khi thực thi, robot chụp khung hình mới và lặp lại. Đây là **behavior cloning trong vòng lặp kín** chứ không phải việc lập kế hoạch cho chuỗi hành động dài.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 6](/paper-figures/rt-1/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Khi chuyển robot sang một căn bếp khác, thất bại có thể do điều kiện chiếu sáng, vị trí đặt vật, hình học thao tác gắp hoặc hiểu biết về nhiệm vụ. Không thể chỉ nhìn tổng tỷ lệ thành công để biết nút thắt nằm ở đâu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Mỗi bước: ảnh mới và lệnh đi qua cùng policy. Giả sử lệnh "lấy quả táo đỏ đặt vào bát". EfficientNet mã hoá ảnh có nhiều đồ vật; chỉ dẫn đi vào FiLM để điều chỉnh trọng số các đặc trưng thị giác theo từ "táo đỏ" và "bát".

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Model sinh action discrete, giải mã thành lệnh điều khiển. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Giả sử lệnh "lấy quả táo đỏ đặt vào bát". EfficientNet mã hoá ảnh có nhiều đồ vật; chỉ dẫn đi vào FiLM để điều chỉnh trọng số các đặc trưng thị giác theo từ "táo đỏ" và "bát". Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Thiết kế nhỏ gọn để kịp vòng điều khiển thực tế. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên tập hơn 700 chỉ dẫn đã huấn luyện, RT-1 đạt khoảng **97% thành công**. Ở các nhóm kiểm tra khả năng khái quát như nhiệm vụ mới, distractor mới và phông nền mới, tác giả nêu mức cải thiện lớn so với phương pháp đối chứng trước đó, lần lượt khoảng **25, 36 và 18 điểm** trong các thiết lập được báo cáo. Một thí nghiệm rất đáng nhớ là khi thêm dữ liệu bin-picking từ Kuka vào mixture: khả năng khái quát sang bin-picking tăng gần gấp đôi mà hiệu năng trên tập nhiệm vụ gốc không bị phá đáng kể.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 7](/paper-figures/rt-1/figure-5.webp)
![Hình 6 từ PDF gốc, trang 9](/paper-figures/rt-1/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Các thí nghiệm ablation cũng cho thấy giảm **độ đa dạng nhiệm vụ** gây hại khả năng khái quát rất mạnh. Có những thiết lập mà bỏ 25% số nhiệm vụ gây tổn thất tương tự hoặc lớn hơn việc bỏ một lượng mẫu đáng kể nhưng vẫn giữ sự đa dạng. Đây là lý do RT-1 thường được nhắc như một bằng chứng sớm cho câu: **robotics cần mở rộng độ bao phủ nhiệm vụ, không chỉ lặp lại cùng một kỹ năng 100 nghìn lần**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Khoảng 97% thành công trên nhóm chỉ dẫn đã huấn luyện trong thiết lập báo cáo. Trên tập hơn 700 chỉ dẫn đã huấn luyện, RT-1 đạt khoảng 97% thành công. Ở các nhóm kiểm tra khả năng khái quát như nhiệm vụ mới, distractor mới và phông nền mới, tác giả nêu mức cải thiện lớn so với phương pháp đối chứng trước đó, lần lượt khoảng 25, 36 và 18 điểm trong các thiết lập được báo cáo.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Các nhóm đánh giá khả năng khái quát mới, distractor và background có cải thiện đáng kể. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Trên tập hơn 700 chỉ dẫn đã huấn luyện, RT-1 đạt khoảng 97% thành công. Ở các nhóm kiểm tra khả năng khái quát như nhiệm vụ mới, distractor mới và phông nền mới, tác giả nêu mức cải thiện lớn so với phương pháp đối chứng trước đó, lần lượt khoảng 25, 36 và 18 điểm trong các thiết lập được báo cáo. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Thêm dữ liệu Kuka bin-picking có thể giúp kỹ năng mới mà không phá mạnh kỹ năng cũ. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Bớt diversity nhiệm vụ gây tổn thất đáng kể. Một thí nghiệm rất đáng nhớ là khi thêm dữ liệu bin-picking từ Kuka vào mixture: khả năng khái quát sang bin-picking tăng gần gấp đôi mà hiệu năng trên tập nhiệm vụ gốc không bị phá đáng kể.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Hiệu quả phụ thuộc dữ liệu + cấu trúc điều kiện hóa thị giác/ngôn ngữ; không chỉ kích thước model. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Một thí nghiệm rất đáng nhớ là khi thêm dữ liệu bin-picking từ Kuka vào mixture: khả năng khái quát sang bin-picking tăng gần gấp đôi mà hiệu năng trên tập nhiệm vụ gốc không bị phá đáng kể. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Một thí nghiệm rất đáng nhớ là khi thêm dữ liệu bin-picking từ Kuka vào mixture: khả năng khái quát sang bin-picking tăng gần gấp đôi mà hiệu năng trên tập nhiệm vụ gốc không bị phá đáng kể. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** RT-1 vẫn là imitation learning, nên về nguyên tắc khó vượt quá phạm vi hành vi của demonstrator. “Nhiệm vụ chưa xuất hiện khi huấn luyện” phần lớn là sự kết hợp lại các động tác cơ bản đã thấy, không phải robot tự phát minh kỹ năng vật lý mới. Căn bếp mới vẫn có cấu trúc khá gần phân phối dữ liệu huấn luyện, và những nhiệm vụ thao tác chưa đòi hỏi dexterity/contact cực cao. Mô hình lớn hơn cũng nhanh chóng gặp nút thắt về độ trễ vì control phải chạy thời gian thực.

**Phê bình thêm:** RT-1 gần như chưa chứng minh khả năng chuyển giao giữa những cấu trúc robot khác nhau theo nghĩa hiện đại; 13 robot vẫn là cùng họ thiết bị và cấu hình phần cứng hơn là 13 cấu trúc cơ khí khác biệt. Discrete action tokens và tần số điều khiển thấp cũng đặt trần cho những nhiệm vụ cần các điều chỉnh ở tần số cao. Tập dữ liệu rất lớn cho năm 2023 nhưng vẫn được thu thập theo hệ thống phân loại nhiệm vụ do con người thiết kế, nên tính đa nhiệm của nó vẫn giới hạn trong một tập bài toán tương đối hẹp. Cuối cùng, tỷ lệ thành công cao trên nhiệm vụ huấn luyện dễ khiến người đọc quên rằng **phục hồi sau sai sót, suy luận liên quan đến lực và trí nhớ trong nhiệm vụ kéo dài** gần như chưa được đụng tới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Phê bình thêm: RT-1 gần như chưa chứng minh khả năng chuyển giao giữa những cấu trúc robot khác nhau theo nghĩa hiện đại; 13 robot vẫn là cùng họ thiết bị và cấu hình phần cứng hơn là 13 cấu trúc cơ khí khác biệt.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: policy vẫn học từ imitation và chỉ thấy một họ robot/cấu hình tương đối gần nhau. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Phê bình thêm: RT-1 gần như chưa chứng minh khả năng chuyển giao giữa những cấu trúc robot khác nhau theo nghĩa hiện đại; 13 robot vẫn là cùng họ thiết bị và cấu hình phần cứng hơn là 13 cấu trúc cơ khí khác biệt. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: thành công ở các tổ hợp đã thấy không chứng minh robot biết thao tác mới ngoài support của dữ liệu. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [OpenVLA](/paper/openvla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RT-2, OpenVLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: RT-2 tận dụng pretraining VLM để mở rộng tri thức ngữ nghĩa. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: OpenVLA đưa thiết kế VLA token-based sang hướng open-weight. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RT-2, OpenVLA. Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Làm một thử nghiệm nhỏ: huấn luyện BC trên ảnh + state với hai phiên bản `shared policy` và `separate policy per task`, đánh giá tỷ lệ thành công trên những bối cảnh thuộc tập kiểm tra. Đặt số demonstration cố định nhưng thay mức độ đa dạng nhiệm vụ. Quan sát thành công so với dữ liệu breadth, không chỉ loss khi huấn luyện.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Đa dạng nhiệm vụ và dữ liệu thật là điều kiện khởi đầu của generalist policy. Đặt số demonstration cố định nhưng thay mức độ đa dạng nhiệm vụ. Quan sát thành công so với dữ liệu breadth, không chỉ loss khi huấn luyện.

**Chọn điều cần mang sang dự án thật.** Bắt đầu bằng một shared policy rồi đo transfer theo nhiệm vụ. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Đa dạng nhiệm vụ và dữ liệu thật là điều kiện khởi đầu của generalist policy.

**Tái hiện tối thiểu.** Đặt số demonstration cố định nhưng thay mức độ đa dạng nhiệm vụ. Quan sát thành công so với dữ liệu breadth, không chỉ loss khi huấn luyện. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Sổ tay kiểm chứng: từ giả thuyết tới thử nghiệm

*Đây là các phép thử và ví dụ sư phạm, không phải kết quả thực nghiệm được tác giả báo cáo.*

#### Điểm cốt lõi: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Điểm cốt lõi', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Cái thiếu không chỉ là kiến trúc tốt hơn, mà là bằng chứng rằng cách tiếp cận từng thành công ở NLP/vision - gom dữ liệu lớn, đa dạng rồi huấn luyện một mô hình chung - cũng có thể mở rộng quy mô trong robot học. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một nhiệm vụ, một policy không thể mở rộng: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một nhiệm vụ, một policy không thể mở rộng', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khó ở chỗ action của robot phải được tính và thực thi theo thời gian thực, dữ liệu đắt hơn Internet rất nhiều, và dịch chuyển phân phối dữ liệu giữa vật thể, phông nền, nhiệm vụ và bối cảnh dễ làm policy thất bại ngay. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Policy chuyên biệt nhớ môi trường, không học được kỹ năng chung: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Policy chuyên biệt nhớ môi trường, không học được kỹ năng chung', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Trước RT-1, phần lớn robot learning vẫn theo cách tiếp cận kiểu “một nhiệm vụ, một policy”, hoặc cùng lắm là một nhóm nhiệm vụ tương đối gần nhau. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Scale dữ liệu robot thật trước khi chỉ scale tham số: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Scale dữ liệu robot thật trước khi chỉ scale tham số', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. RT-1 huấn luyện một Transformer policy khoảng 35M tham số trên khoảng 130 nghìn episode, thu trong 17 tháng bằng 13 robot và phủ hơn 700 chỉ dẫn/nhiệm vụ. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Ba khái niệm để nắm: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Ba khái niệm để nắm', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Việc tokenize action không biến robotics thành NLP theo nghĩa vật lý; nó chỉ đổi một vector liên tục thành một bài toán phân loại thuận tiện cho Transformer. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Kiến trúc trong một sơ đồ: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Kiến trúc trong một sơ đồ', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Ảnh đi qua EfficientNet, chỉ dẫn ngôn ngữ đi vào FiLM conditioning, sau đó TokenLearner nén token thị giác để Transformer vẫn chạy đủ nhanh cho robot. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Mô hình biểu diễn cái gì?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Mô hình biểu diễn cái gì?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Khác phân loại có giám sát thông thường, lỗi dự đoán tự làm thay đổi quan sát về sau: khi gripper lệch 2 cm, camera nhìn một bối cảnh khác với demo, dẫn tới compounding error. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Model học như thế nào?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Model học như thế nào?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Điểm quan trọng hơn kiến trúc là cách bài báo làm ablation dữ liệu. Họ tách ảnh hưởng của lượng dữ liệu, độ đa dạng nhiệm vụ, kích thước mô hình và bổ sung thêm dữ liệu ngoài phân phối chính. Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

#### Một lần inference xảy ra ra sao?: Theo dấu một episode

Đặt một quan sát cụ thể gồm ảnh, state và lệnh nhiệm vụ vào đầu pipeline. Với luận điểm 'Một lần inference xảy ra ra sao?', xác định khi nào thông tin mới được đọc, khi nào mô hình tạo action và khi nào phần cứng nhận lệnh. Giả sử lệnh "lấy quả táo đỏ đặt vào bát". EfficientNet mã hoá ảnh có nhiều đồ vật; chỉ dẫn đi vào FiLM để điều chỉnh trọng số các đặc trưng thị giác theo từ "táo đỏ" và "bát". Nếu không viết được chuỗi này, mô tả còn thiếu mắt xích quan trọng giữa mạng và hệ robot.

<!-- END EXTENDED WALKTHROUGH -->
