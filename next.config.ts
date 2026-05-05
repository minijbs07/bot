import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/bot',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
