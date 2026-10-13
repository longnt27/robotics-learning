## Vì sao cần nghiên cứu này?

### Vì sao xem người làm có ích nhưng chưa đủ?

Một người dọn bàn có thể mở ngăn kéo, nhặt bút, đặt vào hộp rồi đóng lại rất nhanh. Video người làm việc dễ thu hơn việc điều khiển robot hàng trăm lần. Nhưng video ấy không cho biết góc từng khớp robot phải xoay bao nhiêu. Cánh tay người và tay robot cũng khác nhau về hình dạng, giới hạn chuyển động.

MIMICPLAY chia việc thành hai phần: học **đích đến và trình tự** từ video người, rồi học **cách cử động robot thật** từ ít lượt thao tác mẫu robot. Đừng hiểu nhầm rằng cứ đưa video người vào là robot trực tiếp sao chép được động tác.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/mimicplay/figure-1.webp)

![Hình 3 từ PDF gốc, trang 5](/paper-figures/mimicplay/figure-3.webp)

## Kiến thức nền cần nắm

### Kế hoạch cấp cao và điều khiển cấp thấp khác nhau ở đâu?

**Kế hoạch cấp cao** mô tả những trạng thái trung gian cần đạt, chẳng hạn mở ngăn kéo → đưa vật vào → đóng ngăn kéo. MIMICPLAY học biểu diễn ẩn của kế hoạch, không bắt buộc phải viết mỗi bước thành câu chữ. Biểu diễn ấy cho biết hướng tiến tới mục tiêu, không phải góc khớp cụ thể.

**Bộ điều khiển cấp thấp** nhận quan sát và tín hiệu kế hoạch, rồi tạo lệnh phù hợp với tay robot. Nó cần được huấn luyện bằng dữ liệu robot vì video người không phản ánh chính xác cơ cấu và lực của máy.

## Phương pháp thực hiện

### Hai giai đoạn học của MIMICPLAY

Giai đoạn đầu, hệ thống đọc video người thao tác và mục tiêu tương ứng, học cách sinh đường diễn tiến trong không gian kế hoạch ẩn. Nó cố nắm những điều cần xảy ra tiếp theo ở cảnh, không nhất thiết biết motor robot cụ thể phải quay ra sao.

Giai đoạn sau, mô hình lập kế hoạch được giữ cố định. Người nghiên cứu đưa vào một lượng nhỏ lượt thao tác mẫu robot và huấn luyện bộ điều khiển làm theo tín hiệu kế hoạch. Khi chạy, video prompt chỉ định nhiệm vụ; mạng lập kế hoạch tạo các mục tiêu trung gian, còn bộ điều khiển chuyển chúng thành thao tác. Nếu môi trường thay đổi, kế hoạch có thể được cập nhật.

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

### Số liệu và phạm vi kết luận

**Đối chiếu số liệu:** Bài báo đánh giá 14 nhiệm vụ trên robot thật. Trong những thiết lập được báo cáo, học trước từ video người cải thiện kết quả so với phương pháp đối chứng; thiết kế hai tầng cũng tốt hơn một số cách học trực tiếp một tầng. Các mức cải thiện có thể lên tới hàng chục điểm phần trăm nhưng phụ thuộc nhóm phép thử. Khi xem Hình 4–5, hãy chú ý hệ thống hoàn thành được bao nhiêu bước của nhiệm vụ dài và có sửa kế hoạch khi bối cảnh bị can thiệp không.

## Hạn chế và câu hỏi còn mở

### Các điểm yếu của việc dùng video người

Video người không có nhãn góc khớp robot. Có thể trong video người cầm đồ rất dễ, nhưng kẹp robot không đủ dài hoặc không có lực phù hợp. Kế hoạch cấp cao tốt không chữa được một bộ điều khiển cấp thấp chưa biết cách kẹp.

Biểu diễn ẩn cũng khó kiểm chứng bằng mắt; cần chạy và xem nó có thật sự làm robot tới đúng đích trung gian hay không. Tính bền trước một loại xáo trộn trong thí nghiệm không bảo đảm chịu được mọi tác động.

## Liên hệ với nghiên cứu khác

### MIMICPLAY liên hệ với π0.5 và PaLM-E

MIMICPLAY và π0.5 đều coi nhiệm vụ dài là sự phối hợp nhiều bước nhỏ, nhưng cách học khác nhau. MIMICPLAY dùng video người để học kế hoạch ẩn, còn π0.5 kết hợp nhiều dữ liệu và dự đoán bước con cùng hành động từ một hệ VLA.

PaLM-E cũng có thể tham gia suy luận mục tiêu cấp cao, nhưng không thay được bộ điều khiển motor. Khi đọc ba bài, hãy luôn hỏi mô-đun nào quyết định bước kế tiếp và mô-đun nào trực tiếp điều khiển robot.

### Những bài nên đọc tiếp

- [GR00T N1](/paper/groot-n1)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc code và tự kiểm chứng

### Bài tập lập kế hoạch

Viết nhiệm vụ “Dọn bàn học” thành bốn bước và gắn với mỗi bước một điều kiện thành công quan sát được: bút nằm trong hộp, sách xếp thành chồng, ngăn kéo đóng hẳn. Phân biệt phần video người có thể dạy với phần cần lượt thao tác mẫu robot.

Giả sử người chuyển hộp bút khi robot đang làm. Hãy chỉ ra bước nào của kế hoạch phải cập nhật. Làm được điều này sẽ giúp hiểu vì sao tầng lập kế hoạch không thể chỉ phát một chuỗi cố định từ đầu đến cuối.
