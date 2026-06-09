import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Access dev server from another machine on your LAN (e.g. phone/tablet)
  allowedDevOrigins: ["192.168.0.133"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
