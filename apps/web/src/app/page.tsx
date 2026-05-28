'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export default function RootPage() {
  const router = useRouter();
  const { init, loading, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); init(); }, [init]);

  useEffect(() => {
    if (mounted && !loading) {
      router.replace(user ? '/dashboard' : '/landing');
    }
  }, [user, loading, mounted, router]);

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--clr-text-secondary)', fontSize: 14, fontFamily: 'var(--font-inter)' }}>Memuat...</p>
        </div>
      </div>
    );
  }

  return null;
}
