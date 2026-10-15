import React, { useState, useEffect } from 'react';
import { Table, Search, Filter, Download, ChevronLeft, ChevronRight, FileText, Calendar, CreditCard } from 'lucide-react';
import { apiFetch } from '../api';

export default function TransactionExplorer({ apiBase, products, governorates, t }) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedGouv, setSelectedGouv] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const formatTND = (val) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 2 }).format(val || 0);
  const formatNumber = (val) => new Intl.NumberFormat('fr-TN', { maximumFractionDigits: 2 }).format(val || 0);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        product: selectedProduct,
        gouv: selectedGouv,
        payment: selectedPayment,
        page,
        limit
      });
      const res = await apiFetch(`${apiBase}/api/transactions?${params.toString()}`);
      const json = await res.json();
      if (json.status === 'success') {
        setData(json.data || []);
        setTotalRecords(json.totalRecords || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [search, selectedProduct, selectedGouv, selectedPayment, page]);

  // Export CSV handler
  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ['NUM_LIV', 'DAT_LIV', 'COD_CLI', 'NOM_CLI', 'QTE_LIV', 'ABRV_ART', 'LIB_GOUV', 'TYP_REGL', 'MNT_TTC'];
    const csvRows = [headers.join(',')];

    data.forEach(r => {
      const row = [
        `"${r.num_liv}"`,
        `"${r.date_liv}"`,
        `"${r.cod_cli}"`,
        `"${r.nom_cli.replace(/"/g, '""')}"`,
        r.qte_liv,
        `"${r.abrv_art}"`,
        `"${r.lib_gouv}"`,
        `"${r.typ_regl}"`,
        r.mnt_ttc
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_cimenterie_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Table className="w-4 h-4" />
            <span>Explorateur des Bons de Livraison</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Registre des Transactions de Vente</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Consultez, filtrez et exportez le registre complet des 48,804 bons de livraison en temps réel.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4" />
          Exporter en CSV
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="N° Livraison / Client..."
              className="w-full bg-slate-900/80 text-xs text-slate-200 placeholder-slate-500 pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Product dropdown */}
          <select
            value={selectedProduct}
            onChange={(e) => { setSelectedProduct(e.target.value); setPage(1); }}
            className="bg-slate-900/80 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les Produits ({products?.length || 7})</option>
            {(products || []).map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>

          {/* Governorate dropdown */}
          <select
            value={selectedGouv}
            onChange={(e) => { setSelectedGouv(e.target.value); setPage(1); }}
            className="bg-slate-900/80 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les Gouvernorats ({governorates?.length || 15})</option>
            {(governorates || []).map(g => (
              <option key={g.name} value={g.name}>{g.name}</option>
            ))}
          </select>

          {/* Payment dropdown */}
          <select
            value={selectedPayment}
            onChange={(e) => { setSelectedPayment(e.target.value); setPage(1); }}
            className="bg-slate-900/80 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Tous les Modes de Règlement</option>
            <option value="COMPTANT">COMPTANT (Comptant/Chèque)</option>
            <option value="CREDIT">CREDIT (Termes Crédit)</option>
          </select>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="glass-card p-6 rounded-2xl overflow-hidden space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Affichage des résultats <strong>{data.length}</strong> sur <strong>{totalRecords}</strong> transactions
          </span>
          {loading && <span className="text-xs text-cyan-400 animate-pulse">Mise à jour...</span>}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">N° Livraison</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Client (Code / Nom)</th>
                <th className="pb-3 px-3">Produit (Ciment)</th>
                <th className="pb-3 px-3">Gouvernorat</th>
                <th className="pb-3 px-3 text-center">Règlement</th>
                <th className="pb-3 px-3 text-right">Quantité (T)</th>
                <th className="pb-3 px-3 text-right">Montant (TND)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data.map((t) => (
                <tr key={t.num_liv + t.date_liv + t.cod_art} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">#{t.num_liv}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono">{t.date_liv}</td>
                  <td className="py-3 px-3 font-semibold text-white">
                    <div>{t.nom_cli}</div>
                    <div className="text-[10px] font-mono text-slate-500">Code: {t.cod_cli}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-200">
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] border border-slate-700">
                      {t.abrv_art}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{t.lib_gouv}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.typ_regl === 'CREDIT' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {t.typ_regl}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">{formatNumber(t.qte_liv)} T</td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-400">{formatTND(t.mnt_ttc)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-medium transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Précédent
          </button>

          <span className="text-slate-400 font-mono">
            Page <strong>{page}</strong> / <strong>{totalPages}</strong>
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-medium transition-all cursor-pointer"
          >
            Suivant <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
