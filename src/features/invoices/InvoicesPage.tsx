import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, Receipt, IndianRupee, Eye,
  Printer, Download, CheckCircle2, Clock, XCircle,
  Send, Trash2, Edit3, X, Save
} from 'lucide-react';
import { Invoice, InvoiceLineItem, InvoiceStatus, Customer } from '../../types';

// ─── helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const fmtINR = (n: number) => `₹${fmt(n)}`;

function newItem(): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    description: '',
    hsn: '',
    qty: 1,
    unit: 'Nos',
    rate: 0,
    gstPercent: 18,
    amount: 0,
    gstAmount: 0,
    total: 0,
  };
}

function calcItem(item: InvoiceLineItem): InvoiceLineItem {
  const amount = item.qty * item.rate;
  const gstAmount = (amount * item.gstPercent) / 100;
  return { ...item, amount, gstAmount, total: amount + gstAmount };
}

function buildInvoice(partial: Omit<Invoice, 'subtotal' | 'totalGST' | 'grandTotal'>): Invoice {
  const subtotal = partial.lineItems.reduce((s, l) => s + l.amount, 0);
  const totalGST = partial.lineItems.reduce((s, l) => s + l.gstAmount, 0);
  return { ...partial, subtotal, totalGST, grandTotal: subtotal + totalGST };
}

const STATUS_CFG: Record<InvoiceStatus, { label: string; color: string; icon: React.ReactNode }> = {
  Draft:     { label: 'Draft',     color: 'bg-slate-100 text-slate-600',  icon: <Edit3 className="w-3 h-3" /> },
  Sent:      { label: 'Sent',      color: 'bg-blue-100 text-blue-700',    icon: <Send className="w-3 h-3" /> },
  Paid:      { label: 'Paid',      color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 className="w-3 h-3" /> },
  Overdue:   { label: 'Overdue',   color: 'bg-rose-100 text-rose-700',    icon: <Clock className="w-3 h-3" /> },
  Cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500',    icon: <XCircle className="w-3 h-3" /> },
};

// ─── seed data ───────────────────────────────────────────────────────────────

const SEED: Invoice[] = [
  buildInvoice({
    id: 'inv-001', invoiceNumber: 'INV-2024-001',
    customerId: 'cust-001', customerName: 'Mehta Industries Pvt Ltd',
    gstin: '27AABCM1234F1Z5',
    issueDate: '2024-04-01', dueDate: '2024-04-30',
    status: 'Paid',
    lineItems: [calcItem({ id: 'li-1', description: 'Annual Accounting Services', hsn: '998231', qty: 1, unit: 'Year', rate: 75000, gstPercent: 18, amount: 0, gstAmount: 0, total: 0 })],
    notes: 'Payment received via NEFT',
    createdAt: '2024-04-01T10:00:00Z', updatedAt: '2024-04-05T10:00:00Z',
  }),
  buildInvoice({
    id: 'inv-002', invoiceNumber: 'INV-2024-002',
    customerId: 'cust-002', customerName: 'Sharma & Sons',
    gstin: '07AAEFS1234G1ZS',
    issueDate: '2024-04-10', dueDate: '2024-05-10',
    status: 'Overdue',
    lineItems: [
      calcItem({ id: 'li-2', description: 'GST Filing Q4 FY24', hsn: '998231', qty: 1, unit: 'Nos', rate: 12000, gstPercent: 18, amount: 0, gstAmount: 0, total: 0 }),
      calcItem({ id: 'li-3', description: 'TDS Return Filing', hsn: '998231', qty: 2, unit: 'Nos', rate: 4000, gstPercent: 18, amount: 0, gstAmount: 0, total: 0 }),
    ],
    notes: '',
    createdAt: '2024-04-10T10:00:00Z', updatedAt: '2024-04-10T10:00:00Z',
  }),
  buildInvoice({
    id: 'inv-003', invoiceNumber: 'INV-2024-003',
    customerId: 'cust-003', customerName: 'Patel Constructions LLP',
    gstin: '24AABCP5678H1Z2',
    issueDate: '2024-05-01', dueDate: '2024-05-31',
    status: 'Sent',
    lineItems: [calcItem({ id: 'li-4', description: 'Tax Audit FY24', hsn: '998231', qty: 1, unit: 'Nos', rate: 45000, gstPercent: 18, amount: 0, gstAmount: 0, total: 0 })],
    notes: 'Awaiting client confirmation',
    createdAt: '2024-05-01T10:00:00Z', updatedAt: '2024-05-01T10:00:00Z',
  }),
  buildInvoice({
    id: 'inv-004', invoiceNumber: 'INV-2024-004',
    customerId: 'cust-001', customerName: 'Mehta Industries Pvt Ltd',
    gstin: '27AABCM1234F1Z5',
    issueDate: '2024-05-15', dueDate: '2024-06-14',
    status: 'Draft',
    lineItems: [calcItem({ id: 'li-5', description: 'MCA Compliance Filing', hsn: '998231', qty: 1, unit: 'Nos', rate: 8000, gstPercent: 18, amount: 0, gstAmount: 0, total: 0 })],
    notes: '',
    createdAt: '2024-05-15T10:00:00Z', updatedAt: '2024-05-15T10:00:00Z',
  }),
];

// ─── sub-components ──────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
};

// ─── Invoice Form Modal ───────────────────────────────────────────────────────

interface InvoiceFormProps {
  customers: Customer[];
  initial?: Invoice;
  onSave: (inv: Invoice) => void;
  onClose: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ customers, initial, onSave, onClose }) => {
  const today = new Date().toISOString().slice(0, 10);
  const due30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const [customerId, setCustomerId] = useState(initial?.customerId ?? '');
  const [issueDate, setIssueDate] = useState(initial?.issueDate ?? today);
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? due30);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [items, setItems] = useState<InvoiceLineItem[]>(initial?.lineItems ?? [newItem()]);
  const [status, setStatus] = useState<InvoiceStatus>(initial?.status ?? 'Draft');

  const selectedCustomer = customers.find(c => c.id === customerId);

  const updateItem = (idx: number, patch: Partial<InvoiceLineItem>) => {
    setItems(prev => {
      const next = [...prev];
      next[idx] = calcItem({ ...next[idx], ...patch });
      return next;
    });
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, l) => s + l.amount, 0);
  const totalGST = items.reduce((s, l) => s + l.gstAmount, 0);
  const grandTotal = subtotal + totalGST;

  const handleSave = () => {
    if (!customerId) return alert('Please select a customer.');
    if (items.length === 0) return alert('Add at least one line item.');

    const invoiceNum = initial?.invoiceNumber ?? `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
    const inv = buildInvoice({
      id: initial?.id ?? crypto.randomUUID(),
      invoiceNumber: invoiceNum,
      customerId,
      customerName: selectedCustomer?.displayName ?? '',
      gstin: selectedCustomer?.gstin ?? '',
      issueDate, dueDate, status, lineItems: items, notes,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    onSave(inv);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initial ? `Edit ${initial.invoiceNumber}` : 'New Invoice'}
              </h2>
              <p className="text-xs text-slate-500">GST-compliant tax invoice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Top row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Customer *</label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select customer…</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
              </select>
              {selectedCustomer && (
                <p className="text-[11px] text-slate-500 mt-1 font-mono">GSTIN: {selectedCustomer.gstin || '—'}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Issue Date</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Line Items</h3>
              <button
                onClick={() => setItems(prev => [...prev, newItem()])}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-2 py-2 text-left w-20">HSN</th>
                    <th className="px-2 py-2 text-right w-14">Qty</th>
                    <th className="px-2 py-2 text-left w-16">Unit</th>
                    <th className="px-2 py-2 text-right w-24">Rate (₹)</th>
                    <th className="px-2 py-2 text-right w-16">GST %</th>
                    <th className="px-2 py-2 text-right w-24">Amount (₹)</th>
                    <th className="px-2 py-2 text-right w-24">Total (₹)</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-1.5">
                        <input value={item.description}
                          onChange={e => updateItem(idx, { description: e.target.value })}
                          placeholder="Service / product description"
                          className="w-full border-0 focus:outline-none bg-transparent text-slate-800 placeholder-slate-300" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input value={item.hsn}
                          onChange={e => updateItem(idx, { hsn: e.target.value })}
                          placeholder="998231"
                          className="w-full border-0 focus:outline-none bg-transparent text-slate-600 font-mono placeholder-slate-300" />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" min={1} value={item.qty}
                          onChange={e => updateItem(idx, { qty: Number(e.target.value) })}
                          className="w-full border-0 focus:outline-none bg-transparent text-right text-slate-800" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={item.unit} onChange={e => updateItem(idx, { unit: e.target.value })}
                          className="border-0 bg-transparent text-slate-600 focus:outline-none text-xs">
                          {['Nos','Year','Month','Hrs','Sets','Kg','Ltr'].map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" min={0} value={item.rate}
                          onChange={e => updateItem(idx, { rate: Number(e.target.value) })}
                          className="w-full border-0 focus:outline-none bg-transparent text-right text-slate-800" />
                      </td>
                      <td className="px-2 py-1.5">
                        <select value={item.gstPercent} onChange={e => updateItem(idx, { gstPercent: Number(e.target.value) })}
                          className="border-0 bg-transparent text-slate-600 focus:outline-none text-xs">
                          {[0, 5, 12, 18, 28].map(g => <option key={g} value={g}>{g}%</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5 text-right font-mono text-slate-700">{fmt(item.amount)}</td>
                      <td className="px-2 py-1.5 text-right font-mono font-semibold text-slate-900">{fmt(item.total)}</td>
                      <td className="px-2 py-1.5 text-center">
                        {items.length > 1 && (
                          <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-rose-500 transition cursor-pointer">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals + Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                placeholder="Payment terms, bank details, any remarks…"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{fmtINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total GST</span>
                <span className="font-mono">{fmtINR(totalGST)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-base border-t border-slate-200 pt-2 mt-2">
                <span>Grand Total</span>
                <span className="font-mono">{fmtINR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Status + Actions */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-600">Status:</label>
              <select value={status} onChange={e => setStatus(e.target.value as InvoiceStatus)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500">
                {(Object.keys(STATUS_CFG) as InvoiceStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave}
                className="px-5 py-2 text-sm font-semibold bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition flex items-center gap-1.5 shadow-sm cursor-pointer">
                <Save className="w-4 h-4" /> Save Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Invoice Preview Modal ────────────────────────────────────────────────────

const InvoicePreview: React.FC<{ invoice: Invoice; onClose: () => void }> = ({ invoice, onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 print:hidden">
        <h2 className="text-base font-bold text-slate-900">Invoice Preview</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 cursor-pointer">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Print-ready content */}
      <div className="p-8 space-y-6">
        {/* Company + Invoice header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-brand-700">TAX INVOICE</h1>
            <p className="text-xs text-slate-500 mt-1">Central Business Workflow</p>
            <p className="text-xs text-slate-500 font-mono">GSTIN: 27AAABC1234D1Z5</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 text-lg">{invoice.invoiceNumber}</p>
            <p className="text-xs text-slate-600">Date: {invoice.issueDate}</p>
            <p className="text-xs text-slate-600">Due: {invoice.dueDate}</p>
            <div className="mt-1"><StatusBadge status={invoice.status} /></div>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bill To</p>
          <p className="font-bold text-slate-900">{invoice.customerName}</p>
          <p className="text-xs text-slate-600 font-mono">GSTIN: {invoice.gstin || '—'}</p>
        </div>

        {/* Line items */}
        <table className="w-full text-xs">
          <thead className="bg-brand-700 text-white">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left">HSN</th>
              <th className="px-2 py-2 text-right">Qty</th>
              <th className="px-2 py-2 text-right">Rate</th>
              <th className="px-2 py-2 text-right">GST%</th>
              <th className="px-2 py-2 text-right">Amount</th>
              <th className="px-2 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.lineItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-3 py-2 text-slate-500">{idx + 1}</td>
                <td className="px-3 py-2 text-slate-800">{item.description}</td>
                <td className="px-2 py-2 text-slate-500 font-mono">{item.hsn}</td>
                <td className="px-2 py-2 text-right text-slate-700">{item.qty} {item.unit}</td>
                <td className="px-2 py-2 text-right text-slate-700 font-mono">{fmtINR(item.rate)}</td>
                <td className="px-2 py-2 text-right text-slate-600">{item.gstPercent}%</td>
                <td className="px-2 py-2 text-right text-slate-700 font-mono">{fmtINR(item.amount)}</td>
                <td className="px-2 py-2 text-right font-semibold text-slate-900 font-mono">{fmtINR(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50 font-semibold">
            <tr>
              <td colSpan={6} className="px-3 py-2 text-right text-xs text-slate-600">Subtotal</td>
              <td colSpan={2} className="px-2 py-2 text-right font-mono">{fmtINR(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={6} className="px-3 py-2 text-right text-xs text-slate-600">Total GST</td>
              <td colSpan={2} className="px-2 py-2 text-right font-mono">{fmtINR(invoice.totalGST)}</td>
            </tr>
            <tr className="bg-brand-50 text-brand-900">
              <td colSpan={6} className="px-3 py-3 text-right text-sm font-bold">Grand Total</td>
              <td colSpan={2} className="px-2 py-3 text-right font-mono text-base font-bold">{fmtINR(invoice.grandTotal)}</td>
            </tr>
          </tfoot>
        </table>

        {invoice.notes && (
          <div className="border-t border-slate-200 pt-4">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Notes</p>
            <p className="text-xs text-slate-700">{invoice.notes}</p>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
          This is a computer-generated invoice. Thank you for your business.
        </p>
      </div>
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

interface InvoicesPageProps {
  customers: Customer[];
  selectedCustomerId?: string;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ customers, selectedCustomerId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(SEED);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'All'>('All');
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | undefined>(undefined);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | undefined>(undefined);

  const filtered = useMemo(() => {
    let list = invoices;
    if (selectedCustomerId) list = list.filter(i => i.customerId === selectedCustomerId);
    if (statusFilter !== 'All') list = list.filter(i => i.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        i.customerName.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [invoices, selectedCustomerId, statusFilter, search]);

  const totals = useMemo(() => ({
    total: invoices.reduce((s, i) => s + i.grandTotal, 0),
    paid: invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.grandTotal, 0),
    outstanding: invoices.filter(i => ['Sent', 'Overdue'].includes(i.status)).reduce((s, i) => s + i.grandTotal, 0),
    overdue: invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.grandTotal, 0),
  }), [invoices]);

  const handleSave = (inv: Invoice) => {
    setInvoices(prev => {
      const idx = prev.findIndex(i => i.id === inv.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = inv; return next; }
      return [inv, ...prev];
    });
    setShowForm(false);
    setEditInvoice(undefined);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this invoice permanently?')) {
      setInvoices(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Invoices & Billing</h1>
            <p className="text-xs text-slate-500">GST-compliant tax invoices</p>
          </div>
        </div>
        <button
          onClick={() => { setEditInvoice(undefined); setShowForm(true); }}
          className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 text-white text-sm font-semibold rounded-lg hover:bg-brand-700 transition shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {[
          { label: 'Total Invoiced', value: totals.total, color: 'text-slate-900', bg: 'bg-slate-50 border-slate-200' },
          { label: 'Collected', value: totals.paid, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
          { label: 'Outstanding', value: totals.outstanding, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
          { label: 'Overdue', value: totals.overdue, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
        ].map(k => (
          <div key={k.label} className={`rounded-xl border p-4 ${k.bg}`}>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{k.label}</p>
            <div className={`flex items-center gap-1.5 text-lg font-bold font-mono ${k.color}`}>
              <IndianRupee className="w-4 h-4" />
              {fmt(k.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="px-6 pb-3 flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoice# or customer…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          {(['All', 'Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Invoice #</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Issue Date</th>
                <th className="px-4 py-3 text-left">Due Date</th>
                <th className="px-4 py-3 text-right">Amount (₹)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    No invoices match your filters.
                  </td>
                </tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-brand-700">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{inv.customerName}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.issueDate}</td>
                  <td className="px-4 py-3 text-slate-600">{inv.dueDate}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">{fmtINR(inv.grandTotal)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {/* Quick status change */}
                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'Sent')}
                          title="Mark as Sent"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {inv.status === 'Sent' && (
                        <button
                          onClick={() => handleStatusChange(inv.id, 'Paid')}
                          title="Mark as Paid"
                          className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setPreviewInvoice(inv)}
                        title="Preview"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setEditInvoice(inv); setShowForm(true); }}
                        title="Edit"
                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(inv.id)}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <InvoiceForm
          customers={customers}
          initial={editInvoice}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditInvoice(undefined); }}
        />
      )}
      {previewInvoice && (
        <InvoicePreview invoice={previewInvoice} onClose={() => setPreviewInvoice(undefined)} />
      )}
    </div>
  );
};

export default InvoicesPage;
