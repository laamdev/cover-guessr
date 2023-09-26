/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [{ hostname: "jergiyffwtanmgxttiml.supabase.co" }],
  },
}

export default nextConfig
