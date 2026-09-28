export type CustomerType = 'Corporate' | 'Partnership' | 'Proprietorship' | 'LLP' | 'Individual';
export type CustomerStatus = 'Active' | 'Inactive' | 'Archived' | 'Lead';

export interface Customer {
  id: string;
  legalName: string;
  displayName: string;
  customerType: CustomerType;
  pan: string;
  gstin: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  assignedManager: string;
  assignedStaff: string;
  status: CustomerStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory = 
  | 'Financial'
  | 'Tax'
  | 'Legal'
  | 'Identity'
  | 'Banking'
  | 'Invoices'
  | 'Contracts'
  | 'Reports'
  | 'Other';

export type DocumentStatus = 
  | 'Uploaded'
  | 'Processing'
  | 'Processed'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Archived';

export interface DocumentRecord {
  id: string;
  customerId: string;
  customerName?: string;
  filename: string;
  filePath: string;
  category: DocumentCategory;
  docType: string;
  period?: string;
  fileType: 'PDF' | 'XLSX' | 'CSV' | 'PNG' | 'JPG';
  sizeBytes: number;
  checksum: string;
  status: DocumentStatus;
  uploader: string;
  ocrConfidence?: number;
  createdAt: string;
  updatedAt: string;
}

export type RequirementStatus = 
  | 'Requested'
  | 'Viewed'
  | 'Uploaded'
  | 'Under Review'
  | 'Approved'
  | 'Completed';

export interface RequirementItem {
  id: string;
  requirementId: string;
  itemTitle: string;
  isMandatory: boolean;
  status: 'Pending' | 'Uploaded' | 'Approved';
  documentId?: string;
}

export interface Requirement {
  id: string;
  customerId: string;
  customerName?: string;
  title: string;
  description: string;
  category: string;
  period: string;
  requestedDate: string;
  dueDate: string;
  status: RequirementStatus;
  assignedUser: string;
  creator?: string;
  items?: RequirementItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RequirementTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  items: { item: string; mandatory: boolean }[];
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Todo' | 'In Progress' | 'Review' | 'Completed' | 'Blocked' | 'Cancelled';

export interface TaskComment {
  id: string;
  taskId: string;
  author: string;
  comment: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  customerId?: string;
  customerName?: string;
  relatedRecordType?: 'Customer' | 'Requirement' | 'Document' | 'Deadline' | 'GST' | 'Tally' | 'Internal';
  relatedRecordId?: string;
  assignee: string;
  reviewer?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  creator: string;
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export type DeadlineStatus = 'Due' | 'Overdue' | 'Completed' | 'Upcoming';

export interface Deadline {
  id: string;
  customerId: string;
  customerName?: string;
  workType: string;
  period: string;
  dueDate: string;
  assignedUser: string;
  status: DeadlineStatus;
  priority: TaskPriority;
  relatedRequirementId?: string;
  relatedTaskId?: string;
  createdAt: string;
}

export interface GSTRecord {
  id: string;
  customerId: string;
  customerName?: string;
  period: string;
  financialYear: string;
  filingType: 'GSTR-1' | 'GSTR-3B' | 'GSTR-9' | 'GSTR-2B';
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  itcClaimed: number;
  filingStatus: 'Pending' | 'Under Review' | 'Filed (Recorded Locally)';
  dueDate: string;
  filingMode: 'Imported / Local Data';
  lastSyncedAt?: string;
}

export interface AccountingLedger {
  id: string;
  customerId?: string;
  companyName: string;
  ledgerName: string;
  ledgerGroup: string;
  openingBalance: number;
  closingBalance: number;
  source: string;
  updatedAt: string;
}

export interface AccountingVoucher {
  id: string;
  customerId?: string;
  voucherNumber: string;
  voucherType: 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Journal';
  date: string;
  partyLedger: string;
  amount: number;
  narration?: string;
  source: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: 'Meeting' | 'Deadline' | 'Task' | 'Follow-up' | 'GST';
  startTime: string;
  endTime: string;
  customerId?: string;
  customerName?: string;
  assignedUser?: string;
  reminderMinutes?: number;
}

export interface Communication {
  id: string;
  customerId: string;
  type: 'Note' | 'Call' | 'Email' | 'Meeting';
  subject: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  customerId?: string;
  customerName?: string;
  userName: string;
  action: string;
  objectType: string;
  objectId?: string;
  description: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'gst' | 'deadline' | 'document' | 'system';
  isRead: boolean;
  createdAt: string;
}

export type UserRole = 'Super Admin' | 'Manager' | 'Staff' | 'Reviewer' | 'Viewer';

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  object: string;
  timestamp: string;
  beforeData?: any;
  afterData?: any;
}

export interface BackupRecord {
  id: string;
  filename: string;
  filePath: string;
  sizeBytes: number;
  status: 'Completed' | 'Safety Backup' | 'Failed';
  verified: boolean;
  createdAt: string;
}

export interface OCRField {
  key: string;
  value: string;
  confidence: number;
  flagged: boolean;
}

export interface OCRJobResult {
  id: string;
  documentId: string;
  filename: string;
  overallConfidence: number;
  engine: string;
  fields: OCRField[];
  status: 'Needs Review' | 'Verified' | 'Saved';
}

// ─── Invoice / Billing ──────────────────────────────────────────────────────

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceLineItem {
  id: string;
  description: string;
  hsn: string;          // HSN / SAC code
  qty: number;
  unit: string;
  rate: number;         // per unit price
  gstPercent: number;   // 0 | 5 | 12 | 18 | 28
  amount: number;       // qty * rate (pre-tax)
  gstAmount: number;    // amount * gstPercent / 100
  total: number;        // amount + gstAmount
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  gstin: string;        // customer GSTIN
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalGST: number;
  grandTotal: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
