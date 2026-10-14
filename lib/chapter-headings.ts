export type ChapterHeading = {title:string;id:string};

const chapterLabels:Record<string,string>={
  "Vì sao cần nghiên cứu này?":"01 / Vì sao cần nghiên cứu?",
  "Phương pháp thực hiện":"03 / Phương pháp",
  "Kết quả thực nghiệm":"05 / Kết quả",
  "Hạn chế và câu hỏi còn mở":"06 / Hạn chế",
  "Liên hệ với nghiên cứu khác":"07 / Liên hệ",
};

export const titleSlug=(s:string)=>s.toLowerCase().normalize("NFKD")
  .replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d")
  .replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-");

export const titleDisplay=(title:string)=>chapterLabels[title]??title;

export function getChapterToc(chapter:string|null):ChapterHeading[]{
  return [...(chapter||"").matchAll(/^## (.+)$/gm)].map(x=>({title:x[1],id:titleSlug(x[1])}));
}
