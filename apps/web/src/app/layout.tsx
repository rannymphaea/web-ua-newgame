import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Lora, Inter, Space_Grotesk } from 'next/font/google';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { NovelCursor } from '@/components/ui/NovelCursor';
import { THEME_SCRIPT } from '@/lib/theme-engine';
import { PostHogProvider } from '@/components/providers/PostHogProvider';

/*
 * Only load fonts needed globally (Inter + Lora).
 * Cormorant & Pinyon are heavy and only used on /landing —
 * they're loaded there via separate next/font imports.
 */
const lora = Lora({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  preload: true,
});
const inter = Inter({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});
const spaceGrotesk = Space_Grotesk({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: 'NEWGAME',
    template: '%s | NEWGAME',
  },
  description:
    'NEWGAME Unand — Platform komunitas game development. Absensi, leaderboard, tutorial, dan manajemen anggota.',
  keywords: ['newgame', 'unand', 'game development', 'community', 'attendance'],
  authors: [{ name: 'NEWGAME Dev Team' }],
  manifest: '/manifest.json',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NEWGAME',
  },
  openGraph: {
    title: 'NEWGAME',
    description: 'Platform komunitas game development Universitas Andalas',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,          // H3: allow pinch zoom up to 5x
  userScalable: true,       // H3: never block zoom (accessibility)
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#0D1117' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${lora.variable} ${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        {/* Anti-FOUC: set theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />

        {/* Preconnect ke CDN dan Firebase — percepat resolusi DNS */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" crossOrigin="anonymous" />
        {/* PostHog — analytics preconnect */}
        <link rel="preconnect" href="https://app.posthog.com" crossOrigin="anonymous" />

        {/* Remix Icon — preload agar browser mulai download lebih awal */}
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css"
        />
      </head>
      <body>
        <div className="accent-bar" />
        <NovelCursor />
        <Suspense fallback={null}>
          <PostHogProvider>
            <ToastProvider>{children}</ToastProvider>
          </PostHogProvider>
        </Suspense>
      </body>
    </html>
  );
}
