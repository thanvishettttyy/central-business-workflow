import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'rose' | 'purple' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'sm',
  className
}) => {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-white text-slate-600 border-slate-300',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center font-medium rounded-md border',
          styles[variant],
          sizes[size],
          className
        )
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'approved':
    case 'processed':
    case 'verified':
    case 'filed (recorded locally)':
      return <Badge variant="green">{status}</Badge>;

    case 'in progress':
    case 'processing':
    case 'uploaded':
    case 'under review':
      return <Badge variant="blue">{status}</Badge>;

    case 'todo':
    case 'pending':
    case 'requested':
    case 'due':
    case 'upcoming':
      return <Badge variant="amber">{status}</Badge>;

    case 'overdue':
    case 'urgent':
    case 'rejected':
    case 'blocked':
    case 'cancelled':
    case 'high':
      return <Badge variant="rose">{status}</Badge>;

    case 'archived':
    case 'inactive':
    case 'low':
      return <Badge variant="slate">{status}</Badge>;

    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
