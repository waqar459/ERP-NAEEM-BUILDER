import React, { useState } from 'react';
import {
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Project } from '../../types/erp';
import { calculateProjectBOQStatus, ProjectBOQStatusDetails } from '../../utils/boqBillingCalculations';

interface ProjectStatusProgressBarProps {
  project: Project;
  mode?: 'compact' | 'detailed' | 'card';
  showTradeBreakdown?: boolean;
  className?: string;
  onOpenRABillsTab?: () => void;
  onOpenBOQTab?: () => void;
}

export const ProjectStatusProgressBar: React.FC<ProjectStatusProgressBarProps> = ({
  project,
  mode = 'detailed',
  showTradeBreakdown = false,
  className = '',
  onOpenRABillsTab,
  onOpenBOQTab,
}) => {
  const [isTradeBreakdownOpen, setIsTradeBreakdownOpen] = useState(showTradeBreakdown);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  const status: ProjectBOQStatusDetails = calculateProjectBOQStatus(project);

  // Compact Mode (for table rows, mini cards, and list views)
  if (mode === 'compact') {
    return (
      <div className={`space-y-1.5 min-w-[180px] max-w-[240px] text-left relative group ${className}`}>
        {/* Header line: Percentage & RA Bill indicator */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold text-emerald-400">
              {status.boqCompletionPercentage}%
            </span>
            <span className="text-[10px] text-slate-400">BOQ Done</span>
          </div>

          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {status.raBillCount > 0 ? `${status.raBillCount} RA Bills` : 'No RA Bills'}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800/90 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/60 shadow-inner relative">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              status.boqCompletionPercentage >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50'
                : status.boqCompletionPercentage >= 60
                ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-400'
                : status.boqCompletionPercentage >= 25
                ? 'bg-gradient-to-r from-amber-500 to-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
            style={{ width: `${Math.max(3, status.boqCompletionPercentage)}%` }}
          />
        </div>

        {/* Financial Subtext */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="text-emerald-400/90">
            PKR {(status.totalCertifiedAmount / 1000000).toFixed(1)}M Cert.
          </span>
          <span className="text-slate-500">
            / {(status.totalBOQContractValue / 1000000).toFixed(1)}M
          </span>
        </div>

        {/* Hover Popover Tooltip for Table Rows */}
        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-30 w-72 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl text-xs space-y-2 pointer-events-none backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
            <span className="font-bold text-slate-200">BOQ Completion (RA Billing)</span>
            <span className="font-mono font-bold text-emerald-400">{status.boqCompletionPercentage}%</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex justify-between text-slate-300">
              <span>Gross Certified (RA):</span>
              <span className="text-emerald-400 font-bold">PKR {status.totalCertifiedAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Total BOQ Value:</span>
              <span className="text-slate-200">PKR {status.totalBOQContractValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Remaining to Certify:</span>
              <span className="text-amber-400">PKR {status.totalRemainingAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-400">
            <span>Bills: {status.raBillCount > 0 ? (project.raBills || []).map(b => b.billNumber).join(', ') : 'None yet'}</span>
            <div className="text-emerald-400/80 font-sans mt-0.5">{status.phaseLabel}</div>
          </div>
        </div>
      </div>
    );
  }

  // Detailed Mode (Hero card for Project Detail modal and top summary widgets)
  return (
    <div className={`bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 ${className}`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Project Status & BOQ Progress
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.phaseColor}`}>
              {status.phaseLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Calculated dynamically from <strong className="text-slate-200">{status.raBillCount} Running Account (RA) Bills</strong> against certified BOQ line items.
          </p>
        </div>

        {/* Big Percentage Display */}
        <div className="flex items-center gap-3 sm:text-right">
          <div>
            <div className="text-3xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-1">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                {status.boqCompletionPercentage}%
              </span>
              <span className="text-xs text-slate-400 font-sans font-normal">BOQ Certified</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              PKR {(status.totalCertifiedAmount / 1000000).toFixed(2)}M of PKR {(status.totalBOQContractValue / 1000000).toFixed(2)}M
            </div>
          </div>

          <button
            onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="View Calculation Formula"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formula Explanation Banner if Toggled */}
      {showFormulaTooltip && (
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Engineering Quantity Surveying Calculation Formula:
            </span>
            <span className="text-[10px] text-slate-400">Section 14 & 15 Standard</span>
          </div>
          <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-200 border border-slate-800">
            Total BOQ Completion % = [ Total Gross Certified Amount via RA Bills (PKR {status.totalCertifiedAmount.toLocaleString()}) ÷ Total BOQ Contract Value (PKR {status.totalBOQContractValue.toLocaleString()}) ] × 100 = <strong className="text-emerald-400">{status.boqCompletionPercentage}%</strong>
          </div>
          <p className="text-[11px] text-slate-400">
            Includes certified measurements verified by site consultant across running bills {project.raBills?.map(b => b.billNumber).join(', ') || 'N/A'}. Deductions: Retention PKR {status.totalRetentionDeducted.toLocaleString()} ({project.raBills[0]?.retentionMoneyDeductionPercent || 5}%) & Advance Recovery PKR {status.totalAdvanceRecovered.toLocaleString()}.
          </p>
        </div>
      )}

      {/* Main Multi-Stage Progress Bar */}
      <div className="space-y-2">
        <div className="relative">
          {/* Background track */}
          <div className="w-full bg-slate-800/90 rounded-full h-4 overflow-hidden p-0.5 border border-slate-700 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out relative ${
                status.boqCompletionPercentage >= 100
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-lg shadow-emerald-500/30'
                  : status.boqCompletionPercentage >= 60
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 shadow-md shadow-emerald-500/20'
                  : status.boqCompletionPercentage >= 25
                  ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400'
              }`}
              style={{ width: `${Math.max(2, status.boqCompletionPercentage)}%` }}
            >
              {/* Subtle animated striped shine */}
              <div className="absolute inset-0 bg-white/10 opacity-30 animate-pulse rounded-full" />
            </div>
          </div>

          {/* Milestone markers on the progress bar */}
          <div className="relative w-full flex justify-between px-1 text-[10px] font-mono text-slate-500 pt-1.5">
            <div className="flex flex-col items-center">
              <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${status.boqCompletionPercentage >= 0 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              <span>0% Start</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${status.boqCompletionPercentage >= 25 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              <span>25% Demolition</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${status.boqCompletionPercentage >= 50 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              <span>50% MEP Rough</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${status.boqCompletionPercentage >= 75 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              <span>75% Architectural</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={`w-1.5 h-1.5 rounded-full mb-0.5 ${status.boqCompletionPercentage >= 100 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
              <span>100% Handover</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* Card 1: Certified Gross */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-emerald-400" />
              Certified by RA Bills
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {status.raBillCount} Bills
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            PKR {(status.totalCertifiedAmount / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {status.latestRABillNumber ? `Latest: ${status.latestRABillNumber} (${status.latestRABillDate})` : 'Awaiting 1st RA submission'}
          </p>
        </div>

        {/* Card 2: Total BOQ Contract */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              Contract BOQ Value
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {status.totalItems} Items
            </span>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            PKR {(status.totalBOQContractValue / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Award: {project.awardNumber || 'Approved'}
          </p>
        </div>

        {/* Card 3: Remaining to Complete */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Remaining BOQ Work
            </span>
            <span className="text-[10px] font-mono text-amber-400">
              {(100 - status.boqCompletionPercentage).toFixed(1)}%
            </span>
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            PKR {(status.totalRemainingAmount / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {status.unstartedItems} unstarted • {status.inProgressItems} in progress
          </p>
        </div>

        {/* Card 4: Line Item Completion */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
              BOQ Items Delivered
            </span>
            <span className="text-[10px] font-mono text-teal-400 font-bold">
              {status.completedItems} / {status.totalItems}
            </span>
          </div>
          <div className="text-lg font-bold text-teal-300 font-mono">
            {status.totalItems > 0 ? Math.round((status.completedItems / status.totalItems) * 100) : 0}% Fully Done
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            {status.completedItems} items at 100% certified qty
          </p>
        </div>
      </div>

      {/* Accordion / Toggle for Trade Breakdown */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          onClick={() => setIsTradeBreakdownOpen(!isTradeBreakdownOpen)}
          className="w-full flex items-center justify-between py-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>View Trade & Category Breakdown ({status.tradeBreakdown.length} Trade Categories)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>{isTradeBreakdownOpen ? 'Hide Trade Breakdown' : 'Show Trade Breakdown'}</span>
            {isTradeBreakdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isTradeBreakdownOpen && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 animate-fadeIn">
            {status.tradeBreakdown.map((trade) => (
              <div
                key={trade.category}
                className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{trade.category}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-slate-400">
                      {trade.completedItemCount}/{trade.itemCount} items
                    </span>
                    <span className={`font-bold ${
                      trade.percentage >= 100 ? 'text-emerald-400' :
                      trade.percentage >= 70 ? 'text-teal-400' :
                      trade.percentage >= 30 ? 'text-amber-400' : 'text-blue-400'
                    }`}>
                      {trade.percentage}%
                    </span>
                  </div>
                </div>

                {/* Trade mini progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      trade.percentage >= 100 ? 'bg-emerald-500' :
                      trade.percentage >= 70 ? 'bg-teal-400' :
                      trade.percentage >= 30 ? 'bg-amber-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${Math.max(2, trade.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Cert: PKR {(trade.certifiedAmount / 1000).toLocaleString()}k</span>
                  <span>Contract: PKR {(trade.contractAmount / 1000).toLocaleString()}k</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Action Footer */}
      {(onOpenRABillsTab || onOpenBOQTab) && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] text-slate-400">
            Running Bills Engine: Prev Qty + Current Certified Qty = Cumulative Qty.
          </span>
          <div className="flex items-center gap-2">
            {onOpenBOQTab && (
              <button
                onClick={onOpenBOQTab}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-colors"
              >
                Inspect BOQ Master
              </button>
            )}
            {onOpenRABillsTab && (
              <button
                onClick={onOpenRABillsTab}
                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 cursor-pointer transition-colors"
              >
                View RA Billing Certificates
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
