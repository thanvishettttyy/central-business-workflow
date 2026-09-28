import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Users, CheckSquare, FileText, FileSignature, UsersRound, 
  Download, BarChart3, TrendingUp, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { Customer, DocumentRecord, Requirement, Task, Deadline, GSTRecord } from '../../types';
import { ExcelService } from '../../services/excelService';

interface ReportsPageProps {
  customers: Customer[];
  documents: DocumentRecord[];
  requirements: Requirement[];
  tasks: Task[];
  deadlines: Deadline[];
  gstRecords: GSTRecord[];
}

type ReportType = 'client' | 'task' | 'gst' | 'document' | 'staff';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#64748b'];

export const ReportsPage: React.FC<ReportsPageProps> = ({
  customers = [],
  documents = [],
  requirements = [],
  tasks = [],
  deadlines = [],
  gstRecords = []
}) => {
  const [activeReport, setActiveReport] = useState<ReportType>('client');

  // Helpers
  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  // --- Client Report ---
  const clientData = useMemo(() => {
    const total = customers.length;
    const active = customers.filter(c => c.status === 'Active').length;
    const inactive = customers.filter(c => c.status === 'Inactive').length;
    const leads = customers.filter(c => c.status === 'Lead').length;

    const byType = customers.reduce((acc, c) => {
      acc[c.customerType] = (acc[c.customerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const typeChartData = Object.entries(byType).map(([name, value]) => ({ name, value }));

    const byState = customers.reduce((acc, c) => {
      const state = c.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const stateChartData = Object.entries(byState).map(([name, value]) => ({ name, value }));

    return { kpis: { total, active, inactive, leads }, typeChartData, stateChartData, data: customers };
  }, [customers]);

  // --- Task Report ---
  const taskData = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const open = total - completed;
    const overdue = tasks.filter(t => t.status !== 'Completed' && isOverdue(t.dueDate)).length;

    const byStatus = tasks.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const statusChartData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));

    return { kpis: { total, open, overdue, completed }, statusChartData, data: tasks };
  }, [tasks]);

  // --- GST Report ---
  const gstData = useMemo(() => {
    const total = gstRecords.length;
    const filed = gstRecords.filter(g => g.status === 'Filed').length;
    const pending = gstRecords.filter(g => g.status === 'Pending').length;
    const overdue = gstRecords.filter(g => g.status === 'Overdue' || (g.status === 'Pending' && isOverdue(g.dueDate))).length;

    const byStatus = gstRecords.reduce((acc, g) => {
      const stat = g.status || 'Unknown';
      acc[stat] = (acc[stat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const statusChartData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));

    return { kpis: { total, filed, pending, overdue }, statusChartData, data: gstRecords };
  }, [gstRecords]);

  // --- Document Report ---
  const docData = useMemo(() => {
    const total = documents.length;
    const processed = documents.filter(d => d.status === 'Processed' || d.status === 'Verified').length;
    const rejected = documents.filter(d => d.status === 'Rejected').length;
    const pending = total - processed - rejected;

    const byCategory = documents.reduce((acc, d) => {
      const cat = d.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const categoryChartData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    return { kpis: { total, processed, pending, rejected }, categoryChartData, data: documents };
  }, [documents]);

  // --- Staff Report ---
  const staffData = useMemo(() => {
    const staffMap = tasks.reduce((acc, t) => {
      const name = t.assignee || 'Unassigned';
      if (!acc[name]) acc[name] = { total: 0, completed: 0, overdue: 0 };
      acc[name].total += 1;
      if (t.status === 'Completed') acc[name].completed += 1;
      if (t.status !== 'Completed' && isOverdue(t.dueDate)) acc[name].overdue += 1;
      return acc;
    }, {} as Record<string, { total: number; completed: number; overdue: number }>);

    const data = Object.entries(staffMap).map(([name, stats]) => ({
      name,
      ...stats,
      completionRate: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);

    const totalStaff = data.length;
    const totalTasks = tasks.length;
    const totalCompleted = tasks.filter(t => t.status === 'Completed').length;
    const avgCompletion = totalTasks ? Math.round((totalCompleted / totalTasks) * 100) : 0;

    return { kpis: { totalStaff, totalTasks, avgCompletion, totalCompleted }, data };
  }, [tasks]);

  const exportData = (filename: string, data: any[]) => {
    ExcelService.exportToExcel(data, filename);
  };

  const navItems = [
    { id: 'client', label: 'Client Portfolio', icon: Users },
    { id: 'task', label: 'Task Status', icon: CheckSquare },
    { id: 'gst', label: 'GST Compliance', icon: FileText },
    { id: 'document', label: 'Document Audit', icon: FileSignature },
    { id: 'staff', label: 'Staff Performance', icon: UsersRound },
  ] as const;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden page-enter">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Reports & Analytics</h1>
            <p className="text-sm text-slate-500">Comprehensive business insights</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Nav */}
        <div className="w-52 bg-white border-r border-slate-200 flex flex-col p-3 gap-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeReport === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveReport(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
            
            {/* Client Report */}
            {activeReport === 'client' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Client Portfolio Overview</h2>
                  <button onClick={() => exportData('clients_report', clientData.data)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <StatCard title="Total Clients" value={clientData.kpis.total} icon={Users} color="bg-blue-500" />
                  <StatCard title="Active" value={clientData.kpis.active} icon={CheckCircle2} color="bg-emerald-500" />
                  <StatCard title="Inactive" value={clientData.kpis.inactive} icon={AlertCircle} color="bg-slate-400" />
                  <StatCard title="Leads" value={clientData.kpis.leads} icon={TrendingUp} color="bg-amber-500" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <ChartCard title="Clients by Type">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={clientData.typeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {clientData.typeChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                  <ChartCard title="Clients by State">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={clientData.stateChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-200 font-medium text-slate-800">Client Directory</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3 font-medium">Name</th>
                          <th className="px-5 py-3 font-medium">Type</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clientData.data.map((c, idx) => (
                          <tr key={c.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-800">{c.name}</td>
                            <td className="px-5 py-3 text-slate-600">{c.customerType}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : c.status === 'Lead' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-600">{c.state}</td>
                          </tr>
                        ))}
                        {clientData.data.length === 0 && (
                          <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No clients found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Task Report */}
            {activeReport === 'task' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Task Performance Tracking</h2>
                  <button onClick={() => exportData('tasks_report', taskData.data)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <StatCard title="Total Tasks" value={taskData.kpis.total} icon={CheckSquare} color="bg-blue-500" />
                  <StatCard title="Open Tasks" value={taskData.kpis.open} icon={Clock} color="bg-amber-500" />
                  <StatCard title="Overdue" value={taskData.kpis.overdue} icon={AlertCircle} color="bg-rose-500" />
                  <StatCard title="Completed" value={taskData.kpis.completed} icon={CheckCircle2} color="bg-emerald-500" />
                </div>

                <ChartCard title="Tasks by Status">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={taskData.statusChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-200 font-medium text-slate-800">Task Log</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3 font-medium">Title</th>
                          <th className="px-5 py-3 font-medium">Assignee</th>
                          <th className="px-5 py-3 font-medium">Priority</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Due Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {taskData.data.map((t, idx) => {
                          const over = t.status !== 'Completed' && isOverdue(t.dueDate);
                          return (
                            <tr key={t.id || idx} className={`${over ? 'bg-rose-50 hover:bg-rose-100' : 'hover:bg-slate-50'} transition-colors`}>
                              <td className="px-5 py-3 font-medium text-slate-800">{t.title}</td>
                              <td className="px-5 py-3 text-slate-600">{t.assignee || '-'}</td>
                              <td className="px-5 py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${t.priority === 'High' ? 'bg-rose-100 text-rose-700' : t.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {t.priority}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-slate-600">{t.status}</td>
                              <td className={`px-5 py-3 ${over ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</td>
                            </tr>
                          );
                        })}
                        {taskData.data.length === 0 && (
                          <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No tasks found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* GST Report */}
            {activeReport === 'gst' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">GST Compliance Monitor</h2>
                  <button onClick={() => exportData('gst_report', gstData.data)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <StatCard title="Total Returns" value={gstData.kpis.total} icon={FileText} color="bg-blue-500" />
                  <StatCard title="Filed" value={gstData.kpis.filed} icon={CheckCircle2} color="bg-emerald-500" />
                  <StatCard title="Pending" value={gstData.kpis.pending} icon={Clock} color="bg-amber-500" />
                  <StatCard title="Overdue" value={gstData.kpis.overdue} icon={AlertCircle} color="bg-rose-500" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <ChartCard title="Filing Status">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={gstData.statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                          {gstData.statusChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartCard>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-200 font-medium text-slate-800">GST Records</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3 font-medium">Customer GSTIN</th>
                          <th className="px-5 py-3 font-medium">Return Type</th>
                          <th className="px-5 py-3 font-medium">Period</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {gstData.data.map((g, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-800">{g.gstin || '-'}</td>
                            <td className="px-5 py-3 text-slate-600">{g.returnType || '-'}</td>
                            <td className="px-5 py-3 text-slate-600">{g.period || '-'}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${g.status === 'Filed' ? 'bg-emerald-100 text-emerald-700' : g.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                                {g.status || 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {gstData.data.length === 0 && (
                          <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No GST records found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Document Report */}
            {activeReport === 'document' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Document Audit & Processing</h2>
                  <button onClick={() => exportData('documents_report', docData.data)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <StatCard title="Total Docs" value={docData.kpis.total} icon={FileSignature} color="bg-blue-500" />
                  <StatCard title="Processed" value={docData.kpis.processed} icon={CheckCircle2} color="bg-emerald-500" />
                  <StatCard title="Pending" value={docData.kpis.pending} icon={Clock} color="bg-amber-500" />
                  <StatCard title="Rejected" value={docData.kpis.rejected} icon={AlertCircle} color="bg-rose-500" />
                </div>

                <ChartCard title="Documents by Category">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={docData.categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-200 font-medium text-slate-800">Document Log</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3 font-medium">Document Name</th>
                          <th className="px-5 py-3 font-medium">Category</th>
                          <th className="px-5 py-3 font-medium">Status</th>
                          <th className="px-5 py-3 font-medium">Uploaded Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {docData.data.map((d, idx) => (
                          <tr key={d.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-800">{'name' in d ? d.name : ('title' in d ? d['title'] as string : 'Untitled')}</td>
                            <td className="px-5 py-3 text-slate-600">{d.category || '-'}</td>
                            <td className="px-5 py-3">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(d.status === 'Processed' || d.status === 'Verified') ? 'bg-emerald-100 text-emerald-700' : d.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                                {d.status || 'Pending'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-600">{d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString() : '-'}</td>
                          </tr>
                        ))}
                        {docData.data.length === 0 && (
                          <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No documents found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Staff Report */}
            {activeReport === 'staff' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-800">Staff Performance Analytics</h2>
                  <button onClick={() => exportData('staff_report', staffData.data)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <StatCard title="Team Members" value={staffData.kpis.totalStaff} icon={UsersRound} color="bg-blue-500" />
                  <StatCard title="Total Tasks" value={staffData.kpis.totalTasks} icon={CheckSquare} color="bg-indigo-500" />
                  <StatCard title="Total Completed" value={staffData.kpis.totalCompleted} icon={CheckCircle2} color="bg-emerald-500" />
                  <StatCard title="Avg Completion %" value={`${staffData.kpis.avgCompletion}%`} icon={TrendingUp} color="bg-amber-500" />
                </div>

                <ChartCard title="Task Distribution & Completion">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={staffData.data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total Tasks" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-5 py-4 border-b border-slate-200 font-medium text-slate-800">Team Workload</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3 font-medium">Assignee</th>
                          <th className="px-5 py-3 font-medium">Total Tasks</th>
                          <th className="px-5 py-3 font-medium">Completed</th>
                          <th className="px-5 py-3 font-medium">Overdue</th>
                          <th className="px-5 py-3 font-medium min-w-[200px]">Completion Rate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffData.data.map((s, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-slate-800">{s.name}</td>
                            <td className="px-5 py-3 text-slate-600">{s.total}</td>
                            <td className="px-5 py-3 text-emerald-600 font-medium">{s.completed}</td>
                            <td className="px-5 py-3 text-rose-600">{s.overdue}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-slate-700 w-9">{s.completionRate}%</span>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${s.completionRate === 100 ? 'bg-emerald-500' : s.completionRate > 50 ? 'bg-brand-500' : 'bg-amber-500'}`} 
                                    style={{ width: `${s.completionRate}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {staffData.data.length === 0 && (
                          <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No staff data found</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
            
            {/* Bottom Padding */}
            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
    <h3 className="font-medium text-slate-800 mb-6">{title}</h3>
    {children}
  </div>
);
