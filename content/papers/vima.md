## Vì sao cần nghiên cứu này?

### Hiểu vấn đề qua một tình huống

Giả sử trên bàn có ba khối giống nhau nhưng khác màu. Người dùng đưa ảnh một khối màu xanh và bảo robot: “Đặt vật giống hình này vào chiếc bát ở bên phải.” Nếu chỉ nhận câu lệnh “đặt khối vào bát”, robot không biết phải chọn khối nào. Nếu hệ thống chỉ hiểu một danh sách nhiệm vụ đã viết sẵn, mỗi kiểu câu lệnh mới lại cần một cách xử lý riêng. **VIMA giải quyết phần giao tiếp nhiệm vụ:** cho phép mô tả điều cần làm bằng chữ xen lẫn hình ảnh và ví dụ.

Điều đáng nhớ là VIMA không biến robot thành một hệ thống thông minh với mọi đồ vật thật. Công trình chủ yếu kiểm tra một môi trường mô phỏng có cấu trúc, nơi cách nhận biết và biểu diễn vật thể thuận lợi hơn ngoài đời. Bài toán nghiên cứu là: khi mô tả nhiệm vụ linh hoạt hơn, mô hình có làm được tổ hợp thao tác mới mà không cần huấn luyện lại hay không?

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/vima/figure-1.webp)

## Kiến thức nền cần nắm

### Hiểu các thành phần trước khi nhìn sơ đồ

**Prompt** là toàn bộ lời giao việc, có thể bao gồm đoạn chữ, ảnh vật mẫu hoặc hình thể hiện trạng thái đích. **Quan sát** là những gì camera robot nhìn thấy trong môi trường hiện tại. Hai thứ không giống nhau: prompt cho biết *cần làm gì*, còn quan sát cho biết *đang có gì và ở đâu*. Ví dụ ảnh trong prompt là chiếc cốc mẫu, trong khi camera hiện tại thấy ba chiếc cốc phải phân biệt.

**Token theo vật thể** là một mẩu thông tin đại diện cho một vật đã được nhận diện, chẳng hạn hình dạng và vị trí tương đối của chiếc cốc. Thay vì bắt mạng tự phát hiện mọi quan hệ từ hàng trăm nghìn điểm ảnh, VIMA có sẵn một số cấu trúc để chỉ tới vật cụ thể. Đây là lợi thế nhưng cũng là giả định: khi không tách được vật khỏi nền hoặc vật bị che khuất, vấn đề trở nên khó hơn. **Chú ý chéo (cross-attention)** giúp phần điều khiển tham khảo những thông tin liên quan trong prompt lúc quyết định thao tác.


### ### Một lời giao việc có hai loại hình ảnh

Giả sử mày đưa ảnh một chiếc cốc làm mẫu, rồi camera robot lại chụp được ba chiếc cốc trên bàn. Ảnh mẫu **không cho biết tọa độ để gắp**; nó chỉ giúp xác định đặc điểm của thứ cần tìm. Ảnh camera **không thay thế được lời giao việc**; nó cho biết những vật nào đang hiện diện và vị trí của chúng. Robot phải nối hai nguồn thông tin ấy trước khi tính hành động. Nếu chỉ nói “mô hình hiểu prompt đa phương thức” mà bỏ qua bước đối chiếu này, người đọc vẫn chưa biết phần khó nằm ở đâu.

## Phương pháp thực hiện

### Từng bước VIMA đưa prompt thành lệnh robot

**Bước 1:** hệ thống đọc prompt, chuyển chữ và hình tham chiếu thành các token. Các token cần giữ được sự khác biệt giữa “cốc được chọn”, “vị trí đích” và những ví dụ kèm theo. **Bước 2:** camera cung cấp trạng thái bàn làm việc hiện tại; mỗi vật được biểu diễn bằng những đặc trưng có thể dùng để so với vật trong prompt.

**Bước 3:** Transformer kết hợp lịch sử thao tác, quan sát mới và prompt. Cơ chế chú ý chéo cho phép phần dự đoán hành động tìm tới thông tin quan trọng trong prompt, chẳng hạn đặc điểm khối xanh hoặc quan hệ “bên phải”. **Bước 4:** mạng dự đoán lệnh điều khiển tiếp theo; robot thực hiện và cập nhật quan sát. Quá trình lặp lại nhiều bước, không phải chỉ nhìn ảnh một lần rồi xuất ra toàn bộ nhiệm vụ.

Phải phân biệt hai năng lực: hiểu đúng vật cần chọn và thực hiện thành công thao tác kẹp/đặt. Một mô hình có thể làm tốt bước đầu mà vẫn thất bại ở bước sau.


### ### Chú ý chéo thực sự giúp ích ở bước nào?

Hình dung mỗi vật trên bàn có một tấm thẻ thông tin, còn prompt có một tấm thẻ ghi “vật giống mẫu xanh”. Trong cơ chế chú ý chéo, biểu diễn dùng để dự đoán hành động có thể tham khảo những phần liên quan của prompt khi xử lý cảnh hiện tại. Nó không đơn giản là ghép hai đoạn chữ vào nhau: thông tin về vật cần chọn được sử dụng ngay trong quá trình quyết định. Sau khi chọn đúng vật, robot vẫn phải phát các lệnh tiếp cận, kẹp và đặt. Vì thế chọn đúng khối xanh mà kẹp trượt không chứng minh cơ chế tham chiếu prompt bị sai.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/vima/figure-2.webp)

![Hình 3 từ PDF gốc, trang 4](/paper-figures/vima/figure-3.webp)

![Hình 4 từ PDF gốc, trang 5](/paper-figures/vima/figure-4.webp)

![Hình 7 từ PDF gốc, trang 8](/paper-figures/vima/figure-7.webp)

## Ví dụ từng bước

### Thử theo dõi một lượt thao tác

Đặt một khối đỏ, một khối xanh và một khối vàng trên bàn. Trong prompt, người dùng chỉ đưa ảnh khối xanh và ảnh chiếc khay đích. Lúc bắt đầu, robot phải nối đặc trưng khối xanh trong prompt với đúng khối đang thấy qua camera. Sau đó, nó cần tiếp cận, kẹp vật, nhấc khỏi mặt bàn và đặt vào khay. Nếu đổi chỗ các khối, mô hình không được tiếp tục đi tới tọa độ cũ; nó phải tham khảo ảnh mới để tìm lại vật đích.

Bây giờ đổi hình tham chiếu thành khối vàng nhưng giữ nguyên câu chữ. Nếu kết quả vẫn luôn là nhặt khối xanh, rất có thể mô hình đang bỏ qua ảnh trong prompt. Thử nghiệm nhỏ này cho thấy vì sao việc mô tả nhiệm vụ đa phương thức phải được kiểm tra bằng những lần *thay riêng một tín hiệu*.

## Kết quả thực nghiệm

### Đọc kết quả để biết cơ chế nào hữu ích

VIMA-BENCH có bốn mức thử, mỗi mức ngày càng khác tình huống huấn luyện. Thành công ở mức dễ chỉ chứng minh mô hình tái hiện được các cách kết hợp quen thuộc; mức khó mới cho biết khả năng dùng lại kiến thức khi đổi đồ vật, quan hệ và cách chỉ dẫn. Khi đọc biểu đồ, nên so các phương pháp cùng điều kiện và chú ý xu hướng qua bốn mức, không chỉ chọn con số cao nhất.

Hình 6 kiểm tra bộ mã hóa ảnh: giữ bài toán gần như giống nhau, thay cách tạo token từ hình. Hình 7 kiểm tra cơ chế đưa prompt vào mạng. **Thí nghiệm tách thành phần (ablation)** là giữ nguyên phần lớn mô hình, chỉ đổi một cơ chế rồi đo xem kết quả khác đi thế nào. Kết quả cho thấy chú ý chéo đặc biệt có ích ở mô hình nhỏ và tình huống khó. Đó là bằng chứng cho một lựa chọn thiết kế, không phải bảo đảm mọi cấu hình robot thật đều có cùng mức cải thiện.



### Đọc số liệu theo bốn mức thay đổi nhiệm vụ

Bài báo báo cáo mức thành công cao hơn tối đa khoảng 2,9 lần so với kiến trúc đối chứng ở một số điều kiện thử và hiệu quả học từ dữ liệu cao hơn ở một số phép so. Đây không phải hệ số cải thiện cố định của mọi nhiệm vụ. Hãy xem riêng các mức thử: càng thay đổi nhiều yếu tố chưa thấy khi huấn luyện, tỷ lệ thành công nhìn chung càng giảm. Các biểu đồ ở Hình 4–7 giúp phân biệt lợi ích của việc tăng mô hình, tăng dữ liệu và thay cách đưa prompt vào bộ điều khiển.


### ### Một phép thử nhỏ để tách hai nguyên nhân thất bại

Giữ nguyên ba khối, câu lệnh và vị trí khay; chỉ thay ảnh mẫu từ xanh sang vàng. Nếu robot vẫn nhặt xanh, hãy nghi ngờ nó chưa dùng đúng ảnh tham chiếu. Nếu robot chuyển sang nhặt vàng nhưng làm rơi vật, lỗi nằm ở khả năng thao tác. Khi đọc VIMA-BENCH, hãy áp dụng cách tách này ở mức lớn hơn: cấp kiểm tra khó lên là do vật lạ, tổ hợp quan hệ lạ hay kiểu nhiệm vụ mới? Chỉ nhìn một tỷ lệ thành công tổng hợp sẽ che mất câu trả lời.

![Hình 5 từ PDF gốc, trang 6](/paper-figures/vima/figure-5.webp)

![Hình 6 từ PDF gốc, trang 7](/paper-figures/vima/figure-6.webp)

## Hạn chế và câu hỏi còn mở

### Giới hạn cần hiểu đúng

Những hình minh họa sinh động có thể khiến ta quên rằng điều kiện mô phỏng thường sạch và có quy luật hơn thế giới thật. Robot thật phải xử lý vật bị che, phản chiếu ánh sáng, thay đổi góc camera, sai số vị trí và lực kẹp. Chưa có đủ bằng chứng chỉ từ bộ đánh giá mô phỏng để kết luận VIMA giải được mọi vấn đề ấy.

Cũng cần tách việc mô hình hiểu một prompt mới khỏi việc nó học được một kỹ năng vận động mới. Nếu chỉ dẫn yêu cầu một động tác vật lý chưa từng có trong dữ liệu, khả năng kết hợp chữ và ảnh không tự sinh ra kỹ năng đó. Kết quả đúng nên được diễn giải là **khái quát trong phạm vi nhiệm vụ và môi trường được đánh giá**.

## Liên hệ với nghiên cứu khác

### Liên hệ với hướng nghiên cứu sau này

VIMA chủ yếu trả lời câu hỏi “người dùng có thể mô tả một việc bằng bao nhiêu loại tín hiệu?”; RT-1 trả lời câu hỏi “một mô hình có thể học nhiều công việc từ dữ liệu robot thật không?”; RT-2 hỏi tiếp “kiến thức từ mô hình ảnh–ngôn ngữ có giúp robot hiểu yêu cầu mới không?”. Đọc chúng theo trình tự này sẽ thấy ba bài không đơn giản là cùng một mạng Transformer với tên khác nhau.

Điểm chung là các mô hình phải chuyển biểu diễn ngôn ngữ/hình ảnh thành hành động hợp lệ. Điểm khác nhau là nguồn dữ liệu, cách tạo đầu vào và phạm vi thử nghiệm. Không nên lấy tỷ lệ thành công từ các bộ nhiệm vụ khác nhau rồi so như một bảng xếp hạng.

### Những bài nên đọc tiếp

- [RT-2](/paper/rt-2)
- [LIBERO](/paper/libero)

## Đọc mã nguồn và tự kiểm chứng

### Tự kiểm tra xem đã hiểu bài chưa

**Câu 1:** Vì sao ảnh trong prompt khác ảnh do camera robot ghi? Hãy trả lời bằng ví dụ chiếc cốc mẫu và ba cốc thật. **Câu 2:** Khi đổi khối xanh thành khối vàng trong prompt, thành phần nào phải khiến robot thay đổi lựa chọn? **Câu 3:** Hình 7 đang thay đổi cái gì, và thứ gì cần được giữ giống nhau để phép thử có ý nghĩa?

Nếu muốn tự dựng một kiểm tra đơn giản, hãy tạo ba cảnh chỉ khác ở vật được yêu cầu, giữ nguyên camera và cách đặt khay. Ghi lại vật robot chọn trước khi quan tâm nó đã đặt thành công hay chưa. Đó là cách phân biệt lỗi hiểu prompt với lỗi điều khiển.
