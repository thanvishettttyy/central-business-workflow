import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, FileText, Calendar, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, X, ChevronDown, ChevronRight,
  List, Grid
} from 'lucide-react';
import { Deadline, Customer } from '../../types';
import { db } from '../../services/db';

interface DeadlinesPageProps {
  deadlines: Deadline[];
  customers: Customer[];
  onRefresh: () => void;
}

export const DeadlinesPage: React.FC<DeadlinesPageProps> = ({ deadlines, customers, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  // New Deadline Form State
  const [newDeadline, setNewDeadline] = useState<Partial<Deadline>>({
    workType: '',
    customerId: '',
    period: '',
    dueDate: '',
    assignedUser: '',
    priority: 'Medium',
    status: 'Upcoming',
    category: '',
    notes: ''
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysDiff = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    const diffTime = d.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isDueToday = (dateStr: string) => getDaysDiff(dateStr) === 0;

  const filteredDeadlines = useMemo(() => {
    return deadlines.filter(d => {
      const matchSearch = 
        d.workType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.assignedUser || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchCategory = categoryFilter === 'All' || d.category === categoryFilter;

      return matchSearch && matchStatus && matchCategory;
    });
  }, [deadlines, searchTerm, statusFilter, categoryFilter]);

  const kpis = useMemo(() => {
    let upcoming = 0;
    let dueToday = 0;
    let overdue = 0;
    let completed = 0;

    deadlines.forEach(d => {
      if (d.status === 'Completed') completed++;
      else if (d.status === 'Overdue') overdue++;
      else if (d.status === 'Due' || (d.status === 'Upcoming' && isDueToday(d.dueDate))) dueToday++;
      else if (d.status === 'Upcoming') upcoming++;
    });

    return { total: deadlines.length, upcoming, dueToday, overdue, completed };
  }, [deadlines]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(deadlines.map(d => d.category).filter(Boolean));
    return ['All', ...Array.from(cats)] as string[];
  }, [deadlines]);

  const handleMarkComplete = async (d: Deadline) => {
    try {
      await db.saveDeadline({ ...d, status: 'Completed' });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCustomer = customers.find(c => c.id === newDeadline.customerId);
      const toSave: Omit<Deadline, 'id'> = {
        customerId: newDeadline.customerId || '',
        customerName: selectedCustomer?.name || '',
        workType: newDeadline.workType || '',
        category: newDeadline.category || 'General',
        period: newDeadline.period || '',
        dueDate: newDeadline.dueDate || '',
        assignedUser: newDeadline.assignedUser || '',
        status: newDeadline.status as any || 'Upcoming',
        priority: newDeadline.priority as any || 'Medium',
        notes: newDeadline.notes || '',
        createdAt: new Date().toISOString()
      };
      await db.saveDeadline(toSave as Deadline); // Assuming saveDeadline handles omit id if not present or generates it
      setShowAddModal(false);
      onRefresh();
    } catch (error) {
      console.error("Error saving deadline", error);
    }
  };

  const handleGenerateMonthlyCycle = async () => {
    try {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      const monthAfterNext = new Date(currentYear, currentMonth + 2, 1);
      
      const gstr1Due = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 11).toISOString().split('T')[0];
      const gstr3bDue = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 20).toISOString().split('T')[0];
      const tdsDue = new Date(monthAfterNext.getFullYear(), monthAfterNext.getMonth(), 7).toISOString().split('T')[0];
      const bankRecDue = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 25).toISOString().split('T')[0];
      
      const periodStr = `${today.toLocaleString('default', { month: 'short' })} ${currentYear}`;

      for (const customer of customers) {
        const cycleDeadlines: Omit<Deadline, 'id'>[] = [
          { customerId: customer.id, customerName: customer.name, workType: 'GSTR-1', category: 'GST', period: periodStr, dueDate: gstr1Due, assignedUser: 'System', status: 'Upcoming', priority: 'High', createdAt: new Date().toISOString() },
          { customerId: customer.id, customerName: customer.name, workType: 'GSTR-3B', category: 'GST', period: periodStr, dueDate: gstr3bDue, assignedUser: 'System', status: 'Upcoming', priority: 'High', createdAt: new Date().toISOString() },
          { customerId: customer.id, customerName: customer.name, workType: 'TDS Return', category: 'Tax', period: periodStr, dueDate: tdsDue, assignedUser: 'System', status: 'Upcoming', priority: 'Medium', createdAt: new Date().toISOString() },
          { customerId: customer.id, customerName: customer.name, workType: 'Bank Reconciliation', category: 'Accounts', period: periodStr, dueDate: bankRecDue, assignedUser: 'System', status: 'Upcoming', priority: 'Medium', createdAt: new Date().toISOString() }
        ];

        for (const d of cycleDeadlines) {
          await db.saveDeadline(d as Deadline);
        }
      }

      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 3000);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const getDaysIndicator = (d: Deadline) => {
    if (d.status === 'Completed') return <span className="text-emerald-600 flex items-center gap-1 font-medium"><CheckCircle2 className="w-4 h-4" /> Done</span>;
    const diff = getDaysDiff(d.dueDate);
    if (diff < 0) return <span className="text-red-600 font-bold">{Math.abs(diff)}d overdue</span>;
    if (diff === 0) return <span className="text-amber-600 font-bold">Today</span>;
    if (diff <= 3) return <span className="text-orange-500 font-medium">{diff}d</span>;
    return <span className="text-slate-500">{diff}d</span>;
  };

  const getRowClassName = (d: Deadline) => {
    if (d.status === 'Completed') return 'bg-slate-50 opacity-60';
    if (d.status === 'Overdue') return 'bg-rose-50';
    if (isDueToday(d.dueDate)) return 'bg-amber-50';
    return '';
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': return 'bg-rose-100 text-rose-700 border-rose-500 left-border-rose-500';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-500 left-border-orange-500';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-400 left-border-amber-400';
      default: return 'bg-slate-100 text-slate-700 border-slate-300 left-border-slate-300';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Completed': return 'bg-emerald-100 text-emerald-700';
      case 'Overdue': return 'bg-rose-100 text-rose-700';
      case 'Due': return 'bg-amber-100 text-amber-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const renderStatusTabs = () => {
    const tabs = ['All', 'Upcoming', 'Due', 'Overdue', 'Completed', 'N/A'];
    return (
      <div className="flex bg-slate-200 p-1 rounded-lg gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button 
            key={t}
            onClick={() => setStatusFilter(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === t ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:bg-slate-300/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden page-enter">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Deadlines & Tasks</h1>
              <p className="text-sm text-slate-500">Track statutory due dates and internal deadlines</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleGenerateMonthlyCycle} className="btn-secondary flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
              <RefreshCw className="w-4 h-4" />
              Generate Monthly Cycle
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              Add Deadline
            </button>
          </div>
        </div>
        
        {showSuccessBanner && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Monthly cycle deadlines generated successfully.
          </div>
        )}

        <div className="flex gap-3">
          <div className="bg-slate-100 rounded-lg p-3 flex-1 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total</span>
            <span className="text-xl font-bold text-slate-800">{kpis.total}</span>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 flex-1 border border-blue-100 flex flex-col items-center justify-center">
            <span className="text-blue-600 text-xs font-semibold uppercase tracking-wider">Upcoming</span>
            <span className="text-xl font-bold text-blue-700">{kpis.upcoming}</span>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 flex-1 border border-amber-100 flex flex-col items-center justify-center">
            <span className="text-amber-600 text-xs font-semibold uppercase tracking-wider">Due Today</span>
            <span className="text-xl font-bold text-amber-700">{kpis.dueToday}</span>
          </div>
          <div className="bg-rose-50 rounded-lg p-3 flex-1 border border-rose-100 flex flex-col items-center justify-center">
            <span className="text-rose-600 text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <span className="text-xl font-bold text-rose-700">{kpis.overdue}</span>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 flex-1 border border-emerald-100 flex flex-col items-center justify-center">
            <span className="text-emerald-600 text-xs font-semibold uppercase tracking-wider">Completed</span>
            <span className="text-xl font-bold text-emerald-700">{kpis.completed}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search deadlines..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          {renderStatusTabs()}
          <div className="relative">
            <select 
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <List className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode('card')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'list' ? (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full data-table">
              <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Work Type</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Period</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredDeadlines.map(d => (
                  <React.Fragment key={d.id}>
                    <tr 
                      onClick={() => setExpandedRowId(expandedRowId === d.id ? null : d.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${getRowClassName(d)}`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedRowId === d.id ? 'rotate-90' : ''}`} />
                        {d.workType}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{d.customerName}</td>
                      <td className="px-4 py-3 text-slate-500">{d.period}</td>
                      <td className="px-4 py-3 text-slate-800">{new Date(d.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600">{d.assignedUser}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(d.priority)}`}>
                          {d.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {getDaysIndicator(d)}
                      </td>
                    </tr>
                    {expandedRowId === d.id && (
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="flex flex-col gap-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Category</span>
                                <p className="text-sm text-slate-800 mt-0.5">{d.category || 'N/A'}</p>
                              </div>
                              <div>
                                <span className="text-xs font-semibold text-slate-500 uppercase">Notes</span>
                                <p className="text-sm text-slate-800 mt-0.5">{d.notes || 'No notes provided.'}</p>
                              </div>
                            </div>
                            <div className="flex justify-end pt-2">
                              {d.status !== 'Completed' && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleMarkComplete(d); }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {filteredDeadlines.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                      No deadlines found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeadlines.map(d => {
              const priorityClass = getPriorityColor(d.priority);
              const leftBorderClass = priorityClass.match(/left-border-(\w+-\d+)/)?.[1] || 'slate-300';
              
              return (
                <div key={d.id} className={`card-interactive bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3 border-l-4 border-l-${leftBorderClass}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-800 line-clamp-1">{d.workType}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1">{d.customerName}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                      {d.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{d.period}</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(d.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                    <div className="text-sm">
                      {getDaysIndicator(d)}
                    </div>
                    {d.status !== 'Completed' && (
                      <button 
                        onClick={() => handleMarkComplete(d)}
                        className="p-1.5 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-500 rounded-md transition-colors"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Summary */}
      <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center gap-6 text-sm">
        <div className="flex-1 flex items-center gap-3">
          <span className="font-medium text-slate-700">Completion Progress:</span>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${kpis.total > 0 ? (kpis.completed / kpis.total) * 100 : 0}%` }}
            />
          </div>
          <span className="text-slate-500 font-medium">
            {kpis.completed} / {kpis.total} ({kpis.total > 0 ? Math.round((kpis.completed / kpis.total) * 100) : 0}%)
          </span>
        </div>
      </div>

      {/* Add Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Add New Deadline</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-auto p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Work Type *</label>
                  <input required type="text" value={newDeadline.workType} onChange={e => setNewDeadline({...newDeadline, workType: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. GSTR-1" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <input type="text" value={newDeadline.category} onChange={e => setNewDeadline({...newDeadline, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. GST" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Customer *</label>
                <select required value={newDeadline.customerId} onChange={e => setNewDeadline({...newDeadline, customerId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select a customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Period</label>
                  <input type="text" value={newDeadline.period} onChange={e => setNewDeadline({...newDeadline, period: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Sep 2026" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Due Date *</label>
                  <input required type="date" value={newDeadline.dueDate} onChange={e => setNewDeadline({...newDeadline, dueDate: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Assignee</label>
                  <input type="text" value={newDeadline.assignedUser} onChange={e => setNewDeadline({...newDeadline, assignedUser: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Team Member Name" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Priority</label>
                  <select value={newDeadline.priority} onChange={e => setNewDeadline({...newDeadline, priority: e.target.value as any})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea rows={3} value={newDeadline.notes} onChange={e => setNewDeadline({...newDeadline, notes: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" placeholder="Any additional details..." />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-auto">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
