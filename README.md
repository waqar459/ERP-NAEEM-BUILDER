# Naeem Builder ERP — HERE4U Facility & Construction Management

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

**Naeem Builder ERP** is a dual-system enterprise resource planning platform engineered specifically for civil construction, bank branch facility maintenance (UBL HERE4U), field operations, official statutory invoicing, and payment reconciliation.

---

## 📸 Key Features & Architecture

### 1. Dual-Core Operating System
- **System 1 (HERE4U Facility Management):** Built for commercial banking maintenance contracts (United Bank Limited, Meezan, HBL) covering emergency repairs, HVAC, electrical, plumbing, civil masonry, paint, and signages.
- **System 2 (Blue Construction ERP):** Designed for full-lifecycle turn-key civil engineering contracts, BOQ milestones, retention money tracking, material gate passes, and vendor sub-contractor accounts.

### 2. End-to-End Operational Lifecycle
1. **Intake & AI Email Extraction:** Automatic complaint ingestion from UBL HERE4U portals or Gmail threads using Gemini AI.
2. **GPS Proximity & Survey Audit:** Technician check-in radius verification (< 500m) with photo logging.
3. **Official Quotation & Schedule Rates:** Auto-computation of master rates, material markups, and statutory 16% PRA/SRB sales tax.
4. **Approval & Financial Lock:** BOM (Branch Operations Manager) approval gateway and PO tracking.
5. **Trade Staff Allocation:** Smart assignment to specialized technicians (Electrician, Painter, HVAC Tech, Plumber, Mason).
6. **Single-Page Delivery Note:** Isolated A4 print layout with TIN/NTN headers and 3-way sign-off boxes.
7. **Branch Manager Physical Stamp & Sign:** On-site verification with official bank stamp.
8. **Dual-Custody Reconciliation:**
   - **Digital Path:** Stamped photo/scan sent directly back to the UBL Gmail correspondence thread.
   - **Physical Path:** Hard copy deposited into Naeem Builder Head Office for internal accounts custody.
9. **Tax Invoicing & Withholding:** Sales Tax Invoices with NTN # 6974254-1, GST # 3520194159531, PRA/SRB and income tax withholding breakdown.
10. **Bank Transfer Settlement:** Reconciliation against UBL-TRF reference numbers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion |
| **Backend** | Node.js, Express.js (`server.ts` with Vite middlewares in development) |
| **AI Engine** | `@google/genai` (Gemini 2.5 Flash for email parsing, dispute draft generation, cost auditing) |
| **Document Engine** | CSS `@media print` single-page isolation engine for A4 Estimates, Delivery Notes, and Invoices |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: `npm` or `bun`

### Installation & GitHub Setup

1. **Initialize Git & Push to your Repository:**
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Naeem Builder ERP"
   git branch -M main
   git remote add origin https://github.com/your-username/naeem-builder-erp.git
   git push -u origin main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Configure your keys in `.env`:
   ```env
   # Gemini API Key for AI email parsing & automated dispute drafting
   GEMINI_API_KEY="your-gemini-api-key"

   # App hosting URL
   APP_URL="http://localhost:3000"
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Scripts

- `npm run dev`: Runs the full-stack server and Vite client concurrently via `tsx server.ts` on port 3000.
- `npm run build`: Bundles the client with Vite and the backend server with esbuild into `dist/`.
- `npm run start`: Starts the production build from `dist/server.cjs`.
- `npm run lint`: Runs TypeScript validation (`tsc --noEmit`).
- `npm run clean`: Cleans build artifacts (`dist`, `server.js`).

---

## 📂 Project Structure

```
├── .env.example              # Environment variables template
├── index.html                # Entry point HTML
├── metadata.json             # Applet capabilities & metadata
├── package.json              # NPM dependencies and scripts
├── server.ts                 # Full-stack Express server + Gemini proxy routes
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite & Tailwind CSS plugins
├── public/                   # Static assets & logos
└── src/
    ├── App.tsx               # Root application router & view switcher
    ├── index.css             # Tailwind imports & @media print A4 formatting rules
    ├── main.tsx              # React entry root
    ├── types/                # Strict TypeScript interfaces (Tickets, Invoices, GPS, Taxes)
    ├── data/                 # Master schedule rates, UBL branches, demo fixtures
    ├── context/              # ERPContext (global state, mock data, persistence, roles)
    ├── utils/                # Number-to-words, GPS calculations, date formatters
    └── components/
        ├── common/           # Header, AuditTrailModal, ERPTutorialGuideModal
        ├── documents/        # OfficialDocumentModal, NaeemBuilderLogo, AuthorizedSignature
        ├── here4u/           # SimpleERPLayout, System1Dashboard, TicketDetailModal, GmailThreadView
        ├── projects/         # Construction projects, BOQ line items, milestones
        ├── expenses/         # Field expenses, vehicle travel, petty cash advances
        ├── branches/         # Branch master management & GPS coordinates
        ├── analytics/        # Vendor cost reports, tax charts, payment allocations
        ├── admin/            # RBAC role management, user administration
        └── ai/               # AI Hub Modal & Gemini prompt interactions
```

---

## 📄 License & Attribution

Copyright &copy; 2026 **Naeem Builder**. All Rights Reserved.  
Registered NTN: `6974254-1` | Sales Tax GST: `3520194159531`.
