import React, { useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, Search, Filter, CreditCard, ArrowUpDown, ChevronRight } from 'lucide-react';

export default function CustomerRiskCRM({ customers, t }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('revenue');
  const [filterRisk, setFilterRisk] = useState('ALL');

  const formatTND = (val) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(val || 0);

  // Filter & sort logic
  let filtered = (customers || []).filter(c => {
    const q = search.toLowerCase();
    const matchesSearch = c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (filterRisk === 'HIGH') return c.credit_ratio >= 30;
    if (filterRisk === 'MEDIUM') return c.credit_ratio >= 10 && c.credit_ratio < 30;
    if (filterRisk === 'LOW') return c.credit_ratio < 10;
    return true;
  });

  if (sortBy === 'credit') {
    filtered.sort((a, b) => b.credit_ratio - a.credit_ratio);
  } else if (sortBy === 'quantity') {
    filtered.sort((a, b) => b.quantity - a.quantity);
  } else {
    filtered.sort((a, b) => b.revenue - a.revenue);
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Portefeuille Clients & Recouvrement</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Analyse CRM & Risque de Crédit</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Évaluation du risque d'encours, suivi du ratio des commandes à crédit vs comptant pour les 89 comptes clients.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-cyan-400">89</div>
            <div className="text-[10px] text-slate-400 uppercase">Comptes Clients</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-amber-400">20.9%</div>
            <div className="text-[10px] text-slate-400 uppercase">Exposition Crédit Global</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client (Nom ou Code Client)..."
            className="w-full bg-slate-900/80 text-xs text-slate-200 placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <button
              onClick={() => setFilterRisk('ALL')}
              className={`px-3 py-1 rounded-lg transition-all ${filterRisk === 'ALL' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Tous (89)
            </button>
            <button
              onClick={() => setFilterRisk('HIGH')}
              className={`px-3 py-1 rounded-lg transition-all ${filterRisk === 'HIGH' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Élevé (&gt;30% Crédit)
            </button>
            <button
              onClick={() => setFilterRisk('LOW')}
              className={`px-3 py-1 rounded-lg transition-all ${filterRisk === 'LOW' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Standard (&lt;10% Crédit)
            </button>
          </div>

          {/* Sort By Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="revenue" className="bg-slate-900">Trier par Chiffre d'Affaires</option>
              <option value="credit" className="bg-slate-900">Trier par Ratio Crédit %</option>
              <option value="quantity" className="bg-slate-900">Trier par Volume (Tonnes)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Cards & Data Table Grid */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Résultats Clients ({filtered.length})</h3>
          <span className="text-xs text-slate-400">Classé par {sortBy === 'revenue' ? "Chiffre d'Affaires" : sortBy === 'credit' ? 'Ratio Crédit' : 'Volume'}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Société / Client</th>
                <th className="pb-3 px-3">Code Client</th>
                <th className="pb-3 px-3">Région(s) d'Activité</th>
                <th className="pb-3 px-3 text-right">Volume (Tonnes)</th>
                <th className="pb-3 px-3 text-right">Chiffre d'Affaires (TND)</th>
                <th className="pb-3 px-3 text-center">Ratio Crédit (%)</th>
                <th className="pb-3 px-3 text-center">Évaluation Risque</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.slice(0, 25).map((c, idx) => {
                const isHighRisk = c.credit_ratio >= 30;
                const isMedRisk = c.credit_ratio >= 10 && c.credit_ratio < 30;
                return (
                  <tr key={c.name} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400 font-mono">
                          {idx + 1}
                        </span>
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">{c.code}</td>
                    <td className="py-3.5 px-3 text-slate-300">
                      {(c.governorates || []).slice(0, 2).join(', ')}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-cyan-400">{formatNumber(c.quantity)} T</td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400">{formatTND(c.revenue)}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-bold">
                      <span className={isHighRisk ? 'text-amber-400' : isMedRisk ? 'text-cyan-400' : 'text-emerald-400'}>
                        {c.credit_ratio}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {isHighRisk ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="w-3 h-3" /> Risque Élevé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" /> Risque Faible
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
