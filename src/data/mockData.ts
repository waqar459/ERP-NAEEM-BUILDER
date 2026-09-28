import {
  BranchMaster,
  Ticket,
  Project,
  WorkerExpense,
  GPSEvent,
  RetentionLedgerEntry,
  IncomeTaxConfig,
  AuditLogEntry,
  DailySiteLog,
  ConsolidatedInvoiceRecord,
} from '../types/erp';

export const INITIAL_BRANCHES: BranchMaster[] = [
  {
    id: 'BR-UBL-0640',
    code: '640',
    name: 'UBL Burki Branch Lahore Cantt',
    client: 'United Bank Limited',
    completeAddress: 'KHEWAT # 90, KHATOONI # 159 TO 161, NEAR GOVERNMENT BURKI HOSPITAL, LAHORE CANTT.',
    city: 'Lahore',
    region: 'Central',
    province: 'Punjab',
    latitude: 31.4880,
    longitude: 74.4920,
    branchContact: '0326-8250640 , 03224604659',
    bomName: 'Ali yousaf (BOM)',
    bomContact: '0326-8250640',
    branchType: 'Retail Hub',
    isActive: true,
  },
  {
    id: 'BR-UBL-0962',
    code: '962',
    name: 'UBL Liberty Market Branch Gulberg Lahore',
    client: 'United Bank Limited',
    completeAddress: '18, LIBERTY MARKET, GULBERG, LAHORE.',
    city: 'Lahore',
    region: 'Central',
    province: 'Punjab',
    latitude: 31.5120,
    longitude: 74.3435,
    branchContact: '03334224832, 03234843605',
    bomName: 'Rashid (BOM)',
    bomContact: '03334224832',
    branchType: 'Corporate Main',
    isActive: true,
  },
  {
    id: 'BR-UBL-2174',
    code: '2174',
    name: 'UBL Ameen Central Park Lahore Branch (ABEP DEC 2024)',
    client: 'United Bank Limited',
    completeAddress: 'Property NO.47, Block -B Central Park, Lahore.',
    city: 'Lahore',
    region: 'Central',
    province: 'Punjab',
    latitude: 31.3650,
    longitude: 74.3720,
    branchContact: '0321-5792687 / 0326-8252174',
    bomName: 'AQDAS QUDSIA (BOM)',
    bomContact: '0321-5792687',
    branchType: 'Islamic Banking Branch',
    isActive: true,
  },
  {
    id: 'BR-UBL-CHINIOT',
    code: '0233',
    name: 'UBL Faisalabad Road Chiniot Branch',
    client: 'United Bank Limited',
    completeAddress: 'Plot 14-B, Faisalabad Road, Near Tehsil Chowk, Chiniot',
    city: 'Chiniot',
    region: 'Central',
    province: 'Punjab',
    latitude: 31.7200,
    longitude: 72.9789,
    branchContact: '047-6331122',
    bomName: 'Muhammad Irfan (BOM)',
    bomContact: '0300-6543210',
    branchType: 'Retail Hub',
    isActive: true,
  },
  {
    id: 'BR-UBL-0118',
    code: '0118',
    name: 'UBL Blue Area Corporate Branch Islamabad',
    client: 'United Bank Limited',
    completeAddress: 'Ground Floor, State Life Building #5, Jinnah Avenue, Blue Area, Islamabad',
    city: 'Islamabad',
    region: 'Federal',
    province: 'Islamabad Capital Territory',
    latitude: 33.7182,
    longitude: 73.0605,
    branchContact: '+92 51 2801234',
    bomName: 'Kashif Abbasi (BOM)',
    bomContact: '+92 333 5123456',
    branchType: 'Corporate Main',
    isActive: true,
  },
  {
    id: 'BR-UBL-0001',
    code: '0001',
    name: 'UBL Head Office Tower Branch I.I. Chundrigar Karachi',
    client: 'United Bank Limited',
    completeAddress: 'UBL Tower, I.I. Chundrigar Road, Karachi',
    city: 'Karachi',
    region: 'South',
    province: 'Sindh',
    latitude: 24.8508,
    longitude: 67.0011,
    branchContact: '+92 21 32415500',
    bomName: 'Syed Tariq Shah (BOM)',
    bomContact: '+92 301 2233445',
    branchType: 'Corporate Main',
    isActive: true,
  },
  {
    id: 'BR-UBL-0450',
    code: '0450',
    name: 'UBL Clock Tower Commercial Branch Faisalabad',
    client: 'United Bank Limited',
    completeAddress: 'Circular Road, Kotwali Road Chowk, Near Clock Tower, Faisalabad',
    city: 'Faisalabad',
    region: 'Central',
    province: 'Punjab',
    latitude: 31.4187,
    longitude: 73.0791,
    branchContact: '+92 41 2618900',
    bomName: 'Mian Shahid Raza (BOM)',
    bomContact: '+92 345 7654321',
    branchType: 'Retail Hub',
    isActive: true,
  },
];

export const INITIAL_TICKETS: Ticket[] = [
  // 1. UBL Burki Branch 640 - Single Ticket (From User Image 123913.png)
  {
    id: 'TCK-123913',
    ticketNumber: '123913',
    ticketNumberStatus: 'ASSIGNED',
    ublBranchCode: '640',
    branchAddress: 'KHEWAT # 90, KHATOONI # 159 TO 161, NEAR GOVERNMENT BURKI HOSPITAL, LAHORE CANTT.',
    title: 'Ramp Repairing Work Required (Branch 640 Burki)',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-0640',
    branchName: 'UBL Burki Branch Lahore Cantt',
    city: 'Lahore',
    region: 'Central',
    category: 'Civil',
    complaintType: 'Ramps - - -',
    priority: 'High',
    status: 'Closed',
    reportedDate: '09/09/2026 13:36:38',
    reportedBy: 'Ali yousaf (BOM)',
    reportedByContact: '0326-8250640 , 03224604659',
    scopeDescription: 'ramp repairing work required. Anti-slip masonry ramp reconstruction with safety slope gradient and stainless steel grab rail anchoring per UBL branch standard.',
    emailSource: {
      emailId: 'EML-123913',
      subject: 'Complaint No 123913 Assignment - BURKI Branch',
      sender: 'here4u@ubl.com.pk',
      receivedAt: '09/09/2026 13:36:38',
      bodySnippet: 'Dear M/s Naeem Taj, Complaint No 123913 has been assigned to you. Issue: ramp repairing work required. Branch Code: 640 BURKI. Logged by Zubair.'
    },
    bankComplaintDetails: {
      complaintNumber: '123913',
      issueDetails: 'ramp repairing work required',
      status: 'Closed',
      complaintType: 'Ramps - - -',
      complaintDate: '09/09/2026 13:36:38',
      loggedBy: 'Zubair',
      vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
      vendorContact: '0370-5908566',
      branchCode: '640',
      branchName: 'BURKI',
      bom: 'Ali yousaf (BOM)',
      branchContactNumber: '0326-8250640 , 03224604659',
      branchAddress: 'KHEWAT # 90, KHATOONI # 159 TO 161, NEAR GOVERNMENT BURKI HOSPITAL, LAHORE CANTT.'
    },
    gmailThread: [
      {
        id: 'msg-123913-1',
        senderName: 'HERE4U UBL Helpdesk',
        senderEmail: 'here4u@ubl.com.pk',
        senderRole: 'United Bank Limited (HERE4U)',
        recipientEmails: ['naeembuilder48@gmail.com'],
        date: '09/09/2026 13:36:38',
        subject: 'Complaint No 123913 - BURKI',
        body: 'Dear M/s Naeem Taj,\n\nComplaint No 123913 has been assigned to you.\nComplaint Number: 123913\nIssue Details: ramp repairing work required\nBranch Code: 640\nBranch Name: BURKI\nBOM: Ali yousaf (BOM)\nAddress: KHEWAT # 90, KHATOONI # 159 TO 161, NEAR GOVERNMENT BURKI HOSPITAL, LAHORE CANTT.\n\nKindly rectify and submit signed Completion Certificate.\nRegards,\nZubair\nUnited Bank Limited',
        isBankInbound: true
      }
    ],
    siteVisit: {
      id: 'SV-123913',
      ticketId: 'TCK-123913',
      scheduledDate: '2026-09-09 15:00',
      completedDate: '2026-09-09 16:30',
      engineerName: 'Engr. Bilal Farooq',
      siteFindings: 'Existing entrance concrete ramp surface cracked and eroded. Requires chip chiseling, bond coat, 1:2:4 reinforced concrete ramp casting, and chequered anti-slip tiles.',
      photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=600&q=80'],
      gpsEvent: {
        id: 'GPS-SV-123913',
        eventType: 'Start Visit',
        employeeName: 'Engr. Bilal Farooq',
        timestamp: '2026-09-09 15:15',
        latitude: 31.4880,
        longitude: 74.4920,
        accuracyMeters: 5,
        targetBranchId: 'BR-UBL-0640',
        distanceToBranchMeters: 14,
        isWithinProximity: true,
        notes: 'GPS Verified: Within 14 meters of UBL Burki registered coordinates.'
      }
    },
    estimates: [
      {
        id: 'EST-123913-V1',
        ticketId: 'TCK-123913',
        version: 1,
        createdAt: '2026-09-09 17:00',
        createdBy: 'Naeem Taj',
        branchCode: '640',
        branchName: 'UBL Burki Branch Lahore Cantt',
        items: [
          { id: 'ITM-123913-1', itemCode: 'CIV-RAMP-01', description: 'Chiseling existing damaged surface, RCC 1:2:4 concrete ramp casting with BRC mesh', category: 'Civil', unit: 'Sq.Ft', quantity: 95, internalRate: 350, internalAmount: 33250, clientRate: 480, clientAmount: 45600 },
          { id: 'ITM-123913-2', itemCode: 'CIV-RAMP-02', description: 'Supply & laying heavy duty anti-slip chequered exterior tiles with Sika bond', category: 'Civil', unit: 'Sq.Ft', quantity: 95, internalRate: 220, internalAmount: 20900, clientRate: 320, clientAmount: 30400 },
          { id: 'ITM-123913-3', itemCode: 'CIV-RAIL-03', description: 'Anchor fixing 2" dia SS-304 stainless steel safety handrail with base plates', category: 'Civil', unit: 'R.Ft', quantity: 18, internalRate: 1400, internalAmount: 25200, clientRate: 2100, clientAmount: 37800 }
        ],
        directMaterialCost: 52000,
        directLabourCost: 18000,
        directSubcontractCost: 0,
        allocatedOverhead: 4500,
        totalDirectCost: 74500,
        targetGrossMarginPercent: 27.2,
        quotedAmountBeforeTax: 113800,
        taxPercent: 16,
        taxAmount: 18208,
        totalEstimatedAmount: 132008
      }
    ],
    quotation: {
      id: 'QUO-123913',
      quotationNumber: 'NB-QUO-2026-123913',
      ticketId: 'TCK-123913',
      dateSent: '2026-09-09 17:30',
      validUntil: '2026-10-09',
      items: [
        { id: 'ITM-123913-1', itemCode: 'RAMP CASTING:', description: 'Chiseling existing damaged surface, RCC 1:2:4 concrete ramp casting with BRC mesh', category: 'Civil', unit: 'Sq.Ft', quantity: 95, clientRate: 480, clientAmount: 45600 },
        { id: 'ITM-123913-2', itemCode: 'CHEQUERED TILES:', description: 'Supply & laying heavy duty anti-slip chequered exterior tiles with Sika bond', category: 'Civil', unit: 'Sq.Ft', quantity: 95, clientRate: 320, clientAmount: 30400 },
        { id: 'ITM-123913-3', itemCode: 'SS HANDRAIL:', description: 'Anchor fixing 2" dia SS-304 stainless steel safety handrail with base plates', category: 'Civil', unit: 'R.Ft', quantity: 18, clientRate: 2100, clientAmount: 37800 }
      ],
      subtotal: 113800,
      gstRate: 16,
      gstAmount: 18208,
      totalAmount: 132008,
      terms: 'Execution within 2 days. 12 months warranty on structural concrete and rail anchor.',
      status: 'Approved'
    },
    completionNote: {
      id: 'CDN-123913',
      docNumber: 'CDN-2026-123913',
      ticketId: 'TCK-123913',
      date: '2026-09-11',
      clientName: 'United Bank Limited',
      branchName: 'UBL Burki Branch Lahore Cantt',
      branchAddress: 'KHEWAT # 90, KHATOONI # 159 TO 161, NEAR GOVERNMENT BURKI HOSPITAL, LAHORE CANTT.',
      items: [
        { description: 'Concrete entrance ramp reconstruction with BRC reinforcement', quantity: 95, unit: 'Sq.Ft' },
        { description: 'Anti-slip chequered tile surface laying complete with grouting', quantity: 95, unit: 'Sq.Ft' },
        { description: 'SS-304 stainless safety handrail anchor fixing', quantity: 18, unit: 'R.Ft' }
      ],
      deliveredBy: 'Sajid Mahmood (Lead Mason)',
      deliveredByDesignation: 'Lead Civil Specialist - Naeem Builder',
      deliveredBySignature: 'Signed (Sajid Mahmood)',
      receivedBy: 'Ali yousaf',
      receivedByDesignation: 'Branch Operations Manager (BOM) - UBL',
      receivedBySignature: 'Signed & Branch Seal Affixed',
      branchStampUploaded: true,
      signedCopyUploaded: true,
      completionVerified: true,
      verificationDate: '2026-09-11 17:00',
      verifiedBy: 'Ali yousaf (BOM)'
    },
    invoice: {
      id: 'INV-123913',
      invoiceNumber: 'NB-INV-2026-123913',
      ticketId: 'TCK-123913',
      dateIssued: '2026-09-12',
      dueDate: '2026-09-27',
      clientName: 'United Bank Limited',
      branchName: 'UBL Burki Branch Lahore Cantt',
      isUnlocked: true,
      billingItems: [
        { description: 'RCC concrete ramp casting with BRC mesh', quantity: 95, unit: 'Sq.Ft', rate: 480, amount: 45600 },
        { description: 'Anti-slip chequered exterior tiles', quantity: 95, unit: 'Sq.Ft', rate: 320, amount: 30400 },
        { description: 'SS-304 stainless steel safety handrail', quantity: 18, unit: 'R.Ft', rate: 2100, amount: 37800 }
      ],
      subtotal: 113800,
      gstRatePercent: 16,
      gstAmount: 18208,
      totalInvoiceAmount: 132008,
      amountPaid: 132008,
      totalWithholdingTax: 5280,
      totalOtherDeductions: 0,
      outstandingBalance: 0,
      paymentStatus: 'Fully Paid',
      payments: [
        {
          id: 'PAY-123913',
          receiptNumber: 'REC-2026-0412',
          date: '2026-09-15',
          amount: 132008,
          paymentMethod: 'Bank Transfer',
          bankReference: 'UBL-FT-09159981',
          withholdingTaxDeducted: 5280,
          otherDeductions: 0,
          netReceived: 126728
        }
      ],
      gstFilingPeriod: 'September 2026',
      gstFilingStatus: 'Filed'
    },
    purchaseOrders: [],
    directPurchasingCost: 48500,
    directLabourCost: 16000,
    directFuelKmCost: 1800,
    directWorkerExpenses: 1200,
    emergencyExpenses: 0,
    totalDirectCost: 67500,
    netRevenue: 113800,
    grossProfit: 46300,
    grossMarginPercent: 40.68
  },

  // 2. UBL Liberty Market Branch 962 - Ticket 1 (From User Image 123758.png)
  {
    id: 'TCK-123758',
    ticketNumber: '123758',
    ticketNumberStatus: 'ASSIGNED',
    ublBranchCode: '962',
    branchAddress: '18, LIBERTY MARKET, GULBERG, LAHORE.',
    title: 'Cash Counter Glass Alignment Required (Branch 962)',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-0962',
    branchName: 'UBL Liberty Market Branch Gulberg Lahore',
    city: 'Lahore',
    region: 'Central',
    category: 'Glass & Aluminium',
    complaintType: 'Glass/Door/Wood Work - - -',
    priority: 'High',
    status: 'Work In Progress',
    reportedDate: '09/09/2026 09:44:20',
    reportedBy: 'Rashid (BOM)',
    reportedByContact: '03334224832, 03234843605',
    scopeDescription: 'cash counter glass alignment required. 12mm bullet-resistant anti-bandit counter glass bracket misalignment and stabilizing clamp tightening.',
    emailSource: {
      emailId: 'EML-123758',
      subject: 'Complaint No 123758 Assignment - LIBERTY MARKET',
      sender: 'here4u@ubl.com.pk',
      receivedAt: '09/09/2026 09:44:20',
      bodySnippet: 'Dear M/s Naeem Taj, Complaint No 123758 has been assigned to you. Issue: cash counter glass alignment required. Branch Code: 962 LIBERTY MARKET. Logged by Faraz Hussain.'
    },
    bankComplaintDetails: {
      complaintNumber: '123758',
      issueDetails: 'cash counter glass alignment required',
      status: 'InProgress',
      complaintType: 'Glass/Door/Wood Work - - -',
      complaintDate: '09/09/2026 09:44:20',
      loggedBy: 'Faraz Hussain',
      vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
      vendorContact: '0370-5908566',
      branchCode: '962',
      branchName: 'LIBERTY MARKET',
      bom: 'Rashid (BOM)',
      branchContactNumber: '03334224832, 03234843605',
      branchAddress: '18,LIBERTY MARKET, GULBERG,LAHORE.'
    },
    gmailThread: [
      {
        id: 'msg-123758-1',
        senderName: 'HERE4U Helpdesk',
        senderEmail: 'here4u@ubl.com.pk',
        senderRole: 'United Bank Limited (HERE4U)',
        recipientEmails: ['naeembuilder48@gmail.com'],
        date: '09/09/2026 09:44:20',
        subject: 'Complaint No 123758 - LIBERTY MARKET',
        body: 'Dear M/s Naeem Taj,\n\nComplaint No 123758 has been assigned to you.\nComplaint Number: 123758\nIssue Details: cash counter glass alignment required\nBranch Code: 962\nBranch Name: LIBERTY MARKET\nBOM: Rashid (BOM)\nBranch Address: 18,LIBERTY MARKET, GULBERG,LAHORE.\n\nYou are requested to rectify on urgent basis.\nRegards,\nFaraz Hussain\nUnited Bank Limited',
        isBankInbound: true
      }
    ],
    siteVisit: {
      id: 'SV-123758',
      ticketId: 'TCK-123758',
      scheduledDate: '2026-09-09 11:30',
      completedDate: '2026-09-09 12:45',
      engineerName: 'Engr. Bilal Farooq',
      siteFindings: 'Teller station #2 and #3 12mm tempered glass glazing channels tilted 15mm off axis due to loose sub-counter anchor bolts. Requires laser alignment and heavy SS clamping.',
      photos: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'],
      gpsEvent: {
        id: 'GPS-SV-123758',
        eventType: 'Start Visit',
        employeeName: 'Engr. Bilal Farooq',
        timestamp: '2026-09-09 11:40',
        latitude: 31.5120,
        longitude: 74.3435,
        accuracyMeters: 6,
        targetBranchId: 'BR-UBL-0962',
        distanceToBranchMeters: 18,
        isWithinProximity: true,
        notes: 'GPS Verified: 18 meters from Liberty Market registered coordinates.'
      }
    },
    estimates: [
      {
        id: 'EST-123758-V1',
        ticketId: 'TCK-123758',
        version: 1,
        createdAt: '2026-09-09 14:00',
        createdBy: 'Naeem Taj',
        branchCode: '962',
        branchName: 'UBL Liberty Market Branch',
        items: [
          { id: 'ITM-123758-1', itemCode: 'GLS-ALN-01', description: 'Laser leveling, alignment and re-anchoring of teller counter 12mm bullet resistant glass', category: 'Civil', unit: 'Job', quantity: 2, internalRate: 8500, internalAmount: 17000, clientRate: 14000, clientAmount: 28000 },
          { id: 'ITM-123758-2', itemCode: 'GLS-BRK-02', description: 'Heavy-duty solid stainless steel 304 glass holding clips and anchor expansion bolts', category: 'Civil', unit: 'Nos', quantity: 8, internalRate: 1800, internalAmount: 14400, clientRate: 2600, clientAmount: 20800 },
          { id: 'ITM-123758-3', itemCode: 'GLS-SIL-03', description: 'High-modulus structural silicon sealing between glass panels and Corian counter ledge', category: 'Civil', unit: 'Job', quantity: 1, internalRate: 3500, internalAmount: 3500, clientRate: 5800, clientAmount: 5800 }
        ],
        directMaterialCost: 24500,
        directLabourCost: 10400,
        directSubcontractCost: 0,
        allocatedOverhead: 3000,
        totalDirectCost: 37900,
        targetGrossMarginPercent: 30.6,
        quotedAmountBeforeTax: 54600,
        taxPercent: 16,
        taxAmount: 8736,
        totalEstimatedAmount: 63336
      }
    ],
    quotation: {
      id: 'QUO-123758',
      quotationNumber: 'NB-QUO-2026-123758',
      ticketId: 'TCK-123758',
      dateSent: '2026-09-09 14:30',
      validUntil: '2026-10-09',
      items: [
        { id: 'ITM-123758-1', itemCode: 'GLASS ALIGNMENT:', description: 'Laser leveling, alignment and re-anchoring of teller counter 12mm bullet resistant glass', category: 'Civil', unit: 'Job', quantity: 2, clientRate: 14000, clientAmount: 28000 },
        { id: 'ITM-123758-2', itemCode: 'SS-304 CLIPS:', description: 'Heavy-duty solid stainless steel 304 glass holding clips and anchor expansion bolts', category: 'Civil', unit: 'Nos', quantity: 8, clientRate: 2600, clientAmount: 20800 },
        { id: 'ITM-123758-3', itemCode: 'STRUCTURAL SILICONE:', description: 'High-modulus structural silicon sealing between glass panels and Corian counter ledge', category: 'Civil', unit: 'Job', quantity: 1, clientRate: 5800, clientAmount: 5800 }
      ],
      subtotal: 54600,
      gstRate: 16,
      gstAmount: 8736,
      totalAmount: 63336,
      terms: 'Execution within 24 hours of approval.',
      status: 'Approved'
    },
    workOrder: {
      id: 'WO-123758',
      workOrderNumber: 'NB-WO-2026-123758',
      ticketId: 'TCK-123758',
      issuedDate: '2026-09-10 09:00',
      scheduledStart: '2026-09-10 17:30',
      scheduledEnd: '2026-09-10 21:00',
      primaryWorkExecutor: 'Muhammad Rashid (Senior Glass Fabricator)',
      executorContact: '+92 312 9876543',
      assignedCrew: ['Muhammad Rashid', 'Zubair Rafiq (Glass Tech)'],
      scopeSummary: 'Align cash counter glasses, drill new anchor holes, torque SS-304 bolts, seal structural joints.',
      safetyInstructions: 'Safety suction cups and cut-resistant gloves mandatory on bullet-proof glass panels.',
      status: 'Started',
      startedAt: '2026-09-10 17:45'
    },
    purchaseOrders: [],
    directPurchasingCost: 21500,
    directLabourCost: 8000,
    directFuelKmCost: 1200,
    directWorkerExpenses: 900,
    emergencyExpenses: 0,
    totalDirectCost: 31600,
    netRevenue: 54600,
    grossProfit: 23000,
    grossMarginPercent: 42.12
  },

  // 3. UBL Liberty Market Branch 962 - Ticket 2 (Different Work at Different Time)
  {
    id: 'TCK-124890',
    ticketNumber: '124890',
    ticketNumberStatus: 'ASSIGNED',
    ublBranchCode: '962',
    branchAddress: '18, LIBERTY MARKET, GULBERG, LAHORE.',
    title: 'Emergency Chiller Failure & Main DB Panel Tripping (Branch 962)',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-0962',
    branchName: 'UBL Liberty Market Branch Gulberg Lahore',
    city: 'Lahore',
    region: 'Central',
    category: 'HVAC',
    complaintType: 'AC - - -',
    priority: 'Emergency',
    status: 'Approved',
    reportedDate: '14/09/2026 10:15:00',
    reportedBy: 'Rashid (BOM)',
    reportedByContact: '03334224832',
    scopeDescription: 'Complete breakdown of 15-ton rooftop packaged HVAC unit. Contactor shorted causing 400A main Distribution Board MCCB to trip repeatedly during banking peak hours.',
    emailSource: {
      emailId: 'EML-124890',
      subject: 'Complaint No 124890 - AC Breakdown & DB Tripping Liberty Market',
      sender: 'here4u@ubl.com.pk',
      receivedAt: '14/09/2026 10:15:00',
      bodySnippet: 'Dear Naeem Builders HERE4U Team, Branch primary AC unit has failed with burning smell and DB panel tripping. Dispatch urgent crew.'
    },
    bankComplaintDetails: {
      complaintNumber: '124890',
      issueDetails: 'Complete breakdown of 15-ton rooftop packaged HVAC unit',
      status: 'Approved',
      complaintType: 'AC - - -',
      complaintDate: '14/09/2026 10:15:00',
      loggedBy: 'Faraz Hussain',
      vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
      vendorContact: '0370-5908566',
      branchCode: '962',
      branchName: 'LIBERTY MARKET',
      bom: 'Rashid (BOM)',
      branchContactNumber: '03334224832',
      branchAddress: '18,LIBERTY MARKET, GULBERG,LAHORE.'
    },
    estimates: [
      {
        id: 'EST-124890-V1',
        ticketId: 'TCK-124890',
        version: 1,
        createdAt: '2026-09-14 12:30',
        createdBy: 'Naeem Taj',
        branchCode: '962',
        branchName: 'UBL Liberty Market Branch',
        items: [
          { id: 'ITM-1', itemCode: 'HVC-CON-01', description: 'Supply & installation of 65A Heavy Duty 3P Schneider Contactor', category: 'HVAC', unit: 'Nos', quantity: 2, internalRate: 14500, internalAmount: 29000, clientRate: 18500, clientAmount: 37000 },
          { id: 'ITM-2', itemCode: 'HVC-GAS-02', description: 'R-410A Virgin Refrigerant Gas Charging with vacuum pressure testing', category: 'HVAC', unit: 'Job', quantity: 1, internalRate: 22000, internalAmount: 22000, clientRate: 29000, clientAmount: 29000 },
          { id: 'ITM-3', itemCode: 'HVC-CAP-03', description: 'Replacement of 80uF dual motor start capacitors', category: 'HVAC', unit: 'Nos', quantity: 2, internalRate: 4800, internalAmount: 9600, clientRate: 7200, clientAmount: 14400 }
        ],
        directMaterialCost: 60600,
        directLabourCost: 9500,
        directSubcontractCost: 0,
        allocatedOverhead: 3500,
        totalDirectCost: 73600,
        targetGrossMarginPercent: 23.8,
        quotedAmountBeforeTax: 80400,
        taxPercent: 16,
        taxAmount: 12864,
        totalEstimatedAmount: 93264
      }
    ],
    quotation: {
      id: 'QUO-124890',
      quotationNumber: 'NB-QUO-2026-124890',
      ticketId: 'TCK-124890',
      dateSent: '2026-09-14 13:00',
      validUntil: '2026-10-14',
      items: [
        { id: 'ITM-1', itemCode: 'SCHNEIDER CONTACTOR:', description: 'Supply & installation of 65A Heavy Duty 3P Schneider Contactor', category: 'HVAC', unit: 'Nos', quantity: 2, clientRate: 18500, clientAmount: 37000 },
        { id: 'ITM-2', itemCode: 'R-410A GAS CHARGING:', description: 'R-410A Virgin Refrigerant Gas Charging with vacuum pressure testing', category: 'HVAC', unit: 'Job', quantity: 1, clientRate: 29000, clientAmount: 29000 },
        { id: 'ITM-3', itemCode: 'DUAL CAPACITORS:', description: 'Replacement of 80uF dual motor start capacitors', category: 'HVAC', unit: 'Nos', quantity: 2, clientRate: 7200, clientAmount: 14400 }
      ],
      subtotal: 80400,
      gstRate: 16,
      gstAmount: 12864,
      totalAmount: 93264,
      terms: 'Urgent emergency HVAC response executed under UBL SLA.',
      status: 'Approved'
    },
    approval: {
      id: 'APP-124890',
      ticketId: 'TCK-124890',
      requestDate: '2026-09-14 13:10',
      responseDate: '2026-09-14 14:05',
      requestedAmount: 93264,
      approvedAmount: 93264,
      approverName: 'Faraz Hussain (UBL Operations)',
      approverEmail: 'faraz.hussain@ubl.com.pk',
      approverDesignation: 'Area Engineering Coordinator, Central Region',
      approvalReference: 'UBL/OPS/2026/124890-APP',
      status: 'Approved'
    },
    purchaseOrders: [],
    directPurchasingCost: 55000,
    directLabourCost: 7500,
    directFuelKmCost: 1400,
    directWorkerExpenses: 1000,
    emergencyExpenses: 0,
    totalDirectCost: 64900,
    netRevenue: 80400,
    grossProfit: 15500,
    grossMarginPercent: 19.27
  },

  // 4. UBL Liberty Market Branch 962 - Work 3 (Estimate Requested on Branch Code FIRST, Ticket # Awaited Afterward)
  {
    id: 'TCK-EST-962-01',
    ticketNumber: 'EST-962-01',
    ticketNumberStatus: 'AWAITING_TICKET_NUMBER',
    provisionalEstimateCode: 'EST-962-01',
    ublBranchCode: '962',
    branchAddress: '18, LIBERTY MARKET, GULBERG, LAHORE.',
    title: 'Main Entrance Sunken Floor Tiles Screed & Re-Tiling (Estimate on Branch Code)',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-0962',
    branchName: 'UBL Liberty Market Branch Gulberg Lahore',
    city: 'Lahore',
    region: 'Central',
    category: 'Civil',
    complaintType: 'Paint/ Tile / Seepage / Front Elevation - - -',
    priority: 'Medium',
    status: 'Internal Estimate Prepared',
    reportedDate: '20/09/2026 11:30:00',
    reportedBy: 'Rashid (BOM)',
    reportedByContact: '03334224832',
    scopeDescription: 'BOM Rashid contacted Naeem Builder directly requesting immediate estimate for 350 Sft sunken floor tiles screeding at branch main entrance before formal UBL ticketing portal complaint number is generated. Ticket number will be generated afterward from HERE4U.',
    bankComplaintDetails: {
      complaintNumber: 'AWAITING-PORTAL-TICKET',
      issueDetails: 'Main entrance sunken floor tiles screed & re-tiling (Estimate requested on Branch Code)',
      status: 'Pending Ticket Number Issue',
      complaintType: 'Paint/ Tile / Seepage / Front Elevation - - -',
      complaintDate: '20/09/2026 11:30:00',
      loggedBy: 'Rashid (BOM Direct Call)',
      vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
      vendorContact: '0370-5908566',
      branchCode: '962',
      branchName: 'LIBERTY MARKET',
      bom: 'Rashid (BOM)',
      branchContactNumber: '03334224832',
      branchAddress: '18,LIBERTY MARKET, GULBERG,LAHORE.'
    },
    estimates: [
      {
        id: 'EST-962-01-V1',
        ticketId: 'TCK-EST-962-01',
        version: 1,
        createdAt: '2026-09-20 12:00',
        createdBy: 'Naeem Taj',
        isBranchCodeEstimate: true,
        branchCode: '962',
        branchName: 'UBL Liberty Market Branch Gulberg Lahore',
        branchAddress: '18, LIBERTY MARKET, GULBERG, LAHORE.',
        provisionalEstimateNumber: 'NB-EST-962-01',
        items: [
          { id: 'EST-ITM-1', itemCode: 'CIV-DEMO-01', description: 'Careful dismantling of damaged porcelain tiles and mortar bed without disturbing sub-conduits', category: 'Civil', unit: 'Sq.Ft', quantity: 350, internalRate: 65, internalAmount: 22750, clientRate: 95, clientAmount: 33250 },
          { id: 'EST-ITM-2', itemCode: 'CIV-SCREED-02', description: '50mm thick leveling screed with high early strength cement and Sika latex bonding agent', category: 'Civil', unit: 'Sq.Ft', quantity: 350, internalRate: 180, internalAmount: 63000, clientRate: 250, clientAmount: 87500 },
          { id: 'EST-ITM-3', itemCode: 'CIV-TILE-03', description: 'Providing and laying 600x600mm heavy commercial grade non-slip Master porcelain tiles', category: 'Civil', unit: 'Sq.Ft', quantity: 350, internalRate: 340, internalAmount: 119000, clientRate: 460, clientAmount: 161000 },
          { id: 'EST-ITM-4', itemCode: 'CIV-EPOXY-04', description: 'Filling tile joints with antimicrobial stain-free epoxy grout matching UBL theme color', category: 'Civil', unit: 'Sq.Ft', quantity: 350, internalRate: 50, internalAmount: 17500, clientRate: 75, clientAmount: 26250 }
        ],
        directMaterialCost: 154000,
        directLabourCost: 48000,
        directSubcontractCost: 0,
        allocatedOverhead: 12000,
        totalDirectCost: 214000,
        targetGrossMarginPercent: 25.4,
        quotedAmountBeforeTax: 308000,
        taxPercent: 16,
        taxAmount: 49280,
        totalEstimatedAmount: 357280
      }
    ],
    quotation: {
      id: 'QUO-EST-962-01',
      quotationNumber: 'NB-QUO-2026-EST-962-01',
      ticketId: 'TCK-EST-962-01',
      dateSent: '2026-09-20 13:00',
      validUntil: '2026-10-20',
      items: [
        { id: 'EST-ITM-1', itemCode: 'DISMANTLING:', description: 'Careful dismantling of damaged porcelain tiles and mortar bed without disturbing sub-conduits', category: 'Civil', unit: 'Sq.Ft', quantity: 350, clientRate: 95, clientAmount: 33250 },
        { id: 'EST-ITM-2', itemCode: 'LEVELING SCREED:', description: '50mm thick leveling screed with high early strength cement and Sika latex bonding agent', category: 'Civil', unit: 'Sq.Ft', quantity: 350, clientRate: 250, clientAmount: 87500 },
        { id: 'EST-ITM-3', itemCode: 'MASTER TILES 600X600:', description: 'Providing and laying 600x600mm heavy commercial grade non-slip Master porcelain tiles', category: 'Civil', unit: 'Sq.Ft', quantity: 350, clientRate: 460, clientAmount: 161000 },
        { id: 'EST-ITM-4', itemCode: 'EPOXY GROUTING:', description: 'Filling tile joints with antimicrobial stain-free epoxy grout matching UBL theme color', category: 'Civil', unit: 'Sq.Ft', quantity: 350, clientRate: 75, clientAmount: 26250 }
      ],
      subtotal: 308000,
      gstRate: 16,
      gstAmount: 49280,
      totalAmount: 357280,
      terms: 'Estimate submitted on Branch Code 962 basis. UBL official ticket number to be assigned afterward.',
      status: 'Sent'
    },
    purchaseOrders: [],
    directPurchasingCost: 0,
    directLabourCost: 0,
    directFuelKmCost: 0,
    directWorkerExpenses: 0,
    emergencyExpenses: 0,
    totalDirectCost: 0,
    netRevenue: 308000,
    grossProfit: 94000,
    grossMarginPercent: 30.5
  },

  // 5. UBL Ameen Central Park Branch 2174 (Existing Real Data)
  {
    id: 'TCK-125376',
    ticketNumber: '125376',
    ticketNumberStatus: 'ASSIGNED',
    ublBranchCode: '2174',
    branchAddress: 'Property NO.47, Block -B Central Park, Lahore.',
    title: 'Seepage Issue in Basement (Branch 2174 Central Park)',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-2174',
    branchName: 'UBL Ameen Central Park Lahore Branch (ABEP DEC 2024)',
    city: 'Lahore',
    region: 'Central',
    category: 'Civil',
    complaintType: 'Paint/ Tile / Seepage / Front Elevation - - -',
    priority: 'Emergency',
    status: 'Quotation Sent',
    reportedDate: '16/09/2026 12:35:48',
    reportedBy: 'AQDAS QUDSIA (BOM)',
    reportedByContact: '0321-5792687 / 0326-8252174',
    scopeDescription: 'Seepage issue in Basement. Paint/ Tile / Seepage / Front Elevation. You are requested to rectify on urgent basis. Kindly respond to this mail with Job Verification Certificate attached.',
    emailSource: {
      emailId: 'EML-125376',
      subject: 'Complaint No 125376 Assignment Notice',
      sender: 'hamaz.aftab@ubl.com.pk',
      receivedAt: '16/09/2026 12:35:48',
      bodySnippet: 'Dear M/s Naeem Taj, Complaint No 125376 has been assigned to you. Issue: Seepage issue in Basement. Branch Code: 2174 Central Park Lahore.'
    },
    bankComplaintDetails: {
      complaintNumber: '125376',
      issueDetails: 'Seepage issue in Basement',
      status: 'New',
      complaintType: 'Paint/ Tile / Seepage / Front Elevation - - -',
      complaintDate: '16/09/2026 12:35:48',
      loggedBy: 'Hamaz Aftab',
      vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
      vendorContact: '0370-5908566',
      branchCode: '2174',
      branchName: 'UBL Ameen Central Park Lahore Branch (ABEP DEC 2024)',
      bom: 'AQDAS QUDSIA',
      branchContactNumber: '0321-5792687/0326-8252174',
      branchAddress: 'Property NO.47, Block -B Central Park, Lahore.'
    },
    gmailThread: [
      {
        id: 'msg-125376-1',
        senderName: 'Hamaz Aftab',
        senderEmail: 'hamaz.aftab@ubl.com.pk',
        senderRole: 'United Bank Limited (HERE4U)',
        recipientEmails: ['naeembuilder48@gmail.com'],
        date: '16/09/2026 12:35:48',
        subject: 'Complaint No 125376 - UBL Ameen Central Park Lahore',
        body: 'Dear M/s Naeem Taj,\n\nComplaint No 125376 has been assigned to you. Below are the Complaint details:\n\nYou are requested to rectify on urgent basis. Kindly respond to this mail with Job Verification Certificate attached.\n\nRegards,\nHamaz Aftab\nUnited Bank Limited\nPTCL : 021-111-825-111 Ext :437348 (HERE4U)\nIP : 437348 (HERE4U)',
        isBankInbound: true
      }
    ],
    estimates: [
      {
        id: 'EST-125376-V1',
        ticketId: 'TCK-125376',
        version: 1,
        createdAt: '2026-09-17 10:00',
        createdBy: 'Naeem Taj',
        branchCode: '2174',
        branchName: 'UBL Ameen Central Park Lahore Branch',
        items: [
          { id: 'ITM-2174-1', itemCode: 'CIV-SEEP-01', description: 'Removing dampened plaster down to brick masonry, crystalline waterproof coating (2 coats SikaTop Seal-107)', category: 'Civil', unit: 'Sq.Ft', quantity: 240, internalRate: 160, internalAmount: 38400, clientRate: 230, clientAmount: 55200 },
          { id: 'ITM-2174-2', itemCode: 'CIV-PLAST-02', description: 'Re-plastering with water-repellent additive in 1:3 ratio, smooth finish', category: 'Civil', unit: 'Sq.Ft', quantity: 240, internalRate: 110, internalAmount: 26400, clientRate: 165, clientAmount: 39600 },
          { id: 'ITM-2174-3', itemCode: 'CIV-PAINT-03', description: 'Applying antifungal primer and 3 coats Berger Weathercoat interior vinyl paint matching branch standard', category: 'Civil', unit: 'Sq.Ft', quantity: 240, internalRate: 75, internalAmount: 18000, clientRate: 115, clientAmount: 27600 }
        ],
        directMaterialCost: 48000,
        directLabourCost: 22000,
        directSubcontractCost: 0,
        allocatedOverhead: 6000,
        totalDirectCost: 76000,
        targetGrossMarginPercent: 27.5,
        quotedAmountBeforeTax: 122400,
        taxPercent: 16,
        taxAmount: 19584,
        totalEstimatedAmount: 141984
      }
    ],
    quotation: {
      id: 'QUO-125376',
      quotationNumber: 'NB-QUO-2026-125376',
      ticketId: 'TCK-125376',
      dateSent: '2026-09-17 11:30',
      validUntil: '2026-10-17',
      items: [
        { id: 'ITM-2174-1', itemCode: 'WATERPROOF COAT:', description: 'Removing dampened plaster, 2 coats crystalline waterproof chemical barrier (SikaTop Seal-107)', category: 'Civil', unit: 'Sq.Ft', quantity: 240, clientRate: 230, clientAmount: 55200 },
        { id: 'ITM-2174-2', itemCode: 'WATER-REPELLENT PLASTER:', description: 'Re-plastering with water-repellent additive in 1:3 ratio, smooth finish', category: 'Civil', unit: 'Sq.Ft', quantity: 240, clientRate: 165, clientAmount: 39600 },
        { id: 'ITM-2174-3', itemCode: 'ANTIFUNGAL PAINT:', description: 'Antifungal primer and 3 coats Berger Weathercoat vinyl paint matching branch standard', category: 'Civil', unit: 'Sq.Ft', quantity: 240, clientRate: 115, clientAmount: 27600 }
      ],
      subtotal: 122400,
      gstRate: 16,
      gstAmount: 19584,
      totalAmount: 141984,
      terms: 'Execution within 48 hours of approval. 2-year anti-seepage guarantee.',
      status: 'Sent'
    },
    purchaseOrders: [],
    directPurchasingCost: 0,
    directLabourCost: 0,
    directFuelKmCost: 0,
    directWorkerExpenses: 0,
    emergencyExpenses: 0,
    totalDirectCost: 0,
    netRevenue: 122400,
    grossProfit: 46400,
    grossMarginPercent: 37.9
  },

  // 6. UBL Faisalabad Road Chiniot Branch 0233 (Existing Real Data)
  {
    id: 'TCK-125136',
    ticketNumber: '125136',
    ticketNumberStatus: 'ASSIGNED',
    ublBranchCode: '0233',
    branchAddress: 'Plot 14-B, Faisalabad Road, Near Tehsil Chowk, Chiniot',
    title: 'Ceiling Works & Lights Installation (Branch 0233 Chiniot)',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-CHINIOT',
    branchName: 'UBL Faisalabad Road Chiniot Branch',
    city: 'Chiniot',
    region: 'Central',
    category: 'Civil',
    complaintType: 'Paint/ Tile / Seepage / Front Elevation - - -',
    priority: 'High',
    status: 'Completion Verified',
    reportedDate: '2026-09-15 15:07:00',
    reportedBy: 'Hamaz Aftab (HERE4U)',
    reportedByContact: '021-111-825-111 Ext: 437348',
    scopeDescription: 'Providing and installation of 2x2 Gyp tiles with suspension grid system (120 Sft) and reinstalling existing light fixtures complete in all respects as per instructions of bank management.',
    emailSource: {
      emailId: 'EML-125136',
      subject: 'Ticket No :125136 - Complaint Assignment',
      sender: 'here4u@ubl.com.pk',
      receivedAt: 'Tuesday, 15 September 2026 3:07 PM',
      bodySnippet: 'Dear M/s Naeem Taj, Complaint No 125136 has been assigned to you. Below are the Complaint details: Faisalabad Road Chiniot Branch. Kindly submit quotation.'
    },
    bankComplaintDetails: {
      complaintNumber: '125136',
      issueDetails: 'Ceiling tiles damaged and lights require re-installation after HVAC duct service',
      status: 'Verified',
      complaintType: 'Paint/ Tile / Seepage / Front Elevation - - -',
      complaintDate: '15/09/2026 15:07:00',
      loggedBy: 'Hamaz Aftab (HERE4U Resolution Officer)',
      vendor: 'Naeem Taj (naeembuilder48@gmail.com)',
      vendorContact: '0370-5908566',
      branchCode: '0233',
      branchName: 'UBL Faisalabad Road Chiniot Branch',
      bom: 'Muhammad Irfan (BOM)',
      branchContactNumber: '047-6331122',
      branchAddress: 'Plot 14-B, Faisalabad Road, Near Tehsil Chowk, Chiniot'
    },
    estimates: [
      {
        id: 'EST-125136-V1',
        ticketId: 'TCK-125136',
        version: 1,
        createdAt: '2026-09-16 10:30',
        createdBy: 'Naeem Taj',
        branchCode: '0233',
        branchName: 'UBL Faisalabad Road Chiniot Branch',
        items: [
          { id: 'ITM-125136-01', itemCode: 'CEIL-2X2-01', category: 'Civil', description: '2 x 2 CEILING: Providing and installation DFB/United back foiled Square type Gyp tiles 24"x24" with suspension system', quantity: 120, unit: 'Sft', internalRate: 110, internalAmount: 13200, clientRate: 160, clientAmount: 19200 },
          { id: 'ITM-125136-02', itemCode: 'LIGHT-REINST-02', category: 'Civil', description: 'LIGHTS INSTALLATION WORKS: Making arrangement to reinstall lights in new installed sheets', quantity: 1, unit: 'Job', internalRate: 2000, internalAmount: 2000, clientRate: 3500, clientAmount: 3500 }
        ],
        directMaterialCost: 11500,
        directLabourCost: 3700,
        directSubcontractCost: 0,
        allocatedOverhead: 1500,
        totalDirectCost: 16700,
        targetGrossMarginPercent: 26.4,
        quotedAmountBeforeTax: 22700,
        taxPercent: 16,
        taxAmount: 3632,
        totalEstimatedAmount: 26332
      }
    ],
    quotation: {
      id: 'QUO-125136',
      quotationNumber: 'NB-QUO-2026-125136',
      ticketId: 'TCK-125136',
      dateSent: '2026-09-16 11:20',
      validUntil: '2026-10-16',
      items: [
        { id: 'ITM-125136-01', itemCode: '2 x 2 CEILING:', description: 'Providing and installation back foiled Square type Gyp tiles 24"x24" with suspension system', category: 'Civil', unit: 'Sft', quantity: 120, clientRate: 160, clientAmount: 19200 },
        { id: 'ITM-125136-02', itemCode: 'LIGHTS INSTALLATION WORKS:', description: 'Making arrangement to reinstall lights in new installed sheets', category: 'Civil', unit: 'Job', quantity: 1, clientRate: 3500, clientAmount: 3500 }
      ],
      subtotal: 22700,
      gstRate: 16,
      gstAmount: 3632,
      totalAmount: 26332,
      terms: 'Execution completed on after-hours schedule.',
      status: 'Approved'
    },
    completionNote: {
      id: 'CDN-125136',
      docNumber: 'CDN-2026-125136',
      ticketId: 'TCK-125136',
      date: '2026-09-17',
      clientName: 'United Bank Limited',
      branchName: 'UBL Faisalabad Road Chiniot Branch',
      branchAddress: 'Plot 14-B, Faisalabad Road, Near Tehsil Chowk, Chiniot',
      items: [
        { description: '2x2 Gypsum false ceiling tiles installation', quantity: 120, unit: 'Sft' },
        { description: 'Light fixtures re-installation and testing', quantity: 1, unit: 'Job' }
      ],
      deliveredBy: 'Zahid Hussain (Ceiling Tech)',
      deliveredByDesignation: 'Lead Interior Tech - Naeem Builder',
      deliveredBySignature: 'Signed (Zahid Hussain)',
      receivedBy: 'Muhammad Irfan',
      receivedByDesignation: 'Branch Operations Manager (BOM) - UBL',
      receivedBySignature: 'Signed & Branch Seal Affixed',
      branchStampUploaded: true,
      signedCopyUploaded: true,
      completionVerified: true,
      verificationDate: '2026-09-17 18:00',
      verifiedBy: 'Muhammad Irfan (BOM)'
    },
    purchaseOrders: [],
    directPurchasingCost: 11500,
    directLabourCost: 3700,
    directFuelKmCost: 1100,
    directWorkerExpenses: 800,
    emergencyExpenses: 0,
    totalDirectCost: 17100,
    netRevenue: 22700,
    grossProfit: 5600,
    grossMarginPercent: 24.66
  },

  // 7. UBL Head Office Tower Karachi Branch 0001
  {
    id: 'TCK-122480',
    ticketNumber: '122480',
    ticketNumberStatus: 'ASSIGNED',
    ublBranchCode: '0001',
    branchAddress: 'UBL Tower, I.I. Chundrigar Road, Karachi',
    title: 'Cash Counter Anti-Bandit Bullet-Proof Glass Re-anchoring',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-0001',
    branchName: 'UBL Head Office Tower Branch I.I. Chundrigar Karachi',
    city: 'Karachi',
    region: 'South',
    category: 'Civil',
    complaintType: 'Glass/Door/Wood Work - - -',
    priority: 'High',
    status: 'GST Filed',
    reportedDate: '2026-09-10 08:30',
    reportedBy: 'Syed Tariq Shah (BOM)',
    reportedByContact: '+92 301 2233445',
    scopeDescription: 'Re-anchoring of loose teller station bullet-resistant composite glazing bracket assembly with heavy Hilti expansion anchors at UBL Tower teller counters.',
    estimates: [
      {
        id: 'EST-122480-V1',
        ticketId: 'TCK-122480',
        version: 1,
        createdAt: '2026-09-10',
        createdBy: 'Naeem Taj',
        branchCode: '0001',
        branchName: 'UBL Tower Karachi Branch',
        items: [
          { id: 'EST-ITM-01', itemCode: 'MAT-CIV-09', category: 'Civil', description: 'Hilti HSA M12 heavy anchor studs & brackets', quantity: 6, unit: 'Nos', internalRate: 3500, internalAmount: 21000, clientRate: 5000, clientAmount: 30000 },
          { id: 'EST-ITM-02', itemCode: 'LAB-CIV-04', category: 'Civil', description: 'Specialized structural glass realignment & anchoring crew', quantity: 1, unit: 'Job', internalRate: 14000, internalAmount: 14000, clientRate: 25000, clientAmount: 25000 }
        ],
        directMaterialCost: 21000,
        directLabourCost: 14000,
        directSubcontractCost: 0,
        allocatedOverhead: 4000,
        totalDirectCost: 39000,
        targetGrossMarginPercent: 29.1,
        quotedAmountBeforeTax: 55000,
        taxPercent: 13,
        taxAmount: 7150,
        totalEstimatedAmount: 62150
      }
    ],
    completionNote: {
      id: 'CDN-122480',
      docNumber: 'CDN-2026-122480',
      ticketId: 'TCK-122480',
      date: '2026-09-12',
      clientName: 'United Bank Limited',
      branchName: 'UBL Head Office Tower Branch I.I. Chundrigar Karachi',
      branchAddress: 'UBL Tower, I.I. Chundrigar Road, Karachi',
      items: [
        { description: 'Anti-bandit bullet resistant glass counter structural re-anchoring with Hilti HSA M12 studs', quantity: 1, unit: 'Job' },
        { description: 'High-tensile structural stainless channel brackets 4mm thickness', quantity: 6, unit: 'Nos' }
      ],
      deliveredBy: 'Sajid Mahmood (Lead Fabricator)',
      deliveredByDesignation: 'Lead Structural Fabricator - Naeem Builder',
      deliveredBySignature: 'Signed (Sajid Mahmood)',
      receivedBy: 'Syed Tariq Shah',
      receivedByDesignation: 'Branch Operations Manager - UBL',
      receivedBySignature: 'Signed & Branch Seal Affixed',
      branchStampUploaded: true,
      signedCopyUploaded: true,
      completionVerified: true,
      verificationDate: '2026-09-12 18:30',
      verifiedBy: 'Syed Tariq Shah (BOM)'
    },
    invoice: {
      id: 'INV-122480',
      invoiceNumber: 'NB-INV-2026-122480',
      ticketId: 'TCK-122480',
      dateIssued: '2026-09-13',
      dueDate: '2026-09-28',
      clientName: 'United Bank Limited',
      branchName: 'UBL Head Office Tower Branch I.I. Chundrigar Karachi',
      isUnlocked: true,
      billingItems: [
        { description: 'Anti-bandit bullet resistant glass counter structural re-anchoring', quantity: 1, unit: 'Job', rate: 68000, amount: 68000 },
        { description: 'High-tensile structural stainless channel brackets 4mm', quantity: 6, unit: 'Nos', rate: 4500, amount: 27000 }
      ],
      subtotal: 95000,
      gstRatePercent: 13, // Sindh Revenue Board (SRB) 13%
      gstAmount: 12350,
      totalInvoiceAmount: 107350,
      amountPaid: 103550,
      totalWithholdingTax: 3800,
      totalOtherDeductions: 0,
      outstandingBalance: 0,
      paymentStatus: 'Fully Paid',
      payments: [
        {
          id: 'PAY-122480',
          receiptNumber: 'REC-2026-0199',
          date: '2026-09-16',
          amount: 103550,
          paymentMethod: 'Bank Transfer',
          bankReference: 'FT-UBL-091629810',
          withholdingTaxDeducted: 3800,
          otherDeductions: 0,
          netReceived: 103550
        }
      ],
      gstFilingPeriod: 'September 2026',
      gstFilingStatus: 'Filed'
    },
    purchaseOrders: [],
    directPurchasingCost: 28000,
    directLabourCost: 14000,
    directFuelKmCost: 2200,
    directWorkerExpenses: 1800,
    emergencyExpenses: 0,
    totalDirectCost: 46000,
    netRevenue: 95000,
    grossProfit: 49000,
    grossMarginPercent: 51.58
  }
];

// System 2: Complete Branch Build-up Projects (Master Record: Project)
export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'PRJ-UBL-LHR-012',
    projectCode: 'PRJ-UBL-LHR-012',
    title: 'UBL Liberty Market Branch Complete Turnkey Build-Up & Renovation',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-0962',
    branchName: 'UBL Liberty Market Branch Gulberg Lahore',
    region: 'Central',
    province: 'Punjab',
    city: 'Lahore',
    completeAddress: '18, LIBERTY MARKET, GULBERG, LAHORE.',
    latitude: 31.5120,
    longitude: 74.3435,
    contractAwardDate: '2026-07-01',
    awardNumber: 'UBL-HO-ENG-2026-049',
    startDate: '2026-07-10',
    expectedCompletionDate: '2026-10-30',
    contractValue: 24500000, // PKR 24.5 Million
    revisedContractValue: 24500000,
    projectManager: 'Engr. Zohaib Hassan (Senior Project Director)',
    status: 'Under Execution',
    overallProgressPercent: 68,
    
    // Physical Hardcopy Work Order (Tender Project - Strictly NOT on Gmail)
    isPhysicalWorkOrderIssued: true,
    physicalWorkOrderNumber: 'UBL/HO/CREG/WO-2026-049',
    physicalWorkOrderDate: '2026-07-08',
    physicalWorkOrderAuthority: 'UBL Head Office - Corporate Real Estate & Engineering Division, Karachi',
    workOrderNotes: 'Complete branch tender awarded via official paper bid. Physical hardcopy work order issued by UBL HO Engineering Division. Work commenced strictly post-issuance. Governed by 3 Running Bills: RA-01, RA-02, RA-03 (Final with 10% Retention holding). Not handled via Gmail.',
    salesTaxPraPercent: 16,
    incomeTaxWhtPercent: 9,
    retentionPercentOnThirdBill: 10,
    dlpPeriodMonths: 6,
    boq: [
      {
        id: 'BOQ-01',
        itemCode: 'CIV-01',
        category: 'Civil Works',
        description: 'Dismantling, structural plastering, floor leveling screed 50mm, porcelain floor tiles 600x600mm RAK/Master Grade A',
        unit: 'Sq.Ft',
        contractQuantity: 5200,
        rate: 650,
        contractAmount: 3380000,
        revisedQuantity: 5200,
        completedQuantity: 4200,
        remainingQuantity: 1000
      },
      {
        id: 'BOQ-02',
        itemCode: 'CIV-02',
        category: 'Civil Works',
        description: 'Gypsum false ceiling 2x2 tiles with hot dipped galvanized T-Grid system and acoustic moisture-resistant board',
        unit: 'Sq.Ft',
        contractQuantity: 4800,
        rate: 380,
        contractAmount: 1824000,
        revisedQuantity: 4800,
        completedQuantity: 3600,
        remainingQuantity: 1200
      },
      {
        id: 'BOQ-03',
        itemCode: 'ELE-01',
        category: 'Electrical & Lighting',
        description: 'Main LT Distribution Panel 630A with ABB breakers, ATS automatic transfer switch, changeover and copper busbars',
        unit: 'Job',
        contractQuantity: 1,
        rate: 2200000,
        contractAmount: 2200000,
        revisedQuantity: 1,
        completedQuantity: 1,
        remainingQuantity: 0
      },
      {
        id: 'BOQ-04',
        itemCode: 'ELE-02',
        category: 'Electrical & Lighting',
        description: 'Point wiring with Pakistan Cables 3/029 and 7/029, PVC conduits, Clipsal modular switches, sockets, and earthing pit',
        unit: 'Nos',
        contractQuantity: 320,
        rate: 3200,
        contractAmount: 1024000,
        revisedQuantity: 320,
        completedQuantity: 260,
        remainingQuantity: 60
      },
      {
        id: 'BOQ-05',
        itemCode: 'HVC-01',
        category: 'HVAC Ducting & AC',
        description: 'Inverter VRF Multi-Split HVAC system 36 HP with ducted indoor units, galvanized ducting with 19mm nitrile rubber insulation',
        unit: 'Job',
        contractQuantity: 1,
        rate: 4800000,
        contractAmount: 4800000,
        revisedQuantity: 1,
        completedQuantity: 0.8,
        remainingQuantity: 0.2
      },
      {
        id: 'BOQ-06',
        itemCode: 'CR-01',
        category: 'Carpentry & Woodwork',
        description: 'Custom Cash Teller Counter (4-station) with Korean solid acrylic surface, bullet-resistant composite backing, lockable drawers',
        unit: 'R.Ft',
        contractQuantity: 36,
        rate: 28000,
        contractAmount: 1008000,
        revisedQuantity: 36,
        completedQuantity: 28,
        remainingQuantity: 8
      },
      {
        id: 'BOQ-07',
        itemCode: 'SEC-01',
        category: 'Security & Vault',
        description: 'Bank Strong Room Vault Class-1 reinforced blast and drill resistant vault door with dual combination & time locks',
        unit: 'Nos',
        contractQuantity: 1,
        rate: 3400000,
        contractAmount: 3400000,
        revisedQuantity: 1,
        completedQuantity: 1,
        remainingQuantity: 0
      },
      {
        id: 'BOQ-08',
        itemCode: 'SEC-02',
        category: 'Security & Vault',
        description: 'ATM Vestibule glass cubicle with 12mm clear tempered glass, Dorma floor spring, heavy duty magnetic shear locks, and access pad',
        unit: 'Job',
        contractQuantity: 2,
        rate: 850000,
        contractAmount: 1700000,
        revisedQuantity: 2,
        completedQuantity: 2,
        remainingQuantity: 0
      },
      {
        id: 'BOQ-09',
        itemCode: 'SGN-01',
        category: 'Signage & Branding',
        description: 'Exterior 3D acrylic LED illuminated facade fascia signage, pylons, interior vinyl brand logos, directional sign plates',
        unit: 'Job',
        contractQuantity: 1,
        rate: 1650000,
        contractAmount: 1650000,
        revisedQuantity: 1,
        completedQuantity: 0.5,
        remainingQuantity: 0.5
      },
      {
        id: 'BOQ-10',
        itemCode: 'PLM-01',
        category: 'Plumbing & Sanitary',
        description: 'Executive & customer washrooms plumbing, PPR-C water supply, UPVC drainage, Grohe CP fittings, Porta vanity and sanitary fixtures',
        unit: 'Job',
        contractQuantity: 1,
        rate: 1514000,
        contractAmount: 1514000,
        revisedQuantity: 1,
        completedQuantity: 0.9,
        remainingQuantity: 0.1
      }
    ],
    raBills: [
      {
        id: 'RA-01',
        billNumber: 'RA-01',
        projectId: 'PRJ-MBL-LHR-012',
        billDate: '2026-08-05',
        periodStart: '2026-07-10',
        periodEnd: '2026-07-31',
        items: [
          {
            boqItemId: 'BOQ-01',
            itemCode: 'CIV-01',
            description: 'Dismantling, plastering, floor tiles',
            unit: 'Sq.Ft',
            contractRate: 650,
            contractQuantity: 5200,
            previousCertifiedQuantity: 0,
            currentCertifiedQuantity: 2200,
            cumulativeQuantity: 2200,
            remainingQuantity: 3000,
            currentAmount: 1430000
          },
          {
            boqItemId: 'BOQ-03',
            itemCode: 'ELE-01',
            description: 'Main LT Distribution Panel 630A with ABB',
            unit: 'Job',
            contractRate: 2200000,
            contractQuantity: 1,
            previousCertifiedQuantity: 0,
            currentCertifiedQuantity: 1,
            cumulativeQuantity: 1,
            remainingQuantity: 0,
            currentAmount: 2200000
          },
          {
            boqItemId: 'BOQ-07',
            itemCode: 'SEC-01',
            description: 'Bank Strong Room Vault Class-1 Door',
            unit: 'Nos',
            contractRate: 3400000,
            contractQuantity: 1,
            previousCertifiedQuantity: 0,
            currentCertifiedQuantity: 1,
            cumulativeQuantity: 1,
            remainingQuantity: 0,
            currentAmount: 3400000
          }
        ],
        grossCertifiedAmount: 7030000,
        previousCumulativeGross: 0,
        currentBillGross: 7030000,
        advanceMobilizationDeduction: 703000, // 10% advance recovery
        retentionMoneyDeductionPercent: 5,     // 5% retention per contract
        retentionMoneyDeductionAmount: 351500, // 5% of gross
        netPayableAmount: 5975500,
        status: 'Paid',
        certifiedByConsultant: 'Arch. M. Kamran (Design Bureau Consult)',
        certificationDate: '2026-08-08'
      },
      {
        id: 'RA-02',
        billNumber: 'RA-02',
        projectId: 'PRJ-MBL-LHR-012',
        billDate: '2026-09-02',
        periodStart: '2026-08-01',
        periodEnd: '2026-08-31',
        items: [
          {
            boqItemId: 'BOQ-01',
            itemCode: 'CIV-01',
            description: 'Dismantling, plastering, floor tiles',
            unit: 'Sq.Ft',
            contractRate: 650,
            contractQuantity: 5200,
            previousCertifiedQuantity: 2200,
            currentCertifiedQuantity: 2000,
            cumulativeQuantity: 4200,
            remainingQuantity: 1000,
            currentAmount: 1300000
          },
          {
            boqItemId: 'BOQ-02',
            itemCode: 'CIV-02',
            description: 'Gypsum false ceiling 2x2 tiles with T-Grid',
            unit: 'Sq.Ft',
            contractRate: 380,
            contractQuantity: 4800,
            previousCertifiedQuantity: 0,
            currentCertifiedQuantity: 3600,
            cumulativeQuantity: 3600,
            remainingQuantity: 1200,
            currentAmount: 1368000
          },
          {
            boqItemId: 'BOQ-04',
            itemCode: 'ELE-02',
            description: 'Point wiring with Pakistan Cables 3/029',
            unit: 'Nos',
            contractRate: 3200,
            contractQuantity: 320,
            previousCertifiedQuantity: 0,
            currentCertifiedQuantity: 260,
            cumulativeQuantity: 260,
            remainingQuantity: 60,
            currentAmount: 832000
          },
          {
            boqItemId: 'BOQ-06',
            itemCode: 'CR-01',
            description: 'Custom Cash Teller Counter with Korean top',
            unit: 'R.Ft',
            contractRate: 28000,
            contractQuantity: 36,
            previousCertifiedQuantity: 0,
            currentCertifiedQuantity: 28,
            cumulativeQuantity: 28,
            remainingQuantity: 8,
            currentAmount: 784000
          },
          {
            boqItemId: 'BOQ-08',
            itemCode: 'SEC-02',
            description: 'ATM Vestibule glass cubicle complete',
            unit: 'Job',
            contractRate: 850000,
            contractQuantity: 2,
            previousCertifiedQuantity: 0,
            currentCertifiedQuantity: 2,
            cumulativeQuantity: 2,
            remainingQuantity: 0,
            currentAmount: 1700000
          }
        ],
        grossCertifiedAmount: 5984000,
        previousCumulativeGross: 7030000,
        currentBillGross: 5984000,
        advanceMobilizationDeduction: 598400,
        retentionMoneyDeductionPercent: 5,
        retentionMoneyDeductionAmount: 299200,
        netPayableAmount: 5086400,
        status: 'Client Approved',
        certifiedByConsultant: 'Arch. M. Kamran (Design Bureau Consult)',
        certificationDate: '2026-09-06'
      }
    ],
    purchaseOrders: [
      {
        id: 'PO-PRJ-01',
        poNumber: 'NB-PO-2026-0201',
        projectId: 'PRJ-UBL-LHR-012',
        supplierName: 'Pak Steel & Cement Mill Agency',
        orderDate: '2026-07-12',
        expectedDeliveryDate: '2026-07-15',
        status: 'Material Received',
        items: [
          { materialName: 'Deformed Steel Grade 60 (Mughal)', quantity: 12, unit: 'Tons', supplierQuoteRate: 265000, totalRate: 3180000, receivedQty: 12, allocatedToJob: true },
          { materialName: 'Bestway Falcon Cement Bags', quantity: 600, unit: 'Bags', supplierQuoteRate: 1420, totalRate: 852000, receivedQty: 600, allocatedToJob: true }
        ],
        totalCost: 4032000,
        paymentTerms: '50% advance, 50% on site delivery',
        grnNumber: 'GRN-PRJ-001',
        receivingNote: 'Certified grade 60 test report verified by site engineer.'
      }
    ],
    totalBilledAmount: 13014000, // RA-01 + RA-02 gross
    totalReceivedAmount: 11061900,
    totalRetentionHeld: 650700, // 351,500 + 299,200
    totalOutstanding: 1952100,
    directMaterialCost: 7850000,
    directLabourCost: 2100000,
    directSubcontractCost: 4200000,
    directFuelKmCost: 180000,
    directSiteExpenses: 210000,
    totalActualProjectCost: 14540000,
    grossProjectProfit: 9960000,
    grossProfitMarginPercent: 40.65
  },
  {
    id: 'PRJ-UBL-ISB-008',
    projectCode: 'PRJ-UBL-ISB-008',
    title: 'UBL Blue Area Corporate Branch Full Renovation & Build-Up',
    client: 'United Bank Limited',
    branchId: 'BR-UBL-0118',
    branchName: 'UBL Blue Area Corporate Branch Islamabad',
    region: 'Federal',
    province: 'Islamabad Capital Territory',
    city: 'Islamabad',
    completeAddress: 'Ground Floor, State Life Building #5, Jinnah Avenue, Blue Area, Islamabad',
    latitude: 33.7182,
    longitude: 73.0605,
    contractAwardDate: '2026-08-15',
    awardNumber: 'UBL-HO-CIV-2026-118',
    startDate: '2026-09-01',
    expectedCompletionDate: '2026-12-15',
    contractValue: 38000000, // PKR 38 Million
    revisedContractValue: 38000000,
    projectManager: 'Engr. Shahbaz Malik (Project Director North)',
    status: 'Under Execution',
    overallProgressPercent: 22,
    
    // Physical Hardcopy Work Order (Tender Project - Strictly NOT on Gmail)
    isPhysicalWorkOrderIssued: true,
    physicalWorkOrderNumber: 'UBL/HO/CREG/WO-2026-118',
    physicalWorkOrderDate: '2026-08-25',
    physicalWorkOrderAuthority: 'UBL Head Office - Corporate Real Estate & Engineering Division, Islamabad/Karachi',
    workOrderNotes: 'Physical work order stamped & signed by Head of Corporate Real Estate. 3 Running Bills structure applicable: RA-01, RA-02, RA-03 (10% Retention held). 16% PRA / 9% Income Tax deduction.',
    salesTaxPraPercent: 16,
    incomeTaxWhtPercent: 9,
    retentionPercentOnThirdBill: 10,
    dlpPeriodMonths: 6,
    boq: [
      {
        id: 'ISB-BOQ-01',
        itemCode: 'CIV-ISB-01',
        category: 'Civil Works',
        description: 'Complete floor demolition, marble restoration and epoxy terrazzo laying',
        unit: 'Sq.Ft',
        contractQuantity: 7500,
        rate: 820,
        contractAmount: 6150000,
        revisedQuantity: 7500,
        completedQuantity: 2100,
        remainingQuantity: 5400
      },
      {
        id: 'ISB-BOQ-02',
        itemCode: 'HVC-ISB-02',
        category: 'HVAC Ducting & AC',
        description: 'Central Chiller Water piping with York Fan Coil Units (FCU) & air balancing',
        unit: 'Job',
        contractQuantity: 1,
        rate: 8900000,
        contractAmount: 8900000,
        revisedQuantity: 1,
        completedQuantity: 0.25,
        remainingQuantity: 0.75
      }
    ],
    raBills: [],
    purchaseOrders: [],
    totalBilledAmount: 0,
    totalReceivedAmount: 0,
    totalRetentionHeld: 0,
    totalOutstanding: 0,
    directMaterialCost: 2800000,
    directLabourCost: 950000,
    directSubcontractCost: 1200000,
    directFuelKmCost: 65000,
    directSiteExpenses: 80000,
    totalActualProjectCost: 5095000,
    grossProjectProfit: 0,
    grossProfitMarginPercent: 0
  }
];

// Section 15: Retention Ledger (Retention Held - Retention Released = Retention Balance)
export const INITIAL_RETENTION_LEDGER: RetentionLedgerEntry[] = [
  {
    id: 'RET-001',
    projectId: 'PRJ-UBL-LHR-012',
    projectTitle: 'UBL Liberty Market Branch Complete Turnkey Build-Up & Renovation',
    client: 'United Bank Limited',
    raBillNumber: 'RA-01',
    dateHeld: '2026-08-05',
    retentionRatePercent: 5,
    heldAmount: 351500,
    releasedAmount: 0,
    balanceAmount: 351500,
    releaseCondition: '50% upon Final Handover Certificate, 50% after 180-day DLP',
    approvalStatus: 'Held in Escrow'
  },
  {
    id: 'RET-002',
    projectId: 'PRJ-UBL-LHR-012',
    projectTitle: 'UBL Liberty Market Branch Complete Turnkey Build-Up & Renovation',
    client: 'United Bank Limited',
    raBillNumber: 'RA-02',
    dateHeld: '2026-09-02',
    retentionRatePercent: 5,
    heldAmount: 299200,
    releasedAmount: 0,
    balanceAmount: 299200,
    releaseCondition: '50% upon Final Handover Certificate, 50% after 180-day DLP',
    approvalStatus: 'Held in Escrow'
  },
  {
    id: 'RET-003',
    projectId: 'PRJ-UBL-FSD-004',
    projectTitle: 'UBL Faisalabad Main Branch Turnkey Build-Up (Prior Year)',
    client: 'United Bank Limited',
    raBillNumber: 'Final Bill',
    dateHeld: '2026-02-15',
    retentionRatePercent: 5,
    heldAmount: 850000,
    releasedAmount: 850000,
    balanceAmount: 0,
    releaseCondition: 'Released after completion of 6-month DLP Defect Liability Period',
    approvalStatus: 'Released & Paid',
    releaseApprovedBy: 'Head of Engineering - UBL',
    releaseDate: '2026-08-20',
    bankReference: 'UBL-CHQ-990812'
  }
];

// Section 9: Worker Expenses & Fuel/KM Engine
export const INITIAL_EXPENSES: WorkerExpense[] = [
  {
    id: 'EXP-101',
    ticketId: 'TCK-124890',
    employeeName: 'Engr. Bilal Farooq',
    employeeDesignation: 'Site Inspection Engineer',
    date: '2026-09-14',
    category: 'Fuel/KM',
    amount: 1400,
    description: 'Site visit for emergency chiller tripping at UBL Liberty Market branch (Branch 962)',
    status: 'Approved',
    approvedBy: 'Admin Manager',
    approvalDate: '2026-09-14',
    fuelDetails: {
      vehicleType: 'Car',
      startPoint: 'Naeem Builder Head Office (Garden Town, Lahore)',
      destination: 'UBL Liberty Market Branch (Branch 962)',
      claimedKm: 40,
      routeCalculatedKm: 38,
      ratePerKm: 35, // Rs 35 per KM company car policy
      calculatedAllowance: 1330,
      isDistanceDiscrepancyFlagged: false // Within 15% tolerance
    }
  },
  {
    id: 'EXP-102',
    ticketId: 'TCK-124890',
    employeeName: 'Muhammad Rashid',
    employeeDesignation: 'Senior MEP Technician',
    date: '2026-09-14',
    category: 'Emergency Material',
    amount: 500,
    description: 'High-temp insulating tape and PVC wire ties purchased cash locally',
    status: 'Approved',
    approvedBy: 'Procurement Officer',
    approvalDate: '2026-09-14'
  },
  {
    id: 'EXP-103',
    projectId: 'PRJ-UBL-LHR-012',
    employeeName: 'Usman Ghani',
    employeeDesignation: 'Quality Control Supervisor',
    date: '2026-09-19',
    category: 'Fuel/KM',
    amount: 2800,
    description: 'Inspection trip for floor tile alignment and marble batch verification at UBL Liberty Market site',
    status: 'Submitted',
    fuelDetails: {
      vehicleType: 'Car',
      startPoint: 'Naeem Builder Head Office',
      destination: 'Gujranwala Tile Warehouse to UBL Liberty Market Site',
      claimedKm: 80,
      routeCalculatedKm: 58,
      ratePerKm: 35,
      calculatedAllowance: 2030,
      isDistanceDiscrepancyFlagged: true // 80 KM claimed vs 58 KM route: Flagged > 15%!
    }
  },
  {
    id: 'EXP-104',
    ticketId: 'TCK-123758',
    employeeName: 'Zubair Rafiq',
    employeeDesignation: 'Glass Specialist Tech',
    date: '2026-09-10',
    category: 'Fuel/KM',
    amount: 540,
    description: 'Bike fuel for site inspection of cash counter glass alignment at UBL Liberty Market (Branch 962)',
    status: 'Approved',
    approvedBy: 'Admin Manager',
    approvalDate: '2026-09-10',
    fuelDetails: {
      vehicleType: 'Motorcycle',
      startPoint: 'Workshop (Model Town)',
      destination: 'UBL Liberty Market Branch (Branch 962)',
      claimedKm: 30,
      routeCalculatedKm: 28,
      ratePerKm: 18, // Rs 18 per KM bike policy
      calculatedAllowance: 504,
      isDistanceDiscrepancyFlagged: false
    }
  }
];

// Section 8: GPS Event Logs
export const INITIAL_GPS_EVENTS: GPSEvent[] = [
  {
    id: 'GPS-001',
    eventType: 'Start Visit',
    employeeName: 'Engr. Bilal Farooq',
    timestamp: '2026-09-09 11:40',
    latitude: 31.5120,
    longitude: 74.3435,
    accuracyMeters: 6,
    targetBranchId: 'BR-UBL-0962',
    distanceToBranchMeters: 18,
    isWithinProximity: true,
    notes: 'Proximity Verified: 18 meters from UBL Liberty Market registered coordinates.'
  },
  {
    id: 'GPS-002',
    eventType: 'Start Work',
    employeeName: 'Muhammad Rashid',
    timestamp: '2026-09-10 17:45',
    latitude: 31.5119,
    longitude: 74.3436,
    accuracyMeters: 8,
    targetBranchId: 'BR-UBL-0962',
    distanceToBranchMeters: 16,
    isWithinProximity: true,
    notes: 'Primary executor logged in-bounds at UBL Liberty Market.'
  },
  {
    id: 'GPS-003',
    eventType: 'Branch Verification',
    employeeName: 'Engr. Bilal Farooq',
    timestamp: '2026-09-09 15:15',
    latitude: 31.4880,
    longitude: 74.4920,
    accuracyMeters: 5,
    targetBranchId: 'BR-UBL-0640',
    distanceToBranchMeters: 14,
    isWithinProximity: true,
    notes: 'Verified inside UBL Burki Branch (Branch 640 Cantt).'
  }
];

// Section 12: Configurable Income Tax & Audit
export const DEFAULT_INCOME_TAX_CONFIG: IncomeTaxConfig = {
  regimeName: 'FBR Normal Tax Regime (Corporate Builders & Contractors)',
  taxRatePercent: 29.0, // 29% corporate income tax
  minimumTurnoverTaxPercent: 1.25,
  effectiveStartDate: '2026-07-01',
  notes: 'Configurable under Section 12 of Master Blueprint. GST maintained separately from profit.'
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-09-09 13:36',
    user: 'Ali yousaf (BOM)',
    role: 'HERE4U Operator',
    action: 'CREATE_TICKET',
    entityType: 'Ticket',
    entityId: '123913',
    details: 'Ticket logged via incoming UBL HERE4U email for Burki Branch 640 ramp repairing.'
  },
  {
    id: 'AUD-002',
    timestamp: '2026-09-14 14:05',
    user: 'Faraz Hussain (UBL Operations)',
    role: 'Approver',
    action: 'APPROVE_QUOTATION',
    entityType: 'Approval',
    entityId: 'APP-124890',
    details: 'Financial approval granted for PKR 93,264 under authorization ref UBL/OPS/2026/124890-APP.'
  },
  {
    id: 'AUD-003',
    timestamp: '2026-09-10 09:00',
    user: 'Operations Controller',
    role: 'Procurement',
    action: 'ISSUE_WORK_ORDER',
    entityType: 'PurchaseOrder',
    entityId: 'NB-WO-2026-123758',
    details: 'Primary work executor Muhammad Rashid assigned for Branch 962 cash counter glass alignment.'
  },
  {
    id: 'AUD-004',
    timestamp: '2026-09-11 17:00',
    user: 'Ali yousaf (BOM)',
    role: 'Approver',
    action: 'VERIFY_COMPLETION',
    entityType: 'DeliveryNote',
    entityId: 'CDN-2026-123913',
    details: 'Completion note signed & stamped with branch seal. Work verified on site. Invoice unlocked.'
  },
  {
    id: 'AUD-005',
    timestamp: '2026-09-02 16:00',
    user: 'Mian Tariq',
    role: 'Project Manager',
    action: 'CERTIFY_RA_BILL',
    entityType: 'RABill',
    entityId: 'RA-02',
    details: 'Certified RA-02 for PKR 5,984,000 gross at UBL Liberty Market. 5% retention PKR 299,200 held in escrow.'
  }
];

// System 2: Daily Site Logs with Labor Count, Weather & GPS-Tagged Progress Photos
export const INITIAL_DAILY_SITE_LOGS: DailySiteLog[] = [
  {
    id: 'DSL-2026-001',
    projectId: 'PRJ-UBL-LHR-012',
    projectCode: 'PRJ-UBL-LHR-012',
    projectTitle: 'UBL Liberty Market Branch Complete Turnkey Build-Up & Renovation',
    branchName: 'UBL Liberty Market Branch Gulberg Lahore',
    date: '2026-09-22',
    shift: 'Day Shift (08:00 - 17:00)',
    recordedBy: 'Engr. Shahbaz Ahmed',
    recordedRole: 'Senior Site Resident Engineer',
    totalLaborHeadcount: 24,
    totalManHours: 192,
    laborBreakdown: [
      { trade: 'Civil / Masonry', headcount: 6, regularHours: 8, overtimeHours: 0, contractorName: 'Naeem Builder Civil Crew' },
      { trade: 'Electrical', headcount: 4, regularHours: 8, overtimeHours: 1, contractorName: 'ElectraPower Tech' },
      { trade: 'HVAC / Mechanical', headcount: 3, regularHours: 8, overtimeHours: 0, contractorName: 'CoolBreeze Air' },
      { trade: 'Carpentry & Woodwork', headcount: 4, regularHours: 8, overtimeHours: 2, contractorName: 'MasterCraft Interiors' },
      { trade: 'Plumbing & Sanitary', headcount: 2, regularHours: 8, overtimeHours: 0, contractorName: 'FlowRight Systems' },
      { trade: 'General Helpers', headcount: 4, regularHours: 8, overtimeHours: 0, contractorName: 'Naeem Builder General' },
      { trade: 'Supervisors & Safety', headcount: 1, regularHours: 8, overtimeHours: 0, contractorName: 'Al-Madina Safety Lead' },
    ],
    weatherCondition: 'Sunny / Clear',
    temperatureCelsius: 32,
    humidityPercent: 48,
    weatherWorkImpact: 'Normal Operations',
    weatherNotes: 'Clear dry weather, ideal for screed curing and external ATM canopy cladding.',
    workSummary: 'Continued ATM vestibule structural framing, completed branch manager cabin gypsum ceiling grid, and laid DB cables from main LT panel.',
    completedTasks: [
      'Completed 100% false ceiling channel framing in Operations Hall (Grid 4-7)',
      'Laid 3x 16mm² sub-main armored cables for UPS back-up board',
      'Completed brick masonry for customer washrooms and plumbing rough-in',
      'Applied 1st coat weather-shield primer on front elevation portal'
    ],
    materialsReceived: [
      '50 Bags Fauji Portland Cement',
      '12 Bundles 12mm G.I. Threaded Ceiling Rods',
      '2,400 R.Ft 2.5mm² Pakistan Cables Copper Wire (Single Core)'
    ],
    equipmentOnSite: [
      '1x 10kVA Diesel Backup Generator',
      '2x Laser Leveling Instruments',
      '4x Scaffolding Tower Units',
      '1x Concrete Mixer Machine'
    ],
    safetyObservations: 'All 24 workers equipped with mandatory PPE (helmets, high-vis vests, steel-toe boots). Scaffold tag green-inspected.',
    delaysOrObstacles: 'LESCO scheduled load management between 11:00 - 13:00; site transitioned seamlessly to backup generator without work interruption.',
    photos: [
      {
        id: 'PH-DSL-001-A',
        url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156a?auto=format&fit=crop&w=1000&q=80',
        caption: 'Operations hall ceiling framing and HVAC ducting installation',
        timestamp: '2026-09-22 10:45',
        tradeCategory: 'Carpentry & HVAC',
        gps: {
          latitude: 31.52048,
          longitude: 74.35869,
          accuracyMeters: 4.8,
          distanceToBranchMeters: 18,
          isWithinRadius: true,
          locationName: 'Inside Main Banking Hall, Ground Floor'
        }
      },
      {
        id: 'PH-DSL-001-B',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1000&q=80',
        caption: 'External ATM vestibule canopy structural steel prep & branding facade',
        timestamp: '2026-09-22 14:15',
        tradeCategory: 'Civil / Masonry',
        gps: {
          latitude: 31.52039,
          longitude: 74.35873,
          accuracyMeters: 5.2,
          distanceToBranchMeters: 12,
          isWithinRadius: true,
          locationName: 'Front Porch / Street Entrance'
        }
      },
      {
        id: 'PH-DSL-001-C',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80',
        caption: 'Main LT distribution panel termination and DB sub-feeder glanding',
        timestamp: '2026-09-22 16:30',
        tradeCategory: 'Electrical',
        gps: {
          latitude: 31.52044,
          longitude: 74.35878,
          accuracyMeters: 3.5,
          distanceToBranchMeters: 22,
          isWithinRadius: true,
          locationName: 'Electrical / Server Room Hub'
        }
      }
    ],
    submissionGps: {
      latitude: 31.52045,
      longitude: 74.35872,
      accuracyMeters: 4.2,
      distanceToBranchMeters: 15,
      isWithinProximity: true,
      capturedAt: '2026-09-22 17:15'
    },
    status: 'Verified by PM',
    verifiedByConsultant: 'Consultant Arch. Tariq Masood'
  },
  {
    id: 'DSL-2026-002',
    projectId: 'PRJ-UBL-LHR-012',
    projectCode: 'PRJ-UBL-LHR-012',
    projectTitle: 'UBL Liberty Market Branch Complete Turnkey Build-Up & Renovation',
    branchName: 'UBL Liberty Market Branch Gulberg Lahore',
    date: '2026-09-21',
    shift: 'Day Shift (08:00 - 17:00)',
    recordedBy: 'Engr. Shahbaz Ahmed',
    recordedRole: 'Senior Site Resident Engineer',
    totalLaborHeadcount: 22,
    totalManHours: 176,
    laborBreakdown: [
      { trade: 'Civil / Masonry', headcount: 8, regularHours: 8, overtimeHours: 0, contractorName: 'Naeem Builder Civil Crew' },
      { trade: 'Electrical', headcount: 3, regularHours: 8, overtimeHours: 0, contractorName: 'ElectraPower Tech' },
      { trade: 'HVAC / Mechanical', headcount: 2, regularHours: 8, overtimeHours: 0, contractorName: 'CoolBreeze Air' },
      { trade: 'Plumbing & Sanitary', headcount: 3, regularHours: 8, overtimeHours: 0, contractorName: 'FlowRight Systems' },
      { trade: 'General Helpers', headcount: 5, regularHours: 8, overtimeHours: 0, contractorName: 'Naeem Builder General' },
      { trade: 'Supervisors & Safety', headcount: 1, regularHours: 8, overtimeHours: 0, contractorName: 'Al-Madina Safety Lead' }
    ],
    weatherCondition: 'Partly Cloudy',
    temperatureCelsius: 29,
    humidityPercent: 62,
    weatherWorkImpact: 'Normal Operations',
    weatherNotes: 'Pleasant overcast sky. Good humidity for curing internal plaster.',
    workSummary: 'Completed floor leveling survey, core drilling for VRF refrigerant piping, and masonry work around strong room perimeter.',
    completedTasks: [
      'Finished core cuts (4-inch dia) through beam per consultant structural approval',
      'Completed 9-inch brickwork masonry around vault / strongroom perimeter',
      'Tested drainage pressure lines in toilet duct (held 6 bar for 4 hours without drop)'
    ],
    materialsReceived: [
      '120 Running Meters Copper Refrigerant Pipe (3/8" & 5/8")',
      '1x 1000-Liter Sintex Water Storage Tank'
    ],
    photos: [
      {
        id: 'PH-DSL-002-A',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=80',
        caption: 'Strongroom reinforced masonry wall alignment and lintel bar placement',
        timestamp: '2026-09-21 11:20',
        tradeCategory: 'Civil / Masonry',
        gps: {
          latitude: 31.52042,
          longitude: 74.35874,
          accuracyMeters: 4.0,
          distanceToBranchMeters: 14,
          isWithinRadius: true,
          locationName: 'Strong Room Area, Rear Wing'
        }
      },
      {
        id: 'PH-DSL-002-B',
        url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Plumbing manifold and PPR-C water supply vertical stack installation',
        timestamp: '2026-09-21 15:40',
        tradeCategory: 'Plumbing & Sanitary',
        gps: {
          latitude: 31.52046,
          longitude: 74.35871,
          accuracyMeters: 5.1,
          distanceToBranchMeters: 19,
          isWithinRadius: true,
          locationName: 'Service Duct 02'
        }
      }
    ],
    submissionGps: {
      latitude: 31.52041,
      longitude: 74.35870,
      accuracyMeters: 4.8,
      distanceToBranchMeters: 16,
      isWithinProximity: true,
      capturedAt: '2026-09-21 17:30'
    },
    status: 'Verified by PM',
    verifiedByConsultant: 'Consultant Arch. Tariq Masood'
  },
  {
    id: 'DSL-2026-003',
    projectId: 'PRJ-ABL-FSD-004',
    projectCode: 'PRJ-ABL-FSD-004',
    projectTitle: 'Allied Bank Clock Tower Heritage Commercial Branch Fit-Out',
    branchName: 'Allied Bank Clock Tower Commercial',
    date: '2026-09-22',
    shift: 'Day Shift (08:00 - 17:00)',
    recordedBy: 'Sub-Engr. Bilal Farooq',
    recordedRole: 'Site Engineer',
    totalLaborHeadcount: 18,
    totalManHours: 144,
    laborBreakdown: [
      { trade: 'Civil / Masonry', headcount: 4, regularHours: 8, overtimeHours: 0, contractorName: 'Faisalabad Heritage Guild' },
      { trade: 'Carpentry & Woodwork', headcount: 6, regularHours: 8, overtimeHours: 1, contractorName: 'MasterCraft Interiors' },
      { trade: 'Electrical', headcount: 3, regularHours: 8, overtimeHours: 0, contractorName: 'ElectraPower Tech' },
      { trade: 'General Helpers', headcount: 4, regularHours: 8, overtimeHours: 0, contractorName: 'Local Labor Force' },
      { trade: 'Supervisors & Safety', headcount: 1, regularHours: 8, overtimeHours: 0, contractorName: 'Al-Madina Safety Lead' }
    ],
    weatherCondition: 'Sunny / Clear',
    temperatureCelsius: 34,
    humidityPercent: 42,
    weatherWorkImpact: 'Normal Operations',
    weatherNotes: 'Hot afternoon, scheduled hydration breaks arranged for workers on roof structure.',
    workSummary: 'Installed solid teak branch manager reception desk frame, completed heritage cornice plaster restoration, and pulled cat-6 data wiring.',
    completedTasks: [
      'Restored 22 R.ft heritage lime-cornice moulding per bank historic guidelines',
      'Installed modular counter skeleton for 3 teller stations',
      'Concealed conduit lines in floor chases for under-desk power tracks'
    ],
    materialsReceived: [
      '24 Sheets Marine Plywood 18mm',
      '1x Roll Cat-6 UTP 305m Schneider Electric'
    ],
    photos: [
      {
        id: 'PH-DSL-003-A',
        url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80',
        caption: 'Teller counters joinery skeleton fabrication and acoustic baffle positioning',
        timestamp: '2026-09-22 11:30',
        tradeCategory: 'Carpentry & Woodwork',
        gps: {
          latitude: 31.41875,
          longitude: 73.07915,
          accuracyMeters: 4.4,
          distanceToBranchMeters: 25,
          isWithinRadius: true,
          locationName: 'Front Banking Hall Counters'
        }
      }
    ],
    submissionGps: {
      latitude: 31.41872,
      longitude: 73.07910,
      accuracyMeters: 5.0,
      distanceToBranchMeters: 22,
      isWithinProximity: true,
      capturedAt: '2026-09-22 17:05'
    },
    status: 'Submitted'
  }
];

// Section: UBL HERE4U Consolidated Invoices (Batched under Rs. 500,000 threshold)
export const INITIAL_CONSOLIDATED_INVOICES: ConsolidatedInvoiceRecord[] = [
  {
    id: 'CON-2026-UBL-001',
    batchNumber: 'CON-2026-UBL-001',
    dateCreated: '2026-09-12',
    dateDepositedToAccountsOffice: '2026-09-13',
    datePaid: '2026-09-16',
    status: 'Paid via Online Transfer',
    maxLimitThreshold: 500000,
    ticketIds: ['TCK-123913'],
    totalGrossAmount: 132008,
    salesTaxPraRate: 16,
    salesTaxPraAmount: 21121,
    incomeTaxWhtRate: 14,
    incomeTaxWhtAmount: 18481,
    totalTaxDeductions: 39602,
    netOnlineTransferAmount: 92406,
    bankTransferReference: 'UBL-FT-09159981',
    fbrPraTaxChallanProofRef: 'PRA-CPR-2026-09-8812903',
    depositedBy: 'Asif Nawaz (Accounts & Tax Compliance)',
    accountsOfficeNotes: 'Consolidated batch hard copy verified with all 4 attachments: (1) Ticket rise hard copy, (2) Gmail approval printout, (3) Burki branch signed & stamped completion note, (4) Individual invoice. Online transfer completed.',
  },
  {
    id: 'CON-2026-UBL-002',
    batchNumber: 'CON-2026-UBL-002',
    dateCreated: '2026-09-15',
    dateDepositedToAccountsOffice: '2026-09-16',
    status: 'Deposited to UBL Accounts Office',
    maxLimitThreshold: 500000,
    ticketIds: ['TCK-124890'],
    totalGrossAmount: 93264,
    salesTaxPraRate: 16,
    salesTaxPraAmount: 14922,
    incomeTaxWhtRate: 14,
    incomeTaxWhtAmount: 13057,
    totalTaxDeductions: 27979,
    netOnlineTransferAmount: 65285,
    depositedBy: 'Asif Nawaz (Accounts Head)',
    accountsOfficeNotes: 'Hard copy dossier submitted to UBL Accounts Division (Central Zone). Audit in progress against Rs. 500,000 threshold ceiling.',
  }
];


