## Vì sao cần nghiên cứu này?

### Vì sao một mô hình VLA nguồn mở đáng chú ý?

Một nhóm nghiên cứu muốn dạy robot nhặt đồ có thể phải tự thu dữ liệu lớn và tự thiết kế mạng từ đầu. OpenVLA cung cấp mô hình đã được huấn luyện trên gần một triệu lượt robot cùng mã nguồn và bản mô hình đã lưu công khai. Người dùng có thể **tinh chỉnh mô hình nền bằng dữ liệu robot của mình** thay vì bắt đầu từ số không.

Nhưng “nguồn mở” không đồng nghĩa “cắm vào robot nào cũng chạy”. mô hình vẫn cần ảnh đúng kiểu, câu lệnh phù hợp và cách giải mã hành động tương ứng với phần cứng đích.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/openvla/figure-1.webp)

## Kiến thức nền cần nắm

### Các thành phần của OpenVLA là gì?

OpenVLA kết hợp hai bộ mã hóa ảnh DINOv2 và SigLIP để nhận thông tin hình học/thị giác cùng ngữ nghĩa; một bộ ánh xạ chuyển các đặc trưng đó sang dạng mà mô hình ngôn ngữ dùng được; rồi lõi Llama 2 dự đoán token hành động.

Mỗi token hành động là mã cho giá trị điều khiển, không phải chữ giải thích cho người. Trước khi gửi lệnh xuống robot, cần giải mã và khôi phục đơn vị/hệ tọa độ đúng. Số bảy chiều trong đầu ra của nghiên cứu là một quy ước cụ thể, không có nghĩa mọi robot đều có đúng bảy khớp.

## Phương pháp thực hiện

### Một lần chạy mô hình trên robot diễn ra ra sao?

**Bước 1:** camera cung cấp ảnh, người dùng đưa câu lệnh, chẳng hạn “Bỏ quả táo vào khay”. **Bước 2:** bộ mã hóa ảnh chuyển cảnh thành đặc trưng. **Bước 3:** mạng ánh xạ biểu diễn ảnh để lõi ngôn ngữ có thể kết hợp với câu lệnh. **Bước 4:** lõi mô hình dự đoán token hành động; hệ thống giải mã token thành lệnh vận động.

Robot thực hiện lệnh, lấy ảnh tiếp theo và tiếp tục. Nếu đem mô hình sang robot mới, ta cần tinh chỉnh trên lần làm mẫu của robot ấy và kiểm tra cách mã hóa/giải mã hành động. Lỗi ở bước chuyển đổi lệnh có thể khiến một mô hình có hàm mất mát đẹp tạo chuyển động sai.

![Hình 2 gốc từ PDF bài báo, trang 4](/paper-figures/openvla/figure-2.webp)

![Hình 6 từ PDF gốc, trang 10](/paper-figures/openvla/figure-6.webp)

## Ví dụ từng bước

### Ví dụ tinh chỉnh trên tay máy Franka

Giả sử robot Franka cần nhặt những đồ vật khác với tập huấn luyện gốc. Ta ghi các lượt người điều khiển Franka thực hiện nhiệm vụ, chuyển ảnh, câu lệnh và hành động vào định dạng dữ liệu mô hình nhận. Sau đó tinh chỉnh một phần hoặc toàn bộ tham số.

Khi kiểm tra, không chỉ xem mô hình có nhặt đúng vật quen thuộc không mà còn thử vật gây nhiễu, câu nói khác và vị trí mới. Nếu nó hiểu đúng vật nhưng kẹp hụt, cần xác minh camera và cách biến token thành lệnh trước khi quy kết cho khả năng suy luận.

## Kết quả thực nghiệm

### Khi nào OpenVLA thực sự hơn mô hình khác?

Trên các phép thử WidowX và Google Robot, OpenVLA đạt kết quả tốt so với các chính sách điều khiển tổng quát được đem đối chiếu. Tuy nhiên kết quả không giống nhau ở mọi nhóm; ví dụ một số kiểm tra khái quát ngữ nghĩa vẫn có đối thủ tốt hơn.

Khi thích nghi robot mới, Diffusion Policy huấn luyện riêng có thể mạnh ở một nhiệm vụ hẹp, còn mô hình tổng quát đã học trước như Octo và OpenVLA có lợi thế trên tập lệnh/phông nền đa dạng. Hãy so các hệ thống cùng dữ liệu tinh chỉnh và cùng số lượt chạy, thay vì coi một điểm tổng hợp là lời khẳng định tuyệt đối.

### Số liệu và phạm vi kết luận

**Đối chiếu số liệu:** Trong nhóm 29 nhiệm vụ dùng để so các mô hình robot tổng quát, OpenVLA được báo cáo cao hơn RT-2-X khoảng 16,5 điểm phần trăm trung bình trong điều kiện của tác giả. Khi tinh chỉnh, LoRA với mức hạng 32 cho kết quả khoảng 68,2% so với 69,7% khi cập nhật toàn bộ tham số, trong khi chỉ huấn luyện khoảng 1,4% tham số. Đây là ví dụ thực tế cho thấy tiết kiệm bộ nhớ có thể ít làm giảm chất lượng trong một thiết lập, không phải bảo đảm tương tự trên mọi GPU hay nhiệm vụ.

![Hình 3 từ PDF gốc, trang 7](/paper-figures/openvla/figure-3.webp)

![Hình 4 từ PDF gốc, trang 8](/paper-figures/openvla/figure-4.webp)

![Hình 5 từ PDF gốc, trang 9](/paper-figures/openvla/figure-5.webp)

## Hạn chế và câu hỏi còn mở

### Giới hạn và chi phí triển khai

Mô hình bảy tỷ tham số thường tốn bộ nhớ và thời gian suy luận đáng kể. Lượng tử hóa có thể giúp nhanh/nhẹ hơn, nhưng cần kiểm tra sai số hành động và độ trễ toàn bộ hệ thống, không chỉ thời gian chạy một lượt mạng.

Dữ liệu từ nhiều loại robot còn đặt ra bài toán không gian hành động không đồng nhất. Trước khi chạy thực, hãy kiểm tra biên độ lệnh, an toàn khớp, giới hạn vùng làm việc và cách chuẩn hóa từng chiều.

## Liên hệ với nghiên cứu khác

### So OpenVLA với Octo và RT-2

Cả RT-2 và OpenVLA đều dùng kiến thức ảnh–ngôn ngữ để hỗ trợ sinh hành động robot. OpenVLA nổi bật ở khả năng truy cập mã/khối lượng của bản mô hình đã lưu để nghiên cứu và tinh chỉnh. Octo cũng là mô hình mở nhưng kiến trúc hướng khả năng thay quan sát, đầu ra linh hoạt theo robot.

Việc một mạng dùng lõi mô hình ngôn ngữ không tự khiến nó giỏi hơn mọi chính sách diffusion ở mọi thao tác. Các lựa chọn phải dựa trên nhiệm vụ, phần cứng, dữ liệu và chi phí suy luận cụ thể.

### Những bài nên đọc tiếp

- [RT-2](/paper/rt-2)
- [FAST](/paper/fast)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc mã nguồn và tự kiểm chứng

### Danh sách kiểm tra trước khi tự tinh chỉnh

Bạn có ảnh và câu lệnh cùng thời điểm với hành động không? Dữ liệu đã chia train/kiểm tra theo lượt thực thi chưa? Vector lệnh là vị trí, độ thay đổi vị trí hay vận tốc? Đã ghi đúng giá trị trung bình/độ lệch chuẩn để giải chuẩn hóa chưa? Đã thử cho mô hình học một số ít lần làm mẫu để bắt lỗi quy trình trước chưa?

Sau khi ổn, đánh giá cả tỷ lệ hoàn thành ngoài đời lẫn độ trễ và lệnh vượt giới hạn. Đó mới là cách nói một bản mô hình đã lưu đã dùng được trên robot đích.
