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

  // UBL Approvals
  if (navTab === 'UBL_APPROVALS') {
    const approvals = [
      { id: 'APP-123913', ticket: 'TCK-123913', branch: 'UBL Burki Branch (640)', amount: 'Rs. 98,600', officer: 'Tariq Mehmood (Ops Sanction)', status: 'Approved', date: '11/09/2026', color: 'bg-emerald-100 text-emerald-800' },
      { id: 'APP-126503', ticket: 'TCK-126503', branch: 'UBL Mall Road (0108)', amount: 'Rs. 168,200', officer: 'Zubair Shah (HERE4U Lead)', status: 'Approved', date: '12/09/2026', color: 'bg-emerald-100 text-emerald-800' },
      { id: 'APP-128944', ticket: 'TCK-128944', branch: 'UBL Ferozepur Road (0422)', amount: 'Rs. 67,280', officer: 'Pending Regional Approver', status: 'Under Review', date: '13/09/2026', color: 'bg-amber-100 text-amber-800' },
      { id: 'APP-129100', ticket: 'TCK-129100', branch: 'UBL Gujranwala (0315)', amount: 'Rs. 214,000', officer: 'Accounts Dept Audit', status: 'Pending Sanction', date: '14/09/2026', color: 'bg-rose-100 text-rose-700' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="UBL Approvals & Sanction Letters"
          subtitle="Section 5 official financial approvals received from UBL Operations & Administration."
          badge={approvals.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Approval Ref</th>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Approved Amount</th>
                <th className="py-3 px-4">Bank Sanction Officer</th>
                <th className="py-3 px-4">Approval Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {approvals.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{app.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{app.ticket}</td>
                  <td className="py-3 px-4">{app.branch}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{app.amount}</td>
                  <td className="py-3 px-4">{app.officer}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{app.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${app.color}`}>{app.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      View Job
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

  // Purchase Requests
  if (navTab === 'PURCHASE_REQUESTS') {
    const prs = [
      { id: 'PR-2024-001', job: 'NB-2024-001', branch: 'Burki (640)', items: 'Cement (20 Bags), Sand (1 Trolley), SS Railing (24 Rft)', cost: 'Rs. 42,500', requestedBy: 'Zahid Hussain (Mason)', status: 'Approved', color: 'bg-emerald-100 text-emerald-800' },
      { id: 'PR-2024-002', job: 'NB-2024-002', branch: 'Gujranwala (0315)', items: 'Porcelain Floor Tiles (120 Sft), Tile Bond (8 Bags)', cost: 'Rs. 68,000', requestedBy: 'Imran Ali (Tile Tech)', status: 'PO Issued', color: 'bg-blue-100 text-blue-700' },
      { id: 'PR-2024-003', job: 'NB-2024-004', branch: 'Islamabad (0215)', items: 'PPRC Pipes, CP Fittings, Gate Valves (3 Nos)', cost: 'Rs. 24,000', requestedBy: 'Nasir Abbas (Plumber)', status: 'Pending Approval', color: 'bg-amber-100 text-amber-800' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Purchase Requests & Material Requisitions"
          subtitle="Section 6 site material requests linked to approved job tickets."
          badge={prs.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PR #</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Material / Items Required</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4">Requested By</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {prs.map((pr) => (
                <tr key={pr.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{pr.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{pr.job}</td>
                  <td className="py-3 px-4">{pr.branch}</td>
                  <td className="py-3 px-4 max-w-xs">{pr.items}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{pr.cost}</td>
                  <td className="py-3 px-4 font-medium">{pr.requestedBy}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pr.color}`}>{pr.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
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
    );
  }

  // Procurement & Purchase Orders
  if (navTab === 'PROCUREMENT') {
    const pos = [
      { id: 'PO-2024-001', pr: 'PR-2024-001', vendor: 'Al-Madina Building Materials', amount: 'Rs. 42,500', date: '12/09/2026', delivery: 'Delivered to Site', status: 'Received' },
      { id: 'PO-2024-002', pr: 'PR-2024-002', vendor: 'Master Ceramic & Tiles Ltd', amount: 'Rs. 68,000', date: '13/09/2026', delivery: 'In Transit', status: 'Dispatched' },
      { id: 'PO-2024-003', pr: 'PR-2024-003', vendor: 'Haier Authorized HVAC Parts', amount: 'Rs. 38,000', date: '14/09/2026', delivery: 'Awaiting Pickup', status: 'PO Issued' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Procurement & Purchase Orders"
          subtitle="Direct purchase orders issued to verified vendors with Goods Receipt Notes (GRN)."
          badge={pos.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">PR Ref</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">PO Amount</th>
                <th className="py-3 px-4">Order Date</th>
                <th className="py-3 px-4">Site Delivery</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {pos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{p.id}</td>
                  <td className="py-3 px-4 font-medium">{p.pr}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{p.vendor}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{p.amount}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{p.date}</td>
                  <td className="py-3 px-4 text-slate-600">{p.delivery}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Staff Master
  if (navTab === 'STAFF_MASTER') {
    const staffMembers = [
      { name: 'Muhammad Rashid', trade: 'Senior MEP Electrician', phone: '0312-9876543', city: 'Lahore', status: 'Active on Site', jobs: 3 },
      { name: 'Sajid Mehmood', trade: 'Field Electrician', phone: '0304-5544332', city: 'Lahore', status: 'Active on Site', jobs: 2 },
      { name: 'Muhammad Akram', trade: 'Master Painter & Surface Specialist', phone: '0321-7654321', city: 'Lahore', status: 'Active on Site', jobs: 4 },
      { name: 'Tariq Bashir', trade: 'Commercial Surface Painter', phone: '0345-8877665', city: 'Gujranwala', status: 'Available', jobs: 1 },
      { name: 'Asif Ali', trade: 'HVAC & Chiller Tech', phone: '0333-1122334', city: 'Lahore', status: 'Active on Site', jobs: 5 },
      { name: 'Zahid Hussain', trade: 'Civil Mason & Tile Worker', phone: '0315-4433221', city: 'Lahore', status: 'Active on Site', jobs: 3 },
      { name: 'Engr. Imran', trade: 'Field Project Supervisor', phone: '0300-1234567', city: 'Lahore / Punjab', status: 'On Site Inspection', jobs: 8 },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Staff Master & Field Technicians"
          subtitle="Section 7 trade allocation roster: Electricians, Painters, HVAC techs, and Civil masons."
          badge={staffMembers.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Name</th>
                <th className="py-3 px-4">Trade & Specialization</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Base City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Assigned Jobs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staffMembers.map((s, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3 px-4 font-medium text-slate-700">{s.trade}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{s.phone}</td>
                  <td className="py-3 px-4">{s.city}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{s.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-600 font-mono">{s.jobs} Active</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Staff Assignment
  if (navTab === 'STAFF_ASSIGNMENT') {
    const assignments = [
      { staff: 'Muhammad Rashid (Electrician)', job: 'NB-2024-001', branch: 'UBL Burki (640)', trade: 'Electrical', assignedDate: '14 Dec 2024', status: 'Assigned' },
      { staff: 'Zahid Hussain (Mason)', job: 'NB-2024-001', branch: 'UBL Burki (640)', trade: 'Civil Work', assignedDate: '14 Dec 2024', status: 'Working on Site' },
      { staff: 'Asif Ali (HVAC)', job: 'NB-2024-002', branch: 'UBL Gujranwala (0315)', trade: 'HVAC', assignedDate: '13 Dec 2024', status: 'Survey Done' },
      { staff: 'Muhammad Akram (Painter)', job: 'NB-2024-005', branch: 'UBL Faisalabad (0510)', trade: 'Painting', assignedDate: '12 Dec 2024', status: 'Completed' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Staff Assignment & Work Orders"
          subtitle="Assign qualified technicians to branch tickets with automated SMS / dispatch notifications."
          badge={assignments.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Assigned Job</th>
                <th className="py-3 px-4">Target Branch</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4">Assignment Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {assignments.map((a, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{a.staff}</td>
                  <td className="py-3 px-4 font-semibold text-blue-600">{a.job}</td>
                  <td className="py-3 px-4">{a.branch}</td>
                  <td className="py-3 px-4">{a.trade}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{a.assignedDate}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{a.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
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
    );
  }

  // Staff Attendance & GPS Field
  if (navTab === 'STAFF_ATTENDANCE' || navTab === 'GPS_FIELD') {
    const attendance = [
      { staff: 'Muhammad Rashid', trade: 'Electrician', branch: 'UBL Burki Branch (640)', time: '08:45 AM', gps: 'Verified (14m)', status: 'Present on Site', color: 'bg-emerald-100 text-emerald-800' },
      { staff: 'Zahid Hussain', trade: 'Mason', branch: 'UBL Burki Branch (640)', time: '09:05 AM', gps: 'Verified (18m)', status: 'Present on Site', color: 'bg-emerald-100 text-emerald-800' },
      { staff: 'Asif Ali', trade: 'HVAC Tech', branch: 'UBL Gujranwala (0315)', time: '09:30 AM', gps: 'Verified (24m)', status: 'Present on Site', color: 'bg-emerald-100 text-emerald-800' },
      { staff: 'Tariq Bashir', trade: 'Painter', branch: 'En Route', time: '10:00 AM', gps: 'Traveling', status: 'In Transit', color: 'bg-blue-100 text-blue-700' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title={navTab === 'GPS_FIELD' ? 'GPS Proximity & Field Tracking' : 'Daily Staff Attendance & Roster'}
          subtitle="Real-time geo-fenced check-ins within 200m radius of UBL branch coordinates."
          badge={attendance.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Trade</th>
                <th className="py-3 px-4">Target Branch</th>
                <th className="py-3 px-4">Check-In Time</th>
                <th className="py-3 px-4">GPS Proximity Check</th>
                <th className="py-3 px-4">Attendance State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {attendance.map((att, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{att.staff}</td>
                  <td className="py-3 px-4">{att.trade}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{att.branch}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{att.time}</td>
                  <td className="py-3 px-4 font-medium text-emerald-700">✓ {att.gps}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${att.color}`}>{att.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Vehicles & Travel / Mileage
  if (navTab === 'VEHICLES') {
    const vehicles = [
      { id: 'LEA-4521', type: 'Maintenance Van', assigned: 'Engr. Imran (Supervisor)', startKm: 42100, endKm: 42185, distance: '85 KM', fuel: 'Rs. 2,975', route: 'Garden Town → Burki → Mall Road' },
      { id: 'LHR-8910', type: 'Motorcycle', assigned: 'Muhammad Rashid (Electrician)', startKm: 18230, endKm: 18268, distance: '38 KM', fuel: 'Rs. 950', route: 'Head Office → Ferozepur Road' },
      { id: 'GA-7721', type: 'Motorcycle', assigned: 'Asif Ali (HVAC)', startKm: 12450, endKm: 12512, distance: '62 KM', fuel: 'Rs. 1,550', route: 'Gujranwala Hub → Daska Branch' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Vehicles, Mileage & Fuel Allowances"
          subtitle="Section 14 vehicle logs with automated route calculation and Rs. 35/KM motorcycle / van rates."
          badge={vehicles.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Vehicle No</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Driver / Technician</th>
                <th className="py-3 px-4">Start KM</th>
                <th className="py-3 px-4">End KM</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Fuel Claim</th>
                <th className="py-3 px-4">Branch Route Visited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{v.id}</td>
                  <td className="py-3 px-4">{v.type}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{v.assigned}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{v.startKm}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{v.endKm}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{v.distance}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{v.fuel}</td>
                  <td className="py-3 px-4 text-slate-600">{v.route}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Work Orders & Work Execution
  if (navTab === 'WORK_ORDERS' || navTab === 'WORK_EXECUTION') {
    const workOrders = [
      { id: 'WO-2024-001', job: 'NB-2024-001', branch: 'Burki (640)', scope: 'Ramp Reconstruction & SS Handrail', lead: 'Zahid Hussain', progress: 70, status: 'In Progress' },
      { id: 'WO-2024-002', job: 'NB-2024-002', branch: 'Gujranwala (0315)', scope: 'Banking Hall Tile Replacement', lead: 'Imran Ali', progress: 30, status: 'Material Delivered' },
      { id: 'WO-2024-005', job: 'NB-2024-005', branch: 'Faisalabad (0510)', scope: 'Exterior Elevation Painting', lead: 'Muhammad Akram', progress: 100, status: 'Work Completed' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title={navTab === 'WORK_EXECUTION' ? 'Work Execution & Site Progress' : 'Work Orders Issued to Teams'}
          subtitle="Section 8 & 9 site execution logs with progress percentage and safety compliance."
          badge={workOrders.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">WO Number</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Scope Summary</th>
                <th className="py-3 px-4">Team Lead</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{wo.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{wo.job}</td>
                  <td className="py-3 px-4">{wo.branch}</td>
                  <td className="py-3 px-4 max-w-xs">{wo.scope}</td>
                  <td className="py-3 px-4 font-medium">{wo.lead}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold">{wo.progress}%</span>
                      <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${wo.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">{wo.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
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
    );
  }

  // Work Completion & Ticket Closure
  if (navTab === 'WORK_COMPLETION' || navTab === 'TICKET_CLOSURE') {
    const completions = [
      { id: 'CC-2024-001', job: 'NB-2024-005', branch: 'UBL Faisalabad (0510)', work: 'Exterior Elevation Painting', bomSign: 'Signed & Stamped (Farooq Ahmed BOM)', photos: 'Before / After Verified', status: 'Ready for Invoicing' },
      { id: 'CC-2024-002', job: 'NB-2024-001', branch: 'UBL Burki (640)', work: 'Anti-Slip Masonry Ramp Reconstruction', bomSign: 'Signed & Stamped (Ali yousaf BOM)', photos: 'Before / After Verified', status: 'Closed' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title={navTab === 'TICKET_CLOSURE' ? 'Ticket Closure & Quality Sign-Off' : 'Work Completion Certificates'}
          subtitle="Section 10 completion certificates signed & stamped by Branch Operations Managers."
          badge={completions.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Certificate #</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Work Performed</th>
                <th className="py-3 px-4">Branch Manager Sign-Off</th>
                <th className="py-3 px-4">Audit Photos</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {completions.map((cc) => (
                <tr key={cc.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{cc.id}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{cc.job}</td>
                  <td className="py-3 px-4">{cc.branch}</td>
                  <td className="py-3 px-4 max-w-xs">{cc.work}</td>
                  <td className="py-3 px-4 font-medium text-emerald-800">✓ {cc.bomSign}</td>
                  <td className="py-3 px-4 text-slate-600">{cc.photos}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{cc.status}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      View Dossier
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

  // Tax Deduction, UBL Account Submission, Bank Receipt & Payment Allocation
  if (navTab === 'TAX_DEDUCTION' || navTab === 'UBL_ACCOUNT_SUBMISSION' || navTab === 'BANK_RECEIPT' || navTab === 'PAYMENT_ALLOCATION') {
    const receipts = [
      { ref: 'UBL-TRF-001', date: '12 Dec 2024', amount: 'Rs. 650,000', praTax: 'Rs. 104,000 (16%)', wht: 'Rs. 91,000 (14%)', net: 'Rs. 455,000', account: 'Naeem Builder A/C # 12049210', status: 'Allocated' },
      { ref: 'UBL-TRF-002', date: '10 Dec 2024', amount: 'Rs. 420,000', praTax: 'Rs. 67,200 (16%)', wht: 'Rs. 58,800 (14%)', net: 'Rs. 294,000', account: 'Naeem Builder A/C # 12049210', status: 'Allocated' },
      { ref: 'UBL-TRF-003', date: '05 Dec 2024', amount: 'Rs. 780,000', praTax: 'Rs. 124,800 (16%)', wht: 'Rs. 109,200 (14%)', net: 'Rs. 546,000', account: 'Naeem Builder A/C # 12049210', status: 'Pending Allocation' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title={navTab === 'TAX_DEDUCTION' ? 'Tax Deduction & Withholding (PRA / SRB)' : navTab === 'BANK_RECEIPT' ? 'Bank Receipts & UBL Payments' : navTab === 'PAYMENT_ALLOCATION' ? 'Payment Allocation & Ledger' : 'UBL Account Office Dossier Submissions'}
          subtitle="Section 12, 13 & 15 financial settlement: 16% PRA withholding tax certificates, FBR credit advice, and online bank payments."
          badge={receipts.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transfer Reference</th>
                <th className="py-3 px-4">Payment Date</th>
                <th className="py-3 px-4">Gross Billed</th>
                <th className="py-3 px-4">PRA 16% Withheld</th>
                <th className="py-3 px-4">Income Tax 14% WHT</th>
                <th className="py-3 px-4">Net Deposited</th>
                <th className="py-3 px-4">Beneficiary Bank Account</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {receipts.map((r) => (
                <tr key={r.ref} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{r.ref}</td>
                  <td className="py-3 px-4 text-slate-500 font-mono">{r.date}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{r.amount}</td>
                  <td className="py-3 px-4 text-rose-700 font-medium">{r.praTax}</td>
                  <td className="py-3 px-4 text-rose-700 font-medium">{r.wht}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{r.net}</td>
                  <td className="py-3 px-4 text-slate-600">{r.account}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Job Expenses, Staff Advances & Expense Approval
  if (navTab === 'JOB_EXPENSES' || navTab === 'STAFF_ADVANCES' || navTab === 'EXPENSE_APPROVAL') {
    const claims = [
      { id: 'EXP-101', staff: 'Muhammad Rashid', job: 'NB-2024-001', branch: 'Burki (640)', category: 'Local Consumables (PVC Tape, Screws)', amount: 'Rs. 1,450', receipt: 'Voucher Attached', status: 'Approved' },
      { id: 'EXP-102', staff: 'Zahid Hussain', job: 'NB-2024-001', branch: 'Burki (640)', category: 'Masonry Tools & Drill Bits', amount: 'Rs. 3,200', receipt: 'Receipt # 4410', status: 'Approved' },
      { id: 'EXP-103', staff: 'Asif Ali', job: 'NB-2024-002', branch: 'Gujranwala (0315)', category: 'Emergency Refrigerant Gas R410A', amount: 'Rs. 8,500', receipt: 'Invoice Attached', status: 'Pending Approval' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title={navTab === 'STAFF_ADVANCES' ? 'Staff Advances & Petty Cash' : navTab === 'EXPENSE_APPROVAL' ? 'Expense Claim Approval Center' : 'Field Job Expenses & Direct Costs'}
          subtitle="Section 14 job expenses audited against site photo receipts and technician vouchers."
          badge={claims.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Expense ID</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Category & Purpose</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Audit Proof</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {claims.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-blue-600 font-mono">{c.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{c.staff}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{c.job}</td>
                  <td className="py-3 px-4">{c.branch}</td>
                  <td className="py-3 px-4">{c.category}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{c.amount}</td>
                  <td className="py-3 px-4 text-slate-500">{c.receipt}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Documents Repository
  if (navTab === 'DOCUMENTS') {
    const docs = [
      { name: 'Official Quotation # Q-2024-123913.pdf', type: 'Official Estimate', size: '245 KB', date: '11/09/2026', branch: 'Burki Branch (640)' },
      { name: 'Delivery Note DN-2024-001 (Branch Stamped).pdf', type: 'Delivery Note', size: '410 KB', date: '14/09/2026', branch: 'Burki Branch (640)' },
      { name: 'Completion Certificate CC-2024-001.pdf', type: 'Completion Certificate', size: '180 KB', date: '14/09/2026', branch: 'Faisalabad Branch (0510)' },
      { name: 'Sales Tax Invoice INV-1001.pdf', type: 'Tax Invoice', size: '320 KB', date: '14/09/2026', branch: 'Burki Branch (640)' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Documents & PDF Repository"
          subtitle="All generated official documents with Naeem Builder letterhead, NTN/STRN, and branch manager stamps."
          badge={docs.length}
          onBack={onBackToDashboard}
        />
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {docs.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">{d.type}</td>
                  <td className="py-3 px-4">{d.branch}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{d.size}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{d.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => tickets[0] && onSelectTicket(tickets[0].id)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer"
                    >
                      Open PDF
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

  // Notifications & Audit Trail
  if (navTab === 'NOTIFICATIONS') {
    const alerts = [
      { action: 'Delivery Note Stamped', desc: 'BOM Ali yousaf signed & stamped hard copy for Burki Branch 640.', time: '10 mins ago', type: 'info' },
      { action: 'Quotation Approved', desc: 'UBL Operations approved Estimate # Q-2024-123913 for Rs. 98,600.', time: '1 hour ago', type: 'success' },
      { action: 'GPS Check-In Verified', desc: 'Muhammad Rashid checked in within 14m of Burki Branch coordinates.', time: '2 hours ago', type: 'gps' },
      { action: 'New Complaint Parsed', desc: 'Auto-parsed Complaint #126503 from here4u@ubl.com.pk (Mall Road 0108).', time: 'Yesterday', type: 'ticket' },
    ];

    return (
      <div className="space-y-4">
        <SubViewHeader
          title="Notifications & System Audit Trail"
          subtitle="Section 16 immutable audit log recording all workflow transitions, GPS events, and approvals."
          badge={alerts.length}
          onBack={onBackToDashboard}
        />
        <div className="space-y-2.5">
          {alerts.map((al, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">{al.action}</div>
                  <div className="text-xs text-slate-500">{al.desc}</div>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono shrink-0">{al.time}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
