// Revenue calculation engine with discount logic
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';

export interface CampusCalculation {
  campusId: string;
  campusName: string;
  shortName: string;
  currentRenewalStudents: number;
  currentNewStudents: number;
  currentTotalStudents: number;
  projectedRenewalStudents: number;
  projectedNewStudents: number;
  projectedTotalStudents: number;
  currentRenewalRevenue: number;
  currentNewRevenue: number;
  currentGrossRevenue: number;
  currentNetRevenue: number;
  projectedRenewalRevenue: number;
  projectedNewRevenue: number;
  projectedGrossRevenue: number;
  projectedNetRevenue: number;
  revenueChange: number;
  revenueChangePercent: number;
  isOverCapacity: boolean;
  capacityUtilization: number;
}

export interface ClassCalculation {
  className: string;
  currentRenewalStudents: number;
  currentNewStudents: number;
  currentTotalStudents: number;
  projectedRenewalStudents: number;
  projectedNewStudents: number;
  projectedTotalStudents: number;
  currentRevenue: number;
  projectedRevenue: number;
  revenueChange: number;
}

export interface HostelCalculation {
  hostelId: string;
  hostelName: string;
  currentOccupancy: number;
  projectedOccupancy: number;
  currentRevenue: number;
  projectedRevenue: number;
  revenueChange: number;
  utilizationPercent: number;
}

export interface TotalCalculation {
  schoolStudents: number;
  hostelStudents: number;
  totalStudents: number;
  projectedSchoolStudents: number;
  schoolRevenue: number;
  hostelRevenue: number;
  totalRevenue: number;
  currentSchoolRevenue: number;
  currentHostelRevenue: number;
  currentTotalRevenue: number;
  // Additional fees
  annualFeeRevenue: number;
  dcpRevenue: number;
  grandTotalRevenue: number;
  newAdmissionFeeRevenue: number;
  projectedNewStudents: number;
  // Discount tracking
  currentDiscountAmount: number;
  projectedDiscountAmount: number;
  lastYearDiscountPercent: number;
  projectedDiscountPercent: number;
}

// Calculate revenue for a single campus
export function calculateCampusRevenue(
  campus: CampusData,
  globalSettings: GlobalSettings
): CampusCalculation {
  const effectiveNewStudentGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
  const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
  const discountRate = campus.discountRate / 100;

  let currentRenewalStudents = 0;
  let currentNewStudents = 0;
  let currentRenewalRevenue = 0;
  let currentNewRevenue = 0;
  let projectedRenewalRevenue = 0;
  let projectedNewRevenue = 0;

  let projectedRenewalStudentsTotal = 0;
  let projectedNewStudentsTotal = 0;

  campus.classes.forEach(cls => {
    // Current counts
    currentRenewalStudents += cls.renewalCount;
    currentNewStudents += cls.newAdmissionCount;

    // Current revenue (before applying any changes)
    currentRenewalRevenue += cls.renewalCount * cls.renewalFee;
    currentNewRevenue += cls.newAdmissionCount * cls.newAdmissionFee;

    // Projected counts: use direct forecast if provided, otherwise calculate
    const projRenewal = cls.forecastedRenewalCount !== undefined 
      ? cls.forecastedRenewalCount 
      : Math.round(cls.renewalCount * (1 + effectiveRenewalGrowth));
    const projNew = cls.forecastedNewCount !== undefined 
      ? cls.forecastedNewCount 
      : Math.round(cls.newAdmissionCount * (1 + effectiveNewStudentGrowth));

    projectedRenewalStudentsTotal += projRenewal;
    projectedNewStudentsTotal += projNew;

    // Projected revenue with separate fee hikes
    const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
    const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);

    projectedRenewalRevenue += projRenewal * hikedRenewalFee;
    projectedNewRevenue += projNew * hikedNewFee;
  });

  const currentTotalStudents = currentRenewalStudents + currentNewStudents;
  const projectedRenewalStudents = projectedRenewalStudentsTotal;
  const projectedNewStudents = projectedNewStudentsTotal;
  const projectedTotalStudents = projectedRenewalStudents + projectedNewStudents;

  const currentGrossRevenue = currentRenewalRevenue + currentNewRevenue;
  const currentNetRevenue = currentGrossRevenue * (1 - discountRate);

  const projectedGrossRevenue = projectedRenewalRevenue + projectedNewRevenue;
  const projectedNetRevenue = projectedGrossRevenue * (1 - discountRate);

  const revenueChange = projectedNetRevenue - currentNetRevenue;
  const revenueChangePercent = currentNetRevenue > 0 
    ? ((projectedNetRevenue - currentNetRevenue) / currentNetRevenue) * 100 
    : 0;

  return {
    campusId: campus.id,
    campusName: campus.name,
    shortName: campus.shortName,
    currentRenewalStudents,
    currentNewStudents,
    currentTotalStudents,
    projectedRenewalStudents,
    projectedNewStudents,
    projectedTotalStudents,
    currentRenewalRevenue,
    currentNewRevenue,
    currentGrossRevenue,
    currentNetRevenue,
    projectedRenewalRevenue,
    projectedNewRevenue,
    projectedGrossRevenue,
    projectedNetRevenue,
    revenueChange,
    revenueChangePercent,
    isOverCapacity: projectedTotalStudents > campus.maxCapacity,
    capacityUtilization: (projectedTotalStudents / campus.maxCapacity) * 100,
  };
}

// Calculate per-class breakdown for a campus
export function calculateClassBreakdown(
  campus: CampusData,
  globalSettings: GlobalSettings
): ClassCalculation[] {
  const effectiveNewStudentGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
  const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
  const discountRate = campus.discountRate / 100;

  return campus.classes
    .filter(cls => cls.renewalCount > 0 || cls.newAdmissionCount > 0 || cls.renewalFee > 0)
    .map(cls => {
      const currentRenewalStudents = cls.renewalCount;
      const currentNewStudents = cls.newAdmissionCount;
      const currentTotalStudents = currentRenewalStudents + currentNewStudents;

      // Use direct forecast if provided, otherwise calculate based on growth rate
      const projectedRenewalStudents = cls.forecastedRenewalCount !== undefined 
        ? cls.forecastedRenewalCount 
        : Math.round(currentRenewalStudents * (1 + effectiveRenewalGrowth));
      const projectedNewStudents = cls.forecastedNewCount !== undefined 
        ? cls.forecastedNewCount 
        : Math.round(currentNewStudents * (1 + effectiveNewStudentGrowth));
      const projectedTotalStudents = projectedRenewalStudents + projectedNewStudents;

      const currentRevenue = (currentRenewalStudents * cls.renewalFee + currentNewStudents * cls.newAdmissionFee) * (1 - discountRate);

      const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
      const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);
      const projectedRevenue = (projectedRenewalStudents * hikedRenewalFee + projectedNewStudents * hikedNewFee) * (1 - discountRate);

      const revenueChange = projectedRevenue - currentRevenue;

      return {
        className: cls.className,
        currentRenewalStudents,
        currentNewStudents,
        currentTotalStudents,
        projectedRenewalStudents,
        projectedNewStudents,
        projectedTotalStudents,
        currentRevenue,
        projectedRevenue,
        revenueChange,
      };
    });
}

// Calculate hostel revenue
export function calculateHostelRevenue(hostel: HostelData): HostelCalculation {
  // Current revenue uses last year fee, projected uses forecasted fee
  const currentRevenue = hostel.currentOccupancy * (hostel.lastYearFeePerStudent || hostel.feePerStudent);
  const projectedRevenue = hostel.currentOccupancy * hostel.feePerStudent;
  
  return {
    hostelId: hostel.id,
    hostelName: hostel.name,
    currentOccupancy: hostel.currentOccupancy,
    projectedOccupancy: hostel.currentOccupancy,
    currentRevenue,
    projectedRevenue,
    revenueChange: projectedRevenue - currentRevenue,
    utilizationPercent: (hostel.currentOccupancy / hostel.maxCapacity) * 100,
  };
}

// Calculate all totals
export function calculateTotals(
  campuses: CampusData[],
  hostels: HostelData[],
  globalSettings: GlobalSettings
): TotalCalculation {
  let currentSchoolStudents = 0;
  let projectedSchoolStudents = 0;
  let projectedNewStudents = 0;
  let schoolRevenue = 0;
  let currentSchoolRevenue = 0;
  let currentGrossRevenue = 0;
  let projectedGrossRevenue = 0;

  campuses.forEach(campus => {
    const calc = calculateCampusRevenue(campus, globalSettings);
    currentSchoolStudents += calc.currentTotalStudents;
    projectedSchoolStudents += calc.projectedTotalStudents;
    projectedNewStudents += calc.projectedNewStudents;
    schoolRevenue += calc.projectedNetRevenue;
    currentSchoolRevenue += calc.currentNetRevenue;
    currentGrossRevenue += calc.currentGrossRevenue;
    projectedGrossRevenue += calc.projectedGrossRevenue;
  });

  // Calculate discount amounts
  const currentDiscountAmount = currentGrossRevenue - currentSchoolRevenue;
  const projectedDiscountAmount = projectedGrossRevenue - schoolRevenue;

  // Calculate average discount percentages
  let totalLastYearDiscount = 0;
  let totalProjectedDiscount = 0;
  campuses.forEach(campus => {
    totalLastYearDiscount += campus.lastYearDiscount || 0;
    totalProjectedDiscount += campus.discountRate;
  });
  const lastYearDiscountPercent = campuses.length > 0 ? totalLastYearDiscount / campuses.length : 0;
  const projectedDiscountPercent = campuses.length > 0 ? totalProjectedDiscount / campuses.length : 0;

  let hostelStudents = 0;
  let hostelRevenue = 0;
  let currentHostelRevenue = 0;

  hostels.forEach(hostel => {
    hostelStudents += hostel.currentOccupancy;
    // Projected uses current fee, current uses last year fee
    hostelRevenue += hostel.currentOccupancy * hostel.feePerStudent;
    currentHostelRevenue += hostel.currentOccupancy * (hostel.lastYearFeePerStudent || hostel.feePerStudent);
  });

  // Use current students for student breakdown display (consistent)
  const schoolStudents = currentSchoolStudents;
  const totalStudents = schoolStudents;

  // Calculate additional fees based on projected students for revenue
  // Only include annual fee for campuses where annualFeeApplicable is true
  const studentsWithAnnualFee = campuses.reduce((sum, campus) => {
    if (campus.annualFeeApplicable) {
      const calc = calculateCampusRevenue(campus, globalSettings);
      return sum + calc.projectedTotalStudents;
    }
    return sum;
  }, 0);
  
  const annualFeeRevenue = (studentsWithAnnualFee * globalSettings.schoolAnnualFee) + (hostelStudents * globalSettings.hostelAnnualFee);
  // DCP only applies to school students, not hostels
  const dcpRevenue = projectedSchoolStudents * globalSettings.schoolDCP;
  const newAdmissionFeeRevenue = projectedNewStudents * (globalSettings.newAdmissionFeePerStudent || 25000);
  const tuitionRevenue = schoolRevenue + hostelRevenue;
  const grandTotalRevenue = tuitionRevenue + annualFeeRevenue + dcpRevenue + newAdmissionFeeRevenue;

  return {
    schoolStudents,
    hostelStudents,
    totalStudents,
    projectedSchoolStudents,
    schoolRevenue,
    hostelRevenue,
    totalRevenue: tuitionRevenue,
    currentSchoolRevenue,
    currentHostelRevenue,
    currentTotalRevenue: currentSchoolRevenue + currentHostelRevenue,
    annualFeeRevenue,
    dcpRevenue,
    grandTotalRevenue,
    newAdmissionFeeRevenue,
    projectedNewStudents,
    currentDiscountAmount,
    projectedDiscountAmount,
    lastYearDiscountPercent,
    projectedDiscountPercent,
  };
}

// Format currency in PKR
export function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `₨${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `₨${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `₨${(value / 1e3).toFixed(1)}K`;
  }
  return `₨${value.toLocaleString()}`;
}

// Format number with commas
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

// Format percentage
export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// Generate well-formatted CSV export data
export function generateCSVExport(
  campuses: CampusData[],
  hostels: HostelData[],
  globalSettings: GlobalSettings
): string {
  const rows: string[][] = [];
  const totals = calculateTotals(campuses, hostels, globalSettings);

  // Title and Date
  rows.push(['SCHOOL REVENUE FORECASTING REPORT']);
  rows.push([`Generated on: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`]);
  rows.push(['']);

  // Summary Section
  rows.push(['=== EXECUTIVE SUMMARY ===']);
  rows.push(['']);
  rows.push(['Metric', 'Value']);
  rows.push(['Total School Students', totals.schoolStudents.toString()]);
  rows.push(['Total Hostel Students', totals.hostelStudents.toString()]);
  rows.push(['Total Students', totals.totalStudents.toString()]);
  rows.push(['']);
  rows.push(['School Tuition Revenue', `Rs. ${totals.schoolRevenue.toLocaleString()}`]);
  rows.push(['Hostel Revenue', `Rs. ${totals.hostelRevenue.toLocaleString()}`]);
  rows.push(['Total Tuition Revenue', `Rs. ${totals.totalRevenue.toLocaleString()}`]);
  rows.push(['Annual Fee Revenue', `Rs. ${totals.annualFeeRevenue.toLocaleString()}`]);
  rows.push(['DCP Revenue', `Rs. ${totals.dcpRevenue.toLocaleString()}`]);
  rows.push(['GRAND TOTAL REVENUE', `Rs. ${totals.grandTotalRevenue.toLocaleString()}`]);
  rows.push(['']);

  // Global Settings
  rows.push(['=== GLOBAL SETTINGS ===']);
  rows.push(['']);
  rows.push(['Setting', 'Value']);
  rows.push(['Global Fee Hike', `${globalSettings.globalFeeHike}%`]);
  rows.push(['Global Student Growth', `${globalSettings.globalStudentGrowth}%`]);
  rows.push(['Global Discount Rate', `${globalSettings.globalDiscount}%`]);
  rows.push(['School Annual Fee', `Rs. ${globalSettings.schoolAnnualFee.toLocaleString()}`]);
  rows.push(['Hostel Annual Fee', `Rs. ${globalSettings.hostelAnnualFee.toLocaleString()}`]);
  rows.push(['School DCP (School Only)', `Rs. ${globalSettings.schoolDCP.toLocaleString()}`]);
  rows.push(['']);

  // Campus Details Header
  rows.push(['=== CAMPUS-WISE BREAKDOWN ===']);
  rows.push(['']);
  rows.push([
    'Campus',
    'Class',
    'Renewal Students (Current)',
    'Renewal Students (Projected)',
    'New Students (Current)',
    'New Students (Projected)',
    'Total Students (Current)',
    'Total Students (Projected)',
    'Renewal Fee (Rs.)',
    'New Admission Fee (Rs.)',
    'Discount Rate (%)',
    'Current Revenue (Rs.)',
    'Projected Revenue (Rs.)',
    'Change (Rs.)',
    'Change (%)'
  ]);

  campuses.forEach(campus => {
    const campusCalc = calculateCampusRevenue(campus, globalSettings);
    const classBreakdown = calculateClassBreakdown(campus, globalSettings);
    
    // Campus summary row
    rows.push([
      `>>> ${campus.name}`,
      'CAMPUS TOTAL',
      campusCalc.currentRenewalStudents.toString(),
      campusCalc.projectedRenewalStudents.toString(),
      campusCalc.currentNewStudents.toString(),
      campusCalc.projectedNewStudents.toString(),
      campusCalc.currentTotalStudents.toString(),
      campusCalc.projectedTotalStudents.toString(),
      '-',
      '-',
      `${campus.discountRate}%`,
      campusCalc.currentNetRevenue.toLocaleString(),
      campusCalc.projectedNetRevenue.toLocaleString(),
      campusCalc.revenueChange.toLocaleString(),
      `${campusCalc.revenueChangePercent.toFixed(1)}%`
    ]);

    // Class-wise breakdown
    classBreakdown.forEach(cls => {
      const campusClass = campus.classes.find(c => c.className === cls.className);
      rows.push([
        '',
        cls.className,
        cls.currentRenewalStudents.toString(),
        cls.projectedRenewalStudents.toString(),
        cls.currentNewStudents.toString(),
        cls.projectedNewStudents.toString(),
        cls.currentTotalStudents.toString(),
        cls.projectedTotalStudents.toString(),
        campusClass?.renewalFee.toLocaleString() || '0',
        campusClass?.newAdmissionFee.toLocaleString() || '0',
        `${campus.discountRate}%`,
        cls.currentRevenue.toLocaleString(),
        cls.projectedRevenue.toLocaleString(),
        cls.revenueChange.toLocaleString(),
        cls.currentRevenue > 0 ? `${((cls.revenueChange / cls.currentRevenue) * 100).toFixed(1)}%` : 'N/A'
      ]);
    });
    rows.push(['']); // Empty row between campuses
  });

  // Hostel Section
  rows.push(['=== HOSTEL BREAKDOWN ===']);
  rows.push(['']);
  rows.push([
    'Hostel Name',
    'Current Occupancy',
    'Max Capacity',
    'Utilization (%)',
    'Fee per Student (Rs.)',
    'Total Revenue (Rs.)'
  ]);
  
  hostels.forEach(hostel => {
    const calc = calculateHostelRevenue(hostel);
    rows.push([
      hostel.name,
      hostel.currentOccupancy.toString(),
      hostel.maxCapacity.toString(),
      `${calc.utilizationPercent.toFixed(1)}%`,
      hostel.feePerStudent.toLocaleString(),
      calc.currentRevenue.toLocaleString()
    ]);
  });

  rows.push(['']);
  rows.push(['=== END OF REPORT ===']);

  const csv = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  return csv;
}
