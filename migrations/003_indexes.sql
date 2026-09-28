-- Migration 003: Indexes for High Performance Queries (Section 20 & 33)

CREATE INDEX IF NOT EXISTS idx_customers_search ON customers (display_name, legal_name, pan, gstin);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
CREATE INDEX IF NOT EXISTS idx_customers_manager ON customers (assigned_manager);

CREATE INDEX IF NOT EXISTS idx_documents_customer ON documents (customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents (category);

CREATE INDEX IF NOT EXISTS idx_tasks_customer ON tasks (customer_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks (assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks (due_date);

CREATE INDEX IF NOT EXISTS idx_deadlines_customer ON deadlines (customer_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due ON deadlines (due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines (status);

CREATE INDEX IF NOT EXISTS idx_requirements_customer ON requirements (customer_id);
CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements (status);

CREATE INDEX IF NOT EXISTS idx_gst_customer ON gst_records (customer_id, period);
CREATE INDEX IF NOT EXISTS idx_activities_customer ON activities (customer_id, timestamp);
