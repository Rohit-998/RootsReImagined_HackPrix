'use client';
import Link from 'next/link';
import { ShieldCheck, Mic, Home, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white tracking-tight">MediGuard</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link href="/scan" className="text-slate-300 hover:text-white flex items-center gap-2 transition-colors">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Scan QR</span>
            </Link>
            <Link href="/voice" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-medium transition-colors">
              <Mic className="h-4 w-4" />
              <span className="hidden sm:inline">Voice Verify</span>
            </Link>
            <Link href="/test" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 font-medium transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Test API</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
