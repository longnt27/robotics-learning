## Vì sao cần nghiên cứu này?

Mỗi phòng thí nghiệm thường dùng một loại robot, camera và cách biểu diễn lệnh riêng. Nếu dữ liệu của robot Franka không thể hỗ trợ robot WidowX, mỗi nhóm sẽ phải học lại gần như từ đầu dù hai robot cùng biết nhặt và đặt vật. **Open X-Embodiment gom dữ liệu từ nhiều tổ chức và nhiều cấu trúc robot để kiểm tra khả năng học chung và chuyển kỹ năng.** Thử thách không chỉ là đưa file về cùng định dạng: góc khớp, vị trí đầu kẹp và số chiều hành động có thể mang ý nghĩa khác nhau giữa các robot. Phải xử lý sự khác biệt ấy trước khi mong dữ liệu chung mang lại lợi ích.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/open-x-embodiment/figure-1.webp)


### Vì sao gom dữ liệu nhiều robot khó hơn gom ảnh?

Một ảnh chiếc cốc có thể được dùng để dạy nhiều loại mô hình nhìn ảnh. Nhưng lệnh “dịch khớp số 3 thêm 0,1” không có cùng ý nghĩa trên hai tay máy khác nhau. Robot A dùng kẹp hai ngón, robot B có bàn tay nhiều khớp; số chiều và đơn vị lệnh cũng khác. **Open X-Embodiment tìm cách kết hợp demonstration từ nhiều hệ robot** để chính sách học được điều chung mà không nhầm lệnh của chúng.

Điểm chính của công trình là dữ liệu đa tổ chức và kiểm tra khả năng chuyển giữa robot, không chỉ là thêm một tập dữ liệu thật lớn.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Hai robot cùng biết nhặt vật nhưng có số khớp, kiểu kẹp, vị trí camera và lệnh điều khiển khác nhau. Vì thế **không thể chỉ nối mọi vector hành động thành một tập dữ liệu chung**. Cột thứ nhất của robot này có thể là độ dịch đầu kẹp, còn ở robot khác lại là góc khớp.

Học từ nhiều loại robot đòi thống nhất định dạng hoặc giữ thông tin về **cấu hình robot** để biết từng lệnh có ý nghĩa gì. Mục tiêu là chuyển kiến thức chung về thao tác, không phải coi mọi phần cứng là một thiết bị.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Các thuật ngữ cần hiểu

**Embodiment** là cấu trúc vật lý robot: số khớp, camera, kiểu kẹp, giới hạn chuyển động. **Không gian hành động** mô tả lệnh robot chấp nhận, chẳng hạn vị trí đầu kẹp, vận tốc hay góc khớp. **Chuyển giao giữa các loại robot** nghĩa là kỹ năng học từ nguồn dữ liệu này hỗ trợ thao tác trên robot có phần cứng khác.

Tập dữ liệu trộn từ nhiều robot phải thống nhất thông tin tối thiểu như ảnh, câu lệnh, trạng thái và loại lệnh. Tuy vậy, chuẩn hóa cùng một cấu trúc dữ liệu không đồng nghĩa các robot đã có cùng khả năng vận động.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Open X-Embodiment tập hợp hơn **một triệu quỹ đạo** từ **22 kiểu robot** và **21 tổ chức**. Các nguồn được chuyển về những cấu trúc dữ liệu có thể dùng chung trong khi vẫn giữ thông tin cần thiết về loại robot, camera và lệnh. Từ nguồn ấy, nhóm nghiên cứu huấn luyện RT-1-X và RT-2-X, hai phiên bản học trên dữ liệu nhiều robot.

Điểm kỹ thuật quan trọng không phải ép toàn bộ robot thành một không gian khớp duy nhất. Hệ thống cần biết cách mỗi loại lệnh được mã hóa và chuẩn hóa. Sau đó mới có thể kiểm tra liệu ví dụ từ robot A có giúp robot B làm việc tốt hơn so với chỉ học dữ liệu của chính B.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/open-x-embodiment/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/open-x-embodiment/figure-2.webp)


### Dữ liệu được kết hợp và sử dụng như thế nào?

Đầu tiên dữ liệu từ các tổ chức được gom về các bản ghi có thể đọc chung. Mỗi nguồn vẫn gắn với loại robot, camera và cách điều khiển. Tiếp theo, người nghiên cứu chọn hoặc chuyển đổi những dạng lệnh có thể học chung; trong các phiên bản RT-X, hành động đầu công tác được rời rạc hóa để mạng dự đoán.

Khi huấn luyện, mô hình nhìn ảnh cùng câu lệnh từ nhiều nguồn. Lúc kiểm tra, nó có thể được đặt trên một robot khác hoặc gặp kỹ năng chủ yếu xuất hiện trong dữ liệu của robot khác. Điều cần chứng minh là kết quả trên robot đích có tăng thật so với việc chỉ dùng dữ liệu của chính robot ấy.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot A nhận lệnh dịch đầu kẹp theo ba trục và điều khiển đóng/mở kẹp. Robot B nhận trực tiếp góc từng khớp. Nếu trộn nguyên các số ấy, cùng một chiều trong dữ liệu có thể mang hai ý nghĩa trái nhau. Trước khi huấn luyện phải chọn cách biểu diễn có thể dùng chung hoặc gắn bộ chuyển đổi riêng cho từng robot.

Để đo lợi ích chuyển giao, giữ nguyên robot đích B và bài kiểm tra. So một chính sách điều khiển chỉ học dữ liệu B với chính sách điều khiển còn học thêm dữ liệu A đã chuyển đổi đúng. Khi điều kiện khác gần tương đương, chênh lệch mới giúp đánh giá ích lợi của học chung.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ chuyển kỹ năng mở ngăn kéo

Robot A đã thực hiện nhiều lần kéo ngăn kéo. Robot B chưa có nhiều ví dụ tương tự nhưng đã biết đưa đầu kẹp tới vật và giữ vật. Nếu dữ liệu được biểu diễn phù hợp, việc học từ A có thể giúp B chọn quỹ đạo kéo tốt hơn. Tuy nhiên B vẫn cần lệnh đúng giới hạn khớp và hình dạng kẹp của mình.

Nếu đưa nguyên góc khớp của A sang B, thao tác có thể vô nghĩa hoặc nguy hiểm. Đây là lý do cần phân biệt chuyển kiến thức về **mục tiêu/kỹ năng** với sao chép y nguyên tín hiệu điều khiển.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trong các phép thử tổng hợp, RT-1-X đạt tỷ lệ thành công trung bình cao hơn khoảng **50%** so với một số thiết lập chỉ học dữ liệu riêng lẻ. RT-2-X cũng thể hiện khả năng khái quát mạnh hơn trong một số tình huống, có nhóm thử cải thiện nhiều lần.

Các kết quả này cho thấy dữ liệu robot khác **có thể giúp** robot đích, nhất là khi mô hình đủ khả năng học từ nguồn đa dạng. Tuy nhiên, không phải mọi cặp robot hoặc bộ dữ liệu đều chuyển giao tốt. Cần xem rõ robot đích, nhiệm vụ, nguồn dữ liệu và phép tính mức cải thiện.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 5](/paper-figures/open-x-embodiment/figure-4.webp)
![Hình 5 từ PDF gốc, trang 6](/paper-figures/open-x-embodiment/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả của RT-1-X và RT-2-X

Hình 4 so RT-1-X với RT-1 và mô hình gốc. Hai bản RT-1 dùng cùng kiến trúc, trong khi nguồn dữ liệu huấn luyện khác nhau; kết quả tốt hơn là bằng chứng cho lợi ích của việc học chung dữ liệu robot trong thiết lập ấy. Hình 5 kiểm tra một số kỹ năng đã có trong dữ liệu robot nguồn nhưng chưa có trong dữ liệu robot đánh giá.

Khi đọc câu “cao hơn 50%”, cần biết đó là mức tăng tương đối hay số điểm phần trăm và benchmark gồm những nhiệm vụ nào. Không được coi một thí nghiệm như bằng chứng rằng robot bất kỳ sẽ tự làm mọi công việc.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Nguồn dữ liệu từ các phòng thí nghiệm không cân bằng về số lượng, nhiệm vụ và góc camera. Nhiều thiết bị vẫn là tay máy thao tác trên bàn, có dạng kẹp tương đối giống nhau; vì thế 22 kiểu robot chưa đại diện đầy đủ cho tất cả cơ cấu ngoài đời.

**Chuẩn hóa dữ liệu không loại bỏ mọi khác biệt phần cứng.** Cách chuyển đổi lệnh có thể làm mất thông tin riêng của một loại robot, còn mô hình lớn vẫn đắt để huấn luyện. Công trình chứng minh học chung giữa các nguồn robot có ích trong những trường hợp được thử, chứ chưa giải xong vấn đề điều khiển thống nhất mọi robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những giới hạn của trộn dữ liệu

Tập dữ liệu lớn có thể không cân bằng: nguồn robot phổ biến chiếm phần lớn số quỹ đạo. Camera khác, nhịp điều khiển khác và lệnh được chuẩn hóa sai đều có thể làm chính sách điều khiển học các quy luật không phù hợp. Một bước chuyển đổi hành động bị lỗi có thể phá hàng nghìn mẫu cùng lúc.

Ngoài ra, sự đa dạng robot không tự bảo đảm robot đích có đủ cơ cấu cho thao tác, ví dụ tay kẹp cứng không thể bắt chước bàn tay nhiều ngón trong mọi tình huống.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Octo](/paper/octo)
- [OpenVLA](/paper/openvla)
- [LingBot-VLA 2.0](/paper/lingbot-vla-2)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Open X liên quan gì tới Octo và OpenVLA?

Open X-Embodiment cung cấp nguồn dữ liệu nhiều robot. Octo sử dụng một phần nguồn ấy để huấn luyện chính sách điều khiển có thể thích nghi với đầu vào và không gian hành động mới. OpenVLA cũng tận dụng dữ liệu robot đa dạng nhưng sinh hành động bằng kiến trúc gắn với mô hình ngôn ngữ.

Tập dữ liệu không phải mô hình; mô hình không phải thuật toán chuyển đổi lệnh. Khi đọc ba bài, luôn tách từng tầng: thu dữ liệu → chuẩn hóa → huấn luyện → thích nghi robot mới.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Chọn dữ liệu của hai robot khác cấu trúc. Lập bảng cho mỗi trường: ảnh camera, trạng thái khớp, lệnh di chuyển, đơn vị và hệ tọa độ. Xác định trường nào thực sự tương đương và trường nào cần chuyển đổi hoặc che đi.

Trước khi huấn luyện lớn, vẽ phân phối từng chiều hành động riêng cho từng robot và thử giải mã vài mẫu. Nếu cùng giá trị lại gây hai chuyển động khác nhau, cần sửa cách biểu diễn trước.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự dựng thử nghiệm chuyển robot

Giả sử có robot A và B khác số khớp, nhưng cùng có thể nhặt cốc. Ghi những thông tin chung có thể dùng lại: ảnh vật, đích đến, thời điểm kẹp. Tiếp theo ghi những thứ không thể sao chép thẳng: góc khớp, giới hạn hành trình và kích thước kẹp.

So chính sách điều khiển B chỉ học dữ liệu B với chính sách điều khiển B được bổ sung dữ liệu A sau khi chuyển đổi hợp lệ. Đánh giá cùng vật và bố cục mới; như vậy mới đo được lợi ích của học chung.

<!-- END EXTENDED WALKTHROUGH -->

