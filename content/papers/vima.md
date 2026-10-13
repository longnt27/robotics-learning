## Vì sao cần nghiên cứu này?

Một robot thực tế không phải lúc nào cũng nhận nhiệm vụ dưới một string cố định. User có thể đưa text, ảnh mục tiêu, ảnh vật thể, hoặc một demonstration làm ví dụ. Những policy cũ thường xây interface riêng cho từng loại conditioning, nên rất khó có một mô hình chung và khó đo khả năng khái quát một cách có hệ thống. VIMA hỏi: **nếu mọi nhiệm vụ đặc tả đều được biểu diễn như một multimodal prompt, robot có thể học một interface chung giống mô hình nền tảng không?**

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/vima/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 cho thấy nhiệm vụ robot có thể chỉ định bằng prompt đa phương thức: không chỉ một câu lệnh mà còn hình ảnh đối tượng tham chiếu hoặc ví dụ hành động. Điều này giải quyết một hạn chế của task ID hay label cố định: 'đặt vật giống hình vào khu vực kia' cần model hiểu mối quan hệ giữa prompt và scene. Nhưng prompt giúp diễn đạt mục tiêu phong phú hơn, không có nghĩa robot đã học được mọi thao tác vật lý; VIMA chủ yếu được nghiên cứu trong môi trường mô phỏng có cấu trúc.

### Hiểu vấn đề qua một tình huống

Giả sử trên bàn có ba khối giống nhau nhưng khác màu. Người dùng đưa ảnh một khối màu xanh và bảo robot: “Đặt vật giống hình này vào chiếc bát ở bên phải.” Nếu chỉ nhận câu lệnh “đặt khối vào bát”, robot không biết phải chọn khối nào. Nếu hệ thống chỉ hiểu một danh sách nhiệm vụ đã viết sẵn, mỗi kiểu câu lệnh mới lại cần một cách xử lý riêng. **VIMA giải quyết phần giao tiếp nhiệm vụ:** cho phép mô tả điều cần làm bằng chữ xen lẫn hình ảnh và ví dụ.

Điều đáng nhớ là VIMA không biến robot thành một hệ thống thông minh với mọi đồ vật thật. Công trình chủ yếu kiểm tra một môi trường mô phỏng có cấu trúc, nơi cách nhận biết và biểu diễn vật thể thuận lợi hơn ngoài đời. Bài toán nghiên cứu là: khi mô tả nhiệm vụ linh hoạt hơn, mô hình có làm được tổ hợp thao tác mới mà không cần huấn luyện lại hay không?

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Trong VIMA, **prompt** là đặc tả của nhiệm vụ, không chỉ sentence. Nó có thể gồm hình ảnh của mục tiêu và vật thể tham chiếu; những thành phần này cần fusion với quan sát hiện tại. Object-centric tokens đưa một inductive bias mạnh: bài toán từ toàn ảnh chuyển thành tập vật thể được nhận diện/segment sẵn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu các thành phần trước khi nhìn sơ đồ

**Prompt** là toàn bộ lời giao việc, có thể bao gồm đoạn chữ, ảnh vật mẫu hoặc hình thể hiện trạng thái đích. **Quan sát** là những gì camera robot nhìn thấy trong môi trường hiện tại. Hai thứ không giống nhau: prompt cho biết *cần làm gì*, còn quan sát cho biết *đang có gì và ở đâu*. Ví dụ ảnh trong prompt là chiếc cốc mẫu, trong khi camera hiện tại thấy ba chiếc cốc phải phân biệt.

**Token theo vật thể** là cách biến từng vật được nhận diện thành một đơn vị thông tin. Thay vì bắt mạng tự phát hiện mọi quan hệ từ hàng trăm nghìn điểm ảnh, VIMA có sẵn một số cấu trúc để chỉ tới vật cụ thể. Đây là lợi thế nhưng cũng là giả định: khi không tách được vật khỏi nền hoặc vật bị che khuất, vấn đề trở nên khó hơn. **Chú ý chéo (cross-attention)** giúp phần điều khiển tham khảo những thông tin liên quan trong prompt lúc quyết định thao tác.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Bài báo giới thiệu **VIMA-Bench**, gồm 17 nhóm nhiệm vụ, hơn **600 nghìn expert các quỹ đạo** và nhiều level khả năng khái quát ngày càng khó. Prompt có thể chứa text lẫn token thị giác. Kiến trúc dùng đã pretrain text encoder, object-centric token thị giác và Transformer để cross-attend vào prompt rồi autoregressively sinh action.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/vima/figure-3.webp)
![Hình 4 từ PDF gốc, trang 5](/paper-figures/vima/figure-4.webp)
![Hình 7 từ PDF gốc, trang 8](/paper-figures/vima/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Một điểm quan trọng là benchmark cố tách nhiều kiểu OOD: novel placement, vật thể mới combination, novel nhiệm vụ composition và level khó nhất là nhiệm vụ templates mới. Mô hình được scale từ cỡ nhỏ đến khoảng 200M parameters để xem hiệu năng có obey scaling trend không.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/vima/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 định nghĩa nhiều mức generalization của VIMA-BENCH. Đây mới là bản chất benchmark: test model trên nhiệm vụ/tổ hợp chưa gặp trong training chứ không chỉ xem nó tái hiện ví dụ quen thuộc. Khi đọc hình, hãy xác định yếu tố nào được giữ nguyên và yếu tố nào thay đổi ở từng level, rồi xem success rate có giảm khi compositional novelty tăng không. Một metric gộp duy nhất có thể che mất chuyện model chỉ giỏi các tổ hợp gần training distribution.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ prompt gồm ảnh chiếc khối có hoa văn, một lệnh 'đặt vật giống như mẫu vào bên trái vật màu xanh', và ảnh scene hiện tại có nhiều khối tương tự. Hệ phải grounding được tham chiếu hình ảnh, quan hệ 'bên trái' và kế hoạch chuyển động của gripper. Tạo ba mức test: đúng kiểu vật và vị trí từng gặp, vật mới nhưng quan hệ quen, rồi tổ hợp cả vật và quan hệ mới. Nếu model chỉ thành công mức đầu, không được gọi đó là generalization theo prompt chỉ vì interface đầu vào là multimodal.

### Từng bước VIMA đưa prompt thành lệnh robot

**Bước 1:** hệ thống đọc prompt, chuyển chữ và hình tham chiếu thành các token. Các token cần giữ được sự khác biệt giữa “cốc được chọn”, “vị trí đích” và những ví dụ kèm theo. **Bước 2:** camera cung cấp trạng thái bàn làm việc hiện tại; mỗi vật được biểu diễn bằng những đặc trưng có thể dùng để so với vật trong prompt.

**Bước 3:** Transformer kết hợp lịch sử thao tác, quan sát mới và prompt. Cơ chế chú ý chéo cho phép phần dự đoán hành động tìm tới thông tin quan trọng trong prompt, chẳng hạn đặc điểm khối xanh hoặc quan hệ “bên phải”. **Bước 4:** mạng dự đoán lệnh điều khiển tiếp theo; robot thực hiện và cập nhật quan sát. Quá trình lặp lại nhiều bước, không phải chỉ nhìn ảnh một lần rồi xuất ra toàn bộ nhiệm vụ.

Phải phân biệt hai năng lực: hiểu đúng vật cần chọn và thực hiện thành công thao tác kẹp/đặt. Một mô hình có thể làm tốt bước đầu mà vẫn thất bại ở bước sau.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Prompt kiểu `Put [ảnh cốc xanh] next to [ảnh hộp đỏ]` tách thành đoạn text và vật thể tokens. Transformer nhìn bối cảnh hiện tại, cross-attend vào prompt và sinh thao tác pick/place. Lúc đánh giá, thay cốc xanh bằng vật mới hoặc đổi quan hệ không gian để đo prompt khả năng khái quát.

Level khó nhất của VIMA-Bench không đồng nghĩa open-world: nhiệm vụ vẫn thuộc grammar mô phỏng, dù hoán đổi vật thể/combination.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Thử theo dõi một lượt thao tác

Đặt một khối đỏ, một khối xanh và một khối vàng trên bàn. Trong prompt, người dùng chỉ đưa ảnh khối xanh và ảnh chiếc khay đích. Lúc bắt đầu, robot phải nối đặc trưng khối xanh trong prompt với đúng khối đang thấy qua camera. Sau đó, nó cần tiếp cận, kẹp vật, nhấc khỏi mặt bàn và đặt vào khay. Nếu đổi chỗ các khối, mô hình không được tiếp tục đi tới tọa độ cũ; nó phải tham khảo ảnh mới để tìm lại vật đích.

Bây giờ đổi hình tham chiếu thành khối vàng nhưng giữ nguyên câu chữ. Nếu kết quả vẫn luôn là nhặt khối xanh, rất có thể mô hình đang bỏ qua ảnh trong prompt. Thử nghiệm nhỏ này cho thấy vì sao việc mô tả nhiệm vụ đa phương thức phải được kiểm tra bằng những lần *thay riêng một tín hiệu*.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

VIMA outperform các alternative kiến trúc cùng dữ liệu khá mạnh trên hard zero-shot splits. Bài báo báo có thiết lập **tới 2.9x tỷ lệ thành công của nhiệm vụ** so với kiến trúc thay thế ở cùng dữ liệu budget, và **2.7x hiệu năng với ít hơn 10x dữ liệu** trong một số comparison. Kích thước mô hình và dữ liệu size đều giúp systematic khả năng khái quát, không chỉ memorization huấn luyện nhiệm vụ.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 6](/paper-figures/vima/figure-5.webp)
![Hình 6 từ PDF gốc, trang 7](/paper-figures/vima/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Quan trọng hơn, level khả năng khái quát càng xa huấn luyện grammar thì hiệu năng vẫn tụt rõ. Điều đó vừa là kết quả tốt vừa là warning: multimodal prompting giúp rất nhiều, nhưng không biến robot thành GPT cho vật lý chỉ sau một đêm.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả để biết cơ chế nào hữu ích

VIMA-BENCH có bốn mức thử, mỗi mức ngày càng khác tình huống huấn luyện. Thành công ở mức dễ chỉ chứng minh mô hình tái hiện được các cách kết hợp quen thuộc; mức khó mới cho biết khả năng dùng lại kiến thức khi đổi đồ vật, quan hệ và cách chỉ dẫn. Khi đọc biểu đồ, nên so các phương pháp cùng điều kiện và chú ý xu hướng qua bốn mức, không chỉ chọn con số cao nhất.

Hình 6 kiểm tra bộ mã hóa ảnh: giữ bài toán gần như giống nhau, thay cách tạo token từ hình. Hình 7 kiểm tra cơ chế đưa prompt vào mạng. “Thí nghiệm tách thành phần” ở đây là đổi một cơ chế rồi xem kết quả đổi ra sao; **ablation không có nghĩa mài mòn hay cắt lớp**. Kết quả cho thấy chú ý chéo đặc biệt có ích ở mô hình nhỏ và tình huống khó. Đó là bằng chứng cho một lựa chọn thiết kế, không phải bảo đảm mọi cấu hình robot thật đều có cùng mức cải thiện.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** perception dựa vào vật thể detector riêng nên có thể fail khi occlusion/OOD. VIMA-Bench là mô phỏng với action primitives khá sạch, chưa phản ánh toàn bộ contact động lực học của robot thật. Nhóm nhiệm vụ tuy đa dạng nhưng vẫn procedurally được tạo ra từ một grammar tương đối rõ.

**Phê bình thêm:** object-centric biểu diễn đã cho mô hình một inductive bias cực mạnh, tức một phần bài toán perception khó ngoài đời đã được giải hộ. Action không gian có các primitive tương đối high-level nên độ chính xác control, force, độ trễ và phục hồi bị che đi. “Novel nhiệm vụ” vẫn nằm trong thế giới Ravens/VIMA chứ chưa phải open-world nhiệm vụ. Do đó VIMA rất mạnh để học **khả năng khái quát structure**, nhưng không nên dùng nó làm evidence rằng một policy đã sẵn sàng cho household robotics.

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

Chạy VIMA-Bench trên một prompt type. Giữ chuyển động primitive không đổi rồi thay modality của prompt: chỉ text, text + vật thể hình ảnh. Log thành công theo mức OOD. Để debugging, visualize attention từ quan sát vật thể token đến prompt vật thể token.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự kiểm tra xem đã hiểu bài chưa

**Câu 1:** Vì sao ảnh trong prompt khác ảnh do camera robot ghi? Hãy trả lời bằng ví dụ chiếc cốc mẫu và ba cốc thật. **Câu 2:** Khi đổi khối xanh thành khối vàng trong prompt, thành phần nào phải khiến robot thay đổi lựa chọn? **Câu 3:** Hình 7 đang thay đổi cái gì, và thứ gì cần được giữ giống nhau để phép thử có ý nghĩa?

Nếu muốn tự dựng một kiểm tra đơn giản, hãy tạo ba cảnh chỉ khác ở vật được yêu cầu, giữ nguyên camera và cách đặt khay. Ghi lại vật robot chọn trước khi quan tâm nó đã đặt thành công hay chưa. Đó là cách phân biệt lỗi hiểu prompt với lỗi điều khiển.

<!-- END EXTENDED WALKTHROUGH -->

