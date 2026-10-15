import React from 'react';
import { Building2, Globe, Sparkles, Database, FileSpreadsheet, Layers, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Navbar({ lang, setLang, dbStatus, onOpenUpload, user, onLogout, t }) {
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <header className="sticky top-0 z-40 glass-nav px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Building2 className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Cimenterie Executive</h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              MERN Stack v1.0
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Center Metrics & DB Badge */}
      <div className="hidden md:flex items-center gap-3 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-lg text-xs font-medium text-slate-300">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>Engine: <strong className="text-emerald-400 font-semibold">{dbStatus || 'MongoDB'}</strong></span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/80 rounded-lg text-xs font-medium text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Devise: <strong className="text-cyan-400 font-semibold">TND (Dinar)</strong></span>
        </div>
        <div className="px-3 py-1 text-xs text-slate-400 font-medium">
          48,804 Transactions
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Upload Excel Button */}
        {(user?.role === 'admin' || user?.role === 'manager') && <button
          onClick={onOpenUpload}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span className="hidden sm:inline">{t.uploadBtn}</span>
        </button>}

        {/* Presentation celebration confetti */}
        <button
          onClick={triggerConfetti}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          title="Animation de Présentation / Professeur"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">{t.celebrateBtn}</span>
        </button>

        <button
          onClick={onLogout}
          title={`Sign out ${user?.displayName || ''}`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-xs font-medium text-slate-200 border border-slate-700/50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-300" />
          <span className="hidden lg:inline">{user?.displayName || 'Sign out'}</span>
        </button>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'FR' ? 'EN' : 'FR')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-medium text-slate-200 border border-slate-700/50 transition-all cursor-pointer"
        >
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'FR' ? '🇫🇷 FR' : '🇬🇧 EN'}</span>
        </button>
      </div>
    </header>
  );
}
