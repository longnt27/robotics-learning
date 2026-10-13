## Vì sao cần nghiên cứu này?

Robot chỉ được dạy nhặt đồ trên một mặt bàn rất dễ lúng túng khi sang bàn khác, dù cách nhặt về cơ bản không thay đổi. Nguyên nhân thường nằm ở dữ liệu huấn luyện quá ít loại vật, môi trường và thao tác. Trong khi đó, tự thu lại lượt thao tác mẫu cho mọi căn phòng và kiểu đồ vật rất đắt. **BridgeData V2 xây dựng một tập dữ liệu robot lớn với nhiều thao tác ở nhiều môi trường**, giúp nhóm nghiên cứu có nguồn dữ liệu chung để học và thử khả năng chuyển kỹ năng. Đây là một công trình về dữ liệu; nó không tự đề xuất một mạng điều khiển mới.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 5](/paper-figures/bridgedata-v2/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/bridgedata-v2/figure-1.webp)


### Vì sao cùng là nhặt đồ mà đổi bàn lại làm robot thất bại?

Một chính sách điều khiển chỉ học nhặt cốc trên một chiếc bàn trắng có thể làm rất tốt ở đó nhưng thất bại khi sang bồn rửa hoặc gặp vật mới. Nguyên nhân không nhất thiết là mô hình yếu; có thể toàn bộ demonstration đều quá giống nhau. BridgeData V2 được xây để tạo nguồn dữ liệu phong phú về thao tác, đồ vật và môi trường.

Đây là một **tập dữ liệu** chứ không phải kiến trúc chính sách điều khiển mới. Khi xem kết quả học máy, phải hỏi thuật toán nào được huấn luyện trên dữ liệu ấy và điều kiện đánh giá ra sao. Đừng nhầm việc có nhiều ví dụ với việc robot đã tự hiểu mọi công việc.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Một tập dữ liệu nhiều quỹ đạo chưa chắc đa dạng. Nếu các lần nhặt đồ đều diễn ra trên cùng một bàn và một phông nền, robot có thể học thuộc cảnh thay vì học thao tác. Cần xem **sự đa dạng** theo nhiều chiều: môi trường, vật thể, loại kỹ năng, góc camera và cách người vận hành thực hiện.

Mỗi lượt ghi lại thường chứa chuỗi ảnh, trạng thái khớp, câu lệnh nhiệm vụ và hành động theo thời gian. Ảnh và lệnh phải đồng bộ; nếu một khung hình bị ghép với lệnh của thời điểm khác, mô hình có thể học phản ứng sai.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Một demonstration robot chứa những gì?

Mỗi lần người vận hành làm một nhiệm vụ, hệ thống ghi ảnh camera, trạng thái robot, chuỗi lệnh điều khiển và câu mô tả mục tiêu. Những bản ghi phải được đồng bộ theo thời gian: ảnh ở thời điểm này mà lệnh lại thuộc thời điểm khác thì mô hình học sai quan hệ giữa quan sát và hành động.

BridgeData V2 dùng nhiều góc camera; một phần có cả ảnh độ sâu. Số quỹ đạo, số nhiệm vụ và số môi trường là những đại lượng khác nhau. Hơn 60.000 quỹ đạo không có nghĩa có 60.000 kỹ năng riêng biệt.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

BridgeData V2 có **60.096 quỹ đạo** trong **24 môi trường**, bao phủ hơn 100 đồ vật cùng các kỹ năng nhặt–đặt, đẩy, gom, xếp chồng và gấp đồ. Phần lớn là lượt thao tác mẫu do người điều khiển; một phần bổ sung là những quỹ đạo nhặt–đặt được thu với các điều kiện thay đổi để tăng độ bao phủ.

Nhóm tác giả huấn luyện nhiều thuật toán học bắt chước và học từ dữ liệu có sẵn, thay vì chỉ chọn một kiến trúc. Các thí nghiệm còn thay lượng dữ liệu, kích thước mô hình và số loại kỹ năng. Dữ liệu có thể được dùng với ảnh mục tiêu hoặc câu lệnh ngôn ngữ, miễn là chính sách điều khiển đọc đúng định dạng.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 8](/paper-figures/bridgedata-v2/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/bridgedata-v2/figure-2.webp)


### Từ người điều khiển đến tập huấn luyện

Đầu tiên người vận hành chọn nhiệm vụ, ví dụ chuyển khối từ bàn vào bồn, rồi điều khiển tay máy bằng bộ điều khiển thực tế ảo. Camera và lệnh vận động được ghi liên tục theo thời gian. Quá trình lặp lại ở nhiều bố cục và với nhiều vật thể để tránh chỉ học một cách đặt đồ.

Khi huấn luyện, chính sách điều khiển nhận quan sát và mục tiêu rồi học dự đoán động tác người đã làm. Khi đánh giá, robot phải tự thực hiện trên nhiệm vụ hoặc môi trường được giữ ngoài tập huấn luyện. Các đoạn cắt từ cùng một lần thao tác không nên bị chia ngẫu nhiên vào cả train lẫn kiểm tra, vì điều đó làm kết quả trông cao giả.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Nếu robot xem 20.000 lượt nhặt đồ trên một chiếc bàn trắng, nó có thể làm rất tốt ở đó nhưng thất bại trên bàn có khăn trải. BridgeData V2 cho nhiều bối cảnh và loại vật hơn, buộc mạng tìm dấu hiệu liên quan tới vật thay vì nhớ màu bàn.

Khi chia tập dữ liệu để kiểm tra, không nên lấy các khung ảnh gần nhau của cùng một lần làm bỏ vào cả phần huấn luyện lẫn phần kiểm tra. Một phép thử có ý nghĩa hơn là giữ riêng **một số môi trường hoặc nhiệm vụ chưa xuất hiện lúc học**. Cũng cần kiểm tra đơn vị hành động, tần số và cách chuẩn hóa trước khi trộn dữ liệu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ dùng kỹ năng cũ để học việc mới

Robot học rất nhiều lần nhặt rồi đặt vật vào khay. Sau đó ta yêu cầu xếp hai khối lên nhau. Việc xếp chồng khó hơn, nhưng các bước tiếp cận, kẹp và di chuyển đồ vẫn có thể tái sử dụng. Đây là ý tưởng chuyển giao giữa những kỹ năng có phần chung.

Thử so hai chính sách điều khiển có số demonstration gần nhau: một bên được học ba kỹ năng, bên kia mười ba. Nếu bên đa dạng hơn làm nhiệm vụ mới tốt hơn, ta có bằng chứng rằng loại kỹ năng được học quan trọng, không chỉ tổng số mẫu.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Xu hướng chung trong các thí nghiệm là tăng lượng dữ liệu, dung lượng mô hình và **sự phong phú kỹ năng** có thể giúp chính sách điều khiển xử lý nhiệm vụ mới tốt hơn. Nhiều phương pháp khác nhau học được hành vi robot hữu ích từ BridgeData V2; vì thế bộ dữ liệu có giá trị không chỉ cho một kiểu mạng.

Một phép thử quan trọng giữ số lượng mẫu gần tương đương nhưng tăng số loại kỹ năng được học. Khi kết quả trên nhiệm vụ chưa gặp tăng, đó là bằng chứng cho lợi ích của **độ đa dạng**, không chỉ việc lặp thêm một hành động quen thuộc. Tuy vậy, cần đọc đúng bộ nhiệm vụ và số lượt thử trước khi suy rộng.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc Hình 5 cho đúng ý nghĩa

Nửa bên trái Hình 5 cho thấy khi tăng lượng dữ liệu và kích thước mô hình, chính sách điều khiển có điều kiện mục tiêu học từ BridgeData V2 đạt hiệu quả tốt hơn. Nửa bên phải giữ số mẫu giữa hai tập gần bằng nhau, chỉ thay độ đa dạng kỹ năng. Đây là phép so có ý nghĩa hơn nếu muốn hỏi liệu học nhiều loại việc có giúp việc mới không.

Mỗi phương pháp được thử 20 lần trong phép so đó; chênh lệch nhỏ có thể cần kiểm tra thêm độ bất định. Không nên biến kết quả “đa dạng giúp trong điều kiện thử” thành “cứ thêm bất kỳ dữ liệu nào cũng tốt”.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

BridgeData V2 chủ yếu thu bằng một dòng tay máy, với các thao tác trên bàn và mức lực tương đối hạn chế. Chuyển sang robot có khớp, kẹp hoặc hệ tọa độ lệnh khác vẫn đòi ánh xạ và tinh chỉnh, chứ không chỉ tải lại bản trọng số đã lưu.

Phần lớn dữ liệu là lượt thao tác thành công nên chưa thể dạy đủ những tình huống tự phục hồi khi robot làm rơi hoặc kẹp hụt vật. Tập dữ liệu lớn cũng không bảo đảm bao phủ hết ngôn ngữ đời thường. Khi dùng trên phần cứng mới, cần kiểm tra riêng độ đồng bộ camera, trạng thái và lệnh điều khiển.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Điều cần lưu ý trước khi dùng BridgeData V2

Các quỹ đạo đến từ một hệ robot và bố trí camera nhất định. Khi đưa sang robot có chiều dài cánh tay, kẹp hoặc hệ tọa độ khác, lệnh cần được ánh xạ lại. Một cặp số vị trí của đầu công tác không đương nhiên có cùng ý nghĩa trên mọi thiết bị.

Dữ liệu lớn cũng có thể bị lệch: nhiệm vụ thường gặp nhiều hơn nhiệm vụ hiếm. Người dùng cần kiểm tra dữ liệu bẩn, mất khung hình, nhãn không đồng bộ và những lượt thất bại. Nếu đầu vào sai, mô hình lớn chỉ học lỗi kỹ hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Octo](/paper/octo)
- [Open X-Embodiment](/paper/open-x-embodiment)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### BridgeData V2, DROID và Open X-Embodiment bổ sung nhau thế nào?

BridgeData V2 mở rộng số thao tác và môi trường trong một hệ thu dữ liệu tương đối nhất quán. DROID thu dữ liệu ở rất nhiều tòa nhà và bối cảnh ngoài phòng lab. Open X-Embodiment trộn dữ liệu từ nhiều kiểu robot khác nhau, vì thế đối diện thêm bài toán không gian hành động không đồng nhất.

Khi so hiệu quả, hãy nói rõ muốn kiểm tra đổi vật, đổi cảnh hay đổi phần cứng. Ba kiểu khái quát ấy không giống nhau, dù đôi khi đều được gọi chung là chuyển giao.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Lấy một phần nhỏ của BridgeData V2, mở thử vài quỹ đạo với ảnh, trạng thái robot và lệnh để kiểm tra sự đồng bộ. Chia dữ liệu theo hai cách: ngẫu nhiên theo lượt thực thi và **giữ riêng những môi trường chưa thấy**. So tỷ lệ thành công để biết mạng dựa vào bối cảnh quen tới mức nào.

Vẽ phân phối giá trị của từng chiều hành động và ghi rõ đơn vị trước/sau chuẩn hóa. Nếu đổi robot, đừng mặc định cột hành động có cùng tên cũng mang cùng ý nghĩa vật lý.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự dựng một thử nghiệm dữ liệu

Cho robot học nhiệm vụ chuyển vật vào khay. Lập hai tập bằng nhau về số quỹ đạo: tập A chỉ thay vị trí vật, tập B thay vị trí, loại vật và màu nền. Đánh giá trên một vật chưa thấy ở một bàn mới. Nếu B tốt hơn, cách diễn giải phù hợp là độ đa dạng cụ thể ấy có ích cho điều kiện kiểm tra này.

Trước khi huấn luyện, xem thử một quỹ đạo để xác nhận ảnh và lệnh khớp thời gian; ghi số tập, số nhiệm vụ, số bối cảnh riêng thay vì chỉ ghi “60 nghìn mẫu”.

<!-- END EXTENDED WALKTHROUGH -->

