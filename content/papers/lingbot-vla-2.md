> **Gợi ý đọc:** [From Foundation to Application: Improving VLA Models in Practice](https://arxiv.org/abs/2607.06403) giới thiệu LingBot-VLA 2.0. Trọng tâm là cả quy trình gồm làm sạch dữ liệu, thống nhất dạng lệnh, mạng MoE và học dự đoán trạng thái tương lai, không chỉ riêng MoE.

## Vì sao cần nghiên cứu này?

### Mô hình đạt điểm cao chưa chắc dùng tốt trên robot thật

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 8 từ PDF gốc, trang 13](/paper-figures/lingbot-vla-2/figure-8.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Một mô hình muốn dùng trên robot hai tay, robot hình người và tay máy di động sẽ gặp ba trở ngại chính: dữ liệu thu từ nhiều hệ thống không đồng nhất và không phải lúc nào cũng sạch; một mạng dùng chung có thể thiếu năng lực để học đủ kỹ năng khác nhau; và robot cần hiểu hành động sẽ làm cảnh thay đổi ra sao, không chỉ bắt chước lệnh tiếp theo. LingBot-VLA 2.0 xây một quy trình giải đồng thời ba nhóm vấn đề ấy, từ dữ liệu đầu vào tới bộ sinh chuyển động.

Dữ liệu nhiều không có nghĩa dữ liệu sạch: nếu ảnh và lệnh lệch thời gian hoặc mỗi robot dùng một đơn vị khác nhau, mạng sẽ học sai. LingBot xử lý các vấn đề ấy từ bước làm sạch đến mô hình điều khiển; vì vậy phải đánh giá từng thành phần thay vì chỉ đếm giờ dữ liệu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/lingbot-vla-2/figure-1.webp)


### Vì sao nhiều giờ dữ liệu vẫn chưa đủ để robot làm tốt?

Một công ty thu hàng chục nghìn giờ demonstration từ nhiều kiểu robot. Nhưng video có thể bị lệch thời gian, hành động dùng nhiều đơn vị khác nhau và dữ liệu các việc thường gặp áp đảo việc hiếm. Nếu trộn nguyên tất cả vào mạng lớn, mô hình có thể học cả lỗi và sự thiên lệch. LingBot-VLA 2.0 giải vấn đề ở **toàn quy trình**, từ tuyển lọc dữ liệu, biểu diễn hành động đến kiến trúc sinh lệnh và học dự đoán tương lai.

Đừng đọc tên MoE rồi tưởng bài chỉ thay vài lớp mạng. Bốn phần cốt lõi là chất lượng dữ liệu, chuẩn hành động dùng chung, phân bổ dung lượng mô hình và tín hiệu học về diễn biến cảnh sau khi robot hành động.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

Một mạng Transformer thông thường cho mọi token đi qua cùng những lớp tính toán. Với rất nhiều nhiệm vụ và kiểu robot, các kỹ năng khác nhau có thể tranh nhau dung lượng biểu diễn. **Mixture-of-Experts (MoE)** chia một số lớp thành nhiều mạng chuyên gia; một bộ định tuyến chọn vài chuyên gia để xử lý mỗi token, nên tổng tham số có thể lớn nhưng lượng phép tính mỗi lượt không tăng tương ứng.

Dữ liệu đa robot còn cần **biểu diễn hành động thống nhất**: các chiều thuộc tay, kẹp, đầu hoặc bệ di động phải được gắn đúng ý nghĩa và che những chiều robot không có. Mục tiêu dự đoán đặc trưng tương lai giúp mạng học điều gì có thể xảy ra sau khi hành động, nhưng không tự bảo đảm nó hiểu đầy đủ vật lý.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 6](/paper-figures/lingbot-vla-2/figure-4.webp)
![Hình 11 từ PDF gốc, trang 15](/paper-figures/lingbot-vla-2/figure-11.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu dữ liệu đa robot và không gian hành động 55 chiều

Robot hai tay, robot di động và robot hình người có số khớp khác nhau. LingBot dùng một **cách biểu diễn hành động gồm nhiều phần theo bộ phận cơ thể**, tổng cộng 55 chiều, để sắp xếp dữ liệu về một cấu trúc chung. Những chiều không dùng trên robot này cần được nhận biết/che đi; số 55 không có nghĩa robot nào cũng có 55 bậc tự do thật.

**Chuẩn hóa hành động** quan trọng vì một robot dùng góc khớp tuyệt đối, robot khác dùng độ thay đổi góc, và biên độ các chiều khác nhau. Sai bước giải chuẩn hóa có thể khiến lệnh vượt quá giới hạn dù số mô hình sinh ra nhìn có vẻ nhỏ.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

LingBot-VLA 2.0 xử lý cả chuỗi công việc từ **dữ liệu tới triển khai**. Tác giả tuyển lọc khoảng 90.000 giờ dữ liệu robot thô, còn khoảng **50.000 giờ dùng cho học trước** từ 20 cấu hình robot, kết hợp thêm video góc nhìn người. Những nguồn này phải được đồng bộ và gắn nhãn phù hợp trước khi đưa vào mô hình.

Hệ thống ánh xạ lệnh các robot sang một biểu diễn chung **55 chiều**, nhưng vẫn giữ cách xác định bộ phận cơ thể và những chiều không sử dụng. Mạng sử dụng các chuyên gia MoE để xử lý nguồn kỹ năng đa dạng. Ngoài việc dự đoán hành động, một mục tiêu huấn luyện bổ sung giúp mạng học đặc trưng cảm nhận hiện tại và tương lai từ tín hiệu hình ảnh, video và độ sâu. Cần tách mạng hỗ trợ tạo nhãn huấn luyện khỏi thành phần thực sự phải chạy trên robot.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/lingbot-vla-2/figure-3.webp)
![Hình 5 từ PDF gốc, trang 8](/paper-figures/lingbot-vla-2/figure-5.webp)
![Hình 7 từ PDF gốc, trang 9](/paper-figures/lingbot-vla-2/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->

```text
Ảnh từ camera trên đầu ───────┬────────────────┐
                             │                │
                            SLAM        Tư thế bàn tay
                             │                │
                      Chuyển động camera  Vị trí tay
                             └──────┬─────────┘
                                    ▼
                     Quỹ đạo tay trong thế giới
                                    ▼
                     Lệnh theo góc nhìn hiện tại
```

```text
Tay | Đầu kẹp | Kẹp | Ngón | Eo | Đầu | Bệ | Dự phòng
 14      14       2      12     4      2    3       4
```

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/lingbot-vla-2/figure-2.webp)


### Từng phần trong quy trình LingBot hoạt động ra sao?

Đầu tiên dữ liệu robot và video người được tuyển chọn, đồng bộ, gắn nhãn và chuyển sang biểu diễn thống nhất. Camera cùng câu lệnh được bộ phận thị giác–ngôn ngữ xử lý; trạng thái robot và dạng hành động của từng loại phần cứng được mã hóa tương ứng.

Phần sinh hành động sử dụng nhiều nhánh chuyên gia (MoE) để tăng khả năng chứa kiến thức cho các kiểu nhiệm vụ khác nhau. Bên cạnh mục tiêu dự đoán lệnh, mạng được khuyến khích học đặc trưng cảnh hiện tại/tương lai qua mô hình hình ảnh–video và độ sâu. Khi robot hoạt động, những tín hiệu học bổ sung không có nghĩa phải chạy toàn bộ mô hình teacher để tạo lệnh mỗi bước. Cần tách những thành phần chỉ dùng khi huấn luyện khỏi phần thực sự chạy lúc suy luận.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử dữ liệu đến từ tay máy Franka, robot hai tay và robot di động. Với mỗi nguồn, hệ thống phải xác định ảnh camera, trạng thái khớp, lệnh ở đầu kẹp và bộ phận cơ thể tương ứng. Sau đó lệnh được đưa vào những vị trí phù hợp trong biểu diễn 55 chiều; các vị trí robot không sử dụng cần được che.

Với nhiệm vụ dọn bàn, phần nhận biết ảnh xác định vật cần lấy và đích đặt. Bộ sinh hành động phối hợp tay, kẹp và bệ di động để làm từng bước. MoE phân bổ năng lực mô hình cho những dạng tín hiệu khác nhau; mục tiêu dự đoán tương lai có thể khuyến khích biểu diễn hiểu vật sẽ đổi vị trí sau khi nhấc lên. Nhưng hai lựa chọn này phải được thử tách riêng mới biết chúng đóng góp bao nhiêu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ một robot di động phải dọn bàn

Robot cần đi tới bàn, nhận biết vật cần lấy, điều khiển tay kẹp, đặt vật vào hộp rồi tiếp tục di chuyển. Lệnh cho bệ di động có dạng khác lệnh cổ tay, đầu hay ngón kẹp. Một biểu diễn hành động dùng chung phải giữ đúng ý nghĩa từng phần khi chuyển sang robot khác.

MoE có thể giúp mạng dành năng lực cho các mẫu động tác đa dạng, nhưng không sửa được nhãn sai. Mục tiêu dự đoán đặc trưng tương lai có thể khuyến khích mô hình hiểu rằng sau khi nhấc cốc, vị trí cốc thay đổi; song phải có thí nghiệm tách riêng mục tiêu đó để biết nó thực sự giúp thao tác.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Nhóm tác giả so mạng nhiều chuyên gia với mạng thông thường ở mức chi phí tính toán hoạt động gần tương đương. Trong Hình 7, mô hình MoE có hàm mất mát và sai số dự đoán hành động thấp hơn trên những tập được kiểm tra. Đây là bằng chứng có ích về khả năng học, nhưng chưa tự nói riêng MoE làm mọi thao tác robot thật tốt hơn.

Các thí nghiệm khác kiểm tra chuỗi nhiệm vụ dài, độ chính xác trên từng bước con, phân phối hành động sau chuẩn hóa và mục tiêu dự đoán đặc trưng tương lai. Khi đọc, cần phân biệt kết quả **dự đoán hành động trên dữ liệu ghi sẵn** với **tỷ lệ robot thực sự hoàn thành công việc**. Một kết quả tổng hợp tốt có thể đến từ phối hợp nhiều thay đổi, không chỉ một lớp mạng.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 8](/paper-figures/lingbot-vla-2/figure-6.webp)
![Hình 9 từ PDF gốc, trang 14](/paper-figures/lingbot-vla-2/figure-9.webp)
![Hình 10 từ PDF gốc, trang 15](/paper-figures/lingbot-vla-2/figure-10.webp)
![Hình 12 từ PDF gốc, trang 16](/paper-figures/lingbot-vla-2/figure-12.webp)
![Hình 13 từ PDF gốc, trang 17](/paper-figures/lingbot-vla-2/figure-13.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc các phép so dữ liệu, MoE và chuẩn hóa

Hình 7 so mô hình Dense với MoE khi số tham số hoạt động tương đương. Đó là điều kiện quan trọng để lợi thế, nếu có, không đơn giản do dùng nhiều phép tính hơn. Hình 11–12 so phân phối hành động theo từng nhiệm vụ; các cột có cùng tên chiều vẫn có thể khác biên độ và cách điều khiển. Vì vậy đọc các biểu đồ chuẩn hóa là bước kỹ thuật bắt buộc, không phải phần trang trí.

Hình 13 so đặc trưng độ sâu/ảnh thật với dự đoán hiện tại và tương lai, nhằm kiểm tra tín hiệu học bổ sung. Để quy lợi ích cho nó, cần giữ các nguồn dữ liệu và thành phần khác tương đương. Với nhiệm vụ dài, Hình 8 đo tỷ lệ hoàn thành từng bước con, không chỉ câu trả lời cuối.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Dữ liệu đa robot có thể sai lệch thời gian, khác đơn vị hoặc thiếu nhãn. Video người đòi suy ra vị trí tay và chuyển động nên không có sẵn lệnh robot thật. Bộ chuyển đổi 55 chiều giúp trộn dữ liệu nhưng vẫn phải kiểm tra mask và thống kê chuẩn hóa cho từng cấu hình.

**MoE cũng có điểm yếu:** bộ định tuyến có thể chọn chuyên gia theo phông nền hoặc loại camera thay vì kỹ năng như người nghiên cứu kỳ vọng. Việc dự đoán đặc trưng tương lai không bảo đảm tránh được va chạm hay hiểu lực. Trong một số nhiệm vụ dài hoặc tình huống ngoài phân phối học, tỷ lệ thành công còn hạn chế; cần thí nghiệm tách thành phần và kiểm tra thực tế trước khi kết luận rộng.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn của giải pháp đa thành phần

Một hệ nhiều thành phần có thể cải thiện tổng thể nhưng khó biết phần nào thật sự tạo khác biệt nếu nhiều thứ đổi cùng lúc. MoE tăng dung lượng tham số nhưng có thêm bài toán định tuyến/chia tải. Video người không tự có lệnh khớp robot. Nhãn độ sâu hoặc đặc trưng tương lai cũng có thể sai khi camera bị che.

Đưa mô hình sang phần cứng mới vẫn cần kiểm tra camera, sơ đồ khớp, mask hành động và thống kê chuẩn hóa. Một vector 55 chiều hợp lệ về mặt phần mềm chưa bảo đảm là lệnh an toàn trên robot thật.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [Open X-Embodiment](/paper/open-x-embodiment) là ví dụ nền tảng về việc phối trộn dữ liệu từ nhiều cấu trúc robot.
- [GR00T N1](/paper/groot-n1) cũng kết hợp mạng hiểu ảnh–ngôn ngữ và bộ sinh hành động, có sử dụng video người.
- [Qwen-VLA](/paper/qwen-vla) cùng giải bài toán đa robot, nhưng dùng cách điều kiện hóa theo cấu hình khác với biểu diễn 55 chiều.
- [Diffusion Policy](/paper/diffusion-policy) cùng RDT-1B giải thích cách học sinh chuỗi hành động có điều kiện.
- [DROID](/paper/droid) cho thấy giá trị của dữ liệu robot ghi ở nhiều địa điểm thực tế.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Liên hệ với GR00T, Open X và RDT

Open X-Embodiment đặt nền cho học trên nhiều loại robot. RDT nghiên cứu bộ sinh hành động phối hợp hai tay có điều kiện từ nhiều tín hiệu. GR00T N1 xây hệ VLM và action expert, tận dụng dữ liệu người/robot đa dạng. LingBot-VLA 2.0 cũng đi theo hướng hệ thống nhưng nhấn mạnh việc tuyển lọc dữ liệu, cấu trúc hành động chuẩn và MoE.

Không nên chỉ hỏi mô hình nào có nhiều tham số nhất. Cần biết nó học từ dữ liệu sạch đến đâu, loại robot thử gì, và các thí nghiệm tách thành phần có chỉ ra nguồn cải thiện hay không.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Tạo hai robot giả lập: robot A có lệnh đầu kẹp bảy chiều, robot B có 14 chiều khớp và kẹp. Viết bộ chuyển đổi sang biểu diễn **55 chiều**, gắn mặt nạ cho các chiều không có rồi thử giải chuẩn hóa ngược để chắc giá trị vật lý được giữ đúng.

Tiếp theo tạo mạng MoE nhỏ với vài chuyên gia, ghi số lần mỗi chuyên gia được chọn theo nhiệm vụ và loại robot. So mô hình có/không có MoE khi giữ số phép tính hoạt động và dữ liệu gần tương đương. Cuối cùng mới thử thêm mục tiêu dự đoán đặc trưng tương lai, để biết rõ từng cải tiến mang lại điều gì.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài kiểm tra hiểu bài trước khi xem code

Hãy vẽ ba robot: cánh tay đơn, robot hai tay và robot di động. Ghi những chiều hành động mà mỗi robot thật sự có. Giải thích vì sao cách biểu diễn 55 chiều cần thông tin loại robot và cách che những phần không dùng.

Tiếp đó chọn một bài toán nhặt cốc và đề xuất ba phép thử: giữ dữ liệu, chỉ thay Dense/MoE; giữ mô hình, chỉ thay cách chuẩn hóa; giữ mọi thứ, chỉ thêm mục tiêu dự đoán đặc trưng tương lai. Nếu có thể diễn đạt rõ từng thử nghiệm kiểm chứng giả thuyết nào, bạn đã hiểu đóng góp quan trọng nhất của LingBot.

<!-- END EXTENDED WALKTHROUGH -->

