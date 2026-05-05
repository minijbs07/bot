import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/bot',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
