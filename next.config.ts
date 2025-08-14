import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Your existing webpack config
  webpack: (config, {}) => {
    config.resolve.fallback = {
      fs: false,
      stream: false,
      os: false,
      path: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
