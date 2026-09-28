import React, { useState } from 'react';
import { Printer, Mail, X, FileText, Truck, Receipt } from 'lucide-react';
import { Ticket, QuotationRecord } from '../../types/erp';
import { NaeemBuilderLogo } from '../documents/NaeemBuilderLogo';
import { AuthorizedSignature } from '../documents/AuthorizedSignature';
import { numberToWords } from '../../utils/numberToWords';

export type DocumentType = 'ESTIMATE' | 'DELIVERY_NOTE' | 'INVOICE';

interface OfficialQuotationViewProps {
  ticket: Ticket;
  quotation?: QuotationRecord;
  defaultDocType?: DocumentType;
  onClose?: () => void;
  onSendEmail?: () => void;
}

export const OfficialQuotationView: React.FC<OfficialQuotationViewProps> = ({
  ticket,
  quotation: propQuotation,
  defaultDocType = 'ESTIMATE',
  onClose,
  onSendEmail,
}) => {
  const [docType, setDocType] = useState<DocumentType>(defaultDocType);

  const handlePrint = () => {
    window.print();
  };

  // Format date to DD-MM-YYYY as seen in official PDFs (e.g. 24-09-2026)
  const formatDMY = (dateInput?: string) => {
    try {
      const d = dateInput ? new Date(dateInput) : new Date();
      if (isNaN(d.getTime())) {
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, '0');
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const yyyy = today.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
      }
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return '24-09-2026';
    }
  };

  // Document numbers conforming to official pattern
  const numericTicketRef = ticket.ticketNumber.replace(/\D/g, '') || '126503';
  const estimateDocNo = `2601${numericTicketRef}`;
  const deliveryDocNo = `S/2601${numericTicketRef}`;
  const invoiceDocNo = `S/2601${numericTicketRef}`;

  // Branch details description
  const branchCode = ticket.ublBranchCode || '7842';
  const branchName = ticket.branchName || 'Branch';
  const branchAddress = ticket.branchAddress || 'Main Boulevard, Lahore';
  const descriptionText = `Ticket # ${ticket.ticketNumber}, Branch Code ${branchCode}, ${branchName}, ${branchAddress}`;

  // Extract items from ticket estimates or quotation
  const rawItems = propQuotation?.items || ticket.estimates?.[0]?.items || [
    {
      description: ticket.title,
      quantity: 1,
      unit: 'Job',
      clientRate: ticket.estimates?.[0]?.quotedAmountBeforeTax || 11800,
      clientAmount: ticket.estimates?.[0]?.quotedAmountBeforeTax || 11800,
    },
  ];

  // Helper to extract clean Title vs detailed parenthetical description
  const formattedItems = rawItems.map((item: any, idx: number) => {
    const fullDesc = item.description || `Maintenance Work Item #${idx + 1}`;
    let title = '';
    let spec = '';

    if (fullDesc.includes('(') && fullDesc.includes(')')) {
      const parts = fullDesc.split('(');
      title = parts[0].trim();
      spec = '(' + parts.slice(1).join('(').trim();
    } else if (fullDesc.includes(':')) {
      const parts = fullDesc.split(':');
      title = parts[0].trim();
      spec = `(${parts.slice(1).join(':').trim()})`;
    } else {
      title = fullDesc.toUpperCase();
      spec = `(Providing, executing, and completing all required works in accordance with UBL facility specifications and to the satisfaction of the Bank Engineer / Management.)`;
    }

    const qty = Number(item.quantity) || 1;
    const unit = item.unit || 'Job';
    const rate = Number(item.clientRate || item.rate || 0);
    const amount = Number(item.clientAmount || item.amount || qty * rate);

    return {
      title,
      spec,
      quantity: qty,
      unit,
      rate,
      amount,
    };
  });

  // Financial calculations
  const subTotal = formattedItems.reduce((acc, curr) => acc + curr.amount, 0);
  const taxRate = 16.0;
  const taxAmount = Math.round(subTotal * 0.16);
  const grandTotal = subTotal + taxAmount;
  const grandTotalInWords = numberToWords(grandTotal);

  return (
    <div className="bg-slate-900/95 rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
      {/* Top Action Toolbar */}
      <div className="bg-slate-950 p-3 sm:px-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 no-print">
        {/* Document Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Official PDF Format:
          </span>
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setDocType('ESTIMATE')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                docType === 'ESTIMATE'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Estimate</span>
            </button>
            <button
              onClick={() => setDocType('DELIVERY_NOTE')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                docType === 'DELIVERY_NOTE'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery Note</span>
            </button>
            <button
              onClick={() => setDocType('INVOICE')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                docType === 'INVOICE'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Invoice</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onSendEmail && (
            <button
              onClick={onSendEmail}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-red-600/30"
              title="Attach & Send via Gmail to Bank"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send via Gmail</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet Canvas - Calibrated to exact PDF sample */}
      <div className="bg-slate-950/80 p-4 sm:p-8 overflow-y-auto max-h-[84vh] flex justify-center print:p-0 print:bg-white print:max-h-none">
        <div className="bg-white text-slate-950 p-6 sm:p-10 rounded shadow-2xl max-w-3xl w-full font-sans print:p-0 print:shadow-none print:max-w-none print:w-full">
          {/* Top Centered Title */}
          <div className="text-center mb-3">
            <h2 className="text-2xl sm:text-3xl font-normal text-slate-800 tracking-tight">
              {docType === 'ESTIMATE'
                ? 'Estimate'
                : docType === 'DELIVERY_NOTE'
                ? 'Delivery Note'
                : 'Invoice'}
            </h2>
          </div>

          {/* Main Boxed Border Frame */}
          <div className="border border-slate-900 text-xs">
            {/* Row 1: Header with Logo, Address, Phone, Email, TIN */}
            <div className="p-4 flex items-center gap-5">
              <div className="shrink-0">
                <NaeemBuilderLogo width={85} height={58} />
              </div>
              <div className="space-y-0.5 text-slate-800">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-950 font-sans">
                  NAEEM BUILDER
                </h1>
                <p className="text-[11px] text-slate-700">
                  EF/A Commercial Area, Asim Town, Harbanspura Lahore.
                </p>
                <p className="text-[11px] text-slate-700">
                  Phone: <span className="font-semibold text-slate-900">03476066666</span> &nbsp;&nbsp;&nbsp;&nbsp; Email: <span className="font-semibold text-slate-900">Naeembuilder48@gmail.com</span>
                </p>
                <p className="text-[11px] text-slate-800 font-medium">
                  TIN: NTN# <span className="font-bold">6974254-1</span> GST# <span className="font-bold">3520194159531</span>
                </p>
              </div>
            </div>

            {/* Row 2: 2-Column Details Box */}
            <div className="border-t border-slate-900 grid grid-cols-2">
              {/* Left Column */}
              <div className="p-3 border-r border-slate-900 space-y-1">
                <div className="font-medium text-slate-700 text-[11px]">
                  {docType === 'ESTIMATE' ? 'Estimate For:' : 'Bill To:'}
                </div>
                <div className="font-semibold text-slate-950 text-xs">
                  M/s. UBL - HERE4U.
                </div>
              </div>

              {/* Right Column */}
              <div className="p-3 space-y-1">
                <div className="font-medium text-slate-700 text-[11px]">
                  {docType === 'ESTIMATE' ? 'Estimate Details:' : 'Invoice Details:'}
                </div>
                <div className="text-slate-900 text-xs">
                  <span className="text-slate-600">No:</span>{' '}
                  <strong className="font-mono">
                    {docType === 'ESTIMATE'
                      ? estimateDocNo
                      : docType === 'DELIVERY_NOTE'
                      ? deliveryDocNo
                      : invoiceDocNo}
                  </strong>
                </div>
                <div className="text-slate-900 text-xs">
                  <span className="text-slate-600">Date:</span>{' '}
                  <span>{formatDMY(ticket.completionNote?.date || ticket.reportedDate)}</span>
                </div>
              </div>
            </div>

            {/* Row 3: Items Table */}
            <div className="border-t border-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 bg-white font-medium text-slate-900 text-center">
                    <th className="py-2 px-2 w-10 border-r border-slate-900">#</th>
                    <th className="py-2 px-3 text-left border-r border-slate-900">Item Name</th>
                    <th className="py-2 px-2 w-24 text-center border-r border-slate-900">Quantity</th>
                    <th className="py-2 px-2 w-16 text-center border-r border-slate-900">Unit</th>
                    {docType !== 'DELIVERY_NOTE' && (
                      <>
                        <th className="py-2 px-2 w-28 text-right border-r border-slate-900">Price/ Unit (Rs)</th>
                        <th className="py-2 px-3 w-28 text-right">Amount(Rs)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {formattedItems.map((item, idx) => (
                    <tr key={idx} className="align-top">
                      <td className="py-3 px-2 text-center text-slate-900 font-mono border-r border-slate-900">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3 text-slate-900 border-r border-slate-900 space-y-1">
                        <div className="font-bold uppercase tracking-tight text-slate-950">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-700 leading-relaxed">
                          {item.spec}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-slate-900 font-mono border-r border-slate-900">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-900 border-r border-slate-900">
                        {item.unit}
                      </td>
                      {docType !== 'DELIVERY_NOTE' && (
                        <>
                          <td className="py-3 px-2 text-right text-slate-900 font-mono border-r border-slate-900">
                            Rs {item.rate.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-950 font-mono font-bold">
                            Rs {item.amount.toLocaleString()}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}

                  {/* Table Totals Row */}
                  <tr className="border-t border-slate-900 font-bold bg-white">
                    <td className="py-2 px-2 border-r border-slate-900"></td>
                    <td className="py-2 px-3 text-slate-950 border-r border-slate-900">
                      Total
                    </td>
                    <td className="py-2 px-2 border-r border-slate-900"></td>
                    <td className="py-2 px-2 border-r border-slate-900"></td>
                    {docType !== 'DELIVERY_NOTE' ? (
                      <>
                        <td className="py-2 px-2 border-r border-slate-900"></td>
                        <td className="py-2 px-3 text-right font-mono text-slate-950 font-bold">
                          Rs {subTotal.toLocaleString()}
                        </td>
                      </>
                    ) : null}
                  </tr>
                </tbody>
              </table>

              {/* Sub Total, Tax, and Grand Total Calculations (For Estimate & Invoice) */}
              {docType !== 'DELIVERY_NOTE' && (
                <div className="border-t border-slate-900 flex justify-end">
                  <div className="w-full sm:w-80 divide-y divide-slate-900 border-l border-slate-900 text-xs font-mono">
                    <div className="flex justify-between py-1.5 px-3">
                      <span className="text-slate-700">Sub Total</span>
                      <span className="text-slate-950 font-medium">: Rs {subTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3">
                      <span className="text-slate-700">Tax ({taxRate.toFixed(1)}%)</span>
                      <span className="text-slate-950 font-medium">: Rs {taxAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1.5 px-3 font-bold bg-slate-50">
                      <span className="text-slate-950">Total</span>
                      <span className="text-slate-950">: Rs {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount in Words (For Estimate & Invoice) */}
              {docType !== 'DELIVERY_NOTE' && (
                <div className="border-t border-slate-900 flex justify-end">
                  <div className="w-full sm:w-80 border-l border-slate-900 p-2.5 text-xs bg-white">
                    <div className="font-semibold text-slate-800 text-[11px]">
                      {docType === 'ESTIMATE' ? 'Estimate Amount In Words :' : 'Invoice Amount In Words :'}
                    </div>
                    <div className="text-slate-900 font-medium mt-1 leading-snug">
                      {grandTotalInWords}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Row 4: Description & Terms And Conditions */}
            <div className="border-t border-slate-900 grid grid-cols-2">
              <div className="p-3 border-r border-slate-900 space-y-1">
                <div className="font-semibold text-slate-800 text-[11px]">
                  Description:
                </div>
                <div className="text-[11px] text-slate-800 leading-snug">
                  {descriptionText}
                </div>
              </div>
              <div className="p-3 space-y-1">
                <div className="font-semibold text-slate-800 text-[11px]">
                  Terms And Conditions:
                </div>
                <div className="text-[11px] text-slate-800">
                  Thank you for doing business with us.
                </div>
              </div>
            </div>

            {/* Row 5: Signatures Block */}
            <div className="border-t border-slate-900">
              {docType === 'DELIVERY_NOTE' ? (
                /* Delivery Note 3-Column Signatures */
                <div className="grid grid-cols-3 divide-x divide-slate-900 text-xs">
                  {/* Column 1: Received By (Concern Branch) */}
                  <div className="p-3 space-y-2">
                    <div className="font-semibold text-slate-900">Received By:</div>
                    <div className="text-[11px] space-y-1.5 text-slate-700">
                      <div>Name: <span className="font-medium text-slate-900">{ticket.completionNote?.receivedBy || ''}</span></div>
                      <div>Comment:</div>
                      <div>Date: <span className="font-mono">{ticket.completionNote?.verificationDate || ''}</span></div>
                      <div className="pt-4">Signature:</div>
                    </div>
                  </div>

                  {/* Column 2: Delivered By */}
                  <div className="p-3 space-y-2">
                    <div className="font-semibold text-slate-900">Delivered By:</div>
                    <div className="text-[11px] space-y-1.5 text-slate-700">
                      <div>Name: <span className="font-medium text-slate-900">{ticket.completionNote?.deliveredBy || 'Naeem Builder Field Team'}</span></div>
                      <div>Comment:</div>
                      <div>Date: <span className="font-mono">{formatDMY(ticket.completionNote?.date)}</span></div>
                      <div className="pt-4">Signature:</div>
                    </div>
                  </div>

                  {/* Column 3: For NAEEM BUILDER */}
                  <div className="p-3 flex flex-col justify-between items-center text-center">
                    <div className="font-semibold text-slate-900 w-full text-left">
                      For NAEEM BUILDER:
                    </div>
                    <div className="my-2">
                      <AuthorizedSignature width={100} height={44} />
                    </div>
                    <div className="text-[11px] font-medium text-slate-800">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              ) : (
                /* Estimate & Invoice 2-Column Signatures */
                <div className="grid grid-cols-2 divide-x divide-slate-900 text-xs">
                  <div className="p-3"></div>
                  <div className="p-3 flex flex-col justify-between items-center text-center">
                    <div className="font-semibold text-slate-900 w-full text-left">
                      For NAEEM BUILDER:
                    </div>
                    <div className="my-2">
                      <AuthorizedSignature width={105} height={46} />
                    </div>
                    <div className="text-[11px] font-medium text-slate-800">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
