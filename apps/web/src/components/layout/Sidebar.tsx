'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';

const NAV_ITEMS = [
  { href: '/dashboard',       label: 'Dashboard',        icon: 'ri-dashboard-3-line',    roles: ['member', 'admin', 'superadmin'] },
  { href: '/scan',            label: 'Scan QR',          icon: 'ri-qr-code-line',        roles: ['member', 'admin', 'superadmin'] },
  { href: '/news',            label: 'Berita & Tutorial', icon: 'ri-newspaper-line',     roles: ['member', 'admin', 'superadmin'] },
  { href: '/leaderboard',     label: 'Leaderboard',      icon: 'ri-trophy-line',         roles: ['member', 'admin', 'superadmin'] },
  { href: '/badges',          label: 'Badges',           icon: 'ri-medal-line',          roles: ['member', 'admin', 'superadmin'] },
  { href: '/calendar',        label: 'Kalender',         icon: 'ri-calendar-event-line', roles: ['member', 'admin', 'superadmin'] },
  { href: '/profile',         label: 'Profil',           icon: 'ri-user-3-line',         roles: ['member', 'admin', 'superadmin'] },
  { href: '/admin',           label: 'Admin Panel',      icon: 'ri-shield-star-line',    roles: ['admin', 'superadmin'] },
  { href: '/admin/analytics', label: 'Analytics',        icon: 'ri-bar-chart-2-line',    roles: ['admin', 'superadmin'] },
  { href: '/members',         label: 'Members',          icon: 'ri-team-line',           roles: ['admin', 'superadmin'] },
  { href: '/logs',            label: 'System Logs',      icon: 'ri-file-list-3-line',    roles: ['admin', 'superadmin'] },
];

const SECTION_DIVIDERS: Record<string, string> = {
  '/admin': 'Admin Zone',
};

export function Sidebar() {
  const pathname = usePathname();
  const { userData, logout } = useAuthStore();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted,    setMounted]    = useState(false);
  const userRole = userData?.role || 'member';
  const filteredItems = NAV_ITEMS.filter(item => item.roles.includes(userRole));

  useEffect(() => { setMounted(true); }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle menu"
        aria-expanded={mobileOpen}
      >
        <i className={mobileOpen ? 'ri-close-line' : 'ri-menu-3-line'} style={{ fontSize: 22 }} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}>
        {/* Gold accent strip */}
        <div className="sidebar-accent-strip" />

        {/* Logo */}
        <div
          className="sidebar-logo"
          onClick={() => collapsed && setCollapsed(false)}
          style={{ cursor: collapsed ? 'pointer' : 'default' }}
          title={collapsed ? 'Perluas Menu' : ''}
        >
          {!collapsed ? (
            <>
              <div className="logo-img-wrap">
                <img src="/logo.svg" alt="NEWGAME" className="sidebar-logo-img" />
              </div>
              <div className="sidebar-logo-text">
                <h1>NEWGAME</h1>
                <span>Learn · Create · Play</span>
              </div>
              <button
                className="collapse-btn hide-mobile"
                onClick={e => { e.stopPropagation(); setCollapsed(true); }}
                aria-label="Collapse sidebar"
              >
                <i className="ri-arrow-left-s-line" style={{ fontSize: 18 }} />
              </button>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <button
                className="collapse-btn-expand hide-mobile"
                onClick={e => { e.stopPropagation(); setCollapsed(false); }}
                aria-label="Expand sidebar"
              >
                <i className="ri-menu-unfold-line" style={{ fontSize: 20 }} />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {filteredItems.map((item, idx) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const showDivider = SECTION_DIVIDERS[item.href];
            return (
              <div key={item.href}>
                {showDivider && !collapsed && (
                  <div className="nav-divider">
                    <span>{showDivider}</span>
                  </div>
                )}
                <Link
                  href={item.href}
                  className={`nav-item nav-stagger${isActive ? ' active' : ''}`}
                  style={{ animationDelay: `${idx * 55}ms` }}
                  title={collapsed ? item.label : undefined}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-icon">
                    <i className={item.icon} style={{ fontSize: 19 }} />
                  </span>
                  {!collapsed && <span className="nav-label">{item.label}</span>}
                  {isActive && <span className="nav-indicator" aria-hidden="true" />}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        {userData && (
          <div className="sidebar-footer">
            {!collapsed ? (
              <div className="sidebar-user">
                {userData.photoURL ? (
                  <img src={userData.photoURL} alt="" className="user-avatar-img" />
                ) : (
                  <div className="user-avatar" aria-hidden="true">
                    {(userData.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="user-info">
                  <p className="user-name">
                    {userData.name && !userData.name.includes('@')
                      ? userData.name
                      : (userData.username || (userData.email ? userData.email.split('@')[0] : 'User'))}
                  </p>
                  {userData.username && userData.name && !userData.name.includes('@') && (
                    <p className="user-realname">{userData.name}</p>
                  )}
                  <p className="user-role">
                    <i className="ri-shield-check-line" style={{ fontSize: 10, marginRight: 3 }} />
                    {userData.role}
                  </p>
                </div>
                <button className="user-logout-btn" onClick={logout} aria-label="Logout" title="Logout">
                  <i className="ri-logout-box-r-line" style={{ fontSize: 16 }} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }} aria-hidden="true">
                  {(userData.name || 'U').charAt(0).toUpperCase()}
                </div>
                <button className="user-logout-btn" onClick={logout} aria-label="Logout" title="Logout">
                  <i className="ri-logout-box-r-line" style={{ fontSize: 15 }} />
                </button>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
