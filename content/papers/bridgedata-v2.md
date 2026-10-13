## Vì sao cần nghiên cứu này?

### Vì sao cùng là nhặt đồ mà đổi bàn lại làm robot thất bại?

Một chính sách điều khiển chỉ học nhặt cốc trên một chiếc bàn trắng có thể làm rất tốt ở đó nhưng thất bại khi sang bồn rửa hoặc gặp vật mới. Nguyên nhân không nhất thiết là mô hình yếu; có thể toàn bộ lần làm mẫu đều quá giống nhau. BridgeData V2 được xây để tạo nguồn dữ liệu phong phú về thao tác, đồ vật và môi trường.

Đây là một **tập dữ liệu** chứ không phải kiến trúc chính sách điều khiển mới. Khi xem kết quả học máy, phải hỏi thuật toán nào được huấn luyện trên dữ liệu ấy và điều kiện đánh giá ra sao. Đừng nhầm việc có nhiều ví dụ với việc robot đã tự hiểu mọi công việc.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/bridgedata-v2/figure-1.webp)

![Hình 3 từ PDF gốc, trang 5](/paper-figures/bridgedata-v2/figure-3.webp)

## Kiến thức nền cần nắm

### Một lần người điều khiển robot làm mẫu được ghi lại thế nào?

Mỗi lần người vận hành làm một nhiệm vụ, hệ thống ghi ảnh camera, trạng thái robot, chuỗi lệnh điều khiển và câu mô tả mục tiêu. Những bản ghi phải được đồng bộ theo thời gian: ảnh ở thời điểm này mà lệnh lại thuộc thời điểm khác thì mô hình học sai quan hệ giữa quan sát và hành động.

BridgeData V2 dùng nhiều góc camera; một phần có cả ảnh độ sâu. Số quỹ đạo, số nhiệm vụ và số môi trường là những đại lượng khác nhau. Hơn 60.000 quỹ đạo không có nghĩa có 60.000 kỹ năng riêng biệt.

### ### Một lần thao tác mẫu không chỉ là một video đẹp

Giả sử người vận hành đưa chiếc cốc từ mặt bàn vào bồn. Để robot học bắt chước, chỉ video cuối cùng là chưa đủ: cần biết **ở mỗi thời điểm camera thấy gì** và **người vận hành đã gửi lệnh gì**. Khi ghép hai dòng dữ liệu ấy theo thời gian, ta mới có các cặp quan sát–hành động để huấn luyện. Còn câu lệnh hoặc ảnh mục tiêu cho biết lần thao tác đó nhằm giải quyết việc gì. BridgeData V2 hữu ích vì thu được nhiều cặp như vậy trong những cảnh và nhiệm vụ khác nhau, chứ không phải vì nó tự cung cấp một thuật toán điều khiển mới.


## Phương pháp thực hiện

### Từ người điều khiển đến tập huấn luyện

Đầu tiên người vận hành chọn nhiệm vụ, ví dụ chuyển khối từ bàn vào bồn, rồi điều khiển tay máy bằng bộ điều khiển thực tế ảo. Camera và lệnh vận động được ghi liên tục theo thời gian. Quá trình lặp lại ở nhiều bố cục và với nhiều vật thể để tránh chỉ học một cách đặt đồ.

Khi huấn luyện, chính sách điều khiển nhận quan sát và mục tiêu rồi học dự đoán động tác người đã làm. Khi đánh giá, robot phải tự thực hiện trên nhiệm vụ hoặc môi trường được giữ ngoài tập huấn luyện. Không nên cắt một lần thao tác thành nhiều đoạn rồi chia ngẫu nhiên vào cả tập huấn luyện và tập kiểm tra: khi ấy, mô hình có thể gặp lại gần như cùng một cảnh và kết quả sẽ cao giả tạo.

### ### Dữ liệu đa dạng giúp robot tránh học nhầm điều gì?

Nếu mọi lần nhặt cốc đều diễn ra trên chiếc bàn trắng, mạng có thể vô tình dựa vào màu nền để định vị cốc. Khi chuyển sang bàn gỗ, dấu hiệu quen thuộc biến mất dù thao tác vẫn là nhặt và đặt. Thu cùng kỹ năng ở nhiều vị trí, phông nền và với nhiều vật buộc mô hình học những đặc điểm có liên quan hơn tới việc cần làm. Nhưng đa dạng cũng phải đúng mục tiêu: thêm rất nhiều cảnh chẳng liên quan có thể làm việc huấn luyện tốn kém mà không giúp nhiệm vụ đích. Đây là lý do cần so hai tập có lượng dữ liệu gần bằng nhau nhưng mức đa dạng khác nhau.

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/bridgedata-v2/figure-2.webp)

![Hình 5 từ PDF gốc, trang 8](/paper-figures/bridgedata-v2/figure-5.webp)

## Ví dụ từng bước

### Ví dụ dùng kỹ năng cũ để học việc mới

Robot học rất nhiều lần nhặt rồi đặt vật vào khay. Sau đó ta yêu cầu xếp hai khối lên nhau. Việc xếp chồng khó hơn, nhưng các bước tiếp cận, kẹp và di chuyển đồ vẫn có thể tái sử dụng. Đây là ý tưởng chuyển giao giữa những kỹ năng có phần chung.

Thử so hai chính sách điều khiển có số lần làm mẫu gần nhau: một bên được học ba kỹ năng, bên kia mười ba. Nếu bên đa dạng hơn làm nhiệm vụ mới tốt hơn, ta có bằng chứng rằng loại kỹ năng được học quan trọng, không chỉ tổng số mẫu.

## Kết quả thực nghiệm

### Đọc Hình 5 cho đúng ý nghĩa

Nửa bên trái Hình 5 cho thấy khi tăng lượng dữ liệu và kích thước mô hình, chính sách điều khiển có điều kiện mục tiêu học từ BridgeData V2 đạt hiệu quả tốt hơn. Nửa bên phải giữ số mẫu giữa hai tập gần bằng nhau, chỉ thay độ đa dạng kỹ năng. Đây là phép so có ý nghĩa hơn nếu muốn hỏi liệu học nhiều loại việc có giúp việc mới không.

Mỗi phương pháp được thử 20 lần trong phép so đó; chênh lệch nhỏ có thể cần kiểm tra thêm độ bất định. Không nên biến kết quả “đa dạng giúp trong điều kiện thử” thành “cứ thêm bất kỳ dữ liệu nào cũng tốt”.



### Đa dạng kỹ năng và số lượt làm mẫu là hai biến khác nhau

Điểm mạnh của BridgeData V2 thể hiện qua xu hướng khi huấn luyện các chính sách điều khiển khác nhau: dữ liệu phong phú hơn và mô hình phù hợp hơn thường giúp tăng khả năng làm nhiệm vụ chưa gặp. Để tách tác dụng của sự đa dạng khỏi số lượng, Hình 5 còn so những tập có số quỹ đạo gần bằng nhau nhưng gồm số loại kỹ năng khác nhau. Bản thân tập dữ liệu không có tỷ lệ thành công riêng; tỷ lệ ấy thuộc từng chính sách điều khiển được huấn luyện và chạy thử.

### ### Một tập dữ liệu không tự có tỷ lệ thành công

BridgeData V2 là nguyên liệu để huấn luyện, nên khi thấy biểu đồ hoàn thành nhiệm vụ, trước tiên phải tìm tên **chính sách điều khiển được dùng**. Sau đó hỏi tập huấn luyện có bao nhiêu quỹ đạo, gồm bao nhiêu loại việc và tập kiểm tra có bị trùng cảnh không. Nếu một nhóm có 20 lượt chạy, chênh lệch một đến hai lần thành công có thể vẫn rất thiếu chắc chắn. Đọc Hình 5 theo cách ấy sẽ giúp tách lợi ích của dữ liệu đa dạng khỏi lợi ích đơn thuần của việc dùng nhiều ví dụ hơn.


## Hạn chế và câu hỏi còn mở

### Điều cần lưu ý trước khi dùng BridgeData V2

Các quỹ đạo đến từ một hệ robot và bố trí camera nhất định. Khi đưa sang robot có chiều dài cánh tay, kẹp hoặc hệ tọa độ khác, lệnh cần được ánh xạ lại. Một cặp số vị trí của đầu công tác không đương nhiên có cùng ý nghĩa trên mọi thiết bị.

Dữ liệu lớn cũng có thể bị lệch: nhiệm vụ thường gặp nhiều hơn nhiệm vụ hiếm. Người dùng cần kiểm tra dữ liệu bẩn, mất khung hình, nhãn không đồng bộ và những lượt thất bại. Nếu đầu vào sai, mô hình lớn chỉ học lỗi kỹ hơn.

## Liên hệ với nghiên cứu khác

### BridgeData V2, DROID và Open X-Embodiment bổ sung nhau thế nào?

BridgeData V2 mở rộng số thao tác và môi trường trong một hệ thu dữ liệu tương đối nhất quán. DROID thu dữ liệu ở rất nhiều tòa nhà và bối cảnh ngoài phòng thí nghiệm. Open X-Embodiment trộn dữ liệu từ nhiều kiểu robot khác nhau, vì thế đối diện thêm bài toán không gian hành động không đồng nhất.

Khi so hiệu quả, hãy nói rõ muốn kiểm tra đổi vật, đổi cảnh hay đổi phần cứng. Ba kiểu khái quát ấy không giống nhau, dù đôi khi đều được gọi chung là chuyển giao.

### Những bài nên đọc tiếp

- [Octo](/paper/octo)
- [Open X-Embodiment](/paper/open-x-embodiment)

## Đọc mã nguồn và tự kiểm chứng

### Tự dựng một thử nghiệm dữ liệu

Cho robot học nhiệm vụ chuyển vật vào khay. Lập hai tập bằng nhau về số quỹ đạo: tập A chỉ thay vị trí vật, tập B thay vị trí, loại vật và màu nền. Đánh giá trên một vật chưa thấy ở một bàn mới. Nếu B tốt hơn, cách diễn giải phù hợp là độ đa dạng cụ thể ấy có ích cho điều kiện kiểm tra này.

Trước khi huấn luyện, xem thử một quỹ đạo để xác nhận ảnh và lệnh khớp thời gian; ghi số tập, số nhiệm vụ, số bối cảnh riêng thay vì chỉ ghi “60 nghìn mẫu”.
