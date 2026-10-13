## Vì sao cần nghiên cứu này?

Một robot có hai tay muốn mở túi, lắp linh kiện hoặc gấp vải phải phối hợp cả hai tay đúng thời điểm. Nếu cứ dự đoán một lệnh rồi mới nghĩ đến lệnh kế tiếp, những sai lệch rất nhỏ có thể tích lũy: một tay đã kéo nhưng tay kia chưa giữ chắc, thế là thao tác hỏng. Thu dữ liệu người điều khiển cho các công việc này cũng khá tốn kém. **ACT đề xuất cho mô hình dự đoán cả một đoạn hành động liên tiếp thay vì từng bước riêng lẻ.** Cùng với hệ thống thu dữ liệu ALOHA, công trình kiểm tra liệu robot có thể học các thao tác hai tay tinh vi từ số số lượt thao tác mẫu tương đối ít hay không.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 4](/paper-figures/act/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/act/figure-1.webp)


### Vì sao thao tác hai tay khó hơn nhiều so với một tay?

Hình dung robot một tay giữ túi nilon, tay kia kéo miệng túi để mở. Nếu mỗi lần mạng chỉ nghĩ tới đúng một lệnh, hai tay rất dễ lệch nhịp: tay trái buông quá sớm hoặc tay phải kéo khi túi chưa được giữ chắc. Sai lệch nhỏ làm vật trượt, kẹt hoặc biến dạng. ACT khắc phục một phần bằng cách **dự đoán trước cả một đoạn chuyển động**, để các bước liên tiếp phối hợp được với nhau.

Bài báo còn giới thiệu ALOHA, hệ thống để người vận hành trực tiếp hai tay robot với chi phí tương đối thấp. ALOHA giúp thu dữ liệu động tác của người; ACT là mô hình học lại những động tác ấy. Đừng nhầm phần cứng thu dữ liệu với thuật toán điều khiển.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Ở tần số **50 Hz**, robot phải phát 50 lệnh trong mỗi giây. Nếu hai tay chỉ dự đoán từng lệnh rời rạc, những sai lệch nhỏ dễ tích lũy. **Action chunking (dự đoán hành động theo đoạn)** cho mạng sinh một chuỗi lệnh liên tiếp thay vì từng lệnh rời rạc. Nhờ vậy hai tay có thể học phối hợp các bước giữ, kéo và thả đúng nhịp.

**CVAE** giúp học sự đa dạng giữa những lần người thực hiện cùng nhiệm vụ. Biến ẩn z có thể biểu diễn kiểu kéo nhanh/chậm hoặc vị trí cầm khác nhau. **Temporal ensembling** kết hợp những dự đoán chồng nhau cho cùng thời điểm để giảm rung, nhưng không nên hiểu là phép lấy trung bình tùy tiện giữa hai đường đi đối lập.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những khái niệm cần biết trước khi đọc sơ đồ

**Action chunking** là dự đoán nhiều lệnh liên tiếp thay vì lệnh kế tiếp duy nhất. **Transformer** học mối quan hệ giữa ảnh, trạng thái khớp và các thời điểm trong đoạn chuyển động. **CVAE** dùng biến ẩn z để học sự khác nhau giữa những demonstration đều thành công, chẳng hạn người này mở túi nhanh hơn người kia.

**Temporal ensembling** là kết hợp các dự đoán bị chồng ở cùng một thời điểm để chuyển động mượt hơn. Nó không có nghĩa lấy trung bình tùy tiện hai cách đi hoàn toàn đối lập. Điểm quan trọng nhất là phân biệt ba công dụng: chunking giữ sự phối hợp theo thời gian, CVAE biểu diễn độ đa dạng demonstration, còn ensembling giảm dao động khi thực thi.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

**ALOHA** là hệ thống người điều khiển hai tay robot từ xa, ghi lại ảnh, trạng thái khớp và lệnh chuyển động khoảng 50 Hz. **ACT (Action Chunking with Transformers)** học từ các bản ghi đó và dự đoán một đoạn hành động liên tiếp thay vì một lệnh.

Trong huấn luyện, CVAE mã hóa những khác biệt giữa các chuỗi thao tác mẫu vào biến ẩn. Transformer kết hợp ảnh, trạng thái robot và biến ẩn để dự đoán cả đoạn. Khi thực thi, mạng sinh các đoạn hành động kế tiếp từ ảnh và trạng thái mới. Những đoạn dự đoán tại các thời điểm khác nhau có thể chồng lên nhau; **temporal ensembling** kết hợp các dự đoán cho cùng một thời điểm để giảm rung. Chính việc phải nối những đoạn được sinh ở thời điểm khác nhau dẫn đến các vấn đề sau này RTC nghiên cứu.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 5](/paper-figures/act/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 3 gốc từ PDF bài báo, trang 3](/paper-figures/act/figure-3.webp)


### ACT học và sinh lệnh robot như thế nào?

**Khi huấn luyện**, dữ liệu có ảnh camera, vị trí các khớp và chuỗi hành động do người điều khiển thực hiện. Bộ mã hóa CVAE nhìn chuỗi lệnh mẫu để tạo z, rồi bộ giải mã cùng Transformer dùng ảnh, trạng thái và z để dự đoán lại đoạn chuyển động. Từ đó mô hình học cách các bước hành động có liên hệ.

**Khi chạy thật**, không có sẵn chuỗi tương lai của người. Bộ mã hóa CVAE được bỏ đi, z thường đặt bằng 0; chính sách điều khiển nhận ảnh và trạng thái robot rồi sinh đoạn hành động. Những dự đoán chồng nhau có thể được tổng hợp theo trọng số trước khi phát lệnh. Đây là lý do sơ đồ có hai nhánh huấn luyện và thực thi: không phải mọi thành phần đều cần chạy trên robot.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot dùng hai tay cầm mép áo và kéo căng. Nếu tay phải kéo trước khi tay trái giữ chắc, vải sẽ lệch. ACT dự đoán một chuỗi lệnh liên quan nhau để cả hai tay giữ nhịp phối hợp.

Khi có ảnh mới, mô hình có thể tạo một đoạn dự đoán khác nhưng một số thời điểm hành động đã có trong đoạn cũ. Temporal ensembling kết hợp các dự đoán ấy với trọng số phù hợp. Nếu hai đoạn chọn hướng hoàn toàn trái nhau, phép kết hợp vẫn có thể tạo lệnh không hợp lý; nếu kết quả mới đến chậm, chỗ nối còn có thể giật.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 7 từ PDF gốc, trang 7](/paper-figures/act/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Theo dõi một nhiệm vụ mở túi có khóa kéo

Robot dùng tay trái ghì túi, tay phải cầm miệng túi. Hai tay phải di chuyển cùng nhịp: tay trái giữ căng trong lúc tay phải kéo. Khi sinh cả đoạn hành động, ACT có cơ hội học chuỗi giữ–kéo thay vì quyết định từng tay một cách rời rạc.

Giả sử ngón kẹp tay phải bị trượt trước khi kéo. Nếu robot cứ phát tiếp các lệnh trong đoạn cũ, thao tác sẽ thất bại. Khi có quan sát mới, chính sách điều khiển cần điều chỉnh ở lần dự đoán tiếp theo. Ví dụ này cho thấy chunking giúp giữ sự nhất quán nhưng không thay thế nhu cầu quan sát và sửa sai.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

ACT đạt kết quả tốt trong mô phỏng lẫn nhiệm vụ hai tay ngoài đời so với các phương pháp học bắt chước được thử. Trong một số thiết lập mô phỏng, chênh lệch tỷ lệ thành công lên tới **59, 49 và 29 điểm phần trăm**. Đây là kết quả của những nhiệm vụ cụ thể, không phải mức cải thiện cố định.

Các **thí nghiệm loại bỏ từng thành phần** cho thấy việc dự đoán theo đoạn rất quan trọng; bỏ CVAE cũng khiến hiệu quả học từ lượt thao tác mẫu do người thực hiện giảm đáng kể. Với một số nhiệm vụ trong nghiên cứu, khoảng **10–20 phút người điều khiển làm mẫu** đã đủ thu dữ liệu để huấn luyện. Đây là kết quả của thiết lập ALOHA và những nhiệm vụ được thử, không phải mức dữ liệu tối thiểu cho mọi thao tác hai tay.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 5](/paper-figures/act/figure-6.webp)
![Hình 8 từ PDF gốc, trang 8](/paper-figures/act/figure-8.webp)
![Hình 9 từ PDF gốc, trang 11](/paper-figures/act/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những thí nghiệm nào chứng minh từng thành phần có ích?

Hình 9 kiểm tra các ý tưởng riêng rẽ: thêm action chunking vào mô hình khác, dùng hoặc không dùng temporal ensembling, và có hoặc bỏ phần huấn luyện CVAE. Chunking giúp cả hai phương pháp đối chứng được thử. Ensembling giúp một số chính sách điều khiển nhưng khiến VINN kém hơn, nên không phải cứ thêm vào là tốt. Khi bỏ CVAE, kết quả học từ dữ liệu con người giảm trong thiết lập được thử.

Bài báo còn khảo sát tốc độ điều khiển từ xa: giảm tần số người ra lệnh từ 50 Hz xuống 5 Hz kéo dài thời gian hoàn thành. Đó là minh chứng rằng thời gian và sự phối hợp chuyển động là thành phần thật của bài toán, không chỉ là một chỉ số GPU.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Hạn chế phần cứng:** ALOHA chưa phù hợp với mọi thao tác cần lực lớn, nhiều ngón hoặc tiếp xúc phức tạp với vật mềm. Một số nhiệm vụ mở túi, màng bọc hoặc khóa kéo vẫn thất bại dù robot làm được các bước nhặt và kéo đơn giản.

**Đánh đổi của hành động chunking:** đoạn dài giúp động tác nhất quán hơn nhưng có thể giảm khả năng phản ứng khi vật thay đổi. Kết hợp dự đoán chồng nhau cũng không phải lúc nào có lợi. ACT chủ yếu giải bài toán vận động từ lượt thao tác mẫu, không phải mô hình VLA tổng quát có thể hiểu mọi câu lệnh hay điều khiển mọi cấu hình robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### ACT chưa giải quyết được những gì?

Một đoạn hành động dài có thể mượt nhưng không kịp phản ứng nếu vật bị đổi vị trí hoặc robot cầm hụt. Khi mạng tính đoạn mới chậm, robot vẫn có nguy cơ phải dừng để chờ. Đây là vấn đề các nghiên cứu RTC xử lý, chứ không phải một tính năng tự động có được từ chunking.

Mô hình cũng bị giới hạn bởi dữ liệu do người vận hành thu: một động tác không từng được biểu diễn đầy đủ thì khó bắt chước chính xác. Độ trễ camera, lực kẹp và cấu trúc khớp mới có thể làm chính sách điều khiển thất bại dù lỗi dự đoán offline nhỏ.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RTC (inference)](/paper/rtc-inference)
- [RTC (training)](/paper/rtc-training)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### ACT khác Diffusion Policy và RTC ở chỗ nào?

ACT và Diffusion Policy đều sinh đoạn hành động. ACT sử dụng Transformer và CVAE; Diffusion Policy bắt đầu từ chuỗi nhiễu rồi chỉnh thành chuyển động hợp lệ. Cả hai đều cố tránh hiện tượng dự đoán từng bước làm chuyển động giật hoặc mất nhất quán.

RTC giải tầng thực thi: mô hình mất thời gian sinh đoạn tiếp theo thì robot có phải đứng chờ không, và đoạn mới nối vào đoạn cũ như thế nào? Nhìn ba bài như ba câu hỏi về **học chuyển động, sinh chuyển động và thực thi liên tục** giúp hiểu mối liên hệ giữa chúng.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Chọn một nhiệm vụ ALOHA mô phỏng và so các đoạn hành động dài **10, 50 và 100 bước**, có hoặc không có temporal ensembling. Đo tỷ lệ hoàn thành, độ giật của lệnh và thời gian mô hình sinh đoạn mới. Giữ nguyên dữ liệu để phép so có ý nghĩa.

Nếu đoạn dài làm robot mượt nhưng không phản ứng kịp khi vật bị dịch chuyển, hãy ghi rõ sự đánh đổi. **Tự kiểm tra:** CVAE dùng để làm gì khi huấn luyện, tại sao không cần chuỗi lượt thao tác mẫu tương lai khi robot chạy, và vì sao chồng đoạn chưa giải quyết hết độ trễ?

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự kiểm tra bằng một bảng ba cột

Hãy lập bảng gồm quan sát hiện tại, chuỗi lệnh dự đoán và lệnh robot đang chạy. Thêm trường hợp tay phải trượt khỏi túi giữa một đoạn. Đánh dấu những lệnh nên hủy hoặc cập nhật. Bài tập này giải thích vì sao không thể chỉ nhìn một đoạn video mượt để kết luận chính sách điều khiển có phản hồi tốt.

Sau đó trả lời ba câu: CVAE làm gì trong lúc học? Bộ mã hóa CVAE có còn chạy khi điều khiển robot không? Temporal ensembling có luôn cải thiện mọi chính sách điều khiển không?

<!-- END EXTENDED WALKTHROUGH -->

