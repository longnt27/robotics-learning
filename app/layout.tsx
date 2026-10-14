import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "./briefing.css";
import "katex/dist/katex.min.css";
import "@xyflow/react/dist/style.css";
import { GlossaryLauncher } from "@/components/glossary-launcher";
import glossaryManifest from "@/content/glossary.json";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: { default: "ROBOTICS / ATLAS | Hiểu cách robot học", template: "%s | ROBOTICS / ATLAS" },
  description: "Thư viện tương tác gồm 22 bài nghiên cứu robot và VLA, với dòng thời gian, sơ đồ liên kết, PDF gốc và diễn giải chuyên sâu bằng tiếng Việt.",
  openGraph: { title: "ROBOTICS / ATLAS", description: "Khám phá mối liên hệ giữa các công trình nghiên cứu về trí tuệ hiện thân.", type: "website" },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#080911" };

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="vi"><body className={montserrat.variable}>{children}<GlossaryLauncher count={glossaryManifest.length}/></body></html>;
}
