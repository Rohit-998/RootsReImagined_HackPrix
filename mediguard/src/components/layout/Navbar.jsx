'use client';

import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
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
          <Link href="/scan" className="nav-link">Verify</Link>
          <Link href="/demo" className="nav-link">Live Demo</Link>
        </div>
      </div>
    </nav>
  );
}
