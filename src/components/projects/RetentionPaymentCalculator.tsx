import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Project, RABill, RetentionLedgerEntry } from '../../types/erp';

interface RetentionPaymentCalculatorProps {
  project: Project;
  retentionEntries: RetentionLedgerEntry[];
  onInitiateRelease?: (amount: number, reason: string) => void;
  defaultOpen?: boolean;
}

export const RetentionPaymentCalculator: React.FC<RetentionPaymentCalculatorProps> = ({
  project,
  retentionEntries,
  onInitiateRelease,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // 1. Total RA Billing selection: Actual Certified RA Bills vs Total Contract Projection vs Custom Amount
  const [billingMode, setBillingMode] = useState<'CERTIFIED_RA' | 'CONTRACT_VALUE' | 'CUSTOM'>('CERTIFIED_RA');

  // Sum of existing certified RA bills
  const actualRABillsGross = useMemo(() => {
    return (project.raBills || []).reduce((sum, b) => sum + (b.currentBillGross || 0), 0);
  }, [project.raBills]);

  // Contract value as alternative projection base
  const contractValueBase = project.revisedContractValue || project.contractValue || 0;

  // Custom amount state
  const [customBillingAmount, setCustomBillingAmount] = useState<number>(
    actualRABillsGross > 0 ? actualRABillsGross : contractValueBase
  );

  // Effective Gross Billing base
  const grossBillingBase = useMemo(() => {
    if (billingMode === 'CERTIFIED_RA') {
      return actualRABillsGross > 0 ? actualRABillsGross : contractValueBase;
    }
    if (billingMode === 'CONTRACT_VALUE') {
      return contractValueBase;
    }
    return Math.max(0, customBillingAmount);
  }, [billingMode, actualRABillsGross, contractValueBase, customBillingAmount]);

  // 2. Retention Percentage (Strictly 5% to 10% range with standard bank presets)
  const [retentionPercent, setRetentionPercent] = useState<number>(5);

  // 3. Handover / Completion Base Date & Defect Liability Period (DLP)
  const defaultHandoverDate =
    project.actualCompletionDate || project.expectedCompletionDate || '2026-10-31';

  const [handoverDate, setHandoverDate] = useState<string>(defaultHandoverDate);
  const [dlpDays, setDlpDays] = useState<number>(180); // 180 days = 6 months standard bank spec
  const [firstTranchePercent, setFirstTranchePercent] = useState<number>(50); // 50% on Handover, 50% on DLP expiry

  // 4. Calculations
  // Total Computed Retention Amount based on the 5-10% rate and total RA billing
  const computedTotalRetention = useMemo(() => {
    return Math.round(grossBillingBase * (retentionPercent / 100));
  }, [grossBillingBase, retentionPercent]);

  // Existing escrow metrics from the project's actual retention ledger
  const actualHeldInEscrow = useMemo(() => {
    return retentionEntries.reduce((sum, e) => sum + (e.heldAmount || 0), 0);
  }, [retentionEntries]);

  const actualReleasedFromEscrow = useMemo(() => {
    return retentionEntries.reduce((sum, e) => sum + (e.releasedAmount || 0), 0);
  }, [retentionEntries]);

  const currentEscrowBalance = useMemo(() => {
    return retentionEntries.reduce((sum, e) => sum + (e.balanceAmount || 0), 0);
  }, [retentionEntries]);

  // Two-Tranche Milestone Calculations
  const tranche1HandoverAmount = Math.round(computedTotalRetention * (firstTranchePercent / 100));
  const tranche2RemainingBalance = computedTotalRetention - tranche1HandoverAmount;

  // Remaining Balance Release Date logic
  const { remainingBalanceReleaseDate, daysUntilRelease, isReleaseOverdue, isEligibleNow } = useMemo(() => {
    if (!handoverDate) {
      return {
        remainingBalanceReleaseDate: 'N/A',
        daysUntilRelease: 0,
        isReleaseOverdue: false,
        isEligibleNow: false,
      };
    }

    const baseDate = new Date(handoverDate);
    if (isNaN(baseDate.getTime())) {
      return {
        remainingBalanceReleaseDate: 'Invalid Date',
        daysUntilRelease: 0,
        isReleaseOverdue: false,
        isEligibleNow: false,
      };
    }

    // Add DLP days
    const releaseDateObj = new Date(baseDate.getTime() + dlpDays * 24 * 60 * 60 * 1000);
    const releaseDateIso = releaseDateObj.toISOString().split('T')[0];

    // Compare with current system time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    releaseDateObj.setHours(0, 0, 0, 0);

    const diffTime = releaseDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isOverdue = diffDays < 0;
    const isEligible = diffDays <= 0;

    return {
      remainingBalanceReleaseDate: releaseDateIso,
      daysUntilRelease: diffDays,
      isReleaseOverdue: isOverdue,
      isEligibleNow: isEligible,
    };
  }, [handoverDate, dlpDays]);

  // Formatted date string for human readability
  const formattedReleaseDate = useMemo(() => {
    if (!remainingBalanceReleaseDate || remainingBalanceReleaseDate === 'N/A' || remainingBalanceReleaseDate === 'Invalid Date') {
      return 'Pending Date Configuration';
    }
    try {
      const d = new Date(remainingBalanceReleaseDate);
      return d.toLocaleDateString('en-PK', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return remainingBalanceReleaseDate;
    }
  }, [remainingBalanceReleaseDate]);

  const formattedHandoverDate = useMemo(() => {
    try {
      const d = new Date(handoverDate);
      return d.toLocaleDateString('en-PK', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return handoverDate;
    }
  }, [handoverDate]);

  return (
    <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl overflow-hidden shadow-xl transition-all">
      {/* Top Banner & Expand/Collapse Toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/30 border-b border-amber-500/20 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                Section 15 Financial Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                5% – 10% Auto-Calculator
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
              Retention Payment & Defect Liability Release Calculator
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Remaining Release Date
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                isReleaseOverdue
                  ? 'text-rose-400'
                  : isEligibleNow
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {formattedReleaseDate}
            </span>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-6 space-y-6">
          {/* Top Quick Audit Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: Gross RA Billing Base */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Total RA Billing Base</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-mono font-extrabold text-white">
                PKR {grossBillingBase.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Mode:</span>
                <span className="font-semibold text-emerald-400">
                  {billingMode === 'CERTIFIED_RA'
                    ? `${project.raBills.length} Certified RA Bills`
                    : billingMode === 'CONTRACT_VALUE'
                    ? 'Total Contract BOQ'
                    : 'Custom User Base'}
                </span>
              </div>
            </div>

            {/* Card 2: Calculated Retention Amount */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Retention Deductible ({retentionPercent}%)</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-lg font-mono font-extrabold text-amber-400">
                PKR {computedTotalRetention.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Already in Escrow:</span>
                <span className="font-mono text-slate-300">
                  PKR {actualHeldInEscrow.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 3: Remaining Escrow Balance */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span>Escrow Balance Remaining</span>
                <TrendingDown className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-lg font-mono font-extrabold text-cyan-300">
                PKR {currentEscrowBalance.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Released to Date:</span>
                <span className="font-mono text-emerald-400">
                  PKR {actualReleasedFromEscrow.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Card 4: Identified Remaining Balance Release Date */}
            <div
              className={`p-4 rounded-xl border relative overflow-hidden ${
                isReleaseOverdue
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  : isEligibleNow
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300">Remaining Balance Release Date</span>
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-base font-mono font-extrabold text-white">
                {remainingBalanceReleaseDate}
              </div>
              <div className="text-[11px] mt-1 font-sans flex items-center gap-1.5 font-bold">
                {isReleaseOverdue ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400">
                      Overdue by {Math.abs(daysUntilRelease)} days!
                    </span>
                  </>
                ) : isEligibleNow ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Eligible for Immediate Release!</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-amber-400">
                      Due in {daysUntilRelease} days ({dlpDays}-Day DLP)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Calculator Configuration Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-slate-900/60 p-4 sm:p-5 rounded-xl border border-slate-800">
            {/* Left Column: RA Billing Base & Retention Percentage (5% to 10%) */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between mb-2">
                  <span>Step 1: Select Total RA Billing Base</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {billingMode === 'CERTIFIED_RA' ? 'Auto-summed from Project RA Bills' : ''}
                  </span>
                </label>

                {/* Billing Mode Selection Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setBillingMode('CERTIFIED_RA')}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      billingMode === 'CERTIFIED_RA'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>Certified RA Bills</span>
                    <span className="block text-[10px] font-mono text-slate-400">
                      Rs. {(actualRABillsGross / 1000).toLocaleString()}k
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingMode('CONTRACT_VALUE')}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      billingMode === 'CONTRACT_VALUE'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>Full Contract BOQ</span>
                    <span className="block text-[10px] font-mono text-slate-400">
                      Rs. {(contractValueBase / 1000000).toFixed(2)}M
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingMode('CUSTOM')}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                      billingMode === 'CUSTOM'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <span>Custom Simulation</span>
                    <span className="block text-[10px] text-slate-400">Enter Value</span>
                  </button>
                </div>

                {billingMode === 'CUSTOM' && (
                  <div className="mt-2">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold font-mono">
                        PKR
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={customBillingAmount}
                        onChange={(e) => setCustomBillingAmount(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-12 pr-3 py-2 text-white font-mono text-sm focus:border-amber-400 focus:outline-none"
                        placeholder="Enter simulated RA billing..."
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Retention Percentage Slider (5% to 10%) */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Step 2: Retention Rate (5% – 10% Range)</span>
                  </label>
                  <div className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-bold text-sm">
                    {retentionPercent.toFixed(1)}%
                  </div>
                </div>

                {/* Preset Buttons for Standard Bank Specifications */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { rate: 5.0, label: '5.0%', note: 'Standard Bank' },
                    { rate: 7.5, label: '7.5%', note: 'Institutional' },
                    { rate: 8.0, label: '8.0%', note: 'Multi-Phase' },
                    { rate: 10.0, label: '10.0%', note: 'Max Security' },
                  ].map((preset) => (
                    <button
                      key={preset.rate}
                      type="button"
                      onClick={() => setRetentionPercent(preset.rate)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        retentionPercent === preset.rate
                          ? 'bg-amber-500/25 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-mono font-bold">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 truncate">{preset.note}</div>
                    </button>
                  ))}
                </div>

                {/* Range Slider for 5% to 10% */}
                <div className="space-y-1">
                  <input
                    type="range"
                    min="5.0"
                    max="10.0"
                    step="0.5"
                    value={retentionPercent}
                    onChange={(e) => setRetentionPercent(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>5.0% (Minimum / PEC Standard)</span>
                    <span>7.5%</span>
                    <span>10.0% (Maximum Bank Escrow)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Handover Date & Defect Liability Period (DLP) Engine */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between mb-2">
                  <span>Step 3: Substantial Handover / TOC Date</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Initial 50% Tranche Release
                  </span>
                </label>

                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="date"
                    value={handoverDate}
                    onChange={(e) => setHandoverDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-3 py-2 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Project Awarded: {project.contractAwardDate}</span>
                  <span className="text-slate-300">
                    Handover Target: <strong>{formattedHandoverDate}</strong>
                  </span>
                </div>
              </div>

              {/* Defect Liability Period (DLP) Selection */}
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Step 4: Defect Liability Period (DLP)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                    +{dlpDays} Days
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { days: 90, label: '90 Days', note: '3 Months (Minor Civil)' },
                    { days: 180, label: '180 Days', note: '6 Months (Bank Standard)' },
                    { days: 365, label: '365 Days', note: '12 Months (Full Cycle)' },
                  ].map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setDlpDays(preset.days)}
                      className={`p-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        dlpDays === preset.days
                          ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/50 shadow-sm'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-mono font-bold">{preset.label}</div>
                      <div className="text-[9px] text-slate-400 truncate">{preset.note}</div>
                    </button>
                  ))}
                </div>

                {/* Milestone Split (50/50 standard vs 100% on DLP) */}
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-300 font-semibold block">Release Tranche Split</span>
                    <span className="text-[11px] text-slate-400">
                      Standard Bank Contract: 50% at Handover, 50% at DLP Expiry
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFirstTranchePercent(50)}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        firstTranchePercent === 50
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      50 / 50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setFirstTranchePercent(0)}
                      className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                        firstTranchePercent === 0
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      100% on DLP
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TWO-TRANCHE MILESTONE RELEASE SCHEDULE (IDENTIFIED RELEASE DATES) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Identified Retention Release Schedule & Milestones</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                Total Retention: <strong>PKR {computedTotalRetention.toLocaleString()}</strong>
              </span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Release Tranche</th>
                    <th className="py-2.5 px-3">Milestone Event</th>
                    <th className="py-2.5 px-3 text-center">Share</th>
                    <th className="py-2.5 px-3 text-right">Computed Amount</th>
                    <th className="py-2.5 px-3 text-center">Identified Release Date</th>
                    <th className="py-2.5 px-3 text-center">Audit Release Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {/* Tranche 1: Handover Date Release */}
                  {firstTranchePercent > 0 && (
                    <tr className="hover:bg-slate-900/40">
                      <td className="py-3 px-3 font-bold text-amber-400 font-sans">
                        Tranche 1 (Initial Release)
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-200">
                        <div className="font-semibold">Substantial Handover Certificate (TOC)</div>
                        <div className="text-[10px] text-slate-400">
                          Branch completed, physical keys & facilities handed over to Bank BOM
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-slate-300 font-sans">
                        {firstTranchePercent}%
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-white">
                        PKR {tranche1HandoverAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold">
                          {handoverDate}
                        </span>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {formattedHandoverDate}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {new Date(handoverDate) <= new Date() ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            Eligible / Handover Passed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                            Pending Handover
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        {onInitiateRelease && currentEscrowBalance > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              onInitiateRelease(
                                Math.min(tranche1HandoverAmount, currentEscrowBalance),
                                `Initial 50% Retention Release on Substantial Handover (TOC) for ${project.projectCode}`
                              )
                            }
                            className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold border border-amber-500/30 cursor-pointer"
                          >
                            Release Tranche 1
                          </button>
                        )}
                      </td>
                    </tr>
                  )}

                  {/* Tranche 2: Remaining Balance Release Date (Defect Liability Period Expiry) */}
                  <tr className="hover:bg-slate-900/40 bg-amber-500/5">
                    <td className="py-3 px-3 font-bold text-emerald-400 font-sans flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Tranche 2 (Final Balance)</span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-200">
                      <div className="font-semibold text-white">
                        Remaining Balance Release — DLP Expiry
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {dlpDays}-Day Defect Liability Period, zero open snags, final audit
                        clearance
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-300 font-sans">
                      {100 - firstTranchePercent}%
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      PKR {tranche2RemainingBalance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded font-bold text-xs ${
                          isReleaseOverdue
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : isEligibleNow
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {remainingBalanceReleaseDate}
                      </span>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {formattedReleaseDate}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {isReleaseOverdue ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          Overdue ({Math.abs(daysUntilRelease)}d)
                        </span>
                      ) : isEligibleNow ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Ready for Release
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          DLP Active ({daysUntilRelease}d left)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-sans">
                      {onInitiateRelease && currentEscrowBalance > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            onInitiateRelease(
                              currentEscrowBalance,
                              `Final Retention Balance Release upon ${dlpDays}-Day DLP Expiry (${remainingBalanceReleaseDate}) for ${project.projectCode}`
                            )
                          }
                          className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold shadow cursor-pointer transition-colors"
                        >
                          Release Remaining Balance
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Existing Project RA Bills Retention Breakdown */}
          {project.raBills && project.raBills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-400">
                  Individual RA Bills Certified vs. Withheld in Escrow
                </span>
                <span className="text-[11px] text-slate-500">
                  Section 15: Retention withheld per interim payment certificate
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {project.raBills.map((bill) => {
                  const billGross = bill.currentBillGross || 0;
                  const billDeducted = bill.retentionMoneyDeductionAmount || 0;
                  const simulatedDeduction = Math.round(billGross * (retentionPercent / 100));
                  return (
                    <div
                      key={bill.id}
                      className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-white">{bill.billNumber}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{bill.billDate}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Gross Bill:</span>
                        <span className="text-slate-200">Rs. {billGross.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-amber-400 text-[11px]">
                        <span>Withheld ({bill.retentionMoneyDeductionPercent}%):</span>
                        <span>Rs. {billDeducted.toLocaleString()}</span>
                      </div>
                      {retentionPercent !== bill.retentionMoneyDeductionPercent && (
                        <div className="flex justify-between text-cyan-400 text-[10px] pt-1 border-t border-slate-800/60">
                          <span>Simulated ({retentionPercent}%):</span>
                          <span>Rs. {simulatedDeduction.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statutory Bank Audit & Compliance Notes */}
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Commercial Bank Retention Release Prerequisites (PEC / FIDIC):</span>
            </div>
            <p>
              1. <strong>First 50% Release:</strong> Requires physical Taking-Over Certificate (TOC) signed by Bank Branch Manager (BOM) & Resident Project Engineer.
            </p>
            <p>
              2. <strong>Remaining Balance Release Date ({remainingBalanceReleaseDate}):</strong> Requires completion of the {dlpDays}-day Defect Liability Period (DLP), zero pending civil/electrical snags, and formal audit reconciliation with statutory tax (PRA/FBR) filings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
