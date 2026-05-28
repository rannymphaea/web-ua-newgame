'use client';
import { useTheme } from '@/lib/theme-engine';

export const ToggleDarkMode: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      aria-pressed={isDark}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <i className={isDark ? 'ri-sun-line' : 'ri-moon-line'} style={{ fontSize: 17 }} />
    </button>
  );
};

export default ToggleDarkMode;
