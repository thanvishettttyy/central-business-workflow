-- Migration 002: Realistic Seed Demo Data (Section 35)

-- Users
INSERT OR IGNORE INTO users (id, name, email, role) VALUES 
('USR-001', 'Rajesh Sharma', 'rajesh@centralworkflow.local', 'Super Admin'),
('USR-002', 'Priya Patel', 'priya@centralworkflow.local', 'Manager'),
('USR-003', 'Amit Kumar', 'amit@centralworkflow.local', 'Staff'),
('USR-004', 'Sneha Reddy', 'sneha@centralworkflow.local', 'Reviewer');

-- Customers
INSERT OR IGNORE INTO customers (id, legal_name, display_name, customer_type, pan, gstin, phone, email, address, state, assigned_manager, assigned_staff, status, notes) VALUES
('CUST-001', 'ABC Technologies Private Limited', 'ABC Private Limited', 'Corporate', 'AAACA1234F', '29AAACA1234F1Z5', '+91 98450 12345', 'accounts@abctech.example.com', 'Plot 42, Electronics City Phase 1', 'Karnataka', 'Priya Patel', 'Amit Kumar', 'Active', 'Tier-1 IT Services Client. Monthly GST and Quarterly Audits.'),
('CUST-002', 'XYZ Global Traders LLP', 'XYZ Traders', 'Partnership', 'AABFX5678G', '27AABFX5678G1ZP', '+91 98200 56789', 'tax@xyztraders.example.com', 'Shop 14, APMC Market, Vashi', 'Maharashtra', 'Priya Patel', 'Sneha Reddy', 'Active', 'Wholesale FMCG Distribution. High voucher volume.'),
('CUST-003', 'Sri Lakshmi Enterprises', 'Sri Lakshmi Enterprises', 'Proprietorship', 'AALPS9012K', '33AALPS9012K1Z9', '+91 94440 90123', 'finance@srilakshmi.example.com', '128 Netaji Road, George Town', 'Tamil Nadu', 'Rajesh Sharma', 'Amit Kumar', 'Active', 'Textile manufacturing & retail. Input Tax Credit verification priority.'),
('CUST-004', 'Global Tech Solutions Inc.', 'Global Tech Solutions', 'Corporate', 'AAACG4321D', '29AAACG4321D1Z1', '+91 98800 43210', 'ops@globaltechsol.example.com', 'Tech Park Block B, Outer Ring Road', 'Karnataka', 'Priya Patel', 'Sneha Reddy', 'Active', 'Software export services, LUT filing and 15CA/CB documentation.');

-- GST Records
INSERT OR IGNORE INTO gst_records (id, customer_id, period, financial_year, filing_type, taxable_amount, cgst, sgst, igst, itc_claimed, filing_status, due_date, filing_mode) VALUES
('GST-001', 'CUST-001', 'September 2026', '2026-27', 'GSTR-1', 4500000.00, 405000.00, 405000.00, 0.00, 0.00, 'Pending', '2026-10-11', 'Imported / Local Data'),
('GST-002', 'CUST-001', 'September 2026', '2026-27', 'GSTR-3B', 4500000.00, 405000.00, 405000.00, 0.00, 312000.00, 'Pending', '2026-10-20', 'Imported / Local Data'),
('GST-003', 'CUST-002', 'September 2026', '2026-27', 'GSTR-1', 8200000.00, 369000.00, 369000.00, 380000.00, 0.00, 'Under Review', '2026-10-11', 'Imported / Local Data'),
('GST-004', 'CUST-003', 'August 2026', '2026-27', 'GSTR-3B', 2150000.00, 107500.00, 107500.00, 0.00, 142000.00, 'Filed (Recorded Locally)', '2026-09-20', 'Imported / Local Data');

-- Accounting Ledgers
INSERT OR IGNORE INTO accounting_ledgers (id, customer_id, company_name, ledger_name, ledger_group, opening_balance, closing_balance, source) VALUES
('LED-001', 'CUST-001', 'ABC Technologies Pvt Ltd', 'HDFC Bank Operating A/c', 'Bank Accounts', 1250000.00, 2480000.00, 'Tally XML File Import'),
('LED-002', 'CUST-001', 'ABC Technologies Pvt Ltd', 'Infosys BPM Limited (Debtor)', 'Sundry Debtors', 680000.00, 1150000.00, 'Tally XML File Import'),
('LED-003', 'CUST-002', 'XYZ Global Traders', 'State Bank of India CC A/c', 'Secured Loans', -4500000.00, -3850000.00, 'Tally XML File Import'),
('LED-004', 'CUST-003', 'Sri Lakshmi Enterprises', 'Cotton Suppliers Syndicate', 'Sundry Creditors', 0.00, -820000.00, 'Tally XML File Import');

-- Tasks
INSERT OR IGNORE INTO tasks (id, title, description, customer_id, related_record_type, assignee, reviewer, priority, status, due_date, creator) VALUES
('TSK-001', 'Reconcile Bank Statement with GSTR-2B', 'Match purchase invoices against GSTR-2B portal download for September 2026', 'CUST-001', 'GST', 'Amit Kumar', 'Priya Patel', 'High', 'In Progress', '2026-10-05', 'Rajesh Sharma'),
('TSK-002', 'Finalize September Tally Sales Vouchers', 'Verify all 142 B2B e-invoices with IRN status in Tally', 'CUST-002', 'Tally', 'Sneha Reddy', 'Priya Patel', 'High', 'Todo', '2026-10-08', 'Priya Patel'),
('TSK-003', 'Verify Form 16A TDS Certificates Q2', 'Review quarterly TDS deductions and prepare 26Q return', 'CUST-003', 'Accounting', 'Amit Kumar', 'Rajesh Sharma', 'Medium', 'Review', '2026-10-15', 'Rajesh Sharma'),
('TSK-004', 'Prepare Fixed Asset Depreciation Schedule', 'Calculate Section 32 Income Tax vs Companies Act depreciation', 'CUST-004', 'Requirement', 'Sneha Reddy', 'Priya Patel', 'Low', 'Todo', '2026-10-25', 'Priya Patel');

-- Deadlines
INSERT OR IGNORE INTO deadlines (id, customer_id, work_type, period, due_date, assigned_user, status, priority) VALUES
('DL-001', 'CUST-001', 'GSTR-1 Monthly Return', 'September 2026', '2026-10-11', 'Amit Kumar', 'Upcoming', 'High'),
('DL-002', 'CUST-002', 'GSTR-1 Monthly Return', 'September 2026', '2026-10-11', 'Sneha Reddy', 'Upcoming', 'High'),
('DL-003', 'CUST-001', 'GSTR-3B Monthly Return', 'September 2026', '2026-10-20', 'Amit Kumar', 'Upcoming', 'High'),
('DL-004', 'CUST-003', 'TDS Payment Deposit (Challan 281)', 'September 2026', '2026-10-07', 'Amit Kumar', 'Due', 'High');

-- Requirements
INSERT OR IGNORE INTO requirements (id, customer_id, title, description, category, period, requested_date, due_date, status, assigned_user) VALUES
('REQ-001', 'CUST-001', 'Monthly GST Filing Checklist - Sept 2026', 'Invoices, Credit Notes, Debit Notes, and Bank Statement', 'Tax', 'September 2026', '2026-09-25', '2026-10-04', 'Under Review', 'Amit Kumar'),
('REQ-002', 'CUST-002', 'Import Invoices and Bill of Entry', 'Customs duty challans and import shipping bills', 'Financial', 'September 2026', '2026-09-26', '2026-10-05', 'Uploaded', 'Sneha Reddy'),
('REQ-003', 'CUST-004', 'Foreign Inward Remittance Certificates (FIRC)', 'Bank advice for export proceeds realization', 'Banking', 'Q2 2026-27', '2026-09-20', '2026-10-10', 'Requested', 'Sneha Reddy');

-- Requirement Templates
INSERT OR IGNORE INTO requirement_templates (id, title, category, description, items_json) VALUES
('TMPL-001', 'Monthly GST Checklist', 'Tax', 'Standard end-of-month documentation required for GSTR-1 and GSTR-3B preparation', 
'[{"item": "Sales Register with HSN Summary", "mandatory": true}, {"item": "Purchase Register with Tax Breakup", "mandatory": true}, {"item": "Bank Statements for all operating accounts", "mandatory": true}, {"item": "Expense Vouchers above Rs 50,000", "mandatory": false}, {"item": "Credit / Debit Notes issued during period", "mandatory": true}]'),
('TMPL-002', 'Statutory Audit Preparation Pack', 'Audit', 'Year-end documentation kit for corporate statutory audit',
'[{"item": "Signed Trial Balance & General Ledger", "mandatory": true}, {"item": "Fixed Asset Register & Physical Verification Certificate", "mandatory": true}, {"item": "Sundry Debtors & Creditors Balance Confirmations", "mandatory": true}, {"item": "Bank Balance Confirmation Certificates", "mandatory": true}, {"item": "Statutory Dues Payment Proofs (PF/ESI/GST/TDS)", "mandatory": true}]');

-- Documents
INSERT OR IGNORE INTO documents (id, customer_id, filename, file_path, category, doc_type, period, file_type, size_bytes, checksum, status, uploader, ocr_confidence) VALUES
('DOC-001', 'CUST-001', 'Sales_Register_Sept_2026.xlsx', 'customers/CUST-001/Documents/Sales_Register_Sept_2026.xlsx', 'Tax', 'Spreadsheet', 'September 2026', 'XLSX', 148520, 'sha256-a9b8c7...', 'Approved', 'Rajesh Sharma', NULL),
('DOC-002', 'CUST-001', 'Bank_Statement_HDFC_Sept2026.pdf', 'customers/CUST-001/Documents/Bank_Statement_HDFC_Sept2026.pdf', 'Banking', 'Bank Statement', 'September 2026', 'PDF', 285400, 'sha256-d4e5f6...', 'Processed', 'Amit Kumar', 98.4),
('DOC-003', 'CUST-002', 'Purchase_Bills_Batch_1.pdf', 'customers/CUST-002/Documents/Purchase_Bills_Batch_1.pdf', 'Invoices', 'Invoice Bundle', 'September 2026', 'PDF', 1420900, 'sha256-g7h8i9...', 'Under Review', 'Sneha Reddy', 95.2),
('DOC-004', 'CUST-003', 'GST_Registration_Certificate_REG06.pdf', 'customers/CUST-003/Documents/GST_REG06.pdf', 'Identity', 'Registration', 'Permanent', 'PDF', 94200, 'sha256-j1k2l3...', 'Approved', 'Priya Patel', 99.8);

-- Activities
INSERT OR IGNORE INTO activities (id, customer_id, user_name, action, object_type, object_id, description) VALUES
('ACT-001', 'CUST-001', 'Amit Kumar', 'UPLOAD', 'Document', 'DOC-002', 'Uploaded Bank Statement HDFC Sept 2026 (PDF, 285 KB)'),
('ACT-002', 'CUST-001', 'Amit Kumar', 'OCR_RUN', 'Document', 'DOC-002', 'Completed OCR extraction with 98.4% confidence score'),
('ACT-003', 'CUST-002', 'Sneha Reddy', 'TASK_STATUS', 'Task', 'TSK-002', 'Assigned September Sales Vouchers review task'),
('ACT-004', 'CUST-003', 'Rajesh Sharma', 'GST_IMPORT', 'GST', 'GST-004', 'Imported August GSTR-3B return summary into local registry');

-- Notifications
INSERT OR IGNORE INTO notifications (id, title, message, type) VALUES
('NOTIF-001', 'TDS Challan Due Soon', 'Sri Lakshmi Enterprises TDS deposit deadline is 7th October', 'deadline'),
('NOTIF-002', 'Pending Bank Statement OCR', 'OCR extracted 9 fields from ABC Technologies Bank Statement. Review required.', 'document'),
('NOTIF-003', 'GSTR-1 Window Approaching', '3 customers have GSTR-1 returns due on 11th October', 'gst');
