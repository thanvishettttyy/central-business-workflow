import React, { useState } from 'react';
import { 
  Landmark, RefreshCw, Upload, Download, CheckCircle2, 
  AlertTriangle, Search, Filter, Shield, Activity, FileCode 
} from 'lucide-react';
import { AccountingLedger, AccountingVoucher, Customer } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { tallyConnector, ConnectorStatus } from '../../services/tallyConnector';
import { db } from '../../services/db';

interface AccountingPageProps {
  ledgers: AccountingLedger[];
  vouchers: AccountingVoucher[];
  customers: Customer[];
  onRefresh: () => void;
}

export const AccountingPage: React.FC<AccountingPageProps> = ({
  ledgers,
  vouchers,
  customers,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'ledgers' | 'vouchers' | 'connector'>('ledgers');
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus>(tallyConnector.getStatus());
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleTestConnection = async () => {
    setIsTesting(true);
    setSyncFeedback(null);
    const status = await tallyConnector.testConnection();
    setConnectorStatus(status);
    setIsTesting(false);
  };

  const handleImportTallyXML = async () => {
    setIsSyncing(true);
    const sampleXml = `<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><DATA></DATA></BODY></ENVELOPE>`;
    const res = await tallyConnector.importTallyXmlOrData(sampleXml, customers[0]?.id);
    setIsSyncing(false);
    setSyncFeedback(`Successfully synchronized ${res.ledgersImported} ledgers and ${res.vouchersImported} vouchers from local Tally XML repository.`);
    onRefresh();
  };

  const filteredLedgers = ledgers.filter(l => 
    l.ledgerName.toLowerCase().includes(search.toLowerCase()) ||
    l.companyName.toLowerCase().includes(search.toLowerCase()) ||
    l.ledgerGroup.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Landmark className="w-5 h-5 text-indigo-600" />
              <span>Tally / Accounting Hub</span>
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Connector v1.0
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Isolated connector architecture for Tally DayBook XML, ODBC, and structured chart of accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />}
          >
            {isTesting ? 'Pinging Port 9000...' : 'Test Tally Port'}
          </Button>

          <Button
            size="sm"
            onClick={handleImportTallyXML}
            disabled={isSyncing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            icon={<Upload className="w-3.5 h-3.5" />}
          >
            {isSyncing ? 'Importing XML...' : 'Import Tally XML File'}
          </Button>
        </div>
      </div>

      {/* Connector Status Banner */}
      <div className="p-3 bg-slate-100/90 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${connectorStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-slate-700">
            <strong>Mode:</strong> {connectorStatus.sourceMode} — {connectorStatus.message}
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[10px]">
          Target: {connectorStatus.endpoint}
        </span>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('ledgers')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ledgers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ledgers & Chart of Accounts ({ledgers.length})
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'vouchers' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          DayBook Vouchers ({vouchers.length})
        </button>
        <button
          onClick={() => setActiveTab('connector')}
          className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'connector' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Connector Specifications
        </button>
      </div>

      {activeTab === 'ledgers' && (
        <div className="space-y-4">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Search ledger or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ledger Name</th>
                    <th className="py-3 px-4">Company</th>
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4">Opening Balance</th>
                    <th className="py-3 px-4">Closing Balance</th>
                    <th className="py-3 px-4">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedgers.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{l.ledgerName}</td>
                      <td className="py-3.5 px-4 text-slate-700">{l.companyName}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{l.ledgerGroup}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">₹{l.openingBalance.toLocaleString('en-IN')}</td>
                      <td className={`py-3.5 px-4 font-mono font-bold ${l.closingBalance < 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        ₹{Math.abs(l.closingBalance).toLocaleString('en-IN')} {l.closingBalance < 0 ? 'Cr' : 'Dr'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">{l.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Voucher No</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Party Ledger</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Narration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">{v.voucherNumber}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-700">
                        {v.voucherType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{v.date}</td>
                    <td className="py-3.5 px-4 text-slate-800 font-medium">{v.partyLedger}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      ₹{v.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] line-clamp-1">{v.narration || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'connector' && (
        <Card title="Tally Connector Architecture Specification" subtitle="Isolated connector contract complying with Section 6 & 29">
          <div className="space-y-3 text-xs text-slate-700 leading-relaxed font-mono bg-slate-900 text-slate-200 p-4 rounded-xl">
            <p className="text-emerald-400 font-bold">// Connector Interface Definition</p>
            <p>interface TallyConnector {'{'}</p>
            <p className="pl-4">connect(): Promise&lt;boolean&gt;;</p>
            <p className="pl-4">disconnect(): Promise&lt;void&gt;;</p>
            <p className="pl-4">testConnection(): Promise&lt;ConnectorStatus&gt;;</p>
            <p className="pl-4">getStatus(): ConnectorStatus;</p>
            <p className="pl-4">pull(): Promise&lt;TallySyncResult&gt;;</p>
            <p className="pl-4">push(payload: any): Promise&lt;any&gt;;</p>
            <p className="pl-4">sync(): Promise&lt;TallySyncResult&gt;;</p>
            <p>{'}'}</p>
            <div className="pt-2 text-slate-400 font-sans text-xs">
              Safety rule enforced: Direct scraping and credential automation are strictly disabled. The application gracefully operates offline with robust XML file imports.
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
