/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.clerk.dev" },
      { hostname: "jergiyffwtanmgxttiml.supabase.co" },
      { hostname: "res.cloudinary.com" },
    ],
  },
}

export default nextConfig
