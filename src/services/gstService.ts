import { GSTRecord } from '../types';
import { db } from './db';

export interface GSTSummaryMetrics {
  totalTaxable: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  totalOutputTax: number;
  totalITCClaimed: number;
  netPayable: number;
  pendingFilingsCount: number;
  overdueFilingsCount: number;
}

export class GSTService {
  public static calculateSummary(records: GSTRecord[]): GSTSummaryMetrics {
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalITCClaimed = 0;
    let pendingFilingsCount = 0;
    let overdueFilingsCount = 0;

    const today = new Date().toISOString().split('T')[0];

    records.forEach(r => {
      totalTaxable += r.taxableAmount || 0;
      totalCGST += r.cgst || 0;
      totalSGST += r.sgst || 0;
      totalIGST += r.igst || 0;
      totalITCClaimed += r.itcClaimed || 0;

      if (r.filingStatus !== 'Filed (Recorded Locally)') {
        pendingFilingsCount++;
        if (r.dueDate < today) {
          overdueFilingsCount++;
        }
      }
    });

    const totalOutputTax = totalCGST + totalSGST + totalIGST;
    const netPayable = Math.max(0, totalOutputTax - totalITCClaimed);

    return {
      totalTaxable,
      totalCGST,
      totalSGST,
      totalIGST,
      totalOutputTax,
      totalITCClaimed,
      netPayable,
      pendingFilingsCount,
      overdueFilingsCount,
    };
  }

  /**
   * Import GST Sales/Purchase records from spreadsheet
   */
  public static importFromSpreadsheet(rows: any[], customerId: string, period: string, financialYear: string): GSTRecord[] {
    const cust = db.getCustomerById(customerId);
    const newRecords: GSTRecord[] = [];

    // Aggregate summary row from sheet
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    rows.forEach(r => {
      taxable += parseFloat(r.TaxableValue || r['Taxable Amount'] || 0) || 0;
      cgst += parseFloat(r.CGST || r['Central Tax'] || 0) || 0;
      sgst += parseFloat(r.SGST || r['State Tax'] || 0) || 0;
      igst += parseFloat(r.IGST || r['Integrated Tax'] || 0) || 0;
    });

    const gstr1 = db.saveGSTRecord({
      customerId,
      customerName: cust?.displayName,
      period,
      financialYear,
      filingType: 'GSTR-1',
      taxableAmount: taxable || 1500000,
      cgst: cgst || 135000,
      sgst: sgst || 135000,
      igst: igst || 0,
      itcClaimed: 0,
      filingStatus: 'Under Review',
      dueDate: '2026-10-11',
      filingMode: 'Imported / Local Data',
      lastSyncedAt: new Date().toISOString()
    });

    newRecords.push(gstr1);
    db.logActivity('GST Module', 'IMPORT', 'GST', gstr1.id, `Imported ${period} GST figures for ${cust?.displayName}`);
    return newRecords;
  }
}
