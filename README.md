# 🏢 Central Business Workflow

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Tauri](https://img.shields.io/badge/Tauri-2-ffc131?style=flat-square&logo=tauri)
![SQLite](https://img.shields.io/badge/SQLite-3-003b57?style=flat-square&logo=sqlite)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

**Production-quality Windows-first desktop app for Indian SMEs & accounting firms.**

[Features](#features) · [Tech Stack](#tech-stack) · [Quick Start](#quick-start) · [Screenshots](#screenshots) · [Architecture](#architecture)

</div>

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🏠 **Dashboard** | Animated KPI cards, charts, daily workflow summary |
| 👥 **Customer Management** | 360° client profiles with 9 tabs |
| 🧾 **Invoices & Billing** | GST-compliant tax invoices, print-ready |
| 🏦 **Tally / Accounting** | Vouchers, ledgers, journal entries |
| 🧮 **GST Management** | GSTR-1/3B filing tracker, returns |
| 📄 **Document Management** | Upload, OCR, version control |
| ✅ **Requirements Tracker** | Client checklists, bulk create |
| 📋 **Tasks** | Kanban + list view, priorities |
| 📅 **Calendar** | Month & agenda views |
| ⏰ **Deadlines** | Recurring engine, overdue alerts |
| 🔍 **OCR Engine** | PaddleOCR with confidence scoring |
| 📊 **Excel Studio** | Import/export, column mapping |
| 📑 **PDF Tools** | Split, merge, PDF→Excel |
| 📈 **Reports** | Analytics & data exports |
| 💬 **Communications** | Activity timeline per client |
| 🔐 **Team & RBAC** | Role-based access matrix |
| 🗄️ **Backup & Restore** | 5-step restore wizard |
| ⚙️ **Settings** | App preferences |

---

## 🛠 Tech Stack

```
Frontend:  React 18 · TypeScript · Vite · Tailwind CSS · Recharts
Desktop:   Tauri 2 (Rust) · WebView2 · MSI + NSIS packaging
Database:  SQLite (bundled) · localStorage fallback
Backend:   Python 3.12 (OCR, Excel, PDF processing)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18
- **Python** ≥ 3.10 (optional, for OCR/PDF features)

### Install & Run

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/central-business-workflow.git
cd central-business-workflow

# 2. Install dependencies
npm install

# 3. Start dev server (opens at http://localhost:3000)
npm run dev

# 4. Build for production
npm run build
```

### Login
```
Username: shettythanvi036
Password: Shetty@12
```

---

## 🏗 Architecture

```
central-business-workflow/
├── src/
│   ├── features/          # Feature modules (dashboard, invoices, gst…)
│   ├── components/        # Shared UI (Sidebar, Header, modals…)
│   ├── services/          # db.ts, searchService, ocrService…
│   └── types/             # TypeScript interfaces
├── src-tauri/             # Rust/Tauri backend (desktop packaging)
├── python/                # OCR engine, PDF & Excel processors
├── migrations/            # SQLite schema + seed data
└── docs/                  # Architecture & integration docs
```

### State Management
- **No Redux / Zustand** — state is lifted to `App.tsx` via `useState` + `reloadData()`
- **`db` service** — singleton using `localStorage` (browser) or `MemoryStorage` (test)
- **Offline-first** — all data stored locally, no network required

---

## 📸 Screenshots

> Add screenshots here after running the app

---

## 📄 License

MIT © 2024 Central Business Workflow

---

<div align="center">
  <sub>Built with ❤️ for Indian accounting firms</sub>
</div>
