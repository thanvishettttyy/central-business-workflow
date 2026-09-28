"""
Database initialization script for Central Business Workflow.
Executes migrations 001, 002, 003 to create database/app.db.
"""
import sqlite3
import os

def init_db():
    db_dir = os.path.join(os.path.dirname(__file__), "..", "database")
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, "app.db")

    print(f"Connecting to SQLite database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    migrations_dir = os.path.join(os.path.dirname(__file__), "..", "migrations")
    migration_files = sorted([f for f in os.listdir(migrations_dir) if f.endswith(".sql")])

    for m in migration_files:
        print(f"Applying migration: {m}...")
        with open(os.path.join(migrations_dir, m), "r", encoding="utf-8") as f:
            sql_script = f.read()
            cursor.executescript(sql_script)

    conn.commit()
    
    # Verify count
    cursor.execute("SELECT count(*) FROM customers")
    cust_count = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM tasks")
    task_count = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM documents")
    doc_count = cursor.fetchone()[0]

    print(f"Migration completed successfully! DB populated with:")
    print(f" - {cust_count} Customers")
    print(f" - {task_count} Tasks")
    print(f" - {doc_count} Documents")

    conn.close()

if __name__ == "__main__":
    init_db()
