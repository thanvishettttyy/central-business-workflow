import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { db } from '../../services/db';
import {
  ArrowLeft,
  Edit2,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  File,
  MessageSquare,
  Activity
} from 'lucide-react';

interface CustomerProfileProps {
  customer: Customer;
  onBack: () => void;
}

type TabType = 'overview' | 'statutory' | 'tasks' | 'documents' | 'gst' | 'communications';

export const CustomerProfile: React.FC<CustomerProfileProps> = ({ customer, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [tasks, setTasks] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [gstReturns, setGstReturns] = useState<any[]>([]);
  const [communications, setCommunications] = useState<any[]>([]);

  useEffect(() => {
    // Simulated fetching from db
    const loadData = async () => {
      try {
        // Fallback to empty array if db methods are not yet fully defined
        const customerTasks = db.tasks?.filter((t: any) => t.customerId === customer.id) || [];
        const customerDocs = db.documents?.filter((d: any) => d.customerId === customer.id) || [];
        const customerGst = db.gstReturns?.filter((g: any) => g.customerId === customer.id) || [];
        const customerComms = db.communications?.filter((c: any) => c.customerId === customer.id) || [];

        setTasks(customerTasks);
        setDocuments(customerDocs);
        setGstReturns(customerGst);
        setCommunications(customerComms);
      } catch (e) {
        console.error('Error fetching customer data', e);
      }
    };
    
    loadData();
  }, [customer.id]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
    { id: 'statutory', label: 'Statutory Details', icon: <Building2 className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
    { id: 'gst', label: 'GST Returns', icon: <File className="w-4 h-4" /> },
    { id: 'communications', label: 'Communications', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Directory
        </button>
        <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit Profile
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="card backdrop-blur-md bg-white/80 border border-white/20 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
            {customer.displayName ? customer.displayName.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer.displayName || 'Unknown Customer'}</h1>
                <p className="text-gray-500 font-medium">{customer.legalName || 'No Legal Name provided'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {customer.status || 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Entity Type</p>
                <p className="text-sm font-medium text-gray-900">{customer.entityType || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">PAN</p>
                <p className="text-sm font-medium text-gray-900">{customer.pan || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">GSTIN</p>
                <p className="text-sm font-medium text-gray-900">{customer.gstin || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Manager / Staff</p>
                <p className="text-sm font-medium text-gray-900">
                  {customer.manager || '-'} / {customer.staff || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="lg:w-64 shrink-0">
          <div className="card backdrop-blur-md bg-white/80 border border-white/20 p-2 rounded-xl shadow-sm flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          <div className="card backdrop-blur-md bg-white/80 border border-white/20 rounded-2xl shadow-sm p-6 min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                      <Clock className="w-5 h-5" />
                      <h3 className="font-semibold">Open Tasks</h3>
                    </div>
                    <p className="text-3xl font-bold text-indigo-900">{tasks.filter(t => t.status !== 'Completed').length}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <h3 className="font-semibold">Pending GST</h3>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">{gstReturns.filter(g => g.status === 'Pending').length}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <FileText className="w-5 h-5" />
                      <h3 className="font-semibold">Missing Docs</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">0</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'statutory' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Statutory Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Address Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-900">{customer.address || 'No address provided'}</p>
                          <p className="text-sm text-gray-500">{customer.city}, {customer.state} {customer.pincode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-900">{customer.email || '-'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <p className="text-sm text-gray-900">{customer.phone || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Tasks</h2>
                {tasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-sm font-medium text-gray-500">Task Name</th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-500">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tasks.map((task, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{task.title || task.name}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {task.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500">{task.dueDate || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No tasks found for this client.</p>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Documents</h2>
                {documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc, i) => (
                      <div key={i} className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                        <FileText className="w-8 h-8 text-indigo-500 mr-4" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">Uploaded on {doc.uploadDate || '-'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                )}
              </div>
            )}

            {activeTab === 'gst' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">GST Returns</h2>
                {gstReturns.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-sm font-medium text-gray-500">Period</th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                          <th className="py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gstReturns.map((gst, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">{gst.period}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{gst.type}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                gst.status === 'Filed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                              }`}>
                                {gst.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No GST returns found.</p>
                )}
              </div>
            )}

            {activeTab === 'communications' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Communications</h2>
                {communications.length > 0 ? (
                  <div className="space-y-6">
                    {communications.map((comm, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-1 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-gray-900">{comm.sender}</span>
                            <span className="text-xs text-gray-500">{comm.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{comm.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No communication history available.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
