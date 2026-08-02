/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/uploads/:subDir/:file',
        destination: '/api/uploads/:subDir/:file',
      },
    ];
  },
};

module.exports = nextConfig;
