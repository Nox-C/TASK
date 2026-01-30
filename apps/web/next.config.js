/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for proper client-side rendering
  reactStrictMode: true,
  
  // Use Turbopack config for Next.js 16
  turbopack: {
    rules: {
      // Add any custom rules here if needed
    },
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_WS_ENDPOINT: process.env.NEXT_PUBLIC_WS_ENDPOINT,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
};

module.exports = nextConfig;
