import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Keep Next.js tracing inside this app even if ~/package-lock.json exists.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
