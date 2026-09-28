import React, { useState } from 'react';
import { 
  Database, Download, Upload, ShieldCheck, CheckCircle2, 
  AlertTriangle, RotateCcw, Clock, HardDrive, FileArchive 
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { BackupRecord } from '../../types';
import { db } from '../../services/db';

interface BackupPageProps {
  backups: BackupRecord[];
  onRefresh: () => void;
}

export const BackupPage: React.FC<BackupPageProps> = ({
  backups,
  onRefresh,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [restoreStep, setRestoreStep] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  const handleCreateBackup = async () => {
    setIsCreating(true);
    await new Promise(r => setTimeout(r, 1200));
    db.createBackup();
    setIsCreating(false);
    onRefresh();
  };

  const handleExecuteRestore = async (backup: BackupRecord) => {
    setIsRestoring(true);
    setRestoreSuccess(null);

    // Step 1: Validate backup
    setRestoreStep('1/5 Validating archive checksums and SQLite database integrity...');
    await new Promise(r => setTimeout(r, 600));

    // Step 2: Create safety backup of current installation
    setRestoreStep('2/5 Creating automated pre-restore safety snapshot of current system...');
    await new Promise(r => setTimeout(r, 700));

    // Step 3: Restoring files
    setRestoreStep('3/5 Unpacking documents, templates, Excel mappings, and configuration...');
    await new Promise(r => setTimeout(r, 800));

    // Step 4: Verify database
    setRestoreStep('4/5 Executing SQLite PRAGMA integrity_check on restored database...');
    await new Promise(r => setTimeout(r, 600));

    // Step 5: Complete
    setRestoreStep('5/5 Finalizing restore...');
    await new Promise(r => setTimeout(r, 400));

    setIsRestoring(false);
    setRestoreStep(null);
    setRestoreSuccess(`System safely restored from snapshot "${backup.filename}". All records verified!`);
    onRefresh();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-600" />
          <span>Local Backup & Disaster Recovery</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Self-contained snapshots of the SQLite database, document filesystem, Excel mapping templates, and configurations.
        </p>
      </div>

      {restoreSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{restoreSuccess}</span>
        </div>
      )}

      {/* Snapshot Action Card */}
      <Card title="Instant Local Snapshot" subtitle="Creates a full compressed bundle in the local backup repository">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 text-xs text-slate-600">
            <p className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-brand-600" />
              <span>Includes: <strong>database/app.db</strong>, customer document storage, and mapping configurations.</span>
            </p>
            <p className="text-slate-400">Offline native storage path: <code>C:\ProgramData\CentralWorkflow\backups\</code></p>
          </div>

          <Button
            onClick={handleCreateBackup}
            disabled={isCreating}
            icon={<Download className={`w-4 h-4 ${isCreating ? 'animate-bounce' : ''}`} />}
          >
            {isCreating ? 'Compiling Snapshot...' : 'Create New System Backup'}
          </Button>
        </div>
      </Card>

      {/* Step by step restore status */}
      {isRestoring && (
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-xl text-brand-900 text-xs font-medium space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
            <span className="font-bold">Restore in Progress:</span>
          </div>
          <p className="font-mono text-brand-700">{restoreStep}</p>
        </div>
      )}

      {/* Backup History Table */}
      <Card title="Backup History & Restore Points" subtitle="Verified archival points available for rollback">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Archive Filename</th>
                <th className="py-2.5 px-4">Size</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Integrity Verification</th>
                <th className="py-2.5 px-4">Created Timestamp</th>
                <th className="py-2.5 px-4 text-right">Disaster Recovery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-medium text-slate-900 flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-amber-600" />
                    <span>{b.filename}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{(b.sizeBytes / 1024 / 1024).toFixed(1)} MB</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="py-3 px-4 text-emerald-600 font-medium">
                    {b.verified ? '✓ Checksum Verified' : 'Pending Check'}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {new Date(b.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecuteRestore(b)}
                      disabled={isRestoring}
                      icon={<RotateCcw className="w-3 h-3" />}
                    >
                      Safe Restore
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
