import React, { useState } from 'react';
import { 
  ArrowRightLeft, FileSpreadsheet, Download, Plus, 
  Trash2, Edit2, Sparkles, CheckCircle2, ShieldCheck, FileText 
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Customer } from '../../types';
import { ExcelService } from '../../services/excelService';
import { db } from '../../services/db';

interface PDFToExcelPageProps {
  customers: Customer[];
}

export const PDFToExcelPage: React.FC<PDFToExcelPageProps> = ({ customers }) => {
  const [sourcePdf, setSourcePdf] = useState('Vendor_Tax_Invoice_Bundle.pdf');
  const [targetCustomerId, setTargetCustomerId] = useState(customers[0]?.id || '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [tableExtracted, setTableExtracted] = useState(true);

  // Extracted Table State (editable interactive table)
  const [headers, setHeaders] = useState<string[]>([
    'Item Description',
    'HSN/SAC',
    'Qty',
    'Unit Price (₹)',
    'Taxable Value (₹)',
    'GST Rate',
    'Total Amount (₹)'
  ]);

  const [rows, setRows] = useState<string[][]>([
    ['Enterprise Cloud Hosting - Annual Plan', '998315', '1', '1,20,000.00', '1,20,000.00', '18%', '1,41,600.00'],
    ['SSL Wildcard Certificate Installation', '998313', '1', '15,000.00', '15,000.00', '18%', '17,700.00'],
    ['Database Replication Setup', '998319', '1', '10,000.00', '10,000.00', '18%', '11,800.00'],
    ['Dedicated Network Firewall Appliance', '851762', '2', '25,000.00', '50,000.00', '18%', '59,000.00']
  ]);

  const [isExported, setIsExported] = useState(false);

  const handleCellChange = (rowIndex: number, colIndex: number, val: string) => {
    const updated = rows.map((r, rIdx) => 
      rIdx === rowIndex ? r.map((c, cIdx) => (cIdx === colIndex ? val : c)) : r
    );
    setRows(updated);
  };

  const addRow = () => {
    setRows([...rows, ['New Item Description', '998311', '1', '0.00', '0.00', '18%', '0.00']]);
  };

  const removeRow = (idx: number) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleExportXLSX = () => {
    // Format JSON array from headers and rows
    const data = rows.map(r => {
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] || '';
      });
      return obj;
    });

    const filename = `Extracted_Invoice_Table_${sourcePdf.replace('.pdf', '')}`;
    ExcelService.exportToExcel(data, filename, 'ExtractedTable');

    // Attach output XLSX to target customer in local database
    const cust = db.getCustomerById(targetCustomerId);
    db.saveDocument({
      customerId: targetCustomerId,
      customerName: cust?.displayName,
      filename: `${filename}.xlsx`,
      filePath: `customers/${targetCustomerId}/Exports/${filename}.xlsx`,
      category: 'Invoices',
      docType: 'Extracted Excel Sheet',
      period: 'September 2026',
      fileType: 'XLSX',
      sizeBytes: 45200,
      checksum: `sha256-table-export-${Date.now()}`,
      status: 'Approved',
      uploader: db.getCurrentUser().name,
    });

    db.logActivity(
      db.getCurrentUser().name,
      'EXCEL_EXPORT',
      'Document',
      undefined,
      `Converted PDF table to Excel & attached to ${cust?.displayName}`
    );

    setIsExported(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
          <span>PDF → Excel Table Conversion</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Detect tabular grids in native or scanned PDFs, inspect cells, correct confidence flags, and export to XLSX.
        </p>
      </div>

      {/* Control Card */}
      <Card title="Source PDF & Extraction Settings" subtitle="Configure table detection and target client">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Input PDF Document</label>
            <select
              value={sourcePdf}
              onChange={(e) => setSourcePdf(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
            >
              <option value="Vendor_Tax_Invoice_Bundle.pdf">Vendor_Tax_Invoice_Bundle.pdf (Multi-item Invoice)</option>
              <option value="Bank_Statement_HDFC_Sept2026.pdf">Bank_Statement_HDFC_Sept2026.pdf (Transaction Table)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Attach Output to Customer</label>
            <select
              value={targetCustomerId}
              onChange={(e) => setTargetCustomerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          </div>

          <div>
            <Button
              onClick={handleExportXLSX}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              icon={<FileSpreadsheet className="w-4 h-4" />}
            >
              Export XLSX & Attach to Client
            </Button>
          </div>
        </div>
      </Card>

      {/* Interactive Table Preview and Cell Editor */}
      {tableExtracted && (
        <Card
          title="Extracted Table Grid Preview"
          subtitle="Click any cell to edit or correct OCR extractions before generating the spreadsheet"
          action={
            <Button size="sm" variant="outline" onClick={addRow} icon={<Plus className="w-3.5 h-3.5" />}>
              Add Row
            </Button>
          }
        >
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  {headers.map((h, idx) => (
                    <th key={idx} className="py-2.5 px-3 border-l border-slate-200">
                      {h}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 w-12 text-center border-l border-slate-200">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-1 border-l border-slate-200">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellChange(rIdx, cIdx, e.target.value)}
                          className="w-full text-xs px-2 py-1 bg-transparent hover:bg-white focus:bg-white rounded border border-transparent focus:border-brand-500 focus:outline-none"
                        />
                      </td>
                    ))}
                    <td className="py-2 px-2 text-center border-l border-slate-200">
                      <button
                        onClick={() => removeRow(rIdx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isExported && (
            <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Spreadsheet generated and automatically attached to the client profile documents!</span>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
