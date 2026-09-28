import React, { useState, useEffect } from 'react';
import { Search, FileText, Users, CheckSquare, Clock, Landmark, FileCheck, ArrowRight, X } from 'lucide-react';
import { performGlobalSearch, SearchResultItem } from '../../services/searchService';
import { StatusBadge } from '../ui/Badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: SearchResultItem) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const hits = performGlobalSearch(query, filterType);
      setResults(hits);
    } else {
      setResults([]);
    }
  }, [query, filterType]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Customer': return <Users className="w-4 h-4 text-blue-600" />;
      case 'Document': return <FileText className="w-4 h-4 text-purple-600" />;
      case 'Requirement': return <CheckSquare className="w-4 h-4 text-amber-600" />;
      case 'Task': return <Clock className="w-4 h-4 text-emerald-600" />;
      case 'GST': return <FileCheck className="w-4 h-4 text-rose-600" />;
      case 'Accounting': return <Landmark className="w-4 h-4 text-indigo-600" />;
      default: return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  const categories = ['Customer', 'Document', 'Requirement', 'Task', 'GST', 'Accounting'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 pt-16 sm:p-0">
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
          onClick={onClose} 
        />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-slate-200">
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customers, documents, tasks, GST, ledgers (Type 'ABC' or 'Bank')..."
              className="w-full text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <kbd className="px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-100 rounded border border-slate-300">
                ESC
              </kbd>
              <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterType(undefined)}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                !filterType ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All Types
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterType(cat)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors shrink-0 ${
                  filterType === cat ? 'bg-brand-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
            {results.length > 0 ? (
              results.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  onClick={() => {
                    onSelectItem(item);
                    onClose();
                  }}
                  className="p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 mt-0.5 shrink-0 group-hover:bg-white group-hover:shadow-xs transition-colors">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm group-hover:text-brand-600">
                          {item.title}
                        </span>
                        {item.status && <StatusBadge status={item.status} />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ) : query.trim() ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching by PAN, GSTIN, customer name or document filename.</p>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400">
                <p className="text-xs">Fast search across customers, documents, GST, accounting ledgers & tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
