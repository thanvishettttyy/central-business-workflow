import React, { useState } from 'react';
import {
  Settings, HardDrive, Bell, Shield, Palette, User,
  CheckCircle2, Database, Globe, Clock, Moon, Sun,
  Monitor, KeyRound, Trash2, Download, RefreshCw,
  ToggleLeft, ToggleRight, ChevronRight, Zap,
  Building2, Mail, Phone, MapPin, Save
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'cbw_settings';

interface AppSettings {
  // Profile
  firmName: string;
  firmGSTIN: string;
  firmAddress: string;
  firmPhone: string;
  firmEmail: string;
  // Storage
  storagePath: string;
  autoBackup: boolean;
  backupFrequency: '6h' | '12h' | 'daily' | 'weekly';
  // Notifications
  notifyDeadlines: boolean;
  notifyTasks: boolean;
  notifyGST: boolean;
  deadlineAlertDays: number;
  // Appearance
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  sidebarCollapsed: boolean;
  compactMode: boolean;
  // OCR & Workers
  ocrEngine: string;
  ocrConfidenceThreshold: number;
  // Privacy & Security
  sessionTimeout: '15min' | '30min' | '1h' | 'never';
  requirePasswordOnWake: boolean;
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (_) {}
  return defaultSettings;
}

const defaultSettings: AppSettings = {
  firmName: 'Central Business Workflow',
  firmGSTIN: '27AAABC1234D1Z5',
  firmAddress: 'Business Park, Central Avenue, Mumbai 400001',
  firmPhone: '+91 98450 00000',
  firmEmail: 'admin@centralworkflow.in',
  storagePath: 'C:\\ProgramData\\CentralWorkflow',
  autoBackup: true,
  backupFrequency: 'daily',
  notifyDeadlines: true,
  notifyTasks: true,
  notifyGST: true,
  deadlineAlertDays: 3,
  theme: 'light',
  accentColor: '#006fc7',
  sidebarCollapsed: false,
  compactMode: false,
  ocrEngine: 'PaddleOCR-v4',
  ocrConfidenceThreshold: 85,
  sessionTimeout: '30min',
  requirePasswordOnWake: false,
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-200">
    <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
    </div>
  </div>
);

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}
const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, desc }) => (
  <label className="flex items-center justify-between gap-4 cursor-pointer group py-1">
    <div>
      <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900 transition">{label}</p>
      {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-all duration-200 shrink-0 flex items-center cursor-pointer ${
        checked ? 'bg-brand-600' : 'bg-slate-300'
      }`}
      style={{ height: '22px', width: '40px' }}
    >
      <span
        className="absolute w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
        style={{ transform: checked ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  </label>
);

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}
const SelectField: React.FC<SelectFieldProps> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
}
const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, placeholder, icon, type = 'text' }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-white border border-slate-200 rounded-xl py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition ${icon ? 'pl-9 pr-4' : 'px-4'}`}
      />
    </div>
  </div>
);

const ACCENT_COLORS = [
  { color: '#006fc7', name: 'Ocean Blue' },
  { color: '#7c3aed', name: 'Violet' },
  { color: '#059669', name: 'Emerald' },
  { color: '#dc2626', name: 'Crimson' },
  { color: '#d97706', name: 'Amber' },
  { color: '#0891b2', name: 'Cyan' },
  { color: '#be185d', name: 'Pink' },
  { color: '#374151', name: 'Slate' },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setSettings(defaultSettings);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const SECTIONS = [
    { id: 'profile',       label: 'Firm Profile',      icon: <Building2 className="w-4 h-4" /> },
    { id: 'appearance',    label: 'Appearance',         icon: <Palette className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications',      icon: <Bell className="w-4 h-4" /> },
    { id: 'storage',       label: 'Storage & Backup',   icon: <HardDrive className="w-4 h-4" /> },
    { id: 'ocr',           label: 'OCR & Workers',      icon: <Zap className="w-4 h-4" /> },
    { id: 'security',      label: 'Security & Privacy', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 overflow-hidden page-enter">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Settings</h1>
            <p className="text-xs text-slate-500">Configure your workspace preferences</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl text-white transition cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #006fc7, #0c8ee9)', boxShadow: '0 2px 8px rgba(6,111,199,0.3)' }}
          >
            <Save className="w-3.5 h-3.5" />
            Save Settings
          </button>
        </div>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Settings saved successfully to localStorage.
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Sidebar nav */}
        <div className="w-48 bg-white border-r border-slate-200 shrink-0 py-4 px-2">
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all mb-0.5 cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={activeSection === sec.id ? 'text-white' : 'text-slate-400'}>
                {sec.icon}
              </span>
              {sec.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">

            {/* ── FIRM PROFILE ── */}
            {activeSection === 'profile' && (
              <div className="card p-6 space-y-5 animate-fade-in-up">
                <SectionHeader
                  icon={<Building2 className="w-4 h-4" />}
                  title="Firm Profile"
                  desc="Your firm details appear on invoices, reports and tax documents"
                />
                <TextField label="Firm / Practice Name" value={settings.firmName}
                  onChange={v => update('firmName', v)} placeholder="e.g. Rajesh & Associates"
                  icon={<Building2 className="w-3.5 h-3.5" />} />
                <TextField label="GSTIN" value={settings.firmGSTIN}
                  onChange={v => update('firmGSTIN', v)} placeholder="27AAABC1234D1Z5"
                  icon={<Shield className="w-3.5 h-3.5" />} />
                <TextField label="Registered Address" value={settings.firmAddress}
                  onChange={v => update('firmAddress', v)} placeholder="Building, Street, City, Pincode"
                  icon={<MapPin className="w-3.5 h-3.5" />} />
                <div className="grid grid-cols-2 gap-4">
                  <TextField label="Phone" value={settings.firmPhone}
                    onChange={v => update('firmPhone', v)} placeholder="+91 98450 00000"
                    icon={<Phone className="w-3.5 h-3.5" />} />
                  <TextField label="Email" value={settings.firmEmail} type="email"
                    onChange={v => update('firmEmail', v)} placeholder="admin@firm.com"
                    icon={<Mail className="w-3.5 h-3.5" />} />
                </div>
                <div className="pt-3 border-t border-slate-100 bg-slate-50 rounded-xl p-3 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">📄 Used on:</p>
                  <p>Invoice headers · PDF reports · GST return notes · Backup metadata</p>
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeSection === 'appearance' && (
              <div className="card p-6 space-y-6 animate-fade-in-up">
                <SectionHeader
                  icon={<Palette className="w-4 h-4" />}
                  title="Appearance"
                  desc="Customize the look and feel of your workspace"
                />
                {/* Theme */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
                      { value: 'dark',  label: 'Dark',  icon: <Moon className="w-4 h-4" /> },
                      { value: 'system',label: 'System',icon: <Monitor className="w-4 h-4" /> },
                    ].map(t => (
                      <button key={t.value} type="button"
                        onClick={() => update('theme', t.value as any)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-xs font-semibold transition cursor-pointer ${
                          settings.theme === t.value
                            ? 'border-brand-500 bg-brand-50 text-brand-700'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {t.icon}
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-3">Accent Color</p>
                  <div className="flex gap-2.5 flex-wrap">
                    {ACCENT_COLORS.map(a => (
                      <button key={a.color} type="button"
                        onClick={() => update('accentColor', a.color)}
                        title={a.name}
                        className="w-8 h-8 rounded-full transition-all cursor-pointer"
                        style={{
                          background: a.color,
                          boxShadow: settings.accentColor === a.color
                            ? `0 0 0 3px white, 0 0 0 5px ${a.color}`
                            : '0 1px 3px rgba(0,0,0,0.2)',
                          transform: settings.accentColor === a.color ? 'scale(1.15)' : 'scale(1)',
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    Current: <span className="font-mono">{settings.accentColor}</span>
                  </p>
                </div>

                {/* Toggles */}
                <div className="space-y-3 divide-y divide-slate-100">
                  <Toggle checked={settings.compactMode} onChange={v => update('compactMode', v)}
                    label="Compact Mode" desc="Reduce spacing and padding throughout the UI" />
                  <div className="pt-3">
                    <Toggle checked={settings.sidebarCollapsed} onChange={v => update('sidebarCollapsed', v)}
                      label="Collapse Sidebar by Default" desc="Start with the navigation sidebar collapsed" />
                  </div>
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeSection === 'notifications' && (
              <div className="card p-6 space-y-5 animate-fade-in-up">
                <SectionHeader
                  icon={<Bell className="w-4 h-4" />}
                  title="Notifications"
                  desc="Control what alerts appear and when you get reminded"
                />
                <div className="space-y-4 divide-y divide-slate-100">
                  <Toggle checked={settings.notifyDeadlines} onChange={v => update('notifyDeadlines', v)}
                    label="Deadline Alerts" desc="Notify when a statutory deadline is approaching" />
                  <div className="pt-4">
                    <Toggle checked={settings.notifyTasks} onChange={v => update('notifyTasks', v)}
                      label="Task Reminders" desc="Notify when tasks are overdue or due today" />
                  </div>
                  <div className="pt-4">
                    <Toggle checked={settings.notifyGST} onChange={v => update('notifyGST', v)}
                      label="GST Filing Alerts" desc="Notify before GSTR filing deadlines" />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Deadline Alert Window
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={1} max={14} value={settings.deadlineAlertDays}
                      onChange={e => update('deadlineAlertDays', Number(e.target.value))}
                      className="flex-1 accent-brand-600 cursor-pointer" />
                    <div className="w-20 text-center py-1.5 px-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-sm font-bold">
                      {settings.deadlineAlertDays} day{settings.deadlineAlertDays !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Alert {settings.deadlineAlertDays} day{settings.deadlineAlertDays !== 1 ? 's' : ''} before each deadline
                  </p>
                </div>
              </div>
            )}

            {/* ── STORAGE & BACKUP ── */}
            {activeSection === 'storage' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="card p-6 space-y-5">
                  <SectionHeader
                    icon={<HardDrive className="w-4 h-4" />}
                    title="Storage Directories"
                    desc="Local filesystem paths for data, documents and exports"
                  />
                  <TextField label="Root Application Data Path" value={settings.storagePath}
                    onChange={v => update('storagePath', v)}
                    placeholder="C:\ProgramData\CentralWorkflow"
                    icon={<Database className="w-3.5 h-3.5" />} />
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {[
                      { label: 'Database', path: 'database\\app.db' },
                      { label: 'Documents', path: 'customers\\*\\Documents' },
                      { label: 'Exports', path: 'exports\\*' },
                    ].map(d => (
                      <div key={d.label} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                        <p className="font-bold text-slate-700 mb-1">{d.label}</p>
                        <p className="font-mono text-[10px] text-slate-500 break-all">{d.path}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-6 space-y-5">
                  <SectionHeader
                    icon={<Database className="w-4 h-4" />}
                    title="Auto Backup"
                    desc="Scheduled database backups with AES-256 encryption"
                  />
                  <Toggle checked={settings.autoBackup} onChange={v => update('autoBackup', v)}
                    label="Enable Automatic Backups"
                    desc="Run scheduled backups to the configured storage path" />
                  {settings.autoBackup && (
                    <SelectField label="Backup Frequency" value={settings.backupFrequency}
                      onChange={v => update('backupFrequency', v as any)}
                      options={[
                        { value: '6h', label: 'Every 6 hours' },
                        { value: '12h', label: 'Every 12 hours' },
                        { value: 'daily', label: 'Daily (midnight)' },
                        { value: 'weekly', label: 'Weekly (Sunday midnight)' },
                      ]}
                    />
                  )}
                  <div className="flex gap-2 pt-1">
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> Download Backup Now
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-rose-200 rounded-xl text-rose-600 hover:bg-rose-50 transition cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Clear Old Backups
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── OCR & WORKERS ── */}
            {activeSection === 'ocr' && (
              <div className="card p-6 space-y-5 animate-fade-in-up">
                <SectionHeader
                  icon={<Zap className="w-4 h-4" />}
                  title="OCR & Processing Workers"
                  desc="Configure document extraction engine and performance parameters"
                />
                <SelectField label="Active OCR Engine" value={settings.ocrEngine}
                  onChange={v => update('ocrEngine', v)}
                  options={[
                    { value: 'PaddleOCR-v4', label: 'PaddleOCR v4 (Local Python Worker) — Best accuracy' },
                    { value: 'PyMuPDF', label: 'PyMuPDF Native Text Parser — Fast, PDF text only' },
                    { value: 'Tesseract', label: 'Tesseract OCR — Open source fallback' },
                  ]}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Minimum Confidence Threshold
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="range" min={50} max={99} value={settings.ocrConfidenceThreshold}
                      onChange={e => update('ocrConfidenceThreshold', Number(e.target.value))}
                      className="flex-1 accent-brand-600 cursor-pointer" />
                    <div className="w-16 text-center py-1.5 px-3 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 text-sm font-bold">
                      {settings.ocrConfidenceThreshold}%
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    Fields below {settings.ocrConfidenceThreshold}% confidence will be flagged for manual review
                  </p>
                </div>

                {/* Status */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
                  <p className="text-xs font-bold text-slate-700 mb-2">Worker Status</p>
                  {[
                    { name: 'Python Runtime', status: 'Running', color: 'text-emerald-600 bg-emerald-50' },
                    { name: settings.ocrEngine, status: 'Loaded', color: 'text-emerald-600 bg-emerald-50' },
                    { name: 'PDF Table Extractor', status: 'Ready', color: 'text-emerald-600 bg-emerald-50' },
                    { name: 'Excel Processor', status: 'Ready', color: 'text-emerald-600 bg-emerald-50' },
                  ].map(w => (
                    <div key={w.name} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">{w.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${w.color}`}>{w.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeSection === 'security' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="card p-6 space-y-5">
                  <SectionHeader
                    icon={<Shield className="w-4 h-4" />}
                    title="Security & Privacy"
                    desc="Session management, access control and data protection"
                  />
                  <SelectField label="Auto Session Timeout" value={settings.sessionTimeout}
                    onChange={v => update('sessionTimeout', v as any)}
                    options={[
                      { value: '15min', label: 'After 15 minutes of inactivity' },
                      { value: '30min', label: 'After 30 minutes of inactivity' },
                      { value: '1h', label: 'After 1 hour of inactivity' },
                      { value: 'never', label: 'Never (not recommended)' },
                    ]}
                  />
                  <div className="divide-y divide-slate-100 space-y-3">
                    <Toggle checked={settings.requirePasswordOnWake} onChange={v => update('requirePasswordOnWake', v)}
                      label="Require Password on Wake" desc="Show login screen when session resumes after timeout" />
                  </div>
                </div>

                <div className="card p-6 space-y-4">
                  <SectionHeader
                    icon={<KeyRound className="w-4 h-4" />}
                    title="Change Password"
                    desc="Update your login credentials"
                  />
                  <div className="text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                    💡 Use the <strong>Forgot Password</strong> flow on the login screen to securely reset your password.
                  </div>
                </div>

                <div className="card p-6 space-y-4">
                  <SectionHeader
                    icon={<Trash2 className="w-4 h-4" />}
                    title="Data Management"
                    desc="Clear cached data or perform a factory reset"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { localStorage.clear(); alert('Cache cleared.'); }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Clear App Cache
                    </button>
                    <button
                      onClick={() => { if (window.confirm('This will delete ALL local data. Are you absolutely sure?')) localStorage.clear(); }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Factory Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
