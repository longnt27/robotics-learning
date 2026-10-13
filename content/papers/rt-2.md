## Vì sao cần nghiên cứu này?

Một robot đã học nhặt cốc có thể chưa từng nghe câu “Lấy vật dùng để uống nước”. Trong khi đó, mô hình ảnh–ngôn ngữ được học từ Internet có thể biết chiếc cốc dùng để làm gì. **RT-2 nghiên cứu việc chuyển kiến thức ngữ nghĩa từ mô hình ảnh–ngôn ngữ sang hệ điều khiển robot.** Phương pháp biểu diễn lệnh robot thành token để huấn luyện chung với dữ liệu ảnh và văn bản. Mục tiêu là robot không chỉ lặp lại những câu lệnh đã có demonstration, mà còn nhận ra một số ý nghĩa và vật thể chưa từng được dạy trực tiếp qua dữ liệu robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rt-2/figure-1.webp)


### Tri thức ngôn ngữ giúp robot làm gì?

Robot từng được dạy nhặt cốc, nhưng chưa từng nhận câu “Lấy vật mà tôi có thể uống từ đó”. Một mô hình ảnh–ngôn ngữ học từ web có thể biết chiếc cốc dùng để uống; policy robot biết cách kẹp cốc. **RT-2 tìm cách nối hai loại kiến thức** để robot hiểu những yêu cầu mới mà không phải thu thêm demonstration cho mọi cách diễn đạt.

RT-2 mã hóa lệnh chuyển động dưới dạng token để huấn luyện chung với dữ liệu ảnh và chữ. Điều này khác việc dùng chatbot chỉ nói robot nên làm gì: đầu ra cuối cùng vẫn được giải mã thành lệnh điều khiển vật lý.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

RT-1 học dựa trên ảnh và demonstration robot; trong khi đó mô hình thị giác–ngôn ngữ lớn (VLM) đã học từ lượng ảnh và chữ trên Internet rộng hơn nhiều. RT-2 đặt giả thuyết rằng **kiến thức về đồ vật, công dụng và quan hệ** từ VLM có thể giúp robot hiểu yêu cầu chưa được gắn nhãn trong dữ liệu thao tác.

Chẳng hạn mô hình biết chiếc cốc có thể dùng để uống, nhưng đó mới là kiến thức về ý nghĩa. Nó còn cần học cách di chuyển tới cốc và kẹp đúng vật. Vì vậy phải phân biệt hiểu câu lệnh với khả năng vận động.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ba khái niệm cần phân biệt

**VLM** là mạng học quan hệ giữa hình ảnh và ngôn ngữ. **Token hành động** là mã rời rạc cho lệnh robot, phải giải mã về giá trị liên tục và đúng đơn vị. **Huấn luyện chung** cho mạng học cả dữ liệu web lẫn demonstration robot, dù hai nguồn có nhãn và mục đích khác nhau.

Biết rằng táo là trái cây hoặc cốc dùng để uống không đồng nghĩa biết lực kẹp bao nhiêu. Vì vậy cần phân biệt kiến thức ngữ nghĩa với kỹ năng vận động.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RT-2 tiếp tục huấn luyện các VLM lớn trên **cả dữ liệu ảnh–ngôn ngữ từ web và dữ liệu hành động robot**. Điểm đặc biệt là các giá trị lệnh robot được mã hóa thành token rời rạc, để mạng dự đoán chúng bằng cùng cơ chế dự đoán token văn bản. Khi robot chạy, token được giải mã thành lệnh có đơn vị và hệ tọa độ vật lý.

Giữ dữ liệu web trong huấn luyện giúp tránh việc mô hình chỉ nhớ các câu lệnh robot rồi quên hiểu biết ngữ nghĩa đã học trước. Bộ sinh action không phải một chatbot đứng ngoài điều khiển; kiến thức và lệnh được học chung trong mô hình.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 5](/paper-figures/rt-2/figure-2.webp)


### Một lần điều khiển RT-2 xảy ra như thế nào?

Camera cung cấp ảnh, người dùng cung cấp câu lệnh. Mô hình xử lý ảnh cùng ngôn ngữ, rồi dự đoán một chuỗi token biểu diễn hành động. Bộ giải mã chuyển token thành các giá trị điều khiển phù hợp với robot, chẳng hạn dịch đầu công tác và điều khiển kẹp.

Robot thực hiện một phần lệnh, quan sát lại và tiếp tục. Nếu vật thay đổi vị trí, lệnh sau phải dựa vào ảnh mới. Token sinh bởi RT-2 không phải những câu để đọc cho người nghe; chúng là mã mà bộ điều khiển cần hiểu đúng.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Người dùng bảo robot: **“Bỏ rác vào thùng.”** Các demonstration có thể chỉ dạy robot nhặt và đặt vật, chưa gọi đích danh mọi loại rác. Nhờ kiến thức ảnh–ngôn ngữ, mạng có thể nhận ra lon rỗng hoặc giấy vụn phù hợp với yêu cầu. Sau đó phần học từ robot mới giúp nó sinh lệnh gắp và đưa vật vào thùng.

Nếu lon có hình dạng mới khiến gripper kẹp trượt, robot vẫn thất bại dù đã nhận biết đúng. Đây là ranh giới giữa **chuyển giao tri thức ngữ nghĩa** và **khả năng điều khiển vật lý**.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 7](/paper-figures/rt-2/figure-3.webp)
![Hình 5 từ PDF gốc, trang 9](/paper-figures/rt-2/figure-5.webp)
![Hình 7 từ PDF gốc, trang 11](/paper-figures/rt-2/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ “lấy đồ uống được” trên bàn

Cùng một bàn có cốc, đĩa và đồ chơi. Người dùng yêu cầu “Nhặt vật để uống nước”. Robot phải dùng kiến thức về công dụng để chọn cốc, rồi mới giải quyết việc đi tới, kẹp và nhấc lên. Nếu robot nhận đúng cốc nhưng đánh rơi, lỗi nằm ở vận động chứ không nhất thiết do hiểu ngôn ngữ.

Nếu nó kẹp một chiếc bát sai mục tiêu, vấn đề có thể nằm ở việc nối câu lệnh với vật thể. Tách hai lỗi giúp đọc RT-2 đúng hơn thay vì gom mọi thất bại thành “mô hình không thông minh”.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

RT-2 tiếp tục làm được các nhiệm vụ thao tác đã học, đồng thời có lợi thế trong một số thử nghiệm về **đồ vật mới, cách nói mới và suy luận ngữ nghĩa**. Nhóm tác giả báo cáo các nhóm bài kiểm tra có kết quả tốt hơn đáng kể, thậm chí hơn nhiều lần so với một số phương pháp đối chứng trong đúng thiết lập nghiên cứu.

Những ví dụ chọn vật theo công dụng thay vì tên gọi cụ thể cho thấy dữ liệu web có thể hỗ trợ robot. Tuy vậy phạm vi phép thử vẫn hữu hạn. Không nên xem kết quả ấy là bằng chứng robot đã hiểu mọi câu nói hoặc làm được mọi kỹ năng vật lý mới.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 8](/paper-figures/rt-2/figure-4.webp)
![Hình 6 từ PDF gốc, trang 10](/paper-figures/rt-2/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc các mức khái quát trong kết quả

RT-2 được thử trên nhiệm vụ đã học và những tình huống mới về đồ vật, nền, môi trường hoặc yêu cầu ngữ nghĩa. Hình 6 còn tách ảnh hưởng của quy mô mô hình và cách huấn luyện. Khi đọc, cần phân biệt dữ liệu robot chưa từng có thao tác tương ứng với dữ liệu web có thể đã từng chứa khái niệm ấy.

Một con số thành công cao trong một nhóm bài kiểm tra chưa có nghĩa mô hình có thể giải mọi câu lệnh chưa thấy. Phải xem từng dạng mới được đánh giá.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Hiểu được mục đích trong lời nói không tự tạo ra kỹ năng vận động chưa có trong demonstration. Mô hình ảnh–ngôn ngữ lớn cũng gây chi phí tính toán và độ trễ khi robot cần phát lệnh nhanh. Việc chia action liên tục thành token rời rạc có thể gây sai số; dự đoán tuần tự nhiều token còn làm chậm hơn.

Các phép thử về suy luận mới thường do nhóm tác giả thiết kế cho một số tình huống cụ thể. Vì thế RT-2 có bằng chứng mạnh về **chuyển giao ngữ nghĩa**, nhưng chưa chứng minh mọi loại kẹp, lực tiếp xúc và phần cứng mới đều hoạt động tốt.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn của cách biến hành động thành token

Token chỉ giúp mô hình dùng chung một cách biểu diễn, không tự bảo đảm an toàn cho robot. Nếu đổi sang robot có số khớp khác, cùng các mã số có thể không còn ý nghĩa như cũ. Độ trễ suy luận, góc camera bị che và vật thể biến dạng vẫn là các trở ngại vật lý.

Vì thế checkpoint VLM mạnh về ảnh/ngôn ngữ chưa chắc phù hợp ngay với robot đích; cần xác minh action space và thực hiện kiểm tra từng bước trước khi chạy thật.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-1](/paper/rt-1)
- [OpenVLA](/paper/openvla)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### RT-2 khác PaLM-E, RT-1 và OpenVLA

RT-1 chứng minh khả năng học nhiều thao tác từ dữ liệu robot. PaLM-E đưa quan sát vào suy luận đa phương thức, thường ở mức kế hoạch. RT-2 kết hợp token hành động và dữ liệu ảnh–ngôn ngữ trong một mạng. OpenVLA tiếp tục phát triển hướng VLA có checkpoint nguồn mở, có thể tinh chỉnh cho robot mới.

Đọc các bài này không nên xếp hạng bằng số tham số. Cần hỏi mạng tạo câu trả lời, kế hoạch cấp cao hay lệnh vận động trực tiếp; dữ liệu và robot thử khác nhau thế nào.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Hãy lấy một vector hành động robot bảy chiều, chia mỗi chiều thành các mức rời rạc rồi mã hóa thành token. Giải mã ngược, đo sai số so với giá trị ban đầu khi số mức tăng/giảm. Nhờ vậy có thể hiểu đánh đổi giữa biểu diễn thuận tiện và độ chính xác điều khiển.

Tiếp theo thử một bài chọn vật theo công dụng với các câu lệnh khác nhau, giữ nguyên cảnh và bộ điều khiển. Ghi riêng vật được chọn đúng hay sai và robot có gắp được hay không. Hai chỉ số này giúp phân biệt vấn đề ngôn ngữ với vấn đề vận động.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự kiểm tra bằng ba câu lệnh

Giữ nguyên cảnh, lần lượt yêu cầu “nhặt cốc”, “nhặt vật đựng nước” và “nhặt cốc đỏ”. So sánh vật được chọn. Sau đó giữ câu lệnh, thay vị trí đồ vật để xem model có bám vào camera hay chỉ nhớ tọa độ.

Cuối cùng kiểm tra các token hành động được giải mã bằng cách nào, có chuẩn hóa ngược không và có đúng hệ tọa độ robot không. Đây là phần cần hiểu trước khi nghĩ tới chạy RT-2 trên thiết bị thật.

<!-- END EXTENDED WALKTHROUGH -->

