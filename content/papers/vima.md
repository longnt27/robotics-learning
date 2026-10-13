## Vì sao cần nghiên cứu này?

Giả sử người dùng đưa ảnh một chiếc cốc mẫu và nói “Đặt vật giống thế này vào khay bên phải”. Chỉ từ câu chữ, robot chưa biết chọn chiếc cốc nào trên bàn. **VIMA đề xuất dùng prompt đa phương thức**, kết hợp lời mô tả, ảnh tham chiếu và thậm chí ví dụ thao tác để chỉ định nhiệm vụ. Mô hình phải nối thông tin trong prompt với những vật hiện có trong cảnh, rồi dự đoán hành động phù hợp. Công trình chủ yếu đánh giá trong môi trường mô phỏng có cấu trúc, nhằm tìm hiểu liệu cách giao nhiệm vụ linh hoạt ấy có giúp robot xử lý tổ hợp đồ vật và yêu cầu mới hay không.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/vima/figure-1.webp)


### Hiểu vấn đề qua một tình huống

Giả sử trên bàn có ba khối giống nhau nhưng khác màu. Người dùng đưa ảnh một khối màu xanh và bảo robot: “Đặt vật giống hình này vào chiếc bát ở bên phải.” Nếu chỉ nhận câu lệnh “đặt khối vào bát”, robot không biết phải chọn khối nào. Nếu hệ thống chỉ hiểu một danh sách nhiệm vụ đã viết sẵn, mỗi kiểu câu lệnh mới lại cần một cách xử lý riêng. **VIMA giải quyết phần giao tiếp nhiệm vụ:** cho phép mô tả điều cần làm bằng chữ xen lẫn hình ảnh và ví dụ.

Điều đáng nhớ là VIMA không biến robot thành một hệ thống thông minh với mọi đồ vật thật. Công trình chủ yếu kiểm tra một môi trường mô phỏng có cấu trúc, nơi cách nhận biết và biểu diễn vật thể thuận lợi hơn ngoài đời. Bài toán nghiên cứu là: khi mô tả nhiệm vụ linh hoạt hơn, mô hình có làm được tổ hợp thao tác mới mà không cần huấn luyện lại hay không?

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Trong VIMA, **prompt** là toàn bộ thông tin dùng để giao việc: câu chữ, ảnh của đồ vật được nhắc đến và đôi khi cả ví dụ về kết quả mong muốn. Prompt không phải ảnh camera đang quan sát; ảnh camera cho biết tình trạng hiện tại của bàn làm việc. Chẳng hạn ảnh mẫu chỉ một chiếc cốc xanh, còn camera nhìn thấy cả cốc xanh, cốc đỏ và chiếc khay đích. Robot phải xác định được chiếc cốc nào trong cảnh tương ứng với ảnh mẫu.

VIMA chia thông tin về từng vật thể thành những **token** riêng, thay vì chỉ xử lý toàn bộ ảnh như một khối. Cách này giúp mạng xác định đối tượng được nhắc đến, nhưng cũng phụ thuộc vào chất lượng nhận diện vật thể.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu các thành phần trước khi nhìn sơ đồ

**Prompt** là toàn bộ lời giao việc, có thể bao gồm đoạn chữ, ảnh vật mẫu hoặc hình thể hiện trạng thái đích. **Quan sát** là những gì camera robot nhìn thấy trong môi trường hiện tại. Hai thứ không giống nhau: prompt cho biết *cần làm gì*, còn quan sát cho biết *đang có gì và ở đâu*. Ví dụ ảnh trong prompt là chiếc cốc mẫu, trong khi camera hiện tại thấy ba chiếc cốc phải phân biệt.

**Token theo vật thể** là cách biến từng vật được nhận diện thành một đơn vị thông tin. Thay vì bắt mạng tự phát hiện mọi quan hệ từ hàng trăm nghìn điểm ảnh, VIMA có sẵn một số cấu trúc để chỉ tới vật cụ thể. Đây là lợi thế nhưng cũng là giả định: khi không tách được vật khỏi nền hoặc vật bị che khuất, vấn đề trở nên khó hơn. **Chú ý chéo (cross-attention)** giúp phần điều khiển tham khảo những thông tin liên quan trong prompt lúc quyết định thao tác.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

VIMA gồm hai phần liên quan. **VIMA-BENCH** là môi trường kiểm tra với 17 nhóm nhiệm vụ mô phỏng và hơn 600.000 quỹ đạo ví dụ. Những cấp độ kiểm tra khó hơn yêu cầu robot xử lý các cách kết hợp đồ vật, mục tiêu hoặc bố cục chưa xuất hiện trực tiếp trong dữ liệu học. Nhờ đó, nhóm tác giả có thể kiểm tra khả năng khái quát thay vì chỉ xem robot có lặp lại tình huống quen thuộc hay không.

Về mô hình, chữ và ảnh trong prompt được chuyển thành token. Mạng Transformer kết hợp chúng với những gì camera nhìn thấy và lịch sử thao tác để quyết định lệnh tiếp theo. Bài báo cũng so các kích thước mạng, tới khoảng 200 triệu tham số, nhằm xem quy mô ảnh hưởng tới kết quả thế nào.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/vima/figure-3.webp)
![Hình 4 từ PDF gốc, trang 5](/paper-figures/vima/figure-4.webp)
![Hình 7 từ PDF gốc, trang 8](/paper-figures/vima/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/vima/figure-2.webp)


### Từng bước VIMA đưa prompt thành lệnh robot

**Bước 1:** hệ thống đọc prompt, chuyển chữ và hình tham chiếu thành các token. Các token cần giữ được sự khác biệt giữa “cốc được chọn”, “vị trí đích” và những ví dụ kèm theo. **Bước 2:** camera cung cấp trạng thái bàn làm việc hiện tại; mỗi vật được biểu diễn bằng những đặc trưng có thể dùng để so với vật trong prompt.

**Bước 3:** Transformer kết hợp lịch sử thao tác, quan sát mới và prompt. Cơ chế chú ý chéo cho phép phần dự đoán hành động tìm tới thông tin quan trọng trong prompt, chẳng hạn đặc điểm khối xanh hoặc quan hệ “bên phải”. **Bước 4:** mạng dự đoán lệnh điều khiển tiếp theo; robot thực hiện và cập nhật quan sát. Quá trình lặp lại nhiều bước, không phải chỉ nhìn ảnh một lần rồi xuất ra toàn bộ nhiệm vụ.

Phải phân biệt hai năng lực: hiểu đúng vật cần chọn và thực hiện thành công thao tác kẹp/đặt. Một mô hình có thể làm tốt bước đầu mà vẫn thất bại ở bước sau.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Giả sử prompt ghi: **“Đặt [ảnh cốc xanh] bên cạnh [ảnh hộp đỏ]”**. Đầu tiên, mô hình đọc câu chữ để hiểu quan hệ “bên cạnh”. Tiếp theo, nó đối chiếu hai ảnh tham chiếu với những vật trong cảnh hiện tại. Sau đó, robot tiếp cận đúng cốc, kẹp, nhấc và đặt ở vị trí tương đối so với chiếc hộp.

Để kiểm tra mô hình có thực sự dùng prompt hay không, giữ nguyên bàn và thay ảnh cốc xanh thành ảnh một vật khác. Nếu robot vẫn chọn cốc cũ thì có thể nó đang dựa vào thói quen, không hiểu thông tin trong prompt. Các mức khó của VIMA-BENCH vẫn nằm trong quy tắc của môi trường mô phỏng, chưa phải thế giới mở ngoài đời.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Thử theo dõi một lượt thao tác

Đặt một khối đỏ, một khối xanh và một khối vàng trên bàn. Trong prompt, người dùng chỉ đưa ảnh khối xanh và ảnh chiếc khay đích. Lúc bắt đầu, robot phải nối đặc trưng khối xanh trong prompt với đúng khối đang thấy qua camera. Sau đó, nó cần tiếp cận, kẹp vật, nhấc khỏi mặt bàn và đặt vào khay. Nếu đổi chỗ các khối, mô hình không được tiếp tục đi tới tọa độ cũ; nó phải tham khảo ảnh mới để tìm lại vật đích.

Bây giờ đổi hình tham chiếu thành khối vàng nhưng giữ nguyên câu chữ. Nếu kết quả vẫn luôn là nhặt khối xanh, rất có thể mô hình đang bỏ qua ảnh trong prompt. Thử nghiệm nhỏ này cho thấy vì sao việc mô tả nhiệm vụ đa phương thức phải được kiểm tra bằng những lần *thay riêng một tín hiệu*.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Kết quả cho thấy VIMA vượt một số kiến trúc đối chứng trong những tình huống yêu cầu kết hợp thông tin ảnh và chữ. Nhóm tác giả báo cáo một số thiết lập có tỷ lệ thành công cao tới **2,9 lần** phương pháp so sánh; ở phép thử khác, mô hình đạt hiệu quả cao hơn dù sử dụng lượng dữ liệu ít hơn **10 lần**. Đây là kết quả trong những điều kiện nghiên cứu cụ thể, không phải hệ số cải thiện bảo đảm cho mọi nhiệm vụ robot.

Quan trọng hơn, khi cấp độ khái quát tăng, kết quả vẫn giảm đáng kể. Điều đó cho thấy prompt đa phương thức hữu ích, nhưng chưa đủ để robot xử lý mọi vật thể và thao tác chưa từng gặp.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/vima/figure-5.webp)
![Hình 6 từ PDF gốc, trang 7](/paper-figures/vima/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả để biết cơ chế nào hữu ích

VIMA-BENCH có bốn mức thử, mỗi mức ngày càng khác tình huống huấn luyện. Thành công ở mức dễ chỉ chứng minh mô hình tái hiện được các cách kết hợp quen thuộc; mức khó mới cho biết khả năng dùng lại kiến thức khi đổi đồ vật, quan hệ và cách chỉ dẫn. Khi đọc biểu đồ, nên so các phương pháp cùng điều kiện và chú ý xu hướng qua bốn mức, không chỉ chọn con số cao nhất.

Hình 6 kiểm tra bộ mã hóa ảnh: giữ bài toán gần như giống nhau, thay cách tạo token từ hình. Hình 7 kiểm tra cơ chế đưa prompt vào mạng. “Thí nghiệm tách thành phần” ở đây là đổi một cơ chế rồi xem kết quả đổi ra sao; **ablation không có nghĩa mài mòn hay cắt lớp**. Kết quả cho thấy chú ý chéo đặc biệt có ích ở mô hình nhỏ và tình huống khó. Đó là bằng chứng cho một lựa chọn thiết kế, không phải bảo đảm mọi cấu hình robot thật đều có cùng mức cải thiện.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Hạn chế được thảo luận trong bài:** VIMA phụ thuộc vào hệ thống phát hiện vật thể. Nếu vật bị che hoặc không giống những mẫu đã học, thông tin đầu vào có thể sai trước cả khi Transformer dự đoán hành động. Môi trường mô phỏng còn đơn giản hơn robot thật ở chuyện tiếp xúc, lực kẹp và sai số camera.

**Điều cần lưu ý thêm khi diễn giải:** việc biểu diễn sẵn từng vật giúp mô hình giải quyết một phần khó khăn về nhận biết. Các thao tác trong môi trường được xây theo một bộ quy tắc xác định, nên không thể suy từ điểm VIMA-BENCH rằng mô hình đã đủ an toàn và chính xác để làm việc nhà ngoài đời. Khả năng làm nhiệm vụ mới ở đây phải hiểu trong phạm vi bộ đánh giá.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn cần hiểu đúng

Những hình minh họa sinh động có thể khiến ta quên rằng điều kiện mô phỏng thường sạch và có quy luật hơn thế giới thật. Robot thật phải xử lý vật bị che, phản chiếu ánh sáng, thay đổi góc camera, sai số vị trí và lực kẹp. Chưa có đủ bằng chứng chỉ từ benchmark mô phỏng để kết luận VIMA giải được mọi vấn đề ấy.

Cũng cần tách việc mô hình hiểu một prompt mới khỏi việc nó học được một kỹ năng vận động mới. Nếu chỉ dẫn yêu cầu một động tác vật lý chưa từng có trong dữ liệu, khả năng kết hợp chữ và ảnh không tự sinh ra kỹ năng đó. Kết quả đúng nên được diễn giải là **khái quát trong phạm vi nhiệm vụ và môi trường được đánh giá**.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [LIBERO](/paper/libero)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Liên hệ với hướng nghiên cứu sau này

VIMA chủ yếu trả lời câu hỏi “người dùng có thể mô tả một việc bằng bao nhiêu loại tín hiệu?”; RT-1 trả lời câu hỏi “một mô hình có thể học nhiều công việc từ dữ liệu robot thật không?”; RT-2 hỏi tiếp “kiến thức từ mô hình ảnh–ngôn ngữ có giúp robot hiểu yêu cầu mới không?”. Đọc chúng theo trình tự này sẽ thấy ba bài không đơn giản là cùng một mạng Transformer với tên khác nhau.

Điểm chung là các mô hình phải chuyển biểu diễn ngôn ngữ/hình ảnh thành hành động hợp lệ. Điểm khác nhau là nguồn dữ liệu, cách tạo đầu vào và phạm vi thử nghiệm. Không nên lấy tỷ lệ thành công từ các bộ nhiệm vụ khác nhau rồi so như một bảng xếp hạng.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Có thể bắt đầu bằng một nhóm nhiệm vụ VIMA-BENCH nhỏ. Giữ nguyên bố cục bàn và cách điều khiển, sau đó thay duy nhất nội dung prompt: chỉ chữ, rồi chữ kết hợp ảnh vật mẫu. Ghi tỷ lệ robot chọn đúng đối tượng và tỷ lệ hoàn thành thao tác theo từng cấp độ kiểm tra. Hai tỷ lệ khác nhau sẽ giúp phân biệt **lỗi hiểu yêu cầu** với **lỗi thực thi chuyển động**.

Nếu có công cụ xem trọng số chú ý, thử quan sát mạng đang tham khảo token nào của prompt khi chọn vật. Đây là cách kiểm tra giả thuyết rõ hơn việc chỉ nhìn một video thành công.

**Tự kiểm tra:** hãy giải thích đầu vào, đầu ra, cách huấn luyện, điều kiện đánh giá và ít nhất một tình huống thất bại.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự kiểm tra xem đã hiểu bài chưa

**Câu 1:** Vì sao ảnh trong prompt khác ảnh do camera robot ghi? Hãy trả lời bằng ví dụ chiếc cốc mẫu và ba cốc thật. **Câu 2:** Khi đổi khối xanh thành khối vàng trong prompt, thành phần nào phải khiến robot thay đổi lựa chọn? **Câu 3:** Hình 7 đang thay đổi cái gì, và thứ gì cần được giữ giống nhau để phép thử có ý nghĩa?

Nếu muốn tự dựng một kiểm tra đơn giản, hãy tạo ba cảnh chỉ khác ở vật được yêu cầu, giữ nguyên camera và cách đặt khay. Ghi lại vật robot chọn trước khi quan tâm nó đã đặt thành công hay chưa. Đó là cách phân biệt lỗi hiểu prompt với lỗi điều khiển.

<!-- END EXTENDED WALKTHROUGH -->

