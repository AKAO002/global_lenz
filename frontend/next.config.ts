import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // /api/ から始まるリクエストを
        source: '/api/:path*',
        // FastAPI（ポート8000）の方へ転送する
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
