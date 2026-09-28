import * as XLSX from 'xlsx';

export interface ColumnMappingRule {
  sourceColumn: string;
  targetField: string;
  required?: boolean;
}

export interface ExcelImportPreview {
  sheetNames: string[];
  selectedSheet: string;
  headers: string[];
  rawRows: any[];
  totalRows: number;
  duplicateCount: number;
  errors: string[];
}

export class ExcelService {
  /**
   * Parse an Excel or CSV file buffer and return structured inspection preview
   */
  public static async parseFile(file: File): Promise<ExcelImportPreview> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0] || 'Sheet1';
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with headers
    const rawData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
    const headers: string[] = (rawData[0] as string[]) || [];
    const rows = rawData.slice(1).filter(r => Array.isArray(r) && r.length > 0);

    // Duplicate detection based on first column or invoice/ref key
    const seen = new Set<string>();
    let duplicateCount = 0;
    rows.forEach(r => {
      const key = String(r[0] || '');
      if (key && seen.has(key)) {
        duplicateCount++;
      } else if (key) {
        seen.add(key);
      }
    });

    return {
      sheetNames: workbook.SheetNames,
      selectedSheet: sheetName,
      headers: headers.map(h => String(h).trim()),
      rawRows: rows.slice(0, 100), // Preview top 100
      totalRows: rows.length,
      duplicateCount,
      errors: duplicateCount > 0 ? [`Found ${duplicateCount} potential duplicate keys in first column.`] : [],
    };
  }

  /**
   * Export structured data to XLSX download
   */
  public static exportToExcel(data: any[], filename: string, sheetTitle = 'Data') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetTitle);
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  /**
   * Default accounting & GST column mapping suggestions
   */
  public static getDefaultMappings(): Record<string, string[]> {
    return {
      Date: ['Date', 'Voucher Date', 'Txn Date', 'Invoice Date', 'Posting Date'],
      Description: ['Particulars', 'Description', 'Narration', 'Item Description', 'Remarks'],
      VoucherNumber: ['Voucher No', 'Invoice No', 'Vch No', 'Ref No', 'Bill No'],
      PartyName: ['Party Name', 'Customer', 'Supplier', 'Account', 'Ledger Name'],
      GSTIN: ['GSTIN', 'GST No', 'Tax ID', 'Supplier GSTIN'],
      Debit: ['Debit', 'Dr Amount', 'Withdrawal', 'Debit (INR)'],
      Credit: ['Credit', 'Cr Amount', 'Deposit', 'Credit (INR)'],
      Balance: ['Balance', 'Closing Balance', 'Net Amount'],
      TaxableValue: ['Taxable Value', 'Taxable Amount', 'Basic Amount'],
      CGST: ['CGST', 'Central Tax', 'CGST Amount'],
      SGST: ['SGST', 'State Tax', 'SGST Amount'],
      IGST: ['IGST', 'Integrated Tax', 'IGST Amount'],
    };
  }
}
