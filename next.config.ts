import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "elingesmartgrids.cloud",
    "*.elingesmartgrids.cloud",
    "localhost:3000",
    "localhost:3005"
  ]
};

export default nextConfig;
