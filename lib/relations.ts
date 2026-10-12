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
  { from: "rt-1", to: "rt-2", type: "method", reason: "RT-2 kế thừa cách điều khiển robot bằng chỉ dẫn ngôn ngữ của RT-1, đồng thời khai thác kiến thức từ VLM đã pretrain trên dữ liệu web." },
  { from: "palm-e", to: "rt-2", type: "foundation", reason: "PaLM-E chứng minh mô hình ngôn ngữ có thể kết hợp dữ liệu cảm biến; RT-2 tiến thêm một bước khi sinh action bằng token." },
  { from: "vima", to: "rt-2", type: "parallel", reason: "VIMA sử dụng prompt đa phương thức cho thao tác robot, còn RT-2 chuyển tri thức từ VLM thành action. Đây là quan hệ về ý tưởng, chưa xác minh kế thừa trực tiếp." },
  { from: "rt-2", to: "openvla", type: "foundation", reason: "OpenVLA phát triển hướng mã hóa action thành token trên nền VLM của RT-2 thành một mô hình mở có thể fine-tune." },
  { from: "bridgedata-v2", to: "octo", type: "foundation", reason: "BridgeData V2 là ví dụ về dữ liệu thao tác robot đa dạng. Octo học từ hỗn hợp nhiều tập dữ liệu để xây dựng một policy dùng chung." },
  { from: "open-x-embodiment", to: "octo", type: "foundation", reason: "Octo được pretrain trên hỗn hợp dữ liệu Open X-Embodiment. Đây là mối liên hệ trực tiếp về nguồn dữ liệu huấn luyện." },
  { from: "open-x-embodiment", to: "openvla", type: "foundation", reason: "OpenVLA được huấn luyện bằng dữ liệu Open X-Embodiment, cho thấy vai trò của các tập dữ liệu nhiều loại robot với foundation policy." },
  { from: "open-x-embodiment", to: "rdt-1b", type: "parallel", reason: "Cả hai đều khai thác dữ liệu từ nhiều loại robot; RDT-1B chú trọng biểu diễn action có ý nghĩa vật lý và diffusion để điều khiển hai tay." },
  { from: "diffusion-policy", to: "rdt-1b", type: "method", reason: "RDT-1B mở rộng hướng sinh action bằng diffusion sang Transformer lớn hơn và dữ liệu thao tác hai tay đa dạng hơn." },
  { from: "diffusion-policy", to: "pi-0-5", type: "method", reason: "π0.5 dùng flow matching để sinh action liên tục. Phương pháp này và Diffusion Policy đều xuất phát từ ý tưởng sinh quỹ đạo qua nhiều bước biến đổi." },
  { from: "diffusion-policy", to: "groot-n1", type: "method", reason: "GR00T N1 dùng action expert sinh quỹ đạo bằng diffusion, thuộc cùng họ phương pháp sinh action với Diffusion Policy." },
  { from: "act", to: "rtc-inference", type: "foundation", reason: "ACT phổ biến cách dự đoán action chunk. RTC giải quyết độ trễ và sự gián đoạn khi nối hai chunk trong hệ thống điều khiển không đồng bộ." },
  { from: "diffusion-policy", to: "rtc-inference", type: "method", reason: "RTC tận dụng khả năng khử nhiễu và inpainting của diffusion hoặc flow matching để ràng buộc action chunk mới với prefix đã cam kết." },
  { from: "pi-0-5", to: "rtc-inference", type: "benchmark", reason: "RTC dùng π0.5 làm một trong các policy nền trong thí nghiệm trên robot thật, nhằm đánh giá độ trễ và chất lượng điều khiển." },
  { from: "rtc-inference", to: "rtc-training", type: "method", reason: "RTC ở giai đoạn huấn luyện thay việc hiệu chỉnh bằng gradient lúc inference bằng cách học sinh postfix có điều kiện theo prefix đã cam kết." },
  { from: "fast", to: "openvla", type: "parallel", reason: "FAST và OpenVLA dùng hai cách mã hóa action thành token. FAST khai thác cấu trúc theo thời gian để giảm số token thay vì chia đều từng chiều action." },
  { from: "fast", to: "pi-0-5", type: "parallel", reason: "FAST đi theo hướng action token rời rạc, còn π0.5 dùng flow matching sinh action liên tục. Hai hướng có thể so sánh nhưng không phụ thuộc trực tiếp." },
  { from: "mimicplay", to: "groot-n1", type: "parallel", reason: "Cả MimicPlay và GR00T N1 tận dụng video con người, nhưng cách chuyển video thành thông tin học điều khiển robot là khác nhau." },
  { from: "groot-n1", to: "lingbot-vla-2", type: "parallel", reason: "Hai mô hình đều kết hợp VLM với action expert và dữ liệu robot/người. LingBot-VLA 2.0 chú trọng thêm sparse MoE, action toàn thân và học dự đoán trạng thái tương lai." },
  { from: "open-x-embodiment", to: "lingbot-vla-2", type: "parallel", reason: "Open X-Embodiment thể hiện hướng mở rộng dữ liệu trên nhiều loại robot. LingBot-VLA 2.0 triển khai hướng này trên 20 cấu hình robot, không khẳng định dùng lại cùng tập dữ liệu." },
  { from: "qwen-vla", to: "lingbot-vla-2", type: "parallel", reason: "Cả hai đều xử lý VLA đa cấu trúc robot. Qwen-VLA sử dụng embodiment prompt, còn LingBot-VLA 2.0 dùng vector action 55 chiều và MoE; chưa xác minh quan hệ kế thừa trực tiếp." },
  { from: "robocasa", to: "libero", type: "parallel", reason: "RoboCasa và LIBERO đều là benchmark thao tác robot trong mô phỏng, nhưng chú trọng các dạng khái quát khác nhau. Không hàm ý nghiên cứu trước phụ thuộc vào nghiên cứu sau." },
  { from: "libero", to: "openvla", type: "benchmark", reason: "LIBERO là benchmark thường dùng để kiểm tra khả năng thao tác và chuyển giao nhiệm vụ của policy, không phải thành phần trong kiến trúc OpenVLA." },
  { from: "droid", to: "openvla", type: "parallel", reason: "DROID tập trung thu demonstration robot ở nhiều môi trường thực tế; OpenVLA tập trung phát triển policy. Quan hệ này về hướng dữ liệu, không xác nhận OpenVLA huấn luyện trực tiếp từ DROID." },
  { from: "palm-e", to: "qwen-vla", type: "foundation", reason: "PaLM-E mở hướng đưa dữ liệu cảm biến vào mô hình ngôn ngữ. Qwen-VLA mở rộng cách tiếp cận đó sang sinh action và xử lý nhiều cấu trúc robot." },
  { from: "openvla", to: "qwen-vla", type: "parallel", reason: "OpenVLA là hướng VLM sinh action token rời rạc; Qwen-VLA mở rộng sang action liên tục bằng DiT và nhiều nhiệm vụ hơn. Cạnh biểu diễn sự phát triển về kiến trúc, không xác nhận trích dẫn." },
  { from: "vima", to: "libero", type: "parallel", reason: "VIMA-Bench kiểm tra prompt đa phương thức, còn LIBERO kiểm tra học liên tục và chuyển giao kiến thức. Hai benchmark bổ sung cho nhau." },
  { from: "robocasa", to: "qwen-vla", type: "parallel", reason: "RoboCasa thể hiện vai trò của môi trường mô phỏng đa dạng khi đánh giá policy. Không có bằng chứng ở đây rằng Qwen-VLA đã sử dụng dữ liệu RoboCasa." },
];
export const relationTypeLabel: Record<RelationType, string> = {
  foundation: "Dữ liệu / nền tảng",
  method: "Kế thừa phương pháp",
  benchmark: "Liên hệ đánh giá",
  parallel: "Hướng liên quan",
};
