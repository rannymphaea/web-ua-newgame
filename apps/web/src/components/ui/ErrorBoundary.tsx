'use client';
/**
 * ErrorBoundary — React error boundary untuk NEWGAME
 * Tangkap error rendering tanpa crash seluruh halaman.
 * 
 * Penggunaan:
 *   <ErrorBoundary fallback={<p>Error!</p>}>
 *     <ComponentYangBisaError />
 *   </ErrorBoundary>
 */
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Kirim ke monitoring (PostHog / Sentry) jika tersedia
    if (typeof window !== 'undefined') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { posthog } = require('@/lib/posthog');
        posthog.captureException?.(error, { extra: info });
      } catch { /* posthog opsional */ }
    }
    this.props.onError?.(error, info);
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={{
          padding: '32px 24px',
          textAlign: 'center',
          fontFamily: 'var(--font-inter)',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <h3 style={{
            fontSize: 16, fontWeight: 700,
            color: 'var(--novel-ink)', marginBottom: 8,
          }}>
            Terjadi kesalahan rendering
          </h3>
          <p style={{ fontSize: 13, color: 'var(--novel-cloud)', marginBottom: 20 }}>
            {this.state.error?.message ?? 'Unknown error'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: 'var(--clr-gold)', color: '#1a0a00',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Coba lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
