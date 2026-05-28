'use client';
import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding:40,textAlign:'center'}}>
          <div style={{width:56,height:56,margin:'0 auto 16px',borderRadius:'50%',background:'var(--clr-danger-bg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--clr-danger)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h3 style={{fontSize:18,fontWeight:600,marginBottom:8,color:'var(--clr-text-primary)'}}>Terjadi Kesalahan</h3>
          <p style={{fontSize:13,color:'var(--clr-text-secondary)',marginBottom:20}}>{this.state.error?.message || 'Halaman gagal dimuat'}</p>
          <button onClick={() => this.setState({ hasError: false })} className="btn-depth" style={{padding:'10px 24px',background:'var(--clr-danger)',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:600}}>Coba Lagi</button>
        </div>
      );
    }
    return this.props.children;
  }
}
