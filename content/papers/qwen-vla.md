> **Bài do bạn cung cấp.** [Qwen-VLA: Unifying Vision-Language-Action Modeling across Tasks, Environments, and Robot Embodiments](https://arxiv.org/abs/2605.30280), Qwen Team, arXiv 2026. Đọc song song với **Figure 2** về kiến trúc, **Tables 1–2** về hỗn hợp dữ liệu/embodiment, và **Tables 4–6** về kết quả. Tên “Qwen-VLA” không có nghĩa mọi capability đã khái quát ngang nhau.

## Vì sao cần nghiên cứu này?

### Một mô hình có thể vừa thao tác vật vừa điều hướng không?

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 17](/paper-figures/qwen-vla/figure-4.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Robot có thể được nghiên cứu theo ba nhóm lớn: cánh tay thao tác vật, robot tự di chuyển và mô hình dự đoán quỹ đạo. Mỗi nhóm thường dùng kiểu cảm biến và dạng lệnh riêng. Ngay cả trong thao tác tay máy, hai robot có thể khác số khớp, hệ tọa độ và tần số điều khiển. Nếu phải huấn luyện một checkpoint riêng cho mỗi cấu hình, rất nhiều kiến thức về đồ vật và cách thực hiện công việc không được chia sẻ. Qwen-VLA tìm cách xây phần biểu diễn chung, đồng thời vẫn nhận biết robot nào đang được điều khiển.

Một robot có thể phải nhặt đồ vật, di chuyển trong phòng hoặc trả lời câu hỏi về thứ camera đang nhìn thấy. Các việc ấy đòi những dạng kết quả khác nhau, trong khi nhiều kiến thức về đồ vật và ngôn ngữ có thể dùng chung. **Qwen-VLA tổ chức việc học thành nhiều giai đoạn để kết nối hiểu ảnh–ngôn ngữ với sinh hành động robot.** Bộ sinh hành động trước hết học cấu trúc chuyển động từ mô tả bằng chữ, sau đó học liên hệ với ảnh thật, tiếp tục tinh chỉnh theo nhiệm vụ và cuối cùng có thể tối ưu bằng phần thưởng khi robot tương tác với môi trường.

Khó khăn là **action semantics không đồng nhất**. Một vector 7 chiều có thể là end-effector translation/rotation/gripper; robot khác 14 joint angles; agent navigation lại xuất waypoint và heading. Đưa tất cả vào cùng tensor padding mà không mô tả embodiment sẽ khiến mô hình học mapping mơ hồ. Vì vậy kiến trúc phải đồng thời giải VLM grounding, biểu diễn/conditioning và sinh action.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/qwen-vla/figure-1.webp)


### Vì sao một mô hình cần hiểu nhiều loại nhiệm vụ robot?

Một robot có thể được giao “Nhặt chiếc cốc đỏ”, “Đi tới cạnh bàn” hoặc “Chiếc cốc nào gần cửa hơn?”. Các yêu cầu có đầu ra khác nhau: thao tác tay, điều hướng hoặc câu trả lời. Nếu mỗi loại dùng mạng hoàn toàn riêng, dữ liệu và kiến thức khó chia sẻ. Qwen-VLA nghiên cứu một mô hình có thể học từ nhiều nhóm dữ liệu, kết hợp hiểu ảnh–ngôn ngữ với sinh hành động robot.

Điểm quan trọng là **hiểu được lời yêu cầu không đồng nghĩa biết ngay cách cử động**. Vì thế phương pháp huấn luyện không chỉ cho model học câu chữ, mà còn xây một bộ sinh action có kiến thức về cấu trúc chuyển động rồi gắn kiến thức ấy với ảnh thực tế.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền

**Cấu hình robot** gồm số khớp, kiểu kẹp, camera, hệ tọa độ và dạng lệnh. Hai robot cùng thực hiện việc đặt vật nhưng một chiếc điều khiển vị trí đầu kẹp, chiếc khác điều khiển góc khớp; không thể dùng chung nguyên một vector hành động.

**DiT (Diffusion Transformer)** là mạng sinh hành động dựa trên Transformer, có thể nhận đặc trưng ảnh và lời chỉ dẫn từ phần VLM. **Flow matching** dạy mạng biến một chuỗi còn nhiễu thành hành động liên tục phù hợp quan sát. Đây là khác biệt quan trọng so với cách mã hóa từng giá trị hành động thành token ngôn ngữ như một số VLA trước đây.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Phân biệt các giai đoạn học của Qwen-VLA

**T2A** là huấn luyện dự đoán hành động từ mô tả bằng chữ, chưa dùng ảnh: bộ giải mã DiT học hình dạng của những chuỗi chuyển động hợp lý. **CPT** tiếp tục huấn luyện với ảnh để gắn kiến thức vận động ấy vào vật thể và bối cảnh cụ thể. **SFT** học có giám sát theo nhiệm vụ với dữ liệu robot được chọn lọc. **RL** tiếp tục tối ưu nhờ phần thưởng sau khi robot thực thi.

Các tên viết tắt có thể khiến người mới tưởng là bốn kiến trúc khác nhau. Thực ra chúng là **bốn bước trong cùng quy trình học**, được thiết kế để tránh phải học cả nhận biết ảnh và cấu trúc chuyển động từ đầu trong một lần.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Qwen-VLA kết hợp phần hiểu ảnh–ngôn ngữ Qwen với bộ sinh chuỗi hành động DiT. Đầu vào có thể gồm ảnh, đoạn video, chỉ dẫn và thông tin về robot. Mạng dự đoán các lệnh liên tục theo cấu hình robot tương ứng, không buộc mọi góc khớp phải được viết thành token chữ.

Quy trình học gồm **bốn giai đoạn**. Đầu tiên mạng học mối quan hệ giữa lời mô tả và chuyển động (T2A). Tiếp theo nó gắn chuyển động với ảnh thực tế trong giai đoạn học tiếp (CPT). Sau đó mô hình được **tinh chỉnh có giám sát (SFT)** cho từng nhóm nhiệm vụ. Cuối cùng, **học tăng cường (RL)** tận dụng phần thưởng khi robot chạy để tiếp tục cải thiện. Các bước này có mục tiêu khác nhau; không nên gộp thành một lần huấn luyện chung không phân biệt.

```text
instruction + embodiment description + visual input
                            │
                 Qwen visual-language backbone
                            │ conditioned features
                            ▼
                 DiT action / trajectory expert
                 noisy actions + flow time τ
                            │ multiple Euler steps
                            ▼
                continuous chunk / waypoint / trajectory
                            │
                    embodiment-specific adapter
```

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 6](/paper-figures/qwen-vla/figure-2.webp)


### Một lệnh điều khiển được hình thành ra sao?

Giả sử người dùng nói “Đặt hai chiếc dập ghim xanh lá cạnh nhau”. Ảnh camera cho biết hai vật đang ở đâu, phần thị giác–ngôn ngữ xử lý câu lệnh và cảnh. Bộ giải mã hành động DiT nhận điều kiện ấy cùng thông tin robot, tạo chuỗi chuyển động: tiếp cận vật thứ nhất, kẹp, đặt, rồi làm với vật thứ hai.

Trong lúc tiền huấn luyện T2A, mạng sinh hành động từ văn bản để học những mẫu chuyển động chung. Đến CPT/SFT, ảnh mới được gắn vào để chọn hành động đúng vị trí thực. Giai đoạn RL đánh giá kết quả khi robot chạy trong môi trường và đưa tín hiệu cải thiện. Không nên đồng nhất loss T2A với tỷ lệ hoàn thành nhiệm vụ thật.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Câu lệnh **“Đưa chiếc đĩa vào bồn rửa”** có thể yêu cầu chuyển động khác nhau ở robot một tay và robot có bệ di động. Cả hai cần nhận biết chiếc đĩa và bồn; robot di động còn phải tới gần bồn trước khi đưa tay ra.

Phần VLM xác định đồ vật, mục tiêu và bối cảnh. Bộ sinh DiT tạo chuỗi lệnh phù hợp thông tin robot. Bộ chuyển đổi đầu ra phải đưa chuỗi về đúng dạng khớp, đầu kẹp hoặc vận tốc bệ. Nếu thay cấu hình robot nhưng không đổi cách diễn giải lệnh, model có thể đưa ra vector hợp lệ về kích thước mà vẫn vô nghĩa về vật lý.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 11](/paper-figures/qwen-vla/figure-3.webp)
![Hình 5 từ PDF gốc, trang 21](/paper-figures/qwen-vla/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ phân chia nhiệm vụ dọn bàn

Câu lệnh “Gom các chai đồ uống, để miếng bọt biển riêng” cần nhiều lần nhặt và đặt. Ở cấp nhiệm vụ, robot phải biết nhóm đồ nào cần gom, vật nào không đụng tới và khi nào đã xong. Ở cấp vận động, nó phải thực hiện từng đoạn tiến tới, kẹp, đưa sang vị trí đích và thả.

Hình 3 có ví dụ ngắn và dài để cho thấy độ khó tăng theo số bước. Nếu model chọn đúng chai nhưng bỏ vào vùng dành cho miếng bọt biển, lỗi nằm ở cách hiểu nhiệm vụ/đích đặt. Nếu nó chọn đúng đích nhưng làm rơi chai, lỗi có thể ở bộ điều khiển và dữ liệu vận động.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Bài báo thử nhiều nhóm nhiệm vụ, gồm thao tác tay máy, di chuyển và một số phép đánh giá dự đoán quỹ đạo. Trên những bài kiểm tra ALOHA robot thật được báo cáo, phiên bản có học trước đạt tỷ lệ thành công trung bình khoảng **83,6%** ở nhiệm vụ thuộc điều kiện quen, so với **48,5%** của một phiên bản đối chứng. Một nhóm thao tác ngoài phân phối huấn luyện đạt mức trung bình khoảng **76,9%** theo thiết lập của tác giả.

Các thí nghiệm thay riêng giai đoạn T2A, cách dùng dữ liệu ảnh–ngôn ngữ và quá trình tinh chỉnh giúp nhận ra nguồn cải thiện. Ví dụ học trước quá lâu ở một giai đoạn không nhất thiết làm kết quả tốt hơn; dữ liệu ảnh–ngôn ngữ hữu ích rõ hơn ở những câu lệnh đòi phân biệt đồ vật hoặc mục tiêu phức tạp.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 6 từ PDF gốc, trang 22](/paper-figures/qwen-vla/figure-6.webp)
![Hình 7 từ PDF gốc, trang 24](/paper-figures/qwen-vla/figure-7.webp)

<!-- END ADDITIONAL PDF FIGURES -->

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Thí nghiệm nào nói rõ vai trò từng bước học?

Hình 6 kiểm tra trực tiếp giai đoạn T2A. Thay tỷ lệ dữ liệu tổng hợp, cách dự đoán cả chuỗi hay theo đoạn và phân phối thời gian flow matching; bản dự đoán cả chuỗi với khoảng 20% dữ liệu tổng hợp cho kết quả tốt nhất trong những cấu hình được thử. Nếu học T2A quá lâu, hiệu quả còn có thể giảm do học quá sát dữ liệu nguồn.

Hình 7 thử việc học chung dữ liệu ảnh–ngôn ngữ với dữ liệu action. Trên bài dễ, lợi ích ít thấy; trên bài phải phân biệt vật tinh vi hoặc hiểu lệnh ghép nhiều điều kiện, hiệu quả tăng rõ. Đây là bằng chứng **loại dữ liệu giúp nhóm năng lực tương ứng**, không phải càng trộn nhiều thứ càng tốt trong mọi trường hợp.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

Mô hình được thử trên những loại robot, nhóm nhiệm vụ và môi trường xác định. Việc có mô tả cấu hình robot trong đầu vào không bảo đảm mô hình điều khiển ngay phần cứng hoàn toàn mới mà không cần demonstration. Mạng ảnh–ngôn ngữ lớn kết hợp DiT còn gây độ trễ và tốn bộ nhớ đáng kể.

Ngoài ra, hiểu ảnh tốt không đủ để điều khiển tiếp xúc chính xác. Điều hướng, thao tác hai tay và bàn tay nhiều ngón có những giới hạn vật lý khác nhau. Khi so điểm, cần tách tác dụng của dữ liệu học trước, số lượt tinh chỉnh và bộ chuyển đổi lệnh thay vì quy mọi cải thiện cho một thành phần duy nhất.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những kết luận chưa nên rút ra

Huấn luyện nhiều giai đoạn phức tạp hơn, tốn công cân bằng dữ liệu và khó xác định nguyên nhân khi một bước làm hiệu quả giảm. Một model giỏi trả lời câu hỏi hoặc điều hướng chưa chắc thực hiện được thao tác tiếp xúc chính xác trên mọi gripper.

Cách biểu diễn lệnh phải phù hợp loại robot đang chạy. Nếu đổi camera, khớp hoặc bộ điều khiển, cần kiểm chứng lại quá trình giải mã và an toàn. Tỷ lệ thành công trên một bộ nhiệm vụ ALOHA chưa đồng nghĩa có thể chuyển nguyên checkpoint sang mọi robot thật.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

- [PaLM-E](/paper/palm-e) mở hướng đưa thị giác/đầu vào cảm biến vào mô hình ngôn ngữ đã pretrain.
- [RT-2](/paper/rt-2) và [OpenVLA](/paper/openvla) là nhánh VLM-to-action discrete tokens.
- [Diffusion Policy](/paper/diffusion-policy), [RDT-1B](/paper/rdt-1b) và [GR00T N1](/paper/groot-n1) giúp hiểu liên tục generative action heads.
- [Open X-Embodiment](/paper/open-x-embodiment) là bài học cốt lõi về hỗn hợp dữ liệu và embodiment alignment.
- [LingBot-VLA 2.0](/paper/lingbot-vla-2) cũng xử lý multi-embodiment, nhưng chọn canonical whole-body action và sparse MoE.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Qwen-VLA liên hệ thế nào với RT-2 và π0.5?

RT-2 chứng minh hướng chuyển kiến thức ảnh–ngôn ngữ sang token hành động. π0.5 tách nguồn dữ liệu đa dạng và mức nhiệm vụ cao/thấp, dùng các phương pháp biểu diễn action khác nhau ở từng giai đoạn. Qwen-VLA cũng kết hợp nhiều nguồn tri thức nhưng tổ chức thành một quy trình T2A → CPT → SFT → RL có mục tiêu rõ cho từng bước.

Điều nên so sánh là *từng giai đoạn giải thiếu sót gì*, có giúp robot hiểu vật mới hay sinh chuyển động tốt hơn không. Một sơ đồ có nhiều khối không tự chứng minh hệ thống mạnh hơn.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Bắt đầu từ [mã nguồn Qwen-VLA](https://github.com/QwenLM/Qwen-VLA). Theo dõi một mẫu dữ liệu qua các bước ảnh/câu lệnh → biểu diễn VLM → bộ sinh DiT → giải chuẩn hóa → lệnh điều khiển. Ghi số chiều và đơn vị ở từng bước để phát hiện những chỗ dữ liệu bị đổi sai dạng.

Giữ ảnh và câu lệnh cố định nhưng thay mô tả cấu hình robot trong đầu vào, xem dạng lệnh đầu ra có đổi phù hợp không. Đừng vội chạy robot thật trước khi kiểm tra giới hạn khớp và phép chuyển đổi action.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự thiết kế phép thử tách ảnh hưởng của prompt

Giữ cùng ảnh hai vật và cùng bộ giải mã, thử hai prompt: “Đặt hai vật cạnh nhau” và “Đặt vật xanh bên trái vật đỏ”. Nếu robot bỏ qua quan hệ trong prompt, hai chuỗi thao tác có thể giống nhau sai mục tiêu. Tiếp tục giữ câu lệnh nhưng đổi vị trí vật để kiểm tra mạng dùng ảnh hay nhớ chỗ cũ.

Khi đọc ablation, hãy diễn đạt “thử bỏ hoặc đổi cơ chế để đo tác dụng”, không dịch thành “mài mòn”. Ghi rõ thay prompt, giai đoạn T2A hay việc trộn dữ liệu để không nhầm nguồn cải thiện.

<!-- END EXTENDED WALKTHROUGH -->

