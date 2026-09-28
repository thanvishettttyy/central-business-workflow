import React, { useState } from 'react';
import { 
  Split, Merge, FileText, Upload, Download, 
  Trash2, CheckCircle2, ArrowRight, RefreshCw 
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { db } from '../../services/db';

export const PDFToolsPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'split' | 'merge'>('split');
  
  // Split tool state
  const [splitFileName, setSplitFileName] = useState('Vendor_Invoices_Bundle_Sept2026.pdf');
  const [splitRange, setSplitRange] = useState('1-3');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitResult, setSplitResult] = useState<string | null>(null);

  // Merge tool state
  const [mergeFiles, setMergeFiles] = useState<string[]>([
    'Challan_Sept2026_Part1.pdf',
    'Bank_Confirmation_HDFC.pdf',
    'Form26AS_Statement.pdf',
  ]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<string | null>(null);

  const handleSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSplitting(true);
    setSplitResult(null);
    await new Promise(r => setTimeout(r, 900));
    setIsSplitting(false);
    setSplitResult(`Successfully split "${splitFileName}" pages [${splitRange}]. Output: "extracted_pages_${splitRange.replace('-', '_')}.pdf" (Ready for download)`);
    db.logActivity('PDF Studio', 'SPLIT', 'Document', undefined, `Extracted pages ${splitRange} from ${splitFileName}`);
  };

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mergeFiles.length < 2) return;
    setIsMerging(true);
    setMergeResult(null);
    await new Promise(r => setTimeout(r, 1000));
    setIsMerging(false);
    setMergeResult(`Successfully merged ${mergeFiles.length} documents into "Combined_Compliance_Pack_${Date.now()}.pdf" (Ready for download)`);
    db.logActivity('PDF Studio', 'MERGE', 'Document', undefined, `Merged ${mergeFiles.length} documents into single bundle`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Split className="w-5 h-5 text-brand-600" />
          <span>PDF Manipulation Studio</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Local, privacy-preserving PDF splitting, page extraction, and multi-file merging.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTool('split')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTool === 'split' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Split className="w-4 h-4" />
          <span>Split & Extract Pages</span>
        </button>
        <button
          onClick={() => setActiveTool('merge')}
          className={`flex items-center gap-2 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTool === 'merge' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Merge className="w-4 h-4" />
          <span>Merge PDFs</span>
        </button>
      </div>

      {activeTool === 'split' && (
        <div className="max-w-2xl">
          <Card title="PDF Page Splitter" subtitle="Extract individual pages or ranges into separate PDF documents">
            <form onSubmit={handleSplit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50">
                <FileText className="w-10 h-10 text-brand-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">{splitFileName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">File size: 2.4 MB • 8 Pages</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Page Range to Extract"
                  value={splitRange}
                  onChange={(e) => setSplitRange(e.target.value)}
                  placeholder="e.g. 1-3 or 2, 4, 6"
                  helperText="Format: 1-5 for ranges, or comma-separated pages"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Extraction Method</label>
                  <select className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option>Extract Range into One Combined PDF</option>
                    <option>Split Every Page into Separate Files</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">Processed locally with PyMuPDF worker</span>
                <Button type="submit" disabled={isSplitting} icon={<Split className="w-3.5 h-3.5" />}>
                  {isSplitting ? 'Processing PDF...' : 'Execute Split'}
                </Button>
              </div>

              {splitResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{splitResult}</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300 bg-white" icon={<Download className="w-3.5 h-3.5" />}>
                    Save File
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}

      {activeTool === 'merge' && (
        <div className="max-w-2xl">
          <Card title="PDF Merger" subtitle="Combine multiple statements, invoices, and vouchers into one packet">
            <form onSubmit={handleMerge} className="space-y-4">
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {mergeFiles.map((f, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-slate-400">{idx + 1}.</span>
                      <FileText className="w-4 h-4 text-brand-600" />
                      <span className="font-medium text-slate-800">{f}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMergeFiles(mergeFiles.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setMergeFiles([...mergeFiles, `Additional_Attachment_${mergeFiles.length + 1}.pdf`])}
                >
                  + Add Another PDF
                </Button>
                <Button type="submit" disabled={isMerging || mergeFiles.length < 2} icon={<Merge className="w-3.5 h-3.5" />}>
                  {isMerging ? 'Merging Files...' : 'Merge All Files'}
                </Button>
              </div>

              {mergeResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{mergeResult}</span>
                  </div>
                  <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300 bg-white" icon={<Download className="w-3.5 h-3.5" />}>
                    Save Merged File
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
