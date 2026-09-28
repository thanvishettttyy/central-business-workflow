import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  List as ListIcon, 
  Search, 
  Filter,
  Plus,
  Clock,
  ArrowRight,
  MoreVertical,
  CheckCircle2,
  Circle,
  Clock4,
  AlertCircle
} from 'lucide-react';
import { Task, Customer, TaskStatus } from '../../types';
import { db } from '../../services/db';

interface TasksPageProps {
  tasks: Task[];
  customers: Customer[];
  onOpenCreateModal: () => void;
  onRefresh: () => void;
}

type ViewMode = 'kanban' | 'list';

export const TasksPage: React.FC<TasksPageProps> = ({ 
  tasks, 
  customers, 
  onOpenCreateModal,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await db.updateTask(taskId, { status: newStatus });
      onRefresh();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getCustomerName = (customerId: string) => {
    return customers.find(c => c.id === customerId)?.name || 'Unknown Client';
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  const columns: { id: TaskStatus; title: string; icon: React.ReactNode; color: string }[] = [
    { id: 'todo', title: 'To Do', icon: <Circle className="w-4 h-4" />, color: 'bg-slate-200 text-slate-700' },
    { id: 'in-progress', title: 'In Progress', icon: <Clock4 className="w-4 h-4" />, color: 'bg-blue-100 text-blue-700' },
    { id: 'review', title: 'Review', icon: <AlertCircle className="w-4 h-4" />, color: 'bg-purple-100 text-purple-700' },
    { id: 'completed', title: 'Completed', icon: <CheckCircle2 className="w-4 h-4" />, color: 'bg-green-100 text-green-700' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 from-red-50 to-white';
      case 'medium': return 'border-l-yellow-500 from-yellow-50 to-white';
      case 'low': return 'border-l-green-500 from-green-50 to-white';
      default: return 'border-l-slate-300 from-slate-50 to-white';
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">High</span>;
      case 'medium': return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Medium</span>;
      case 'low': return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Low</span>;
      default: return null;
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo': return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">To Do</span>;
      case 'in-progress': return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">In Progress</span>;
      case 'review': return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">Review</span>;
      case 'completed': return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">Completed</span>;
      default: return null;
    }
  }

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return <span className="text-orange-600 font-medium">Today</span>;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return <span className="text-red-600 font-medium">Yesterday</span>;
    if (diffDays < 0) return <span className="text-red-600 font-medium">{Math.abs(diffDays)} days ago</span>;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getInitials = (id?: string) => {
    if (!id) return '?';
    return id.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden page-enter">
      {/* Header & Controls */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Tasks</h1>
          <button
            onClick={onOpenCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center border border-slate-200 rounded-lg bg-white p-1">
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-md ${viewMode === 'kanban' ? 'bg-slate-100 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-slate-100 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-sm border-slate-200 rounded-lg py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <select 
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="text-sm border-slate-200 rounded-lg py-1.5 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Assignees</option>
                <option value="user1">User 1</option>
                <option value="user2">User 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {viewMode === 'kanban' ? (
          <div className="flex gap-6 h-full items-start overflow-x-auto pb-4">
            {columns.map(column => (
              <div key={column.id} className="flex-shrink-0 w-80 bg-slate-100/50 rounded-xl flex flex-col max-h-full border border-slate-200/60">
                <div className="p-4 flex items-center justify-between border-b border-slate-200/60">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-md ${column.color}`}>
                      {column.icon}
                    </div>
                    <h3 className="font-semibold text-slate-700">{column.title}</h3>
                  </div>
                  <span className="bg-white text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full shadow-sm border border-slate-200">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {filteredTasks.filter(t => t.status === column.id).map(task => (
                    <div 
                      key={task.id}
                      className={`bg-white rounded-lg shadow-sm border-l-4 border-y border-r border-slate-200 p-4 flex flex-col space-y-3 hover:shadow-md transition-shadow bg-gradient-to-r ${getPriorityColor(task.priority)} group`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-500 block">{getCustomerName(task.customerId)}</span>
                          <h4 className="font-semibold text-slate-800 text-sm leading-tight">{task.title}</h4>
                        </div>
                        <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-slate-600 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1 text-slate-500 text-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatDueDate(task.dueDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.status !== 'completed' && (
                            <button 
                              onClick={() => {
                                const nextStatus = 
                                  task.status === 'todo' ? 'in-progress' :
                                  task.status === 'in-progress' ? 'review' : 'completed';
                                handleStatusChange(task.id, nextStatus as TaskStatus);
                              }}
                              className="text-xs flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                              title="Move to next status"
                            >
                              <span>Next</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold ring-2 ring-white" title={`Assignee: ${task.assigneeId || 'Unassigned'}`}>
                            {getInitials(task.assigneeId)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTasks.filter(t => t.status === column.id).length === 0 && (
                    <div className="p-4 text-center border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Task</th>
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Priority</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Assignee</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">{getCustomerName(task.customerId)}</td>
                      <td className="px-6 py-4">{getStatusBadge(task.status)}</td>
                      <td className="px-6 py-4">{getPriorityBadge(task.priority)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{formatDueDate(task.dueDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {getInitials(task.assigneeId)}
                          </div>
                          <span className="text-xs">{task.assigneeId || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                        No tasks found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
