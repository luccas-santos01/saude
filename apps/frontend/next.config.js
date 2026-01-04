/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // basePath for production deployment under /saude
  basePath: process.env.NODE_ENV === 'production' ? '/saude' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/saude' : '',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.luccasdev.com.br',
        pathname: '/saude/api/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
