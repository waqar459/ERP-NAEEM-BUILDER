import React, { useState } from 'react';
import { X, Sparkles, Send, Building2, AlertCircle, CheckCircle2, Clock, Calculator } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import {
  TicketPriority,
  OFFICIAL_COMPLAINT_TYPES,
  OfficialComplaintType,
  mapComplaintTypeToCategory,
  EstimateItem,
} from '../../types/erp';

interface NewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: (ticketId: string) => void;
  initialMode?: 'AI_EMAIL' | 'MANUAL' | 'BRANCH_FIRST_ESTIMATE';
  preSelectedBranchId?: string;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
  initialMode = 'AI_EMAIL',
  preSelectedBranchId,
}) => {
  const { branches, createTicket, createBranchEstimate } = useERP();

  const [mode, setMode] = useState<'AI_EMAIL' | 'MANUAL' | 'BRANCH_FIRST_ESTIMATE'>(initialMode);
  const [emailText, setEmailText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Form Fields
  const [complaintType, setComplaintType] = useState<OfficialComplaintType>('Paint/ Tile / Seepage / Front Elevation - - -');
  const [complaintNumber, setComplaintNumber] = useState('');
  const [branchId, setBranchId] = useState(preSelectedBranchId || branches[0]?.id || 'BR-UBL-0962');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Electrical' | 'HVAC' | 'Plumbing' | 'Civil' | 'Glass & Aluminium' | 'IT & Signage'>('Civil');
  const [priority, setPriority] = useState<TicketPriority>('Emergency');
  const [scopeDescription, setScopeDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Ali yousaf (UBL BOM)');
  const [reportedContact, setReportedContact] = useState('0300-6543210');

  // Branch-First Estimate Fields
  const [branchEstimateItems, setBranchEstimateItems] = useState<Omit<EstimateItem, 'id'>[]>([
    {
      itemCode: 'CVL-01',
      description: 'Site rectification, surface preparation and material supply',
      category: 'Civil',
      unit: 'Job',
      quantity: 1,
      internalRate: 14000,
      internalAmount: 14000,
      clientRate: 19500,
      clientAmount: 19500,
    },
  ]);

  if (!isOpen) return null;

  const selectedBranch = branches.find((b) => b.id === branchId) || branches[0];

  const handleComplaintTypeChange = (newType: OfficialComplaintType) => {
    setComplaintType(newType);
    const mappedCategory = mapComplaintTypeToCategory(newType);
    setCategory(mappedCategory);
    if (!title || title.includes('Maintenance') || title.includes('Work Request')) {
      const cleanName = newType.replace(/ -+$/, '').trim();
      setTitle(`${cleanName} Work Request`);
    }
  };

  const handleSampleEmail = (type: 'UBL_BURKI_123913' | 'UBL_LIBERTY_123758' | 'UBL_CENTRALPARK_125376' | 'UBL_CHINIOT_125136') => {
    if (type === 'UBL_BURKI_123913') {
      // From user image 123913.png
      setComplaintType('Paint/ Tile / Seepage / Front Elevation - - -');
      setCategory('Civil');
      setPriority('Emergency');
      setComplaintNumber('123913');
      const b = branches.find((x) => x.code === '0640') || branches[0];
      setBranchId(b.id);
      setTitle('Ramp Repairing & Masonry Rectification');
      setReportedBy('Ali yousaf (UBL BOM)');
      setReportedContact('0300-6543210');
      setEmailText(`From: HERE4U <here4u@ubl.com.pk>
Subject: Ticket No :123913 - Ramp Repairing Burki Branch
Dear M/s Naeem Taj,

Complaint No 123913 has been assigned to you. Below are the Complaint details:

Complaint Number: 123913
Issue Details: ramp repairing
Branch Code: 640
Branch Name: Burki
BOM: Ali yousaf
Status: New
Complaint Type: Paint/ Tile / Seepage / Front Elevation - - -
Logged By: Ali yousaf
Vendor: Naeem Taj (naeembuilder48@gmail.com)
Vendor Contact: 0370-5908566
Branch Contact: 0300-6543210
Branch Address: Main Burki Road, Near PSO Pump, Lahore

You are requested to rectify on urgent basis and submit quotation for approval.`);
    } else if (type === 'UBL_LIBERTY_123758') {
      // From user image 123758.png
      setComplaintType('Glass/Door/Wood Work - - -');
      setCategory('Glass & Aluminium');
      setPriority('High');
      setComplaintNumber('123758');
      const b = branches.find((x) => x.code === '0962') || branches[0];
      setBranchId(b.id);
      setTitle('Cash Counter 12mm Glass Partition Alignment & Heavy Duty Brackets');
      setReportedBy('Tariq Mehmood Chishti (BOM)');
      setReportedContact('0321-4455889');
      setEmailText(`From: HERE4U <here4u@ubl.com.pk>
Subject: Ticket No :123758 - Cash Counter Glass Alignment Liberty Market Branch
Dear M/s Naeem Taj,

Complaint No 123758 has been assigned to you. Below are the Complaint details:

Complaint Number: 123758
Issue Details: Cash counter 12mm tempered safety glass partition misalignment, loose patch fittings, and high risk of dislodgement during teller operations.
Branch Code: 962
Branch Name: Liberty Market Branch Lahore
BOM: Tariq Mehmood Chishti
Status: New
Complaint Type: Glass/Door/Wood Work - - -
Logged By: Tariq Mehmood Chishti
Vendor: Naeem Taj (naeembuilder48@gmail.com)
Vendor Contact: 0370-5908566
Branch Contact: 0321-4455889
Branch Address: Commercial Zone, Liberty Market, Gulberg III, Lahore

Please inspect urgently, provide formal estimate and carry out stabilization work.`);
    } else if (type === 'UBL_CENTRALPARK_125376') {
      setComplaintType('Paint/ Tile / Seepage / Front Elevation - - -');
      setCategory('Civil');
      setPriority('Emergency');
      setComplaintNumber('125376');
      const b = branches.find((x) => x.code === '2174') || branches[0];
      setBranchId(b.id);
      setTitle('Seepage Issue in Basement & Chemical Injection Grouting');
      setReportedBy('Hamaz Aftab (United Bank Limited)');
      setReportedContact('0370-5908566');
      setEmailText(`From: Hamaz Aftab <hamaz.aftab@ubl.com.pk>
Subject: Complaint No 125376 Assignment - UBL Ameen Central Park Lahore Branch
Dear M/s Naeem Taj,

Complaint No 125376 has been assigned to you. Below are the Complaint details:

Complaint Number: 125376
Issue Details: Seepage issue in Basement
Status: New
Complaint Type: Paint/ Tile / Seepage / Front Elevation - - -
Complaint Date: 16/09/2026 12:35:48
Logged By: Hamaz Aftab
Vendor: Naeem Taj (naeembuilder48@gmail.com)
Vendor Contact: 0370-5908566
Branch Code: 2174
Branch Name: UBL Ameen Central Park Lahore Branch (ABEP DEC 2024)
BOM: AQDAS QUDSIA
Branch Contact Number: 0321-5792687/0326-8252174
Branch Address: Property NO.47, Block -B Central Park, Lahore.

You are requested to rectify on urgent basis. Kindly respond to this mail with Job Verification Certificate attached.
Regards, Hamaz Aftab, United Bank Limited`);
    } else {
      setComplaintType('Paint/ Tile / Seepage / Front Elevation - - -');
      setCategory('Civil');
      setPriority('High');
      setComplaintNumber('125136');
      const b = branches.find((x) => x.code === '0401') || branches[0];
      setBranchId(b.id);
      setTitle('Ceiling Tiles Replacement & Light Fixtures Reinstallation');
      setReportedBy('Muhammad Irfan (BOM)');
      setReportedContact('0300-6543210');
      setEmailText(`From: HERE4U <here4u@ubl.com.pk>
Subject: Ticket No :125136 - Ceiling Works & Lights Chiniot Branch
Dear M/s Naeem Taj,

Complaint No 125136 has been assigned to you. Below are the Complaint details:

Complaint Number: 125136
Issue Details: Ceiling tiles damaged and light fixtures require reinstallation after duct inspection
Branch Code: 0401
Branch Name: UBL Faisalabad Road Chiniot Branch
BOM: Muhammad Irfan
Status: New
Complaint Type: Paint/ Tile / Seepage / Front Elevation - - -
Category: Civil / Ceiling Works
Kindly inspect the premises and share formal quotation for ceiling & lights.
Regards, Hamaz Aftab & Anum Shahid, HERE4U Network Operations`);
    }
  };

  const handleExtractWithAI = async () => {
    if (!emailText.trim()) return;
    setIsExtracting(true);
    try {
      const res = await fetch('/api/ai/extract-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        if (d.title) setTitle(d.title);
        if (d.scopeDescription) setScopeDescription(d.scopeDescription);
        if (d.priority) setPriority(d.priority as TicketPriority);
        if (d.category) setCategory(d.category as any);
        if (d.senderContact) setReportedBy(d.senderContact);
        if (d.complaintNumber) setComplaintNumber(d.complaintNumber);
        if (d.complaintType) {
          setComplaintType(d.complaintType as OfficialComplaintType);
          setCategory(mapComplaintTypeToCategory(d.complaintType));
        }

        // Match branch by code or name
        const matched = branches.find((b) =>
          d.branchCode && (b.code === d.branchCode || b.code.replace(/^0+/, '') === d.branchCode.replace(/^0+/, ''))
        ) || branches.find((b) =>
          d.branchName && (b.name.toLowerCase().includes(d.branchName.toLowerCase()) || d.branchName.toLowerCase().includes(b.name.toLowerCase()))
        );

        if (matched) setBranchId(matched.id);

        setMode('MANUAL');
      }
    } catch (err) {
      console.error('AI extract failed:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateBranchFirstEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = selectedBranch;

    const items: EstimateItem[] = branchEstimateItems.map((item, idx) => ({
      ...item,
      id: `ITM-BR-${Date.now()}-${idx}`,
      internalAmount: item.internalAmount ?? ((item.internalRate || 0) * item.quantity),
      clientAmount: item.clientAmount ?? ((item.clientRate || 0) * item.quantity),
    }));

    const ticket = createBranchEstimate({
      branchCode: branch.code,
      branchId: branch.id,
      branchName: branch.name,
      branchAddress: branch.completeAddress,
      title: title || `${complaintType.replace(/ -+$/, '')} at UBL Branch ${branch.code}`,
      category,
      complaintType,
      priority,
      scopeDescription: scopeDescription || `Estimate prepared according to UBL Branch Code ${branch.code} (${branch.name}). Official ticket number to be assigned afterward by UBL portal.`,
      items,
      createdBy: 'Naeem Taj (Estimator)',
    });

    onTicketCreated(ticket.id);
    onClose();
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const branch = selectedBranch;
    const ticketNumToUse = complaintNumber.trim() || undefined;

    const newTicket = createTicket({
      ticketNumber: ticketNumToUse,
      ticketNumberStatus: ticketNumToUse ? 'ASSIGNED' : 'ASSIGNED',
      ublBranchCode: branch.code,
      branchAddress: branch.completeAddress,
      title: title || `${complaintType.replace(/ -+$/, '')} Work Request`,
      client: 'United Bank Limited',
      branchId: branch.id,
      branchName: branch.name,
      city: branch.city,
      region: branch.region,
      category,
      complaintType,
      priority,
      scopeDescription: scopeDescription || title,
      reportedBy,
      reportedByContact: reportedContact,
      emailSource: emailText
        ? {
            emailId: `EML-${Date.now().toString().slice(-4)}`,
            subject: title || 'Inbound Work Request',
            sender: reportedBy,
            receivedAt: new Date().toLocaleString(),
            bodySnippet: emailText.slice(0, 200),
          }
        : undefined,
    });

    onTicketCreated(newTicket.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Log UBL Maintenance Work / Estimate</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  UBL Only
                </span>
              </div>
              <p className="text-xs text-slate-400">United Bank Limited • HERE4U Maintenance Operations</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Workflow Modes Switcher */}
        <div className="p-2.5 bg-slate-950/50 border-b border-slate-800 flex items-center gap-2 px-5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMode('AI_EMAIL')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
              mode === 'AI_EMAIL'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Email Extractor</span>
          </button>

          <button
            onClick={() => setMode('BRANCH_FIRST_ESTIMATE')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
              mode === 'BRANCH_FIRST_ESTIMATE'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                : 'text-cyan-400 hover:text-cyan-200 hover:bg-slate-800 border border-cyan-500/30'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Estimate by Branch Code (Ticket Follows)</span>
          </button>

          <button
            onClick={() => setMode('MANUAL')}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all ${
              mode === 'MANUAL'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <span>Standard Manual Ticket</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {mode === 'AI_EMAIL' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Paste UBL HERE4U Maintenance Email (or click actual ticket templates):
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleSampleEmail('UBL_BURKI_123913')}
                    className="text-[11px] px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold"
                  >
                    ★ UBL Burki #123913 (Branch 640 Ramp)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleEmail('UBL_LIBERTY_123758')}
                    className="text-[11px] px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 font-semibold"
                  >
                    ★ UBL Liberty #123758 (Branch 962 Glass)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleEmail('UBL_CENTRALPARK_125376')}
                    className="text-[11px] px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold"
                  >
                    ★ UBL Central Park #125376 (Branch 2174)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSampleEmail('UBL_CHINIOT_125136')}
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    UBL Chiniot #125136 (Branch 0401)
                  </button>
                </div>
                <textarea
                  rows={8}
                  value={emailText}
                  onChange={(e) => setEmailText(e.target.value)}
                  placeholder="Paste incoming UBL HERE4U email body here..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExtractWithAI}
                  disabled={isExtracting || !emailText.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isExtracting ? 'Extracting with Gemini AI...' : 'Parse & Auto-Fill Ticket Fields'}</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE: BRANCH-FIRST ESTIMATE (NO TICKET ID YET) */}
          {mode === 'BRANCH_FIRST_ESTIMATE' && (
            <form onSubmit={handleCreateBranchFirstEstimate} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                  <Calculator className="w-4 h-4" />
                  <span>Branch-First Estimation (Provisional Workflow)</span>
                </div>
                <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                  Used when UBL operations requests an immediate quotation based solely on the <strong>Branch Code &amp; Address</strong>. The system generates a provisional estimate code. When the official ticket number is generated later in UBL HERE4U, you can link it with 1 click.
                </p>
              </div>

              {/* Branch Selection */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <label className="text-slate-300 font-bold block">
                  Select Target UBL Branch (Code &amp; Address):
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-cyan-400"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      Branch Code {b.code} - {b.name} ({b.city})
                    </option>
                  ))}
                </select>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div><strong>Branch Code:</strong> <span className="font-mono text-cyan-400 font-bold">{selectedBranch.code}</span></div>
                  <div><strong>Official Address:</strong> {selectedBranch.completeAddress}</div>
                  <div><strong>BOM (Branch Manager):</strong> {selectedBranch.bomName} ({selectedBranch.bomContact})</div>
                </div>
              </div>

              {/* Work Scope & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Work Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramp Repairing / Glass Alignment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Trade Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Glass & Aluminium">Glass & Aluminium</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="IT & Signage">IT & Signage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Scope of Work to Estimate:</label>
                <textarea
                  rows={2}
                  required
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  placeholder="Details of required civil repairs, materials, and labor according to branch code..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              {/* Estimate Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-bold">Estimate Line Items:</label>
                  <button
                    type="button"
                    onClick={() => {
                      setBranchEstimateItems((prev) => [
                        ...prev,
                        {
                          itemCode: `WRK-0${prev.length + 1}`,
                          description: 'Additional maintenance item',
                          category,
                          unit: 'Job',
                          quantity: 1,
                          internalRate: 10000,
                          internalAmount: 10000,
                          clientRate: 14000,
                          clientAmount: 14000,
                        },
                      ]);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                  >
                    + Add Line Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {branchEstimateItems.map((item, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBranchEstimateItems((prev) =>
                              prev.map((it, i) => (i === idx ? { ...it, description: val } : it))
                            );
                          }}
                          placeholder="Item description"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                        {branchEstimateItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setBranchEstimateItems((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-red-400 hover:text-red-300 text-xs px-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Qty:</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const q = Number(e.target.value) || 1;
                              setBranchEstimateItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        quantity: q,
                                        internalAmount: (it.internalRate || 0) * q,
                                        clientAmount: (it.clientRate || 0) * q,
                                      }
                                    : it
                                )
                              );
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500 block">Unit:</span>
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => {
                              const u = e.target.value;
                              setBranchEstimateItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, unit: u } : it))
                              );
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500 block">Internal Cost:</span>
                          <input
                            type="number"
                            value={item.internalRate}
                            onChange={(e) => {
                              const rate = Number(e.target.value) || 0;
                              setBranchEstimateItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        internalRate: rate,
                                        internalAmount: rate * it.quantity,
                                      }
                                    : it
                                )
                              );
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white"
                          />
                        </div>
                        <div>
                          <span className="text-amber-400 block font-bold">Client Quoted:</span>
                          <input
                            type="number"
                            value={item.clientRate}
                            onChange={(e) => {
                              const rate = Number(e.target.value) || 0;
                              setBranchEstimateItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        clientRate: rate,
                                        clientAmount: rate * it.quantity,
                                      }
                                    : it
                                )
                              );
                            }}
                            className="w-full bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-amber-300 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Estimate Summary */}
              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total Direct Cost:</span>
                  <div className="font-mono text-white font-bold">
                    PKR {branchEstimateItems.reduce((acc, i) => acc + ((i.internalRate || 0) * i.quantity), 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Quoted (excl PRA 16%):</span>
                  <div className="font-mono text-amber-400 font-bold">
                    PKR {branchEstimateItems.reduce((acc, i) => acc + ((i.clientRate || 0) * i.quantity), 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">Total Client Proposal:</span>
                  <div className="font-mono text-emerald-400 text-sm font-bold">
                    PKR {Math.round(branchEstimateItems.reduce((acc, i) => acc + ((i.clientRate || 0) * i.quantity), 0) * 1.16).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md shadow-cyan-500/20"
                >
                  Save Branch Estimate &amp; Quotation
                </button>
              </div>
            </form>
          )}

          {/* MODE: MANUAL TICKET ENTRY */}
          {mode === 'MANUAL' && (
            <form onSubmit={handleSubmitManual} className="space-y-4 text-xs">
              {/* Official Bank Complaint Type Card */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/40 shadow-inner space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rise in Complaint Type (Official Portal Standards):</span>
                  </label>
                  <span className="text-[10px] bg-amber-500/15 text-amber-300 font-mono font-bold px-2 py-0.5 rounded border border-amber-500/30">
                    HERE4U System 1 Standard
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="sm:col-span-2">
                    <select
                      value={complaintType}
                      onChange={(e) => handleComplaintTypeChange(e.target.value as OfficialComplaintType)}
                      className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-3 py-2 text-white font-medium text-xs focus:outline-none focus:border-amber-400"
                    >
                      {OFFICIAL_COMPLAINT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Ticket # (e.g. 123913)"
                      value={complaintNumber}
                      onChange={(e) => setComplaintNumber(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <div className="text-[10px] text-slate-400 mb-1.5 font-medium">Quick Select Official Complaint Type:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {OFFICIAL_COMPLAINT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleComplaintTypeChange(type)}
                        className={`text-[10px] px-2.5 py-1 rounded transition-all font-mono cursor-pointer ${
                          complaintType === type
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-1 ring-amber-400'
                            : 'bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Target UBL Branch:</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} (Code {b.code} • {b.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Ticket Title / Summary:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramp Repairing"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Civil">Civil</option>
                    <option value="Glass & Aluminium">Glass & Aluminium</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="IT & Signage">IT & Signage</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Priority Level:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TicketPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Detailed Scope Description:</label>
                <textarea
                  rows={3}
                  required
                  value={scopeDescription}
                  onChange={(e) => setScopeDescription(e.target.value)}
                  placeholder="Describe failure condition, affected equipment, or damage..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Reported By (BOM / Contact):</label>
                  <input
                    type="text"
                    value={reportedBy}
                    onChange={(e) => setReportedBy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Contact Phone:</label>
                  <input
                    type="text"
                    value={reportedContact}
                    onChange={(e) => setReportedContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                >
                  Create Master Ticket
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
