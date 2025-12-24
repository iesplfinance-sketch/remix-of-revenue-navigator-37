// Revenue calculation engine with discount logic
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';

export interface CampusCalculation {
  campusId: string;
  campusName: string;
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
  schoolRevenue: number;
  hostelRevenue: number;
  totalRevenue: number;
  currentSchoolRevenue: number;
  currentHostelRevenue: number;
  currentTotalRevenue: number;
}

// Calculate revenue for a single campus
export function calculateCampusRevenue(
  campus: CampusData,
  globalSettings: GlobalSettings
): CampusCalculation {
  const effectiveStudentGrowth = (campus.studentGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveFeeHike = (campus.feeHike + globalSettings.globalFeeHike) / 100;
  const discountRate = campus.discountRate / 100;

  let currentRenewalStudents = 0;
  let currentNewStudents = 0;
  let currentRenewalRevenue = 0;
  let currentNewRevenue = 0;
  let projectedRenewalRevenue = 0;
  let projectedNewRevenue = 0;

  campus.classes.forEach(cls => {
    // Current counts
    currentRenewalStudents += cls.renewalCount;
    currentNewStudents += cls.newAdmissionCount;

    // Current revenue (before applying any changes)
    currentRenewalRevenue += cls.renewalCount * cls.renewalFee;
    currentNewRevenue += cls.newAdmissionCount * cls.newAdmissionFee;

    // Projected counts with growth
    const projRenewal = Math.round(cls.renewalCount * (1 + effectiveStudentGrowth));
    const projNew = Math.round(cls.newAdmissionCount * (1 + effectiveStudentGrowth));

    // Projected revenue with fee hike
    const hikedRenewalFee = cls.renewalFee * (1 + effectiveFeeHike);
    const hikedNewFee = cls.newAdmissionFee * (1 + effectiveFeeHike);

    projectedRenewalRevenue += projRenewal * hikedRenewalFee;
    projectedNewRevenue += projNew * hikedNewFee;
  });

  const currentTotalStudents = currentRenewalStudents + currentNewStudents;
  const projectedRenewalStudents = Math.round(currentRenewalStudents * (1 + effectiveStudentGrowth));
  const projectedNewStudents = Math.round(currentNewStudents * (1 + effectiveStudentGrowth));
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
  const effectiveStudentGrowth = (campus.studentGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveFeeHike = (campus.feeHike + globalSettings.globalFeeHike) / 100;
  const discountRate = campus.discountRate / 100;

  return campus.classes
    .filter(cls => cls.renewalCount > 0 || cls.newAdmissionCount > 0 || cls.renewalFee > 0)
    .map(cls => {
      const currentRenewalStudents = cls.renewalCount;
      const currentNewStudents = cls.newAdmissionCount;
      const currentTotalStudents = currentRenewalStudents + currentNewStudents;

      const projectedRenewalStudents = Math.round(currentRenewalStudents * (1 + effectiveStudentGrowth));
      const projectedNewStudents = Math.round(currentNewStudents * (1 + effectiveStudentGrowth));
      const projectedTotalStudents = projectedRenewalStudents + projectedNewStudents;

      const currentRevenue = (currentRenewalStudents * cls.renewalFee + currentNewStudents * cls.newAdmissionFee) * (1 - discountRate);

      const hikedRenewalFee = cls.renewalFee * (1 + effectiveFeeHike);
      const hikedNewFee = cls.newAdmissionFee * (1 + effectiveFeeHike);
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
  const currentRevenue = hostel.currentOccupancy * hostel.feePerStudent;
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
  let schoolStudents = 0;
  let schoolRevenue = 0;
  let currentSchoolRevenue = 0;

  campuses.forEach(campus => {
    const calc = calculateCampusRevenue(campus, globalSettings);
    schoolStudents += calc.projectedTotalStudents;
    schoolRevenue += calc.projectedNetRevenue;
    currentSchoolRevenue += calc.currentNetRevenue;
  });

  let hostelStudents = 0;
  let hostelRevenue = 0;
  let currentHostelRevenue = 0;

  hostels.forEach(hostel => {
    hostelStudents += hostel.currentOccupancy;
    hostelRevenue += hostel.currentOccupancy * hostel.feePerStudent;
    currentHostelRevenue += hostel.currentOccupancy * hostel.feePerStudent;
  });

  return {
    schoolStudents,
    hostelStudents,
    totalStudents: schoolStudents + hostelStudents,
    schoolRevenue,
    hostelRevenue,
    totalRevenue: schoolRevenue + hostelRevenue,
    currentSchoolRevenue,
    currentHostelRevenue,
    currentTotalRevenue: currentSchoolRevenue + currentHostelRevenue,
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

// Generate CSV export data
export function generateCSVExport(
  campuses: CampusData[],
  hostels: HostelData[],
  globalSettings: GlobalSettings
): string {
  const headers = [
    'Campus',
    'Class',
    'Renewal Students (Current)',
    'Renewal Students (Projected)',
    'New Students (Current)',
    'New Students (Projected)',
    'Renewal Fee',
    'New Fee',
    'Discount Rate',
    'Current Revenue',
    'Projected Revenue',
    'Change'
  ];

  const rows: string[][] = [];

  campuses.forEach(campus => {
    const classBreakdown = calculateClassBreakdown(campus, globalSettings);
    classBreakdown.forEach(cls => {
      const campusClass = campus.classes.find(c => c.className === cls.className);
      rows.push([
        campus.name,
        cls.className,
        cls.currentRenewalStudents.toString(),
        cls.projectedRenewalStudents.toString(),
        cls.currentNewStudents.toString(),
        cls.projectedNewStudents.toString(),
        campusClass?.renewalFee.toString() || '0',
        campusClass?.newAdmissionFee.toString() || '0',
        `${campus.discountRate}%`,
        cls.currentRevenue.toFixed(0),
        cls.projectedRevenue.toFixed(0),
        cls.revenueChange.toFixed(0)
      ]);
    });
  });

  // Add hostel data
  rows.push(['', '', '', '', '', '', '', '', '', '', '', '']);
  rows.push(['HOSTELS', '', '', '', '', '', '', '', '', '', '', '']);
  
  hostels.forEach(hostel => {
    const calc = calculateHostelRevenue(hostel);
    rows.push([
      hostel.name,
      'Residential',
      calc.currentOccupancy.toString(),
      calc.projectedOccupancy.toString(),
      '0',
      '0',
      hostel.feePerStudent.toString(),
      '0',
      '0%',
      calc.currentRevenue.toFixed(0),
      calc.projectedRevenue.toFixed(0),
      calc.revenueChange.toFixed(0)
    ]);
  });

  const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return csv;
}
