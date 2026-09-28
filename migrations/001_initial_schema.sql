-- Migration 001: Initial Core Schema for Central Business Workflow

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Staff',
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    permissions TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    legal_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    customer_type TEXT NOT NULL,
    pan TEXT,
    gstin TEXT,
    registration_identifiers TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    state TEXT,
    assigned_manager TEXT,
    assigned_staff TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_contacts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    name TEXT NOT NULL,
    designation TEXT,
    phone TEXT,
    email TEXT,
    is_primary INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    category TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    period TEXT,
    file_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    checksum TEXT,
    status TEXT NOT NULL DEFAULT 'Uploaded',
    uploader TEXT,
    ocr_confidence REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_versions (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    checksum TEXT,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requirements (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    period TEXT,
    requested_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Requested',
    assigned_user TEXT,
    creator TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requirement_items (
    id TEXT PRIMARY KEY,
    requirement_id TEXT NOT NULL,
    item_title TEXT NOT NULL,
    is_mandatory INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Pending',
    document_id TEXT,
    FOREIGN KEY (requirement_id) REFERENCES requirements(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS requirement_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    items_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    customer_id TEXT,
    related_record_type TEXT,
    related_record_id TEXT,
    assignee TEXT,
    reviewer TEXT,
    priority TEXT NOT NULL DEFAULT 'Medium',
    status TEXT NOT NULL DEFAULT 'Todo',
    due_date DATE NOT NULL,
    creator TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS task_comments (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    author TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deadlines (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    work_type TEXT NOT NULL,
    period TEXT NOT NULL,
    due_date DATE NOT NULL,
    assigned_user TEXT,
    status TEXT NOT NULL DEFAULT 'Due',
    priority TEXT NOT NULL DEFAULT 'High',
    related_requirement_id TEXT,
    related_task_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS gst_records (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    period TEXT NOT NULL,
    financial_year TEXT NOT NULL,
    filing_type TEXT NOT NULL, -- GSTR-1, GSTR-3B, GSTR-9
    taxable_amount REAL DEFAULT 0,
    cgst REAL DEFAULT 0,
    sgst REAL DEFAULT 0,
    igst REAL DEFAULT 0,
    itc_claimed REAL DEFAULT 0,
    filing_status TEXT NOT NULL DEFAULT 'Pending',
    due_date DATE NOT NULL,
    filing_mode TEXT NOT NULL DEFAULT 'Imported / Local Data',
    last_synced_at DATETIME,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accounting_ledgers (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    company_name TEXT NOT NULL,
    ledger_name TEXT NOT NULL,
    ledger_group TEXT NOT NULL,
    opening_balance REAL DEFAULT 0,
    closing_balance REAL DEFAULT 0,
    source TEXT DEFAULT 'Tally XML File Import',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounting_vouchers (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    voucher_number TEXT NOT NULL,
    voucher_type TEXT NOT NULL,
    date DATE NOT NULL,
    party_ledger TEXT NOT NULL,
    amount REAL NOT NULL,
    narration TEXT,
    source TEXT DEFAULT 'Tally XML File Import',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL, -- Meeting, Deadline, Task, Follow-up
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    customer_id TEXT,
    assigned_user TEXT,
    reminder_minutes INTEGER DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS communications (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    type TEXT NOT NULL, -- Note, Call, Email, Meeting
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    object_type TEXT NOT NULL,
    object_id TEXT,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- task, gst, deadline, document, system
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS backup_records (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    status TEXT NOT NULL,
    verified INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
