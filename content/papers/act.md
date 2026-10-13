## Vì sao cần nghiên cứu này?

### Vì sao thao tác hai tay khó hơn nhiều so với một tay?

Hình dung robot một tay giữ túi nilon, tay kia kéo miệng túi để mở. Nếu mỗi lần mạng chỉ nghĩ tới đúng một lệnh, hai tay rất dễ lệch nhịp: tay trái buông quá sớm hoặc tay phải kéo khi túi chưa được giữ chắc. Sai lệch nhỏ làm vật trượt, kẹt hoặc biến dạng. ACT khắc phục một phần bằng cách **dự đoán trước cả một đoạn chuyển động**, để các bước liên tiếp phối hợp được với nhau.

Bài báo còn giới thiệu ALOHA, hệ thống để người vận hành trực tiếp hai tay robot với chi phí tương đối thấp. ALOHA giúp thu dữ liệu động tác của người; ACT là mô hình học lại những động tác ấy. Đừng nhầm phần cứng thu dữ liệu với thuật toán điều khiển.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/act/figure-1.webp)

![Hình 4 từ PDF gốc, trang 4](/paper-figures/act/figure-4.webp)

## Kiến thức nền cần nắm

### Những khái niệm cần biết trước khi đọc sơ đồ

**Action chunking** là dự đoán nhiều lệnh liên tiếp thay vì lệnh kế tiếp duy nhất. **Transformer** học mối quan hệ giữa ảnh, trạng thái khớp và các thời điểm trong đoạn chuyển động. **CVAE** dùng biến ẩn z để học sự khác nhau giữa những lần làm mẫu đều thành công, chẳng hạn người này mở túi nhanh hơn người kia.

**Temporal ensembling** kết hợp các dự đoán ở những lần quan sát khác nhau nhưng cùng hướng tới một thời điểm thực thi, nhằm giảm độ giật khi cập nhật lệnh. Nó không có nghĩa lấy trung bình tùy tiện hai cách đi hoàn toàn đối lập. Ba phần này giải ba vấn đề riêng: action chunking học thứ tự phối hợp giữa các bước; CVAE biểu diễn những cách làm mẫu khác nhau; còn temporal ensembling giúp các lần dự đoán mới nối với nhau êm hơn.


### Vì sao dự đoán mười bước không có nghĩa robot sẽ chạy mù mười bước?

Hãy tách **đoạn mô hình dự đoán** khỏi **lệnh cuối cùng được gửi tới động cơ**. Một lần dự đoán có thể đề xuất nhiều vị trí khớp trong tương lai; lần quan sát sau lại đưa ra một đoạn mới chồng lên phần trước. Robot có thể kết hợp các gợi ý cho thời điểm hiện tại. Do đó action chunking không đơn giản là “lập kế hoạch xong rồi tắt camera”. Vấn đề khó là giữ những dự đoán đủ nhất quán để tay trái không đổi ý giữa lúc tay phải đang kéo túi.

## Phương pháp thực hiện

### ACT học và sinh lệnh robot như thế nào?

**Khi huấn luyện**, dữ liệu có ảnh camera, vị trí các khớp và chuỗi hành động do người điều khiển thực hiện. Bộ mã hóa CVAE nhìn chuỗi lệnh mẫu để tạo z, rồi bộ giải mã cùng Transformer dùng ảnh, trạng thái và z để dự đoán lại đoạn chuyển động. Từ đó mô hình học cách các bước hành động có liên hệ.

**Khi chạy thật**, không có sẵn chuỗi tương lai của người. Bộ mã hóa CVAE được bỏ đi, z thường đặt bằng 0; chính sách điều khiển nhận ảnh và trạng thái robot rồi sinh đoạn hành động. Những dự đoán chồng nhau có thể được tổng hợp theo trọng số trước khi phát lệnh. Đây là lý do sơ đồ có hai nhánh huấn luyện và thực thi: không phải mọi thành phần đều cần chạy trên robot.


### CVAE học lúc nào, biến z đi đâu khi chạy thật?

Trong dữ liệu có thể có hai lần mở túi đều thành công: một người kéo đều tay, người kia kéo chậm rồi tăng tốc. Khi huấn luyện, bộ mã hóa nhìn **chuỗi hành động mẫu** để suy ra biến ẩn z và giúp bộ giải mã tái tạo nhiều kiểu chuyển động. Khi chạy, robot không biết trước chuỗi tương lai nên không thể dùng đúng bộ mã hóa ấy; ACT thường đặt z bằng 0. Đó không phải lỗi thiếu dữ liệu đầu vào, mà là sự khác nhau có chủ đích giữa học và thực thi. Ảnh camera cùng vị trí khớp hiện tại vẫn được đưa vào bộ sinh hành động.

![Hình 3 gốc từ PDF bài báo, trang 3](/paper-figures/act/figure-3.webp)

![Hình 5 từ PDF gốc, trang 5](/paper-figures/act/figure-5.webp)

## Ví dụ từng bước

### Theo dõi một nhiệm vụ mở túi có khóa kéo

Robot dùng tay trái ghì túi, tay phải cầm miệng túi. Hai tay phải di chuyển cùng nhịp: tay trái giữ căng trong lúc tay phải kéo. Khi sinh cả đoạn hành động, ACT có cơ hội học chuỗi giữ–kéo thay vì quyết định từng tay một cách rời rạc.

Giả sử ngón kẹp tay phải bị trượt trước khi kéo. Nếu robot cứ phát tiếp các lệnh trong đoạn cũ, thao tác sẽ thất bại. Khi có quan sát mới, chính sách điều khiển cần điều chỉnh ở lần dự đoán tiếp theo. Ví dụ này cho thấy chunking giúp giữ sự nhất quán nhưng không thay thế nhu cầu quan sát và sửa sai.

![Hình 7 từ PDF gốc, trang 7](/paper-figures/act/figure-7.webp)

## Kết quả thực nghiệm

### Những thí nghiệm nào chứng minh từng thành phần có ích?

Hình 9 kiểm tra các ý tưởng riêng rẽ: thêm action chunking vào mô hình khác, dùng hoặc không dùng temporal ensembling, và có hoặc bỏ phần huấn luyện CVAE. Chunking giúp cả hai phương pháp đối chứng được thử. Ensembling giúp một số chính sách điều khiển nhưng khiến VINN kém hơn, nên không phải cứ thêm vào là tốt. Khi bỏ CVAE, kết quả học từ dữ liệu con người giảm trong thiết lập được thử.

Bài báo còn khảo sát tốc độ điều khiển từ xa: giảm tần số người ra lệnh từ 50 Hz xuống 5 Hz kéo dài thời gian hoàn thành. Đó là minh chứng rằng thời gian và sự phối hợp chuyển động là thành phần thật của bài toán, không chỉ là một chỉ số GPU.



### Điểm phần trăm không phải lời hứa cho mọi thao tác

Trên một số nhiệm vụ mô phỏng, khoảng cách so với phương pháp đối chứng tốt tiếp theo được báo cáo lên tới 59, 49 hoặc 29 điểm phần trăm trong các thiết lập tương ứng. Không nên dùng những con số ấy như kết quả mặc định của ACT. Hình 9 cho biết điều gì xảy ra khi thay độ dài đoạn dự đoán, bật/tắt tổng hợp hành động chồng nhau hoặc bỏ CVAE. Một số nhiệm vụ được thu bằng khoảng 10–20 phút lần làm mẫu, nhưng lượng dữ liệu cần thiết vẫn thay đổi mạnh theo độ khó.


### Đừng nhầm tác dụng của chunking với tác dụng của CVAE

Hình 9 có nhiều phép so khác nhau, không phải một đường biểu diễn “ACT tốt hơn”. Thêm chunking vào một phương pháp khác kiểm tra giá trị của việc dự đoán theo đoạn. Bỏ CVAE kiểm tra việc học các biến thể thao tác. Bật hoặc tắt temporal ensembling kiểm tra độ lợi của cách nối các dự đoán. Nếu một thay đổi giúp ACT nhưng làm VINN kém đi, kết luận phải gắn với đúng mô hình và nhiệm vụ, chứ không thể nói đó là quy tắc chung cho mọi robot.

![Hình 6 từ PDF gốc, trang 5](/paper-figures/act/figure-6.webp)

![Hình 8 từ PDF gốc, trang 8](/paper-figures/act/figure-8.webp)

![Hình 9 từ PDF gốc, trang 11](/paper-figures/act/figure-9.webp)

## Hạn chế và câu hỏi còn mở

### ACT chưa giải quyết được những gì?

Một đoạn hành động dài có thể mượt nhưng không kịp phản ứng nếu vật bị đổi vị trí hoặc robot cầm hụt. Khi mạng tính đoạn mới chậm, robot vẫn có nguy cơ phải dừng để chờ. Đây là vấn đề các nghiên cứu RTC xử lý, chứ không phải một tính năng tự động có được từ chunking.

Mô hình cũng bị giới hạn bởi dữ liệu do người vận hành thu: một động tác không từng được biểu diễn đầy đủ thì khó bắt chước chính xác. Độ trễ camera, lực kẹp và cấu trúc khớp mới có thể làm chính sách điều khiển thất bại dù lỗi dự đoán trên dữ liệu ghi sẵn nhỏ.

## Liên hệ với nghiên cứu khác

### ACT khác Diffusion Policy và RTC ở chỗ nào?

ACT và Diffusion Policy đều sinh đoạn hành động. ACT sử dụng Transformer và CVAE; Diffusion Policy bắt đầu từ chuỗi nhiễu rồi chỉnh thành chuyển động hợp lệ. Cả hai đều cố tránh hiện tượng dự đoán từng bước làm chuyển động giật hoặc mất nhất quán.

RTC giải tầng thực thi: mô hình mất thời gian sinh đoạn tiếp theo thì robot có phải đứng chờ không, và đoạn mới nối vào đoạn cũ như thế nào? Nhìn ba bài như ba câu hỏi về **học chuyển động, sinh chuyển động và thực thi liên tục** giúp hiểu mối liên hệ giữa chúng.

### Những bài nên đọc tiếp

- [RTC (suy luận)](/paper/rtc-inference)
- [RTC (huấn luyện)](/paper/rtc-training)

## Đọc mã nguồn và tự kiểm chứng

### Tự kiểm tra bằng một bảng ba cột

Hãy lập bảng gồm quan sát hiện tại, chuỗi lệnh dự đoán và lệnh robot đang chạy. Thêm trường hợp tay phải trượt khỏi túi giữa một đoạn. Đánh dấu những lệnh nên hủy hoặc cập nhật. Bài tập này giải thích vì sao không thể chỉ nhìn một đoạn video mượt để kết luận chính sách điều khiển có phản hồi tốt.

Sau đó trả lời ba câu: CVAE làm gì trong lúc học? Bộ mã hóa CVAE có còn chạy khi điều khiển robot không? Temporal ensembling có luôn cải thiện mọi chính sách điều khiển không?
