import React, { useState } from 'react';
import {
  X,
  Layers,
  FileSpreadsheet,
  Receipt,
  Shield,
  DollarSign,
  Plus,
  CheckCircle2,
  Printer,
  TrendingUp,
  Calculator,
  HardHat,
  FileCheck,
  FileText,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Project, BOQItem, RABill } from '../../types/erp';
import { ProjectStatusProgressBar } from './ProjectStatusProgressBar';
import { RetentionPaymentCalculator } from './RetentionPaymentCalculator';
import { DailySiteLogViewer } from './DailySiteLogViewer';

interface ProjectDetailModalProps {
  projectId: string;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ projectId, onClose }) => {
  const {
    projects,
    retentionLedger,
    dailySiteLogs,
    generateRABill,
    releaseRetentionAmount,
    issuePhysicalWorkOrder,
    activeRole,
  } = useERP();
  const project = projects.find((p) => p.id === projectId);
  const [activeTab, setActiveTab] = useState<'WORK_ORDER' | 'BOQ' | 'RA_BILLS' | 'RETENTION' | 'COST_CONTROL' | 'SITE_LOGS'>('WORK_ORDER');

  // Generator state for Next RA Bill
  const [isGeneratingRABill, setIsGeneratingRABill] = useState(false);
  const [certQuantities, setCertQuantities] = useState<{ [boqItemId: string]: number }>({});
  const [advanceDeductionPercent, setAdvanceDeductionPercent] = useState<number>(10);
  const [retentionPercent, setRetentionPercent] = useState<number>(5);

  // Selected RA Bill for certificate preview
  const [previewRABill, setPreviewRABill] = useState<RABill | null>(null);

  // Release retention modal state
  const [releaseModalEntryId, setReleaseModalEntryId] = useState<string | null>(null);
  const [releaseAmount, setReleaseAmount] = useState<number>(0);
  const [releaseBankRef, setReleaseBankRef] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');

  // Physical Work Order state
  const [showIssueWoForm, setShowIssueWoForm] = useState(false);
  const [woNumInput, setWoNumInput] = useState(project?.physicalWorkOrderNumber || `WO-UBL-CRE-2026-${project?.projectCode.slice(-4) || '0041'}`);
  const [woDateInput, setWoDateInput] = useState(project?.physicalWorkOrderDate || new Date().toISOString().split('T')[0]);
  const [woAuthorityInput, setWoAuthorityInput] = useState(project?.physicalWorkOrderAuthority || 'UBL Corporate Real Estate / HO Engineering Division');
  const [woNotesInput, setWoNotesInput] = useState(project?.workOrderNotes || 'Physical hardcopy work order issued post-tender award. Work commenced strictly post physical issuance. Governed by 3 Running Bills.');

  if (!project) return null;

  const projectRetentionEntries = retentionLedger.filter((r) => r.projectId === project.id);
  const totalHeldInEscrow = projectRetentionEntries.reduce((sum, r) => sum + r.balanceAmount, 0);

  const nextBillIndex = project.raBills.length + 1;
  const isThirdBill = nextBillIndex === 3;

  const handleOpenRABillGenerator = () => {
    // If it's the 3rd running bill, automatically enforce 10% retention per tender specs!
    if (isThirdBill) {
      setRetentionPercent(10);
    } else {
      setRetentionPercent(5);
    }

    // Initialize quantities with remaining quantity defaults or 0
    const initialCert: { [id: string]: number } = {};
    project.boq.forEach((item) => {
      // Suggest up to remaining quantity
      initialCert[item.id] = Math.min(item.remainingQuantity, Math.round(item.contractQuantity * 0.2));
    });
    setCertQuantities(initialCert);
    setIsGeneratingRABill(true);
  };

  const handleIssueWorkOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!woNumInput.trim()) return;
    issuePhysicalWorkOrder(project.id, woNumInput.trim(), woDateInput, woAuthorityInput, woNotesInput);
    setShowIssueWoForm(false);
  };

  const handleCreateRABillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsCertified = Object.entries(certQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([boqItemId, currentCertifiedQty]) => ({
        boqItemId,
        currentCertifiedQty,
      }));

    if (itemsCertified.length === 0) {
      alert('Please certify at least one BOQ item quantity for this RA bill.');
      return;
    }

    const newBill = generateRABill(
      project.id,
      itemsCertified,
      advanceDeductionPercent,
      retentionPercent
    );

    if (newBill) {
      setIsGeneratingRABill(false);
      setPreviewRABill(newBill);
      setActiveTab('RA_BILLS');
    }
  };

  const handleReleaseRetentionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseModalEntryId || releaseAmount <= 0) return;

    releaseRetentionAmount(
      releaseModalEntryId,
      releaseAmount,
      releaseNotes || 'Released upon consultant recommendation',
      releaseBankRef || 'ONLINE-TRF-ESCROW'
    );

    setReleaseModalEntryId(null);
    setReleaseAmount(0);
    setReleaseBankRef('');
    setReleaseNotes('');
  };

  const handleOpenReleaseModal = (amount: number, reason: string) => {
    const targetEntry =
      projectRetentionEntries.find((e) => e.balanceAmount > 0) || projectRetentionEntries[0];
    if (targetEntry) {
      setReleaseModalEntryId(targetEntry.id);
      setReleaseAmount(
        Math.min(amount, targetEntry.balanceAmount > 0 ? targetEntry.balanceAmount : amount)
      );
      setReleaseNotes(reason);
      setReleaseBankRef(`BNK-ESCROW-${Date.now().toString().slice(-6)}`);
    } else {
      alert(
        'No active retention escrow records found for this project. Retention is automatically recorded into the ledger when generating RA Bills.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-emerald-400">{project.projectCode}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  Award: {project.awardNumber}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {project.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">{project.title}</h2>
              <p className="text-xs text-slate-400">
                {project.client} • {project.city} ({project.region} Region) • PM: {project.projectManager}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Contract Value</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                PKR {(project.contractValue / 1000000).toFixed(2)}M
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 bg-slate-950/40 px-5 flex space-x-2">
          {[
            { id: 'WORK_ORDER', label: '1. Physical Work Order', icon: <FileCheck className="w-4 h-4 text-amber-400" /> },
            { id: 'BOQ', label: '2. Bill of Quantities (BOQ)', icon: <FileSpreadsheet className="w-4 h-4" /> },
            { id: 'RA_BILLS', label: '3. 3 Running Bills (RA-01 to RA-03)', icon: <Receipt className="w-4 h-4" /> },
            { id: 'RETENTION', label: '4. Retention Ledger (10% on RA-03 / 6M DLP)', icon: <Shield className="w-4 h-4" /> },
            { id: 'COST_CONTROL', label: '5. Project Cost Control (Section 16)', icon: <TrendingUp className="w-4 h-4" /> },
            {
              id: 'SITE_LOGS',
              label: `6. Daily Site Logs (${dailySiteLogs.filter((l) => l.projectId === project.id).length})`,
              icon: <HardHat className="w-4 h-4 text-emerald-400" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Prominent Project Status & BOQ Progress Bar (RA Billing) */}
          <ProjectStatusProgressBar
            project={project}
            mode="detailed"
            showTradeBreakdown={false}
            onOpenBOQTab={() => setActiveTab('BOQ')}
            onOpenRABillsTab={() => setActiveTab('RA_BILLS')}
          />

          {/* TAB: PHYSICAL WORK ORDER (TENDER WORK ORDER - STRICTLY NOT ON GMAIL) */}
          {activeTab === 'WORK_ORDER' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span className="font-bold text-sm text-white uppercase tracking-wider">
                      Physical Work Order Governance (Strictly NOT on Gmail)
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Tender & Work Order Flow
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Unlike HERE4U maintenance tickets which rise and approve via Gmail, <strong>Branch Renovation / Construction Tender Projects</strong> require quotation approval followed by an official <strong>Physical Hardcopy Work Order</strong> issued by UBL Corporate Real Estate / HO Engineering. Work commences strictly post physical issuance. The project is governed by exactly <strong>3 Running Bills (First Running Bill RA-01, Second Running Bill RA-02, and Third Running Bill RA-03)</strong>.
                </p>
              </div>

              {/* Physical Work Order Card */}
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-emerald-400">
                        {project.physicalWorkOrderNumber || 'PENDING PHYSICAL WORK ORDER'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        project.isPhysicalWorkOrderIssued
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {project.isPhysicalWorkOrderIssued ? 'Physical Work Order Issued & Active' : 'Awaiting Physical Work Order'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Issuing Authority: <strong className="text-slate-200">{project.physicalWorkOrderAuthority || 'UBL Corporate Real Estate'}</strong> | Date: <strong className="text-slate-200">{project.physicalWorkOrderDate || project.contractAwardDate}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowIssueWoForm(!showIssueWoForm)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showIssueWoForm ? '✕ Close Form' : 'Update / Issue Work Order Details'}</span>
                  </button>
                </div>

                {/* Form to update / issue physical work order */}
                {showIssueWoForm && (
                  <form onSubmit={handleIssueWorkOrderSubmit} className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/40 space-y-3 text-xs">
                    <div className="font-bold text-amber-400 flex items-center gap-2">
                      <FileCheck className="w-4 h-4" />
                      Record Physical Work Order Issuance:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-300 block mb-1">Physical Work Order # *</label>
                        <input
                          type="text"
                          required
                          value={woNumInput}
                          onChange={(e) => setWoNumInput(e.target.value)}
                          placeholder="e.g. WO-UBL-CRE-2026-0041"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">Issuance Date *</label>
                        <input
                          type="date"
                          required
                          value={woDateInput}
                          onChange={(e) => setWoDateInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">Issuing Authority *</label>
                        <input
                          type="text"
                          required
                          value={woAuthorityInput}
                          onChange={(e) => setWoAuthorityInput(e.target.value)}
                          placeholder="e.g. UBL Head Office Real Estate Division"
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 block mb-1">Work Order Operational Scope & Notes</label>
                      <textarea
                        rows={2}
                        value={woNotesInput}
                        onChange={(e) => setWoNotesInput(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setShowIssueWoForm(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                      >
                        Save & Issue Work Order
                      </button>
                    </div>
                  </form>
                )}

                {/* 3 Running Bills Architecture & Statutory Tax Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-emerald-400" />
                      3 Running Bills Billing Lifecycle
                    </h4>
                    <div className="space-y-2 text-slate-300 text-[11px]">
                      <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                        <span><strong>1. First Running Bill (RA-01):</strong> Initial mobilization & masonry stage</span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${project.raBills.length >= 1 ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500'}`}>
                          {project.raBills.length >= 1 ? 'Certified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-950">
                        <span><strong>2. Second Running Bill (RA-02):</strong> MEP & interior fitout stage</span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${project.raBills.length >= 2 ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500'}`}>
                          {project.raBills.length >= 2 ? 'Certified' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-amber-500/30">
                        <span><strong>3. Third Running Bill (RA-03 - Final):</strong> 10% Retention held; 6-Month DLP release</span>
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${project.raBills.length >= 3 ? 'text-emerald-400 bg-emerald-500/20' : 'text-amber-400 bg-amber-500/20'}`}>
                          {project.raBills.length >= 3 ? 'Certified' : 'Next Milestone'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      Work Order Statutory Tax Deductions (UBL)
                    </h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      For all Tender / Work Order payments, UBL deducts at source and deposits both taxes directly to the government on behalf of Naeem Builder:
                    </p>
                    <div className="space-y-1.5 text-[11px] font-mono">
                      <div className="flex justify-between p-2 rounded bg-slate-950 text-purple-300">
                        <span>Punjab Sales Tax (PRA):</span>
                        <span className="font-bold">16.0% (Deducted & Deposited to PRA by UBL)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-slate-950 text-amber-300">
                        <span>Income Tax (WHT):</span>
                        <span className="font-bold">9.0% (Deducted & Deposited to FBR by UBL)</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-slate-950 text-emerald-300 font-bold">
                        <span>Retention Money (3rd Bill):</span>
                        <span>10.0% Held for 6-Month DLP Release</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-emerald-950/40 text-emerald-400 font-bold border border-emerald-500/20">
                        <span>Net Balance Transfer:</span>
                        <span>Transferred Online to Naeem Builder A/C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: BOQ (BILL OF QUANTITIES) */}
          {activeTab === 'BOQ' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Contract Bill of Quantities (BOQ Master)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Section 14: Contract quantity, rate, amount, completed cumulative quantity, and remaining quantity certified via RA Bills.
                  </p>
                </div>
                <button
                  onClick={handleOpenRABillGenerator}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Certify Next RA Bill</span>
                </button>
              </div>

              <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Item Code</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 max-w-sm">Description</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-right">Contract Qty</th>
                      <th className="py-2.5 px-3 text-right">Rate (PKR)</th>
                      <th className="py-2.5 px-3 text-right">Amount (PKR)</th>
                      <th className="py-2.5 px-3 text-right text-emerald-400">Completed Qty</th>
                      <th className="py-2.5 px-3 text-right text-amber-400">Remaining Qty</th>
                      <th className="py-2.5 px-3 text-center min-w-[120px]">RA Certified %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {project.boq.map((item) => {
                      const itemPercent = item.contractQuantity > 0 
                        ? Math.min(100, Math.round(((item.completedQuantity || 0) / item.contractQuantity) * 100))
                        : 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-900/50">
                          <td className="py-2 px-3 font-bold text-emerald-400 font-sans">{item.itemCode}</td>
                          <td className="py-2 px-3 text-slate-400 font-sans">{item.category}</td>
                          <td className="py-2 px-3 text-slate-200 font-sans max-w-xs">{item.description}</td>
                          <td className="py-2 px-3 text-center text-slate-300 font-sans">{item.unit}</td>
                          <td className="py-2 px-3 text-right text-slate-200">{item.contractQuantity.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{item.rate.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-slate-200">{item.contractAmount.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-emerald-400 font-bold">{item.completedQuantity.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-amber-400">{item.remainingQuantity.toLocaleString()}</td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    itemPercent >= 100
                                      ? 'bg-emerald-500'
                                      : itemPercent > 50
                                      ? 'bg-teal-400'
                                      : itemPercent > 0
                                      ? 'bg-amber-400'
                                      : 'bg-slate-700'
                                  }`}
                                  style={{ width: `${itemPercent}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-slate-300 font-bold w-7 text-right">
                                {itemPercent}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: RUNNING BILLS & RA CERTIFICATES */}
          {activeTab === 'RA_BILLS' && (
            <div className="space-y-5">
              {/* Section 15 Rule Banner */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  SECTION 15: RUNNING BILL LOGIC ENFORCEMENT
                </div>
                <p>
                  <code>Previous Certified Quantity + Current Certified Quantity = Cumulative Quantity</code>
                </p>
                <p>
                  <code>Remaining Quantity = Contract/Revised Quantity − Cumulative Quantity</code> (Prevents double billing!)
                </p>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configured Running Bills (RA-01, RA-02, RA-03 & Final Bill)
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('RETENTION')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs cursor-pointer shadow transition-all"
                    title="Open Retention Payment Calculator (5-10% computation and balance release date)"
                  >
                    <Calculator className="w-3.5 h-3.5 text-amber-400" />
                    <span>Retention Calculator (5-10%)</span>
                  </button>
                  <button
                    onClick={handleOpenRABillGenerator}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Generate Next RA Bill</span>
                  </button>
                </div>
              </div>

              {project.raBills.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
                  No RA bills generated yet. Click &apos;+ Generate Next RA Bill&apos; to certify physical progress.
                </div>
              ) : (
                <div className="space-y-4">
                  {project.raBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 font-sans"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-lg text-emerald-400">{bill.billNumber}</span>
                          <div>
                            <div className="text-xs font-semibold text-white">Running Account Progress Certificate</div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              Period: {bill.periodStart} to {bill.periodEnd} | Date: {bill.billDate}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {bill.status}
                          </span>
                          <button
                            onClick={() => setPreviewRABill(bill)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View Certificate</span>
                          </button>
                        </div>
                      </div>

                      {/* Arithmetic Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] uppercase block">Current Bill Gross</span>
                          <span className="font-bold text-white text-sm">
                            PKR {bill.currentBillGross.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] uppercase block">Advance Recovery (10%)</span>
                          <span className="font-bold text-amber-400 text-sm">
                            - PKR {bill.advanceMobilizationDeduction.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] uppercase block">
                            Retention Money ({bill.retentionMoneyDeductionPercent}%)
                          </span>
                          <span className="font-bold text-cyan-400 text-sm">
                            - PKR {bill.retentionMoneyDeductionAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                          <span className="text-slate-500 text-[10px] uppercase block">Net Certified Bill</span>
                          <span className="font-bold text-emerald-400 text-sm">
                            PKR {bill.netPayableAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Work Order Statutory Taxes & Online Transfer Breakdown */}
                      <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                        <div className="text-purple-300">
                          <span className="text-slate-400 block text-[10px]">16% PRA Sales Tax (UBL Direct):</span>
                          <span>- PKR {Math.round(bill.currentBillGross * 0.16).toLocaleString()}</span>
                        </div>
                        <div className="text-amber-300">
                          <span className="text-slate-400 block text-[10px]">9% Income Tax WHT (UBL Direct):</span>
                          <span>- PKR {Math.round(bill.currentBillGross * 0.09).toLocaleString()}</span>
                        </div>
                        <div className="text-emerald-400 font-bold sm:text-right">
                          <span className="text-slate-400 block text-[10px]">Net Online Bank Transfer:</span>
                          <span>PKR {Math.max(0, Math.round(bill.netPayableAmount - (bill.currentBillGross * 0.25))).toLocaleString()}</span>
                        </div>
                      </div>

                      {bill.billNumber === 'RA-03' && (
                        <div className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center justify-between">
                          <span>3rd Running Bill: 10% Retention Withheld (PKR {bill.retentionMoneyDeductionAmount.toLocaleString()})</span>
                          <span className="font-mono">Release Milestone: 6-Month DLP Expiry</span>
                        </div>
                      )}

                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                        <span>Certified Consultant: <strong>{bill.certifiedByConsultant || 'Design Bureau Consult'}</strong></span>
                        <span>Cumulative Project Gross: <strong>PKR {bill.grossCertifiedAmount.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RETENTION LEDGER & 5-10% CALCULATOR */}
          {activeTab === 'RETENTION' && (
            <div className="space-y-6">
              {/* Section 15: Automated 5-10% Retention Payment & DLP Release Date Calculator */}
              <RetentionPaymentCalculator
                project={project}
                retentionEntries={projectRetentionEntries}
                onInitiateRelease={handleOpenReleaseModal}
                defaultOpen={true}
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Separate Retention Money Ledger (Section 15)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Formula: <code>Retention Held − Retention Released = Retention Balance</code>.
                  </p>
                </div>
                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-amber-500/30 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Held in Escrow</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    PKR {totalHeldInEscrow.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-3 px-3">RA Bill Ref</th>
                      <th className="py-3 px-3">Date Held</th>
                      <th className="py-3 px-3 text-center">Rate</th>
                      <th className="py-3 px-3 text-right">Held Amount</th>
                      <th className="py-3 px-3 text-right text-emerald-400">Released Amount</th>
                      <th className="py-3 px-3 text-right text-amber-400 font-bold">Balance In Escrow</th>
                      <th className="py-3 px-3">Release Milestone / Condition</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {projectRetentionEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-900/40">
                        <td className="py-2.5 px-3 font-bold text-white">{entry.raBillNumber}</td>
                        <td className="py-2.5 px-3 text-slate-400">{entry.dateHeld}</td>
                        <td className="py-2.5 px-3 text-center text-slate-300">{entry.retentionRatePercent}%</td>
                        <td className="py-2.5 px-3 text-right text-slate-200">Rs. {entry.heldAmount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-emerald-400">Rs. {entry.releasedAmount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right text-amber-400 font-bold">Rs. {entry.balanceAmount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px] max-w-xs">{entry.releaseCondition}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            entry.approvalStatus === 'Released & Paid'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-amber-500/15 text-amber-400'
                          }`}>
                            {entry.approvalStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {entry.balanceAmount > 0 && (
                            <button
                              onClick={() => {
                                setReleaseModalEntryId(entry.id);
                                setReleaseAmount(entry.balanceAmount);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/30 cursor-pointer"
                            >
                              Release
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECT COST CONTROL */}
          {activeTab === 'COST_CONTROL' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Section 16: Project Cost Control & Profitability
              </h3>
              <p className="text-xs text-slate-400">
                Contract Value → Budget/BOQ → Material → Labour → Subcontractors → Fuel → Site Expenses → Actual Cost → Profitability.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Contract Value</span>
                  <span className="text-sm font-bold text-white mt-1 block">
                    PKR {(project.contractValue / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Direct Materials</span>
                  <span className="text-sm font-bold text-amber-400 mt-1 block">
                    PKR {(project.directMaterialCost / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Labour & Subcontracts</span>
                  <span className="text-sm font-bold text-amber-400 mt-1 block">
                    PKR {((project.directLabourCost + project.directSubcontractCost) / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] uppercase block">Gross Project Margin</span>
                  <span className="text-sm font-bold text-emerald-400 mt-1 block">
                    {project.grossProfitMarginPercent || 40.6}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DAILY SITE LOGS WITH LABOR COUNT, WEATHER & GPS TAGGED PHOTOS */}
          {activeTab === 'SITE_LOGS' && (
            <DailySiteLogViewer project={project} />
          )}
        </div>
      </div>

      {/* MODAL: GENERATE NEXT RA BILL WITH PREVENT-DOUBLE-BILLING ARITHMETIC */}
      {isGeneratingRABill && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-2xl p-5 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Generate Running Account (RA) Bill</h3>
                <p className="text-xs text-slate-400">
                  Section 15 Rule: Previous Certified + Current Certified = Cumulative Certified. Remaining = Contract − Cumulative.
                </p>
              </div>
              <button onClick={() => setIsGeneratingRABill(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRABillSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs">
              {isThirdBill && (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>Third Running Bill Rule (RA-03 - Final):</span>
                  </div>
                  <p>
                    Per tender contract, exactly <strong>10% Retention Money</strong> is withheld on this third running bill. It enters the retention escrow ledger and will be released after the <strong>6-Month Defect Liability Period (DLP)</strong>.
                  </p>
                </div>
              )}

              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Work Order Statutory Deductions (Direct by UBL):</span>
                <strong className="text-emerald-400">16% Sales Tax (PRA) + 9% Income Tax (WHT)</strong>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <label className="text-slate-400 block mb-1">Advance Mobilization Recovery (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={advanceDeductionPercent}
                    onChange={(e) => setAdvanceDeductionPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Retention Money Deduction (%): {isThirdBill && <span className="text-amber-400 font-bold">(Locked at 10% for RA-03)</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={retentionPercent}
                    onChange={(e) => setRetentionPercent(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Certify Current Physical Quantities for BOQ Items:
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {project.boq.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">{item.itemCode}: {item.description}</div>
                        <div className="text-[11px] text-slate-400">
                          Contract: {item.contractQuantity} {item.unit} | Prev Certified: {item.completedQuantity} | Remaining: <strong className="text-amber-400">{item.remainingQuantity}</strong>
                        </div>
                      </div>
                      <div className="w-32">
                        <input
                          type="number"
                          min="0"
                          max={item.remainingQuantity}
                          value={certQuantities[item.id] || 0}
                          onChange={(e) =>
                            setCertQuantities({
                              ...certQuantities,
                              [item.id]: Math.min(item.remainingQuantity, Math.max(0, Number(e.target.value))),
                            })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-emerald-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGeneratingRABill(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Compute & Certify RA Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RELEASE RETENTION MONEY */}
      {releaseModalEntryId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Release Retention from Escrow</h3>
              <button onClick={() => setReleaseModalEntryId(null)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReleaseRetentionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Release Amount (PKR):</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={releaseAmount}
                  onChange={(e) => setReleaseAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Bank Payment Reference / Cheque #:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MBL-CHQ-881290"
                  value={releaseBankRef}
                  onChange={(e) => setReleaseBankRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Release Authorization Notes / DLP Expiry:</label>
                <textarea
                  rows={2}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="e.g. Approved after 180-day DLP snag clearance."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReleaseModalEntryId(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Confirm Escrow Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RA BILL CERTIFICATE PRINT / PREVIEW MODAL */}
      {previewRABill && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-white text-slate-950 w-full max-w-4xl rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl font-sans">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">NAEEM BUILDER</h2>
                <p className="text-xs font-semibold text-slate-600 uppercase">
                  Interim Payment Certificate — Running Account ({previewRABill.billNumber})
                </p>
                <p className="text-[11px] text-slate-500">Project: {project.title} ({project.projectCode})</p>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm bg-slate-900 text-white px-2.5 py-1 rounded inline-block">
                  {previewRABill.billNumber}
                </div>
                <div className="text-xs text-slate-600 mt-1">Date: {previewRABill.billDate}</div>
              </div>
            </div>

            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2">Item</th>
                  <th className="p-2">Description</th>
                  <th className="p-2 text-right">Contract Rate</th>
                  <th className="p-2 text-right">Prev Certified</th>
                  <th className="p-2 text-right text-emerald-800">Current Cert</th>
                  <th className="p-2 text-right font-bold">Cumulative</th>
                  <th className="p-2 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {previewRABill.items.map((i, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-sans font-semibold text-slate-900">{i.itemCode}</td>
                    <td className="p-2 font-sans text-slate-800 max-w-xs">{i.description}</td>
                    <td className="p-2 text-right">{i.contractRate.toLocaleString()}</td>
                    <td className="p-2 text-right text-slate-500">{i.previousCertifiedQuantity}</td>
                    <td className="p-2 text-right text-emerald-800 font-bold">{i.currentCertifiedQuantity}</td>
                    <td className="p-2 text-right font-bold">{i.cumulativeQuantity}</td>
                    <td className="p-2 text-right font-bold text-slate-950">{i.currentAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1 font-mono text-right max-w-md ml-auto">
              <div className="flex justify-between">
                <span>Current Certified Gross:</span>
                <span className="font-bold">PKR {previewRABill.currentBillGross.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-800">
                <span>Advance Mobilization Deduction ({previewRABill.advanceMobilizationDeduction > 0 ? '10%' : '0%'}):</span>
                <span>- PKR {previewRABill.advanceMobilizationDeduction.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-blue-800">
                <span>Retention Money Deduction ({previewRABill.retentionMoneyDeductionPercent}%):</span>
                <span>- PKR {previewRABill.retentionMoneyDeductionAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-700 font-semibold pt-1 border-t border-slate-300">
                <span>Net Certified Bill Amount:</span>
                <span>PKR {previewRABill.netPayableAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>16% Punjab Sales Tax (PRA - Paid by UBL):</span>
                <span>- PKR {Math.round(previewRABill.currentBillGross * 0.16).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>9% Income Tax WHT (FBR - Paid by UBL):</span>
                <span>- PKR {Math.round(previewRABill.currentBillGross * 0.09).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-900 pt-1 border-t border-slate-400">
                <span>Net Online Transfer to Naeem Builder:</span>
                <span>PKR {Math.max(0, Math.round(previewRABill.netPayableAmount - (previewRABill.currentBillGross * 0.25))).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t border-slate-200 font-sans">
              <button
                onClick={() => setPreviewRABill(null)}
                className="px-4 py-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
