/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.VERCEL === "1" ? ".next" : ".next-fctt",
  serverExternalPackages: ["googleapis"],
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
