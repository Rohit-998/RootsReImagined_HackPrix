'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Mic, Activity, Clock, Flag, BarChart2, BarChart3 } from 'lucide-react';
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
        </div>
      </div>
    </nav>
  );
}
