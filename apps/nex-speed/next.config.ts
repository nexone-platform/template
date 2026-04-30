import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nexone/ui"],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8080/api/v1/:path*',
      },
      {
        source: '/ws/:path*',
        destination: 'http://localhost:8080/ws/:path*',
      },
    ];
  },
};

export default nextConfig;
