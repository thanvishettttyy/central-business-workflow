import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Layers, Search, Filter, 
  Calendar, CheckCircle, Clock, AlertCircle, ChevronRight 
} from 'lucide-react';
import { Requirement, Customer, RequirementTemplate } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { BulkCreateRequirementModal } from './BulkCreateRequirementModal';
import { db } from '../../services/db';

interface RequirementsPageProps {
  requirements: Requirement[];
  customers: Customer[];
  templates: RequirementTemplate[];
  onRefresh: () => void;
}

export const RequirementsPage: React.FC<RequirementsPageProps> = ({
  requirements,
  customers,
  templates,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);

  const filtered = requirements.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.customerName && r.customerName.toLowerCase().includes(search.toLowerCase())) ||
      r.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (req: Requirement, newStatus: Requirement['status']) => {
    db.saveRequirement({
      ...req,
      status: newStatus,
    });
    onRefresh();
    if (selectedReq?.id === req.id) {
      setSelectedReq({ ...req, status: newStatus });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-600" />
            <span>Requirement Tracking & Checklists</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage information and documents requested from clients through approval and sign-off.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsBulkOpen(true)} icon={<Layers className="w-4 h-4" />}>
            Bulk Apply Template
          </Button>
          <Button onClick={() => setIsBulkOpen(true)} icon={<Plus className="w-4 h-4" />}>
            New Requirement
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search requirement or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Workflow Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
          >
            <option value="All">All Stages</option>
            <option value="Requested">Requested</option>
            <option value="Viewed">Viewed</option>
            <option value="Uploaded">Uploaded</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Requirements List & Item Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requirements List (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((r) => {
            const isSelected = selectedReq?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelectedReq(r)}
                className={`bg-white border rounded-xl p-4 shadow-2xs cursor-pointer transition-all ${
                  isSelected ? 'border-brand-600 ring-2 ring-brand-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-brand-600 tracking-wider">
                      {r.customerName || 'General Requirement'}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">{r.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{r.description}</p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>Period: <strong className="text-slate-700">{r.period}</strong></span>
                    <span>Due: <strong className="text-slate-700 font-mono">{r.dueDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-brand-600 font-semibold text-[11px]">
                    <span>{r.items?.length || 0} Checklist Items</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Requirement Detail / Workflow Action Pane (1 Col) */}
        <div className="space-y-4">
          {selectedReq ? (
            <Card title="Requirement Inspector" subtitle={selectedReq.title}>
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Stage:</span>
                    <StatusBadge status={selectedReq.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Client:</span>
                    <span className="font-semibold text-slate-800">{selectedReq.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Due Date:</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedReq.dueDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Staff:</span>
                    <span className="font-medium text-slate-800">{selectedReq.assignedUser}</span>
                  </div>
                </div>

                {/* Workflow Progression Controls */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Advance Workflow</span>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleUpdateStatus(selectedReq, 'Under Review')}
                    >
                      Under Review
                    </Button>
                    <Button 
                      size="sm" 
                      variant="success" 
                      onClick={() => handleUpdateStatus(selectedReq, 'Approved')}
                    >
                      Approve All
                    </Button>
                  </div>
                </div>

                {/* Checklist Items Breakdown */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">Checklist Verification</span>
                  <div className="space-y-2">
                    {selectedReq.items?.map((it) => (
                      <div key={it.id} className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-800">{it.itemTitle}</div>
                          <span className="text-[10px] text-slate-400">{it.isMandatory ? 'Mandatory' : 'Optional'}</span>
                        </div>
                        <StatusBadge status={it.status} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card title="Inspector">
              <div className="py-12 text-center text-slate-400 text-xs">
                Select a requirement to review its checklist items and approve documentation.
              </div>
            </Card>
          )}

          {/* Templates Library Preview Card */}
          <Card title="Available Templates" subtitle="System templates for 1-click customer rollouts">
            <div className="space-y-2 text-xs">
              {templates.map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                  <div className="font-semibold text-slate-900">{t.title}</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                  <span className="text-[10px] text-brand-600 font-medium block mt-1">
                    {t.items.length} standardized compliance checks
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Bulk Create Modal */}
      <BulkCreateRequirementModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={onRefresh}
        customers={customers}
        templates={templates}
      />
    </div>
  );
};
