import React, { useState, useMemo } from 'react';
import {
  Search,
  Bell,
  User,
  ChevronDown,
  LayoutDashboard,
  Mail,
  Building2,
  Compass,
  FileText,
  CheckCircle2,
  ShoppingCart,
  Store,
  Package,
  Users,
  UserCheck,
  CalendarCheck,
  Navigation,
  Car,
  Receipt,
  CreditCard,
  CheckSquare,
  ClipboardList,
  Wrench,
  Truck,
  Award,
  FileCheck2,
  Calculator,
  Percent,
  Landmark,
  Wallet,
  PieChart,
  BarChart2,
  Folder,
  FileBarChart,
  Settings,
  ArrowRight,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  PlusCircle,
  BookOpen,
  X,
  Eye,
  Filter,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Ticket, UserRole } from '../../types/erp';

interface SimpleERPLayoutProps {
  onSelectTicket: (ticketId: string) => void;
  onOpenNewTicket: () => void;
  onOpenAuditTrail: () => void;
  onOpenAI: () => void;
  onOpenTutorialGuide: () => void;
}

export type SimpleNavTab =
  | 'DASHBOARD'
  | 'UBL_REQUESTS'
  | 'GMAIL_THREADS'
  | 'BRANCH_MASTER'
  | 'SITE_VISITS'
  | 'ESTIMATES'
  | 'UBL_APPROVALS'
  | 'PURCHASE_REQUESTS'
  | 'VENDOR_MASTER'
  | 'PROCUREMENT'
  | 'STAFF_MASTER'
  | 'STAFF_ASSIGNMENT'
  | 'STAFF_ATTENDANCE'
  | 'GPS_FIELD'
  | 'VEHICLES'
  | 'JOB_EXPENSES'
  | 'STAFF_ADVANCES'
  | 'EXPENSE_APPROVAL'
  | 'WORK_ORDERS'
  | 'WORK_EXECUTION'
  | 'DELIVERY_NOTES'
  | 'WORK_COMPLETION'
  | 'TICKET_CLOSURE'
  | 'INDIVIDUAL_INVOICES'
  | 'CONSOLIDATED_BILLING'
  | 'TAX_DEDUCTION'
  | 'UBL_ACCOUNT_SUBMISSION'
  | 'BANK_RECEIPT'
  | 'PAYMENT_ALLOCATION'
  | 'JOB_COSTING'
  | 'DOCUMENTS'
  | 'NOTIFICATIONS'
  | 'REPORTS'
  | 'ADMINISTRATION';

export const SimpleERPLayout: React.FC<SimpleERPLayoutProps> = ({
  onSelectTicket,
  onOpenNewTicket,
  onOpenAuditTrail,
  onOpenAI,
  onOpenTutorialGuide,
}) => {
  const {
    tickets,
    branches,
    activeRole,
    setActiveRole,
    setSystemMode,
    consolidatedInvoices,
    expenses,
    auditLogs,
  } = useERP();

  const [activeNav, setActiveNav] = useState<SimpleNavTab>('DASHBOARD');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Search filter across tickets, branches, invoices
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return tickets.filter(
      (t) =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.branchName.toLowerCase().includes(q) ||
        (t.ublBranchCode && t.ublBranchCode.includes(q)) ||
        t.category.toLowerCase().includes(q)
    );
  }, [searchQuery, tickets]);

  // Sidebar navigation menu items matching user's image exactly
  const sidebarNavItems: { id: SimpleNavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'UBL_REQUESTS', label: 'UBL Requests / Tickets', icon: <Mail className="w-4 h-4" />, badge: 5 },
    { id: 'GMAIL_THREADS', label: 'Gmail / Email Threads', icon: <Mail className="w-4 h-4" /> },
    { id: 'BRANCH_MASTER', label: 'Branch Master', icon: <Building2 className="w-4 h-4" /> },
    { id: 'SITE_VISITS', label: 'Site Visits / Survey', icon: <Compass className="w-4 h-4" /> },
    { id: 'ESTIMATES', label: 'Estimates / Quotations', icon: <FileText className="w-4 h-4" /> },
    { id: 'UBL_APPROVALS', label: 'UBL Approvals', icon: <CheckCircle2 className="w-4 h-4" />, badge: 7 },
    { id: 'PURCHASE_REQUESTS', label: 'Purchase Requests', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'VENDOR_MASTER', label: 'Vendor Master', icon: <Store className="w-4 h-4" /> },
    { id: 'PROCUREMENT', label: 'Procurement / Purchase', icon: <Package className="w-4 h-4" /> },
    { id: 'STAFF_MASTER', label: 'Staff Master', icon: <Users className="w-4 h-4" /> },
    { id: 'STAFF_ASSIGNMENT', label: 'Staff Assignment', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'STAFF_ATTENDANCE', label: 'Staff Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'GPS_FIELD', label: 'GPS / Field Operations', icon: <Navigation className="w-4 h-4" /> },
    { id: 'VEHICLES', label: 'Vehicles / Travel', icon: <Car className="w-4 h-4" /> },
    { id: 'JOB_EXPENSES', label: 'Job Expenses', icon: <Receipt className="w-4 h-4" /> },
    { id: 'STAFF_ADVANCES', label: 'Staff Advances', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'EXPENSE_APPROVAL', label: 'Expense Approval', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'WORK_ORDERS', label: 'Work Orders', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'WORK_EXECUTION', label: 'Work Execution', icon: <Wrench className="w-4 h-4" /> },
    { id: 'DELIVERY_NOTES', label: 'Delivery Notes', icon: <Truck className="w-4 h-4" />, badge: 4 },
    { id: 'WORK_COMPLETION', label: 'Work Completion', icon: <Award className="w-4 h-4" /> },
    { id: 'TICKET_CLOSURE', label: 'Ticket Closure', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'INDIVIDUAL_INVOICES', label: 'Individual Invoices', icon: <FileText className="w-4 h-4" />, badge: 12 },
    { id: 'CONSOLIDATED_BILLING', label: 'Consolidated Billing', icon: <Calculator className="w-4 h-4" /> },
    { id: 'TAX_DEDUCTION', label: 'Tax Deduction / Withholding', icon: <Percent className="w-4 h-4" /> },
    { id: 'UBL_ACCOUNT_SUBMISSION', label: 'UBL Account Submission', icon: <Landmark className="w-4 h-4" /> },
    { id: 'BANK_RECEIPT', label: 'Bank Receipt / Payment', icon: <Wallet className="w-4 h-4" /> },
    { id: 'PAYMENT_ALLOCATION', label: 'Payment Allocation', icon: <PieChart className="w-4 h-4" /> },
    { id: 'JOB_COSTING', label: 'Job Costing', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'DOCUMENTS', label: 'Documents', icon: <Folder className="w-4 h-4" /> },
    { id: 'NOTIFICATIONS', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'REPORTS', label: 'Reports', icon: <FileBarChart className="w-4 h-4" /> },
    { id: 'ADMINISTRATION', label: 'Administration', icon: <Settings className="w-4 h-4" /> },
  ];

  // Helper to open first or matching ticket
  const handleOpenTicket = (ticketRef?: string) => {
    if (ticketRef) {
      const match = tickets.find(
        (t) =>
          t.ticketNumber.toLowerCase().includes(ticketRef.toLowerCase()) ||
          t.id.toLowerCase().includes(ticketRef.toLowerCase())
      );
      if (match) {
        onSelectTicket(match.id);
        return;
      }
    }
    if (tickets.length > 0) {
      onSelectTicket(tickets[0].id);
    }
  };

  // Recent Jobs matching user's image exactly
  const recentJobsList = [
    {
      jobId: 'NB-2024-001',
      ublTicket: 'UBL-45872',
      branch: 'Lahore',
      workDesc: 'AC Repair',
      status: 'In Progress',
      statusColor: 'bg-blue-100 text-blue-700',
      progress: 70,
      progressColor: 'bg-emerald-500',
      ticketRef: 'TCK-123913',
    },
    {
      jobId: 'NB-2024-002',
      ublTicket: 'UBL-45895',
      branch: 'Gujranwala',
      workDesc: 'Civil Work',
      status: 'Site Visit',
      statusColor: 'bg-amber-100 text-amber-800',
      progress: 30,
      progressColor: 'bg-amber-500',
      ticketRef: 'TCK-126503',
    },
    {
      jobId: 'NB-2024-003',
      ublTicket: '--',
      branch: 'Karachi',
      workDesc: 'Electrical',
      status: 'Estimate',
      statusColor: 'bg-amber-100 text-amber-800',
      progress: 10,
      progressColor: 'bg-amber-500',
      ticketRef: 'TCK-126503',
    },
    {
      jobId: 'NB-2024-004',
      ublTicket: 'UBL-45901',
      branch: 'Islamabad',
      workDesc: 'Plumbing',
      status: 'Approval Pending',
      statusColor: 'bg-rose-100 text-rose-700',
      progress: 20,
      progressColor: 'bg-amber-500',
      ticketRef: 'TCK-123913',
    },
    {
      jobId: 'NB-2024-005',
      ublTicket: 'UBL-45910',
      branch: 'Faisalabad',
      workDesc: 'Painting',
      status: 'Completed',
      statusColor: 'bg-emerald-100 text-emerald-800',
      progress: 100,
      progressColor: 'bg-emerald-500',
      ticketRef: 'TCK-126503',
    },
  ];

  // Pending Actions list matching user's image exactly
  const pendingActionsList = [
    { title: 'New UBL Requests', count: 5, color: 'bg-rose-100 text-rose-700', iconBg: 'bg-rose-50 text-rose-600', nav: 'UBL_REQUESTS' },
    { title: 'Site Visit Pending', count: 3, color: 'bg-amber-100 text-amber-800', iconBg: 'bg-amber-50 text-amber-600', nav: 'SITE_VISITS' },
    { title: 'Estimates Pending', count: 4, color: 'bg-amber-100 text-amber-800', iconBg: 'bg-amber-50 text-amber-600', nav: 'ESTIMATES' },
    { title: 'UBL Approval Pending', count: 7, color: 'bg-rose-100 text-rose-700', iconBg: 'bg-rose-50 text-rose-600', nav: 'UBL_APPROVALS' },
    { title: 'Purchase Requests Pending', count: 6, color: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-50 text-purple-600', nav: 'PURCHASE_REQUESTS' },
    { title: 'Delivery Notes Pending', count: 4, color: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-50 text-blue-600', nav: 'DELIVERY_NOTES' },
    { title: 'Invoices Pending', count: 12, color: 'bg-amber-100 text-amber-800', iconBg: 'bg-amber-50 text-amber-600', nav: 'INDIVIDUAL_INVOICES' },
    { title: 'Payment Pending', count: 8, color: 'bg-rose-100 text-rose-700', iconBg: 'bg-rose-50 text-rose-600', nav: 'BANK_RECEIPT' },
  ];

  // Bottom 3 tables matching image
  const todaysSiteVisits = [
    { time: '09:00', jobId: 'NB-2024-010', branch: 'Lahore', staff: 'Imran', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-800' },
    { time: '11:00', jobId: 'NB-2024-012', branch: 'Gujranwala', staff: 'Asif', status: 'In Progress', statusColor: 'bg-blue-100 text-blue-700' },
    { time: '02:00', jobId: 'NB-2024-015', branch: 'Rawalpindi', staff: 'Bilal', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800' },
  ];

  const recentInvoices = [
    { invoiceNo: 'INV-1001', jobId: 'NB-2024-005', amount: 'Rs. 185,000', status: 'Submitted', statusColor: 'bg-blue-100 text-blue-700' },
    { invoiceNo: 'INV-1002', jobId: 'NB-2024-004', amount: 'Rs. 220,000', status: 'Approval', statusColor: 'bg-amber-100 text-amber-800' },
    { invoiceNo: 'INV-1003', jobId: 'NB-2024-002', amount: 'Rs. 145,000', status: 'Draft', statusColor: 'bg-slate-100 text-slate-700' },
    { invoiceNo: 'INV-1004', jobId: 'NB-2024-001', amount: 'Rs. 95,000', status: 'Paid', statusColor: 'bg-emerald-100 text-emerald-800' },
  ];

  const recentPayments = [
    { date: '12 Dec 2024', ref: 'UBL-TRF-001', amount: 'Rs. 650,000', status: 'Allocated', statusColor: 'bg-emerald-100 text-emerald-800' },
    { date: '10 Dec 2024', ref: 'UBL-TRF-002', amount: 'Rs. 420,000', status: 'Allocated', statusColor: 'bg-emerald-100 text-emerald-800' },
    { date: '05 Dec 2024', ref: 'UBL-TRF-003', amount: 'Rs. 780,000', status: 'Pending', statusColor: 'bg-amber-100 text-amber-800' },
    { date: '01 Dec 2024', ref: 'UBL-TRF-004', amount: 'Rs. 320,000', status: 'Allocated', statusColor: 'bg-emerald-100 text-emerald-800' },
  ];

  const handleNavClick = (navId: SimpleNavTab) => {
    setActiveNav(navId);
    if (navId === 'DASHBOARD') return;
    if (navId === 'BRANCH_MASTER') {
      setSystemMode('BRANCH_MASTER');
    } else if (navId === 'CONSOLIDATED_BILLING') {
      setSystemMode('CONSOLIDATED_INVOICES');
    } else if (navId === 'JOB_COSTING' || navId === 'VENDOR_MASTER') {
      setSystemMode('VENDOR_COST_REPORT');
    } else if (navId === 'ADMINISTRATION') {
      setSystemMode('ADMIN_PANEL');
    } else if (navId === 'JOB_EXPENSES' || navId === 'STAFF_ADVANCES' || navId === 'EXPENSE_APPROVAL' || navId === 'VEHICLES') {
      setSystemMode('FIELD_EXPENSES');
    } else if (navId === 'REPORTS') {
      setSystemMode('ANALYTICS_GRAPHS');
    } else if (navId === 'NOTIFICATIONS') {
      onOpenAuditTrail();
    } else {
      // For any ticket/work item nav, open relevant ticket
      handleOpenTicket();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 selection:bg-blue-500 selection:text-white">
      {/* 1. TOP NAVBAR (Dark Navy #003366) */}
      <header className="bg-[#003366] text-white px-4 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-md">
        {/* Brand Left */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center border border-white/20">
            <svg
              className="w-5 h-5 text-sky-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="9" y1="22" x2="9" y2="2" />
              <line x1="8" y1="6" x2="8.01" y2="6" />
              <line x1="16" y1="6" x2="16.01" y2="6" />
              <line x1="16" y1="10" x2="16.01" y2="10" />
              <line x1="16" y1="14" x2="16.01" y2="14" />
              <line x1="16" y1="18" x2="16.01" y2="18" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-base sm:text-lg tracking-tight leading-tight flex items-center gap-1.5">
              <span>Naeem Builder</span>
            </div>
            <div className="text-[10px] font-bold text-sky-400 tracking-wider uppercase leading-none">
              HERE4U ERP
            </div>
          </div>
        </div>

        {/* Search Bar Center */}
        <div className="max-w-xl w-full mx-4 hidden md:block relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Job, Ticket, Branch, Invoice..."
              className="w-full bg-white text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent placeholder:text-slate-400 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Search Dropdown */}
          {searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-xl border border-slate-200 z-50 max-h-72 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center">
                  No matching jobs, tickets, or branches found.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {searchResults.slice(0, 5).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTicket(t.id);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2.5 hover:bg-sky-50 flex items-center justify-between transition-colors text-xs"
                    >
                      <div>
                        <span className="font-bold text-sky-700">{t.ticketNumber}</span>
                        <span className="mx-1.5 text-slate-400">&bull;</span>
                        <span className="font-medium text-slate-800">{t.branchName}</span>
                        <div className="text-[11px] text-slate-500 truncate max-w-sm">
                          {t.title}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                        {t.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Tutorial Guide & PDF Button */}
          <button
            onClick={onOpenTutorialGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
            title="Open comprehensive ERP user guide & implementation flowchart with PDF export"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Guide &amp; Flowchart</span>
          </button>

          {/* New Ticket Quick Button */}
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold shadow transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">+ New Job</span>
          </button>

          {/* Notification Bell with Red Badge "5" */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-1.5 text-white/90 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#003366]">
                5
              </span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 text-slate-800 p-2">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-xs">Notifications &amp; Alerts</span>
                  <span className="text-[10px] text-blue-600 font-semibold cursor-pointer" onClick={onOpenAuditTrail}>
                    View Audit Trail
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-2 hover:bg-slate-50 cursor-pointer">
                    <span className="font-bold text-rose-600">[Action Required]</span> 4 Delivery Notes awaiting Branch Manager Stamp.
                  </div>
                  <div className="p-2 hover:bg-slate-50 cursor-pointer">
                    <span className="font-bold text-blue-600">[UBL Approval]</span> Quotation #2601123913 approved by Operations.
                  </div>
                  <div className="p-2 hover:bg-slate-50 cursor-pointer">
                    <span className="font-bold text-amber-600">[GPS Verified]</span> Engr. Bilal checked in within 14m of Burki Branch.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Admin User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 text-white/95 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-sky-200 text-sky-950 flex items-center justify-center font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">Admin</span>
              <ChevronDown className="w-3.5 h-3.5 text-white/70" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 text-slate-800 p-2">
                <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                  <div className="font-bold text-xs text-slate-900">Signed in as Admin</div>
                  <div className="text-[11px] text-slate-500">Active Role: {activeRole}</div>
                </div>
                <div className="text-xs space-y-1">
                  <button
                    onClick={() => {
                      setSystemMode('ADMIN_PANEL');
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 font-medium"
                  >
                    User Management &amp; Staff Roles
                  </button>
                  <button
                    onClick={() => {
                      onOpenAI();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 font-medium text-purple-700"
                  >
                    Launch AI Operations Hub
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuditTrail();
                      setShowRoleMenu(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-100 font-medium"
                  >
                    System Audit Trail (Section 16)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY WITH SIDEBAR AND MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (#f0f4f9) */}
        <aside className="w-64 bg-[#f0f4f9] border-r border-slate-200 shrink-0 hidden lg:block overflow-y-auto max-h-[calc(100vh-53px)] select-none py-2 text-xs">
          <div className="space-y-0.5 px-2">
            {sidebarNavItems.map((item) => {
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md font-medium text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? 'text-blue-600' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 max-h-[calc(100vh-53px)]">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* WELCOME BANNER CARD */}
            <div className="bg-gradient-to-r from-sky-50 via-blue-50/70 to-indigo-50/60 border border-sky-200 rounded-xl p-5 relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="z-10 max-w-xl">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#003366] tracking-tight">
                  Welcome to Naeem Builder ERP
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed">
                  Manage UBL maintenance &amp; repairing work from request to final payment.
                </p>
              </div>

              {/* UBL Branch Building Vector Illustration (Center-Right Artwork matching image) */}
              <div className="hidden md:flex items-center justify-center opacity-90 z-0">
                <svg width="240" height="85" viewBox="0 0 240 85" fill="none">
                  {/* Sky outline & clouds */}
                  <path d="M10 50 Q 25 35 40 50 T 70 50" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                  <path d="M180 30 Q 195 20 210 30 T 235 30" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
                  {/* Bank Building Structure */}
                  <rect x="50" y="20" width="130" height="60" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" />
                  <rect x="55" y="25" width="120" height="18" fill="#e0f2fe" rx="2" />
                  {/* UBL Oval Logo on Building */}
                  <ellipse cx="115" cy="34" rx="26" ry="7" fill="#003366" />
                  <text x="115" y="37" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                    UBL
                  </text>
                  {/* Windows grid */}
                  <rect x="62" y="48" width="18" height="24" rx="1" fill="#bae6fd" stroke="#60a5fa" strokeWidth="0.8" />
                  <rect x="86" y="48" width="18" height="24" rx="1" fill="#bae6fd" stroke="#60a5fa" strokeWidth="0.8" />
                  <rect x="126" y="48" width="18" height="24" rx="1" fill="#bae6fd" stroke="#60a5fa" strokeWidth="0.8" />
                  <rect x="150" y="48" width="18" height="24" rx="1" fill="#bae6fd" stroke="#60a5fa" strokeWidth="0.8" />
                  {/* Main Glass Door */}
                  <rect x="108" y="52" width="14" height="28" fill="#0284c7" rx="1" />
                  <line x1="115" y1="52" x2="115" y2="80" stroke="#ffffff" strokeWidth="1" />
                  {/* Trees and Foliage */}
                  <circle cx="36" cy="62" r="14" fill="#86efac" stroke="#22c55e" strokeWidth="1.2" />
                  <rect x="34" y="70" width="4" height="12" fill="#854d0e" />
                  <circle cx="195" cy="58" r="16" fill="#86efac" stroke="#22c55e" strokeWidth="1.2" />
                  <rect x="193" y="70" width="4" height="12" fill="#854d0e" />
                </svg>
              </div>

              {/* Today Date Badge Right */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center gap-3 shrink-0 z-10 self-start md:self-auto">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#003366] flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Today
                  </div>
                  <div className="text-sm font-bold text-slate-900 leading-tight">
                    14 Dec 2024
                  </div>
                  <div className="text-[11px] text-slate-500">Saturday</div>
                </div>
              </div>
            </div>

            {/* 8 KPI METRIC CARDS (4 columns x 2 rows matching image) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Jobs */}
              <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#bae6fd]/60 text-sky-700 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Total Jobs</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">286</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('UBL_REQUESTS')}
                  className="mt-3 text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View All</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 2: Work in Progress */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#bbf7d0]/60 text-emerald-700 flex items-center justify-center">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Work in Progress</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">48</div>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenTicket()}
                  className="mt-3 text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View Jobs</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 3: Pending Invoices */}
              <div className="bg-[#fffbeb] border border-[#fde68a] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#fde68a]/60 text-amber-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Pending Invoices</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">36</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('INDIVIDUAL_INVOICES')}
                  className="mt-3 text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View Invoices</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 4: Pending Payment */}
              <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#fecdd3]/60 text-rose-700 flex items-center justify-center">
                    <span className="font-bold text-base">₹</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Pending Payment</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">Rs. 11.4M</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('BANK_RECEIPT')}
                  className="mt-3 text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View Details</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 5: Site Visits Today */}
              <div className="bg-[#faf5ff] border border-[#e9d5ff] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#e9d5ff]/60 text-purple-700 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Site Visits Today</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">12</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('SITE_VISITS')}
                  className="mt-3 text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View Visits</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 6: Pending Approvals */}
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#fecaca]/60 text-red-700 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Pending Approvals</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">17</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('UBL_APPROVALS')}
                  className="mt-3 text-xs text-red-700 hover:text-red-900 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View Requests</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 7: Purchase Pending */}
              <div className="bg-[#f0fdfa] border border-[#99f6e4] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#99f6e4]/60 text-teal-700 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Purchase Pending</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">8</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('PURCHASE_REQUESTS')}
                  className="mt-3 text-xs text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View Purchases</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 8: Active Staff on Site */}
              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#a7f3d0]/60 text-emerald-800 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Active Staff on Site</div>
                    <div className="text-2xl font-black text-slate-900 leading-tight">32</div>
                  </div>
                </div>
                <button
                  onClick={() => handleNavClick('STAFF_ATTENDANCE')}
                  className="mt-3 text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1 self-start cursor-pointer"
                >
                  <span>View Attendance</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>

            {/* MIDDLE SECTION: RECENT JOBS TABLE + PENDING ACTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Recent Jobs (8 cols) */}
              <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <ClipboardList className="w-4 h-4 text-blue-600" />
                      <span>Recent Jobs</span>
                    </div>
                    <button
                      onClick={() => handleOpenTicket()}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-100 font-semibold">
                          <th className="py-2 px-2">Job ID</th>
                          <th className="py-2 px-2">UBL Ticket</th>
                          <th className="py-2 px-2">Branch</th>
                          <th className="py-2 px-2">Work Description</th>
                          <th className="py-2 px-2">Status</th>
                          <th className="py-2 px-2">Progress</th>
                          <th className="py-2 px-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {recentJobsList.map((job) => (
                          <tr key={job.jobId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-2 font-semibold text-blue-600 cursor-pointer" onClick={() => handleOpenTicket(job.ticketRef)}>
                              {job.jobId}
                            </td>
                            <td className="py-2.5 px-2 text-slate-600">{job.ublTicket}</td>
                            <td className="py-2.5 px-2 font-medium text-slate-900">{job.branch}</td>
                            <td className="py-2.5 px-2">{job.workDesc}</td>
                            <td className="py-2.5 px-2">
                              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${job.statusColor}`}>
                                {job.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono text-slate-500 w-7">{job.progress}%</span>
                                <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${job.progressColor}`}
                                    style={{ width: `${job.progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              <button
                                onClick={() => handleOpenTicket(job.ticketRef)}
                                className="px-2.5 py-1 rounded border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-600 font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right: Pending Actions (4 cols) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl shadow-sm p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>Pending Actions</span>
                    </div>
                    <button
                      onClick={() => handleNavClick('UBL_REQUESTS')}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {pendingActionsList.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleNavClick(action.nav as SimpleNavTab)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${action.iconBg}`}>
                            &bull;
                          </div>
                          <span className="text-xs text-slate-700 font-medium">{action.title}</span>
                        </div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${action.color}`}>
                          {action.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ROW: 3 TABLES SIDE BY SIDE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Today's Site Visits */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Today's Site Visits</span>
                    </div>
                    <button
                      onClick={() => handleNavClick('SITE_VISITS')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-medium text-[11px] border-b border-slate-100">
                        <th className="py-1.5">Time</th>
                        <th className="py-1.5">Job ID</th>
                        <th className="py-1.5">Branch</th>
                        <th className="py-1.5">Staff</th>
                        <th className="py-1.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                      {todaysSiteVisits.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenTicket()}>
                          <td className="py-2 text-slate-500 font-mono">{item.time}</td>
                          <td className="py-2 text-blue-600 font-semibold">{item.jobId}</td>
                          <td className="py-2">{item.branch}</td>
                          <td className="py-2 font-medium">{item.staff}</td>
                          <td className="py-2 text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 2: Recent Invoices */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Recent Invoices</span>
                    </div>
                    <button
                      onClick={() => handleNavClick('INDIVIDUAL_INVOICES')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-medium text-[11px] border-b border-slate-100">
                        <th className="py-1.5">Invoice No.</th>
                        <th className="py-1.5">Job ID</th>
                        <th className="py-1.5">Amount</th>
                        <th className="py-1.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                      {recentInvoices.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenTicket()}>
                          <td className="py-2 text-blue-600 font-semibold">{item.invoiceNo}</td>
                          <td className="py-2">{item.jobId}</td>
                          <td className="py-2 font-medium">{item.amount}</td>
                          <td className="py-2 text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 3: Recent Payments */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm">
                      <Wallet className="w-4 h-4 text-blue-600" />
                      <span>Recent Payments</span>
                    </div>
                    <button
                      onClick={() => handleNavClick('BANK_RECEIPT')}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View All
                    </button>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-medium text-[11px] border-b border-slate-100">
                        <th className="py-1.5">Date</th>
                        <th className="py-1.5">Reference</th>
                        <th className="py-1.5">Amount</th>
                        <th className="py-1.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                      {recentPayments.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleOpenTicket()}>
                          <td className="py-2 text-slate-500 font-mono">{item.date}</td>
                          <td className="py-2 text-slate-800 font-medium">{item.ref}</td>
                          <td className="py-2 font-medium">{item.amount}</td>
                          <td className="py-2 text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
