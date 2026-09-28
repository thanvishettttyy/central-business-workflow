import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Clock, Users, CheckCircle, FileCheck, Landmark 
} from 'lucide-react';
import { CalendarEvent, Customer, Task, Deadline, GSTRecord } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { db } from '../../services/db';

interface CalendarPageProps {
  events: CalendarEvent[];
  tasks: Task[];
  deadlines: Deadline[];
  gstRecords: GSTRecord[];
  customers: Customer[];
  onRefresh: () => void;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({
  events,
  tasks,
  deadlines,
  gstRecords,
  customers,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const [isNewEventOpen, setIsNewEventOpen] = useState(false);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<CalendarEvent['eventType']>('Meeting');
  const [eventDate, setEventDate] = useState('2026-10-10');
  const [eventCustomerId, setEventCustomerId] = useState(customers[0]?.id || '');
  const [eventAssignee, setEventAssignee] = useState('Amit Kumar');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle) return;
    const cust = db.getCustomerById(eventCustomerId);
    db.saveCalendarEvent({
      title: eventTitle,
      eventType,
      startTime: `${eventDate}T10:00:00Z`,
      endTime: `${eventDate}T11:00:00Z`,
      customerId: eventCustomerId,
      customerName: cust?.displayName,
      assignedUser: eventAssignee,
    });
    setIsNewEventOpen(false);
    setEventTitle('');
    onRefresh();
  };

  // Combine calendar items: direct events + tasks + deadlines + GST returns
  const allAgendaItems = [
    ...events.map(e => ({
      id: e.id,
      title: e.title,
      date: e.startTime.split('T')[0],
      customer: e.customerName,
      type: e.eventType,
      badgeColor: 'blue' as const,
    })),
    ...deadlines.map(d => ({
      id: d.id,
      title: `Deadline: ${d.workType}`,
      date: d.dueDate,
      customer: d.customerName,
      type: 'Deadline',
      badgeColor: 'rose' as const,
    })),
    ...tasks.map(t => ({
      id: t.id,
      title: `Task Due: ${t.title}`,
      date: t.dueDate,
      customer: t.customerName,
      type: 'Task',
      badgeColor: 'amber' as const,
    })),
    ...gstRecords.map(g => ({
      id: g.id,
      title: `GST Return: ${g.filingType} (${g.period})`,
      date: g.dueDate,
      customer: g.customerName,
      type: 'GST',
      badgeColor: 'purple' as const,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  // Calendar dates generation for October 2026 (Starts on Thursday)
  const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-brand-600" />
            <span>Compliance Calendar</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified statutory dates, GST windows, task due dates, and meetings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Month View
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'agenda' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Agenda List
            </button>
          </div>

          <Button onClick={() => setIsNewEventOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Add Event
          </Button>
        </div>
      </div>

      {/* Month Navigator Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-slate-900">{currentMonth}</h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Views */}
      {viewMode === 'month' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-[11px] font-bold text-slate-500 uppercase py-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {/* Leading empty days for Thu start (Sun, Mon, Tue, Wed) */}
            <div className="p-2 min-h-24 bg-slate-50/40 text-slate-300 text-xs">27</div>
            <div className="p-2 min-h-24 bg-slate-50/40 text-slate-300 text-xs">28</div>
            <div className="p-2 min-h-24 bg-slate-50/40 text-slate-300 text-xs">29</div>
            <div className="p-2 min-h-24 bg-slate-50/40 text-slate-300 text-xs">30</div>

            {/* October days */}
            {daysInMonth.map((day) => {
              const dayStr = `2026-10-${String(day).padStart(2, '0')}`;
              const dayItems = allAgendaItems.filter(item => item.date === dayStr);

              return (
                <div key={day} className="p-2 min-h-24 hover:bg-slate-50/60 transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-800">{day}</span>
                    {dayItems.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayItems.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        title={`${item.title} (${item.customer || ''})`}
                        className={`text-[10px] p-1 rounded font-medium truncate ${
                          item.type === 'Deadline'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.type === 'GST'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {dayItems.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-bold block">
                        +{dayItems.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Agenda List View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Upcoming Compliance Agenda</h3>
          <div className="divide-y divide-slate-100">
            {allAgendaItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{item.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.customer || 'General Business Activity'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-semibold text-slate-700">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Event Modal */}
      <Modal
        isOpen={isNewEventOpen}
        onClose={() => setIsNewEventOpen(false)}
        title="Schedule Calendar Event"
        subtitle="Add meeting, client follow-up, or internal reminder"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Event Title"
            required
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="e.g. Director Review for September GST"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Event Type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Meeting">Meeting</option>
                <option value="Follow-up">Client Follow-up</option>
                <option value="Task">Task Checkpoint</option>
                <option value="GST">GST Filing Session</option>
              </select>
            </div>
            <Input
              label="Date"
              type="date"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Associated Client</label>
              <select
                value={eventCustomerId}
                onChange={(e) => setEventCustomerId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Staff Assigned</label>
              <select
                value={eventAssignee}
                onChange={(e) => setEventAssignee(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Amit Kumar">Amit Kumar</option>
                <option value="Sneha Reddy">Sneha Reddy</option>
                <option value="Priya Patel">Priya Patel</option>
                <option value="Rajesh Sharma">Rajesh Sharma</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsNewEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
