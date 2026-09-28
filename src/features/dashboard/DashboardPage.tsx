import React from 'react';
import { 
  Users, FileText, CheckSquare, Clock, AlertCircle, 
  FileCheck, Landmark, ArrowUpRight, TrendingUp, Calendar as CalIcon,
  ChevronRight, ArrowRight
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Customer, Task, DocumentRecord, Requirement, 
  Deadline, GSTRecord, Activity, AccountingLedger 
} from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

interface DashboardPageProps {
  customers: Customer[];
  tasks: Task[];
  documents: DocumentRecord[];
  requirements: Requirement[];
  deadlines: Deadline[];
  gstRecords: GSTRecord[];
  activities: Activity[];
  ledgers: AccountingLedger[];
  onNavigate: (tab: any, customerId?: string) => void;
  selectedCustomerId?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  customers,
  tasks,
  documents,
  requirements,
  deadlines,
  gstRecords,
  activities,
  ledgers,
  onNavigate,
  selectedCustomerId,
}) => {
  const activeCustomersCount = customers.filter(c => c.status === 'Active').length;
  const pendingDocsCount = documents.filter(d => d.status === 'Uploaded' || d.status === 'Under Review').length;
  const openReqsCount = requirements.filter(r => r.status !== 'Completed' && r.status !== 'Approved').length;
  
  const today = new Date().toISOString().split('T')[0];
  const tasksDueToday = tasks.filter(t => t.dueDate === today && t.status !== 'Completed').length;
  const overdueTasks = tasks.filter(t => t.dueDate < today && t.status !== 'Completed');
  
  const upcomingDeadlines = deadlines.filter(d => d.status !== 'Completed').slice(0, 5);
  const pendingGST = gstRecords.filter(g => g.filingStatus !== 'Filed (Recorded Locally)').length;

  // Chart Data: Tasks by Status
  const taskStatusData = [
    { name: 'Todo', count: tasks.filter(t => t.status === 'Todo').length, color: '#f59e0b' },
    { name: 'In Progress', count: tasks.filter(t => t.status === 'In Progress').length, color: '#0284c7' },
    { name: 'Review', count: tasks.filter(t => t.status === 'Review').length, color: '#8b5cf6' },
    { name: 'Completed', count: tasks.filter(t => t.status === 'Completed').length, color: '#10b981' },
  ];

  // GST Compliance Trend
  const gstTrendData = [
    { month: 'Jun', taxable: 65, tax: 11.7 },
    { month: 'Jul', taxable: 88, tax: 15.8 },
    { month: 'Aug', taxable: 112, tax: 20.1 },
    { month: 'Sept (Current)', taxable: 148, tax: 26.6 },
  ];

  return (
    <div className="space-y-6 page-enter">
      {/* Top Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 text-white"
        style={{
          background: 'linear-gradient(135deg, #0b3f6f 0%, #006fc7 50%, #0c8ee9 100%)',
          boxShadow: '0 8px 32px rgba(6,111,199,0.3), 0 2px 8px rgba(6,111,199,0.2)',
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 blur-2xl" style={{ background: '#36abf7' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 blur-2xl" style={{ background: '#fff' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3 border"
              style={{ background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)' }}>
              <Clock className="w-3 h-3" />
              DAILY WORKFLOW SUMMARY
            </div>
            <h2 className="text-2xl font-black tracking-tight" style={{ letterSpacing: '-0.02em' }}>
              What needs attention today?
            </h2>
            <p className="text-sm mt-1.5 max-w-xl" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {selectedCustomerId
                ? `Filtered view for selected customer — showing pending tax, tasks, and compliance.`
                : `${tasksDueToday} tasks due today · ${overdueTasks.length} overdue · ${pendingGST} GST cycles in progress`}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onNavigate('tasks')}
              className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.95)', color: '#0158a2', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              Open Tasks Board
            </button>
            <button onClick={() => onNavigate('gst')}
              className="px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all duration-150"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}>
              Review GST
            </button>
          </div>
        </div>
      </div>


      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          {
            label: 'Customers', value: customers.length, sub: `${activeCustomersCount} active`,
            icon: Users, tab: 'customers',
            gradient: 'from-brand-500 to-cyan-500', glow: 'rgba(6,111,199,0.2)',
            cls: 'stagger-1',
          },
          {
            label: 'Pending Docs', value: pendingDocsCount, sub: 'Need review',
            icon: FileText, tab: 'documents',
            gradient: 'from-purple-500 to-violet-500', glow: 'rgba(139,92,246,0.2)',
            cls: 'stagger-2',
          },
          {
            label: 'Open Reqs', value: openReqsCount, sub: 'Awaiting docs',
            icon: CheckSquare, tab: 'requirements',
            gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.2)',
            cls: 'stagger-3',
          },
          {
            label: 'Due Today', value: tasksDueToday, sub: 'Tasks scheduled',
            icon: Clock, tab: 'tasks',
            gradient: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.2)',
            cls: 'stagger-4',
          },
          {
            label: 'Overdue', value: overdueTasks.length, sub: `${upcomingDeadlines.length} deadlines`,
            icon: AlertCircle, tab: 'deadlines',
            gradient: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.2)',
            cls: 'stagger-1',
          },
          {
            label: 'GST Pending', value: pendingGST, sub: 'Return cycles',
            icon: FileCheck, tab: 'gst',
            gradient: 'from-indigo-500 to-blue-500', glow: 'rgba(99,102,241,0.2)',
            cls: 'stagger-2',
          },
        ].map(({ label, value, sub, icon: Icon, tab, gradient, glow, cls }) => (
          <div
            key={label}
            onClick={() => onNavigate(tab)}
            className={`card-interactive p-4 cursor-pointer animate-fade-in-up ${cls}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
                style={{ boxShadow: `0 4px 12px ${glow}` }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
            </div>
            <div className="text-2xl font-black text-slate-900" style={{ letterSpacing: '-0.02em' }}>
              {value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{label}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>


      {/* Main Split: Today's Work & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Work Table & Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card 
            title="TODAY'S WORK" 
            subtitle="Priority tasks requiring execution or sign-off today"
            action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('tasks')}>
                <span>View All Tasks</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-2.5">Task</th>
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Assignee</th>
                    <th className="pb-2.5">Priority</th>
                    <th className="pb-2.5">Due Date</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.slice(0, 4).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-medium text-slate-900 pr-3">{t.title}</td>
                      <td className="py-3 text-slate-600 pr-2">
                        {t.customerName || 'Internal'}
                      </td>
                      <td className="py-3 text-slate-600 pr-2">{t.assignee}</td>
                      <td className="py-3 pr-2">
                        <StatusBadge status={t.priority} />
                      </td>
                      <td className="py-3 text-slate-500 font-mono pr-2">{t.dueDate}</td>
                      <td className="py-3">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Task Pipeline Distribution" subtitle="Active tasks by workflow state">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#0284c7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="GST Turnover Trend (₹ Lakhs)" subtitle="Quarterly tax invoice progression">
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gstTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gstColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="taxable" stroke="#0284c7" fillOpacity={1} fill="url(#gstColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Deadlines & Recent Activity */}
        <div className="space-y-6">
          <Card 
            title="UPCOMING DEADLINES" 
            subtitle="Statutory GST and corporate filings"
            action={
              <Button variant="ghost" size="sm" onClick={() => onNavigate('deadlines')}>
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            }
          >
            <div className="space-y-3">
              {upcomingDeadlines.map((d) => (
                <div key={d.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{d.workType}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{d.customerName}</p>
                    </div>
                    <StatusBadge status={d.priority} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-200/50">
                    <span className="text-slate-500">Period: {d.period}</span>
                    <span className="font-semibold text-slate-700 font-mono">Due: {d.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="RECENT AUDIT ACTIVITY" subtitle="Chronological timeline of system changes">
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0"></div>
                  <div>
                    <span className="font-semibold text-slate-800">{act.userName}</span>{' '}
                    <span className="text-slate-600">{act.description}</span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
