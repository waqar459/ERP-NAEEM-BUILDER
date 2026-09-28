import React from 'react';
import {
  Building2,
  Wrench,
  Layers,
  MapPin,
  Receipt,
  Sparkles,
  Shield,
  Activity,
  PlusCircle,
  FolderGit2,
  BarChart3,
  FileSpreadsheet,
  FileText,
  Users,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { SystemMode, UserRole } from '../../types/erp';

interface HeaderProps {
  onOpenNewTicket: () => void;
  onOpenNewProject: () => void;
  onOpenAuditTrail: () => void;
  onOpenAI: () => void;
}

const ROLES: UserRole[] = [
  'Super Admin',
  'Management',
  'HERE4U Operator',
  'Site/Visit Team',
  'Estimator',
  'Approver',
  'Procurement',
  'Project Manager',
  'Accounts',
  'Tax/GST',
  'Store',
  'View Only',
];

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTicket,
  onOpenNewProject,
  onOpenAuditTrail,
  onOpenAI,
}) => {
  const { systemMode, setSystemMode, activeRole, setActiveRole, tickets, projects, consolidatedInvoices, staffUsers } = useERP();

  const openTicketsCount = tickets.filter(
    (t) => !['Closed', 'GST Filed'].includes(t.status)
  ).length;
  const activeProjectsCount = projects.filter(
    (p) => !['Closed'].includes(p.status)
  ).length;
  const pendingConsolidatedCount = (consolidatedInvoices || []).filter(
    (c) => c.status !== 'Paid via Online Transfer'
  ).length;

  const navItems: { mode: SystemMode; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      mode: 'SYSTEM_1_HERE4U',
      label: 'System 1: HERE4U',
      icon: <Wrench className="w-4 h-4" />,
      badge: openTicketsCount,
    },
    {
      mode: 'CONSOLIDATED_INVOICES',
      label: 'Consolidated Invoices (<500k)',
      icon: <FileText className="w-4 h-4 text-emerald-400" />,
      badge: pendingConsolidatedCount > 0 ? pendingConsolidatedCount : undefined,
    },
    {
      mode: 'SYSTEM_2_BRANCH_REGION',
      label: 'System 2: Branch + Region',
      icon: <Layers className="w-4 h-4" />,
      badge: activeProjectsCount,
    },
    {
      mode: 'ANALYTICS_GRAPHS',
      label: 'Graphs & Analytics',
      icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
    },
    {
      mode: 'BRANCH_MASTER',
      label: 'Branch Master',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      mode: 'FIELD_EXPENSES',
      label: 'Field & Fuel-KM',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      mode: 'COST_CONTROL',
      label: 'Cost Control & GST',
      icon: <Receipt className="w-4 h-4" />,
    },
    {
      mode: 'VENDOR_COST_REPORT',
      label: 'Vendor Cost & Audit Report',
      icon: <FileSpreadsheet className="w-4 h-4 text-amber-400" />,
    },
    {
      mode: 'AI_INTELLIGENCE',
      label: 'AI Hub',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    },
    {
      mode: 'ADMIN_PANEL',
      label: 'User Management & Staff',
      icon: <Users className="w-4 h-4 text-sky-400" />,
      badge: staffUsers?.length,
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner with Brand & Master Blueprint Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
            NB
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                NAEEM BUILDER ERP
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Master Blueprint
              </span>
              <button
                onClick={() => setSystemMode('VENDOR_COST_REPORT')}
                className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 cursor-pointer transition-all flex items-center gap-1"
                title="View Naeem Taj / Naeem Builder Aggregated Cost & Audit Report"
              >
                <span>Vendor: Naeem Taj (UBL)</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              One ERP • Two Business Systems • Shared Foundation & Controls
            </p>
          </div>
        </div>

        {/* Global Controls: Role Switcher, Audit Trail, AI Assistant, Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-semibold text-amber-400 focus:outline-none cursor-pointer"
            >
              {ROLES.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-200">
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Quick User Management & Admin Button */}
          <button
            onClick={() => setSystemMode('ADMIN_PANEL')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
              systemMode === 'ADMIN_PANEL'
                ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                : 'bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border-sky-500/30'
            }`}
            title="User Management, Staff Roles & System Governance"
          >
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span>Users &amp; Roles</span>
          </button>

          {/* Audit Trail Button */}
          <button
            onClick={onOpenAuditTrail}
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="View system audit trail (Section 16)"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Trail</span>
          </button>

          {/* AI Intelligence Quick Button */}
          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 transition-colors border border-amber-500/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          {/* New Work Request Button */}
          <button
            onClick={onOpenNewTicket}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/10 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ HERE4U Ticket</span>
          </button>

          {/* New Branch Project Button */}
          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>+ Build-Up Project</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Sub-Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {navItems.map((tab) => {
            const isActive = systemMode === tab.mode;
            return (
              <button
                key={tab.mode}
                onClick={() => setSystemMode(tab.mode)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-lg font-medium text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
