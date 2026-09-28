import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Landmark, FileText, CheckSquare, 
  Calendar as CalendarIcon, Clock, FileSpreadsheet, Eye, 
  Workflow, FileCheck, MessageSquare, ShieldCheck, 
  Database, Settings, Globe, ArrowRightLeft, Cpu, Split, Receipt,
  ChevronRight, Zap
} from 'lucide-react';

export type NavItem = 
  | 'dashboard'
  | 'customers'
  | 'invoices'
  | 'accounting'
  | 'gst'
  | 'documents'
  | 'requirements'
  | 'tasks'
  | 'calendar'
  | 'deadlines'
  | 'pdf-tools'
  | 'ocr'
  | 'pdf-to-excel'
  | 'excel'
  | 'reports'
  | 'communications'
  | 'integrations'
  | 'team'
  | 'settings'
  | 'backup'
  | 'website';

interface NavGroup {
  label: string;
  items: {
    id: NavItem;
    label: string;
    icon: React.ElementType;
    badge?: string;
    badgeColor?: string;
    description?: string;
  }[];
}

interface SidebarProps {
  currentTab: NavItem;
  onSelectTab: (tab: NavItem) => void;
  openTasksCount?: number;
  dueDeadlinesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  openTasksCount = 0,
  dueDeadlinesCount = 0,
}) => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const navGroups: NavGroup[] = [
    {
      label: 'Core Workspace',
      items: [
        { id: 'dashboard',    label: 'Dashboard',        icon: LayoutDashboard, description: 'Overview & KPIs' },
        { id: 'customers',    label: 'Customers',        icon: Users,           badge: '4', description: '4 active clients' },
        { id: 'invoices',     label: 'Invoices',         icon: Receipt,         description: 'Billing & payments' },
        { id: 'accounting',   label: 'Tally / Ledger',   icon: Landmark,        description: 'Vouchers & ledgers' },
        { id: 'gst',          label: 'GST Management',   icon: FileCheck,       description: 'Returns & filing' },
        { id: 'documents',    label: 'Documents',        icon: FileText,        description: 'Files & records' },
        { id: 'requirements', label: 'Requirements',     icon: CheckSquare,     description: 'Client checklists' },
        { id: 'tasks',        label: 'Tasks',            icon: Workflow,
          badge: openTasksCount > 0 ? String(openTasksCount) : undefined, description: 'Kanban board' },
        { id: 'calendar',     label: 'Calendar',         icon: CalendarIcon,    description: 'Events & schedule' },
        { id: 'deadlines',    label: 'Deadlines',        icon: Clock,
          badge: dueDeadlinesCount > 0 ? String(dueDeadlinesCount) : undefined,
          badgeColor: 'bg-rose-500', description: 'Due & overdue' },
      ],
    },
    {
      label: 'Processing Tools',
      items: [
        { id: 'pdf-tools',    label: 'PDF Tools',        icon: Split,           description: 'Merge, split & edit' },
        { id: 'ocr',          label: 'OCR Engine',       icon: Eye,             description: 'Text extraction' },
        { id: 'pdf-to-excel', label: 'PDF → Excel',      icon: ArrowRightLeft,  description: 'Table conversion' },
        { id: 'excel',        label: 'Excel Studio',     icon: FileSpreadsheet, description: 'Import & export' },
      ],
    },
    {
      label: 'Governance & Ops',
      items: [
        { id: 'reports',        label: 'Reports',        icon: FileText,       description: 'Analytics & exports' },
        { id: 'communications', label: 'Communications', icon: MessageSquare,  description: 'Activity timeline' },
        { id: 'integrations',   label: 'Integrations',  icon: Cpu,            description: 'Tally, GST APIs' },
        { id: 'team',           label: 'Team & Roles',  icon: ShieldCheck,    description: 'RBAC matrix' },
        { id: 'settings',       label: 'Settings',      icon: Settings,       description: 'App preferences' },
        { id: 'backup',         label: 'Backup & Restore', icon: Database,    description: 'Data safety' },
      ],
    },
  ];

  const toggleGroup = (label: string) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className="w-[220px] flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* ── Brand ── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 shrink-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #006fc7 0%, #36abf7 100%)',
            boxShadow: '0 4px 12px rgba(6,111,199,0.4)',
          }}
        >
          <span className="relative z-10">CW</span>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white/10" />
        </div>
        <div className="min-w-0">
          <h1
            className="text-[13px] font-black text-white tracking-tight leading-none truncate"
            style={{ letterSpacing: '-0.02em' }}
          >
            CENTRAL FLOW
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <Zap className="w-2.5 h-2.5 text-brand-400" />
            <p className="text-[10px] font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>
              Enterprise OS v1.0
            </p>
          </div>
        </div>
      </div>

      {/* ── Online status pill ── */}
      <div className="px-4 pb-3 shrink-0">
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
          style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span style={{ color: 'rgba(52,211,153,0.85)' }}>All systems operational</span>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3 space-y-0.5 scrollbar-none">
        {navGroups.map((group) => {
          const isCollapsed = collapsed[group.label];
          return (
            <div key={group.label} className="mb-1">
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 mb-1 cursor-pointer select-none group"
              >
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.12em] transition-colors"
                  style={{ color: 'rgba(100,116,139,0.9)' }}
                >
                  {group.label}
                </span>
                <ChevronRight
                  className="w-3 h-3 transition-transform duration-200"
                  style={{
                    color: 'rgba(100,116,139,0.6)',
                    transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                  }}
                />
              </button>

              {/* Items */}
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        title={item.description}
                        className={`nav-item ${isActive ? 'active' : ''} animate-fade-in`}
                      >
                        <Icon className="nav-icon" />
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shrink-0 ${
                              item.badgeColor || (isActive ? 'bg-brand-700/70' : 'bg-slate-700/80')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div
        className="px-3 py-3 shrink-0 space-y-2"
        style={{ borderTop: '1px solid var(--sidebar-border)', background: 'rgba(0,0,0,0.2)' }}
      >
        <button
          onClick={() => onSelectTab('website')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
            currentTab === 'website'
              ? 'bg-indigo-600 text-white'
              : 'text-indigo-300 hover:bg-indigo-950/60 hover:text-indigo-200'
          }`}
          style={{
            border: currentTab === 'website'
              ? '1px solid rgba(99,102,241,0.5)'
              : '1px solid rgba(99,102,241,0.15)',
          }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Product Website</span>
          </div>
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: 'rgba(99,102,241,0.25)', color: 'rgba(165,180,252,0.9)' }}
          >
            LIVE
          </span>
        </button>

        <div className="flex items-center justify-between px-1 text-[10px]" style={{ color: 'rgba(100,116,139,0.7)' }}>
          <span>Offline-Ready · SQLite</span>
          <span className="font-mono">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
