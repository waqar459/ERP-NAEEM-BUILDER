import React, { useState } from 'react';
import {
  Fuel,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  Sparkles,
  MapPin,
  Car,
  TrendingUp,
  X,
  Clock,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { WorkerExpense, ExpenseCategory } from '../../types/erp';

export const ExpenseFuelManager: React.FC = () => {
  const {
    expenses,
    tickets,
    projects,
    branches,
    addWorkerExpense,
    approveExpense,
    setSystemMode,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'FUEL' | 'EXPENSES'>('FUEL');

  // Fuel modal state
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState('Muhammad Rashid');
  const [employeeDesignation, setEmployeeDesignation] = useState('Site Technician');
  const [vehicleType, setVehicleType] = useState<'Car' | 'Motorcycle' | 'Company Van'>('Car');
  const [startPoint, setStartPoint] = useState('Naeem Builder Head Office (Garden Town, Lahore)');
  const [destination, setDestination] = useState('Meezan Bank Gulberg III Branch');
  const [claimedKm, setClaimedKm] = useState<number>(42);
  const [routeCalculatedKm, setRouteCalculatedKm] = useState<number>(36);
  const [ratePerKm, setRatePerKm] = useState<number>(35);
  const [relatedType, setRelatedType] = useState<'TICKET' | 'PROJECT'>('TICKET');
  const [relatedId, setRelatedId] = useState(tickets[0]?.id || '');
  const [purpose, setPurpose] = useState('Emergency Chiller technician team dispatch & compressor transport');

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expWorkerName, setExpWorkerName] = useState('Asif Ali');
  const [expWorkerDesignation, setExpWorkerDesignation] = useState('Lead Mason');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('Emergency Material');
  const [expAmount, setExpAmount] = useState<number>(3500);
  const [expDesc, setExpDesc] = useState('Fast-acting anaerobic gasket sealant & brass 3/8 flare unions');

  // AI Audit state
  const [aiAuditing, setAiAuditing] = useState(false);
  const [aiAuditResult, setAiAuditResult] = useState<any>(null);

  // Derived collections
  const fuelExpenses = expenses.filter((e) => e.category === 'Fuel/KM');
  const otherExpenses = expenses.filter((e) => e.category !== 'Fuel/KM');

  const totalFuelCost = fuelExpenses.reduce((sum: number, f: WorkerExpense) => sum + f.amount, 0);
  const totalOtherCost = otherExpenses.reduce((sum: number, e: WorkerExpense) => sum + e.amount, 0);
  const flaggedFuelCount = fuelExpenses.filter(
    (f: WorkerExpense) => f.fuelDetails?.isDistanceDiscrepancyFlagged
  ).length;

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selTicket = relatedType === 'TICKET' ? tickets.find((t) => t.id === relatedId) : undefined;
    const selProject = relatedType === 'PROJECT' ? projects.find((p) => p.id === relatedId) : undefined;

    const variancePercent = routeCalculatedKm > 0
      ? Math.round(((claimedKm - routeCalculatedKm) / routeCalculatedKm) * 100)
      : 0;
    const isDiscrepancy = variancePercent > 15;
    const calculatedAllowance = claimedKm * ratePerKm;

    addWorkerExpense({
      date: new Date().toISOString().split('T')[0],
      employeeName,
      employeeDesignation,
      category: 'Fuel/KM',
      amount: calculatedAllowance,
      description: purpose,
      ticketId: selTicket?.id,
      projectId: selProject?.id,
      status: 'Submitted',
      fuelDetails: {
        vehicleType,
        startPoint,
        destination,
        claimedKm,
        routeCalculatedKm,
        ratePerKm,
        calculatedAllowance,
        isDistanceDiscrepancyFlagged: isDiscrepancy,
      },
    });

    setIsFuelModalOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selTicket = relatedType === 'TICKET' ? tickets.find((t) => t.id === relatedId) : undefined;
    const selProject = relatedType === 'PROJECT' ? projects.find((p) => p.id === relatedId) : undefined;

    addWorkerExpense({
      date: new Date().toISOString().split('T')[0],
      employeeName: expWorkerName,
      employeeDesignation: expWorkerDesignation,
      category: expCategory,
      amount: expAmount,
      description: expDesc,
      ticketId: selTicket?.id,
      projectId: selProject?.id,
      status: 'Submitted',
      receiptPhotoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
    });

    setIsExpenseModalOpen(false);
  };

  const handleRunAiAudit = async () => {
    setAiAuditing(true);
    try {
      const expensesPayload = expenses.map((exp: WorkerExpense) => ({
        type: exp.category,
        worker: exp.employeeName,
        amount: exp.amount,
        claimedDistance: exp.fuelDetails?.claimedKm,
        calculatedDistance: exp.fuelDetails?.routeCalculatedKm,
        variancePercent: exp.fuelDetails && exp.fuelDetails.routeCalculatedKm > 0
          ? Math.round(((exp.fuelDetails.claimedKm - exp.fuelDetails.routeCalculatedKm) / exp.fuelDetails.routeCalculatedKm) * 100)
          : 0,
        notes: exp.description,
      }));

      const res = await fetch('/api/ai/audit-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: expensesPayload }),
      });
      const data = await res.json();
      setAiAuditResult(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAuditing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-slate-950">
                SECTION 9
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Field Worker Expenses & Fuel/KM Mileage Engine
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Real-time direct job costing, GPS proximity validation, and automated mileage variance auditing (&gt;15% variance flagged).
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setSystemMode('VENDOR_COST_REPORT')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Open Naeem Taj / Naeem Builder Vendor Cost & Billing Audit Report"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Vendor Audit Report</span>
            </button>

            <button
              onClick={handleRunAiAudit}
              disabled={aiAuditing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{aiAuditing ? 'Auditing with AI...' : 'AI Expense Audit'}</span>
            </button>

            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Fuel className="w-4 h-4" />
              <span>+ Record Fuel/KM</span>
            </button>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-emerald-400" />
              <span>+ Worker Expense</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Total Fuel/KM Claims</span>
            <div className="text-base font-bold text-blue-400 font-mono mt-0.5">
              PKR {totalFuelCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">{fuelExpenses.length} entries registered</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Total Worker Field Expenses</span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              PKR {totalOtherCost.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">{otherExpenses.length} claims submitted</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Mileage Variance Flags (&gt;15%)</span>
            <div className={`text-base font-bold font-mono mt-0.5 ${flaggedFuelCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {flaggedFuelCount} Entries Flagged
            </div>
            <span className="text-[10px] text-slate-500">Exceeds route distance</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block font-medium">Cost Control Allocation</span>
            <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">
              100% Direct Job Cost
            </div>
            <span className="text-[10px] text-slate-500">Assigned to Ticket or Project</span>
          </div>
        </div>
      </div>

      {/* AI Audit Alert Banner */}
      {aiAuditResult && (
        <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Operations Audit Feedback</span>
            </div>
            <button onClick={() => setAiAuditResult(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-slate-200 leading-relaxed font-sans">{aiAuditResult.summary}</p>
          {aiAuditResult.flaggedItems && aiAuditResult.flaggedItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {aiAuditResult.flaggedItems.map((item: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-purple-500/20 text-slate-300 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-white">{item.item || item.type}</div>
                    <div className="text-slate-400 text-[11px]">{item.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('FUEL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'FUEL'
              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Fuel & Mileage Ledger ({fuelExpenses.length})
        </button>
        <button
          onClick={() => setActiveTab('EXPENSES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'EXPENSES'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Worker Petty & Site Expenses ({otherExpenses.length})
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'FUEL' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date / Worker</th>
                  <th className="py-3 px-4">Vehicle & Route</th>
                  <th className="py-3 px-4">Claimed vs Route</th>
                  <th className="py-3 px-4">Rate & Amount</th>
                  <th className="py-3 px-4">Variance Check</th>
                  <th className="py-3 px-4">Job Allocation</th>
                  <th className="py-3 px-4">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {fuelExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      No fuel entries recorded yet.
                    </td>
                  </tr>
                ) : (
                  fuelExpenses.map((exp: WorkerExpense) => {
                    const claimed = exp.fuelDetails?.claimedKm || 0;
                    const route = exp.fuelDetails?.routeCalculatedKm || 0;
                    const variance = route > 0 ? Math.round(((claimed - route) / route) * 100) : 0;
                    const isFlagged = exp.fuelDetails?.isDistanceDiscrepancyFlagged;

                    const matchedTicket = tickets.find((t) => t.id === exp.ticketId);
                    const matchedProject = projects.find((p) => p.id === exp.projectId);

                    return (
                      <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{exp.employeeName}</div>
                          <div className="text-[11px] text-slate-500">{exp.date} • {exp.employeeDesignation}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-200">
                            {exp.fuelDetails?.vehicleType || 'Car'}
                          </div>
                          <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                            {exp.fuelDetails?.startPoint} → {exp.fuelDetails?.destination}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="text-white font-bold">{claimed} KM</div>
                          <div className="text-[11px] text-slate-400">Route: {route} KM</div>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <div className="text-blue-400 font-bold">PKR {exp.amount.toLocaleString()}</div>
                          <div className="text-[11px] text-slate-500">@ PKR {exp.fuelDetails?.ratePerKm || 35}/KM</div>
                        </td>
                        <td className="py-3 px-4">
                          {isFlagged ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              +{variance}% Variance
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Within 15%
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {matchedTicket ? (
                            <div className="text-amber-400 font-mono text-[11px]">
                              {matchedTicket.ticketNumber}
                            </div>
                          ) : matchedProject ? (
                            <div className="text-emerald-400 font-mono text-[11px]">
                              {matchedProject.projectCode}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">General Overhead</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {exp.status === 'Approved' ? (
                            <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => approveExpense(exp.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date / Worker</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Allocated Job</th>
                  <th className="py-3 px-4">Status / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {otherExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No worker expenses recorded yet.
                    </td>
                  </tr>
                ) : (
                  otherExpenses.map((exp: WorkerExpense) => {
                    const matchedTicket = tickets.find((t) => t.id === exp.ticketId);
                    const matchedProject = projects.find((p) => p.id === exp.projectId);

                    return (
                      <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{exp.employeeName}</div>
                          <div className="text-[11px] text-slate-500">{exp.date} • {exp.employeeDesignation}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-slate-200 line-clamp-2 max-w-sm">{exp.description}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          PKR {exp.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          {matchedTicket ? (
                            <span className="text-amber-400 font-mono text-[11px]">
                              {matchedTicket.ticketNumber}
                            </span>
                          ) : matchedProject ? (
                            <span className="text-emerald-400 font-mono text-[11px]">
                              {matchedProject.projectCode}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Unallocated</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {exp.status === 'Approved' ? (
                            <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => approveExpense(exp.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Fuel Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Fuel className="w-4 h-4 text-blue-400" />
                <span>Record Fuel/KM Log (Section 9)</span>
              </div>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Employee / Driver Name:</label>
                  <input
                    type="text"
                    required
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Vehicle Type:</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => {
                      const v = e.target.value as any;
                      setVehicleType(v);
                      if (v === 'Car') setRatePerKm(35);
                      else if (v === 'Motorcycle') setRatePerKm(18);
                      else setRatePerKm(45);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Car">Car (PKR 35 / KM)</option>
                    <option value="Motorcycle">Motorcycle (PKR 18 / KM)</option>
                    <option value="Company Van">Company Van (PKR 45 / KM)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Start Location:</label>
                  <input
                    type="text"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Destination Branch:</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Claimed Distance (KM):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={claimedKm}
                    onChange={(e) => setClaimedKm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Route Calculated (KM):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={routeCalculatedKm}
                    onChange={(e) => setRouteCalculatedKm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Rate / KM (PKR):</label>
                  <input
                    type="number"
                    min="1"
                    value={ratePerKm}
                    onChange={(e) => setRatePerKm(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total Calculated Allowance:</span>
                <span className="text-blue-400 font-bold text-sm">
                  PKR {(claimedKm * ratePerKm).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Direct Cost Allocation:</label>
                  <select
                    value={relatedType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setRelatedType(t);
                      setRelatedId(t === 'TICKET' ? tickets[0]?.id || '' : projects[0]?.id || '');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="TICKET">System 1: Maintenance Ticket</option>
                    <option value="PROJECT">System 2: Build-Up Project</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Select Job:</label>
                  <select
                    value={relatedId}
                    onChange={(e) => setRelatedId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {relatedType === 'TICKET'
                      ? tickets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.ticketNumber} - {t.title.slice(0, 24)}...
                          </option>
                        ))
                      : projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.projectCode} - {p.title.slice(0, 24)}...
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Save Fuel Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Worker Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Receipt className="w-4 h-4 text-emerald-400" />
                <span>Record Field Worker Expense</span>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Worker Name:</label>
                  <input
                    type="text"
                    required
                    value={expWorkerName}
                    onChange={(e) => setExpWorkerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Expense Category:</label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Emergency Material">Emergency Material</option>
                    <option value="Food">Food / Per Diem</option>
                    <option value="Transport">Local Transport / Rickshaw</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Parking/Toll">Parking / Toll</option>
                    <option value="Emergency Repair">Emergency Repair</option>
                    <option value="Loading/Unloading">Loading / Unloading</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Amount (PKR):</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Description / Itemized Breakdown:</label>
                <textarea
                  rows={2}
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Allocate Cost To:</label>
                  <select
                    value={relatedType}
                    onChange={(e) => {
                      const t = e.target.value as any;
                      setRelatedType(t);
                      setRelatedId(t === 'TICKET' ? tickets[0]?.id || '' : projects[0]?.id || '');
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="TICKET">Ticket (System 1)</option>
                    <option value="PROJECT">Project (System 2)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Select Record:</label>
                  <select
                    value={relatedId}
                    onChange={(e) => setRelatedId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    {relatedType === 'TICKET'
                      ? tickets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.ticketNumber} - {t.title.slice(0, 24)}...
                          </option>
                        ))
                      : projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.projectCode} - {p.title.slice(0, 24)}...
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
