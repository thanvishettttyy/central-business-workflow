import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { DocumentRecord } from '../../types';
import { 
  ZoomIn, ZoomOut, RotateCw, Download, FileText, 
  Check, X, Eye, FileSpreadsheet, Sparkles 
} from 'lucide-react';
import { db } from '../../services/db';

interface DocumentPreviewModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
  onRunOCR: (doc: DocumentRecord) => void;
  onStatusChange: (doc: DocumentRecord, newStatus: DocumentRecord['status']) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onRunOCR,
  onStatusChange,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  if (!document) return null;

  const isPDF = document.fileType === 'PDF';
  const isExcel = document.fileType === 'XLSX' || document.fileType === 'CSV';

  return (
    <Modal
      isOpen={!!document}
      onClose={onClose}
      title={document.filename}
      subtitle={`${document.customerName || 'Customer'} • ${document.category} • ${(document.sizeBytes / 1024).toFixed(0)} KB`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Document Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoom(Math.max(50, zoom - 15))}
              icon={<ZoomOut className="w-3.5 h-3.5" />}
            >
              Zoom Out
            </Button>
            <span className="text-xs font-mono font-medium px-2 text-slate-600">{zoom}%</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setZoom(Math.min(200, zoom + 15))}
              icon={<ZoomIn className="w-3.5 h-3.5" />}
            >
              Zoom In
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setRotation((rotation + 90) % 360)}
              icon={<RotateCw className="w-3.5 h-3.5" />}
            >
              Rotate
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isPDF && (
              <Button 
                size="sm" 
                onClick={() => onRunOCR(document)} 
                className="bg-purple-600 hover:bg-purple-700 text-white"
                icon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Run PaddleOCR
              </Button>
            )}

            <Button 
              variant="success" 
              size="sm" 
              onClick={() => onStatusChange(document, 'Approved')}
              icon={<Check className="w-3.5 h-3.5" />}
            >
              Approve
            </Button>

            <Button 
              variant="danger" 
              size="sm" 
              onClick={() => onStatusChange(document, 'Rejected')}
              icon={<X className="w-3.5 h-3.5" />}
            >
              Reject
            </Button>
          </div>
        </div>

        {/* Realistic Interactive Document Canvas / Viewer */}
        <div className="bg-slate-200/70 rounded-xl p-6 min-h-[420px] flex items-center justify-center overflow-auto border border-slate-300/80">
          <div 
            style={{ 
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, 
              transition: 'transform 0.2s ease-in-out' 
            }}
            className="bg-white p-8 rounded-lg shadow-xl w-full max-w-xl text-slate-800 space-y-4 border border-slate-200"
          >
            {/* Header Document Template */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{document.customerName || 'Central Enterprise Client'}</h2>
                <p className="text-xs text-slate-500">Document Type: {document.docType}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Checksum: {document.checksum}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={document.status} />
                <p className="text-xs text-slate-500 mt-1">Period: {document.period || 'Current'}</p>
              </div>
            </div>

            {/* Document Body Sample Simulation */}
            {isPDF ? (
              <div className="space-y-3 py-2 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <p className="font-semibold text-slate-800">SUMMARY OF ACCOUNT / TAX INVOICE</p>
                  <p className="text-slate-600 mt-1">
                    This document represents statutory verification material provided for the financial period {document.period || 'September 2026'}.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 border rounded bg-white">
                    <span className="text-slate-400 block">Gross Invoiced Value</span>
                    <span className="font-bold text-slate-900 text-sm">₹4,50,000.00</span>
                  </div>
                  <div className="p-2 border rounded bg-white">
                    <span className="text-slate-400 block">Total GST Calculated</span>
                    <span className="font-bold text-brand-600 text-sm">₹81,000.00</span>
                  </div>
                </div>

                <div className="border rounded p-2 bg-slate-50">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Security & Integrity Check</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">✓ Authenticity checksum valid. Local file verified.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 py-4 text-center">
                <FileSpreadsheet className="w-12 h-12 text-emerald-600 mx-auto" />
                <p className="font-semibold text-xs text-slate-800">Spreadsheet Workbook Preview</p>
                <p className="text-xs text-slate-500">XLSX format with tabular data ready for column mapping.</p>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="border-t pt-3 flex justify-between text-[10px] text-slate-400">
              <span>Uploader: {document.uploader}</span>
              <span>Recorded: {new Date(document.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
