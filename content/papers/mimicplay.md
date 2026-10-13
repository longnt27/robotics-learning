## Vì sao cần nghiên cứu này?

Video người dọn bàn, cắm hoa hay gấp khăn tương đối dễ thu thập. Nhưng người và robot có cấu trúc tay khác nhau, nên video ấy không thể trực tiếp biến thành góc khớp robot. **MIMICPLAY tách việc học thành hai tầng:** tầng đầu học trình tự và mục tiêu trung gian từ video người; tầng sau học cách điều khiển robot từ một lượng nhỏ demonstration do người vận hành. Nhờ cách chia này, hệ thống có thể tận dụng dữ liệu người rẻ hơn để làm những nhiệm vụ kéo dài nhiều bước, đồng thời vẫn cần dữ liệu robot để học chuyển động thực tế.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 5](/paper-figures/mimicplay/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/mimicplay/figure-1.webp)


### Vì sao xem người làm có ích nhưng chưa đủ?

Một người dọn bàn có thể mở ngăn kéo, nhặt bút, đặt vào hộp rồi đóng lại rất nhanh. Video người làm việc dễ thu hơn việc điều khiển robot hàng trăm lần. Nhưng video ấy không cho biết góc từng khớp robot phải xoay bao nhiêu. Cánh tay người và tay robot cũng khác nhau về hình dạng, giới hạn chuyển động.

MIMICPLAY chia việc thành hai phần: học **đích đến và trình tự** từ video người, rồi học **cách cử động robot thật** từ ít demonstration robot. Đừng hiểu nhầm rằng cứ đưa video người vào là robot trực tiếp sao chép được động tác.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Video người làm việc có thể ghi lại **mục tiêu và thứ tự các bước**, nhưng không chứa sẵn góc khớp robot. Người có thể cầm khăn bằng ngón tay rất dễ, còn kẹp robot phải dùng một cách cầm khác. Vì thế việc học từ video người không đồng nghĩa trực tiếp bắt chước lệnh vận động.

MIMICPLAY chia việc thành **kế hoạch cấp cao** và **điều khiển cấp thấp**. Phần thứ nhất học từ video xem cần làm gì tiếp theo; phần thứ hai học bằng dữ liệu robot để biến kế hoạch ấy thành chuyển động phù hợp với phần cứng.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Kế hoạch cấp cao và điều khiển cấp thấp khác nhau ở đâu?

**Kế hoạch cấp cao** mô tả những trạng thái trung gian cần đạt, chẳng hạn mở ngăn kéo → đưa vật vào → đóng ngăn kéo. MIMICPLAY học biểu diễn ẩn của kế hoạch, không bắt buộc phải viết mỗi bước thành câu chữ. Biểu diễn ấy cho biết hướng tiến tới mục tiêu, không phải góc khớp cụ thể.

**Bộ điều khiển cấp thấp** nhận quan sát và tín hiệu kế hoạch, rồi tạo lệnh phù hợp với tay robot. Nó cần được huấn luyện bằng dữ liệu robot vì video người không phản ánh chính xác cơ cấu và lực của máy.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Giai đoạn đầu, mạng học từ video người thao tác để tạo một **kế hoạch ẩn**, biểu diễn các trạng thái hoặc mục tiêu trung gian mà nhiệm vụ cần đạt. Nó không nhất thiết sinh câu chữ hoặc góc khớp. Giai đoạn sau, mạng lập kế hoạch được giữ cố định; bộ điều khiển học từ một lượng nhỏ demonstration robot để thực hiện các bước theo kế hoạch đó.

Khi robot chạy, video hoặc hình ảnh mục tiêu giúp phần lập kế hoạch tạo hướng đi tiếp theo. Bộ điều khiển nhận quan sát mới để phát lệnh cho tay máy. Cách tách này cho phép dùng video người để học trình tự thao tác, còn dữ liệu robot chịu trách nhiệm về cơ cấu và lệnh thực thi.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 7](/paper-figures/mimicplay/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/mimicplay/figure-2.webp)


### Hai giai đoạn học của MIMICPLAY

Giai đoạn đầu, hệ thống đọc video người thao tác và mục tiêu tương ứng, học cách sinh đường diễn tiến trong không gian kế hoạch ẩn. Nó cố nắm những điều cần xảy ra tiếp theo ở cảnh, không nhất thiết biết motor robot cụ thể phải quay ra sao.

Giai đoạn sau, mô hình lập kế hoạch được giữ cố định. Người nghiên cứu đưa vào một lượng nhỏ demonstration robot và huấn luyện bộ điều khiển làm theo tín hiệu kế hoạch. Khi chạy, video prompt chỉ định nhiệm vụ; mạng lập kế hoạch tạo các mục tiêu trung gian, còn bộ điều khiển chuyển chúng thành thao tác. Nếu môi trường thay đổi, kế hoạch có thể được cập nhật.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Một video cho thấy người mở ngăn kéo, lấy khăn và đặt khăn vào khay. MIMICPLAY có thể học thứ tự ba trạng thái ấy mà chưa cần biết góc khớp robot. Khi sử dụng tay máy thật, demonstration robot dạy cách tiếp cận tay nắm, kéo ngăn kéo và gắp khăn theo khả năng của kẹp.

Nếu có người đẩy khay sang chỗ khác giữa nhiệm vụ, kế hoạch cũ cần cập nhật. Việc biểu diễn hai hành động “cùng đạt mục tiêu” không có nghĩa góc khớp tay người và tay robot phải giống nhau. Đây là chỗ quan trọng để phân biệt chuyển giao mục tiêu với sao chép chuyển động.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 8](/paper-figures/mimicplay/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ dọn một bàn học nhiều bước

Robot phải nhặt bút, cất vào hộp, xếp sách và đóng ngăn kéo. Video người cho thấy thứ tự thao tác và vị trí mục tiêu, nhưng robot vẫn phải học riêng cách cầm một chiếc bút mảnh bằng gripper của nó.

Giả sử có người đẩy hộp bút sang bên phải giữa nhiệm vụ. Nếu bộ lập kế hoạch tiếp tục coi hộp ở vị trí cũ, robot có thể đưa bút vào không khí. Hình 5 trình bày cách MIMICPLAY cập nhật biểu diễn kế hoạch sau khi có tác động, rồi tiếp tục công việc.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trong **14 nhiệm vụ robot thật**, MIMICPLAY cải thiện kết quả so với những phương pháp học bắt chước đối chứng. Các thí nghiệm được báo cáo có nhóm tăng trên **23 điểm phần trăm** nhờ học trước từ video người; thiết kế hai tầng tốt hơn cách xử lý một tầng ở một số điều kiện, và lợi ích còn thấy khi mục tiêu gồm nhiều bước chưa xuất hiện nguyên vẹn lúc huấn luyện.

Kết quả quan trọng là video người không cần cung cấp lệnh robot chính xác vẫn có thể giúp học **thứ tự thao tác và mục tiêu trung gian**. Dữ liệu robot khi ấy tập trung vào việc thực hiện những bước ấy trên cơ cấu cụ thể.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Vì sao thí nghiệm phải dùng nhiệm vụ dài?

Một chính sách điều khiển có thể hoàn thành từng bước riêng với xác suất cao nhưng vẫn hay thất bại khi phải làm liên tiếp năm đến bảy bước. Sai ở bước đầu có thể làm các bước sau không còn thực hiện được. Vì vậy MIMICPLAY được thử trên các công việc như dọn bàn, chuẩn bị bánh kẹp hoặc gấp khăn.

Hình 4 so nhiệm vụ được chỉ dẫn bằng video người và video robot. Khi đọc kết quả, nên xem tiêu chí thành công có đòi hoàn thành toàn nhiệm vụ không và lượng dữ liệu robot ở các trường hợp có được giữ tương đương không.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Kế hoạch ẩn của MIMICPLAY vẫn phụ thuộc vào những bối cảnh và kiểu video được dùng để học. Những video người trong nghiên cứu được thu có chủ đích, không phải mọi video hỗn tạp trên Internet. Nhiệm vụ đánh giá chủ yếu là thao tác trên bàn, chưa đại diện cho robot di động làm việc trong nhiều phòng.

Hơn nữa, video người không thay thế demonstration robot. Nếu kẹp robot không thể thực hiện một động tác, kế hoạch cấp cao không thể tự tạo ra lệnh vật lý chính xác. Kết quả cải thiện trong tập nhiệm vụ nghiên cứu chưa chứng minh mọi chuyển động người đều có thể chuyển sang robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Các điểm yếu của việc dùng video người

Video người không có nhãn góc khớp robot. Có thể trong video người cầm đồ rất dễ, nhưng kẹp robot không đủ dài hoặc không có lực phù hợp. Kế hoạch cấp cao tốt không chữa được một bộ điều khiển cấp thấp chưa biết cách kẹp.

Biểu diễn ẩn cũng khó kiểm chứng bằng mắt; cần chạy và xem nó có thật sự làm robot tới đúng đích trung gian hay không. Tính bền trước một loại xáo trộn trong thí nghiệm không bảo đảm chịu được mọi tác động.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [GR00T N1](/paper/groot-n1)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### MIMICPLAY liên hệ với π0.5 và PaLM-E

MIMICPLAY và π0.5 đều coi nhiệm vụ dài là sự phối hợp nhiều bước nhỏ, nhưng cách học khác nhau. MIMICPLAY dùng video người để học kế hoạch ẩn, còn π0.5 kết hợp nhiều dữ liệu và dự đoán bước con cùng hành động từ một hệ VLA.

PaLM-E cũng có thể tham gia suy luận mục tiêu cấp cao, nhưng không thay được bộ điều khiển motor. Khi đọc ba bài, hãy luôn hỏi mô-đun nào quyết định bước kế tiếp và mô-đun nào trực tiếp điều khiển robot.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Hãy chọn một nhiệm vụ có ba bước như mở ngăn kéo, lấy khăn, đặt khăn vào khay. Xây một mô hình học bắt chước đơn giản với ảnh hiện tại và **ảnh mục tiêu trung gian**, rồi so với mô hình không nhận ảnh mục tiêu. Đo tỷ lệ hoàn thành cả chuỗi, không chỉ một bước riêng.

Thử thay vị trí khay giữa chừng để xem phần kế hoạch có cần cập nhật không. Nếu mạng chỉ làm được khi không có thay đổi, nó có thể đang ghi nhớ quỹ đạo thay vì thực sự dùng mục tiêu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài tập lập kế hoạch

Viết nhiệm vụ “Dọn bàn học” thành bốn bước và gắn với mỗi bước một điều kiện thành công quan sát được: bút nằm trong hộp, sách xếp thành chồng, ngăn kéo đóng hẳn. Phân biệt phần video người có thể dạy với phần cần demonstration robot.

Giả sử người chuyển hộp bút khi robot đang làm. Hãy chỉ ra bước nào của kế hoạch phải cập nhật. Làm được điều này sẽ giúp hiểu vì sao tầng lập kế hoạch không thể chỉ phát một chuỗi cố định từ đầu đến cuối.

<!-- END EXTENDED WALKTHROUGH -->

