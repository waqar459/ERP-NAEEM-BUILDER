import React, { useState } from 'react';
import {
  Building,
  MapPin,
  User,
  Phone,
  Search,
  Filter,
  Layers,
  Clock,
  CheckCircle2,
  Tag,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { BranchMaster, Ticket } from '../../types/erp';
import { NewTicketModal } from '../here4u/NewTicketModal';

interface BranchMasterViewProps {
  onSelectTicket?: (ticketId: string) => void;
}

export const BranchMasterView: React.FC<BranchMasterViewProps> = ({ onSelectTicket }) => {
  const { branches, tickets, projects, getBranchWorksSummary } = useERP();
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [worksFilter, setWorksFilter] = useState<'ALL' | 'MULTI_WORKS' | 'PENDING_ESTIMATES'>('ALL');
  const [expandedBranchId, setExpandedBranchId] = useState<string | null>(null);

  // Modal for quick estimate creation for a specific branch
  const [estimateModalBranchId, setEstimateModalBranchId] = useState<string | null>(null);

  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.city.toLowerCase().includes(search.toLowerCase()) ||
      b.completeAddress.toLowerCase().includes(search.toLowerCase()) ||
      b.bomName.toLowerCase().includes(search.toLowerCase());

    const matchesRegion = regionFilter === 'ALL' || b.region === regionFilter;

    const summary = getBranchWorksSummary(b.id);
    const matchesWorksFilter =
      worksFilter === 'ALL' ||
      (worksFilter === 'MULTI_WORKS' && summary.hasMultipleWorks) ||
      (worksFilter === 'PENDING_ESTIMATES' && summary.provisionalEstimates.length > 0);

    return matchesSearch && matchesRegion && matchesWorksFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-slate-950">
              SECTION 5
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              UNITED BANK LIMITED ONLY
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              UBL Branch Master Directory
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Permanent register of all UBL branches with Branch Codes, verified GPS coordinates for proximity audit (&lt;200m), BOM contacts, and historical timeline of all works, single/multiple tickets, and branch-first estimates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px]">Total UBL Branches:</span>
            <span className="font-mono text-cyan-400 font-bold text-base">{branches.length}</span>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search branches by UBL code (0962, 0640, 2174...), name, address, BOM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Work Activity Filter */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setWorksFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-all ${
                worksFilter === 'ALL' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Branches
            </button>
            <button
              onClick={() => setWorksFilter('MULTI_WORKS')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-all ${
                worksFilter === 'MULTI_WORKS' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Branches that generate different works in different times"
            >
              Multiple Works
            </button>
            <button
              onClick={() => setWorksFilter('PENDING_ESTIMATES')}
              className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-all ${
                worksFilter === 'PENDING_ESTIMATES' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Branches with estimates awaiting ticket numbers"
            >
              Ticket Pending
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Region:</span>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Regions</option>
              <option value="Central">Central (Punjab)</option>
              <option value="Federal">Federal (Islamabad)</option>
              <option value="South">South (Sindh/Karachi)</option>
              <option value="North">North (KPK/Peshawar)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches.map((branch) => {
          const summary = getBranchWorksSummary(branch.id);
          const isExpanded = expandedBranchId === branch.id;
          const totalWorksCount = summary.tickets.length + summary.provisionalEstimates.length + summary.projects.length;

          return (
            <div
              key={branch.id}
              className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 transition-all shadow-md flex flex-col justify-between ${
                summary.provisionalEstimates.length > 0
                  ? 'border-cyan-500/40 bg-gradient-to-b from-slate-900 to-cyan-950/20'
                  : summary.hasMultipleWorks
                  ? 'border-amber-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Code: {branch.code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {branch.branchType}
                      </span>
                      {summary.hasMultipleWorks && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                          <Layers className="w-2.5 h-2.5" />
                          <span>{totalWorksCount} Works</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mt-1.5">{branch.name}</h3>
                    <div className="text-xs text-slate-400">{branch.city} • {branch.region} Region</div>
                  </div>
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                </div>

                {/* Address & BOM Info */}
                <div className="space-y-2 text-xs border-t border-b border-slate-800/80 py-3 my-3">
                  <div className="text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Registered Branch Address:</span>
                    <span className="text-slate-200 leading-snug">{branch.completeAddress}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>BOM: <strong className="text-white">{branch.bomName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{branch.bomContact}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                    <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>GPS Target: {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)} (&lt;200m rule)</span>
                  </div>
                </div>

                {/* Works Summary Numbers */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                  <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Tickets</div>
                    <div className="font-mono font-bold text-amber-400 text-sm">{summary.tickets.length}</div>
                  </div>
                  <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Pending #</div>
                    <div className="font-mono font-bold text-cyan-400 text-sm">{summary.provisionalEstimates.length}</div>
                  </div>
                  <div className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px]">Projects</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm">{summary.projects.length}</div>
                  </div>
                </div>

                {/* Expanded Branch Works History Drawer */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-300 flex items-center justify-between pb-1 border-b border-slate-800">
                      <span>Works Timeline for Branch {branch.code}:</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Different works logged at different times
                      </span>
                    </div>

                    {totalWorksCount === 0 ? (
                      <p className="text-slate-500 text-[11px] py-1">No works logged yet for this branch.</p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {/* Provisional Estimates */}
                        {summary.provisionalEstimates.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onSelectTicket && onSelectTicket(t.id)}
                            className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between cursor-pointer hover:bg-cyan-950/50"
                          >
                            <div>
                              <div className="font-semibold text-cyan-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                <span>{t.title}</span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                Ref: {t.provisionalEstimateCode || t.id} • {t.category}
                              </div>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-200 font-bold whitespace-nowrap">
                              Ticket # Pending
                            </span>
                          </div>
                        ))}

                        {/* Official Tickets */}
                        {summary.tickets.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => onSelectTicket && onSelectTicket(t.id)}
                            className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-850"
                          >
                            <div>
                              <div className="font-semibold text-slate-200 flex items-center gap-1">
                                <Tag className="w-3 h-3 text-amber-400" />
                                <span>{t.title}</span>
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                Ticket #{t.ticketNumber} • {t.reportedDate}
                              </div>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-bold whitespace-nowrap">
                              {t.status}
                            </span>
                          </div>
                        ))}

                        {/* Projects */}
                        {summary.projects.map((p) => (
                          <div
                            key={p.id}
                            className="p-2 rounded bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-semibold text-emerald-300">{p.title}</div>
                              <div className="text-[10px] font-mono text-slate-400">{p.projectCode}</div>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-200 font-bold whitespace-nowrap">
                              Project
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setExpandedBranchId(isExpanded ? null : branch.id)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Works' : `View Works (${totalWorksCount})`}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => setEstimateModalBranchId(branch.id)}
                  className="py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                  title="Create new estimate for this branch code (ticket generated afterward)"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>+ Estimate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Estimate Modal triggered for specific branch */}
      {estimateModalBranchId && (
        <NewTicketModal
          isOpen={true}
          onClose={() => setEstimateModalBranchId(null)}
          onTicketCreated={(tId) => {
            setEstimateModalBranchId(null);
            if (onSelectTicket) onSelectTicket(tId);
          }}
          initialMode="BRANCH_FIRST_ESTIMATE"
          preSelectedBranchId={estimateModalBranchId}
        />
      )}
    </div>
  );
};
