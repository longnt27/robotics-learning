## Vì sao cần nghiên cứu này?

### Tại sao robot học việc mới rồi lại quên việc cũ?

Robot đã học đặt cốc lên đĩa. Ta tiếp tục dạy nó bỏ đồ vào ngăn kéo. Nếu cập nhật cùng một mạng chỉ với dữ liệu nhiệm vụ sau, các tham số từng giúp đặt cốc có thể bị thay đổi, khiến robot làm kém việc cũ. Hiện tượng ấy được gọi là **quên kiến thức khi học nối tiếp**.

LIBERO là bộ nhiệm vụ và quy trình đánh giá, không phải chính sách điều khiển mới. Nó kiểm tra robot có học việc mới không, có giữ được việc cũ không và kiến thức về vật thể, vị trí, mục tiêu có chuyển từ việc này sang việc khác được hay không.

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/libero/figure-1.webp)

## Kiến thức nền cần nắm

### Học liên tục khác học đa nhiệm thế nào?

**Học đa nhiệm** thường cho mạng nhìn dữ liệu nhiều nhiệm vụ cùng lúc. **Học liên tục** đưa nhiệm vụ theo thứ tự và có thể không cho dùng lại toàn bộ dữ liệu cũ. Vì vậy phải đo hiệu quả nhiều lần: sau khi học A, sau khi học B và sau khi học C. Chỉ đo nhiệm vụ cuối không cho biết mạng đã quên gì.

LIBERO chia các nhiệm vụ thành nhóm thay vị trí không gian, thay vật, thay mục tiêu và kết hợp nhiều thay đổi. Nhờ đó khi kết quả kém, ta có thêm manh mối xem việc chuyển giao kiến thức gặp khó ở đâu.

### Vì sao nhớ việc mới không có nghĩa vẫn nhớ việc cũ?

Giả sử robot học lần lượt ba việc: đặt cốc lên đĩa, mở ngăn kéo và xếp một chiếc bát. Sau khi học việc thứ ba, điểm số cao trên nhiệm vụ xếp bát chỉ chứng minh kỹ năng mới. Nếu lúc này robot không còn đặt được cốc, hệ thống đã **quên một phần kiến thức cũ**. Vì vậy đánh giá học liên tục phải ghi lại kết quả của tất cả nhiệm vụ sau mỗi giai đoạn, giống một bảng có hàng là nhiệm vụ kiểm tra và cột là thời điểm huấn luyện. Đọc mỗi ô của bảng giúp nhận ra kỹ năng nào mất đi, kỹ năng nào được cải thiện.


## Phương pháp thực hiện

### Quy trình đánh giá LIBERO diễn ra ra sao?

Đầu tiên hệ thống tạo cảnh, bố trí vật, trạng thái ban đầu và điều kiện thành công. Nó dùng mô tả PDDL để xác định robot phải đạt trạng thái nào mới được tính là xong nhiệm vụ. Tiếp theo, ta chọn danh sách công việc cùng thứ tự học.

Chính sách điều khiển học việc thứ nhất rồi được kiểm tra. Sau khi học việc thứ hai, nó được kiểm tra lại trên cả việc đầu lẫn việc thứ hai. Quá trình tiếp tục cho các việc sau. Cuối cùng so nhiều thuật toán như ER dùng phát lại kinh nghiệm và PackNet phân bổ tham số, có thể đổi thứ tự nhiệm vụ để kiểm tra độ nhạy.

### PDDL kiểm tra trạng thái đích, không điều khiển hộ robot

Trong một nhiệm vụ LIBERO, mô tả trạng thái đầu có thể ghi chiếc cốc nằm trên bàn và ngăn kéo đang đóng. Điều kiện hoàn thành có thể yêu cầu chiếc cốc ở trong ngăn kéo và cửa đã đóng lại. PDDL giúp mô tả những điều kiện kiểu đó để bộ đánh giá biết khi nào nhiệm vụ thực sự xong. Nhưng nó **không tự dạy robot góc khớp phải xoay**; mô hình điều khiển vẫn phải học từ quan sát và dữ liệu hành động. Phân biệt vai trò của bộ đánh giá với thuật toán đang được đánh giá là điều cần thiết để không nhầm LIBERO với một chính sách điều khiển mới.

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/libero/figure-2.webp)

![Hình 5 từ PDF gốc, trang 9](/paper-figures/libero/figure-5.webp)

## Ví dụ từng bước

### Ví dụ hai nhiệm vụ cùng dùng một chiếc cốc

Nhiệm vụ A: đặt cốc đỏ bên trái đĩa. Nhiệm vụ B: bỏ cốc đỏ vào bồn. Hai việc chia sẻ kỹ năng nhận biết và kẹp cốc nhưng khác đích đặt. Sau khi học B, nếu robot vẫn kẹp cốc đúng mà luôn đưa tới bồn dù được giao A, nó có thể đã quên cách xác định mục tiêu của A.

Ngược lại, nếu đã học A giúp việc B được học nhanh hơn, đó là dấu hiệu chuyển giao có lợi. Muốn khẳng định được, phải đo điểm của B trước/sau khi học A và điểm A trước/sau khi học B. Một lần chạy cuối cùng là chưa đủ.

## Kết quả thực nghiệm

### Kết quả LIBERO phải được đọc theo thứ tự học

Hình 4 so ER và PackNet với năm thứ tự học khác nhau. Một cách học tốt ở thứ tự này nhưng kém ở thứ tự khác có thể không ổn định trong thực tế. Hình 5 còn thay kiến trúc và việc huấn luyện trước, cho thấy hiệu quả không chỉ do tên thuật toán chống quên.

Khi thấy một điểm tổng hợp, hãy hỏi nó đã bao gồm điểm của những nhiệm vụ cũ chưa. **Thí nghiệm tách thành phần** chỉ có nghĩa nếu thay một yếu tố rõ ràng và giữ tương đương dữ liệu, số bước huấn luyện cùng quy trình đánh giá.



### Điểm của nhiệm vụ cuối chưa đủ để kết luận mô hình học tốt

Việc học thêm có thể giúp nhiệm vụ mới nhưng đồng thời làm quên nhiệm vụ cũ. Các phép thử trong bài cho thấy cách phát lại dữ liệu cũ thường khá ổn định, còn cách dành riêng tham số có thể bảo vệ kỹ năng cũ nhưng giới hạn dung lượng dành cho kỹ năng mới. Hình 4–5 cho thấy thứ tự học, kiến trúc và việc huấn luyện trước đều ảnh hưởng kết quả. Thậm chí huấn luyện trước trên tập LIBERO-90 không phải lúc nào cũng giúp chuỗi 10 nhiệm vụ dài về sau.

### Đọc kết quả như một bảng theo thời gian học

Tại cột đầu của bảng, robot vừa học nhiệm vụ A; ở cột sau, nó đã học thêm B. Nếu điểm A giảm rõ sau khi học B, đó là dấu hiệu quên. Nếu điểm A không giảm và B cũng tốt, mô hình vừa học được việc mới vừa giữ được việc cũ. Khi đổi thứ tự B và A, kết quả có thể thay đổi vì tham số mạng được cập nhật khác nhau. Đó là lý do Hình 4 dùng nhiều thứ tự học. Đừng gọi một mô hình “học liên tục tốt” chỉ vì điểm trung bình cuối cùng cao mà không xem từng kỹ năng cũ đã bị ảnh hưởng thế nào.

![Hình 4 từ PDF gốc, trang 9](/paper-figures/libero/figure-4.webp)

## Hạn chế và câu hỏi còn mở

### Các giới hạn của LIBERO

Nhiệm vụ LIBERO có điều kiện hoàn thành xác định và được mô phỏng để dễ lặp lại. Robot thật còn gặp sai số camera, lực kẹp, vật mềm và độ trễ. Kết quả chống quên trên bộ mô phỏng chưa bảo đảm chuyển nguyên vẹn sang mọi robot thật.

Trong thực tế, những công việc có thể tới xen kẽ hoặc thay đổi dần, thay vì các giai đoạn học A rồi B rồi C rất rõ. Vì vậy LIBERO là công cụ nghiên cứu quan trọng nhưng không đại diện cho mọi tình huống học suốt đời.

## Liên hệ với nghiên cứu khác

### LIBERO liên quan gì tới chính sách điều khiển đa nhiệm?

RT-1 và Octo cố học một chính sách điều khiển có thể làm nhiều việc từ dữ liệu rộng. LIBERO đặt câu hỏi tiếp theo: khi ta tiếp tục huấn luyện chính sách điều khiển ấy cho công việc mới, những việc trước còn làm được không?

Một mô hình được tiền huấn luyện tốt vẫn có thể quên khi tinh chỉnh sai cách. Ngược lại, mô hình giữ nguyên kỹ năng cũ chưa chắc học kỹ năng mới nhanh. Đánh giá tốt cần có cả hai vế.

### Những bài nên đọc tiếp

- [OpenVLA](/paper/openvla)
- [RoboCasa](/paper/robocasa)

## Đọc mã nguồn và tự kiểm chứng

### Tự dựng bảng để nhìn thấy hiện tượng quên

Hãy lập bảng với ba cột A, B, C và ba hàng sau khi học A, sau khi học B, sau khi học C. Điền tỷ lệ thành công từng nhiệm vụ ở từng thời điểm. Nếu A từ 90% tụt xuống 40% sau khi học B, đó là dấu hiệu quên. Nếu B đạt điểm tốt hơn ngay sau khi học A, có thể đã có chuyển giao.

Thử đổi thứ tự thành C → A → B. Nếu điểm số thay nhiều, thứ tự nhiệm vụ là yếu tố quan trọng cần báo cáo.
