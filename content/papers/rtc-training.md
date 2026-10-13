> **Bài do bạn cung cấp.** [Training-Time Action Conditioning for Efficient Real-Time Chunking](https://arxiv.org/abs/2512.05964), Vật lý Intelligence. Bài báo ngắn nhưng tinh tế: nó **thay đổi dữ liệu/mục tiêu huấn luyện lúc huấn luyện** để giảm overhead runtime của inference-time RTC. Nên đọc ngay sau [RTC đầu tiên](/paper/rtc-inference).

## Vì sao cần nghiên cứu này?

RTC phiên bản đầu có thể nối các đoạn hành động ngay lúc suy luận, nhưng cần thêm phép tính để buộc đoạn mới khớp những lệnh robot đang thực hiện. Thật trớ trêu nếu một kỹ thuật nhằm che độ trễ lại khiến chính mô hình chậm thêm. **Training-time RTC đề xuất huấn luyện policy từ đầu để nó biết cách nhận phần hành động đã cam kết và chỉ sinh tiếp phần tương lai.** Cách tiếp cận này chuyển một phần công việc từ thời điểm robot đang chạy sang giai đoạn huấn luyện, với mục tiêu duy trì chuyển động liên tục mà giảm chi phí suy luận.

Bài học rộng hơn là **đưa giới hạn của hệ thống thực vào bài toán huấn luyện**, thay vì đợi model sinh xong rồi mới sửa lệnh. Robot không sống trong một thế giới mà mọi phép tính đều hoàn thành ngay tức khắc: thời gian suy luận có thể thay đổi vì GPU bận, mạng chậm hoặc nhiều yêu cầu đến cùng lúc. Vì thế mô hình nên học ngay cách tiếp tục từ những hành động đã được bộ điều khiển cam kết.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rtc-training/figure-1.webp)


### Tại sao RTC phiên bản đầu vẫn tốn công lúc chạy?

RTC ở thời điểm suy luận có thể lấy một mạng sinh hành động đã học trước rồi thêm ràng buộc để nối đoạn. Nhưng khi quá trình sinh phải chỉnh nhiều lần để giữ phần đã cam kết, chi phí tính toán tăng. **Training-time RTC chuyển việc học cách tôn trọng tiền tố sang giai đoạn huấn luyện**, để đến lúc chạy mô hình biết sinh phần tương lai từ các lệnh đã biết.

Đây là bài tiếp nối RTC đầu tiên, không phải thuật toán hoàn toàn không liên quan. Câu hỏi mới là: thay vì “sửa” chuỗi sinh ra để khớp đoạn cũ mỗi lần, liệu có thể huấn luyện policy ngay từ đầu cho bài toán ấy không?

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

Gọi H là số lệnh trong một đoạn, k là số bước đầu **đã hoặc chắc chắn sẽ thực hiện** trước khi mô hình mới tính xong. Khi sinh đoạn tiếp theo, robot không được xóa những bước ấy. Mô hình cần học dự đoán phần hành động còn lại với điều kiện những bước đầu đã biết.

Trong flow matching, mạng vẫn học chuyển nhiễu thành hành động hợp lệ. Tuy nhiên **tiền tố đã cam kết được giữ sạch**, chỉ phần phía sau được thêm nhiễu rồi học sinh mới. Điều này không có nghĩa lấy một hành động đầu rồi nội suy đường thẳng tới hành động cuối; model vẫn sinh cả chuỗi có cấu trúc.

```text
p(a_{k+1:H} | observation, a_{1:k}, k)
```

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Phân biệt tiền tố với phần tiếp theo

**Tiền tố** là những hành động đã hoặc sẽ chắc chắn thực thi trước khi mô hình tính xong. **Hậu tố** là phần hành động tiếp theo cần dự đoán để robot tiếp tục. Gọi d là độ trễ theo số bước và H là độ dài chunk; s là số bước thực thi của một lần cập nhật. Để tiền tố còn nằm trong vùng hai chunk chồng nhau, cần thỏa d ≤ H − s.

Trong RTC huấn luyện sẵn, mạng không được tự sửa tiền tố. Nó nhìn những hành động cố định ở đầu chuỗi rồi học cách sinh các bước sau tương thích. Đây là sự khác nhau với mô hình chỉ nhìn ảnh mà không biết controller đang thực thi lệnh nào.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Trong lúc huấn luyện, nhóm tác giả lấy một chuỗi demonstration và chọn ngẫu nhiên độ dài tiền tố k tương ứng những mức trễ có thể gặp khi triển khai. **k bước đầu được đưa vào đúng giá trị thật, không thêm nhiễu**; các bước còn lại bị làm nhiễu để mạng học sinh phần tương lai phù hợp.

Với DiT dùng flow matching, thời điểm sinh có thể được thiết lập khác nhau cho từng vị trí trong chuỗi để đánh dấu bước nào đã cố định và bước nào cần dự đoán. Hàm mất mát tập trung vào phần cần sinh mới. Nhờ đã học điều kiện tiền tố từ trước, mô hình khi chạy ít phải dùng thêm các bước chỉnh dự đoán cho khớp chuỗi cũ.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->

```text
k = 0: [ noise noise noise noise noise noise ]
k = 2: [ a1 a2 | noise noise noise noise ]
k = 4: [ a1 a2 a3 a4 | noise noise ]
```

```text
input:  observation + task instruction + robot state
        clean prefix a1...ak
        noisy postfix a{k+1}...aH
        per-position flow times

network: velocity field on postfix
loss:    only postfix positions
```

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/rtc-training/figure-2.webp)


### Huấn luyện bộ sinh để hiểu những lệnh đã cam kết

Trong giai đoạn train, người nghiên cứu lấy một chuỗi hành động đúng, chọn một phần đầu làm tiền tố giả định đã được controller thực hiện. Các giá trị tiền tố này được đưa vào mạng ở dạng thật, không thêm nhiễu. Phần hậu tố mới được thêm nhiễu để mạng học khử nhiễu và sinh ra những bước tiếp theo.

Mô hình còn được thông báo độ trễ tương ứng để hiểu tiền tố dài hay ngắn. Trong một DiT dùng flow matching, có thể dùng bước thời gian khác nhau cho token tiền tố và token cần sinh. Nhờ vậy khi chạy, policy không phải sửa một đoạn mới hoàn toàn tự do cho vừa với lệnh cũ.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot đang gập hộp bìa, còn đoạn cũ gồm nhiều lệnh ép một mép hộp. Mô hình mới mất khoảng 100 mili giây, tương đương năm bước ở 50 Hz. Trong thời gian ấy robot tiếp tục ép theo các lệnh đã gửi.

Nếu mạng sinh chuỗi mới như thể tay robot chưa ép tới vị trí đó, chỗ nối sẽ giật hoặc ép sai lực. Với RTC được học ngay khi huấn luyện, mạng nhận **năm bước đầu đã cam kết** và chỉ sinh tiếp phần sau. Điều này giúp nó tạo quỹ đạo phù hợp với chuyển động đã diễn ra.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ robot pha espresso trong lúc model đang tính

Robot đang đưa dụng cụ nén cà phê xuống. Mô hình nhận ảnh mới, nhưng trong 100 ms tiếp theo tay robot vẫn tiếp tục chuyển động theo lệnh đã phát. Nếu mạng tạo ngay quỹ đạo nâng dụng cụ lên từ một vị trí chưa tới, chỗ nối sẽ giật hoặc sai lực nén.

Training-time RTC được học từ các ví dụ “phần đầu đã xảy ra như thế này, hãy sinh phần sau”. Trong nhiệm vụ pha espresso còn có xay, nén, chiết và rót; nối chuyển động liên tục là quan trọng vì một thao tác sai có thể phá cả chuỗi.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Các phép thử mô phỏng thay độ trễ và so bản RTC áp ràng buộc khi suy luận với bản đã học điều kiện tiền tố từ lúc huấn luyện. Từ một số mức trễ, bản huấn luyện sẵn có tỷ lệ hoàn thành tốt hơn; ở mức trễ nhỏ, ưu thế không phải lúc nào rõ.

Trên robot thật với nhiệm vụ dựng hộp và pha espresso, hai cách RTC cho kết quả khá gần nhau trong thiết lập thử, và đều nhanh hơn cách bắt robot dừng chờ mô hình. Vì thế kết luận chính xác là **lợi ích tùy điều kiện**, không phải phiên bản mới thắng mọi phép đánh giá.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Kết quả phiên bản huấn luyện nên đọc thế nào?

Hình 3 đo độ trễ so với tỷ lệ giải xong trong mô phỏng; từ một số mức trễ, mạng được huấn luyện tiền tố làm tốt hơn bản phải áp ràng buộc ở suy luận. Nhưng Hình 5 ở robot thật cho thấy hai phiên bản RTC gần nhau về tỷ lệ thành công và thời gian; cả hai đều nhanh hơn cách chờ tuần tự.

Hai kết quả không mâu thuẫn. Lợi thế có thể phụ thuộc nhiệm vụ, độ trễ, phần cứng và cách sinh chunk. Khi đọc biểu đồ phải xem số lượt thử và khoảng sai số, không nên lấy ưu thế ở mô phỏng để tuyên bố mọi robot thật đều nhanh hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Cách huấn luyện cần lấy mẫu độ trễ tương đối giống tình huống robot sẽ gặp khi chạy. Nếu GPU lúc triển khai thường chậm hơn nhiều so với các độ trễ đã học, policy có thể dự đoán sai cách nối đoạn. Khi huấn luyện cùng lúc nhiều độ dài tiền tố, năng lực mạng cũng bị chia cho nhiều trường hợp.

Phương pháp không khai thác toàn bộ đoạn tương lai chồng nhau bằng ràng buộc mềm tinh vi như RTC lúc suy luận. Đồng thời nó không thay thế kiểm tra va chạm, giới hạn lực hoặc xử lý camera bị mất tín hiệu. Độ mượt là điều kiện hữu ích, nhưng chưa phải đủ cho an toàn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn của việc biết tiền tố ngay từ lúc học

Huấn luyện mạng hiểu tiền tố đòi dữ liệu và cách lấy mẫu phù hợp với độ trễ khi triển khai. Nếu thời gian suy luận thật thay đổi rất khác các trường hợp đã học, policy có thể dự đoán không chính xác. Không thể chỉ dùng một độ trễ lý tưởng rồi mặc định GPU luôn đúng giờ.

Việc giữ tiền tố cũng không giải quyết phát hiện vật mới, camera mất khung hình hoặc nguy cơ va chạm. Đây là một thành phần của hệ điều khiển, vẫn cần bộ đệm lệnh và kiểm tra an toàn bên ngoài.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [RTC inference-time](/paper/rtc-inference) là phương pháp đối chứng trực tiếp và nơi giải thích guided inpainting.
- [ACT](/paper/act) giúp hiểu temporal aggregation và chunk boundary.
- [Diffusion Policy](/paper/diffusion-policy) giải thích flow/diffusion conditional quỹ đạo lấy mẫu.
- [π0.5](/paper/pi-0-5) là representative modern flow-based VLA stack; bài báo training-time này đánh giá trực tiếp π0.6.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### So sánh hai cách RTC bằng một câu

RTC suy luận: **mạng sinh bình thường, quá trình lấy mẫu được ràng buộc để khớp hành động cũ**. RTC huấn luyện: **mạng đã được dạy cách nhận những hành động cũ và sinh tiếp**, nên thường ít cần chỉnh lại trong lúc chạy.

Cả hai khác ACT và Diffusion Policy ở trọng tâm nghiên cứu: ACT và Diffusion Policy học cách tạo hành động có cấu trúc; RTC học cách thực thi các đoạn đó liên tục khi inference chậm. Nếu chưa biết phân biệt các tầng ấy, rất dễ so sai bản chất đóng góp.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Thử một mô hình nhỏ sinh chuỗi 20 bước, mỗi bước ba chiều. Khi huấn luyện, chọn ngẫu nhiên k từ 0 đến 6, giữ cố định k bước đầu và thêm nhiễu vào phần sau. So ba chế độ: chỉ học k = 3; học nhiều k; và học nhiều k nhưng ưu tiên k = 3.

Đánh giá sai số cùng tỷ lệ hoàn thành riêng theo từng độ trễ, thay vì chỉ lấy trung bình. Sau đó thử ước tính độ trễ sai để xem chỗ nối lệnh có giật hơn không. Đây là phép thử nhỏ đủ hiểu bài báo mà không cần phần cứng đắt tiền.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Bài tập đánh dấu tiền tố

Giả sử chunk dài H = 16, mô hình chậm d = 5 bước, controller định thực thi s = 7 bước mỗi lần. Kiểm tra điều kiện d ≤ H − s: 5 ≤ 9 nên vẫn có vùng chồng hợp lệ. Hãy tô đỏ năm bước đã cam kết, tô vàng các bước còn chồng nhưng chưa thực thi và tô xanh những bước cần sinh mới.

Sau đó tưởng tượng mạng không được biết năm bước màu đỏ khi huấn luyện. Nó có thể chọn một quỹ đạo mới mâu thuẫn thế nào? Bài tập trục thời gian này là chìa khóa để hiểu Hình 1–2.

<!-- END EXTENDED WALKTHROUGH -->

