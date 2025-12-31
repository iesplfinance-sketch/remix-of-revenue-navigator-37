import { useState } from 'react';
import { ChevronDown, ChevronRight, Calculator } from 'lucide-react';
import { CampusData, GlobalSettings, HostelData } from '@/data/schoolData';
import { CampusCalculation, formatCurrency, formatNumber } from '@/lib/calculations';

interface CalculationBreakdownProps {
  campuses: CampusData[];
  calculations: CampusCalculation[];
  globalSettings: GlobalSettings;
  hostels?: HostelData[];
}

interface CampusBreakdownRowProps {
  campus: CampusData;
  calculation: CampusCalculation;
  globalSettings: GlobalSettings;
  hostel?: HostelData;
}

function CampusBreakdownRow({ campus, calculation, globalSettings, hostel }: CampusBreakdownRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const lastYearDiscountRate = campus.lastYearDiscount / 100;
  const forecastDiscountRate = campus.discountRate / 100;
  const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
  const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
  const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveNewGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;

  // Current Year calculations (using last year discount)
  let currentRenewalRevenueGross = 0;
  let currentNewAdmRevenueGross = 0;
  let currentTotalStudents = 0;
  let currentNewStudents = 0;

  campus.classes.forEach(cls => {
    currentRenewalRevenueGross += cls.renewalCount * cls.renewalFee;
    currentNewAdmRevenueGross += cls.newAdmissionCount * cls.newAdmissionFee;
    currentTotalStudents += cls.renewalCount + cls.newAdmissionCount;
    currentNewStudents += cls.newAdmissionCount;
  });

  // Gross tuition and discount for current year
  const currentTuitionGross = currentRenewalRevenueGross + currentNewAdmRevenueGross;
  const currentDiscountAmount = currentTuitionGross * lastYearDiscountRate;
  const currentTuitionNet = currentTuitionGross - currentDiscountAmount;

  // Forecasted Year calculations
  let projectedRenewalRevenueGross = 0;
  let projectedNewAdmRevenueGross = 0;
  let projectedTotalStudents = 0;
  let projectedNewStudents = 0;

  campus.classes.forEach(cls => {
    // Use direct forecast if provided, otherwise calculate based on growth rate
    const projRenewal = cls.forecastedRenewalCount !== undefined 
      ? cls.forecastedRenewalCount 
      : Math.round(cls.renewalCount * (1 + effectiveRenewalGrowth));
    const projNew = cls.forecastedNewCount !== undefined 
      ? cls.forecastedNewCount 
      : Math.round(cls.newAdmissionCount * (1 + effectiveNewGrowth));
    const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
    const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);
    
    projectedRenewalRevenueGross += projRenewal * hikedRenewalFee;
    projectedNewAdmRevenueGross += projNew * hikedNewFee;
    projectedTotalStudents += projRenewal + projNew;
    projectedNewStudents += projNew;
  });

  // Gross tuition and discount for projected year
  const projectedTuitionGross = projectedRenewalRevenueGross + projectedNewAdmRevenueGross;
  const projectedDiscountAmount = projectedTuitionGross * forecastDiscountRate;
  const projectedTuitionNet = projectedTuitionGross - projectedDiscountAmount;

  // New Admission Fees (one-time, only for new students) - use last year fee for current
  const currentNewAdmissionFees = currentNewStudents * (globalSettings.lastYearNewAdmissionFee || globalSettings.newAdmissionFeePerStudent || 25000);
  const projectedNewAdmissionFees = projectedNewStudents * (globalSettings.newAdmissionFeePerStudent || 25000);

  // Annual Fees (only if applicable for this campus) - use last year fee for current
  const currentAnnualFees = campus.annualFeeApplicable ? currentTotalStudents * (globalSettings.lastYearSchoolAnnualFee || globalSettings.schoolAnnualFee) : 0;
  const projectedAnnualFees = campus.annualFeeApplicable ? projectedTotalStudents * globalSettings.schoolAnnualFee : 0;

  // DCP - use last year fee for current
  const currentDCP = currentTotalStudents * (globalSettings.lastYearSchoolDCP || globalSettings.schoolDCP);
  const projectedDCP = projectedTotalStudents * globalSettings.schoolDCP;

  // Custom Fees (only projected - assume 0 for last year)
  const customFees = globalSettings.customFees || [];
  const currentCustomFees = 0; // Assume no custom fees last year
  const projectedCustomFees = customFees.reduce((sum, fee) => {
    let feeTotal = 0;
    if (fee.appliesToSchool) feeTotal += projectedTotalStudents * fee.amountPerStudent;
    // Note: Hostel fees for campus are calculated at hostel level, not here
    return sum + feeTotal;
  }, 0);
  const customFeesDelta = projectedCustomFees - currentCustomFees;

  // Hostel Revenue (if applicable) - use last year fee for current
  const currentHostelRevenue = hostel ? hostel.currentOccupancy * (hostel.lastYearFeePerStudent || hostel.feePerStudent) : 0;
  const projectedHostelRevenue = hostel ? hostel.currentOccupancy * hostel.feePerStudent : 0;
  const hostelDelta = projectedHostelRevenue - currentHostelRevenue;

  // Grand Total = Tuition Net (after discount) + Other Fees + Custom Fees + Hostel
  const currentGrandTotal = currentTuitionNet + currentNewAdmissionFees + currentAnnualFees + currentDCP + currentCustomFees + currentHostelRevenue;
  const projectedGrandTotal = projectedTuitionNet + projectedNewAdmissionFees + projectedAnnualFees + projectedDCP + projectedCustomFees + projectedHostelRevenue;

  const grandTotalDelta = projectedGrandTotal - currentGrandTotal;
  const grandTotalChangePercent = currentGrandTotal > 0 ? (grandTotalDelta / currentGrandTotal) * 100 : 0;

  // Deltas
  const renewalDelta = projectedRenewalRevenueGross - currentRenewalRevenueGross;
  const newAdmDelta = projectedNewAdmRevenueGross - currentNewAdmRevenueGross;
  const tuitionGrossDelta = projectedTuitionGross - currentTuitionGross;
  const discountDelta = projectedDiscountAmount - currentDiscountAmount;
  const newAdmissionFeesDelta = projectedNewAdmissionFees - currentNewAdmissionFees;
  const annualFeesDelta = projectedAnnualFees - currentAnnualFees;
  const dcpDelta = projectedDCP - currentDCP;

  return (
    <>
      <tr 
        className="cursor-pointer hover:bg-surface-2/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-primary" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium text-foreground">{campus.shortName}</span>
          </div>
        </td>
        <td className="text-right font-mono py-3 px-4">{formatNumber(currentTotalStudents)}</td>
        <td className="text-right font-mono py-3 px-4 text-primary">{formatNumber(projectedTotalStudents)}</td>
        <td className="text-right font-mono py-3 px-4">{formatCurrency(currentGrandTotal)}</td>
        <td className="text-right font-mono py-3 px-4 text-primary">{formatCurrency(projectedGrandTotal)}</td>
        <td className={`text-right font-mono py-3 px-4 ${grandTotalDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
          {grandTotalDelta >= 0 ? '+' : ''}{grandTotalChangePercent.toFixed(1)}%
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="bg-surface-2/30 p-4 border-y border-border/50 animate-fade-in">
              {/* Fee Summary Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 font-medium text-muted-foreground">Fee Category</th>
                      <th className="text-right py-2 font-medium bg-muted/30">Session 25-26</th>
                      <th className="text-right py-2 font-medium bg-primary/10">Forecast 26-27</th>
                      <th className="text-right py-2 font-medium">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pl-2 text-muted-foreground">Tuition - Renewal Students</td>
                      <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentRenewalRevenueGross)}</td>
                      <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedRenewalRevenueGross)}</td>
                      <td className={`text-right py-2 font-mono ${renewalDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {renewalDelta >= 0 ? '+' : ''}{formatCurrency(renewalDelta)}
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pl-2 text-muted-foreground">Tuition - New Admission Students</td>
                      <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentNewAdmRevenueGross)}</td>
                      <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedNewAdmRevenueGross)}</td>
                      <td className={`text-right py-2 font-mono ${newAdmDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {newAdmDelta >= 0 ? '+' : ''}{formatCurrency(newAdmDelta)}
                      </td>
                    </tr>
                    <tr className="border-b border-border bg-muted/20">
                      <td className="py-2 pl-2 font-semibold">Tuition Fees Subtotal</td>
                      <td className="text-right py-2 font-mono font-semibold">{formatCurrency(currentTuitionGross)}</td>
                      <td className="text-right py-2 font-mono font-semibold">{formatCurrency(projectedTuitionGross)}</td>
                      <td className={`text-right py-2 font-mono font-semibold ${tuitionGrossDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {tuitionGrossDelta >= 0 ? '+' : ''}{formatCurrency(tuitionGrossDelta)}
                      </td>
                    </tr>
                    {/* Discount Row */}
                    <tr className="border-b border-border/50 bg-warning/5">
                      <td className="py-2 pl-2 text-warning">
                        Discount Applied ({campus.lastYearDiscount}% last year → {campus.discountRate}% forecast)
                      </td>
                      <td className="text-right py-2 font-mono bg-muted/10 text-warning">
                        -{formatCurrency(currentDiscountAmount)}
                      </td>
                      <td className="text-right py-2 font-mono bg-primary/5 text-warning">
                        -{formatCurrency(projectedDiscountAmount)}
                      </td>
                      <td className={`text-right py-2 font-mono ${discountDelta <= 0 ? 'text-positive' : 'text-negative'}`}>
                        {discountDelta <= 0 ? '-' : '+'}{formatCurrency(Math.abs(discountDelta))}
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pl-2 text-muted-foreground">New Admission Fees (New Students Only)</td>
                      <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentNewAdmissionFees)}</td>
                      <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedNewAdmissionFees)}</td>
                      <td className={`text-right py-2 font-mono ${newAdmissionFeesDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {newAdmissionFeesDelta >= 0 ? '+' : ''}{formatCurrency(newAdmissionFeesDelta)}
                      </td>
                    </tr>
                    {campus.annualFeeApplicable && (
                      <tr className="border-b border-border/50">
                        <td className="py-2 pl-2 text-muted-foreground">Annual Fees (All Students)</td>
                        <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentAnnualFees)}</td>
                        <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedAnnualFees)}</td>
                        <td className={`text-right py-2 font-mono ${annualFeesDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {annualFeesDelta >= 0 ? '+' : ''}{formatCurrency(annualFeesDelta)}
                        </td>
                      </tr>
                    )}
                    <tr className="border-b border-border/50">
                      <td className="py-2 pl-2 text-muted-foreground">Digital Companion Pack (All Students)</td>
                      <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentDCP)}</td>
                      <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedDCP)}</td>
                      <td className={`text-right py-2 font-mono ${dcpDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {dcpDelta >= 0 ? '+' : ''}{formatCurrency(dcpDelta)}
                      </td>
                    </tr>
                    {customFees.length > 0 && (
                      <tr className="border-b border-border/50">
                        <td className="py-2 pl-2 text-muted-foreground">Other Incomes ({customFees.map(f => f.name).join(', ')})</td>
                        <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentCustomFees)}</td>
                        <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedCustomFees)}</td>
                        <td className={`text-right py-2 font-mono ${customFeesDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {customFeesDelta >= 0 ? '+' : ''}{formatCurrency(customFeesDelta)}
                        </td>
                      </tr>
                    )}
                    {hostel && (
                      <tr className="border-b border-border/50">
                        <td className="py-2 pl-2 text-muted-foreground">Hostel Fees ({hostel.currentOccupancy} students)</td>
                        <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentHostelRevenue)}</td>
                        <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedHostelRevenue)}</td>
                        <td className={`text-right py-2 font-mono ${hostelDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {hostelDelta >= 0 ? '+' : ''}{formatCurrency(hostelDelta)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-primary/10 font-bold">
                      <td className="py-3 pl-2 text-foreground">GRAND TOTAL</td>
                      <td className="text-right py-3 font-mono">{formatCurrency(currentGrandTotal)}</td>
                      <td className="text-right py-3 font-mono">{formatCurrency(projectedGrandTotal)}</td>
                      <td className={`text-right py-3 font-mono ${grandTotalDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {grandTotalDelta >= 0 ? '+' : ''}{formatCurrency(grandTotalDelta)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CalculationBreakdown({ campuses, calculations, globalSettings, hostels = [] }: CalculationBreakdownProps) {
  // Calculate grand totals matching the same logic as CampusBreakdownRow
  const calculateCampusGrandTotal = (campus: CampusData) => {
    const lastYearDiscountRate = campus.lastYearDiscount / 100;
    const forecastDiscountRate = campus.discountRate / 100;
    const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
    const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
    const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
    const effectiveNewGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;

    let currentRenewalRevenueGross = 0;
    let currentNewAdmRevenueGross = 0;
    let currentTotalStudents = 0;
    let currentNewStudents = 0;

    campus.classes.forEach(cls => {
      currentRenewalRevenueGross += cls.renewalCount * cls.renewalFee;
      currentNewAdmRevenueGross += cls.newAdmissionCount * cls.newAdmissionFee;
      currentTotalStudents += cls.renewalCount + cls.newAdmissionCount;
      currentNewStudents += cls.newAdmissionCount;
    });

    const currentTuitionGross = currentRenewalRevenueGross + currentNewAdmRevenueGross;
    const currentDiscountAmount = currentTuitionGross * lastYearDiscountRate;
    const currentTuitionNet = currentTuitionGross - currentDiscountAmount;

    let projectedRenewalRevenueGross = 0;
    let projectedNewAdmRevenueGross = 0;
    let projectedTotalStudents = 0;
    let projectedNewStudents = 0;

    campus.classes.forEach(cls => {
      // Use direct forecast if provided, otherwise calculate based on growth rate
      const projRenewal = cls.forecastedRenewalCount !== undefined 
        ? cls.forecastedRenewalCount 
        : Math.round(cls.renewalCount * (1 + effectiveRenewalGrowth));
      const projNew = cls.forecastedNewCount !== undefined 
        ? cls.forecastedNewCount 
        : Math.round(cls.newAdmissionCount * (1 + effectiveNewGrowth));
      const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
      const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);
      
      projectedRenewalRevenueGross += projRenewal * hikedRenewalFee;
      projectedNewAdmRevenueGross += projNew * hikedNewFee;
      projectedTotalStudents += projRenewal + projNew;
      projectedNewStudents += projNew;
    });

    const projectedTuitionGross = projectedRenewalRevenueGross + projectedNewAdmRevenueGross;
    const projectedDiscountAmount = projectedTuitionGross * forecastDiscountRate;
    const projectedTuitionNet = projectedTuitionGross - projectedDiscountAmount;

    const currentNewAdmissionFees = currentNewStudents * (globalSettings.lastYearNewAdmissionFee || globalSettings.newAdmissionFeePerStudent || 25000);
    const projectedNewAdmissionFees = projectedNewStudents * (globalSettings.newAdmissionFeePerStudent || 25000);

    const currentAnnualFees = campus.annualFeeApplicable ? currentTotalStudents * (globalSettings.lastYearSchoolAnnualFee || globalSettings.schoolAnnualFee) : 0;
    const projectedAnnualFees = campus.annualFeeApplicable ? projectedTotalStudents * globalSettings.schoolAnnualFee : 0;

    const currentDCP = currentTotalStudents * (globalSettings.lastYearSchoolDCP || globalSettings.schoolDCP);
    const projectedDCP = projectedTotalStudents * globalSettings.schoolDCP;

    // Custom fees (assume 0 for last year, calculate for projected)
    const customFeesList = globalSettings.customFees || [];
    const currentCustomFees = 0;
    const projectedCustomFees = customFeesList.reduce((sum, fee) => {
      if (fee.appliesToSchool) return sum + projectedTotalStudents * fee.amountPerStudent;
      return sum;
    }, 0);

    const currentGrandTotal = currentTuitionNet + currentNewAdmissionFees + currentAnnualFees + currentDCP + currentCustomFees;
    const projectedGrandTotal = projectedTuitionNet + projectedNewAdmissionFees + projectedAnnualFees + projectedDCP + projectedCustomFees;

    return { 
      currentTotalStudents, 
      projectedTotalStudents, 
      currentGrandTotal, 
      projectedGrandTotal,
      currentRenewalRevenueGross,
      currentNewAdmRevenueGross,
      currentTuitionGross,
      currentDiscountAmount,
      currentTuitionNet,
      currentNewAdmissionFees,
      currentAnnualFees,
      currentDCP,
      currentCustomFees,
      projectedRenewalRevenueGross,
      projectedNewAdmRevenueGross,
      projectedTuitionGross,
      projectedDiscountAmount,
      projectedTuitionNet,
      projectedNewAdmissionFees,
      projectedAnnualFees,
      projectedDCP,
      projectedCustomFees,
      currentNewStudents,
      projectedNewStudents,
    };
  };

  // Calculate hostel totals
  const hostelTotals = hostels.reduce(
    (acc, hostel) => {
      const currentRevenue = hostel.currentOccupancy * (hostel.lastYearFeePerStudent || hostel.feePerStudent);
      const projectedRevenue = hostel.currentOccupancy * hostel.feePerStudent;
      return {
        students: acc.students + hostel.currentOccupancy,
        currentRevenue: acc.currentRevenue + currentRevenue,
        projectedRevenue: acc.projectedRevenue + projectedRevenue,
      };
    },
    { students: 0, currentRevenue: 0, projectedRevenue: 0 }
  );

  // Calculate combined fee breakdown across all campuses
  const combinedBreakdown = campuses.reduce(
    (acc, campus) => {
      const details = calculateCampusGrandTotal(campus);
      return {
        currentRenewalRevenue: acc.currentRenewalRevenue + details.currentRenewalRevenueGross,
        currentNewAdmRevenue: acc.currentNewAdmRevenue + details.currentNewAdmRevenueGross,
        currentTuitionGross: acc.currentTuitionGross + details.currentTuitionGross,
        currentDiscountAmount: acc.currentDiscountAmount + details.currentDiscountAmount,
        currentNewAdmissionFees: acc.currentNewAdmissionFees + details.currentNewAdmissionFees,
        currentAnnualFees: acc.currentAnnualFees + details.currentAnnualFees,
        currentDCP: acc.currentDCP + details.currentDCP,
        currentCustomFees: acc.currentCustomFees + details.currentCustomFees,
        projectedRenewalRevenue: acc.projectedRenewalRevenue + details.projectedRenewalRevenueGross,
        projectedNewAdmRevenue: acc.projectedNewAdmRevenue + details.projectedNewAdmRevenueGross,
        projectedTuitionGross: acc.projectedTuitionGross + details.projectedTuitionGross,
        projectedDiscountAmount: acc.projectedDiscountAmount + details.projectedDiscountAmount,
        projectedNewAdmissionFees: acc.projectedNewAdmissionFees + details.projectedNewAdmissionFees,
        projectedAnnualFees: acc.projectedAnnualFees + details.projectedAnnualFees,
        projectedDCP: acc.projectedDCP + details.projectedDCP,
        projectedCustomFees: acc.projectedCustomFees + details.projectedCustomFees,
        currentStudents: acc.currentStudents + details.currentTotalStudents,
        projectedStudents: acc.projectedStudents + details.projectedTotalStudents,
        currentGrandTotal: acc.currentGrandTotal + details.currentGrandTotal,
        projectedGrandTotal: acc.projectedGrandTotal + details.projectedGrandTotal,
      };
    },
    {
      currentRenewalRevenue: 0, currentNewAdmRevenue: 0, currentTuitionGross: 0, currentDiscountAmount: 0,
      currentNewAdmissionFees: 0, currentAnnualFees: 0, currentDCP: 0, currentCustomFees: 0,
      projectedRenewalRevenue: 0, projectedNewAdmRevenue: 0, projectedTuitionGross: 0, projectedDiscountAmount: 0,
      projectedNewAdmissionFees: 0, projectedAnnualFees: 0, projectedDCP: 0, projectedCustomFees: 0,
      currentStudents: 0, projectedStudents: 0, currentGrandTotal: 0, projectedGrandTotal: 0,
    }
  );

  // Get custom fees for display
  const customFeesList = globalSettings.customFees || [];

  // Add hostel to grand totals
  const grandTotals = {
    currentStudents: combinedBreakdown.currentStudents,
    projectedStudents: combinedBreakdown.projectedStudents,
    currentRevenue: combinedBreakdown.currentGrandTotal + hostelTotals.currentRevenue,
    projectedRevenue: combinedBreakdown.projectedGrandTotal + hostelTotals.projectedRevenue,
  };

  const revenueChange = grandTotals.projectedRevenue - grandTotals.currentRevenue;
  const changePercent = grandTotals.currentRevenue > 0 ? (revenueChange / grandTotals.currentRevenue) * 100 : 0;

  // Calculate average discount rates
  const avgLastYearDiscount = campuses.length > 0 
    ? campuses.reduce((sum, c) => sum + c.lastYearDiscount, 0) / campuses.length 
    : 0;
  const avgForecastDiscount = campuses.length > 0 
    ? campuses.reduce((sum, c) => sum + c.discountRate, 0) / campuses.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Summary Table */}
      <div className="campus-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">Revenue Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Fee Category</th>
                <th className="text-right py-2 px-4 font-medium bg-muted/30">Session 25-26</th>
                <th className="text-right py-2 px-4 font-medium bg-primary/10">Forecast 26-27</th>
                <th className="text-right py-2 px-4 font-medium">Delta</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 px-4 text-muted-foreground">Tuition - Renewal Students</td>
                <td className="text-right py-2 px-4 font-mono bg-muted/10">{formatCurrency(combinedBreakdown.currentRenewalRevenue)}</td>
                <td className="text-right py-2 px-4 font-mono bg-primary/5">{formatCurrency(combinedBreakdown.projectedRenewalRevenue)}</td>
                <td className={`text-right py-2 px-4 font-mono ${combinedBreakdown.projectedRenewalRevenue - combinedBreakdown.currentRenewalRevenue >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {combinedBreakdown.projectedRenewalRevenue - combinedBreakdown.currentRenewalRevenue >= 0 ? '+' : ''}{formatCurrency(combinedBreakdown.projectedRenewalRevenue - combinedBreakdown.currentRenewalRevenue)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-4 text-muted-foreground">Tuition - New Admission Students</td>
                <td className="text-right py-2 px-4 font-mono bg-muted/10">{formatCurrency(combinedBreakdown.currentNewAdmRevenue)}</td>
                <td className="text-right py-2 px-4 font-mono bg-primary/5">{formatCurrency(combinedBreakdown.projectedNewAdmRevenue)}</td>
                <td className={`text-right py-2 px-4 font-mono ${combinedBreakdown.projectedNewAdmRevenue - combinedBreakdown.currentNewAdmRevenue >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {combinedBreakdown.projectedNewAdmRevenue - combinedBreakdown.currentNewAdmRevenue >= 0 ? '+' : ''}{formatCurrency(combinedBreakdown.projectedNewAdmRevenue - combinedBreakdown.currentNewAdmRevenue)}
                </td>
              </tr>
              <tr className="border-b border-border bg-muted/20">
                <td className="py-2 px-4 font-semibold">Tuition Fees Subtotal</td>
                <td className="text-right py-2 px-4 font-mono font-semibold">{formatCurrency(combinedBreakdown.currentTuitionGross)}</td>
                <td className="text-right py-2 px-4 font-mono font-semibold">{formatCurrency(combinedBreakdown.projectedTuitionGross)}</td>
                <td className={`text-right py-2 px-4 font-mono font-semibold ${combinedBreakdown.projectedTuitionGross - combinedBreakdown.currentTuitionGross >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {combinedBreakdown.projectedTuitionGross - combinedBreakdown.currentTuitionGross >= 0 ? '+' : ''}{formatCurrency(combinedBreakdown.projectedTuitionGross - combinedBreakdown.currentTuitionGross)}
                </td>
              </tr>
              <tr className="border-b border-border/50 bg-warning/5">
                <td className="py-2 px-4 text-warning">
                  Discount Applied ({avgLastYearDiscount.toFixed(0)}% last year → {avgForecastDiscount.toFixed(0)}% forecast)
                </td>
                <td className="text-right py-2 px-4 font-mono bg-muted/10 text-warning">
                  -{formatCurrency(combinedBreakdown.currentDiscountAmount)}
                </td>
                <td className="text-right py-2 px-4 font-mono bg-primary/5 text-warning">
                  -{formatCurrency(combinedBreakdown.projectedDiscountAmount)}
                </td>
                <td className={`text-right py-2 px-4 font-mono ${combinedBreakdown.projectedDiscountAmount - combinedBreakdown.currentDiscountAmount <= 0 ? 'text-positive' : 'text-negative'}`}>
                  {combinedBreakdown.projectedDiscountAmount - combinedBreakdown.currentDiscountAmount <= 0 ? '-' : '+'}{formatCurrency(Math.abs(combinedBreakdown.projectedDiscountAmount - combinedBreakdown.currentDiscountAmount))}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-4 text-muted-foreground">New Admission Fees (New Students Only)</td>
                <td className="text-right py-2 px-4 font-mono bg-muted/10">{formatCurrency(combinedBreakdown.currentNewAdmissionFees)}</td>
                <td className="text-right py-2 px-4 font-mono bg-primary/5">{formatCurrency(combinedBreakdown.projectedNewAdmissionFees)}</td>
                <td className={`text-right py-2 px-4 font-mono ${combinedBreakdown.projectedNewAdmissionFees - combinedBreakdown.currentNewAdmissionFees >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {combinedBreakdown.projectedNewAdmissionFees - combinedBreakdown.currentNewAdmissionFees >= 0 ? '+' : ''}{formatCurrency(combinedBreakdown.projectedNewAdmissionFees - combinedBreakdown.currentNewAdmissionFees)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-4 text-muted-foreground">Annual Fees (All Students)</td>
                <td className="text-right py-2 px-4 font-mono bg-muted/10">{formatCurrency(combinedBreakdown.currentAnnualFees)}</td>
                <td className="text-right py-2 px-4 font-mono bg-primary/5">{formatCurrency(combinedBreakdown.projectedAnnualFees)}</td>
                <td className={`text-right py-2 px-4 font-mono ${combinedBreakdown.projectedAnnualFees - combinedBreakdown.currentAnnualFees >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {combinedBreakdown.projectedAnnualFees - combinedBreakdown.currentAnnualFees >= 0 ? '+' : ''}{formatCurrency(combinedBreakdown.projectedAnnualFees - combinedBreakdown.currentAnnualFees)}
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="py-2 px-4 text-muted-foreground">Digital Companion Pack (All Students)</td>
                <td className="text-right py-2 px-4 font-mono bg-muted/10">{formatCurrency(combinedBreakdown.currentDCP)}</td>
                <td className="text-right py-2 px-4 font-mono bg-primary/5">{formatCurrency(combinedBreakdown.projectedDCP)}</td>
                <td className={`text-right py-2 px-4 font-mono ${combinedBreakdown.projectedDCP - combinedBreakdown.currentDCP >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {combinedBreakdown.projectedDCP - combinedBreakdown.currentDCP >= 0 ? '+' : ''}{formatCurrency(combinedBreakdown.projectedDCP - combinedBreakdown.currentDCP)}
                </td>
              </tr>
              {customFeesList.length > 0 && (
                <tr className="border-b border-border/50">
                  <td className="py-2 px-4 text-muted-foreground">Other Incomes ({customFeesList.map(f => f.name).join(', ')})</td>
                  <td className="text-right py-2 px-4 font-mono bg-muted/10">{formatCurrency(combinedBreakdown.currentCustomFees)}</td>
                  <td className="text-right py-2 px-4 font-mono bg-primary/5">{formatCurrency(combinedBreakdown.projectedCustomFees)}</td>
                  <td className={`text-right py-2 px-4 font-mono ${combinedBreakdown.projectedCustomFees - combinedBreakdown.currentCustomFees >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {combinedBreakdown.projectedCustomFees - combinedBreakdown.currentCustomFees >= 0 ? '+' : ''}{formatCurrency(combinedBreakdown.projectedCustomFees - combinedBreakdown.currentCustomFees)}
                  </td>
                </tr>
              )}
              {hostelTotals.students > 0 && (
                <tr className="border-b border-border/50">
                  <td className="py-2 px-4 text-muted-foreground">Hostel Fees ({hostelTotals.students} students)</td>
                  <td className="text-right py-2 px-4 font-mono bg-muted/10">{formatCurrency(hostelTotals.currentRevenue)}</td>
                  <td className="text-right py-2 px-4 font-mono bg-primary/5">{formatCurrency(hostelTotals.projectedRevenue)}</td>
                  <td className={`text-right py-2 px-4 font-mono ${hostelTotals.projectedRevenue - hostelTotals.currentRevenue >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {hostelTotals.projectedRevenue - hostelTotals.currentRevenue >= 0 ? '+' : ''}{formatCurrency(hostelTotals.projectedRevenue - hostelTotals.currentRevenue)}
                  </td>
                </tr>
              )}
              <tr className="bg-primary/10 font-bold">
                <td className="py-3 px-4 text-foreground">GRAND TOTAL</td>
                <td className="text-right py-3 px-4 font-mono">{formatCurrency(grandTotals.currentRevenue)}</td>
                <td className="text-right py-3 px-4 font-mono">{formatCurrency(grandTotals.projectedRevenue)}</td>
                <td className={`text-right py-3 px-4 font-mono ${revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {revenueChange >= 0 ? '+' : ''}{formatCurrency(revenueChange)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Campus Breakdown Table */}
      <div className="campus-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            Detailed Calculation Breakdown
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click on any campus to expand and see the fee summary breakdown
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Campus</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Current Students</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Projected Students</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Current Grand Total</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Projected Grand Total</th>
                <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {campuses.map((campus, index) => {
                const campusHostel = hostels.find(h => h.campusId === campus.id);
                return (
                  <CampusBreakdownRow
                    key={campus.id}
                    campus={campus}
                    calculation={calculations[index]}
                    globalSettings={globalSettings}
                    hostel={campusHostel}
                  />
                );
              })}
            </tbody>
            <tfoot className="bg-primary/10 border-t-2 border-primary">
              <tr className="font-bold">
                <td className="py-3 px-4 text-foreground">GRAND TOTAL</td>
                <td className="text-right font-mono py-3 px-4">{formatNumber(grandTotals.currentStudents)}</td>
                <td className="text-right font-mono py-3 px-4 text-primary">{formatNumber(grandTotals.projectedStudents)}</td>
                <td className="text-right font-mono py-3 px-4">{formatCurrency(grandTotals.currentRevenue)}</td>
                <td className="text-right font-mono py-3 px-4 text-primary">{formatCurrency(grandTotals.projectedRevenue)}</td>
                <td className={`text-right font-mono py-3 px-4 ${revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {revenueChange >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
