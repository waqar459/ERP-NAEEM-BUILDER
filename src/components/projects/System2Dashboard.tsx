import React, { useState } from 'react';
import {
  Layers,
  Building,
  TrendingUp,
  Receipt,
  FileCheck2,
  Calendar,
  DollarSign,
  Search,
  ChevronRight,
  Shield,
  FolderGit2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  HardHat,
  Camera,
  MapPin,
  Plus,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Project } from '../../types/erp';
import { ProjectStatusProgressBar } from './ProjectStatusProgressBar';
import { calculateProjectBOQStatus } from '../../utils/boqBillingCalculations';
import { DailySiteLogModal } from './DailySiteLogModal';
import { DailySiteLogViewer } from './DailySiteLogViewer';

interface System2DashboardProps {
  onSelectProject: (projectId: string) => void;
  onOpenNewProject: () => void;
}

export const System2Dashboard: React.FC<System2DashboardProps> = ({
  onSelectProject,
  onOpenNewProject,
}) => {
  const { projects, retentionLedger, dailySiteLogs } = useERP();
  const [dashboardTab, setDashboardTab] = useState<'PROJECTS' | 'DAILY_SITE_LOGS'>('PROJECTS');
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [statusStageFilter, setStatusStageFilter] = useState<string>('ALL');

  // KPI Calculations as defined in Section 17 (BRANCH + REGION)
  const activeProjectsCount = projects.filter((p) => p.status !== 'Closed').length;
  const totalContractValue = projects.reduce((sum, p) => sum + p.contractValue, 0);
  const totalBilledValue = projects.reduce((sum, p) => sum + (p.totalBilledAmount || 0), 0);
  const totalReceivedValue = projects.reduce((sum, p) => sum + (p.totalReceivedAmount || 0), 0);
  const totalOutstandingValue = projects.reduce((sum, p) => sum + (p.totalOutstanding || 0), 0);
  const totalRetentionHeld = retentionLedger.reduce((sum, r) => sum + r.balanceAmount, 0);

  // Portfolio-wide BOQ Completion calculation derived from RA Billing records
  const portfolioBOQTotal = projects.reduce((sum, p) => {
    const boqSum = (p.boq || []).reduce((s, it) => s + (it.contractAmount || it.contractQuantity * it.rate), 0);
    return sum + (boqSum > 0 ? boqSum : p.contractValue || 0);
  }, 0);

  const portfolioCertifiedTotal = projects.reduce((sum, p) => {
    const grossBills = (p.raBills || []).reduce((s, b) => s + (b.currentBillGross || 0), 0);
    const grossItems = (p.boq || []).reduce((s, it) => s + ((it.completedQuantity || 0) * it.rate), 0);
    return sum + Math.max(grossBills, grossItems);
  }, 0);

  const portfolioRABillsCount = projects.reduce((sum, p) => sum + (p.raBills?.length || 0), 0);
  const portfolioBOQPercentage = portfolioBOQTotal > 0 
    ? Number(((portfolioCertifiedTotal / portfolioBOQTotal) * 100).toFixed(1)) 
    : 0;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.branchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = regionFilter === 'ALL' || p.region === regionFilter;

    const pStatus = calculateProjectBOQStatus(p);
    let matchesStatus = true;
    if (statusStageFilter === 'NOT_STARTED') {
      matchesStatus = pStatus.boqCompletionPercentage === 0;
    } else if (statusStageFilter === 'IN_PROGRESS') {
      matchesStatus = pStatus.boqCompletionPercentage > 0 && pStatus.boqCompletionPercentage < 75;
    } else if (statusStageFilter === 'ADVANCED') {
      matchesStatus = pStatus.boqCompletionPercentage >= 75 && pStatus.boqCompletionPercentage < 100;
    } else if (statusStageFilter === 'COMPLETED') {
      matchesStatus = pStatus.boqCompletionPercentage >= 100;
    }

    return matchesSearch && matchesRegion && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* System 2 Blueprint Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-slate-950">
              SYSTEM 2
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              BRANCH + REGION: Complete Branch Build-Up & Projects
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Master record: <strong className="text-slate-200">Project</strong>. Region → Branch → Contract → BOQ → Purchasing → Work Execution → Running Bills (RA-01, RA-02, RA-03, Final Bill) → Retention Ledger → Project Close.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all cursor-pointer whitespace-nowrap shadow-md"
          >
            <HardHat className="w-4 h-4" />
            <span>+ Record Daily Site Log</span>
          </button>

          <button
            onClick={onOpenNewProject}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            <FolderGit2 className="w-4 h-4" />
            <span>+ New Branch Build-Up Project</span>
          </button>
        </div>
      </div>

      {/* Section 17 Management Dashboard Metrics (BRANCH + REGION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Active Projects</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{activeProjectsCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Under execution & snagging</p>
        </div>

        {/* Card 2: Contract / Billed / Received Value */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Contract vs Billed</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            PKR {(totalContractValue / 1000000).toFixed(1)}M
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
            <span>Billed: PKR {(totalBilledValue / 1000000).toFixed(1)}M</span>
            <span className="text-emerald-400">Recv: PKR {(totalReceivedValue / 1000000).toFixed(1)}M</span>
          </div>
        </div>

        {/* Card 3: Outstanding / Retention Held */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Outstanding / Retention Held</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">
            PKR {(totalRetentionHeld / 1000).toFixed(0)}k Held
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Unpaid Bills: PKR {(totalOutstandingValue / 1000000).toFixed(2)}M
          </p>
        </div>

        {/* Card 4: Project Progress / Profitability */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Gross Margin (Projects)</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">
            40.6%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct job cost control (Section 16)</p>
        </div>
      </div>

      {/* Portfolio BOQ Completion & RA Billing Execution Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5" />
                Portfolio RA Billing &amp; BOQ Execution
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {portfolioRABillsCount} Total Certified RA Bills across {projects.length} Projects
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Total BOQ Completion: <span className="text-emerald-400 font-mono">{portfolioBOQPercentage}%</span> Across Active Portfolio
            </h3>
            <p className="text-xs text-slate-400 max-w-2xl">
              Calculates real-time BOQ progress directly from certified Running Account (RA) Billing records verified by site consultants.
            </p>

            {/* Portfolio Multi-Tone Progress Bar */}
            <div className="pt-2 max-w-xl">
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700 shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-1000 shadow-sm shadow-emerald-500/30"
                  style={{ width: `${Math.max(2, portfolioBOQPercentage)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-1">
                <span>PKR {(portfolioCertifiedTotal / 1000000).toFixed(2)}M Gross Certified</span>
                <span className="text-slate-500">Total BOQ: PKR {(portfolioBOQTotal / 1000000).toFixed(2)}M</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 self-stretch lg:self-auto justify-around sm:justify-end">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-sans">RA Certified</div>
              <div className="text-sm font-bold text-emerald-400">
                PKR {(portfolioCertifiedTotal / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Contract BOQ</div>
              <div className="text-sm font-bold text-white">
                PKR {(portfolioBOQTotal / 1000000).toFixed(1)}M
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Remaining</div>
              <div className="text-sm font-bold text-amber-400">
                PKR {((portfolioBOQTotal - portfolioCertifiedTotal) / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Projects Portfolio vs. Daily Site Logs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setDashboardTab('PROJECTS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            dashboardTab === 'PROJECTS'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Branch Build-Up Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setDashboardTab('DAILY_SITE_LOGS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            dashboardTab === 'DAILY_SITE_LOGS'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Daily Site Logs & GPS Attendance ({dailySiteLogs.length})</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono font-bold">
            GPS Tagged
          </span>
        </button>
      </div>

      {dashboardTab === 'PROJECTS' ? (
      /* Projects Table & Filters */
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by code, branch, client, PM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Region:</span>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Regions</option>
                <option value="Central">Central (Punjab)</option>
                <option value="Federal">Federal (Islamabad)</option>
                <option value="South">South (Karachi)</option>
                <option value="North">North</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">BOQ Status:</span>
              <select
                value={statusStageFilter}
                onChange={(e) => setStatusStageFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Stages</option>
                <option value="NOT_STARTED">Mobilization (0%)</option>
                <option value="IN_PROGRESS">In Progress (1-74%)</option>
                <option value="ADVANCED">Near Completion (75-99%)</option>
                <option value="COMPLETED">100% Certified</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="py-3 px-4">Project ID</th>
                <th className="py-3 px-4">Project Title & Branch</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4 text-right">Contract Value</th>
                <th className="py-3 px-4 text-left min-w-[200px]">Project Status & BOQ % (RA Billing)</th>
                <th className="py-3 px-4 text-right">Billed (RA Bills)</th>
                <th className="py-3 px-4 text-right">Retention Held</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="hover:bg-slate-850/60 transition-colors cursor-pointer"
                  onClick={() => onSelectProject(project.id)}
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                    {project.projectCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{project.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {project.client} • PM: {project.projectManager}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-medium">
                      {project.region} ({project.city})
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                    PKR {(project.contractValue / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 text-left" onClick={(e) => e.stopPropagation()}>
                    <ProjectStatusProgressBar
                      project={project}
                      mode="compact"
                    />
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                    PKR {(project.totalBilledAmount / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-amber-400">
                    PKR {(project.totalRetentionHeld / 1000).toFixed(0)}k
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      {project.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectProject(project.id)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      View Master & BOQ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      ) : (
        <DailySiteLogViewer onSelectProject={onSelectProject} />
      )}

      {/* Modal to record a daily site log from System 2 dashboard */}
      {isLogModalOpen && (
        <DailySiteLogModal onClose={() => setIsLogModalOpen(false)} />
      )}
    </div>
  );
};
