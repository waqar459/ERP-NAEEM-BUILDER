import React, { useState } from 'react';
import {
  Shield,
  Users,
  Building2,
  BookOpen,
  Sliders,
  Database,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Lock,
  DollarSign,
  Search,
  Filter,
  Check,
  X,
  UserCheck,
  Building,
  CreditCard,
  Percent,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { StaffUser, UserRole, MasterScheduleRateItem, CompanyProfile } from '../../types/erp';

export const AdminPanelView: React.FC = () => {
  const {
    activeRole,
    staffUsers,
    addStaffUser,
    updateStaffUser,
    deleteStaffUser,
    companyProfile,
    updateCompanyProfile,
    masterScheduleRates,
    addMasterRateItem,
    updateMasterRateItem,
    deleteMasterRateItem,
    resetToMasterSeedData,
    exportBackupJson,
    importBackupJson,
    auditLogs,
    tickets,
    projects,
    branches,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'STAFF' | 'UBL_PROFILE' | 'CSR_RATES' | 'APPROVAL_MATRIX' | 'BACKUP_AUDIT'>('STAFF');

  // Staff Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<Omit<StaffUser, 'id' | 'lastActive'>>({
    fullName: '',
    email: '',
    phone: '',
    role: 'Estimator',
    department: 'Estimation & QS',
    canApproveEstimates: false,
    maxApprovalLimit: 50000,
    canIssueInvoices: false,
    canOverrideGps: false,
    status: 'Active',
  });

  // CSR Rate Modal State
  const [isAddRateModalOpen, setIsAddRateModalOpen] = useState(false);
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [rateFilterCategory, setRateFilterCategory] = useState<string>('ALL');
  const [rateSearch, setRateSearch] = useState('');
  const [rateForm, setRateForm] = useState<Omit<MasterScheduleRateItem, 'id'>>({
    itemCode: '',
    category: 'Civil',
    description: '',
    unit: 'Sft',
    baselineInternalRate: 100,
    ublApprovedClientRate: 150,
    standardMarginPercent: 33.3,
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  // Corporate Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<CompanyProfile>(companyProfile);

  // Backup & Reset State
  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  // Handle Download Backup
  const handleExportBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naeem_builder_ubl_erp_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Import Backup
  const handleImportBackup = () => {
    if (!importJsonText.trim()) return;
    const ok = importBackupJson(importJsonText);
    if (ok) {
      setImportStatus('Backup restored successfully!');
      setImportJsonText('');
      setTimeout(() => setImportStatus(null), 4000);
    } else {
      setImportStatus('Error: Invalid JSON format. Please verify the backup file.');
    }
  };

  // Handle Save Staff
  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.fullName.trim()) return;

    if (editingUserId) {
      updateStaffUser(editingUserId, staffForm);
      setEditingUserId(null);
    } else {
      addStaffUser(staffForm);
    }

    setIsAddUserModalOpen(false);
    setStaffForm({
      fullName: '',
      email: '',
      phone: '',
      role: 'Estimator',
      department: 'Estimation & QS',
      canApproveEstimates: false,
      maxApprovalLimit: 50000,
      canIssueInvoices: false,
      canOverrideGps: false,
      status: 'Active',
    });
  };

  // Handle Save Rate
  const handleSaveRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rateForm.itemCode.trim() || !rateForm.description.trim()) return;

    const margin =
      rateForm.ublApprovedClientRate > 0
        ? Number(
            (
              ((rateForm.ublApprovedClientRate - rateForm.baselineInternalRate) /
                rateForm.ublApprovedClientRate) *
              100
            ).toFixed(1)
          )
        : 0;

    const payload = {
      ...rateForm,
      standardMarginPercent: margin,
    };

    if (editingRateId) {
      updateMasterRateItem(editingRateId, payload);
      setEditingRateId(null);
    } else {
      addMasterRateItem(payload);
    }

    setIsAddRateModalOpen(false);
    setRateForm({
      itemCode: '',
      category: 'Civil',
      description: '',
      unit: 'Sft',
      baselineInternalRate: 100,
      ublApprovedClientRate: 150,
      standardMarginPercent: 33.3,
      effectiveDate: new Date().toISOString().split('T')[0],
    });
  };

  // Filtered Master Rates
  const filteredRates = masterScheduleRates.filter((r) => {
    const matchesCat = rateFilterCategory === 'ALL' || r.category === rateFilterCategory;
    const matchesSearch =
      r.itemCode.toLowerCase().includes(rateSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(rateSearch.toLowerCase()) ||
      r.category.toLowerCase().includes(rateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Audit Logs
  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.entityId.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Admin Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none text-indigo-400">
          <Shield className="w-64 h-64" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    System Admin & Governance Panel
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Naeem Builder (UBL Operations)
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Staff RBAC roles, UBL commercial parameters, Master CSR Rate Book, approval thresholds & backup controls.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 text-xs flex items-center gap-3">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Active Role:</span>
                <span className="font-bold text-amber-400">{activeRole}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">UBL Vendor Code:</span>
                <span className="font-mono text-emerald-400 font-bold">{companyProfile.ublVendorCode}</span>
              </div>
            </div>

            <button
              onClick={handleExportBackup}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 shadow-sm transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
          {[
            { id: 'STAFF', label: 'Staff & Roles (RBAC)', icon: Users, badge: staffUsers.length },
            { id: 'UBL_PROFILE', label: 'UBL Commercial Profile', icon: Building2 },
            { id: 'CSR_RATES', label: 'Master Schedule of Rates (CSR)', icon: BookOpen, badge: masterScheduleRates.length },
            { id: 'APPROVAL_MATRIX', label: 'Approval & Authority Matrix', icon: Sliders },
            { id: 'BACKUP_AUDIT', label: 'System Backup & Audit Trail', icon: Database, badge: auditLogs.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: STAFF & RBAC GOVERNANCE */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Staff Members & Role Permissions Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Manage operational team accounts, estimate approval thresholds, invoice authority, and GPS override rights.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingUserId(null);
                setStaffForm({
                  fullName: '',
                  email: '',
                  phone: '',
                  role: 'Estimator',
                  department: 'Quantity Survey',
                  canApproveEstimates: false,
                  maxApprovalLimit: 50000,
                  canIssueInvoices: false,
                  canOverrideGps: false,
                  status: 'Active',
                });
                setIsAddUserModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffUsers.map((user) => (
              <div
                key={user.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{user.fullName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            user.status === 'Active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : user.status === 'On-Site'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <span className="text-xs text-indigo-400 font-medium block mt-0.5">
                        {user.department}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-950 text-slate-400 border border-slate-800">
                      {user.id}
                    </span>
                  </div>

                  {/* Role Badge */}
                  <div className="mb-4">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                      {user.role}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="text-xs space-y-1 text-slate-400 mb-4 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 font-mono">
                    <div>Email: <span className="text-slate-200">{user.email}</span></div>
                    <div>Phone: <span className="text-slate-200">{user.phone}</span></div>
                    <div>Last Active: <span className="text-slate-400">{user.lastActive}</span></div>
                  </div>

                  {/* Permissions Checklist */}
                  <div className="text-[11px] space-y-1.5 border-t border-slate-800 pt-3 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Can Approve Estimates:</span>
                      {user.canApproveEstimates ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Yes (Up to PKR {user.maxApprovalLimit.toLocaleString()})
                        </span>
                      ) : (
                        <span className="text-slate-500">No</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Can Issue Invoices:</span>
                      {user.canIssueInvoices ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Authorized
                        </span>
                      ) : (
                        <span className="text-slate-500">Restricted</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Can Override GPS:</span>
                      {user.canOverrideGps ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-500">Restricted</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingUserId(user.id);
                      setStaffForm({
                        fullName: user.fullName,
                        email: user.email,
                        phone: user.phone,
                        role: user.role,
                        department: user.department,
                        canApproveEstimates: user.canApproveEstimates,
                        maxApprovalLimit: user.maxApprovalLimit,
                        canIssueInvoices: user.canIssueInvoices,
                        canOverrideGps: user.canOverrideGps,
                        status: user.status,
                      });
                      setIsAddUserModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                    title="Edit user"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  {user.id !== 'USR-001' && (
                    <button
                      onClick={() => deleteStaffUser(user.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all text-xs flex items-center gap-1"
                      title="Remove user"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: UBL COMMERCIAL PROFILE */}
      {activeTab === 'UBL_PROFILE' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-400" />
                  Naeem Builder Corporate & UBL Vendor Profile
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Commercial registration, banking for electronic remittances, and tax withholding schedule.
                </p>
              </div>
              <button
                onClick={() => {
                  setProfileForm(companyProfile);
                  setIsEditingProfile(!isEditingProfile);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile Settings'}</span>
              </button>
            </div>

            {isEditingProfile ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateCompanyProfile(profileForm);
                  setIsEditingProfile(false);
                }}
                className="pt-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Company Legal Name:</label>
                    <input
                      type="text"
                      value={profileForm.companyName}
                      onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Principal / CEO Name:</label>
                    <input
                      type="text"
                      value={profileForm.principalName}
                      onChange={(e) => setProfileForm({ ...profileForm, principalName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-emerald-400 block mb-1">UBL Vendor Code:</label>
                    <input
                      type="text"
                      value={profileForm.ublVendorCode}
                      onChange={(e) => setProfileForm({ ...profileForm, ublVendorCode: e.target.value })}
                      className="w-full bg-slate-950 border border-emerald-500/50 rounded-lg p-2.5 text-xs text-emerald-300 font-mono font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">National Tax Number (NTN):</label>
                    <input
                      type="text"
                      value={profileForm.ntn}
                      onChange={(e) => setProfileForm({ ...profileForm, ntn: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Sales Tax Number (STRN):</label>
                    <input
                      type="text"
                      value={profileForm.strn}
                      onChange={(e) => setProfileForm({ ...profileForm, strn: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">PRA Registration No (Punjab):</label>
                    <input
                      type="text"
                      value={profileForm.praRegistrationNo}
                      onChange={(e) => setProfileForm({ ...profileForm, praRegistrationNo: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Remittance Bank Name:</label>
                    <input
                      type="text"
                      value={profileForm.bankName}
                      onChange={(e) => setProfileForm({ ...profileForm, bankName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Bank Account Title:</label>
                    <input
                      type="text"
                      value={profileForm.bankAccountTitle}
                      onChange={(e) => setProfileForm({ ...profileForm, bankAccountTitle: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Bank Account Number:</label>
                    <input
                      type="text"
                      value={profileForm.bankAccountNumber}
                      onChange={(e) => setProfileForm({ ...profileForm, bankAccountNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">IBAN:</label>
                    <input
                      type="text"
                      value={profileForm.iban}
                      onChange={(e) => setProfileForm({ ...profileForm, iban: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Standard PRA GST % (Punjab):</label>
                    <input
                      type="number"
                      value={profileForm.standardPraGstPercent}
                      onChange={(e) => setProfileForm({ ...profileForm, standardPraGstPercent: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Standard SRB GST % (Sindh):</label>
                    <input
                      type="number"
                      value={profileForm.standardSrbGstPercent}
                      onChange={(e) => setProfileForm({ ...profileForm, standardSrbGstPercent: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Head Office Address:</label>
                  <input
                    type="text"
                    value={profileForm.headOfficeAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, headOfficeAddress: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    required
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Card 1: Vendor & Legal */}
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" /> Legal & Registration
                  </div>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Company Name:</span>
                      <span className="text-white font-semibold">{companyProfile.companyName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Principal / Managing Director:</span>
                      <span className="text-amber-400 font-bold">{companyProfile.principalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">UBL Vendor Code:</span>
                      <span className="text-emerald-400 font-mono font-bold">{companyProfile.ublVendorCode}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">National Tax Number (NTN):</span>
                      <span className="text-slate-200 font-mono">{companyProfile.ntn}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">STRN:</span>
                      <span className="text-slate-200 font-mono">{companyProfile.strn}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Banking & Electronic Remittance */}
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> UBL Remittance Bank Account
                  </div>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Bank:</span>
                      <span className="text-white font-semibold">{companyProfile.bankName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Account Title:</span>
                      <span className="text-slate-200 font-medium">{companyProfile.bankAccountTitle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Account Number:</span>
                      <span className="text-amber-400 font-mono font-bold">{companyProfile.bankAccountNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">IBAN:</span>
                      <span className="text-emerald-300 font-mono text-[11px] font-bold">{companyProfile.iban}</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Tax Rates & Withholding */}
                <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="w-4 h-4" /> Provincial Tax Schedules
                  </div>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Punjab PRA Sales Tax:</span>
                      <span className="text-emerald-400 font-bold">{companyProfile.standardPraGstPercent}% (Reg #{companyProfile.praRegistrationNo})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Sindh SRB Sales Tax:</span>
                      <span className="text-emerald-400 font-bold">{companyProfile.standardSrbGstPercent}% (Reg #{companyProfile.srbRegistrationNo})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Services Withholding Tax (WHT):</span>
                      <span className="text-slate-300 font-mono font-semibold">{companyProfile.defaultWhtRateServices}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Goods Supply WHT:</span>
                      <span className="text-slate-300 font-mono font-semibold">{companyProfile.defaultWhtRateGoods}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MASTER SCHEDULE OF RATES (CSR) */}
      {activeTab === 'CSR_RATES' && (
        <div className="space-y-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                UBL Master Schedule of Rates (Composite Schedule of Rates - CSR)
              </h2>
              <p className="text-xs text-slate-400">
                Pre-approved rates catalogue used for rapid estimate generation across Civil, Electrical, HVAC, Plumbing & Aluminium works.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search item or code..."
                  value={rateSearch}
                  onChange={(e) => setRateSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white w-48"
                />
              </div>

              <select
                value={rateFilterCategory}
                onChange={(e) => setRateFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="ALL">All Categories</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Glass & Aluminium">Glass & Aluminium</option>
                <option value="Carpentry">Carpentry</option>
                <option value="IT / Signage">IT / Signage</option>
              </select>

              <button
                onClick={() => {
                  setEditingRateId(null);
                  setRateForm({
                    itemCode: `CIV-0${masterScheduleRates.length + 1}`,
                    category: 'Civil',
                    description: '',
                    unit: 'Sft',
                    baselineInternalRate: 100,
                    ublApprovedClientRate: 150,
                    standardMarginPercent: 33.3,
                    effectiveDate: new Date().toISOString().split('T')[0],
                  });
                  setIsAddRateModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rate Item</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">Unit</th>
                  <th className="p-3 text-right">Internal Baseline</th>
                  <th className="p-3 text-right">UBL Quoted Rate</th>
                  <th className="p-3 text-right">Target Margin</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {rate.itemCode}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-indigo-300">
                        {rate.category}
                      </span>
                    </td>
                    <td className="p-3 max-w-md font-medium text-slate-100">
                      {rate.description}
                    </td>
                    <td className="p-3 font-mono text-slate-400 whitespace-nowrap">
                      {rate.unit}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-300 whitespace-nowrap">
                      PKR {rate.baselineInternalRate.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                      PKR {rate.ublApprovedClientRate.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-cyan-400 whitespace-nowrap">
                      {rate.standardMarginPercent}%
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingRateId(rate.id);
                            setRateForm({
                              itemCode: rate.itemCode,
                              category: rate.category,
                              description: rate.description,
                              unit: rate.unit,
                              baselineInternalRate: rate.baselineInternalRate,
                              ublApprovedClientRate: rate.ublApprovedClientRate,
                              standardMarginPercent: rate.standardMarginPercent,
                              effectiveDate: rate.effectiveDate,
                            });
                            setIsAddRateModalOpen(true);
                          }}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteMasterRateItem(rate.id)}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: APPROVAL & AUTHORITY MATRIX */}
      {activeTab === 'APPROVAL_MATRIX' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                Financial Delegation & Approval Threshold Matrix
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Standard operating thresholds enforced across System 1 maintenance tickets and System 2 build-up projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-slate-950/70 border border-emerald-500/30">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  Tier 1: Operational Maintenance
                </div>
                <div className="text-2xl font-black text-white font-mono mb-2">
                  ≤ PKR 25,000
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Routine minor civil repairs, plumbing fixtures, bulb replacements, and branch emergency fixes.
                </p>
                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Approval Authority:</span>
                    <span className="font-bold text-white">Lead Estimator / QS</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Procurement:</span>
                    <span className="text-emerald-400 font-bold">Direct Petty Cash OK</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Delivery Note:</span>
                    <span className="text-white">BOM Signature Required</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-amber-500/30">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  Tier 2: Major Works & Renovation
                </div>
                <div className="text-2xl font-black text-white font-mono mb-2">
                  PKR 25,001 - 150,000
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  AC compressor overhauls, extensive flooring, glass doors, complete painting, and UPS cabling.
                </p>
                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Approval Authority:</span>
                    <span className="font-bold text-amber-400">Project Manager / Lead Approver</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Procurement:</span>
                    <span className="text-amber-300 font-bold">Formal PO Mandatory</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Site Verification:</span>
                    <span className="text-white">GPS Verified Pre-Inspection</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/70 border border-indigo-500/30">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  Tier 3: Capital Works & Build-Ups
                </div>
                <div className="text-2xl font-black text-white font-mono mb-2">
                  &gt; PKR 150,000
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Full branch renovation, structural retrofits, complete electrical revamps, and RA billing contracts.
                </p>
                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Approval Authority:</span>
                    <span className="font-bold text-indigo-400">Naeem Taj (CEO / Super Admin)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Retention:</span>
                    <span className="text-cyan-400 font-bold">5% - 10% Standard Retention</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Billing Mode:</span>
                    <span className="text-white">Running Account (RA) Certification</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Operational Rules Notice */}
            <div className="bg-slate-950/90 p-5 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Immutable Enterprise Business Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">Rule 1: Exclusive UBL Client Scope</span>
                  Naeem Builder operates solely for United Bank Limited. All tickets, branches, BOQs, and quotations belong exclusively to UBL.
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">Rule 9: Delivery Note Rate Secrecy</span>
                  Internal subcontractor costs, worker wages, and material purchase rates are strictly stripped from all Delivery Notes and BOM sign-offs.
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">Rule 18: Invoicing Lock</span>
                  Invoices remain locked until a Completion & Delivery Note is verified, signed, and branch stamped by the UBL Branch Operations Manager (BOM).
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="font-bold text-slate-200 block mb-1">Rule 22: Branch-First Linking</span>
                  Provisional estimates generated without a ticket number must have an official 6-digit UBL ticket linked before final invoicing and closure.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM BACKUP & AUDIT TRAIL */}
      {activeTab === 'BACKUP_AUDIT' && (
        <div className="space-y-6">
          {/* Backup Utilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Export & Import Box */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Database Snapshot & Portability
              </h3>
              <p className="text-xs text-slate-400">
                Generate a full JSON backup of all {tickets.length} tickets, {projects.length} projects, {branches.length} branches, staff, expenses, and logs.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>Download ERP Backup (.json)</span>
                </button>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  Restore from JSON Backup:
                </label>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Paste JSON backup text here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
                <button
                  onClick={handleImportBackup}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>Restore Snapshot</span>
                </button>
                {importStatus && (
                  <div
                    className={`p-2.5 rounded-lg text-xs font-semibold ${
                      importStatus.startsWith('Error')
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {importStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Master Seed Reset */}
            <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  Master Seed Factory Reset
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reset the local database cache to the authentic UBL master seed dataset (restoring reference branches 0962, 1289, 0541, 0122, 1482, standard tickets, and CSR rates).
                </p>
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Note for Administrator:
                  </div>
                  <div>
                    This clears browser storage and reinstates verified UBL production seed data.
                  </div>
                </div>
              </div>

              {showResetConfirm ? (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2">
                  <p className="text-xs text-rose-300 font-bold">
                    Are you sure you want to reset all data to default UBL master state?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        resetToMasterSeedData();
                        setShowResetConfirm(false);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                    >
                      Yes, Confirm Reset
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-2 w-fit transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset to UBL Master Seed</span>
                </button>
              )}
            </div>
          </div>

          {/* Full Audit Logs */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Full Operational Audit Trail
                </h3>
                <p className="text-xs text-slate-400">
                  Immutable log of all user actions, estimate creations, approvals, invoices, and GPS verifications.
                </p>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter audit logs..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white w-64"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800 font-mono text-xs">
              {filteredLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                      {log.action}
                    </span>
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] whitespace-nowrap self-end sm:self-auto">
                    <span className="text-amber-400 font-sans font-semibold">{log.user}</span>
                    <span>({log.role})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT STAFF */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                {editingUserId ? 'Edit Staff Member' : 'Add New Staff Member'}
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Name:</label>
                <input
                  type="text"
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={staffForm.email}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Phone:</label>
                  <input
                    type="text"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">System Role:</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {[
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
                    ].map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Department:</label>
                  <input
                    type="text"
                    value={staffForm.department}
                    onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Max Estimate Approval Limit (PKR):
                </label>
                <input
                  type="number"
                  value={staffForm.maxApprovalLimit}
                  onChange={(e) => setStaffForm({ ...staffForm, maxApprovalLimit: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffForm.canApproveEstimates}
                    onChange={(e) => setStaffForm({ ...staffForm, canApproveEstimates: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-500"
                  />
                  <span className="text-slate-300">Authorized to Approve Estimates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffForm.canIssueInvoices}
                    onChange={(e) => setStaffForm({ ...staffForm, canIssueInvoices: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-500"
                  />
                  <span className="text-slate-300">Authorized to Unlock & Issue Invoices</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={staffForm.canOverrideGps}
                    onChange={(e) => setStaffForm({ ...staffForm, canOverrideGps: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-500"
                  />
                  <span className="text-slate-300">Authorized to Override GPS Proximity Limits</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {editingUserId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CSR RATE */}
      {isAddRateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                {editingRateId ? 'Edit Schedule Rate Item' : 'Add Master Schedule Rate Item'}
              </h3>
              <button
                onClick={() => setIsAddRateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Item Code (e.g. CIV-05):</label>
                  <input
                    type="text"
                    value={rateForm.itemCode}
                    onChange={(e) => setRateForm({ ...rateForm, itemCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Category:</label>
                  <select
                    value={rateForm.category}
                    onChange={(e) => setRateForm({ ...rateForm, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {['Civil', 'Electrical', 'HVAC', 'Plumbing', 'Carpentry', 'Glass & Aluminium', 'IT / Signage'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Item Description:</label>
                <textarea
                  rows={2}
                  value={rateForm.description}
                  onChange={(e) => setRateForm({ ...rateForm, description: e.target.value })}
                  placeholder="Standard bank specification..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Unit:</label>
                  <input
                    type="text"
                    value={rateForm.unit}
                    onChange={(e) => setRateForm({ ...rateForm, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Internal Cost (PKR):</label>
                  <input
                    type="number"
                    value={rateForm.baselineInternalRate}
                    onChange={(e) => setRateForm({ ...rateForm, baselineInternalRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-400 block mb-1">Client Quoted (PKR):</label>
                  <input
                    type="number"
                    value={rateForm.ublApprovedClientRate}
                    onChange={(e) => setRateForm({ ...rateForm, ublApprovedClientRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-lg p-2.5 text-amber-300 font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-400">Calculated Margin:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {rateForm.ublApprovedClientRate > 0
                    ? `${(((rateForm.ublApprovedClientRate - rateForm.baselineInternalRate) / rateForm.ublApprovedClientRate) * 100).toFixed(1)}%`
                    : '0%'}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  {editingRateId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
