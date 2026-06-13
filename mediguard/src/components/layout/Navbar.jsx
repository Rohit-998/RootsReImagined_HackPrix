'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, QrCode, Flag, BarChart2, Activity } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { href: '/scan',        label: 'Scan Medicine',  icon: QrCode       },
  { href: '/report',      label: 'Report',          icon: Flag         },
  { href: '/pharmacies',  label: 'Pharmacies',      icon: BarChart2    },
  { href: '/demo',        label: 'How It Works',    icon: Activity     },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-brand">
          <ShieldCheck size={22} />
          <span className="navbar-title">MediGuard</span>
        </Link>

        <div className="navbar-links">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link${active ? ' nav-link-active' : ''}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
