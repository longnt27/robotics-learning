## Vì sao cần nghiên cứu này?

### Vì sao một mô hình cần hiểu nhiều loại nhiệm vụ robot?

Một robot có thể được giao “Nhặt chiếc cốc đỏ”, “Đi tới cạnh bàn” hoặc “Chiếc cốc nào gần cửa hơn?”. Các yêu cầu có đầu ra khác nhau: thao tác tay, điều hướng hoặc câu trả lời. Nếu mỗi loại dùng mạng hoàn toàn riêng, dữ liệu và kiến thức khó chia sẻ. Qwen-VLA nghiên cứu một mô hình có thể học từ nhiều nhóm dữ liệu, kết hợp hiểu ảnh–ngôn ngữ với sinh hành động robot.

Điểm quan trọng là **hiểu được lời yêu cầu không đồng nghĩa biết ngay cách cử động**. Vì thế phương pháp huấn luyện không chỉ cho mô hình học câu chữ, mà còn xây một bộ sinh hành động có kiến thức về cấu trúc chuyển động rồi gắn kiến thức ấy với ảnh thực tế.

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/qwen-vla/figure-1.webp)

![Hình 4 từ PDF gốc, trang 17](/paper-figures/qwen-vla/figure-4.webp)

## Kiến thức nền

### Phân biệt các giai đoạn học của Qwen-VLA

**T2A** là huấn luyện dự đoán hành động từ mô tả bằng chữ, chưa dùng ảnh: bộ giải mã DiT học hình dạng của những chuỗi chuyển động hợp lý. **CPT** tiếp tục huấn luyện với ảnh để gắn kiến thức vận động ấy vào vật thể và bối cảnh cụ thể. **SFT** học có giám sát theo nhiệm vụ với dữ liệu robot được chọn lọc. **RL** tiếp tục tối ưu nhờ phần thưởng sau khi robot thực thi.

Các tên viết tắt này là tên những **giai đoạn huấn luyện**, không phải bốn kiến trúc độc lập. Thực ra chúng là **bốn bước trong cùng quy trình học**, được thiết kế để tránh phải học cả nhận biết ảnh và cấu trúc chuyển động từ đầu trong một lần.

### Ví dụ vì sao cần học chuyển động trước khi gắn với ảnh

Ví dụ ở T2A, câu “nhặt một khối rồi đặt bên phải khối khác” giúp bộ sinh học mẫu chuyển động, nhưng chưa biết tọa độ của hai khối trong ảnh hiện tại. Giai đoạn dùng ảnh mới buộc mạng liên hệ ngữ nghĩa với vật cụ thể. Đến giai đoạn thử thật, tỷ lệ thành công giúp kiểm tra phần nối giữa hai năng lực ấy.

## Phương pháp thực hiện

### Một lệnh điều khiển được hình thành ra sao?

Giả sử người dùng nói “Đặt hai chiếc dập ghim xanh lá cạnh nhau”. Ảnh camera cho biết hai vật đang ở đâu, phần thị giác–ngôn ngữ xử lý câu lệnh và cảnh. Bộ giải mã hành động DiT nhận điều kiện ấy cùng thông tin robot, tạo chuỗi chuyển động: tiếp cận vật thứ nhất, kẹp, đặt, rồi làm với vật thứ hai.

Trong lúc tiền huấn luyện T2A, mạng sinh hành động từ văn bản để học những mẫu chuyển động chung. Đến CPT/SFT, ảnh mới được gắn vào để chọn hành động đúng vị trí thực. Giai đoạn RL đánh giá kết quả khi robot chạy trong môi trường và đưa tín hiệu cải thiện. Không nên đồng nhất hàm mất mát T2A với tỷ lệ hoàn thành nhiệm vụ thật.

### Lệnh đa nhiệm cần được ghép với loại robot cụ thể

Câu lệnh “đặt hai chiếc dập ghim xanh lá cạnh nhau” có thể cho robot hai tay nhưng lệnh phát ra vẫn phải hợp lệ với số khớp và vị trí camera. Mô hình cần biết mình đang điều khiển loại robot nào; cùng một câu chữ không xác định được độ dài cánh tay, hướng khớp hoặc phạm vi mở kẹp.

Ở chuỗi nhiệm vụ dài, hãy xem cách chia mục tiêu: tìm đúng đồ, nhặt từng món, đưa về nơi đặt, rồi kiểm tra đã xong chưa. Nếu sai vật nhưng động tác kẹp rất mượt, cần sửa phần nhận biết; nếu đúng vật nhưng kẹp hụt, cần xem bộ sinh hành động và dữ liệu vận động.

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/qwen-vla/figure-2.webp)

## Ví dụ từng bước

### Ví dụ phân chia nhiệm vụ dọn bàn

Câu lệnh “Gom các chai đồ uống, để miếng bọt biển riêng” cần nhiều lần nhặt và đặt. Ở cấp nhiệm vụ, robot phải biết nhóm đồ nào cần gom, vật nào không đụng tới và khi nào đã xong. Ở cấp vận động, nó phải thực hiện từng đoạn tiến tới, kẹp, đưa sang vị trí đích và thả.

Hình 3 có ví dụ ngắn và dài để cho thấy độ khó tăng theo số bước. Nếu mô hình chọn đúng chai nhưng bỏ vào vùng dành cho miếng bọt biển, lỗi nằm ở cách hiểu nhiệm vụ/đích đặt. Nếu nó chọn đúng đích nhưng làm rơi chai, lỗi có thể ở bộ điều khiển và dữ liệu vận động.

![Hình 3 từ PDF gốc, trang 11](/paper-figures/qwen-vla/figure-3.webp)

![Hình 5 từ PDF gốc, trang 21](/paper-figures/qwen-vla/figure-5.webp)

## Kết quả thực nghiệm

### Thí nghiệm nào nói rõ vai trò từng bước học?

Hình 6 kiểm tra trực tiếp giai đoạn T2A. Thay tỷ lệ dữ liệu tổng hợp, cách dự đoán cả chuỗi hay theo đoạn và phân phối thời gian flow matching; bản dự đoán cả chuỗi với khoảng 20% dữ liệu tổng hợp cho kết quả tốt nhất trong những cấu hình được thử. Nếu học T2A quá lâu, hiệu quả còn có thể giảm do học quá sát dữ liệu nguồn.

Hình 7 thử việc học chung dữ liệu ảnh–ngôn ngữ với dữ liệu hành động. Trên bài dễ, lợi ích ít thấy; trên bài phải phân biệt vật tinh vi hoặc hiểu lệnh ghép nhiều điều kiện, hiệu quả tăng rõ. Đây là bằng chứng **loại dữ liệu giúp nhóm năng lực tương ứng**, không phải càng trộn nhiều thứ càng tốt trong mọi trường hợp.

### Đọc ba con số mà không đánh tráo điều kiện

Trong một phép thử trên robot ALOHA thuộc phân phối huấn luyện, một cấu hình Qwen-VLA có tiền huấn luyện được báo cáo khoảng 83,6% tỷ lệ thành công, so 48,5% ở phiên bản đối chứng. Ở một nhóm thao tác ngoài phân phối, điểm được báo cáo khoảng 76,9%. Nhưng trên bộ đánh giá DOMINO kiểm tra khả năng chuyển thẳng sang nhiệm vụ mới mà không tinh chỉnh, một kết quả được nêu là 26,6%.

Ba số này đo các vấn đề khác nhau. Không được kết luận mô hình “thành công 80% với mọi robot” rồi bỏ qua mức 26,6% khi chuyển miền. Muốn so công bằng, phải ghi rõ robot, dữ liệu tiền huấn luyện, có tinh chỉnh hay không và định nghĩa nhiệm vụ thành công.

![Hình 6 từ PDF gốc, trang 22](/paper-figures/qwen-vla/figure-6.webp)

![Hình 7 từ PDF gốc, trang 24](/paper-figures/qwen-vla/figure-7.webp)

## Hạn chế và câu hỏi còn mở

### Những kết luận chưa nên rút ra

Huấn luyện nhiều giai đoạn phức tạp hơn, tốn công cân bằng dữ liệu và khó xác định nguyên nhân khi một bước làm hiệu quả giảm. Một mô hình giỏi trả lời câu hỏi hoặc điều hướng chưa chắc thực hiện được thao tác tiếp xúc chính xác trên mọi kẹp robot.

Cách biểu diễn lệnh phải phù hợp loại robot đang chạy. Nếu đổi camera, khớp hoặc bộ điều khiển, cần kiểm chứng lại quá trình giải mã và an toàn. Tỷ lệ thành công trên một bộ nhiệm vụ ALOHA chưa đồng nghĩa có thể chuyển nguyên bản mô hình đã lưu sang mọi robot thật.

## Liên hệ với nghiên cứu khác

### Qwen-VLA liên hệ thế nào với RT-2 và π0.5?

RT-2 chứng minh hướng chuyển kiến thức ảnh–ngôn ngữ sang token hành động. π0.5 tách nguồn dữ liệu đa dạng và mức nhiệm vụ cao/thấp, dùng các phương pháp biểu diễn hành động khác nhau ở từng giai đoạn. Qwen-VLA cũng kết hợp nhiều nguồn tri thức nhưng tổ chức thành một quy trình T2A → CPT → SFT → RL có mục tiêu rõ cho từng bước.

Điều nên so sánh là *từng giai đoạn giải thiếu sót gì*, có giúp robot hiểu vật mới hay sinh chuyển động tốt hơn không. Một sơ đồ có nhiều khối không tự chứng minh hệ thống mạnh hơn.

### Những bài nên đọc tiếp

- [PaLM-E](/paper/palm-e)
- [RT-2](/paper/rt-2)
- [Diffusion Policy](/paper/diffusion-policy)
- [Open X-Embodiment](/paper/open-x-embodiment)
- [LingBot-VLA 2.0](/paper/lingbot-vla-2)

## Đọc mã nguồn và tự kiểm chứng

### Tự thiết kế phép thử tách ảnh hưởng của prompt

Giữ cùng ảnh hai vật và cùng bộ giải mã, thử hai prompt: “Đặt hai vật cạnh nhau” và “Đặt vật xanh bên trái vật đỏ”. Nếu robot bỏ qua quan hệ trong prompt, hai chuỗi thao tác có thể giống nhau sai mục tiêu. Tiếp tục giữ câu lệnh nhưng đổi vị trí vật để kiểm tra mạng dùng ảnh hay nhớ chỗ cũ.

Khi đọc thí nghiệm loại bỏ từng thành phần (ablation), hãy diễn đạt “thử bỏ hoặc đổi cơ chế để đo tác dụng”, không dịch thành “mài mòn”. Ghi rõ thay prompt, giai đoạn T2A hay việc trộn dữ liệu để không nhầm nguồn cải thiện.
