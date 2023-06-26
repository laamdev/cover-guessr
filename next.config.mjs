/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "images.clerk.dev" },
      { hostname: "res.cloudinary.com" },
    ],
  },
}

export default nextConfig
