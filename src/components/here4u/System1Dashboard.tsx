import React, { useState, useMemo } from 'react';
import {
  Wrench,
  AlertCircle,
  FileCheck2,
  Hammer,
  Receipt,
  Search,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Mail,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  LayoutGrid,
  Building2,
  Calculator,
  Tag,
  Check,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useERP } from '../../context/ERPContext';
import { Ticket, TicketStatus, TicketPriority, OFFICIAL_COMPLAINT_TYPES } from '../../types/erp';

interface System1DashboardProps {
  onSelectTicket: (ticketId: string) => void;
  onOpenNewTicket: () => void;
  onOpenBranchEstimate?: () => void;
}

export const System1Dashboard: React.FC<System1DashboardProps> = ({
  onSelectTicket,
  onOpenNewTicket,
  onOpenBranchEstimate,
}) => {
  const { tickets, advanceTicketStatus, assignOfficialTicketNumber } = useERP();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [complaintTypeFilter, setComplaintTypeFilter] = useState<string>('ALL');
  const [ticketTypeFilter, setTicketTypeFilter] = useState<'ALL' | 'OFFICIAL' | 'PROVISIONAL'>('ALL');
  const [dashboardViewMode, setDashboardViewMode] = useState<'TABLE' | 'GRAPHS' | 'SPLIT'>('SPLIT');

  // Assign Ticket Number Modal state
  const [assigningTicket, setAssigningTicket] = useState<Ticket | null>(null);
  const [inputTicketNumber, setInputTicketNumber] = useState('');

  // KPI Calculations
  const newOpenTickets = tickets.filter((t) => ['New / Open'].includes(t.status)).length;
  const visitsEstimatesApprovalsPending = tickets.filter((t) =>
    [
      'Site Visit Scheduled',
      'Job Verified',
      'Internal Estimate Prepared',
      'Quotation Sent',
      'Financial Approval Pending',
    ].includes(t.status)
  ).length;
  const workInProgressCompletionPending = tickets.filter((t) =>
    [
      'Approved',
      'Purchasing in Progress',
      'Material Received',
      'Work Order Issued',
      'Work In Progress',
      'Completion Note Generated',
    ].includes(t.status)
  ).length;
  const invoicesPaymentsGstPending = tickets.filter((t) =>
    ['Completion Verified', 'Invoiced', 'Payment Received'].includes(t.status)
  ).length;

  const provisionalCount = tickets.filter(
    (t) => t.ticketNumberStatus === 'PROVISIONAL_PENDING' || t.ticketNumber === 'PENDING'
  ).length;

  // Filter tickets
  const filteredTickets = tickets.filter((t) => {
    const isProvisional = t.ticketNumberStatus === 'PROVISIONAL_PENDING' || t.ticketNumber === 'PENDING';

    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.ublBranchCode && t.ublBranchCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.provisionalEstimateCode && t.provisionalEstimateCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.complaintType && t.complaintType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesComplaintType =
      complaintTypeFilter === 'ALL' ||
      t.complaintType === complaintTypeFilter ||
      t.bankComplaintDetails?.complaintType === complaintTypeFilter;

    const matchesTicketType =
      ticketTypeFilter === 'ALL' ||
      (ticketTypeFilter === 'OFFICIAL' && !isProvisional) ||
      (ticketTypeFilter === 'PROVISIONAL' && isProvisional);

    return matchesSearch && matchesPriority && matchesStatus && matchesComplaintType && matchesTicketType;
  });

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'Emergency':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Low':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    if (s === 'Completion Verified') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (s === 'Closed' || s === 'GST Filed') return 'bg-slate-800 text-slate-300 border-slate-700';
    if (s === 'Work In Progress') return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (s === 'Financial Approval Pending') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
  };

  // UBL Branch Graph Data
  const branchGraphData = useMemo(() => {
    const map: Record<string, { name: string; tickets: number; quotedK: number; approvedK: number }> = {};
    filteredTickets.forEach((t) => {
      const code = t.ublBranchCode || '0962';
      const label = `${t.branchName.replace(/United Bank Limited|UBL|Branch/gi, '').trim().split(' ')[0]} (${code})`;
      if (!map[label]) {
        map[label] = { name: label, tickets: 0, quotedK: 0, approvedK: 0 };
      }
      map[label].tickets += 1;
      const quoted = t.quotation?.totalAmount || t.estimates[0]?.totalEstimatedAmount || 0;
      map[label].quotedK += Math.round(quoted / 1000);
      if (t.approval?.approvedAmount) {
        map[label].approvedK += Math.round(t.approval.approvedAmount / 1000);
      } else if (['Approved', 'Work In Progress', 'Completion Verified', 'Invoiced', 'Closed'].includes(t.status)) {
        map[label].approvedK += Math.round(quoted / 1000);
      }
    });

    return Object.values(map);
  }, [filteredTickets]);

  const categoryDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTickets.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    const colors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4'];
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [filteredTickets]);

  const handleAssignTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningTicket || !inputTicketNumber.trim()) return;
    assignOfficialTicketNumber(assigningTicket.id, inputTicketNumber.trim());
    setAssigningTicket(null);
    setInputTicketNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
              SYSTEM 1
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              UBL HERE4U ONLY
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Maintenance &amp; Ticket Operations
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            United Bank Limited (UBL) nationwide branch maintenance register. Create estimates by UBL Branch Code before ticket generation, or log formal HERE4U tickets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => (onOpenBranchEstimate ? onOpenBranchEstimate() : onOpenNewTicket())}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap"
            title="Create estimate based on UBL Branch Code first (ticket follows afterward)"
          >
            <Calculator className="w-4 h-4 text-cyan-400" />
            <span>+ Estimate by Branch Code</span>
          </button>

          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>+ Log UBL Complaint / Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">New / Open Requests</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{newOpenTickets}</div>
          <p className="text-[11px] text-slate-500 mt-1">Pending site visit scheduling</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Visits & Approvals Pending</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400">{visitsEstimatesApprovalsPending}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Includes <strong className="text-cyan-400 font-mono">{provisionalCount}</strong> Branch-First Estimates
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Work & Completion Pending</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300">{workInProgressCompletionPending}</div>
          <p className="text-[11px] text-slate-500 mt-1">Field execution & BOM sign/stamp proof</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Invoices & GST Queue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{invoicesPaymentsGstPending}</div>
          <p className="text-[11px] text-slate-500 mt-1">Verified work billing & tax reconciliation</p>
        </div>
      </div>

      {/* Tickets List Table & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ticket #, UBL branch code (e.g. 0962, 640), branch name, scope..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Ticket Workflow Type Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setTicketTypeFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                  ticketTypeFilter === 'ALL'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketTypeFilter('OFFICIAL')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all ${
                  ticketTypeFilter === 'OFFICIAL'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Official Tickets
              </button>
              <button
                type="button"
                onClick={() => setTicketTypeFilter('PROVISIONAL')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                  ticketTypeFilter === 'PROVISIONAL'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-cyan-400 hover:text-cyan-200'
                }`}
              >
                <span>Branch Estimates</span>
                {provisionalCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-900/60 text-cyan-200">
                    {provisionalCount}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg">
              <span className="text-[11px] text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer max-w-[150px]"
              >
                <option value="ALL" className="bg-slate-900">All Statuses</option>
                <option value="New / Open" className="bg-slate-900">New / Open</option>
                <option value="Site Visit Scheduled" className="bg-slate-900">Site Visit Scheduled</option>
                <option value="Internal Estimate Prepared" className="bg-slate-900">Internal Estimate Prepared</option>
                <option value="Financial Approval Pending" className="bg-slate-900">Financial Approval Pending</option>
                <option value="Work In Progress" className="bg-slate-900">Work In Progress</option>
                <option value="Completion Note Generated" className="bg-slate-900">Completion Note Generated</option>
                <option value="Completion Verified" className="bg-slate-900">Completion Verified</option>
                <option value="Invoiced" className="bg-slate-900">Invoiced</option>
                <option value="GST Filed" className="bg-slate-900">GST Filed</option>
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDashboardViewMode('TABLE')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                  dashboardViewMode === 'TABLE' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
                }`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setDashboardViewMode('GRAPHS')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                  dashboardViewMode === 'GRAPHS' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Graphs</span>
              </button>
              <button
                type="button"
                onClick={() => setDashboardViewMode('SPLIT')}
                className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer flex items-center gap-1 ${
                  dashboardViewMode === 'SPLIT' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visual Charts (Shown in GRAPHS or SPLIT) */}
        {(dashboardViewMode === 'GRAPHS' || dashboardViewMode === 'SPLIT') && (
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  UBL Branch Maintenance Distribution &amp; Work Volume
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {filteredTickets.length} matching works across UBL branches
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                  <span>UBL Branch Portfolio (k PKR)</span>
                  <span className="text-[10px] text-slate-500 font-mono">Quoted vs Approved</span>
                </div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={branchGraphData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="quotedK" name="Quoted (k PKR)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="approvedK" name="Approved (k PKR)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <div className="text-[11px] font-bold text-slate-300 mb-2">Category Mix</div>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        dataKey="value"
                      >
                        {categoryDistribution.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Rows */}
        {(dashboardViewMode === 'TABLE' || dashboardViewMode === 'SPLIT') && (
          <div className="overflow-x-auto">
            {/* Quick-Filter Pills */}
            <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider whitespace-nowrap mr-1">
                Complaint Type:
              </span>
              <button
                type="button"
                onClick={() => setComplaintTypeFilter('ALL')}
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-all cursor-pointer ${
                  complaintTypeFilter === 'ALL'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Types ({tickets.length})
              </button>
              {OFFICIAL_COMPLAINT_TYPES.map((type) => {
                const count = tickets.filter(
                  (t) => t.complaintType === type || t.bankComplaintDetails?.complaintType === type
                ).length;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setComplaintTypeFilter(complaintTypeFilter === type ? 'ALL' : type)}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono whitespace-nowrap transition-all cursor-pointer ${
                      complaintTypeFilter === type
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{type}</span>
                    {count > 0 && <span className="ml-1 opacity-70 font-sans">({count})</span>}
                  </button>
                );
              })}
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ticket / Estimate #</th>
                  <th className="py-3 px-4">UBL Branch &amp; Code</th>
                  <th className="py-3 px-4">Complaint Type &amp; Scope</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Workflow Stage</th>
                  <th className="py-3 px-4 text-right">Direct Cost</th>
                  <th className="py-3 px-4 text-right">Net Revenue</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No works found matching current filters.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isProvisional = ticket.ticketNumberStatus === 'PROVISIONAL_PENDING' || ticket.ticketNumber === 'PENDING';

                    return (
                      <tr
                        key={ticket.id}
                        className={`hover:bg-slate-850/60 transition-colors cursor-pointer group ${
                          isProvisional ? 'bg-cyan-950/10' : ''
                        }`}
                        onClick={() => onSelectTicket(ticket.id)}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isProvisional ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                                <Clock className="w-3 h-3" />
                                PENDING TICKET #
                              </span>
                              <div className="text-[10px] font-mono text-slate-400">
                                Ref: <strong className="text-cyan-300">{ticket.provisionalEstimateCode || ticket.id}</strong>
                              </div>
                            </div>
                          ) : (
                            <div className="font-mono font-bold text-amber-400 flex items-center gap-1.5">
                              <span>{ticket.ticketNumber}</span>
                              {ticket.gmailThread && ticket.gmailThread.length > 0 && (
                                <span
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-red-600/20 text-red-300 border border-red-500/30 flex items-center gap-1 font-sans font-semibold"
                                  title={`${ticket.gmailThread.length} Gmail messages linked`}
                                >
                                  <Mail className="w-2.5 h-2.5" />
                                  <span>{ticket.gmailThread.length}</span>
                                </span>
                              )}
                            </div>
                          )}

                          {ticket.bankComplaintDetails && !isProvisional && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <span className="text-slate-500">Ref:</span>
                              <span className="text-amber-400/90 font-bold">#{ticket.bankComplaintDetails.complaintNumber}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Code: {ticket.ublBranchCode || '0962'}
                            </span>
                            <span className="font-semibold text-slate-200">{ticket.branchName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[260px]">
                            {ticket.branchAddress || `${ticket.client} • ${ticket.city}`}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-300 truncate">{ticket.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] bg-amber-500/15 text-amber-300 font-mono font-bold px-1.5 py-0.5 rounded border border-amber-500/25">
                              {ticket.complaintType || ticket.bankComplaintDetails?.complaintType || `${ticket.category} Maintenance`}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">({ticket.category})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">{ticket.scopeDescription}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium border ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                          PKR {ticket.totalDirectCost ? ticket.totalDirectCost.toLocaleString() : '0'}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400">
                          PKR {ticket.netRevenue ? ticket.netRevenue.toLocaleString() : '0'}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1.5">
                            {isProvisional ? (
                              <button
                                onClick={() => {
                                  setAssigningTicket(ticket);
                                  setInputTicketNumber('');
                                }}
                                className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-colors border border-cyan-500/40 flex items-center gap-1"
                                title="Link official UBL ticket number now that it has been generated"
                              >
                                <Tag className="w-3 h-3" />
                                <span>Link Ticket #</span>
                              </button>
                            ) : null}

                            <button
                              onClick={() => onSelectTicket(ticket.id)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
                            >
                              Master
                            </button>
                            <button
                              onClick={() => advanceTicketStatus(ticket.id)}
                              title="Advance to next stage in HERE4U workflow"
                              className="p-1 rounded bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Assign Official Ticket Number */}
      {assigningTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Assign Official UBL Ticket Number</h3>
              </div>
              <button
                onClick={() => setAssigningTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div><strong>Branch:</strong> {assigningTicket.branchName} (Code: {assigningTicket.ublBranchCode})</div>
              <div><strong>Work Title:</strong> {assigningTicket.title}</div>
              <div><strong>Provisional Estimate Ref:</strong> {assigningTicket.provisionalEstimateCode}</div>
            </div>

            <form onSubmit={handleAssignTicketSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Official UBL Ticket / Complaint Number:
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 125890 or 123913"
                  value={inputTicketNumber}
                  onChange={(e) => setInputTicketNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Once assigned, this estimate transitions into the official ticket workflow and links to UBL HERE4U reports.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssigningTicket(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Save &amp; Link Ticket Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
