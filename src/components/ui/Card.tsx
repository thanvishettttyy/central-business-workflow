import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all',
          onClick && 'cursor-pointer hover:shadow-sm',
          className
        )
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
          <div>
            {title && <h3 className="font-semibold text-slate-900 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
