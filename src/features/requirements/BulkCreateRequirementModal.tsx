import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Customer, RequirementTemplate } from '../../types';
import { db } from '../../services/db';
import { CheckSquare, Users } from 'lucide-react';

interface BulkCreateRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customers: Customer[];
  templates: RequirementTemplate[];
}

export const BulkCreateRequirementModal: React.FC<BulkCreateRequirementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customers,
  templates,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>(customers.map(c => c.id));
  const [period, setPeriod] = useState('October 2026');
  const [dueDate, setDueDate] = useState('2026-10-10');

  const toggleCustomer = (id: string) => {
    if (selectedCustomerIds.includes(id)) {
      setSelectedCustomerIds(selectedCustomerIds.filter(c => c !== id));
    } else {
      setSelectedCustomerIds([...selectedCustomerIds, id]);
    }
  };

  const selectAll = () => setSelectedCustomerIds(customers.map(c => c.id));
  const clearAll = () => setSelectedCustomerIds([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || selectedCustomerIds.length === 0) return;

    db.bulkCreateFromTemplate(selectedTemplateId, selectedCustomerIds, dueDate, period);
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Generate Requirements"
      subtitle="Instantly assign checklist packs to multiple customers in one click"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Checklist Template
          </label>
          <select
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.items.length} items) - {t.category}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Compliance Period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            placeholder="e.g. October 2026"
            required
          />
          <Input
            label="Client Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        {/* Customer Multiselect Checklist */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Target Customers ({selectedCustomerIds.length} of {customers.length} selected)
            </label>
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={selectAll} className="text-brand-600 hover:underline cursor-pointer">
                Select All
              </button>
              <span>•</span>
              <button type="button" onClick={clearAll} className="text-slate-500 hover:underline cursor-pointer">
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50 p-2 space-y-1">
            {customers.map((c) => {
              const isChecked = selectedCustomerIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className="flex items-center gap-2.5 p-2 rounded hover:bg-white cursor-pointer text-xs"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCustomer(c.id)}
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-slate-800">{c.displayName}</span>
                    <span className="text-slate-400 ml-2">({c.customerType} • Staff: {c.assignedStaff})</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={selectedCustomerIds.length === 0}>
            Generate Requirements ({selectedCustomerIds.length})
          </Button>
        </div>
      </form>
    </Modal>
  );
};
