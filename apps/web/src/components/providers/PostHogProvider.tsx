'use client';
/**
 * PostHog Provider — NEWGAME
 * Wrap app dengan ini di layout.tsx untuk auto-pageview tracking.
 * Hanya aktif di production (NEXT_PUBLIC_POSTHOG_KEY harus ada).
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, capturePageview } from '@/lib/posthog';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // Init once on mount
  useEffect(() => {
    if (!initialized.current) {
      initPostHog();
      initialized.current = true;
    }
  }, []);

  // Track pageviews on route change
  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    capturePageview(url);
  }, [pathname, searchParams]);

  return <>{children}</>;
}
