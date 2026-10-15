import React, { useState } from 'react';
import { MessageSquareText, Send } from 'lucide-react';
import { apiFetch } from '../api';

export default function ExecutiveAssistant({ apiBase }) {
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true); setError(''); setAnswer('');
    try {
      const response = await apiFetch(`${apiBase}/api/executive-assistant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'chat', message }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Assistant indisponible');
      setAnswer(payload.answer);
    } catch (requestError) {
      setError(requestError.message);
    } finally { setLoading(false); }
  };

  return <div className="glass-card p-6 rounded-2xl">
    <div className="flex items-center gap-2 text-white font-bold"><MessageSquareText className="w-5 h-5 text-cyan-400" /> Assistant Exécutif Intelligence Économique</div>
    <p className="mt-1 text-xs text-slate-400">Posez une question commerciale. Les chiffres communiqués proviennent exclusivement des données du dashboard.</p>
    <form onSubmit={ask} className="mt-4 flex gap-2">
      <input value={message} onChange={(event) => setMessage(event.target.value)} aria-label="Question commerciale" placeholder="Ex. Quels clients présentent le plus de risque crédit ?" className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400" />
      <button type="submit" disabled={loading || !message.trim()} className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-sm font-bold text-slate-950"><Send className="w-4 h-4" /></button>
    </form>
    {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
    {answer && <p className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">{answer}</p>}
  </div>;
}
