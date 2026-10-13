## Vì sao cần nghiên cứu này?

Mỗi phòng thí nghiệm thường dùng một loại robot, camera và cách biểu diễn lệnh riêng. Nếu dữ liệu của robot Franka không thể hỗ trợ robot WidowX, mỗi nhóm sẽ phải học lại gần như từ đầu dù hai robot cùng biết nhặt và đặt vật. **Open X-Embodiment gom dữ liệu từ nhiều tổ chức và nhiều cấu trúc robot để kiểm tra khả năng học chung và chuyển kỹ năng.** Thử thách không chỉ là đưa file về cùng định dạng: góc khớp, vị trí đầu kẹp và số chiều hành động có thể mang ý nghĩa khác nhau giữa các robot. Phải xử lý sự khác biệt ấy trước khi mong dữ liệu chung mang lại lợi ích.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 1 gốc từ PDF bài báo, trang 1](/paper-figures/open-x-embodiment/figure-1.webp)


#### Đọc hình gốc: bối cảnh và đóng góp

Hình 1 nhấn mạnh quy mô hợp tác của Open X-Embodiment: nhiều đơn vị, nhiều robot và dataset được gom vào một nguồn học chung. Nhưng số robot tự nó không giải quyết action mismatch. Khi cùng một instruction được thực hiện bằng arm 6DoF, 7DoF hoặc mobile manipulator, lệnh điều khiển có thể có unit, tần số, frame và constraints khác nhau.

### Vì sao gom dữ liệu nhiều robot khó hơn gom ảnh?

Một ảnh chiếc cốc có thể được dùng để dạy nhiều loại mô hình nhìn ảnh. Nhưng lệnh “dịch khớp số 3 thêm 0,1” không có cùng ý nghĩa trên hai tay máy khác nhau. Robot A dùng kẹp hai ngón, robot B có bàn tay nhiều khớp; số chiều và đơn vị lệnh cũng khác. **Open X-Embodiment tìm cách kết hợp demonstration từ nhiều hệ robot** để chính sách học được điều chung mà không nhầm lệnh của chúng.

Điểm chính của công trình là dữ liệu đa tổ chức và kiểm tra khả năng chuyển giữa robot, không chỉ là thêm một tập dữ liệu thật lớn.

<!-- END EXTENDED WALKTHROUGH -->

## Kiến thức nền cần nắm

Cross-embodiment không phải chỉ concat mọi `action` vào một tensor. Các robot khác nhau về degrees of freedom, tần số điều khiển, camera convention, proprioception và gripper command semantics. Tập dữ liệu mixture có thể scale kiến thức nhưng cũng dễ tạo conflict nếu không thống nhất biểu diễn.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Các thuật ngữ cần hiểu

**Embodiment** là cấu trúc vật lý robot: số khớp, camera, kiểu kẹp, giới hạn chuyển động. **Không gian hành động** mô tả lệnh robot chấp nhận, chẳng hạn vị trí đầu kẹp, vận tốc hay góc khớp. **Chuyển giao giữa các loại robot** nghĩa là kỹ năng học từ nguồn dữ liệu này hỗ trợ thao tác trên robot có phần cứng khác.

Tập dữ liệu trộn từ nhiều robot phải thống nhất thông tin tối thiểu như ảnh, câu lệnh, trạng thái và loại lệnh. Tuy vậy, chuẩn hóa cùng một cấu trúc dữ liệu không đồng nghĩa các robot đã có cùng khả năng vận động.

<!-- END EXTENDED WALKTHROUGH -->

## Phương pháp thực hiện

Dự án gom dữ liệu từ **22 robot embodiments và 21 tổ chức**, tổng cộng hơn **1 triệu các quỹ đạo/episodes**, hàng trăm kỹ năng và nhiệm vụ instances. Các tập dữ liệu khác nhau được chuyển về một interface chuẩn, trong khi vẫn giữ metadata/action semantics cần thiết. Trên corpus đó, consortium huấn luyện **RT-1-X** và **RT-2-X**, tức các phiên bản cross-embodiment của RT-1/RT-2.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 3 từ PDF gốc, trang 4](/paper-figures/open-x-embodiment/figure-3.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Quan trọng về mặt infrastructure là bài báo không cố ép mọi robot thành cùng một phần cứng. Nó xây một format và hỗn hợp dữ liệu huấn luyện để mô hình có thể học biểu diễn dùng chung, rồi đo xem dữ liệu từ robot A có giúp robot B hay không.

<!-- BEGIN EXTENDED WALKTHROUGH -->

![Hình 2 gốc từ PDF bài báo, trang 3](/paper-figures/open-x-embodiment/figure-2.webp)


#### Đọc hình gốc: từng thành phần và luồng thông tin

Hình 2 cho thấy các embodiment và dataset đóng góp không đồng đều. Một bộ dữ liệu có hàng trăm nghìn trajectory có thể áp đảo nguồn nhỏ nếu sample trực tiếp theo kích thước; khi ấy model học tốt robot phổ biến mà quên loại hiếm. Vì vậy data mixture weights, normalization và cách chọn test split mới là phần đáng học sau sơ đồ tổng quan.

#### Ví dụ từng bước để hiểu cơ chế

Giả sử hai robot cùng nhặt một vật: robot A dùng delta end-effector, robot B dùng joint positions. Nếu nối hai action vector thô vào một tensor chung, cùng giá trị số không tương ứng cùng chuyển động. Cần schema và adapter rõ ràng, cùng với embedding hoặc thông tin embodiment để policy biết đang điều khiển ai. Thử train trong một robot và kiểm tra robot còn lại phải được gọi là cross-embodiment evaluation, không phải chỉ multi-task accuracy.

### Dữ liệu được kết hợp và sử dụng như thế nào?

Đầu tiên dữ liệu từ các tổ chức được gom về các bản ghi có thể đọc chung. Mỗi nguồn vẫn gắn với loại robot, camera và cách điều khiển. Tiếp theo, người nghiên cứu chọn hoặc chuyển đổi những dạng lệnh có thể học chung; trong các phiên bản RT-X, hành động đầu công tác được rời rạc hóa để mạng dự đoán.

Khi huấn luyện, mô hình nhìn ảnh cùng câu lệnh từ nhiều nguồn. Lúc kiểm tra, nó có thể được đặt trên một robot khác hoặc gặp kỹ năng chủ yếu xuất hiện trong dữ liệu của robot khác. Điều cần chứng minh là kết quả trên robot đích có tăng thật so với việc chỉ dùng dữ liệu của chính robot ấy.

<!-- END EXTENDED WALKTHROUGH -->

## Ví dụ từng bước

Robot A điều khiển EEF delta XYZ + gripper, robot B điều khiển joint angles; trộn thô vectors sẽ khiến action channel 1 mang hai nghĩa. RT-X-style huấn luyện phải gắn embodiment, normalize, map hoặc giữ schema tương ứng; inference cần biết policy đầu ra được robot nhận theo convention nào.

So sánh multi-dataset checkpoint với single-dataset checkpoint trên cùng robot target giúp tách chuyển giao thật với lợi ích chỉ do thêm mẫu.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Ví dụ chuyển kỹ năng mở ngăn kéo

Robot A đã thực hiện nhiều lần kéo ngăn kéo. Robot B chưa có nhiều ví dụ tương tự nhưng đã biết đưa đầu kẹp tới vật và giữ vật. Nếu dữ liệu được biểu diễn phù hợp, việc học từ A có thể giúp B chọn quỹ đạo kéo tốt hơn. Tuy nhiên B vẫn cần lệnh đúng giới hạn khớp và hình dạng kẹp của mình.

Nếu đưa nguyên góc khớp của A sang B, thao tác có thể vô nghĩa hoặc nguy hiểm. Đây là lý do cần phân biệt chuyển kiến thức về **mục tiêu/kỹ năng** với sao chép y nguyên tín hiệu điều khiển.

<!-- END EXTENDED WALKTHROUGH -->

## Kết quả thực nghiệm

RT-1-X đạt tỷ lệ thành công trung bình cao hơn khoảng **50%** so với việc chỉ dùng phương pháp/tập dữ liệu riêng lẻ trong aggregate comparison của bài báo. RT-2-X cho khả năng khái quát mạnh hơn rất rõ, có thiết lập khoảng **3x** so với mô hình chỉ huấn luyện trên embodiment được đánh giá. Ablation trên Bridge và các subsets cho thấy dữ liệu từ embodiment khác có thể tạo **positive chuyển giao**, và gains tăng khi mô hình đủ dung lượng mô hình để hấp thụ heterogeneity.

<!-- BEGIN ADDITIONAL PDF FIGURES -->

![Hình 4 từ PDF gốc, trang 5](/paper-figures/open-x-embodiment/figure-4.webp)
![Hình 5 từ PDF gốc, trang 6](/paper-figures/open-x-embodiment/figure-5.webp)

<!-- END ADDITIONAL PDF FIGURES -->
Bài báo này không chứng minh “mọi robot đều học lẫn nhau”, nhưng nó chứng minh đủ để thay đổi hướng field: cross-embodiment pretraining từ đó trở thành một assumption hợp lý để đầu tư thay vì một fantasy.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Đọc kết quả của RT-1-X và RT-2-X

Hình 4 so RT-1-X với RT-1 và mô hình gốc. Hai bản RT-1 dùng cùng kiến trúc, trong khi nguồn dữ liệu huấn luyện khác nhau; kết quả tốt hơn là bằng chứng cho lợi ích của việc học chung dữ liệu robot trong thiết lập ấy. Hình 5 kiểm tra một số kỹ năng đã có trong dữ liệu robot nguồn nhưng chưa có trong dữ liệu robot đánh giá.

Khi đọc câu “cao hơn 50%”, cần biết đó là mức tăng tương đối hay số điểm phần trăm và benchmark gồm những nhiệm vụ nào. Không được coi một thí nghiệm như bằng chứng rằng robot bất kỳ sẽ tự làm mọi công việc.

<!-- END EXTENDED WALKTHROUGH -->

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** morphology/cảm biến/action sự đa dạng vẫn chưa phủ những embodiment thật sự cực khác nhau. Bài báo cũng chưa giải được criterion nào dự đoán dữ liệu source nào sẽ positive chuyển giao và source nào sẽ gây negative chuyển giao. Generalization sang một robot hoàn toàn mới chưa được test theo nghĩa mạnh nhất.

**Phê bình thêm:** tập dữ liệu contribution rất lệch về quantity và phân phối nhiệm vụ giữa các phòng thí nghiệm. Nhiều robot vẫn là tabletop manipulators với abstraction EEF/gripper tương đối giống nhau, nên “22 embodiments” nghe rộng hơn mức độ đa dạng đặc tính vật lý thật. Chuẩn hóa action có thể che hoặc làm méo morphology-specific semantics. RT-2-X lại cực lớn và khó reproduce. Open X chứng minh pooling **có thể** hữu ích, chưa chứng minh một universal action không gian đã được giải.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Những giới hạn của trộn dữ liệu

Tập dữ liệu lớn có thể không cân bằng: nguồn robot phổ biến chiếm phần lớn số quỹ đạo. Camera khác, nhịp điều khiển khác và lệnh được chuẩn hóa sai đều có thể làm policy học các quy luật không phù hợp. Một bước chuyển đổi hành động bị lỗi có thể phá hàng nghìn mẫu cùng lúc.

Ngoài ra, sự đa dạng robot không tự bảo đảm robot đích có đủ cơ cấu cho thao tác, ví dụ tay kẹp cứng không thể bắt chước bàn tay nhiều ngón trong mọi tình huống.

<!-- END EXTENDED WALKTHROUGH -->

## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [Octo](/paper/octo)
- [OpenVLA](/paper/openvla)
- [LingBot-VLA 2.0](/paper/lingbot-vla-2)

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Open X liên quan gì tới Octo và OpenVLA?

Open X-Embodiment cung cấp nguồn dữ liệu nhiều robot. Octo sử dụng một phần nguồn ấy để huấn luyện policy có thể thích nghi với đầu vào và không gian hành động mới. OpenVLA cũng tận dụng dữ liệu robot đa dạng nhưng sinh hành động bằng kiến trúc gắn với mô hình ngôn ngữ.

Tập dữ liệu không phải model; model không phải thuật toán chuyển đổi lệnh. Khi đọc ba bài, luôn tách từng tầng: thu dữ liệu → chuẩn hóa → huấn luyện → thích nghi robot mới.

<!-- END EXTENDED WALKTHROUGH -->

## Đọc code và tự kiểm chứng

Đọc schema RLDS của hai embodiments, liệt kê từng field/units/action khung hình và viết validator. Chạy thống kê phân phối per robot trước khi nghĩ đến huấn luyện scale lớn.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.

<!-- BEGIN EXTENDED WALKTHROUGH -->

### Tự dựng thử nghiệm chuyển robot

Giả sử có robot A và B khác số khớp, nhưng cùng có thể nhặt cốc. Ghi những thông tin chung có thể dùng lại: ảnh vật, đích đến, thời điểm kẹp. Tiếp theo ghi những thứ không thể sao chép thẳng: góc khớp, giới hạn hành trình và kích thước kẹp.

So policy B chỉ học dữ liệu B với policy B được bổ sung dữ liệu A sau khi chuyển đổi hợp lệ. Đánh giá cùng vật và bố cục mới; như vậy mới đo được lợi ích của học chung.

<!-- END EXTENDED WALKTHROUGH -->

