import React from 'react';
import { 
  Building2, ShieldCheck, Zap, Database, Download, 
  ArrowRight, CheckCircle2, FileText, Landmark, Clock, 
  CheckSquare, ArrowRightLeft, Sparkles, HardDrive, Lock, Globe
} from 'lucide-react';
import { Button } from '../ui/Button';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const features = [
    {
      icon: Building2,
      title: 'Customer 360° Profile',
      desc: 'Answers "What needs to be done for this customer?". Unifies documents, tasks, requirements, GST, accounting, and timeline on one client screen.',
    },
    {
      icon: Landmark,
      title: 'Tally & Accounting Connector',
      desc: 'Isolated connector architecture. Synchronizes DayBook XML, ledgers, vouchers, and trial balances with zero brittle scraping.',
    },
    {
      icon: FileText,
      title: 'GST Compliance Engine',
      desc: 'Internal GST computation for GSTR-1, GSTR-3B, and ITC reconciliation. Clearly marks local vs portal data with GSP API readiness.',
    },
    {
      icon: Sparkles,
      title: 'Local PaddleOCR & Human-in-the-Loop',
      desc: 'Scans invoices and statements locally. Displays confidence percentage, flags low-confidence fields, and requires human verification.',
    },
    {
      icon: ArrowRightLeft,
      title: 'PDF → Excel Conversion',
      desc: 'Detects tables in native or scanned PDFs, normalizes columns, enables in-place cell editing, and exports clean XLSX to client archives.',
    },
    {
      icon: CheckSquare,
      title: 'Requirement Checklists & Bulk Rollout',
      desc: 'Standardized templates like Monthly GST Checklist. Apply to 50+ clients simultaneously with automated deadline tracking.',
    },
    {
      icon: Clock,
      title: 'Deadlines & Recurring Workflows',
      desc: 'Propagates recurring monthly accounting cycles, TDS challans, and GST return deadlines automatically for the next period.',
    },
    {
      icon: Database,
      title: 'Offline-First SQLite Architecture',
      desc: '100% functional without internet connectivity. Parameterized queries, path-traversal protection, and atomic safety backups.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-brand-500/20">
            CW
          </div>
          <div>
            <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">CENTRAL BUSINESS WORKFLOW</h1>
            <p className="text-[10px] text-brand-400 font-mono tracking-widest uppercase">Windows Desktop OS</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onLaunchApp}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Launch Operating Workspace
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 text-center max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-950 border border-brand-800/60 text-brand-300 text-xs font-semibold shadow-inner">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
          <span>PRODUCTION-GRADE WINDOWS-FIRST DESKTOP APPLICATION</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
          One Central Workspace for <br />
          <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            Accounting, GST, OCR & Workflows
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Eliminate the chaos of switching between Tally, Excel sheets, client folders, GST portals, task lists, and PDF tools.
          Answering the single most critical business question:
          <strong className="text-white block mt-1">"What needs to be done for this customer?"</strong>
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Button
            size="lg"
            onClick={onLaunchApp}
            className="bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-xl shadow-brand-500/25 cursor-pointer"
            icon={<Zap className="w-4 h-4" />}
          >
            Launch Live Application
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onLaunchApp}
            className="border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold text-sm px-7 py-3.5 rounded-xl cursor-pointer"
            icon={<Download className="w-4 h-4" />}
          >
            Download Windows Installer (.msi)
          </Button>
        </div>

        {/* Badges Guarantee */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>100% Offline-First</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero Mandatory Cloud Lock-in</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Local PaddleOCR Privacy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Windows Tauri 2 + SQLite</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-6 py-16 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Built for Professional Accounting & Compliance Workflows
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Every major feature connects back to the customer record as the single source of truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-slate-900/90 border border-slate-800 hover:border-brand-500/50 rounded-2xl p-5 transition-all hover:-translate-y-1 duration-200 space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Architecture Deep Dive */}
      <section className="px-6 py-16 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">Enterprise Architecture Stack</h2>
          <p className="text-xs text-slate-400">Strict adherence to Section 2 Technology Stack and Section 21 File Storage</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <span className="text-brand-400 font-bold uppercase block text-[10px]">Desktop & Native Shell</span>
            <p className="text-slate-300">• Tauri 2 Framework</p>
            <p className="text-slate-300">• Windows x64 Native Binaries</p>
            <p className="text-slate-300">• Rust IPC Command Handlers</p>
            <p className="text-slate-300">• SQLite Bundled Engine</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <span className="text-brand-400 font-bold uppercase block text-[10px]">Frontend UI & State</span>
            <p className="text-slate-300">• React 18 + TypeScript</p>
            <p className="text-slate-300">• Tailwind CSS + shadcn/ui</p>
            <p className="text-slate-300">• Zustand Offline Store</p>
            <p className="text-slate-300">• TanStack React Query</p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <span className="text-brand-400 font-bold uppercase block text-[10px]">Local Workers & AI</span>
            <p className="text-slate-300">• PaddleOCR-v4 Local Engine</p>
            <p className="text-slate-300">• PyMuPDF & pdfplumber</p>
            <p className="text-slate-300">• openpyxl & SheetJS XLSX</p>
            <p className="text-slate-300">• Background Thread Worker</p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-10 px-6 text-center space-y-4">
        <h3 className="text-lg font-bold text-white">Ready to streamline your business workflow?</h3>
        <p className="text-xs text-slate-400">Launch the local workspace now or generate installer packages.</p>
        <div>
          <Button onClick={onLaunchApp} className="bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs px-6 py-2.5">
            Open Central Business Workflow App
          </Button>
        </div>
        <p className="text-[11px] text-slate-500 pt-4">
          © 2026 Central Business Workflow. All rights reserved. Windows Desktop First Architecture.
        </p>
      </footer>
    </div>
  );
};
