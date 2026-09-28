import React, { useState } from 'react';
import { 
  Eye, Upload, Sparkles, AlertCircle, CheckCircle, 
  FileText, Check, Save, RotateCcw, AlertTriangle, ShieldCheck 
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OCRField, OCRJobResult, Customer } from '../../types';
import { OCRService } from '../../services/ocrService';
import { db } from '../../services/db';

interface OCRPageProps {
  customers: Customer[];
  initialDocumentName?: string;
  onSavedResult?: () => void;
}

export const OCRPage: React.FC<OCRPageProps> = ({
  customers,
  initialDocumentName = 'Bank_Statement_HDFC_Sept2026.pdf',
  onSavedResult,
}) => {
  const [selectedFileName, setSelectedFileName] = useState(initialDocumentName);
  const [targetCustomerId, setTargetCustomerId] = useState(customers[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [ocrResult, setOcrResult] = useState<OCRJobResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const runOCR = async () => {
    setIsProcessing(true);
    setProgressPercent(0);
    setProgressStep('Starting local OCR pipeline...');
    setIsSaved(false);

    try {
      const result = await OCRService.processDocument(
        { name: selectedFileName, size: 285400 },
        (pct, step) => {
          setProgressPercent(pct);
          setProgressStep(step);
        }
      );
      setOcrResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldChange = (index: number, newValue: string) => {
    if (!ocrResult) return;
    const updated = [...ocrResult.fields];
    updated[index].value = newValue;
    // Once human edits it, mark verified/unflagged
    updated[index].flagged = false;
    setOcrResult({ ...ocrResult, fields: updated });
  };

  const handleSaveVerified = () => {
    if (!ocrResult) return;
    const cust = db.getCustomerById(targetCustomerId);
    
    // Save verified document metadata in DB
    db.saveDocument({
      customerId: targetCustomerId,
      customerName: cust?.displayName,
      filename: `VERIFIED_${selectedFileName}`,
      filePath: `customers/${targetCustomerId}/Documents/VERIFIED_${selectedFileName}`,
      category: 'Banking',
      docType: 'OCR Verified Statement',
      period: 'September 2026',
      fileType: 'PDF',
      sizeBytes: 285400,
      checksum: `sha256-ocr-verified-${Date.now()}`,
      status: 'Approved',
      uploader: db.getCurrentUser().name,
      ocrConfidence: ocrResult.overallConfidence,
    });

    db.logActivity(
      db.getCurrentUser().name,
      'OCR_SAVE',
      'Document',
      undefined,
      `Saved verified OCR extractions for ${selectedFileName} (${ocrResult.fields.length} fields)`
    );

    setIsSaved(true);
    onSavedResult?.();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-600" />
          <span>Local OCR Extraction & Human-in-the-Loop Verification</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Local PaddleOCR text detection. Extracted fields require human validation before saving to customer records.
        </p>
      </div>

      {/* Target Setup Card */}
      <Card title="Source Document Selection" subtitle="Process PDF or scanned invoice with local PaddleOCR engine">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document to Scan</label>
            <select
              value={selectedFileName}
              onChange={(e) => setSelectedFileName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Bank_Statement_HDFC_Sept2026.pdf">Bank_Statement_HDFC_Sept2026.pdf (Native PDF)</option>
              <option value="Purchase_Bills_Batch_1.pdf">Purchase_Bills_Batch_1.pdf (Scanned Invoices)</option>
              <option value="GST_REG06_Certificate.pdf">GST_REG06_Certificate.pdf (Scanned Certificate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assign to Customer</label>
            <select
              value={targetCustomerId}
              onChange={(e) => setTargetCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <Button
              onClick={runOCR}
              disabled={isProcessing}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              icon={<Sparkles className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />}
            >
              {isProcessing ? 'Extracting Text...' : 'Run Local PaddleOCR'}
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {isProcessing && (
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 animate-in fade-in">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>{progressStep}</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-purple-600 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* OCR Results & Human Correction Interface */}
      {ocrResult && (
        <div className="space-y-4 animate-in fade-in">
          {/* Quality Notice Bar */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-amber-900">Human-in-the-Loop Review Mandatory</h4>
              <p className="text-amber-800 mt-0.5">
                Overall Extraction Confidence: <strong>{ocrResult.overallConfidence}%</strong>. 
                Fields highlighted in yellow have confidence below 80% and must be verified against the physical document.
              </p>
            </div>
          </div>

          <Card
            title="Extracted Structured Fields"
            subtitle={`Engine: ${ocrResult.engine} • ${ocrResult.fields.length} key fields identified`}
            action={
              <Button 
                variant="success" 
                size="sm" 
                onClick={handleSaveVerified} 
                disabled={isSaved}
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                {isSaved ? 'Verified & Saved' : 'Approve & Save Verified Data'}
              </Button>
            }
          >
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ocrResult.fields.map((f, idx) => (
                  <div 
                    key={f.key}
                    className={`p-3 rounded-xl border transition-colors ${
                      f.flagged 
                        ? 'border-amber-400 bg-amber-50/40 ring-1 ring-amber-300' 
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700">{f.key}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          f.confidence >= 90 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : f.confidence >= 80 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-amber-200 text-amber-900'
                        }`}>
                          {f.confidence}%
                        </span>
                        {f.flagged && (
                          <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Review Required
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            {isSaved && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Verified data has been committed to the customer's permanent document archive.</span>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
