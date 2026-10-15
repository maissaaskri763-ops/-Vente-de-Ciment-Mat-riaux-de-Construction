import React from 'react';
import { LayoutDashboard, Package, Users, BrainCircuit, Table, Upload, Handshake } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, t, canUpload }) {
  const tabs = [
    { id: 'overview', label: t.tabOverview, icon: LayoutDashboard, badge: null },
    { id: 'products', label: t.tabProducts, icon: Package, badge: '7 ART' },
    { id: 'customers', label: t.tabCustomers, icon: Users, badge: '89 CLI' },
    { id: 'ai_forecast', label: t.tabAiForecast, icon: BrainCircuit, badge: 'ML' },
    { id: 'transactions', label: t.tabTransactions, icon: Table, badge: '48.8K' },
    { id: 'b2b', label: t.tabB2B || 'Plateforme B2B', icon: Handshake, badge: 'B2B' },
    ...(canUpload ? [{ id: 'upload', label: t.tabUpload, icon: Upload, badge: 'XLSX' }] : [])
  ];

  return (
    <aside className="w-full md:w-64 glass-card border-r-0 md:border-r border-slate-800/60 p-4 shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible">
      <div className="hidden md:block text-[11px] font-semibold tracking-wider text-slate-500 uppercase px-3 py-2">
        {t.navHeader}
      </div>

      <nav className="flex flex-row md:flex-col gap-1.5 w-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all w-full cursor-pointer whitespace-nowrap ${
                isActive
                  ? tab.id === 'b2b'
                    ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white border border-violet-500/40 shadow-lg shadow-violet-500/10 font-semibold'
                    : 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-white border border-cyan-500/40 shadow-lg shadow-cyan-500/10 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? (tab.id === 'b2b' ? 'text-violet-400' : 'text-cyan-400') : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </div>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 text-[9px] rounded-md font-mono ${
                  isActive
                    ? tab.id === 'b2b' ? 'bg-violet-500/20 text-violet-300' : 'bg-cyan-500/20 text-cyan-300'
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Presentation Metadata Widget */}
      <div className="hidden md:block mt-auto p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
        <div className="font-semibold text-slate-200 mb-1">🎯 Projet Académique</div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Analyse avancée de la performance commerciale (Cimenterie & Matériaux de Construction).
        </p>
        <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-cyan-400 font-mono flex items-center justify-between">
          <span>STACK: MERN</span>
          <span>4.5 ANS DATA</span>
        </div>
      </div>
    </aside>
  );
}
