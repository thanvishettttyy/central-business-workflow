import React, { useState, useEffect } from 'react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { QuickActionModal } from './components/layout/QuickActionModal';
import { LandingPage } from './components/website/LandingPage';
import LoginPage from './features/auth/LoginPage';

// Features
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { CustomerProfile } from './features/customers/CustomerProfile';
import { DocumentsPage } from './features/documents/DocumentsPage';
import { RequirementsPage } from './features/requirements/RequirementsPage';
import { TasksPage } from './features/tasks/TasksPage';
import { CalendarPage } from './features/calendar/CalendarPage';
import { DeadlinesPage } from './features/deadlines/DeadlinesPage';
import { GSTPage } from './features/gst/GSTPage';
import { AccountingPage } from './features/accounting/AccountingPage';
import { PDFToolsPage } from './features/pdf/PDFToolsPage';
import { OCRPage } from './features/ocr/OCRPage';
import { PDFToExcelPage } from './features/pdf-to-excel/PDFToExcelPage';
import { ExcelPage } from './features/excel/ExcelPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { CommunicationsPage } from './features/communications/CommunicationsPage';
import { TeamPage } from './features/team/TeamPage';
import { BackupPage } from './features/backup/BackupPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { IntegrationsPage } from './features/integrations/IntegrationsPage';
import { InvoicesPage } from './features/invoices/InvoicesPage';

// Types & DB
import { 
  Customer, DocumentRecord, Requirement, Task, 
  Deadline, GSTRecord, AccountingLedger, AccountingVoucher, 
  Activity, AppNotification, User 
} from './types';
import { db } from './services/db';
import { generateNotifications } from './services/notificationEngine';

export function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // App Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Live Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [gstRecords, setGstRecords] = useState<GSTRecord[]>([]);
  const [ledgers, setLedgers] = useState<AccountingLedger[]>([]);
  const [vouchers, setVouchers] = useState<AccountingVoucher[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(db.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(db.getUsers());

  const reloadData = () => {
    const freshTasks     = db.getTasks(selectedCustomerId);
    const freshDeadlines = db.getDeadlines(selectedCustomerId);
    const freshGST       = db.getGSTRecords(selectedCustomerId);
    const freshDocs      = db.getDocuments(selectedCustomerId);

    setCustomers(db.getCustomers());
    setDocuments(freshDocs);
    setRequirements(db.getRequirements(selectedCustomerId));
    setTasks(freshTasks);
    setDeadlines(freshDeadlines);
    setGstRecords(freshGST);
    setLedgers(db.getLedgers(selectedCustomerId));
    setVouchers(db.getVouchers(selectedCustomerId));
    setActivities(db.getActivities(selectedCustomerId));
    setCurrentUser(db.getCurrentUser());
    setAllUsers(db.getUsers());

    // Auto-generate real notifications from live data
    setNotifications(generateNotifications({
      tasks: freshTasks,
      deadlines: freshDeadlines,
      gstRecords: freshGST,
      documents: freshDocs,
    }));
  };

  useEffect(() => {
    reloadData();
  }, [selectedCustomerId]);

  // Global Keyboard Shortcuts (Ctrl+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data back to clean factory state?')) {
      db.resetDemoData();
      reloadData();
      setViewingCustomer(null);
      setSelectedCustomerId(undefined);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setViewingCustomer(customer);
    setSelectedCustomerId(customer.id);
  };

  const handleClearCustomerSelection = (cId?: string) => {
    setSelectedCustomerId(cId);
    if (!cId) {
      setViewingCustomer(null);
    } else {
      const found = customers.find(c => c.id === cId);
      if (found) setViewingCustomer(found);
    }
  };

  const handleSearchResultClick = (item: any) => {
    if (item.customerId) {
      const c = db.getCustomerById(item.customerId);
      if (c) {
        setViewingCustomer(c);
        setSelectedCustomerId(c.id);
        setCurrentTab('customers');
        return;
      }
    }

    if (item.type === 'Document') setCurrentTab('documents');
    else if (item.type === 'Requirement') setCurrentTab('requirements');
    else if (item.type === 'Task') setCurrentTab('tasks');
    else if (item.type === 'GST') setCurrentTab('gst');
    else if (item.type === 'Accounting') setCurrentTab('accounting');
  };


  // Auth gate — show login screen until user authenticates
  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // If website mode selected, render showcase landing page with button to return to app
  if (currentTab === 'website') {
    return <LandingPage onLaunchApp={() => setCurrentTab('dashboard')} />;
  }

  const openTasksCount = tasks.filter(t => t.status !== 'Completed').length;
  const dueDeadlinesCount = deadlines.filter(d => d.status === 'Due' || d.status === 'Overdue').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'customers') {
            setViewingCustomer(null);
          }
        }}
        openTasksCount={openTasksCount}
        dueDeadlinesCount={dueDeadlinesCount}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          customers={customers}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleClearCustomerSelection}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onResetDemo={handleResetDemo}
          onLogout={() => setIsLoggedIn(false)}
          currentUser={currentUser}
          onSwitchUser={(u) => {
            db.setCurrentUser(u);
            setCurrentUser(u);
          }}
          allUsers={allUsers}
          notifications={notifications}
          onMarkNotificationRead={(id) => {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
          }}
          onMarkAllNotificationsRead={() => {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          }}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* 1. Dashboard */}
          {currentTab === 'dashboard' && (
            <DashboardPage
              customers={customers}
              tasks={tasks}
              documents={documents}
              requirements={requirements}
              deadlines={deadlines}
              gstRecords={gstRecords}
              activities={activities}
              ledgers={ledgers}
              selectedCustomerId={selectedCustomerId}
              onNavigate={(tab, cId) => {
                if (cId) {
                  const cust = customers.find(c => c.id === cId);
                  if (cust) handleSelectCustomer(cust);
                }
                setCurrentTab(tab);
              }}
            />
          )}

          {/* 2. Customers & 360 Profile */}
          {currentTab === 'customers' && (
            viewingCustomer ? (
              <CustomerProfile
                customer={viewingCustomer}
                onBack={() => setViewingCustomer(null)}
                onEdit={() => setIsQuickActionOpen(true)}
                onArchive={(id) => {
                  db.archiveCustomer(id);
                  reloadData();
                  setViewingCustomer(null);
                }}
                onActionClick={(tab) => {
                  if (tab === 'documents') setCurrentTab('documents');
                  else if (tab === 'tasks') setCurrentTab('tasks');
                  else if (tab === 'requirements') setCurrentTab('requirements');
                }}
              />
            ) : (
              <CustomersPage
                customers={customers}
                onSelectCustomer={handleSelectCustomer}
                onOpenCreateModal={() => setIsQuickActionOpen(true)}
              />
            )
          )}

          {/* 3. Invoices & Billing */}
          {currentTab === 'invoices' && (
            <InvoicesPage
              customers={customers}
              selectedCustomerId={selectedCustomerId}
            />
          )}

          {/* 4. Accounting */}
          {currentTab === 'accounting' && (
            <AccountingPage
              ledgers={ledgers}
              vouchers={vouchers}
              customers={customers}
              onRefresh={reloadData}
            />
          )}

          {/* 4. GST */}
          {currentTab === 'gst' && (
            <GSTPage
              gstRecords={gstRecords}
              customers={customers}
              onRefresh={reloadData}
            />
          )}

          {/* 5. Documents */}
          {currentTab === 'documents' && (
            <DocumentsPage
              documents={documents}
              customers={customers}
              onOpenUploadModal={() => setIsQuickActionOpen(true)}
              onNavigateToOCR={(doc) => setCurrentTab('ocr')}
              onNavigateToPDFTools={() => setCurrentTab('pdf-tools')}
            />
          )}

          {/* 6. Requirements */}
          {currentTab === 'requirements' && (
            <RequirementsPage
              requirements={requirements}
              customers={customers}
              templates={db.getTemplates()}
              onRefresh={reloadData}
            />
          )}

          {/* 7. Tasks */}
          {currentTab === 'tasks' && (
            <TasksPage
              tasks={tasks}
              customers={customers}
              onOpenCreateModal={() => setIsQuickActionOpen(true)}
              onRefresh={reloadData}
            />
          )}

          {/* 8. Calendar */}
          {currentTab === 'calendar' && (
            <CalendarPage
              events={db.getCalendarEvents(selectedCustomerId)}
              tasks={tasks}
              deadlines={deadlines}
              gstRecords={gstRecords}
              customers={customers}
              onRefresh={reloadData}
            />
          )}

          {/* 9. Deadlines */}
          {currentTab === 'deadlines' && (
            <DeadlinesPage
              deadlines={deadlines}
              customers={customers}
              onRefresh={reloadData}
            />
          )}

          {/* 10. PDF Tools */}
          {currentTab === 'pdf-tools' && <PDFToolsPage />}

          {/* 11. OCR */}
          {currentTab === 'ocr' && (
            <OCRPage
              customers={customers}
              onSavedResult={reloadData}
            />
          )}

          {/* 12. PDF to Excel */}
          {currentTab === 'pdf-to-excel' && <PDFToExcelPage customers={customers} />}

          {/* 13. Excel Studio */}
          {currentTab === 'excel' && <ExcelPage customers={customers} />}

          {/* 14. Reports */}
          {currentTab === 'reports' && (
            <ReportsPage
              customers={customers}
              documents={documents}
              requirements={requirements}
              tasks={tasks}
              deadlines={deadlines}
              gstRecords={gstRecords}
            />
          )}

          {/* 15. Communications */}
          {currentTab === 'communications' && (
            <CommunicationsPage
              customers={customers}
              onRefresh={reloadData}
            />
          )}

          {/* 16. Integrations */}
          {currentTab === 'integrations' && <IntegrationsPage />}

          {/* 17. Team */}
          {currentTab === 'team' && (
            <TeamPage
              users={allUsers}
              currentUser={currentUser}
              onSwitchUser={(u) => {
                db.setCurrentUser(u);
                setCurrentUser(u);
              }}
            />
          )}

          {/* 18. Backup */}
          {currentTab === 'backup' && (
            <BackupPage
              backups={db.getBackups()}
              onRefresh={reloadData}
            />
          )}

          {/* 19. Settings */}
          {currentTab === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Search Dialog (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectItem={handleSearchResultClick}
      />

      {/* Quick Action Modal (+ New Customer, Task, Document, Req) */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSuccess={reloadData}
        customers={customers}
      />
    </div>
  );
}

export default App;
