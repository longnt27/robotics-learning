> **Gợi ý đọc:** [Real-Time Execution of Action Chunking Flow Policies](https://arxiv.org/abs/2506.07339), NeurIPS 2025. Hình 2–3 giải thích vì sao các đoạn lệnh bị giật khi nối; Mục 3–4 kiểm tra cách RTC giữ chuyển động liên tục.

## Vì sao cần nghiên cứu này?

### Mô hình tính 100 ms, robot cần lệnh mới mỗi 20 ms

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 5 từ PDF gốc, trang 7](/paper-figures/rtc-inference/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Một robot có thể cần lệnh mới mỗi 20 mili giây, nhưng mô hình VLA lại mất cả trăm mili giây mới tính xong đoạn hành động tiếp theo. Nếu robot đứng yên chờ, thao tác quẹt diêm hoặc giữ vật có thể bị phá hỏng. Nếu robot chạy tiếp rồi đột ngột chuyển sang đoạn mới, hai đoạn có thể khác hướng và gây giật mạnh. **RTC giải bài toán nối các đoạn hành động khi mô hình suy luận chậm:** cho robot tiếp tục thực thi trong khi mạng tính toán, đồng thời giữ các lệnh đã cam kết và điều chỉnh phần chuyển động còn lại để đường đi liên tục.

**Action chunking (dự đoán hành động theo đoạn)** giải quyết được một phần bài toán. Thay vì chỉ dự đoán lệnh ở một thời điểm, chính sách điều khiển sinh cả đoạn hành động tiếp theo, nhờ đó robot có thể tiếp tục chạy các lệnh đang có trong bộ đệm ngay cả khi mạng bận tính toán. Nhưng khi đoạn mới đến, hai cách tổ chức thực thi thông thường vẫn gây vấn đề:

1. **Chạy tuần tự:** robot thực hiện xong đoạn A rồi dừng chờ mạng sinh đoạn B. Thời gian chờ có thể phá hỏng thao tác đang cần lực hoặc chuyển động liên tục.
2. **Chạy song song đơn giản:** mạng tạo đoạn B trong khi robot chạy A, nhưng B có thể chọn một hướng đi khác ngay tại điểm nối, khiến robot đổi tốc độ hoặc gia tốc đột ngột.

Ví dụ tránh chướng ngại: chunk cũ đi vòng **phía trên**, chunk mới đi vòng **phía dưới**. Cả hai quỹ đạo riêng lẻ có thể đúng. Nối chúng giữa chừng tạo một cú bẻ lái nguy hiểm. Lấy trung bình hai đường đi cũng không chắc hữu ích: giữa “vòng trái” và “vòng phải” có thể là “đi thẳng vào vật cản”.

Vấn đề không chỉ là **độ trễ** mà còn là **lập kế hoạch lại khi robot đang chuyển động**: những lệnh đã được bộ điều khiển thực hiện không thể quay ngược để sửa.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/rtc-inference/figure-1.webp)


### Vấn đề không chỉ là mô hình chậm

Robot cần lệnh mới ở tần số 50 Hz, tức mỗi 20 mili giây. Nhưng mô hình VLA có thể mất 100–300 mili giây để sinh một đoạn hành động. Nếu bắt robot đứng yên chờ, việc quẹt diêm, rót chất lỏng hoặc giữ vật có thể bị hỏng giữa chừng. Nếu để robot tiếp tục đoạn cũ rồi lập tức chuyển sang đoạn mới, lại có nguy cơ giật mạnh vì hai đoạn được tính từ quan sát khác nhau.

**RTC giải vấn đề nối hai đoạn hành động trong khi robot đang chạy.** Nó không làm VLM hiểu ảnh tốt hơn hay thay đổi mục tiêu nhiệm vụ. Trọng tâm là giữ những lệnh robot đã bắt đầu thực hiện, rồi sinh phần tương lai còn có thể thay đổi sao cho chuyển động không đứt đoạn.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

**Action chunk (đoạn hành động)** gồm H bước liên tiếp, mỗi bước có D giá trị điều khiển. **Độ dài thực thi s** là số bước robot dùng trước khi nhận đoạn mới; **độ trễ d** là số bước robot đã đi trong lúc mô hình đang tính. Cần phân biệt bước điều khiển vật lý với lượt khử nhiễu của mô hình: một cái xảy ra ở robot, cái kia là vòng tính toán trên GPU.

**Flow matching** học một trường vận tốc trong không gian các chuỗi hành động, chỉ ra cách liên tục chuyển chuỗi nhiễu ban đầu thành chuỗi có ý nghĩa. Đây là bước tính toán để sinh lệnh, không phải vận tốc thật của cánh tay robot. “Thời gian” trong phép sinh bằng flow là một tham số toán học, không phải đồng hồ robot. Nếu nhầm hai loại thời gian, rất dễ hiểu sai cơ chế RTC.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hiểu tiền tố đã cam kết và độ trễ

**Action chunk** là đoạn gồm nhiều lệnh liên tiếp. **Độ trễ suy luận d** là số bước robot đi được trong lúc mô hình tạo đoạn mới. **Tiền tố đã cam kết** là các lệnh cũ mà controller chắc chắn sẽ thực hiện trước khi kết quả mới xuất hiện. Ta không thể xóa chúng bằng một dự đoán được sinh trễ.

Ví dụ mạng bắt đầu nghĩ khi robot đang ở bước 3 và phải mất bốn bước mới xong. Khi mạng trả lời, robot đã thực thi bước 4–7. Đoạn mới cần phù hợp với quá khứ không còn sửa được này. Những lệnh tiếp theo thuộc vùng chồng nhau có thể được điều chỉnh mềm; các lệnh vượt khỏi đoạn cũ phải sinh mới.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

RTC cho phép **vòng điều khiển** và **vòng suy luận** chạy đồng thời. Trong lúc GPU đang tính đoạn hành động mới, robot tiếp tục thực hiện những lệnh đã có trong bộ đệm. Phương pháp ước tính độ trễ d để biết những bước nào sẽ chắc chắn được thực hiện trước khi kết quả mới tới.

Những bước đã cam kết bị giữ cố định. Phần tương lai còn chồng lên đoạn cũ được dẫn hướng bằng một mức ràng buộc giảm dần, để đoạn mới nối êm hơn mà vẫn thích nghi được với quan sát mới. Phần cuối vượt khỏi đoạn cũ được sinh tự do. Cơ chế này được đưa vào quá trình lấy mẫu của mô hình flow, thay vì chỉ lấy trung bình hai quỹ đạo sau khi đã sinh xong.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/rtc-inference/figure-3.webp)
![Hình 6 từ PDF gốc, trang 8](/paper-figures/rtc-inference/figure-6.webp)

<!-- END ADDITIONAL PDF FIGURES -->

```text
VÒNG ĐIỀU KHIỂN (50 Hz)        VÒNG TÍNH LỆNH
  Đọc trạng thái hiện tại           Nhận quan sát
  Chạy lệnh đã có                   Ước tính độ trễ d
  Quan sát lại                      Giữ lệnh đã phát
  Chạy lệnh tiếp theo               Sinh đoạn có ràng buộc
       ...                          Trả về đoạn mới
  Chuyển sang đoạn mới    <──────────────┘
```

```text
ĐOẠN CŨ:  a0 a1 a2 a3 a4 a5 a6 a7 a8 a9...
               ↑ Bắt đầu tính đoạn mới
               └── Mất d bước mới có kết quả ──┐
ĐOẠN MỚI:     [lệnh đã cam kết] [lệnh tương lai...]
```

```text
ĐOẠN HÀNH ĐỘNG MỚI
| Cố định hoàn toàn | Điều chỉnh mềm | Sinh phần mới |
         1,0          0,9 → 0,6 → 0,2       0
```

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/rtc-inference/figure-2.webp)


### RTC trong một vòng điều khiển thực tế

**Bước 1:** robot đang thực thi đoạn A trong bộ đệm; mô hình nhận quan sát mới và bắt đầu tính đoạn B. Hai việc diễn ra đồng thời, không bắt robot dừng. **Bước 2:** ước tính d để xác định những bước của A sẽ được thực hiện trước khi B xong. Đặt ràng buộc rất mạnh cho các bước ấy.

**Bước 3:** ở phần A còn chồng với B nhưng chưa cam kết, dùng mức ràng buộc giảm dần thay vì bắt B bằng A hoàn toàn. **Bước 4:** phần cuối B ngoài độ dài A được sinh mới. **Bước 5:** khi B tới, controller nối vào vị trí đang thực thi, lấy lại quan sát và bắt đầu tính đoạn tiếp.

Điểm khác cách bất đồng bộ ngây thơ: B không được tự chọn một quỹ đạo hoàn toàn mâu thuẫn với phần A đã chạy.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot đang đưa đầu cáp tới ổ cắm. Đoạn A đã ra lệnh đi thẳng thêm vài bước, nhưng ảnh camera vừa cập nhật cho thấy đầu cáp lệch sang phải. Robot không thể xóa các lệnh đã chạy; chỉ có thể điều chỉnh các bước còn ở phía trước. Mạng bắt đầu tính đoạn B, mất 100 mili giây; ở tần số 50 Hz, robot đã thực hiện khoảng năm bước trước khi B tới.

RTC không cho B thay những bước đã đi. Nó giữ phần chắc chắn thực thi, sau đó tạo những bước điều chỉnh dần sang phải. Nếu lập tức thay bằng một quỹ đạo mới hoàn toàn, đầu robot có thể giật hoặc lao vào mép ổ cắm. **Mục tiêu là vừa không phải dừng chờ, vừa giữ chỗ nối đủ liên tục.**

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ đi vòng vật cản theo hai hướng

Đoạn A dự định cho tay robot vòng trên vật cản. Mạng tính đoạn B từ quan sát mới và tự chọn vòng dưới. Nếu chuyển từ bước 10 của A sang bước 11 của B, tay có thể đổi hướng tức thì với gia tốc rất lớn. Nếu lấy trung bình hai vị trí, đường giữa lại có thể đâm vào vật cản.

RTC không chỉ làm mượt đầu ra bằng trung bình số học. Nó hướng quá trình sinh B sao cho những phần đã cam kết tiếp tục đúng và các phần chưa thực hiện thay đổi dần. Khi xem Hình 2–4, hãy phân biệt ràng buộc cứng cho những bước không thể sửa và ràng buộc mềm cho phần còn quyền lựa chọn.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trong mô phỏng Kinetix, nhóm tác giả thử các nhiệm vụ cần chuyển động liên tục và thay mức trễ suy luận. RTC được so với cách chạy tuần tự phải chờ, cách chạy bất đồng bộ thay đoạn ngay lập tức và một số cách kết hợp chuỗi khác. Kết quả cho thấy RTC duy trì tỷ lệ thành công và độ mượt tốt hơn trong nhiều điều kiện trễ được thử.

Trên robot thật, các thao tác nhanh như quẹt diêm minh họa vì sao dừng chờ hoặc đổi hướng đột ngột có thể phá nhiệm vụ. Khi đọc biểu đồ, cần xét **tỷ lệ hoàn thành, thời gian thực và mức rung ở chỗ nối**, không chỉ số lần mô hình gọi trong một giây.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 5](/paper-figures/rtc-inference/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Hình kết quả đo điều gì?

Hình 1 cho thấy ví dụ robot quẹt diêm: cần chuyển động liên tục dù GPU có độ trễ. Hình 5 thay độ trễ suy luận và độ dài thực thi trên bài mô phỏng có điều kiện hoàn thành rõ ràng. Nếu đoạn thực thi quá dài, robot phản ứng chậm; nếu quá ngắn so với d, đoạn mới không kịp đến. Hình 3 nêu các giới hạn của độ dài thực thi s theo d và H.

Hình 6 đo tiến độ theo thời gian và thông lượng thực hiện. Không nên chỉ nhìn số hành động/giây: robot phát lệnh liên tục nhưng không hoàn thành công việc vẫn là thất bại. Độ mượt, thời gian hoàn thành và tỷ lệ thành công phải được xem cùng nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

RTC phải thêm phép tính để dẫn hướng quá trình sinh chuỗi; chi phí này có thể làm suy luận chậm hơn. Phương pháp cũng phù hợp nhất với những chính sách điều khiển sinh hành động bằng diffusion hoặc flow, không phải lập tức áp dụng y hệt cho mọi bộ giải mã sinh token.

Nếu độ trễ thực tế dài hơn dự tính, phần lệnh bị coi là “chưa cam kết” có thể đã tới bộ điều khiển. Ngoài ra, quỹ đạo mượt không tự bảo đảm tránh va chạm, giới hạn lực hoặc vận tốc. Hệ thống robot thật vẫn cần kiểm tra an toàn và theo dõi những lần suy luận chậm bất thường.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Giới hạn quan trọng của RTC khi triển khai

RTC cần ước lượng độ trễ. Nếu mạng đột nhiên chậm hơn dự đoán, những lệnh được cho là còn thay đổi được có thể đã tới tay bộ điều khiển. Nếu mô hình quá chậm so với độ dài chunk, việc chỉ chỉnh mặt nạ không đủ để bảo đảm an toàn.

Ngoài ra, tính liên tục về vị trí chưa luôn bảo đảm giới hạn vận tốc, gia tốc, lực hoặc va chạm. Khi chạy robot thật, cần log độ trễ cực đại, điểm nối lệnh và cơ chế dừng bảo vệ. RTC là một kỹ thuật điều khiển thời gian thực, không phải chứng nhận an toàn.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [ACT / ALOHA](/paper/act) giải thích cách dự đoán theo đoạn và kết hợp những dự đoán chồng nhau, nền tảng của RTC.
- [Diffusion Policy](/paper/diffusion-policy) trình bày cách sinh chuỗi hành động bằng khử nhiễu, từ đó hiểu việc giữ cố định một phần lệnh (inpainting).
- [π0.5](/paper/pi-0-5) cung cấp bối cảnh các mô hình VLA sinh chuyển động liên tục và độ trễ khi chạy robot thật.
- [Training-time RTC](/paper/rtc-training) dạy mạng cách nối lệnh mới với lệnh cũ ngay từ lúc huấn luyện, thay vì chỉ ràng buộc ở suy luận.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### RTC suy luận khác RTC huấn luyện ra sao?

RTC phiên bản đầu dùng mô hình đã học bình thường, rồi đưa các ràng buộc vào **ngay trong quá trình sinh chunk** bằng cách điều chỉnh quá trình lấy mẫu. RTC huấn luyện sẵn dạy mạng từ đầu cách nhận phần tiền tố đã biết và sinh phần tiếp theo tương thích.

Hai cách có cùng mục tiêu nối hành động liên tục nhưng chi phí suy luận và cách đưa điều kiện vào mạng khác nhau. Đọc bài thứ hai sau khi hiểu các đoạn A/B, d và tiền tố đã cam kết của bài này sẽ dễ hơn nhiều.

<!-- END EXTENDED WALKTHROUGH -->

## Xem mã nguồn và tự kiểm chứng

Tạo một môi trường mô phỏng đơn giản với chunk H = 50, thời gian một bước 20 mili giây và độ trễ d từ 5 tới 15 bước. So ba cách: robot đứng chờ đoạn mới, robot thay đoạn ngay khi kết quả tới, và robot giữ tiền tố đã cam kết rồi nối dần phần còn lại.

Vẽ vị trí, vận tốc, gia tốc ở chỗ nối và đo tỷ lệ hoàn thành. Thử hai quỹ đạo tránh vật cản theo hướng trái/phải: nếu lấy trung bình làm robot lao vào vật, ta thấy vì sao cần ràng buộc quá trình sinh thay vì chỉ trộn đầu ra.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự tính một ví dụ với 12 bước

Cho đoạn A có H = 12 hành động, mỗi hành động kéo dài 20 ms. Mô hình mất khoảng 80 ms để tính B, tương đương d = 4 bước. Nếu controller đã bắt đầu dùng A, bốn bước tiếp theo gần như chắc chắn được thực hiện trước khi B sẵn sàng. Hãy đánh dấu bốn bước ấy màu đỏ và các bước còn lại có thể điều chỉnh màu vàng.

Bây giờ tăng d lên 7. Đoạn được phép sinh thêm sẽ ngắn hơn như thế nào? Khi nào không còn đủ vùng chồng nhau? Nếu trả lời được bằng một trục thời gian, bạn đã hiểu động lực chính của RTC.

<!-- END EXTENDED WALKTHROUGH -->

