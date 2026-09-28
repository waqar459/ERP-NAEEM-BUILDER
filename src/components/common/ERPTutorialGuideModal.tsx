import React, { useState } from 'react';
import {
  Printer,
  X,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Shield,
  FileText,
  Mail,
  Truck,
  Building2,
  DollarSign,
  Download,
  Users,
  Compass,
  FileCheck,
  Upload,
  Receipt,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface ERPTutorialGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ERPTutorialGuideModal: React.FC<ERPTutorialGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'FLOWCHART' | 'STEP_BY_STEP' | 'TESTING_CHECKLIST' | 'ROLES'>(
    'FLOWCHART'
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const workflowSteps = [
    {
      step: 1,
      title: 'UBL Request Received',
      tag: 'Step 1: Intake',
      color: 'blue',
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      description:
        'Official complaint received from UBL HERE4U system or Gmail email thread. Ticket or Branch Estimate created with UBL branch code & fault details.',
      action: 'Click "+ HERE4U Ticket" or select "UBL Requests / Tickets".',
    },
    {
      step: 2,
      title: 'Branch Survey & GPS Verification',
      tag: 'Step 2: Survey',
      color: 'purple',
      icon: <Compass className="w-5 h-5 text-purple-600" />,
      description:
        'Technical staff visits branch. GPS proximity audit verifies field staff is within 500m of registered branch coordinates. Photos & measurements logged.',
      action: 'Open Ticket -> Site Survey -> Record GPS check-in.',
    },
    {
      step: 3,
      title: 'Official Estimate & Quotation',
      tag: 'Step 3: Costing',
      color: 'amber',
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      description:
        'Prepared using official Naeem Builder letterhead, standard UBL schedule rates, and 16% PRA/SRB sales tax. Official Doc #2601XXXX generated.',
      action: 'Click "Prepare Quotation" -> Select items -> Generate PDF.',
    },
    {
      step: 4,
      title: 'UBL Approval & PO Confirmation',
      tag: 'Step 4: Approval',
      color: 'emerald',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      description:
        'Branch Operations Manager (BOM) or UBL Facilities Approver approves quotation amount. Financial lock established.',
      action: 'Mark "UBL Approval Received" & record approval reference.',
    },
    {
      step: 5,
      title: 'Staff Allocation (Electrician / Painter)',
      tag: 'Step 5: Dispatch',
      color: 'indigo',
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      description:
        'Allocate technician according to trade: Electrician for DB/wiring/lighting, Painter for wall emulsion/plaster, HVAC technician for cooling units, or Civil staff for tiling.',
      action: 'Open Staff Allocation -> Assign specialized technician with trade badge.',
    },
    {
      step: 6,
      title: 'Delivery Note Hard Copy Printout',
      tag: 'Step 6: Hard Copy Print',
      color: 'sky',
      icon: <Printer className="w-5 h-5 text-sky-600" />,
      description:
        'Technician takes printed Delivery Note (Doc Ref S/2601XXXX) to site. Contains work item descriptions, Naeem Builder TIN/GST header, and 3 signature columns.',
      action: 'Click "View Delivery Note" -> Print single-page hard copy.',
    },
    {
      step: 7,
      title: 'Branch Manager Sign & Stamp',
      tag: 'Step 7: Verification',
      color: 'teal',
      icon: <FileCheck className="w-5 h-5 text-teal-600" />,
      description:
        'Upon job execution, Branch Operations Manager inspects work, signs physical Delivery Note, applies official UBL round rubber stamp & writes date.',
      action: 'On-site: Physical signature & stamp stamped on paper.',
    },
    {
      step: 8,
      title: 'Send Stamped Scan to Gmail Thread',
      tag: 'Step 8: Email Scan',
      color: 'cyan',
      icon: <Upload className="w-5 h-5 text-cyan-600" />,
      description:
        'Technician captures clear photo or scan of signed/stamped Delivery Note and attaches it back to original UBL Gmail thread for instant digital audit.',
      action: 'Open Gmail / Email Threads -> Attach stamped scan image & send email.',
    },
    {
      step: 9,
      title: 'Deposit Physical Paper to Office',
      tag: 'Step 9: Office Custody',
      color: 'amber',
      icon: <Building2 className="w-5 h-5 text-amber-600" />,
      description:
        'Technician returns to Naeem Builder head office and deposits the physical stamped paper with Accounts department for permanent records & billing file.',
      action: 'Mark "Hard Copy Deposited in Office" in ticket dossier.',
    },
    {
      step: 10,
      title: 'Official Sales Tax Invoice',
      tag: 'Step 10: Billing',
      color: 'rose',
      icon: <Receipt className="w-5 h-5 text-rose-600" />,
      description:
        'Accounts issues Sales Tax Invoice (NTN# 6974254-1, GST# 3520194159531) with 16% PRA GST and statutory withholding tax breakdown. Consolidated if under Rs 500k.',
      action: 'Generate Invoice -> Download official tax invoice PDF.',
    },
    {
      step: 11,
      title: 'UBL Payment & Bank Reconciliation',
      tag: 'Step 11: Settlement',
      color: 'emerald',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      description:
        'UBL releases funds via Online Transfer / Cheque. Accounts logs UBL-TRF reference, allocates payment against invoice, and archives audit trail.',
      action: 'Record Payment -> Allocate to Job -> Mark ticket "Paid & Closed".',
    },
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print-document-root print:p-0 print:m-0 print:bg-white print:static print:inset-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[96vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden my-auto print:max-h-none print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:bg-white print:overflow-visible">
        {/* Modal Top Header (Hidden on print) */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Naeem Builder ERP — Tutorial &amp; Implementation Guide
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                  User Education PDF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete workflow chart, technician allocation rules, and step-by-step testing instructions for all users.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
              title="Print tutorial or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF Guide</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Sub-Tabs (Hidden on print) */}
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex gap-1 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab('FLOWCHART')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'FLOWCHART'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📊 End-to-End Workflow Flowchart
          </button>
          <button
            onClick={() => setActiveTab('STEP_BY_STEP')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'STEP_BY_STEP'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            📋 11-Step Detailed Procedures
          </button>
          <button
            onClick={() => setActiveTab('TESTING_CHECKLIST')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'TESTING_CHECKLIST'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            ✅ User Testing &amp; Education Checklist
          </button>
          <button
            onClick={() => setActiveTab('ROLES')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'ROLES'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            👥 Roles &amp; Responsibilities Matrix
          </button>
        </div>

        {/* Printable Document Content */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-950/60 print-document-content print:p-0 print:bg-white print:overflow-visible">
          <div className="bg-white text-slate-950 p-6 sm:p-8 rounded-xl shadow-xl max-w-4xl mx-auto print:shadow-none print:max-w-none print:p-4 print:border-none">
            {/* Guide Header Banner */}
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-blue-900 text-white text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Official Guide
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    Doc Ref: NB-ERP-TUT-2026
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-950 tracking-tight mt-1">
                  Naeem Builder ERP — Standard Operating Guide &amp; Charts
                </h1>
                <p className="text-xs text-slate-600">
                  UBL Maintenance, Repairing, Delivery Notes, Stamp Sign &amp; Payment Reconciliation Workflow
                </p>
              </div>

              <div className="text-right text-xs text-slate-700 hidden sm:block">
                <div className="font-bold text-slate-900">NAEEM BUILDER</div>
                <div>NTN# 6974254-1</div>
                <div>GST# 3520194159531</div>
              </div>
            </div>

            {/* TAB 1: FLOWCHART VIEW */}
            {(activeTab === 'FLOWCHART' || true) && (
              <div className={activeTab === 'FLOWCHART' ? 'block' : 'hidden print:block'}>
                <div className="mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
                    <span>1. End-to-End Visual Workflow Chart</span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Follow the cycle below for every UBL ticket from complaint intake to physical deposit and payment settlement:
                  </p>
                </div>

                {/* Diagrammatic Grid of Stages */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                  {workflowSteps.map((ws) => (
                    <div
                      key={ws.step}
                      className="border border-slate-300 rounded-lg p-3 bg-slate-50 hover:bg-blue-50/50 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                            {ws.step}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                            {ws.tag}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                          {ws.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                          {ws.description}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-[10px] font-medium text-blue-900">
                        👉 <span className="font-semibold">Action:</span> {ws.action}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Highlight: The Electrician/Painter & Hard Copy Process requested by User */}
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg mb-6">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>Special Focus: Staff Allocation &amp; Signed Delivery Note Custody</span>
                  </h4>
                  <div className="text-[11px] text-slate-800 space-y-1.5 leading-relaxed">
                    <p>
                      <strong>1. Trade Specialization:</strong> When approving a ticket, assign the work strictly to the matched staff: <em>Electrician</em> (for wiring, DB breakers, lighting, generators) or <em>Painter</em> (for wall peeling, dampness treatment, emulsion coating, ceiling repaint).
                    </p>
                    <p>
                      <strong>2. Hard Copy Printout:</strong> Technician clicks <code>View Delivery Note</code> &rarr; <code>Print Document</code> to take the physical paper to the branch.
                    </p>
                    <p>
                      <strong>3. Branch Stamp &amp; Signature:</strong> Branch Operations Manager (BOM) verifies the executed repairs, signs, dates, and applies the official round bank stamp on the Delivery Note.
                    </p>
                    <p>
                      <strong>4. Dual Path Processing:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                      <li><strong>Path A (Digital Email):</strong> Take photo of stamped Delivery Note &rarr; Attach into UBL Gmail Thread for immediate digital closure confirmation.</li>
                      <li><strong>Path B (Physical Custody):</strong> Technician hands the original paper into Naeem Builder Head Office &rarr; Deposited with Accounts team for billing audit.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: STEP BY STEP PROCEDURES */}
            {(activeTab === 'STEP_BY_STEP' || false) && (
              <div className={activeTab === 'STEP_BY_STEP' ? 'block' : 'hidden print:block print:mt-6 print:pt-6 print:border-t print:border-slate-300'}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 mb-3">
                  2. Step-by-Step Operational Instructions
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="p-3 border border-slate-200 rounded-md">
                    <h5 className="text-xs font-bold text-slate-900">Step A: Creating or Importing a UBL Complaint</h5>
                    <p className="text-[11px] text-slate-600 mt-1">
                      From the top bar or sidebar, click <code>UBL Requests / Tickets</code> or <code>+ HERE4U Ticket</code>. You can paste an email from UBL with AI auto-extraction, or enter the branch code directly (e.g. <code>640</code> for Burki, <code>962</code> for Liberty).
                    </p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-md">
                    <h5 className="text-xs font-bold text-slate-900">Step B: Preparing Quotation with Standard Rates</h5>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Click <code>Prepare Quotation</code> inside the ticket modal. Select standard schedule items. The system automatically computes 16% PRA GST and presents the official document layout with TIN / NTN.
                    </p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-md">
                    <h5 className="text-xs font-bold text-slate-900">Step C: Generating &amp; Printing the Delivery Note</h5>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Click <code>Official PDF Documents</code> &rarr; <code>Delivery Note</code>. Press <code>Print Document</code>. The system isolates the A4 sheet so it prints on a single page with crisp borders and no duplicates.
                    </p>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-md">
                    <h5 className="text-xs font-bold text-slate-900">Step D: Uploading Signed Stamped Scan to Gmail Thread</h5>
                    <p className="text-[11px] text-slate-600 mt-1">
                      In the sidebar click <code>Gmail / Email Threads</code> or open the ticket's Communication tab. Upload the signed and stamped delivery note scan image. An automated reply is prepared for the UBL operations desk.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: USER TESTING CHECKLIST */}
            {(activeTab === 'TESTING_CHECKLIST' || false) && (
              <div className={activeTab === 'TESTING_CHECKLIST' ? 'block' : 'hidden print:block print:mt-6 print:pt-6 print:border-t print:border-slate-300'}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 mb-3">
                  3. Implementation &amp; User Testing Checklist
                </h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs mb-6">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-800">
                      <tr>
                        <th className="p-2.5">Test Case ID</th>
                        <th className="p-2.5">Module / Action</th>
                        <th className="p-2.5">Expected Result</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px] text-slate-700">
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-900">TC-01</td>
                        <td className="p-2">Search Bar Testing</td>
                        <td className="p-2">Entering "Burki" or "NB-2024" instantly filters matching jobs and tickets.</td>
                        <td className="p-2 font-semibold text-emerald-700">✓ Ready to test</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-900">TC-02</td>
                        <td className="p-2">Single-Page PDF Print</td>
                        <td className="p-2">Clicking Print in Estimate or Delivery Note prints exactly 1 clean page with zero duplicate text.</td>
                        <td className="p-2 font-semibold text-emerald-700">✓ Verified</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-900">TC-03</td>
                        <td className="p-2">Electrician / Painter Staff Dispatch</td>
                        <td className="p-2">Assign staff with trade badge; delivery note reflects assignee name.</td>
                        <td className="p-2 font-semibold text-emerald-700">✓ Ready to test</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-900">TC-04</td>
                        <td className="p-2">Stamped Delivery Note Scan</td>
                        <td className="p-2">Upload stamped photo and verify it syncs with email thread.</td>
                        <td className="p-2 font-semibold text-emerald-700">✓ Ready to test</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-900">TC-05</td>
                        <td className="p-2">Office Physical Hard Copy Custody</td>
                        <td className="p-2">Checkmark "Physical Copy Deposited into Office" moves ticket to billing queue.</td>
                        <td className="p-2 font-semibold text-emerald-700">✓ Ready to test</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-blue-900">TC-06</td>
                        <td className="p-2">Sales Tax Invoice &amp; Tax Audit</td>
                        <td className="p-2">Verify 16% PRA GST is calculated accurately and appears on final invoice.</td>
                        <td className="p-2 font-semibold text-emerald-700">✓ Ready to test</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 4: ROLES MATRIX */}
            {(activeTab === 'ROLES' || false) && (
              <div className={activeTab === 'ROLES' ? 'block' : 'hidden print:block print:mt-6 print:pt-6 print:border-t print:border-slate-300'}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 mb-3">
                  4. Staff Roles &amp; Responsibilities Matrix
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-6">
                  <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                    <h6 className="font-bold text-slate-900 text-xs">Branch Operations Manager (UBL)</h6>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 mt-1 space-y-1">
                      <li>Signs off site visit findings &amp; grants access.</li>
                      <li>Reviews quotation and grants financial approval.</li>
                      <li>Signs &amp; stamps physical delivery note upon completion.</li>
                    </ul>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                    <h6 className="font-bold text-slate-900 text-xs">Field Technician (Electrician / Painter)</h6>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 mt-1 space-y-1">
                      <li>Takes printed delivery note hard copy to site.</li>
                      <li>Executes repairs to bank engineering standards.</li>
                      <li>Gets stamp &amp; signature from Branch Manager.</li>
                      <li>Deposits physical paper to Naeem Builder office.</li>
                    </ul>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                    <h6 className="font-bold text-slate-900 text-xs">Operations Coordinator / Estimator</h6>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 mt-1 space-y-1">
                      <li>Prepares accurate BOQ based on master schedule rates.</li>
                      <li>Dispatches correct technician according to trade.</li>
                      <li>Sends stamped scan image to UBL Gmail thread.</li>
                    </ul>
                  </div>
                  <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                    <h6 className="font-bold text-slate-900 text-xs">Accounts Department</h6>
                    <ul className="list-disc pl-4 text-[11px] text-slate-600 mt-1 space-y-1">
                      <li>Verifies physical stamped delivery note in office.</li>
                      <li>Issues official sales tax invoices with PRA/SRB.</li>
                      <li>Reconciles UBL bank transfer / cheque payments.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Document Footer Signatures */}
            <div className="pt-4 border-t-2 border-slate-900 flex items-center justify-between text-xs text-slate-600">
              <div>
                Approved for Implementation &amp; Training &bull; <strong>Naeem Builder ERP</strong>
              </div>
              <div className="font-mono text-[11px]">
                Revision 2.4 &bull; 2026 Edition
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden on print) */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 no-print">
          <span>
            Tip: Click <strong>"Print / Save PDF Guide"</strong> to download this entire document as an official PDF for onboarding staff and clients.
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
