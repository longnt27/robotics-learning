## Vì sao cần nghiên cứu này?

RT-2 chứng minh VLA mạnh nhưng mô hình, dữ liệu và quy trình huấn luyện phần lớn đóng. Robotics community cần một open checkpoint đủ mạnh để nghiên cứu **fine-tuning, parameter-efficient adaptation, quantization và downstream deployment**. OpenVLA đặt mục tiêu tạo một 7B VLA open-source cạnh tranh với các closed VLAs nhưng practical hơn cho phòng thí nghiệm bình thường.

## Kiến thức nền cần nắm

RT-2 gợi ý VLM-to-action là khả thi nhưng không phải open reproducible mô hình cho nhiều phòng thí nghiệm. OpenVLA cung cấp implementation, weights và LoRA fine-tuning, giúp mở phần lớn hệ thống để kiểm chứng ở mức mô hình code.

## Phương pháp thực hiện

OpenVLA dùng **Llama 2 7B** làm ngôn ngữ backbone và fuse đặc trưng thị giác từ **DINOv2 + SigLIP**, sau đó pretrain/fine-tune trên khoảng **970 nghìn robot demonstrations** từ Open X-Embodiment. Liên tục robot actions được discretize thành tokens để mô hình dùng cùng autoregressive next-token mục tiêu huấn luyện với VLM.

Bài báo đặc biệt quan tâm tới adaptation. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/hiệu năng trade-off. Đây là lý do OpenVLA hữu ích như research substrate hơn là chỉ một leaderboard entry.

## Ví dụ từng bước

Đầu vào gồm hình ảnh và chỉ dẫn, backbone VLM tạo hidden đặc trưng, decoder sinh discrete tokens mã hóa các action dimensions. Tại inference, tokenizer decode token IDs về giá trị action đã normalize; phía robot phải unnormalize theo statistics của tập dữ liệu/phần cứng. Sai normalizer có thể tạo action vô lý dù token độ chính xác cao.

OpenVLA là contrast hữu ích với π0.5: OpenVLA thường autoregressive **discrete action**, còn π0-style policy sinh action liên tục chunks qua flow-based expert.

## Kết quả thực nghiệm

Trên bộ 29 nhiệm vụ dùng để so generalist policies, OpenVLA báo tỷ lệ thành công trung bình cao hơn **RT-2-X khoảng 16.5 điểm** trong đánh giá của họ. Sau task-specific/multi-task fine-tuning, OpenVLA vượt Octo và Diffusion Policy đáng kể trên những thiết lập thao tác robot cần hiểu nhiều chỉ dẫn ngôn ngữ, tác giả nêu mức cải thiện tổng hợp khoảng **20.4%**.

PEFT là phần rất thực dụng: **LoRA rank 32** đạt khoảng **68.2%** so với **69.7%** full fine-tuning nhưng chỉ huấn luyện khoảng **1.4% parameters** và memory giảm mạnh. 4-bit quantization trong một thiết lập giữ hiệu năng gần bf16, thậm chí số đo dao động **71.9 vs 71.3**, trong khi mô hình memory giảm từ khoảng 16.8 GB xuống 7 GB. Điều đó chứng minh VLA adaptation không nhất thiết cần một cụm H100.

## Hạn chế và câu hỏi còn mở

**Bài báo thừa nhận:** mô hình chỉ dùng single-image quan sát, thiếu quan sát history, multiview và proprioception phong phú. Autoregressive action inference chậm với high-frequency platforms như ALOHA. Reliability dưới 90% ở nhiều nhiệm vụ vẫn chưa đủ cho production, và do compute constraints bài báo không khám phá hết design không gian. Trên một số narrow dexterous nhiệm vụ, specialist Diffusion Policy vẫn mượt/tốt hơn.

**Phê bình thêm:** action tokenization là một nút thắt kép: quantization làm mất độ chính xác, autoregression làm mất speed. Dung lượng mô hình ngôn ngữ 7B tham số không tự động biến thành motor dung lượng mô hình. Kết quả fine-tuned mạnh đôi khi dễ bị đọc nhầm thành zero-shot foundation capability. OpenVLA cũng kế thừa toàn bộ imbalance và action-schema mess của OXE. Giá trị lớn nhất của nó là **mở ra hệ sinh thái**, không phải chứng minh action-as-text đã là endpoint của kiến trúc VLA.


## Liên hệ với nghiên cứu khác

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa tác giả trực tiếp trích dẫn nhau:

- [RT-2](/paper/rt-2)
- [FAST](/paper/fast)
- [Qwen-VLA](/paper/qwen-vla)

## Đọc code và tự kiểm chứng

Chỉ chạy 4-bit inference T4, log processor đầu vào, token thị giác, logits/token IDs, decoded normalized action và unnormalized action. Đừng đốt quota vào full fine-tune ngay.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *đầu vào*, *đầu ra*, *loss khi huấn luyện*, *quy trình đánh giá* và *kiểu lỗi* của bài báo. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
