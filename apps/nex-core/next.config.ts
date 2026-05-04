import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Proxy all /api/* requests to the backend NexCore API
        source: '/api/:path*',
        destination: 'http://localhost:8101/api/:path*',
      },
    ];
  },
};

export default nextConfig;
