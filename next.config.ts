import type { NextConfig } from "next";

/**
 * Static export: `npm run build` writes a plain HTML/CSS/JS site to ./out.
 * It runs on any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages)
 * with no server, so hosting a portfolio stays free.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
