'use client';
// Auth guard + layout utama dashboard. Route group: (dashboard)
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import IdleSessionManager from '@/components/ui/IdleSessionManager';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { init, loading, user } = useAuthStore();
  const router = useRouter();
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    // Clear any pending redirect when auth state changes
    if (redirectTimer.current) clearTimeout(redirectTimer.current);

    if (!loading && user) {
      // Authenticated — remove any stale login flag
      try { sessionStorage.removeItem('ng-just-logged-in'); } catch {}
      return;
    }

    if (!loading && !user) {
      // Check if user just completed login (Firebase may still be resolving session)
      const justLoggedIn = (() => {
        try { return !!sessionStorage.getItem('ng-just-logged-in'); } catch { return false; }
      })();

      const delay = justLoggedIn ? 2500 : 1200;

      redirectTimer.current = setTimeout(() => {
        const stillNoUser = !useAuthStore.getState().user;
        if (stillNoUser) {
          try { sessionStorage.removeItem('ng-just-logged-in'); } catch {}
          // Redirect to /login (not /landing) so users know to sign in
          router.replace('/login');
        }
      }, delay);
    }

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [loading, user, router]);

  // While redirecting — show minimal spinner instead of blank screen
  if (!loading && !user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--clr-bg)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--clr-text-secondary)', fontSize: 14, fontFamily: 'var(--font-inter)' }}>
            Memuat sesi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 'var(--accent-bar-height)', background: 'var(--clr-bg)' }}>
      {/* Idle session auto-logout: 30min inactive → 2min warning → logout */}
      <IdleSessionManager />
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <TopBar />
        <main style={{ flex: 1, padding: 'var(--space-xl) var(--space-lg)', overflowY: 'auto', position: 'relative' }}>
          {/* Background orbs */}
          <div className="bg-orbs">
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div className="bg-orb bg-orb-3" />
          </div>
          {/* Paper dot pattern */}
          <div style={{
            position: 'fixed', inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--clr-border) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none', zIndex: 0,
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {loading && !user ? <DashboardSkeleton /> : children}
          </div>
        </main>
      </div>
    </div>
  );
}

/** Lightweight skeleton shown only during Firebase cold start */
function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="skeleton" style={{ height: 190, borderRadius: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 88, borderRadius: 16 }} />)}
      </div>
      <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
    </div>
  );
}
