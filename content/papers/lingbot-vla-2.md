## Vì sao cần nghiên cứu này?

### Vì sao nhiều giờ dữ liệu vẫn chưa đủ để robot làm tốt?

Một công ty thu hàng chục nghìn giờ lượt thao tác mẫu từ nhiều kiểu robot. Nhưng video có thể bị lệch thời gian, hành động dùng nhiều đơn vị khác nhau và dữ liệu các việc thường gặp áp đảo việc hiếm. Nếu trộn nguyên tất cả vào mạng lớn, mô hình có thể học cả lỗi và sự thiên lệch. LingBot-VLA 2.0 giải vấn đề ở **toàn quy trình**, từ tuyển lọc dữ liệu, biểu diễn hành động đến kiến trúc sinh lệnh và học dự đoán tương lai.

Đừng đọc tên MoE rồi tưởng bài chỉ thay vài lớp mạng. Bốn phần cốt lõi là chất lượng dữ liệu, chuẩn hành động dùng chung, phân bổ dung lượng mô hình và tín hiệu học về diễn biến cảnh sau khi robot hành động.

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/lingbot-vla-2/figure-1.webp)

![Hình 8 từ PDF gốc, trang 13](/paper-figures/lingbot-vla-2/figure-8.webp)

## Kiến thức nền

### Hiểu dữ liệu đa robot và không gian hành động 55 chiều

Robot hai tay, robot di động và robot hình người có số khớp khác nhau. LingBot dùng một **cách biểu diễn hành động gồm nhiều phần theo bộ phận cơ thể**, tổng cộng 55 chiều, để sắp xếp dữ liệu về một cấu trúc chung. Những chiều không dùng trên robot này cần được nhận biết/che đi; số 55 không có nghĩa robot nào cũng có 55 bậc tự do thật.

**Chuẩn hóa hành động** quan trọng vì một robot dùng góc khớp tuyệt đối, robot khác dùng độ thay đổi góc, và biên độ các chiều khác nhau. Sai bước giải chuẩn hóa có thể khiến lệnh vượt quá giới hạn dù số mô hình sinh ra nhìn có vẻ nhỏ.

### Không gian hành động 55 chiều là một mẫu dữ liệu chung

Vector gồm các nhóm chiều cho khớp tay (14), vị trí/tư thế đầu công tác (14), kẹp (2), ngón tay (12), eo (4), đầu (2), bệ di động (3) và các ô dự phòng (4). Tổng là 55. Một robot tay đơn không tự nhiên có eo, đầu hoặc bệ di động; các nhóm không dùng phải được che hoặc ánh xạ hợp lệ.

```text
Khớp tay | Đầu công tác | Kẹp | Ngón tay | Eo | Đầu | Bệ di động | Dự phòng
   14    |      14      |  2  |    12    |  4 |  2  |      3      |     4
```

Trước khi dùng dữ liệu robot mới, cần kiểm tra từng chiều: đơn vị là radian, mét hay độ biến đổi tương đối; hệ tọa độ đặt ở đâu; thống kê chuẩn hóa thuộc robot nào. Cách sắp xếp chung chỉ tạo giao diện dữ liệu nhất quán, không chứng minh mọi lệnh đều chuyển được giữa các phần cứng.

![Hình 4 từ PDF gốc, trang 6](/paper-figures/lingbot-vla-2/figure-4.webp)

![Hình 11 từ PDF gốc, trang 15](/paper-figures/lingbot-vla-2/figure-11.webp)

## Phương pháp thực hiện

### Từng phần trong quy trình LingBot hoạt động ra sao?

Đầu tiên dữ liệu robot và video người được tuyển chọn, đồng bộ, gắn nhãn và chuyển sang biểu diễn thống nhất. Camera cùng câu lệnh được bộ phận thị giác–ngôn ngữ xử lý; trạng thái robot và dạng hành động của từng loại phần cứng được mã hóa tương ứng.

Phần sinh hành động sử dụng nhiều nhánh chuyên gia (MoE) để tăng khả năng chứa kiến thức cho các kiểu nhiệm vụ khác nhau. Bên cạnh mục tiêu dự đoán lệnh, mạng được khuyến khích học đặc trưng cảnh hiện tại/tương lai qua mô hình hình ảnh–video và độ sâu. Khi robot hoạt động, những tín hiệu học bổ sung không có nghĩa phải chạy toàn bộ mô hình teacher để tạo lệnh mỗi bước. Cần tách những thành phần chỉ dùng khi huấn luyện khỏi phần thực sự chạy lúc suy luận.

### Vì sao quy trình gồm tuyển dữ liệu, MoE và học hậu quả hành động?

Từ khoảng 90.000 giờ dữ liệu robot thô, nhóm nghiên cứu tuyển ra khoảng 50.000 giờ thuộc 20 cấu hình robot; bổ sung cỡ 10.000 giờ video góc nhìn người sau lọc. Nếu giữ quá nhiều đoạn tay đứng yên, di chuyển không tương tác hoặc camera mất dấu, mô hình sẽ ít thấy thao tác khó dù tổng thời lượng lớn.

Trong bộ sinh hành động, MoE cho phép nhiều nhánh chuyên gia nhưng chỉ chọn một phần nhánh cho mỗi token. Một nhánh dùng chung luôn hoạt động; các nhánh khác được bộ chọn điều phối theo đặc trưng đầu vào. Một phép thử so mạng thường khoảng 0,6 tỷ tham số với MoE khoảng 1,6 tỷ tham số tổng nhưng chỉ cỡ 0,6 tỷ tham số hoạt động. Vì vậy cần nói rõ **cùng lượng tính toán hoạt động**, không phải hai mô hình có tổng số tham số bằng nhau.

Hệ thống còn học dự đoán đặc trưng ảnh và độ sâu ở tương lai với tín hiệu từ các mô hình giáo viên. Nó không nhất thiết phải dựng toàn bộ ảnh tương lai; mục tiêu là khuyến khích mạng chú ý hậu quả của chuyển động, chẳng hạn cốc bị đẩy tới đâu. Chỉ một hàm mất mát dự đoán tốt chưa chứng minh mạng đã hiểu toàn bộ vật lý.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/lingbot-vla-2/figure-2.webp)

![Hình 3 từ PDF gốc, trang 4](/paper-figures/lingbot-vla-2/figure-3.webp)

![Hình 5 từ PDF gốc, trang 8](/paper-figures/lingbot-vla-2/figure-5.webp)

![Hình 7 từ PDF gốc, trang 9](/paper-figures/lingbot-vla-2/figure-7.webp)

## Ví dụ từng bước

### Ví dụ một robot di động phải dọn bàn

Robot cần đi tới bàn, nhận biết vật cần lấy, điều khiển tay kẹp, đặt vật vào hộp rồi tiếp tục di chuyển. Lệnh cho bệ di động có dạng khác lệnh cổ tay, đầu hay ngón kẹp. Một biểu diễn hành động dùng chung phải giữ đúng ý nghĩa từng phần khi chuyển sang robot khác.

MoE có thể giúp mạng dành năng lực cho các mẫu động tác đa dạng, nhưng không sửa được nhãn sai. Mục tiêu dự đoán đặc trưng tương lai có thể khuyến khích mô hình hiểu rằng sau khi nhấc cốc, vị trí cốc thay đổi; song phải có thí nghiệm tách riêng mục tiêu đó để biết nó thực sự giúp thao tác.

## Kết quả thực nghiệm

### Đọc các phép so dữ liệu, MoE và chuẩn hóa

Hình 7 so mô hình Dense với MoE khi số tham số hoạt động tương đương. Đó là điều kiện quan trọng để lợi thế, nếu có, không đơn giản do dùng nhiều phép tính hơn. Hình 11–12 so phân phối hành động theo từng nhiệm vụ; các cột có cùng tên chiều vẫn có thể khác biên độ và cách điều khiển. Vì vậy đọc các biểu đồ chuẩn hóa là bước kỹ thuật bắt buộc, không phải phần trang trí.

Hình 13 so đặc trưng độ sâu/ảnh thật với dự đoán hiện tại và tương lai, nhằm kiểm tra tín hiệu học bổ sung. Để quy lợi ích cho nó, cần giữ các nguồn dữ liệu và thành phần khác tương đương. Với nhiệm vụ dài, Hình 8 đo tỷ lệ hoàn thành từng bước con, không chỉ câu trả lời cuối.

### Những con số cần phân biệt trong đánh giá

Ở một nhóm nhiệm vụ GM-100 trên Agilex Cobot Magic, chỉ số tiến độ và tỷ lệ hoàn thành được báo cáo lần lượt khoảng 66,2 và 34,4 cho LingBot-VLA 2.0; phương án π0.5 khoảng 59,1 và 32,2. Trên một cấu hình Galaxea khác, các cặp lần lượt khoảng 34,6/15,6 và 27,4/8,9. **Tiến độ** có nghĩa robot làm được một phần chuỗi, còn **thành công** đòi hoàn thành mục tiêu cuối.

Ở một nhóm nhiệm vụ xếp đồ trong tủ lạnh ngoài phân phối, tỷ lệ hoàn thành được báo cáo khoảng 13,3% với LingBot và 6,7% với π0.5. Nghe như gấp đôi, nhưng cả hai vẫn thất bại trong phần lớn lượt thử. Đây là lý do xem từng nhiệm vụ, độ khó và số bước quan trọng hơn việc chỉ chọn một con số tổng hợp có vẻ ấn tượng.

![Hình 6 từ PDF gốc, trang 8](/paper-figures/lingbot-vla-2/figure-6.webp)

![Hình 9 từ PDF gốc, trang 14](/paper-figures/lingbot-vla-2/figure-9.webp)

![Hình 10 từ PDF gốc, trang 15](/paper-figures/lingbot-vla-2/figure-10.webp)

![Hình 12 từ PDF gốc, trang 16](/paper-figures/lingbot-vla-2/figure-12.webp)

![Hình 13 từ PDF gốc, trang 17](/paper-figures/lingbot-vla-2/figure-13.webp)

## Hạn chế và câu hỏi còn mở

### Giới hạn của giải pháp đa thành phần

Một hệ nhiều thành phần có thể cải thiện tổng thể nhưng khó biết phần nào thật sự tạo khác biệt nếu nhiều thứ đổi cùng lúc. MoE tăng dung lượng tham số nhưng có thêm bài toán định tuyến/chia tải. Video người không tự có lệnh khớp robot. Nhãn độ sâu hoặc đặc trưng tương lai cũng có thể sai khi camera bị che.

Đưa mô hình sang phần cứng mới vẫn cần kiểm tra camera, sơ đồ khớp, mask hành động và thống kê chuẩn hóa. Một vector 55 chiều hợp lệ về mặt phần mềm chưa bảo đảm là lệnh an toàn trên robot thật.

## Liên hệ với nghiên cứu khác

### Liên hệ với GR00T, Open X và RDT

Open X-Embodiment đặt nền cho học trên nhiều loại robot. RDT nghiên cứu bộ sinh hành động phối hợp hai tay có điều kiện từ nhiều tín hiệu. GR00T N1 xây hệ VLM và action expert, tận dụng dữ liệu người/robot đa dạng. LingBot-VLA 2.0 cũng đi theo hướng hệ thống nhưng nhấn mạnh việc tuyển lọc dữ liệu, cấu trúc hành động chuẩn và MoE.

Không nên chỉ hỏi mô hình nào có nhiều tham số nhất. Cần biết nó học từ dữ liệu sạch đến đâu, loại robot thử gì, và các thí nghiệm tách thành phần có chỉ ra nguồn cải thiện hay không.

### Những bài nên đọc tiếp

- [Open X-Embodiment](/paper/open-x-embodiment)
- [GR00T N1](/paper/groot-n1)
- [Qwen-VLA](/paper/qwen-vla)
- [Diffusion Policy](/paper/diffusion-policy)
- [DROID](/paper/droid)

## Đọc mã nguồn và tự kiểm chứng

### Bài kiểm tra hiểu bài trước khi xem code

Hãy vẽ ba robot: cánh tay đơn, robot hai tay và robot di động. Ghi những chiều hành động mà mỗi robot thật sự có. Giải thích vì sao cách biểu diễn 55 chiều cần thông tin loại robot và cách che những phần không dùng.

Tiếp đó chọn một bài toán nhặt cốc và đề xuất ba phép thử: giữ dữ liệu, chỉ thay Dense/MoE; giữ mô hình, chỉ thay cách chuẩn hóa; giữ mọi thứ, chỉ thêm mục tiêu dự đoán đặc trưng tương lai. Nếu có thể diễn đạt rõ từng thử nghiệm kiểm chứng giả thuyết nào, bạn đã hiểu đóng góp quan trọng nhất của LingBot.
