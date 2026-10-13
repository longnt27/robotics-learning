## Vì sao cần nghiên cứu này?

### Vấn đề không chỉ là mô hình chậm

Robot cần lệnh mới ở tần số 50 Hz, tức mỗi 20 mili giây. Nhưng mô hình VLA có thể mất 100–300 mili giây để sinh một đoạn hành động. Nếu bắt robot đứng yên chờ, việc quẹt diêm, rót chất lỏng hoặc giữ vật có thể bị hỏng giữa chừng. Nếu để robot tiếp tục đoạn cũ rồi lập tức chuyển sang đoạn mới, lại có nguy cơ giật mạnh vì hai đoạn được tính từ quan sát khác nhau.

**RTC giải vấn đề nối hai đoạn hành động trong khi robot đang chạy.** Nó không làm VLM hiểu ảnh tốt hơn hay thay đổi mục tiêu nhiệm vụ. Trọng tâm là giữ những lệnh robot đã bắt đầu thực hiện, rồi sinh phần tương lai còn có thể thay đổi sao cho chuyển động không đứt đoạn.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rtc-inference/figure-1.webp)

![Hình 5 từ PDF gốc, trang 7](/paper-figures/rtc-inference/figure-5.webp)

## Kiến thức nền

### Hiểu tiền tố đã cam kết và độ trễ

**Đoạn hành động (action chunk)** là đoạn gồm nhiều lệnh liên tiếp. **Độ trễ suy luận d** là số nhịp điều khiển trôi qua trong lúc mô hình tính đoạn mới. Giá trị này phụ thuộc vào cả thời gian tính và tần số điều khiển. **Tiền tố đã cam kết** là các lệnh cũ mà bộ điều khiển chắc chắn sẽ thực hiện trước khi kết quả mới xuất hiện. Ta không thể xóa chúng bằng một dự đoán được sinh trễ.

Ví dụ mạng bắt đầu tính lệnh khi robot đang ở bước 3 và phải mất bốn bước mới xong. Khi mạng trả lời, robot đã thực thi bước 4–7. Đoạn mới cần phù hợp với quá khứ không còn sửa được này. Những lệnh tiếp theo thuộc vùng chồng nhau có thể được điều chỉnh mềm; các lệnh vượt khỏi đoạn cũ phải sinh mới.

### Những đại lượng quan trọng khi triển khai

Gọi `H` là số hành động mạng dự đoán mỗi lần, `D` là số chiều lệnh robot, và `s` là số bước robot dự định thực thi trước lần cập nhật tiếp theo. Nếu bộ điều khiển chạy ở 50 Hz, mỗi bước kéo dài 20 mili giây. Khi mô hình mất 160 mili giây để trả lời, robot có thể đã thực hiện thêm khoảng `d = 8` bước. Những bước này không còn quyền sửa.

**Flow matching** học trường chuyển động đưa một mẫu nhiễu tới chuỗi hành động có cấu trúc. Các bước biến đổi trong quá trình sinh mẫu không phải những bước robot đã đi. RTC tận dụng việc có thể cố định một phần chuỗi trong lúc sinh mẫu: hành động đã cam kết được giữ, phần tương lai được tạo cho phù hợp.

### ### Quá khứ đã diễn ra, tương lai còn có thể sửa

Giả sử robot đang đưa tay vòng phía trên một vật cản. Trong lúc nó di chuyển, mô hình tính đoạn lệnh tiếp theo và bất ngờ đề xuất vòng phía dưới. Những lệnh tay robot đã nhận hoặc chắc chắn sẽ nhận trước lúc kết quả mới xuất hiện không thể bị thay thế ngược thời gian. RTC coi chúng là **tiền tố đã cam kết**, rồi sinh những bước còn lại sao cho đoạn mới nối tiếp được đường đang đi. Nếu chỉ lấy trung bình hai quỹ đạo vòng trên và vòng dưới, đường trung bình thậm chí có thể đi thẳng vào vật cản. Vì vậy RTC không phải một cách làm mượt số học đơn giản.


## Phương pháp thực hiện

### RTC trong một vòng điều khiển thực tế

**Bước 1:** robot đang thực thi đoạn A trong bộ đệm; mô hình nhận quan sát mới và bắt đầu tính đoạn B. Hai việc diễn ra đồng thời, không bắt robot dừng. **Bước 2:** ước tính d để xác định những bước của A sẽ được thực hiện trước khi B xong. Đặt ràng buộc rất mạnh cho các bước ấy.

**Bước 3:** ở phần A còn chồng với B nhưng chưa cam kết, dùng mức ràng buộc giảm dần thay vì bắt B bằng A hoàn toàn. **Bước 4:** phần cuối B ngoài độ dài A được sinh mới. **Bước 5:** khi B tới, bộ điều khiển nối vào vị trí đang thực thi, lấy lại quan sát và bắt đầu tính đoạn tiếp.

Điểm khác cách bất đồng bộ ngây thơ: B không được tự chọn một quỹ đạo hoàn toàn mâu thuẫn với phần A đã chạy.

### Ví dụ bộ đệm gồm hai vòng chạy song song

```text
BỘ ĐIỀU KHIỂN                       MÔ HÌNH SUY LUẬN
Dùng lệnh 1 trong đoạn cũ           Nhận ảnh camera mới
Dùng lệnh 2 trong đoạn cũ           Ước lượng độ trễ
Dùng lệnh 3 trong đoạn cũ           Giữ phần lệnh đã cam kết
Dùng lệnh 4 trong đoạn cũ           Sinh phần hành động tương lai
Nhận đoạn mới và tiếp tục      ←     Trả đoạn hành động mới
```

Một điểm dễ bỏ sót: nếu đoạn mới chọn đường đi hoàn toàn khác, việc kết hợp trung bình hai chuỗi không tự bảo đảm an toàn. RTC giữ cứng các bước không sửa được, rồi dùng mức ràng buộc giảm dần trên phần còn chồng nhau. Có thể hình dung đoạn mới gồm ba vùng: **đã cam kết, được điều chỉnh có giới hạn, được sinh tự do**. Cơ chế này giúp nối mượt nhưng vẫn cho phép phản ứng với ảnh camera mới. Việc ước lượng trễ sai hoặc GPU bị nghẽn bất chợt vẫn có thể làm bộ đệm cạn, nên robot thật cần cơ chế dừng dự phòng.

### ### Đặt hai dòng thời gian cạnh nhau để hiểu cơ chế

Bộ điều khiển chạy 50 Hz, nghĩa là cứ 20 mili giây phải có một lệnh. Mô hình bắt đầu tính đoạn B khi robot còn đang thực thi đoạn A và mất 160 mili giây mới xong. Trong khoảng ấy đã trôi qua tám nhịp điều khiển: robot không thể đợi B mới quyết định các nhịp đó. RTC ràng buộc phần đầu B cho phù hợp với tám lệnh đã cam kết; vùng chồng còn có thể thay đổi thì được điều chỉnh mềm, phần tương lai chưa có trong A được sinh mới. Mấu chốt là **tính toán và thực thi chạy song song**, còn việc nối hai đoạn phải tôn trọng thứ tự thời gian thực.

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rtc-inference/figure-2.webp)

![Hình 3 từ PDF gốc, trang 4](/paper-figures/rtc-inference/figure-3.webp)

![Hình 6 từ PDF gốc, trang 8](/paper-figures/rtc-inference/figure-6.webp)

## Ví dụ từng bước

### Ví dụ đi vòng vật cản theo hai hướng

Đoạn A dự định cho tay robot vòng trên vật cản. Mạng tính đoạn B từ quan sát mới và tự chọn vòng dưới. Nếu chuyển từ bước 10 của A sang bước 11 của B, tay có thể đổi hướng tức thì với gia tốc rất lớn. Nếu lấy trung bình hai vị trí, đường giữa lại có thể đâm vào vật cản.

RTC không chỉ làm mượt đầu ra bằng trung bình số học. Nó hướng quá trình sinh B sao cho những phần đã cam kết tiếp tục đúng và các phần chưa thực hiện thay đổi dần. Khi xem Hình 2–4, hãy phân biệt ràng buộc cứng cho những bước không thể sửa và ràng buộc mềm cho phần còn quyền lựa chọn.

## Kết quả thực nghiệm

### Hình kết quả đo điều gì?

Hình 1 cho thấy ví dụ robot quẹt diêm: cần chuyển động liên tục dù GPU có độ trễ. Hình 5 thay độ trễ suy luận và độ dài thực thi trên bài mô phỏng có điều kiện hoàn thành rõ ràng. Nếu đoạn thực thi quá dài, robot phản ứng chậm; nếu quá ngắn so với d, đoạn mới không kịp đến. Hình 3 nêu các giới hạn của độ dài thực thi s theo d và H.

Hình 6 đo tiến độ theo thời gian và thông lượng thực hiện. Không nên chỉ nhìn số hành động/giây: robot phát lệnh liên tục nhưng không hoàn thành công việc vẫn là thất bại. Độ mượt, thời gian hoàn thành và tỷ lệ thành công phải được xem cùng nhau.

### Tốc độ sinh một đoạn và tốc độ hoàn thành công việc không giống nhau

Trong một thiết lập robot thật dùng π0.5 ở 50 Hz, bài báo báo thời gian lấy mẫu khoảng 76 mili giây cho cách thông thường và 97 mili giây cho RTC, chưa kể thời gian truyền dữ liệu qua mạng. Nghĩa là **RTC có thể tốn thêm thời gian tính cho mỗi đoạn**, chứ không nhất thiết làm mạng nhanh hơn. Lợi ích là robot vẫn thực thi trong lúc mạng tính toán, giảm thời gian đứng chờ và số lần phải làm lại. Các thử nghiệm còn cộng thêm 100–200 mili giây trễ để xem mức chịu đựng.

Đừng so 76 với 97 rồi kết luận RTC kém: phải đo tổng thời gian hoàn thành, tỷ lệ thành công và mức giật ở điểm nối. Ngược lại, chỉ thấy robot chuyển động liên tục cũng chưa chứng minh nó đang đi đúng hướng.

### ### Mô hình tính chậm hơn mà robot vẫn làm việc nhanh hơn?

Trong một thiết lập, thời gian lấy mẫu một đoạn của RTC khoảng 97 mili giây, lớn hơn mức 76 mili giây của cách thông thường. Điều này không mâu thuẫn với lợi ích của RTC: robot có thể **tiếp tục thực thi đoạn cũ trong lúc GPU tính**, thay vì đứng chờ sau mỗi đoạn. Vì vậy ba chỉ số cần xem cùng nhau là thời gian tính một đoạn, thời gian hoàn thành toàn bộ nhiệm vụ và tỷ lệ hoàn thành. Nếu robot chạy liền mạch nhưng đi sai hướng, nó vẫn thất bại. Ngược lại, nếu GPU tính từng đoạn nhanh nhưng robot dừng liên tục, thời gian thực tế của nhiệm vụ có thể dài hơn.

![Hình 4 từ PDF gốc, trang 5](/paper-figures/rtc-inference/figure-4.webp)

## Hạn chế và câu hỏi còn mở

### Giới hạn quan trọng của RTC khi triển khai

RTC cần ước lượng độ trễ. Nếu mạng đột nhiên chậm hơn dự đoán, những lệnh được cho là còn thay đổi được có thể đã tới tay bộ điều khiển. Nếu mô hình quá chậm so với độ dài đoạn hành động, việc chỉ chỉnh mặt nạ không đủ để bảo đảm an toàn.

Ngoài ra, tính liên tục về vị trí chưa luôn bảo đảm giới hạn vận tốc, gia tốc, lực hoặc va chạm. Khi chạy robot thật, cần log độ trễ cực đại, điểm nối lệnh và cơ chế dừng bảo vệ. RTC là một kỹ thuật điều khiển thời gian thực, không phải chứng nhận an toàn.

## Liên hệ với nghiên cứu khác

### RTC suy luận khác RTC huấn luyện ra sao?

RTC phiên bản đầu dùng mô hình đã học bình thường, rồi đưa các ràng buộc vào **ngay trong quá trình sinh đoạn hành động** bằng cách điều chỉnh quá trình lấy mẫu. RTC huấn luyện sẵn dạy mạng từ đầu cách nhận phần tiền tố đã biết và sinh phần tiếp theo tương thích.

Hai cách có cùng mục tiêu nối hành động liên tục nhưng chi phí suy luận và cách đưa điều kiện vào mạng khác nhau. Đọc bài thứ hai sau khi hiểu các đoạn A/B, d và tiền tố đã cam kết của bài này sẽ dễ hơn nhiều.

### Những bài nên đọc tiếp

- [ACT / ALOHA](/paper/act)
- [Diffusion Policy](/paper/diffusion-policy)
- [π0.5](/paper/pi-0-5)
- [RTC huấn luyện sẵn](/paper/rtc-training)

## Đọc mã nguồn và tự kiểm chứng

### Tự tính một ví dụ với 12 bước

Cho đoạn A có H = 12 hành động, mỗi hành động kéo dài 20 ms. Mô hình mất khoảng 80 ms để tính B, tương đương d = 4 bước. Nếu bộ điều khiển đã bắt đầu dùng A, bốn bước tiếp theo gần như chắc chắn được thực hiện trước khi B sẵn sàng. Hãy đánh dấu bốn bước ấy màu đỏ và các bước còn lại có thể điều chỉnh màu vàng.

Bây giờ tăng d lên 7. Đoạn được phép sinh thêm sẽ ngắn hơn như thế nào? Khi nào không còn đủ vùng chồng nhau? Nếu trả lời được bằng một trục thời gian, bạn đã hiểu động lực chính của RTC.
