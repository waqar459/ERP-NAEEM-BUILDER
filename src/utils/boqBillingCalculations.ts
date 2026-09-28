import { Project, BOQItem, RABill } from '../types/erp';

export interface BOQTradeProgress {
  category: string;
  contractAmount: number;
  certifiedAmount: number;
  remainingAmount: number;
  percentage: number;
  itemCount: number;
  completedItemCount: number;
}

export interface ProjectBOQStatusDetails {
  totalBOQContractValue: number;
  totalCertifiedAmount: number;
  totalRemainingAmount: number;
  boqCompletionPercentage: number;
  raBillCount: number;
  latestRABillNumber: string | null;
  latestRABillDate: string | null;
  latestRABillGross: number;
  netPayableCertified: number;
  totalRetentionDeducted: number;
  totalAdvanceRecovered: number;
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  unstartedItems: number;
  phaseLabel: string;
  phaseStage: number; // 1 to 6
  phaseColor: string; // Tailwind color class
  tradeBreakdown: BOQTradeProgress[];
}

/**
 * Calculates project status & BOQ completion percentage dynamically
 * from the contract Bill of Quantities (BOQ) and certified Running Account (RA) Billing records.
 */
export function calculateProjectBOQStatus(project: Project): ProjectBOQStatusDetails {
  // 1. Calculate Total BOQ Contract Value
  const calculatedBOQTotal = (project.boq || []).reduce(
    (sum, item) => sum + (item.contractAmount || item.contractQuantity * item.rate),
    0
  );
  const totalBOQContractValue = calculatedBOQTotal > 0 ? calculatedBOQTotal : project.contractValue || 1;

  // 2. Calculate Gross Certified from RA Billing records
  const raBills = project.raBills || [];
  const raBillCount = raBills.length;
  
  // Total gross certified from all submitted/approved RA bills
  const grossFromRABills = raBills.reduce(
    (sum, bill) => sum + (bill.currentBillGross || 0),
    0
  );

  // Cumulative item-level certified value from BOQ (each updated by RA bills)
  const grossFromBOQItems = (project.boq || []).reduce(
    (sum, item) => sum + (item.completedQuantity || 0) * item.rate,
    0
  );

  // Use the larger certified figure to account for either bill-level or item-level granularity
  const totalCertifiedAmount = Math.max(grossFromRABills, grossFromBOQItems);
  const totalRemainingAmount = Math.max(0, totalBOQContractValue - totalCertifiedAmount);

  // 3. Exact BOQ Completion Percentage
  const rawPercentage = totalBOQContractValue > 0 
    ? (totalCertifiedAmount / totalBOQContractValue) * 100 
    : 0;
  const boqCompletionPercentage = Number(Math.min(100, Math.max(0, rawPercentage)).toFixed(1));

  // 4. Latest RA Bill info
  const latestBill = raBills.length > 0 ? raBills[raBills.length - 1] : null;
  const latestRABillNumber = latestBill ? latestBill.billNumber : null;
  const latestRABillDate = latestBill ? latestBill.billDate : null;
  const latestRABillGross = latestBill ? latestBill.currentBillGross : 0;

  // Financial deductions from RA bills
  const netPayableCertified = raBills.reduce((sum, b) => sum + (b.netPayableAmount || 0), 0);
  const totalRetentionDeducted = raBills.reduce((sum, b) => sum + (b.retentionMoneyDeductionAmount || 0), 0);
  const totalAdvanceRecovered = raBills.reduce((sum, b) => sum + (b.advanceMobilizationDeduction || 0), 0);

  // 5. Line-item counts
  const boqItems = project.boq || [];
  const totalItems = boqItems.length;
  let completedItems = 0;
  let inProgressItems = 0;
  let unstartedItems = 0;

  boqItems.forEach((item) => {
    const completed = item.completedQuantity || 0;
    const contract = item.contractQuantity || 0;
    if (contract > 0 && completed >= contract - 0.001) {
      completedItems += 1;
    } else if (completed > 0) {
      inProgressItems += 1;
    } else {
      unstartedItems += 1;
    }
  });

  // 6. Category / Trade Breakdown
  const categoryMap = new Map<string, { contract: number; certified: number; totalCount: number; completedCount: number }>();

  boqItems.forEach((item) => {
    const cat = item.category || 'Civil Works';
    const cAmount = item.contractAmount || item.contractQuantity * item.rate;
    const certAmount = (item.completedQuantity || 0) * item.rate;
    const isCompleted = item.contractQuantity > 0 && (item.completedQuantity || 0) >= item.contractQuantity - 0.001;

    const existing = categoryMap.get(cat) || { contract: 0, certified: 0, totalCount: 0, completedCount: 0 };
    categoryMap.set(cat, {
      contract: existing.contract + cAmount,
      certified: existing.certified + certAmount,
      totalCount: existing.totalCount + 1,
      completedCount: existing.completedCount + (isCompleted ? 1 : 0),
    });
  });

  const tradeBreakdown: BOQTradeProgress[] = Array.from(categoryMap.entries()).map(([cat, data]) => {
    const pct = data.contract > 0 ? (data.certified / data.contract) * 100 : 0;
    return {
      category: cat,
      contractAmount: data.contract,
      certifiedAmount: data.certified,
      remainingAmount: Math.max(0, data.contract - data.certified),
      percentage: Number(Math.min(100, Math.max(0, pct)).toFixed(1)),
      itemCount: data.totalCount,
      completedItemCount: data.completedCount,
    };
  });

  // 7. Dynamic Project Phase & Status Label based on BOQ Execution Percentage
  let phaseLabel = 'Mobilization & Handover';
  let phaseStage = 1;
  let phaseColor = 'text-slate-400 bg-slate-500/10 border-slate-500/30';

  if (boqCompletionPercentage === 0) {
    phaseLabel = 'Site Handover & Mobilization (0% Certified)';
    phaseStage = 1;
    phaseColor = 'text-blue-400 bg-blue-500/15 border-blue-500/30';
  } else if (boqCompletionPercentage < 25) {
    phaseLabel = `Initial Phase: Demolition & Civil Screed (${boqCompletionPercentage}%)`;
    phaseStage = 2;
    phaseColor = 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30';
  } else if (boqCompletionPercentage < 50) {
    phaseLabel = `Substructure & Core MEP Installation (${boqCompletionPercentage}%)`;
    phaseStage = 3;
    phaseColor = 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30';
  } else if (boqCompletionPercentage < 75) {
    phaseLabel = `Architectural Finishes, Ceilings & Glazing (${boqCompletionPercentage}%)`;
    phaseStage = 4;
    phaseColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
  } else if (boqCompletionPercentage < 95) {
    phaseLabel = `MEP Commissioning & Custom Joinery (${boqCompletionPercentage}%)`;
    phaseStage = 5;
    phaseColor = 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
  } else if (boqCompletionPercentage < 100) {
    phaseLabel = `Pre-Handover Snagging Clearance (${boqCompletionPercentage}%)`;
    phaseStage = 5;
    phaseColor = 'text-emerald-300 bg-emerald-500/20 border-emerald-500/40';
  } else {
    phaseLabel = 'BOQ 100% Certified — Ready for Handover';
    phaseStage = 6;
    phaseColor = 'text-emerald-200 bg-emerald-600/30 border-emerald-400/50';
  }

  return {
    totalBOQContractValue,
    totalCertifiedAmount,
    totalRemainingAmount,
    boqCompletionPercentage,
    raBillCount,
    latestRABillNumber,
    latestRABillDate,
    latestRABillGross,
    netPayableCertified,
    totalRetentionDeducted,
    totalAdvanceRecovered,
    totalItems,
    completedItems,
    inProgressItems,
    unstartedItems,
    phaseLabel,
    phaseStage,
    phaseColor,
    tradeBreakdown,
  };
}
