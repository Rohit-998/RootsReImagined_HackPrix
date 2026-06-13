'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Mic, Activity, Clock, Flag, BarChart2, BarChart3, User, LogOut } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { href: '/scan',        label: 'Scan QR',       icon: ShieldCheck },
  { href: '/voice',       label: 'Voice',          icon: Mic         },
  { href: '/demo',        label: 'Live Demo',      icon: Activity    },
  { href: '/pharmacies',  label: 'Pharmacies',     icon: BarChart2   },
  { href: '/history',     label: 'History',        icon: Clock       },
  { href: '/report',      label: '🚩 Report',      icon: Flag, accent: '#ef4444' },
  { href: '/admin',       label: '📊 Admin',       icon: BarChart3, accent: '#7c3aed' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth state on mount and when localStorage changes
    const checkAuth = () => {
      const storedUser = localStorage.getItem('mg_user');
      const storedToken = localStorage.getItem('mg_token');
      if (storedUser && storedToken) {
        try {
          setUser(JSON.parse(storedUser));
        } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    
    checkAuth();
    // Re-check periodically or on storage event
    window.addEventListener('storage', checkAuth);
    // Add interval to catch local changes in same tab
    const interval = setInterval(checkAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mg_token');
    localStorage.removeItem('mg_user');
    setUser(null);
    window.location.href = '/auth'; // Hard reload to clear state
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-brand">
          <ShieldCheck className="navbar-logo" size={24} />
          <span className="navbar-title">MediGuard</span>
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map(({ href, label, icon: Icon, accent }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="nav-link"
                style={{
                  color: active ? (accent || '#2563EB') : accent || undefined,
                  fontWeight: active || accent ? 700 : undefined,
                }}
              >
                {label}
              </Link>
            );
          })}

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{user.name.split(' ')[0]}</span>
              <button 
                onClick={handleLogout}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link
                href="/auth"
                className="nav-link"
                style={{
                  color: '#475569',
                  fontWeight: 600,
                  padding: '6px 10px',
                }}
              >
                Sign In
              </Link>
              <Link
                href="/auth?mode=signup"
                className="nav-link"
                style={{
                  color: '#fff',
                  background: '#2563EB',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontWeight: 600,
                }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
