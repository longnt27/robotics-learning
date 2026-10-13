## Vì sao cần nghiên cứu này?

Robot được dạy đặt cốc vào khay, rồi học thêm mở ngăn kéo. Sau khi học việc thứ hai, liệu nó còn làm đúng việc thứ nhất không? Và việc đã biết đặt cốc có giúp học mở ngăn kéo nhanh hơn không? **LIBERO được xây dựng để nghiên cứu việc học nhiều nhiệm vụ nối tiếp nhau**, trong đó mô hình có thể chuyển kiến thức hoặc quên kỹ năng cũ. Bộ nhiệm vụ chia riêng những thay đổi về vị trí, vật thể và mục tiêu để người nghiên cứu hiểu rõ hơn tại sao một cách học có hiệu quả hoặc thất bại. Đây là bộ đánh giá, không phải mô hình điều khiển mới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/libero/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 chia các bộ nhiệm vụ theo kiểu thay đổi kiến thức cần chuyển giao: vị trí đối tượng, đối tượng mới, mục tiêu khác và các nhiệm vụ dài hơn. Điều quan trọng của LIBERO không phải một tỷ lệ thành công đơn lẻ mà là giao thức học liên tục. Nếu model học task B sau task A, ta phải đo cả B lẫn A để phát hiện catastrophic forgetting. Nhìn một hàng cuối cùng không cho biết liệu policy chỉ giỏi task vừa học hay vẫn nhớ những task cũ.

### Tại sao robot học việc mới rồi lại quên việc cũ?

Robot đã học đặt cốc lên đĩa. Ta tiếp tục dạy nó bỏ đồ vào ngăn kéo. Nếu cập nhật cùng một mạng chỉ với dữ liệu nhiệm vụ sau, các tham số từng giúp đặt cốc có thể bị thay đổi, khiến robot làm kém việc cũ. Hiện tượng ấy được gọi là **quên kiến thức khi học nối tiếp**.

LIBERO là bộ nhiệm vụ và quy trình đánh giá, không phải policy mới. Nó kiểm tra robot có học việc mới không, có giữ được việc cũ không và kiến thức về vật thể, vị trí, mục tiêu có chuyển từ việc này sang việc khác được hay không.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Học liên tục (lifelong/continual learning) khác học đa nhiệm (multi-task learning): nhiệm vụ **đến tuần tự**, mô hình được cập nhật sau mỗi nhiệm vụ và có thể quên nhiệm vụ đã học. Benchmark phải tách hai câu hỏi: chuyển kiến thức sang nhiệm vụ mới có nhanh hơn không, và sau khi học nhiệm vụ mới mô hình có còn làm được nhiệm vụ cũ không.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Học liên tục khác học đa nhiệm thế nào?

**Học đa nhiệm** thường cho mạng nhìn dữ liệu nhiều nhiệm vụ cùng lúc. **Học liên tục** đưa nhiệm vụ theo thứ tự và có thể không cho dùng lại toàn bộ dữ liệu cũ. Vì vậy phải đo hiệu quả nhiều lần: sau khi học A, sau khi học B và sau khi học C. Chỉ đo nhiệm vụ cuối không cho biết mạng đã quên gì.

LIBERO chia các nhiệm vụ thành nhóm thay vị trí không gian, thay vật, thay mục tiêu và kết hợp nhiều thay đổi. Nhờ đó khi kết quả kém, ta có thêm manh mối xem việc chuyển giao kiến thức gặp khó ở đâu.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

LIBERO có **130 nhiệm vụ** và tạo nhiệm vụ theo quy tắc. Các suite chính gồm **LIBERO-Spatial**, **LIBERO-Object**, **LIBERO-Goal** và **LIBERO-100**; phần long-horizon dùng một split riêng từ LIBERO-100. Mỗi nhiệm vụ có khoảng **50 demonstration chất lượng cao do con người điều khiển từ xa**. Điều kiện hoàn thành nhiệm vụ được được mô tả chính thức bằng predicates kiểu `Open`, `TurnOff`, `On`, `In`.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 9](/paper-figures/libero/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Bài báo gốc đánh giá các thuật toán học liên tục như sequential fine-tuning, replay, EWC và PackNet. Các chỉ số không chỉ đo tỷ lệ hoàn thành nhiệm vụ mà còn **Forward Transfer (FWT)**, **Negative Backward Transfer (NBT)** và AUC để đo diễn biến học tập qua chuỗi nhiệm vụ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/libero/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 trình bày cách sinh nhiệm vụ có cấu trúc, giúp tạo nhiều tác vụ có thể so sánh mà không cần viết lại từng environment bằng tay. Tách các yếu tố ngôn ngữ, mục tiêu và hình học giúp benchmark hỏi rõ loại kiến thức nào được giữ lại. Khi tái hiện, cùng một chính sách và một bộ seed phải được đánh giá trên từng task sau mỗi bước học, không chỉ ở cuối quá trình.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ học tuần tự ba nhiệm vụ: đặt khối đỏ vào bát, mở ngăn kéo, rồi chuyển khối xanh. Ta lưu ma trận hiệu năng R_{i,j}: sau khi học task i, model thành công bao nhiêu trên task j. Từ đó mới đo được mức quên task cũ và khả năng chuyển giao sang task mới. Nếu chỉ đo success rate trên task thứ ba, cách làm đơn giản là fine-tune đến khi quên hết hai task đầu cũng sẽ được chấm là thành công, hoàn toàn lệch mục tiêu continual learning.

### Quy trình đánh giá LIBERO diễn ra ra sao?

Đầu tiên hệ thống tạo cảnh, bố trí vật, trạng thái ban đầu và điều kiện thành công. Nó dùng mô tả PDDL để xác định robot phải đạt trạng thái nào mới được tính là xong nhiệm vụ. Tiếp theo, ta chọn danh sách công việc cùng thứ tự học.

Policy học việc thứ nhất rồi được kiểm tra. Sau khi học việc thứ hai, nó được kiểm tra lại trên cả việc đầu lẫn việc thứ hai. Quá trình tiếp tục cho các việc sau. Cuối cùng so nhiều thuật toán như ER dùng phát lại kinh nghiệm và PackNet phân bổ tham số, có thể đổi thứ tự nhiệm vụ để kiểm tra độ nhạy.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Huấn luyện một policy lần lượt trên mở ngăn kéo, nhặt mug, đặt mug vào bát. Sau mỗi nhiệm vụ, chạy đánh giá trên tất cả nhiệm vụ trước. Nếu nhiệm vụ mới được 90% nhưng nhiệm vụ cũ tụt về 10%, mô hình đang **catastrophically forgetting**. LIBERO cung cấp nhóm nhiệm vụ và thước đo chuyển giao/retention, nhưng thành tích benchmark không tự chứng minh robot generalist ngoài đời.

Khi chạy env, thành công phải đến từ **closed-loop rollout và điều kiện hoàn thành trong simulator**, không phải loss khi huấn luyện.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ hai nhiệm vụ cùng dùng một chiếc cốc

Nhiệm vụ A: đặt cốc đỏ bên trái đĩa. Nhiệm vụ B: bỏ cốc đỏ vào bồn. Hai việc chia sẻ kỹ năng nhận biết và kẹp cốc nhưng khác đích đặt. Sau khi học B, nếu robot vẫn kẹp cốc đúng mà luôn đưa tới bồn dù được giao A, nó có thể đã quên cách xác định mục tiêu của A.

Ngược lại, nếu đã học A giúp việc B được học nhanh hơn, đó là dấu hiệu chuyển giao có lợi. Muốn khẳng định được, phải đo điểm của B trước/sau khi học A và điểm A trước/sau khi học B. Một lần chạy cuối cùng là chưa đủ.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Một kết quả khá trái trực giác là **naive sequential fine-tuning có FWT tốt**, tức biểu diễn học từ nhiệm vụ trước đôi khi giúp nhiệm vụ sau, dù nó quên nhiệm vụ cũ. PackNet bảo vệ retention khá tốt nhưng đổi lại dung lượng biểu diễn của mô hình bị chia nhỏ. Experience Replay là lựa chọn tương đối ổn định, còn EWC không nổi bật trong thiết lập này. Bài báo cũng thử BERT/CLIP/GPT-style embedding của nhiệm vụ và thấy **không có khác biệt lớn so với TaskID** trong nhiều thiết lập.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 9](/paper-figures/libero/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Một kết quả đáng nhớ khác: pretraining có giám sát trên LIBERO-90 **không tự động giúp** downstream lifelong learning trên 10 nhiệm vụ long-horizon, thậm chí có thể gây negative chuyển giao. Điều đó cảnh báo rất sớm rằng “pretrain nhiều hơn” không đủ; phân phối/mục tiêu huấn luyện phải đúng.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Kết quả LIBERO phải được đọc theo thứ tự học

Hình 4 so ER và PackNet với năm thứ tự học khác nhau. Một cách học tốt ở thứ tự này nhưng kém ở thứ tự khác có thể không ổn định trong thực tế. Hình 5 còn thay kiến trúc và việc huấn luyện trước, cho thấy hiệu quả không chỉ do tên thuật toán chống quên.

Khi thấy một điểm tổng hợp, hãy hỏi nó đã bao gồm điểm của những nhiệm vụ cũ chưa. **Thí nghiệm tách thành phần** chỉ có nghĩa nếu thay một yếu tố rõ ràng và giữ tương đương dữ liệu, số bước huấn luyện cùng quy trình đánh giá.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** đây là mô phỏng benchmark với phạm vi vật thể/nhiệm vụ và mô phỏng vật lý có giới hạn; tác giả coi benchmark là nền để cộng đồng tiếp tục mở rộng kiến trúc, thuật toán và pretraining.

**Phê bình thêm:** đến 2026, LIBERO đã gần **bão hòa** với các VLA hàng đầu, nhiều mô hình nằm vùng 95-99% tỷ lệ thành công trung bình. Vì thế nó vẫn rất hữu ích như regression/unit test nhưng khó phân biệt hiệu năng của các VLA hàng đầu. Cộng đồng còn thường chỉ báo cáo một tỷ lệ thành công trung bình duy nhất và bỏ qua mục tiêu lifelong ban đầu của benchmark, tức biến LIBERO thành thứ nó không được thiết kế để làm. Bối cảnh tĩnh, tabletop và mục tiêu predicates sạch cũng không test môi trường luôn thay đổi, mobile manipulation, bất định khi tiếp xúc vật thể, phục hồi hay nhận thức trong điều kiện thực tế. Một mô hình 98% LIBERO vẫn có thể kém hiệu quả ngoài nhà bếp thật, chuyện này con người đáng lẽ không cần benchmark để nhắc nhưng lịch sử vẫn cho thấy là cần.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Các giới hạn của LIBERO

Nhiệm vụ LIBERO có điều kiện hoàn thành xác định và được mô phỏng để dễ lặp lại. Robot thật còn gặp sai số camera, lực kẹp, vật mềm và độ trễ. Kết quả chống quên trên bộ mô phỏng chưa bảo đảm chuyển nguyên vẹn sang mọi robot thật.

Trong thực tế, những công việc có thể tới xen kẽ hoặc thay đổi dần, thay vì các giai đoạn học A rồi B rồi C rất rõ. Vì vậy LIBERO là công cụ nghiên cứu quan trọng nhưng không đại diện cho mọi tình huống học suốt đời.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [OpenVLA](/paper/openvla)
- [RoboCasa](/paper/robocasa)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### LIBERO liên quan gì tới policy đa nhiệm?

RT-1 và Octo cố học một policy có thể làm nhiều việc từ dữ liệu rộng. LIBERO đặt câu hỏi tiếp theo: khi ta tiếp tục huấn luyện policy ấy cho công việc mới, những việc trước còn làm được không?

Một model được tiền huấn luyện tốt vẫn có thể quên khi tinh chỉnh sai cách. Ngược lại, model giữ nguyên kỹ năng cũ chưa chắc học kỹ năng mới nhanh. Đánh giá tốt cần có cả hai vế.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Chạy một nhiệm vụ BC-RNN trong repo LIBERO chính thức trên T4, rồi thử 10 vs 50 demos. Sau đó chạy hai nhiệm vụ theo thứ tự để kiểm tra hiện tượng quên; báo cáo tỷ lệ thành công với nhiều random seed.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự dựng bảng để nhìn thấy hiện tượng quên

Hãy lập bảng với ba cột A, B, C và ba hàng sau khi học A, sau khi học B, sau khi học C. Điền tỷ lệ thành công từng nhiệm vụ ở từng thời điểm. Nếu A từ 90% tụt xuống 40% sau khi học B, đó là dấu hiệu quên. Nếu B đạt điểm tốt hơn ngay sau khi học A, có thể đã có chuyển giao.

Thử đổi thứ tự thành C → A → B. Nếu điểm số thay nhiều, thứ tự nhiệm vụ là yếu tố quan trọng cần báo cáo.

<!-- END EXTENDED WALKTHROUGH -->

