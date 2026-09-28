import { 
  Customer, DocumentRecord, Requirement, RequirementTemplate, 
  Task, Deadline, GSTRecord, AccountingLedger, AccountingVoucher, 
  CalendarEvent, Communication, Activity, AppNotification, BackupRecord, User
} from '../types';
import { 
  INITIAL_CUSTOMERS, INITIAL_DOCUMENTS, INITIAL_REQUIREMENTS, 
  INITIAL_TEMPLATES, INITIAL_TASKS, INITIAL_DEADLINES, 
  INITIAL_GST_RECORDS, INITIAL_LEDGERS, INITIAL_VOUCHERS, 
  INITIAL_CALENDAR_EVENTS, INITIAL_COMMUNICATIONS, INITIAL_ACTIVITIES, 
  INITIAL_NOTIFICATIONS, INITIAL_BACKUPS, INITIAL_USERS 
} from './mockData';

const STORAGE_KEYS = {
  CUSTOMERS: 'cw_customers',
  DOCUMENTS: 'cw_documents',
  REQUIREMENTS: 'cw_requirements',
  TEMPLATES: 'cw_templates',
  TASKS: 'cw_tasks',
  DEADLINES: 'cw_deadlines',
  GST: 'cw_gst',
  LEDGERS: 'cw_ledgers',
  VOUCHERS: 'cw_vouchers',
  CALENDAR: 'cw_calendar',
  COMMUNICATIONS: 'cw_communications',
  ACTIVITIES: 'cw_activities',
  NOTIFICATIONS: 'cw_notifications',
  BACKUPS: 'cw_backups',
  USERS: 'cw_users',
  CURRENT_USER: 'cw_current_user',
};

class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string) { return this.map.get(key) ?? null; }
  setItem(key: string, val: string) { this.map.set(key, String(val)); }
  removeItem(key: string) { this.map.delete(key); }
  clear() { this.map.clear(); }
}

const memoryStorageInstance = new MemoryStorage();

const getStorage = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage && typeof (globalThis as any).localStorage.getItem === 'function') {
      return (globalThis as any).localStorage;
    }
  } catch {
    // fallback
  }
  return memoryStorageInstance;
};

const storage = getStorage();

class DatabaseService {
  private isTauri: boolean;

  constructor() {
    this.isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
    this.initLocalStore();
  }

  private initLocalStore() {
    if (!storage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      storage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!storage.getItem(STORAGE_KEYS.DOCUMENTS)) {
      storage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    }
    if (!storage.getItem(STORAGE_KEYS.REQUIREMENTS)) {
      storage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(INITIAL_REQUIREMENTS));
    }
    if (!storage.getItem(STORAGE_KEYS.TEMPLATES)) {
      storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    }
    if (!storage.getItem(STORAGE_KEYS.TASKS)) {
      storage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    }
    if (!storage.getItem(STORAGE_KEYS.DEADLINES)) {
      storage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(INITIAL_DEADLINES));
    }
    if (!storage.getItem(STORAGE_KEYS.GST)) {
      storage.setItem(STORAGE_KEYS.GST, JSON.stringify(INITIAL_GST_RECORDS));
    }
    if (!storage.getItem(STORAGE_KEYS.LEDGERS)) {
      storage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(INITIAL_LEDGERS));
    }
    if (!storage.getItem(STORAGE_KEYS.VOUCHERS)) {
      storage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(INITIAL_VOUCHERS));
    }
    if (!storage.getItem(STORAGE_KEYS.CALENDAR)) {
      storage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(INITIAL_CALENDAR_EVENTS));
    }
    if (!storage.getItem(STORAGE_KEYS.COMMUNICATIONS)) {
      storage.setItem(STORAGE_KEYS.COMMUNICATIONS, JSON.stringify(INITIAL_COMMUNICATIONS));
    }
    if (!storage.getItem(STORAGE_KEYS.ACTIVITIES)) {
      storage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    }
    if (!storage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      storage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!storage.getItem(STORAGE_KEYS.BACKUPS)) {
      storage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(INITIAL_BACKUPS));
    }
    if (!storage.getItem(STORAGE_KEYS.USERS)) {
      storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!storage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      storage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
  }

  public resetDemoData() {
    storage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    storage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    storage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(INITIAL_REQUIREMENTS));
    storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    storage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    storage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(INITIAL_DEADLINES));
    storage.setItem(STORAGE_KEYS.GST, JSON.stringify(INITIAL_GST_RECORDS));
    storage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(INITIAL_LEDGERS));
    storage.setItem(STORAGE_KEYS.VOUCHERS, JSON.stringify(INITIAL_VOUCHERS));
    storage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(INITIAL_CALENDAR_EVENTS));
    storage.setItem(STORAGE_KEYS.COMMUNICATIONS, JSON.stringify(INITIAL_COMMUNICATIONS));
    storage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
    storage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    storage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(INITIAL_BACKUPS));
    this.logActivity('System', 'RESET_DEMO', 'Database', undefined, 'Reset application data to factory demo state');
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    const raw = storage.getItem(STORAGE_KEYS.CUSTOMERS);
    return raw ? JSON.parse(raw) : [];
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  public saveCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Customer {
    const customers = this.getCustomers();
    const now = new Date().toISOString();

    if (customer.id) {
      const idx = customers.findIndex(c => c.id === customer.id);
      if (idx >= 0) {
        const updated = { ...customers[idx], ...customer, updatedAt: now } as Customer;
        customers[idx] = updated;
        storage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
        this.logActivity(this.getCurrentUser().name, 'UPDATE', 'Customer', updated.id, `Updated customer details for ${updated.displayName}`);
        return updated;
      }
    }

    const newId = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCustomer: Customer = {
      ...customer,
      id: newId,
      createdAt: now,
      updatedAt: now,
    };
    customers.unshift(newCustomer);
    storage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    this.logActivity(this.getCurrentUser().name, 'CREATE', 'Customer', newCustomer.id, `Created customer profile for ${newCustomer.displayName}`);
    return newCustomer;
  }

  public archiveCustomer(id: string) {
    const customers = this.getCustomers();
    const item = customers.find(c => c.id === id);
    if (item) {
      item.status = 'Archived';
      item.updatedAt = new Date().toISOString();
      storage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      this.logActivity(this.getCurrentUser().name, 'ARCHIVE', 'Customer', id, `Archived customer ${item.displayName}`);
    }
  }

  // --- Documents ---
  public getDocuments(customerId?: string): DocumentRecord[] {
    const raw = storage.getItem(STORAGE_KEYS.DOCUMENTS);
    const docs: DocumentRecord[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return docs.filter(d => d.customerId === customerId);
    }
    return docs;
  }

  public saveDocument(doc: Omit<DocumentRecord, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): DocumentRecord {
    const docs = this.getDocuments();
    const now = new Date().toISOString();

    if (doc.id) {
      const idx = docs.findIndex(d => d.id === doc.id);
      if (idx >= 0) {
        const updated = { ...docs[idx], ...doc, updatedAt: now } as DocumentRecord;
        docs[idx] = updated;
        storage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
        this.logActivity(this.getCurrentUser().name, 'UPDATE', 'Document', updated.id, `Updated document ${updated.filename}`);
        return updated;
      }
    }

    const newDoc: DocumentRecord = {
      ...doc,
      id: `DOC-${String(docs.length + 1).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now,
    };
    docs.unshift(newDoc);
    storage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    this.logActivity(this.getCurrentUser().name, 'UPLOAD', 'Document', newDoc.id, `Uploaded ${newDoc.filename} for customer`);
    return newDoc;
  }

  // --- Requirements ---
  public getRequirements(customerId?: string): Requirement[] {
    const raw = storage.getItem(STORAGE_KEYS.REQUIREMENTS);
    const reqs: Requirement[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return reqs.filter(r => r.customerId === customerId);
    }
    return reqs;
  }

  public getTemplates(): RequirementTemplate[] {
    const raw = storage.getItem(STORAGE_KEYS.TEMPLATES);
    return raw ? JSON.parse(raw) : [];
  }

  public saveRequirement(req: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Requirement {
    const reqs = this.getRequirements();
    const now = new Date().toISOString();

    if (req.id) {
      const idx = reqs.findIndex(r => r.id === req.id);
      if (idx >= 0) {
        const updated = { ...reqs[idx], ...req, updatedAt: now } as Requirement;
        reqs[idx] = updated;
        storage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(reqs));
        this.logActivity(this.getCurrentUser().name, 'UPDATE', 'Requirement', updated.id, `Updated requirement ${updated.title}`);
        return updated;
      }
    }

    const newReq: Requirement = {
      ...req,
      id: `REQ-${String(reqs.length + 1).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now,
    };
    reqs.unshift(newReq);
    storage.setItem(STORAGE_KEYS.REQUIREMENTS, JSON.stringify(reqs));
    this.logActivity(this.getCurrentUser().name, 'CREATE', 'Requirement', newReq.id, `Created requirement ${newReq.title}`);
    return newReq;
  }

  public bulkCreateFromTemplate(templateId: string, customerIds: string[], dueDate: string, period: string) {
    const tmpl = this.getTemplates().find(t => t.id === templateId);
    if (!tmpl) return;

    customerIds.forEach(cId => {
      const cust = this.getCustomerById(cId);
      this.saveRequirement({
        customerId: cId,
        customerName: cust?.displayName,
        title: `${tmpl.title} - ${period}`,
        description: tmpl.description,
        category: tmpl.category,
        period,
        requestedDate: new Date().toISOString().split('T')[0],
        dueDate,
        status: 'Requested',
        assignedUser: cust?.assignedStaff || 'Amit Kumar',
        items: tmpl.items.map((it, i) => ({
          id: `RI-${Date.now()}-${i}`,
          requirementId: '',
          itemTitle: it.item,
          isMandatory: it.mandatory,
          status: 'Pending'
        }))
      });
    });
  }

  // --- Tasks ---
  public getTasks(customerId?: string): Task[] {
    const raw = storage.getItem(STORAGE_KEYS.TASKS);
    const tasks: Task[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return tasks.filter(t => t.customerId === customerId);
    }
    return tasks;
  }

  public saveTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Task {
    const tasks = this.getTasks();
    const now = new Date().toISOString();

    if (task.id) {
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx >= 0) {
        const updated = { ...tasks[idx], ...task, updatedAt: now } as Task;
        tasks[idx] = updated;
        storage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        this.logActivity(this.getCurrentUser().name, 'UPDATE', 'Task', updated.id, `Updated task ${updated.title}`);
        return updated;
      }
    }

    const newTask: Task = {
      ...task,
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now,
    };
    tasks.unshift(newTask);
    storage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.logActivity(this.getCurrentUser().name, 'CREATE', 'Task', newTask.id, `Created task ${newTask.title}`);
    return newTask;
  }

  public deleteTask(id: string) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    storage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    this.logActivity(this.getCurrentUser().name, 'DELETE', 'Task', id, `Deleted task ${id}`);
  }

  // --- Deadlines ---
  public getDeadlines(customerId?: string): Deadline[] {
    const raw = storage.getItem(STORAGE_KEYS.DEADLINES);
    const deadlines: Deadline[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return deadlines.filter(d => d.customerId === customerId);
    }
    return deadlines;
  }

  public saveDeadline(deadline: Omit<Deadline, 'id' | 'createdAt'> & { id?: string }): Deadline {
    const deadlines = this.getDeadlines();
    const now = new Date().toISOString();

    if (deadline.id) {
      const idx = deadlines.findIndex(d => d.id === deadline.id);
      if (idx >= 0) {
        const updated = { ...deadlines[idx], ...deadline } as Deadline;
        deadlines[idx] = updated;
        storage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
        return updated;
      }
    }

    const newDeadline: Deadline = {
      ...deadline,
      id: `DL-${String(deadlines.length + 1).padStart(3, '0')}`,
      createdAt: now,
    };
    deadlines.unshift(newDeadline);
    storage.setItem(STORAGE_KEYS.DEADLINES, JSON.stringify(deadlines));
    this.logActivity(this.getCurrentUser().name, 'CREATE', 'Deadline', newDeadline.id, `Created deadline for ${newDeadline.workType}`);
    return newDeadline;
  }

  // --- GST ---
  public getGSTRecords(customerId?: string): GSTRecord[] {
    const raw = storage.getItem(STORAGE_KEYS.GST);
    const records: GSTRecord[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return records.filter(g => g.customerId === customerId);
    }
    return records;
  }

  public saveGSTRecord(record: Omit<GSTRecord, 'id'> & { id?: string }): GSTRecord {
    const records = this.getGSTRecords();
    if (record.id) {
      const idx = records.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        records[idx] = { ...records[idx], ...record } as GSTRecord;
        storage.setItem(STORAGE_KEYS.GST, JSON.stringify(records));
        return records[idx];
      }
    }
    const newRecord: GSTRecord = {
      ...record,
      id: `GST-${String(records.length + 1).padStart(3, '0')}`,
    };
    records.unshift(newRecord);
    storage.setItem(STORAGE_KEYS.GST, JSON.stringify(records));
    return newRecord;
  }

  // --- Accounting / Tally ---
  public getLedgers(customerId?: string): AccountingLedger[] {
    const raw = storage.getItem(STORAGE_KEYS.LEDGERS);
    const ledgers: AccountingLedger[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return ledgers.filter(l => l.customerId === customerId);
    }
    return ledgers;
  }

  public getVouchers(customerId?: string): AccountingVoucher[] {
    const raw = storage.getItem(STORAGE_KEYS.VOUCHERS);
    const vouchers: AccountingVoucher[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return vouchers.filter(v => v.customerId === customerId);
    }
    return vouchers;
  }

  public saveLedger(ledger: AccountingLedger) {
    const ledgers = this.getLedgers();
    const idx = ledgers.findIndex(l => l.id === ledger.id);
    if (idx >= 0) {
      ledgers[idx] = ledger;
    } else {
      ledgers.push(ledger);
    }
    storage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(ledgers));
  }

  // --- Calendar ---
  public getCalendarEvents(customerId?: string): CalendarEvent[] {
    const raw = storage.getItem(STORAGE_KEYS.CALENDAR);
    const events: CalendarEvent[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return events.filter(e => e.customerId === customerId);
    }
    return events;
  }

  public saveCalendarEvent(event: Omit<CalendarEvent, 'id'> & { id?: string }): CalendarEvent {
    const events = this.getCalendarEvents();
    if (event.id) {
      const idx = events.findIndex(e => e.id === event.id);
      if (idx >= 0) {
        events[idx] = { ...events[idx], ...event } as CalendarEvent;
        storage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
        return events[idx];
      }
    }
    const newEvent: CalendarEvent = {
      ...event,
      id: `EVT-${Date.now()}`,
    };
    events.push(newEvent);
    storage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(events));
    return newEvent;
  }

  // --- Communications ---
  public getCommunications(customerId: string): Communication[] {
    const raw = storage.getItem(STORAGE_KEYS.COMMUNICATIONS);
    const list: Communication[] = raw ? JSON.parse(raw) : [];
    return list.filter(c => c.customerId === customerId);
  }

  public addCommunication(comm: Omit<Communication, 'id' | 'timestamp'>): Communication {
    const raw = storage.getItem(STORAGE_KEYS.COMMUNICATIONS);
    const list: Communication[] = raw ? JSON.parse(raw) : [];
    const item: Communication = {
      ...comm,
      id: `COMM-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    list.unshift(item);
    storage.setItem(STORAGE_KEYS.COMMUNICATIONS, JSON.stringify(list));
    this.logActivity(comm.author, 'COMMUNICATION', 'Customer', comm.customerId, `Logged ${comm.type}: ${comm.subject}`);
    return item;
  }

  // --- Activities ---
  public getActivities(customerId?: string): Activity[] {
    const raw = storage.getItem(STORAGE_KEYS.ACTIVITIES);
    const list: Activity[] = raw ? JSON.parse(raw) : [];
    if (customerId) {
      return list.filter(a => a.customerId === customerId);
    }
    return list;
  }

  public logActivity(userName: string, action: string, objectType: string, objectId?: string, description = '', customerId?: string) {
    const raw = storage.getItem(STORAGE_KEYS.ACTIVITIES);
    const list: Activity[] = raw ? JSON.parse(raw) : [];
    const cust = customerId ? this.getCustomerById(customerId) : undefined;
    const act: Activity = {
      id: `ACT-${Date.now()}`,
      customerId,
      customerName: cust?.displayName,
      userName,
      action,
      objectType,
      objectId,
      description,
      timestamp: new Date().toISOString(),
    };
    list.unshift(act);
    storage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list.slice(0, 500)));
  }

  // --- Notifications ---
  public getNotifications(): AppNotification[] {
    const raw = storage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return raw ? JSON.parse(raw) : [];
  }

  public markNotificationRead(id: string) {
    const notifs = this.getNotifications();
    const item = notifs.find(n => n.id === id);
    if (item) {
      item.isRead = true;
      storage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    }
  }

  public markAllNotificationsRead() {
    const notifs = this.getNotifications().map(n => ({ ...n, isRead: true }));
    storage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // --- Backups ---
  public getBackups(): BackupRecord[] {
    const raw = storage.getItem(STORAGE_KEYS.BACKUPS);
    return raw ? JSON.parse(raw) : [];
  }

  public createBackup(): BackupRecord {
    const backups = this.getBackups();
    const dateStr = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const newBackup: BackupRecord = {
      id: `BKP-${Date.now()}`,
      filename: `central_workflow_backup_${dateStr}.zip`,
      filePath: `backups/central_workflow_backup_${dateStr}.zip`,
      sizeBytes: Math.floor(11500000 + Math.random() * 2000000),
      status: 'Completed',
      verified: true,
      createdAt: new Date().toISOString()
    };
    backups.unshift(newBackup);
    storage.setItem(STORAGE_KEYS.BACKUPS, JSON.stringify(backups));
    this.logActivity(this.getCurrentUser().name, 'BACKUP', 'System', newBackup.id, `Created full system snapshot ${newBackup.filename}`);
    return newBackup;
  }

  // --- Users & Roles ---
  public getUsers(): User[] {
    const raw = storage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  }

  public getCurrentUser(): User {
    const raw = storage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : INITIAL_USERS[0];
  }

  public setCurrentUser(user: User) {
    storage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

export const db = new DatabaseService();
