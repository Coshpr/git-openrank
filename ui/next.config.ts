import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // 配置允许的开发环境源地址，消除跨源请求警告
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.199.117:3000'],

  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    // 禁用图像优化以解决私有IP问题
    unoptimized: true,
  },

  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/trend/lang',
        destination: 'https://trend.doforce.dpdns.org/lang',
      },
      {
        source: '/api/trend/repo',
        destination: 'https://trend.doforce.dpdns.org/repo',
      },
    ];
  },
};

export default nextConfig;
