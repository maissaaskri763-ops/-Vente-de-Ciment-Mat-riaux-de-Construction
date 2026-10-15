import React from 'react';
import { DollarSign, Weight, ShoppingBag, TrendingUp, CreditCard, ShieldAlert, Award, ArrowUpRight, MapPin, Compass } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ExecutiveOverview({ summary, monthly, products, governorates, t }) {
  if (!summary) return <div className="p-8 text-center text-slate-400">Chargement des indicateurs exécutifs...</div>;

  // Format currency helpers
  const formatTND = (val) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 0 }).format(val || 0);

  // Payment mode donut data - use actual ratios from summary
  const cashRatio = (summary.cash_ratio || 80.7) / 100;
  const creditRatio = (summary.credit_ratio || 19.3) / 100;
  const paymentData = [
    { name: 'COMPTANT (Comptant/Chèque)', value: summary.total_revenue * cashRatio, color: '#10b981' },
    { name: 'CREDIT (Termes Crédit)', value: summary.total_revenue * creditRatio, color: '#f59e0b' }
  ];

  // Top products chart data
  const topProductsChart = (products || []).slice(0, 5).map(p => ({
    name: p.name || p.abbreviation,
    Revenue: p.revenue,
    Quantity: p.quantity
  }));

  const gouvColors = ['#06b6d4', '#10b981', '#6366f1', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chiffre d'Affaires */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.kpiRevenue}</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatTND(summary.total_revenue)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% vs Période Précédente</span>
            </div>
          </div>
        </div>

        {/* Card 2: Volume Total (Tonnage) */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.kpiVolume}</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Weight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatNumber(summary.total_qty)} <span className="text-sm font-semibold text-slate-400">Tonnes</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-cyan-400">
              <Award className="w-3.5 h-3.5" />
              <span>48,804 Livraisons Effectuées</span>
            </div>
          </div>
        </div>

        {/* Card 3: Panier Moyen (AOV) */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.kpiAov}</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatTND(summary.average_order_value)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-indigo-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Moyenne par Camion / Commande</span>
            </div>
          </div>
        </div>

        {/* Card 4: Prix Moyen au Tonne */}
        <div className="glass-card glass-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.kpiPriceTon}</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatTND(summary.average_price_per_ton)} <span className="text-xs font-medium text-slate-400">/ Tonne</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Moyenne Produits Ciment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Revenue Time Series Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              {t.chartMonthlyTitle}
            </h3>
            <p className="text-xs text-slate-400">Évolution mensuelle du chiffre d'affaires et volumes (janvier 2022 - juillet 2026)</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-3 h-3 rounded-full bg-cyan-500"></span> Chiffre d'Affaires (TND)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Tonnage (Tonnes)
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthly || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                formatter={(value, name) => [
                  name === 'revenue' ? formatTND(value) : `${formatNumber(value)} T`,
                  name === 'revenue' ? "Chiffre d'Affaires" : "Tonnage Livré"
                ]}
              />
              <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              <Area yAxisId="right" type="monotone" dataKey="quantity" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorQty)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- GEOGRAPHIC ANALYTICS SECTION --- */}
      <div className="pt-2 space-y-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              <span>Analyse Géographique Nationale (Tunisie)</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Performances Commerciales par Gouvernorat</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Couverture sur 15 gouvernorats tunisiens avec une concentration majeure dans la région du Centre-Ouest et Nord-Ouest.
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
              <h4 className="text-xl font-bold text-white mt-3">{g.name}</h4>
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
                  <strong className="text-slate-200">{g.customer_count} Sociétés</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bar Chart comparing 15 Governorates */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Classement Complet des 15 Gouvernorats par Chiffre d'Affaires
          </h3>
          <p className="text-xs text-slate-400 mb-6">Comparatif des recettes en Dinars Tunisiens (TND)</p>

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
                    <Cell key={`cell-${index}`} fill={gouvColors[index % gouvColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Payment Mode Donut & Top Products Horizontal Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Term Breakdown */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-400" />
              {t.chartPaymentTitle}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Répartition des recettes entre paiement au comptant et termes de crédit</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(v) => formatTND(v)}
                />
                <Legend formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-xs text-slate-400 font-medium">COMPTANT (Cash/Chèque)</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">237,50M TND (79.1%)</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-xs text-slate-400 font-medium">CREDIT (Effets/Traites)</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">62,87M TND (20.9%)</div>
            </div>
          </div>
        </div>

        {/* Top 5 Products Bar Chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              {t.chartProductsTitle}
            </h3>
            <p className="text-xs text-slate-400 mb-4">Classement des types de ciment et clinker par chiffre d'affaires généré</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topProductsChart} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={10} width={120} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => formatTND(val)}
                />
                <Bar dataKey="Revenue" fill="#06b6d4" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-xs text-slate-400 text-center">
            💡 <em>Le ciment grade CEM I 42,5N S et CEMII/A-L32,5NS représentent à eux seuls 82.2% des ventes totales.</em>
          </div>
        </div>
      </div>

      {/* Governorate Table Data Grid */}
      <div className="glass-card p-6 rounded-2xl overflow-hidden">
        <h3 className="text-base font-bold text-white mb-4">Tableau Récapitulatif Complet par Gouvernorat</h3>
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
                  <td className="py-3 px-3 text-center font-mono text-slate-400">{g.customer_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
