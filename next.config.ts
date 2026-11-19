import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Match the documented local URL so the dev HMR connection can stay open.
  allowedDevOrigins: ["127.0.0.1"],
  // Project instructions are written separately after their content is approved.
  agentRules: false,
};

export default nextConfig;
