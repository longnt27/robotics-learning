> **Gợi ý đọc:** Đối chiếu [bài báo gốc](https://arxiv.org/abs/2503.14734), Hình 3 (kiến trúc) và Mục 4 (thực nghiệm). Những nhận xét về khả năng triển khai được phân biệt với kết quả tác giả thực sự kiểm chứng.

## Vì sao cần nghiên cứu này?

### Một mô hình biết nhìn chưa chắc biết điều khiển

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 7](/paper-figures/groot-n1/figure-5.webp)
![Hình 6 từ PDF gốc, trang 10](/paper-figures/groot-n1/figure-6.webp)
![Hình 14 từ PDF gốc, trang 25](/paper-figures/groot-n1/figure-14.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Robot hình người có camera, hai tay và nhiều khớp, nhưng việc chuyển câu “gấp chiếc áo này” thành hàng trăm lệnh vận động vẫn khó. Trước đây một kỹ năng thường cần nhiều lượt thao tác mẫu đúng với chính robot đó: người vận hành phải làm mẫu, ghi ảnh và trạng thái khớp, huấn luyện rồi kiểm tra trên thiết bị. Trong khi ấy có rất nhiều video người thao tác và các mô hình đã học hiểu đồ vật từ ảnh, văn bản. GR00T N1 tìm cách tận dụng nguồn kiến thức rộng ấy mà vẫn sinh hành động đúng với cơ cấu robot.

Video người không thể trực tiếp biến thành góc khớp robot: tay người có năm ngón nhưng robot có thể chỉ có kẹp hai ngón. GR00T N1 học cách diễn tiến công việc từ video, rồi dùng dữ liệu vận động của robot để thực thi trên cơ cấu phù hợp.

Hai phần của mô hình giải hai câu hỏi khác nhau: “Vật nào cần thao tác và đích ở đâu?” và “Robot phải chuyển động thế nào để đạt đích?”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/groot-n1/figure-1.webp)


### Vì sao robot hình người không thể chỉ học từ một tập demonstration nhỏ?

Robot hai tay, robot di động và robot hình người có số khớp, kiểu kẹp và cảm biến rất khác nhau. Thu hàng triệu lượt thực hành đúng với mỗi phần cứng sẽ cực kỳ tốn kém. GR00T N1 tìm cách khai thác nhiều tầng dữ liệu: video người dễ thu, video tạo tổng hợp, demonstration robot nhiều loại và dữ liệu chi tiết của robot mục tiêu.

Bài toán không đơn giản là “mô hình nhìn video rồi bắt chước tay người”. Video người có thể giúp hiểu thứ tự và mục tiêu chuyển động, nhưng lệnh motor vẫn phải thích ứng với cấu trúc robot. Vì vậy GR00T có phần xử lý ảnh/câu lệnh và phần chuyên sinh hành động vận động.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

Cần phân biệt **mô hình hiểu ảnh–ngôn ngữ (VLM)** với **mô hình sinh chuyển động**. VLM có thể nhận ra áo nằm ở đâu và hiểu câu “gấp áo”, nhưng không tự suy ra quỹ đạo khớp đủ chính xác để hai tay cầm áo. Phần sinh hành động liên tục được học từ những ví dụ vận động.

**Đoạn hành động (action chunk)** gồm H bước liên tiếp, mỗi bước có D giá trị điều khiển. Mô hình cần sinh đoạn phù hợp với trạng thái robot hiện tại. Khi một nhiệm vụ có nhiều cách làm đúng, phương pháp sinh bằng diffusion hoặc flow matching giúp biểu diễn nhiều đường đi hợp lệ thay vì ép về một chuyển động trung bình.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/groot-n1/figure-3.webp)
![Hình 4 từ PDF gốc, trang 6](/paper-figures/groot-n1/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tách hiểu cảnh khỏi tạo chuyển động

Trong GR00T N1, **VLM** đọc ảnh và lệnh để hình thành biểu diễn ngữ nghĩa: vật cần nhặt là gì, mục tiêu ở đâu. **Action expert** dùng thông tin ấy, cùng trạng thái khớp và loại robot, để dự đoán chuyển động. Action expert được xây bằng Diffusion Transformer; nó sinh hành động chứ không viết câu trả lời cho người dùng.

**Biểu diễn nhận biết robot** giúp phần sinh lệnh hiểu đang điều khiển cánh tay đơn hay hệ hai tay nhiều khớp. Hai robot có thể chia sẻ ý tưởng “dịch tay sang trái”, nhưng góc khớp cụ thể không giống nhau. Đó là lý do mạng có bộ mã hóa riêng cho trạng thái và hành động theo từng cấu trúc.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

GR00T N1 chia xử lý thành **hai hệ thống phối hợp**. Hệ thống thứ nhất đọc ảnh camera, câu lệnh và thông tin robot để hiểu cảnh và yêu cầu. Hệ thống thứ hai, hay **action expert**, nhận những đặc trưng ấy cùng trạng thái robot và sinh chuỗi chuyển động liên tục qua Diffusion Transformer.

Dữ liệu huấn luyện đến từ nhiều mức: video người thao tác, video tổng hợp và lượt thao tác mẫu từ những cấu hình robot khác nhau. Video người cung cấp thông tin về mục tiêu, diễn tiến công việc; lượt thao tác mẫu của robot mới giúp học lệnh có thể thực thi. Các cấu trúc robot có số khớp khác nhau cần bộ mã hóa trạng thái và hành động tương ứng. Nếu chỉ học ý nghĩa câu chữ mà không có dữ liệu chuyển động, robot vẫn không biết phải điều khiển khớp thế nào.

Khi chạy, action expert sinh đoạn lệnh cho robot cụ thể, thay vì coi mọi dạng tay máy dùng chung một vector điều khiển.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 8 từ PDF gốc, trang 13](/paper-figures/groot-n1/figure-8.webp)
![Hình 11 từ PDF gốc, trang 21](/paper-figures/groot-n1/figure-11.webp)
![Hình 12 từ PDF gốc, trang 21](/paper-figures/groot-n1/figure-12.webp)

<!-- END ADDITIONAL PDF FIGURES -->

```text
Ảnh camera + câu lệnh + trạng thái robot
                │
                ▼
       VLM: hiểu cảnh và mục tiêu
                │
                ▼
      Bộ sinh hành động (DiT)
       Chuỗi lệnh ban đầu có nhiễu
                │
        Sinh bằng flow matching
                ▼
      H bước × D chiều điều khiển
                │
                ▼
         Bộ điều khiển robot
```

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/groot-n1/figure-2.webp)


### Những gì diễn ra từ câu lệnh đến lệnh motor

Giả sử câu lệnh là “chuyển quả táo từ tay trái sang tay phải rồi đặt vào giỏ”. Camera ghi cảnh và trạng thái khớp ghi vị trí hiện tại. Mô hình VLM Eagle-2 biến ảnh/câu lệnh thành đặc trưng, sau đó chuyển thông tin liên quan sang các khối DiT bằng chú ý chéo.

Action expert nhận thêm biểu diễn trạng thái của robot và chuỗi hành động nhiễu, liên tục chỉnh chuỗi cho tới khi tạo ra đoạn lệnh vận động. Lệnh cần được chuyển về đúng dạng phần cứng thực thi. Robot nhận quan sát mới khi di chuyển. Mạng ngữ nghĩa giúp chọn việc cần làm; bộ sinh hành động mới quyết định quỹ đạo thực tế.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot hai tay cần **gấp một chiếc áo trên bàn**. Camera ghi hình dáng chiếc áo và vị trí hai tay; câu lệnh xác định việc cần làm. Phần VLM cung cấp biểu diễn về áo, bàn và đích gấp. Action expert kết hợp biểu diễn ấy với trạng thái khớp để tạo chuỗi tiếp cận, kẹp mép áo và kéo vào vị trí mới.

Robot thực thi một phần, chụp ảnh lại rồi sinh các bước tiếp. Nếu áo bị trượt khỏi chỗ kẹp, chuỗi mới phải phản ánh vị trí thật. Đây là ví dụ rõ rằng kế hoạch ngữ nghĩa và điều khiển vật lý liên quan chặt chẽ nhưng không phải cùng một phép tính.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 7 từ PDF gốc, trang 11](/paper-figures/groot-n1/figure-7.webp)
![Hình 13 từ PDF gốc, trang 22](/paper-figures/groot-n1/figure-13.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ hai tay chuyền quả táo

Robot đang giữ táo bằng tay trái, tay phải phải đưa tới đúng vị trí, kẹp chắc rồi tay trái mới thả. Một mạng chỉ biết “đưa táo vào giỏ” chưa đủ nếu không dự đoán đúng thứ tự phối hợp hai tay. Hình 11 cho thấy một ví dụ robot chưa tinh chỉnh vẫn hoàn thành chuyển tay trong bố cục mới, nhưng chuyển động còn giật.

Điều này cho thấy kiến thức từ giai đoạn huấn luyện rộng có thể hữu ích trước khi học riêng nhiệm vụ. Tuy nhiên một lượt thành công mang tính minh họa chưa thay thế đánh giá trên nhiều vị trí, vật và số lượt thử.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

GR00T N1 được thử trên những nhiệm vụ mô phỏng và thao tác hai tay ở robot thật. Các kết quả trong bài báo cho thấy việc học trước từ nhiều nguồn dữ liệu có thể giúp mô hình thích nghi với nhiệm vụ đích bằng ít lượt thao tác mẫu hơn các chính sách huấn luyện từ đầu trong cùng điều kiện.

Nhưng cần đọc từng bảng với đúng **số lượt thao tác mẫu, kiểu robot, nhiệm vụ và giai đoạn tinh chỉnh**. Một video robot chuyền táo thành công ở bố cục mới là minh họa đáng chú ý, không đủ chứng minh mô hình sẽ làm mọi nhiệm vụ chưa từng học. Hiệu quả hệ thống còn phụ thuộc chất lượng dữ liệu tổng hợp và cách chuyển dữ liệu người thành nhãn hành động robot.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 9 từ PDF gốc, trang 16](/paper-figures/groot-n1/figure-9.webp)
![Hình 10 từ PDF gốc, trang 20](/paper-figures/groot-n1/figure-10.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Dữ liệu video tổng hợp thực sự giúp gì?

Hình 5 và Hình 13 trình bày các video được mô hình sinh từ ảnh ban đầu cùng prompt thay đổi. Mục tiêu là tạo thêm quỹ đạo/hình ảnh cho những việc khó hoặc đắt nếu phải quay bằng robot thật. Có thể tạo các góc nhìn khác nhau, thay vật thể hoặc nối nhiều đoạn thành nhiệm vụ dài.

Hình 9 kiểm tra riêng việc bổ sung quỹ đạo sinh ở các chế độ dữ liệu ít/nhiều. Điều quan trọng là video tổng hợp không tự có nhãn hành động robot chính xác; cần suy ra lệnh bằng phương pháp phù hợp, chẳng hạn mô hình động học ngược, và xác minh chất lượng. Nếu nhãn sai, thêm dữ liệu còn có thể làm chính sách điều khiển kém.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

GR00T N1 học trên nhiều nguồn dữ liệu nhưng vẫn cần được thích nghi với robot và nhiệm vụ cụ thể. Video người không cung cấp sẵn lệnh khớp cho robot; video sinh tự động còn có thể chứa chuyển động không hợp vật lý. Cách chọn lọc và gắn nhãn dữ liệu có thể ảnh hưởng kết quả không kém kiến trúc mạng.

Độ an toàn, lực tiếp xúc, giữ thăng bằng và khả năng phục hồi là những vấn đề chưa thể suy ra chỉ từ kết quả nhặt–đặt. Ngoài ra, việc tái tạo đầy đủ một hệ tiền huấn luyện lớn rất tốn tài nguyên. Nên xem phần nào thực sự đã được thử trên robot thật thay vì suy rộng từ hình kiến trúc.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những điều chưa nên suy rộng

Robot hình người phải thỏa các ràng buộc cân bằng, tiếp xúc, giới hạn lực và an toàn mà dữ liệu video đơn thuần không mô tả đầy đủ. Khả năng vận động tay tốt trong một vài nhiệm vụ chưa có nghĩa robot tự giữ thăng bằng và làm được mọi việc nhà.

Các loại dữ liệu khác nhau cũng có độ tin cậy khác nhau. Video tạo sinh có thể chứa chuyển động không tuân theo vật lý; demonstration thật thì hiếm. Kết quả cần xem cả nguồn dữ liệu, loại robot thử và điều kiện khởi tạo, không chỉ tổng số giờ huấn luyện.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [RT-2](/paper/rt-2) mã hóa lệnh robot thành token; GR00T N1 tách mạng hiểu ảnh–ngôn ngữ khỏi mạng sinh chuyển động liên tục.
- [Diffusion Policy](/paper/diffusion-policy) giải thích cách chỉnh dần chuỗi hành động nhiễu thành chuyển động hợp lệ.
- [Open X-Embodiment](/paper/open-x-embodiment) cho thấy thách thức khi phối trộn dữ liệu từ nhiều loại robot.
- [Qwen-VLA](/paper/qwen-vla) cũng nhận biết loại robot để sinh các hành động DiT phù hợp với cấu hình cụ thể.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) tập trung vào mạng nhiều chuyên gia (MoE), lệnh cho nhiều bộ phận cơ thể và dự đoán trạng thái tương lai.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### So với PaLM-E, RDT và π0.5

PaLM-E tập trung đưa cảm giác từ thế giới thật vào suy luận đa phương thức. RDT chú trọng sinh đoạn hành động phối hợp hai tay bằng DiT. GR00T N1 dùng thiết kế hai phần: VLM hiểu cảnh và action expert sinh chuyển động, đồng thời trộn nhiều loại dữ liệu để học robot khác nhau.

π0.5 cũng quan tâm nguồn dữ liệu đa dạng và phân tầng nhiệm vụ dài, nhưng quy trình học và đối tượng đánh giá khác. Khi so, phải hỏi từng mạng đang dùng dữ liệu nào và có phải huấn luyện bổ sung cho robot đích không.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Bắt đầu bằng mã nguồn công khai của [NVIDIA Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T). Đọc định dạng quan sát, trạng thái robot, ảnh và chuỗi lệnh. Chạy một mẫu qua phần VLM và action expert, kiểm tra số chiều mảng dữ liệu và dạng lệnh được giải mã ở mỗi bước.

Giữ nguyên câu lệnh nhưng thay ảnh, rồi giữ ảnh nhưng thay câu lệnh để xem đầu ra thay đổi ra sao. Không cần chạy toàn bộ tiền huấn luyện để hiểu hệ thống: mục tiêu đầu tiên là **biết dữ liệu đi qua thành phần nào và phần nào thực sự tạo lệnh robot**.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Cách tự phân tích sơ đồ GR00T N1

Vẽ hai ô: phần hiểu ảnh/câu lệnh và phần sinh lệnh vận động. Từ đó đặt trạng thái robot, ảnh camera, câu lệnh và hành động nhiễu vào đúng vị trí đầu vào. Tiếp theo chỉ ra tại sao cần mã hóa khác nhau cho robot một tay và hai tay.

Để kiểm chứng giá trị của video tổng hợp, thử so chính sách điều khiển được huấn luyện với cùng số demonstration thật, có và không bổ sung video sinh. Đo tỷ lệ hoàn thành trên tình huống chưa gặp. Nếu không giữ số lượt và thiết lập thử tương đương, khó biết lợi ích đến từ đâu.

<!-- END EXTENDED WALKTHROUGH -->

