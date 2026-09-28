export type SystemMode =
  | 'SYSTEM_1_HERE4U'
  | 'SYSTEM_2_BRANCH_REGION'
  | 'CONSOLIDATED_INVOICES'
  | 'ANALYTICS_GRAPHS'
  | 'BRANCH_MASTER'
  | 'FIELD_EXPENSES'
  | 'COST_CONTROL'
  | 'AI_INTELLIGENCE'
  | 'VENDOR_COST_REPORT'
  | 'ADMIN_PANEL';

export type UserRole =
  | 'Super Admin'
  | 'Management'
  | 'HERE4U Operator'
  | 'Site/Visit Team'
  | 'Estimator'
  | 'Approver'
  | 'Procurement'
  | 'Project Manager'
  | 'Accounts'
  | 'Tax/GST'
  | 'Store'
  | 'View Only';

// Admin & Staff Governance
export interface StaffUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  department: string;
  canApproveEstimates: boolean;
  maxApprovalLimit: number;
  canIssueInvoices: boolean;
  canOverrideGps: boolean;
  status: 'Active' | 'On-Site' | 'Inactive';
  lastActive: string;
}

// UBL Vendor & Corporate Tax Profile
export interface CompanyProfile {
  companyName: string;
  principalName: string; // Naeem Taj
  ublVendorCode: string;
  ntn: string;
  strn: string;
  praRegistrationNo: string;
  srbRegistrationNo: string;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  iban: string;
  standardPraGstPercent: number;
  standardSrbGstPercent: number;
  defaultWhtRateServices: number;
  defaultWhtRateGoods: number;
  // Specific UBL Operational Tax Rules
  here4uSalesTaxPercent: number; // 16% PRA
  here4uIncomeTaxPercent: number; // 14% WHT for maintenance
  workOrderSalesTaxPercent: number; // 16% PRA
  workOrderIncomeTaxPercent: number; // 9% WHT for tender projects
  workOrderRetentionPercent: number; // 10% on 3rd running bill
  workOrderDlpMonths: number; // 6 months Defect Liability Period
  headOfficeAddress: string;
  contactPhone: string;
  contactEmail: string;
}

// Master Schedule of Rates (CSR) for UBL
export interface MasterScheduleRateItem {
  id: string;
  itemCode: string;
  category: 'Civil' | 'Electrical' | 'HVAC' | 'Plumbing' | 'Carpentry' | 'Aluminium' | 'Glass & Aluminium' | 'IT / Signage';
  description: string;
  unit: string;
  baselineInternalRate: number;
  ublApprovedClientRate: number;
  standardMarginPercent: number;
  effectiveDate: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entityType: 'Ticket' | 'Project' | 'Estimate' | 'Approval' | 'PurchaseOrder' | 'DeliveryNote' | 'Invoice' | 'Payment' | 'RABill' | 'Expense';
  entityId: string;
  details: string;
}

// 5. Branch Master
export interface BranchMaster {
  id: string;
  code: string;
  name: string;
  client: string;
  completeAddress: string;
  city: string;
  region: 'North' | 'Central' | 'South' | 'Federal';
  province: string;
  latitude: number;
  longitude: number;
  branchContact: string;
  bomName: string; // Branch Operations Manager
  bomContact: string;
  branchType: 'Corporate Main' | 'Retail Hub' | 'Express / Sub-Branch' | 'Islamic Banking Branch' | 'ATM Vestibule';
  isActive: boolean;
}

// GPS Event (Section 8)
export interface GPSEvent {
  id: string;
  eventType: 'Start Visit' | 'Start Work' | 'Complete Work' | 'Branch Verification' | 'Expense Location';
  employeeName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  targetBranchId?: string;
  distanceToBranchMeters?: number;
  isWithinProximity: boolean; // <= 200m
  photoUrl?: string;
  notes?: string;
}

// Item in Estimate / Quotation / Work Order / Delivery Note
export interface LineItem {
  id: string;
  itemCode: string;
  description: string;
  category: 'Electrical' | 'HVAC' | 'Plumbing' | 'Civil' | 'Carpentry' | 'Aluminium' | 'Glass & Aluminium' | 'IT / Signage' | 'IT & Signage';
  unit: 'Sq.Ft' | 'Sft' | 'R.Ft' | 'Nos' | 'Cft' | 'Job' | 'Kg' | 'Set' | 'Mtr' | string;
  quantity: number;
  // Internal pricing (Strictly hidden in Delivery Note per Rule 9!)
  internalRate?: number;
  internalAmount?: number;
  // Client quotation pricing
  clientRate?: number;
  clientAmount?: number;
}

export type EstimateItem = LineItem;

// Section 2: System 1 (HERE4U) Workflow States
export type TicketStatus =
  | 'New / Open'
  | 'Site Visit Scheduled'
  | 'Job Verified'
  | 'Internal Estimate Prepared'
  | 'Quotation Sent'
  | 'Financial Approval Pending'
  | 'Approved'
  | 'Purchasing in Progress'
  | 'Material Received'
  | 'Work Order Issued'
  | 'Work In Progress'
  | 'Completion Note Generated'
  | 'Completion Verified' // Branch signed + stamped
  | 'Invoiced'
  | 'Payment Received'
  | 'GST Filed'
  | 'Closed';

export type TicketPriority = 'Emergency' | 'High' | 'Medium' | 'Low';

export interface SiteVisitRecord {
  id: string;
  ticketId: string;
  scheduledDate: string;
  completedDate?: string;
  engineerName: string;
  gpsEvent?: GPSEvent;
  siteFindings: string;
  photos: string[];
}

export interface JobVerificationRecord {
  id: string;
  ticketId: string;
  verifiedBy: string;
  verifiedDate: string;
  measurementsNotes: string;
  siteCondition: 'Critical' | 'Severe' | 'Moderate' | 'Minor';
  requiredWorkSummary: string;
  requiredMaterials: { name: string; quantity: number; unit: string }[];
  verifiedPhotos: string[];
}

export interface EstimateRecord {
  id: string;
  ticketId: string;
  version: number;
  createdAt: string;
  createdBy: string;
  isBranchCodeEstimate?: boolean;
  branchCode?: string;
  branchName?: string;
  branchAddress?: string;
  provisionalEstimateNumber?: string;
  items: LineItem[];
  directMaterialCost: number;
  directLabourCost: number;
  directSubcontractCost: number;
  allocatedOverhead: number;
  totalDirectCost: number;
  targetGrossMarginPercent: number;
  quotedAmountBeforeTax: number;
  taxPercent: number; // e.g., 16% PRA or SRB
  taxAmount: number;
  totalEstimatedAmount: number;
}

export interface QuotationRecord {
  id: string;
  quotationNumber: string;
  ticketId: string;
  dateSent: string;
  validUntil: string;
  items: LineItem[];
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  terms: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Revision Requested' | 'Rejected';
}

export interface ApprovalRecord {
  id: string;
  ticketId: string;
  requestDate: string;
  responseDate?: string;
  requestedAmount: number;
  approvedAmount?: number;
  approverName: string;
  approverEmail: string;
  approverDesignation: string;
  approvalReference: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Revision';
  remarks?: string;
  aiDetectedSignal?: {
    confidence: number;
    detectedFrom: string;
    summary: string;
  };
}

export interface PurchaseItem {
  materialName: string;
  quantity: number;
  unit: string;
  supplierQuoteRate: number;
  totalRate: number;
  receivedQty: number;
  allocatedToJob: boolean;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  ticketId?: string;
  projectId?: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: 'Draft' | 'PO Issued' | 'Partially Received' | 'Material Received' | 'Allocated to Work';
  items: PurchaseItem[];
  totalCost: number;
  paymentTerms: string;
  receivingNote?: string;
  grnNumber?: string; // Goods Receipt Note
}

export interface WorkOrderRecord {
  id: string;
  workOrderNumber: string;
  ticketId: string;
  issuedDate: string;
  scheduledStart: string;
  scheduledEnd: string;
  primaryWorkExecutor: string; // Crucial for Rule 10: automatically pulled as Delivered By
  executorContact: string;
  assignedTrade?: 'Electrician' | 'Painter' | 'HVAC / AC Tech' | 'Civil / Mason' | 'Aluminium & Glass' | 'Plumber' | 'General Technician' | string;
  assignedCrew: string[];
  scopeSummary: string;
  safetyInstructions: string;
  status: 'Issued' | 'Started' | 'Completed';
  startedAt?: string;
  completedAt?: string;
}

// 10. Completion / Delivery Note (CRITICAL RULE 9 & 10)
// SHOW: document/date/client/ticket/project/branch/address, Item/Work Description, Quantity, Unit, Received By, Delivered By.
// DO NOT SHOW: rate, amount, subtotal, tax, grand total or financial approval value!
export interface CompletionDeliveryNote {
  id: string;
  docNumber: string; // e.g. CDN-2026-0842
  ticketId: string;
  date: string;
  clientName: string;
  branchName: string;
  branchAddress: string;
  // Strictly Item + Qty only
  items: {
    description: string;
    quantity: number;
    unit: string;
  }[];
  // Rule 10: Delivered By automatically pulls the Primary Work Executor from Work Order!
  deliveredBy: string;
  deliveredByDesignation: string;
  deliveredBySignature?: string;
  assignedTrade?: string;
  // Received By (Branch Representative)
  receivedBy: string;
  receivedByDesignation: string; // e.g. Branch Operations Manager
  receivedBySignature?: string;
  branchStampUploaded: boolean;
  branchStampUrl?: string;
  signedCopyUploaded: boolean;
  signedCopyUrl?: string;
  signedCopyFileName?: string;
  signedCopyUploadedAt?: string;
  completionVerified: boolean; // Branch signs + stamps -> Completion Verified
  verificationDate?: string;
  verifiedBy?: string;
  // Send signed copy image/scan to UBL Gmail Thread
  signedCopySentToGmail?: boolean;
  signedCopySentToGmailDate?: string;
  // Hard copy physical document dispatch and deposit into Head Office for Accounts Process
  hardCopySentToOffice?: boolean;
  hardCopyDispatchedDate?: string;
  hardCopyCourierOrRider?: string;
  hardCopyTrackingRef?: string;
  hardCopyReceivedAtOffice?: boolean;
  hardCopyReceivedDate?: string;
  hardCopyReceivedBy?: string;
  officeDepositRef?: string;
  officeDepositNotes?: string;
}

// 11. Invoice & Payment (Rule 12: Verified completion unlocks invoice!)
export interface PaymentReceipt {
  id: string;
  receiptNumber: string;
  date: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Cheque' | 'Direct Deposit' | 'Pay Order';
  bankReference: string;
  withholdingTaxDeducted: number; // WHT deduction
  otherDeductions: number;
  netReceived: number;
  proofDocumentUrl?: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  ticketId?: string;
  projectId?: string;
  raBillId?: string;
  dateIssued: string;
  dueDate: string;
  clientName: string;
  branchName: string;
  isUnlocked: boolean; // strictly unlocked ONLY if completionVerified is true!
  billingItems: { description: string; quantity: number; unit: string; rate: number; amount: number }[];
  subtotal: number;
  gstRatePercent: number; // 16% / 13% provincial service tax
  gstAmount: number; // separated from profit per Rule 14
  totalInvoiceAmount: number;
  amountPaid: number;
  totalWithholdingTax: number;
  totalOtherDeductions: number;
  outstandingBalance: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Fully Paid';
  payments: PaymentReceipt[];
  gstFilingPeriod?: string;
  gstFilingStatus: 'Pending Filing' | 'Filed' | 'Exempt';
  consolidatedInvoiceId?: string; // Link to Consolidated Invoice (up to Rs. 500,000 batch)
}

// 4-Part Hard Copy Dossier Checklist required by UBL Accounts Office
export interface TicketDossierStatus {
  hasTicketRiseHardCopy: boolean;        // 1. Task Assigned Ticket Rise hardcopy
  hasGmailApprovalHardCopy: boolean;     // 2. Gmail thread approval email printout
  hasBranchSignedStampedCert: boolean;   // 3. Completion certificate signed & stamped from relative branch (code & address)
  hasIndividualInvoice: boolean;         // 4. Hardcopy commercial invoice
  isComplete: boolean;                   // All 4 documents verified
}

// Consolidated Invoice (Batched within Rs. 500,000 threshold for UBL Accounts Office)
export interface ConsolidatedInvoiceRecord {
  id: string;
  batchNumber: string; // e.g. "CON-2026-UBL-001"
  dateCreated: string;
  dateDepositedToAccountsOffice?: string;
  datePaid?: string;
  status: 'Draft / Assembling' | 'Deposited to UBL Accounts Office' | 'Under Audit' | 'Paid via Online Transfer';
  maxLimitThreshold: number; // Rs. 500,000
  ticketIds: string[];
  totalGrossAmount: number; // Sum of all attached invoices
  salesTaxPraRate: number; // 16% PRA Sales Tax
  salesTaxPraAmount: number;
  incomeTaxWhtRate: number; // 14% WHT (HERE4U standard)
  incomeTaxWhtAmount: number;
  totalTaxDeductions: number; // 16% + 14% = 30%
  netOnlineTransferAmount: number; // 70% balance transferred online
  bankTransferReference?: string;
  fbrPraTaxChallanProofRef?: string; // Taxes deposited directly by UBL to Govt on behalf of Naeem Builder
  depositedBy?: string;
  accountsOfficeNotes?: string;
}

export interface GmailAttachment {
  name: string;
  size?: string;
  type: 'pdf' | 'image' | 'doc' | 'other';
  url?: string;
}

export interface BankComplaintDetails {
  complaintNumber: string;
  issueDetails: string;
  status: string;
  complaintType: string;
  complaintDate: string;
  loggedBy: string;
  vendor: string;
  vendorContact: string;
  branchCode: string;
  branchName: string;
  bom: string;
  branchContactNumber: string;
  branchAddress: string;
}

export interface GmailMessage {
  id: string;
  senderName: string;
  senderEmail: string;
  senderRole?: string;
  recipientEmails: string[];
  date: string;
  subject: string;
  body: string;
  isBankInbound?: boolean;
  isNaeemBuilderOutbound?: boolean;
  isApprovalNotification?: boolean;
  bankComplaintDetails?: BankComplaintDetails;
  attachments?: GmailAttachment[];
}

export const OFFICIAL_COMPLAINT_TYPES = [
  'AC - - -',
  'Blinds - -',
  'Electrical - - -',
  'Genset - - -',
  'Glass/Door/Wood Work - - -',
  'Grill_Window_genset_other - - -',
  'Paint/ Tile / Seepage / Front Elevation - - -',
  'Plumbing - - -',
  'Ramps - - -',
] as const;

export type OfficialComplaintType = (typeof OFFICIAL_COMPLAINT_TYPES)[number];

export function mapComplaintTypeToCategory(complaintType: string): 'Electrical' | 'HVAC' | 'Plumbing' | 'Civil' | 'Glass & Aluminium' | 'IT & Signage' {
  if (!complaintType) return 'Civil';
  if (complaintType.startsWith('AC')) return 'HVAC';
  if (complaintType.startsWith('Blinds')) return 'Civil';
  if (complaintType.startsWith('Electrical')) return 'Electrical';
  if (complaintType.startsWith('Genset')) return 'Electrical';
  if (complaintType.startsWith('Glass')) return 'Glass & Aluminium';
  if (complaintType.startsWith('Grill')) return 'Civil';
  if (complaintType.startsWith('Paint') || complaintType.includes('Seepage') || complaintType.includes('Tile')) return 'Civil';
  if (complaintType.startsWith('Plumbing')) return 'Plumbing';
  if (complaintType.startsWith('Ramp')) return 'Civil';
  return 'Civil';
}

// 1. Ticket Master Record (HERE4U Master)
export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. 123913, 123758, 125376, or EST-962-01 when awaiting
  ticketNumberStatus?: 'ASSIGNED' | 'AWAITING_TICKET_NUMBER' | 'PROVISIONAL_PENDING';
  ublBranchCode?: string; // e.g. '640', '962', '2174', '0233'
  branchAddress?: string;
  provisionalEstimateCode?: string;
  title: string;
  client: string;
  branchId: string;
  branchName: string;
  city: string;
  region: 'North' | 'Central' | 'South' | 'Federal';
  category: 'Electrical' | 'HVAC' | 'Plumbing' | 'Civil' | 'Glass & Aluminium' | 'IT & Signage';
  complaintType?: OfficialComplaintType | string;
  priority: TicketPriority;
  status: TicketStatus;
  reportedDate: string;
  reportedBy: string;
  reportedByContact: string;
  scopeDescription: string;
  
  // Linked sub-records
  emailSource?: {
    emailId: string;
    subject: string;
    sender: string;
    receivedAt: string;
    bodySnippet: string;
  };
  gmailThread?: GmailMessage[];
  bankComplaintDetails?: BankComplaintDetails;
  siteVisit?: SiteVisitRecord;
  jobVerification?: JobVerificationRecord;
  estimates: EstimateRecord[];
  activeEstimateId?: string;
  quotation?: QuotationRecord;
  approval?: ApprovalRecord;
  purchaseOrders: PurchaseOrderRecord[];
  workOrder?: WorkOrderRecord;
  completionNote?: CompletionDeliveryNote;
  invoice?: InvoiceRecord;
  dossierStatus?: TicketDossierStatus;
  consolidatedInvoiceId?: string;
  
  // Cost & Profit Tracking for this specific Job (Section 13)
  directPurchasingCost: number;
  directLabourCost: number;
  directFuelKmCost: number;
  directWorkerExpenses: number;
  emergencyExpenses: number;
  totalDirectCost: number;
  netRevenue: number;
  grossProfit: number;
  grossMarginPercent: number;
}

// 3 & 14. System 2: Branch + Region Projects & BOQ
export interface BOQItem {
  id: string;
  itemCode: string; // e.g. "CIV-01"
  category: 'Civil Works' | 'Electrical & Lighting' | 'HVAC Ducting & AC' | 'Plumbing & Sanitary' | 'Carpentry & Woodwork' | 'Security & Vault' | 'Signage & Branding';
  description: string;
  unit: 'Sq.Ft' | 'R.Ft' | 'Nos' | 'Cft' | 'Job' | 'Kg' | 'Set';
  contractQuantity: number;
  rate: number;
  contractAmount: number;
  revisedQuantity: number;
  completedQuantity: number; // Certified cumulative completed
  remainingQuantity: number; // Contract/Revised - Completed
}

// 15. Running Account (RA) Bills & Retention
export interface RABillItemCertified {
  boqItemId: string;
  itemCode: string;
  description: string;
  unit: string;
  contractRate: number;
  contractQuantity: number;
  previousCertifiedQuantity: number; // Prev Certified
  currentCertifiedQuantity: number;  // Current Certified
  cumulativeQuantity: number;       // Prev + Current
  remainingQuantity: number;        // Contract - Cumulative (Prevents double billing!)
  currentAmount: number;            // Current Certified * Rate
}

export interface RABill {
  id: string;
  billNumber: string; // e.g. "RA-01", "RA-02", "RA-03", "Final Bill"
  projectId: string;
  billDate: string;
  periodStart: string;
  periodEnd: string;
  items: RABillItemCertified[];
  grossCertifiedAmount: number;
  previousCumulativeGross: number;
  currentBillGross: number;
  advanceMobilizationDeduction: number; // e.g. 10%
  retentionMoneyDeductionPercent: number; // e.g. 5%
  retentionMoneyDeductionAmount: number;
  netPayableAmount: number;
  status: 'Draft' | 'Submitted' | 'Certified by Consultant' | 'Client Approved' | 'Invoiced' | 'Paid';
  certifiedByConsultant?: string;
  certificationDate?: string;
  linkedInvoiceId?: string;
}

export interface RetentionLedgerEntry {
  id: string;
  projectId: string;
  projectTitle: string;
  client: string;
  raBillNumber: string;
  dateHeld: string;
  retentionRatePercent: number;
  heldAmount: number;
  releasedAmount: number;
  balanceAmount: number;
  releaseCondition: string; // e.g., "Upon Defect Liability Period (DLP) 6-month completion"
  approvalStatus: 'Held in Escrow' | 'Eligible for Release' | 'Approved for Release' | 'Released & Paid';
  releaseApprovedBy?: string;
  releaseDate?: string;
  bankReference?: string;
}

// 14. Branch Build-up Project Master (System 2 Master Record)
export interface Project {
  id: string;
  projectCode: string; // e.g. "PRJ-MBL-LHR-012"
  title: string;
  client: string;
  branchId: string;
  branchName: string;
  region: 'North' | 'Central' | 'South' | 'Federal';
  province: string;
  city: string;
  completeAddress: string;
  latitude: number;
  longitude: number;
  contractAwardDate: string;
  awardNumber: string;
  startDate: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  contractValue: number;
  revisedContractValue: number;
  projectManager: string;
  status: 'Contract Awarded' | 'BOQ Finalized' | 'Procurement' | 'Under Execution' | 'Snagging' | 'Handed Over' | 'DLP Active' | 'Closed';
  overallProgressPercent: number;
  
  boq: BOQItem[];
  raBills: RABill[];
  purchaseOrders: PurchaseOrderRecord[];
  
  // Physical Hardcopy Work Order (Tender projects - Strictly NOT on Gmail!)
  isPhysicalWorkOrderIssued: boolean;
  physicalWorkOrderNumber?: string;
  physicalWorkOrderDate?: string;
  physicalWorkOrderAuthority?: string;
  physicalWorkOrderScanUrl?: string;
  workOrderNotes?: string;
  
  // 3 Running Bills & Tax Parameters
  salesTaxPraPercent?: number;         // 16% PRA Sales Tax
  incomeTaxWhtPercent?: number;        // 9% Income Tax (WHT for Work Order contracts)
  retentionPercentOnThirdBill?: number; // 10% on Third Running Bill (RA-03)
  dlpPeriodMonths?: number;            // 6 Months Defect Liability Period (DLP)
  
  // Financial progress
  totalBilledAmount: number;
  totalReceivedAmount: number;
  totalRetentionHeld: number;
  totalOutstanding: number;

  // Cost Control (Section 16)
  directMaterialCost: number;
  directLabourCost: number;
  directSubcontractCost: number;
  directFuelKmCost: number;
  directSiteExpenses: number;
  totalActualProjectCost: number;
  grossProjectProfit: number;
  grossProfitMarginPercent: number;
}

// 9. Worker Expenses & Fuel/KM
export type ExpenseCategory =
  | 'Fuel/KM'
  | 'Food'
  | 'Transport'
  | 'Parking/Toll'
  | 'Accommodation'
  | 'Emergency Material'
  | 'Emergency Repair'
  | 'Loading/Unloading'
  | 'Communication'
  | 'Other';

export interface WorkerExpense {
  id: string;
  ticketId?: string;
  projectId?: string;
  employeeName: string;
  employeeDesignation: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  receiptPhotoUrl?: string;
  gpsLocation?: { latitude: number; longitude: number; address: string };
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Reimbursed';
  approvedBy?: string;
  approvalDate?: string;
  reimbursementDate?: string;
  // Fuel/KM specific attributes (Section 9)
  fuelDetails?: {
    vehicleType: 'Car' | 'Motorcycle' | 'Company Van';
    startPoint: string;
    destination: string;
    claimedKm: number;
    routeCalculatedKm: number; // Route / map distance benchmark
    ratePerKm: number; // e.g. Rs 35/KM for Car, Rs 18/KM for Bike
    calculatedAllowance: number;
    isDistanceDiscrepancyFlagged: boolean; // flagged if claimed > calculated by 15%
  };
}

// 12 & 13. Income Tax & Cost Control Configurations
export interface IncomeTaxConfig {
  regimeName: string; // e.g. "Standard Corporate Corporate Tax (FBR Normal Regime)"
  taxRatePercent: number; // e.g. 29%
  minimumTurnoverTaxPercent: number; // e.g. 1.25%
  effectiveStartDate: string;
  notes: string;
}

export interface CostControlOverview {
  netRevenue: number;
  directPurchasing: number;
  directLabour: number;
  directFuelKm: number;
  directWorkerExpenses: number;
  directEmergencyMaterials: number;
  totalDirectJobCosts: number;
  grossJobProfit: number;
  grossMarginPercent: number;
  allocatedOverhead: number;
  operatingProfit: number;
  taxAdjustments: number;
  taxableProfit: number;
  variableIncomeTax: number;
  profitAfterTax: number;
}

// 18. Daily Site Log (System 2 Branch Construction & Field Attendance)
export type ConstructionTrade =
  | 'Civil / Masonry'
  | 'Electrical'
  | 'HVAC / Mechanical'
  | 'Carpentry & Woodwork'
  | 'Plumbing & Sanitary'
  | 'Painting & Polishing'
  | 'Aluminium & Glass'
  | 'General Helpers'
  | 'Supervisors & Safety';

export interface DailyLaborCount {
  trade: ConstructionTrade;
  headcount: number;
  regularHours: number; // e.g. 8
  overtimeHours: number; // e.g. 2
  contractorName?: string;
  notes?: string;
}

export interface SitePhotoWithGPS {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
  tradeCategory?: string;
  gps: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    distanceToBranchMeters: number;
    isWithinRadius: boolean; // e.g. <= 200m from project site
    locationName?: string;
  };
}

export interface DailySiteLog {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  branchName: string;
  date: string;
  shift: 'Day Shift (08:00 - 17:00)' | 'Night Shift (20:00 - 05:00)' | 'Extended Overtime Shift';
  recordedBy: string; // PM / Site Engineer name
  recordedRole: string;
  
  // 1. Labor Count
  totalLaborHeadcount: number;
  totalManHours: number;
  laborBreakdown: DailyLaborCount[];
  
  // 2. Weather Conditions
  weatherCondition: 'Sunny / Clear' | 'Partly Cloudy' | 'Rainy / Wet' | 'Windstorm / Dust' | 'Extreme Heat' | 'Fog / Low Visibility';
  temperatureCelsius: number;
  humidityPercent?: number;
  weatherWorkImpact: 'Normal Operations' | 'Minor Delays' | 'Severe Weather Delay / Standstill';
  weatherNotes?: string;
  
  // 3. Site Progress & Activities
  workSummary: string;
  completedTasks: string[];
  materialsReceived?: string[];
  equipmentOnSite?: string[];
  safetyObservations?: string;
  delaysOrObstacles?: string;
  
  // 4. Site Progress Photos with GPS Location Tagging
  photos: SitePhotoWithGPS[];
  
  // Overall Submission GPS Verification
  submissionGps: {
    latitude: number;
    longitude: number;
    accuracyMeters: number;
    distanceToBranchMeters: number;
    isWithinProximity: boolean;
    capturedAt: string;
  };
  
  status: 'Draft' | 'Submitted' | 'Verified by PM' | 'Consultant Approved';
  verifiedByConsultant?: string;
}

