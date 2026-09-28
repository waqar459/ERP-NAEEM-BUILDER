import React, { useState } from 'react';
import {
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  Building,
  User,
  Phone,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Star,
  CornerUpLeft,
  MoreVertical,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { Ticket, GmailMessage, BankComplaintDetails } from '../../types/erp';
import { useERP } from '../../context/ERPContext';

interface GmailThreadViewProps {
  ticket: Ticket;
  onOpenQuotationPreview?: () => void;
}

export const GmailThreadView: React.FC<GmailThreadViewProps> = ({
  ticket,
  onOpenQuotationPreview,
}) => {
  const { updateTicket, addAuditLog, advanceTicketStatus } = useERP();

  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({
    bank_inbound: true,
    last_msg: true,
  });

  // Toggle message expansion
  const toggleExpand = (id: string) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Compile thread messages or fallback to default bank complaint thread
  const messages: GmailMessage[] = ticket.gmailThread && ticket.gmailThread.length > 0
    ? ticket.gmailThread
    : [
        {
          id: 'msg-bank-01',
          senderName: 'HERE4U Complaint Dispatch',
          senderEmail: 'here4u@ubl.com.pk',
          senderRole: 'United Bank Limited - Network Operations',
          recipientEmails: ['naeembuilder48@gmail.com'],
          date: ticket.reportedDate || 'Tuesday, 15 September 2026 3:07 PM',
          subject: `Ticket No :${ticket.ticketNumber}`,
          body: `Dear M/s Naeem Taj,\n\nComplaint No ${ticket.ticketNumber} has been assigned to you. Below are the Complaint details:`,
          isBankInbound: true,
          bankComplaintDetails: ticket.bankComplaintDetails || {
            complaintNumber: ticket.ticketNumber,
            issueDetails: ticket.scopeDescription || 'Ceiling works and electrical lights reinstallation',
            status: 'New',
            complaintType: ticket.category === 'Civil' ? 'Civil / Paint / Ceiling' : `${ticket.category} Maintenance`,
            complaintDate: ticket.reportedDate || '16/09/2026 12:35:48',
            loggedBy: 'Hamaz Aftab (HERE4U)',
            vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
            vendorContact: '0370-5908566',
            branchCode: ticket.branchId || '2174',
            branchName: ticket.branchName,
            bom: ticket.reportedBy || 'Branch Operations Manager',
            branchContactNumber: ticket.reportedByContact || '0321-5792687',
            branchAddress: `${ticket.branchName}, ${ticket.city}`,
          },
        },
        {
          id: 'msg-bank-02',
          senderName: 'Hamaz Aftab',
          senderEmail: 'hamaz.aftab@ubl.com.pk',
          senderRole: 'HERE4U - Complaint Resolution Officer',
          recipientEmails: ['naeembuilder48@gmail.com'],
          date: '15 September 2026 4:15 PM',
          subject: `Re: Ticket No :${ticket.ticketNumber}`,
          body: `Team Naeem Taj,\n\nKindly share the current status and submit quotation.\n\nHamaz Aftab\nHere4u - Complaint Resolution Officer\nNetwork Operations`,
          isBankInbound: true,
        },
        {
          id: 'msg-bank-03',
          senderName: 'Anum Shahid',
          senderEmail: 'anum.shahid@ubl.com.pk',
          senderRole: 'Shared Services Group',
          recipientEmails: ['naeembuilder48@gmail.com'],
          date: '16 September 2026 10:24 AM',
          subject: `Re: Ticket No :${ticket.ticketNumber}`,
          body: `Dear Naeem,\n\nWhere is delay. Kindly send quotation.\n\nRegards,\nAnum Shahid\nShared Services Group\nPhone # : 042-36360038`,
          isBankInbound: true,
        },
        {
          id: 'msg-nb-04',
          senderName: 'Naeem Builder',
          senderEmail: 'naeembuilder48@gmail.com',
          senderRole: 'Naeem Builder Dispatch',
          recipientEmails: ['anum.shahid@ubl.com.pk'],
          date: '16 September 2026 11:05 AM',
          subject: `Re: Ticket No :${ticket.ticketNumber}`,
          body: `Dear Madam,\n\nSharing quotation in short.\n\nRegards,\nNaeem Builder`,
          isNaeemBuilderOutbound: true,
        },
        {
          id: 'msg-nb-05',
          senderName: 'Naeem Builder',
          senderEmail: 'naeembuilder48@gmail.com',
          senderRole: 'Naeem Builder Official',
          recipientEmails: [
            'here4u@ubl.com.pk',
            'hamaz.aftab@ubl.com.pk',
            'nauman.zaheer@ubl.com.pk',
            'anum.shahid@ubl.com.pk',
          ],
          date: '16 September 2026 11:45 AM',
          subject: `Re: Ticket No :${ticket.ticketNumber} - Official Quotation Attached`,
          body: `Dear Concerned,\n\nAttached please find the quotation for your consideration and approval.\n\nRegards,\nNaeem Builder\n0347-6066666`,
          isNaeemBuilderOutbound: true,
          attachments: [
            { name: 'Site_Inspection_Photo_01.jpg', size: '1.2 MB', type: 'image' },
            { name: 'Site_Inspection_Photo_02.jpg', size: '1.4 MB', type: 'image' },
            {
              name: `${ticket.branchName.toUpperCase()} - TICKET # ${ticket.ticketNumber}.pdf`,
              size: '342 KB',
              type: 'pdf',
            },
          ],
        },
      ];

  // Send an outbound reply from Naeem Builder
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSending(true);
    const newMsg: GmailMessage = {
      id: `msg-nb-${Date.now()}`,
      senderName: 'Naeem Builder',
      senderEmail: 'naeembuilder48@gmail.com',
      senderRole: 'Naeem Builder Official',
      recipientEmails: [
        'here4u@ubl.com.pk',
        'hamaz.aftab@ubl.com.pk',
        'anum.shahid@ubl.com.pk',
      ],
      date: new Date().toLocaleString(),
      subject: `Re: Ticket No :${ticket.ticketNumber}`,
      body: replyText,
      isNaeemBuilderOutbound: true,
    };

    updateTicket(ticket.id, (prev) => ({
      ...prev,
      gmailThread: [...(prev.gmailThread || messages), newMsg],
    }));

    addAuditLog(
      'SEND_EMAIL',
      'Ticket',
      ticket.ticketNumber,
      `Outbound Gmail reply sent to Bank HERE4U team by Naeem Builder`
    );

    setReplyText('');
    setIsSending(false);
    setShowReplyBox(false);
  };

  // Simulate or Record Client Approval via Email
  const handleSimulateEmailApproval = () => {
    const approvalAmount = ticket.quotation?.totalAmount || ticket.estimates[0]?.totalEstimatedAmount || 26332;
    const approvalRef = `UBL/SSG/2026/${ticket.ticketNumber}-APR`;

    const approvalMsg: GmailMessage = {
      id: `msg-appr-${Date.now()}`,
      senderName: 'Anum Shahid (Shared Services Group)',
      senderEmail: 'anum.shahid@ubl.com.pk',
      senderRole: 'Client Approving Authority',
      recipientEmails: ['naeembuilder48@gmail.com'],
      date: new Date().toLocaleString(),
      subject: `Re: Ticket No :${ticket.ticketNumber} - FINANCIAL APPROVAL SANCTIONED`,
      body: `Dear Naeem Builder,\n\nWe have evaluated your quotation for PKR ${approvalAmount.toLocaleString()} (inclusive of 16% GST) for ${ticket.branchName}.\n\nFormal financial authorization is hereby granted under Reference: ${approvalRef}.\nPlease mobilize materials and coordinate with Branch Operations Manager (${ticket.reportedBy || 'BOM'}) to execute work strictly without disrupting customer services.\n\nRegards,\nAnum Shahid\nShared Services Group, United Bank Limited\nPhone: 042-36360038`,
      isBankInbound: true,
      isApprovalNotification: true,
    };

    updateTicket(ticket.id, (prev) => ({
      ...prev,
      status: 'Approved',
      approval: {
        id: `APP-${ticket.ticketNumber}`,
        ticketId: ticket.id,
        requestDate: new Date().toISOString().split('T')[0],
        responseDate: new Date().toISOString().split('T')[0],
        requestedAmount: approvalAmount,
        approvedAmount: approvalAmount,
        approverName: 'Anum Shahid',
        approverEmail: 'anum.shahid@ubl.com.pk',
        approverDesignation: 'Shared Services Group, United Bank Limited',
        approvalReference: approvalRef,
        status: 'Approved',
        remarks: 'Formally approved via Gmail thread. Quoted amount accepted with 16% GST.',
        aiDetectedSignal: {
          confidence: 0.99,
          detectedFrom: 'Client Gmail approval message with explicit reference and authorized amount.',
          summary: `Approved PKR ${approvalAmount.toLocaleString()} under PO Ref ${approvalRef}`,
        },
      },
      gmailThread: [...(prev.gmailThread || messages), approvalMsg],
    }));

    addAuditLog(
      'APPROVE_TICKET',
      'Approval',
      approvalRef,
      `Financial Approval received via Gmail from Anum Shahid for PKR ${approvalAmount.toLocaleString()}`
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Gmail-style Header Bar */}
      <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-tight">
                Ticket No :{ticket.ticketNumber}
              </span>
              <span className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                Inbox
              </span>
              {ticket.approval?.status === 'Approved' && (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Email Approved
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              HERE4U Bank Dispatch Thread • {ticket.branchName}
            </p>
          </div>
        </div>

        {/* Quick Actions in Thread Header */}
        <div className="flex items-center gap-2">
          {ticket.approval?.status !== 'Approved' && (
            <button
              onClick={handleSimulateEmailApproval}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Record that client approved quotation on email"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Receive / Record Email Approval</span>
            </button>
          )}

          {onOpenQuotationPreview && (
            <button
              onClick={onOpenQuotationPreview}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>View Quotation PDF</span>
            </button>
          )}

          <button
            onClick={() => setShowReplyBox(!showReplyBox)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Email Reply</span>
          </button>
        </div>
      </div>

      {/* AI Overview pill */}
      <div className="bg-slate-950/40 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold">AI Overview:</span>
          <span>
            {ticket.approval?.status === 'Approved'
              ? `Formal financial sanction received from Anum Shahid (Shared Services) for PKR ${ticket.approval.approvedAmount?.toLocaleString()}. Next step: Material purchasing & Work Order.`
              : `Complaint received from Hamaz Aftab. Official quotation dispatched to HERE4U team. Awaiting client formal sanction.`}
          </span>
        </div>
      </div>

      {/* Message List */}
      <div className="divide-y divide-slate-800/80 p-3 sm:p-4 space-y-4 max-h-[65vh] overflow-y-auto">
        {messages.map((msg, index) => {
          const isExpanded = expandedMessages[msg.id] ?? (index === 0 || index === messages.length - 1);

          return (
            <div
              key={msg.id}
              className={`rounded-xl border transition-all ${
                msg.isApprovalNotification
                  ? 'bg-emerald-950/30 border-emerald-500/40'
                  : msg.isNaeemBuilderOutbound
                  ? 'bg-slate-950/60 border-slate-800'
                  : 'bg-slate-900/90 border-slate-800'
              } p-4`}
            >
              {/* Message Header */}
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleExpand(msg.id)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-sm ${
                      msg.isNaeemBuilderOutbound
                        ? 'bg-purple-700 text-white'
                        : msg.isApprovalNotification
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-800 text-emerald-100'
                    }`}
                  >
                    {msg.senderName.slice(0, 2)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">
                        {msg.senderName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        &lt;{msg.senderEmail}&gt;
                      </span>
                      {msg.senderRole && (
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {msg.senderRole}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      to {msg.recipientEmails.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">{msg.date}</span>
                  <button className="text-slate-500 hover:text-slate-300">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Message Body */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-200">
                  {/* IF THIS IS THE OFFICIAL INBOUND BANK COMPLAINT EMAIL (Matching Screenshot 1) */}
                  {msg.bankComplaintDetails ? (
                    <div className="bg-white text-slate-900 p-4 sm:p-6 rounded-xl border border-slate-300 shadow-md font-sans">
                      {/* Bank Logo Header */}
                      <div className="flex items-center justify-center pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full border-2 border-cyan-600 flex items-center justify-center font-bold text-cyan-700 text-sm tracking-tighter">
                            UBL
                          </div>
                          <div className="text-emerald-700 font-serif font-bold text-lg">
                            آمین <span className="text-xs font-sans text-slate-600 block">Islamic Banking</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 font-sans text-xs text-slate-800 space-y-2">
                        <p className="font-bold text-slate-900 text-sm">
                          Dear M/s Naeem Taj,
                        </p>
                        <p className="text-slate-700">
                          Complaint No <strong>{msg.bankComplaintDetails.complaintNumber}</strong> has been assigned to you. Below are the Complaint details:
                        </p>

                        {/* Complaint Details Table */}
                        <div className="mt-3 border border-slate-900 overflow-hidden text-xs">
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 w-1/3 border-r border-slate-800 text-slate-900">
                                  Complaint Number
                                </td>
                                <td className="p-2 font-mono font-bold text-slate-950">
                                  {msg.bankComplaintDetails.complaintNumber}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Issue Details
                                </td>
                                <td className="p-2 text-slate-900 font-semibold">
                                  {msg.bankComplaintDetails.issueDetails}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Status
                                </td>
                                <td className="p-2 text-slate-800">
                                  {msg.bankComplaintDetails.status}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Complaint Type
                                </td>
                                <td className="p-2 text-slate-800">
                                  {msg.bankComplaintDetails.complaintType}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Complaint Date
                                </td>
                                <td className="p-2 font-mono text-slate-800">
                                  {msg.bankComplaintDetails.complaintDate}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Logged By
                                </td>
                                <td className="p-2 text-slate-800 font-semibold">
                                  {msg.bankComplaintDetails.loggedBy}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Vendor
                                </td>
                                <td className="p-2 text-slate-800">
                                  {msg.bankComplaintDetails.vendor}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Vendor Contact
                                </td>
                                <td className="p-2 font-mono text-slate-800">
                                  {msg.bankComplaintDetails.vendorContact}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Branch Code
                                </td>
                                <td className="p-2 font-mono font-bold text-slate-950">
                                  {msg.bankComplaintDetails.branchCode}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Branch Name
                                </td>
                                <td className="p-2 font-bold text-slate-900">
                                  {msg.bankComplaintDetails.branchName}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  BOM
                                </td>
                                <td className="p-2 font-bold text-red-700">
                                  {msg.bankComplaintDetails.bom}
                                </td>
                              </tr>
                              <tr className="border-b border-slate-800">
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Branch Contact Number
                                </td>
                                <td className="p-2 font-mono text-slate-800">
                                  {msg.bankComplaintDetails.branchContactNumber}
                                </td>
                              </tr>
                              <tr>
                                <td className="p-2 font-bold bg-slate-100 border-r border-slate-800 text-slate-900">
                                  Branch Address
                                </td>
                                <td className="p-2 text-slate-800">
                                  {msg.bankComplaintDetails.branchAddress}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="pt-3 space-y-1 text-slate-700">
                          <p className="font-semibold text-red-700">
                            You are requested to rectify on urgent basis
                          </p>
                          <p>
                            Kindly respond to this mail with Job Verification Certificate attached
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                          <strong>Regards,</strong>
                          <div className="font-bold text-slate-900">{msg.bankComplaintDetails.loggedBy}</div>
                          <div>United Bank Limited</div>
                          <div>PTCL : 021-111-825-111 Ext :437348 (HERE4U)</div>
                          <div>IP : 437348 (HERE4U)</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line leading-relaxed font-sans">
                      {msg.body}
                    </div>
                  )}

                  {/* Attachments Section (matching Screenshot 2 with PDF pill) */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800">
                      <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                        <span>{msg.attachments.length} attachments • Scanned by Gmail</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {msg.attachments.map((att, attIdx) => (
                          <div
                            key={attIdx}
                            onClick={att.type === 'pdf' && onOpenQuotationPreview ? onOpenQuotationPreview : undefined}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                              att.type === 'pdf'
                                ? 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/50 cursor-pointer'
                                : 'bg-slate-900 border-slate-800 text-slate-300'
                            }`}
                          >
                            {att.type === 'pdf' ? (
                              <div className="p-1 rounded bg-red-600 text-white text-[10px] font-bold">
                                PDF
                              </div>
                            ) : (
                              <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                            )}
                            <div className="text-left">
                              <div className="text-xs font-semibold max-w-[200px] truncate">
                                {att.name}
                              </div>
                              {att.size && (
                                <div className="text-[10px] text-slate-500">
                                  {att.size}
                                </div>
                              )}
                            </div>
                            {att.type === 'pdf' && (
                              <ExternalLink className="w-3 h-3 text-red-400 ml-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reply Composer Box */}
      {showReplyBox && (
        <form
          onSubmit={handleSendReply}
          className="p-4 bg-slate-950 border-t border-slate-800 space-y-3"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CornerUpLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Reply from: <strong className="text-slate-200">naeembuilder48@gmail.com</strong></span>
            </div>
            <span>To: HERE4U &amp; Bank Management</span>
          </div>

          <textarea
            rows={3}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your message, status update, or quotation dispatch note..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-sans"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span>Quotation PDF automatically referenced</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReplyBox(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending || !replyText.trim()}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
