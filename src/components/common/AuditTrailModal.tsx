import React, { useState } from 'react';
import { X, ShieldCheck, Filter } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { AuditLogEntry } from '../../types/erp';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useERP();
  const [filterType, setFilterType] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredLogs = filterType === 'ALL'
    ? auditLogs
    : auditLogs.filter((l) => l.entityType === filterType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                System Audit Trail & Compliance Log
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
                  Rule 16
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Immutable audit trail for all sensitive financial, operational, and authorization actions.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 px-5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400">Filter by entity:</span>
          {['ALL', 'Ticket', 'Project', 'DeliveryNote', 'Invoice', 'RABill', 'Expense'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                filterType === f
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No audit logs matching selected filter.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-amber-400">{log.action}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {log.entityType}: {log.entityId}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 mb-2 font-sans">{log.details}</p>
                  <div className="flex items-center gap-4 text-[11px] text-slate-500">
                    <span>
                      Actor: <strong className="text-slate-400">{log.user}</strong>
                    </span>
                    <span>
                      Role: <strong className="text-slate-400">{log.role}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
