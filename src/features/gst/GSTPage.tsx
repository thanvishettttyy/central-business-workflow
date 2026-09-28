import React, { useState } from 'react';
import { 
  FileCheck, Shield, Upload, Download, AlertCircle, 
  Search, Filter, CheckCircle2, TrendingUp, Landmark, Calendar, RefreshCw 
} from 'lucide-react';
import { GSTRecord, Customer } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { GSTService } from '../../services/gstService';
import { db } from '../../services/db';

interface GSTPageProps {
  gstRecords: GSTRecord[];
  customers: Customer[];
  onRefresh: () => void;
}

export const GSTPage: React.FC<GSTPageProps> = ({
  gstRecords,
  customers,
  onRefresh,
}) => {
  const [periodFilter, setPeriodFilter] = useState('September 2026');
  const [selectedCustomer, setSelectedCustomer] = useState('All');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const filtered = gstRecords.filter(g => {
    const matchesPeriod = periodFilter === 'All' || g.period === periodFilter;
    const matchesCustomer = selectedCustomer === 'All' || g.customerId === selectedCustomer;
    return matchesPeriod && matchesCustomer;
  });

  const summary = GSTService.calculateSummary(filtered);

  return (
    <div className="space-y-5">
      {/* Header with Explicit Compliance Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <span>GST Compliance Management</span>
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Imported / Local Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal GST calculation, Input Tax Credit verification, and filing cycle reconciliation. Ready for authorized GSP API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Simulate importing sales register
              GSTService.importFromSpreadsheet(
                [
                  { TaxableValue: 1200000, CGST: 108000, SGST: 108000, IGST: 0 },
                  { TaxableValue: 850000, CGST: 76500, SGST: 76500, IGST: 0 }
                ],
                customers[0]?.id || 'CUST-001',
                'September 2026',
                '2026-27'
              );
              onRefresh();
            }}
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            Import Sales Register
          </Button>
        </div>
      </div>

      {/* Official API Clarification Notice */}
      <div className="p-3 bg-slate-100/80 border border-slate-200 rounded-xl text-slate-700 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            GST figures are computed from validated local vouchers and registers. Government portal submission occurs exclusively through authorized GSP gateways.
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 font-semibold uppercase">Offline Safe</span>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Taxable Turnover</span>
          <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
            ₹{(summary.totalTaxable / 100000).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-500 font-medium">B2B + B2C supplies</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Output CGST</span>
          <div className="text-lg font-bold text-brand-600 mt-1 font-mono">
            ₹{(summary.totalCGST / 100000).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Central Tax Liability</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Output SGST</span>
          <div className="text-lg font-bold text-brand-600 mt-1 font-mono">
            ₹{(summary.totalSGST / 100000).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-500 font-medium">State Tax Liability</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Output IGST</span>
          <div className="text-lg font-bold text-brand-600 mt-1 font-mono">
            ₹{(summary.totalIGST / 100000).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Interstate Supplies</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Eligible ITC</span>
          <div className="text-lg font-bold text-emerald-600 mt-1 font-mono">
            ₹{(summary.totalITCClaimed / 100000).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Input Tax Credit</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Net Cash Payable</span>
          <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
            ₹{(summary.netPayable / 100000).toFixed(2)}L
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Estimated Challan</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filing Period:</span>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none"
            >
              <option value="All">All Periods</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Customer:</span>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
            >
              <option value="All">All Clients</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-medium">
          <span>{filtered.length} statutory records matched</span>
        </div>
      </div>

      {/* GST Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Filing Type</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Taxable Turnover</th>
                <th className="py-3 px-4">CGST</th>
                <th className="py-3 px-4">SGST</th>
                <th className="py-3 px-4">IGST</th>
                <th className="py-3 px-4">ITC Claimed</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-bold text-slate-900">{g.filingType}</td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{g.customerName}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{g.period}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    ₹{g.taxableAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">₹{g.cgst.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">₹{g.sgst.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">₹{g.igst.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald-600">
                    ₹{g.itcClaimed.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{g.dueDate}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={g.filingStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
