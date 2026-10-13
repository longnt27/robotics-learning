## Vì sao cần nghiên cứu này?

Robot được dạy đặt cốc vào khay, rồi học thêm mở ngăn kéo. Sau khi học việc thứ hai, liệu nó còn làm đúng việc thứ nhất không? Và việc đã biết đặt cốc có giúp học mở ngăn kéo nhanh hơn không? **LIBERO được xây dựng để nghiên cứu việc học nhiều nhiệm vụ nối tiếp nhau**, trong đó mô hình có thể chuyển kiến thức hoặc quên kỹ năng cũ. Bộ nhiệm vụ chia riêng những thay đổi về vị trí, vật thể và mục tiêu để người nghiên cứu hiểu rõ hơn tại sao một cách học có hiệu quả hoặc thất bại. Đây là bộ đánh giá, không phải mô hình điều khiển mới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/libero/figure-1.webp)


### Tại sao robot học việc mới rồi lại quên việc cũ?

Robot đã học đặt cốc lên đĩa. Ta tiếp tục dạy nó bỏ đồ vào ngăn kéo. Nếu cập nhật cùng một mạng chỉ với dữ liệu nhiệm vụ sau, các tham số từng giúp đặt cốc có thể bị thay đổi, khiến robot làm kém việc cũ. Hiện tượng ấy được gọi là **quên kiến thức khi học nối tiếp**.

LIBERO là bộ nhiệm vụ và quy trình đánh giá, không phải chính sách điều khiển mới. Nó kiểm tra robot có học việc mới không, có giữ được việc cũ không và kiến thức về vật thể, vị trí, mục tiêu có chuyển từ việc này sang việc khác được hay không.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

**Học đa nhiệm** thường cho mạng học nhiều công việc cùng lúc; **học liên tục** cho robot học nhiệm vụ A, rồi B, rồi C. Khi cập nhật tham số để làm B, mạng có thể quên A. Vì vậy một bộ đánh giá học liên tục phải đo cả hai chuyện: kiến thức cũ có giúp học việc mới nhanh hơn không, và sau khi học việc mới mô hình còn làm tốt việc cũ không.

LIBERO tạo những nhóm nhiệm vụ thay đổi vị trí, đồ vật và mục tiêu để phân tích hai vấn đề ấy. Nó là bộ đánh giá, không phải một thuật toán điều khiển mới.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Học liên tục khác học đa nhiệm thế nào?

**Học đa nhiệm** thường cho mạng nhìn dữ liệu nhiều nhiệm vụ cùng lúc. **Học liên tục** đưa nhiệm vụ theo thứ tự và có thể không cho dùng lại toàn bộ dữ liệu cũ. Vì vậy phải đo hiệu quả nhiều lần: sau khi học A, sau khi học B và sau khi học C. Chỉ đo nhiệm vụ cuối không cho biết mạng đã quên gì.

LIBERO chia các nhiệm vụ thành nhóm thay vị trí không gian, thay vật, thay mục tiêu và kết hợp nhiều thay đổi. Nhờ đó khi kết quả kém, ta có thêm manh mối xem việc chuyển giao kiến thức gặp khó ở đâu.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

LIBERO có **130 nhiệm vụ** mô phỏng, được chia thành các nhóm như LIBERO-Spatial, LIBERO-Object, LIBERO-Goal và LIBERO-100. Mỗi nhiệm vụ có khoảng **50 lượt thao tác mẫu** do người điều khiển. Môi trường ghi rõ điều kiện thành công, ví dụ đồ vật nằm trong khay hoặc ngăn kéo đã mở.

Nhóm tác giả cho mô hình học lần lượt từng nhiệm vụ rồi kiểm tra lại các việc đã học. Các phương pháp đối chứng gồm huấn luyện tiếp thông thường, phát lại kinh nghiệm cũ, EWC và PackNet. Ngoài tỷ lệ thành công, thí nghiệm còn đo khả năng chuyển giao tới nhiệm vụ tiếp theo và mức suy giảm khi quay lại nhiệm vụ cũ.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 9](/paper-figures/libero/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/libero/figure-2.webp)


### Quy trình đánh giá LIBERO diễn ra ra sao?

Đầu tiên hệ thống tạo cảnh, bố trí vật, trạng thái ban đầu và điều kiện thành công. Nó dùng mô tả PDDL để xác định robot phải đạt trạng thái nào mới được tính là xong nhiệm vụ. Tiếp theo, ta chọn danh sách công việc cùng thứ tự học.

chính sách điều khiển học việc thứ nhất rồi được kiểm tra. Sau khi học việc thứ hai, nó được kiểm tra lại trên cả việc đầu lẫn việc thứ hai. Quá trình tiếp tục cho các việc sau. Cuối cùng so nhiều thuật toán như ER dùng phát lại kinh nghiệm và PackNet phân bổ tham số, có thể đổi thứ tự nhiệm vụ để kiểm tra độ nhạy.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot học lần lượt mở ngăn kéo, nhặt cốc và đặt cốc vào bát. Sau khi học mở ngăn kéo, ta ghi tỷ lệ thành công. Tiếp đó cho học nhặt cốc rồi thử lại mở ngăn kéo. Nếu nhiệm vụ mới đạt 90% nhưng nhiệm vụ đầu giảm xuống 10%, đó là dấu hiệu **quên kiến thức đã học**.

Để kiểm tra đúng, robot phải tự chạy trong môi trường tới khi hoàn thành điều kiện nhiệm vụ, không chỉ có sai số dự đoán nhỏ trên dữ liệu ghi sẵn. Nên thử nhiều thứ tự nhiệm vụ để xem kết luận có phụ thuộc thứ tự học hay không.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ hai nhiệm vụ cùng dùng một chiếc cốc

Nhiệm vụ A: đặt cốc đỏ bên trái đĩa. Nhiệm vụ B: bỏ cốc đỏ vào bồn. Hai việc chia sẻ kỹ năng nhận biết và kẹp cốc nhưng khác đích đặt. Sau khi học B, nếu robot vẫn kẹp cốc đúng mà luôn đưa tới bồn dù được giao A, nó có thể đã quên cách xác định mục tiêu của A.

Ngược lại, nếu đã học A giúp việc B được học nhanh hơn, đó là dấu hiệu chuyển giao có lợi. Muốn khẳng định được, phải đo điểm của B trước/sau khi học A và điểm A trước/sau khi học B. Một lần chạy cuối cùng là chưa đủ.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Huấn luyện tiếp tuần tự đôi khi có lợi khi học nhiệm vụ mới nhờ kiến thức tích lũy, nhưng lại quên nhiều việc cũ. PackNet giúp giữ kỹ năng cũ bằng cách dành vùng tham số riêng, đổi lại dung lượng cho việc mới bị hạn chế. Phát lại kinh nghiệm cũ cho kết quả tương đối ổn định trong các phép thử được báo cáo.

Đáng chú ý, huấn luyện trước trên LIBERO-90 **không bảo đảm cải thiện** học liên tục trên các nhiệm vụ dài; trong một số điều kiện còn gây chuyển giao tiêu cực. Vì vậy không thể suy từ “đã học nhiều nhiệm vụ” rằng mô hình sẽ tiếp tục học tốt mọi nhiệm vụ khác.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 9](/paper-figures/libero/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Kết quả LIBERO phải được đọc theo thứ tự học

Hình 4 so ER và PackNet với năm thứ tự học khác nhau. Một cách học tốt ở thứ tự này nhưng kém ở thứ tự khác có thể không ổn định trong thực tế. Hình 5 còn thay kiến trúc và việc huấn luyện trước, cho thấy hiệu quả không chỉ do tên thuật toán chống quên.

Khi thấy một điểm tổng hợp, hãy hỏi nó đã bao gồm điểm của những nhiệm vụ cũ chưa. **Thí nghiệm tách thành phần** chỉ có nghĩa nếu thay một yếu tố rõ ràng và giữ tương đương dữ liệu, số bước huấn luyện cùng quy trình đánh giá.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

LIBERO là bộ mô phỏng với vật thể, chuyển động và điều kiện thành công được định nghĩa rõ. Những lỗi như camera thật bị che, lực kẹp thay đổi hay vật mềm biến dạng khó được phản ánh đầy đủ. Khi nhiều mô hình đạt điểm rất cao, tỷ lệ thành công trung bình cũng khó cho thấy khác biệt nhỏ giữa chúng.

**Điều dễ bị hiểu sai:** báo cáo một điểm thành công trên LIBERO mà không đo việc học nối tiếp sẽ bỏ qua câu hỏi chính của bộ đánh giá. Robot làm tốt vài nhiệm vụ tại một thời điểm chưa chắc học thêm việc mới mà không quên; kết quả mô phỏng cũng chưa chứng minh năng lực ngoài đời.

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

### LIBERO liên quan gì tới chính sách điều khiển đa nhiệm?

RT-1 và Octo cố học một chính sách điều khiển có thể làm nhiều việc từ dữ liệu rộng. LIBERO đặt câu hỏi tiếp theo: khi ta tiếp tục huấn luyện chính sách điều khiển ấy cho công việc mới, những việc trước còn làm được không?

Một mô hình được tiền huấn luyện tốt vẫn có thể quên khi tinh chỉnh sai cách. Ngược lại, mô hình giữ nguyên kỹ năng cũ chưa chắc học kỹ năng mới nhanh. Đánh giá tốt cần có cả hai vế.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Chạy một nhiệm vụ LIBERO trong mô phỏng với 10 lượt thao tác mẫu, rồi thử lại với 50 lượt. Tiếp theo cho một chính sách học hai nhiệm vụ A và B theo thứ tự. Ghi điểm A sau khi học A, và đo lại A sau khi học B để nhìn thấy mức quên.

Đổi thứ tự học B → A, dùng nhiều lượt chạy và trạng thái ban đầu khác nhau. Đừng chỉ so hàm mất mát khi huấn luyện: tiêu chí ở đây là robot **thực hiện được bao nhiêu nhiệm vụ** sau mỗi giai đoạn học.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự dựng bảng để nhìn thấy hiện tượng quên

Hãy lập bảng với ba cột A, B, C và ba hàng sau khi học A, sau khi học B, sau khi học C. Điền tỷ lệ thành công từng nhiệm vụ ở từng thời điểm. Nếu A từ 90% tụt xuống 40% sau khi học B, đó là dấu hiệu quên. Nếu B đạt điểm tốt hơn ngay sau khi học A, có thể đã có chuyển giao.

Thử đổi thứ tự thành C → A → B. Nếu điểm số thay nhiều, thứ tự nhiệm vụ là yếu tố quan trọng cần báo cáo.

<!-- END EXTENDED WALKTHROUGH -->

