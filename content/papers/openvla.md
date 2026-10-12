## Why

RT-2 chứng minh VLA mạnh nhưng model, data và training recipe phần lớn đóng. Robotics community cần một open checkpoint đủ mạnh để nghiên cứu **fine-tuning, parameter-efficient adaptation, quantization và downstream deployment**. OpenVLA đặt mục tiêu tạo một 7B VLA open-source cạnh tranh với các closed VLAs nhưng practical hơn cho lab bình thường.

## Kiến thức nền cần nắm

RT-2 gợi ý VLM-to-action là khả thi nhưng không phải open reproducible model cho nhiều lab. OpenVLA cung cấp implementation, weights và LoRA fine-tuning, giúp mở phần lớn hệ thống để kiểm chứng ở mức model code.

## How

OpenVLA dùng **Llama 2 7B** làm language backbone và fuse visual features từ **DINOv2 + SigLIP**, sau đó pretrain/fine-tune trên khoảng **970 nghìn robot demonstrations** từ Open X-Embodiment. Continuous robot actions được discretize thành tokens để model dùng cùng autoregressive next-token objective với VLM.

Paper đặc biệt quan tâm tới adaptation. Họ thử full fine-tuning, LoRA với nhiều rank, quantization 4-bit/8-bit và evaluate memory/throughput/performance trade-off. Đây là lý do OpenVLA hữu ích như research substrate hơn là chỉ một leaderboard entry.

## Ví dụ từng bước

Input gồm image và instruction, backbone VLM tạo hidden features, decoder sinh discrete tokens mã hóa các action dimensions. Tại inference, tokenizer decode token IDs về giá trị action đã normalize; phía robot phải unnormalize theo statistics của dataset/hardware. Sai normalizer có thể tạo action vô lý dù token accuracy cao.

OpenVLA là contrast hữu ích với π0.5: OpenVLA thường autoregressive **discrete action**, còn π0-style policy sinh continuous action chunks qua flow-based expert.

## Results

Trên bộ 29 tasks dùng để so generalist policies, OpenVLA báo average success cao hơn **RT-2-X khoảng 16.5 điểm** trong evaluation của họ. Sau task-specific/multi-task fine-tuning, OpenVLA vượt Octo và Diffusion Policy đáng kể trên các language-rich manipulation settings, paper báo aggregate gain khoảng **20.4%**.

PEFT là phần rất thực dụng: **LoRA rank 32** đạt khoảng **68.2%** so với **69.7%** full fine-tuning nhưng chỉ train khoảng **1.4% parameters** và memory giảm mạnh. 4-bit quantization trong một setting giữ performance gần bf16, thậm chí số đo dao động **71.9 vs 71.3**, trong khi model memory giảm từ khoảng 16.8 GB xuống 7 GB. Điều đó chứng minh VLA adaptation không nhất thiết cần một cụm H100.

## Limitations

**Paper thừa nhận:** model chỉ dùng single-image observation, thiếu observation history, multiview và proprioception phong phú. Autoregressive action inference chậm với high-frequency platforms như ALOHA. Reliability dưới 90% ở nhiều task vẫn chưa đủ cho production, và do compute constraints paper không khám phá hết design space. Trên một số narrow dexterous tasks, specialist Diffusion Policy vẫn mượt/tốt hơn.

**Phê bình thêm:** action tokenization là một bottleneck kép: quantization làm mất precision, autoregression làm mất speed. 7B semantic capacity lớn không tự động biến thành motor capacity. Kết quả fine-tuned mạnh đôi khi dễ bị đọc nhầm thành zero-shot foundation capability. OpenVLA cũng kế thừa toàn bộ imbalance và action-schema mess của OXE. Giá trị lớn nhất của nó là **mở ecosystem**, không phải chứng minh action-as-text đã là endpoint của VLA architecture.


## Connections

Nếu muốn đặt bài này vào bản đồ VLA, hãy xem tiếp các hướng liên quan sau. Đây là **liên hệ kỹ thuật/chủ đề**, không tự động có nghĩa authors trực tiếp trích dẫn nhau:

- [rt 2](/paper/rt-2)
- [fast](/paper/fast)
- [qwen vla](/paper/qwen-vla)

## Đọc code và tự kiểm chứng

Chỉ chạy 4-bit inference T4, log processor input, visual tokens, logits/token IDs, decoded normalized action và unnormalized action. Đừng đốt quota vào full fine-tune ngay.

**Cách kiểm tra đọc hiểu:** Hãy tự giải thích *input*, *output*, *training loss*, *evaluation protocol* và *failure mode* của paper. Nếu không nói được một trong năm thứ này, cần đọc lại phần tương ứng trước khi chạy benchmark.
