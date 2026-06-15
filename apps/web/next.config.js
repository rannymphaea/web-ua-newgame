// DO NOT EDIT - Konfigurasi krusial Next.js. Kesalahan konfigurasi dapat merusak build.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ESLint hanya dijalankan secara lokal, bukan saat Vercel build
  // Jalankan manual: cd apps/web && npx eslint src --ext .ts,.tsx
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript error tetap memblokir build (type safety terjaga)
  typescript: {
    ignoreBuildErrors: false,
  },


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
    const isDev = process.env.NODE_ENV === 'development';
    return [
      {
        source: '/(.*)',
        headers: [
          // Clickjacking protection
          { key: 'X-Frame-Options',                       value: 'DENY' },
          // MIME sniffing protection
          { key: 'X-Content-Type-Options',                value: 'nosniff' },
          // Referrer — jangan bocorkan URL internal ke pihak lain
          { key: 'Referrer-Policy',                       value: 'strict-origin-when-cross-origin' },
          // DNS prefetch tetap aktif untuk performa
          { key: 'X-DNS-Prefetch-Control',                value: 'on' },
          // Batasi akses ke sensor / API device
          { key: 'Permissions-Policy',                    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()' },
          // Adobe/Flash cross-domain policy
          { key: 'X-Permitted-Cross-Domain-Policies',     value: 'none' },
          // HSTS — paksa HTTPS, 1 tahun, termasuk subdomain
          ...(!isDev ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }] : []),
          // Cross-Origin Resource Policy — hanya sumber sendiri yang boleh embed resource
          { key: 'Cross-Origin-Resource-Policy',          value: 'same-origin' },
          // Cross-Origin Opener Policy — isolasi tab agar tidak bisa diakses window.opener
          { key: 'Cross-Origin-Opener-Policy',            value: 'same-origin' },
          // Content Security Policy
          { key: 'Content-Security-Policy', value: [
            "default-src 'self'",
            // Script: hanya dari origin sendiri + Firebase + PostHog
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.firebase.com https://app.posthog.com https://cdn.jsdelivr.net",
            // Style: self + inline (dibutuhkan Next.js)
            "style-src 'self' 'unsafe-inline'",
            // Font: self + Google Fonts (jika dipakai)
            "font-src 'self' data:",
            // Image: self + CDN yang dipakai
            "img-src 'self' data: blob: https://storage.googleapis.com https://firebasestorage.googleapis.com https://res.cloudinary.com https://img.youtube.com",
            // Media: self + Cloudinary
            "media-src 'self' blob: https://res.cloudinary.com",
            // Connect: API + Firebase + PostHog + WebSocket
            "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firebasestorage.googleapis.com wss://*.firebaseio.com https://app.posthog.com https://unandnewgame-tan.vercel.app https://api.unandnewgame.vercel.app",
            // Frame: YouTube embed
            "frame-src https://www.youtube.com https://youtube.com",
            // Object: tidak ada Flash/plugin
            "object-src 'none'",
            // Base URI: hanya self
            "base-uri 'self'",
            // Form action: hanya self
            "form-action 'self'",
            // Upgrade insecure requests ke HTTPS
            ...(isDev ? [] : ["upgrade-insecure-requests"]),
          ].join('; ') },
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
