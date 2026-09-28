import React, { useState } from 'react';
import { 
  FileText, Search, Plus, Filter, Eye, Download, 
  Sparkles, CheckCircle2, Clock, Split, ArrowUpDown 
} from 'lucide-react';
import { DocumentRecord, Customer } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { db } from '../../services/db';

interface DocumentsPageProps {
  documents: DocumentRecord[];
  customers: Customer[];
  onOpenUploadModal: () => void;
  onNavigateToOCR: (doc: DocumentRecord) => void;
  onNavigateToPDFTools: () => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({
  documents,
  customers,
  onOpenUploadModal,
  onNavigateToOCR,
  onNavigateToPDFTools,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<DocumentRecord | null>(null);

  const filtered = documents.filter(d => {
    const matchesSearch = 
      d.filename.toLowerCase().includes(search.toLowerCase()) ||
      (d.customerName && d.customerName.toLowerCase().includes(search.toLowerCase())) ||
      d.docType.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'All' || d.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  const handleStatusChange = (doc: DocumentRecord, newStatus: DocumentRecord['status']) => {
    db.saveDocument({
      ...doc,
      status: newStatus,
    });
    setSelectedDocForPreview(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-600" />
            <span>Document Workspace</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Store, preview, verify, and run OCR on customer invoices, tax filings, and statements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onNavigateToPDFTools} icon={<Split className="w-4 h-4" />}>
            PDF Split & Merge
          </Button>
          <Button onClick={onOpenUploadModal} icon={<Plus className="w-4 h-4" />}>
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search by filename or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Tax">Tax</option>
              <option value="Banking">Banking</option>
              <option value="Financial">Financial</option>
              <option value="Invoices">Invoices</option>
              <option value="Identity">Identity</option>
              <option value="Legal">Legal</option>
              <option value="Reports">Reports</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Under Review">Under Review</option>
              <option value="Processed">Processed</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Document Details</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">OCR Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">{d.filename}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {(d.sizeBytes / 1024).toFixed(0)} KB • {d.fileType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{d.customerName || 'Internal'}</td>
                  <td className="py-3.5 px-4 text-slate-600">{d.category}</td>
                  <td className="py-3.5 px-4 text-slate-600">{d.period || '-'}</td>
                  <td className="py-3.5 px-4 font-mono">
                    {d.ocrConfidence ? (
                      <span className="font-semibold text-emerald-600">{d.ocrConfidence}%</span>
                    ) : (
                      <span className="text-slate-400">Not Run</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDocForPreview(d)}
                        title="Preview & Validate"
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {d.fileType === 'PDF' && (
                        <button
                          onClick={() => onNavigateToOCR(d)}
                          title="Run OCR Extraction"
                          className="p-1.5 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocForPreview && (
        <DocumentPreviewModal
          document={selectedDocForPreview}
          onClose={() => setSelectedDocForPreview(null)}
          onRunOCR={(doc) => {
            setSelectedDocForPreview(null);
            onNavigateToOCR(doc);
          }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};
