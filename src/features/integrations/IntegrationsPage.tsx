import React from 'react';
import { Cpu, ShieldCheck, CheckCircle2, AlertTriangle, Landmark, FileCheck, Mail, HardDrive } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const IntegrationsPage: React.FC = () => {
  const connectors = [
    {
      name: 'Tally XML / ODBC Gateway',
      category: 'Accounting',
      icon: Landmark,
      status: 'Ready (Local File Mode)',
      desc: 'Seamlessly imports DayBook XML and synchronizes ledgers. Operates in local file mode when port 9000 is inactive.',
      safe: 'No credential scraping. Conforms to Section 6 architecture.',
    },
    {
      name: 'GST Government API Connector',
      category: 'Tax & Compliance',
      icon: FileCheck,
      status: 'Ready for Authorized GSP Credentials',
      desc: 'Local GST database ready for e-way bill and return filing. Strictly flags local vs portal data.',
      safe: 'No unofficial scraping. Conforms to Section 7 architecture.',
    },
    {
      name: 'PaddleOCR-v4 Worker Engine',
      category: 'Document Intelligence',
      icon: Cpu,
      status: 'Active (Local Background Worker)',
      desc: 'Local OCR parsing running in isolated worker process with confidence threshold evaluation.',
      safe: 'Zero external cloud transmission. 100% offline-first.',
    },
    {
      name: 'Local Filesystem & SQLite Vault',
      category: 'Storage',
      icon: HardDrive,
      status: 'Active (C:\\ProgramData\\CentralWorkflow)',
      desc: 'Parameterized SQLite storage with SHA-256 document integrity hashing.',
      safe: 'Protected against path traversal.',
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-brand-600" />
          <span>Connector & Integration Architecture</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Isolated connectors ensuring graceful external failure and 100% local continuity.
        </p>
      </div>

      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            Core Principle: External integrations fail gracefully while local functionality continues uninterrupted.
          </span>
        </div>
        <span className="font-semibold text-blue-700">Offline-First Enforced</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.name} title={c.name} subtitle={c.category}>
              <div className="space-y-2 text-xs">
                <p className="text-slate-600">{c.desc}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {c.status}
                  </span>
                  <span className="text-[10px] text-slate-400">{c.safe}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
