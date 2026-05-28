import './landing.css';
import { LenisProvider } from './components/LenisProvider';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <LenisProvider>
      {children}
    </LenisProvider>
  );
}
