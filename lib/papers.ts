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
  FOUNDATIONS: "Foundations & reasoning",
  POLICIES: "Generalist policies",
  DATA: "Data & benchmarks",
  CONTROL: "Action & control",
  SYSTEMS: "Real-time systems",
};

// Timeline dates are research release/first-preprint dates when identifiable, and approximate
// month-level dates otherwise. They intentionally do not represent a uniform proceedings date.
export const papers: Paper[] = [
  {
    slug: "vima", shortTitle: "VIMA", title: "VIMA: General Robot Manipulation with Multimodal Prompts",
    subtitle: "Manipulation follows a prompt, not a hard-coded task ID.",
    abstract: "Một prompt có thể chứa ngôn ngữ, ảnh mẫu và ví dụ thao tác. VIMA biến prompt đa phương thức thành giao diện chung để điều khiển robot trong môi trường giả lập.",
    date: "2022-10-01", venue: "ICML 2023", category: "FOUNDATIONS", userPick: false,
    pdf: "https://arxiv.org/pdf/2210.03094", source: "https://proceedings.mlr.press/v202/jiang23b.html",
    code: "https://github.com/vimalabs/VIMA", readingMinutes: 17,
    concepts: ["multimodal prompting", "object-centric", "generalization"]
  },
  {
    slug: "rt-1", shortTitle: "RT-1", title: "RT-1: Robotics Transformer for Real-World Control at Scale",
    subtitle: "Robotic behavior begins to scale with data and task diversity.",
    abstract: "Transformer điều khiển robot trực tiếp từ camera và lệnh ngôn ngữ. RT-1 đưa ra bằng chứng sớm về lợi ích của dữ liệu thật, đa dạng task và khả năng generalize.",
    date: "2022-12-01", venue: "RSS 2023", category: "POLICIES", userPick: false,
    pdf: "https://www.roboticsproceedings.org/rss19/p025.pdf", source: "https://www.roboticsproceedings.org/rss19/p025.html",
    readingMinutes: 17, concepts: ["behavior cloning", "action tokens", "scaling"]
  },
  {
    slug: "diffusion-policy", shortTitle: "Diffusion Policy", title: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion",
    subtitle: "From predicting one action to sampling an entire plausible future.",
    abstract: "Diffusion model sinh cả một chuỗi hành động liên tục, giữ được nhiều phương án hợp lệ thay vì trung bình hoá các demonstration khác nhau.",
    date: "2023-03-01", venue: "RSS 2023", category: "CONTROL", userPick: false,
    pdf: "https://www.roboticsproceedings.org/rss19/p026.pdf", source: "https://diffusion-policy.cs.columbia.edu/",
    code: "https://github.com/real-stanford/diffusion_policy", readingMinutes: 24,
    concepts: ["diffusion", "action chunking", "receding horizon"]
  },
  {
    slug: "palm-e", shortTitle: "PaLM-E", title: "PaLM-E: An Embodied Multimodal Language Model",
    subtitle: "Language reasoning meets real-world sensor streams.",
    abstract: "Đưa image và robot state vào ngữ cảnh của language model để reasoning với cảm biến mà vẫn tận dụng kiến thức đã pretrain từ ngôn ngữ.",
    date: "2023-03-06", venue: "ICML 2023", category: "FOUNDATIONS", userPick: false,
    pdf: "https://proceedings.mlr.press/v202/driess23a/driess23a.pdf", source: "https://proceedings.mlr.press/v202/driess23a.html",
    readingMinutes: 18, concepts: ["embodied reasoning", "multimodal tokens", "transfer"]
  },
  {
    slug: "act", shortTitle: "ACT / ALOHA", title: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware",
    subtitle: "One prediction can contain fifty coordinated movements.",
    abstract: "ALOHA hạ chi phí teleoperation, còn Action Chunking with Transformers (ACT) giúp robot học thao tác hai tay bằng cách dự đoán một chuỗi action thay vì từng bước.",
    date: "2023-04-01", venue: "RSS 2023", category: "CONTROL", userPick: false,
    pdf: "https://www.roboticsproceedings.org/rss19/p016.pdf", source: "https://www.roboticsproceedings.org/rss19/p016.html",
    code: "https://github.com/tonyzhaozh/act", readingMinutes: 22,
    concepts: ["action chunking", "CVAE", "temporal ensembling"]
  },
  {
    slug: "libero", shortTitle: "LIBERO", title: "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning",
    subtitle: "A benchmark that asks what a robot retains when tasks keep changing.",
    abstract: "Benchmark thao tác robot để đo transfer, lifelong learning và khả năng giữ kỹ năng cũ trong lúc học các task mới. Thuộc bộ sưu tập bài do người dùng cung cấp.",
    date: "2023-06-01", venue: "NeurIPS 2023", category: "DATA", userPick: true,
    pdf: "https://arxiv.org/pdf/2306.03310", source: "https://libero-project.github.io/",
    code: "https://github.com/Lifelong-Robot-Learning/LIBERO", readingMinutes: 22,
    concepts: ["benchmark", "continual learning", "task transfer"]
  },
  {
    slug: "rt-2", shortTitle: "RT-2", title: "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control",
    subtitle: "A vision-language model starts speaking in robot actions.",
    abstract: "RT-2 tận dụng kiến thức web của VLM, biến robot action thành token và đồng huấn luyện robot trajectories với vision-language tasks.",
    date: "2023-07-01", venue: "CoRL 2023", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2307.15818", source: "https://robotics-transformer2.github.io/",
    readingMinutes: 23, concepts: ["VLA", "co-training", "semantic transfer"]
  },
  {
    slug: "bridgedata-v2", shortTitle: "BridgeData V2", title: "BridgeData V2: A Dataset for Robot Learning at Scale",
    subtitle: "Generalization starts with a dataset that actually changes.",
    abstract: "Dataset robot manipulation với nhiều task, môi trường và đối tượng để huấn luyện policy có khả năng transfer mạnh hơn giữa scene và nhiệm vụ.",
    date: "2023-08-01", venue: "CoRL 2023", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2308.12952", source: "https://rail-berkeley.github.io/bridgedata-v2/",
    readingMinutes: 15, concepts: ["data diversity", "demonstrations", "generalization"]
  },
  {
    slug: "mimicplay", shortTitle: "MimicPlay", title: "MimicPlay: Long-Horizon Imitation Learning by Watching Human Play",
    subtitle: "Human play offers cheap hints about what should happen next.",
    abstract: "Dùng video chơi/tương tác của người để học kế hoạch ở tầng cao, rồi kết hợp robot demonstrations nhằm điều khiển long-horizon manipulation.",
    date: "2023-08-15", venue: "CoRL 2023", category: "CONTROL", userPick: false,
    pdf: "https://arxiv.org/pdf/2302.12422", source: "https://mimic-play.github.io/",
    readingMinutes: 21, concepts: ["human videos", "hierarchical imitation", "long horizon"]
  },
  {
    slug: "open-x-embodiment", shortTitle: "Open X-Embodiment", title: "Open X-Embodiment: Robotic Learning Datasets and RT-X Models",
    subtitle: "One hundred datasets, one question: can experience travel between robots?",
    abstract: "Gộp dữ liệu nhiều robot, morphology và lab để kiểm tra liệu một policy lớn có thể tận dụng kinh nghiệm từ các embodiment khác hay không.",
    date: "2023-10-01", venue: "ICRA 2024", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2310.08864", source: "https://robotics-transformer-x.github.io/",
    code: "https://github.com/google-deepmind/open_x_embodiment", readingMinutes: 21,
    concepts: ["cross-embodiment", "data mixture", "RT-X"]
  },
  {
    slug: "droid", shortTitle: "DROID", title: "DROID: A Large-Scale In-The-Wild Robot Manipulation Dataset",
    subtitle: "A robot corpus gathered outside one carefully controlled laboratory.",
    abstract: "DROID mở rộng dữ liệu thao tác bằng teleoperation trên nhiều môi trường đời thực, đặt nền cho nghiên cứu robust policy và cross-scene transfer.",
    date: "2024-03-01", venue: "RSS 2024", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2403.12945", source: "https://droid-dataset.github.io/",
    code: "https://github.com/droid-dataset/droid", readingMinutes: 17,
    concepts: ["in-the-wild data", "teleoperation", "dataset quality"]
  },
  {
    slug: "octo", shortTitle: "Octo", title: "Octo: An Open-Source Generalist Robot Policy",
    subtitle: "A shared policy that you can actually fine-tune.",
    abstract: "Octo phát hành open-source generalist robot policy, train trên dữ liệu Open X-Embodiment và hỗ trợ thích nghi sang robot/task mới.",
    date: "2024-05-01", venue: "RSS 2024", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2405.12213", source: "https://octo-models.github.io/",
    code: "https://github.com/octo-models/octo", readingMinutes: 20,
    concepts: ["generalist policy", "fine-tuning", "cross-embodiment"]
  },
  {
    slug: "robocasa", shortTitle: "RoboCasa", title: "RoboCasa: Large-Scale Simulation of Everyday Tasks for Generalist Robots",
    subtitle: "A procedural universe of homes where robot policies can fail safely.",
    abstract: "Môi trường mô phỏng nhà bếp và household tasks có procedural variation để học và đo khả năng generalize trong robot manipulation.",
    date: "2024-06-01", venue: "RSS 2024", category: "DATA", userPick: false,
    pdf: "https://arxiv.org/pdf/2406.02523", source: "https://robocasa.ai/",
    code: "https://github.com/robocasa/robocasa", readingMinutes: 18,
    concepts: ["simulation", "procedural generation", "benchmark"]
  },
  {
    slug: "openvla", shortTitle: "OpenVLA", title: "OpenVLA: An Open-Source Vision-Language-Action Model",
    subtitle: "Seven billion parameters, an open route from pixels to action tokens.",
    abstract: "VLA open-source kết hợp pretrained VLM với robot action discretization, cho phép fine-tuning sang embodiment và nhiệm vụ mới.",
    date: "2024-06-15", venue: "CoRL 2024", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2406.09246", source: "https://openvla.github.io/",
    code: "https://github.com/openvla/openvla", readingMinutes: 22,
    concepts: ["7B VLA", "action tokenizer", "LoRA"]
  },
  {
    slug: "rdt-1b", shortTitle: "RDT-1B", title: "RDT-1B: A Diffusion Foundation Model for Bimanual Manipulation",
    subtitle: "A billion-parameter diffusion prior for coordinated robot hands.",
    abstract: "Diffusion Transformer quy mô lớn với unified physical action representation nhằm học behavior hai tay từ nhiều robot dataset.",
    date: "2024-10-01", venue: "ICLR 2025", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2410.07864", source: "https://rdt-robotics.github.io/rdt-robotics/",
    code: "https://github.com/thu-ml/RoboticsDiffusionTransformer", readingMinutes: 21,
    concepts: ["diffusion Transformer", "bimanual", "physical action"]
  },
  {
    slug: "fast", shortTitle: "FAST", title: "FAST: Efficient Action Tokenization for Vision-Language-Action Models",
    subtitle: "Action tokenization is not an implementation detail.",
    abstract: "Nén smooth robot action trajectory thành các token thuận tiện cho autoregressive VLA, dựa vào frequency-domain transform và tokenization.",
    date: "2025-01-01", venue: "RSS 2025", category: "CONTROL", userPick: false,
    pdf: "https://arxiv.org/pdf/2501.09747", source: "https://www.roboticsproceedings.org/rss21/p012.html",
    code: "https://github.com/Physical-Intelligence/fast", readingMinutes: 19,
    concepts: ["DCT", "tokenization", "compression"]
  },
  {
    slug: "groot-n1", shortTitle: "GR00T N1", title: "GR00T N1: An Open Foundation Model for Generalist Humanoid Robots",
    subtitle: "System 2 understands. System 1 moves.",
    abstract: "NVIDIA kết hợp VLM System 2 và diffusion action expert System 1, pretrain bằng robot trajectories, video người và dữ liệu tổng hợp. Thuộc bộ sưu tập bài do người dùng cung cấp.",
    date: "2025-03-27", venue: "arXiv 2025", category: "POLICIES", userPick: true,
    pdf: "https://arxiv.org/pdf/2503.14734", source: "https://arxiv.org/abs/2503.14734",
    code: "https://github.com/NVIDIA/Isaac-GR00T", readingMinutes: 33,
    concepts: ["dual-system", "diffusion Transformer", "humanoid"]
  },
  {
    slug: "pi-0-5", shortTitle: "π0.5", title: "π0.5: A Vision-Language-Action Model with Open-World Generalization",
    subtitle: "What does it take to leave the lab and complete long tasks?",
    abstract: "Kết hợp VLA continuous action với training recipe hướng tới open-world generalization, long-horizon behavior và dữ liệu đa dạng.",
    date: "2025-04-01", venue: "CoRL 2025", category: "POLICIES", userPick: false,
    pdf: "https://arxiv.org/pdf/2504.16054", source: "https://www.pi.website/blog/pi05",
    code: "https://github.com/Physical-Intelligence/openpi", readingMinutes: 26,
    concepts: ["flow matching", "open-world generalization", "hierarchy"]
  },
  {
    slug: "rtc-inference", shortTitle: "RTC · Inference", title: "Real-Time Execution of Action Chunking Flow Policies",
    subtitle: "The world keeps moving while your model thinks.",
    abstract: "Inference-time real-time chunking: trong lúc execute chunk cũ, model generate chunk mới với inpainting constraints để tránh giật ở boundary. Một trong sáu PDF gốc.",
    date: "2025-06-05", venue: "NeurIPS 2025", category: "SYSTEMS", userPick: true,
    pdf: "https://arxiv.org/pdf/2506.07339", source: "https://www.pi.website/research/real_time_chunking",
    readingMinutes: 29, concepts: ["asynchronous", "inpainting", "latency"]
  },
  {
    slug: "rtc-training", shortTitle: "RTC · Training", title: "Training-Time Action Conditioning for Efficient Real-Time Chunking",
    subtitle: "Teach a policy about latency instead of correcting it with backprop.",
    abstract: "Train policy condition trực tiếp lên prefix action đã commit để tạo postfix, giảm overhead inference-time gradient guidance. Một trong sáu PDF gốc.",
    date: "2025-12-09", venue: "arXiv 2025", category: "SYSTEMS", userPick: true,
    pdf: "https://arxiv.org/pdf/2512.05964", source: "https://arxiv.org/abs/2512.05964",
    readingMinutes: 27, concepts: ["prefix conditioning", "flow matching", "runtime delay"]
  },
  {
    slug: "qwen-vla", shortTitle: "Qwen-VLA", title: "Qwen-VLA: Unifying Vision-Language-Action Modeling across Tasks, Environments, and Robot Embodiments",
    subtitle: "One vision-language-action stack across many kinds of robots.",
    abstract: "Qwen mở rộng VLM bằng DiT action decoder, joint pretraining từ manipulation, egocentric videos, navigation và dữ liệu trajectory đa embodiment. Một trong sáu PDF gốc.",
    date: "2026-06-01", venue: "arXiv 2026", category: "POLICIES", userPick: true,
    pdf: "https://arxiv.org/pdf/2605.30280", source: "https://github.com/QwenLM/Qwen-VLA",
    code: "https://github.com/QwenLM/Qwen-VLA", readingMinutes: 35,
    concepts: ["DiT", "embodiment prompt", "joint pretraining"]
  },
  {
    slug: "lingbot-vla-2", shortTitle: "LingBot-VLA 2.0", title: "From Foundation to Application: Improving VLA Models in Practice",
    subtitle: "Foundation models collide with the practical complexity of real robots.",
    abstract: "Tập trung vào scale dữ liệu đa embodiment, sparse MoE action expert, unified whole-body action và future-aware visual/depth distillation. Một trong sáu PDF gốc.",
    date: "2026-07-07", venue: "arXiv 2026", category: "POLICIES", userPick: true,
    pdf: "https://arxiv.org/pdf/2607.06403", source: "https://arxiv.org/abs/2607.06403",
    readingMinutes: 37, concepts: ["MoE", "55D action", "predictive dynamics"]
  }
];

export const orderedPapers = [...papers].sort((a, b) => a.date.localeCompare(b.date));
export const paperBySlug = new Map(papers.map((paper) => [paper.slug, paper]));
export function getPaper(slug: string): Paper | undefined { return paperBySlug.get(slug); }
export const userPapers = papers.filter((paper) => paper.userPick);
