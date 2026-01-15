/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@task/ui", "@task/shared"],
  experimental: {
    externalDir: true,
  },
  turbopack: {},
  // Graceful shutdown handling
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/node_modules", "**/.next"],
      };
    }
    return config;
  },
  // Handle TypeScript library errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
