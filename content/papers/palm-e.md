## Vì sao cần nghiên cứu này?

### PaLM-E có thực sự điều khiển robot trực tiếp?

Điều quan trọng nhất là phân biệt **suy luận mục tiêu** với **điều khiển động cơ**. Người dùng bảo “Hãy lấy đồ ăn nhẹ cho tôi”; robot cần quan sát đồ vật, nhận biết chỗ để đồ, quyết định bước nào làm trước. PaLM-E được nghiên cứu để giúp hệ thống kết hợp câu chữ với ảnh và trạng thái vật lý khi lập kế hoạch, không phải để xuất mô-men từng khớp trong mọi thí nghiệm.

Bài báo đặt câu hỏi liệu tri thức của mô hình ngôn ngữ lớn, kết hợp mạng nhìn ảnh, có ích khi đưa vào môi trường robot hay không. Đây là bước nối giữa việc “hiểu yêu cầu bằng ngôn ngữ” và “biết thế giới đang ở trạng thái nào”.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/palm-e/figure-1.webp)

## Kiến thức nền cần nắm

### Ba mảnh thông tin cần phân biệt

**Token ngôn ngữ** biểu diễn các phần của câu chỉ dẫn, để mô hình có thể xử lý chúng cùng thông tin từ cảm biến. **Biểu diễn ảnh** mang thông tin về vật thể, bố cục và đặc điểm cảnh. **Trạng thái robot** có thể gồm những số cảm biến hoặc biểu diễn ba chiều cho biết robot đang ở đâu, đã cầm vật chưa. PaLM-E đưa các tín hiệu này vào chuỗi đầu vào chung để mô hình suy luận trên chúng.

Trong sơ đồ, những màu khác nhau không phải chỉ để trang trí: chúng đánh dấu token đến từ nguồn nào. Khi đọc kết quả, hãy hỏi tín hiệu ảnh và trạng thái có thật sự được dùng hay mô hình chỉ đoán theo câu chữ. Chính vì vậy cần các phép thử thay đầu vào hoặc thay nguồn dữ liệu.

### ### Biết phải lấy cốc nào không đồng nghĩa biết cách kẹp

Khi nghe yêu cầu “Lấy một món đồ để uống nước”, hệ thống cần biết chiếc cốc phù hợp hơn chiếc thìa. Đó là kiến thức về **nghĩa của đồ vật và yêu cầu**. Nhưng để nhấc chiếc cốc thật, robot còn phải xác định vị trí, hình dạng, lực kẹp và quỹ đạo tránh va chạm. PaLM-E nghiên cứu cách đưa ảnh cùng trạng thái vật lý vào mô hình ngôn ngữ để hỗ trợ phần suy luận; nó không tuyên bố một chuỗi token ngôn ngữ tự trở thành mô-men điều khiển của mọi khớp. Tách hai tầng này giúp hiểu vì sao bài báo có thể đánh giá cả nhiệm vụ suy luận lẫn robot.


## Phương pháp thực hiện

### Một lượt sử dụng PaLM-E hoạt động thế nào?

**Bước 1:** nhận chỉ dẫn, ví dụ “Đem chiếc cốc sạch tới bàn”. **Bước 2:** đọc hình ảnh môi trường và dữ liệu cảm biến, chuyển thành biểu diễn mạng có thể xử lý. **Bước 3:** ghép biểu diễn ấy vào chuỗi chứa lời chỉ dẫn. **Bước 4:** mô hình suy luận ra đối tượng và bước tiếp theo ở mức kế hoạch, chẳng hạn tìm cốc, tiếp cận cốc, cầm và mang tới bàn.

**Bước 5:** một chính sách điều khiển cấp thấp hoặc bộ thực thi bên ngoài biến các bước ấy thành chuyển động robot, lấy thêm quan sát khi cần. Đừng nhầm “mô hình biết phải cầm cốc” với “mô hình biết ngay 7 góc khớp cần chuyển tới”; đó là hai bài toán kỹ thuật khác nhau.

### ### Vì sao phải đưa cảm biến vào cùng lúc với câu lệnh?

Giả sử câu lệnh là “Cất cốc sạch vào tủ”. Nếu chỉ đọc chữ, mô hình có thể biết cần mở tủ trước nhưng không biết cốc đang ở đâu, tủ nào đang mở hoặc tay robot đã cầm cốc chưa. Thông tin ảnh và trạng thái robot giúp quyết định bước tiếp theo dựa trên **tình hình hiện tại**. Sau khi thực thi một bước, cảnh có thể thay đổi nên việc quan sát lại là cần thiết. Nếu một hệ thống vẫn trả lời giống nhau khi ta đổi ảnh và trạng thái nhưng giữ nguyên câu chữ, cần nghi ngờ nó đang dựa quá nhiều vào kiến thức ngôn ngữ thay vì thế giới thật trước mắt.

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/palm-e/figure-2.webp)

![Hình 3 từ PDF gốc, trang 7](/paper-figures/palm-e/figure-3.webp)

![Hình 4 từ PDF gốc, trang 8](/paper-figures/palm-e/figure-4.webp)

## Ví dụ từng bước

### Ví dụ giữa hai căn bếp khác nhau

Ở bếp thứ nhất, cốc nằm cạnh vòi nước. Ở bếp thứ hai, nó nằm trên kệ. Câu lệnh vẫn giống nhau nhưng tọa độ khác, nên hệ thống phải dựa trên quan sát chứ không thể nhớ một chuỗi lệnh cố định. Nếu đã học kiến thức rằng cốc dùng để uống và kệ là nơi để đồ, mô hình có thể tận dụng tri thức ngôn ngữ/hình ảnh để chọn hướng tìm kiếm hợp lý hơn.

Đó là ý tưởng chuyển giao tri thức của PaLM-E. Nhưng để kiểm chứng, phải đo hiệu quả thực sự trên môi trường mới; không thể suy ra từ một đoạn câu trả lời nghe hợp lý.

## Kết quả thực nghiệm

### Cách hiểu kết quả chuyển giao

Hình 2–3 so sánh những cấu hình dùng hoặc không dùng tiền huấn luyện và trộn dữ liệu ảnh–ngôn ngữ với dữ liệu robot. Mục tiêu là tìm xem nguồn tri thức ngoài robot có giúp tác vụ robot khi lần làm mẫu rất ít hay không. Thí nghiệm với 1% dữ liệu là một điều kiện khắt khe, nhưng phải giữ đúng điều kiện của phép so khi diễn giải.

Hình 5 đánh giá thêm khả năng ngôn ngữ vốn có: học thao tác robot có làm mạng quên khả năng trả lời câu hỏi bằng chữ không? Khi mô hình lớn hơn, mức quên được báo cáo giảm. Điều đó cho thấy công trình quan tâm cả hai chiều chuyển giao, không chỉ điểm điều khiển robot.



### Phải đo khả năng suy luận và thao tác ở hai tầng

Điểm nổi bật của PaLM-E không phải một tỷ lệ thành công dùng cho mọi robot. Bài báo đối chiếu nhiều loại nhiệm vụ và quy mô mô hình, trong đó có bản lớn 562 tỷ tham số. Nhìn Hình 2–3 để xem dữ liệu ảnh–ngôn ngữ và kiến thức từ mô hình học trước giúp gì khi lần người điều khiển robot làm mẫu rất ít; xem Hình 5 để biết việc học thêm dữ liệu robot ảnh hưởng năng lực ngôn ngữ cũ ra sao. Những phép thử này không thay thế phép đo kỹ năng kẹp và đặt trên robot thật.

### ### Đọc kết quả chuyển giao từ cả hai phía

Công trình kiểm tra liệu kiến thức học từ ảnh và chữ ngoài dữ liệu robot có giúp nhiệm vụ robot khi số lần làm mẫu ít không. Nhưng chiều ngược lại cũng quan trọng: học thêm dữ liệu robot có làm mô hình kém đi ở các câu hỏi ngôn ngữ trước đó không? Vì vậy Hình 2–3 và Hình 5 cần được đọc cùng nhau. Một mô hình lớn có thể giữ năng lực ngôn ngữ tốt hơn nhưng điều đó không chứng minh nó đã học được cách cầm nắm chính xác trên mọi tay máy. Kết luận luôn phải gắn với nhiệm vụ được đo.

![Hình 5 từ PDF gốc, trang 9](/paper-figures/palm-e/figure-5.webp)

## Hạn chế và câu hỏi còn mở

### Điều PaLM-E chưa chứng minh

Mô hình có thể lập ra kế hoạch đúng nhưng robot vẫn không gắp nổi vật do sai vị trí hoặc giới hạn kẹp. Đồng thời một mô hình có hàng tỷ tham số có thể chậm và tốn bộ nhớ, không phù hợp chạy trực tiếp trong mọi vòng điều khiển nhanh.

Các thí nghiệm kết hợp nhiều nhiệm vụ nhưng không chứng minh rằng một mô hình duy nhất thay thế mọi thành phần cảm biến và điều khiển. Khi đọc kết quả, phải phân biệt phần nào do PaLM-E sinh và phần nào do hệ thống hành động cấp thấp đảm nhiệm.

## Liên hệ với nghiên cứu khác

### Liên hệ với RT-2 và GR00T

PaLM-E nhấn mạnh việc biến quan sát thành một phần đầu vào của mô hình ngôn ngữ để hỗ trợ suy luận về môi trường vật lý. RT-2 xem token hành động như một phần đầu ra của mô hình ảnh–ngôn ngữ; GR00T N1 lại tách rõ phần hiểu ảnh/câu lệnh khỏi mô-đun chuyên sinh chuyển động.

Ba phương án không thể so trực tiếp bằng số tham số hoặc một tỷ lệ thành công lấy từ các thiết lập khác nhau. Hãy đối chiếu vị trí mô hình trong toàn hệ thống robot: *nó đang hiểu và lập kế hoạch, hay trực tiếp phát lệnh vận động?*

### Những bài nên đọc tiếp

- [RT-2](/paper/rt-2)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc mã nguồn và tự kiểm chứng

### Tự trả lời ba câu trước khi sang bài mới

Nếu camera không cho thấy chiếc cốc ở vị trí hiện tại, PaLM-E có thể suy ra ngay vị trí khớp cần gắp không? Vì sao? Nếu bỏ dữ liệu ảnh nhưng giữ câu lệnh, kỳ vọng loại lỗi nào tăng lên? Nếu trộn dữ liệu robot và dữ liệu ảnh–ngôn ngữ đem lại lợi ích, cần giữ những điều kiện nào giống nhau trong phép thử?

Một cách ghi chép hữu ích là vẽ ba ô: **hiểu câu lệnh**, **hiểu cảnh**, **điều khiển vật lý**. Ghi mô-đun nào giải từng phần, rồi đánh dấu phần nào đã được thí nghiệm thực tế chứng minh.
