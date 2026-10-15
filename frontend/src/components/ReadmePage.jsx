import React from 'react';
import { BookOpenText, ServerCog, Layers3, Rocket, CheckCircle2, FileCode2, DatabaseZap } from 'lucide-react';

const stack = [
  'React + Vite frontend',
  'Express + Node.js backend',
  'Local JSON datasets and Excel upload parsing',
  'Recharts for dashboard analytics',
  'Lucide icons and Tailwind-style design system'
];

const runSteps = [
  'Install dependencies: npm install at project root',
  'Run the app: npm run dev',
  'Open the dashboard at http://127.0.0.1:3000',
  'Use backend APIs at http://localhost:5000'
];

const folders = [
  'backend/data — business datasets and summary files',
  'backend/server.js — API and upload logic',
  'frontend/src/components — each dashboard module',
  'frontend/src/App.jsx — app navigation and screen switching',
  'README.md — short project overview',
  'PROJECT_GUIDE.md — deep technical walkthrough'
];

export default function ReadmePage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <BookOpenText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Documentation</p>
            <h2 className="text-2xl font-bold text-white">README</h2>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">
          This project is a business intelligence dashboard for a cement and building materials company. It is designed to track sales performance, review customer risk, analyze regional activity, and simulate future commercial scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-3">
            <ServerCog className="w-4 h-4" />
            <span className="font-semibold">Core stack</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {stack.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-cyan-400 mb-3">
            <Rocket className="w-4 h-4" />
            <span className="font-semibold">How to run</span>
          </div>
          <ol className="space-y-2 text-sm text-slate-300 list-decimal list-inside">
            {runSteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>

        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 text-violet-400 mb-3">
            <Layers3 className="w-4 h-4" />
            <span className="font-semibold">Project structure</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            {folders.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <FileCode2 className="w-4 h-4 mt-0.5 text-violet-400 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2 text-amber-400 mb-3">
          <DatabaseZap className="w-4 h-4" />
          <span className="font-semibold">Main use cases</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            Executive reporting and KPI viewing
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            Regional sales analysis and market concentration study
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            Customer credit analysis and commercial risk management
          </div>
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
            Product pricing, revenue mix, and trade-off simulation
          </div>
        </div>
      </div>
    </div>
  );
}
