## Vì sao cần nghiên cứu này?

### Vì sao xem người làm có ích nhưng chưa đủ?

Một người dọn bàn có thể mở ngăn kéo, nhặt bút, đặt vào hộp rồi đóng lại rất nhanh. Video người làm việc dễ thu hơn việc điều khiển robot hàng trăm lần. Nhưng video ấy không cho biết góc từng khớp robot phải xoay bao nhiêu. Cánh tay người và tay robot cũng khác nhau về hình dạng, giới hạn chuyển động.

MIMICPLAY chia việc thành hai phần: học **đích đến và trình tự** từ video người, rồi học **cách cử động robot thật** từ ít lần người điều khiển robot làm mẫu. Video người cung cấp mục tiêu và thứ tự thực hiện, không cung cấp sẵn các góc khớp phù hợp với cánh tay robot.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/mimicplay/figure-1.webp)

![Hình 3 từ PDF gốc, trang 5](/paper-figures/mimicplay/figure-3.webp)

## Kiến thức nền cần nắm

### Kế hoạch cấp cao và điều khiển cấp thấp khác nhau ở đâu?

**Kế hoạch cấp cao** mô tả những trạng thái trung gian cần đạt, chẳng hạn mở ngăn kéo → đưa vật vào → đóng ngăn kéo. MIMICPLAY học biểu diễn ẩn của kế hoạch, không bắt buộc phải viết mỗi bước thành câu chữ. Biểu diễn ấy cho biết hướng tiến tới mục tiêu, không phải góc khớp cụ thể.

**Bộ điều khiển cấp thấp** nhận quan sát và tín hiệu kế hoạch, rồi tạo lệnh phù hợp với tay robot. Nó cần được huấn luyện bằng dữ liệu robot vì video người không phản ánh chính xác cơ cấu và lực của máy.

### ### Video người cho robot biết đích, không cho biết từng động cơ

Một người trong video có thể lấy bút, mở ngăn kéo rồi cất bút vào đó. Robot học được **mục tiêu trung gian**: bút phải tới gần ngăn kéo, ngăn kéo phải mở trước khi đưa bút vào. Tuy nhiên người không có cùng số khớp và kiểu kẹp với robot, nên không thể lấy quỹ đạo tay người làm lệnh động cơ trực tiếp. Đây là lý do MIMICPLAY có phần học trình tự từ video và phần học điều khiển từ các lượt thao tác trên robot thật. Hai phần giải hai câu hỏi khác nhau: làm bước nào trước, và thực hiện bước đó bằng phần cứng này như thế nào.


## Phương pháp thực hiện

### Hai giai đoạn học của MIMICPLAY

Giai đoạn đầu, hệ thống đọc video người thao tác và mục tiêu tương ứng, học cách sinh đường diễn tiến trong không gian kế hoạch ẩn. Nó cố nắm những điều cần xảy ra tiếp theo ở cảnh, không nhất thiết biết động cơ của robot cụ thể phải quay ra sao.

Giai đoạn sau, mô hình lập kế hoạch được giữ cố định. Người nghiên cứu đưa vào một lượng nhỏ lần người điều khiển robot làm mẫu và huấn luyện bộ điều khiển làm theo tín hiệu kế hoạch. Khi chạy, video prompt chỉ định nhiệm vụ; mạng lập kế hoạch tạo các mục tiêu trung gian, còn bộ điều khiển chuyển chúng thành thao tác. Nếu môi trường thay đổi, kế hoạch có thể được cập nhật.

### ### Hình dung việc mạng lập kế hoạch và bộ điều khiển phối hợp

Giả sử nhiệm vụ là cất đồ trên bàn. Mạng lập kế hoạch không nhất thiết sinh câu chữ “mở ngăn kéo”; nó tạo một biểu diễn ẩn về trạng thái cần đạt tiếp theo. Bộ điều khiển dùng tín hiệu ấy cùng ảnh hiện tại để quyết định cách dịch tay và kẹp vật. Nếu ngăn kéo bị kẹt, lệnh khớp tốt đến đâu cũng không thể hoàn thành bước cất đồ như dự kiến; hệ thống cần nhận ra trạng thái hiện tại chưa đạt mục tiêu. Cơ chế hai tầng giúp định vị vấn đề, nhưng bản thân kiến trúc không bảo đảm sửa được mọi sự cố chưa từng thấy khi huấn luyện.

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/mimicplay/figure-2.webp)

![Hình 4 từ PDF gốc, trang 7](/paper-figures/mimicplay/figure-4.webp)

## Ví dụ từng bước

### Ví dụ dọn một bàn học nhiều bước

Robot phải nhặt bút, cất vào hộp, xếp sách và đóng ngăn kéo. Video người cho thấy thứ tự thao tác và vị trí mục tiêu, nhưng robot vẫn phải học riêng cách cầm một chiếc bút mảnh bằng kẹp robot của nó.

Giả sử có người đẩy hộp bút sang bên phải giữa nhiệm vụ. Nếu bộ lập kế hoạch tiếp tục coi hộp ở vị trí cũ, robot có thể đưa bút vào không khí. Hình 5 trình bày cách MIMICPLAY cập nhật biểu diễn kế hoạch sau khi có tác động, rồi tiếp tục công việc.

![Hình 5 từ PDF gốc, trang 8](/paper-figures/mimicplay/figure-5.webp)

## Kết quả thực nghiệm

### Vì sao thí nghiệm phải dùng nhiệm vụ dài?

Một chính sách điều khiển có thể hoàn thành từng bước riêng với xác suất cao nhưng vẫn hay thất bại khi phải làm liên tiếp năm đến bảy bước. Sai ở bước đầu có thể làm các bước sau không còn thực hiện được. Vì vậy MIMICPLAY được thử trên các công việc như dọn bàn, chuẩn bị bánh kẹp hoặc gấp khăn.

Hình 4 so nhiệm vụ được chỉ dẫn bằng video người và video robot. Khi đọc kết quả, nên xem tiêu chí thành công có đòi hoàn thành toàn nhiệm vụ không và lượng dữ liệu robot ở các trường hợp có được giữ tương đương không.

### Một nhiệm vụ dài khuếch đại lỗi ở các bước nhỏ

Bài báo đánh giá 14 nhiệm vụ trên robot thật. Trong các thiết lập được báo cáo, học trước từ video người giúp tăng hiệu quả so với một số phương pháp đối chứng; cách chia thành phần lập kế hoạch và phần điều khiển cũng cho kết quả tốt hơn một số cách học trực tiếp một tầng. Các mức cải thiện có thể lên tới hàng chục điểm phần trăm nhưng phụ thuộc nhóm phép thử. Khi xem Hình 4–5, hãy chú ý hệ thống hoàn thành được bao nhiêu bước của nhiệm vụ dài và có sửa kế hoạch khi bối cảnh bị can thiệp không.

### ### Vì sao kết quả một bước không thay cho kết quả cả chuỗi?

Giả sử một chính sách làm đúng mỗi bước với xác suất 80%, và năm bước đều cần thành công. Nếu tạm coi các bước độc lập, xác suất hoàn thành đủ năm chỉ khoảng 33%, dù từng bước trông khá ổn. Con số này là **ví dụ minh họa**, không phải số liệu của MIMICPLAY; trên robot thật các bước còn phụ thuộc nhau. Nó cho thấy vì sao phải đo cả việc kết thúc nhiệm vụ dài chứ không chỉ điểm ở những thao tác lẻ. Khi đối chiếu thí nghiệm với video người và video robot, hãy giữ tương đương lượng dữ liệu robot để biết phần kiến thức kế hoạch đóng góp gì.


## Hạn chế và câu hỏi còn mở

### Các điểm yếu của việc dùng video người

Video người không có nhãn góc khớp robot. Có thể trong video người cầm đồ rất dễ, nhưng kẹp robot không đủ dài hoặc không có lực phù hợp. Kế hoạch cấp cao tốt không chữa được một bộ điều khiển cấp thấp chưa biết cách kẹp.

Biểu diễn ẩn cũng khó kiểm chứng bằng mắt; cần chạy và xem nó có thật sự làm robot tới đúng đích trung gian hay không. Tính bền trước một loại xáo trộn trong thí nghiệm không bảo đảm chịu được mọi tác động.

## Liên hệ với nghiên cứu khác

### MIMICPLAY liên hệ với π0.5 và PaLM-E

MIMICPLAY và π0.5 đều coi nhiệm vụ dài là sự phối hợp nhiều bước nhỏ, nhưng cách học khác nhau. MIMICPLAY dùng video người để học kế hoạch ẩn, còn π0.5 kết hợp nhiều dữ liệu và dự đoán bước con cùng hành động từ một hệ VLA.

PaLM-E cũng có thể tham gia suy luận mục tiêu cấp cao, nhưng không thay được bộ điều khiển động cơ. Khi đọc ba bài, hãy luôn hỏi mô-đun nào quyết định bước kế tiếp và mô-đun nào trực tiếp điều khiển robot.

### Những bài nên đọc tiếp

- [GR00T N1](/paper/groot-n1)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc mã nguồn và tự kiểm chứng

### Bài tập lập kế hoạch

Viết nhiệm vụ “Dọn bàn học” thành bốn bước và gắn với mỗi bước một điều kiện thành công quan sát được: bút nằm trong hộp, sách xếp thành chồng, ngăn kéo đóng hẳn. Phân biệt phần video người có thể dạy với phần cần lần người điều khiển robot làm mẫu.

Giả sử người chuyển hộp bút khi robot đang làm. Hãy chỉ ra bước nào của kế hoạch phải cập nhật. Làm được điều này sẽ giúp hiểu vì sao tầng lập kế hoạch không thể chỉ phát một chuỗi cố định từ đầu đến cuối.
