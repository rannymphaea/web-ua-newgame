// DO NOT EDIT - Konfigurasi krusial Next.js. Kesalahan konfigurasi dapat merusak build.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Turbopack di dev mode (lebih cepat HMR)
  // Aktifkan dengan: next dev --turbo

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
    // Allow SVG images — needed for the vector OC and logo assets
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // H6: proper device/image size hints for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Optimize package imports — kurangi JS bundle size
  experimental: {
    optimizePackageImports: [
      'framer-motion',
      'recharts',
      'zustand',
      'posthog-js',
    ],
    // ISR fallback caching
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // API proxy ke backend NestJS — aktif di dev DAN production
  // Dev: proxy ke localhost:3001
  // Production: proxy ke api.unandnewgame.vercel.app
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
      || (isDev ? 'http://localhost:3001/api' : 'https://api.unandnewgame.vercel.app/api');
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
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
      {
        // H6 FIX: correct regex grouping — was broken (| precedence bug)
        // BEFORE: '/(.*)\\.png|jpg|jpeg...' → only .png matched prefix (.*)
        // AFTER:  '/:path*\\.(ext1|ext2|...)' → all extensions match correctly
        source: '/:path*\\.(png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // H6: video files need range request support + shorter cache
        source: '/:path*\\.(mp4|webm|ogg)',
        headers: [
          { key: 'Cache-Control',  value: 'public, max-age=86400' },
          { key: 'Accept-Ranges',  value: 'bytes' },
        ],
      },
      {
        // Audio files
        source: '/:path*\\.(mp3|wav|ogg)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
