import React from 'react';
import { MapPin, Building, Weight, DollarSign, TrendingUp, Compass, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GeographicAnalytics({ governorates, t }) {
  const formatTND = (val) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(val || 0);

  const colors = ['#06b6d4', '#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Répartition Géographique Nationale (Tunisie)</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Analyse des Ventes par Gouvernorat</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Couverture commerciale sur 15 gouvernorats tunisiens avec une concentration majeure dans la région du Centre-Ouest et du Nord-Ouest.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-cyan-400">15</div>
            <div className="text-[10px] text-slate-400 uppercase">Gouvernorats</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-emerald-400">74.56M</div>
            <div className="text-[10px] text-slate-400 uppercase">Top Reg: SIDI BOUZID</div>
          </div>
        </div>
      </div>

      {/* Top 3 Governorates Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(governorates || []).slice(0, 3).map((g, idx) => (
          <div key={g.name} className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold border border-cyan-500/20">
                #{idx + 1} Gouvernorat
              </span>
              <MapPin className="w-5 h-5 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mt-3">{g.name}</h3>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Chiffre d'Affaires:</span>
                <strong className="text-emerald-400 font-bold">{formatTND(g.revenue)}</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Volume Livré:</span>
                <strong className="text-cyan-400 font-semibold">{formatNumber(g.quantity)} Tonnes</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Portefeuille Clients:</span>
                <strong className="text-slate-200">{g.unique_customers ?? 0} Sociétés</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart comparing all Governorates */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Classement Complet des 15 Gouvernorats par Chiffre d'Affaires
        </h3>
        <p className="text-xs text-slate-400 mb-6">Comparatif global en Dinars Tunisiens (TND)</p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={governorates || []} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={10} angle={-35} textAnchor="end" interval={0} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(val) => formatTND(val)}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {(governorates || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Governorate Table Data Grid */}
      <div className="glass-card p-6 rounded-2xl overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4">Tableau Récapitulatif par Région</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Gouvernorat</th>
                <th className="pb-3 px-3">Code Région</th>
                <th className="pb-3 px-3 text-right">Chiffre d'Affaires (TND)</th>
                <th className="pb-3 px-3 text-right">Volume (Tonnes)</th>
                <th className="pb-3 px-3 text-center">Nombre de Commandes</th>
                <th className="pb-3 px-3 text-center">Nombre de Clients</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {(governorates || []).map((g, idx) => (
                <tr key={g.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-semibold text-white flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-cyan-400 font-mono">
                      {idx + 1}
                    </span>
                    {g.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400">{g.code || `0${idx+1}`}</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">{formatTND(g.revenue)}</td>
                  <td className="py-3 px-3 text-right font-mono text-cyan-400">{formatNumber(g.quantity)} T</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-300">{formatNumber(g.orders)}</td>
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{g.unique_customers ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
