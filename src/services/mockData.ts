import { 
  Customer, DocumentRecord, Requirement, RequirementTemplate, 
  Task, Deadline, GSTRecord, AccountingLedger, AccountingVoucher, 
  CalendarEvent, Communication, Activity, AppNotification, User, BackupRecord 
} from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'USR-001', name: 'Rajesh Sharma', email: 'rajesh@centralworkflow.local', role: 'Super Admin' },
  { id: 'USR-002', name: 'Priya Patel', email: 'priya@centralworkflow.local', role: 'Manager' },
  { id: 'USR-003', name: 'Amit Kumar', email: 'amit@centralworkflow.local', role: 'Staff' },
  { id: 'USR-004', name: 'Sneha Reddy', email: 'sneha@centralworkflow.local', role: 'Reviewer' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    legalName: 'ABC Technologies Private Limited',
    displayName: 'ABC Private Limited',
    customerType: 'Corporate',
    pan: 'AAACA1234F',
    gstin: '29AAACA1234F1Z5',
    phone: '+91 98450 12345',
    email: 'accounts@abctech.example.com',
    address: 'Plot 42, Electronics City Phase 1',
    state: 'Karnataka',
    assignedManager: 'Priya Patel',
    assignedStaff: 'Amit Kumar',
    status: 'Active',
    notes: 'Tier-1 IT Services Client. Monthly GST and Quarterly Audits.',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-20T14:30:00Z',
  },
  {
    id: 'CUST-002',
    legalName: 'XYZ Global Traders LLP',
    displayName: 'XYZ Traders',
    customerType: 'Partnership',
    pan: 'AABFX5678G',
    gstin: '27AABFX5678G1ZP',
    phone: '+91 98200 56789',
    email: 'tax@xyztraders.example.com',
    address: 'Shop 14, APMC Market, Vashi',
    state: 'Maharashtra',
    assignedManager: 'Priya Patel',
    assignedStaff: 'Sneha Reddy',
    status: 'Active',
    notes: 'Wholesale FMCG Distribution. High voucher volume.',
    createdAt: '2026-08-10T11:00:00Z',
    updatedAt: '2026-09-22T09:15:00Z',
  },
  {
    id: 'CUST-003',
    legalName: 'Sri Lakshmi Enterprises',
    displayName: 'Sri Lakshmi Enterprises',
    customerType: 'Proprietorship',
    pan: 'AALPS9012K',
    gstin: '33AALPS9012K1Z9',
    phone: '+91 94440 90123',
    email: 'finance@srilakshmi.example.com',
    address: '128 Netaji Road, George Town',
    state: 'Tamil Nadu',
    assignedManager: 'Rajesh Sharma',
    assignedStaff: 'Amit Kumar',
    status: 'Active',
    notes: 'Textile manufacturing & retail. Input Tax Credit verification priority.',
    createdAt: '2026-08-15T15:20:00Z',
    updatedAt: '2026-09-25T11:45:00Z',
  },
  {
    id: 'CUST-004',
    legalName: 'Global Tech Solutions Inc.',
    displayName: 'Global Tech Solutions',
    customerType: 'Corporate',
    pan: 'AAACG4321D',
    gstin: '29AAACG4321D1Z1',
    phone: '+91 98800 43210',
    email: 'ops@globaltechsol.example.com',
    address: 'Tech Park Block B, Outer Ring Road',
    state: 'Karnataka',
    assignedManager: 'Priya Patel',
    assignedStaff: 'Sneha Reddy',
    status: 'Active',
    notes: 'Software export services, LUT filing and 15CA/CB documentation.',
    createdAt: '2026-09-01T08:30:00Z',
    updatedAt: '2026-09-26T16:00:00Z',
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'DOC-001',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    filename: 'Sales_Register_Sept_2026.xlsx',
    filePath: 'customers/CUST-001/Documents/Sales_Register_Sept_2026.xlsx',
    category: 'Tax',
    docType: 'Spreadsheet',
    period: 'September 2026',
    fileType: 'XLSX',
    sizeBytes: 148520,
    checksum: 'sha256-a9b8c7d6e5f4...',
    status: 'Approved',
    uploader: 'Rajesh Sharma',
    createdAt: '2026-09-26T09:30:00Z',
    updatedAt: '2026-09-26T10:15:00Z',
  },
  {
    id: 'DOC-002',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    filename: 'Bank_Statement_HDFC_Sept2026.pdf',
    filePath: 'customers/CUST-001/Documents/Bank_Statement_HDFC_Sept2026.pdf',
    category: 'Banking',
    docType: 'Bank Statement',
    period: 'September 2026',
    fileType: 'PDF',
    sizeBytes: 285400,
    checksum: 'sha256-d4e5f6a1b2c3...',
    status: 'Processed',
    uploader: 'Amit Kumar',
    ocrConfidence: 98.4,
    createdAt: '2026-09-27T11:00:00Z',
    updatedAt: '2026-09-27T11:20:00Z',
  },
  {
    id: 'DOC-003',
    customerId: 'CUST-002',
    customerName: 'XYZ Traders',
    filename: 'Purchase_Bills_Batch_1.pdf',
    filePath: 'customers/CUST-002/Documents/Purchase_Bills_Batch_1.pdf',
    category: 'Invoices',
    docType: 'Invoice Bundle',
    period: 'September 2026',
    fileType: 'PDF',
    sizeBytes: 1420900,
    checksum: 'sha256-g7h8i9j0k1l2...',
    status: 'Under Review',
    uploader: 'Sneha Reddy',
    ocrConfidence: 95.2,
    createdAt: '2026-09-27T14:15:00Z',
    updatedAt: '2026-09-28T09:10:00Z',
  },
  {
    id: 'DOC-004',
    customerId: 'CUST-003',
    customerName: 'Sri Lakshmi Enterprises',
    filename: 'GST_Registration_Certificate_REG06.pdf',
    filePath: 'customers/CUST-003/Documents/GST_REG06.pdf',
    category: 'Identity',
    docType: 'Registration',
    period: 'Permanent',
    fileType: 'PDF',
    sizeBytes: 94200,
    checksum: 'sha256-j1k2l3m4n5o6...',
    status: 'Approved',
    uploader: 'Priya Patel',
    ocrConfidence: 99.8,
    createdAt: '2026-08-16T12:00:00Z',
    updatedAt: '2026-08-16T12:00:00Z',
  }
];

export const INITIAL_REQUIREMENTS: Requirement[] = [
  {
    id: 'REQ-001',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    title: 'Monthly GST Filing Checklist - Sept 2026',
    description: 'Invoices, Credit Notes, Debit Notes, and Bank Statement',
    category: 'Tax',
    period: 'September 2026',
    requestedDate: '2026-09-25',
    dueDate: '2026-10-04',
    status: 'Under Review',
    assignedUser: 'Amit Kumar',
    items: [
      { id: 'RI-1', requirementId: 'REQ-001', itemTitle: 'Sales Register with HSN Summary', isMandatory: true, status: 'Uploaded', documentId: 'DOC-001' },
      { id: 'RI-2', requirementId: 'REQ-001', itemTitle: 'Purchase Register with Tax Breakup', isMandatory: true, status: 'Approved' },
      { id: 'RI-3', requirementId: 'REQ-001', itemTitle: 'Bank Statements for HDFC Operating Account', isMandatory: true, status: 'Uploaded', documentId: 'DOC-002' },
      { id: 'RI-4', requirementId: 'REQ-001', itemTitle: 'Expense Vouchers above Rs 50,000', isMandatory: false, status: 'Pending' }
    ],
    createdAt: '2026-09-25T10:00:00Z',
    updatedAt: '2026-09-27T12:30:00Z',
  },
  {
    id: 'REQ-002',
    customerId: 'CUST-002',
    customerName: 'XYZ Traders',
    title: 'Import Invoices and Bill of Entry',
    description: 'Customs duty challans and import shipping bills',
    category: 'Financial',
    period: 'September 2026',
    requestedDate: '2026-09-26',
    dueDate: '2026-10-05',
    status: 'Uploaded',
    assignedUser: 'Sneha Reddy',
    items: [
      { id: 'RI-5', requirementId: 'REQ-002', itemTitle: 'Commercial Invoices Batch 1', isMandatory: true, status: 'Uploaded', documentId: 'DOC-003' },
      { id: 'RI-6', requirementId: 'REQ-002', itemTitle: 'ICEGATE Customs Challan Proofs', isMandatory: true, status: 'Pending' }
    ],
    createdAt: '2026-09-26T11:00:00Z',
    updatedAt: '2026-09-27T16:00:00Z',
  },
  {
    id: 'REQ-003',
    customerId: 'CUST-004',
    customerName: 'Global Tech Solutions',
    title: 'Foreign Inward Remittance Certificates (FIRC)',
    description: 'Bank advice for export proceeds realization under zero-rated supply',
    category: 'Banking',
    period: 'Q2 2026-27',
    requestedDate: '2026-09-20',
    dueDate: '2026-10-10',
    status: 'Requested',
    assignedUser: 'Sneha Reddy',
    items: [
      { id: 'RI-7', requirementId: 'REQ-003', itemTitle: 'CitiBank FIRC Advice Letters', isMandatory: true, status: 'Pending' }
    ],
    createdAt: '2026-09-20T09:00:00Z',
    updatedAt: '2026-09-20T09:00:00Z',
  }
];

export const INITIAL_TEMPLATES: RequirementTemplate[] = [
  {
    id: 'TMPL-001',
    title: 'Monthly GST Checklist',
    category: 'Tax',
    description: 'Standard end-of-month documentation required for GSTR-1 and GSTR-3B preparation',
    items: [
      { item: 'Sales Register with HSN Summary', mandatory: true },
      { item: 'Purchase Register with Tax Breakup', mandatory: true },
      { item: 'Bank Statements for all operating accounts', mandatory: true },
      { item: 'Expense Vouchers above Rs 50,000', mandatory: false },
      { item: 'Credit / Debit Notes issued during period', mandatory: true }
    ]
  },
  {
    id: 'TMPL-002',
    title: 'Statutory Audit Preparation Pack',
    category: 'Audit',
    description: 'Year-end documentation kit for corporate statutory audit',
    items: [
      { item: 'Signed Trial Balance & General Ledger', mandatory: true },
      { item: 'Fixed Asset Register & Physical Verification Certificate', mandatory: true },
      { item: 'Sundry Debtors & Creditors Balance Confirmations', mandatory: true },
      { item: 'Bank Balance Confirmation Certificates', mandatory: true },
      { item: 'Statutory Dues Payment Proofs (PF/ESI/GST/TDS)', mandatory: true }
    ]
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-001',
    title: 'Reconcile Bank Statement with GSTR-2B',
    description: 'Match purchase invoices against GSTR-2B portal download for September 2026',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    relatedRecordType: 'GST',
    relatedRecordId: 'GST-001',
    assignee: 'Amit Kumar',
    reviewer: 'Priya Patel',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-10-05',
    creator: 'Rajesh Sharma',
    comments: [
      { id: 'C-1', taskId: 'TSK-001', author: 'Amit Kumar', comment: 'Downloaded GSTR-2B JSON. Starting automated reconciliation.', createdAt: '2026-09-28T09:30:00Z' }
    ],
    createdAt: '2026-09-27T10:00:00Z',
    updatedAt: '2026-09-28T09:30:00Z'
  },
  {
    id: 'TSK-002',
    title: 'Finalize September Tally Sales Vouchers',
    description: 'Verify all 142 B2B e-invoices with IRN status in Tally',
    customerId: 'CUST-002',
    customerName: 'XYZ Traders',
    relatedRecordType: 'Tally',
    relatedRecordId: 'LED-003',
    assignee: 'Sneha Reddy',
    reviewer: 'Priya Patel',
    priority: 'High',
    status: 'Todo',
    dueDate: '2026-10-08',
    creator: 'Priya Patel',
    createdAt: '2026-09-27T11:00:00Z',
    updatedAt: '2026-09-27T11:00:00Z'
  },
  {
    id: 'TSK-003',
    title: 'Verify Form 16A TDS Certificates Q2',
    description: 'Review quarterly TDS deductions and prepare 26Q return',
    customerId: 'CUST-003',
    customerName: 'Sri Lakshmi Enterprises',
    relatedRecordType: 'Accounting',
    relatedRecordId: 'LED-004',
    assignee: 'Amit Kumar',
    reviewer: 'Rajesh Sharma',
    priority: 'Medium',
    status: 'Review',
    dueDate: '2026-10-15',
    creator: 'Rajesh Sharma',
    createdAt: '2026-09-26T14:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 'TSK-004',
    title: 'Prepare Fixed Asset Depreciation Schedule',
    description: 'Calculate Section 32 Income Tax vs Companies Act depreciation',
    customerId: 'CUST-004',
    customerName: 'Global Tech Solutions',
    relatedRecordType: 'Requirement',
    relatedRecordId: 'REQ-003',
    assignee: 'Sneha Reddy',
    reviewer: 'Priya Patel',
    priority: 'Low',
    status: 'Todo',
    dueDate: '2026-10-25',
    creator: 'Priya Patel',
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-09-28T09:00:00Z'
  }
];

export const INITIAL_DEADLINES: Deadline[] = [
  {
    id: 'DL-001',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    workType: 'GSTR-1 Monthly Return',
    period: 'September 2026',
    dueDate: '2026-10-11',
    assignedUser: 'Amit Kumar',
    status: 'Upcoming',
    priority: 'High',
    relatedTaskId: 'TSK-001',
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'DL-002',
    customerId: 'CUST-002',
    customerName: 'XYZ Traders',
    workType: 'GSTR-1 Monthly Return',
    period: 'September 2026',
    dueDate: '2026-10-11',
    assignedUser: 'Sneha Reddy',
    status: 'Upcoming',
    priority: 'High',
    relatedTaskId: 'TSK-002',
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'DL-003',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    workType: 'GSTR-3B Monthly Return',
    period: 'September 2026',
    dueDate: '2026-10-20',
    assignedUser: 'Amit Kumar',
    status: 'Upcoming',
    priority: 'High',
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'DL-004',
    customerId: 'CUST-003',
    customerName: 'Sri Lakshmi Enterprises',
    workType: 'TDS Payment Deposit (Challan 281)',
    period: 'September 2026',
    dueDate: '2026-10-07',
    assignedUser: 'Amit Kumar',
    status: 'Due',
    priority: 'High',
    createdAt: '2026-09-01T00:00:00Z'
  }
];

export const INITIAL_GST_RECORDS: GSTRecord[] = [
  {
    id: 'GST-001',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    period: 'September 2026',
    financialYear: '2026-27',
    filingType: 'GSTR-1',
    taxableAmount: 4500000.00,
    cgst: 405000.00,
    sgst: 405000.00,
    igst: 0.00,
    itcClaimed: 0.00,
    filingStatus: 'Pending',
    dueDate: '2026-10-11',
    filingMode: 'Imported / Local Data',
    lastSyncedAt: '2026-09-28T08:00:00Z'
  },
  {
    id: 'GST-002',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    period: 'September 2026',
    financialYear: '2026-27',
    filingType: 'GSTR-3B',
    taxableAmount: 4500000.00,
    cgst: 405000.00,
    sgst: 405000.00,
    igst: 0.00,
    itcClaimed: 312000.00,
    filingStatus: 'Pending',
    dueDate: '2026-10-20',
    filingMode: 'Imported / Local Data',
    lastSyncedAt: '2026-09-28T08:00:00Z'
  },
  {
    id: 'GST-003',
    customerId: 'CUST-002',
    customerName: 'XYZ Traders',
    period: 'September 2026',
    financialYear: '2026-27',
    filingType: 'GSTR-1',
    taxableAmount: 8200000.00,
    cgst: 369000.00,
    sgst: 369000.00,
    igst: 380000.00,
    itcClaimed: 0.00,
    filingStatus: 'Under Review',
    dueDate: '2026-10-11',
    filingMode: 'Imported / Local Data',
    lastSyncedAt: '2026-09-27T17:40:00Z'
  },
  {
    id: 'GST-004',
    customerId: 'CUST-003',
    customerName: 'Sri Lakshmi Enterprises',
    period: 'August 2026',
    financialYear: '2026-27',
    filingType: 'GSTR-3B',
    taxableAmount: 2150000.00,
    cgst: 107500.00,
    sgst: 107500.00,
    igst: 0.00,
    itcClaimed: 142000.00,
    filingStatus: 'Filed (Recorded Locally)',
    dueDate: '2026-09-20',
    filingMode: 'Imported / Local Data',
    lastSyncedAt: '2026-09-20T16:10:00Z'
  }
];

export const INITIAL_LEDGERS: AccountingLedger[] = [
  {
    id: 'LED-001',
    customerId: 'CUST-001',
    companyName: 'ABC Technologies Pvt Ltd',
    ledgerName: 'HDFC Bank Current A/c 50200012',
    ledgerGroup: 'Bank Accounts',
    openingBalance: 1250000.00,
    closingBalance: 2480000.00,
    source: 'Tally XML File Import',
    updatedAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 'LED-002',
    customerId: 'CUST-001',
    companyName: 'ABC Technologies Pvt Ltd',
    ledgerName: 'Infosys BPM Limited (Debtor)',
    ledgerGroup: 'Sundry Debtors',
    openingBalance: 680000.00,
    closingBalance: 1150000.00,
    source: 'Tally XML File Import',
    updatedAt: '2026-09-28T10:00:00Z'
  },
  {
    id: 'LED-003',
    customerId: 'CUST-002',
    companyName: 'XYZ Global Traders',
    ledgerName: 'State Bank of India CC A/c',
    ledgerGroup: 'Secured Loans',
    openingBalance: -4500000.00,
    closingBalance: -3850000.00,
    source: 'Tally XML File Import',
    updatedAt: '2026-09-27T18:00:00Z'
  },
  {
    id: 'LED-004',
    customerId: 'CUST-003',
    companyName: 'Sri Lakshmi Enterprises',
    ledgerName: 'Cotton Suppliers Syndicate',
    ledgerGroup: 'Sundry Creditors',
    openingBalance: 0.00,
    closingBalance: -820000.00,
    source: 'Tally XML File Import',
    updatedAt: '2026-09-26T15:30:00Z'
  }
];

export const INITIAL_VOUCHERS: AccountingVoucher[] = [
  {
    id: 'VOU-001',
    customerId: 'CUST-001',
    voucherNumber: 'INV/2026/089',
    voucherType: 'Sales',
    date: '2026-09-15',
    partyLedger: 'Infosys BPM Limited (Debtor)',
    amount: 550000.00,
    narration: 'Monthly enterprise application maintenance retainer fee',
    source: 'Tally XML File Import'
  },
  {
    id: 'VOU-002',
    customerId: 'CUST-001',
    voucherNumber: 'REC/2026/044',
    voucherType: 'Receipt',
    date: '2026-09-20',
    partyLedger: 'Infosys BPM Limited (Debtor)',
    amount: 550000.00,
    narration: 'NEFT credit from Infosys BPM Ref #INF98765432',
    source: 'Tally XML File Import'
  },
  {
    id: 'VOU-003',
    customerId: 'CUST-002',
    voucherNumber: 'PUR/2026/301',
    voucherType: 'Purchase',
    date: '2026-09-18',
    partyLedger: 'Marico Consumer Goods Dist',
    amount: 1450000.00,
    narration: 'Bulk supply order shipment delivery #8872',
    source: 'Tally XML File Import'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'EVT-001',
    title: 'GSTR-1 Monthly Return Deadline',
    description: 'Statutory deadline for filing GSTR-1 for monthly filers',
    eventType: 'GST',
    startTime: '2026-10-11T10:00:00Z',
    endTime: '2026-10-11T18:00:00Z',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    assignedUser: 'Amit Kumar',
    reminderMinutes: 1440
  },
  {
    id: 'EVT-002',
    title: 'Tally Reconciliation Review with Director',
    description: 'Quarterly review of debtors ledger and pending credit notes',
    eventType: 'Meeting',
    startTime: '2026-10-06T15:00:00Z',
    endTime: '2026-10-06T16:00:00Z',
    customerId: 'CUST-002',
    customerName: 'XYZ Traders',
    assignedUser: 'Priya Patel',
    reminderMinutes: 60
  },
  {
    id: 'EVT-003',
    title: 'TDS Challan Payment Due',
    description: 'Deposit TDS deducted in September 2026',
    eventType: 'Deadline',
    startTime: '2026-10-07T09:00:00Z',
    endTime: '2026-10-07T17:00:00Z',
    customerId: 'CUST-003',
    customerName: 'Sri Lakshmi Enterprises',
    assignedUser: 'Amit Kumar',
    reminderMinutes: 720
  }
];

export const INITIAL_COMMUNICATIONS: Communication[] = [
  {
    id: 'COMM-001',
    customerId: 'CUST-001',
    type: 'Call',
    subject: 'Quarterly Audit Requirements Discussion',
    content: 'Spoke with CFO Mr. Ramanathan regarding pending bank confirmations for HDFC account. Requested signed copies by Friday.',
    author: 'Priya Patel',
    timestamp: '2026-09-27T15:30:00Z'
  },
  {
    id: 'COMM-002',
    customerId: 'CUST-001',
    type: 'Note',
    subject: 'GSTR-2B Input Tax Credit Mismatch',
    content: 'Noticed 2 vendor invoices from Dell India not reflecting in GSTR-2B. Reached out to vendor accounts team to upload before 11th.',
    author: 'Amit Kumar',
    timestamp: '2026-09-28T09:15:00Z'
  },
  {
    id: 'COMM-003',
    customerId: 'CUST-002',
    type: 'Email',
    subject: 'Tally XML Backup Received',
    content: 'Received September Tally DayBook XML export. Running automated ledger verification and mapping to Central Workflow.',
    author: 'Sneha Reddy',
    timestamp: '2026-09-27T17:00:00Z'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'ACT-001',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    userName: 'Amit Kumar',
    action: 'UPLOAD',
    objectType: 'Document',
    objectId: 'DOC-002',
    description: 'Uploaded Bank Statement HDFC Sept 2026 (PDF, 285 KB)',
    timestamp: '2026-09-27T11:00:00Z'
  },
  {
    id: 'ACT-002',
    customerId: 'CUST-001',
    customerName: 'ABC Private Limited',
    userName: 'Amit Kumar',
    action: 'OCR_RUN',
    objectType: 'Document',
    objectId: 'DOC-002',
    description: 'Completed local OCR extraction with 98.4% confidence score',
    timestamp: '2026-09-27T11:20:00Z'
  },
  {
    id: 'ACT-003',
    customerId: 'CUST-002',
    customerName: 'XYZ Traders',
    userName: 'Sneha Reddy',
    action: 'TASK_STATUS',
    objectType: 'Task',
    objectId: 'TSK-002',
    description: 'Updated task "Finalize September Tally Sales Vouchers" priority to High',
    timestamp: '2026-09-27T11:00:00Z'
  },
  {
    id: 'ACT-004',
    customerId: 'CUST-003',
    customerName: 'Sri Lakshmi Enterprises',
    userName: 'Rajesh Sharma',
    action: 'GST_IMPORT',
    objectType: 'GST',
    objectId: 'GST-004',
    description: 'Imported August GSTR-3B return summary into local registry',
    timestamp: '2026-09-20T16:10:00Z'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-001',
    title: 'TDS Challan Due Soon',
    message: 'Sri Lakshmi Enterprises TDS deposit deadline is 7th October',
    type: 'deadline',
    isRead: false,
    createdAt: '2026-09-28T09:00:00Z'
  },
  {
    id: 'NOTIF-002',
    title: 'Pending Bank Statement OCR',
    message: 'OCR extracted 9 fields from ABC Technologies Bank Statement. Review required.',
    type: 'document',
    isRead: false,
    createdAt: '2026-09-28T08:30:00Z'
  },
  {
    id: 'NOTIF-003',
    title: 'GSTR-1 Window Approaching',
    message: '3 customers have GSTR-1 returns due on 11th October',
    type: 'gst',
    isRead: true,
    createdAt: '2026-09-27T16:00:00Z'
  }
];

export const INITIAL_BACKUPS: BackupRecord[] = [
  {
    id: 'BKP-001',
    filename: 'central_workflow_backup_20260927_2300.zip',
    filePath: 'backups/central_workflow_backup_20260927_2300.zip',
    sizeBytes: 12450800,
    status: 'Completed',
    verified: true,
    createdAt: '2026-09-27T23:00:00Z'
  },
  {
    id: 'BKP-002',
    filename: 'pre_migration_safety_backup.zip',
    filePath: 'backups/pre_migration_safety_backup.zip',
    sizeBytes: 11980000,
    status: 'Safety Backup',
    verified: true,
    createdAt: '2026-09-20T18:00:00Z'
  }
];
