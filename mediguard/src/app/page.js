'use client';
import Link from 'next/link';
import { ShieldCheck, Mic, ArrowRight, Activity, Globe, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium text-sm mb-6 border border-blue-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Live Fake Medicine Detection
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
          Trust No One. <br /> Verify Everything.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          1 in 10 medicines in developing countries is fake. MediGuard uses a 6-layer verification engine and AI Voice to ensure your medicine is genuine.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/scan" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Scan QR Code
          </Link>
          <Link href="/voice" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold text-lg border border-slate-700 transition-all flex items-center gap-2">
            <Mic className="h-5 w-5 text-blue-400" />
            Voice Verify
            <ArrowRight className="h-5 w-5 ml-2 opacity-50" />
          </Link>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-6">
          <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 text-blue-400">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">6-Layer Engine</h3>
          <p className="text-slate-400">We don't just read the QR. We check crypto hashes, scan frequency, and supply chain integrity.</p>
        </div>
        <div className="glass-panel p-6">
          <div className="h-12 w-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 text-purple-400">
            <Mic className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">Sarvam AI Voice</h3>
          <p className="text-slate-400">Speak the medicine name in your local language. No app, no typing, no literacy required.</p>
        </div>
        <div className="glass-panel p-6">
          <div className="h-12 w-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4 text-emerald-400">
            <Globe className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">Consumer First</h3>
          <p className="text-slate-400">We bypass the pharmacy. You verify it directly using our open verification platform.</p>
        </div>
      </section>
    </div>
  );
}
