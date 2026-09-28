import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  Shield,
  Fuel,
  ArrowRight,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface AIHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicket?: (id: string) => void;
  onSelectProject?: (id: string) => void;
}

export const AIHubModal: React.FC<AIHubModalProps> = ({
  isOpen,
  onClose,
  onSelectTicket,
  onSelectProject,
}) => {
  const { tickets, projects, expenses, retentionLedger } = useERP();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  if (!isOpen) return null;

  const samplePrompts = [
    'Show all tickets in Central Region pending financial approval',
    'Compare estimated margin vs actual margin on Project PRJ-LHR-101',
    'Show unbilled completion notes or pending BOM verification',
    'List all fuel entries with mileage variance exceeding 15%',
    'Show total retention held across Meezan Bank branches',
  ];

  const handleRunQuery = async (queryText?: string) => {
    const promptToRun = queryText || query;
    if (!promptToRun.trim()) return;

    setLoading(true);
    setResponse(null);

    try {
      const fuelExpenses = expenses.filter((e) => e.category === 'Fuel/KM');
      const erpContext = {
        tickets: tickets.map((t) => ({
          id: t.id,
          number: t.ticketNumber,
          title: t.title,
          client: t.client,
          branch: t.branchName,
          region: t.region,
          status: t.status,
          quoted: t.quotation?.totalAmount,
          directCost: t.totalDirectCost,
          netRevenue: t.netRevenue,
          grossProfit: t.grossProfit,
          verified: t.completionNote?.completionVerified,
          invoiced: !!t.invoice,
        })),
        projects: projects.map((p) => ({
          id: p.id,
          code: p.projectCode,
          title: p.title,
          client: p.client,
          region: p.region,
          contractValue: p.contractValue,
          progress: p.overallProgressPercent,
          billed: p.totalBilledAmount,
          retentionHeld: p.totalRetentionHeld,
          grossMargin: p.grossProfitMarginPercent,
        })),
        fuelLogs: fuelExpenses.map((f) => ({
          worker: f.employeeName,
          claimedKm: f.fuelDetails?.claimedKm,
          calcKm: f.fuelDetails?.routeCalculatedKm,
          variancePercent: f.fuelDetails && f.fuelDetails.routeCalculatedKm > 0
            ? Math.round(((f.fuelDetails.claimedKm - f.fuelDetails.routeCalculatedKm) / f.fuelDetails.routeCalculatedKm) * 100)
            : 0,
          flagged: f.fuelDetails?.isDistanceDiscrepancyFlagged,
          amount: f.amount,
        })),
        retentionSummary: retentionLedger.map((r) => ({
          bill: r.raBillNumber,
          held: r.heldAmount,
          released: r.releasedAmount,
          balance: r.balanceAmount,
          condition: r.releaseCondition,
        })),
      };

      const res = await fetch('/api/ai/management-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: promptToRun, erpContext }),
      });

      const result = await res.json();
      if (result.success) {
        setResponse(result.data);
      } else {
        setResponse({
          answer: 'Unable to process query at this time.',
          actionableItems: [],
        });
      }
    } catch (err) {
      console.error(err);
      setResponse({
        answer: 'Failed to communicate with AI Assistant service.',
        actionableItems: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Management Query & Operational Intelligence
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                  Section 21
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Natural-language cross-system audit for System 1 (HERE4U) and System 2 (Projects).
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunQuery();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'Show unbilled completion notes older than 7 days')..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? 'Analyzing...' : 'Ask AI'}</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap">Suggested:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(p);
                  handleRunQuery(p);
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 whitespace-nowrap transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">
                Querying Naeem Builder ERP data lake & running Gemini financial analysis...
              </p>
            </div>
          ) : response ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-purple-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Executive AI Analysis & Response</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {response.answer}
                </p>
              </div>

              {/* Actionable items */}
              {response.actionableItems && response.actionableItems.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Recommended Operational Actions:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {response.actionableItems.map((action: string, i: number) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <ArrowRight className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-purple-400 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300">
                Ask any question across tickets, BOQs, RA bills, and fuel mileage.
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Our embedded Gemini AI agent scans all records across System 1 and System 2 to uncover operational bottlenecks, verify Rule 9 & 12 compliance, and flag cost variances.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
