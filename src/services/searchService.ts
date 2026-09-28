import { db } from './db';

export interface SearchResultItem {
  id: string;
  type: 'Customer' | 'Document' | 'Requirement' | 'Task' | 'GST' | 'Accounting' | 'Calendar' | 'Communication';
  title: string;
  subtitle: string;
  category?: string;
  status?: string;
  date?: string;
  customerId?: string;
  raw: any;
}

export function performGlobalSearch(query: string, filterType?: string): SearchResultItem[] {
  const startTime = performance.now();
  if (!query || query.trim().length === 0) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResultItem[] = [];

  // 1. Search Customers
  if (!filterType || filterType === 'Customer') {
    const customers = db.getCustomers();
    for (const c of customers) {
      if (
        c.displayName.toLowerCase().includes(q) ||
        c.legalName.toLowerCase().includes(q) ||
        c.pan.toLowerCase().includes(q) ||
        c.gstin.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      ) {
        results.push({
          id: c.id,
          type: 'Customer',
          title: c.displayName,
          subtitle: `${c.legalName} • PAN: ${c.pan} • GSTIN: ${c.gstin}`,
          category: c.customerType,
          status: c.status,
          date: c.createdAt,
          customerId: c.id,
          raw: c,
        });
      }
    }
  }

  // 2. Search Documents
  if (!filterType || filterType === 'Document') {
    const docs = db.getDocuments();
    for (const d of docs) {
      if (
        d.filename.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.docType.toLowerCase().includes(q) ||
        (d.customerName && d.customerName.toLowerCase().includes(q))
      ) {
        results.push({
          id: d.id,
          type: 'Document',
          title: d.filename,
          subtitle: `${d.customerName || 'Customer'} • ${d.category} • ${d.docType}`,
          category: d.category,
          status: d.status,
          date: d.createdAt,
          customerId: d.customerId,
          raw: d,
        });
      }
    }
  }

  // 3. Search Requirements
  if (!filterType || filterType === 'Requirement') {
    const reqs = db.getRequirements();
    for (const r of reqs) {
      if (
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.customerName && r.customerName.toLowerCase().includes(q))
      ) {
        results.push({
          id: r.id,
          type: 'Requirement',
          title: r.title,
          subtitle: `${r.customerName || 'Customer'} • Period: ${r.period} • Due: ${r.dueDate}`,
          category: r.category,
          status: r.status,
          date: r.dueDate,
          customerId: r.customerId,
          raw: r,
        });
      }
    }
  }

  // 4. Search Tasks
  if (!filterType || filterType === 'Task') {
    const tasks = db.getTasks();
    for (const t of tasks) {
      if (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q) ||
        (t.customerName && t.customerName.toLowerCase().includes(q))
      ) {
        results.push({
          id: t.id,
          type: 'Task',
          title: t.title,
          subtitle: `${t.customerName || 'Internal'} • Assignee: ${t.assignee} • Priority: ${t.priority}`,
          category: t.priority,
          status: t.status,
          date: t.dueDate,
          customerId: t.customerId,
          raw: t,
        });
      }
    }
  }

  // 5. Search GST Records
  if (!filterType || filterType === 'GST') {
    const gsts = db.getGSTRecords();
    for (const g of gsts) {
      if (
        g.filingType.toLowerCase().includes(q) ||
        g.period.toLowerCase().includes(q) ||
        (g.customerName && g.customerName.toLowerCase().includes(q))
      ) {
        results.push({
          id: g.id,
          type: 'GST',
          title: `${g.filingType} - ${g.period}`,
          subtitle: `${g.customerName || 'Customer'} • Taxable: ₹${g.taxableAmount.toLocaleString('en-IN')}`,
          status: g.filingStatus,
          date: g.dueDate,
          customerId: g.customerId,
          raw: g,
        });
      }
    }
  }

  // 6. Search Accounting Vouchers & Ledgers
  if (!filterType || filterType === 'Accounting') {
    const ledgers = db.getLedgers();
    for (const l of ledgers) {
      if (
        l.ledgerName.toLowerCase().includes(q) ||
        l.companyName.toLowerCase().includes(q) ||
        l.ledgerGroup.toLowerCase().includes(q)
      ) {
        results.push({
          id: l.id,
          type: 'Accounting',
          title: l.ledgerName,
          subtitle: `${l.companyName} • Group: ${l.ledgerGroup} • Balance: ₹${l.closingBalance.toLocaleString('en-IN')}`,
          category: l.ledgerGroup,
          raw: l,
        });
      }
    }
  }

  const duration = performance.now() - startTime;
  console.log(`[Search] Completed query "${query}" in ${duration.toFixed(2)}ms (${results.length} matches)`);
  return results;
}
