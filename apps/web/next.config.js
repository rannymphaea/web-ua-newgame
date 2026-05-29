// DO NOT EDIT - Konfigurasi krusial Next.js. Kesalahan konfigurasi dapat merusak build.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Compress semua response
  compress: true,

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 3600,
  },

  // Optimize package imports — kurangi JS bundle size
  experimental: {
    optimizePackageImports: [
      'firebase',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'framer-motion',
      'recharts',
      'zustand',
    ],
  },

  // API proxy ke backend NestJS — hanya aktif di development (localhost)
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    if (!isDev) return [];
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },

  // Security headers + cache control
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control',     value: 'on' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/(.*)\\.png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
