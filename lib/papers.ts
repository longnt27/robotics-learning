export type PaperCategory = "FOUNDATIONS" | "POLICIES" | "DATA" | "CONTROL" | "SYSTEMS";
export type Paper = {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  abstract: string;
  date: string;
  venue: string;
  category: PaperCategory;
  userPick: boolean;
  pdf: string;
  source: string;
  code?: string;
  readingMinutes: number;
  concepts: string[];
};

export const categoryLabels: Record<PaperCategory, string> = {
  FOUNDATIONS: "Nền tảng và suy luận",
  POLICIES: "Policy đa nhiệm",
  DATA: "Dữ liệu và benchmark",
  CONTROL: "Action và điều khiển",
  SYSTEMS: "Hệ thống thời gian thực",
};

// Timeline dates are research release/first-preprint dates when identifiable, and approximate
// month-level dates otherwise. They intentionally do not represent a uniform proceedings date.
export const papers: Paper[] = [
  {
    slug: "vima", shortTitle: "VIMA", title: "VIMA: General Robot Manipulation with Multimodal Prompts",
    subtitle: "Robot thực hiện nhiệm vụ theo prompt đa phương thức, không theo mã nhiệm vụ viết sẵn.",
    abstract: "VIMA dùng prompt chứa ngôn ngữ, hình ảnh và ví dụ thao tác để chỉ dẫn robot. Mục tiêu là khái quát sang những tổ hợp nhiệm vụ mới trong môi trường mô phỏng.",
    date: "2022-10-01", venue: "ICML 2023", category: "FOUNDATIONS", userPick: false,
    pdf: "https://arxiv.org/pdf/2210.03094", source: "https://proceedings.mlr.press/v202/jiang23b.html",
    code: "https://github.com/vimalabs/VIMA", readingMinutes: 17,
    concepts: ["multimodal prompting", "biểu diễn theo vật thể", "khả năng khái quát"]
  },
  {
    slug: "rt-1", shortTitle: "RT-1", title: "RT-1: Robotics Transformer for Real-World Control at Scale",
    subtitle: "Quy mô và độ đa dạng dữ liệu mở đường cho một policy điều khiển robot đa nhiệm.",
    abstract: "RT-1 điều khiển robot từ ảnh camera và chỉ dẫn ngôn ngữ. Bài báo cho thấy dữ liệu robot thật, nhiều nhiệm vụ và kiến trúc Transformer giúp cải thiện khả năng khái quát.",
    date: "2022-12-01", venue: "RSS 2023", category: "POLICIES", userPick: false,
    pdf: "https://www.roboticsproceedings.org/rss19/p025.pdf", source: "https://www.roboticsproceedings.org/rss19/p025.html",
    readingMinutes: 17, concepts: ["behavior cloning", "action tokens", "scaling"]
  },
  {
    slug: "diffusion-policy", shortTitle: "Diffusion Policy", title: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion",
    subtitle: "Thay vì dự đoán từng action, mô hình sinh cả chuỗi chuyển động khả thi.",
    abstract: "Diffusion Policy sinh một chuỗi action liên tục bằng quá trình khử nhiễu. Cách này giữ được nhiều phương án thao tác hợp lệ thay vì lấy trung bình các demonstration khác nhau.",
    date: "2023-03-01", venue: "RSS 2023", category: "CONTROL", userPick: false,
    pdf: "https://www.roboticsproceedings.org/rss19/p026.pdf", source: "https://diffusion-policy.cs.columbia.edu/",
    code: "https://github.com/real-stanford/diffusion_policy", readingMinutes: 24,
    concepts: ["diffusion", "action chunking", "receding horizon"]
  },
  {
    slug: "palm-e", shortTitle: "PaLM-E", title: "PaLM-E: An Embodied Multimodal Language Model",
    subtitle: "Kết hợp tri thức ngôn ngữ với dữ liệu cảm biến từ thế giới thực.",
    abstract: "PaLM-E đưa hình ảnh và trạng thái robot vào mô hình ngôn ngữ, kết hợp khả năng suy luận với dữ liệu cảm biến mà vẫn tận dụng tri thức từ pretraining.",
    date: "2023-03-06", venue: "ICML 2023", category: "FOUNDATIONS", userPick: false,
    pdf: "https://proceedings.mlr.press/v202/driess23a/driess23a.pdf", source: "https://proceedings.mlr.press/v202/driess23a.html",
    readingMinutes: 18, concepts: ["embodied reasoning", "multimodal tokens", "transfer"]
  },
  {
    slug: "act", shortTitle: "ACT / ALOHA", title: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware",
    subtitle: "Một lần dự đoán có thể tạo ra cả chuỗi chuyển động phối hợp của hai tay.",
    abstract: "ALOHA cung cấp hệ thống teleoperation chi phí thấp. ACT dùng Transformer dự đoán action chunk để học các thao tác hai tay chính xác từ demonstration.",
    date: "2023-04-01", venue: "RSS 2023", category: "CONTROL", userPick: false,
    pdf: "https://www.roboticsproceedings.org/rss19/p016.pdf", source: "https://www.roboticsproceedings.org/rss19/p016.html",
    code: "https://github.com/tonyzhaozh/act", readingMinutes: 22,
    concepts: ["action chunking", "CVAE", "temporal ensembling"]
  },
  {
    slug: "libero", shortTitle: "LIBERO", title: "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning",
    subtitle: "Robot học nhiệm vụ mới có giữ được kiến thức và kỹ năng cũ không?",
    abstract: "LIBERO là bộ benchmark kiểm tra khả năng học liên tục, chuyển giao kiến thức và giữ lại kỹ năng cũ khi robot liên tiếp học nhiệm vụ mới.",
    date: "2023-06-01", venue: "NeurIPS 2023", category: "DATA", userPick: true,
    pdf: "https://arxiv.org/pdf/2306.03310", source: "https://libero-project.github.io/",
    code: "https://github.com/Lifelong-Robot-Learning/LIBERO", readingMinutes: 22,
    concepts: ["benchmark", "continual learning", "chuyển giao nhiệm vụ"]
  },
  {
    slug: "rt-2", shortTitle: "RT-2", title: "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control",
    subtitle: "Chuyển kiến thức thị giác-ngôn ngữ thành các action để điều khiển robot.",
    abstract: "RT-2 tận dụng tri thức đã học từ dữ liệu hình ảnh-ngôn ngữ trên web, mã hóa action thành token và đồng huấn luyện dữ liệu robot với các nhiệm vụ thị giác-ngôn ngữ.",
    date: "2023-07-01", venue: "CoRL 2023", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2307.15818", source: "https://robotics-transformer2.github.io/",
    readingMinutes: 23, concepts: ["VLA", "co-training", "semantic transfer"]
  },
  {
    slug: "bridgedata-v2", shortTitle: "BridgeData V2", title: "BridgeData V2: A Dataset for Robot Learning at Scale",
    subtitle: "Dữ liệu đa dạng hơn giúp robot thích nghi với nhiều nhiệm vụ và bối cảnh.",
    abstract: "BridgeData V2 tập hợp demonstration thao tác robot qua nhiều nhiệm vụ, đồ vật và môi trường, tạo điều kiện nghiên cứu khả năng chuyển giao của policy.",
    date: "2023-08-01", venue: "CoRL 2023", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2308.12952", source: "https://rail-berkeley.github.io/bridgedata-v2/",
    readingMinutes: 15, concepts: ["đa dạng dữ liệu", "demonstration", "khả năng khái quát"]
  },
  {
    slug: "mimicplay", shortTitle: "MimicPlay", title: "MimicPlay: Long-Horizon Imitation Learning by Watching Human Play",
    subtitle: "Khai thác video người thao tác để định hướng những hành động tiếp theo.",
    abstract: "MimicPlay học thông tin định hướng hành động từ video người tương tác với đồ vật, sau đó kết hợp demonstration của robot để xử lý các nhiệm vụ nhiều bước.",
    date: "2023-08-15", venue: "CoRL 2023", category: "CONTROL", userPick: false,
    pdf: "https://arxiv.org/pdf/2302.12422", source: "https://mimic-play.github.io/",
    readingMinutes: 21, concepts: ["video người", "hierarchical imitation", "nhiệm vụ dài"]
  },
  {
    slug: "open-x-embodiment", shortTitle: "Open X-Embodiment", title: "Open X-Embodiment: Robotic Learning Datasets and RT-X Models",
    subtitle: "Kinh nghiệm từ robot này có chuyển giao được sang robot khác không?",
    abstract: "Open X-Embodiment kết hợp dữ liệu từ nhiều nền tảng robot nhằm kiểm tra khả năng học chung và chuyển giao kinh nghiệm qua khác biệt về cấu trúc cơ khí.",
    date: "2023-10-01", venue: "ICRA 2024", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2310.08864", source: "https://robotics-transformer-x.github.io/",
    code: "https://github.com/google-deepmind/open_x_embodiment", readingMinutes: 21,
    concepts: ["cross-embodiment", "data mixture", "RT-X"]
  },
  {
    slug: "droid", shortTitle: "DROID", title: "DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset",
    subtitle: "Đưa dữ liệu thao tác robot ra khỏi môi trường phòng thí nghiệm khép kín.",
    abstract: "DROID thu thập demonstration từ thao tác robot ở nhiều môi trường ngoài phòng thí nghiệm, phục vụ huấn luyện policy bền vững trước thay đổi bối cảnh.",
    date: "2024-03-01", venue: "RSS 2024", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2403.12945", source: "https://droid-dataset.github.io/",
    code: "https://github.com/droid-dataset/droid", readingMinutes: 17,
    concepts: ["dữ liệu ngoài phòng thí nghiệm", "teleoperation", "chất lượng dữ liệu"]
  },
  {
    slug: "octo", shortTitle: "Octo", title: "Octo: An Open-Source Generalist Robot Policy",
    subtitle: "Một policy robot đa nhiệm có thể mở rộng và fine-tune cho nhiệm vụ mới.",
    abstract: "Octo là policy robot đa nhiệm mã nguồn mở, được pretrain trên tập dữ liệu Open X-Embodiment và có thể fine-tune cho robot hoặc nhiệm vụ mới.",
    date: "2024-05-01", venue: "RSS 2024", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2405.12213", source: "https://octo-models.github.io/",
    code: "https://github.com/octo-models/octo", readingMinutes: 20,
    concepts: ["policy đa nhiệm", "fine-tuning", "cross-embodiment"]
  },
  {
    slug: "robocasa", shortTitle: "RoboCasa", title: "RoboCasa: Large-Scale Simulation of Everyday Tasks for Generalist Robots",
    subtitle: "Mô phỏng nhiều căn bếp và nhiệm vụ để robot học trong môi trường an toàn.",
    abstract: "RoboCasa tạo nhiều căn bếp và nhiệm vụ gia đình trong mô phỏng bằng các biến đổi có quy tắc, giúp huấn luyện và đánh giá khả năng khái quát của robot.",
    date: "2024-06-01", venue: "RSS 2024", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2406.02523", source: "https://robocasa.ai/",
    code: "https://github.com/robocasa/robocasa", readingMinutes: 18,
    concepts: ["simulation", "procedural generation", "benchmark"]
  },
  {
    slug: "openvla", shortTitle: "OpenVLA", title: "OpenVLA: An Open-Source Vision-Language-Action Model",
    subtitle: "Mô hình 7 tỷ tham số mở đường từ hình ảnh đến action token.",
    abstract: "OpenVLA kết hợp VLM đã pretrain với cách mã hóa action thành token, công bố một VLA mã nguồn mở có thể fine-tune cho nhiệm vụ và cấu trúc robot mới.",
    date: "2024-06-15", venue: "CoRL 2024", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2406.09246", source: "https://openvla.github.io/",
    code: "https://github.com/openvla/openvla", readingMinutes: 22,
    concepts: ["7B VLA", "action tokenizer", "LoRA"]
  },
  {
    slug: "rdt-1b", shortTitle: "RDT-1B", title: "RDT-1B: A Diffusion Foundation Model for Bimanual Manipulation",
    subtitle: "Học prior chuyển động phối hợp hai tay bằng diffusion model quy mô lớn.",
    abstract: "RDT-1B dùng diffusion Transformer cùng biểu diễn action thống nhất theo ý nghĩa vật lý để học thao tác hai tay từ dữ liệu nhiều robot.",
    date: "2024-10-01", venue: "ICLR 2025", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2410.07864", source: "https://rdt-robotics.github.io/rdt-robotics/",
    code: "https://github.com/thu-ml/RoboticsDiffusionTransformer", readingMinutes: 21,
    concepts: ["diffusion Transformer", "bimanual", "physical action"]
  },
  {
    slug: "fast", shortTitle: "FAST", title: "FAST: Efficient Action Tokenization for Vision-Language-Action Models",
    subtitle: "Cách mã hóa action thành token ảnh hưởng trực tiếp đến hiệu quả của VLA.",
    abstract: "FAST mã hóa các chuỗi action trơn thành token nhờ biến đổi miền tần số, giúp VLA autoregressive sinh chuyển động hiệu quả hơn.",
    date: "2025-01-01", venue: "RSS 2025", category: "CONTROL", userPick: false,
    pdf: "https://arxiv.org/pdf/2501.09747", source: "https://www.roboticsproceedings.org/rss21/p012.html",
    code: "https://github.com/Physical-Intelligence/fast", readingMinutes: 19,
    concepts: ["DCT", "tokenization", "compression"]
  },
  {
    slug: "groot-n1", shortTitle: "GR00T N1", title: "GR00T N1: An Open Foundation Model for Generalist Humanoid Robots",
    subtitle: "System 2 xử lý ngữ cảnh; System 1 tạo chuyển động liên tục.",
    abstract: "GR00T N1 kết hợp VLM ở System 2 với diffusion action expert ở System 1, tận dụng quỹ đạo robot, video con người và dữ liệu tổng hợp để học chính sách điều khiển.",
    date: "2025-03-27", venue: "arXiv 2025", category: "POLICIES", userPick: true,
    pdf: "https://arxiv.org/pdf/2503.14734", source: "https://arxiv.org/abs/2503.14734",
    code: "https://github.com/NVIDIA/Isaac-GR00T", readingMinutes: 33,
    concepts: ["dual-system", "diffusion Transformer", "humanoid"]
  },
  {
    slug: "pi-0-5", shortTitle: "π0.5", title: "π0.5: A Vision-Language-Action Model with Open-World Generalization",
    subtitle: "Làm sao để robot rời phòng thí nghiệm và thực hiện nhiệm vụ dài?",
    abstract: "π0.5 kết hợp VLA sinh action liên tục với quy trình huấn luyện nhằm cải thiện khả năng khái quát ở môi trường mới và thực hiện nhiệm vụ dài.",
    date: "2025-04-01", venue: "CoRL 2025", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2504.16054", source: "https://www.pi.website/blog/pi05",
    code: "https://github.com/Physical-Intelligence/openpi", readingMinutes: 26,
    concepts: ["flow matching", "khái quát trong môi trường mở", "hierarchy"]
  },
  {
    slug: "rtc-inference", shortTitle: "RTC · Inference", title: "Real-Time Execution of Action Chunking Flow Policies",
    subtitle: "Robot phải tiếp tục hành động trong lúc mô hình tính toán chunk tiếp theo.",
    abstract: "RTC cho phép robot thực thi chunk cũ trong lúc tính chunk mới, dùng inpainting để ràng buộc các action đã cam kết và giảm gián đoạn ở điểm nối.",
    date: "2025-06-05", venue: "NeurIPS 2025", category: "SYSTEMS", userPick: true,
    pdf: "https://arxiv.org/pdf/2506.07339", source: "https://www.pi.website/research/real_time_chunking",
    readingMinutes: 29, concepts: ["asynchronous", "inpainting", "latency"]
  },
  {
    slug: "rtc-training", shortTitle: "RTC · Training", title: "Training-Time Action Conditioning for Efficient Real-Time Chunking",
    subtitle: "Dạy policy xử lý độ trễ ngay khi huấn luyện thay vì sửa output lúc inference.",
    abstract: "Training-time RTC huấn luyện policy có điều kiện theo prefix action đã cam kết để sinh postfix liên tục, tránh chi phí gradient guidance ở inference.",
    date: "2025-12-09", venue: "arXiv 2025", category: "SYSTEMS", userPick: true,
    pdf: "https://arxiv.org/pdf/2512.05964", source: "https://arxiv.org/abs/2512.05964",
    readingMinutes: 27, concepts: ["prefix conditioning", "flow matching", "runtime delay"]
  },
  {
    slug: "qwen-vla", shortTitle: "Qwen-VLA", title: "Qwen-VLA: Unifying Vision-Language-Action Modeling across Tasks, Environments, and Robot Embodiments",
    subtitle: "Một kiến trúc VLA chung để học từ nhiều nhiệm vụ và nhiều loại robot.",
    abstract: "Qwen-VLA mở rộng VLM bằng action decoder dạng DiT, kết hợp pretraining trên thao tác robot, video góc nhìn thứ nhất, navigation và dữ liệu từ nhiều cấu trúc robot.",
    date: "2026-06-01", venue: "arXiv 2026", category: "POLICIES", userPick: true,
    pdf: "https://arxiv.org/pdf/2605.30280", source: "https://github.com/QwenLM/Qwen-VLA",
    code: "https://github.com/QwenLM/Qwen-VLA", readingMinutes: 35,
    concepts: ["DiT", "embodiment prompt", "joint pretraining"]
  },
  {
    slug: "lingbot-vla-2", shortTitle: "LingBot-VLA 2.0", title: "From Foundation to Application: Improving VLA Models in Practice",
    subtitle: "Từ mô hình nền tảng đến hệ thống robot thực tế có nhiều phần cứng khác nhau.",
    abstract: "LingBot-VLA 2.0 mở rộng dữ liệu đa robot, dùng action expert dạng sparse MoE, biểu diễn action toàn thân thống nhất và distillation từ đặc trưng thị giác/độ sâu tương lai.",
    date: "2026-07-07", venue: "arXiv 2026", category: "POLICIES", userPick: true,
    pdf: "https://arxiv.org/pdf/2607.06403", source: "https://arxiv.org/abs/2607.06403",
    readingMinutes: 37, concepts: ["MoE", "55D action", "predictive dynamics"]
  }
];

export const orderedPapers = [...papers].sort((a, b) => a.date.localeCompare(b.date));
export const paperBySlug = new Map(papers.map((paper) => [paper.slug, paper]));
export function getPaper(slug: string): Paper | undefined { return paperBySlug.get(slug); }
export const userPapers = papers.filter((paper) => paper.userPick);
