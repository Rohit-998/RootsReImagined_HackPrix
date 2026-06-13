'use client';

import Link from 'next/link';
import { ShieldCheck, Mic } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-brand">
          <ShieldCheck className="navbar-logo" size={24} />
          <span className="navbar-title">MediGuard</span>
        </Link>
        
        <div className="navbar-links">
          <Link href="/scan" className="nav-link">Scan QR</Link>
          <Link href="/voice" className="nav-link">Voice Verify</Link>
          <Link href="/demo" className="nav-link">Live Demo</Link>
          <Link href="/report" style={{ color: '#ef4444', fontWeight: 600 }} className="nav-link">🚩 Report</Link>
        </div>
      </div>
    </nav>
  );
}
