import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Lora, Inter, Space_Grotesk } from 'next/font/google';
import 'remixicon/fonts/remixicon.css';
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://unandnewgame-tan.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NEWGAME — UKM Game Development Unand',
    template: '%s | NEWGAME Unand',
  },
  description:
    'NEWGAME UKM Game Development Universitas Andalas — Platform komunitas gamedev dengan absensi QR, leaderboard XP, tutorial, berita, dan manajemen anggota.',
  keywords: [
    'NEWGAME', 'UKM Game Development', 'Universitas Andalas', 'Unand',
    'game development', 'gamedev', 'komunitas game', 'absensi QR', 'leaderboard',
    'coding', 'Unity', 'Godot', 'game design', 'Padang',
  ],
  authors: [{ name: 'NEWGAME Dev Team', url: SITE_URL }],
  creator: 'NEWGAME UKM Game Development',
  publisher: 'Universitas Andalas',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'NEWGAME',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'NEWGAME Unand',
    title: 'NEWGAME — UKM Game Development Universitas Andalas',
    description: 'Platform komunitas gamedev dengan absensi QR, leaderboard XP, tutorial game design & programming.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'NEWGAME UKM Game Development Unand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEWGAME — UKM Game Development Unand',
    description: 'Platform absensi, leaderboard, dan tutorial gamedev UKM Universitas Andalas.',
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  category: 'education',
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

        {/* Preconnect ke Firebase — percepat resolusi DNS */}
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://securetoken.googleapis.com" crossOrigin="anonymous" />
        {/* PostHog — analytics preconnect */}
        <link rel="preconnect" href="https://app.posthog.com" crossOrigin="anonymous" />

        {/* Remix Icon loaded locally from npm — no CDN tracking */}
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
