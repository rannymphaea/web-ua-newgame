/**
 * PostHog Analytics — NEWGAME
 * Lazy-loaded, opt-out safe, tidak berjalan di SSR.
 * 
 * Setup:
 *   npm install posthog-js
 *   Tambah ke .env.local:
 *     NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
 *     NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
 */

import posthog from 'posthog-js';

let _initialized = false;

/** Inisialisasi PostHog — panggil sekali dari provider */
export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (_initialized) return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    person_profiles: 'identified_only',       // hemat biaya, hanya identified users
    capture_pageview: false,                  // manual via usePathname
    capture_pageleave: true,
    autocapture: false,                       // disable autocapture, pakai manual events
    disable_session_recording: true,          // privacy: no session recording by default
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') {
        ph.opt_out_capturing();               // jangan capture di dev mode
      }
    },
  });

  _initialized = true;
}

/** Capture pageview — panggil di useEffect saat pathname berubah */
export function capturePageview(pathname: string, properties?: Record<string, unknown>) {
  if (!_initialized) return;
  posthog.capture('$pageview', { $current_url: pathname, ...properties });
}

/** Identify user setelah login */
export function identifyUser(userId: string, traits?: {
  email?: string;
  name?: string;
  role?: string;
  nim?: string;
}) {
  if (!_initialized) return;
  posthog.identify(userId, traits);
}

/** Reset user setelah logout */
export function resetUser() {
  if (!_initialized) return;
  posthog.reset();
}

/* ── Pre-defined event helpers ─────────────────────────────── */

export const track = {
  /** Landing page — CTA diklik */
  ctaClicked: (cta: 'join' | 'video' | 'guidebook' | 'custom', label?: string) =>
    posthog.capture('cta_clicked', { cta, label }),

  /** Video modal dibuka */
  videoPlayed: (title: string) =>
    posthog.capture('video_played', { title }),

  /** Quest card dihover */
  questViewed: (questId: string, questTitle: string) =>
    posthog.capture('quest_viewed', { quest_id: questId, title: questTitle }),

  /** Login sukses */
  loginSuccess: (method: 'google' | 'email', role: string) =>
    posthog.capture('login_success', { method, role }),

  /** Halaman dashboard dikunjungi */
  dashboardSection: (section: string) =>
    posthog.capture('dashboard_section_viewed', { section }),

  /** Leaderboard dibuka */
  leaderboardViewed: () =>
    posthog.capture('leaderboard_viewed'),

  /** News article dibaca */
  newsRead: (articleId: string, title: string) =>
    posthog.capture('news_article_read', { article_id: articleId, title }),

  /** Absensi dilakukan */
  attendanceSubmitted: (eventId: string) =>
    posthog.capture('attendance_submitted', { event_id: eventId }),
};

export { posthog };
