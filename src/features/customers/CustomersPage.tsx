import React, { useState, useMemo } from 'react';
import { Customer } from '../../types';
import { db } from '../../services/db';
import { 
  Search, Plus, Filter, LayoutGrid, List as ListIcon, 
  ChevronDown, Building2, User, MoreVertical, ShieldCheck, Clock, FileText, CheckCircle2
} from 'lucide-react';

interface CustomersPageProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onOpenCreateModal: () => void;
}

export function CustomersPage({ customers, onSelectCustomer, onOpenCreateModal }: CustomersPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  // filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        (c.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.legalName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.pan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.gstin || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || c.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return (a.displayName || '').localeCompare(b.displayName || '');
      } else if (sortBy === 'date') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });
  }, [customers, searchQuery, typeFilter, statusFilter, sortBy]);

  const getInitials = (name: string) => {
    if (!name) return 'C';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden page-enter">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and view all your clients in one place</p>
        </div>
        <button 
          onClick={onOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Customer
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, PAN, or GSTIN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-slate-50">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Types</option>
            <option value="Corporate">Corporate</option>
            <option value="LLP">LLP</option>
            <option value="Individual">Individual</option>
            <option value="Firm">Firm</option>
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Pending">Pending</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Date Added</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {filteredCustomers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No customers found</h3>
            <p className="text-slate-500 max-w-md">Try adjusting your filters or search query to find what you're looking for.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCustomers.map(customer => (
              <div key={customer.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col card-interactive hover:shadow-md transition-shadow">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                      {getInitials(customer.displayName || customer.legalName || '')}
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-900 text-lg line-clamp-1" title={customer.displayName}>
                      {customer.displayName}
                    </h3>
                    {customer.legalName && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5" title={customer.legalName}>
                        {customer.legalName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                      {customer.type === 'Corporate' ? <Building2 className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                      {customer.type || 'Unknown'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      customer.status === 'Active' ? 'bg-green-50 text-green-700 border border-green-200' :
                      customer.status === 'Inactive' ? 'bg-slate-50 text-slate-700 border border-slate-200' :
                      'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {customer.status === 'Active' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                      {customer.status || 'Active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-center justify-center text-center">
                      <FileText className="w-4 h-4 text-slate-400 mb-1" />
                      <span className="text-lg font-semibold text-slate-700">2</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">Open Tasks</span>
                    </div>
                    <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-100 flex flex-col items-center justify-center text-center">
                      <ShieldCheck className="w-4 h-4 text-amber-500 mb-1" />
                      <span className="text-lg font-semibold text-amber-700">1</span>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-600 mt-0.5">Pending Docs</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-100 p-3 bg-slate-50/50 mt-auto">
                  <button 
                    onClick={() => onSelectCustomer(customer)}
                    className="w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
                  >
                    View 360° Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">GSTIN</th>
                    <th className="px-6 py-4">PAN</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium text-xs shadow-sm">
                            {getInitials(customer.displayName || customer.legalName || '')}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{customer.displayName}</div>
                            {customer.legalName && <div className="text-xs text-slate-500">{customer.legalName}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {customer.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {customer.gstin || '-'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {customer.pan || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                          customer.status === 'Active' ? 'bg-green-50 text-green-700' :
                          customer.status === 'Inactive' ? 'bg-slate-50 text-slate-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {customer.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => onSelectCustomer(customer)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
