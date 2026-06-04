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
    if (!mounted) return;
    // Jika sudah resolve (tidak loading) → arahkan sesuai status user
    if (!loading) {
      router.replace(user ? '/dashboard' : '/landing');
      return;
    }
    // Jika Firebase masih loading → tunggu lebih lama (Android IndexedDB lambat)
    // Setelah 1500ms, jika masih tidak ada user → ke /landing
    const timer = setTimeout(() => {
      if (!user) router.replace('/landing');
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, loading, mounted, router]);

  // Minimal loading indicator — hanya tampil sebentar
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--clr-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--clr-text-secondary)', fontSize: 14, fontFamily: 'var(--font-inter)' }}>Memuat...</p>
      </div>
    </div>
  );
}
