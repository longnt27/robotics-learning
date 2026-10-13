## Vì sao cần nghiên cứu này?

Hãy tưởng tượng robot cần đi vòng một vật cản. Nó có thể đi bên trái hoặc bên phải, cả hai đều đúng. Nếu mô hình học một hành động “trung bình” từ hai cách này, robot có thể chọn đường đi thẳng vào vật cản. Đây là nhược điểm của cách học bắt chước dự đoán trực tiếp một giá trị khi dữ liệu có nhiều phương án hợp lệ. **Diffusion Policy học cách tạo ra cả đoạn chuyển động bằng quá trình khử nhiễu**, nhờ đó có thể chọn một phương án rồi thực hiện nhất quán. Công trình còn nghiên cứu việc quan sát lại trong khi chạy để robot sửa kế hoạch khi môi trường thay đổi.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 7 từ PDF gốc, trang 6](/paper-figures/diffusion-policy/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->
<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/diffusion-policy/figure-1.webp)


### Vì sao lấy trung bình hành động có thể làm robot đâm vào vật?

Giả sử robot muốn đẩy một khối qua chướng ngại. Trong dữ liệu huấn luyện, một nửa người vận hành vòng bên trái và nửa còn lại vòng bên phải. Cả hai đều đúng. Nếu mạng học dự đoán một giá trị bằng cách giảm sai số bình phương, nó có thể chọn quỹ đạo ở giữa hai hướng, tức đi thẳng vào chướng ngại. Vấn đề không nằm ở thiếu nhãn, mà ở chỗ **một trạng thái có thể có nhiều đáp án vận động hợp lệ**.

Diffusion Policy không ép các demonstration về một đường đi “trung bình”. Nó học cách tạo ra cả chuỗi hành động giống các đường đi hợp lệ, rồi lấy mẫu để chọn một đường nhất quán trong mỗi lần chạy. Đây là ý chính cần giữ khi đọc công thức khử nhiễu.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Một trạng thái robot đôi khi có **nhiều cách xử lý đều đúng**. Khi cần tránh vật cản, robot có thể đi vòng trái hoặc vòng phải. Nếu mô hình cố dự đoán một đường đi trung bình giữa hai cách, nó lại có thể đi thẳng vào vật cản. Đây là lý do cần học cả phân phối của những chuỗi hành động hợp lệ.

**Diffusion** là phương pháp sinh dữ liệu bằng cách bắt đầu từ nhiễu rồi sửa dần thành một mẫu hợp lệ. Hai loại “bước thời gian” cần phân biệt: bước khử nhiễu là một lượt tính toán để tạo chuỗi; bước điều khiển là một thời điểm robot thực sự chuyển động. Một chuỗi có 20 hành động không có nghĩa mạng chỉ cần 20 lượt khử nhiễu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu ba cách dự đoán trước khi nhìn công thức

**Policy tường minh** có thể nhận ảnh rồi dự đoán trực tiếp lệnh; khi nhiều cách thao tác cùng đúng, một giá trị trung bình dễ trở thành phương án tồi. **Policy ngầm** đánh giá xem một hành động phù hợp với quan sát tới mức nào rồi tìm hành động có điểm tốt. Cách này linh hoạt nhưng khâu tìm kiếm có thể khó tối ưu hoặc chạy không ổn định.

**Mô hình diffusion** bắt đầu từ một chuỗi lệnh ngẫu nhiên, rồi sửa đi sửa lại theo hướng mô hình đã học cho đến khi trông giống chuyển động hợp lệ trong dữ liệu. **Đoạn hành động (action chunk)** là nhiều bước liên tiếp được dự đoán cùng lúc. Nhờ vậy mô hình không cần tự chọn hướng mới một cách thiếu nhất quán ở từng khung hình.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Diffusion Policy nhận quan sát từ camera và trạng thái robot, sau đó tạo **một đoạn hành động**. Ban đầu đoạn này chỉ gồm các giá trị nhiễu. Ở mỗi lượt khử nhiễu, mạng sử dụng thông tin quan sát để sửa đoạn dự đoán, đưa nó dần gần các quỹ đạo hợp lệ trong dữ liệu huấn luyện.

Robot không nhất thiết thực thi toàn bộ chuỗi vừa tạo. Nó chạy một phần đầu, lấy quan sát mới rồi sinh đoạn kế tiếp. Cách **dự đoán trước nhưng chỉ thực thi từng phần** giúp phản ứng khi vị trí vật thay đổi. Bài báo thử cả mạng tích chập và Transformer để xử lý dữ liệu theo thời gian. Điểm chính không phải chỉ chọn một kiến trúc, mà là kết hợp mô hình sinh nhiều phương án với vòng điều khiển có quan sát lại.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 3](/paper-figures/diffusion-policy/figure-3.webp)
![Hình 8 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-8.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/diffusion-policy/figure-2.webp)


### Từ ảnh camera tới chuỗi chuyển động

**Bước 1:** lấy một số quan sát mới nhất từ camera và trạng thái robot. **Bước 2:** sinh một đoạn chuỗi hành động toàn nhiễu, coi như chưa biết robot sẽ đi đâu. **Bước 3:** mạng dự đoán phần nhiễu cần loại bỏ dựa trên hình ảnh và chuỗi hiện tại. Lặp nhiều lần, đoạn chuyển động dần trở nên có cấu trúc: tiếp cận khối, chạm đúng cạnh, rồi đẩy.

**Bước 4:** robot chỉ thực thi một phần đầu của đoạn đã sinh. Sau đó camera cung cấp ảnh mới và mô hình tạo đoạn tiếp theo. Đây là điều khiển có quan sát lại, khác với việc phát một quỹ đạo duy nhất rồi để robot chạy hết. Trong kiến trúc CNN, FiLM đưa thông tin quan sát vào các lớp xử lý; trong bản Transformer, chú ý chéo kết nối token hành động với đặc trưng quan sát.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Trong nhiệm vụ đẩy khối chữ T, người điều khiển có thể tiếp cận khối từ bên trái hoặc bên phải. Cả hai chuỗi thao tác đều có thể thành công. Khi huấn luyện, ta lấy chuỗi hành động mẫu, thêm nhiễu vào rồi dạy mạng dự đoán cách loại bỏ nhiễu đó.

Khi robot chạy, mạng bắt đầu bằng chuỗi nhiễu ngẫu nhiên và sửa qua nhiều lượt để tạo ra một đoạn chuyển động phù hợp với vị trí khối hiện tại. Robot chỉ thực hiện những bước đầu; sau đó camera quan sát lại để mô hình dự đoán tiếp. **Độ dài đoạn dự đoán** và **số bước thực sự phát xuống robot** không bắt buộc bằng nhau. Đoạn càng dài có thể càng nhất quán, nhưng cũng dễ chậm phản ứng khi cảnh thay đổi.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 4](/paper-figures/diffusion-policy/figure-4.webp)
![Hình 9 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-9.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hình dung bài toán đẩy khối chữ T

Trên bàn, khối chữ T cần được đẩy vào vùng đích. Robot có thể vòng một bên rồi đổi hướng đẩy, hoặc bắt đầu từ bên khác mà vẫn tới đúng chỗ. Diffusion Policy học sự khác biệt giữa những phương án này. Khi đã chọn tiếp cận từ bên phải trong một lần chạy, chuỗi lệnh cần tiếp tục theo cách đó, không đột nhiên nhảy sang trái ở bước kế.

Bây giờ người dùng xê dịch khối trong lúc robot đang đi tới vùng đích. Nếu camera cập nhật đủ nhanh, policy có cơ hội nhận ra vị trí mới và tạo chuỗi lệnh sửa sai. Ví dụ ở Hình 9 cho thấy hiện tượng này trong thí nghiệm; nhưng nó không có nghĩa mọi loại nhiễu đều được xử lý tốt.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên 12 nhiệm vụ thuộc bốn nhóm đánh giá, nhóm tác giả báo cáo mức cải thiện trung bình khoảng **46,9%** theo cách tính tổng hợp của họ so với các phương pháp đối chứng. Các nhiệm vụ robot thật còn có lật cốc, rót và dàn nước sốt. Diffusion Policy thường thực hiện tốt hơn một số mô hình hồi quy trực tiếp hoặc mô hình xác suất dùng để so sánh, đặc biệt khi thao tác có nhiều đường đi hợp lệ.

Hình 4 minh họa vì sao lựa chọn một quỹ đạo nhất quán quan trọng hơn tạo ra giá trị trung bình. Hình 6 kiểm tra việc thay độ dài chuỗi và độ trễ. Khi đọc kết quả, cần xét cả tỷ lệ thành công lẫn chi phí sinh hành động, không chỉ đường hàm mất mát.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 5](/paper-figures/diffusion-policy/figure-5.webp)
![Hình 6 từ PDF gốc, trang 5](/paper-figures/diffusion-policy/figure-6.webp)
![Hình 10 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-10.webp)
![Hình 11 từ PDF gốc, trang 10](/paper-figures/diffusion-policy/figure-11.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả và thí nghiệm tách thành phần

Điểm cần theo dõi không chỉ là tỷ lệ thành công tổng hợp. Hình 4 so khả năng giữ một cách đi xuyên suốt lần thực thi; Hình 5 thay loại lệnh vị trí/vận tốc; Hình 6 thay độ dài đoạn hành động và độ trễ. Một đoạn quá dài có thể mượt nhưng khó phản ứng với vật bị di chuyển; đoạn quá ngắn có thể cập nhật nhanh nhưng dễ dao động. Đấy là sự đánh đổi có ý nghĩa thực tế.

**Ablation** tức thử bỏ hoặc đổi riêng một thành phần để xem tác dụng của nó. Thí nghiệm này không phải “nghiên cứu phá vỡ”. Khi đọc các biểu đồ, hãy hỏi tỷ lệ thành công được đo trên bao nhiêu lượt chạy và đường sai số có lớn không. Kết quả loss tốt hơn chưa chắc dẫn tới thao tác tốt hơn, như so sánh với IBC ở Hình 7.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Giới hạn của phương pháp:** Diffusion Policy vẫn học bắt chước từ demonstration. Nếu dữ liệu thiếu loại thao tác cần làm hoặc chứa nhiều ví dụ sai, mạng không thể tự biết mọi cách xử lý đúng. Quá trình khử nhiễu nhiều lần cũng tốn thời gian hơn một mạng chỉ dự đoán hành động trong một lượt.

**Điều cần thận trọng khi so sánh:** kết quả tăng không nhất thiết chỉ do diffusion. Cách xử lý chuỗi, độ dài đoạn hành động, vòng quan sát lại và việc tinh chỉnh tham số đều ảnh hưởng. Khi triển khai robot thật, cần đo độ trễ từ ảnh camera tới lệnh điều khiển và kiểm tra cách nối các đoạn liên tiếp. Đây chính là nhóm vấn đề sau này RTC giải quyết.

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

Hãy thử nhiệm vụ Push-T ở chế độ dùng trạng thái vật. Giữ nguyên tập dữ liệu, thay số lượt khử nhiễu và độ dài đoạn hành động. Với cùng một quan sát, vẽ mười quỹ đạo được sinh ra và xem chúng có theo những đường đi hợp lệ khác nhau hay vô tình đâm vào vật cản.

Sau đó đo tỷ lệ hoàn thành và thời gian sinh lệnh khi robot chạy thử. Nếu mô hình cho quỹ đạo đẹp nhưng phát lệnh quá chậm, hệ thống vẫn có thể thất bại. **Đừng chỉ đánh giá bằng sai số dự đoán trên dữ liệu ghi sẵn.**

**Tự kiểm tra:** phân biệt bước khử nhiễu với bước điều khiển, giải thích vì sao lấy trung bình hai quỹ đạo có thể sai, và nêu giới hạn do độ trễ.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự thử để thấy vì sao nhiều phương án là quan trọng

Vẽ hai đường đi tránh một khối trên giấy: một vòng trái, một vòng phải. Lấy trung bình điểm tương ứng của hai đường, rồi nhìn xem đường trung bình có đi qua vật cản không. Đây là cách hình dung đơn giản hạn chế của dự đoán hành động trung bình.

Tiếp tục đặt câu hỏi: tại mỗi lần cập nhật camera, diffusion sinh lại toàn bộ đoạn hay chỉ phần sẽ được thực thi? Nếu tăng độ dài đoạn, lỗi nào có thể xuất hiện? Nếu nguồn ảnh bị trễ, đường đi mượt có đủ chứng minh điều khiển an toàn? Trả lời được sẽ giúp đọc đúng hơn phần đánh giá thực nghiệm.

<!-- END EXTENDED WALKTHROUGH -->

