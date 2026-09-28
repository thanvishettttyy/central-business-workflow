import React, { useState, useEffect } from 'react';
import { 
  Search, Phone, Mail, Users, FileText, 
  Trash2, Send, Clock, MessageSquare, Activity
} from 'lucide-react';
import { Communication, Customer } from '../../types';
import { db } from '../../services/db';

interface CommunicationsPageProps {
  customers: Customer[];
  onRefresh: () => void;
}

const getRelativeTime = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getGradient = (name: string) => {
  const gradients = [
    'from-blue-500 to-cyan-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-red-500'
  ];
  const charCode = name ? name.charCodeAt(0) : 0;
  return gradients[charCode % 5];
};

const typeConfig = {
  call: { icon: Phone, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
  email: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  meeting: { icon: Users, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  note: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
};

export const CommunicationsPage: React.FC<CommunicationsPageProps> = ({ customers, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'activity'>('timeline');
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  
  const [composeType, setComposeType] = useState<'call' | 'email' | 'meeting' | 'note'>('call');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const loadData = async (customerId: string) => {
    try {
      // Assuming db methods exist based on requirements
      const comms = typeof db.getCommunications === 'function' ? await db.getCommunications(customerId) : [];
      const acts = typeof db.getActivities === 'function' ? await db.getActivities(customerId) : [];
      setCommunications(comms || []);
      setActivities(acts || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      loadData(selectedCustomerId);
    } else {
      setCommunications([]);
      setActivities([]);
    }
  }, [selectedCustomerId]);

  const handleLogCommunication = async () => {
    if (!selectedCustomerId || !composeSubject.trim() || !composeContent.trim()) return;
    
    try {
      if (typeof db.addCommunication === 'function') {
        await db.addCommunication({
          customerId: selectedCustomerId,
          type: composeType,
          subject: composeSubject,
          content: composeContent,
          timestamp: new Date().toISOString(),
          author: 'Current User'
        });
      }
      
      setComposeSubject('');
      setComposeContent('');
      onRefresh();
      loadData(selectedCustomerId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCommunication = async (commId: string) => {
    try {
      if (typeof db.deleteCommunication === 'function') {
        await db.deleteCommunication(commId);
        if (selectedCustomerId) {
          loadData(selectedCustomerId);
          onRefresh();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stats = {
    total: communications.length,
    calls: communications.filter(c => c.type === 'call').length,
    emails: communications.filter(c => c.type === 'email').length,
    meetings: communications.filter(c => c.type === 'meeting').length,
    notes: communications.filter(c => c.type === 'note').length,
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden page-enter flex-row">
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Left Panel */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search clients..." 
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.map(customer => {
              const isActive = customer.id === selectedCustomerId;
              // @ts-ignore
              const unreadCount = customer.unreadCount || 0;
              // @ts-ignore
              const lastComm = customer.lastCommDate;
              return (
                <div 
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors flex items-center space-x-3 ${isActive ? 'bg-brand-50 border-l-4 border-l-brand-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br ${getGradient(customer.name)}`}>
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-900 truncate">{customer.name}</h4>
                    <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
                      <span className="truncate">{customer.type || 'Client'}</span>
                      {lastComm && <span>{getRelativeTime(lastComm)}</span>}
                    </div>
                  </div>
                  {unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {unreadCount}
                    </div>
                  )}
                </div>
              );
            })}
            
            {filteredCustomers.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm">
                No clients found
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col bg-slate-50 relative min-w-0 h-full">
          {!selectedCustomer ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <MessageSquare className="w-16 h-16 mb-4 text-slate-200" />
              <h3 className="text-lg font-medium text-slate-600">No Client Selected</h3>
              <p className="text-sm mt-2 text-center max-w-md">Select a client from the list to view their communication history and log new interactions.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white border-b border-slate-200 px-6 py-5 shrink-0 z-10 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                    <p className="text-sm text-slate-500 mt-1">GSTIN: {selectedCustomer.gstin || 'N/A'}</p>
                  </div>
                  <div className="flex space-x-2">
                    {(['call', 'email', 'meeting', 'note'] as const).map(type => {
                      const Conf = typeConfig[type as keyof typeof typeConfig];
                      const Icon = Conf.icon;
                      return (
                        <button 
                          key={type}
                          onClick={() => setComposeType(type)}
                          className={`p-2 rounded-lg border flex items-center space-x-1.5 transition-colors ${composeType === type ? `${Conf.bg} ${Conf.border} ${Conf.color}` : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                          title={`Log ${type}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-xs font-medium capitalize hidden sm:inline">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex flex-wrap items-center space-x-6 mt-6 text-sm">
                  <div className="flex items-center text-slate-600">
                    <MessageSquare className="w-4 h-4 mr-1.5 text-slate-400" />
                    <span className="font-semibold text-slate-900 mr-1">{stats.total}</span> Total
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Phone className="w-4 h-4 mr-1.5 text-emerald-500" />
                    <span className="font-semibold text-slate-900 mr-1">{stats.calls}</span> Calls
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Mail className="w-4 h-4 mr-1.5 text-blue-500" />
                    <span className="font-semibold text-slate-900 mr-1">{stats.emails}</span> Emails
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Users className="w-4 h-4 mr-1.5 text-purple-500" />
                    <span className="font-semibold text-slate-900 mr-1">{stats.meetings}</span> Meetings
                  </div>
                  <div className="flex items-center text-slate-600">
                    <FileText className="w-4 h-4 mr-1.5 text-amber-500" />
                    <span className="font-semibold text-slate-900 mr-1">{stats.notes}</span> Notes
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white border-b border-slate-200 px-6 flex space-x-6 shrink-0">
                <button
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Timeline
                </button>
                <button
                  className={`py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'activity' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  onClick={() => setActiveTab('activity')}
                >
                  Activity Log
                </button>
              </div>

              {/* Feed Content */}
              <div className="flex-1 overflow-y-auto p-6 pb-48">
                {activeTab === 'timeline' && (
                  <div className="relative max-w-4xl mx-auto">
                    {communications.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-4">
                          <Clock className="w-6 h-6 text-slate-400" />
                        </div>
                        <h4 className="text-slate-900 font-medium">No communications yet</h4>
                        <p className="text-slate-500 text-sm mt-1">Be the first to log a call, email, or meeting.</p>
                      </div>
                    ) : (
                      <div className="space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                        {communications.map((comm) => {
                          const conf = typeConfig[comm.type as keyof typeof typeConfig] || typeConfig.note;
                          const Icon = conf.icon;
                          
                          return (
                            <div key={comm.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-50 bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                <div className={`w-full h-full rounded-full flex items-center justify-center ${conf.bg} ${conf.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                              </div>
                              
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-slate-100 bg-white shadow-xs hover:shadow-md transition-shadow relative">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>
                                      {comm.type}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {getRelativeTime(comm.timestamp || comm.date || '')}
                                    </span>
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteCommunication(comm.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 mb-1">{comm.subject}</h4>
                                <p className="text-sm text-slate-600 whitespace-pre-wrap">{comm.content}</p>
                                {comm.author && (
                                  <div className="mt-3 text-xs text-slate-400 flex items-center">
                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600 mr-2">
                                      {comm.author.charAt(0)}
                                    </div>
                                    {comm.author}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'activity' && (
                  <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 overflow-hidden">
                    {activities.length === 0 ? (
                      <div className="p-8 text-center text-slate-500">No activity log found.</div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {activities.map((act, idx) => (
                          <div key={idx} className="p-4 flex items-start space-x-4 hover:bg-slate-50 transition-colors">
                            <div className="mt-0.5 bg-slate-100 p-2 rounded-full text-slate-500">
                              <Activity className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm text-slate-800">{act.description || act.action}</p>
                              <span className="text-xs text-slate-400 mt-1 block">
                                {getRelativeTime(act.timestamp || act.date || '')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Compose Panel Pinned at Bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 max-h-[50%] flex flex-col">
                <div className="flex px-4 pt-3 border-b border-slate-100 shrink-0">
                  {(['call', 'email', 'meeting', 'note'] as const).map(type => {
                    const Conf = typeConfig[type as keyof typeof typeConfig];
                    const Icon = Conf.icon;
                    const isActive = composeType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setComposeType(type)}
                        className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive ? `border-${Conf.color.split('-')[1]}-500 ${Conf.color}` : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <span className="capitalize">{type}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="p-4 flex-1 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="Subject..."
                    className="w-full mb-3 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={composeSubject}
                    onChange={e => setComposeSubject(e.target.value)}
                  />
                  <textarea
                    placeholder="Write details here..."
                    className="w-full h-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    value={composeContent}
                    onChange={e => setComposeContent(e.target.value)}
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleLogCommunication}
                      disabled={!composeSubject.trim() || !composeContent.trim()}
                      className="flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Log Communication
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
