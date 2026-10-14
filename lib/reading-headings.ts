// Shared by server-rendered Markdown and the lightweight client table of contents.
export const titleSlug = (s: string) => s.toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d")
  .replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-");

const chapterLabels: Record<string,string> = {
  "Vì sao cần nghiên cứu này?": "01 / Vì sao cần nghiên cứu?",
  "Phương pháp thực hiện": "03 / Phương pháp",
  "Kết quả thực nghiệm": "05 / Kết quả",
  "Hạn chế và câu hỏi còn mở": "06 / Hạn chế",
  "Liên hệ với nghiên cứu khác": "07 / Liên hệ",
};
export const titleDisplay = (title: string) => chapterLabels[title] ?? title;
