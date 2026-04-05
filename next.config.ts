import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel'de serverless function timeout
  serverExternalPackages: ["bcryptjs"],

  // Görsel optimizasyonu
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
