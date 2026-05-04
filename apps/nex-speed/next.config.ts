import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@nexone/ui"],
  async rewrites() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8108/api';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${API_URL}/v1/:path*`,
      },
      {
        source: '/ws/:path*',
        destination: `${API_URL}/ws/:path*`,
      },
    ];
  },
};

export default nextConfig;
