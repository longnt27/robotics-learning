## Vì sao cần nghiên cứu này?

### Tại sao RTC phiên bản đầu vẫn tốn công lúc chạy?

RTC ở thời điểm suy luận có thể lấy một mạng sinh hành động đã học trước rồi thêm ràng buộc để nối đoạn. Nhưng khi quá trình sinh phải chỉnh nhiều lần để giữ phần đã cam kết, chi phí tính toán tăng. **RTC huấn luyện sẵn chuyển việc học cách tôn trọng tiền tố sang giai đoạn huấn luyện**, để đến lúc chạy mô hình biết sinh phần tương lai từ các lệnh đã biết.

Đây là bài tiếp nối RTC đầu tiên, không phải thuật toán hoàn toàn không liên quan. Câu hỏi mới là: thay vì “sửa” chuỗi sinh ra để khớp đoạn cũ mỗi lần, liệu có thể huấn luyện chính sách điều khiển ngay từ đầu cho bài toán ấy không?

![Hình 1 gốc từ PDF bài báo, trang 2](/paper-figures/rtc-training/figure-1.webp)

## Kiến thức nền

### Phân biệt tiền tố với phần tiếp theo

**Tiền tố đã cam kết** gồm những hành động robot đã thực hiện hoặc chắc chắn sẽ được bộ điều khiển phát đi trước khi mô hình trả kết quả. Những lệnh ấy không thể bị sửa ngược khi đoạn mới tới. **Hậu tố** là phần hành động tiếp theo cần dự đoán để robot tiếp tục. Gọi d là độ trễ theo số bước và H là độ dài đoạn hành động; s là số bước thực thi của một lần cập nhật. Để tiền tố còn nằm trong vùng hai đoạn hành động chồng nhau, cần thỏa d ≤ H − s.

Trong RTC huấn luyện sẵn, mạng không được tự sửa tiền tố. Nó nhìn những hành động cố định ở đầu chuỗi rồi học cách sinh các bước sau tương thích. Đây là sự khác nhau với mô hình chỉ nhìn ảnh mà không biết bộ điều khiển đang thực thi lệnh nào.

### Quan hệ giữa độ trễ và vùng chồng hành động

Gọi `H` là độ dài đoạn lệnh, `s` là số bước thực thi rồi cập nhật, `d` là số bước mạng cần để tính xong. Để tiền tố đã cam kết nằm trong vùng chồng giữa hai đoạn, phải có `d ≤ H − s`. Ví dụ `H = 16`, `s = 7`, `d = 5`: vùng chồng dài 9 bước nên còn đủ chỗ chứa năm hành động bắt buộc giữ nguyên. Nếu `d` tăng lên 11 thì điều kiện không còn đúng, cần đổi lịch chạy hoặc độ dài đoạn, không thể hy vọng mô hình tự sửa những bước đã thực hiện.

### Sửa đoạn mới khi chạy khác với dạy mô hình nối đoạn từ đầu

RTC lúc suy luận có thể dùng một mô hình sinh hành động đã huấn luyện rồi bổ sung ràng buộc để đoạn mới khớp lệnh cũ. Cách này linh hoạt nhưng quá trình lấy mẫu phải tốn thêm công sức để giữ những bước cố định. Phiên bản RTC lúc huấn luyện đặt câu hỏi khác: **tại sao không cho mạng luyện trước với những đoạn đã có phần đầu bắt buộc giữ nguyên?** Khi học, nó nhìn một tiền tố cố định và phải dự đoán phần còn lại. Lúc chạy, phần tiếp theo được sinh phù hợp ngay từ cách mô hình đã học, thay vì sửa một đoạn hoàn toàn tự do cho tới khi vừa khớp.


## Phương pháp thực hiện

### Huấn luyện bộ sinh để hiểu những lệnh đã cam kết

Trong giai đoạn huấn luyện, người nghiên cứu lấy một chuỗi hành động đúng, chọn một phần đầu làm tiền tố giả định đã được bộ điều khiển thực hiện. Các giá trị tiền tố này được đưa vào mạng ở dạng thật, không thêm nhiễu. Phần hậu tố mới được thêm nhiễu để mạng học khử nhiễu và sinh ra những bước tiếp theo.

Mô hình còn được thông báo độ trễ tương ứng để hiểu tiền tố dài hay ngắn. Trong một DiT dùng flow matching, có thể dùng bước thời gian khác nhau cho token tiền tố và token cần sinh. Nhờ vậy khi chạy, chính sách điều khiển không phải sửa một đoạn mới hoàn toàn tự do cho vừa với lệnh cũ.

### Vì sao token đầu và cuối có cách thêm nhiễu khác nhau?

Khi huấn luyện, người nghiên cứu lấy một đoạn hành động đúng, đánh dấu những bước đầu như thể bộ điều khiển đã cam kết thực hiện. Các giá trị tiền tố được đưa vào mạng không thêm nhiễu; chỉ phần hậu tố mới cần dự đoán và khử nhiễu. Trong DiT kết hợp flow matching, từng token có thể nhận thông tin thời gian lấy mẫu khác nhau. Nhờ đó mạng biết “đây là lệnh cố định” và “đây là lệnh phải tạo ra”.

Đây không phải thêm một tầng suy luận cấp cao về câu lệnh. Nó là cách **huấn luyện bộ sinh chuỗi nhận biết các ràng buộc thời gian**. Nếu tập huấn luyện chỉ dùng một kiểu độ trễ mà máy thật có độ trễ khác hẳn, vẫn cần đánh giá lại khả năng nối đoạn.

### Tại sao phần đầu không thêm nhiễu, phần sau lại thêm?

Giả sử robot chắc chắn sẽ đi thêm bốn bước nữa trước khi mô hình trả lệnh mới. Bốn bước ấy đã được bộ điều khiển lựa chọn, nên trong mẫu huấn luyện chúng đóng vai trò **dữ kiện cố định**, không phải điều mô hình được quyền đoán lại. Các bước tiếp theo mới là phần cần sinh nên được đưa vào quá trình học khử nhiễu. Trong cách xây dựng dựa trên flow matching, mạng có thể nhận thông tin thời gian sinh khác nhau cho những vị trí thuộc tiền tố và hậu tố. Nhờ vậy nó học phân biệt “phải giữ nguyên” với “được dự đoán mới”. Đây là kỹ thuật ràng buộc bộ sinh hành động, không phải cơ chế mới để hiểu câu lệnh người dùng.

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/rtc-training/figure-2.webp)

![Hình 3 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-3.webp)

## Ví dụ từng bước

### Ví dụ robot pha espresso trong lúc mô hình đang tính

Robot đang đưa dụng cụ nén cà phê xuống. Mô hình nhận ảnh mới, nhưng trong 100 ms tiếp theo tay robot vẫn tiếp tục chuyển động theo lệnh đã phát. Nếu mạng tạo ngay quỹ đạo nâng dụng cụ lên từ một vị trí chưa tới, chỗ nối sẽ giật hoặc sai lực nén.

RTC huấn luyện sẵn được học từ các ví dụ “phần đầu đã xảy ra như thế này, hãy sinh phần sau”. Trong nhiệm vụ pha espresso còn có xay, nén, chiết và rót; nối chuyển động liên tục là quan trọng vì một thao tác sai có thể phá cả chuỗi.

![Hình 4 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-4.webp)

## Kết quả thực nghiệm

### Kết quả phiên bản huấn luyện nên đọc thế nào?

Hình 3 đo độ trễ so với tỷ lệ giải xong trong mô phỏng; từ một số mức trễ, mạng được huấn luyện tiền tố làm tốt hơn bản phải áp ràng buộc ở suy luận. Nhưng Hình 5 ở robot thật cho thấy hai phiên bản RTC gần nhau về tỷ lệ thành công và thời gian; cả hai đều nhanh hơn cách chờ tuần tự.

Hai kết quả không mâu thuẫn. Lợi thế có thể phụ thuộc nhiệm vụ, độ trễ, phần cứng và cách sinh đoạn hành động. Khi đọc biểu đồ phải xem số lượt thử và khoảng sai số, không nên lấy ưu thế ở mô phỏng để tuyên bố mọi robot thật đều nhanh hơn.

### So sánh công bằng hai cách RTC

Trong thí nghiệm robot thật với các nhiệm vụ dựng hộp giấy và pha espresso dùng π0.6, **RTC huấn luyện trước ràng buộc đạt khoảng 108 mili giây, còn RTC thêm ràng buộc lúc suy luận khoảng 135 mili giây**. Đây là độ trễ **đầu cuối**, đo khi mô hình chạy từ xa trên H100 với 5 bước khử nhiễu, khác hẳn phép đo chỉ trên GPU của RTC phiên bản trước. Hai phiên bản có kết quả nhiệm vụ gần nhau trong phép thử này. Khoảng chênh 27 mili giây lớn hơn một bước điều khiển 20 mili giây, nhưng không phải mức tiết kiệm cố định trên mọi GPU.

Ở mô phỏng, lợi ích của việc học trước tiền tố rõ hơn khi độ trễ tăng. Ngược lại, khi độ trễ rất nhỏ, không nhất thiết phương án này luôn thắng. Tỷ lệ thành công, thời gian hoàn thành và chi phí huấn luyện bổ sung đều phải được xét cùng nhau.

### Hai phiên bản RTC tốt hơn ở điều kiện nào?

Kết quả mô phỏng gợi ý cách huấn luyện sẵn tiền tố có thể có lợi khi độ trễ tăng. Nhưng ở một nhóm nhiệm vụ robot thật, tỷ lệ hoàn thành của hai phiên bản lại khá gần nhau, dù thời gian tính được báo khoảng 108 so với 135 mili giây. Không nên chọn một cột thuận lợi rồi nói phiên bản mới thắng tuyệt đối. Hãy xét độ trễ thực tế của phần cứng, thời gian hoàn thành, số lượt nhiệm vụ thành công và chi phí huấn luyện thêm. Cũng cần kiểm tra độ trễ có khi vượt vùng chồng hai đoạn hay không: khi lệnh cũ sắp hết mà đoạn mới chưa tới, riêng việc huấn luyện tiền tố không thể cứu được bộ đệm đang cạn.

![Hình 5 từ PDF gốc, trang 3](/paper-figures/rtc-training/figure-5.webp)

## Hạn chế và câu hỏi còn mở

### Giới hạn của việc biết tiền tố ngay từ lúc học

Huấn luyện mạng hiểu tiền tố đòi dữ liệu và cách lấy mẫu phù hợp với độ trễ khi triển khai. Nếu thời gian suy luận thật thay đổi rất khác các trường hợp đã học, chính sách điều khiển có thể dự đoán không chính xác. Không thể chỉ dùng một độ trễ lý tưởng rồi mặc định GPU luôn đúng giờ.

Việc giữ tiền tố cũng không giải quyết phát hiện vật mới, camera mất khung hình hoặc nguy cơ va chạm. Đây là một thành phần của hệ điều khiển, vẫn cần bộ đệm lệnh và kiểm tra an toàn bên ngoài.

## Liên hệ với nghiên cứu khác

### So sánh hai cách RTC bằng một câu

RTC suy luận: **mạng sinh bình thường, quá trình lấy mẫu được ràng buộc để khớp hành động cũ**. RTC huấn luyện: **mạng đã được dạy cách nhận những hành động cũ và sinh tiếp**, nên thường ít cần chỉnh lại trong lúc chạy.

Cả hai khác ACT và Diffusion Policy ở trọng tâm nghiên cứu: ACT và Diffusion Policy học cách tạo hành động có cấu trúc; RTC học cách thực thi các đoạn đó liên tục khi suy luận chậm. Nếu chưa biết phân biệt các tầng ấy, rất dễ so sai bản chất đóng góp.

### Những bài nên đọc tiếp

- [RTC ở thời điểm suy luận](/paper/rtc-inference)
- [ACT](/paper/act)
- [Diffusion Policy](/paper/diffusion-policy)
- [π0.5](/paper/pi-0-5)

## Đọc mã nguồn và tự kiểm chứng

### Bài tập đánh dấu tiền tố

Giả sử đoạn hành động dài H = 16, mô hình chậm d = 5 bước, bộ điều khiển định thực thi s = 7 bước mỗi lần. Kiểm tra điều kiện d ≤ H − s: 5 ≤ 9 nên vẫn có vùng chồng hợp lệ. Hãy tô đỏ năm bước đã cam kết, tô vàng các bước còn chồng nhưng chưa thực thi và tô xanh những bước cần sinh mới.

Sau đó tưởng tượng mạng không được biết năm bước màu đỏ khi huấn luyện. Nó có thể chọn một quỹ đạo mới mâu thuẫn thế nào? Bài tập trục thời gian này là chìa khóa để hiểu Hình 1–2.
