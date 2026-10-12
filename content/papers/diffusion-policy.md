## Vì sao cần nghiên cứu này?

Behavior cloning kiểu regression thường giả định một quan sát có một action target “trung bình”. Nhưng robot demonstrations rất hay **multimodal**: cùng một bối cảnh có thể vòng obstacle bên trái hoặc bên phải, grasp vật thể từ nhiều hướng, hoặc có nhiều quỹ đạo đều hợp lệ. MSE regression có xu hướng average các mode và tạo ra action chẳng mode nào muốn, một cách khá sáng tạo để robot đâm đúng vào giữa chướng ngại vật. Ngoài ra actions có theo thời gian correlation mạnh, nên dự đoán từng timestep độc lập làm quỹ đạo rung và dễ tích lũy lỗi.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/diffusion-policy/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 đối chiếu cách biểu diễn policy: một ánh xạ tường minh từ observation sang action, một hàm năng lượng ẩn và một quá trình sinh mẫu từ nhiễu. Trường hợp một trạng thái có hai hướng thao tác hợp lệ rất quan trọng: hồi quy MSE có thể tạo action trung bình nằm giữa hai mode và chẳng mode nào thật sự khả thi. Diffusion Policy mô hình hóa cả phân phối trên chuỗi hành động, vì thế có thể sinh một phương án nhất quán thay vì ép mọi demonstration vào một giá trị trung bình.

### Đào sâu: Điểm cốt lõi

**Luận điểm.** Sinh một quỹ đạo chuyển động đa phương án thay vì học action trung bình dễ va chạm. Behavior cloning kiểu regression thường giả định một quan sát có một action target “trung bình”.

**Vấn đề khoa học nằm ở đâu?** Robot vòng bên trái hoặc bên phải đều hợp lệ; action regression dễ trung bình hóa thành đường đâm giữa chướng ngại. Một hệ thống robot có thể có hình ảnh đẹp, output trông hợp lý nhưng vẫn sai ở cơ cấu thực thi. Vì thế phải tách câu hỏi về dữ liệu, câu hỏi về representation, câu hỏi về policy và câu hỏi về đánh giá. Học phân phối của cả action chunk bằng denoising là đóng góp cần đọc cùng các giả định ấy, không phải câu slogan thay thế cho thí nghiệm.

**Đọc đóng góp như một giả thuyết.** Cơ chế được đề xuất là Khởi đầu từ nhiễu, lặp bước chỉnh để tạo một quỹ đạo khả thi nhất quán theo thời gian. Nếu nó thật sự hữu ích, điểm khác biệt phải xuất hiện tại chính nơi baseline gặp bottleneck. Không đủ chỉ liệt kê thành phần mới; cần giải thích tại sao dữ liệu hoặc observation hiện có không giải được bài toán với cách làm cũ.

### Đào sâu: Một quan sát có thể dẫn đến nhiều đường đi đều đúng

**Luận điểm.** Robot vòng bên trái hoặc bên phải đều hợp lệ; action regression dễ trung bình hóa thành đường đâm giữa chướng ngại. MSE regression có xu hướng average các mode và tạo ra action chẳng mode nào muốn, một cách khá sáng tạo để robot đâm đúng vào giữa chướng ngại vật.

**Tại sao lỗi này có hệ quả lớn?** MSE action regression gom nhiều mode thành trung bình. Mỗi action làm thay đổi trạng thái môi trường và tạo ra observation tiếp theo. Một dự đoán hơi lệch có thể đẩy robot ra ngoài những trạng thái từng thấy trong demonstration, khiến bước sau khó phục hồi hơn. Bản thân một quan sát có thể dẫn đến nhiều đường đi đều đúng vì thế ảnh hưởng đến toàn bộ rollout, chứ không chỉ một hàng trong bảng accuracy.

**Thử nghĩ một phản ví dụ.** Nếu chỉ test các episode có điểm bắt đầu giống dữ liệu huấn luyện, policy có thể học shortcut về bối cảnh. Đổi nhẹ góc camera, vật thể hoặc thứ tự thao tác sẽ phơi bày liệu nó có dùng tín hiệu nhân quả phù hợp không. Vì vậy phải kiểm tra điều kiện test trước khi đọc tỷ lệ thành công.

### Đào sâu: MSE action regression gom nhiều mode thành trung bình

**Luận điểm.** Dự đoán độc lập từng bước cũng dễ khiến quỹ đạo giật và sai số tích lũy. Ngoài ra actions có theo thời gian correlation mạnh, nên dự đoán từng timestep độc lập làm quỹ đạo rung và dễ tích lũy lỗi.

**Hai quy trình khác nhau ra sao?** Phương pháp cũ gặp trở ngại: Dự đoán độc lập từng bước cũng dễ khiến quỹ đạo giật và sai số tích lũy.. Thay đổi trọng tâm là: Học phân phối của cả action chunk bằng denoising. Câu hỏi có ích nhất không phải mạng mới có bao nhiêu lớp, mà là thông tin nào trước kia bị đánh mất và giờ được chuyển qua đúng mô-đun. Khởi đầu từ nhiễu, lặp bước chỉnh để tạo một quỹ đạo khả thi nhất quán theo thời gian.

**Đặt điều kiện đối chứng.** Nếu train hai cách với data budget khác nhau, hoặc một bên dùng pretrained encoder còn bên kia không, chênh lệch không đủ để gán cho cơ chế mới. Một ablation đúng phải giữ càng nhiều yếu tố càng tốt và thay đổi đúng thành phần tác giả muốn chứng minh.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Vấn đề **multimodality**: cùng một bối cảnh có hai đường vòng chướng ngại hợp lệ. Regress với MSE một action trung bình có thể tạo con đường đi thẳng vào chướng ngại. Generative mô hình dự đoán phân phối có nhiều đỉnh sẽ lấy mẫu thuộc một mode thay vì average.

Mô hình diffusion học loại noise từ quỹ đạo. **Denoising timestep** hoàn toàn khác **timestep robot**: một cái là số vòng sinh, cái kia là thời gian vật lý trong action horizon. Nhầm hai thứ này là hiểu sai cả thuật toán.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Ba khái niệm để nắm

**Luận điểm.** Hiểu ba khái niệm này trước khi đọc thuật toán. Mô hình diffusion học loại noise từ quỹ đạo. Denoising timestep hoàn toàn khác timestep robot: một cái là số vòng sinh, cái kia là thời gian vật lý trong action horizon.

**Khái niệm thành cấu trúc tính toán.** Multimodality: Nhiều quỹ đạo đúng tương ứng cùng observation. Hãy luôn hỏi: input tensor là gì, output tensor là gì, biểu diễn đó mang thông tin thời gian hay không, và vì sao không thể đơn giản thay bằng một vector khác. Mô hình diffusion học loại noise từ quỹ đạo. Denoising timestep hoàn toàn khác timestep robot: một cái là số vòng sinh, cái kia là thời gian vật lý trong action horizon. Một thuật ngữ chỉ hữu ích khi nối được với dữ liệu và hành vi có thể quan sát.

**Tránh ba sự nhầm lẫn.** Dataset đa dạng chưa phải model khái quát; có latent hoặc token chưa chắc học được semantics; loss offline tốt chưa chắc action thực thi ổn định. Phần kiến thức nền dùng để loại trừ các kết luận quá mạnh đó. Muốn khẳng định model dùng đúng khái niệm, hãy kiểm tra ablation và intermediate representation.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Diffusion Policy biểu diễn cả **action chuỗi/chunk** như một conditional diffusion process. Mô hình bắt đầu từ noise rồi denoise thành một quỹ đạo, điều kiện trên thị giác quan sát và state. Nó dùng receding-horizon control: dự đoán một horizon tương đối dài, thực thi một đoạn ngắn, rồi observe và replan. Bài báo thử cả CNN và Transformer theo thời gian backbone.

Điểm bản chất không phải chỉ “dùng diffusion vì đang hot”, mà là diffusion có thể đại diện nhiều mode của phân phối action và vẫn tạo quỹ đạo temporal-coherent. Chính recipe này sau đó xuất hiện với biến thể flow matching trong π-series, RDT, GR00T, Qwen-VLA và một đống mô hình khác.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 2](/paper-figures/diffusion-policy/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 là ảnh từ các benchmark robot thật. Nó nhắc rằng quality của action không thể chỉ được đánh giá bằng loss trên dataset: cần thực thi trên cơ cấu vật lý, nơi contact, gripper, lực ma sát và sai số calibration làm bài toán khó hơn. Các task dùng UR5 hoặc Franka là bằng chứng trong phạm vi đó, không tự động chứng minh mô hình đã điều khiển tốt mọi loại robot. Khi đọc các ảnh, hãy tách điều policy dự đoán được khỏi điều controller/phần cứng đã xử lý.

#### Ví dụ từng bước để hiểu cơ chế

Ví dụ có hai demonstration mở ngăn kéo: một người đưa gripper tiếp cận từ trái, người khác từ phải. Nếu output là trung bình trực tiếp của hai quỹ đạo, robot có thể đi thẳng vào mép ngăn kéo. Diffusion model bắt đầu từ action trajectory nhiễu, denoise qua nhiều bước để chọn một mode hợp lệ theo ảnh quan sát. Chỉ thực thi một phần đầu chunk, sau đó quan sát lại và replan. Điều này cho phép đóng vòng, nhưng số bước denoising ảnh hưởng latency. Một so sánh tử tế phải nhìn trade-off giữa chất lượng mẫu và tốc độ inference.

### Đào sâu: Học phân phối của cả action chunk bằng denoising

**Luận điểm.** Khởi đầu từ nhiễu, lặp bước chỉnh để tạo một quỹ đạo khả thi nhất quán theo thời gian. Điểm bản chất không phải chỉ “dùng diffusion vì đang hot”, mà là diffusion có thể đại diện nhiều mode của phân phối action và vẫn tạo quỹ đạo temporal-coherent.

**Giải thích không dùng tên model.** Khởi đầu từ nhiễu, lặp bước chỉnh để tạo một quỹ đạo khả thi nhất quán theo thời gian. Thử mô tả bằng một câu chuyện đầu vào và đầu ra, tránh dựa vào từ như Transformer, flow, token hay MoE để thay thế giải thích. Điều quan trọng là hiểu cơ chế ấy biến thông tin quan sát thành điều gì có ích để robot ra quyết định.

**Từ intuition tới phép thử.** Sinh một quỹ đạo chuyển động đa phương án thay vì học action trung bình dễ va chạm. Nếu ta loại bỏ cơ chế đó nhưng giữ nguyên dữ liệu và evaluator, lỗi nào kỳ vọng tăng lên? Nếu không dự đoán được loại lỗi, có thể ta chỉ đang học thuộc mô tả phương pháp mà chưa hiểu tại sao tác giả lựa chọn nó.

### Đào sâu: Kiến trúc trong một sơ đồ

**Luận điểm.** Sinh một quỹ đạo chuyển động đa phương án thay vì học action trung bình dễ va chạm. Mô hình bắt đầu từ noise rồi denoise thành một quỹ đạo, điều kiện trên thị giác quan sát và state.

**Lần theo đầu vào đến đầu ra.** Sơ đồ nên được đọc theo thứ tự Ảnh + trạng thái → Noisy action chunk → Conditional denoiser → Quỹ đạo → thực thi ngắn. Mỗi mũi tên tương ứng với một thao tác thực: đọc cảm biến, xử lý tensor, trích đặc trưng, suy luận, giải mã hoặc gửi command. Nếu bỏ qua quá trình chuẩn hoá hay xử lý timestamp, sơ đồ vẫn đẹp nhưng implementation có thể fail.

**Chỗ dễ sai khi triển khai.** Mô hình bắt đầu từ noise rồi denoise thành một quỹ đạo, điều kiện trên thị giác quan sát và state. Với mỗi module, hãy ghi checkpoint nào dùng, shape dữ liệu, đơn vị và hệ quy chiếu, thành phần nào có gradient và thành phần nào chỉ hiện diện lúc training. Sau đó log action trước và sau inverse normalization để phát hiện lỗi thuộc pipeline chứ không phải lỗi model.

### Đào sâu: Mô hình biểu diễn cái gì?

**Luận điểm.** Một chunk A có kích thước horizon × action DoF. Nó dùng receding-horizon control: dự đoán một horizon tương đối dài, thực thi một đoạn ngắn, rồi observe và replan.

**Action là một hợp đồng kỹ thuật.** ĐẦU RA / DẠNG BIỂU DIỄN: Denoiser dự đoán nhiễu hoặc quỹ đạo sạch theo observation. Một vector điều khiển có thể là joint angle, delta end-effector, gripper hoặc các token đã lượng tử hoá. Cần biết số chiều, đơn vị, hệ tọa độ, scaling và trục thời gian. Nó dùng receding-horizon control: dự đoán một horizon tương đối dài, thực thi một đoạn ngắn, rồi observe và replan. Không xác định các yếu tố này thì chưa thể nối output model với phần cứng.

**Kiểm tra trước khi train.** Lấy một trajectory đúng, encode rồi decode qua representation dự kiến. Đo reconstruction error trên từng chiều và vị trí thời gian quan trọng, nhất là khi tiếp xúc vật thể. Thử đổi horizon hoặc normalization mà giữ nguyên dữ liệu. Một adapter sai có thể phá mọi rollout dù bản thân network vẫn tối ưu được loss.

### Đào sâu: Model học như thế nào?

**Luận điểm.** Lấy ground-truth action sequences từ demonstrations. Chính recipe này sau đó xuất hiện với biến thể flow matching trong π-series, RDT, GR00T, Qwen-VLA và một đống mô hình khác.

**Loss phải có nguồn supervision.** MỤC TIÊU HỌC: Thêm Gaussian noise ở mức k và học loại nhiễu. Hãy chỉ ra batch gồm observation, state, instruction, target action hay target đặc trưng nào; rồi xác định mô hình đang học reconstruction, dự đoán chuỗi hay một phân phối có điều kiện. Cùng tên 'training' nhưng cách tạo target ở BC, diffusion, flow matching và mô hình dự đoán đặc trưng khác nhau căn bản.

**Phân tách lỗi dữ liệu và lỗi thuật toán.** Chính recipe này sau đó xuất hiện với biến thể flow matching trong π-series, RDT, GR00T, Qwen-VLA và một đống mô hình khác. Kiểm tra episode split trước khi chia thành window, kiểm tra timestamp camera/action, normalization, random seed và khả năng overfit một subset nhỏ. Nếu vài trajectory còn không học được, việc tăng model size hoặc đổi scheduler thường chỉ che lỗi implementation.

**Đọc ablation đúng cách.** Sự khác nhau giữa CNN và Transformer action backbones và các horizon. Khi đổi một module phải giữ data budget, training steps và quy trình đánh giá tương đương. Nếu nhiều thứ đổi cùng lúc, tác dụng thực sự là của toàn hệ thống, không thể kết luận một trick đơn lẻ tạo toàn bộ mức cải thiện.

### Đào sâu: Mathematical Intuition

**Luận điểm.** Trộn action thật A với nhiễu ε; khi học, mạng biết cách đảo quá trình để tìm quỹ đạo hợp lệ. Regress với MSE một action trung bình có thể tạo con đường đi thẳng vào chướng ngại. Generative mô hình dự đoán phân phối có nhiều đỉnh sẽ lấy mẫu thuộc một mode thay vì average.

$$
x_k=\sqrt{\bar\alpha_k}\,A+\sqrt{1-\bar\alpha_k}\,\epsilon
$$

**Công thức đang mô tả thứ gì?** Trộn action thật A với nhiễu ε; khi học, mạng biết cách đảo quá trình để tìm quỹ đạo hợp lệ. Trước khi tính đạo hàm hoặc chuyển vế, hãy xác định đâu là observation, đâu là biến action, đâu là horizon/conditioning và đâu là tham số được học. Regress với MSE một action trung bình có thể tạo con đường đi thẳng vào chướng ngại. Generative mô hình dự đoán phân phối có nhiều đỉnh sẽ lấy mẫu thuộc một mode thay vì average. Ký hiệu ngắn gọn không nói hết cách chọn discretization, action mask hoặc runtime sampler.

**Một phép thử bằng hai trajectory.** Hai lần thao tác có cùng mục tiêu nhưng trạng thái ban đầu khác nhau có thể cần action khác. Công thức này có cho phép output phụ thuộc vào thông tin phân biệt ấy không? Nếu nhiều demonstration hợp lệ khác nhau, model học một mode, average hay một phân phối đa mode? Đây mới là câu hỏi hiểu toán trong robot learning.

**Giới hạn của suy luận từ công thức.** Ký hiệu mô tả forward noise thường gặp trong diffusion. Một biểu thức xác suất hoặc phép nội suy không tự chứng minh model đã học vật lý hay robot sẽ thành công. Loss và nguồn target quyết định model có tín hiệu nào, còn evaluation mới cho biết hành vi thực hiện ngoài đời.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 3 từ PDF gốc, trang 3](/paper-figures/diffusion-policy/figure-3.webp)


![Hình 4 từ PDF gốc, trang 4](/paper-figures/diffusion-policy/figure-4.webp)


![Hình 6 từ PDF gốc, trang 5](/paper-figures/diffusion-policy/figure-6.webp)


![Hình 8 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-8.webp)


![Hình 9 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-9.webp)


![Hình 10 từ PDF gốc, trang 9](/paper-figures/diffusion-policy/figure-10.webp)


![Hình 11 từ PDF gốc, trang 10](/paper-figures/diffusion-policy/figure-11.webp)


![Hình 12 từ PDF gốc, trang 14](/paper-figures/diffusion-policy/figure-12.webp)


![Hình 13 từ PDF gốc, trang 14](/paper-figures/diffusion-policy/figure-13.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Ví dụ từng bước

Tạo demo Push-T: quan sát gồm tọa độ pusher và vật T. Với cùng start state, demonstrator có thể đi từ bên trái hoặc bên phải. Lúc huấn luyện, lấy ground truth action chuỗi `A_0`, thêm nhiễu Gaussian để có `A_k`, cho mạng dự đoán noise hoặc denoised quỹ đạo. Inference bắt đầu từ noise, lặp nhiều bước đến action chunk hợp lệ. Robot chỉ thực thi `a_0...a_m`, chụp quan sát mới, rồi replan.

Điểm quan trọng: `prediction horizon` và `action horizon` **không giống nhau**. Tăng horizon dự đoán giúp theo thời gian coherence nhưng có thể làm lập kế hoạch bị stale.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Một lần inference xảy ra ra sao?

**Luận điểm.** Bắt đầu từ noise, model khử nhiễu theo nhiều vòng để sinh một chunk có điều kiện theo quan sát. Inference bắt đầu từ noise, lặp nhiều bước đến action chunk hợp lệ. Robot chỉ thực thi a_0...a_m, chụp quan sát mới, rồi replan.

**Một tick điều khiển xảy ra thế nào?** XỬ LÝ ĐẦU VÀO: Chạy denoising nhiều vòng dưới điều kiện observation. Ta nhận observation, tính conditioning, sinh action, giải mã và gửi lệnh xuống controller. Inference bắt đầu từ noise, lặp nhiều bước đến action chunk hợp lệ. Robot chỉ thực thi a_0...a_m, chụp quan sát mới, rồi replan. Hãy ghi lại thời điểm ở mỗi bước vì latency từ ảnh đến actuator khác với thời gian chạy forward của riêng backbone.

**Khi môi trường đổi giữa hai lần query.** Nếu vật thể dịch chuyển, mô hình có nhận observation mới đủ nhanh không; action nào đã cam kết và action nào có thể sửa? TẠO HÀNH ĐỘNG: Chạy vài action, đọc camera mới và replan; đổi lại có inference latency. Trả lời được mới hiểu policy có thực sự closed-loop hoặc chỉ phát một quỹ đạo cố định rồi hy vọng robot làm đúng.

**Điều nên đo thêm.** Ngoài task success, hãy log tail latency, action jerk, lỗi ở điểm nối các action chunk và khả năng phục hồi sau disturbance. Một video chuyển động mượt không chứng minh robot làm đúng mục tiêu, còn throughput cao chưa chắc đảm bảo control loop ổn định.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

Trên **12 nhiệm vụ thuộc 4 benchmark families**, tác giả nêu cải thiện trung bình rất lớn so với các phương pháp đối chứng điều khiển từ thị giác, khoảng **46.9%** theo cách tổng hợp của tác giả. Với nhiệm vụ trên robot thật như mug flipping, sauce pouring/spreading, diffusion policy đạt thành công cao trong khi một số phương pháp đối chứng LSTM-GMM hoặc hồi quy thất bại hoặc kém rõ rệt. Huấn luyện cũng ổn định hơn các energy-based alternatives mà bài báo so sánh.

Kết quả có sức ảnh hưởng nhất là qualitative: quỹ đạo mượt nhưng vẫn giữ được nhiều mode, thay vì biến multimodality thành average chuyển động. Từ sau bài báo này, câu hỏi của field đổi từ “diffusion có dùng được cho robot không?” sang “action diffusion/flow nên được ghép vào VLA thế nào và làm sao giảm độ trễ?”.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Kết quả nói lên điều gì?

**Luận điểm.** Đánh giá 12 nhiệm vụ thuộc 4 nhóm benchmark. Trên 12 nhiệm vụ thuộc 4 benchmark families, tác giả nêu cải thiện trung bình rất lớn so với các phương pháp đối chứng điều khiển từ thị giác, khoảng 46.9% theo cách tổng hợp của tác giả.

**Cách đọc bảng số liệu.** PHÁT HIỆN QUAN TRỌNG: Bài báo báo trung bình cải thiện khoảng 46,9% theo cách tổng hợp của tác giả. Trước khi so score, xác định metric đo thành công cuối hay progress từng bước, baseline dùng dữ liệu gì, số lần lặp, tập test và cách gộp các nhiệm vụ. Trên 12 nhiệm vụ thuộc 4 benchmark families, tác giả nêu cải thiện trung bình rất lớn so với các phương pháp đối chứng điều khiển từ thị giác, khoảng 46.9% theo cách tổng hợp của tác giả. Chênh lệch average đôi khi giấu những task thất bại nghiêm trọng.

**Từ số sang kết luận có phạm vi.** CÁCH DIỄN GIẢI: Nhiệm vụ thực như mug flipping và sauce pouring cho thấy lợi thế trên nhiều baseline. Một mô hình khái quát tốt trên lệnh mới chưa chắc điều khiển contact-rich tốt; data diversity hiệu quả chưa bảo đảm chuyển được sang morphology lạ; model chạy nhanh chưa có nghĩa tail latency phù hợp servo. Phải kết luận theo đúng chiều mà thí nghiệm đo.

**Độ tin cậy của bằng chứng.** Camera placement, calibration, noise, split, seed và budget huấn luyện đều ảnh hưởng outcome. Một kết quả đáng tin cần báo cáo đủ điều kiện để người đọc kiểm tra, và có đối chứng tránh nhiễu. Nếu thiếu, hãy nói rõ mức bất định thay vì tưởng tượng số liệu.

### Đào sâu: Ablation và bằng chứng

**Luận điểm.** Sự khác nhau giữa CNN và Transformer action backbones và các horizon. Với nhiệm vụ trên robot thật như mug flipping, sauce pouring/spreading, diffusion policy đạt thành công cao trong khi một số phương pháp đối chứng LSTM-GMM hoặc hồi quy thất bại hoặc kém rõ rệt.

**Ablation hỏi nguyên nhân, không chỉ điểm số.** YẾU TỐ ĐƯỢC THỬ: Cải thiện không chỉ đến từ diffusion: receding horizon và tuning đều góp phần. Loại bỏ một thành phần khiến performance giảm là dấu hiệu hữu ích trong thiết lập đã thử, nhưng chưa chứng minh nó là giải pháp duy nhất. Với nhiệm vụ trên robot thật như mug flipping, sauce pouring/spreading, diffusion policy đạt thành công cao trong khi một số phương pháp đối chứng LSTM-GMM hoặc hồi quy thất bại hoặc kém rõ rệt. Hãy tìm xem các đường baseline có chung dữ liệu, model capacity và ngân sách tối ưu không.

**Đọc theo từng failure mode.** Với nhiệm vụ trên robot thật như mug flipping, sauce pouring/spreading, diffusion policy đạt thành công cao trong khi một số phương pháp đối chứng LSTM-GMM hoặc hồi quy thất bại hoặc kém rõ rệt. Nếu average tốt lên nhưng contact task tụt, hoặc latent loss giảm mà success rate không đổi, cần ghi nhận trade-off. Ta muốn biết mô-đun cải thiện lỗi nào, trong điều kiện nào, chứ không chỉ một điểm trung bình được làm nổi bật.

<!-- END EXTENDED WALKTHROUGH -->

<!-- BEGIN SUPPLEMENTARY FIGURES -->

### Hình minh hoạ bổ sung từ bài báo


Các hình dưới đây được trích từ PDF gốc. Chạm vào hình để phóng to; bản dịch tiếng Việt và caption tiếng Anh được giữ cạnh nhau.


![Hình 5 từ PDF gốc, trang 5](/paper-figures/diffusion-policy/figure-5.webp)


![Hình 7 từ PDF gốc, trang 6](/paper-figures/diffusion-policy/figure-7.webp)


<!-- END SUPPLEMENTARY FIGURES -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** đây vẫn là behavior cloning, nên bad demos hoặc thiếu coverage vẫn đặt trần. Iterative denoising làm inference đắt hơn one-shot regression, gây khó cho high-frequency control. Tác giả cũng chỉ ra hướng kết hợp dữ liệu gây tác động tiêu cực/RL và acceleration như việc cần làm tiếp.

**Phê bình thêm:** không phải mọi gain đều có thể quy cho diffusion; action horizon, receding-horizon control, kiến trúc xử lý chuỗi thời gian và tuning cùng thay đổi. Trong thế giới thực đánh giá vẫn nhỏ so với độ rộng claim. Tính đa phương thức cũng không phải nút thắt chính của mọi nhiệm vụ, nên diffusion có thể là quá phức tạp so với nhu cầu cho một số policy đơn giản. Quan trọng nhất cho VLA hiện đại: iterative denoising tạo ra độ trễ và vấn đề nối các action chunk, thứ mà các bài báo RTC người đọc vừa tìm hiểu phải đi chữa về sau.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Hạn chế cần nói thẳng

**Luận điểm.** Tách rõ tác giả thừa nhận và nhận định phê bình độc lập. Iterative denoising làm inference đắt hơn one-shot regression, gây khó cho high-frequency control.

**Phân biệt điều tác giả chỉ ra và điều ta suy đoán.** Tác giả / phạm vi: Tác giả: iterative denoising đắt hơn one-shot regression; dữ liệu BC giới hạn ceiling. Câu 'chưa đánh giá' không đồng nghĩa với 'đã thử và thất bại'. Câu 'có thể chịu rủi ro' không được viết thành số liệu âm tính. Iterative denoising làm inference đắt hơn one-shot regression, gây khó cho high-frequency control. Ranh giới đó giúp đọc nghiên cứu nghiêm túc mà không tô hồng hoặc bác bỏ quá mức.

**Ngoài benchmark còn có hệ thống thật.** Phê bình độc lập: Phê bình: multi-modality không phải nút thắt của mọi nhiệm vụ; cần cân nhắc latency khi triển khai 50 Hz. Khi chuyển sang robot khác, camera, workspace, DOF, actuator limits và controller đều có thể phá các giả định gốc. Cần kiểm tra safety, valid action range và các tình huống bắt đầu lệch chuẩn trước khi coi một policy là sẵn sàng triển khai.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RDT-1B](/paper/rdt-1b)
- [GR00T N1](/paper/groot-n1)
- [π0.5](/paper/pi-0-5)
- [RTC (inference)](/paper/rtc-inference)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Bài này đứng ở đâu trong lĩnh vực?

**Luận điểm.** Không đọc paper như một hòn đảo riêng. Đọc thêm RDT-1B, GR00T N1, π0.5, RTC (inference). Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

**So sánh theo trục kỹ thuật.** NỀN TẢNG / TIỀN ĐỀ: RDT-1B và π0.5 phát triển action generative modeling ở quy mô VLA. Hãy xếp các nghiên cứu cạnh nhau theo nguồn dữ liệu, representation, khả năng hiểu lệnh, action generation, embodiment và latency thay vì chỉ theo năm công bố. Một mô hình mạnh về ngữ nghĩa không nhất thiết giỏi điều khiển tốc độ cao.

**Không trộn quan hệ chủ đề với trích dẫn.** HƯỚNG PHÁT TRIỂN: RTC giải quyết chuyện nối chunk và delay của generative policies. Một công trình có thể là tiền đề kỹ thuật, một biến thể cùng nhiệm vụ hoặc hướng xử lý bottleneck còn bỏ ngỏ; các quan hệ ấy cần trình bày chính xác. Đọc thêm RDT-1B, GR00T N1, π0.5, RTC (inference). Các liên hệ này theo kỹ thuật hoặc bài toán, không mặc định tác giả trực tiếp trích dẫn nhau.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Dùng Push-T state phương pháp đối chứng trong repo chính thức. Plot 10 sampled các quỹ đạo cho cùng quan sát; thay số denoising steps 100/20/5, horizon và action horizon, đo thành công và độ trễ. Đừng kết luận chỉ bằng offline MSE.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đào sâu: Nếu chỉ nhớ ba điều

**Luận điểm.** Generative action model tránh bình quân hóa những quỹ đạo đúng khác nhau. Dùng Push-T state phương pháp đối chứng trong repo chính thức. Plot 10 sampled các quỹ đạo cho cùng quan sát; thay số denoising steps 100/20/5, horizon và action horizon, đo thành công và độ trễ.

**Chọn điều cần mang sang dự án thật.** Ưu tiên khi thao tác có multimodal action và chunk consistency. Đừng cố sao chép toàn bộ hệ thống lớn ngay. Tìm một vấn đề cụ thể của robot mình rồi áp dụng đúng thành phần liên quan, với baseline đơn giản và một phép đo rõ ràng. Generative action model tránh bình quân hóa những quỹ đạo đúng khác nhau.

**Tái hiện tối thiểu.** Dùng Push-T state phương pháp đối chứng trong repo chính thức. Plot 10 sampled các quỹ đạo cho cùng quan sát; thay số denoising steps 100/20/5, horizon và action horizon, đo thành công và độ trễ. Bắt đầu bằng 1–2 episode kiểm được bằng mắt, ghi shape, unit và timestamp; tiếp theo mới mở rộng dataset, thêm nhiều seed và đánh giá held-out. Viết sẵn điều kiện pass/fail để không biến công việc thành quá trình tune vô tận.

**Tự kiểm tra đã hiểu.** Sau khi đọc, phải giải thích được observation → representation → action; mô tả loss và supervision; rồi đọc đúng metric, baseline, limitation. Nếu thiếu một trong ba, quay lại chính phần đó thay vì học thuộc tên kiến trúc.

<!-- END EXTENDED WALKTHROUGH -->

