import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "@xyflow/react/dist/style.css";

const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: { default: "ROBOTICS / ATLAS | Understand how robots learn", template: "%s | ROBOTICS / ATLAS" },
  description: "An interactive research atlas of 22 foundational robotics and VLA papers, with an animated timeline, research DAG, original PDFs and in-depth Vietnamese explanations.",
  openGraph: { title: "ROBOTICS / ATLAS", description: "Navigate the constellation of embodied intelligence research.", type: "website" },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#080911" };

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="vi"><body className={montserrat.variable}>{children}</body></html>;
}
