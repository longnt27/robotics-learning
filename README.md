# ROBOTICS / ATLAS

Thư viện tương tác dành cho người học robot và Vision-Language-Action (VLA). Khám phá **22 bài nghiên cứu không trùng lặp**, trong đó có 6 bài được người dùng lựa chọn, qua dòng thời gian hoặc sơ đồ DAG. Mỗi bài có liên kết PDF gốc và **phần diễn giải chuyên sâu bằng tiếng Việt**.

## Công nghệ

Next.js App Router · TypeScript · React Three Fiber / Three.js · React Flow · Markdown

## Chạy trên máy cá nhân

```bash
npm install
npm run dev
npm run check:content
npm run test:ui
npm run typecheck
npm run build
```

## Cấu trúc nội dung

- `lib/papers.ts`: thông tin của 22 bài báo, tiêu đề gốc, mô tả ngắn và liên kết đến nguồn chính thức.
- `lib/relations.ts`: các quan hệ có phân loại giữa những bài nghiên cứu, kèm giải thích bằng tiếng Việt.
- `content/papers/{slug}.md`: bài diễn giải dài, có thể chỉnh sửa trực tiếp trong Git.
- `components/`: giao diện dòng thời gian, DAG và trang đọc.
- `docs/superpowers/`: đặc tả kỹ thuật và kế hoạch triển khai.

Tên bài báo, từ viết tắt, tên mô hình, thuật toán và những thuật ngữ kỹ thuật quen dùng như *prompt*, *action chunking*, *flow matching*, *benchmark* được giữ theo cách dùng phổ biến trong ngành. Các câu giải thích, nút điều hướng và chú thích được viết bằng tiếng Việt.

PDF được hiển thị từ nguồn xuất bản chính thức khi trình duyệt cho phép. Nếu nhà xuất bản chặn nhúng, vẫn có thể mở PDF trực tiếp. Phần slide được dành cho giai đoạn phát triển sau.

Website không yêu cầu tài khoản, cơ sở dữ liệu, API trả phí hay theo dõi người dùng.
