import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowLeft,
  PlusCircle,
  FileText,
  Mail,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Compass,
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
  Bell,
  Eye,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Ticket, TicketStatus } from '../../types/erp';
import { SimpleNavTab } from './SimpleERPLayout';
import { BranchMasterView } from '../branches/BranchMasterView';
import { ConsolidatedInvoicesView } from './ConsolidatedInvoicesView';
import { AnalyticsDashboard } from '../analytics/AnalyticsDashboard';
import { AdminPanelView } from '../admin/AdminPanelView';
import { VendorCostReport } from '../analytics/VendorCostReport';

interface SubViewHeaderProps {
  title: string;
  subtitle: string;
  badge?: string | number;
  onBack: () => void;
  actionButton?: React.ReactNode;
}

export const SubViewHeader: React.FC<SubViewHeaderProps> = ({
  title,
  subtitle,
  badge,
  onBack,
  actionButton,
}) => (
  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>
        <span className="text-slate-300">/</span>
        <span className="text-xs text-slate-500 font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <h2 className="text-xl sm:text-2xl font-black text-[#003366] tracking-tight">{title}</h2>
        {badge !== undefined && (
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
    </div>
    {actionButton && <div className="shrink-0">{actionButton}</div>}
  </div>
);

interface SimpleSubViewProps {
  navTab: SimpleNavTab;
  onBackToDashboard: () => void;
  onSelectTicket: (ticketId: string) => void;
  onOpenNewTicket: () => void;
}

export const SimpleSubViewRouter: React.FC<SimpleSubViewProps> = ({
  navTab,
  onBackToDashboard,
  onSelectTicket,
  onOpenNewTicket,
}) => {
  const { tickets, branches, expenses, auditLogs } = useERP();
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Branch Master
  if (navTab === 'BRANCH_MASTER') {
    return (
      <div className="space-y-4">
        <SubViewHeader
          title="UBL Branch Master Directory"
          subtitle="All 30+ official United Bank Limited branch codes, BOM contacts, and verified GPS coordinates."
          badge={branches.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <BranchMasterView onSelectTicket={onSelectTicket} />
        </div>
      </div>
    );
  }

  // Consolidated Billing
  if (navTab === 'CONSOLIDATED_BILLING') {
    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Consolidated Billing & Batch Invoicing"
          subtitle="Group multiple branch delivery notes into official UBL consolidated invoices with sales tax breakdown."
          onBack={onBackToDashboard}
        />
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <ConsolidatedInvoicesView onSelectTicket={onSelectTicket} />
        </div>
      </div>
    );
  }

  // Reports
  if (navTab === 'REPORTS') {
    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Operations & Financial Reports"
          subtitle="Performance metrics, branch volume distribution, and revenue graphs."
          onBack={onBackToDashboard}
        />
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-4">
          <AnalyticsDashboard onSelectTicket={onSelectTicket} />
        </div>
      </div>
    );
  }

  // Admin
  if (navTab === 'ADMINISTRATION') {
    return (
      <div className="space-y-4">
        <SubViewHeader
          title="System Administration & Staff Roles"
          subtitle="Manage user roles, rate schedules, and system security parameters."
          onBack={onBackToDashboard}
        />
        <div className="bg-slate-950 text-slate-100 rounded-xl shadow-sm border border-slate-800 p-4">
          <AdminPanelView />
        </div>
      </div>
    );
  }

  // Job Costing
  if (navTab === 'JOB_COSTING' || navTab === 'VENDOR_MASTER') {
    return (
      <div className="space-y-4">
        <SubViewHeader
          title={navTab === 'JOB_COSTING' ? 'Job Costing & Profit Margin Analysis' : 'Approved Vendor Master & Materials'}
          subtitle={navTab === 'JOB_COSTING' ? 'Compare quotes against direct material, labor, and transport expenses.' : 'Verified material suppliers for civil, electrical, HVAC, and paint items.'}
          onBack={onBackToDashboard}
        />
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-4">
          <VendorCostReport onSelectTicket={onSelectTicket} />
        </div>
      </div>
    );
  }

  // UBL Requests / Tickets View
  if (navTab === 'UBL_REQUESTS') {
    const filteredTickets = tickets.filter((t) => {
      const matchesSearch =
        t.ticketNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
        t.branchName.toLowerCase().includes(filterQuery.toLowerCase()) ||
        (t.ublBranchCode && t.ublBranchCode.includes(filterQuery));
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="UBL Requests / Tickets"
          subtitle="Manage maintenance calls, dispatching, and resolution workflows across all UBL branches."
          badge={tickets.length}
          onBack={onBackToDashboard}
          actionButton={
            <button
              onClick={onOpenNewTicket}
              className="px-3.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ New Job Ticket</span>
            </button>
          }
        />

        {/* Filter Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by ticket #, branch, or issue..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses ({tickets.length})</option>
              <option value="New / Open">New / Open</option>
              <option value="Site Visit Scheduled">Site Visit Scheduled</option>
              <option value="Quotation Sent">Quotation Sent</option>
              <option value="Approved">Approved</option>
              <option value="Work In Progress">Work In Progress</option>
              <option value="Invoiced">Invoiced</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket No.</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Complaint / Work Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">BOM Contact</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600 font-mono">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{t.branchName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Code: {t.ublBranchCode || '640'}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 line-clamp-1">{t.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1">{t.scopeDescription}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {t.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{t.reportedBy}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{t.reportedByContact || '0326-8250640'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : t.priority === 'Emergency'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectTicket(t.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#003366] hover:bg-[#002244] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        View Ticket
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Gmail / Email Threads View
  if (navTab === 'GMAIL_THREADS') {
    const emailThreads = [
      {
        id: 'GML-123913',
        subject: 'Complaint No 123913 Assignment - BURKI Branch (Code: 640)',
        from: 'here4u@ubl.com.pk',
        date: '09/09/2026 13:36:38',
        branch: 'UBL Burki Branch Lahore Cantt',
        bom: 'Ali yousaf (BOM)',
        desc: 'ramp repairing work required. Anti-slip masonry ramp reconstruction with safety slope gradient and stainless steel grab rail anchoring per UBL branch standard.',
        ticketRef: tickets[0]?.id || 'TCK-123913',
      },
      {
        id: 'GML-126503',
        subject: 'Complaint No 126503 Assignment - MALL ROAD Branch (Code: 0108)',
        from: 'here4u@ubl.com.pk',
        date: '10/09/2026 10:15:20',
        branch: 'UBL Mall Road Branch Lahore',
        bom: 'Muhammad Tariq (BOM)',
        desc: 'ATM vestibule door glass replacement and magnetic lock rewiring. Urgently required for security compliance.',
        ticketRef: tickets[1]?.id || tickets[0]?.id,
      },
      {
        id: 'GML-128944',
        subject: 'Urgent AC Inverter Leakage - FEROZEPUR ROAD Branch (Code: 0422)',
        from: 'here4u@ubl.com.pk',
        date: '12/09/2026 15:45:10',
        branch: 'UBL Ferozepur Road Branch Lahore',
        bom: 'Sajid Mahmood (BOM)',
        desc: 'Server room 2-ton inverter tripping on high pressure. Copper piping pressure test and gas refilling required.',
        ticketRef: tickets[2]?.id || tickets[0]?.id,
      },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Gmail / Bank Complaint Email Threads"
          subtitle="Official dispatch messages received from here4u@ubl.com.pk parsed directly into ERP job records."
          badge={emailThreads.length}
          onBack={onBackToDashboard}
        />
        <div className="space-y-3">
          {emailThreads.map((thread) => (
            <div key={thread.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{thread.subject}</h3>
                    <p className="text-xs text-slate-500">
                      From: <strong className="text-slate-700">{thread.from}</strong> • {thread.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectTicket(thread.ticketRef)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors self-start sm:self-auto cursor-pointer"
                >
                  Open Linked Ticket
                </button>
              </div>
              <div className="pt-3 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg mt-2 font-mono">
                {thread.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Delivery Notes View
  if (navTab === 'DELIVERY_NOTES') {
    const deliveryNotes = [
      {
        dnNumber: 'DN-2024-001',
        jobId: 'NB-2024-001',
        branch: 'UBL Burki Branch (640)',
        date: '14 Dec 2024',
        work: 'Ramp Repairing & SS Railing Installation',
        bom: 'Ali yousaf (BOM)',
        status: 'Stamped & Signed',
        statusColor: 'bg-emerald-100 text-emerald-800',
        custody: 'Uploaded to Gmail Thread & Physical Copied to Office',
        ticketRef: tickets[0]?.id,
      },
      {
        dnNumber: 'DN-2024-002',
        jobId: 'NB-2024-002',
        branch: 'UBL Gujranwala Branch (0315)',
        date: '13 Dec 2024',
        work: 'Main Hall Floor Tile Replacement',
        bom: 'Rashid Khan (BOM)',
        status: 'Awaiting Physical Stamp',
        statusColor: 'bg-amber-100 text-amber-800',
        custody: 'Field Staff on Site with Hard Copy',
        ticketRef: tickets[1]?.id || tickets[0]?.id,
      },
      {
        dnNumber: 'DN-2024-003',
        jobId: 'NB-2024-005',
        branch: 'UBL Faisalabad Branch (0510)',
        date: '12 Dec 2024',
        work: 'Exterior Signage & Painting',
        bom: 'Farooq Ahmed (BOM)',
        status: 'Stamped & Signed',
        statusColor: 'bg-emerald-100 text-emerald-800',
        custody: 'Deposited to Accounts Department',
        ticketRef: tickets[0]?.id,
      },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Delivery Notes & Branch Manager Stamping"
          subtitle="Section 9 & 10 dual-path physical custody: Branch Manager sign & stamp, scan to Gmail, and office deposit."
          badge={deliveryNotes.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">DN Number</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Work Completed</th>
                <th className="py-3 px-4">Branch Manager</th>
                <th className="py-3 px-4">Stamp Status</th>
                <th className="py-3 px-4">Physical Custody</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {deliveryNotes.map((dn) => (
                <tr key={dn.dnNumber} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{dn.dnNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{dn.jobId}</td>
                  <td className="py-3 px-4">{dn.branch}</td>
                  <td className="py-3 px-4 max-w-xs">{dn.work}</td>
                  <td className="py-3 px-4 font-medium">{dn.bom}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${dn.statusColor}`}>
                      {dn.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">{dn.custody}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => dn.ticketRef && onSelectTicket(dn.ticketRef)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm cursor-pointer"
                    >
                      View Note
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Individual Invoices View
  if (navTab === 'INDIVIDUAL_INVOICES') {
    const invoices = [
      { id: 'INV-1001', job: 'NB-2024-005', branch: 'UBL Burki Branch (640)', date: '14 Dec 2024', amount: 'Rs. 185,000', gst: 'Rs. 29,600', total: 'Rs. 214,600', status: 'Submitted to UBL', color: 'bg-blue-100 text-blue-700' },
      { id: 'INV-1002', job: 'NB-2024-004', branch: 'UBL Islamabad Branch (0215)', date: '12 Dec 2024', amount: 'Rs. 220,000', gst: 'Rs. 35,200', total: 'Rs. 255,200', status: 'Under Approval', color: 'bg-amber-100 text-amber-800' },
      { id: 'INV-1003', job: 'NB-2024-002', branch: 'UBL Gujranwala Branch (0315)', date: '10 Dec 2024', amount: 'Rs. 145,000', gst: 'Rs. 23,200', total: 'Rs. 168,200', status: 'Draft Prepared', color: 'bg-slate-100 text-slate-700' },
      { id: 'INV-1004', job: 'NB-2024-001', branch: 'UBL Mall Road Branch (0108)', date: '05 Dec 2024', amount: 'Rs. 95,000', gst: 'Rs. 15,200', total: 'Rs. 110,200', status: 'Payment Received', color: 'bg-emerald-100 text-emerald-800' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Individual Invoices & Sales Tax"
          subtitle="Official Sales Tax Invoices submitted per UBL branch with 16% PRA sales tax calculations."
          badge={invoices.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Invoice No.</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Net Amount</th>
                <th className="py-3 px-4">PRA GST (16%)</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{inv.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{inv.job}</td>
                  <td className="py-3 px-4">{inv.branch}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{inv.date}</td>
                  <td className="py-3 px-4 font-medium">{inv.amount}</td>
                  <td className="py-3 px-4 font-medium text-slate-500">{inv.gst}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.total}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${inv.color}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-[#003366] hover:bg-[#002244] text-white font-semibold text-xs shadow-sm cursor-pointer"
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Site Visits / Survey View
  if (navTab === 'SITE_VISITS') {
    const visits = [
      { time: '09:00 AM', jobId: 'NB-2024-010', branch: 'UBL Burki Branch (640)', staff: 'Engr. Imran (Civil)', gps: 'Verified (14m to branch)', status: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
      { time: '11:30 AM', jobId: 'NB-2024-012', branch: 'UBL Gujranwala City (0315)', staff: 'Asif Ali (HVAC)', gps: 'Verified (22m to branch)', status: 'In Progress', color: 'bg-blue-100 text-blue-700' },
      { time: '02:00 PM', jobId: 'NB-2024-015', branch: 'UBL Rawalpindi Hub (0810)', staff: 'Engr. Bilal (Electrical)', gps: 'En Route', status: 'Scheduled', color: 'bg-amber-100 text-amber-800' },
      { time: '04:30 PM', jobId: 'NB-2024-018', branch: 'UBL Ferozepur Road (0422)', staff: 'Muhammad Rashid (Electrician)', gps: 'Scheduled', status: 'Scheduled', color: 'bg-amber-100 text-amber-800' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Site Visits & GPS Field Surveys"
          subtitle="Section 3 field inspection protocol: On-site verification, measurements, pre-work photo logs, and GPS proximity checks."
          badge={visits.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Visiting Staff</th>
                <th className="py-3 px-4">GPS Proximity Audit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {visits.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono text-slate-500">{v.time}</td>
                  <td className="py-3 px-4 font-bold text-blue-600">{v.jobId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{v.branch}</td>
                  <td className="py-3 px-4 font-medium">{v.staff}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      <Navigation className="w-3 h-3 text-emerald-600" />
                      {v.gps}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.color}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      View Survey
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Estimates & Quotations View
  if (navTab === 'ESTIMATES') {
    const estimates = [
      { qNo: 'Q-2024-123913', job: 'NB-2024-001', branch: 'UBL Burki Branch (640)', trade: 'Civil & Masonry', boqItems: 4, subtotal: 'Rs. 85,000', praTax: 'Rs. 13,600', total: 'Rs. 98,600', status: 'Approved by UBL' },
      { qNo: 'Q-2024-126503', job: 'NB-2024-002', branch: 'UBL Gujranwala Branch (0315)', trade: 'Civil & Flooring', boqItems: 6, subtotal: 'Rs. 145,000', praTax: 'Rs. 23,200', total: 'Rs. 168,200', status: 'Sent to Operations' },
      { qNo: 'Q-2024-128944', job: 'NB-2024-003', branch: 'UBL Ferozepur Road (0422)', trade: 'HVAC & AC Service', boqItems: 3, subtotal: 'Rs. 58,000', praTax: 'Rs. 9,280', total: 'Rs. 67,280', status: 'Internal Draft' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Estimates & Official Quotations"
          subtitle="Section 5 official quotations formatted for UBL Operations with Itemized BOQs, master schedule rates, and PRA 16% taxes."
          badge={estimates.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Quotation #</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Trade Scope</th>
                <th className="py-3 px-4">BOQ Items</th>
                <th className="py-3 px-4">Subtotal</th>
                <th className="py-3 px-4">PRA (16%)</th>
                <th className="py-3 px-4">Grand Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {estimates.map((q) => (
                <tr key={q.qNo} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{q.qNo}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{q.job}</td>
                  <td className="py-3 px-4">{q.branch}</td>
                  <td className="py-3 px-4 font-medium">{q.trade}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{q.boqItems} items</td>
                  <td className="py-3 px-4">{q.subtotal}</td>
                  <td className="py-3 px-4 text-slate-500">{q.praTax}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{q.total}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      View Quotation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Generic SubView for all remaining operational sections
  return (
    <div className="space-y-4">
      <SubViewHeader
        title={navTab.replace(/_/g, ' ')}
        subtitle={`Operational management for ${navTab.replace(/_/g, ' ').toLowerCase()} within Naeem Builder HERE4U ERP.`}
        onBack={onBackToDashboard}
      />
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#003366] flex items-center justify-center mx-auto mb-3">
          <FileText className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">{navTab.replace(/_/g, ' ')} Active Operations</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
          All records, assignments, and approvals for this module are synchronized with the central database and UBL branch network.
        </p>
        <button
          onClick={onBackToDashboard}
          className="px-4 py-2 rounded-lg bg-[#003366] hover:bg-[#002244] text-white text-xs font-semibold cursor-pointer shadow"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};
