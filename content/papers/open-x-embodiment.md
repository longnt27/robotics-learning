## Vì sao cần nghiên cứu này?

### Vì sao gom dữ liệu nhiều robot khó hơn gom ảnh?

Một ảnh chiếc cốc có thể được dùng để dạy nhiều loại mô hình nhìn ảnh. Nhưng lệnh “dịch khớp số 3 thêm 0,1” không có cùng ý nghĩa trên hai tay máy khác nhau. Robot A dùng kẹp hai ngón, robot B có bàn tay nhiều khớp; số chiều và đơn vị lệnh cũng khác. **Open X-Embodiment tìm cách kết hợp lượt thao tác mẫu từ nhiều hệ robot** để chính sách học được điều chung mà không nhầm lệnh của chúng.

Điểm chính của công trình là dữ liệu đa tổ chức và kiểm tra khả năng chuyển giữa robot, không chỉ là thêm một tập dữ liệu thật lớn.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/open-x-embodiment/figure-1.webp)

## Kiến thức nền cần nắm

### Các thuật ngữ cần hiểu

**Embodiment** là cấu trúc vật lý robot: số khớp, camera, kiểu kẹp, giới hạn chuyển động. **Không gian hành động** mô tả lệnh robot chấp nhận, chẳng hạn vị trí đầu kẹp, vận tốc hay góc khớp. **Chuyển giao giữa các loại robot** nghĩa là kỹ năng học từ nguồn dữ liệu này hỗ trợ thao tác trên robot có phần cứng khác.

Tập dữ liệu trộn từ nhiều robot phải thống nhất thông tin tối thiểu như ảnh, câu lệnh, trạng thái và loại lệnh. Tuy vậy, chuẩn hóa cùng một cấu trúc dữ liệu không đồng nghĩa các robot đã có cùng khả năng vận động.

## Phương pháp thực hiện

### Dữ liệu được kết hợp và sử dụng như thế nào?

Đầu tiên dữ liệu từ các tổ chức được gom về các bản ghi có thể đọc chung. Mỗi nguồn vẫn gắn với loại robot, camera và cách điều khiển. Tiếp theo, người nghiên cứu chọn hoặc chuyển đổi những dạng lệnh có thể học chung; trong các phiên bản RT-X, hành động đầu công tác được rời rạc hóa để mạng dự đoán.

Khi huấn luyện, mô hình nhìn ảnh cùng câu lệnh từ nhiều nguồn. Lúc kiểm tra, nó có thể được đặt trên một robot khác hoặc gặp kỹ năng chủ yếu xuất hiện trong dữ liệu của robot khác. Điều cần chứng minh là kết quả trên robot đích có tăng thật so với việc chỉ dùng dữ liệu của chính robot ấy.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/open-x-embodiment/figure-2.webp)

![Hình 3 từ PDF gốc, trang 4](/paper-figures/open-x-embodiment/figure-3.webp)

## Ví dụ từng bước

### Ví dụ chuyển kỹ năng mở ngăn kéo

Robot A đã thực hiện nhiều lần kéo ngăn kéo. Robot B chưa có nhiều ví dụ tương tự nhưng đã biết đưa đầu kẹp tới vật và giữ vật. Nếu dữ liệu được biểu diễn phù hợp, việc học từ A có thể giúp B chọn quỹ đạo kéo tốt hơn. Tuy nhiên B vẫn cần lệnh đúng giới hạn khớp và hình dạng kẹp của mình.

Nếu đưa nguyên góc khớp của A sang B, thao tác có thể vô nghĩa hoặc nguy hiểm. Đây là lý do cần phân biệt chuyển kiến thức về **mục tiêu/kỹ năng** với sao chép y nguyên tín hiệu điều khiển.

## Kết quả thực nghiệm

### Đọc kết quả của RT-1-X và RT-2-X

Hình 4 so RT-1-X với RT-1 và mô hình gốc. Hai bản RT-1 dùng cùng kiến trúc, trong khi nguồn dữ liệu huấn luyện khác nhau; kết quả tốt hơn là bằng chứng cho lợi ích của việc học chung dữ liệu robot trong thiết lập ấy. Hình 5 kiểm tra một số kỹ năng đã có trong dữ liệu robot nguồn nhưng chưa có trong dữ liệu robot đánh giá.

Khi đọc câu “cao hơn 50%”, cần biết đó là mức tăng tương đối hay số điểm phần trăm và benchmark gồm những nhiệm vụ nào. Không được coi một thí nghiệm như bằng chứng rằng robot bất kỳ sẽ tự làm mọi công việc.

### Số liệu và phạm vi kết luận

**Đối chiếu số liệu:** Trong phép so gộp của bài báo, RT-1-X đạt tỷ lệ thành công trung bình cao hơn khoảng 50% tương đối so với phương án chỉ dùng dữ liệu robot đích; con số này không có nghĩa tăng 50 điểm phần trăm. RT-2-X cũng được thử ở những kỹ năng chưa xuất hiện trong dữ liệu của loại robot đánh giá. Hãy nhìn từng robot, tập nhiệm vụ và số lượt thử để phân biệt chuyển giao kỹ năng thật với việc mô hình chỉ được học thêm ví dụ cùng kiểu bài.

![Hình 4 từ PDF gốc, trang 5](/paper-figures/open-x-embodiment/figure-4.webp)

![Hình 5 từ PDF gốc, trang 6](/paper-figures/open-x-embodiment/figure-5.webp)

## Hạn chế và câu hỏi còn mở

### Những giới hạn của trộn dữ liệu

Tập dữ liệu lớn có thể không cân bằng: nguồn robot phổ biến chiếm phần lớn số quỹ đạo. Camera khác, nhịp điều khiển khác và lệnh được chuẩn hóa sai đều có thể làm chính sách điều khiển học các quy luật không phù hợp. Một bước chuyển đổi hành động bị lỗi có thể phá hàng nghìn mẫu cùng lúc.

Ngoài ra, sự đa dạng robot không tự bảo đảm robot đích có đủ cơ cấu cho thao tác, ví dụ tay kẹp cứng không thể bắt chước bàn tay nhiều ngón trong mọi tình huống.

## Liên hệ với nghiên cứu khác

### Open X liên quan gì tới Octo và OpenVLA?

Open X-Embodiment cung cấp nguồn dữ liệu nhiều robot. Octo sử dụng một phần nguồn ấy để huấn luyện chính sách điều khiển có thể thích nghi với đầu vào và không gian hành động mới. OpenVLA cũng tận dụng dữ liệu robot đa dạng nhưng sinh hành động bằng kiến trúc gắn với mô hình ngôn ngữ.

Tập dữ liệu không phải mô hình; mô hình không phải thuật toán chuyển đổi lệnh. Khi đọc ba bài, luôn tách từng tầng: thu dữ liệu → chuẩn hóa → huấn luyện → thích nghi robot mới.

### Những bài nên đọc tiếp

- [Octo](/paper/octo)
- [OpenVLA](/paper/openvla)
- [LingBot-VLA 2.0](/paper/lingbot-vla-2)

## Đọc code và tự kiểm chứng

### Tự dựng thử nghiệm chuyển robot

Giả sử có robot A và B khác số khớp, nhưng cùng có thể nhặt cốc. Ghi những thông tin chung có thể dùng lại: ảnh vật, đích đến, thời điểm kẹp. Tiếp theo ghi những thứ không thể sao chép thẳng: góc khớp, giới hạn hành trình và kích thước kẹp.

So chính sách điều khiển B chỉ học dữ liệu B với chính sách điều khiển B được bổ sung dữ liệu A sau khi chuyển đổi hợp lệ. Đánh giá cùng vật và bố cục mới; như vậy mới đo được lợi ích của học chung.
