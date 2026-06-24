import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for a small
  // production Docker image when self-hosting on Azure Container Apps.
  output: "standalone",
};

export default nextConfig;
