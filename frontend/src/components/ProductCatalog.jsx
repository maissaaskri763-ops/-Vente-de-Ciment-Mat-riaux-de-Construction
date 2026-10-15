import React from 'react';
import { Package, Tag, DollarSign, Weight, Layers, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function ProductCatalog({ products, t }) {
  const formatTND = (val) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(val || 0);

  const colors = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

  const pieData = (products || []).map((p, idx) => ({
    name: p.name,
    value: p.revenue,
    color: colors[idx % colors.length]
  }));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Gamme Produits Cimenterie</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Catalogue des Produits & Tarification</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Analyse détaillée des 7 références de ciment et clinker, volumes livrés et prix moyens unitaires à la tonne.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-cyan-400">7</div>
            <div className="text-[10px] text-slate-400 uppercase">Références Art.</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-emerald-400">262.26 TND</div>
            <div className="text-[10px] text-slate-400 uppercase">Prix Max / Tonne</div>
          </div>
        </div>
      </div>

      {/* Grid: Donut Market Share & Product Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Market Share Donut Chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Part de Marché par Produit
            </h3>
            <p className="text-xs text-slate-400 mb-4">Proportion du chiffre d'affaires total généré</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => formatTND(val)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {pieData.slice(0, 3).map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  {p.name}
                </span>
                <span className="font-semibold text-white">{formatTND(p.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Product List */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-4">Détails des Produits & Prix Moyen à la Tonne</h3>
          <div className="space-y-3">
            {(products || []).map((p, idx) => {
              const unitPrice = p.quantity > 0 ? p.revenue / p.quantity : 0;
              return (
                <div key={p.name} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      0{idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        {p.name}
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Code Produit: {p.code || 'N/A'} • {formatNumber(p.orders)} Livraisons
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <div className="text-slate-400">Volume Livré</div>
                      <div className="font-bold text-white font-mono">{formatNumber(p.quantity)} T</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Chiffre d'Affaires</div>
                      <div className="font-bold text-emerald-400">{formatTND(p.revenue)}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-center">
                      <div className="text-[10px] text-slate-400 uppercase">Prix / Tonne</div>
                      <div className="font-extrabold text-cyan-400 font-mono">{unitPrice.toFixed(2)} TND</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
