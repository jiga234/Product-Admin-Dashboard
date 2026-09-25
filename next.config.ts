import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // output: "export",
  // basePath: isProd ? "/Product-Admin-Dashboard" : "",
  // trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.dummyjson.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "dummyjson.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
