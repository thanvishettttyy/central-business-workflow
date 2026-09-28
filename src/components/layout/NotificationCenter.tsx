import React, { useState } from 'react';
import {
  Bell, CheckCheck, Clock, FileText, FileCheck,
  AlertTriangle, Workflow, X, CheckCircle2,
  Receipt, Users, Info
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

const TYPE_CONFIG: Record<string, {
  icon: React.ReactNode;
  bg: string;
  dot: string;
}> = {
  deadline: {
    icon: <Clock className="w-3.5 h-3.5 text-rose-500" />,
    bg: 'bg-rose-50',
    dot: 'bg-rose-500',
  },
  document: {
    icon: <FileText className="w-3.5 h-3.5 text-blue-500" />,
    bg: 'bg-blue-50',
    dot: 'bg-blue-500',
  },
  gst: {
    icon: <FileCheck className="w-3.5 h-3.5 text-emerald-500" />,
    bg: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  task: {
    icon: <Workflow className="w-3.5 h-3.5 text-violet-500" />,
    bg: 'bg-violet-50',
    dot: 'bg-violet-500',
  },
  invoice: {
    icon: <Receipt className="w-3.5 h-3.5 text-amber-500" />,
    bg: 'bg-amber-50',
    dot: 'bg-amber-500',
  },
  customer: {
    icon: <Users className="w-3.5 h-3.5 text-cyan-500" />,
    bg: 'bg-cyan-50',
    dot: 'bg-cyan-500',
  },
  system: {
    icon: <Info className="w-3.5 h-3.5 text-slate-500" />,
    bg: 'bg-slate-100',
    dot: 'bg-slate-400',
  },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

type FilterTab = 'all' | 'unread';

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClose,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const displayed = filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl z-50 overflow-hidden animate-scale-in"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(226,232,240,0.8)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b border-slate-100"
        style={{ background: 'rgba(248,250,252,0.9)' }}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </div>
          <span className="font-bold text-sm text-slate-800">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer transition"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex border-b border-slate-100 px-4">
        {(['all', 'unread'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`py-2 px-1 mr-4 text-xs font-semibold border-b-2 transition-colors capitalize cursor-pointer ${
              filter === tab
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'all' ? `All (${notifications.length})` : `Unread (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100/80">
        {displayed.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-xs font-medium">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          displayed.map(n => {
            const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
            return (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`relative px-4 py-3.5 flex items-start gap-3 cursor-pointer transition-colors duration-100 ${
                  !n.isRead ? 'bg-brand-50/40 hover:bg-brand-50/60' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Unread indicator bar */}
                {!n.isRead && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-brand-500" />
                )}

                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-xs font-semibold leading-snug ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 mt-0.5">
                      {timeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>

                  {/* Type chip */}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {n.type}
                    </span>
                    {!n.isRead && (
                      <span className="ml-auto text-[10px] font-semibold text-brand-600">
                        Click to dismiss
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
        <p className="text-center text-[10px] text-slate-400 font-medium">
          {notifications.length} total · {unreadCount} unread · Auto-generated from app activity
        </p>
      </div>
    </div>
  );
};
