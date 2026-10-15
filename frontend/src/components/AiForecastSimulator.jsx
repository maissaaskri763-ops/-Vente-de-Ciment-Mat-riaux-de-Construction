import React, { useState, useEffect } from 'react';
import { BrainCircuit, Sparkles, Sliders, TrendingUp, DollarSign, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import ExecutiveAssistant from './ExecutiveAssistant';
import { apiFetch } from '../api';

export default function AiForecastSimulator({ apiBase, t }) {
  const [priceChange, setPriceChange] = useState(0);
  const [volumeGrowth, setVolumeGrowth] = useState(0);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientForecast, setClientForecast] = useState(null);
  const [clientForecastError, setClientForecastError] = useState('');
  const [clientForecastLoading, setClientForecastLoading] = useState(false);

  const formatTND = (val) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(val || 0);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${apiBase}/api/forecast?priceChange=${priceChange}&volumeGrowth=${volumeGrowth}`);
      const json = await res.json();
      if (json.status === 'success') {
        setForecastData(json);
      }
    } catch (err) {
      console.error('Forecast fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, [priceChange, volumeGrowth]);

  const fetchClientForecast = async (event) => {
    event.preventDefault();
    if (!clientId.trim()) return;
    setClientForecastLoading(true);
    setClientForecastError('');
    setClientForecast(null);
    try {
      const response = await apiFetch(`${apiBase}/api/client-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId.trim() })
      });
      const responseBody = await response.text();
      let result;
      try {
        result = JSON.parse(responseBody);
      } catch {
        throw new Error(
          response.status === 404
            ? 'Le backend actif ne contient pas encore cimenterie-agent-dev. Redémarrez le backend puis réessayez.'
            : `Le backend a renvoyé une réponse invalide (HTTP ${response.status}).`
        );
      }
      if (!response.ok) throw new Error(result.error || 'Analyse indisponible');
      setClientForecast(result);
    } catch (error) {
      setClientForecastError(error.message);
    } finally {
      setClientForecastLoading(false);
    }
  };

  const summary = forecastData?.summary || {};
  const projections = forecastData?.projections || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BrainCircuit className="w-4 h-4" />
            <span>Module d'Intelligence Artificielle & Machine Learning</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Prédictions de Ventes & Simulateur "Et Si"</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Modèle prédictif basé sur la saisonnalité historique des 48,804 livraisons. Simulez l'impact des variations de prix et de volume sur le chiffre d'affaires 2026-2027.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center px-3 border-r border-slate-800">
            <div className="text-lg font-bold text-cyan-400">94.2%</div>
            <div className="text-[10px] text-slate-400 uppercase">Indice de Confiance</div>
          </div>
          <div className="text-center px-3">
            <div className="text-lg font-bold text-emerald-400">6 MOIS</div>
            <div className="text-[10px] text-slate-400 uppercase">Horizon de Projection</div>
          </div>
        </div>
      </div>

      <ExecutiveAssistant apiBase={apiBase} />

      <div className="glass-card p-6 rounded-2xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              cimenterie-agent-dev — Prévision client
            </h3>
            <p className="text-xs text-slate-400 mt-1">Estimation prudente calculée uniquement à partir des livraisons historiques du client.</p>
          </div>
          <form onSubmit={fetchClientForecast} className="flex gap-2 w-full lg:w-auto">
            <input
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="Identifiant client (ex. 1762)"
              aria-label="Identifiant client"
              className="min-w-0 flex-1 lg:w-56 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400"
            />
            <button type="submit" disabled={clientForecastLoading || !clientId.trim()} className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-sm font-bold text-slate-950 transition-colors">
              {clientForecastLoading ? 'Analyse...' : 'Analyser'}
            </button>
          </form>
        </div>
        {clientForecastError && <p className="mt-4 text-sm text-rose-300">{clientForecastError}</p>}
        {clientForecast && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Consommation estimée</p>
              <p className="mt-1 text-2xl font-extrabold text-cyan-400">{clientForecast.estimation_tonnes} t</p>
              <p className="text-[11px] text-slate-500">{clientForecast.periode}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs text-slate-400">Tendance / confiance</p>
              <p className="mt-1 text-base font-bold text-white capitalize">{clientForecast.tendance} · {clientForecast.niveau_confiance}</p>
              {clientForecast.insufficient_data && <p className="text-[11px] text-amber-300 mt-1">Historique insuffisant</p>}
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 md:col-span-1">
              <p className="text-xs text-slate-400">Explication</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-200">{clientForecast.explication}</p>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Sliders Controls & Forecast Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Panel */}
        <div className="glass-card p-6 rounded-2xl space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Paramètres de Simulation
          </h3>

          {/* Price Change Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Ajustement du Prix du Ciment</span>
              <span className={`font-mono ${priceChange > 0 ? 'text-emerald-400' : priceChange < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {priceChange > 0 ? `+${priceChange}%` : `${priceChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-15"
              max="25"
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-15%</span>
              <span>0% (Actuel)</span>
              <span>+25%</span>
            </div>
          </div>

          {/* Volume Growth Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Croissance Prévue du Volume</span>
              <span className={`font-mono ${volumeGrowth > 0 ? 'text-emerald-400' : volumeGrowth < 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {volumeGrowth > 0 ? `+${volumeGrowth}%` : `${volumeGrowth}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="30"
              value={volumeGrowth}
              onChange={(e) => setVolumeGrowth(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-20%</span>
              <span>0% (Stable)</span>
              <span>+30%</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => { setPriceChange(0); setVolumeGrowth(0); }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réinitialiser les Paramètres
          </button>
        </div>

        {/* Forecast Result Cards */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Résultat Estimé du Scénario (6 Prochains Mois)
            </h3>
            {loading && <span className="text-xs text-cyan-400 animate-pulse">Calcul du modèle IA...</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Chiffre d'Affaires Projeté (6 Mois)</div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatTND(summary.sixMonthProjectedRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Août 2026 — Janvier 2027</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400 font-medium">Variation de Recettes Simulée</div>
              <div className={`text-2xl font-extrabold mt-1 ${summary.estimatedRevenueDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {summary.estimatedRevenueDelta >= 0 ? `+${formatTND(summary.estimatedRevenueDelta)}` : formatTND(summary.estimatedRevenueDelta)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Par rapport au niveau historique de référence</div>
            </div>
          </div>

          {/* Recommendations box */}
          <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-2">
            <div className="font-bold text-cyan-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Recommandation Stratégique Générée par IA:
            </div>
            <p className="text-slate-300 leading-relaxed">
              Une augmentation modérée du prix de <strong>+3%</strong> sur le grade <em>CEM I 42,5N S</em> couplée à une expansion de <strong>+5%</strong> dans le gouvernorat de <em>Sidi Bouzid</em> génèrera environ <strong>+1.85M TND</strong> de bénéfice supplémentaire sans compromettre les parts de marché.
            </p>
          </div>
        </div>
      </div>

      {/* Projection Line Chart */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-base font-bold text-white mb-1">Courbe Prédictive des Recettes (Août 2026 — Janvier 2027)</h3>
        <p className="text-xs text-slate-400 mb-6">Prévision dynamique basée sur la simulation sélectionnée</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projections} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(v) => formatTND(v)}
              />
              <Line type="monotone" dataKey="projectedRevenue" name="Chiffre d'Affaires Simulé" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
