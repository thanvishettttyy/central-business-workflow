import React, { useState } from 'react';
import { 
  Search, Bell, Plus, RotateCcw, 
  ChevronDown, Shield, Check, Building2, LogOut, Command,
  Sparkles, X
} from 'lucide-react';
import { Customer, User, AppNotification } from '../../types';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  customers: Customer[];
  selectedCustomerId?: string;
  onSelectCustomer: (customerId?: string) => void;
  onOpenSearch: () => void;
  onOpenQuickAction: () => void;
  onResetDemo: () => void;
  onLogout: () => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  'Super Admin':       'bg-purple-100 text-purple-700 border-purple-200',
  'Senior Accountant': 'bg-brand-100 text-brand-700 border-brand-200',
  'Junior Accountant': 'bg-teal-100 text-teal-700 border-teal-200',
  'Auditor':           'bg-amber-100 text-amber-700 border-amber-200',
  'Client Viewer':     'bg-slate-100 text-slate-600 border-slate-200',
};

const AVATAR_COLORS = [
  'from-purple-500 to-indigo-500',
  'from-brand-500 to-cyan-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-teal-500 to-emerald-500',
];

export const Header: React.FC<HeaderProps> = ({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onOpenSearch,
  onOpenQuickAction,
  onResetDemo,
  onLogout,
  currentUser,
  onSwitchUser,
  allUsers,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const avatarGradient = AVATAR_COLORS[
    (currentUser.name.charCodeAt(0) || 0) % AVATAR_COLORS.length
  ];

  const roleColor = ROLE_COLORS[currentUser.role] ?? 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <header
      className="h-14 px-5 flex items-center justify-between shrink-0 sticky top-0 z-30"
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(12px) saturate(180%)',
        WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        borderBottom: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03)',
      }}
    >
      {/* ── LEFT: Client context ── */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Client selector */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all duration-150 hover:border-brand-300 hover:shadow-sm"
          style={{
            background: selectedCustomerId ? 'rgba(6,111,199,0.05)' : 'rgba(248,250,252,0.9)',
            border: selectedCustomerId ? '1px solid rgba(6,111,199,0.2)' : '1px solid rgba(226,232,240,0.9)',
          }}
        >
          <Building2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          <select
            value={selectedCustomerId || ''}
            onChange={(e) => onSelectCustomer(e.target.value || undefined)}
            className="text-xs font-semibold bg-transparent focus:outline-none cursor-pointer pr-1 max-w-[160px] truncate"
            style={{ color: selectedCustomerId ? '#0158a2' : '#475569' }}
          >
            <option value="">All Clients</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>
        </div>

        {/* Active filter pill */}
        {selectedCustomer && (
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold animate-fade-in"
            style={{
              background: 'rgba(6,111,199,0.08)',
              border: '1px solid rgba(6,111,199,0.15)',
              color: '#0158a2',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <span className="max-w-[120px] truncate">{selectedCustomer.displayName}</span>
            <button
              onClick={() => onSelectCustomer(undefined)}
              className="ml-0.5 text-brand-400 hover:text-brand-700 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* ── CENTER: Search ── */}
      <button
        onClick={onOpenSearch}
        className="flex items-center justify-between w-64 lg:w-96 px-3.5 py-1.5 rounded-xl border border-slate-200/80 text-slate-400 text-xs transition-all duration-150 cursor-pointer group"
        style={{
          background: 'rgba(248,250,252,0.9)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(6,111,199,0.35)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 3px rgba(6,111,199,0.08), 0 1px 2px rgba(0,0,0,0.04)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(226,232,240,0.8)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)';
        }}
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-500 transition-colors" />
          <span className="group-hover:text-slate-600 transition-colors">Search customers, tasks, GST…</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono bg-white border border-slate-200 rounded text-slate-400 shadow-sm flex items-center gap-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </div>
      </button>

      {/* ── RIGHT: Actions ── */}
      <div className="flex items-center gap-1.5">
        {/* Quick Action */}
        <button
          onClick={onOpenQuickAction}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-150 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #006fc7 0%, #0c8ee9 100%)',
            boxShadow: '0 1px 3px rgba(6,111,199,0.3), 0 4px 12px rgba(6,111,199,0.15)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 6px rgba(6,111,199,0.4), 0 6px 16px rgba(6,111,199,0.25)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(6,111,199,0.3), 0 4px 12px rgba(6,111,199,0.15)';
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Action</span>
          <Plus className="w-3 h-3 opacity-80" />
        </button>

        {/* Reset Demo */}
        <button
          onClick={onResetDemo}
          title="Reset demo data"
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 transition-all duration-150 cursor-pointer"
          data-tooltip="Reset Demo"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-0.5" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="relative p-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all duration-150 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"
                style={{ animation: 'pulse-ring 2s infinite' }}
              />
            )}
          </button>
          {showNotifications && (
            <div className="animate-scale-in animate-fade-in-down">
              <NotificationCenter
                notifications={notifications}
                onMarkRead={onMarkNotificationRead}
                onMarkAllRead={onMarkAllNotificationsRead}
                onClose={() => setShowNotifications(false)}
              />
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all duration-150 cursor-pointer"
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-xs shrink-0`}
              style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
            >
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-800 leading-none">{currentUser.name.split(' ')[0]}</div>
              <div
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md border mt-0.5 inline-flex items-center gap-0.5 ${roleColor}`}
              >
                <Shield className="w-2 h-2" />
                <span>{currentUser.role}</span>
              </div>
            </div>
            <ChevronDown
              className="w-3 h-3 text-slate-400 transition-transform duration-200"
              style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-64 rounded-2xl py-2 z-50 animate-scale-in"
              style={{
                background: 'rgba(255,255,255,0.96)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(226,232,240,0.8)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {/* User info header */}
              <div className="px-4 pb-3 pt-1 border-b border-slate-100/80">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarGradient} text-white flex items-center justify-center font-bold text-sm`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Role switcher */}
              <div className="px-3 pt-2 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
                  Switch Role
                </p>
                {allUsers.map((u, idx) => (
                  <button
                    key={u.id}
                    onClick={() => { onSwitchUser(u); setShowUserMenu(false); }}
                    className="w-full px-3 py-2 text-left rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between transition-colors duration-100 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-lg bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white flex items-center justify-center font-bold text-[10px] shrink-0`}
                      >
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{u.name}</span>
                        <span className="text-[10px] text-slate-400">{u.role}</span>
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <Check className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Logout */}
              <div className="px-3 pt-1 border-t border-slate-100/80 mt-1">
                <button
                  onClick={() => { setShowUserMenu(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors duration-100 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
