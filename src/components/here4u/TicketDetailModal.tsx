import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  ShoppingCart,
  Wrench,
  FileCheck,
  Receipt,
  Lock,
  Unlock,
  Sparkles,
  Building,
  User,
  ShieldAlert,
  Send,
  Mail,
  Printer,
  Download,
  Upload,
  Camera,
  Truck,
  Paperclip,
  Check,
  FileCheck2,
  Paintbrush,
  Zap,
  Briefcase,
  CheckCheck,
} from 'lucide-react';
import { useERP, calculateDistanceMeters } from '../../context/ERPContext';
import {
  Ticket,
  TicketStatus,
  OFFICIAL_COMPLAINT_TYPES,
  OfficialComplaintType,
  mapComplaintTypeToCategory,
} from '../../types/erp';
import { GmailThreadView } from './GmailThreadView';
import { OfficialQuotationView } from './OfficialQuotationView';

export interface PresetStaffMember {
  trade: string;
  name: string;
  phone: string;
  role: string;
  icon: string;
}

export const PRESET_FIELD_STAFF: PresetStaffMember[] = [
  { trade: 'Electrician', name: 'Muhammad Rashid', phone: '0312-9876543', role: 'Senior MEP Electrician', icon: '⚡' },
  { trade: 'Electrician', name: 'Sajid Mehmood', phone: '0304-5544332', role: 'Field Electrician', icon: '⚡' },
  { trade: 'Painter', name: 'Muhammad Akram', phone: '0321-7654321', role: 'Master Painter & Surface Specialist', icon: '🎨' },
  { trade: 'Painter', name: 'Tariq Bashir', phone: '0345-8877665', role: 'Commercial Surface Painter', icon: '🎨' },
  { trade: 'HVAC / AC Tech', name: 'Asif Ali', phone: '0333-1122334', role: 'HVAC & Chiller Tech', icon: '❄️' },
  { trade: 'Civil / Mason', name: 'Zahid Hussain', phone: '0315-4433221', role: 'Civil Mason & Tile Worker', icon: '🧱' },
  { trade: 'Aluminium & Glass', name: 'Imran Ali', phone: '0300-9988776', role: 'Aluminium & Glass Specialist', icon: '🪚' },
  { trade: 'Plumber', name: 'Nasir Abbas', phone: '0322-6655443', role: 'Plumbing & Sanitary Tech', icon: '🔧' },
];

interface TicketDetailModalProps {
  ticketId: string;
  onClose: () => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticketId, onClose }) => {
  const {
    tickets,
    branches,
    consolidatedInvoices,
    updateTicket,
    advanceTicketStatus,
    generateCompletionNote,
    signAndVerifyCompletionNote,
    uploadSignedCompletionCopy,
    assignWorkToStaff,
    sendSignedCompletionToGmail,
    depositHardCopyToOffice,
    updateCompletionHardCopyDispatch,
    unlockAndCreateInvoice,
    recordPaymentReceipt,
    updateTicketDossierStatus,
    activeRole,
    addAuditLog,
    assignOfficialTicketNumber,
    addEstimateItem,
    removeEstimateItem,
  } = useERP();

  const ticket = tickets.find((t) => t.id === ticketId);
  const [activeTab, setActiveTab] = useState<string>('OVERVIEW');
  const [showOfficialQuotationModal, setShowOfficialQuotationModal] = useState(false);
  const [activeOfficialDocType, setActiveOfficialDocType] = useState<'ESTIMATE' | 'DELIVERY_NOTE' | 'INVOICE'>('ESTIMATE');

  // Staff Work Allocation state (Electrician, Painter, etc.)
  const [showAssignStaffModal, setShowAssignStaffModal] = useState(false);
  const [assignTrade, setAssignTrade] = useState('Electrician');
  const [assignStaffName, setAssignStaffName] = useState('Muhammad Rashid');
  const [assignStaffPhone, setAssignStaffPhone] = useState('0312-9876543');
  const [assignInstructions, setAssignInstructions] = useState('');

  // Send Signed Stamped Delivery Note to Gmail Thread state
  const [showSendGmailCertModal, setShowSendGmailCertModal] = useState(false);
  const [gmailCustomBody, setGmailCustomBody] = useState('');
  const [isSendingToGmail, setIsSendingToGmail] = useState(false);
  const [gmailSendSuccessMsg, setGmailSendSuccessMsg] = useState<string | null>(null);

  // Deposit Physical Hard Copy into Office Accounts Desk state
  const [showDepositOfficeModal, setShowDepositOfficeModal] = useState(false);
  const [depositOfficerName, setDepositOfficerName] = useState('Asif Nawaz (Head Office Accounts Desk, Lahore)');
  const [depositDateVal, setDepositDateVal] = useState(new Date().toISOString().split('T')[0]);
  const [depositCabinetRef, setDepositCabinetRef] = useState('Cabinet-B / UBL Dossier Box-2026');
  const [depositNotesVal, setDepositNotesVal] = useState('Original signed & stamped copy physically filed in accounts. Ready for billing.');

  // Link Official Ticket Number state
  const [inputOfficialTicketNum, setInputOfficialTicketNum] = useState('');
  const [isLinkingTicket, setIsLinkingTicket] = useState(false);

  // Estimate line items form state
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('Job');
  const [newItemInternalRate, setNewItemInternalRate] = useState(12000);
  const [newItemClientRate, setNewItemClientRate] = useState(16500);

  // Completion Certificate Signed & Stamped Upload state
  const [showUploadCertModal, setShowUploadCertModal] = useState(false);
  const [certSignatoryName, setCertSignatoryName] = useState('');
  const [certSignatoryDesignation, setCertSignatoryDesignation] = useState('Branch Operations Manager (BOM)');
  const [certUploadFileName, setCertUploadFileName] = useState('');
  const [certUploadFilePreview, setCertUploadFilePreview] = useState<string | null>(null);

  // Hard Copy Dispatch to Head Office state
  const [showDispatchCertModal, setShowDispatchCertModal] = useState(false);
  const [dispatchCourier, setDispatchCourier] = useState('Company Field Rider / TCS');
  const [dispatchTrackingRef, setDispatchTrackingRef] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedAtOfficeBy, setReceivedAtOfficeBy] = useState('Accounts Officer (Head Office, Lahore)');
  const [receivedAtOfficeDate, setReceivedAtOfficeDate] = useState(new Date().toISOString().split('T')[0]);

  // Printable view modal state
  const [showPrintCertModal, setShowPrintCertModal] = useState(false);

  // Sign & Stamp state (quick fallback)
  const [signName, setSignName] = useState('Tariq Mehmood Chishti');
  const [signDesignation, setSignDesignation] = useState('Branch Operations Manager (BOM)');

  // Payment receipt state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [whtDeduction, setWhtDeduction] = useState<number>(0);
  const [bankRef, setBankRef] = useState('');
  const [payMethod, setPayMethod] = useState<'Bank Transfer' | 'Cheque' | 'Direct Deposit'>('Bank Transfer');

  // AI Approval detector state
  const [aiAnalyzingApproval, setAiAnalyzingApproval] = useState(false);
  const [aiApprovalResult, setAiApprovalResult] = useState<any>(null);

  if (!ticket) return null;

  const branch = branches.find((b) => b.id === ticket.branchId || (ticket.ublBranchCode && b.code === ticket.ublBranchCode)) || branches[0];
  const isProvisional = ticket.ticketNumberStatus === 'PROVISIONAL_PENDING' || ticket.ticketNumber === 'PENDING';

  // GPS Proximity check
  const siteGps = ticket.siteVisit?.gpsEvent;
  const distanceToBranch =
    siteGps && branch
      ? calculateDistanceMeters(siteGps.latitude, siteGps.longitude, branch.latitude, branch.longitude)
      : 28;
  const isWithinGpsProximity = distanceToBranch <= 200;

  const getRecommendedTrade = () => {
    if (!ticket) return { trade: 'Electrician', name: 'Muhammad Rashid', phone: '0312-9876543' };
    const comp = (ticket.complaintType || '').toLowerCase();
    const cat = (ticket.category || '').toLowerCase();
    if (comp.includes('paint') || comp.includes('seepage') || comp.includes('tile')) {
      return { trade: 'Painter', name: 'Muhammad Akram', phone: '0321-7654321' };
    }
    if (comp.includes('ac') || cat === 'hvac') {
      return { trade: 'HVAC / AC Tech', name: 'Asif Ali', phone: '0333-1122334' };
    }
    if (comp.includes('plumb') || cat === 'plumbing') {
      return { trade: 'Plumber', name: 'Nasir Abbas', phone: '0322-6655443' };
    }
    if (comp.includes('glass') || comp.includes('door') || comp.includes('wood') || cat === 'glass & aluminium') {
      return { trade: 'Aluminium & Glass', name: 'Imran Ali', phone: '0300-9988776' };
    }
    if (comp.includes('grill') || comp.includes('ramp') || cat === 'civil') {
      return { trade: 'Civil / Mason', name: 'Zahid Hussain', phone: '0315-4433221' };
    }
    return { trade: 'Electrician', name: 'Muhammad Rashid', phone: '0312-9876543' };
  };

  // Handle AI Approval analysis
  const handleCheckApprovalWithAI = async () => {
    setAiAnalyzingApproval(true);
    try {
      const sampleEmailText = `From: hamaz.aftab@ubl.com.pk
Subject: RE: Quotation for UBL Branch ${ticket.ublBranchCode || branch.code} - Approval Granted
Dear M/s Naeem Taj,
We have reviewed your quotation for PKR ${(ticket.quotation?.totalAmount || ticket.estimates[0]?.totalEstimatedAmount || 26332).toLocaleString()} including PRA GST for maintenance work at UBL ${branch.name}.
United Bank Limited hereby grants formal financial authorization. Please proceed immediately on urgent basis. PO reference: UBL/ADM/2026/${ticket.ublBranchCode || '0962'}-APP.
Regards, Hamaz Aftab & Anum Shahid, Shared Services Group, United Bank Limited.`;

      const res = await fetch('/api/ai/detect-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText: sampleEmailText, estimateAmount: ticket.quotation?.totalAmount || 26332 }),
      });
      const data = await res.json();
      setAiApprovalResult(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzingApproval(false);
    }
  };

  const handleUpdateComplaintType = (newType: OfficialComplaintType) => {
    const mappedCategory = mapComplaintTypeToCategory(newType);
    updateTicket(ticket.id, (prev) => ({
      ...prev,
      complaintType: newType,
      category: mappedCategory,
      bankComplaintDetails: prev.bankComplaintDetails
        ? {
            ...prev.bankComplaintDetails,
            complaintType: newType,
          }
        : undefined,
    }));
    addAuditLog('UPDATE_STATUS', 'Ticket', ticket.id, `Complaint Type updated to ${newType}`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.invoice || paymentAmount <= 0) return;

    recordPaymentReceipt(ticket.invoice.id, {
      receiptNumber: `REC-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split('T')[0],
      amount: paymentAmount + whtDeduction,
      paymentMethod: payMethod,
      bankReference: bankRef || 'ONLINE-TRF-MBL',
      withholdingTaxDeducted: whtDeduction,
      otherDeductions: 0,
      netReceived: paymentAmount,
    });

    setPaymentAmount(0);
    setWhtDeduction(0);
    setBankRef('');
  };

  const tabs = [
    { id: 'OVERVIEW', label: '1. Overview' },
    { id: 'GMAIL_THREAD', label: `✉ Gmail Bank Thread (${ticket.gmailThread?.length || (ticket.emailSource ? 1 : 0)})` },
    { id: 'SITE_VISIT', label: '2. Site Visit + GPS' },
    { id: 'VERIFICATION', label: '3. Job Verification' },
    { id: 'ESTIMATE', label: '4. Estimate & Quotation' },
    { id: 'APPROVAL', label: '5. Approvals' },
    { id: 'PURCHASING', label: '6. Purchasing & PO' },
    { id: 'WORK_ORDER', label: '7. Work Order' },
    { id: 'DELIVERY_NOTE', label: '8. Delivery Note (Rule 9 & 10)' },
    { id: 'INVOICE', label: '9. Invoice & Payment (Rule 12)' },
    { id: 'COST_CONTROL', label: '10. Job Cost Control' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm cursor-default"
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {isProvisional ? (
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    PENDING TICKET # • UBL Branch {ticket.ublBranchCode || branch.code}
                  </span>
                ) : (
                  <span className="font-mono text-sm font-bold text-amber-400">{ticket.ticketNumber}</span>
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {ticket.priority} Priority
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {ticket.status}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  {ticket.complaintType || ticket.bankComplaintDetails?.complaintType || `${ticket.category} Maintenance`}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-0.5">{ticket.title}</h2>
              <p className="text-xs text-slate-400">
                United Bank Limited • {ticket.branchName} (Code: {ticket.ublBranchCode || branch.code}) • BOM: {ticket.reportedBy}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => advanceTicketStatus(ticket.id)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20"
            >
              <span>Advance Workflow</span>
              <span>→</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Provisional Branch-First Banner */}
        {isProvisional && (
          <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 border-b border-cyan-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                    Branch-First Estimate (Ticket Pending)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-mono font-bold">
                    UBL Branch Code: {ticket.ublBranchCode || branch.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Provisional Code: <strong className="text-cyan-400 font-mono">{ticket.provisionalEstimateCode || ticket.id}</strong> • Official ticket number is issued afterward by UBL HERE4U desk.
                </p>
              </div>
            </div>

            {/* Quick form to link official ticket number */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inputOfficialTicketNum.trim()) return;
                assignOfficialTicketNumber(ticket.id, inputOfficialTicketNum.trim());
                setInputOfficialTicketNum('');
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Enter UBL Ticket # (e.g. 125890)"
                value={inputOfficialTicketNum}
                onChange={(e) => setInputOfficialTicketNum(e.target.value)}
                className="bg-slate-950 border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={!inputOfficialTicketNum.trim()}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50 shadow-md shadow-cyan-500/20 whitespace-nowrap cursor-pointer"
              >
                Link Official Ticket #
              </button>
            </form>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 bg-slate-950/40 px-4 overflow-x-auto flex space-x-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2.5 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Scope of Work & Maintenance Request
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Reported: {ticket.reportedDate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed mb-3">{ticket.scopeDescription}</p>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-medium text-slate-400">Official Bank Complaint Type:</span>
                      <select
                        value={ticket.complaintType || ticket.bankComplaintDetails?.complaintType || 'Paint/ Tile / Seepage / Front Elevation - - -'}
                        onChange={(e) => handleUpdateComplaintType(e.target.value as OfficialComplaintType)}
                        className="bg-slate-900 border border-amber-500/40 text-amber-300 text-xs rounded-lg px-2.5 py-1 font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {OFFICIAL_COMPLAINT_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Trade Category: <strong className="text-slate-200">{ticket.category}</strong></span>
                      <span>Client Portal: <strong className="text-slate-200">HERE4U (Bank Inbound)</strong></span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Branch Master & BOM Contact (Section 5)
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Branch Name:</span>
                      <span className="font-semibold text-slate-200">{branch.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Code / Type:</span>
                      <span className="text-slate-200">{branch.code} • {branch.branchType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">BOM (Branch Manager):</span>
                      <span className="font-semibold text-amber-400">{branch.bomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">BOM Phone:</span>
                      <span className="text-slate-200">{branch.bomContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Address:</span>
                      <span className="text-slate-300 text-right max-w-[220px]">{branch.completeAddress}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inbound Gmail & Bank Complaint Banner */}
              <div className="bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 p-4 rounded-xl border border-red-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Linked Gmail Complaint &amp; Dispatch Thread
                      </span>
                      <span className="text-[10px] bg-red-600/30 text-red-300 px-2 py-0.5 rounded font-mono font-bold">
                        {ticket.gmailThread?.length || 1} Messages
                      </span>
                      {ticket.approval?.status === 'Approved' && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Email Approved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Complaint #{ticket.bankComplaintDetails?.complaintNumber || ticket.ticketNumber} • {ticket.branchName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOfficialQuotationModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Quotation PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('GMAIL_THREAD')}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
                  >
                    <span>Open Full Gmail Thread</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {ticket.emailSource && (
                <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        Linked Inbound Gmail Work Request (Rule 2)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{ticket.emailSource.receivedAt}</span>
                  </div>
                  <div className="text-xs font-semibold text-white mb-1">{ticket.emailSource.subject}</div>
                  <div className="text-[11px] text-slate-400 mb-2">From: {ticket.emailSource.sender}</div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
                    {ticket.emailSource.bodySnippet}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: GMAIL THREAD */}
          {activeTab === 'GMAIL_THREAD' && (
            <div className="space-y-4">
              <GmailThreadView
                ticket={ticket}
                onOpenQuotationPreview={() => setShowOfficialQuotationModal(true)}
              />
            </div>
          )}

          {/* TAB 2: SITE VISIT & GPS */}
          {activeTab === 'SITE_VISIT' && (
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Site Visit Evidence & GPS Verification (Section 8)
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    isWithinGpsProximity ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-red-500/15 text-red-400 border-red-500/30'
                  }`}>
                    {isWithinGpsProximity ? 'GPS Proximity Verified (<200m)' : 'GPS Flagged (>200m)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Assigned Engineer:</span>
                      <span className="font-semibold text-slate-200">
                        {ticket.siteVisit?.engineerName || 'Engr. Bilal Farooq'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Scheduled Date:</span>
                      <span className="text-slate-200">{ticket.siteVisit?.scheduledDate || '2026-09-18 10:30'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Completed Date:</span>
                      <span className="text-slate-200">{ticket.siteVisit?.completedDate || '2026-09-18 11:15'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Field GPS Coordinates:</span>
                      <span className="font-mono text-cyan-400">
                        {siteGps?.latitude || 31.5206}, {siteGps?.longitude || 74.3589}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Registered Branch GPS:</span>
                      <span className="font-mono text-slate-300">
                        {branch.latitude}, {branch.longitude}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Calculated Distance:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {distanceToBranch} meters away (Accurate within ±{siteGps?.accuracyMeters || 6}m)
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <h4 className="font-bold text-slate-300 text-xs mb-1.5">Site Findings & Condition:</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {ticket.siteVisit?.siteFindings || 'Compressor contactor coil melted. Dual run capacitor shorted. 400A MCCB requires recalibration and thermal scanning.'}
                    </p>
                    <div className="mt-3 p-2 bg-slate-950 rounded text-[11px] text-slate-400">
                      {siteGps?.notes || 'GPS verified: Within 28 meters of Gulberg branch registered coordinates.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: JOB VERIFICATION */}
          {activeTab === 'VERIFICATION' && (
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Job Verification & Material Assessment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Measurements & Technical Notes:</span>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-200">
                    {ticket.jobVerification?.measurementsNotes || 'Cable run 18 meters 35mm² 4-core copper wire; Contactor 65A 3-pole Schneider; 80uF dual heavy duty capacitor.'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Required Work Summary:</span>
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-200">
                    {ticket.jobVerification?.requiredWorkSummary || 'Replacement of magnetic contactor, wiring rebuild, vacuum degassing, and 410A refrigerant charge.'}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Required Materials for Purchasing:</h4>
                <div className="space-y-1.5">
                  {(ticket.jobVerification?.requiredMaterials || [
                    { name: 'Magnetic Contactor 65A 3P Schneider', quantity: 2, unit: 'Nos' },
                    { name: 'R-410A Refrigerant Cylinder', quantity: 1, unit: 'Cylinder' },
                    { name: 'Dual Run Capacitor 80+7.5 uF', quantity: 2, unit: 'Nos' }
                  ]).map((m, idx) => (
                    <div key={idx} className="flex justify-between bg-slate-900 px-3 py-2 rounded text-xs">
                      <span className="text-slate-300">{m.name}</span>
                      <span className="font-mono text-amber-400">{m.quantity} {m.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ESTIMATE & QUOTATION */}
          {activeTab === 'ESTIMATE' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-center justify-between">
                <div>
                  <strong className="font-semibold">Section 6 Rule:</strong> Estimate is the internal costing document with markup and margin analysis. Quotation is the separate formal client-facing commercial proposal.
                </div>
                <span className="font-mono bg-blue-500/20 px-2 py-0.5 rounded text-[11px]">v1 Active</span>
              </div>

              {/* Estimate Items Table Header & Add Item Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  Estimate Line Items &amp; BOQ Rates:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddItemForm(!showAddItemForm)}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                >
                  {showAddItemForm ? '✕ Close Form' : '+ Add Line Item'}
                </button>
              </div>

              {/* Add Item Form */}
              {showAddItemForm && (
                <div className="bg-slate-950 p-3.5 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="font-bold text-xs text-amber-400">Add Line Item to Estimate:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] text-slate-400 block mb-1">Item Description:</label>
                      <input
                        type="text"
                        placeholder="e.g. Ramp masonry patch / Floor spring replacement"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Unit:</label>
                      <input
                        type="text"
                        value={newItemUnit}
                        onChange={(e) => setNewItemUnit(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quantity:</label>
                      <input
                        type="number"
                        min="1"
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(Number(e.target.value) || 1)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Internal Cost Rate:</label>
                      <input
                        type="number"
                        value={newItemInternalRate}
                        onChange={(e) => setNewItemInternalRate(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-amber-400 block mb-1 font-bold">Client Quoted Rate:</label>
                      <input
                        type="number"
                        value={newItemClientRate}
                        onChange={(e) => setNewItemClientRate(Number(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-amber-300 font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddItemForm(false)}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-400 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newItemDesc.trim()) return;
                        addEstimateItem(ticket.id, {
                          itemCode: `${ticket.category.slice(0, 3).toUpperCase()}-0${(ticket.estimates[0]?.items.length || 0) + 1}`,
                          description: newItemDesc.trim(),
                          category: ticket.category,
                          unit: newItemUnit,
                          quantity: newItemQty,
                          internalRate: newItemInternalRate,
                          internalAmount: newItemInternalRate * newItemQty,
                          clientRate: newItemClientRate,
                          clientAmount: newItemClientRate * newItemQty,
                        });
                        setNewItemDesc('');
                        setShowAddItemForm(false);
                      }}
                      className="px-4 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                    >
                      Save Item to Estimate
                    </button>
                  </div>
                </div>
              )}

              {/* Estimate Items Table */}
              <div className="bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Item Code</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty / Unit</th>
                      <th className="py-2.5 px-3 text-right">Internal Rate</th>
                      <th className="py-2.5 px-3 text-right">Internal Cost</th>
                      <th className="py-2.5 px-3 text-right text-amber-400">Client Rate</th>
                      <th className="py-2.5 px-3 text-right text-amber-400">Client Amount</th>
                      <th className="py-2.5 px-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {(ticket.estimates[0]?.items || []).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-400 font-sans">{item.itemCode}</td>
                        <td className="py-2 px-3 text-slate-200 font-sans max-w-xs">{item.description}</td>
                        <td className="py-2 px-3 text-center text-slate-300">{item.quantity} {item.unit}</td>
                        <td className="py-2 px-3 text-right text-slate-400">Rs. {item.internalRate?.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-slate-300">Rs. {item.internalAmount?.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-amber-400">Rs. {item.clientRate?.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-amber-300 font-bold">Rs. {item.clientAmount?.toLocaleString()}</td>
                        <td className="py-2 px-2 text-center font-sans">
                          {(ticket.estimates[0]?.items || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEstimateItem(ticket.id, item.id)}
                              className="text-red-400 hover:text-red-300 text-xs px-1"
                              title="Delete item"
                            >
                              ✕
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Internal Cost Structure</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Direct Material Cost:</span>
                    <span className="font-mono text-slate-200">Rs. {ticket.estimates[0]?.directMaterialCost?.toLocaleString() || '69,100'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Direct Labour Cost:</span>
                    <span className="font-mono text-slate-200">Rs. {ticket.estimates[0]?.directLabourCost?.toLocaleString() || '12,000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Allocated Overhead:</span>
                    <span className="font-mono text-slate-200">Rs. {ticket.estimates[0]?.allocatedOverhead?.toLocaleString() || '4,500'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-white">
                    <span>Total Direct Job Cost:</span>
                    <span className="font-mono text-amber-400">Rs. {ticket.estimates[0]?.totalDirectCost?.toLocaleString() || '81,100'}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-slate-400 uppercase tracking-wider mb-1">Client Commercial Quotation</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quoted Before Tax:</span>
                    <span className="font-mono text-slate-200">Rs. {ticket.estimates[0]?.quotedAmountBeforeTax?.toLocaleString() || '95,000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">PRA GST (16%):</span>
                    <span className="font-mono text-slate-200">Rs. {ticket.estimates[0]?.taxAmount?.toLocaleString() || '15,200'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Gross Margin:</span>
                    <span className="font-mono text-emerald-400 font-bold">{ticket.estimates[0]?.targetGrossMarginPercent || 25.5}%</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800 font-bold text-base text-emerald-400">
                    <span>Total Quoted to Client:</span>
                    <span className="font-mono">Rs. {ticket.estimates[0]?.totalEstimatedAmount?.toLocaleString() || '110,200'}</span>
                  </div>
                </div>

                {/* Official Naeem Builder Quotation Letterhead Actions */}
                <div className="md:col-span-2 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 p-4 rounded-xl border border-red-500/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        Official Client Quotation Document
                        <span className="text-[10px] bg-red-600/30 text-red-300 px-2 py-0.5 rounded font-mono">
                          Letterhead PDF
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {ticket.branchName} • Ticket #{ticket.ticketNumber} • Quoted: PKR {(ticket.quotation?.totalAmount || ticket.estimates[0]?.totalEstimatedAmount || 26332).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOfficialDocType('ESTIMATE');
                        setShowOfficialQuotationModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Preview Official Letterhead</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const grandTotal = ticket.quotation?.totalAmount || ticket.estimates[0]?.totalEstimatedAmount || 26332;
                        const outboundQuoMsg = {
                          id: `msg-quo-${Date.now()}`,
                          senderName: 'Naeem Builder',
                          senderEmail: 'naeembuilder48@gmail.com',
                          senderRole: 'Official Proposal Dispatch',
                          recipientEmails: ['here4u@ubl.com.pk', 'hamaz.aftab@ubl.com.pk', 'anum.shahid@ubl.com.pk'],
                          date: new Date().toLocaleString(),
                          subject: `Re: Ticket No :${ticket.ticketNumber} - Official Quotation Attached`,
                          body: `Dear Concerned,\n\nAttached please find the quotation for your consideration and approval.\n\nRegards,\nNaeem Builder\n0347-6066666`,
                          isNaeemBuilderOutbound: true,
                          attachments: [
                            { name: `${ticket.branchName.toUpperCase()} - TICKET # ${ticket.ticketNumber}.pdf`, size: '286 KB', type: 'pdf' as const }
                          ]
                        };

                        updateTicket(ticket.id, (prev) => ({
                          ...prev,
                          status: 'Financial Approval Pending',
                          gmailThread: [...(prev.gmailThread || []), outboundQuoMsg],
                        }));

                        addAuditLog('SUBMIT_ESTIMATE', 'Ticket', ticket.ticketNumber, `Quotation dispatched via Gmail to Bank HERE4U team (PKR ${grandTotal.toLocaleString()})`);
                        setActiveTab('GMAIL_THREAD');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Quotation to Bank via Gmail</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: APPROVALS & AI DETECTOR */}
          {activeTab === 'APPROVAL' && (
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Financial & Work Authorization Record (Section 6)
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    ticket.approval?.status === 'Approved'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}>
                    {ticket.approval?.status || 'Pending Approval'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Sanctioning Approver:</span>
                    <span className="font-semibold text-slate-200">{ticket.approval?.approverName || 'Anum Shahid (Shared Services)'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Approver Designation:</span>
                    <span className="text-slate-300">{ticket.approval?.approverDesignation || 'Shared Services Group, United Bank Limited'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">PO / Authorization Ref:</span>
                    <span className="font-mono text-amber-400">{ticket.approval?.approvalReference || 'UBL/SSG/2026/125136-APR'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Authorized Amount:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      PKR {ticket.approval?.approvedAmount ? ticket.approval.approvedAmount.toLocaleString() : (ticket.quotation?.totalAmount || 26332).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1 font-semibold">Client Approval Remarks:</span>
                  <p className="text-slate-300">
                    {ticket.approval?.remarks || 'Sanctioned as per submitted quotation. Work to be conducted without disruption to branch operations.'}
                  </p>
                </div>

                {/* 1-Click Sync from Gmail Approval */}
                {ticket.approval?.status !== 'Approved' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const apprAmount = ticket.quotation?.totalAmount || ticket.estimates[0]?.totalEstimatedAmount || 26332;
                        const poRef = `UBL/SSG/2026/${ticket.ticketNumber}-APR`;
                        updateTicket(ticket.id, (prev) => ({
                          ...prev,
                          status: 'Approved',
                          approval: {
                            id: `APP-${ticket.ticketNumber}`,
                            ticketId: ticket.id,
                            requestDate: new Date().toISOString().split('T')[0],
                            responseDate: new Date().toISOString().split('T')[0],
                            requestedAmount: apprAmount,
                            approvedAmount: apprAmount,
                            approverName: 'Anum Shahid',
                            approverEmail: 'anum.shahid@ubl.com.pk',
                            approverDesignation: 'Shared Services Group, United Bank Limited',
                            approvalReference: poRef,
                            status: 'Approved',
                            remarks: 'Formally sanctioned via Gmail correspondence thread from Anum Shahid.',
                          },
                        }));
                        addAuditLog('APPROVE_TICKET', 'Approval', poRef, `Approved quotation for PKR ${apprAmount.toLocaleString()}`);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Record &amp; Sync Client Approval from Gmail Thread</span>
                    </button>
                  </div>
                )}

                {/* Post-Approval Next Step Banner: Give Work to Electrician, Painter, Staff */}
                {ticket.approval?.status === 'Approved' && (
                  <div className="mt-3 p-3.5 bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-950 border border-purple-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-base border border-purple-500/30 shrink-0">
                        {ticket.workOrder?.assignedTrade?.includes('Paint') ? '🎨' : '⚡'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Approval Confirmed: Ready to Give Work to Field Staff</span>
                          <span className="text-[10px] font-mono text-purple-300 px-1.5 py-0.2 bg-purple-500/20 rounded">
                            {ticket.workOrder?.assignedTrade || 'Electrician'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Assigned technician: <strong className="text-purple-200">{ticket.workOrder?.primaryWorkExecutor || 'Muhammad Rashid (Electrician)'}</strong>. Staff will take printed Delivery Note to concern branch for BOM sign &amp; stamp.
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const rec = getRecommendedTrade();
                          setAssignTrade(rec.trade);
                          setAssignStaffName(rec.name);
                          setAssignStaffPhone(rec.phone);
                          setShowAssignStaffModal(true);
                        }}
                        className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/20 whitespace-nowrap cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Assign Trade Staff →</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('DELIVERY_NOTE')}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 whitespace-nowrap cursor-pointer"
                      >
                        Print Delivery Note →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Approval Signal Inspector (Section 21) */}
              <div className="p-4 bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      AI Approval-Signal Detection (Section 21)
                    </h4>
                  </div>
                  <button
                    onClick={handleCheckApprovalWithAI}
                    disabled={aiAnalyzingApproval}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-all flex items-center gap-1.5"
                  >
                    {aiAnalyzingApproval ? 'Analyzing Email...' : 'Inspect Email with Gemini'}
                  </button>
                </div>

                <p className="text-xs text-slate-400">
                  Automated natural language detection to inspect incoming client emails for explicit financial authorization and PO numbers.
                </p>

                {aiApprovalResult && (
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Status: {aiApprovalResult.status}</span>
                      <span>Confidence: {Math.round(aiApprovalResult.confidenceScore * 100)}%</span>
                    </div>
                    <div className="text-slate-300 font-sans">
                      <strong>Approver:</strong> {aiApprovalResult.approverName} | <strong>Ref:</strong> {aiApprovalResult.purchaseOrderOrRef}
                    </div>
                    <div className="text-slate-400 font-sans text-[11px]">
                      {aiApprovalResult.clientRemarks}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: PURCHASING BEFORE WORK */}
          {activeTab === 'PURCHASING' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <strong className="font-semibold">Section 7 Rule:</strong> Purchasing Before Work: Approval → Purchase Request → Supplier Quotes → PO → Material Receiving (GRN) → Stock Allocation → Work Start.
              </div>

              {ticket.purchaseOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No purchase orders logged. Material will be allocated from inventory.
                </div>
              ) : (
                ticket.purchaseOrders.map((po) => (
                  <div key={po.id} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-amber-400" />
                        <span className="font-mono font-bold text-white text-xs">{po.poNumber}</span>
                        <span className="text-slate-400 text-xs">({po.supplierName})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {po.status}
                      </span>
                    </div>

                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                        <tr>
                          <th className="py-2">Item</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Unit Rate</th>
                          <th className="py-2 text-right">Total</th>
                          <th className="py-2 text-center">GRN Received</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 font-mono">
                        {po.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-2 text-slate-200 font-sans">{item.materialName}</td>
                            <td className="py-2 text-center text-slate-300">{item.quantity} {item.unit}</td>
                            <td className="py-2 text-right text-slate-400">Rs. {item.supplierQuoteRate.toLocaleString()}</td>
                            <td className="py-2 text-right text-amber-400">Rs. {item.totalRate.toLocaleString()}</td>
                            <td className="py-2 text-center text-emerald-400 font-bold">{item.receivedQty} {item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">GRN Ref: <strong className="text-slate-200">{po.grnNumber || 'GRN-2026-0312'}</strong></span>
                      <span className="font-bold text-white">Total PO: <strong className="font-mono text-amber-400">Rs. {po.totalCost.toLocaleString()}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: WORK ORDER & EXECUTION */}
          {activeTab === 'WORK_ORDER' && (
            <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Work Order &amp; Trade Staff Assignment (Rule 10)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Assign work to Electrician, Painter, or Trade Staff. The assigned technician automatically becomes &apos;Delivered By&apos; on the physical Delivery Note.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const rec = getRecommendedTrade();
                      setAssignTrade(rec.trade);
                      setAssignStaffName(rec.name);
                      setAssignStaffPhone(rec.phone);
                      setShowAssignStaffModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Assign / Change Staff</span>
                  </button>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    {ticket.workOrder?.status || 'Active Work Order'}
                  </span>
                </div>
              </div>

              {/* Staff Assignment & Trade Recommendation Card */}
              <div className="p-4 bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 rounded-xl border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-lg border border-purple-500/30 shadow-inner">
                      {ticket.workOrder?.assignedTrade?.includes('Paint') ? '🎨' : ticket.workOrder?.assignedTrade?.includes('AC') ? '❄️' : '⚡'}
                    </div>
                    <div>
                      <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <span>Assigned Primary Executor (Rule 10)</span>
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                          {ticket.workOrder?.assignedTrade || 'Electrician'}
                        </span>
                      </div>
                      <div className="text-base font-bold text-white mt-0.5">
                        {ticket.workOrder?.primaryWorkExecutor || 'Muhammad Rashid (Senior MEP Electrician)'}
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        Contact: <strong className="text-slate-200">{ticket.workOrder?.executorContact || '0312-9876543'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOfficialDocType('DELIVERY_NOTE');
                        setShowOfficialQuotationModal(true);
                      }}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      title="Download or Print physical Delivery Note for assigned staff"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Delivery Note for Staff</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('DELIVERY_NOTE')}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Delivery Note &amp; Branch Stamp →</span>
                    </button>
                  </div>
                </div>

                {/* 1-Click Quick Trade Selector */}
                <div className="pt-2.5 border-t border-purple-500/20 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold">1-Click Trade Work Allocation:</span>
                    <span className="text-purple-300 text-[11px]">
                      Recommended for {ticket.category || 'Maintenance'}: <strong className="text-amber-300">{getRecommendedTrade().trade} ({getRecommendedTrade().name})</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                    {PRESET_FIELD_STAFF.map((staff) => {
                      const isCurrent = ticket.workOrder?.primaryWorkExecutor?.includes(staff.name) ||
                        (ticket.workOrder?.assignedTrade === staff.trade && !ticket.workOrder?.primaryWorkExecutor);
                      return (
                        <button
                          key={staff.trade + staff.name}
                          type="button"
                          onClick={() => {
                            assignWorkToStaff(ticket.id, {
                              trade: staff.trade,
                              staffName: staff.name,
                              staffPhone: staff.phone,
                            });
                          }}
                          className={`p-2 rounded-xl text-left transition-all border cursor-pointer ${
                            isCurrent
                              ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-1 ring-purple-300'
                              : 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-300 border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span>{staff.icon}</span>
                            <span className="text-[10px] font-mono opacity-80">{staff.trade}</span>
                          </div>
                          <div className="font-bold text-[11px] truncate mt-1">{staff.name}</div>
                          <div className="text-[10px] opacity-75 font-mono">{staff.phone}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Work Order Execution Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 block font-semibold">Assigned Execution Crew:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(ticket.workOrder?.assignedCrew || [ticket.workOrder?.primaryWorkExecutor || 'Muhammad Rashid (Electrician)']).map((c, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 text-slate-400">
                    Scheduled Start: <strong className="text-slate-200">{ticket.workOrder?.scheduledStart || '2026-09-18 17:00'}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 block mb-1 font-semibold">Mandatory Safety Protocols (LOTO):</span>
                  <p className="text-slate-300">
                    {ticket.workOrder?.safetyInstructions || 'LOTO (Lockout/Tagout) mandatory on 400A MCCB. Safety goggles and insulated gloves required.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: COMPLETION / DELIVERY NOTE (CRITICAL RULE 9 & 10) */}
          {activeTab === 'DELIVERY_NOTE' && (
            <div className="space-y-4">
              {/* 4-Step Physical Operational Workflow Banner */}
              <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-3">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <span>Branch Completion Delivery Note Cycle (Rule 9, 10 &amp; 12)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                          {ticket.workOrder?.assignedTrade || 'Electrician / Staff'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        1. Staff takes print to branch → 2. BOM signs &amp; stamps → 3. Send image to Gmail thread → 4. Deposit hard copy in office for accounts.
                      </p>
                    </div>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveOfficialDocType('DELIVERY_NOTE');
                        setShowOfficialQuotationModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      title="Download or Print physical Delivery Note / Completion Certificate for staff"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>1. Print Delivery Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCertSignatoryName(ticket.completionNote?.receivedBy || branch?.bomName || 'Tariq Mehmood Chishti');
                        setCertSignatoryDesignation(ticket.completionNote?.receivedByDesignation || 'Branch Operations Manager (BOM)');
                        setShowUploadCertModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      title="Upload signed and stamped physical scan from branch"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>2. Upload Stamped Scan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSendGmailCertModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      title="Send signed & stamped delivery note copy image to UBL Gmail thread"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>3. Send to Gmail Thread</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowDepositOfficeModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
                      title="Confirm hard copy deposited into Lahore Head Office for accounts billing"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>4. Deposit Hard Copy in Office</span>
                    </button>
                  </div>
                </div>

                {/* 4-Stage Visual Progress Tracker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                  {/* Stage 1: Printable Certificate */}
                  <div className={`p-2.5 rounded-xl border ${
                    ticket.completionNote
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">1. Print for Staff</span>
                      {ticket.completionNote ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="font-semibold text-white text-[11px] truncate">
                      {ticket.workOrder?.primaryWorkExecutor || 'Muhammad Rashid (Electrician)'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Item &amp; Qty Only (No Financial Rates)</div>
                  </div>

                  {/* Stage 2: Branch Sign & Round Stamp */}
                  <div className={`p-2.5 rounded-xl border ${
                    ticket.completionNote?.completionVerified
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">2. Branch BOM Stamp</span>
                      {ticket.completionNote?.completionVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <div className="font-semibold text-white text-[11px]">
                      {ticket.completionNote?.completionVerified ? 'Signed & Stamped' : 'Pending BOM Sign & Seal'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ticket.completionNote?.receivedBy || branch?.bomName || 'Concern Branch BOM'}</div>
                  </div>

                  {/* Stage 3: Send to Gmail Thread */}
                  <div className={`p-2.5 rounded-xl border ${
                    ticket.completionNote?.signedCopySentToGmail
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-blue-950/30 border-blue-500/30 text-blue-300'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">3. UBL Gmail Thread</span>
                      {ticket.completionNote?.signedCopySentToGmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5 text-blue-400" />}
                    </div>
                    <div className="font-semibold text-white text-[11px]">
                      {ticket.completionNote?.signedCopySentToGmail ? 'Sent to Gmail Thread' : 'Pending Email Dispatch'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">here4u@ubl.com.pk (Desk Clearance)</div>
                  </div>

                  {/* Stage 4: Deposit Hard Copy in Office */}
                  <div className={`p-2.5 rounded-xl border ${
                    ticket.completionNote?.hardCopyReceivedAtOffice
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : ticket.completionNote?.hardCopySentToOffice
                      ? 'bg-sky-950/40 border-sky-500/40 text-sky-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">4. Office Accounts Deposit</span>
                      {ticket.completionNote?.hardCopyReceivedAtOffice ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : ticket.completionNote?.hardCopySentToOffice ? (
                        <Truck className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="font-semibold text-white text-[11px]">
                      {ticket.completionNote?.hardCopyReceivedAtOffice
                        ? 'Deposited at Office Desk'
                        : ticket.completionNote?.hardCopySentToOffice
                        ? 'In Transit to HQ'
                        : 'Pending Office Deposit'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Dossier Item #3 Requirement</div>
                  </div>
                </div>
              </div>

              {/* Status Tracking Cards (Scanned Proof, Gmail Dispatch, Physical Office Filing) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Card 1: Branch Stamped Copy */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      ticket.completionNote?.signedCopyUploaded
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Branch Stamped Scan:</span>
                        {ticket.completionNote?.signedCopyUploaded ? (
                          <span className="text-emerald-400 font-mono text-[10px] px-1.5 py-0.5 bg-emerald-500/15 rounded">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="text-amber-400 font-mono text-[10px] px-1.5 py-0.5 bg-amber-500/15 rounded">
                            PENDING
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                        {ticket.completionNote?.signedCopyUploaded
                          ? `Signatory: ${ticket.completionNote.receivedBy || 'BOM'} (${ticket.completionNote.signedCopyFileName || 'Branch_Signed_Copy.pdf'})`
                          : 'Carried by staff to branch for official stamp.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCertSignatoryName(ticket.completionNote?.receivedBy || branch?.bomName || 'Tariq Mehmood Chishti');
                      setCertSignatoryDesignation(ticket.completionNote?.receivedByDesignation || 'Branch Operations Manager (BOM)');
                      setShowUploadCertModal(true);
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-all text-center cursor-pointer"
                  >
                    {ticket.completionNote?.signedCopyUploaded ? 'Re-Upload / View Scan' : 'Upload Scan'}
                  </button>
                </div>

                {/* Card 2: Sent to Gmail Thread */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      ticket.completionNote?.signedCopySentToGmail
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>UBL Gmail Dispatch:</span>
                        {ticket.completionNote?.signedCopySentToGmail ? (
                          <span className="text-blue-400 font-mono text-[10px] px-1.5 py-0.5 bg-blue-500/15 rounded">
                            DISPATCHED
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 rounded">
                            NOT SENT
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                        {ticket.completionNote?.signedCopySentToGmail
                          ? `Sent to here4u@ubl.com.pk on ${new Date(ticket.completionNote.signedCopySentToGmailDate || Date.now()).toLocaleDateString()}`
                          : 'Send stamped scan image to active Gmail thread for audit clearance.'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSendGmailCertModal(true)}
                      className="flex-1 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-xs transition-all text-center cursor-pointer"
                    >
                      {ticket.completionNote?.signedCopySentToGmail ? 'Send Again / View' : 'Send to Gmail'}
                    </button>
                    {ticket.completionNote?.signedCopySentToGmail && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('GMAIL_THREAD')}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 font-medium cursor-pointer"
                        title="View in Gmail Thread"
                      >
                        Thread →
                      </button>
                    )}
                  </div>
                </div>

                {/* Card 3: Hard Copy Deposited in Office Accounts Desk */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      ticket.completionNote?.hardCopyReceivedAtOffice
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : ticket.completionNote?.hardCopySentToOffice
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                        <span>Office Accounts Hard Copy:</span>
                        {ticket.completionNote?.hardCopyReceivedAtOffice ? (
                          <span className="text-purple-400 font-mono text-[10px] px-1.5 py-0.5 bg-purple-500/15 rounded">
                            FILED IN HQ
                          </span>
                        ) : ticket.completionNote?.hardCopySentToOffice ? (
                          <span className="text-sky-400 font-mono text-[10px] px-1.5 py-0.5 bg-sky-500/15 rounded">
                            IN TRANSIT
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-[10px] px-1.5 py-0.5 bg-slate-800 rounded">
                            WITH STAFF
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                        {ticket.completionNote?.hardCopyReceivedAtOffice
                          ? `Received by ${ticket.completionNote.hardCopyReceivedBy || 'Accounts'} (${ticket.completionNote.officeDepositRef || 'Cabinet Accounts'})`
                          : 'Staff deposits signed original into Lahore HQ for accounts billing.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDepositOfficeModal(true)}
                    className="w-full py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-all text-center cursor-pointer"
                  >
                    {ticket.completionNote?.hardCopyReceivedAtOffice ? 'View Office Filing' : 'Deposit in Office'}
                  </button>
                </div>
              </div>

              {!ticket.completionNote ? (
                <div className="p-8 text-center bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
                  <FileText className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="text-sm font-semibold text-slate-300">
                    Completion / Delivery Note has not been generated yet.
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Once work execution is completed, generate the official branch Delivery Note with Item + Qty only.
                  </p>
                  <button
                    onClick={() => generateCompletionNote(ticket.id)}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10 cursor-pointer"
                  >
                    Generate Delivery Note Now
                  </button>
                </div>
              ) : (
                <div className="bg-white text-slate-950 p-6 rounded-xl shadow-2xl border border-slate-200 space-y-5 font-sans relative overflow-hidden">
                  {/* Watermark for Verified Branch Stamp */}
                  {ticket.completionNote.completionVerified && (
                    <div className="absolute right-6 top-32 pointer-events-none opacity-85 rotate-[-8deg] border-4 border-blue-900 rounded-full w-44 h-44 p-2 flex flex-col items-center justify-center text-center text-blue-900 font-mono select-none">
                      <div className="text-[9px] font-bold tracking-widest uppercase">UNITED BANK LIMITED</div>
                      <div className="text-xs font-black tracking-wider uppercase my-1">BRANCH VERIFIED</div>
                      <div className="text-[9px] font-bold">CODE: {ticket.ublBranchCode || branch?.code || '0962'}</div>
                      <div className="text-[8px] mt-0.5">{ticket.completionNote.verificationDate || new Date().toISOString().split('T')[0]}</div>
                      <div className="text-[8px] font-bold tracking-wider uppercase mt-0.5">SIGNED &amp; STAMPED</div>
                    </div>
                  )}

                  {/* Clean Official Delivery Note Header */}
                  <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                        NAEEM BUILDER
                      </h2>
                      <p className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
                        Commercial Builders &amp; Facility Maintenance Services
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Garden Town, Lahore, Pakistan • Contact: +92 42 35889900 • Vendor Code: VN-UBL-7821
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="inline-block bg-slate-900 text-white font-mono font-bold text-sm px-3 py-1 rounded">
                        COMPLETION / DELIVERY NOTE
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-800 mt-1.5">
                        Doc #: {ticket.completionNote.docNumber}
                      </div>
                      <div className="text-xs text-slate-600">
                        Date: {ticket.completionNote.date}
                      </div>
                    </div>
                  </div>

                  {/* Branch & Ticket Info */}
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    <div>
                      <span className="text-slate-500 block font-medium">Client &amp; Concern Branch:</span>
                      <strong className="text-slate-900 text-sm">{ticket.completionNote.clientName}</strong>
                      <div className="text-slate-800 font-semibold">
                        {ticket.completionNote.branchName} <span className="text-slate-600 font-mono">(Branch Code: {ticket.ublBranchCode || branch?.code || '0962'})</span>
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">{ticket.completionNote.branchAddress}</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div>
                        <span className="text-slate-500">Ticket Ref #: </span>
                        <strong className="font-mono text-slate-900">{ticket.ticketNumber}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Service Category: </span>
                        <strong className="text-slate-900">{ticket.category}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Physical Verification: </span>
                        <span className="font-bold text-emerald-700">
                          {ticket.completionNote.completionVerified ? 'VERIFIED & STAMPED BY BRANCH' : 'PENDING BRANCH SIGN & STAMP'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* STRICT ITEM + QTY ONLY TABLE (NO AMOUNTS PER RULE 9) */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center justify-between">
                      <span>Completed Work &amp; Installed Items (Rule 9 Compliant)</span>
                      <span className="text-[10px] text-slate-400 font-normal">Pricing strictly omitted for physical branch handover</span>
                    </div>
                    <table className="w-full text-left text-xs border border-slate-300">
                      <thead className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-3 w-12 text-center">Sr.</th>
                          <th className="py-2.5 px-3">Item / Work Scope Description</th>
                          <th className="py-2.5 px-3 w-28 text-center">Quantity</th>
                          <th className="py-2.5 px-3 w-24 text-center">Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {ticket.completionNote.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 text-center text-slate-500 font-mono">{idx + 1}</td>
                            <td className="py-2.5 px-3 font-medium text-slate-900">{item.description}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-center font-semibold text-slate-700">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Rule 10: Delivered By & Received By (Signatures & Stamp) */}
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
                    {/* Delivered By */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        DELIVERED BY — NAEEM BUILDER (RULE 10):
                      </span>
                      <div className="font-bold text-slate-900 text-sm">
                        {ticket.completionNote.deliveredBy}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {ticket.completionNote.deliveredByDesignation}
                      </div>
                      <div className="mt-4 pt-3 border-t border-dashed border-slate-300 text-[11px] font-mono text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Signed electronically: {ticket.completionNote.deliveredBy}</span>
                      </div>
                    </div>

                    {/* Received By */}
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 relative">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        RECEIVED &amp; ACCEPTED BY (CONCERN BRANCH):
                      </span>
                      <div className="font-bold text-slate-900 text-sm">
                        {ticket.completionNote.receivedBy}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {ticket.completionNote.receivedByDesignation}
                      </div>

                      {ticket.completionNote.completionVerified ? (
                        <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between">
                          <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Verified on Site ({ticket.completionNote.verificationDate})</span>
                          </div>
                          <div className="px-2.5 py-1 rounded bg-blue-900 text-white font-mono font-bold text-[10px] tracking-wider uppercase">
                            OFFICIAL STAMP AFFIXED
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-slate-300 space-y-2">
                          <div className="text-amber-800 text-[11px] font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Pending Physical Sign &amp; Branch Stamp</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setCertSignatoryName(ticket.completionNote?.receivedBy || branch?.bomName || 'Tariq Mehmood Chishti');
                                setCertSignatoryDesignation('Branch Operations Manager (BOM)');
                                setShowUploadCertModal(true);
                              }}
                              className="flex-1 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload Signed &amp; Stamped Copy</span>
                            </button>
                            <button
                              onClick={() =>
                                signAndVerifyCompletionNote(
                                  ticket.id,
                                  signName || branch?.bomName || 'Tariq Mehmood Chishti',
                                  signDesignation || 'Branch Operations Manager (BOM)'
                                )
                              }
                              className="py-2 px-3 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-all cursor-pointer"
                              title="Direct Electronic Verification"
                            >
                              Quick Verify
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Print & Action Footer */}
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 text-[11px]">
                      Per UBL Audit Guidelines: A physical stamped completion certificate is mandatory to unlock commercial invoice issuance.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowPrintCertModal(true)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Document (A4)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: INVOICE & PAYMENT (CRITICAL RULE 12) */}
          {activeTab === 'INVOICE' && (
            <div className="space-y-4">
              {/* RULE 12 LOCK ENFORCEMENT */}
              {!ticket.completionNote?.completionVerified ? (
                <div className="p-8 bg-slate-950 rounded-2xl border-2 border-red-500/40 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    INVOICE CREATION LOCKED (RULE 12)
                  </h3>
                  <p className="text-xs text-red-300 max-w-lg mx-auto leading-relaxed">
                    &quot;Verified completion unlocks invoice.&quot; As specified in Section 11 & Rule 12 of the Master Blueprint, an invoice cannot be generated until the Branch Operations Manager has signed and stamped the Completion/Delivery Note.
                  </p>
                  <button
                    onClick={() => setActiveTab('DELIVERY_NOTE')}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-semibold text-xs transition-all cursor-pointer"
                  >
                    Go to Tab 8 to Sign & Stamp Completion Note →
                  </button>
                </div>
              ) : !ticket.invoice ? (
                <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/40 text-center space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <Unlock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-400">
                    Completion Verified! Invoice Unlocked per Rule 12
                  </h3>
                  <p className="text-xs text-slate-400">
                    The work completion has been officially accepted by the branch. You can now generate the tax billing invoice.
                  </p>
                  <button
                    onClick={() => unlockAndCreateInvoice(ticket.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    Generate & Unlock Invoice Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* UBL ACCOUNTS OFFICE 4-PART HARD COPY DOSSIER TRACKER */}
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-emerald-500/30 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          UBL Accounts Office 4-Part Hard Copy Dossier Checklist
                        </h4>
                      </div>

                      {ticket.consolidatedInvoiceId ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                          <span>Batched in:</span>
                          <strong className="font-mono">
                            {consolidatedInvoices.find((c) => c.id === ticket.consolidatedInvoiceId)?.batchNumber || ticket.consolidatedInvoiceId}
                          </strong>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[11px] font-semibold">
                          Ready for Consolidated Batch (&lt;500k)
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300">
                      To deposit to UBL Accounts Office, all 4 physical hard copies must be stamped and compiled together into a single dossier document within the Rs. 500,000 threshold.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={ticket.dossierStatus?.hasTicketRiseHardCopy ?? true}
                          onChange={(e) => updateTicketDossierStatus(ticket.id, { hasTicketRiseHardCopy: e.target.checked })}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span className="text-slate-200">
                          1. Task Assigned Ticket Rise Hard Copy
                        </span>
                      </label>

                      <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={ticket.dossierStatus?.hasGmailApprovalHardCopy ?? true}
                          onChange={(e) => updateTicketDossierStatus(ticket.id, { hasGmailApprovalHardCopy: e.target.checked })}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span className="text-slate-200">
                          2. Gmail Thread Approval Email Printout
                        </span>
                      </label>

                      <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={ticket.dossierStatus?.hasBranchSignedStampedCert ?? !!ticket.completionNote?.completionVerified}
                          onChange={(e) => updateTicketDossierStatus(ticket.id, { hasBranchSignedStampedCert: e.target.checked })}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span className="text-slate-200">
                          3. Branch Signed & Stamped Completion Note (Branch {ticket.ublBranchCode})
                        </span>
                      </label>

                      <label className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                        <input
                          type="checkbox"
                          checked={ticket.dossierStatus?.hasIndividualInvoice ?? true}
                          onChange={(e) => updateTicketDossierStatus(ticket.id, { hasIndividualInvoice: e.target.checked })}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                        />
                        <span className="text-slate-200">
                          4. Individual Commercial Tax Invoice
                        </span>
                      </label>
                    </div>

                    <div className="bg-slate-900/60 p-2 rounded text-[11px] text-slate-400 flex items-center justify-between">
                      <span>HERE4U Statutory Deductions by UBL:</span>
                      <strong className="text-emerald-400">16% Sales Tax (PRA) + 14% Income Tax (WHT)</strong>
                    </div>
                  </div>

                  {/* Invoice Header Details */}
                  <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 font-mono">
                          {ticket.invoice.invoiceNumber}
                        </div>
                        <h3 className="text-base font-bold text-white">Commercial Tax Invoice</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveOfficialDocType('INVOICE');
                            setShowOfficialQuotationModal(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                          title="View authentic Naeem Builder Tax Invoice PDF Copy"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Official Invoice PDF Copy</span>
                        </button>
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          ticket.invoice.paymentStatus === 'Fully Paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ticket.invoice.paymentStatus === 'Partially Paid'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {ticket.invoice.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Invoice Billing Items */}
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-400 text-[10px] uppercase border-b border-slate-800">
                        <tr>
                          <th className="py-2">Billing Description</th>
                          <th className="py-2 text-center">Qty / Unit</th>
                          <th className="py-2 text-right">Rate</th>
                          <th className="py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {ticket.invoice.billingItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 font-sans text-slate-200">{item.description}</td>
                            <td className="py-2 text-center text-slate-400">{item.quantity} {item.unit}</td>
                            <td className="py-2 text-right text-slate-400">Rs. {item.rate.toLocaleString()}</td>
                            <td className="py-2 text-right text-slate-200">Rs. {item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Invoice Totals & GST Separation (Rule 14) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
                      <div className="space-y-1 text-slate-400">
                        <div>Client: <strong className="text-slate-200">{ticket.invoice.clientName}</strong></div>
                        <div>Branch: <strong className="text-slate-200">{ticket.invoice.branchName}</strong></div>
                        <div>Date Issued: <strong className="text-slate-200">{ticket.invoice.dateIssued}</strong></div>
                        <div className="p-2 rounded bg-slate-900 text-[11px] text-amber-400 mt-2">
                          <strong>Rule 14:</strong> GST (Rs. {ticket.invoice.gstAmount.toLocaleString()}) is separated from job profit and filed under {ticket.invoice.gstFilingPeriod || 'Monthly Return'}.
                        </div>
                      </div>

                      <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
                        <div className="flex justify-between text-slate-400">
                          <span>Subtotal (Net Revenue):</span>
                          <span>Rs. {ticket.invoice.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>PRA GST ({ticket.invoice.gstRatePercent}%):</span>
                          <span>Rs. {ticket.invoice.gstAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-white text-sm pt-1 border-t border-slate-800">
                          <span>Total Invoice Value:</span>
                          <span className="text-emerald-400">Rs. {ticket.invoice.totalInvoiceAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-cyan-400">
                          <span>Amount Received:</span>
                          <span>- Rs. {ticket.invoice.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-amber-400">
                          <span>WHT Deducted (Tax):</span>
                          <span>- Rs. {ticket.invoice.totalWithholdingTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-amber-400 pt-1 border-t border-slate-800">
                          <span>Outstanding Balance:</span>
                          <span>Rs. {ticket.invoice.outstandingBalance.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Receipt Recording Form (Section 11) */}
                  {ticket.invoice.outstandingBalance > 0 && (
                    <form onSubmit={handleRecordPayment} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Record Partial or Full Payment Receipt (Section 11)
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="text-slate-400 block mb-1">Net Received (PKR):</label>
                          <input
                            type="number"
                            required
                            min="1"
                            max={ticket.invoice.outstandingBalance}
                            value={paymentAmount || ''}
                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                            placeholder="e.g. 50000"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">WHT Tax Deduction (PKR):</label>
                          <input
                            type="number"
                            min="0"
                            value={whtDeduction || ''}
                            onChange={(e) => setWhtDeduction(Number(e.target.value))}
                            placeholder="4% or 7.5% WHT"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Bank / Cheque Ref #:</label>
                          <input
                            type="text"
                            required
                            value={bankRef}
                            onChange={(e) => setBankRef(e.target.value)}
                            placeholder="e.g. FT-MBL-99210"
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-1">Payment Method:</label>
                          <select
                            value={payMethod}
                            onChange={(e) => setPayMethod(e.target.value as any)}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                          >
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                            <option value="Direct Deposit">Direct Deposit</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow cursor-pointer"
                      >
                        Credit Payment & Update Outstanding
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: COST CONTROL */}
          {activeTab === 'COST_CONTROL' && (
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Job Cost Control & Profitability Breakdown (Section 13)
              </h3>
              <p className="text-xs text-slate-400">
                Formula: Net Revenue → Direct Job Costs (Purchasing + Labour + Fuel/KM + Worker Expenses + Emergency) = Gross Job Profit.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Net Revenue</span>
                  <div className="text-sm font-bold text-white mt-1">
                    PKR {ticket.netRevenue ? ticket.netRevenue.toLocaleString() : '95,000'}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Purchasing & Mat</span>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    PKR {ticket.directPurchasingCost ? ticket.directPurchasingCost.toLocaleString() : '60,600'}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Labour & Fuel-KM</span>
                  <div className="text-sm font-bold text-amber-400 mt-1">
                    PKR {(ticket.directLabourCost + ticket.directFuelKmCost).toLocaleString()}
                  </div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase">Gross Profit</span>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    PKR {ticket.grossProfit ? ticket.grossProfit.toLocaleString() : '22,800'} ({ticket.grossMarginPercent || 24}%)
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Quotation Letterhead Modal Popup */}
      {showOfficialQuotationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
            <OfficialQuotationView
              ticket={ticket}
              defaultDocType={activeOfficialDocType}
              onClose={() => setShowOfficialQuotationModal(false)}
              onSendEmail={() => {
                setShowOfficialQuotationModal(false);
                setActiveTab('GMAIL_THREAD');
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL 1: PRINT / DOWNLOAD PHYSICAL COMPLETION CERTIFICATE FOR BRANCH SIGN & STAMP */}
      {showPrintCertModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[95vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Official Branch Completion Certificate (Printable Copy)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Print this physical copy for site inspection, physical signature, and official round stamp by Concern Branch BOM.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => setShowPrintCertModal(false)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet (A4 Layout) */}
            <div className="p-6 overflow-y-auto bg-slate-950/80 flex justify-center">
              <div className="bg-white text-slate-950 p-8 rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 space-y-6 font-sans print:p-0 print:border-none print:shadow-none">
                {/* Official Letterhead Header */}
                <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-950">
                      NAEEM BUILDER
                    </h1>
                    <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">
                      Commercial Builders &amp; Bank Facility Maintenance Services
                    </p>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Head Office: 48 Commercial Zone, Garden Town, Lahore, Pakistan
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5 space-x-3">
                      <span>UBL Enlisted Vendor: <strong>VN-UBL-7821</strong></span>
                      <span>NTN: <strong>4129840-7</strong></span>
                      <span>PRA: <strong>PRA-LHR-2021-987</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-block bg-slate-950 text-white font-mono font-bold text-xs px-3 py-1 rounded">
                      WORK COMPLETION CERTIFICATE
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-900 mt-1.5">
                      Doc #: {ticket.completionNote?.docNumber || `CN-2026-${ticket.ticketNumber.slice(-4)}`}
                    </div>
                    <div className="text-xs text-slate-600">
                      Issue Date: {ticket.completionNote?.date || new Date().toISOString().split('T')[0]}
                    </div>
                  </div>
                </div>

                {/* Bank Branch & Ticket Information Box */}
                <div className="bg-slate-50 border border-slate-300 p-4 rounded-lg grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">
                      Client &amp; Concern Branch Details:
                    </span>
                    <strong className="text-slate-950 text-sm block mt-0.5">
                      {ticket.completionNote?.clientName || 'United Bank Limited (UBL)'}
                    </strong>
                    <div className="text-slate-800 font-semibold mt-0.5">
                      {ticket.branchName} <span className="font-mono text-slate-600">(Branch Code: {ticket.ublBranchCode || branch?.code || '0962'})</span>
                    </div>
                    <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                      {ticket.branchAddress || branch?.completeAddress || 'Main Boulevard, Lahore'}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      <span className="text-slate-500">Official Ticket / Complaint Ref: </span>
                      <strong className="font-mono text-slate-950 text-sm">{ticket.ticketNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Service Category: </span>
                      <strong className="text-slate-900">{ticket.category}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Date of Inspection: </span>
                      <strong className="text-slate-900">{ticket.completionNote?.date || new Date().toISOString().split('T')[0]}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Execution Status: </span>
                      <span className="font-bold text-emerald-800">COMPLETED ON SITE</span>
                    </div>
                  </div>
                </div>

                {/* Strict Rule 9 Compliant Table: Item + Qty Only (No Financial Rates) */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Summary of Completed Scope of Work &amp; Items (Rule 9 Compliant):</span>
                    <span className="text-[10px] text-slate-500 font-mono italic">
                      *Values omitted per Bank Field Inspection Standards
                    </span>
                  </div>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                      <tr>
                        <th className="py-2.5 px-3 w-12 text-center border-r border-slate-300">Sr.</th>
                        <th className="py-2.5 px-3 border-r border-slate-300">Work Description / Maintenance Items Completed</th>
                        <th className="py-2.5 px-3 w-28 text-center border-r border-slate-300">Quantity</th>
                        <th className="py-2.5 px-3 w-24 text-center">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(ticket.completionNote?.items || ticket.estimates?.[0]?.items || [
                        { description: ticket.title, quantity: 1, unit: 'Job' },
                      ]).map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center text-slate-500 font-mono border-r border-slate-200">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-900 border-r border-slate-200">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900 border-r border-slate-200">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-700">
                            {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Handover & Acceptance Undertaking */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 leading-relaxed">
                  <strong>Certification Undertaking:</strong> This is to certify that the facility maintenance and repair works listed above have been completed at the specified UBL Branch to full satisfaction. All debris has been cleared, installations tested, and work handed over to branch operations in sound operating order.
                </div>

                {/* Dual Physical Signature & Stamping Block */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t-2 border-slate-300 text-xs">
                  {/* Delivered By: Naeem Builder */}
                  <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg flex flex-col justify-between h-48">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        DELIVERED BY (NAEEM BUILDER):
                      </span>
                      <div className="font-bold text-slate-900 text-sm mt-1">
                        {ticket.completionNote?.deliveredBy || 'Naeem Builder Site Supervisor'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {ticket.completionNote?.deliveredByDesignation || 'Field Maintenance Supervisor'}
                      </div>
                    </div>
                    <div>
                      <div className="border-b border-slate-400 border-dashed mb-1.5" />
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Supervisor Signature</span>
                        <span>Date: {ticket.completionNote?.date || new Date().toISOString().split('T')[0]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inspected & Accepted By: Concern Branch BOM */}
                  <div className="p-4 bg-slate-50 border-2 border-slate-400 rounded-lg flex flex-col justify-between h-48 relative overflow-hidden">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        RECEIVED, INSPECTED &amp; ACCEPTED BY:
                      </span>
                      <div className="font-bold text-slate-900 text-sm mt-1">
                        {ticket.completionNote?.receivedBy || branch?.bomName || 'Tariq Mehmood Chishti'}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        {ticket.completionNote?.receivedByDesignation || 'Branch Operations Manager (BOM)'}
                      </div>
                    </div>

                    {/* Dotted Round Box for Branch Official Stamp */}
                    <div className="my-auto text-center py-2">
                      <div className="inline-block border-2 border-dashed border-blue-800 text-blue-900 font-mono text-[9px] font-bold px-4 py-3 rounded-full uppercase tracking-wider">
                        [ AFFIX OFFICIAL UBL BRANCH ROUND STAMP HERE ]
                      </div>
                    </div>

                    <div>
                      <div className="border-b border-slate-400 border-dashed mb-1.5" />
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>BOM Official Signature</span>
                        <span>Date: ____________</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Instruction Footer */}
                <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-500 text-center flex items-center justify-between">
                  <span>Note: Original signed and stamped certificate must be dispatched to Naeem Builder Head Office Accounts.</span>
                  <span className="font-mono">Page 1 of 1</span>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                After physical signature and round stamping from the concern branch BOM, take a photo or scan and click &quot;Upload Signed &amp; Stamped Copy&quot;.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowPrintCertModal(false);
                    setCertSignatoryName(ticket.completionNote?.receivedBy || branch?.bomName || 'Tariq Mehmood Chishti');
                    setShowUploadCertModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Proceed to Upload Stamped Scan</span>
                </button>
                <button
                  onClick={() => setShowPrintCertModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD SIGNED & STAMPED BRANCH COMPLETION COPY */}
      {showUploadCertModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Upload Branch Signed &amp; Stamped Certificate
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Provide digital scan/photograph of the official certificate with concern branch BOM signature &amp; round seal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadCertModal(false)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Upload Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fileName = certUploadFileName.trim() || `Branch_Signed_Stamped_Cert_${ticket.ticketNumber.slice(-4)}.pdf`;
                const previewUrl = certUploadFilePreview || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800';
                uploadSignedCompletionCopy(ticket.id, {
                  fileName,
                  fileUrl: previewUrl,
                  signedBy: certSignatoryName || branch?.bomName || 'Tariq Mehmood Chishti',
                  designation: certSignatoryDesignation || 'Branch Operations Manager (BOM)',
                });
                setShowUploadCertModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              {/* Guidance Banner */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] leading-relaxed">
                <strong>Rule 12 &amp; UBL Dossier Requirement:</strong> Uploading this verified scan immediately satisfies Item #3 of the 4-part dossier and unlocks invoice creation.
              </div>

              {/* File Upload Box */}
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">
                  Select Scanned Certificate or Photograph:
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-4 text-center bg-slate-950/60 transition-all">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <div className="text-slate-300 font-semibold mb-1">
                    Drag and drop signed certificate scan here, or browse
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Supported formats: PDF, JPG, PNG (Max 15MB)
                  </p>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCertUploadFileName(file.name);
                        const reader = new FileReader();
                        reader.onload = () => {
                          setCertUploadFilePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="cert-file-upload"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <label
                      htmlFor="cert-file-upload"
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer border border-slate-700"
                    >
                      Browse Files
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCertUploadFileName(`UBL_Branch_${ticket.ublBranchCode || '0962'}_Signed_Stamped_Cert.pdf`);
                        setCertUploadFilePreview('sample_verified_signed_stamped');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs cursor-pointer"
                    >
                      Load Sample Official Stamped Copy
                    </button>
                  </div>
                </div>

                {/* Selected File Indicator */}
                {(certUploadFileName || certUploadFilePreview) && (
                  <div className="mt-2 p-2.5 rounded-lg bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-mono text-emerald-300 text-xs font-semibold">
                        {certUploadFileName || 'Official_Stamped_Branch_Certificate.pdf'}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Ready to Certify
                    </span>
                  </div>
                )}
              </div>

              {/* Signatory Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">
                    Branch Signatory Full Name (BOM):
                  </label>
                  <input
                    type="text"
                    required
                    value={certSignatoryName}
                    onChange={(e) => setCertSignatoryName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood Chishti"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">
                    Signatory Designation:
                  </label>
                  <input
                    type="text"
                    required
                    value={certSignatoryDesignation}
                    onChange={(e) => setCertSignatoryDesignation(e.target.value)}
                    placeholder="Branch Operations Manager (BOM)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadCertModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Upload &amp; Verify Completion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: HARD COPY DISPATCH & RECEIPT AT HEAD OFFICE */}
      {showDispatchCertModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Physical Hard Copy Dispatch to Head Office
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Track the movement of original physical signed &amp; stamped documents to Head Office Accounts.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchCertModal(false)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Dispatch Tracking Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateCompletionHardCopyDispatch(ticket.id, {
                  hardCopySentToOffice: true,
                  hardCopyCourierOrRider: dispatchCourier,
                  hardCopyTrackingRef: dispatchTrackingRef,
                  hardCopyDispatchedDate: dispatchDate,
                  hardCopyReceivedAtOffice: !!ticket.completionNote?.hardCopyReceivedAtOffice,
                  hardCopyReceivedBy: ticket.completionNote?.hardCopyReceivedBy || receivedAtOfficeBy,
                  hardCopyReceivedDate: ticket.completionNote?.hardCopyReceivedDate || receivedAtOfficeDate,
                });
                setShowDispatchCertModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              {/* Stage 1: Branch Dispatch */}
              <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>1. Physical Dispatch from Concern Branch</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Field Rider / Courier Name:</label>
                    <input
                      type="text"
                      value={dispatchCourier}
                      onChange={(e) => setDispatchCourier(e.target.value)}
                      placeholder="e.g. TCS Express / Rider Kashif"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Consignment / Dispatch Ref #:</label>
                    <input
                      type="text"
                      value={dispatchTrackingRef}
                      onChange={(e) => setDispatchTrackingRef(e.target.value)}
                      placeholder="e.g. HC-UBL-7821-01"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Date Dispatched from Site:</label>
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>

              {/* Stage 2: Head Office Receipt */}
              <div className="space-y-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                    <span>2. Receipt at Head Office (Lahore Accounts Dept)</span>
                  </h4>
                  {ticket.completionNote?.hardCopyReceivedAtOffice && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      RECEIVED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Receiving Accounts Officer:</label>
                    <input
                      type="text"
                      value={receivedAtOfficeBy}
                      onChange={(e) => setReceivedAtOfficeBy(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Date Received at Office:</label>
                    <input
                      type="date"
                      value={receivedAtOfficeDate}
                      onChange={(e) => setReceivedAtOfficeDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    updateCompletionHardCopyDispatch(ticket.id, {
                      hardCopySentToOffice: true,
                      hardCopyCourierOrRider: dispatchCourier,
                      hardCopyTrackingRef: dispatchTrackingRef,
                      hardCopyDispatchedDate: dispatchDate,
                      hardCopyReceivedAtOffice: true,
                      hardCopyReceivedBy: receivedAtOfficeBy,
                      hardCopyReceivedDate: receivedAtOfficeDate,
                    });
                    setShowDispatchCertModal(false);
                  }}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Hard Copy Received at Head Office</span>
                </button>
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchCertModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Save Dispatch Tracking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: GIVE WORK TO ELECTRICIAN / PAINTER / TRADE STAFF (RULE 10) */}
      {showAssignStaffModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Give Work to Staff (Electrician / Painter)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Rule 10
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Allocate approved work to trade staff. Staff name is automatically synchronized to the Delivery Note as &apos;Delivered By&apos;.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAssignStaffModal(false)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                assignWorkToStaff(ticket.id, {
                  trade: assignTrade,
                  staffName: assignStaffName,
                  staffPhone: assignStaffPhone,
                  instructions: assignInstructions,
                });
                setShowAssignStaffModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              {/* Recommended Trade Banner */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white block">Work Scope: {ticket.complaintType || ticket.category || 'Maintenance'}</span>
                  <span>Recommended Trade: <strong>{getRecommendedTrade().trade}</strong> ({getRecommendedTrade().name})</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rec = getRecommendedTrade();
                    setAssignTrade(rec.trade);
                    setAssignStaffName(rec.name);
                    setAssignStaffPhone(rec.phone);
                  }}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] cursor-pointer"
                >
                  Use Recommended
                </button>
              </div>

              {/* Trade Quick Selection Presets */}
              <div>
                <label className="text-slate-300 font-bold block mb-2">Select Trade Specialist Preset:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_FIELD_STAFF.map((staff) => (
                    <button
                      key={staff.trade + staff.name}
                      type="button"
                      onClick={() => {
                        setAssignTrade(staff.trade);
                        setAssignStaffName(staff.name);
                        setAssignStaffPhone(staff.phone);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        assignStaffName === staff.name
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md ring-1 ring-purple-300'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span>{staff.icon}</span>
                        <span className="text-[10px] font-mono opacity-80">{staff.trade}</span>
                      </div>
                      <div className="font-bold text-xs truncate mt-1">{staff.name}</div>
                      <div className="text-[10px] opacity-75 font-mono">{staff.phone}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Trade Category:</label>
                  <select
                    value={assignTrade}
                    onChange={(e) => setAssignTrade(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500"
                  >
                    <option value="Electrician">Electrician (MEP / Distribution)</option>
                    <option value="Painter">Painter (Surface &amp; Seepage)</option>
                    <option value="HVAC / AC Tech">HVAC / AC Tech</option>
                    <option value="Civil / Mason">Civil / Mason / Tile</option>
                    <option value="Aluminium & Glass">Aluminium &amp; Glass Specialist</option>
                    <option value="Plumber">Plumber (Sanitary)</option>
                    <option value="General Technician">General Maintenance Technician</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Technician / Staff Name:</label>
                  <input
                    type="text"
                    required
                    value={assignStaffName}
                    onChange={(e) => setAssignStaffName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Mobile / WhatsApp #:</label>
                  <input
                    type="text"
                    required
                    value={assignStaffPhone}
                    onChange={(e) => setAssignStaffPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Specific Work Instructions &amp; Safety Protocol:</label>
                <textarea
                  rows={2}
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  placeholder="e.g. Carry printed Delivery Note copy, complete circuit replacement, inspect MCCB, and obtain BOM physical round stamp and signature before leaving branch."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">
                  Rule 10: Automatically sets <strong>Delivered By: {assignStaffName}</strong> on Delivery Note.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignStaffModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Assign Work &amp; Update Delivery Note</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: SEND SIGNED & STAMPED DELIVERY NOTE COPY IMAGE TO GMAIL THREAD */}
      {showSendGmailCertModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Send Signed &amp; Stamped Copy to UBL Gmail Thread</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      Audit Clearance
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dispatches the branch-stamped completion certificate directly into the active UBL HERE4U email correspondence thread.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSendGmailCertModal(false)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsSendingToGmail(true);
                sendSignedCompletionToGmail(ticket.id, { customBody: gmailCustomBody || undefined });
                setTimeout(() => {
                  setIsSendingToGmail(false);
                  setGmailSendSuccessMsg('Signed & stamped completion note successfully dispatched to UBL Gmail thread!');
                  setTimeout(() => {
                    setGmailSendSuccessMsg(null);
                    setShowSendGmailCertModal(false);
                  }, 1200);
                }, 400);
              }}
              className="p-5 space-y-4 text-xs"
            >
              {gmailSendSuccessMsg ? (
                <div className="p-6 text-center space-y-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40">
                  <CheckCheck className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <div className="text-sm font-bold text-white">{gmailSendSuccessMsg}</div>
                  <p className="text-slate-400 text-xs">Logged into official correspondence and audit trail.</p>
                </div>
              ) : (
                <>
                  {/* Email Thread Headers */}
                  <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">To:</span>
                      <span className="text-blue-300 font-bold">here4u@ubl.com.pk</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Cc:</span>
                      <span className="text-slate-300">anum.shahid@ubl.com.pk, bom.branch@ubl.com.pk, accounts@naeembuilder.com</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-800 pt-1.5">
                      <span className="text-slate-400 font-sans">Subject:</span>
                      <span className="text-amber-300 font-bold truncate">
                        Re: [HERE4U #{ticket.ticketNumber}] Signed &amp; Stamped Delivery Note - Branch {ticket.ublBranchCode || branch?.code}
                      </span>
                    </div>
                  </div>

                  {/* Attachment Card */}
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">
                          {ticket.completionNote?.signedCopyFileName || `Branch_${ticket.ublBranchCode || '0962'}_Signed_Stamped_Completion.pdf`}
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-0.5">
                          Verified by BOM: {ticket.completionNote?.receivedBy || branch?.bomName || 'Tariq Mehmood Chishti'} (Official Round Seal Affixed)
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                      ATTACHED
                    </span>
                  </div>

                  {/* Message Body Field */}
                  <div>
                    <label className="text-slate-300 font-bold block mb-1">Email Message Clearance Note:</label>
                    <textarea
                      rows={4}
                      value={gmailCustomBody || `Dear UBL Shared Services Team / HERE4U Helpdesk,\n\nPlease find attached the physical Branch Completion / Delivery Note duly signed and round stamped by Branch Operations Manager (${ticket.completionNote?.receivedBy || branch?.bomName || 'BOM'}) for Ticket #${ticket.ticketNumber} at Branch ${ticket.ublBranchCode || branch?.code || '0962'}.\n\nAll physical maintenance works have been successfully completed by our trade specialist (${ticket.workOrder?.primaryWorkExecutor || 'Muhammad Rashid'}). The original physical copy is being deposited into our accounts office for dossier filing.\n\nWarm regards,\nNaeem Builder Services Team`}
                      onChange={(e) => setGmailCustomBody(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-xs focus:border-blue-500 font-sans resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">
                      Copies sent automatically to audit archive.
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSendGmailCertModal(false)}
                        className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingToGmail}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSendingToGmail ? 'Sending...' : 'Send to Gmail Thread'}</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: DEPOSIT PHYSICAL HARD COPY INTO OFFICE ACCOUNTS DESK */}
      {showDepositOfficeModal && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Deposit Physical Hard Copy in Office</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                      Accounts Process
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Deposit original branch signed &amp; stamped delivery note into Naeem Builder Head Office accounts desk for 4-part dossier completion.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDepositOfficeModal(false)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                depositHardCopyToOffice(ticket.id, {
                  receivedBy: depositOfficerName,
                  receivedDate: depositDateVal,
                  boxOrCabinetRef: depositCabinetRef,
                  notes: depositNotesVal,
                });
                setShowDepositOfficeModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              {/* Dossier Item #3 Info Banner */}
              <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 text-purple-300 text-[11px] space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  <span>4-Part Hard Copy Dossier: Item #3 (Branch Signed Certificate)</span>
                </div>
                <p>
                  Per UBL Accounts guidelines, the original ink-signed and round-stamped physical document must be physically retained at our Lahore Head Office Accounts Desk before payment submission.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Receiving Head Office Accounts Officer:</label>
                  <input
                    type="text"
                    required
                    value={depositOfficerName}
                    onChange={(e) => setDepositOfficerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Deposit Date:</label>
                    <input
                      type="date"
                      required
                      value={depositDateVal}
                      onChange={(e) => setDepositDateVal(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Cabinet / Box Filing Reference:</label>
                    <input
                      type="text"
                      required
                      value={depositCabinetRef}
                      onChange={(e) => setDepositCabinetRef(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Office Accounts Filing Remarks:</label>
                  <textarea
                    rows={2}
                    value={depositNotesVal}
                    onChange={(e) => setDepositNotesVal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-xs focus:border-purple-500 resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-emerald-400 text-[11px] font-semibold">
                  ✓ Automatically marks Dossier Item #3 as verified.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDepositOfficeModal(false)}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Hard Copy Deposit</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
