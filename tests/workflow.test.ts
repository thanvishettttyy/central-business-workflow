import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../src/services/db';
import { GSTService } from '../src/services/gstService';
import { performGlobalSearch } from '../src/services/searchService';
import { OCRService } from '../src/services/ocrService';
import { ExcelService } from '../src/services/excelService';

describe('Central Business Workflow - End-to-End System Tests', () => {
  beforeEach(() => {
    db.resetDemoData();
  });

  it('Section 34: Customer 360° Data Relationship Integration', () => {
    const customers = db.getCustomers();
    expect(customers.length).toBeGreaterThanOrEqual(4);

    const cust = customers[0];
    const docs = db.getDocuments(cust.id);
    const reqs = db.getRequirements(cust.id);
    const tasks = db.getTasks(cust.id);
    const gst = db.getGSTRecords(cust.id);
    const ledgers = db.getLedgers(cust.id);

    // Verify all modules link back to this customer
    expect(docs.length).toBeGreaterThan(0);
    expect(reqs.length).toBeGreaterThan(0);
    expect(tasks.length).toBeGreaterThan(0);
    expect(gst.length).toBeGreaterThan(0);
    expect(ledgers.length).toBeGreaterThan(0);

    docs.forEach(d => expect(d.customerId).toBe(cust.id));
    reqs.forEach(r => expect(r.customerId).toBe(cust.id));
    tasks.forEach(t => expect(t.customerId).toBe(cust.id));
    gst.forEach(g => expect(g.customerId).toBe(cust.id));
  });

  it('Section 24: High-Performance Global Search under 300ms', () => {
    const start = performance.now();
    const results = performGlobalSearch('ABC');
    const elapsed = performance.now() - start;

    expect(results.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(300); // Target: Typical search under 300ms

    const custResult = results.find(r => r.type === 'Customer');
    expect(custResult).toBeDefined();
    expect(custResult?.title).toContain('ABC');
  });

  it('Section 7: GST Calculation and Non-portal submission verification', () => {
    const records = db.getGSTRecords();
    const summary = GSTService.calculateSummary(records);

    expect(summary.totalTaxable).toBeGreaterThan(0);
    expect(summary.totalCGST).toBeGreaterThan(0);
    expect(summary.totalSGST).toBeGreaterThan(0);
    expect(summary.netPayable).toBeGreaterThanOrEqual(0);

    // Confirm that filingMode explicitly says "Imported / Local Data"
    records.forEach(r => {
      expect(r.filingMode).toBe('Imported / Local Data');
    });
  });

  it('Section 10: Local PaddleOCR with Confidence Thresholds & Flagging', async () => {
    const ocrResult = await OCRService.processDocument({
      name: 'Bank_Statement_HDFC_Sept2026.pdf',
      size: 285400
    });

    expect(ocrResult.status).toBe('Needs Review');
    expect(ocrResult.overallConfidence).toBeGreaterThan(90);
    expect(ocrResult.fields.length).toBeGreaterThan(0);

    // Verify low-confidence (<80%) flagging for human verification
    const flaggedFields = ocrResult.fields.filter(f => f.flagged);
    expect(flaggedFields.length).toBeGreaterThan(0);
    flaggedFields.forEach(f => {
      expect(f.confidence).toBeLessThan(80);
    });
  });

  it('Section 12: Bulk Requirement Template Rollout to Multiple Customers', () => {
    const initialReqCount = db.getRequirements().length;
    const template = db.getTemplates()[0];
    const customerIds = ['CUST-001', 'CUST-002'];

    db.bulkCreateFromTemplate(template.id, customerIds, '2026-11-10', 'November 2026');
    const newReqCount = db.getRequirements().length;

    expect(newReqCount).toBe(initialReqCount + 2);
  });

  it('Section 22: Disaster Recovery & Atomic Safety Backup', () => {
    const initialBackups = db.getBackups().length;
    const newBackup = db.createBackup();

    expect(newBackup.verified).toBe(true);
    expect(newBackup.status).toBe('Completed');
    expect(db.getBackups().length).toBe(initialBackups + 1);
  });
});
