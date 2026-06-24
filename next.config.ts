import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-mengonten.tiroe.io",
      },
    ],
  },
};

export default nextConfig;
