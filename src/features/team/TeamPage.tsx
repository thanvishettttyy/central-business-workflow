import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Shield, Key, Check, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, UserRole } from '../../types';
import { db } from '../../services/db';

interface TeamPageProps {
  users: User[];
  currentUser: User;
  onSwitchUser: (u: User) => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({
  users,
  currentUser,
  onSwitchUser,
}) => {
  const roles: { role: UserRole; desc: string; permissions: Record<string, boolean> }[] = [
    {
      role: 'Super Admin',
      desc: 'Unrestricted enterprise control: access all clients, databases, backups, and audit logs.',
      permissions: { Customers: true, Documents: true, Requirements: true, Tasks: true, Deadlines: true, GST: true, Accounting: true, Reports: true, Settings: true, Backup: true }
    },
    {
      role: 'Manager',
      desc: 'Operations management: assign staff, review checklists, approve documents, export reports.',
      permissions: { Customers: true, Documents: true, Requirements: true, Tasks: true, Deadlines: true, GST: true, Accounting: true, Reports: true, Settings: false, Backup: false }
    },
    {
      role: 'Reviewer',
      desc: 'Quality control: verify OCR output, inspect tax invoices, and perform two-party sign-offs.',
      permissions: { Customers: true, Documents: true, Requirements: true, Tasks: true, Deadlines: true, GST: true, Accounting: true, Reports: true, Settings: false, Backup: false }
    },
    {
      role: 'Staff',
      desc: 'Execution tier: perform data entry, voucher reconciliations, and checklist uploads.',
      permissions: { Customers: true, Documents: true, Requirements: true, Tasks: true, Deadlines: true, GST: true, Accounting: false, Reports: false, Settings: false, Backup: false }
    },
    {
      role: 'Viewer',
      desc: 'Read-only access: review customer profile timelines and verify completion states.',
      permissions: { Customers: true, Documents: true, Requirements: true, Tasks: true, Deadlines: true, GST: false, Accounting: false, Reports: false, Settings: false, Backup: false }
    }
  ];

  const modules = ['Customers', 'Documents', 'Requirements', 'Tasks', 'Deadlines', 'GST', 'Accounting', 'Reports', 'Settings', 'Backup'];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-brand-600" />
          <span>Team Members, Roles & Granular Permissions</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Role-based access control (RBAC) ensuring segregation of duties across audit, accounting, and compliance.
        </p>
      </div>

      {/* Active Users Table */}
      <Card title="Team Directory" subtitle="Users authorized on this local workstation installation">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Email</th>
                <th className="py-2.5 px-4">Assigned Role</th>
                <th className="py-2.5 px-4">Active Session</th>
                <th className="py-2.5 px-4 text-right">Switch Role Simulation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = currentUser.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                    <td className="py-3 px-4 font-semibold text-brand-600">{u.role}</td>
                    <td className="py-3 px-4">
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active Now
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Idle</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => onSwitchUser(u)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline cursor-pointer"
                        >
                          Simulate As {u.role}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Granular Permission Matrix */}
      <Card title="Granular Role Permission Matrix" subtitle="Access control boundaries across the application">
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4 text-left">Role Profile</th>
                {modules.map((m) => (
                  <th key={m} className="py-3 px-2 border-l border-slate-200">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map((r) => (
                <tr key={r.role} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-left">
                    <div className="font-bold text-slate-900">{r.role}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 max-w-xs">{r.desc}</div>
                  </td>
                  {modules.map((m) => {
                    const hasAccess = r.permissions[m];
                    return (
                      <td key={m} className="py-3 px-2 border-l border-slate-100">
                        {hasAccess ? (
                          <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 rounded-full bg-slate-100 text-slate-400">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
