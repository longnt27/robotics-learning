## Vì sao cần nghiên cứu này?

Một robot hiểu câu lệnh “Hãy mang chiếc cốc lại đây” phải kết hợp hai nguồn thông tin: câu chữ cho biết mục tiêu và camera cho biết chiếc cốc đang ở đâu. Mô hình ngôn ngữ chỉ đọc văn bản có thể biết cốc là gì, nhưng không tự nhìn thấy căn phòng hiện tại. **PaLM-E nghiên cứu cách đưa hình ảnh và trạng thái robot vào cùng chuỗi đầu vào của mô hình ngôn ngữ**, để tận dụng kiến thức đã học cho suy luận về thế giới vật lý. Cần nhớ PaLM-E thường hỗ trợ hiểu và lập kế hoạch; việc biến kế hoạch thành góc khớp chính xác còn phụ thuộc bộ điều khiển robot.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/palm-e/figure-1.webp)


### PaLM-E có thực sự điều khiển robot trực tiếp?

Điều quan trọng nhất là phân biệt **suy luận mục tiêu** với **điều khiển động cơ**. Người dùng bảo “Hãy lấy đồ ăn nhẹ cho tôi”; robot cần quan sát đồ vật, nhận biết chỗ để đồ, quyết định bước nào làm trước. PaLM-E được nghiên cứu để giúp hệ thống kết hợp câu chữ với ảnh và trạng thái vật lý khi lập kế hoạch, không phải để xuất mô-men từng khớp trong mọi thí nghiệm.

Bài báo đặt câu hỏi liệu tri thức của mô hình ngôn ngữ lớn, kết hợp mạng nhìn ảnh, có ích khi đưa vào môi trường robot hay không. Đây là bước nối giữa việc “hiểu yêu cầu bằng ngôn ngữ” và “biết thế giới đang ở trạng thái nào”.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

**Suy luận về thế giới vật lý** khác **điều khiển động cơ**. Một mô hình ngôn ngữ biết rằng muốn lấy cốc trong ngăn kéo phải mở ngăn kéo trước, nhưng chưa chắc biết góc xoay của từng khớp. PaLM-E đưa ảnh và thông tin cảm biến vào cùng quá trình suy luận với câu chữ: ảnh được chuyển thành những vector có dạng phù hợp với biểu diễn trong mạng. Chúng vẫn mang thông tin hình ảnh, không biến thành từ ngữ thông thường.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ba mảnh thông tin cần phân biệt

**Token ngôn ngữ** biểu diễn câu người dùng nói. **Biểu diễn ảnh** mang thông tin về vật thể, bố cục và đặc điểm cảnh. **Trạng thái robot** có thể gồm những số cảm biến hoặc biểu diễn ba chiều cho biết robot đang ở đâu, đã cầm vật chưa. PaLM-E đưa các tín hiệu này vào chuỗi đầu vào chung để mô hình suy luận trên chúng.

Trong sơ đồ, những màu khác nhau không phải chỉ để trang trí: chúng đánh dấu token đến từ nguồn nào. Khi đọc kết quả, hãy hỏi tín hiệu ảnh và trạng thái có thật sự được dùng hay mô hình chỉ đoán theo câu chữ. Chính vì vậy cần các phép thử thay đầu vào hoặc thay nguồn dữ liệu.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

PaLM-E phát triển từ mô hình ngôn ngữ PaLM đã huấn luyện trước. Ảnh, biểu diễn không gian ba chiều và trạng thái robot được chuyển thành token, sau đó xen giữa token văn bản. Mạng được huấn luyện chung từ dữ liệu robot, hỏi đáp về ảnh, mô tả ảnh và các nhiệm vụ ngôn ngữ. Phiên bản lớn nhất có **562 tỷ tham số**.

PaLM-E thường đảm nhiệm việc hiểu cảnh và lập các bước làm ở mức cao. Những bộ điều khiển cấp thấp đã có mới biến kế hoạch ấy thành lệnh cho robot. Việc trộn các nguồn dữ liệu cũng giúp mô hình giữ kiến thức ảnh–ngôn ngữ đã học khi tiếp tục học công việc robot.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 7](/paper-figures/palm-e/figure-3.webp)
![Hình 4 từ PDF gốc, trang 8](/paper-figures/palm-e/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/palm-e/figure-2.webp)


### Một lượt sử dụng PaLM-E hoạt động thế nào?

**Bước 1:** nhận chỉ dẫn, ví dụ “Đem chiếc cốc sạch tới bàn”. **Bước 2:** đọc hình ảnh môi trường và dữ liệu cảm biến, chuyển thành biểu diễn mạng có thể xử lý. **Bước 3:** ghép biểu diễn ấy vào chuỗi chứa lời chỉ dẫn. **Bước 4:** mô hình suy luận ra đối tượng và bước tiếp theo ở mức kế hoạch, chẳng hạn tìm cốc, tiếp cận cốc, cầm và mang tới bàn.

**Bước 5:** chính sách điều khiển cấp thấp hoặc bộ thực thi bên ngoài biến các bước ấy thành chuyển động robot, lấy thêm quan sát khi cần. Đừng nhầm “mô hình biết phải cầm cốc” với “mô hình biết ngay 7 góc khớp cần chuyển tới”; đó là hai bài toán kỹ thuật khác nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Người dùng yêu cầu: **“Mang đồ uống nằm sau chiếc hộp lại đây.”** Camera ghi cảnh và cung cấp vị trí tương đối của các vật. Từ lời yêu cầu, mạng tìm đối tượng cần lấy, phân biệt nó với chiếc hộp ở phía trước rồi đề xuất trình tự tiếp cận và mang tới vị trí đích.

Bộ điều khiển riêng thực thi những bước như đưa tay tới, kẹp và nhấc. Nếu đồ uống đã bị chuyển chỗ, hệ thống cần quan sát lại. Khi đọc sơ đồ, hãy chỉ ra phần nào tạo kế hoạch và phần nào thực sự ra lệnh motor; chúng là hai nhiệm vụ khác nhau.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ giữa hai căn bếp khác nhau

Ở bếp thứ nhất, cốc nằm cạnh vòi nước. Ở bếp thứ hai, nó nằm trên kệ. Câu lệnh vẫn giống nhau nhưng tọa độ khác, nên hệ thống phải dựa trên quan sát chứ không thể nhớ một chuỗi lệnh cố định. Nếu đã học kiến thức rằng cốc dùng để uống và kệ là nơi để đồ, mô hình có thể tận dụng tri thức ngôn ngữ/hình ảnh để chọn hướng tìm kiếm hợp lý hơn.

Đó là ý tưởng chuyển giao tri thức của PaLM-E. Nhưng để kiểm chứng, phải đo hiệu quả thực sự trên môi trường mới; không thể suy ra từ một đoạn câu trả lời nghe hợp lý.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo cho thấy một mô hình có thể tham gia những bài toán robot, hỏi đáp về ảnh, mô tả ảnh và ngôn ngữ. Các phép thử so những trường hợp có hoặc không có dữ liệu và tham số học trước để kiểm tra khả năng chuyển kiến thức khi lượt thao tác mẫu của robot khan hiếm.

Khi tăng quy mô mô hình, mức **quên năng lực ngôn ngữ cũ** được báo cáo giảm trong các thiết lập thử. Đây là bằng chứng tích cực cho việc huấn luyện chung nhiều nguồn dữ liệu. Nhưng việc giữ điểm số ngôn ngữ tốt không tự chứng minh robot đã hiểu lực tiếp xúc hoặc biết điều khiển động tác chính xác.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 9](/paper-figures/palm-e/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Cách hiểu kết quả chuyển giao

Hình 2–3 so sánh những cấu hình dùng hoặc không dùng tiền huấn luyện và trộn dữ liệu ảnh–ngôn ngữ với dữ liệu robot. Mục tiêu là tìm xem nguồn tri thức ngoài robot có giúp tác vụ robot khi demonstration rất ít hay không. Thí nghiệm với 1% dữ liệu là một điều kiện khắt khe, nhưng phải giữ đúng điều kiện của phép so khi diễn giải.

Hình 5 đánh giá thêm khả năng ngôn ngữ vốn có: học thao tác robot có làm mạng quên khả năng trả lời câu hỏi bằng chữ không? Khi mô hình lớn hơn, mức quên được báo cáo giảm. Điều đó cho thấy công trình quan tâm cả hai chiều chuyển giao, không chỉ điểm điều khiển robot.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Giới hạn:** PaLM-E vẫn dựa nhiều vào các kỹ năng điều khiển sẵn có. Nếu robot chưa biết thực hiện động tác cần thiết, một kế hoạch hợp lý từ mô hình ngôn ngữ không tự tạo thành lệnh khớp đáng tin cậy. Ảnh bị che, câu lệnh mơ hồ hoặc dữ liệu cảm biến sai vẫn có thể khiến mô hình chọn nhầm vật.

**Cần phân biệt khi diễn giải:** nghiên cứu thể hiện năng lực suy luận đa phương thức nhiều hơn điều khiển motor trực tiếp. Phiên bản hàng trăm tỷ tham số còn tốn tài nguyên lớn. “Mô hình biết phải làm gì” không đồng nghĩa “robot thực hiện chính xác tới milimét cuối cùng”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Điều PaLM-E chưa chứng minh

Mô hình có thể lập ra kế hoạch đúng nhưng robot vẫn không gắp nổi vật do sai vị trí hoặc giới hạn kẹp. Đồng thời một mô hình có hàng tỷ tham số có thể chậm và tốn bộ nhớ, không phù hợp chạy trực tiếp trong mọi vòng điều khiển nhanh.

Các thí nghiệm kết hợp nhiều nhiệm vụ nhưng không chứng minh rằng một mô hình duy nhất thay thế mọi thành phần cảm biến và điều khiển. Khi đọc kết quả, phải phân biệt phần nào do PaLM-E sinh và phần nào do hệ thống hành động cấp thấp đảm nhiệm.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [Qwen-VLA](/paper/qwen-vla)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Liên hệ với RT-2 và GR00T

PaLM-E nhấn mạnh việc biến quan sát thành một phần đầu vào của mô hình ngôn ngữ để hỗ trợ suy luận về môi trường vật lý. RT-2 xem token hành động như một phần đầu ra của mô hình ảnh–ngôn ngữ; GR00T N1 lại tách rõ phần hiểu ảnh/câu lệnh khỏi mô-đun chuyên sinh chuyển động.

Ba phương án không thể so trực tiếp bằng số tham số hoặc một tỷ lệ thành công lấy từ các thiết lập khác nhau. Hãy đối chiếu vị trí mô hình trong toàn hệ thống robot: *nó đang hiểu và lập kế hoạch, hay trực tiếp phát lệnh vận động?*

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Có thể dựng một bộ mã hóa minh họa: ánh xạ vector ảnh 512 chiều và trạng thái robot 12 chiều về cùng kích thước với token của Transformer, sau đó ghép vào một chuỗi. Kiểm tra cách đánh dấu vị trí và cách mạng nhận biết từng nguồn thông tin.

Thử bỏ tín hiệu ảnh nhưng giữ câu hỏi “chiếc cốc nằm ở đâu”. Nếu mô hình không còn câu trả lời dựa trên cảnh thực tế, ta thấy vai trò của quan sát. Đây mới là phép thử cách ghép tín hiệu, chưa phải một hệ thống điều khiển robot hoàn chỉnh.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự trả lời ba câu trước khi sang bài mới

Nếu camera không cho thấy chiếc cốc ở vị trí hiện tại, PaLM-E có thể suy ra ngay vị trí khớp cần gắp không? Vì sao? Nếu bỏ dữ liệu ảnh nhưng giữ câu lệnh, kỳ vọng loại lỗi nào tăng lên? Nếu trộn dữ liệu robot và dữ liệu ảnh–ngôn ngữ đem lại lợi ích, cần giữ những điều kiện nào giống nhau trong phép thử?

Một cách ghi chép hữu ích là vẽ ba ô: **hiểu câu lệnh**, **hiểu cảnh**, **điều khiển vật lý**. Ghi mô-đun nào giải từng phần, rồi đánh dấu phần nào đã được thí nghiệm thực tế chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

