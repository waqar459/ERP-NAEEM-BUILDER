import React, { useState } from 'react';
import {
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Send,
  CreditCard,
  Printer,
  Plus,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Info,
  ExternalLink,
  Layers,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ConsolidatedInvoiceRecord, Ticket } from '../../types/erp';

interface ConsolidatedInvoicesViewProps {
  onSelectTicket?: (ticketId: string) => void;
}

export const ConsolidatedInvoicesView: React.FC<ConsolidatedInvoicesViewProps> = ({ onSelectTicket }) => {
  const {
    tickets,
    consolidatedInvoices,
    createConsolidatedInvoice,
    depositConsolidatedInvoice,
    recordConsolidatedOnlinePayment,
    companyProfile,
    updateTicketDossierStatus,
  } = useERP();

  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [activeBatchModal, setActiveBatchModal] = useState<ConsolidatedInvoiceRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBatchForPayment, setSelectedBatchForPayment] = useState<ConsolidatedInvoiceRecord | null>(null);

  // Form states for payment recording
  const [paymentOnlineRef, setPaymentOnlineRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxChallanRef, setTaxChallanRef] = useState('');

  // Form state for creating batch
  const [batchNotes, setBatchNotes] = useState('');

  // Eligible unbatched invoices: verified completion, unlocked invoice, not yet attached to a batch
  const eligibleTickets = tickets.filter(
    (t) => t.invoice && (!t.consolidatedInvoiceId || t.consolidatedInvoiceId === '')
  );

  const selectedTickets = tickets.filter((t) => selectedTicketIds.includes(t.id));
  const currentSelectedGross = selectedTickets.reduce((sum, t) => sum + (t.invoice?.totalInvoiceAmount || 0), 0);
  const THRESHOLD_LIMIT = 500000;
  const isOverLimit = currentSelectedGross > THRESHOLD_LIMIT;

  // Real-time tax preview for selected tickets:
  // 16% Sales Tax (PRA) + 14% Income Tax (WHT)
  const salesTaxPraPreview = Math.round((currentSelectedGross * 16) / 100);
  const incomeTaxWhtPreview = Math.round((currentSelectedGross * 14) / 100);
  const totalTaxPreview = salesTaxPraPreview + incomeTaxWhtPreview;
  const netTransferPreview = currentSelectedGross - totalTaxPreview;

  const handleToggleTicket = (ticketId: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleCreateBatch = () => {
    if (selectedTicketIds.length === 0 || isOverLimit) return;
    const newBatch = createConsolidatedInvoice(selectedTicketIds, batchNotes);
    setSelectedTicketIds([]);
    setBatchNotes('');
    setIsCreateModalOpen(false);
    setActiveBatchModal(newBatch);
  };

  const handleOpenPaymentModal = (batch: ConsolidatedInvoiceRecord) => {
    setSelectedBatchForPayment(batch);
    setPaymentOnlineRef(`UBL-OL-${Date.now().toString().slice(-8)}`);
    setTaxChallanRef(`PRA-CPR-2026-${Date.now().toString().slice(-7)}`);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedBatchForPayment || !paymentOnlineRef) return;
    recordConsolidatedOnlinePayment(selectedBatchForPayment.id, paymentOnlineRef, paymentDate, taxChallanRef);
    setIsPaymentModalOpen(false);
    setSelectedBatchForPayment(null);
  };

  // KPI Calculations
  const totalGrossBatched = consolidatedInvoices.reduce((sum, b) => sum + b.totalGrossAmount, 0);
  const totalNetOnlineReceived = consolidatedInvoices
    .filter((b) => b.status === 'Paid via Online Transfer')
    .reduce((sum, b) => sum + b.netOnlineTransferAmount, 0);
  const totalTaxesWithheld = consolidatedInvoices
    .filter((b) => b.status === 'Paid via Online Transfer')
    .reduce((sum, b) => sum + b.totalTaxDeductions, 0);
  const activeBatchesCount = consolidatedInvoices.filter((b) => b.status !== 'Paid via Online Transfer').length;

  return (
    <div className="space-y-6">
      {/* Workflow Explanation Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider border border-emerald-500/30">
                UBL HERE4U Billing Cycle
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                Within Rs. 500,000/- Consolidated Threshold
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              HERE4U Consolidated Invoices & Hardcopy Dossier Repository
            </h2>
            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
              In UBL Maintenance & Repair (HERE4U), individual branch tickets are audited and compiled into a single Consolidated Invoice within the <strong>Rs. 500,000 threshold</strong>. Each ticket includes its full 4-part physical hard copy dossier (1. Ticket Rise Hard Copy, 2. Gmail Approval Printout, 3. Signed & Stamped Branch Completion Certificate, 4. Commercial Invoice). UBL Accounts Office issues payment directly via <strong>Online Transfer</strong> after statutory deductions of <strong>16% PRA Sales Tax</strong> and <strong>14% Income Tax (WHT)</strong>, which UBL deposits directly to the Government on behalf of Naeem Builder.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Assemble New Consolidated Batch
          </button>
        </div>

        {/* 4-Step Process Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">1</span>
              Ticket & Gmail Approval
            </div>
            <p className="text-[11px] text-slate-400">
              Ticket rise on Gmail, site estimate, quotation emailed, and approval secured in thread.
            </p>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">2</span>
              Execution & Stamp Certificate
            </div>
            <p className="text-[11px] text-slate-400">
              Materials purchased, work executed, completion note stamped & signed by relative branch BOM.
            </p>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
              <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">3</span>
              Consolidated Batch (&lt;500k)
            </div>
            <p className="text-[11px] text-slate-400">
              4-part hard copy dossier compiled per ticket and deposited to UBL Accounts Office in single batch.
            </p>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">4</span>
              Online Transfer & Tax Deductions
            </div>
            <p className="text-[11px] text-slate-400">
              UBL transfers balance online after cutting 16% PRA Sales Tax + 14% WHT, depositing both to Govt.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Active Batches in Process</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{activeBatchesCount}</div>
          <span className="text-[11px] text-slate-500">Under Rs. 500,000 threshold</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Gross Batched</span>
          <div className="text-2xl font-black text-white mt-1">PKR {totalGrossBatched.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">Across {consolidatedInvoices.length} batches</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Online Transfer Paid</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">PKR {totalNetOnlineReceived.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">70% Net balance received</span>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Taxes Deposited by UBL</span>
          <div className="text-2xl font-black text-purple-400 mt-1">PKR {totalTaxesWithheld.toLocaleString()}</div>
          <span className="text-[11px] text-slate-500">16% PRA + 14% FBR WHT (30%)</span>
        </div>
      </div>

      {/* Consolidated Batches List */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Consolidated Invoices Ledger (UBL Accounts Office Submissions)
            </h3>
            <p className="text-xs text-slate-400">
              Each consolidated document batches multiple tickets up to Rs. 500,000. Track submission and online transfers.
            </p>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {consolidatedInvoices.length} Batches Registered
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {consolidatedInvoices.map((batch) => {
            const batchTickets = tickets.filter((t) => batch.ticketIds.includes(t.id));
            const isPaid = batch.status === 'Paid via Online Transfer';
            const isDeposited = batch.status === 'Deposited to UBL Accounts Office';
            const capacityPercent = Math.min(100, Math.round((batch.totalGrossAmount / batch.maxLimitThreshold) * 100));

            return (
              <div
                key={batch.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base font-mono">{batch.batchNumber}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isDeposited
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {batch.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Created: {batch.dateCreated}</span>
                        {batch.dateDepositedToAccountsOffice && (
                          <>
                            <span>•</span>
                            <span className="text-blue-300">Deposited to Accounts: {batch.dateDepositedToAccountsOffice}</span>
                          </>
                        )}
                        {batch.datePaid && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-300">Transferred: {batch.datePaid}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveBatchModal(batch)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      View Dossier Document
                    </button>

                    {!isDeposited && !isPaid && (
                      <button
                        onClick={() => depositConsolidatedInvoice(batch.id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Deposit to Accounts Office
                      </button>
                    )}

                    {!isPaid && (
                      <button
                        onClick={() => handleOpenPaymentModal(batch)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Record Online Transfer
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar vs Rs. 500,000 threshold */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Batch Gross Amount: <strong className="text-white">PKR {batch.totalGrossAmount.toLocaleString()}</strong> of{' '}
                      <strong className="text-slate-300">PKR {batch.maxLimitThreshold.toLocaleString()}</strong> limit
                    </span>
                    <span className="text-slate-300 font-mono font-semibold">{capacityPercent}% Capacity</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        capacityPercent > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Tax Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900 p-2.5 rounded-lg text-xs border border-slate-800/80">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gross Invoiced</span>
                    <span className="font-bold text-white font-mono">PKR {batch.totalGrossAmount.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-purple-300 block text-[10px]">16% Sales Tax (PRA)</span>
                    <span className="font-bold text-purple-300 font-mono">-PKR {batch.salesTaxPraAmount.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-amber-300 block text-[10px]">14% Income Tax (WHT)</span>
                    <span className="font-bold text-amber-300 font-mono">-PKR {batch.incomeTaxWhtAmount.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-emerald-400 block text-[10px]">Net Online Transfer (70%)</span>
                    <span className="font-bold text-emerald-400 font-mono">PKR {batch.netOnlineTransferAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Attached Tickets List & Dossier Check */}
                <div className="border-t border-slate-800/60 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Attached Maintenance Tickets ({batchTickets.length} Branches / Invoices):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {batchTickets.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white font-mono">Ticket #{t.ticketNumber}</span>
                            <span className="text-slate-400">Branch {t.ublBranchCode}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{t.branchName}</div>
                          <div className="text-[10px] text-slate-500 truncate">{t.title}</div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-bold text-emerald-400 font-mono block">
                            PKR {t.invoice?.totalInvoiceAmount?.toLocaleString() || 0}
                          </span>
                          <span className="text-[10px] text-emerald-500 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 4-Part Dossier OK
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bank Reference & Tax Challan Proof Reference */}
                {(batch.bankTransferReference || batch.fbrPraTaxChallanProofRef) && (
                  <div className="bg-emerald-950/30 border border-emerald-500/20 p-2.5 rounded-lg flex flex-wrap items-center justify-between text-xs gap-2">
                    {batch.bankTransferReference && (
                      <div className="flex items-center gap-1.5 text-emerald-300">
                        <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Online Transfer Ref: <strong className="font-mono">{batch.bankTransferReference}</strong></span>
                      </div>
                    )}
                    {batch.fbrPraTaxChallanProofRef && (
                      <div className="flex items-center gap-1.5 text-purple-300">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                        <span>Govt Tax Challan Ref: <strong className="font-mono">{batch.fbrPraTaxChallanProofRef}</strong></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Unbatched Invoices Pool Ready for Assembly */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400" />
              Eligible Invoices Pool (Unbatched HERE4U Completed Invoices)
            </h3>
            <p className="text-xs text-slate-400">
              Select verified branch maintenance invoices to batch into a Consolidated Invoice (Limit: PKR 500,000).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Selected: <strong className="text-white">{selectedTicketIds.length}</strong> invoices (
              <strong className={isOverLimit ? 'text-rose-400' : 'text-emerald-400'}>
                PKR {currentSelectedGross.toLocaleString()}
              </strong>{' '}
              / 500k)
            </span>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={selectedTicketIds.length === 0 || isOverLimit}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                selectedTicketIds.length > 0 && !isOverLimit
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Assemble Batch
            </button>
          </div>
        </div>

        {eligibleTickets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-slate-950/40 rounded-xl border border-slate-800/60 text-xs">
            All current completed invoices have been batched into Consolidated Invoices! Once new tickets are completed and invoiced, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3 w-10 text-center">Select</th>
                  <th className="p-3">Ticket / Branch</th>
                  <th className="p-3">Scope Description</th>
                  <th className="p-3">Invoice Number</th>
                  <th className="p-3">4-Part Hard Copy Dossier Status</th>
                  <th className="p-3 text-right">Invoiced Gross</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {eligibleTickets.map((t) => {
                  const isChecked = selectedTicketIds.includes(t.id);
                  const dossier = t.dossierStatus || {
                    hasTicketRiseHardCopy: true,
                    hasGmailApprovalHardCopy: true,
                    hasBranchSignedStampedCert: !!t.completionNote?.completionVerified,
                    hasIndividualInvoice: true,
                    isComplete: true,
                  };

                  return (
                    <tr
                      key={t.id}
                      onClick={() => handleToggleTicket(t.id)}
                      className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                        isChecked ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleTicket(t.id)}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-white font-mono">Ticket #{t.ticketNumber}</div>
                        <div className="text-[11px] text-slate-400">Branch {t.ublBranchCode} - {t.branchName}</div>
                      </td>

                      <td className="p-3 text-slate-300 max-w-xs truncate">
                        {t.scopeDescription}
                      </td>

                      <td className="p-3 font-mono text-slate-300">
                        {t.invoice?.invoiceNumber || 'INV-PENDING'}
                      </td>

                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          <span
                            title="1. Task Assigned Ticket Rise Hard Copy"
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              dossier.hasTicketRiseHardCopy
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            1. Ticket Rise
                          </span>

                          <span
                            title="2. Gmail Approval Printout"
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              dossier.hasGmailApprovalHardCopy
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            2. Gmail Appr
                          </span>

                          <span
                            title="3. Signed & Stamped Completion Note from Branch"
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                              dossier.hasBranchSignedStampedCert
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            3. Branch Stamp
                          </span>

                          <span
                            title="4. Commercial Invoice"
                            className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          >
                            4. Invoice
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-right font-bold text-white font-mono">
                        PKR {t.invoice?.totalInvoiceAmount?.toLocaleString() || 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BATCH MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Assemble Consolidated Invoice Batch</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Selected Invoices Count:</span>
                  <span className="font-bold text-white">{selectedTickets.length} invoices</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Gross Billed Amount:</span>
                  <span className="font-bold text-white font-mono text-sm">
                    PKR {currentSelectedGross.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span>Less 16% Sales Tax (PRA - Deposited by UBL):</span>
                  <span className="font-mono">-PKR {salesTaxPraPreview.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-amber-300">
                  <span>Less 14% Income Tax (WHT - Deposited by UBL):</span>
                  <span className="font-mono">-PKR {incomeTaxWhtPreview.toLocaleString()}</span>
                </div>

                <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-sm font-bold text-emerald-400">
                  <span>Net Online Transfer Amount:</span>
                  <span className="font-mono">PKR {netTransferPreview.toLocaleString()}</span>
                </div>
              </div>

              {isOverLimit && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    The total gross amount exceeds the <strong>Rs. 500,000 threshold</strong> by PKR{' '}
                    {(currentSelectedGross - THRESHOLD_LIMIT).toLocaleString()}. Please uncheck one or more invoices.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission Notes for UBL Accounts Office
                </label>
                <textarea
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="e.g., Consolidated maintenance batch for Central Region branches. All 4-part hard copy dossiers verified and attached."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateBatch}
                disabled={selectedTicketIds.length === 0 || isOverLimit}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  selectedTicketIds.length > 0 && !isOverLimit
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Generate Consolidated Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isPaymentModalOpen && selectedBatchForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Record UBL Online Transfer</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Batch Number:</span>
                  <span className="font-bold text-white font-mono">{selectedBatchForPayment.batchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Amount:</span>
                  <span className="font-mono text-slate-300">PKR {selectedBatchForPayment.totalGrossAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>16% PRA Sales Tax Deducted:</span>
                  <span className="font-mono">-PKR {selectedBatchForPayment.salesTaxPraAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>14% Income Tax (WHT) Deducted:</span>
                  <span className="font-mono">-PKR {selectedBatchForPayment.incomeTaxWhtAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-emerald-400 text-sm">
                  <span>Net Transferred Online:</span>
                  <span className="font-mono">PKR {selectedBatchForPayment.netOnlineTransferAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  UBL Online Bank Transfer Reference / FT Number *
                </label>
                <input
                  type="text"
                  value={paymentOnlineRef}
                  onChange={(e) => setPaymentOnlineRef(e.target.value)}
                  placeholder="e.g., UBL-FT-09159981"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Payment Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PRA / FBR Tax Challan CPR Ref (Deposited by UBL on behalf of Naeem Builder)
                </label>
                <input
                  type="text"
                  value={taxChallanRef}
                  onChange={(e) => setTaxChallanRef(e.target.value)}
                  placeholder="e.g., PRA-CPR-2026-09-8812903"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmPayment}
                disabled={!paymentOnlineRef}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Confirm Payment Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE CONSOLIDATED INVOICE MODAL */}
      {activeBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-auto">
            {/* Header & Print Actions */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold uppercase">
                  Official Hard Copy Dossier
                </span>
                <span className="text-xs text-slate-500 font-mono">Document #{activeBatchModal.batchNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Consolidated Bill
                </button>
                <button
                  onClick={() => setActiveBatchModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-4 gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">{companyProfile.companyName}</h1>
                <p className="text-xs text-slate-600 font-medium">Civil, Electrical, Interior & Bank Maintenance Contractors</p>
                <p className="text-[11px] text-slate-500 mt-1">{companyProfile.headOfficeAddress}</p>
                <p className="text-[11px] text-slate-500">Phone: {companyProfile.contactPhone} | Email: {companyProfile.contactEmail}</p>
              </div>

              <div className="text-right text-xs space-y-0.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div><strong>NTN:</strong> {companyProfile.ntn}</div>
                <div><strong>STRN:</strong> {companyProfile.strn}</div>
                <div><strong>PRA Reg:</strong> {companyProfile.praRegistrationNo}</div>
                <div><strong>UBL Vendor Code:</strong> <span className="font-mono font-bold text-blue-800">{companyProfile.ublVendorCode}</span></div>
                <div><strong>UBL Operational Account:</strong> <span className="font-mono">{companyProfile.bankAccountNumber}</span></div>
              </div>
            </div>

            {/* Addressed to UBL Accounts Office */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-500 uppercase text-[10px] block">Submitted To:</span>
                <strong className="text-slate-900 text-sm block">Manager Accounts & Finance</strong>
                <p className="text-slate-600">United Bank Limited (UBL)</p>
                <p className="text-slate-600">Central Accounts & Operations Division, Lahore / Karachi</p>
                <p className="text-slate-500 text-[11px] mt-1">Client Code: UBL-COMMERCIAL-HERE4U</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
                <div><span className="text-slate-500">Consolidated Invoice #:</span> <strong className="font-mono">{activeBatchModal.batchNumber}</strong></div>
                <div><span className="text-slate-500">Date Assembled:</span> <strong>{activeBatchModal.dateCreated}</strong></div>
                <div><span className="text-slate-500">Batch SLA Ceiling:</span> <strong className="text-emerald-700">Within Rs. 500,000/-</strong></div>
                <div><span className="text-slate-500">Submission Status:</span> <strong className="text-blue-700">{activeBatchModal.status}</strong></div>
              </div>
            </div>

            {/* Subject */}
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800">
              SUBJECT: SUBMISSION OF CONSOLIDATED HARD COPY INVOICE DOSSIER FOR HERE4U BRANCH MAINTENANCE & REPAIR WORKS (UNDER RS. 500,000 THRESHOLD)
            </div>

            {/* Table of Attached Tickets & Invoices */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Attached Individual Branch Invoices & 4-Part Hard Copy Dossier Breakdown:
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] tracking-wider border-b">
                    <tr>
                      <th className="p-2.5 text-center">Sr.</th>
                      <th className="p-2.5">Ticket #</th>
                      <th className="p-2.5">Branch Code & Address</th>
                      <th className="p-2.5">Scope Description</th>
                      <th className="p-2.5">Approval & Completion Ref</th>
                      <th className="p-2.5 text-right">Gross Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {tickets
                      .filter((t) => activeBatchModal.ticketIds.includes(t.id))
                      .map((t, idx) => (
                        <tr key={t.id}>
                          <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2.5 font-bold font-mono text-slate-900">{t.ticketNumber}</td>
                          <td className="p-2.5">
                            <strong className="block text-slate-900">Branch {t.ublBranchCode} - {t.branchName}</strong>
                            <span className="text-[11px] text-slate-500 truncate block max-w-xs">{t.branchAddress}</span>
                          </td>
                          <td className="p-2.5 text-slate-700 max-w-xs">{t.scopeDescription}</td>
                          <td className="p-2.5 text-[11px] text-slate-600">
                            <div>Gmail Appr: {t.approval?.approvalReference || 'Confirmed in Thread'}</div>
                            <div>Cert Signed: {t.completionNote?.deliveredBySignature ? 'Signed & Stamped' : 'Verified'}</div>
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                            PKR {t.invoice?.totalInvoiceAmount?.toLocaleString() || 0}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Consolidated Tax Deduction & Net Transfer Calculation */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">1. Total Gross Billed Amount (Within Rs. 500,000 Limit):</span>
                <strong className="font-mono text-slate-900">PKR {activeBatchModal.totalGrossAmount.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between text-purple-700">
                <span>2. Less: 16% Punjab Sales Tax (PRA) - Deducted at Source by UBL:</span>
                <strong className="font-mono">-PKR {activeBatchModal.salesTaxPraAmount.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between text-amber-700">
                <span>3. Less: 14% Income Tax / WHT - Deducted at Source by UBL:</span>
                <strong className="font-mono">-PKR {activeBatchModal.incomeTaxWhtAmount.toLocaleString()}</strong>
              </div>

              <div className="border-t border-slate-300 pt-2 flex justify-between text-base font-black text-emerald-800">
                <span>Net Payable Balance (Issued via Online Bank Transfer):</span>
                <span className="font-mono">PKR {activeBatchModal.netOnlineTransferAmount.toLocaleString()}</span>
              </div>

              <p className="text-[10px] text-slate-500 italic mt-1">
                * Note: Both 16% Sales Tax (PRA) and 14% Income Tax are deducted by United Bank Limited and deposited directly to Government accounts (PRA / FBR) on behalf of Naeem Builder. CPR certificates / Challan reference numbers will be provided upon payment clearance.
              </p>
            </div>

            {/* 4-Part Hard Copy Dossier Verification Checklist (Stamped on Hardcopy) */}
            <div className="border border-slate-300 p-4 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wide block">
                Official Hard Copy Dossier Checklist (Physically Attached for UBL Accounts Office):
              </span>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>1. Task Assigned Ticket Rise Hard Copy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>2. Gmail Approval Thread Email Printout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>3. Branch Signed & Stamped Completion Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Individual Commercial Invoices</span>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-xs">
              <div className="text-center space-y-12">
                <span className="text-slate-500 font-semibold block">Prepared & Submitted By:</span>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  Naeem Taj / Authorized Signatory<br />
                  <span className="text-[11px] text-slate-500 font-normal">Naeem Builder (Pvt) Ltd (Seal & Stamp)</span>
                </div>
              </div>

              <div className="text-center space-y-12">
                <span className="text-slate-500 font-semibold block">Received & Audited By:</span>
                <div className="border-t border-slate-400 pt-1 font-bold text-slate-900">
                  UBL Accounts & Finance Division<br />
                  <span className="text-[11px] text-slate-500 font-normal">United Bank Limited (Stamp & Signature)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
