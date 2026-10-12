## Why

Một robot thực tế không phải lúc nào cũng nhận task dưới một string cố định. User có thể đưa text, ảnh goal, ảnh object, hoặc một demonstration làm ví dụ. Những policy cũ thường xây interface riêng cho từng loại conditioning, nên rất khó có một model chung và khó đo generalization một cách có hệ thống. VIMA hỏi: **nếu mọi task specification đều được biểu diễn như một multimodal prompt, robot có thể học một interface chung giống foundation model không?**

## Kiến thức nền cần nắm

Trong VIMA, **prompt** là specification của nhiệm vụ, không chỉ sentence. Nó có thể gồm image của mục tiêu và reference object; những thành phần này cần fusion với observation hiện tại. Object-centric tokens đưa một inductive bias mạnh: bài toán từ toàn ảnh chuyển thành tập object được nhận diện/segment sẵn.

## How

Paper giới thiệu **VIMA-Bench**, gồm 17 nhóm task, hơn **600 nghìn expert trajectories** và nhiều level generalization ngày càng khó. Prompt có thể chứa text lẫn visual tokens. Kiến trúc dùng pretrained text encoder, object-centric visual tokens và Transformer để cross-attend vào prompt rồi autoregressively sinh action.

Một điểm quan trọng là benchmark cố tách nhiều kiểu OOD: novel placement, novel object combination, novel task composition và level khó nhất là task templates mới. Model được scale từ cỡ nhỏ đến khoảng 200M parameters để xem performance có obey scaling trend không.

## Ví dụ từng bước

Prompt kiểu `Put [ảnh cốc xanh] next to [ảnh hộp đỏ]` tách thành đoạn text và object tokens. Transformer nhìn scene hiện tại, cross-attend vào prompt và sinh thao tác pick/place. Lúc evaluation, thay cốc xanh bằng vật mới hoặc đổi quan hệ không gian để đo prompt generalization.

Level khó nhất của VIMA-Bench không đồng nghĩa open-world: task vẫn thuộc grammar simulation, dù hoán đổi object/combination.

## Results

VIMA outperform các alternative architecture cùng data khá mạnh trên hard zero-shot splits. Paper báo có setting **tới 2.9x task success** so với kiến trúc thay thế ở cùng data budget, và **2.7x performance với ít hơn 10x data** trong một số comparison. Model size và data size đều giúp systematic generalization, không chỉ memorization training tasks.

Quan trọng hơn, level generalization càng xa training grammar thì performance vẫn tụt rõ. Điều đó vừa là kết quả tốt vừa là warning: multimodal prompting giúp rất nhiều, nhưng không biến robot thành GPT cho physics chỉ sau một đêm.

## Limitations

**Paper thừa nhận:** perception dựa vào object detector riêng nên có thể fail khi occlusion/OOD. VIMA-Bench là simulation với action primitives khá sạch, chưa phản ánh toàn bộ contact dynamics của robot thật. Task family tuy đa dạng nhưng vẫn procedurally generated từ một grammar tương đối rõ.

**Phê bình thêm:** object-centric representation đã cho model một inductive bias cực mạnh, tức một phần bài toán perception khó ngoài đời đã được giải hộ. Action space có các primitive tương đối high-level nên precision control, force, latency và recovery bị che đi. “Novel task” vẫn nằm trong thế giới Ravens/VIMA chứ chưa phải open-world task. Do đó VIMA rất mạnh để học **generalization structure**, nhưng không nên dùng nó làm evidence rằng một policy đã sẵn sàng cho household robotics.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [rt 2](/paper/rt-2)
- [libero](/paper/libero)

## Đọc code và tự kiểm chứng

Chạy VIMA-Bench trên một prompt type. Giữ motion primitive không đổi rồi thay modality của prompt: chỉ text, text + object image. Log success theo mức OOD. Để debugging, visualize attention từ observation object token đến prompt object token.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
