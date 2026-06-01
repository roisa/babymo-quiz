import type { NextConfig } from "next";

// GitHub Pages serves this repo from /babymo-quiz/, so every asset & route
// must be prefixed. For a custom domain at the apex, set
// NEXT_PUBLIC_BASE_PATH="" at build time (see .github/workflows/deploy.yml).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/babymo-quiz";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    // Required for `output: "export"` — no Next.js image optimization server.
    unoptimized: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
