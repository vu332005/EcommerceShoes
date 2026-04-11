import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // Cho phép ảnh từ Cloudinary
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com", // Cho phép ảnh avatar Facebook
      },
      {
        protocol: "https",
        hostname: "api.dicebear.com", // Cho phép ảnh avatar mặc định (nếu có dùng)
      },
    ],
  },
};

export default nextConfig;
