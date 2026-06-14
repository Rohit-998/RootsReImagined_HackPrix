'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { QrCode, Flag, BarChart2, Activity, X, Menu, LogIn, LogOut } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { href: '/scan',        label: 'Scan Medicine',  icon: QrCode    },
  { href: '/report',      label: 'Report',          icon: Flag      },
  { href: '/pharmacies',  label: 'Pharmacies',      icon: BarChart2 },
  { href: '/demo',        label: 'How It Works',    icon: Activity  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth state check
  useEffect(() => {
    const checkAuth = () => {
      const storedUser = localStorage.getItem('mg_user');
      const storedToken = localStorage.getItem('mg_token');
      if (storedUser && storedToken) {
        try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    const interval = setInterval(checkAuth, 1000);
    return () => { window.removeEventListener('storage', checkAuth); clearInterval(interval); };
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem('mg_token');
    localStorage.removeItem('mg_user');
    setUser(null);
    setMenuOpen(false);
    window.location.href = '/login';
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Left: Brand */}
          <Link href="/" className="navbar-brand">
            <Image src="/logo.svg" alt="MediGuard Logo" width={40} height={40} priority className="navbar-logo" />
            <span className="navbar-title">MediGuard</span>
          </Link>

          {/* Center: Navigation Links (desktop) */}
          <div className="navbar-links">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link${active ? ' nav-link-active' : ''}`}
                >
                  <Icon size={20} className="nav-icon" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right: CTA + Burger */}
          <div className="navbar-actions">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user.name?.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                  title="Log Out"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="navbar-cta-neutral">
                Login / Sign Up
              </Link>
            )}
            <button
              className="navbar-burger"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-overlay ${menuOpen ? 'mobile-overlay-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${menuOpen ? 'mobile-drawer-open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="mobile-drawer-header">
          <Link href="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
            <Image src="/logo.svg" alt="MediGuard Logo" width={34} height={34} />
            <span className="navbar-title">MediGuard</span>
          </Link>
          <button className="mobile-close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-nav">
          {NAV_LINKS.map(({ href, label, icon: Icon }, i) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`mobile-nav-link ${active ? 'mobile-nav-link-active' : ''}`}
                style={{ animationDelay: `${i * 60}ms` }}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={22} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mobile-drawer-cta">
          {user ? (
            <button onClick={handleLogout} className="mobile-cta-btn" style={{ background: 'var(--color-danger)', border: 'none', cursor: 'pointer', color: 'white', width: '100%' }}>
              <LogOut size={20} />
              Log Out ({user.name?.split(' ')[0]})
            </button>
          ) : (
            <Link href="/login" className="mobile-cta-btn" onClick={() => setMenuOpen(false)}>
              <LogIn size={20} />
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
