# ROBOTICS / ATLAS

Thư viện tương tác về Robotics và Vision-Language-Action (VLA) gồm **22 bài nghiên cứu** có bài diễn giải tiếng Việt, tài liệu gốc, slide thuyết trình, dòng thời gian và sơ đồ DAG.

Công nghệ: **Next.js 15 (App Router)** · **React 19** · **TypeScript** · React Three Fiber / Three.js · React Flow · Markdown · KaTeX.

## Chạy trên máy cá nhân (macOS / Linux)

Không cần Vercel, tài khoản, database, API key hay file `.env` để chạy website và slide trên localhost. Vercel bị giới hạn lượt build **không ảnh hưởng** đến `npm run dev` hoặc `npm run build` trên máy của bạn.

### 1. Chuẩn bị

- Cài [Git](https://git-scm.com/downloads) và **Node.js 22** (bao gồm npm). Đây là phiên bản Node dùng trong [GitHub Actions](.github/workflows/build.yml).
- Mở Terminal và kiểm tra:

```bash
git --version
node --version  # Khuyến nghị v22.x
npm --version
```

Nếu dùng [nvm](https://github.com/nvm-sh/nvm), có thể chạy `nvm install 22 && nvm use 22`. Nếu chưa có nvm, cài Node.js 22 trực tiếp trước; không cần cài nvm chỉ để chạy project.

### 2. Clone và cài dependencies

**Clone lần đầu:**

```bash
git clone https://github.com/longnt27/robotics-learning.git
cd robotics-learning
npm install --no-audit --no-fund
```

**Nếu đã clone repo từ trước:**

```bash
cd /duong-dan-den/robotics-learning
git switch main
git pull --ff-only
npm install --no-audit --no-fund
```

Lưu ý: repo hiện **chưa có `package-lock.json`**, nên dùng `npm install` như CI, **không dùng `npm ci`**. 
Sau `npm install`, npm có thể tự tạo `package-lock.json` trong thư mục project. File này khác với `/Users/<tên-user>/package-lock.json` mà Next.js đôi khi nhận nhầm là workspace root. Lệnh `git pull --ff-only` sẽ dừng nếu lịch sử Git local không thể fast-forward; không nên `reset --hard` nếu còn thay đổi chưa commit.

### 3. Chạy chế độ phát triển

```bash
npm run dev
```

Sau khi Terminal báo server sẵn sàng, mở:

- Trang chủ: <http://localhost:3000>
- **RTC Training, bản 10 slide:** <http://localhost:3000/paper/rtc-training?tab=slides&slide=1>
- Slide 04 (so sánh hard prefix / soft masking): <http://localhost:3000/paper/rtc-training?tab=slides&slide=4>

Trên macOS có thể mở thẳng bằng:

```bash
open 'http://localhost:3000/paper/rtc-training?tab=slides&slide=1'
```

**Giữ Terminal này chạy** khi đang xem web; sửa code sẽ được tự động cập nhật. Nhấn `Ctrl+C` để tắt server.

Nếu cổng 3000 đã được chương trình khác dùng:

```bash
npm run dev -- -p 3001
```

Khi đó truy cập `http://localhost:3001` thay vì `3000`.

## Build và xem đúng chế độ production trên máy

**Tắt `npm run dev` trước** để tránh hai tiến trình Next.js cùng thao tác với thư mục `.next`.

```bash
npm run build
npm run start
```

Mở <http://localhost:3000/paper/rtc-training?tab=slides&slide=1>. `npm run build` tạo bản tối ưu trong `.next`; `npm run start` phục vụ bản đã build. **Không cần deploy Vercel** để làm hai việc này.

Muốn quay lại sửa và xem cập nhật ngay, dừng server bằng `Ctrl+C`, rồi chạy `npm run dev`.

## Kiểm thử trên máy

**Kiểm tra nhanh nội dung, slide và TypeScript:**

```bash
npm run check:content
npm run test:slides
npm run typecheck
```

**Chạy các bộ test tương tự GitHub Actions:**

```bash
npm run test:deep-reading
npm run test:resources
npm run test:pdf-viewer
npm run test:ui
npm run test:glossary
npm run test:performance
npm run build
```

### Kiểm thử trình duyệt bằng Playwright

E2E cần **Chromium** và một server đang chạy. Chỉ cần cài trình duyệt cho Playwright lần đầu:

```bash
npx playwright install chromium
```

Mở **hai Terminal** tại thư mục repo:

**Terminal 1**, chạy bản đã build:

```bash
npm run start
```

**Terminal 2**, chạy test (mặc định tìm server ở `127.0.0.1:3000`):

```bash
npm run test:e2e
```

Nếu dùng cổng 3001, ở Terminal 1 chạy `npm run start -- -p 3001`; ở Terminal 2 chạy:

```bash
TEST_BASE_URL=http://127.0.0.1:3001 npm run test:e2e
```

Bài test duyệt cả giao diện laptop và điện thoại, thao tác slide, ghi chú và Presenter View. **Không chạy E2E một mình nếu chưa bật server**, nếu không test sẽ chờ rồi báo không kết nối được.

## Thuyết trình RTC Training trên máy

1. Mở [RTC Training](http://localhost:3000/paper/rtc-training?tab=slides&slide=1), chọn **GHI CHÚ** để xem script dưới slide.
2. Trên **Chrome hoặc Edge**, dùng **TRÌNH CHIẾU + GHI CHÚ** để mở Presenter View riêng, có script và mục **Câu hỏi phản biện** (chứa đáp án cùng nguồn tham khảo).
3. Khi chia sẻ bằng Microsoft Teams/Meet, **chỉ chia sẻ cửa sổ trình duyệt đang hiển thị slide**, không chia sẻ toàn màn hình hoặc cửa sổ ghi chú. Presenter View dùng API Document Picture-in-Picture nên không được hỗ trợ đầy đủ trên mọi trình duyệt, chẳng hạn Firefox.

Phím tắt: `←` / `→` hoặc Space (đổi slide), Home / End (đầu / cuối), `G` (lưới slide), `N` (ghi chú), `F` (toàn màn hình), Esc (đóng lớp phủ).

**RTC Training có 10 slide** và 42 câu hỏi phản biện riêng tư. **21 bài còn lại vẫn có 15 slide/bài**. Slide được tải khi vào tab SLIDE; đọc bài không tự tải toàn bộ deck.

## Lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `zsh: command not found: node` hoặc `npm` | Cài Node.js 22; mở lại Terminal và kiểm tra `node --version`. |
| `npm ERR! Missing script: "dev"` | Đang ở sai thư mục. Vào thư mục chứa `package.json` của `robotics-atlas`, rồi chạy lại. |
| `Cannot find module 'next'` / `next: command not found` | Chạy `npm install --no-audit --no-fund` tại thư mục repo. |
| `npm ci` báo thiếu lockfile | Dùng `npm install`, vì repo chưa có `package-lock.json`. |
| `Module not found: Can't resolve 'hls.js'` từ `@react-three/drei/core/VideoTexture.js` | Cập nhật `main`, rồi chạy `npm install --include=optional`. `hls.js` đã được khai báo trong dependencies để Webpack tìm thấy khi import `@react-three/drei`. |
| `@next/swc-darwin-arm64` báo `segment '__TEXT' load command content extends beyond end of file` | Native SWC binary bị hỏng/cài dở. Dừng server rồi thực hiện quy trình cài sạch cho macOS bên dưới; không cần đổi source code. |
| Cảnh báo `multiple lockfiles`, chọn `~/package-lock.json` | Next đã được cấu hình `outputFileTracingRoot` theo thư mục project. Nếu vẫn gặp, cập nhật `main` và kiểm tra `pwd`; đừng xóa `~/package-lock.json` khi chưa biết nó thuộc project nào. |
| `npm audit` báo vulnerabilities | Chạy `npm audit` và `npm audit --omit=dev` để kiểm tra package nào ảnh hưởng production. Không chạy `npm audit fix --force` khi chưa kiểm tra breaking changes; cảnh báo audit không phải nguyên nhân trực tiếp của lỗi import/binary ở trên. |
| `EADDRINUSE: address already in use :::3000` | Tắt server cũ hoặc dùng `npm run dev -- -p 3001`. |
| Build xung đột / `.next` bị khóa | Dừng `dev` / `start` trước khi `npm run build`; không chạy song song trong cùng `.next`. |
| `npm run test:e2e` timeout hoặc không tìm Chromium | Bật server trong Terminal 1; chạy `npx playwright install chromium`, sau đó test ở Terminal 2. |
| Vẫn thấy deck RTC cũ 15 slide | `git switch main && git pull --ff-only`, khởi động lại server và tải lại trang (`Cmd+Shift+R` trên macOS). |
| PDF hoặc hình gốc không tải | Website hoạt động local, nhưng PDF gốc được lấy từ nguồn bên ngoài và có thể cần Internet hoặc bị nhà xuất bản chặn nhúng. |

## Khi Next.js build lỗi trên Apple Silicon

Nếu máy Mac báo `@next/swc-darwin-arm64` không load được, đặc biệt lỗi `segment '__TEXT' load command content extends beyond end of file`, file native compiler trong `node_modules` đã bị hỏng hoặc tải chưa hoàn chỉnh. Đó là lỗi cài đặt **trên máy**, không phải lỗi code TypeScript.

Từ thư mục repo, kiểm tra `node --version` (khuyến nghị **22.x**) và chạy:

```bash
# Tắt tất cả server dev/start trong repo trước.
cd ~/projects/robotics-learning
rm -rf node_modules .next
npm cache verify
npm install --include=optional
npm run build
```

Lệnh trên chỉ xóa dependencies và build cache **trong thư mục repo**, không xóa source code hoặc lockfile của user. `--include=optional` bảo đảm npm cài lại native SWC optional dependency đúng cho macOS ARM64.

Nếu file SWC vẫn bị hỏng sau khi cài lại, mới thử xóa npm cache và cài lần nữa:

```bash
npm cache clean --force
rm -rf node_modules .next
npm install --include=optional
npm run build
```

Đừng dùng `sudo npm install` và đừng xóa bừa `~/package-lock.json`: đó có thể là lockfile của project khác. Nếu build hoàn tất, `npm run start` sẽ phục vụ bản production ở `http://localhost:3000`.

## Cấu trúc nội dung

- `lib/papers.ts`: thông tin 22 bài nghiên cứu, liên kết PDF và metadata.
- `lib/paper-resources.json`: các liên kết GitHub / Hugging Face có nhãn nguồn chính thức hoặc cộng đồng.
- `lib/relations.ts`: các quan hệ giữa paper dùng trong DAG.
- `docs/paper-source-verification.md`: tài liệu đối chiếu phát biểu nghiên cứu với nguồn gốc.
- `content/papers/{slug}.md`: các bài diễn giải tiếng Việt.
- `content/slides/{slug}.json`: nội dung slide cùng `speakerScript` và `defenseQA` khi có.
- `components/slide-deck.tsx`: trang trình chiếu, công thức, sơ đồ, ghi chú và keyboard controls.
- `components/presenter-panel.tsx`: cửa sổ Presenter View riêng cho người nói.
- `app/api/papers/[slug]/slides/route.ts`: tải deck theo nhu cầu.
- `.github/workflows/build.yml`: pipeline tham chiếu để chạy test, build và E2E.

Nội dung diễn giải, nút điều hướng và chú thích ưu tiên tiếng Việt. Thuật ngữ chuyên ngành (như *action chunking*, *flow matching*, *prompt*) được giữ khi việc dịch dễ gây sai lệch ý nghĩa.
