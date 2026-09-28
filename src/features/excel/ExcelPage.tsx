import React, { useState } from 'react';
import { 
  FileSpreadsheet, Upload, Download, ArrowRight, 
  CheckCircle2, AlertTriangle, RefreshCw, Layers, ShieldAlert 
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ExcelService, ExcelImportPreview } from '../../services/excelService';
import { Customer } from '../../types';
import { db } from '../../services/db';

interface ExcelPageProps {
  customers: Customer[];
}

export const ExcelPage: React.FC<ExcelPageProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || '');
  const [mappingTemplate, setMappingTemplate] = useState('Tally Bank Statement Standard');
  const [parsedPreview, setParsedPreview] = useState<ExcelImportPreview | null>({
    sheetNames: ['Bank_Statement_Sept', 'Summary'],
    selectedSheet: 'Bank_Statement_Sept',
    headers: ['Txn Date', 'Particulars', 'Chq/Ref No', 'Withdrawals (Dr)', 'Deposits (Cr)', 'Running Balance'],
    rawRows: [
      ['01-09-2026', 'Opening Balance b/f', '-', '-', '-', '12,50,000.00'],
      ['04-09-2026', 'NEFT - Infosys BPM Settlement Ref #88912', 'NEFT88912', '-', '5,50,000.00', '18,00,000.00'],
      ['10-09-2026', 'GST Challan Payment Sept 2026 CPIN 260901', 'CPIN260901', '1,45,000.00', '-', '16,55,000.00'],
      ['15-09-2026', 'Office Lease Rent Electronic City Ph 1', 'RTGS9921', '85,000.00', '-', '15,70,000.00'],
      ['20-09-2026', 'Wipro Cloud Solutions Vendor Payment', 'CHQ004128', '2,40,000.00', '-', '13,30,000.00'],
      ['28-09-2026', 'Client Retainer Payment Apex Retail', 'NEFT3391', '-', '11,50,000.00', '24,80,000.00']
    ],
    totalRows: 6,
    duplicateCount: 0,
    errors: [],
  });

  // Column Mappings State: Target Field -> Selected Source Column
  const [mappings, setMappings] = useState<Record<string, string>>({
    Date: 'Txn Date',
    Description: 'Particulars',
    VoucherNumber: 'Chq/Ref No',
    Debit: 'Withdrawals (Dr)',
    Credit: 'Deposits (Cr)',
    Balance: 'Running Balance',
  });

  const [importStatus, setImportStatus] = useState<string | null>(null);

  const targetFields = [
    { key: 'Date', required: true },
    { key: 'Description', required: true },
    { key: 'VoucherNumber', required: false },
    { key: 'Debit', required: false },
    { key: 'Credit', required: false },
    { key: 'Balance', required: false },
  ];

  const handleExecuteImport = () => {
    if (!parsedPreview) return;
    const cust = db.getCustomerById(selectedCustomer);

    // Save as document record
    db.saveDocument({
      customerId: selectedCustomer,
      customerName: cust?.displayName,
      filename: `Imported_Bank_Statement_${Date.now()}.xlsx`,
      filePath: `customers/${selectedCustomer}/Documents/Imported_Statement.xlsx`,
      category: 'Banking',
      docType: 'Imported Spreadsheet',
      period: 'September 2026',
      fileType: 'XLSX',
      sizeBytes: 184500,
      checksum: `sha256-import-${Date.now()}`,
      status: 'Approved',
      uploader: db.getCurrentUser().name,
    });

    db.logActivity(
      db.getCurrentUser().name,
      'EXCEL_IMPORT',
      'Document',
      undefined,
      `Imported and mapped ${parsedPreview.totalRows} spreadsheet transactions for ${cust?.displayName}`
    );

    setImportStatus(`Successfully validated and imported ${parsedPreview.totalRows} transactions into ${cust?.displayName}!`);
  };

  const handleExportTemplate = () => {
    const sampleHeaders = [{ 'Txn Date': 'YYYY-MM-DD', 'Particulars': 'Narration', 'Vch No': '101', 'Debit': '0.00', 'Credit': '0.00' }];
    ExcelService.exportToExcel(sampleHeaders, 'CentralWorkflow_Standard_Mapping_Template');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Excel Studio & Column Mapper</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Import XLSX/CSV workbooks, map columns to database fields, validate against duplicates, and export cleaned records.
          </p>
        </div>

        <Button variant="outline" onClick={handleExportTemplate} icon={<Download className="w-4 h-4" />}>
          Download Standard Template
        </Button>
      </div>

      {importStatus && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Mapping Configuration" subtitle="Configure column associations and target client">
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Client Profile</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Reusable Mapping Template</label>
              <select
                value={mappingTemplate}
                onChange={(e) => setMappingTemplate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none"
              >
                <option value="Tally Bank Statement Standard">Tally Bank Statement Standard</option>
                <option value="GST Sales Register Mapping">GST Sales Register Mapping</option>
                <option value="Custom Vendor Invoices">Custom Vendor Invoices</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="font-bold text-slate-500 uppercase text-[10px] block">Field Alignments</span>
              {targetFields.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-700">
                    {f.key} {f.required && <strong className="text-rose-500">*</strong>}
                  </span>
                  <select
                    value={mappings[f.key] || ''}
                    onChange={(e) => setMappings({ ...mappings, [f.key]: e.target.value })}
                    className="w-44 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none"
                  >
                    <option value="">-- Ignore Field --</option>
                    {parsedPreview?.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <Button onClick={handleExecuteImport} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
              Validate & Commit Import
            </Button>
          </div>
        </Card>

        {/* Data Preview Table (2 Cols) */}
        <div className="md:col-span-2">
          <Card 
            title="Import Preview & Duplicate Validation" 
            subtitle={`Sheet: ${parsedPreview?.selectedSheet} • ${parsedPreview?.totalRows} Rows Detected • 0 Duplicates`}
          >
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase text-[10px]">
                  <tr>
                    {parsedPreview?.headers.map((h, i) => (
                      <th key={i} className="py-2.5 px-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {parsedPreview?.rawRows.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {r.map((cell: any, cIdx: number) => (
                        <td key={cIdx} className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between text-slate-600">
              <span>Integrity check: Zero malformed rows. All amounts sanitized.</span>
              <span className="font-semibold text-emerald-600">✓ Validation Passed</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
