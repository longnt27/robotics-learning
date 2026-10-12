export type RelationType = "foundation" | "method" | "benchmark" | "parallel";
export type PaperRelation = {
  from: string;
  to: string;
  type: RelationType;
  reason: string;
};

// Directed conceptual or methodological lineage. An edge does not imply that the
// authors explicitly cite the earlier paper unless verified against the PDF.
export const relations: PaperRelation[] = [
  { from: "rt-1", to: "rt-2", type: "method", reason: "RT-2 kế thừa ý tưởng language-conditioned robot policy của RT-1, rồi đồng huấn luyện với web VLM để transfer kiến thức semantic." },
  { from: "palm-e", to: "rt-2", type: "foundation", reason: "PaLM-E chứng minh khả năng kết hợp sensor với pretrained language model; RT-2 tiến tới sinh robot actions cùng token vocabulary." },
  { from: "vima", to: "rt-2", type: "parallel", reason: "VIMA là nhánh prompting đa phương thức trong manipulation; RT-2 là nhánh VLM-to-actions. Liên hệ về representation chứ không khẳng định kế thừa trực tiếp." },
  { from: "rt-2", to: "openvla", type: "foundation", reason: "OpenVLA phát triển hướng discretized action tokens và VLM-to-action thành một implementation mở, có thể fine-tune." },
  { from: "bridgedata-v2", to: "octo", type: "foundation", reason: "BridgeData là ví dụ dữ liệu robot đa nhiệm được khai thác trong hệ sinh thái generalist policies; Octo học từ hỗn hợp đa tập dữ liệu." },
  { from: "open-x-embodiment", to: "octo", type: "foundation", reason: "Octo pretrained trên hỗn hợp dữ liệu Open X-Embodiment; đây là quan hệ training-data cụ thể." },
  { from: "open-x-embodiment", to: "openvla", type: "foundation", reason: "OpenVLA được train bằng Open X-Embodiment mixture, tạo cầu nối trực tiếp giữa dataset và foundation policy." },
  { from: "open-x-embodiment", to: "rdt-1b", type: "parallel", reason: "Cả hai khai thác heterogeneous robot data; RDT tập trung vào unified physical action space và diffusion cho bimanual control." },
  { from: "diffusion-policy", to: "rdt-1b", type: "method", reason: "RDT scale diffusion-based action generation sang action Transformer cỡ lớn và nhiều dữ liệu hơn." },
  { from: "diffusion-policy", to: "pi-0-5", type: "method", reason: "π0.5 thuộc gia đình continuous generative action policies; flow matching và diffusion chia sẻ tư tưởng iterative trajectory generation." },
  { from: "diffusion-policy", to: "groot-n1", type: "method", reason: "GR00T N1 dùng diffusion action expert để sinh motor trajectory, một hướng phát triển cùng họ diffusion policy." },
  { from: "act", to: "rtc-inference", type: "foundation", reason: "Action chunking tạo ra vấn đề overlap và boundary; RTC giải discontinuity khi model tính chunk tiếp theo không đồng bộ." },
  { from: "diffusion-policy", to: "rtc-inference", type: "method", reason: "RTC tận dụng tính chất denoising/inpainting của diffusion hoặc flow để condition action chunk mới lên prefix đã commit." },
  { from: "pi-0-5", to: "rtc-inference", type: "benchmark", reason: "RTC dùng π0.5 làm policy nền trong các robot experiments, kiểm tra tính hữu ích của runtime trên VLA mạnh." },
  { from: "rtc-inference", to: "rtc-training", type: "method", reason: "Training-time RTC trực tiếp thay inference-time gradient inpainting bằng học conditional postfix từ action prefix khi train." },
  { from: "fast", to: "openvla", type: "parallel", reason: "FAST và OpenVLA dùng hai lựa chọn tokenization action khác nhau; FAST đề xuất nén cấu trúc temporal thay vì uniform per-dimension binning." },
  { from: "fast", to: "pi-0-5", type: "parallel", reason: "FAST là hướng discrete-token VLA khác với flow-based continuous action head; chúng bổ sung chứ không phụ thuộc nhau." },
  { from: "mimicplay", to: "groot-n1", type: "parallel", reason: "Cả hai tìm cách tận dụng human videos, nhưng cách chuyển video thành representation/action supervision không giống nhau." },
  { from: "groot-n1", to: "lingbot-vla-2", type: "parallel", reason: "Cả hai dùng VLM kết hợp action expert và dữ liệu robot/human; LingBot nhấn mạnh MoE, whole-body actions và future feature objectives." },
  { from: "open-x-embodiment", to: "lingbot-vla-2", type: "parallel", reason: "Tinh thần multi-embodiment data scale mở đường cho bài toán 20 robot configurations trong LingBot, không hàm ý reuse dataset cụ thể." },
  { from: "qwen-vla", to: "lingbot-vla-2", type: "parallel", reason: "Hai mô hình 2026 cùng giải multi-embodiment VLA nhưng bằng embodiment-aware prompting so với canonical 55D + MoE; không phải dependency trực tiếp." },
  { from: "robocasa", to: "libero", type: "parallel", reason: "Hai benchmark robot manipulation dùng để kiểm tra khía cạnh generalization khác nhau; không hàm ý chronologically phụ thuộc." },
  { from: "libero", to: "openvla", type: "benchmark", reason: "LIBERO là benchmark phổ biến để đánh giá robot policy và khả năng transfer, không phải một tầng bắt buộc trong kiến trúc OpenVLA." },
  { from: "droid", to: "openvla", type: "parallel", reason: "DROID là nguồn in-the-wild demonstrations còn OpenVLA là một VLA policy; đây là kết nối chủ đề data, không chứng minh training trực tiếp." },
  { from: "palm-e", to: "qwen-vla", type: "foundation", reason: "Qwen-VLA mở rộng hướng gắn world observations vào pretrained VLM bằng action generation và multi-embodiment conditioning." },
  { from: "openvla", to: "qwen-vla", type: "parallel", reason: "Qwen-VLA đại diện bước tiến của VLM-to-action sang continuous DiT và rộng nhiều task; cạnh chỉ biểu diễn tiến hóa thiết kế." },
  { from: "vima", to: "libero", type: "parallel", reason: "VIMA-Bench đo multimodal prompting trong simulation; LIBERO đo lifelong transfer và task composition, hai góc nhìn benchmark bổ trợ." },
  { from: "robocasa", to: "qwen-vla", type: "parallel", reason: "Simulation và multi-domain evaluation có vai trò bổ trợ cho policy đa nhiệm; không khẳng định Qwen sử dụng RoboCasa." },
];
export const relationTypeLabel: Record<RelationType, string> = {
  foundation: "Dữ liệu / nền tảng",
  method: "Kế thừa phương pháp",
  benchmark: "Liên hệ đánh giá",
  parallel: "Hướng liên quan",
};
