import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Config options here
  webpack: (config, {}) => {
    config.resolve.fallback = {
      fs: false,
      stream: false,
      os: false,
      path: false,
      encoding: false,
    };
    return config; // ✅ return placed inside the function
  },
};

export default nextConfig;
