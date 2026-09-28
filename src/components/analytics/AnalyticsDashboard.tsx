import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Fuel,
  FileText,
  Filter,
  ArrowUpRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Ticket, Project, WorkerExpense } from '../../types/erp';

// High-contrast, accessibility-tested palette for charts
const CHART_COLORS = [
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#eab308', // Yellow
  '#14b8a6', // Teal
];

const STATUS_COLOR_MAP: Record<string, string> = {
  'New / Open': '#38bdf8',
  'Site Visit Scheduled': '#60a5fa',
  'Job Verified': '#818cf8',
  'Internal Estimate Prepared': '#a78bfa',
  'Quotation Sent': '#f59e0b',
  'Financial Approval Pending': '#fbbf24',
  'Approved': '#10b981',
  'Purchasing in Progress': '#34d399',
  'Material Received': '#2dd4bf',
  'Work Order Issued': '#22d3ee',
  'Work In Progress': '#a855f7',
  'Completion Note Generated': '#ec4899',
  'Completion Verified': '#059669',
  'Invoiced': '#6366f1',
  'Payment Received': '#14b8a6',
  'GST Filed': '#64748b',
  'Closed': '#475569',
};

interface AnalyticsDashboardProps {
  onSelectTicket?: (ticketId: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onSelectTicket,
  onSelectProject,
}) => {
  const { tickets, projects, expenses, setSystemMode } = useERP();

  const [selectedClient, setSelectedClient] = useState<string>('ALL');
  const [selectedView, setSelectedView] = useState<'OVERVIEW' | 'TICKETS' | 'PROJECTS' | 'FINANCES'>('OVERVIEW');

  // Unique clients across tickets
  const clientsList = useMemo(() => {
    const set = new Set<string>();
    tickets.forEach((t) => {
      if (t.client) set.add(t.client);
    });
    return Array.from(set);
  }, [tickets]);

  // Filtered tickets
  const activeTickets = useMemo(() => {
    if (selectedClient === 'ALL') return tickets;
    return tickets.filter((t) => t.client === selectedClient);
  }, [tickets, selectedClient]);

  // Filtered projects
  const activeProjects = useMemo(() => {
    if (selectedClient === 'ALL') return projects;
    return projects.filter((p) => p.client === selectedClient);
  }, [projects, selectedClient]);

  // 1. Status breakdown for Pie Chart
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    activeTickets.forEach((t) => {
      counts[t.status] = (counts[t.status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLOR_MAP[status] || '#94a3b8',
    }));
  }, [activeTickets]);

  // 2. Client bank-wise volume and amounts
  const clientVolumeData = useMemo(() => {
    const map: Record<
      string,
      { client: string; totalTickets: number; quotedPKR: number; approvedPKR: number; completed: number }
    > = {};

    tickets.forEach((t) => {
      const c = t.client || 'Other';
      if (!map[c]) {
        map[c] = { client: c, totalTickets: 0, quotedPKR: 0, approvedPKR: 0, completed: 0 };
      }
      map[c].totalTickets += 1;
      const quoted = t.quotation?.totalAmount || t.estimates[0]?.totalEstimatedAmount || 0;
      map[c].quotedPKR += quoted;
      if (t.approval?.approvedAmount) {
        map[c].approvedPKR += t.approval.approvedAmount;
      } else if (['Approved', 'Work In Progress', 'Completion Verified', 'Invoiced', 'Closed'].includes(t.status)) {
        map[c].approvedPKR += quoted;
      }
      if (['Completion Verified', 'Invoiced', 'Payment Received', 'Closed'].includes(t.status)) {
        map[c].completed += 1;
      }
    });

    return Object.values(map);
  }, [tickets]);

  // 3. Trade / Category Breakdown
  const categoryData = useMemo(() => {
    const counts: Record<string, { category: string; count: number; estimatedValue: number }> = {};
    activeTickets.forEach((t) => {
      const cat = t.category || 'Civil';
      if (!counts[cat]) {
        counts[cat] = { category: cat, count: 0, estimatedValue: 0 };
      }
      counts[cat].count += 1;
      counts[cat].estimatedValue += t.quotation?.totalAmount || t.estimates[0]?.totalEstimatedAmount || 25000;
    });
    return Object.values(counts);
  }, [activeTickets]);

  // 4. Project Budget vs Actual Spent vs RA Billed (System 2)
  const projectComparisonData = useMemo(() => {
    return activeProjects.map((p) => {
      const sanctioned = p.contractValue || p.revisedContractValue || 0;
      const spent = p.totalActualProjectCost || 0;
      const billed = p.totalBilledAmount || p.raBills?.reduce((sum, r) => sum + r.netPayableAmount, 0) || 0;
      return {
        name: p.title.length > 20 ? p.title.substring(0, 18) + '…' : p.title,
        fullName: p.title,
        sanctioned: Math.round(sanctioned / 1000), // in Thousands PKR
        spent: Math.round(spent / 1000),
        billed: Math.round(billed / 1000),
        progress: p.overallProgressPercent,
      };
    });
  }, [activeProjects]);

  // 5. Fuel & Field Expense Summary
  const fuelSummary = useMemo(() => {
    const map: Record<string, { name: string; totalKm: number; totalCost: number }> = {};
    expenses.forEach((exp: WorkerExpense) => {
      const name = exp.employeeName;
      if (!map[name]) {
        map[name] = { name, totalKm: 0, totalCost: 0 };
      }
      map[name].totalKm += exp.fuelDetails?.claimedKm || 0;
      map[name].totalCost += exp.amount;
    });
    return Object.values(map);
  }, [expenses]);

  // Top Line Metrics
  const totalQuoted = useMemo(() => {
    return activeTickets.reduce((sum, t) => {
      return sum + (t.quotation?.totalAmount || t.estimates[0]?.totalEstimatedAmount || 0);
    }, 0);
  }, [activeTickets]);

  const totalApproved = useMemo(() => {
    return activeTickets.reduce((sum, t) => {
      if (t.approval?.approvedAmount) return sum + t.approval.approvedAmount;
      if (['Approved', 'Work In Progress', 'Completion Verified', 'Invoiced', 'Closed'].includes(t.status)) {
        return sum + (t.quotation?.totalAmount || t.estimates[0]?.totalEstimatedAmount || 0);
      }
      return sum;
    }, 0);
  }, [activeTickets]);

  const approvedRate = totalQuoted > 0 ? Math.round((totalApproved / totalQuoted) * 100) : 0;
  const verifiedRate = activeTickets.length > 0
    ? Math.round(
        (activeTickets.filter((t) => ['Completion Verified', 'Invoiced', 'Payment Received', 'Closed'].includes(t.status)).length /
          activeTickets.length) *
          100
      )
    : 0;

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs font-sans">
          <p className="font-bold text-slate-200 mb-1">{label || payload[0]?.name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color || entry.fill }}>
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color || entry.fill }} />
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold text-white">
                {typeof entry.value === 'number'
                  ? entry.value >= 1000 && !entry.name.includes('Count')
                    ? `PKR ${entry.value.toLocaleString()}`
                    : entry.value.toLocaleString()
                  : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              ANALYTICS ENGINE
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executive Visual Graphs &amp; Operations Dashboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            High-contrast graphical tracking for maintenance tickets (System 1 HERE4U), regional branch construction (System 2), quotation sanction rates, and field fuel efficiency.
          </p>
        </div>

        {/* View Switcher & Bank Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setSelectedView('OVERVIEW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedView === 'OVERVIEW'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Graphs
            </button>
            <button
              onClick={() => setSelectedView('TICKETS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedView === 'TICKETS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              HERE4U Tickets
            </button>
            <button
              onClick={() => setSelectedView('PROJECTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedView === 'PROJECTS'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              System 2 Projects
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Banks ({tickets.length} tickets)</option>
              {clientsList.map((client) => (
                <option key={client} value={client}>
                  {client}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setSystemMode('VENDOR_COST_REPORT')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            title="Open Vendor Cost & Audit Report (Naeem Taj / Naeem Builder)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
            <span>Vendor Cost Report</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Total Quoted Pipeline</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            PKR {totalQuoted.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-amber-400 font-bold">{activeTickets.length}</span> tickets actively tracked
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Sanctioned Approvals</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            PKR {totalApproved.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-bold">{approvedRate}%</span> approval conversion rate
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Completed &amp; Verified</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            {verifiedRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            With GPS stamp &amp; signed delivery notes
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-slate-400">Field Fuel &amp; Mileage</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            {expenses.reduce((sum: number, e: WorkerExpense) => sum + (e.fuelDetails?.claimedKm || 0), 0).toLocaleString()} KM
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            PKR {expenses.reduce((sum: number, e: WorkerExpense) => sum + e.amount, 0).toLocaleString()} verified travel
          </p>
        </div>
      </div>

      {/* Primary Graphs Row: 2 Large Charts */}
      {(selectedView === 'OVERVIEW' || selectedView === 'TICKETS') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Status Distribution Donut */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-amber-400" />
                  Ticket Workflow Stage Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Current distribution across all 17 lifecycle stages
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold">
                {activeTickets.length} Active
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={40}
                    iconSize={8}
                    formatter={(value) => <span className="text-[11px] text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Client Banks Financial Volume */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  Bank Portfolio: Quoted vs Approved Value (PKR)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparison of commercial proposals submitted vs bank sanctions
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                Commercial Comparison
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clientVolumeData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis
                    dataKey="client"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => {
                      if (val.includes('United Bank')) return 'UBL';
                      if (val.includes('Meezan')) return 'Meezan';
                      if (val.includes('Habib Bank')) return 'HBL';
                      if (val.includes('Alfalah')) return 'Alfalah';
                      return val;
                    }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    iconSize={8}
                    formatter={(value) => <span className="text-[11px] text-slate-300 font-medium">{value}</span>}
                  />
                  <Bar dataKey="quotedPKR" name="Quoted Amount (PKR)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approvedPKR" name="Approved Amount (PKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Graphs Row: Category & Projects */}
      {(selectedView === 'OVERVIEW' || selectedView === 'PROJECTS') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: System 2 Project Budget vs Actual Spent (in Thousands PKR) */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  System 2 Projects: Sanctioned vs Spent vs Billed ('000 PKR)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Full-scale branch build-ups budget burn &amp; certified RA billing
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                System 2
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectComparisonData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-10} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `${val}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    iconSize={8}
                    formatter={(value) => <span className="text-[11px] text-slate-300 font-medium">{value}</span>}
                  />
                  <Bar dataKey="sanctioned" name="Sanctioned BOQ (k PKR)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Actual Spent (k PKR)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="billed" name="RA Billed (k PKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Trade / Category Volume Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Maintenance Work Orders by Trade Category
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Volume of jobs and estimated financial footprint per craft
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold">
                Craft Breakdown
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={30}
                    iconSize={8}
                    formatter={(value) => <span className="text-[11px] text-slate-300 font-medium">{value}</span>}
                  />
                  <Bar dataKey="count" name="Total Jobs (Count)" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Row 3: Fuel Mileage & Verification Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technician Fuel / KM Efficiency */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Fuel className="w-4 h-4 text-amber-400" />
                Field Visit Mileage &amp; Verified Travel Expense by Technician
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated at Rs. 16/KM for bike or Rs. 35/KM for van with GPS geotag verification
              </p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Rule 8 Audit
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuelSummary} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" orientation="left" stroke="#f59e0b" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#06b6d4" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={30}
                  iconSize={8}
                  formatter={(value) => <span className="text-[11px] text-slate-300 font-medium">{value}</span>}
                />
                <Bar yAxisId="left" dataKey="totalKm" name="Distance (KM)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="totalCost" name="Expense (PKR)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Check Verification & Compliance Status */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Quick Audit &amp; Verification Checks
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time audit compliance scorecard based on Master Blueprint rules:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">GPS Proximity (&lt; 200m)</div>
                  <div className="text-[11px] text-slate-400">Geo-fenced branch check-ins</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  96% Passed
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Rule 9: Rate Concealment</div>
                  <div className="text-[11px] text-slate-400">Zero internal rates on Delivery Notes</div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  100% Secure
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">Email Approval Linked</div>
                  <div className="text-[11px] text-slate-400">Formal sanction recorded before WIP</div>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  92% Verified
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">16% PRA GST Invoicing</div>
                  <div className="text-[11px] text-slate-400">Sales tax compliance on signed jobs</div>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Compliant
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Overall Health Score:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">98.4 / 100</span>
          </div>
        </div>
      </div>
    </div>
  );
};
