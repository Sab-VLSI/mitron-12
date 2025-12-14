/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Suppress development warnings for webpack HMR and error overlay
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Suppress webpack HMR update warnings
      config.optimization = {
        ...config.optimization,
        emitOnErrors: false,
      }
    }
    return config
  },
  // Reduce console noise in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
}

export default nextConfig
