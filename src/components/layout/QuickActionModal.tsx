import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Customer, Task, DocumentRecord, Requirement } from '../../types';
import { db } from '../../services/db';
import { Users, Workflow, FileText, CheckSquare } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customers: Customer[];
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customers,
}) => {
  const [activeTab, setActiveTab] = useState<'task' | 'customer' | 'document' | 'requirement'>('task');

  // Customer Form State
  const [custLegalName, setCustLegalName] = useState('');
  const [custDisplayName, setCustDisplayName] = useState('');
  const [custType, setCustType] = useState<Customer['customerType']>('Corporate');
  const [custPan, setCustPan] = useState('');
  const [custGstin, setCustGstin] = useState('');
  const [custState, setCustState] = useState('Karnataka');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCustomerId, setTaskCustomerId] = useState(customers[0]?.id || '');
  const [taskAssignee, setTaskAssignee] = useState('Amit Kumar');
  const [taskPriority, setTaskPriority] = useState<Task['priority']>('High');
  const [taskDueDate, setTaskDueDate] = useState('2026-10-15');

  // Document Form State
  const [docFilename, setDocFilename] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentRecord['category']>('Tax');
  const [docCustomerId, setDocCustomerId] = useState(customers[0]?.id || '');

  // Requirement Form State
  const [reqTitle, setReqTitle] = useState('');
  const [reqCustomerId, setReqCustomerId] = useState(customers[0]?.id || '');
  const [reqDueDate, setReqDueDate] = useState('2026-10-10');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custDisplayName) return;
    db.saveCustomer({
      legalName: custLegalName || custDisplayName,
      displayName: custDisplayName,
      customerType: custType,
      pan: custPan || 'AABCD1234E',
      gstin: custGstin || '29AABCD1234E1Z2',
      phone: custPhone || '+91 98000 00000',
      email: custEmail || 'contact@client.example.com',
      address: 'Business Park, Central Avenue',
      state: custState,
      assignedManager: 'Priya Patel',
      assignedStaff: 'Amit Kumar',
      status: 'Active',
      notes: 'Created via Quick Action',
    });
    onSuccess();
    onClose();
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    const cust = db.getCustomerById(taskCustomerId);
    db.saveTask({
      title: taskTitle,
      description: taskDescription,
      customerId: taskCustomerId,
      customerName: cust?.displayName,
      assignee: taskAssignee,
      reviewer: 'Priya Patel',
      priority: taskPriority,
      status: 'Todo',
      dueDate: taskDueDate,
      creator: db.getCurrentUser().name,
    });
    onSuccess();
    onClose();
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFilename) return;
    const cust = db.getCustomerById(docCustomerId);
    db.saveDocument({
      customerId: docCustomerId,
      customerName: cust?.displayName,
      filename: docFilename.endsWith('.pdf') || docFilename.endsWith('.xlsx') ? docFilename : `${docFilename}.pdf`,
      filePath: `customers/${docCustomerId}/Documents/${docFilename}`,
      category: docCategory,
      docType: 'Official Document',
      period: 'September 2026',
      fileType: docFilename.endsWith('.xlsx') ? 'XLSX' : 'PDF',
      sizeBytes: 154200,
      checksum: 'sha256-generated...',
      status: 'Uploaded',
      uploader: db.getCurrentUser().name,
    });
    onSuccess();
    onClose();
  };

  const handleCreateRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle) return;
    const cust = db.getCustomerById(reqCustomerId);
    db.saveRequirement({
      customerId: reqCustomerId,
      customerName: cust?.displayName,
      title: reqTitle,
      description: 'Requested mandatory compliance documents',
      category: 'Tax',
      period: 'September 2026',
      requestedDate: new Date().toISOString().split('T')[0],
      dueDate: reqDueDate,
      status: 'Requested',
      assignedUser: 'Amit Kumar',
      items: [
        { id: `RI-${Date.now()}-1`, requirementId: '', itemTitle: 'Signed Invoices Schedule', isMandatory: true, status: 'Pending' },
        { id: `RI-${Date.now()}-2`, requirementId: '', itemTitle: 'Bank Reconciliation Statement', isMandatory: true, status: 'Pending' },
      ]
    });
    onSuccess();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Action"
      subtitle="Quickly log work, add customers, or create tasks"
      maxWidth="xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 gap-2">
        <button
          onClick={() => setActiveTab('task')}
          className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'task'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'customer'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>New Customer</span>
        </button>
        <button
          onClick={() => setActiveTab('document')}
          className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'document'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
        <button
          onClick={() => setActiveTab('requirement')}
          className={`flex items-center gap-1.5 pb-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'requirement'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>New Requirement</span>
        </button>
      </div>

      {/* Task Form */}
      {activeTab === 'task' && (
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            label="Task Title"
            required
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g. Reconcile GSTR-2B with Purchase Ledger"
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Provide context or instructions..."
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Associated Customer</label>
              <select
                value={taskCustomerId}
                onChange={(e) => setTaskCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
            <Input
              label="Due Date"
              type="date"
              required
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assignee</label>
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Amit Kumar">Amit Kumar (Staff)</option>
                <option value="Sneha Reddy">Sneha Reddy (Reviewer)</option>
                <option value="Priya Patel">Priya Patel (Manager)</option>
                <option value="Rajesh Sharma">Rajesh Sharma (Super Admin)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      )}

      {/* Customer Form */}
      {activeTab === 'customer' && (
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Display / Trade Name"
              required
              value={custDisplayName}
              onChange={(e) => setCustDisplayName(e.target.value)}
              placeholder="e.g. Apex Retail Enterprises"
            />
            <Input
              label="Legal Registered Name"
              value={custLegalName}
              onChange={(e) => setCustLegalName(e.target.value)}
              placeholder="e.g. Apex Retail India Private Limited"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Entity Type</label>
              <select
                value={custType}
                onChange={(e) => setCustType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Corporate">Corporate / Pvt Ltd</option>
                <option value="Partnership">Partnership</option>
                <option value="Proprietorship">Proprietorship</option>
                <option value="LLP">LLP</option>
                <option value="Individual">Individual</option>
              </select>
            </div>
            <Input
              label="PAN"
              value={custPan}
              onChange={(e) => setCustPan(e.target.value.toUpperCase())}
              placeholder="AAAAA9999A"
            />
            <Input
              label="GSTIN"
              value={custGstin}
              onChange={(e) => setCustGstin(e.target.value.toUpperCase())}
              placeholder="29AAAAA9999A1Z1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              placeholder="+91 98450 00000"
            />
            <Input
              label="Email"
              type="email"
              value={custEmail}
              onChange={(e) => setCustEmail(e.target.value)}
              placeholder="finance@apexretail.example.com"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Customer Profile</Button>
          </div>
        </form>
      )}

      {/* Document Form */}
      {activeTab === 'document' && (
        <form onSubmit={handleCreateDocument} className="space-y-4">
          <Input
            label="Document Filename"
            required
            value={docFilename}
            onChange={(e) => setDocFilename(e.target.value)}
            placeholder="e.g. Sales_Register_Q2.xlsx or Bank_Statement.pdf"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Associated Customer</label>
              <select
                value={docCustomerId}
                onChange={(e) => setDocCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Financial">Financial</option>
                <option value="Tax">Tax</option>
                <option value="Banking">Banking</option>
                <option value="Invoices">Invoices</option>
                <option value="Legal">Legal</option>
                <option value="Identity">Identity</option>
                <option value="Reports">Reports</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Record Document</Button>
          </div>
        </form>
      )}

      {/* Requirement Form */}
      {activeTab === 'requirement' && (
        <form onSubmit={handleCreateRequirement} className="space-y-4">
          <Input
            label="Requirement Title"
            required
            value={reqTitle}
            onChange={(e) => setReqTitle(e.target.value)}
            placeholder="e.g. Form 26AS & AIS Reconciliation Documents"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Customer</label>
              <select
                value={reqCustomerId}
                onChange={(e) => setReqCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
            <Input
              label="Due Date"
              type="date"
              required
              value={reqDueDate}
              onChange={(e) => setReqDueDate(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit">Issue Requirement</Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
