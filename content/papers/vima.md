## Vì sao cần nghiên cứu này?

Một robot thực tế không phải lúc nào cũng nhận nhiệm vụ dưới một string cố định. User có thể đưa text, ảnh mục tiêu, ảnh vật thể, hoặc một demonstration làm ví dụ. Những policy cũ thường xây interface riêng cho từng loại conditioning, nên rất khó có một mô hình chung và khó đo khả năng khái quát một cách có hệ thống. VIMA hỏi: **nếu mọi nhiệm vụ đặc tả đều được biểu diễn như một multimodal prompt, robot có thể học một interface chung giống mô hình nền tảng không?**

## Kiến thức nền cần nắm

Trong VIMA, **prompt** là đặc tả của nhiệm vụ, không chỉ sentence. Nó có thể gồm hình ảnh của mục tiêu và vật thể tham chiếu; những thành phần này cần fusion với quan sát hiện tại. Object-centric tokens đưa một inductive bias mạnh: bài toán từ toàn ảnh chuyển thành tập vật thể được nhận diện/segment sẵn.

## Phương pháp thực hiện

Bài báo giới thiệu **VIMA-Bench**, gồm 17 nhóm nhiệm vụ, hơn **600 nghìn expert các quỹ đạo** và nhiều level khả năng khái quát ngày càng khó. Prompt có thể chứa text lẫn token thị giác. Kiến trúc dùng đã pretrain text encoder, object-centric token thị giác và Transformer để cross-attend vào prompt rồi autoregressively sinh action.

Một điểm quan trọng là benchmark cố tách nhiều kiểu OOD: novel placement, vật thể mới combination, novel nhiệm vụ composition và level khó nhất là nhiệm vụ templates mới. Mô hình được scale từ cỡ nhỏ đến khoảng 200M parameters để xem hiệu năng có obey scaling trend không.

## Ví dụ từng bước

Prompt kiểu `Put [ảnh cốc xanh] next to [ảnh hộp đỏ]` tách thành đoạn text và vật thể tokens. Transformer nhìn bối cảnh hiện tại, cross-attend vào prompt và sinh thao tác pick/place. Lúc đánh giá, thay cốc xanh bằng vật mới hoặc đổi quan hệ không gian để đo prompt khả năng khái quát.

Level khó nhất của VIMA-Bench không đồng nghĩa open-world: nhiệm vụ vẫn thuộc grammar mô phỏng, dù hoán đổi vật thể/combination.

## Kết quả thực nghiệm

VIMA outperform các alternative kiến trúc cùng dữ liệu khá mạnh trên hard zero-shot splits. Bài báo báo có thiết lập **tới 2.9x tỷ lệ thành công của nhiệm vụ** so với kiến trúc thay thế ở cùng dữ liệu budget, và **2.7x hiệu năng với ít hơn 10x dữ liệu** trong một số comparison. Kích thước mô hình và dữ liệu size đều giúp systematic khả năng khái quát, không chỉ memorization huấn luyện nhiệm vụ.

Quan trọng hơn, level khả năng khái quát càng xa huấn luyện grammar thì hiệu năng vẫn tụt rõ. Điều đó vừa là kết quả tốt vừa là warning: multimodal prompting giúp rất nhiều, nhưng không biến robot thành GPT cho vật lý chỉ sau một đêm.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** perception dựa vào vật thể detector riêng nên có thể fail khi occlusion/OOD. VIMA-Bench là mô phỏng với action primitives khá sạch, chưa phản ánh toàn bộ contact động lực học của robot thật. Nhóm nhiệm vụ tuy đa dạng nhưng vẫn procedurally được tạo ra từ một grammar tương đối rõ.

**Phê bình thêm:** object-centric biểu diễn đã cho mô hình một inductive bias cực mạnh, tức một phần bài toán perception khó ngoài đời đã được giải hộ. Action không gian có các primitive tương đối high-level nên độ chính xác control, force, độ trễ và phục hồi bị che đi. “Novel nhiệm vụ” vẫn nằm trong thế giới Ravens/VIMA chứ chưa phải open-world nhiệm vụ. Do đó VIMA rất mạnh để học **khả năng khái quát structure**, nhưng không nên dùng nó làm evidence rằng một policy đã sẵn sàng cho household robotics.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [LIBERO](/paper/libero)

## Đọc code và tự kiểm chứng

Chạy VIMA-Bench trên một prompt type. Giữ chuyển động primitive không đổi rồi thay modality của prompt: chỉ text, text + vật thể hình ảnh. Log thành công theo mức OOD. Để debugging, visualize attention từ quan sát vật thể token đến prompt vật thể token.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
