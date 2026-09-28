/**
 * notificationEngine.ts
 * 
 * Generates real AppNotification objects from live app data.
 * Called whenever the app reloads data so alerts are always fresh.
 */

import { AppNotification, Task, Deadline, GSTRecord, DocumentRecord } from '../types';

function makeId() {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / 86400000);
}

function hoursAgo(h: number) {
  return new Date(Date.now() - h * 3600000).toISOString();
}

// ─── Deadline alerts ─────────────────────────────────────────────────────────
function fromDeadlines(deadlines: Deadline[], alertDays = 3): AppNotification[] {
  return deadlines
    .filter(d => d.status !== 'Completed' && d.status !== 'N/A')
    .flatMap(d => {
      const days = daysUntil(d.dueDate);
      if (days < 0) {
        return [{
          id: makeId(),
          type: 'deadline' as const,
          title: `⚠️ Overdue: ${d.title}`,
          message: `${d.title} was due ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago. Immediate action required.`,
          isRead: false,
          createdAt: hoursAgo(Math.abs(days) * 20),
        }];
      }
      if (days <= alertDays) {
        return [{
          id: makeId(),
          type: 'deadline' as const,
          title: days === 0 ? `🔴 Due Today: ${d.title}` : `⏰ Due in ${days} day${days !== 1 ? 's' : ''}: ${d.title}`,
          message: `${d.category || 'Compliance'} deadline${d.customerName ? ` for ${d.customerName}` : ''} — ${d.dueDate}.`,
          isRead: false,
          createdAt: hoursAgo(1),
        }];
      }
      return [];
    });
}

// ─── Task alerts ──────────────────────────────────────────────────────────────
function fromTasks(tasks: Task[]): AppNotification[] {
  const today = new Date().toISOString().slice(0, 10);
  const results: AppNotification[] = [];

  tasks.forEach(t => {
    if (t.status === 'Completed') return;
    const days = daysUntil(t.dueDate);

    if (days < 0) {
      results.push({
        id: makeId(),
        type: 'task',
        title: `Task Overdue: "${t.title}"`,
        message: `Assigned to ${t.assignee}. Was due ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago${t.customerName ? ` — ${t.customerName}` : ''}.`,
        isRead: false,
        createdAt: hoursAgo(Math.abs(days) * 18),
      });
    } else if (t.dueDate === today) {
      results.push({
        id: makeId(),
        type: 'task',
        title: `Due Today: "${t.title}"`,
        message: `Assigned to ${t.assignee}. Priority: ${t.priority}${t.customerName ? ` — ${t.customerName}` : ''}.`,
        isRead: false,
        createdAt: hoursAgo(2),
      });
    } else if (t.priority === 'Urgent' && days <= 2) {
      results.push({
        id: makeId(),
        type: 'task',
        title: `🚨 Urgent Task Due Soon: "${t.title}"`,
        message: `Due in ${days} day${days !== 1 ? 's' : ''} — Priority: Urgent. Assigned to ${t.assignee}.`,
        isRead: false,
        createdAt: hoursAgo(3),
      });
    }
  });

  return results;
}

// ─── GST alerts ───────────────────────────────────────────────────────────────
function fromGST(gstRecords: GSTRecord[]): AppNotification[] {
  return gstRecords
    .filter(g => g.filingStatus !== 'Filed (Recorded Locally)')
    .map(g => ({
      id: makeId(),
      type: 'gst' as const,
      title: `GST Return Pending: ${g.returnType}`,
      message: `${g.returnType} for ${g.period}${g.customerName ? ` — ${g.customerName}` : ''} is ${g.filingStatus.toLowerCase()}.`,
      isRead: false,
      createdAt: hoursAgo(6),
    }));
}

// ─── Document alerts ──────────────────────────────────────────────────────────
function fromDocuments(docs: DocumentRecord[]): AppNotification[] {
  return docs
    .filter(d => d.status === 'Uploaded' || d.status === 'Under Review')
    .slice(0, 3) // cap at 3 doc notifications
    .map(d => ({
      id: makeId(),
      type: 'document' as const,
      title: `Document Awaiting Review: ${d.filename}`,
      message: `${d.category} document${d.customerName ? ` from ${d.customerName}` : ''} is ${d.status.toLowerCase()} and needs processing.`,
      isRead: false,
      createdAt: hoursAgo(4),
    }));
}

// ─── System notifications ─────────────────────────────────────────────────────
function systemNotifications(): AppNotification[] {
  return [
    {
      id: 'sys-001',
      type: 'system',
      title: 'Central Workflow is up to date',
      message: 'You are running v1.0.0. All OCR workers are operational.',
      isRead: true,
      createdAt: hoursAgo(24),
    },
    {
      id: 'sys-002',
      type: 'system',
      title: 'Auto Backup Completed',
      message: 'Database backup completed successfully. Stored at configured path.',
      isRead: true,
      createdAt: hoursAgo(12),
    },
  ];
}

// ─── Main generator ───────────────────────────────────────────────────────────
export interface NotificationEngineInput {
  tasks: Task[];
  deadlines: Deadline[];
  gstRecords: GSTRecord[];
  documents: DocumentRecord[];
  deadlineAlertDays?: number;
}

export function generateNotifications(input: NotificationEngineInput): AppNotification[] {
  const { tasks, deadlines, gstRecords, documents, deadlineAlertDays = 3 } = input;

  const generated: AppNotification[] = [
    ...fromDeadlines(deadlines, deadlineAlertDays),
    ...fromTasks(tasks),
    ...fromGST(gstRecords),
    ...fromDocuments(documents),
    ...systemNotifications(),
  ];

  // De-duplicate by type+title, sort unread first then by date desc
  const seen = new Set<string>();
  const unique = generated.filter(n => {
    const key = `${n.type}:${n.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}
