## Vì sao cần nghiên cứu này?

### Tri thức ngôn ngữ giúp robot làm gì?

Robot từng được dạy nhặt cốc, nhưng chưa từng nhận câu “Lấy vật mà tôi có thể uống từ đó”. Một mô hình ảnh–ngôn ngữ học từ web có thể biết chiếc cốc dùng để uống; chính sách điều khiển robot biết cách kẹp cốc. **RT-2 tìm cách nối hai loại kiến thức** để robot hiểu những yêu cầu mới mà không phải thu thêm lượt thao tác mẫu cho mọi cách diễn đạt.

RT-2 mã hóa lệnh chuyển động dưới dạng token để huấn luyện chung với dữ liệu ảnh và chữ. Điều này khác việc dùng chatbot chỉ nói robot nên làm gì: đầu ra cuối cùng vẫn được giải mã thành lệnh điều khiển vật lý.

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rt-2/figure-1.webp)

## Kiến thức nền cần nắm

### Ba khái niệm cần phân biệt

**VLM** là mạng học quan hệ giữa hình ảnh và ngôn ngữ. **Token hành động** là mã rời rạc cho lệnh robot, phải giải mã về giá trị liên tục và đúng đơn vị. **Huấn luyện chung** cho mạng học cả dữ liệu web lẫn lượt thao tác mẫu robot, dù hai nguồn có nhãn và mục đích khác nhau.

Biết rằng táo là trái cây hoặc cốc dùng để uống không đồng nghĩa biết lực kẹp bao nhiêu. Vì vậy cần phân biệt kiến thức ngữ nghĩa với kỹ năng vận động.

## Phương pháp thực hiện

### Một lần điều khiển RT-2 xảy ra như thế nào?

Camera cung cấp ảnh, người dùng cung cấp câu lệnh. Mô hình xử lý ảnh cùng ngôn ngữ, rồi dự đoán một chuỗi token biểu diễn hành động. Bộ giải mã chuyển token thành các giá trị điều khiển phù hợp với robot, chẳng hạn dịch đầu công tác và điều khiển kẹp.

Robot thực hiện một phần lệnh, quan sát lại và tiếp tục. Nếu vật thay đổi vị trí, lệnh sau phải dựa vào ảnh mới. Token sinh bởi RT-2 không phải những câu để đọc cho người nghe; chúng là mã mà bộ điều khiển cần hiểu đúng.

![Hình 2 gốc từ PDF bài báo, trang 5](/paper-figures/rt-2/figure-2.webp)

## Ví dụ từng bước

### Ví dụ “lấy đồ uống được” trên bàn

Cùng một bàn có cốc, đĩa và đồ chơi. Người dùng yêu cầu “Nhặt vật để uống nước”. Robot phải dùng kiến thức về công dụng để chọn cốc, rồi mới giải quyết việc đi tới, kẹp và nhấc lên. Nếu robot nhận đúng cốc nhưng đánh rơi, lỗi nằm ở vận động chứ không nhất thiết do hiểu ngôn ngữ.

Nếu nó kẹp một chiếc bát sai mục tiêu, vấn đề có thể nằm ở việc nối câu lệnh với vật thể. Tách hai lỗi giúp đọc RT-2 đúng hơn thay vì gom mọi thất bại thành “mô hình không thông minh”.

![Hình 3 từ PDF gốc, trang 7](/paper-figures/rt-2/figure-3.webp)

![Hình 5 từ PDF gốc, trang 9](/paper-figures/rt-2/figure-5.webp)

![Hình 7 từ PDF gốc, trang 11](/paper-figures/rt-2/figure-7.webp)

## Kết quả thực nghiệm

### Đọc các mức khái quát trong kết quả

RT-2 được thử trên nhiệm vụ đã học và những tình huống mới về đồ vật, nền, môi trường hoặc yêu cầu ngữ nghĩa. Hình 6 còn tách ảnh hưởng của quy mô mô hình và cách huấn luyện. Khi đọc, cần phân biệt dữ liệu robot chưa từng có thao tác tương ứng với dữ liệu web có thể đã từng chứa khái niệm ấy.

Một con số thành công cao trong một nhóm bài kiểm tra chưa có nghĩa mô hình có thể giải mọi câu lệnh chưa thấy. Phải xem từng dạng mới được đánh giá.



### Số liệu và phạm vi kết luận

**Đối chiếu số liệu:** RT-2 không nhất thiết vượt RT-1 rất xa trên những công việc đã thấy; lợi thế nổi bật nằm ở việc xử lý vật mới, chỉ dẫn mới và suy luận dựa vào kiến thức ngữ nghĩa. Trong một số nhóm thử, báo cáo ghi nhận mức cải thiện gấp nhiều lần so với mô hình đối chứng, nhưng đó là nhóm nhiệm vụ được thiết kế riêng chứ không đại diện toàn bộ robot. Khi xem Hình 4–6, hãy xác định rõ điểm số thuộc loại câu hỏi nào: nhận đúng vật, hiểu quan hệ hay hoàn thành chuyển động.

![Hình 4 từ PDF gốc, trang 8](/paper-figures/rt-2/figure-4.webp)

![Hình 6 từ PDF gốc, trang 10](/paper-figures/rt-2/figure-6.webp)

## Hạn chế và câu hỏi còn mở

### Giới hạn của cách biến hành động thành token

Token chỉ giúp mô hình dùng chung một cách biểu diễn, không tự bảo đảm an toàn cho robot. Nếu đổi sang robot có số khớp khác, cùng các mã số có thể không còn ý nghĩa như cũ. Độ trễ suy luận, góc camera bị che và vật thể biến dạng vẫn là các trở ngại vật lý.

Vì thế bản mô hình đã lưu VLM mạnh về ảnh/ngôn ngữ chưa chắc phù hợp ngay với robot đích; cần xác minh action space và thực hiện kiểm tra từng bước trước khi chạy thật.

## Liên hệ với nghiên cứu khác

### RT-2 khác PaLM-E, RT-1 và OpenVLA

RT-1 chứng minh khả năng học nhiều thao tác từ dữ liệu robot. PaLM-E đưa quan sát vào suy luận đa phương thức, thường ở mức kế hoạch. RT-2 kết hợp token hành động và dữ liệu ảnh–ngôn ngữ trong một mạng. OpenVLA tiếp tục phát triển hướng VLA có bản mô hình đã lưu nguồn mở, có thể tinh chỉnh cho robot mới.

Đọc các bài này không nên xếp hạng bằng số tham số. Cần hỏi mạng tạo câu trả lời, kế hoạch cấp cao hay lệnh vận động trực tiếp; dữ liệu và robot thử khác nhau thế nào.

### Những bài nên đọc tiếp

- [RT-1](/paper/rt-1)
- [OpenVLA](/paper/openvla)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc mã nguồn và tự kiểm chứng

### Tự kiểm tra bằng ba câu lệnh

Giữ nguyên cảnh, lần lượt yêu cầu “nhặt cốc”, “nhặt vật đựng nước” và “nhặt cốc đỏ”. So sánh vật được chọn. Sau đó giữ câu lệnh, thay vị trí đồ vật để xem mô hình có bám vào camera hay chỉ nhớ tọa độ.

Cuối cùng kiểm tra các token hành động được giải mã bằng cách nào, có chuẩn hóa ngược không và có đúng hệ tọa độ robot không. Đây là phần cần hiểu trước khi nghĩ tới chạy RT-2 trên thiết bị thật.
