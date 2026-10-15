import React from 'react';
import { FileText, Layers3, Database, BarChart3, ShieldCheck, Rocket, Sparkles } from 'lucide-react';

const sections = [
  {
    title: '1. Project purpose',
    icon: Rocket,
    text: 'This dashboard is a business intelligence system for a cement and construction-materials company. The idea is to help management understand revenue, volume, product performance, regional concentration, customer risk, and future sales scenarios from a single interface.'
  },
  {
    title: '2. System architecture',
    icon: Layers3,
    text: 'The project is split into a frontend layer, a backend API layer, and a local business-data layer. The frontend renders analytics, while the backend serves datasets and handles file upload processing.'
  },
  {
    title: '3. Frontend behavior',
    icon: BarChart3,
    text: 'The UI is built from independent dashboard sections: overview, product catalog, geography, CRM, forecast simulation, transaction explorer, and B2B overviews. Each section focuses on a different operational question.'
  },
  {
    title: '4. Backend logic',
    icon: Database,
    text: 'The backend loads JSON datasets on startup, exposes filtered endpoints, handles pagination, and computes forecast projections. It also reads uploaded Excel files and converts them into business metrics.'
  },
  {
    title: '5. Risk and credit logic',
    icon: ShieldCheck,
    text: 'Customer analysis focuses on revenue, volume, and credit ratio. This allows managers to distinguish low-risk accounts from higher-risk accounts and prioritize follow-up actions.'
  },
  {
    title: '6. Forecasting model',
    icon: Sparkles,
    text: 'The forecast module simulates business scenarios by adjusting price and volume assumptions. It then estimates the impact over the next six months using historical patterns and seasonal factors.'
  }
];

export default function ProjectGuidePage() {
  return (
    <div className="space-y-6">
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-violet-400">Project guide</p>
            <h2 className="text-2xl font-bold text-white">Deep walkthrough of the project</h2>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed">
          This application is a practical sales analytics dashboard built to mimic a real executive reporting tool for a cement production and distribution environment. The main value is that it combines strategic reporting, operational detail, and predictive planning in the same interface.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map(({ title, icon: Icon, text }) => (
          <div key={title} className="glass-card p-5 rounded-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
