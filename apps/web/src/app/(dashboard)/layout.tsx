'use client';
// Auth guard + layout utama dashboard. Route group: (dashboard)
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { init, loading, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => { init(); }, [init]);

  // Redirect to landing (not login) after Firebase has resolved — consistent with root page.tsx
  // On Android, Firebase cache may be empty → always resolve to /landing first
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/landing');
    }
  }, [loading, user, router]);

  // Show layout skeleton immediately — never blank screen
  // If user is null but still loading, show layout shell (Firebase is still resolving)
  if (!loading && !user) {
    // Already redirecting — show nothing to prevent flash
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 'var(--accent-bar-height)', background: 'var(--clr-bg)' }}>
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
            {/* Show skeleton while loading, children when ready */}
            {loading && !user
              ? <DashboardSkeleton />
              : children
            }
          </div>
        </main>
      </div>
    </div>
  );
}

/** Lightweight skeleton shown only during first Firebase cold start */
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
