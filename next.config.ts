import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",
    localPatterns: [
      {
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
