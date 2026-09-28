import React, { useState, useMemo } from 'react';
import {
  HardHat,
  Calendar,
  Clock,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Thermometer,
  Users,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Printer,
  ExternalLink,
  ShieldCheck,
  X,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  Sparkles,
  Building,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Project, DailySiteLog, SitePhotoWithGPS } from '../../types/erp';
import { DailySiteLogModal } from './DailySiteLogModal';

interface DailySiteLogViewerProps {
  project?: Project;
  onSelectProject?: (projectId: string) => void;
}

export const DailySiteLogViewer: React.FC<DailySiteLogViewerProps> = ({
  project,
  onSelectProject,
}) => {
  const { dailySiteLogs, deleteDailySiteLog, activeRole } = useERP();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherFilter, setWeatherFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<SitePhotoWithGPS | null>(null);

  // Filter logs for this specific project or all projects if not specified
  const filteredLogs = useMemo(() => {
    return dailySiteLogs.filter((log) => {
      const matchesProject = !project || log.projectId === project.id;
      const matchesSearch =
        searchQuery === '' ||
        log.workSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.recordedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.completedTasks.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        log.branchName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesWeather = weatherFilter === 'ALL' || log.weatherCondition.includes(weatherFilter);
      const matchesShift = shiftFilter === 'ALL' || log.shift.includes(shiftFilter);

      return matchesProject && matchesSearch && matchesWeather && matchesShift;
    });
  }, [dailySiteLogs, project, searchQuery, weatherFilter, shiftFilter]);

  // Aggregate Metrics for this view
  const projectLogs = useMemo(() => {
    return project ? dailySiteLogs.filter((l) => l.projectId === project.id) : dailySiteLogs;
  }, [dailySiteLogs, project]);

  const totalLogsCount = projectLogs.length;
  const avgLaborCount = totalLogsCount > 0
    ? Math.round(projectLogs.reduce((sum, l) => sum + l.totalLaborHeadcount, 0) / totalLogsCount)
    : 0;

  const totalPhotosCount = projectLogs.reduce((sum, l) => sum + (l.photos?.length || 0), 0);
  const gpsVerifiedPhotosCount = projectLogs.reduce(
    (sum, l) => sum + (l.photos?.filter((p) => p.gps.isWithinRadius)?.length || 0),
    0
  );
  const gpsComplianceRate = totalPhotosCount > 0
    ? Math.round((gpsVerifiedPhotosCount / totalPhotosCount) * 100)
    : 100;

  // Print Site Report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                System 2 Field Intelligence
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                GPS Location Tagged
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Daily Site Logs & Labor Attendance
            </h2>
            <p className="text-xs text-slate-400">
              {project
                ? `${project.projectCode} • ${project.branchName}`
                : 'Portfolio-wide branch build-up daily progress logs'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Log Report</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Today&apos;s Daily Log</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Site Logs</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-white">
            {totalLogsCount} <span className="text-xs font-normal text-slate-400">shifts</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {projectLogs[0] ? `Latest: ${projectLogs[0].date}` : 'No logs recorded'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg. Daily Labor</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-cyan-300">
            {avgLaborCount} <span className="text-xs font-normal text-slate-400">workers / day</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Standard shift: 8h + approved OT
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>GPS Photos Stamped</span>
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-amber-300">
            {totalPhotosCount} <span className="text-xs font-normal text-slate-400">images</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Stamped with device lat/long & distance
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>GPS Site Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-extrabold text-emerald-400">
            {gpsComplianceRate}%
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>All within 200m perimeter</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search work narrative, tasks, materials, or engineer..."
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-white text-xs focus:border-emerald-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={weatherFilter}
            onChange={(e) => setWeatherFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:border-emerald-400 focus:outline-none"
          >
            <option value="ALL">All Weather</option>
            <option value="Sunny">☀️ Sunny</option>
            <option value="Cloudy">⛅ Cloudy</option>
            <option value="Rainy">🌧️ Rainy</option>
            <option value="Heat">🔥 Heat</option>
          </select>

          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs focus:border-emerald-400 focus:outline-none"
          >
            <option value="ALL">All Shifts</option>
            <option value="Day Shift">Day Shift</option>
            <option value="Night Shift">Night Shift</option>
            <option value="Overtime">Overtime</option>
          </select>
        </div>
      </div>

      {/* Log Cards List */}
      {filteredLogs.length === 0 ? (
        <div className="p-12 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <HardHat className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">No Daily Site Logs found matching criteria.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
          >
            + Record First Daily Site Log
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => {
            return (
              <div
                key={log.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:border-slate-700 transition-all"
              >
                {/* Log Header */}
                <div className="p-4 sm:p-5 bg-slate-950/60 border-b border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-xs text-center min-w-[54px]">
                      <span className="block text-[10px] text-slate-400 uppercase font-sans">Date</span>
                      {log.date.slice(5)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">
                          {log.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                          {log.shift}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'Verified by PM' || log.status === 'Consultant Approved'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white mt-0.5">
                        {log.projectTitle}
                      </h3>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        <span>{log.branchName}</span>
                        <span>•</span>
                        <span>Recorded by: <strong>{log.recordedBy}</strong> ({log.recordedRole})</span>
                      </div>
                    </div>
                  </div>

                  {/* Weather Pill & GPS Badge */}
                  <div className="flex items-center gap-2 self-stretch md:self-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                      <span className="text-sm">
                        {log.weatherCondition.includes('Sunny')
                          ? '☀️'
                          : log.weatherCondition.includes('Rainy')
                          ? '🌧️'
                          : log.weatherCondition.includes('Cloudy')
                          ? '⛅'
                          : '🌪️'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1 font-mono font-bold text-white">
                          <span>{log.temperatureCelsius}°C</span>
                          {log.humidityPercent && (
                            <span className="text-[10px] text-cyan-400">({log.humidityPercent}%)</span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-none">
                          {log.weatherWorkImpact}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-[11px] font-mono text-emerald-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{log.submissionGps.distanceToBranchMeters}m</span>
                    </div>

                    {activeRole === 'Super Admin' && (
                      <button
                        onClick={() => deleteDailySiteLog(log.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete log entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Log Content Body */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* 1. Labor Count Grid / Breakdown */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Labor Attendance Headcount:
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                          {log.totalLaborHeadcount} Workers Total ({log.totalManHours} Man-Hours)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {log.laborBreakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs font-mono"
                        >
                          <span className="text-slate-300 font-sans font-medium">{item.trade}:</span>
                          <span className="font-bold text-emerald-400">{item.headcount}</span>
                          {item.overtimeHours > 0 && (
                            <span className="text-[10px] text-amber-400 font-bold">
                              +{item.overtimeHours}h OT
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Narrative & Tasks */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <p className="text-xs text-slate-200 leading-relaxed">
                      <strong className="text-white">Shift Summary: </strong>
                      {log.workSummary}
                    </p>

                    {log.completedTasks && log.completedTasks.length > 0 && (
                      <div className="space-y-1 pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Milestones Accomplished Today:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {log.completedTasks.map((task, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.materialsReceived && log.materialsReceived.length > 0 && (
                      <div className="pt-1 border-t border-slate-800/80 text-xs text-slate-300">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Material Deliveries:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {log.materialsReceived.map((m, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                            >
                              📦 {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {log.weatherNotes && (
                      <div className="text-[11px] text-slate-400 italic">
                        Weather Note: {log.weatherNotes}
                      </div>
                    )}
                  </div>

                  {/* 3. Site Progress Photos with GPS Location Tagging */}
                  {log.photos && log.photos.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-400">
                          <Camera className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Progress Photos ({log.photos.length}) — GPS Geo-Tagged</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Click image to view high-res GPS coordinates & verification
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {log.photos.map((photo) => (
                          <div
                            key={photo.id}
                            onClick={() => setSelectedPhoto(photo)}
                            className="group relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all shadow-md"
                          >
                            <img
                              src={photo.url}
                              alt={photo.caption}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            {/* Top GPS Tag Badge */}
                            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{photo.gps.latitude.toFixed(4)}°N, {photo.gps.longitude.toFixed(4)}°E</span>
                            </div>

                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-300 font-semibold">
                              {photo.gps.distanceToBranchMeters}m
                            </div>

                            {/* Bottom Caption */}
                            <div className="absolute bottom-2 left-2 right-2 text-white text-[11px]">
                              <p className="font-medium truncate drop-shadow">{photo.caption}</p>
                              <div className="flex items-center justify-between text-[10px] text-slate-300 mt-0.5 font-mono">
                                <span>{photo.tradeCategory}</span>
                                <span className="text-emerald-400 font-bold">Verified</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Create Daily Site Log */}
      {isCreateModalOpen && (
        <DailySiteLogModal
          projectId={project?.id}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {/* MODAL 2: Photo Lightbox with GPS Metadata Details */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden max-w-4xl w-full flex flex-col max-h-[92vh] shadow-2xl">
            {/* Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
                  GPS Verified Site Photo
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  On-Site ({selectedPhoto.gps.distanceToBranchMeters}m from Branch)
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image display */}
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden max-h-[60vh]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Metadata Footer */}
            <div className="p-4 sm:p-5 bg-slate-950 space-y-3">
              <div>
                <h4 className="text-sm font-bold text-white">{selectedPhoto.caption}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Trade Category: <strong className="text-slate-200">{selectedPhoto.tradeCategory}</strong> • Captured: <span className="font-mono text-slate-300">{selectedPhoto.timestamp}</span>
                </p>
              </div>

              {/* GPS Stamp Readout */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Latitude</span>
                  <span className="text-white font-bold">{selectedPhoto.gps.latitude.toFixed(6)}° N</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Longitude</span>
                  <span className="text-white font-bold">{selectedPhoto.gps.longitude.toFixed(6)}° E</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
                  <span className="text-emerald-400 font-bold">±{selectedPhoto.gps.accuracyMeters}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Branch Distance</span>
                  <span className="text-cyan-400 font-bold">{selectedPhoto.gps.distanceToBranchMeters} meters</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPhoto.gps.latitude},${selectedPhoto.gps.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Coordinates in Google Maps</span>
                </a>

                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
