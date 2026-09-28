import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SystemMode,
  UserRole,
  BranchMaster,
  Ticket,
  Project,
  WorkerExpense,
  GPSEvent,
  RetentionLedgerEntry,
  IncomeTaxConfig,
  AuditLogEntry,
  RABill,
  RABillItemCertified,
  CompletionDeliveryNote,
  InvoiceRecord,
  PaymentReceipt,
  CostControlOverview,
  DailySiteLog,
  EstimateItem,
  EstimateRecord,
  OfficialComplaintType,
  TicketPriority,
  StaffUser,
  CompanyProfile,
  MasterScheduleRateItem,
  ConsolidatedInvoiceRecord,
  TicketDossierStatus,
  WorkOrderRecord,
  GmailMessage,
} from '../types/erp';
import {
  INITIAL_BRANCHES,
  INITIAL_TICKETS,
  INITIAL_PROJECTS,
  INITIAL_RETENTION_LEDGER,
  INITIAL_EXPENSES,
  INITIAL_GPS_EVENTS,
  DEFAULT_INCOME_TAX_CONFIG,
  INITIAL_AUDIT_LOGS,
  INITIAL_DAILY_SITE_LOGS,
  INITIAL_CONSOLIDATED_INVOICES,
} from '../data/mockData';
import {
  DEFAULT_STAFF_USERS,
  DEFAULT_COMPANY_PROFILE,
  DEFAULT_MASTER_SCHEDULE_RATES,
} from '../data/adminSeedData';

// Haversine distance calculator for GPS proximity (Section 8)
export function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface ERPContextType {
  systemMode: SystemMode;
  setSystemMode: (mode: SystemMode) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  branches: BranchMaster[];
  tickets: Ticket[];
  projects: Project[];
  retentionLedger: RetentionLedgerEntry[];
  expenses: WorkerExpense[];
  gpsEvents: GPSEvent[];
  taxConfig: IncomeTaxConfig;
  auditLogs: AuditLogEntry[];
  
  // Navigation & selection
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;

  // Actions
  addAuditLog: (action: string, entityType: AuditLogEntry['entityType'], entityId: string, details: string) => void;
  createTicket: (ticket: Partial<Ticket>) => Ticket;
  updateTicket: (ticketId: string, updater: (prev: Ticket) => Ticket) => void;
  advanceTicketStatus: (ticketId: string) => void;

  // UBL Branch-First Estimation & Ticket Assignment Workflow
  createBranchEstimate: (params: {
    branchCode: string;
    branchId?: string;
    branchName?: string;
    branchAddress?: string;
    title: string;
    category?: 'Civil' | 'Electrical' | 'HVAC' | 'Plumbing' | 'Glass & Aluminium' | 'IT & Signage';
    scopeDescription?: string;
    items?: EstimateItem[];
    createdBy?: string;
    priority?: TicketPriority;
    complaintType?: OfficialComplaintType;
  }) => Ticket;
  assignOfficialTicketNumber: (ticketId: string, officialTicketNumber: string) => void;
  addEstimateItem: (ticketId: string, item: Omit<EstimateItem, 'id'>) => void;
  removeEstimateItem: (ticketId: string, itemId: string) => void;
  getBranchWorksSummary: (branchCodeOrId: string) => {
    branch?: BranchMaster;
    tickets: Ticket[];
    provisionalEstimates: Ticket[];
    projects: Project[];
    hasMultipleWorks: boolean;
  };
  
  // System 1 Specific Crucial Automations
  generateCompletionNote: (ticketId: string) => void;
  signAndVerifyCompletionNote: (ticketId: string, signedBy: string, designation: string, signatureData?: string) => void;
  uploadSignedCompletionCopy: (
    ticketId: string,
    params: {
      signedBy: string;
      designation: string;
      fileName: string;
      fileUrl?: string;
    }
  ) => void;
  assignWorkToStaff: (
    ticketId: string,
    params: {
      trade: string;
      staffName: string;
      staffPhone: string;
      instructions?: string;
    }
  ) => void;
  sendSignedCompletionToGmail: (
    ticketId: string,
    params?: {
      customBody?: string;
      attachments?: Array<{ name: string; size: string; type: 'pdf' | 'image' }>;
    }
  ) => { success: boolean; message: string };
  depositHardCopyToOffice: (
    ticketId: string,
    params: {
      receivedBy: string;
      receivedDate: string;
      boxOrCabinetRef?: string;
      notes?: string;
    }
  ) => void;
  updateCompletionHardCopyDispatch: (
    ticketId: string,
    dispatch: {
      hardCopySentToOffice: boolean;
      hardCopyDispatchedDate?: string;
      hardCopyCourierOrRider?: string;
      hardCopyTrackingRef?: string;
      hardCopyReceivedAtOffice?: boolean;
      hardCopyReceivedDate?: string;
      hardCopyReceivedBy?: string;
    }
  ) => void;
  unlockAndCreateInvoice: (ticketId: string) => { success: boolean; message: string; invoice?: InvoiceRecord };
  recordPaymentReceipt: (invoiceId: string, receipt: Omit<PaymentReceipt, 'id'>) => void;
  
  // HERE4U Consolidated Invoices (Batched under Rs. 500,000 threshold for UBL Accounts Office)
  consolidatedInvoices: ConsolidatedInvoiceRecord[];
  createConsolidatedInvoice: (ticketIds: string[], notes?: string) => ConsolidatedInvoiceRecord;
  depositConsolidatedInvoice: (consolidatedId: string, notes?: string) => void;
  recordConsolidatedOnlinePayment: (consolidatedId: string, onlineRef: string, datePaid: string, taxChallanRef?: string) => void;
  updateTicketDossierStatus: (ticketId: string, checklist: Partial<TicketDossierStatus>) => void;

  // System 2 Specific Crucial Automations (Tender Projects & Physical Work Orders - NOT on Gmail)
  createProject: (project: Partial<Project>) => Project;
  updateProject: (projectId: string, updater: (prev: Project) => Project) => void;
  issuePhysicalWorkOrder: (projectId: string, woNumber: string, woDate: string, issuingAuthority: string, notes?: string) => void;
  generateRABill: (projectId: string, itemsCertified: { boqItemId: string; currentCertifiedQty: number }[], advanceDeductionPercent?: number, retentionPercent?: number) => RABill | null;
  releaseRetentionAmount: (retentionId: string, releaseAmount: number, notes: string, bankRef: string) => void;

  // Field & Expenses
  addWorkerExpense: (expense: Omit<WorkerExpense, 'id'>) => void;
  approveExpense: (expenseId: string, approvedAmount?: number) => void;
  recordGPSEvent: (event: Omit<GPSEvent, 'id'>) => GPSEvent;

  // Branch Master
  addBranch: (branch: Omit<BranchMaster, 'id'>) => void;
  updateBranch: (branchId: string, partial: Partial<BranchMaster>) => void;

  // Daily Site Logs (System 2)
  dailySiteLogs: DailySiteLog[];
  addDailySiteLog: (log: Omit<DailySiteLog, 'id'>) => DailySiteLog;
  deleteDailySiteLog: (logId: string) => void;

  // Financial & Tax Config
  updateTaxConfig: (config: Partial<IncomeTaxConfig>) => void;
  getOverallFinancialOverview: () => CostControlOverview;

  // Admin Panel, Staff, Master Rates & System Utilities
  staffUsers: StaffUser[];
  companyProfile: CompanyProfile;
  masterScheduleRates: MasterScheduleRateItem[];
  addStaffUser: (user: Omit<StaffUser, 'id' | 'lastActive'> & { lastActive?: string }) => void;
  updateStaffUser: (userId: string, partial: Partial<StaffUser>) => void;
  deleteStaffUser: (userId: string) => void;
  updateCompanyProfile: (partial: Partial<CompanyProfile>) => void;
  addMasterRateItem: (item: Omit<MasterScheduleRateItem, 'id'>) => void;
  updateMasterRateItem: (id: string, partial: Partial<MasterScheduleRateItem>) => void;
  deleteMasterRateItem: (id: string) => void;
  resetToMasterSeedData: () => void;
  exportBackupJson: () => string;
  importBackupJson: (jsonStr: string) => boolean;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [systemMode, setSystemMode] = useState<SystemMode>('SYSTEM_1_HERE4U');
  const [activeRole, setActiveRole] = useState<UserRole>('Super Admin');

  // Load from localStorage or mock with UBL v3 cache key for clean data
  const [branches, setBranches] = useState<BranchMaster[]>(() => {
    const saved = localStorage.getItem('nb_erp_branches_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_BRANCHES;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('nb_erp_tickets_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('nb_erp_projects_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [retentionLedger, setRetentionLedger] = useState<RetentionLedgerEntry[]>(() => {
    const saved = localStorage.getItem('nb_erp_retention_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_RETENTION_LEDGER;
  });

  const [expenses, setExpenses] = useState<WorkerExpense[]>(() => {
    const saved = localStorage.getItem('nb_erp_expenses_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [gpsEvents, setGpsEvents] = useState<GPSEvent[]>(() => {
    const saved = localStorage.getItem('nb_erp_gps_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_GPS_EVENTS;
  });

  const [taxConfig, setTaxConfig] = useState<IncomeTaxConfig>(() => {
    const saved = localStorage.getItem('nb_erp_tax_config_ubl_v3');
    return saved ? JSON.parse(saved) : DEFAULT_INCOME_TAX_CONFIG;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem('nb_erp_audit_logs_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [dailySiteLogs, setDailySiteLogs] = useState<DailySiteLog[]>(() => {
    const saved = localStorage.getItem('nb_erp_daily_site_logs_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_SITE_LOGS;
  });

  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(() => {
    const saved = localStorage.getItem('nb_erp_staff_users_ubl_v3');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF_USERS;
  });

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('nb_erp_company_profile_ubl_v3');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY_PROFILE;
  });

  const [consolidatedInvoices, setConsolidatedInvoices] = useState<ConsolidatedInvoiceRecord[]>(() => {
    const saved = localStorage.getItem('nb_erp_consolidated_invoices_ubl_v3');
    return saved ? JSON.parse(saved) : INITIAL_CONSOLIDATED_INVOICES;
  });

  const [masterScheduleRates, setMasterScheduleRates] = useState<MasterScheduleRateItem[]>(() => {
    const saved = localStorage.getItem('nb_erp_master_rates_ubl_v3');
    return saved ? JSON.parse(saved) : DEFAULT_MASTER_SCHEDULE_RATES;
  });

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('nb_erp_branches_ubl_v3', JSON.stringify(branches));
  }, [branches]);

  useEffect(() => {
    localStorage.setItem('nb_erp_tickets_ubl_v3', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('nb_erp_projects_ubl_v3', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('nb_erp_retention_ubl_v3', JSON.stringify(retentionLedger));
  }, [retentionLedger]);

  useEffect(() => {
    localStorage.setItem('nb_erp_expenses_ubl_v3', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('nb_erp_gps_ubl_v3', JSON.stringify(gpsEvents));
  }, [gpsEvents]);

  useEffect(() => {
    localStorage.setItem('nb_erp_tax_config_ubl_v3', JSON.stringify(taxConfig));
  }, [taxConfig]);

  useEffect(() => {
    localStorage.setItem('nb_erp_audit_logs_ubl_v3', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('nb_erp_daily_site_logs_ubl_v3', JSON.stringify(dailySiteLogs));
  }, [dailySiteLogs]);

  useEffect(() => {
    localStorage.setItem('nb_erp_staff_users_ubl_v3', JSON.stringify(staffUsers));
  }, [staffUsers]);

  useEffect(() => {
    localStorage.setItem('nb_erp_company_profile_ubl_v3', JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem('nb_erp_consolidated_invoices_ubl_v3', JSON.stringify(consolidatedInvoices));
  }, [consolidatedInvoices]);

  useEffect(() => {
    localStorage.setItem('nb_erp_master_rates_ubl_v3', JSON.stringify(masterScheduleRates));
  }, [masterScheduleRates]);

  // Audit logger
  const addAuditLog = (action: string, entityType: AuditLogEntry['entityType'], entityId: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: `${activeRole} Operator`,
      role: activeRole,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Ticket CRUD & Workflow Engine
  const createTicket = (ticketData: Partial<Ticket>): Ticket => {
    const isProvisional = ticketData.ticketNumberStatus === 'PROVISIONAL_PENDING' || ticketData.ticketNumber === 'PENDING';
    const ticketNum = isProvisional
      ? 'PENDING'
      : (ticketData.ticketNumber || `H4U-2026-${Math.floor(1000 + Math.random() * 9000)}`);

    const matchingBranch = branches.find(
      (b) => b.id === ticketData.branchId || (ticketData.ublBranchCode && b.code === ticketData.ublBranchCode)
    ) || branches[0];

    const branchCode = ticketData.ublBranchCode || matchingBranch?.code || '0962';
    const branchName = ticketData.branchName || matchingBranch?.name || 'UBL Main Branch';
    const branchAddress = ticketData.branchAddress || matchingBranch?.completeAddress || '';
    const provisionalCode = isProvisional
      ? (ticketData.provisionalEstimateCode || `PEST-UBL-${branchCode}-${Date.now().toString().slice(-4)}`)
      : undefined;

    const newTicket: Ticket = {
      id: ticketData.id || `TCK-${Date.now()}`,
      ticketNumber: ticketNum,
      ticketNumberStatus: isProvisional ? 'PROVISIONAL_PENDING' : 'ASSIGNED',
      ublBranchCode: branchCode,
      branchAddress,
      provisionalEstimateCode: provisionalCode,
      title: ticketData.title || `Work Request for UBL Branch ${branchCode}`,
      client: 'United Bank Limited',
      branchId: matchingBranch?.id || ticketData.branchId || 'BR-UBL-0962',
      branchName,
      city: ticketData.city || matchingBranch?.city || 'Lahore',
      region: ticketData.region || matchingBranch?.region || 'Central',
      category: ticketData.category || 'Civil',
      complaintType: ticketData.complaintType || 'Paint/ Tile / Seepage / Front Elevation - - -',
      priority: ticketData.priority || 'Emergency',
      status: ticketData.status || (isProvisional ? 'Internal Estimate Prepared' : 'New / Open'),
      reportedDate: ticketData.reportedDate || new Date().toLocaleString(),
      reportedBy: ticketData.reportedBy || (matchingBranch ? `${matchingBranch.bomName} (BOM)` : 'UBL Operations'),
      reportedByContact: ticketData.reportedByContact || matchingBranch?.bomContact || '0300-0000000',
      scopeDescription: ticketData.scopeDescription || '',
      emailSource: ticketData.emailSource,
      bankComplaintDetails: ticketData.bankComplaintDetails || (ticketNum !== 'PENDING' ? {
        complaintNumber: ticketNum,
        issueDetails: ticketData.scopeDescription || ticketData.title || 'Branch maintenance request',
        status: 'New',
        complaintType: ticketData.complaintType || 'Paint/ Tile / Seepage / Front Elevation - - -',
        complaintDate: new Date().toLocaleString(),
        loggedBy: ticketData.reportedBy || 'UBL HERE4U Desk',
        vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
        vendorContact: '0370-5908566',
        branchCode,
        branchName,
        bom: matchingBranch?.bomName || 'Branch Manager',
        branchContactNumber: matchingBranch?.bomContact || '0300-0000000',
        branchAddress,
      } : undefined),
      estimates: ticketData.estimates || [],
      purchaseOrders: [],
      directPurchasingCost: 0,
      directLabourCost: 0,
      directFuelKmCost: 0,
      directWorkerExpenses: 0,
      emergencyExpenses: 0,
      totalDirectCost: 0,
      netRevenue: 0,
      grossProfit: 0,
      grossMarginPercent: 0,
    };

    setTickets((prev) => [newTicket, ...prev]);
    addAuditLog('CREATE_TICKET', 'Ticket', newTicket.ticketNumber, `Ticket logged for ${newTicket.branchName}: ${newTicket.title}`);
    return newTicket;
  };

  // Create an estimate directly by UBL Branch Code (Section 6 & User workflow)
  // Decoupled from strict TicketID dependency when ticket number is generated afterward by UBL
  const createBranchEstimate = (params: {
    branchCode: string;
    branchId?: string;
    branchName?: string;
    branchAddress?: string;
    title: string;
    category?: 'Civil' | 'Electrical' | 'HVAC' | 'Plumbing' | 'Glass & Aluminium' | 'IT & Signage';
    scopeDescription?: string;
    items?: EstimateItem[];
    createdBy?: string;
    priority?: TicketPriority;
    complaintType?: OfficialComplaintType;
  }): Ticket => {
    const matchingBranch = branches.find(
      (b) => b.code.toLowerCase() === params.branchCode.toLowerCase() || b.id === params.branchId
    );
    const branchCode = matchingBranch?.code || params.branchCode;
    const branchName = matchingBranch?.name || params.branchName || `UBL Branch ${branchCode}`;
    const branchAddress = matchingBranch?.completeAddress || params.branchAddress || 'UBL Branch Registered Address';
    const branchId = matchingBranch?.id || params.branchId || `BR-UBL-${branchCode}`;
    const city = matchingBranch?.city || 'Lahore';
    const region = matchingBranch?.region || 'Central';

    const provisionalEstimateCode = `PEST-UBL-${branchCode}-${Date.now().toString().slice(-4)}`;
    const category = params.category || 'Civil';
    const complaintType = params.complaintType || 'Paint/ Tile / Seepage / Front Elevation - - -';
    const priority = params.priority || 'Emergency';

    const items: EstimateItem[] = params.items && params.items.length > 0
      ? params.items
      : [
          {
            id: `ITM-${Date.now()}-1`,
            itemCode: `${category.slice(0, 3).toUpperCase()}-EST-01`,
            description: params.scopeDescription || params.title || `Maintenance works at UBL Branch ${branchCode}`,
            category,
            unit: 'Job',
            quantity: 1,
            internalRate: 18000,
            internalAmount: 18000,
            clientRate: 25000,
            clientAmount: 25000,
          },
        ];

    const directMaterialCost = items.reduce((acc, i) => acc + (i.internalAmount || 0) * 0.7, 0);
    const directLabourCost = items.reduce((acc, i) => acc + (i.internalAmount || 0) * 0.3, 0);
    const totalDirectCost = items.reduce((acc, i) => acc + (i.internalAmount || 0), 0);
    const quotedAmountBeforeTax = items.reduce((acc, i) => acc + (i.clientAmount || 0), 0);
    const taxRatePercent = 16;
    const taxAmount = Math.round((quotedAmountBeforeTax * taxRatePercent) / 100);
    const totalEstimatedAmount = quotedAmountBeforeTax + taxAmount;
    const targetGrossMarginPercent = quotedAmountBeforeTax > 0
      ? Number((((quotedAmountBeforeTax - totalDirectCost) / quotedAmountBeforeTax) * 100).toFixed(1))
      : 25.0;

    const newEstimate: EstimateRecord = {
      id: `EST-${branchCode}-${Date.now().toString().slice(-4)}`,
      ticketId: `TCK-PROV-${branchCode}-${Date.now().toString().slice(-4)}`,
      version: 1,
      createdAt: new Date().toLocaleString(),
      createdBy: params.createdBy || 'Naeem Taj (Estimator)',
      isBranchCodeEstimate: true,
      branchCode,
      branchName,
      branchAddress,
      provisionalEstimateNumber: provisionalEstimateCode,
      items,
      directMaterialCost,
      directLabourCost,
      directSubcontractCost: 0,
      allocatedOverhead: Math.round(totalDirectCost * 0.05),
      totalDirectCost,
      quotedAmountBeforeTax,
      taxPercent: taxRatePercent,
      taxAmount,
      totalEstimatedAmount,
      targetGrossMarginPercent,
    };

    const newTicket: Ticket = {
      id: newEstimate.ticketId,
      ticketNumber: 'PENDING',
      ticketNumberStatus: 'PROVISIONAL_PENDING',
      ublBranchCode: branchCode,
      branchAddress,
      provisionalEstimateCode,
      title: params.title || `Work Estimate for UBL Branch ${branchCode}`,
      client: 'United Bank Limited',
      branchId,
      branchName,
      city,
      region,
      category,
      complaintType,
      priority,
      status: 'Internal Estimate Prepared',
      reportedDate: new Date().toLocaleString(),
      reportedBy: matchingBranch?.bomName ? `${matchingBranch.bomName} (BOM)` : 'UBL Branch Operations',
      reportedByContact: matchingBranch?.bomContact || '0300-0000000',
      scopeDescription: params.scopeDescription || `Estimate prepared strictly according to UBL Branch Code ${branchCode}. Ticket number to be linked once generated by UBL HERE4U portal.`,
      estimates: [newEstimate],
      purchaseOrders: [],
      directPurchasingCost: 0,
      directLabourCost: 0,
      directFuelKmCost: 0,
      directWorkerExpenses: 0,
      emergencyExpenses: 0,
      totalDirectCost,
      netRevenue: quotedAmountBeforeTax,
      grossProfit: quotedAmountBeforeTax - totalDirectCost,
      grossMarginPercent: targetGrossMarginPercent,
      quotation: {
        id: `QUO-${branchCode}-${Date.now().toString().slice(-4)}`,
        quotationNumber: `NB-QUO-UBL-${branchCode}-P1`,
        ticketId: newEstimate.ticketId,
        dateSent: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        items: items.map((i) => ({
          id: i.id,
          itemCode: i.itemCode,
          description: i.description,
          category: i.category,
          unit: i.unit,
          quantity: i.quantity,
          clientRate: i.clientRate,
          clientAmount: i.clientAmount,
        })),
        subtotal: quotedAmountBeforeTax,
        gstRate: 16,
        gstAmount: taxAmount,
        totalAmount: totalEstimatedAmount,
        terms: 'Quotation generated on basis of UBL Branch Code per bank engineering protocol. Official ticket number to be linked upon receipt from UBL HERE4U portal. Work to commence upon approval from UBL Competent Authority. Payment terms: Within 30 days of completion certificate signed & branch stamped by BOM.',
        status: 'Sent',
      },
    };

    setTickets((prev) => [newTicket, ...prev]);
    addAuditLog(
      'CREATE_BRANCH_ESTIMATE',
      'Ticket',
      provisionalEstimateCode,
      `Provisional Estimate created for UBL Branch ${branchCode} (${branchName}): ${newTicket.title}. Quoted: PKR ${totalEstimatedAmount.toLocaleString()}`
    );
    return newTicket;
  };

  // Assign official ticket number to a branch estimate when UBL generates it afterward
  const assignOfficialTicketNumber = (ticketId: string, officialTicketNumber: string) => {
    const cleanNum = officialTicketNumber.trim();
    if (!cleanNum) return;

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated: Ticket = {
            ...t,
            ticketNumber: cleanNum,
            ticketNumberStatus: 'ASSIGNED',
            bankComplaintDetails: t.bankComplaintDetails
              ? {
                  ...t.bankComplaintDetails,
                  complaintNumber: cleanNum,
                }
              : {
                  complaintNumber: cleanNum,
                  issueDetails: t.scopeDescription,
                  status: 'Assigned',
                  complaintType: t.complaintType || 'Paint/ Tile / Seepage / Front Elevation - - -',
                  complaintDate: t.reportedDate,
                  loggedBy: 'UBL HERE4U Portal',
                  vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
                  vendorContact: '0370-5908566',
                  branchCode: t.ublBranchCode || '0962',
                  branchName: t.branchName,
                  bom: t.reportedBy,
                  branchContactNumber: t.reportedByContact,
                  branchAddress: t.branchAddress || '',
                },
          };

          if (updated.quotation) {
            updated.quotation = {
              ...updated.quotation,
              quotationNumber: `NB-QUO-2026-${cleanNum}`,
            };
          }

          return updated;
        }
        return t;
      })
    );

    addAuditLog(
      'ASSIGN_TICKET_NUMBER',
      'Ticket',
      cleanNum,
      `Official UBL Ticket #${cleanNum} linked to Branch-first estimate (ID: ${ticketId})`
    );
  };

  // Add line item to estimate
  const addEstimateItem = (ticketId: string, item: Omit<EstimateItem, 'id'>) => {
    updateTicket(ticketId, (prev) => {
      const activeEst = prev.estimates[0];
      if (!activeEst) return prev;

      const newItem: EstimateItem = {
        ...item,
        id: `ITM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        internalAmount: item.internalAmount ?? ((item.internalRate || 0) * item.quantity),
        clientAmount: item.clientAmount ?? ((item.clientRate || 0) * item.quantity),
      };

      const updatedItems = [...activeEst.items, newItem];
      const totalDirectCost = updatedItems.reduce((acc, i) => acc + (i.internalAmount || 0), 0);
      const quotedAmountBeforeTax = updatedItems.reduce((acc, i) => acc + (i.clientAmount || 0), 0);
      const taxRatePercent = activeEst.taxPercent || 16;
      const taxAmount = Math.round((quotedAmountBeforeTax * taxRatePercent) / 100);
      const totalEstimatedAmount = quotedAmountBeforeTax + taxAmount;
      const targetGrossMarginPercent = quotedAmountBeforeTax > 0
        ? Number((((quotedAmountBeforeTax - totalDirectCost) / quotedAmountBeforeTax) * 100).toFixed(1))
        : 25.0;

      const updatedEstimate: EstimateRecord = {
        ...activeEst,
        items: updatedItems,
        totalDirectCost,
        quotedAmountBeforeTax,
        taxAmount,
        totalEstimatedAmount,
        targetGrossMarginPercent,
      };

      return {
        ...prev,
        estimates: [updatedEstimate, ...prev.estimates.slice(1)],
        totalDirectCost,
        netRevenue: quotedAmountBeforeTax,
        grossProfit: quotedAmountBeforeTax - totalDirectCost,
        grossMarginPercent: targetGrossMarginPercent,
      };
    });
  };

  // Remove line item from estimate
  const removeEstimateItem = (ticketId: string, itemId: string) => {
    updateTicket(ticketId, (prev) => {
      const activeEst = prev.estimates[0];
      if (!activeEst) return prev;

      const updatedItems = activeEst.items.filter((i) => i.id !== itemId);
      const totalDirectCost = updatedItems.reduce((acc, i) => acc + (i.internalAmount || 0), 0);
      const quotedAmountBeforeTax = updatedItems.reduce((acc, i) => acc + (i.clientAmount || 0), 0);
      const taxRatePercent = activeEst.taxPercent || 16;
      const taxAmount = Math.round((quotedAmountBeforeTax * taxRatePercent) / 100);
      const totalEstimatedAmount = quotedAmountBeforeTax + taxAmount;
      const targetGrossMarginPercent = quotedAmountBeforeTax > 0
        ? Number((((quotedAmountBeforeTax - totalDirectCost) / quotedAmountBeforeTax) * 100).toFixed(1))
        : 25.0;

      const updatedEstimate: EstimateRecord = {
        ...activeEst,
        items: updatedItems,
        totalDirectCost,
        quotedAmountBeforeTax,
        taxAmount,
        totalEstimatedAmount,
        targetGrossMarginPercent,
      };

      return {
        ...prev,
        estimates: [updatedEstimate, ...prev.estimates.slice(1)],
        totalDirectCost,
        netRevenue: quotedAmountBeforeTax,
        grossProfit: quotedAmountBeforeTax - totalDirectCost,
        grossMarginPercent: targetGrossMarginPercent,
      };
    });
  };

  // Query all works/tickets/projects for a given UBL branch
  const getBranchWorksSummary = (branchCodeOrId: string) => {
    const branch = branches.find(
      (b) => b.code.toLowerCase() === branchCodeOrId.toLowerCase() || b.id === branchCodeOrId
    );
    const branchCode = branch?.code || branchCodeOrId;
    const branchId = branch?.id || branchCodeOrId;

    const branchTickets = tickets.filter(
      (t) =>
        t.branchId === branchId ||
        (t.ublBranchCode && t.ublBranchCode.toLowerCase() === branchCode.toLowerCase())
    );

    const officialTickets = branchTickets.filter((t) => t.ticketNumberStatus !== 'PROVISIONAL_PENDING' && t.ticketNumber !== 'PENDING');
    const provisionalEstimates = branchTickets.filter((t) => t.ticketNumberStatus === 'PROVISIONAL_PENDING' || t.ticketNumber === 'PENDING');
    const branchProjects = projects.filter((p) => p.branchId === branchId);

    return {
      branch,
      tickets: officialTickets,
      provisionalEstimates,
      projects: branchProjects,
      hasMultipleWorks: branchTickets.length + branchProjects.length > 1,
    };
  };

  const updateTicket = (ticketId: string, updater: (prev: Ticket) => Ticket) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const updated = updater(t);
          return updated;
        }
        return t;
      })
    );
  };

  // Advance ticket along System 1 (HERE4U) Workflow (Section 2)
  const advanceTicketStatus = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    let nextStatus: Ticket['status'] = ticket.status;
    switch (ticket.status) {
      case 'New / Open':
        nextStatus = 'Site Visit Scheduled';
        break;
      case 'Site Visit Scheduled':
        nextStatus = 'Job Verified';
        break;
      case 'Job Verified':
        nextStatus = 'Internal Estimate Prepared';
        break;
      case 'Internal Estimate Prepared':
        nextStatus = 'Quotation Sent';
        break;
      case 'Quotation Sent':
        nextStatus = 'Financial Approval Pending';
        break;
      case 'Financial Approval Pending':
        nextStatus = 'Approved';
        break;
      case 'Approved':
        nextStatus = 'Purchasing in Progress';
        break;
      case 'Purchasing in Progress':
        nextStatus = 'Material Received';
        break;
      case 'Material Received':
        nextStatus = 'Work Order Issued';
        break;
      case 'Work Order Issued':
        nextStatus = 'Work In Progress';
        break;
      case 'Work In Progress':
        // Move to completion note generation
        generateCompletionNote(ticketId);
        return;
      case 'Completion Note Generated':
        // Must be signed and stamped to become Completion Verified
        nextStatus = 'Completion Verified';
        break;
      case 'Completion Verified':
        unlockAndCreateInvoice(ticketId);
        return;
      case 'Invoiced':
        nextStatus = 'Payment Received';
        break;
      case 'Payment Received':
        nextStatus = 'GST Filed';
        break;
      case 'GST Filed':
        nextStatus = 'Closed';
        break;
      default:
        break;
    }

    updateTicket(ticketId, (prev) => ({ ...prev, status: nextStatus }));
    addAuditLog('STATUS_CHANGE', 'Ticket', ticket.ticketNumber, `Advanced status to ${nextStatus}`);
  };

  // CRITICAL RULE 9 & 10: Completion / Delivery Note
  // SHOW: document/date/client/ticket/project/branch/address, Item/Work Description, Quantity, Unit, Received By, Delivered By.
  // DO NOT SHOW: rate, amount, subtotal, tax, grand total or financial approval value!
  // Delivered By automatically pulls the Primary Work Executor from the Work Order!
  const generateCompletionNote = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    // Get Primary Work Executor from Work Order
    const primaryExecutor = ticket.workOrder?.primaryWorkExecutor || 'Muhammad Rashid (Lead Field Engineer)';
    const executorContact = ticket.workOrder?.executorContact || '+92 312 9876543';

    // Get items from active estimate or work order - strictly omitting rates and amounts
    const items = (ticket.estimates[0]?.items || [
      { id: '1', itemCode: 'WRK-01', description: ticket.scopeDescription || 'Repair and maintenance work complete', category: ticket.category, unit: 'Job', quantity: 1 }
    ]).map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unit: i.unit,
    }));

    const branch = branches.find((b) => b.id === ticket.branchId);

    const completionNote: CompletionDeliveryNote = {
      id: `CDN-${Date.now()}`,
      docNumber: `CDN-2026-${ticket.ticketNumber.replace('H4U-2026-', '')}`,
      ticketId: ticket.id,
      date: new Date().toISOString().split('T')[0],
      clientName: ticket.client,
      branchName: ticket.branchName,
      branchAddress: branch?.completeAddress || 'Branch Site Premises',
      items,
      deliveredBy: primaryExecutor, // RULE 10: automatically pulled from Work Order!
      deliveredByDesignation: `Primary Work Executor (${executorContact})`,
      deliveredBySignature: `Delivered by: ${primaryExecutor}`,
      receivedBy: branch?.bomName || 'Branch Operations Manager',
      receivedByDesignation: 'Branch Operations Manager (BOM)',
      branchStampUploaded: false,
      signedCopyUploaded: false,
      completionVerified: false,
    };

    updateTicket(ticketId, (prev) => ({
      ...prev,
      status: 'Completion Note Generated',
      completionNote,
    }));

    addAuditLog(
      'GENERATE_DELIVERY_NOTE',
      'DeliveryNote',
      completionNote.docNumber,
      `Delivery note generated for ${ticket.ticketNumber}. Delivered By: ${primaryExecutor}. Financial rates strictly suppressed per Rule 9.`
    );
  };

  // Rule 11 & 12: Branch sign + stamp supports completion verification -> unlocks invoice
  const signAndVerifyCompletionNote = (
    ticketId: string,
    signedBy: string,
    designation: string,
    signatureData?: string
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !ticket.completionNote) return;

    const updatedNote: CompletionDeliveryNote = {
      ...ticket.completionNote,
      receivedBy: signedBy,
      receivedByDesignation: designation,
      receivedBySignature: signatureData || `Signed by ${signedBy}`,
      branchStampUploaded: true,
      branchStampUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><circle cx="60" cy="60" r="50" stroke="%231e3a8a" stroke-width="3" fill="none"/><text x="60" y="55" font-size="10" text-anchor="middle" fill="%231e3a8a">BRANCH VERIFIED</text><text x="60" y="70" font-size="9" text-anchor="middle" fill="%231e3a8a">OFFICIAL STAMP</text></svg>',
      signedCopyUploaded: true,
      completionVerified: true,
      verificationDate: new Date().toISOString().split('T')[0],
      verifiedBy: `${signedBy} (${designation})`,
    };

    updateTicket(ticketId, (prev) => ({
      ...prev,
      status: 'Completion Verified',
      completionNote: updatedNote,
    }));

    addAuditLog(
      'VERIFY_COMPLETION',
      'DeliveryNote',
      updatedNote.docNumber,
      `Branch sign & official stamp verified by ${signedBy}. Completion verified. Invoice unlocked per Rule 12.`
    );
  };

  // Upload signed & stamped branch completion note (scan / photo)
  const uploadSignedCompletionCopy = (
    ticketId: string,
    params: {
      signedBy: string;
      designation: string;
      fileName: string;
      fileUrl?: string;
    }
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !ticket.completionNote) return;

    const defaultStamp =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><circle cx="70" cy="70" r="62" stroke="%231e3a8a" stroke-width="4" stroke-dasharray="6,2" fill="%23eff6ff"/><circle cx="70" cy="70" r="48" stroke="%231e3a8a" stroke-width="1.5" fill="none"/><text x="70" y="52" font-size="9" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%231e3a8a">UNITED BANK LIMITED</text><text x="70" y="68" font-size="10" font-family="sans-serif" font-weight="900" text-anchor="middle" fill="%231e3a8a">BRANCH VERIFIED</text><text x="70" y="82" font-size="8" font-family="monospace" text-anchor="middle" fill="%231e3a8a">BRANCH CODE: ' + (ticket.ublBranchCode || '0962') + '</text><text x="70" y="96" font-size="8" font-family="sans-serif" text-anchor="middle" fill="%231e3a8a">SIGNED &amp; STAMPED</text></svg>';

    const updatedNote: CompletionDeliveryNote = {
      ...ticket.completionNote,
      receivedBy: params.signedBy,
      receivedByDesignation: params.designation,
      receivedBySignature: `Signed by: ${params.signedBy}`,
      signedCopyUploaded: true,
      branchStampUploaded: true,
      signedCopyFileName: params.fileName,
      signedCopyUrl: params.fileUrl || defaultStamp,
      signedCopyUploadedAt: new Date().toISOString(),
      completionVerified: true,
      verificationDate: new Date().toISOString().split('T')[0],
      verifiedBy: `${params.signedBy} (${params.designation})`,
    };

    updateTicket(ticketId, (prev) => ({
      ...prev,
      status: prev.status === 'Completion Note Generated' ? 'Completion Verified' : prev.status,
      completionNote: updatedNote,
      dossierStatus: {
        hasTicketRiseHardCopy: prev.dossierStatus?.hasTicketRiseHardCopy ?? true,
        hasGmailApprovalHardCopy: prev.dossierStatus?.hasGmailApprovalHardCopy ?? true,
        hasBranchSignedStampedCert: true,
        hasIndividualInvoice: prev.dossierStatus?.hasIndividualInvoice ?? true,
        isComplete:
          (prev.dossierStatus?.hasTicketRiseHardCopy ?? true) &&
          (prev.dossierStatus?.hasGmailApprovalHardCopy ?? true) &&
          true &&
          (prev.dossierStatus?.hasIndividualInvoice ?? true),
      },
    }));

    addAuditLog(
      'UPLOAD_SIGNED_CERTIFICATE',
      'DeliveryNote',
      updatedNote.docNumber,
      `Physical signed & stamped completion note uploaded (${params.fileName}) by concern branch BOM: ${params.signedBy}. Completion verified.`
    );
  };

  // Assign work to specific trade staff (Electrician, Painter, HVAC, etc.)
  const assignWorkToStaff = (
    ticketId: string,
    params: {
      trade: string;
      staffName: string;
      staffPhone: string;
      instructions?: string;
    }
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const formattedExecutor = `${params.staffName} (${params.trade})`;

    updateTicket(ticketId, (prev) => {
      const updatedWorkOrder: WorkOrderRecord = prev.workOrder
        ? {
            ...prev.workOrder,
            primaryWorkExecutor: formattedExecutor,
            executorContact: params.staffPhone,
            assignedTrade: params.trade,
            safetyInstructions: params.instructions || prev.workOrder.safetyInstructions,
            status: 'Started',
          }
        : {
            id: `WO-${Date.now()}`,
            workOrderNumber: `WO-2026-${prev.ticketNumber.replace(/\D/g, '') || '01'}`,
            ticketId: prev.id,
            issuedDate: new Date().toISOString().split('T')[0],
            scheduledStart: new Date().toISOString().replace('T', ' ').substring(0, 16),
            scheduledEnd: new Date(Date.now() + 2 * 86400000).toISOString().replace('T', ' ').substring(0, 16),
            primaryWorkExecutor: formattedExecutor,
            executorContact: params.staffPhone,
            assignedTrade: params.trade,
            assignedCrew: [formattedExecutor],
            scopeSummary: prev.scopeDescription || prev.title,
            safetyInstructions: params.instructions || 'Standard banking PPE & safety guidelines apply.',
            status: 'Started',
          };

      // Also synchronize with Completion / Delivery Note per Rule 10
      const updatedCompletionNote: CompletionDeliveryNote | undefined = prev.completionNote
        ? {
            ...prev.completionNote,
            deliveredBy: formattedExecutor,
            deliveredByDesignation: `${params.trade} (${params.staffPhone})`,
            assignedTrade: params.trade,
          }
        : undefined;

      return {
        ...prev,
        workOrder: updatedWorkOrder,
        completionNote: updatedCompletionNote,
        status: prev.status === 'Approved' ? 'Work Order Issued' : prev.status,
      };
    });

    addAuditLog(
      'ASSIGN_WORK_STAFF',
      'Ticket',
      ticket.ticketNumber,
      `Work assigned to ${params.trade} staff: ${params.staffName} (${params.staffPhone}). Delivery Note Delivered By updated per Rule 10.`
    );
  };

  // Send signed & stamped delivery note scan/copy to UBL Gmail Thread
  const sendSignedCompletionToGmail = (
    ticketId: string,
    params?: {
      customBody?: string;
      attachments?: Array<{ name: string; size: string; type: 'pdf' | 'image' }>;
    }
  ): { success: boolean; message: string } => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found' };

    const branchCode = ticket.ublBranchCode || '0962';
    const bomName = ticket.completionNote?.receivedBy || ticket.reportedBy || 'Branch Operations Manager (BOM)';
    const executorName = ticket.workOrder?.primaryWorkExecutor || ticket.completionNote?.deliveredBy || 'Field Engineering Staff';

    const defaultBody = `Dear UBL HERE4U Desk,\n\nPlease be informed that the approved maintenance works for Ticket #${ticket.ticketNumber} at UBL ${ticket.branchName} (Branch Code: ${branchCode}) have been successfully executed and completed on site by our technician (${executorName}).\n\nThe physical Delivery Note / Completion Certificate has been inspected, signed, and stamped with the official branch round stamp by the Branch Operations Manager (BOM) ${bomName}.\n\nPlease find attached the verified copy for your records, system closure, and clearance.\n\nRegards,\nNaeem Builder\n0347-6066666\nnaeembuilder48@gmail.com`;

    const signedFileName = ticket.completionNote?.signedCopyFileName || `Branch_${branchCode}_Signed_Stamped_Delivery_Note.pdf`;

    const outboundMsg: GmailMessage = {
      id: `msg-signed-dn-${Date.now()}`,
      senderName: 'Naeem Builder',
      senderEmail: 'naeembuilder48@gmail.com',
      senderRole: 'Operations & Execution',
      recipientEmails: ['here4u@ubl.com.pk', 'hamaz.aftab@ubl.com.pk', 'anum.shahid@ubl.com.pk'],
      date: new Date().toLocaleString(),
      subject: `Re: Ticket No :${ticket.ticketNumber} - Work Completed & Branch Signed Delivery Note Attached (${ticket.branchName})`,
      body: params?.customBody || defaultBody,
      isNaeemBuilderOutbound: true,
      attachments: params?.attachments || [
        {
          name: signedFileName,
          size: '385 KB',
          type: 'pdf',
        },
      ],
    };

    updateTicket(ticketId, (prev) => {
      const existingThread = prev.gmailThread || [];
      const updatedNote: CompletionDeliveryNote = prev.completionNote
        ? {
            ...prev.completionNote,
            signedCopySentToGmail: true,
            signedCopySentToGmailDate: new Date().toISOString(),
          }
        : {
            id: `CDN-${Date.now()}`,
            docNumber: `CDN-2026-${prev.ticketNumber.replace(/\D/g, '')}`,
            ticketId: prev.id,
            date: new Date().toISOString().split('T')[0],
            clientName: prev.client,
            branchName: prev.branchName,
            branchAddress: prev.branchAddress || 'Branch Site Premises',
            items: (prev.estimates[0]?.items || []).map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unit: i.unit,
            })),
            deliveredBy: executorName,
            deliveredByDesignation: 'Primary Work Executor',
            receivedBy: bomName,
            receivedByDesignation: 'Branch Operations Manager (BOM)',
            branchStampUploaded: true,
            signedCopyUploaded: true,
            completionVerified: true,
            signedCopySentToGmail: true,
            signedCopySentToGmailDate: new Date().toISOString(),
          };

      return {
        ...prev,
        gmailThread: [...existingThread, outboundMsg],
        completionNote: updatedNote,
        status: prev.status === 'Completion Note Generated' ? 'Completion Verified' : prev.status,
      };
    });

    addAuditLog(
      'SEND_SIGNED_NOTE_GMAIL',
      'Ticket',
      ticket.ticketNumber,
      `Signed & stamped delivery note image dispatched to UBL Gmail Thread for Ticket #${ticket.ticketNumber}.`
    );

    return {
      success: true,
      message: 'Signed & stamped delivery note copy sent to UBL Gmail Thread successfully.',
    };
  };

  // Deposit hard copy into Lahore Head Office for Accounts Process
  const depositHardCopyToOffice = (
    ticketId: string,
    params: {
      receivedBy: string;
      receivedDate: string;
      boxOrCabinetRef?: string;
      notes?: string;
    }
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    updateTicket(ticketId, (prev) => {
      const updatedNote: CompletionDeliveryNote = prev.completionNote
        ? {
            ...prev.completionNote,
            hardCopySentToOffice: true,
            hardCopyReceivedAtOffice: true,
            hardCopyReceivedDate: params.receivedDate,
            hardCopyReceivedBy: params.receivedBy,
            officeDepositRef: params.boxOrCabinetRef,
            officeDepositNotes: params.notes,
          }
        : {
            id: `CDN-${Date.now()}`,
            docNumber: `CDN-2026-${prev.ticketNumber.replace(/\D/g, '')}`,
            ticketId: prev.id,
            date: new Date().toISOString().split('T')[0],
            clientName: prev.client,
            branchName: prev.branchName,
            branchAddress: prev.branchAddress || 'Branch Site Premises',
            items: (prev.estimates[0]?.items || []).map((i) => ({
              description: i.description,
              quantity: i.quantity,
              unit: i.unit,
            })),
            deliveredBy: prev.workOrder?.primaryWorkExecutor || 'Field Staff',
            deliveredByDesignation: 'Primary Work Executor',
            receivedBy: 'Branch Operations Manager',
            receivedByDesignation: 'Branch Operations Manager (BOM)',
            branchStampUploaded: true,
            signedCopyUploaded: true,
            completionVerified: true,
            hardCopySentToOffice: true,
            hardCopyReceivedAtOffice: true,
            hardCopyReceivedDate: params.receivedDate,
            hardCopyReceivedBy: params.receivedBy,
            officeDepositRef: params.boxOrCabinetRef,
            officeDepositNotes: params.notes,
          };

      return {
        ...prev,
        completionNote: updatedNote,
        dossierStatus: {
          hasTicketRiseHardCopy: prev.dossierStatus?.hasTicketRiseHardCopy ?? true,
          hasGmailApprovalHardCopy: prev.dossierStatus?.hasGmailApprovalHardCopy ?? true,
          hasBranchSignedStampedCert: true,
          hasIndividualInvoice: prev.dossierStatus?.hasIndividualInvoice ?? true,
          isComplete:
            (prev.dossierStatus?.hasTicketRiseHardCopy ?? true) &&
            (prev.dossierStatus?.hasGmailApprovalHardCopy ?? true) &&
            true &&
            (prev.dossierStatus?.hasIndividualInvoice ?? true),
        },
      };
    });

    addAuditLog(
      'DEPOSIT_HARD_COPY_OFFICE',
      'DeliveryNote',
      ticket.ticketNumber,
      `Physical hard copy deposited into Lahore Head Office Accounts by ${params.receivedBy}. Box Ref: ${params.boxOrCabinetRef || 'Cabinet Accounts'}. 4-Part Dossier Item #3 complete.`
    );
  };

  // Hard copy dispatch to Head Office (for 4-Part Dossier assembling)
  const updateCompletionHardCopyDispatch = (
    ticketId: string,
    dispatch: {
      hardCopySentToOffice: boolean;
      hardCopyDispatchedDate?: string;
      hardCopyCourierOrRider?: string;
      hardCopyTrackingRef?: string;
      hardCopyReceivedAtOffice?: boolean;
      hardCopyReceivedDate?: string;
      hardCopyReceivedBy?: string;
    }
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket || !ticket.completionNote) return;

    const updatedNote: CompletionDeliveryNote = {
      ...ticket.completionNote,
      hardCopySentToOffice: dispatch.hardCopySentToOffice,
      hardCopyDispatchedDate: dispatch.hardCopyDispatchedDate,
      hardCopyCourierOrRider: dispatch.hardCopyCourierOrRider,
      hardCopyTrackingRef: dispatch.hardCopyTrackingRef,
      hardCopyReceivedAtOffice: dispatch.hardCopyReceivedAtOffice,
      hardCopyReceivedDate: dispatch.hardCopyReceivedDate,
      hardCopyReceivedBy: dispatch.hardCopyReceivedBy,
    };

    updateTicket(ticketId, (prev) => ({
      ...prev,
      completionNote: updatedNote,
      dossierStatus: {
        hasTicketRiseHardCopy: prev.dossierStatus?.hasTicketRiseHardCopy ?? true,
        hasGmailApprovalHardCopy: prev.dossierStatus?.hasGmailApprovalHardCopy ?? true,
        hasBranchSignedStampedCert: dispatch.hardCopyReceivedAtOffice ? true : prev.dossierStatus?.hasBranchSignedStampedCert ?? true,
        hasIndividualInvoice: prev.dossierStatus?.hasIndividualInvoice ?? true,
        isComplete:
          (prev.dossierStatus?.hasTicketRiseHardCopy ?? true) &&
          (prev.dossierStatus?.hasGmailApprovalHardCopy ?? true) &&
          (dispatch.hardCopyReceivedAtOffice ? true : prev.dossierStatus?.hasBranchSignedStampedCert ?? true) &&
          (prev.dossierStatus?.hasIndividualInvoice ?? true),
      },
    }));

    addAuditLog(
      'DISPATCH_HARD_COPY',
      'DeliveryNote',
      updatedNote.docNumber,
      dispatch.hardCopyReceivedAtOffice
        ? `Hard copy received at Head Office Accounts by ${dispatch.hardCopyReceivedBy || 'Accounts Officer'}. Ready for 4-Part Dossier assembly.`
        : `Physical hard copy dispatched to Head Office via ${dispatch.hardCopyCourierOrRider || 'Rider'}. Ref: ${dispatch.hardCopyTrackingRef || 'N/A'}`
    );
  };

  // Rule 12: Verified completion unlocks invoice!
  const unlockAndCreateInvoice = (ticketId: string): { success: boolean; message: string; invoice?: InvoiceRecord } => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found' };

    // STRICT CHECK: Rule 12: Verified completion unlocks invoice!
    if (!ticket.completionNote || !ticket.completionNote.completionVerified) {
      return {
        success: false,
        message: 'RULE 12 VIOLATION: Cannot generate invoice. Work Completion must be signed and stamped by the Branch Operations Manager (BOM) first.',
      };
    }

    const est = ticket.estimates[0];
    const subtotal = est ? est.quotedAmountBeforeTax : 50000;
    const gstRate = est ? est.taxPercent : 16;
    const gstAmount = Math.round((subtotal * gstRate) / 100);
    const total = subtotal + gstAmount;

    const billingItems = est
      ? est.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unit: i.unit,
          rate: i.clientRate || i.internalRate || 0,
          amount: i.clientAmount || ((i.clientRate || 0) * i.quantity),
        }))
      : [{ description: ticket.scopeDescription, quantity: 1, unit: 'Job', rate: subtotal, amount: subtotal }];

    const invoice: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `NB-INV-2026-${ticket.ticketNumber.replace('H4U-2026-', '')}`,
      ticketId: ticket.id,
      dateIssued: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      clientName: ticket.client,
      branchName: ticket.branchName,
      isUnlocked: true,
      billingItems,
      subtotal,
      gstRatePercent: gstRate,
      gstAmount,
      totalInvoiceAmount: total,
      amountPaid: 0,
      totalWithholdingTax: 0,
      totalOtherDeductions: 0,
      outstandingBalance: total,
      paymentStatus: 'Unpaid',
      payments: [],
      gstFilingStatus: 'Pending Filing',
      gstFilingPeriod: `${new Date().toLocaleString('default', { month: 'long' })} 2026`,
    };

    const initialDossier: TicketDossierStatus = {
      hasTicketRiseHardCopy: true,
      hasGmailApprovalHardCopy: !!ticket.approval || !!ticket.emailSource || (ticket.gmailThread && ticket.gmailThread.length > 0) || false,
      hasBranchSignedStampedCert: !!ticket.completionNote?.completionVerified,
      hasIndividualInvoice: true,
      isComplete: !!ticket.completionNote?.completionVerified,
    };

    updateTicket(ticketId, (prev) => ({
      ...prev,
      status: 'Invoiced',
      netRevenue: subtotal,
      invoice,
      dossierStatus: initialDossier,
    }));

    addAuditLog('GENERATE_INVOICE', 'Invoice', invoice.invoiceNumber, `Invoice generated for PKR ${total.toLocaleString()}. Unlocked via verified completion note.`);
    return { success: true, message: 'Invoice successfully generated and unlocked!', invoice };
  };

  // 4-Part Hard Copy Dossier Checklist management
  const updateTicketDossierStatus = (ticketId: string, checklist: Partial<TicketDossierStatus>) => {
    updateTicket(ticketId, (prev) => {
      const current = prev.dossierStatus || {
        hasTicketRiseHardCopy: false,
        hasGmailApprovalHardCopy: false,
        hasBranchSignedStampedCert: false,
        hasIndividualInvoice: !!prev.invoice,
        isComplete: false,
      };
      const updated = { ...current, ...checklist };
      updated.isComplete =
        updated.hasTicketRiseHardCopy &&
        updated.hasGmailApprovalHardCopy &&
        updated.hasBranchSignedStampedCert &&
        updated.hasIndividualInvoice;
      return { ...prev, dossierStatus: updated };
    });
  };

  // Consolidated Invoicing Engine (Batched within Rs. 500,000 threshold for UBL Accounts Office)
  // Operational Tax Rules for HERE4U:
  // 16% PRA Sales Tax + 14% Income Tax (WHT) = 30% Total Deductions, 70% Net transferred online
  // Taxes deposited directly to the government by UBL on behalf of Naeem Builder
  const createConsolidatedInvoice = (ticketIds: string[], notes?: string): ConsolidatedInvoiceRecord => {
    const selectedTickets = tickets.filter((t) => ticketIds.includes(t.id) && t.invoice);
    const totalGrossAmount = selectedTickets.reduce((sum, t) => sum + (t.invoice?.totalInvoiceAmount || 0), 0);

    const salesTaxPraRate = 16;
    const salesTaxPraAmount = Math.round((totalGrossAmount * salesTaxPraRate) / 100);
    const incomeTaxWhtRate = 14;
    const incomeTaxWhtAmount = Math.round((totalGrossAmount * incomeTaxWhtRate) / 100);
    const totalTaxDeductions = salesTaxPraAmount + incomeTaxWhtAmount;
    const netOnlineTransferAmount = totalGrossAmount - totalTaxDeductions;

    const batchIndex = consolidatedInvoices.length + 1;
    const batchNumber = `CON-2026-UBL-${String(batchIndex).padStart(3, '0')}`;

    const newBatch: ConsolidatedInvoiceRecord = {
      id: `CON-${Date.now()}`,
      batchNumber,
      dateCreated: new Date().toISOString().split('T')[0],
      status: 'Draft / Assembling',
      maxLimitThreshold: 500000,
      ticketIds,
      totalGrossAmount,
      salesTaxPraRate,
      salesTaxPraAmount,
      incomeTaxWhtRate,
      incomeTaxWhtAmount,
      totalTaxDeductions,
      netOnlineTransferAmount,
      depositedBy: `${activeRole} (Accounts Team)`,
      accountsOfficeNotes: notes || `Batched ${selectedTickets.length} verified maintenance invoices within Rs. 500,000 threshold for UBL Accounts Office submission.`,
    };

    setConsolidatedInvoices((prev) => [newBatch, ...prev]);

    // Link each ticket to this consolidated batch
    selectedTickets.forEach((t) => {
      updateTicket(t.id, (prev) => ({
        ...prev,
        consolidatedInvoiceId: newBatch.id,
        invoice: prev.invoice ? { ...prev.invoice, consolidatedInvoiceId: newBatch.id } : undefined,
      }));
    });

    addAuditLog(
      'CREATE_CONSOLIDATED_INVOICE',
      'Invoice',
      batchNumber,
      `Created Consolidated Invoice ${batchNumber} with ${selectedTickets.length} invoices totaling PKR ${totalGrossAmount.toLocaleString()} (Threshold: PKR 500,000). Net transfer payable: PKR ${netOnlineTransferAmount.toLocaleString()}`
    );

    return newBatch;
  };

  const depositConsolidatedInvoice = (consolidatedId: string, notes?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setConsolidatedInvoices((prev) =>
      prev.map((c) => {
        if (c.id === consolidatedId) {
          return {
            ...c,
            status: 'Deposited to UBL Accounts Office',
            dateDepositedToAccountsOffice: today,
            accountsOfficeNotes: notes || c.accountsOfficeNotes,
          };
        }
        return c;
      })
    );

    addAuditLog(
      'DEPOSIT_CONSOLIDATED_INVOICE',
      'Invoice',
      consolidatedId,
      'Consolidated invoice deposited to UBL Accounts Office with complete 4-part hard copy dossiers attached.'
    );
  };

  const recordConsolidatedOnlinePayment = (
    consolidatedId: string,
    onlineRef: string,
    datePaid: string,
    taxChallanRef?: string
  ) => {
    const batch = consolidatedInvoices.find((c) => c.id === consolidatedId);
    if (!batch) return;

    const paymentDate = datePaid || new Date().toISOString().split('T')[0];
    const challanRef = taxChallanRef || `PRA-CPR-2026-${Date.now().toString().slice(-7)}`;

    setConsolidatedInvoices((prev) =>
      prev.map((c) => {
        if (c.id === consolidatedId) {
          return {
            ...c,
            status: 'Paid via Online Transfer',
            datePaid: paymentDate,
            bankTransferReference: onlineRef,
            fbrPraTaxChallanProofRef: challanRef,
          };
        }
        return c;
      })
    );

    // Mark all attached tickets and invoices as fully paid with 16% PRA and 14% WHT
    batch.ticketIds.forEach((tid) => {
      const t = tickets.find((x) => x.id === tid);
      if (t && t.invoice) {
        const gross = t.invoice.totalInvoiceAmount;
        const salesTaxDeducted = Math.round(gross * 0.16);
        const whtDeducted = Math.round(gross * 0.14);
        const netTransferred = gross - salesTaxDeducted - whtDeducted;

        const receipt: PaymentReceipt = {
          id: `REC-CON-${Date.now()}-${tid.slice(-4)}`,
          receiptNumber: `REC-UBL-OL-${onlineRef.slice(-6)}`,
          date: paymentDate,
          amount: gross,
          paymentMethod: 'Bank Transfer',
          bankReference: onlineRef,
          withholdingTaxDeducted: whtDeducted,
          otherDeductions: salesTaxDeducted,
          netReceived: netTransferred,
        };

        updateTicket(tid, (prev) => ({
          ...prev,
          status: 'Payment Received',
          invoice: prev.invoice
            ? {
                ...prev.invoice,
                amountPaid: netTransferred,
                totalWithholdingTax: whtDeducted,
                totalOtherDeductions: salesTaxDeducted,
                outstandingBalance: 0,
                paymentStatus: 'Fully Paid',
                payments: [...prev.invoice.payments, receipt],
              }
            : undefined,
        }));
      }
    });

    addAuditLog(
      'RECORD_CONSOLIDATED_PAYMENT',
      'Payment',
      onlineRef,
      `UBL Accounts Office processed online transfer PKR ${batch.netOnlineTransferAmount.toLocaleString()} for ${batch.batchNumber} after 16% Sales Tax (PKR ${batch.salesTaxPraAmount.toLocaleString()}) and 14% Income Tax (PKR ${batch.incomeTaxWhtAmount.toLocaleString()}) deductions. Taxes deposited to Govt by UBL (Ref: ${challanRef}).`
    );
  };

  // Rule 11 & 14: Payment support partial receipts, bank/ref, WHT deductions, GST separate
  const recordPaymentReceipt = (invoiceId: string, receiptData: Omit<PaymentReceipt, 'id'>) => {
    // Find ticket with this invoice
    const ticket = tickets.find((t) => t.invoice?.id === invoiceId);
    if (!ticket || !ticket.invoice) return;

    const newReceipt: PaymentReceipt = {
      ...receiptData,
      id: `REC-${Date.now()}`,
    };

    const inv = ticket.invoice;
    const newPayments = [...inv.payments, newReceipt];
    const totalPaid = newPayments.reduce((sum, p) => sum + p.netReceived, 0);
    const totalWHT = newPayments.reduce((sum, p) => sum + p.withholdingTaxDeducted, 0);
    const totalOther = newPayments.reduce((sum, p) => sum + p.otherDeductions, 0);
    const totalCredited = totalPaid + totalWHT + totalOther;
    const balance = Math.max(0, inv.totalInvoiceAmount - totalCredited);

    const paymentStatus = balance <= 0 ? 'Fully Paid' : totalCredited > 0 ? 'Partially Paid' : 'Unpaid';
    const nextTicketStatus = balance <= 0 ? 'Payment Received' : ticket.status;

    updateTicket(ticket.id, (prev) => ({
      ...prev,
      status: nextTicketStatus,
      invoice: {
        ...inv,
        amountPaid: totalPaid,
        totalWithholdingTax: totalWHT,
        totalOtherDeductions: totalOther,
        outstandingBalance: balance,
        paymentStatus,
        payments: newPayments,
      },
    }));

    addAuditLog(
      'RECORD_PAYMENT',
      'Payment',
      newReceipt.receiptNumber,
      `Received payment PKR ${receiptData.netReceived.toLocaleString()} (WHT PKR ${receiptData.withholdingTaxDeducted.toLocaleString()}). Invoice balance: PKR ${balance.toLocaleString()}`
    );
  };

  // System 2 (Branch + Region Projects) CRUD & RA Bill Engine
  const createProject = (projectData: Partial<Project>): Project => {
    const pCode = `PRJ-${Math.floor(100 + Math.random() * 900)}`;
    const newProject: Project = {
      id: `PRJ-${Date.now()}`,
      projectCode: projectData.projectCode || pCode,
      title: projectData.title || 'New Branch Build-Up',
      client: projectData.client || 'Meezan Bank Limited',
      branchId: projectData.branchId || branches[0]?.id || 'BR-LHR-001',
      branchName: projectData.branchName || branches[0]?.name || 'Gulberg III Main Hub',
      region: projectData.region || 'Central',
      province: projectData.province || 'Punjab',
      city: projectData.city || 'Lahore',
      completeAddress: projectData.completeAddress || 'Branch Location Address',
      latitude: projectData.latitude || 31.5204,
      longitude: projectData.longitude || 74.3587,
      contractAwardDate: new Date().toISOString().split('T')[0],
      awardNumber: projectData.awardNumber || `AWD-${Date.now().toString().slice(-4)}`,
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
      contractValue: projectData.contractValue || 20000000,
      revisedContractValue: projectData.contractValue || 20000000,
      projectManager: projectData.projectManager || 'Engr. Zohaib Hassan',
      status: 'Contract Awarded',
      overallProgressPercent: 0,
      boq: projectData.boq || [],
      raBills: [],
      purchaseOrders: [],
      totalBilledAmount: 0,
      totalReceivedAmount: 0,
      totalRetentionHeld: 0,
      totalOutstanding: 0,
      directMaterialCost: 0,
      directLabourCost: 0,
      directSubcontractCost: 0,
      directFuelKmCost: 0,
      directSiteExpenses: 0,
      totalActualProjectCost: 0,
      grossProjectProfit: 0,
      grossProfitMarginPercent: 0,
      isPhysicalWorkOrderIssued: false,
      physicalWorkOrderNumber: projectData.physicalWorkOrderNumber,
      physicalWorkOrderDate: projectData.physicalWorkOrderDate,
      physicalWorkOrderAuthority: projectData.physicalWorkOrderAuthority,
      workOrderNotes: projectData.workOrderNotes,
    };

    setProjects((prev) => [newProject, ...prev]);
    addAuditLog('CREATE_PROJECT', 'Project', newProject.projectCode, `Created project master for ${newProject.title}`);
    return newProject;
  };

  const updateProject = (projectId: string, updater: (prev: Project) => Project) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) return updater(p);
        return p;
      })
    );
  };

  // Section: Physical Hardcopy Work Order Issuance (Tender Projects - Strictly NOT on Gmail)
  const issuePhysicalWorkOrder = (
    projectId: string,
    woNumber: string,
    woDate: string,
    issuingAuthority: string,
    notes?: string
  ) => {
    updateProject(projectId, (prev) => ({
      ...prev,
      isPhysicalWorkOrderIssued: true,
      physicalWorkOrderNumber: woNumber,
      physicalWorkOrderDate: woDate,
      physicalWorkOrderAuthority: issuingAuthority,
      workOrderNotes:
        notes ||
        'Physical hardcopy workorder issued post-tender award. Work commenced strictly post-issuance. Governed by 3 Running Bills (RA-01, RA-02, RA-03 with 10% retention held). Not handled via Gmail.',
      status: prev.status === 'Contract Awarded' ? 'Under Execution' : prev.status,
    }));

    addAuditLog(
      'ISSUE_PHYSICAL_WORK_ORDER',
      'Project',
      woNumber,
      `Physical hardcopy work order ${woNumber} issued for ${projectId} by ${issuingAuthority}. Governed by 3 Running Bills (RA-01, RA-02, RA-03). Official channels, not Gmail.`
    );
  };

  // Section 15: RUNNING BILLS & RETENTION ENGINE (3 Running Bills: RA-01, RA-02, RA-03)
  // On Third Running Bill: 10% Retention Money withheld for 6-month DLP release.
  // Tax deductions: 16% Sales Tax (PRA) + 9% Income Tax (WHT) deposited to Govt by UBL on contractor's behalf.
  // Balance amount issued and transferred online.
  const generateRABill = (
    projectId: string,
    itemsCertified: { boqItemId: string; currentCertifiedQty: number }[],
    advanceDeductionPercent: number = 10,
    retentionPercent: number = 5
  ): RABill | null => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return null;

    const billIndex = project.raBills.length + 1;
    const isThirdBill = billIndex === 3;
    const billNumber = billIndex <= 3 ? `RA-0${billIndex}` : `RA-${billIndex}`;

    // On 3rd Running Bill: enforce 10% retention money per user specifications
    const effectiveRetentionPercent = isThirdBill ? 10 : (retentionPercent || 5);

    // Map certified items and enforce running bill arithmetic
    let currentBillGross = 0;
    const certifiedItems: RABillItemCertified[] = [];

    const updatedBOQ = project.boq.map((boqItem) => {
      const match = itemsCertified.find((c) => c.boqItemId === boqItem.id);
      const currentCertified = match ? match.currentCertifiedQty : 0;
      const previousCertified = boqItem.completedQuantity;
      const cumulative = previousCertified + currentCertified;
      const remaining = Math.max(0, boqItem.contractQuantity - cumulative);
      const itemAmount = currentCertified * boqItem.rate;

      if (currentCertified > 0) {
        currentBillGross += itemAmount;
        certifiedItems.push({
          boqItemId: boqItem.id,
          itemCode: boqItem.itemCode,
          description: boqItem.description,
          unit: boqItem.unit,
          contractRate: boqItem.rate,
          contractQuantity: boqItem.contractQuantity,
          previousCertifiedQuantity: previousCertified,
          currentCertifiedQuantity: currentCertified,
          cumulativeQuantity: cumulative,
          remainingQuantity: remaining,
          currentAmount: itemAmount,
        });
      }

      return {
        ...boqItem,
        completedQuantity: cumulative,
        remainingQuantity: remaining,
      };
    });

    if (currentBillGross === 0) return null;

    const previousCumulativeGross = project.raBills.reduce((sum, b) => sum + b.currentBillGross, 0);
    const advanceRecovery = Math.round((currentBillGross * advanceDeductionPercent) / 100);
    const retentionMoney = Math.round((currentBillGross * effectiveRetentionPercent) / 100);
    const netPayable = currentBillGross - advanceRecovery - retentionMoney;

    const newRABill: RABill = {
      id: `RA-${Date.now()}`,
      billNumber,
      projectId: project.id,
      billDate: new Date().toISOString().split('T')[0],
      periodStart: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      items: certifiedItems,
      grossCertifiedAmount: previousCumulativeGross + currentBillGross,
      previousCumulativeGross,
      currentBillGross,
      advanceMobilizationDeduction: advanceRecovery,
      retentionMoneyDeductionPercent: effectiveRetentionPercent,
      retentionMoneyDeductionAmount: retentionMoney,
      netPayableAmount: netPayable,
      status: 'Submitted',
      certifiedByConsultant: 'Pending Site Consultant Certification',
    };

    // Update retention ledger entry
    const newRetentionEntry: RetentionLedgerEntry = {
      id: `RET-${Date.now()}`,
      projectId: project.id,
      projectTitle: project.title,
      client: project.client,
      raBillNumber: billNumber,
      dateHeld: new Date().toISOString().split('T')[0],
      retentionRatePercent: effectiveRetentionPercent,
      heldAmount: retentionMoney,
      releasedAmount: 0,
      balanceAmount: retentionMoney,
      releaseCondition: isThirdBill
        ? '10% Retention Money held on 3rd Running Bill. Released after 6-month (180 days) Defect Liability Period (DLP) upon issuance of Final Completion & Clearance Certificate.'
        : 'Interim progress retention held. Final release governed upon 6-month DLP.',
      approvalStatus: 'Held in Escrow',
    };

    setRetentionLedger((prev) => [newRetentionEntry, ...prev]);

    // Update project state
    const newTotalBilled = (project.totalBilledAmount || 0) + currentBillGross;
    const newTotalRetention = (project.totalRetentionHeld || 0) + retentionMoney;

    const boqContractTotal = updatedBOQ.reduce((s, it) => s + (it.contractAmount || it.contractQuantity * it.rate), 0) || project.contractValue || 1;
    const boqCertifiedTotal = updatedBOQ.reduce((s, it) => s + ((it.completedQuantity || 0) * it.rate), 0);
    const boqCompletionPercent = Math.min(100, Math.round((Math.max(newTotalBilled, boqCertifiedTotal) / boqContractTotal) * 100));

    updateProject(projectId, (prev) => ({
      ...prev,
      boq: updatedBOQ,
      raBills: [...prev.raBills, newRABill],
      totalBilledAmount: newTotalBilled,
      totalRetentionHeld: newTotalRetention,
      totalOutstanding: (prev.totalOutstanding || 0) + netPayable,
      overallProgressPercent: boqCompletionPercent,
    }));

    addAuditLog(
      'GENERATE_RA_BILL',
      'RABill',
      billNumber,
      `Generated ${billNumber} for ${project.projectCode}. Gross: PKR ${currentBillGross.toLocaleString()}, Retention Held (${effectiveRetentionPercent}%): PKR ${retentionMoney.toLocaleString()}${isThirdBill ? ' [3rd Final Running Bill - 6M DLP Scheduled]' : ''}`
    );

    return newRABill;
  };

  // Release retention money from ledger
  const releaseRetentionAmount = (retentionId: string, releaseAmount: number, notes: string, bankRef: string) => {
    setRetentionLedger((prev) =>
      prev.map((entry) => {
        if (entry.id === retentionId) {
          const newReleased = (entry.releasedAmount || 0) + releaseAmount;
          const newBalance = Math.max(0, entry.heldAmount - newReleased);
          return {
            ...entry,
            releasedAmount: newReleased,
            balanceAmount: newBalance,
            approvalStatus: newBalance === 0 ? 'Released & Paid' : 'Approved for Release',
            releaseApprovedBy: `${activeRole} (Accounts Head)`,
            releaseDate: new Date().toISOString().split('T')[0],
            bankReference: bankRef,
          };
        }
        return entry;
      })
    );
    addAuditLog('RELEASE_RETENTION', 'RABill', retentionId, `Released PKR ${releaseAmount.toLocaleString()} retention. Bank ref: ${bankRef}. Note: ${notes}`);
  };

  // Field & Expenses CRUD
  const addWorkerExpense = (expData: Omit<WorkerExpense, 'id'>) => {
    const newExp: WorkerExpense = {
      ...expData,
      id: `EXP-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    addAuditLog('ADD_EXPENSE', 'Expense', newExp.id, `Logged ${newExp.category} expense PKR ${newExp.amount} by ${newExp.employeeName}`);
  };

  const approveExpense = (expenseId: string, approvedAmount?: number) => {
    setExpenses((prev) =>
      prev.map((e) => {
        if (e.id === expenseId) {
          return {
            ...e,
            amount: approvedAmount !== undefined ? approvedAmount : e.amount,
            status: 'Approved',
            approvedBy: `${activeRole}`,
            approvalDate: new Date().toISOString().split('T')[0],
          };
        }
        return e;
      })
    );
    addAuditLog('APPROVE_EXPENSE', 'Expense', expenseId, `Approved worker expense by ${activeRole}`);
  };

  // GPS Event Logging
  const recordGPSEvent = (eventData: Omit<GPSEvent, 'id'>): GPSEvent => {
    const newEvent: GPSEvent = {
      ...eventData,
      id: `GPS-${Date.now()}`,
    };
    setGpsEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  // Branch Master CRUD
  const addBranch = (branchData: Omit<BranchMaster, 'id'>) => {
    const newBranch: BranchMaster = {
      ...branchData,
      id: `BR-${Date.now()}`,
    };
    setBranches((prev) => [newBranch, ...prev]);
  };

  const updateBranch = (branchId: string, partial: Partial<BranchMaster>) => {
    setBranches((prev) => prev.map((b) => (b.id === branchId ? { ...b, ...partial } : b)));
  };

  // Daily Site Logs CRUD (System 2)
  const addDailySiteLog = (logData: Omit<DailySiteLog, 'id'>): DailySiteLog => {
    const newLog: DailySiteLog = {
      ...logData,
      id: `DSL-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
    };
    setDailySiteLogs((prev) => [newLog, ...prev]);
    addAuditLog(
      'RECORD_DAILY_SITE_LOG',
      'Project',
      newLog.projectId,
      `Recorded Daily Site Log for ${newLog.projectCode} (${newLog.shift}). Headcount: ${newLog.totalLaborHeadcount} workers (${newLog.totalManHours} man-hrs), Weather: ${newLog.weatherCondition} (${newLog.temperatureCelsius}°C), Photos: ${newLog.photos.length} GPS stamped.`
    );
    return newLog;
  };

  const deleteDailySiteLog = (logId: string) => {
    setDailySiteLogs((prev) => prev.filter((l) => l.id !== logId));
    addAuditLog('DELETE_DAILY_SITE_LOG', 'Project', logId, `Deleted Daily Site Log ${logId}`);
  };

  const updateTaxConfig = (partial: Partial<IncomeTaxConfig>) => {
    setTaxConfig((prev) => ({ ...prev, ...partial }));
  };

  // Section 13: Cost Control Waterfall Calculation
  // Net Revenue → Direct Job Costs (Purchasing, Labour, Fuel/KM, Worker Expenses, Emergency Expenses, Materials, Other)
  // → Gross Job Profit → Allocated Overhead → Operating Profit → Tax/Accounting Adjustments → Taxable Profit → Variable Income Tax → Profit After Tax.
  const getOverallFinancialOverview = (): CostControlOverview => {
    // HERE4U net revenues
    const here4uRevenue = tickets.reduce((sum, t) => sum + (t.netRevenue || 0), 0);
    // Project certified billed revenues
    const projectsRevenue = projects.reduce((sum, p) => sum + (p.totalBilledAmount || 0), 0);
    const netRevenue = here4uRevenue + projectsRevenue;

    // Direct purchasing costs
    const here4uPurchasing = tickets.reduce((sum, t) => sum + (t.directPurchasingCost || 0), 0);
    const projectsMaterials = projects.reduce((sum, p) => sum + (p.directMaterialCost || 0), 0);
    const directPurchasing = here4uPurchasing + projectsMaterials;

    // Direct labour costs
    const here4uLabour = tickets.reduce((sum, t) => sum + (t.directLabourCost || 0), 0);
    const projectsLabour = projects.reduce((sum, p) => sum + (p.directLabourCost || 0) + (p.directSubcontractCost || 0), 0);
    const directLabour = here4uLabour + projectsLabour;

    // Direct Fuel/KM
    const here4uFuel = tickets.reduce((sum, t) => sum + (t.directFuelKmCost || 0), 0);
    const projectsFuel = projects.reduce((sum, p) => sum + (p.directFuelKmCost || 0), 0);
    const directFuelKm = here4uFuel + projectsFuel;

    // Worker expenses & emergency materials
    const directWorkerExpenses = expenses.filter((e) => e.status === 'Approved').reduce((sum, e) => sum + e.amount, 0);
    const directEmergencyMaterials = tickets.reduce((sum, t) => sum + (t.emergencyExpenses || 0), 0);

    const totalDirectJobCosts = directPurchasing + directLabour + directFuelKm + directWorkerExpenses + directEmergencyMaterials;
    const grossJobProfit = Math.max(0, netRevenue - totalDirectJobCosts);
    const grossMarginPercent = netRevenue > 0 ? (grossJobProfit / netRevenue) * 100 : 0;

    // Overhead allocated (est 8% of revenue for head office, estimating, tools depreciation)
    const allocatedOverhead = Math.round(netRevenue * 0.08);
    const operatingProfit = Math.max(0, grossJobProfit - allocatedOverhead);

    // Taxable profit
    const taxAdjustments = 0;
    const taxableProfit = Math.max(0, operatingProfit + taxAdjustments);

    // Variable income tax (Section 12)
    const variableIncomeTax = Math.round((taxableProfit * taxConfig.taxRatePercent) / 100);
    const profitAfterTax = Math.max(0, taxableProfit - variableIncomeTax);

    return {
      netRevenue,
      directPurchasing,
      directLabour,
      directFuelKm,
      directWorkerExpenses,
      directEmergencyMaterials,
      totalDirectJobCosts,
      grossJobProfit,
      grossMarginPercent,
      allocatedOverhead,
      operatingProfit,
      taxAdjustments,
      taxableProfit,
      variableIncomeTax,
      profitAfterTax,
    };
  };

  // Admin Staff Management
  const addStaffUser = (user: Omit<StaffUser, 'id' | 'lastActive'> & { lastActive?: string }) => {
    const newUser: StaffUser = {
      ...user,
      id: `USR-${Date.now().toString().slice(-4)}`,
      lastActive: user.lastActive || 'Just now',
    };
    setStaffUsers((prev) => [...prev, newUser]);
    addAuditLog('ADD_STAFF_USER', 'Ticket', newUser.id, `Added staff user ${newUser.fullName} with role ${newUser.role}`);
  };

  const updateStaffUser = (userId: string, partial: Partial<StaffUser>) => {
    setStaffUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...partial } : u))
    );
    addAuditLog('UPDATE_STAFF_USER', 'Ticket', userId, `Updated staff user ${userId} settings`);
  };

  const deleteStaffUser = (userId: string) => {
    setStaffUsers((prev) => prev.filter((u) => u.id !== userId));
    addAuditLog('DELETE_STAFF_USER', 'Ticket', userId, `Removed staff user ${userId}`);
  };

  // UBL Corporate Profile
  const updateCompanyProfile = (partial: Partial<CompanyProfile>) => {
    setCompanyProfile((prev) => ({ ...prev, ...partial }));
    addAuditLog('UPDATE_COMPANY_PROFILE', 'Ticket', 'NAEEM_BUILDER', 'Updated UBL vendor profile & commercial settings');
  };

  // Master Schedule Rates (CSR)
  const addMasterRateItem = (item: Omit<MasterScheduleRateItem, 'id'>) => {
    const newItem: MasterScheduleRateItem = {
      ...item,
      id: `CSR-${Date.now().toString().slice(-4)}`,
    };
    setMasterScheduleRates((prev) => [...prev, newItem]);
    addAuditLog('ADD_MASTER_RATE', 'Ticket', newItem.itemCode, `Added master rate ${newItem.itemCode}: ${newItem.description}`);
  };

  const updateMasterRateItem = (id: string, partial: Partial<MasterScheduleRateItem>) => {
    setMasterScheduleRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...partial } : r))
    );
    addAuditLog('UPDATE_MASTER_RATE', 'Ticket', id, `Updated master rate item ${id}`);
  };

  const deleteMasterRateItem = (id: string) => {
    setMasterScheduleRates((prev) => prev.filter((r) => r.id !== id));
    addAuditLog('DELETE_MASTER_RATE', 'Ticket', id, `Deleted master rate item ${id}`);
  };

  // Reset to Master Seed Data
  const resetToMasterSeedData = () => {
    localStorage.removeItem('nb_erp_branches_ubl_v3');
    localStorage.removeItem('nb_erp_tickets_ubl_v3');
    localStorage.removeItem('nb_erp_projects_ubl_v3');
    localStorage.removeItem('nb_erp_retention_ubl_v3');
    localStorage.removeItem('nb_erp_expenses_ubl_v3');
    localStorage.removeItem('nb_erp_gps_ubl_v3');
    localStorage.removeItem('nb_erp_tax_config_ubl_v3');
    localStorage.removeItem('nb_erp_audit_logs_ubl_v3');
    localStorage.removeItem('nb_erp_daily_site_logs_ubl_v3');
    localStorage.removeItem('nb_erp_staff_users_ubl_v3');
    localStorage.removeItem('nb_erp_company_profile_ubl_v3');
    localStorage.removeItem('nb_erp_master_rates_ubl_v3');

    setBranches(INITIAL_BRANCHES);
    setTickets(INITIAL_TICKETS);
    setProjects(INITIAL_PROJECTS);
    setRetentionLedger(INITIAL_RETENTION_LEDGER);
    setExpenses(INITIAL_EXPENSES);
    setGpsEvents(INITIAL_GPS_EVENTS);
    setTaxConfig(DEFAULT_INCOME_TAX_CONFIG);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setDailySiteLogs(INITIAL_DAILY_SITE_LOGS);
    setStaffUsers(DEFAULT_STAFF_USERS);
    setCompanyProfile(DEFAULT_COMPANY_PROFILE);
    setMasterScheduleRates(DEFAULT_MASTER_SCHEDULE_RATES);

    addAuditLog('RESET_MASTER_SEED', 'Ticket', 'SYSTEM', 'Restored UBL Master Seed data across branches, tickets, and projects');
  };

  // Export / Import Backup
  const exportBackupJson = () => {
    const backup = {
      app: 'Naeem Builder ERP',
      client: 'United Bank Limited (UBL)',
      exportedAt: new Date().toISOString(),
      branches,
      tickets,
      projects,
      consolidatedInvoices,
      retentionLedger,
      expenses,
      gpsEvents,
      taxConfig,
      auditLogs,
      dailySiteLogs,
      staffUsers,
      companyProfile,
      masterScheduleRates,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importBackupJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.branches && Array.isArray(data.branches)) setBranches(data.branches);
      if (data.tickets && Array.isArray(data.tickets)) setTickets(data.tickets);
      if (data.projects && Array.isArray(data.projects)) setProjects(data.projects);
      if (data.consolidatedInvoices && Array.isArray(data.consolidatedInvoices)) setConsolidatedInvoices(data.consolidatedInvoices);
      if (data.retentionLedger && Array.isArray(data.retentionLedger)) setRetentionLedger(data.retentionLedger);
      if (data.expenses && Array.isArray(data.expenses)) setExpenses(data.expenses);
      if (data.gpsEvents && Array.isArray(data.gpsEvents)) setGpsEvents(data.gpsEvents);
      if (data.taxConfig) setTaxConfig(data.taxConfig);
      if (data.auditLogs && Array.isArray(data.auditLogs)) setAuditLogs(data.auditLogs);
      if (data.dailySiteLogs && Array.isArray(data.dailySiteLogs)) setDailySiteLogs(data.dailySiteLogs);
      if (data.staffUsers && Array.isArray(data.staffUsers)) setStaffUsers(data.staffUsers);
      if (data.companyProfile) setCompanyProfile(data.companyProfile);
      if (data.masterScheduleRates && Array.isArray(data.masterScheduleRates)) setMasterScheduleRates(data.masterScheduleRates);

      addAuditLog('IMPORT_BACKUP', 'Ticket', 'SYSTEM', 'Successfully imported ERP JSON backup snapshot');
      return true;
    } catch {
      return false;
    }
  };

  return (
    <ERPContext.Provider
      value={{
        systemMode,
        setSystemMode,
        activeRole,
        setActiveRole,
        branches,
        tickets,
        projects,
        consolidatedInvoices,
        createConsolidatedInvoice,
        depositConsolidatedInvoice,
        recordConsolidatedOnlinePayment,
        updateTicketDossierStatus,
        issuePhysicalWorkOrder,
        retentionLedger,
        expenses,
        gpsEvents,
        taxConfig,
        auditLogs,
        selectedTicketId,
        setSelectedTicketId,
        selectedProjectId,
        setSelectedProjectId,
        addAuditLog,
        createTicket,
        updateTicket,
        advanceTicketStatus,
        createBranchEstimate,
        assignOfficialTicketNumber,
        addEstimateItem,
        removeEstimateItem,
        getBranchWorksSummary,
        generateCompletionNote,
        signAndVerifyCompletionNote,
        uploadSignedCompletionCopy,
        assignWorkToStaff,
        sendSignedCompletionToGmail,
        depositHardCopyToOffice,
        updateCompletionHardCopyDispatch,
        unlockAndCreateInvoice,
        recordPaymentReceipt,
        createProject,
        updateProject,
        generateRABill,
        releaseRetentionAmount,
        addWorkerExpense,
        approveExpense,
        recordGPSEvent,
        addBranch,
        updateBranch,
        dailySiteLogs,
        addDailySiteLog,
        deleteDailySiteLog,
        updateTaxConfig,
        getOverallFinancialOverview,
        staffUsers,
        companyProfile,
        masterScheduleRates,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        updateCompanyProfile,
        addMasterRateItem,
        updateMasterRateItem,
        deleteMasterRateItem,
        resetToMasterSeedData,
        exportBackupJson,
        importBackupJson,
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
