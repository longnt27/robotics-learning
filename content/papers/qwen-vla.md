## Vì sao cần nghiên cứu này?

### Một mô hình cho nhiều công việc, nhưng không phải mọi công việc đều giống nhau

Hãy tưởng tượng một robot nhận ba yêu cầu: “Nhặt cốc đỏ”, “Đi tới cạnh bàn” và “Chiếc cốc nào gần cửa hơn?”. Yêu cầu đầu cần một chuỗi lệnh cho tay máy, yêu cầu thứ hai có thể cần các điểm dẫn đường, còn yêu cầu cuối cần câu trả lời bằng chữ. Chúng đều dựa vào ảnh và ngôn ngữ, nhưng **đầu ra và điều kiện thực thi khác nhau**. Nếu dùng một mô hình độc lập cho mỗi loại việc, kiến thức nhận biết vật, hiểu vị trí và làm theo chỉ dẫn khó được chia sẻ.

Qwen-VLA nghiên cứu cách dùng **một nền hiểu ảnh–ngôn ngữ** cùng **một bộ sinh hành động liên tục** để học từ dữ liệu thao tác tay máy, điều hướng và chuyển động của người. Đây là hướng hợp nhất cách *học và dự đoán*, không phải tuyên bố rằng một chuỗi góc khớp có thể dùng nguyên cho mọi robot.

### Hiểu đúng chiếc cốc và kẹp đúng chiếc cốc là hai bài toán

Một mô hình ảnh–ngôn ngữ có thể nhận ra chiếc cốc, nhưng chưa chắc tính được chuyển động vừa tránh va chạm vừa đóng kẹp đúng lúc. Ngược lại, một mạng học chuyển động từ hàng nghìn lượt làm mẫu có thể cầm nắm mượt nhưng chọn sai vật khi câu lệnh thay đổi. Qwen-VLA tách vai trò đó: **Qwen3.5-4B** phụ trách xử lý ảnh và câu lệnh; **bộ sinh hành động DiT khoảng 1,15 tỷ tham số** tạo chuỗi lệnh vật lý theo điều kiện đã hiểu (Mục 2.2 của paper).

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/qwen-vla/figure-1.webp)

## Kiến thức nền

### Bốn giai đoạn huấn luyện giải bốn việc khác nhau

**T2A (Text-to-Action):** giữ cố định mạng ảnh–ngôn ngữ, chỉ huấn luyện bộ sinh DiT từ **câu lệnh, mô tả loại robot và chuỗi hành động mẫu**, cố ý **không đưa ảnh camera**. Mục tiêu là học dạng chuyển động và mối liên hệ giữa mô tả nhiệm vụ với các chuỗi hành động có thể có.

**CPT (Continued Pretraining):** mở huấn luyện cả hai phần và thêm ảnh thật, thao tác robot, chuyển động người, dữ liệu mô phỏng, điều hướng và dữ liệu ảnh–chữ. Lúc này mạng mới phải gắn câu “cầm cốc đỏ” với **chiếc cốc cụ thể xuất hiện trong cảnh**.

**SFT (Supervised Fine-Tuning):** dùng dữ liệu làm mẫu được tuyển chọn để luyện cho các nhiệm vụ đích. Paper có **hai nhánh xuất phát từ CPT**: một nhánh học chung nhiều nhiệm vụ và một nhánh tinh chỉnh trên dữ liệu người điều khiển robot thật.

**RL (Reinforcement Learning):** tiếp tục cải thiện nhánh đa nhiệm bằng phần thưởng hoàn thành khi chính sách thử hành động **trong mô phỏng SimplerEnv**. Đây **không phải** bằng chứng nhóm tác giả làm RL trực tiếp trên cánh tay ALOHA ngoài đời (Mục 4.2 và 5.2.3).

### Ví dụ vì sao cần học chuyển động trước khi gắn với ảnh

Nếu chỉ có câu “đặt khối xanh cạnh khối đỏ”, bộ sinh có thể học một đoạn thao tác gồm tiếp cận, kẹp, dịch chuyển và thả. Nhưng nó **không thể biết tọa độ** hai khối trên bàn trước mắt. T2A học kiểu chuyển động; CPT bổ sung khả năng dùng ảnh để chọn vị trí thật. Đó là lý do bài báo làm hai bước riêng, thay vì bắt bộ sinh hành động mới khởi tạo học đồng thời cả đặc trưng hình ảnh lẫn vận động.

### Cùng một lời giao việc, hai robot có thể cần hai kiểu lệnh

Qwen-VLA đặt ở đầu câu lệnh một mô tả bằng chữ về loại robot, số tay, dạng điều khiển, tần số và số bước cần dự đoán. Một robot dùng lệnh thay đổi vị trí đầu kẹp; robot khác dùng góc khớp tuyệt đối; robot điều hướng dùng các điểm dẫn đường. **Mô tả bằng chữ xác định ý nghĩa lệnh**, không tự biến hai hệ tọa độ vật lý thành một.

Trong mạng, dữ liệu hành động được đặt vào một khung số có độ dài chung: thiếu chiều nào thì chèn số 0 và dùng **mặt nạ** đánh dấu phần hợp lệ. Nhờ vậy các chiều thêm cho đủ kích thước không được tính vào sai số học. Việc thống nhất **hình dạng dữ liệu** không đồng nghĩa thống nhất hoàn toàn **ý nghĩa vật lý của các con số** (Mục 2.3–2.5, Bảng 10).

## Phương pháp thực hiện

### Theo dõi một lần sinh lệnh trên robot

Giả sử yêu cầu là “Đặt hai chiếc dập ghim xanh lá cạnh nhau”. Camera cung cấp ảnh hiện tại; mô tả phần cứng cho biết đang điều khiển loại robot nào; câu lệnh nói hai vật phải ở cạnh nhau. Qwen3.5 xử lý ảnh và chữ để tạo đặc trưng. Bộ sinh DiT nhận đặc trưng ấy cùng một đoạn hành động ban đầu còn nhiễu, rồi nhiều lần chỉnh để tạo **chuỗi lệnh liên tục** phù hợp với cảnh và dạng điều khiển.

Robot không được bảo đảm thành công chỉ vì mạng sinh ra quỹ đạo trông mượt. Bộ thực thi phải hiểu đúng đơn vị, hệ tọa độ, giới hạn khớp và độ mở kẹp. Sau khi thực hiện một phần đoạn, robot cần tiếp tục quan sát để điều chỉnh khi vật dịch chuyển.

### Tại sao bộ sinh học bằng khử nhiễu?

Trong cách học gọi là **flow matching**, tác giả trộn một chuỗi hành động mẫu sạch với chuỗi ngẫu nhiên theo mức nhiễu τ. Mạng học hướng biến đổi để đi từ nhiễu về hành động mẫu, có điều kiện theo ảnh, câu lệnh và loại robot. Khi chạy, bộ sinh bắt đầu từ nhiễu rồi thực hiện một số bước tính toán để tạo lệnh. **Những bước khử nhiễu trong mạng không phải những bước robot đã di chuyển ngoài đời.**

Hàm mất mát chỉ tính trên những chiều và mốc thời gian thực sự thuộc robot hiện tại, tránh để các số 0 được thêm vào nhằm đủ kích thước làm sai quá trình học. Đây là cơ chế cần biết khi paper nói một bộ sinh dùng cho nhiều loại phần cứng, chứ không chỉ là ghép tất cả dữ liệu vào chung một bảng.

### Những gì khác nhau giữa lúc học và lúc dùng thật

Ở T2A, bộ sinh học từ chữ mà không nhìn camera; ở CPT/SFT, nó mới học đối chiếu vật trong ảnh với đích của câu lệnh. Nhánh SFT trên dữ liệu robot thật phải được phân biệt với **Qwen-VLA-Instruct**, phiên bản thu được khi thêm RL trong mô phỏng vào nhánh đa nhiệm. Vì vậy không được dùng tỷ lệ thành công của **ALOHA đã tinh chỉnh riêng** để nói chính xác hiệu quả của mô hình đa nhiệm **chưa tinh chỉnh** trên cùng phần cứng.

### Trạng thái góc khớp có phải đầu vào bắt buộc không?

**Không.** Bài báo thử không đưa trạng thái khớp, đưa trạng thái dưới dạng token chữ và đưa trạng thái liên tục trực tiếp vào DiT. Trên RoboTwin-2.0, mức tăng của các cách thêm trạng thái tương đối nhỏ: tối đa khoảng **0,7 điểm phần trăm** ở nhóm Easy và **1,3 điểm phần trăm** ở nhóm Hard. Vì thế thiết lập mặc định không bổ sung trạng thái khớp riêng (Bảng 12). Đừng nhầm **mô tả loại robot** trong prompt với **giá trị góc khớp tức thời** từ cảm biến.

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/qwen-vla/figure-2.webp)

## Ví dụ từng bước

### Khi cùng một mô hình nhận việc ngắn và việc dài

Hình 3 lấy ví dụ **dữ liệu tạo bằng ROBOINF**, không phải bằng chứng hai nhiệm vụ này đã được robot thật thực thi thành công đúng như video minh họa. Nhiệm vụ ngắn là đặt hai chiếc dập ghim xanh lá cạnh nhau; một đoạn tương đối ngắn có thể gồm đưa tay tới, kẹp, dịch chuyển rồi đặt xuống.

Ở nhiệm vụ dài “Gom đồ uống cùng một chỗ, để miếng bọt biển riêng”, robot phải nhận ra vật nào là đồ uống, lặp lại thao tác cho từng món và không nhầm miếng bọt biển. Nếu nhận nhầm vật thì cần kiểm tra phần hiểu ảnh–ngôn ngữ. Nếu chọn đúng vật nhưng làm rơi khi kẹp, vấn đề có thể nằm ở bộ sinh hành động hoặc bộ điều khiển thật. Nếu làm tốt từng lần nhặt nhưng bỏ sót món cuối, cần kiểm tra cách theo dõi tiến độ nhiệm vụ.

![Hình 3 từ PDF gốc, trang 11](/paper-figures/qwen-vla/figure-3.webp)

### Ảnh robot thật giúp kiểm tra điều gì?

Hình 4 cho thấy các nhóm nhiệm vụ ALOHA ngoài đời được dùng để đo tỷ lệ thành công. Hình 5 minh họa khả năng tiếp cận vật mới, chọn bóng theo màu và thích nghi với nền ảnh lạ. Đây là **minh họa định tính**; muốn kết luận mô hình tốt hơn đối chứng phải xem bảng số liệu, số lần chạy và định nghĩa thành công. Ví dụ mạng tiếp cận đúng kính râm nhưng không kẹp chắc được nó là một giới hạn cơ học, không thể gộp chung thành “không hiểu lệnh”.

![Hình 4 từ PDF gốc, trang 17](/paper-figures/qwen-vla/figure-4.webp)

![Hình 5 từ PDF gốc, trang 21](/paper-figures/qwen-vla/figure-5.webp)

## Kết quả thực nghiệm

### T2A thực sự giúp ở điều kiện nào? Đọc Hình 6

Tác giả giữ quy trình SFT sau đó giống nhau và thử nhiều cách học T2A. Trên **Simpler-WidowX**, không dùng T2A cho tỷ lệ hoàn thành **60,9%**. Dùng T2A dự đoán **cả chuỗi** với **20% dữ liệu tổng hợp + 80% dữ liệu thật** đạt **71,1%**, tức **tăng 10,2 điểm phần trăm**. Đây là tỷ lệ dữ liệu **trong thí nghiệm T2A**, không phải công thức bắt buộc để trộn tất cả dữ liệu cho mọi robot.

Ở nhóm dùng 10% dữ liệu tổng hợp, dự đoán cả chuỗi đạt **65,4%** so với **60,4%** khi chỉ dự đoán từng đoạn. Việc đưa ảnh vào T2A trong phép thử tương ứng còn giảm kết quả từ 60,4% xuống **57,6%**. Bước huấn luyện T2A tốt nhất tại **2.000 lượt cập nhật (71,1%)**; kéo lên **40.000** chỉ còn **60,4%**. Như vậy phải tách tác dụng của cách dự đoán, loại dữ liệu và thời gian học, không thể quy mọi lợi thế cho riêng việc có thêm ảnh (Hình 6, Mục 5.2.1).

### Học chung ảnh–ngôn ngữ giúp khi nào? Đọc Hình 7

Khi thêm dữ liệu ảnh–ngôn ngữ vào lúc học hành động, kết quả trên LIBERO và Simpler-WidowX thay đổi ít. Nhưng ở nhóm cần nhận vật và hiểu quan hệ phức tạp, **RoboCasa-GR1 tăng từ 51,1% lên 56,0% (+4,9 điểm phần trăm)** và **RoboTwin-2.0 tăng từ 81,8% lên 86,4% (+4,6 điểm phần trăm)**. Hình 7 còn cho thấy DiT đã qua T2A học tiếp nhanh hơn DiT khởi tạo từ đầu. Đó là hai phép so khác nhau, không nên trộn thành một kết luận “cứ thêm dữ liệu là tốt”.

![Hình 6 từ PDF gốc, trang 22](/paper-figures/qwen-vla/figure-6.webp)

![Hình 7 từ PDF gốc, trang 24](/paper-figures/qwen-vla/figure-7.webp)

### Đừng lấy kết quả ALOHA để quảng cáo kết quả mọi robot

**Bảng 5:** ALOHA **được tinh chỉnh từ Qwen-VLA-Base** đạt **83,6%** trung bình trên nhóm nhiệm vụ quen; **cùng kiến trúc học từ đầu** đạt **48,5%**. Như vậy chênh lệch là **35,1 điểm phần trăm**, phản ánh lợi ích tiền huấn luyện trong phép so này. **Bảng 6:** phiên bản có tiền huấn luyện đạt **76,9%** trên năm nhóm thay đổi màu, vật, vị trí, nền và chỉ dẫn; bản học từ đầu chỉ đạt **36,2%**. Cả hai bảng đánh giá trên ALOHA với thiết lập học cho robot đích.

Riêng **Qwen-VLA-Instruct đa nhiệm** được báo cáo **97,9%** trên LIBERO và **73,7%** trên Simpler-WidowX (Bảng 4), cùng **26,6%** tỷ lệ thành công không tinh chỉnh trên phép thử thao tác vật đang di chuyển **DOMINO** (Bảng 11). Đây là **các bài kiểm tra khác nhau**, không được lấy 83,6%, 76,9% và 26,6% đem xếp thành một thứ hạng duy nhất.

### RL có giúp mọi bộ đánh giá tăng điểm không?

RL chỉ thu dữ liệu khi mô hình thực thi **trong SimplerEnv mô phỏng**. Sau RL, điểm Simpler trong Bảng 11 tăng **70,8% → 73,7%**; DOMINO tăng nhẹ **25,7% → 26,6%**. Nhưng RoboTwin-Easy lại từ **86,3% xuống 86,1%**. Tác giả xem đó là thay đổi nhỏ, không phải thất bại lớn; song nói RL giúp tất cả các bộ đánh giá tăng điểm là sai. Muốn kiểm chứng lợi ích của RL, phải so đúng phiên bản **sau SFT** với **sau RL**, giữ chung bộ đánh giá.

## Hạn chế và câu hỏi còn mở

### Những gì tác giả chưa chứng minh được

Tác giả thừa nhận dữ liệu hành động thật vẫn ít và kém đa dạng hơn dữ liệu ảnh–chữ, đặc biệt với vật hiếm, thao tác tiếp xúc phức tạp và nhiệm vụ dài. Học chung nhiều loại việc còn có đánh đổi: một số phép thử thuần ảnh–ngôn ngữ hoặc điều hướng **có thể giảm nhẹ** sau huấn luyện thiên về hành động (Mục 7). Không nên biến kết quả tốt trên các bộ đánh giá có sẵn thành lời khẳng định robot có thể hoạt động lâu ngày, tự phục hồi khi lỗi hoặc an toàn trên mọi phần cứng.

### Hai rủi ro dễ bị bỏ qua khi tự triển khai

Thứ nhất, **prompt ghi loại robot** không thay thế hiệu chuẩn camera, chuyển đổi tọa độ, kiểm tra đơn vị và giới hạn động cơ. Thứ hai, **mô hình sinh đoạn hành động** không bảo đảm nó phản hồi đủ nhanh hoặc có lực kẹp phù hợp trong tình huống vật bị trượt. Cần đo cả tỷ lệ hoàn thành, độ trễ điều khiển và các lần phải can thiệp. Khi chuyển sang robot mới, phải xác minh nguồn dữ liệu vận động và cách giải mã lệnh thay vì chỉ đổi tên robot trong prompt.

## Liên hệ với nghiên cứu khác

### Qwen-VLA khác RT-2, π0.5 và GR00T ở đâu?

[RT-2](/paper/rt-2) nghiên cứu chuyển kiến thức ảnh–ngôn ngữ thành token hành động. [Diffusion Policy](/paper/diffusion-policy) dùng quá trình khử nhiễu để sinh những đoạn chuyển động liên tục. [π0.5](/paper/pi-0-5) cũng khai thác dữ liệu đa nguồn và bộ sinh chuyển động nhưng khác cách tổ chức các giai đoạn học. [LingBot-VLA 2.0](/paper/lingbot-vla-2) và [GR00T N1](/paper/groot-n1) là những hướng khác để kết hợp hiểu cảnh với sinh hành động. Để so công bằng, cần nhìn **bộ dữ liệu, cách điều khiển, phần cứng, phạm vi tinh chỉnh và độ trễ**, không chỉ tên kiến trúc.

### Những bài nên đọc tiếp

- [PaLM-E](/paper/palm-e)
- [RT-2](/paper/rt-2)
- [Diffusion Policy](/paper/diffusion-policy)
- [Open X-Embodiment](/paper/open-x-embodiment)
- [LingBot-VLA 2.0](/paper/lingbot-vla-2)

## Đọc mã nguồn và tự kiểm chứng

### Một phép thử nhỏ để thấy mô hình có dùng ảnh và lời chỉ dẫn

Đặt hai vật có màu khác nhau trong camera. Giữ ảnh cố định, lần lượt yêu cầu “đặt vật xanh bên trái vật đỏ” và “đặt vật đỏ bên trái vật xanh”. Chọn vật nào và đặt vào đâu phải đổi theo câu lệnh. Tiếp theo, giữ nguyên câu lệnh nhưng đổi vị trí vật: quỹ đạo phải dựa vào ảnh mới thay vì tọa độ cũ. Cuối cùng thử đúng nhiệm vụ trên hai cấu trúc robot với quy ước điều khiển khác nhau và kiểm tra lệnh giải mã có hợp lệ hay không.

### Tự đặt câu hỏi trước khi tin vào con số

Khi đọc Hình 6–7 hay Bảng 4–6 và 11, hãy ghi lần lượt: **(1)** mô hình đang ở giai đoạn nào, **(2)** có được tinh chỉnh trên robot đích không, **(3)** đang thử trong mô phỏng hay ngoài đời, **(4)** phương pháp đối chứng có dùng cùng lượng dữ liệu không, **(5)** chỉ số là tỷ lệ thành công hay tiến độ. Làm được năm việc này thì những con số 71,1%, 83,6% và 26,6% không còn dễ bị hiểu nhầm thành một kết quả chung.

*Nguồn để tự đối chiếu: [Qwen-VLA, bản toàn văn chính thức arXiv 2605.30280v2](https://arxiv.org/html/2605.30280), đặc biệt Mục 2–5.2, Hình 1–7 và Bảng 4–6, 10–12.*
