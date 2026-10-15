import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../api';

export default function ExcelUploaderModal({ apiBase, isOpen, onClose, onUploadSuccess, canUpload, t }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen || !canUpload) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier Excel .xlsx.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch(`${apiBase}/api/upload`, {
        method: 'POST',
        body: formData
      });
      const json = await res.json();
      if (json.status === 'success') {
        setResult(json.metrics);
        if (onUploadSuccess) onUploadSuccess();
      } else {
        setError(json.message || "Erreur lors de l'analyse du fichier Excel.");
      }
    } catch (err) {
      setError(err.message || 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const formatTND = (val) => new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-card w-full max-w-lg p-6 rounded-2xl relative shadow-2xl space-y-5">
        {/* Close X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Importer un Fichier Excel (.xlsx)</h3>
            <p className="text-xs text-slate-400">Recharger ou ajouter de nouvelles livraisons au dashboard</p>
          </div>
        </div>

        {/* Upload Drop Zone */}
        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 text-center transition-all bg-slate-900/40">
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            id="excel-file-input"
            className="hidden"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center gap-3">
            <Upload className="w-8 h-8 text-cyan-400" />
            <div>
              <span className="text-xs font-semibold text-cyan-400">Cliquez pour parcourir</span>
              <span className="text-xs text-slate-400"> ou glissez-déposez le fichier</span>
            </div>
            {file && (
              <span className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-mono text-emerald-400 border border-slate-700 mt-2">
                Fichier sélectionné: {file.name}
              </span>
            )}
          </label>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {result && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
            <div className="font-bold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Fichier Analysé avec Succès !
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono mt-2 pt-2 border-t border-emerald-500/20">
              <div>Transactions: <strong>{result.records}</strong></div>
              <div>Top Client: <strong>{result.topClient}</strong></div>
              <div>CA Total: <strong>{formatTND(result.totalRevenue)}</strong></div>
              <div>Volume: <strong>{result.totalQuantity} Tonnes</strong></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-all cursor-pointer"
          >
            Fermer
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Lancer l'Analyse
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
