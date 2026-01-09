/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@task/ui', '@task/shared'],
  experimental: {
    externalDir: true,
  },
}

module.exports = nextConfig
