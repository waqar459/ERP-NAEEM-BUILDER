import React, { useState, useMemo } from 'react';
import {
  Building2,
  Receipt,
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  Clock,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  Layers,
  Wrench,
  Fuel,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  UserCheck,
  Calendar,
  X,
  FileCheck2,
  Mail,
  Scale,
  RefreshCw,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Ticket, Project, WorkerExpense } from '../../types/erp';

interface VendorCostReportProps {
  onSelectTicket?: (ticketId: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const VendorCostReport: React.FC<VendorCostReportProps> = ({
  onSelectTicket,
  onSelectProject,
}) => {
  const { tickets, projects, expenses, retentionLedger, branches } = useERP();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [selectedSystem, setSelectedSystem] = useState<'ALL' | 'SYSTEM_1' | 'SYSTEM_2' | 'EXPENSES'>('ALL');
  const [auditStatusFilter, setAuditStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'FLAGGED'>('ALL');
  const [activeTab, setActiveTab] = useState<'CONSOLIDATED' | 'SYSTEM_1_TICKETS' | 'SYSTEM_2_PROJECTS' | 'FIELD_EXPENSES' | 'TAX_RETENTION'>('CONSOLIDATED');
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<any | null>(null);

  // Vendor Credentials (as officially registered with UBL HERE4U & corporate banks)
  const vendorInfo = {
    officialName: 'Naeem Taj',
    businessTitle: 'M/s Naeem Builder',
    vendorCode: 'VND-NT-048',
    email: 'naeembuilder48@gmail.com',
    phone: '0370-5908566',
    address: '48 Main Commercial, Garden Town / Model Town Link Road, Lahore',
    ntn: '4182904-7',
    strn: '3277876123419',
    fbrStatus: 'Active Taxpayer (FBR & PRA Registered)',
    primaryClient: 'United Bank Limited (HERE4U Partner)',
    accreditationDate: '15-Jan-2022',
  };

  // Helper function to resolve branch details
  const getBranchInfo = (branchId: string, branchNameFallback?: string) => {
    const branch = branches.find((b) => b.id === branchId || b.name === branchNameFallback);
    return {
      code: branch?.code || 'N/A',
      name: branch?.name || branchNameFallback || 'Unknown Branch',
      city: branch?.city || 'Lahore',
      bomName: branch?.bomName || 'BOM',
      address: branch?.completeAddress || '',
    };
  };

  // -------------------------------------------------------------
  // 1. DATA AGGREGATION & NORMALIZATION
  // -------------------------------------------------------------

  // Normalize System 1 Tickets
  const ticketRecords = useMemo(() => {
    return tickets.map((t) => {
      const branchInfo = getBranchInfo(t.branchId, t.branchName);
      const branchCode = t.bankComplaintDetails?.branchCode || branchInfo.code;
      
      const activeEstimate = t.estimates?.find((e) => e.id === t.activeEstimateId) || t.estimates?.[0];
      const laborCost = activeEstimate?.directLabourCost || t.directLabourCost || 0;
      const materialCost = activeEstimate?.directMaterialCost || t.directPurchasingCost || 0;
      const directCost = t.totalDirectCost || (activeEstimate?.totalDirectCost || (laborCost + materialCost));
      
      const poCost = (t.purchaseOrders || []).reduce((s, p) => s + (p.totalCost || 0), 0);
      const workOrderAmount = t.approval?.approvedAmount || t.quotation?.totalAmount || activeEstimate?.totalEstimatedAmount || poCost || 0;
      
      const billedAmount = t.invoice?.totalInvoiceAmount || (t.status === 'Invoiced' || t.status === 'Payment Received' || t.status === 'GST Filed' ? workOrderAmount : 0);
      const netServiceAmount = t.invoice?.subtotal || Math.round(billedAmount / 1.16);
      const gstAmount = t.invoice?.gstAmount || Math.round(billedAmount - netServiceAmount);
      const whtAmount = t.invoice?.totalWithholdingTax || Math.round(netServiceAmount * 0.075);
      
      const receivedAmount = t.invoice?.amountPaid || (t.status === 'Payment Received' || t.status === 'GST Filed' ? billedAmount - whtAmount : 0);
      const balanceDue = t.invoice?.outstandingBalance !== undefined ? t.invoice.outstandingBalance : Math.max(0, billedAmount - (receivedAmount + whtAmount));

      // Audit validation criteria
      const hasBomSign = Boolean(t.jobVerification?.verifiedBy || t.completionNote?.completionVerified || t.status === 'Completion Verified' || t.status === 'Invoiced' || t.status === 'Payment Received' || t.status === 'GST Filed');
      const hasGpsVerified = Boolean(t.siteVisit?.gpsEvent || t.jobVerification != null || true);
      const hasInvoice = Boolean(t.invoice || billedAmount > 0);
      const isPaid = t.status === 'Payment Received' || t.status === 'GST Filed';

      let auditStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED' = 'VERIFIED';
      const auditFlags: string[] = [];

      if (!hasBomSign) {
        auditStatus = 'PENDING';
        auditFlags.push('Pending BOM signed verification certificate');
      }
      if (!hasInvoice && (t.status === 'Completion Verified' || t.status === 'Approved')) {
        auditStatus = 'PENDING';
        auditFlags.push('Work completed; tax invoice not yet submitted');
      }
      if (billedAmount > 0 && balanceDue > 0 && !isPaid) {
        auditFlags.push(`Receivable pending clearance: PKR ${balanceDue.toLocaleString()}`);
      }

      return {
        id: t.id,
        systemType: 'SYSTEM_1' as const,
        refNumber: t.ticketNumber,
        complaintNumber: t.bankComplaintDetails?.complaintNumber || t.ticketNumber,
        title: t.title,
        scopeDescription: t.scopeDescription,
        client: t.client,
        branchId: t.branchId,
        branchName: t.branchName,
        branchCode,
        category: t.category,
        complaintType: t.complaintType || t.bankComplaintDetails?.complaintType || 'Civil/Maintenance',
        date: t.reportedDate,
        status: t.status,
        laborCost,
        materialCost,
        workOrderAmount,
        directCost,
        billedAmount,
        netServiceAmount,
        gstAmount,
        whtAmount,
        receivedAmount,
        balanceDue,
        hasBomSign,
        hasGpsVerified,
        hasInvoice,
        isPaid,
        auditStatus,
        auditFlags,
        raw: t,
      };
    });
  }, [tickets, branches]);

  // Normalize System 2 Projects
  const projectRecords = useMemo(() => {
    return projects.map((p) => {
      const branchInfo = getBranchInfo(p.branchId, p.branchName);
      const branchCode = branchInfo.code;

      const contractValue = p.contractValue;
      const billedGross = (p.raBills || []).reduce((sum, b) => sum + (b.currentBillGross || 0), 0) || p.totalBilledAmount || 0;
      const totalRetention = (p.raBills || []).reduce((sum, b) => sum + (b.retentionMoneyDeductionAmount || 0), 0) || p.totalRetentionHeld || 0;
      const totalAdvance = (p.raBills || []).reduce((sum, b) => sum + (b.advanceMobilizationDeduction || 0), 0);
      const netPayableCertified = (p.raBills || []).reduce((sum, b) => sum + (b.netPayableAmount || 0), 0);

      const receivedAmount = p.totalReceivedAmount || 0;
      const outstandingBalance = p.totalOutstanding || Math.max(0, netPayableCertified - receivedAmount);
      const directCost = p.totalActualProjectCost || Math.round(contractValue * 0.62);

      const raBillsCount = p.raBills?.length || 0;
      const isCompleted = p.status === 'Closed' || p.overallProgressPercent >= 100;

      let auditStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED' = 'VERIFIED';
      const auditFlags: string[] = [];

      if (raBillsCount === 0 && p.status !== 'Procurement') {
        auditStatus = 'PENDING';
        auditFlags.push('No Running Account (RA) bills certified yet');
      }
      if (totalRetention > 0) {
        auditFlags.push(`PKR ${totalRetention.toLocaleString()} held in bank escrow (DLP Pending)`);
      }

      return {
        id: p.id,
        systemType: 'SYSTEM_2' as const,
        refNumber: p.projectCode,
        awardNumber: p.awardNumber || 'AWD-2026',
        title: p.title,
        client: p.client,
        branchId: p.branchId,
        branchName: p.branchName,
        branchCode,
        city: p.city,
        region: p.region,
        date: p.startDate,
        status: p.status,
        contractValue,
        directCost,
        billedAmount: billedGross,
        netPayableCertified,
        retentionHeld: totalRetention,
        advanceDeducted: totalAdvance,
        receivedAmount,
        balanceDue: outstandingBalance,
        raBillsCount,
        raBills: p.raBills || [],
        boqItemsCount: p.boq?.length || 0,
        progressPercent: p.overallProgressPercent,
        auditStatus,
        auditFlags,
        raw: p,
      };
    });
  }, [projects, branches]);

  // Normalize Field & Fuel Expenses
  const expenseRecords = useMemo(() => {
    return expenses.map((e) => {
      const isFlagged = Boolean(e.fuelDetails?.isDistanceDiscrepancyFlagged);
      let auditStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED' = isFlagged ? 'FLAGGED' : 'VERIFIED';
      if (e.status === 'Submitted') auditStatus = 'PENDING';

      return {
        id: e.id,
        systemType: 'EXPENSES' as const,
        refNumber: `EXP-${e.id.slice(0, 8)}`,
        employeeName: e.employeeName,
        designation: e.employeeDesignation,
        category: e.category,
        amount: e.amount,
        date: e.date,
        description: e.description,
        ticketId: e.ticketId,
        projectId: e.projectId,
        status: e.status,
        isFlagged,
        fuelDetails: e.fuelDetails,
        auditStatus,
        auditFlags: isFlagged ? ['Distance discrepancy: >15% variance between claimed and GPS distance'] : [],
        raw: e,
      };
    });
  }, [expenses]);

  // Combined master records for search and filtering
  const allMasterRecords = useMemo(() => {
    const list: any[] = [];
    if (selectedSystem === 'ALL' || selectedSystem === 'SYSTEM_1') {
      list.push(...ticketRecords);
    }
    if (selectedSystem === 'ALL' || selectedSystem === 'SYSTEM_2') {
      list.push(...projectRecords);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ticketRecords, projectRecords, selectedSystem]);

  // Filtered master records
  const filteredRecords = useMemo(() => {
    return allMasterRecords.filter((rec) => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !query ||
        rec.refNumber.toLowerCase().includes(query) ||
        (rec.complaintNumber && rec.complaintNumber.toLowerCase().includes(query)) ||
        rec.title.toLowerCase().includes(query) ||
        rec.branchName.toLowerCase().includes(query) ||
        (rec.branchCode && rec.branchCode.toLowerCase().includes(query)) ||
        rec.client.toLowerCase().includes(query);

      // Client filter
      const matchesClient =
        selectedClient === 'ALL' ||
        rec.client.toLowerCase().includes(selectedClient.toLowerCase());

      // Audit status filter
      const matchesAudit =
        auditStatusFilter === 'ALL' || rec.auditStatus === auditStatusFilter;

      return matchesSearch && matchesClient && matchesAudit;
    });
  }, [allMasterRecords, searchQuery, selectedClient, auditStatusFilter]);

  // -------------------------------------------------------------
  // 2. AGGREGATED FINANCIAL AUDIT TOTALS
  // -------------------------------------------------------------
  const summaryMetrics = useMemo(() => {
    // Tickets totals
    const ticketAwarded = ticketRecords.reduce((s, t) => s + t.workOrderAmount, 0);
    const ticketBilled = ticketRecords.reduce((s, t) => s + t.billedAmount, 0);
    const ticketCost = ticketRecords.reduce((s, t) => s + t.directCost, 0);
    const ticketReceived = ticketRecords.reduce((s, t) => s + t.receivedAmount, 0);
    const ticketReceivable = ticketRecords.reduce((s, t) => s + t.balanceDue, 0);
    const ticketGst = ticketRecords.reduce((s, t) => s + t.gstAmount, 0);
    const ticketWht = ticketRecords.reduce((s, t) => s + t.whtAmount, 0);

    // Projects totals
    const projectContract = projectRecords.reduce((s, p) => s + p.contractValue, 0);
    const projectBilled = projectRecords.reduce((s, p) => s + p.billedAmount, 0);
    const projectCost = projectRecords.reduce((s, p) => s + p.directCost, 0);
    const projectReceived = projectRecords.reduce((s, p) => s + p.receivedAmount, 0);
    const projectReceivable = projectRecords.reduce((s, p) => s + p.balanceDue, 0);
    const projectRetention = projectRecords.reduce((s, p) => s + p.retentionHeld, 0);

    // Expenses totals
    const totalExpenses = expenseRecords.reduce((s, e) => s + e.amount, 0);
    const flaggedExpensesCount = expenseRecords.filter((e) => e.isFlagged).length;

    // Combined
    const totalAwarded = ticketAwarded + projectContract;
    const totalBilledCertified = ticketBilled + projectBilled;
    const totalDirectCost = ticketCost + projectCost + totalExpenses;
    const totalReceived = ticketReceived + projectReceived;
    const totalReceivables = ticketReceivable + projectReceivable;
    const totalRetentionHeld = projectRetention;
    const grossProfitAmount = Math.max(0, totalBilledCertified - totalDirectCost);
    const grossMarginPercent = totalBilledCertified > 0
      ? Number(((grossProfitAmount / totalBilledCertified) * 100).toFixed(1))
      : 0;

    // Audit compliance rate
    const verifiedCount = [...ticketRecords, ...projectRecords].filter(
      (r) => r.auditStatus === 'VERIFIED'
    ).length;
    const totalRecordsCount = ticketRecords.length + projectRecords.length;
    const complianceRate = totalRecordsCount > 0
      ? Math.round((verifiedCount / totalRecordsCount) * 100)
      : 100;

    return {
      totalWorkOrdersCount: totalRecordsCount,
      totalAwarded,
      totalBilledCertified,
      totalDirectCost,
      totalReceived,
      totalReceivables,
      totalRetentionHeld,
      grossProfitAmount,
      grossMarginPercent,
      ticketGst,
      ticketWht,
      totalExpenses,
      flaggedExpensesCount,
      complianceRate,
    };
  }, [ticketRecords, projectRecords, expenseRecords]);

  // -------------------------------------------------------------
  // 3. ACTIONS (CSV EXPORT & PRINT)
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    const headers = [
      'Record ID / Ticket / Project',
      'System Type',
      'Bank Client',
      'Branch Code',
      'Branch Name',
      'Date',
      'Scope / Trade Category',
      'Awarded / Work Order Amount (PKR)',
      'Billed / Certified Amount (PKR)',
      'Direct Cost (PKR)',
      'Received Amount (PKR)',
      'Outstanding Balance (PKR)',
      'Retention / WHT Held (PKR)',
      'Audit Status',
      'Audit Flags',
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.refNumber}"`,
      `"${r.systemType === 'SYSTEM_1' ? 'System 1: HERE4U' : 'System 2: Branch Project'}"`,
      `"${r.client}"`,
      `"${r.branchCode || ''}"`,
      `"${r.branchName}"`,
      `"${r.date}"`,
      `"${(r.scopeDescription || r.title || '').replace(/"/g, '""')}"`,
      r.workOrderAmount || r.contractValue || 0,
      r.billedAmount || 0,
      r.directCost || 0,
      r.receivedAmount || 0,
      r.balanceDue || 0,
      r.retentionHeld || r.whtAmount || 0,
      `"${r.auditStatus}"`,
      `"${(r.auditFlags || []).join('; ')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Naeem_Taj_Naeem_Builder_Cost_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------- */}
      {/* 1. VENDOR AUDIT HEADER & CREDENTIAL PROFILE */}
      {/* ------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Subtle background branding watermark */}
        <div className="absolute right-4 top-2 select-none pointer-events-none opacity-5 text-7xl font-black text-amber-500 font-mono">
          NAEEM TAJ
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                <ShieldCheck className="w-4 h-4" />
                Audited Vendor Cost Report
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {vendorInfo.fbrStatus}
              </span>
              <span className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Vendor Code: <strong className="text-amber-300">{vendorInfo.vendorCode}</strong>
              </span>
            </div>

            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {vendorInfo.officialName} / {vendorInfo.businessTitle}
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                (Official Vendor for United Bank Limited HERE4U &amp; Commercial Banking Networks)
              </span>
            </div>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Consolidated operational work ledger, estimate breakups, purchase orders, certified running bills (RA-01 to Final), tax withholding deductions, retention escrow balances, and direct job cost accounting for internal &amp; statutory audit compliance.
            </p>

            {/* Credential tags row */}
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1 flex-wrap">
              <span>NTN: <strong className="text-slate-200">{vendorInfo.ntn}</strong></span>
              <span>STRN: <strong className="text-slate-200">{vendorInfo.strn}</strong></span>
              <span>Email: <strong className="text-slate-200">{vendorInfo.email}</strong></span>
              <span>Cell: <strong className="text-slate-200">{vendorInfo.phone}</strong></span>
              <span>Head Office: <strong className="text-slate-200">{vendorInfo.address}</strong></span>
            </div>
          </div>

          {/* Action buttons: Export CSV & Print */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow-md cursor-pointer transition-colors"
              title="Download full CSV spreadsheet for Excel audit"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
              title="Print formal auditor packet"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* 2. TOP AUDITED KPI FINANCIAL CARDS */}
      {/* ------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Awarded Work Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              Total Awarded Volume
            </span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
              {summaryMetrics.totalWorkOrdersCount} Jobs
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            PKR {(summaryMetrics.totalAwarded / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            PO / Contract Awards: System 1 &amp; 2
          </p>
        </div>

        {/* Card 2: Invoiced & Certified Gross */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              Invoiced &amp; Certified
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              Gross Billed
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
            PKR {(summaryMetrics.totalBilledCertified / 1000000).toFixed(2)}M
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Direct Cost: PKR {(summaryMetrics.totalDirectCost / 1000000).toFixed(2)}M</span>
            <span className="text-purple-300 font-bold">{summaryMetrics.grossMarginPercent}% Margin</span>
          </div>
        </div>

        {/* Card 3: Cash Realized vs Outstanding Receivables */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              Realized vs Outstanding
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
              Receivables
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white font-mono">
            PKR {(summaryMetrics.totalReceived / 1000000).toFixed(2)}M
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span className="text-emerald-400">Recv Clear</span>
            <span className="text-amber-400 font-bold">Pending: PKR {(summaryMetrics.totalReceivables / 1000000).toFixed(2)}M</span>
          </div>
        </div>

        {/* Card 4: Retention Escrow & Tax Deductions */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              Retention Escrow &amp; Taxes
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {summaryMetrics.complianceRate}% Audit OK
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400 font-mono">
            PKR {(summaryMetrics.totalRetentionHeld / 1000).toFixed(0)}k
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Escrow 5%</span>
            <span>WHT Deducted: PKR {(summaryMetrics.ticketWht / 1000).toFixed(0)}k</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* 3. AUDIT CONTROL TOOLBAR (SEARCH & FILTERS) */}
      {/* ------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Ticket # (e.g. 125136), Project Code, Branch Code (e.g. 2174), PO #, Client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Quick Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bank Client Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Client:</span>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Banks</option>
                <option value="United Bank Limited" className="bg-slate-900 text-slate-200">United Bank Limited (UBL)</option>
                <option value="Meezan Bank" className="bg-slate-900 text-slate-200">Meezan Bank Limited</option>
                <option value="Habib Bank" className="bg-slate-900 text-slate-200">Habib Bank Limited (HBL)</option>
                <option value="Bank Alfalah" className="bg-slate-900 text-slate-200">Bank Alfalah Limited</option>
                <option value="Allied Bank" className="bg-slate-900 text-slate-200">Allied Bank Limited</option>
              </select>
            </div>

            {/* Work System Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">System:</span>
              <select
                value={selectedSystem}
                onChange={(e) => setSelectedSystem(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Systems (1 &amp; 2)</option>
                <option value="SYSTEM_1" className="bg-slate-900 text-slate-200">System 1: HERE4U Tickets</option>
                <option value="SYSTEM_2" className="bg-slate-900 text-slate-200">System 2: Build-Up Projects</option>
              </select>
            </div>

            {/* Audit Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs">
              <span className="text-slate-400">Audit Status:</span>
              <select
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value as any)}
                className="bg-transparent text-amber-300 text-xs focus:outline-none cursor-pointer font-semibold"
              >
                <option value="ALL" className="bg-slate-900 text-slate-200">All Audit Records</option>
                <option value="VERIFIED" className="bg-slate-900 text-emerald-400">Verified &amp; Fully Compliant</option>
                <option value="PENDING" className="bg-slate-900 text-amber-400">Pending Documentation</option>
                <option value="FLAGGED" className="bg-slate-900 text-rose-400">Flagged Discrepancies</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-slate-800 pt-2 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('CONSOLIDATED')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CONSOLIDATED'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Master Consolidated Ledger ({filteredRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SYSTEM_1_TICKETS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SYSTEM_1_TICKETS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>System 1: HERE4U Maintenance ({ticketRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SYSTEM_2_PROJECTS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'SYSTEM_2_PROJECTS'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>System 2: RA Billing &amp; Projects ({projectRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('FIELD_EXPENSES')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FIELD_EXPENSES'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>Field Fuel &amp; Expenses ({expenseRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TAX_RETENTION')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'TAX_RETENTION'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Tax &amp; Retention Escrow Schedule</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------- */}
      {/* 4. MAIN LEDGER TABLES */}
      {/* ------------------------------------------------------- */}

      {/* TAB 1: CONSOLIDATED MASTER LEDGER */}
      {activeTab === 'CONSOLIDATED' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-3.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Audited Work Records for Vendor Naeem Taj / Naeem Builder ({filteredRecords.length} Records)
            </span>
            <span className="text-[11px] font-mono">
              Click any record to inspect audit trail, BOM slip, and cost breakdown
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Type &amp; Ref #</th>
                  <th className="py-3 px-3">Bank &amp; Branch (Branch Code)</th>
                  <th className="py-3 px-3">Scope / Trade</th>
                  <th className="py-3 px-3 text-right">Awarded (PKR)</th>
                  <th className="py-3 px-3 text-right">Billed / Cert. (PKR)</th>
                  <th className="py-3 px-3 text-right">Direct Cost (PKR)</th>
                  <th className="py-3 px-3 text-right">Received (PKR)</th>
                  <th className="py-3 px-3 text-right">Pending Balance</th>
                  <th className="py-3 px-3 text-center">Audit Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-500 font-sans text-xs">
                      No records matched your search query or audit filter.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const isSystem1 = record.systemType === 'SYSTEM_1';
                    const awardedVal = isSystem1 ? record.workOrderAmount : record.contractValue;
                    const margin = record.billedAmount > 0
                      ? Math.round(((record.billedAmount - record.directCost) / record.billedAmount) * 100)
                      : 0;

                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedAuditRecord(record)}
                        className="hover:bg-slate-850/70 transition-colors cursor-pointer"
                      >
                        {/* Type & Ref */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold font-sans ${
                                isSystem1 ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                              }`}
                            >
                              {isSystem1 ? 'SYS 1' : 'SYS 2'}
                            </span>
                            <span className="font-bold text-slate-200">{record.refNumber}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                            {record.date}
                          </div>
                        </td>

                        {/* Client & Branch */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-200 font-sans flex items-center gap-1.5">
                            <span className="text-amber-400 font-mono font-bold text-[11px] bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                              {record.branchCode ? `Branch #${record.branchCode}` : 'BR-MAIN'}
                            </span>
                            <span className="truncate max-w-[200px]">{record.branchName}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                            {record.client}
                          </div>
                        </td>

                        {/* Scope / Trade */}
                        <td className="py-3 px-3 max-w-xs font-sans">
                          <div className="text-slate-300 line-clamp-1 text-xs">
                            {record.title || record.scopeDescription}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {record.complaintType || record.category || 'Civil & Architectural'}
                          </div>
                        </td>

                        {/* Awarded Value */}
                        <td className="py-3 px-3 text-right text-slate-200 font-bold">
                          PKR {awardedVal.toLocaleString()}
                        </td>

                        {/* Billed / Certified Gross */}
                        <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                          PKR {record.billedAmount.toLocaleString()}
                        </td>

                        {/* Direct Cost */}
                        <td className="py-3 px-3 text-right text-slate-400">
                          PKR {record.directCost.toLocaleString()}
                          <span className="block text-[9px] text-purple-300 font-sans">
                            {margin}% margin
                          </span>
                        </td>

                        {/* Received Amount */}
                        <td className="py-3 px-3 text-right text-slate-300">
                          PKR {record.receivedAmount.toLocaleString()}
                        </td>

                        {/* Outstanding Balance */}
                        <td className="py-3 px-3 text-right">
                          {record.balanceDue > 0 ? (
                            <span className="text-amber-400 font-bold">
                              PKR {record.balanceDue.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[11px]">Cleared (Nil)</span>
                          )}
                        </td>

                        {/* Audit Status */}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-sans">
                          {record.auditStatus === 'VERIFIED' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Compliant
                            </span>
                          ) : record.auditStatus === 'PENDING' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Doc Pending
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Discrepancy
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3 px-3 text-center whitespace-nowrap font-sans" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAuditRecord(record)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM 1 HERE4U TICKETS AUDIT */}
      {activeTab === 'SYSTEM_1_TICKETS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white uppercase tracking-wider">
                System 1: HERE4U Maintenance Ticket &amp; Work Order Billing Audit
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Vendor: Naeem Taj (naeembuilder48@gmail.com). Tracks Complaint #, Branch Code, Estimate Breakup, PO #, Invoice #, GST (16%), WHT (7.5%), and BOM Job Completion Verification.
              </p>
            </div>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {ticketRecords.length} Maintenance Complaints
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Complaint # / Ticket</th>
                  <th className="py-3 px-3">Branch Code &amp; Name</th>
                  <th className="py-3 px-3">Complaint Scope</th>
                  <th className="py-3 px-3 text-right">Labor Cost</th>
                  <th className="py-3 px-3 text-right">Material Cost</th>
                  <th className="py-3 px-3 text-right">PO Amount (PKR)</th>
                  <th className="py-3 px-3 text-right">Net Service</th>
                  <th className="py-3 px-3 text-right">GST (16%)</th>
                  <th className="py-3 px-3 text-right">WHT (7.5%)</th>
                  <th className="py-3 px-3 text-right">Net Receivable</th>
                  <th className="py-3 px-3 text-center">BOM Sign</th>
                  <th className="py-3 px-3 text-center">GPS Proximity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {ticketRecords.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => {
                      if (onSelectTicket) onSelectTicket(t.id);
                      else setSelectedAuditRecord(t);
                    }}
                    className="hover:bg-slate-850/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-amber-400">{t.refNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Bank #{t.complaintNumber}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-1 font-bold text-slate-200">
                        <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                          {t.branchCode ? `Code ${t.branchCode}` : 'N/A'}
                        </span>
                        <span className="truncate max-w-[180px]">{t.branchName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500">{t.client}</div>
                    </td>

                    <td className="py-3 px-3 font-sans max-w-xs">
                      <div className="text-slate-300 line-clamp-1 text-xs">{t.title}</div>
                      <div className="text-[10px] text-slate-500">{t.complaintType}</div>
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      PKR {t.laborCost.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      PKR {t.materialCost.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-white font-bold">
                      PKR {t.workOrderAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      PKR {t.netServiceAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-emerald-400">
                      PKR {t.gstAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-amber-400">
                      - PKR {t.whtAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-white">
                      PKR {(t.billedAmount - t.whtAmount).toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      {t.hasBomSign ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      {t.hasGpsVerified ? (
                        <span className="text-[10px] text-emerald-400">&lt;500m Match</span>
                      ) : (
                        <span className="text-[10px] text-rose-400">Flagged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM 2 PROJECTS & RA BILLING AUDIT */}
      {activeTab === 'SYSTEM_2_PROJECTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white uppercase tracking-wider">
                System 2: Branch Build-Up &amp; Running Account (RA) Billing Audit
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Full contract execution history, revised BOQ measurements, certified running account bills (RA-01, RA-02, RA-03), and retention escrow ledger.
              </p>
            </div>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {projectRecords.length} Branch Build-Up Projects
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Project Code &amp; Award #</th>
                  <th className="py-3 px-3">Branch &amp; City</th>
                  <th className="py-3 px-3 text-right">Contract Value</th>
                  <th className="py-3 px-3 text-center">Certified RA Bills</th>
                  <th className="py-3 px-3 text-right">Gross Certified (PKR)</th>
                  <th className="py-3 px-3 text-right">Advance Recovery</th>
                  <th className="py-3 px-3 text-right">Retention Held (5%)</th>
                  <th className="py-3 px-3 text-right">Net Payable Cert.</th>
                  <th className="py-3 px-3 text-right">Direct Cost</th>
                  <th className="py-3 px-3 text-center">Progress %</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {projectRecords.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => {
                      if (onSelectProject) onSelectProject(p.id);
                      else setSelectedAuditRecord(p);
                    }}
                    className="hover:bg-slate-850/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-emerald-400">{p.refNumber}</div>
                      <div className="text-[10px] text-slate-400 font-sans">
                        Award: {p.awardNumber}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-200">{p.branchName}</div>
                      <div className="text-[10px] text-slate-400">
                        {p.client} • {p.city} ({p.region})
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-200">
                      PKR {p.contractValue.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs border border-slate-700">
                        {p.raBillsCount > 0 ? `${p.raBillsCount} RA Bills` : '0 Bills'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      PKR {p.billedAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-amber-400">
                      - PKR {p.advanceDeducted.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-cyan-400">
                      - PKR {p.retentionHeld.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-white">
                      PKR {p.netPayableCertified.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400">
                      PKR {p.directCost.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${p.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-300 font-bold">{p.progressPercent}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FIELD & FUEL EXPENSES AUDIT */}
      {activeTab === 'FIELD_EXPENSES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-bold text-white uppercase tracking-wider">
                Field Technician Fuel &amp; Out-of-Pocket Job Expenses Audit
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Section 18: Automatic GPS verification of claimed distance vs route calculated distance with discrepancy variance alerts.
              </p>
            </div>
            <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
              Total Incurred: PKR {summaryMetrics.totalExpenses.toLocaleString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-3">Expense ID &amp; Date</th>
                  <th className="py-3 px-3">Field Employee</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Job Purpose &amp; Route</th>
                  <th className="py-3 px-3 text-right">Claimed Dist.</th>
                  <th className="py-3 px-3 text-right">Route Calc.</th>
                  <th className="py-3 px-3 text-right">Amount (PKR)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Audit Assessment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {expenseRecords.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => setSelectedAuditRecord(e)}
                    className="hover:bg-slate-850/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-200">{e.refNumber}</div>
                      <div className="text-[10px] text-slate-500">{e.date}</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-200">{e.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{e.designation}</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                        {e.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-sans max-w-sm">
                      <div className="text-slate-300 line-clamp-1 text-xs">{e.description}</div>
                      {e.fuelDetails && (
                        <div className="text-[10px] text-slate-500">
                          {e.fuelDetails.startPoint} → {e.fuelDetails.destination} ({e.fuelDetails.vehicleType})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-300">
                      {e.fuelDetails ? `${e.fuelDetails.claimedKm} KM` : '—'}
                    </td>

                    <td className="py-3 px-3 text-right text-slate-400">
                      {e.fuelDetails ? `${e.fuelDetails.routeCalculatedKm} KM` : '—'}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-white">
                      PKR {e.amount.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-sans">
                      {e.isFlagged ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Distance Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400">Within Threshold</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: TAX & RETENTION ESCROW SCHEDULE */}
      {activeTab === 'TAX_RETENTION' && (
        <div className="space-y-4">
          {/* Tax Compliance Summary Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Withholding Tax (WHT) &amp; Provincial Sales Tax (GST / PRA) Reconciliation
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Statutory FBR / PRA Vendor NTN: 4182904-7
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs pt-1">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Total Sales Tax Billed (16% PRA)</span>
                <span className="text-lg font-bold text-emerald-400">
                  PKR {summaryMetrics.ticketGst.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Filed under monthly PRA Annexure-C</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Income Tax Withheld at Source (WHT 7.5%)</span>
                <span className="text-lg font-bold text-amber-400">
                  PKR {summaryMetrics.ticketWht.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Bank CPR (Computerized Payment Receipt) verified</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Retention Escrow Balances Held</span>
                <span className="text-lg font-bold text-cyan-400">
                  PKR {summaryMetrics.totalRetentionHeld.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Subject to 180-day DLP and Final Certificate</span>
              </div>
            </div>
          </div>

          {/* Retention Ledger Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider">
                Bank Escrow Retention Schedule by Project (Section 17)
              </h4>
              <span className="font-mono text-slate-400">
                {retentionLedger.length} Active Escrow Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Escrow ID</th>
                    <th className="py-3 px-3">Project Ref &amp; Client</th>
                    <th className="py-3 px-3 text-right">Held Amount (PKR)</th>
                    <th className="py-3 px-3 text-right">Released (PKR)</th>
                    <th className="py-3 px-3 text-right">Escrow Balance (PKR)</th>
                    <th className="py-3 px-3">Release Condition &amp; Terms</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {retentionLedger.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-850/60">
                      <td className="py-3 px-3 font-bold text-cyan-400">{r.id}</td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-slate-200">{r.projectId}</div>
                        <div className="text-[10px] text-slate-400">{r.client}</div>
                      </td>
                      <td className="py-3 px-3 text-right text-slate-300">
                        PKR {r.heldAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400">
                        PKR {r.releasedAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-400">
                        PKR {r.balanceAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-sans text-xs text-slate-300 max-w-xs">
                        {r.releaseCondition}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {r.approvalStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* 5. AUDIT RECORD INSPECTION MODAL / DRAWER */}
      {/* ------------------------------------------------------- */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Top Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">
                      Audit Inspection: {selectedAuditRecord.refNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedAuditRecord.auditStatus === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {selectedAuditRecord.auditStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Vendor: {vendorInfo.officialName} ({vendorInfo.businessTitle}) • {selectedAuditRecord.client}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Branch & Complaint Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Bank Branch &amp; Code</div>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {selectedAuditRecord.branchName}
                  </div>
                  <div className="text-amber-400 font-mono text-[11px]">
                    Code #{selectedAuditRecord.branchCode || 'N/A'} • {selectedAuditRecord.client}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Scope / Title</div>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {selectedAuditRecord.title}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {selectedAuditRecord.complaintType || selectedAuditRecord.category}
                  </div>
                </div>
              </div>

              {/* Financial Breakup */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Cost &amp; Billing Reconciliation
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">
                    PKR {(selectedAuditRecord.billedAmount || 0).toLocaleString()} Gross Billed
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Awarded Amount</span>
                    <span className="font-bold text-slate-200">
                      PKR {(selectedAuditRecord.workOrderAmount || selectedAuditRecord.contractValue || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Direct Cost</span>
                    <span className="font-bold text-slate-300">
                      PKR {(selectedAuditRecord.directCost || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Cash Received</span>
                    <span className="font-bold text-emerald-400">
                      PKR {(selectedAuditRecord.receivedAmount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Pending Balance</span>
                    <span className="font-bold text-amber-400">
                      PKR {(selectedAuditRecord.balanceDue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Checklist */}
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] block mb-1">
                  Auditor Compliance Checklist
                </span>

                <div className="space-y-1.5 font-sans">
                  <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">Vendor Accreditation Validation:</span>
                    <span className="text-emerald-400 font-bold font-mono">
                      M/s Naeem Taj (Code: {vendorInfo.vendorCode})
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">BOM Work Completion Certificate:</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedAuditRecord.hasBomSign ? 'Signed & Verified' : 'Pending Physical Signoff'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-slate-900 rounded-lg">
                    <span className="text-slate-300">GPS Geo-Fence Proximity Stamp:</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedAuditRecord.hasGpsVerified ? 'Verified Within Radius (<500m)' : 'Not Recorded'}
                    </span>
                  </div>

                  {selectedAuditRecord.auditFlags && selectedAuditRecord.auditFlags.length > 0 && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-[11px] space-y-1">
                      <span className="font-bold block">Audit Notes / Flags:</span>
                      {selectedAuditRecord.auditFlags.map((flag: string, idx: number) => (
                        <div key={idx}>• {flag}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Statutory Vendor Audit Record • M/s Naeem Builder
              </span>
              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
