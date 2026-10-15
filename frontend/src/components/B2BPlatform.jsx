import React, { useState } from 'react';
import {
  Handshake,
  Building2,
  FileText,
  TrendingUp,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Star,
  BarChart3,
  Globe,
  Truck,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ─── Static mock data ────────────────────────────────────────────────────────
const PARTNERS = [
  {
    id: 1,
    name: 'Groupe BATIMAT',
    type: 'Distributeur Agréé',
    region: 'Grand Tunis',
    status: 'active',
    volume: '12,400 T',
    revenue: '1,860,000 TND',
    score: 94,
    trend: 'up',
  },
  {
    id: 2,
    name: 'SARL Construct Plus',
    type: 'Revendeur B2B',
    region: 'Sfax',
    status: 'active',
    volume: '8,750 T',
    revenue: '1,312,500 TND',
    score: 88,
    trend: 'up',
  },
  {
    id: 3,
    name: 'Chantiers du Sud',
    type: 'Grand Compte',
    region: 'Gabès',
    status: 'pending',
    volume: '5,200 T',
    revenue: '780,000 TND',
    score: 72,
    trend: 'down',
  },
  {
    id: 4,
    name: 'Entreprise Khalil BTP',
    type: 'Promoteur Immobilier',
    region: 'Sousse',
    status: 'active',
    volume: '9,100 T',
    revenue: '1,365,000 TND',
    score: 91,
    trend: 'up',
  },
  {
    id: 5,
    name: 'Med Infra SARL',
    type: 'Sous-traitant',
    region: 'Monastir',
    status: 'inactive',
    volume: '1,800 T',
    revenue: '270,000 TND',
    score: 45,
    trend: 'down',
  },
  {
    id: 6,
    name: 'Al Bina Holding',
    type: 'Grand Compte',
    region: 'Tunis',
    status: 'active',
    volume: '18,200 T',
    revenue: '2,730,000 TND',
    score: 97,
    trend: 'up',
  },
];

const CONTRACTS = [
  {
    id: 'CTR-2024-087',
    partner: 'Al Bina Holding',
    value: '2,730,000 TND',
    start: 'Jan 2024',
    end: 'Déc 2024',
    status: 'active',
    completion: 82,
  },
  {
    id: 'CTR-2024-063',
    partner: 'Groupe BATIMAT',
    value: '1,860,000 TND',
    start: 'Mar 2024',
    end: 'Fév 2025',
    status: 'active',
    completion: 67,
  },
  {
    id: 'CTR-2024-041',
    partner: 'Chantiers du Sud',
    value: '780,000 TND',
    start: 'Juin 2024',
    end: 'Mai 2025',
    status: 'pending',
    completion: 24,
  },
  {
    id: 'CTR-2023-112',
    partner: 'Med Infra SARL',
    value: '270,000 TND',
    start: 'Oct 2023',
    end: 'Sep 2024',
    status: 'expired',
    completion: 100,
  },
];

const KPI_CARDS = [
  {
    icon: Building2,
    label: 'Partenaires Actifs',
    value: '24',
    sub: '+3 ce trimestre',
    color: 'cyan',
    trend: 'up',
  },
  {
    icon: FileText,
    label: 'Contrats en cours',
    value: '18',
    sub: '4 en renouvellement',
    color: 'emerald',
    trend: 'up',
  },
  {
    icon: TrendingUp,
    label: 'CA B2B Total',
    value: '8.3M TND',
    sub: '+12.4% vs N-1',
    color: 'violet',
    trend: 'up',
  },
  {
    icon: ShieldCheck,
    label: 'Score Fidélité Moy.',
    value: '81 / 100',
    sub: '5 pts ce mois',
    color: 'amber',
    trend: 'up',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    active: {
      label: 'Actif',
      cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
    },
    pending: {
      label: 'En attente',
      cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
    },
    inactive: {
      label: 'Inactif',
      cls: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: XCircle,
    },
    expired: {
      label: 'Expire',
      cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: Clock,
    },
  };
  const cfg = map[status] || map.pending;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.cls}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
};

const ScoreDot = ({ score }) => {
  const color =
    score >= 90
      ? 'bg-emerald-400'
      : score >= 70
      ? 'bg-cyan-400'
      : score >= 50
      ? 'bg-amber-400'
      : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs font-semibold text-slate-200">{score}</span>
    </div>
  );
};

const ProgressBar = ({ value }) => (
  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
    <div
      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
      style={{ width: `${value}%` }}
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function B2BPlatform() {
  const [activeView, setActiveView] = useState('partners');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPartners = PARTNERS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const views = [
    { id: 'partners', label: 'Partenaires', icon: Users },
    { id: 'contracts', label: 'Contrats', icon: FileText },
    { id: 'analytics', label: 'Analyse B2B', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Handshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Plateforme Be to Be
            </h2>
            <p className="text-xs text-slate-400">
              Gestion des partenaires, contrats &amp; performance commerciale B2B
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 tracking-wider uppercase">
            B2B
          </span>
          <span className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 tracking-wider uppercase">
            {PARTNERS.filter((p) => p.status === 'active').length} Actifs
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          const colorMap = {
            cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
            amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          };
          const iconCls = colorMap[kpi.color] || colorMap.cyan;
          return (
            <div
              key={kpi.label}
              className="glass-card glass-card-hover rounded-xl p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconCls}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {kpi.trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div>
                <div className="text-xl font-bold text-white tracking-tight">{kpi.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{kpi.label}</div>
                <div className="text-[10px] text-slate-500 mt-1">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sub-nav + search */}
      <div className="flex flex-wrap items-center gap-2">
        {views.map((v) => {
          const Icon = v.icon;
          const isActive = activeView === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-white border border-violet-500/40 shadow-lg shadow-violet-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
              {v.label}
            </button>
          );
        })}
        <div className="ml-auto">
          <input
            type="search"
            placeholder="Rechercher partenaire, region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/50 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all w-52"
          />
        </div>
      </div>

      {/* Partners View */}
      {activeView === 'partners' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/60 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">Reseau Partenaires B2B</span>
            <span className="text-[11px] text-slate-500 font-mono">{filteredPartners.length} resultats</span>
          </div>
          <div className="divide-y divide-slate-800/40">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-800/20 transition-colors cursor-pointer group"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600/30 to-cyan-600/30 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-violet-300">
                    {partner.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-100 truncate">{partner.name}</span>
                    <StatusBadge status={partner.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {partner.region}
                    </span>
                    <span>{partner.type}</span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 text-right shrink-0">
                  <div>
                    <div className="text-xs text-slate-500">Volume</div>
                    <div className="text-sm font-semibold text-cyan-400 flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {partner.volume}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">CA</div>
                    <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {partner.revenue}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Score</div>
                    <ScoreDot score={partner.score} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contracts View */}
      {activeView === 'contracts' && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-800/60">
            <span className="text-sm font-semibold text-slate-200">Contrats B2B en cours</span>
          </div>
          <div className="divide-y divide-slate-800/40">
            {CONTRACTS.map((contract) => (
              <div key={contract.id} className="px-5 py-4 hover:bg-slate-800/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                        {contract.id}
                      </span>
                      <StatusBadge status={contract.status} />
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-100">{contract.partner}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {contract.start} {'->'} {contract.end}
                      </span>
                      <span className="font-semibold text-emerald-400">{contract.value}</span>
                    </div>
                  </div>
                  <div className="sm:w-40">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-500">Avancement</span>
                      <span className="text-[10px] font-semibold text-slate-300">{contract.completion}%</span>
                    </div>
                    <ProgressBar value={contract.completion} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Top Partners by Revenue */}
          <div className="lg:col-span-2 glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-slate-200">Top Partenaires par CA</span>
              <span className="text-[10px] text-slate-500 font-mono">2024 YTD</span>
            </div>
            <div className="space-y-3">
              {[...PARTNERS]
                .sort(
                  (a, b) =>
                    parseInt(b.revenue.replace(/[^0-9]/g, ''), 10) -
                    parseInt(a.revenue.replace(/[^0-9]/g, ''), 10)
                )
                .slice(0, 5)
                .map((p, i) => {
                  const maxVal = 2730000;
                  const val = parseInt(p.revenue.replace(/[^0-9]/g, ''), 10);
                  const pct = Math.round((val / maxVal) * 100);
                  return (
                    <div key={p.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-mono w-4 text-center">#{i + 1}</span>
                          <span className="text-slate-200 font-medium">{p.name}</span>
                        </div>
                        <span className="text-emerald-400 font-semibold">{p.revenue}</span>
                      </div>
                      <ProgressBar value={pct} />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Score Distribution */}
          <div className="glass-card rounded-2xl p-5">
            <div className="text-sm font-semibold text-slate-200 mb-4">Distribution Scores</div>
            <div className="space-y-4">
              {[
                { label: 'Excellent (90-100)', count: PARTNERS.filter((p) => p.score >= 90).length, dot: 'bg-emerald-400' },
                { label: 'Bon (70-89)', count: PARTNERS.filter((p) => p.score >= 70 && p.score < 90).length, dot: 'bg-cyan-400' },
                { label: 'Moyen (50-69)', count: PARTNERS.filter((p) => p.score >= 50 && p.score < 70).length, dot: 'bg-amber-400' },
                { label: 'Faible (<50)', count: PARTNERS.filter((p) => p.score < 50).length, dot: 'bg-rose-400' },
              ].map((seg) => {
                const pct = Math.round((seg.count / PARTNERS.length) * 100);
                return (
                  <div key={seg.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${seg.dot}`} />
                        <span className="text-slate-400">{seg.label}</span>
                      </div>
                      <span className="text-slate-300 font-semibold">{seg.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full">
                      <div className={`h-full rounded-full ${seg.dot} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strategic Partners */}
            <div className="mt-6 pt-4 border-t border-slate-800/60">
              <div className="text-[11px] text-slate-500 mb-2">Partenaires Strategiques</div>
              <div className="space-y-2">
                {PARTNERS.filter((p) => p.score >= 90).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">{p.name}</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, si) => (
                        <Star
                          key={si}
                          className={`w-2.5 h-2.5 ${si < Math.round(p.score / 20) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
