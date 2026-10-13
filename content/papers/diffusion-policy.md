## Vì sao cần nghiên cứu này?

Hãy tưởng tượng robot cần đi vòng một vật cản. Nó có thể đi bên trái hoặc bên phải, cả hai đều đúng. Nếu mô hình học một hành động “trung bình” từ hai cách này, robot có thể chọn đường đi thẳng vào vật cản. Đây là nhược điểm của cách học bắt chước dự đoán trực tiếp một giá trị khi dữ liệu có nhiều phương án hợp lệ. **Diffusion Policy học cách tạo ra cả đoạn chuyển động bằng quá trình khử nhiễu**, nhờ đó có thể chọn một phương án rồi thực hiện nhất quán. Công trình còn nghiên cứu việc quan sát lại trong khi chạy để robot sửa kế hoạch khi môi trường thay đổi.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 7 từ PDF gốc, trang 6](/paper-figures/diffusion-policy/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/diffusion-policy/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 đối chiếu cách biểu diễn policy: một ánh xạ tường minh từ observation sang action, một hàm năng lượng ẩn và một quá trình sinh mẫu từ nhiễu. Trường hợp một trạng thái có hai hướng thao tác hợp lệ rất quan trọng: hồi quy MSE có thể tạo action trung bình nằm giữa hai mode và chẳng mode nào thật sự khả thi. Diffusion Policy mô hình hóa cả phân phối trên chuỗi hành động, vì thế có thể sinh một phương án nhất quán thay vì ép mọi demonstration vào một giá trị trung bình.

### Vì sao lấy trung bình hành động có thể làm robot đâm vào vật?

Giả sử robot muốn đẩy một khối qua chướng ngại. Trong dữ liệu huấn luyện, một nửa người vận hành vòng bên trái và nửa còn lại vòng bên phải. Cả hai đều đúng. Nếu mạng học dự đoán một giá trị bằng cách giảm sai số bình phương, nó có thể chọn quỹ đạo ở giữa hai hướng, tức đi thẳng vào chướng ngại. Vấn đề không nằm ở thiếu nhãn, mà ở chỗ **một trạng thái có thể có nhiều đáp án vận động hợp lệ**.

Diffusion Policy không ép các demonstration về một đường đi “trung bình”. Nó học cách tạo ra cả chuỗi hành động giống các đường đi hợp lệ, rồi lấy mẫu để chọn một đường nhất quán trong mỗi lần chạy. Đây là ý chính cần giữ khi đọc công thức khử nhiễu.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Vấn đề **multimodality**: cùng một bối cảnh có hai đường vòng chướng ngại hợp lệ. Regress với MSE một action trung bình có thể tạo con đường đi thẳng vào chướng ngại. Generative mô hình dự đoán phân phối có nhiều đỉnh sẽ lấy mẫu thuộc một mode thay vì average.

Mô hình diffusion học loại noise từ quỹ đạo. **Denoising timestep** hoàn toàn khác **timestep robot**: một cái là số vòng sinh, cái kia là thời gian vật lý trong action horizon. Nhầm hai thứ này là hiểu sai cả thuật toán.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu ba cách dự đoán trước khi nhìn công thức

**Policy tường minh** có thể nhận ảnh rồi dự đoán trực tiếp lệnh; khi nhiều cách thao tác cùng đúng, một giá trị trung bình dễ trở thành phương án tồi. **Policy ngầm** đánh giá xem một hành động phù hợp với quan sát tới mức nào rồi tìm hành động có điểm tốt. Cách này linh hoạt nhưng khâu tìm kiếm có thể khó tối ưu hoặc chạy không ổn định.

**Mô hình diffusion** bắt đầu từ một chuỗi lệnh ngẫu nhiên, rồi sửa đi sửa lại theo hướng mô hình đã học cho đến khi trông giống chuyển động hợp lệ trong dữ liệu. **Đoạn hành động (action chunk)** là nhiều bước liên tiếp được dự đoán cùng lúc. Nhờ vậy mô hình không cần tự chọn hướng mới một cách thiếu nhất quán ở từng khung hình.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Diffusion Policy biểu diễn cả **action chuỗi/chunk** như một conditional diffusion process. Mô hình bắt đầu từ noise rồi denoise thành một quỹ đạo, điều kiện trên thị giác quan sát và state. Nó dùng receding-horizon control: dự đoán một horizon tương đối dài, thực thi một đoạn ngắn, rồi observe và replan. Bài báo thử cả CNN và Transformer theo thời gian backbone.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 3](/paper-figures/diffusion-policy/figure-3.webp)
![Hình 8 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-8.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Điểm bản chất không phải chỉ “dùng diffusion vì đang hot”, mà là diffusion có thể đại diện nhiều mode của phân phối action và vẫn tạo quỹ đạo temporal-coherent. Chính recipe này sau đó xuất hiện với biến thể flow matching trong π-series, RDT, GR00T, Qwen-VLA và một đống mô hình khác.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/diffusion-policy/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 là ảnh từ các benchmark robot thật. Nó nhắc rằng quality của action không thể chỉ được đánh giá bằng loss trên dataset: cần thực thi trên cơ cấu vật lý, nơi contact, gripper, lực ma sát và sai số calibration làm bài toán khó hơn. Các task dùng UR5 hoặc Franka là bằng chứng trong phạm vi đó, không tự động chứng minh mô hình đã điều khiển tốt mọi loại robot. Khi đọc các ảnh, hãy tách điều policy dự đoán được khỏi điều controller/phần cứng đã xử lý.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ có hai demonstration mở ngăn kéo: một người đưa gripper tiếp cận từ trái, người khác từ phải. Nếu output là trung bình trực tiếp của hai quỹ đạo, robot có thể đi thẳng vào mép ngăn kéo. Diffusion model bắt đầu từ action trajectory nhiễu, denoise qua nhiều bước để chọn một mode hợp lệ theo ảnh quan sát. Chỉ thực thi một phần đầu chunk, sau đó quan sát lại và replan. Điều này cho phép đóng vòng, nhưng số bước denoising ảnh hưởng latency. Một so sánh tử tế phải nhìn trade-off giữa chất lượng mẫu và tốc độ inference.

### Từ ảnh camera tới chuỗi chuyển động

**Bước 1:** lấy một số quan sát mới nhất từ camera và trạng thái robot. **Bước 2:** sinh một đoạn chuỗi hành động toàn nhiễu, coi như chưa biết robot sẽ đi đâu. **Bước 3:** mạng dự đoán phần nhiễu cần loại bỏ dựa trên hình ảnh và chuỗi hiện tại. Lặp nhiều lần, đoạn chuyển động dần trở nên có cấu trúc: tiếp cận khối, chạm đúng cạnh, rồi đẩy.

**Bước 4:** robot chỉ thực thi một phần đầu của đoạn đã sinh. Sau đó camera cung cấp ảnh mới và mô hình tạo đoạn tiếp theo. Đây là điều khiển có quan sát lại, khác với việc phát một quỹ đạo duy nhất rồi để robot chạy hết. Trong kiến trúc CNN, FiLM đưa thông tin quan sát vào các lớp xử lý; trong bản Transformer, chú ý chéo kết nối token hành động với đặc trưng quan sát.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Tạo demo Push-T: quan sát gồm tọa độ pusher và vật T. Với cùng start state, demonstrator có thể đi từ bên trái hoặc bên phải. Lúc huấn luyện, lấy ground truth action chuỗi `A_0`, thêm nhiễu Gaussian để có `A_k`, cho mạng dự đoán noise hoặc denoised quỹ đạo. Inference bắt đầu từ noise, lặp nhiều bước đến action chunk hợp lệ. Robot chỉ thực thi `a_0...a_m`, chụp quan sát mới, rồi replan.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 4](/paper-figures/diffusion-policy/figure-4.webp)
![Hình 9 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Điểm quan trọng: `prediction horizon` và `action horizon` **không giống nhau**. Tăng horizon dự đoán giúp theo thời gian coherence nhưng có thể làm lập kế hoạch bị stale.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hình dung bài toán đẩy khối chữ T

Trên bàn, khối chữ T cần được đẩy vào vùng đích. Robot có thể vòng một bên rồi đổi hướng đẩy, hoặc bắt đầu từ bên khác mà vẫn tới đúng chỗ. Diffusion Policy học sự khác biệt giữa những phương án này. Khi đã chọn tiếp cận từ bên phải trong một lần chạy, chuỗi lệnh cần tiếp tục theo cách đó, không đột nhiên nhảy sang trái ở bước kế.

Bây giờ người dùng xê dịch khối trong lúc robot đang đi tới vùng đích. Nếu camera cập nhật đủ nhanh, policy có cơ hội nhận ra vị trí mới và tạo chuỗi lệnh sửa sai. Ví dụ ở Hình 9 cho thấy hiện tượng này trong thí nghiệm; nhưng nó không có nghĩa mọi loại nhiễu đều được xử lý tốt.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên **12 nhiệm vụ thuộc 4 benchmark families**, tác giả nêu cải thiện trung bình rất lớn so với các phương pháp đối chứng điều khiển từ thị giác, khoảng **46.9%** theo cách tổng hợp của tác giả. Với nhiệm vụ trên robot thật như mug flipping, sauce pouring/spreading, diffusion policy đạt thành công cao trong khi một số phương pháp đối chứng LSTM-GMM hoặc hồi quy thất bại hoặc kém rõ rệt. Huấn luyện cũng ổn định hơn các energy-based alternatives mà bài báo so sánh.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 5](/paper-figures/diffusion-policy/figure-5.webp)
![Hình 6 từ PDF gốc, trang 5](/paper-figures/diffusion-policy/figure-6.webp)
![Hình 10 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-10.webp)
![Hình 11 từ PDF gốc, trang 10](/paper-figures/diffusion-policy/figure-11.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Kết quả có sức ảnh hưởng nhất là qualitative: quỹ đạo mượt nhưng vẫn giữ được nhiều mode, thay vì biến multimodality thành average chuyển động. Từ sau bài báo này, câu hỏi của field đổi từ “diffusion có dùng được cho robot không?” sang “action diffusion/flow nên được ghép vào VLA thế nào và làm sao giảm độ trễ?”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả và thí nghiệm tách thành phần

Điểm cần theo dõi không chỉ là tỷ lệ thành công tổng hợp. Hình 4 so khả năng giữ một cách đi xuyên suốt lần thực thi; Hình 5 thay loại lệnh vị trí/vận tốc; Hình 6 thay độ dài đoạn hành động và độ trễ. Một đoạn quá dài có thể mượt nhưng khó phản ứng với vật bị di chuyển; đoạn quá ngắn có thể cập nhật nhanh nhưng dễ dao động. Đấy là sự đánh đổi có ý nghĩa thực tế.

**Ablation** tức thử bỏ hoặc đổi riêng một thành phần để xem tác dụng của nó. Thí nghiệm này không phải “nghiên cứu phá vỡ”. Khi đọc các biểu đồ, hãy hỏi tỷ lệ thành công được đo trên bao nhiêu lượt chạy và đường sai số có lớn không. Kết quả loss tốt hơn chưa chắc dẫn tới thao tác tốt hơn, như so sánh với IBC ở Hình 7.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** đây vẫn là behavior cloning, nên bad demos hoặc thiếu coverage vẫn đặt trần. Iterative denoising làm inference đắt hơn one-shot regression, gây khó cho high-frequency control. Tác giả cũng chỉ ra hướng kết hợp dữ liệu gây tác động tiêu cực/RL và acceleration như việc cần làm tiếp.

**Phê bình thêm:** không phải mọi gain đều có thể quy cho diffusion; action horizon, receding-horizon control, kiến trúc xử lý chuỗi thời gian và tuning cùng thay đổi. Trong thế giới thực đánh giá vẫn nhỏ so với độ rộng claim. Tính đa phương thức cũng không phải nút thắt chính của mọi nhiệm vụ, nên diffusion có thể là quá phức tạp so với nhu cầu cho một số policy đơn giản. Quan trọng nhất cho VLA hiện đại: iterative denoising tạo ra độ trễ và vấn đề nối các action chunk, thứ mà các bài báo RTC người đọc vừa tìm hiểu phải đi chữa về sau.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn của quá trình sinh nhiều bước

Sinh chuỗi bằng khử nhiễu thường cần nhiều lượt tính toán. Nếu robot cần lệnh mỗi vài chục mili giây mà GPU chậm, chính sách có thể không kịp trả lời. Dự đoán đoạn dài giúp che bớt độ trễ nhưng không xóa được sai số camera, tiếp xúc hoặc khác biệt phần cứng.

Ngoài ra, mô hình học các kiểu thao tác dựa trên dữ liệu quan sát. Nếu bài kiểm tra đòi dạng tiếp xúc hoàn toàn khác, mạng có thể sinh chuỗi trông mượt nhưng vẫn sai. Không nên dùng một video thao tác đẹp để suy ra mô hình đã hiểu đầy đủ vật lý của môi trường.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RDT-1B](/paper/rdt-1b)
- [GR00T N1](/paper/groot-n1)
- [π0.5](/paper/pi-0-5)
- [RTC (inference)](/paper/rtc-inference)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Kết nối với ACT, FAST và RTC

ACT cũng dự đoán đoạn hành động nhưng dùng Transformer và CVAE để học từ demonstration; Diffusion Policy dùng quá trình khử nhiễu để sinh chuỗi có nhiều khả năng. FAST lại không phải một policy diffusion khác: nó là cách mã hóa và nén chuỗi hành động thành token để mô hình tự hồi quy dự đoán dễ hơn.

RTC giải bài toán triển khai nảy sinh sau đó: nếu phải mất thời gian mới sinh xong chunk tiếp theo, làm sao nối hai chuỗi mà robot không giật hoặc dừng? Ba hướng nghiên cứu bổ sung nhau: **sinh hành động → biểu diễn hành động → thực thi hành động đúng nhịp**.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Dùng Push-T state phương pháp đối chứng trong repo chính thức. Plot 10 sampled các quỹ đạo cho cùng quan sát; thay số denoising steps 100/20/5, horizon và action horizon, đo thành công và độ trễ. Đừng kết luận chỉ bằng offline MSE.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự thử để thấy vì sao nhiều phương án là quan trọng

Vẽ hai đường đi tránh một khối trên giấy: một vòng trái, một vòng phải. Lấy trung bình điểm tương ứng của hai đường, rồi nhìn xem đường trung bình có đi qua vật cản không. Đây là cách hình dung đơn giản hạn chế của dự đoán hành động trung bình.

Tiếp tục đặt câu hỏi: tại mỗi lần cập nhật camera, diffusion sinh lại toàn bộ đoạn hay chỉ phần sẽ được thực thi? Nếu tăng độ dài đoạn, lỗi nào có thể xuất hiện? Nếu nguồn ảnh bị trễ, đường đi mượt có đủ chứng minh điều khiển an toàn? Trả lời được sẽ giúp đọc đúng hơn phần đánh giá thực nghiệm.

<!-- END EXTENDED WALKTHROUGH -->

