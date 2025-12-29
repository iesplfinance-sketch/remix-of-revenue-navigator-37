import { useState } from 'react';
import { ChevronDown, ChevronRight, Calculator } from 'lucide-react';
import { CampusData, GlobalSettings } from '@/data/schoolData';
import { CampusCalculation, formatCurrency, formatNumber } from '@/lib/calculations';

interface CalculationBreakdownProps {
  campuses: CampusData[];
  calculations: CampusCalculation[];
  globalSettings: GlobalSettings;
}

interface CampusBreakdownRowProps {
  campus: CampusData;
  calculation: CampusCalculation;
  globalSettings: GlobalSettings;
}

function CampusBreakdownRow({ campus, calculation, globalSettings }: CampusBreakdownRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const discountRate = campus.discountRate / 100;
  const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
  const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
  const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
  const effectiveNewGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;

  // Current Year calculations
  let currentRenewalRevenue = 0;
  let currentNewAdmRevenue = 0;
  let currentTotalStudents = 0;
  let currentNewStudents = 0;

  campus.classes.forEach(cls => {
    currentRenewalRevenue += cls.renewalCount * cls.renewalFee;
    currentNewAdmRevenue += cls.newAdmissionCount * cls.newAdmissionFee;
    currentTotalStudents += cls.renewalCount + cls.newAdmissionCount;
    currentNewStudents += cls.newAdmissionCount;
  });

  // Apply discount
  const currentRenewalNet = currentRenewalRevenue * (1 - discountRate);
  const currentNewAdmNet = currentNewAdmRevenue * (1 - discountRate);
  const currentTuitionSubtotal = currentRenewalNet + currentNewAdmNet;

  // Forecasted Year calculations
  let projectedRenewalRevenue = 0;
  let projectedNewAdmRevenue = 0;
  let projectedTotalStudents = 0;
  let projectedNewStudents = 0;

  campus.classes.forEach(cls => {
    const projRenewal = Math.round(cls.renewalCount * (1 + effectiveRenewalGrowth));
    const projNew = Math.round(cls.newAdmissionCount * (1 + effectiveNewGrowth));
    const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
    const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);
    
    projectedRenewalRevenue += projRenewal * hikedRenewalFee;
    projectedNewAdmRevenue += projNew * hikedNewFee;
    projectedTotalStudents += projRenewal + projNew;
    projectedNewStudents += projNew;
  });

  // Apply discount
  const projectedRenewalNet = projectedRenewalRevenue * (1 - discountRate);
  const projectedNewAdmNet = projectedNewAdmRevenue * (1 - discountRate);
  const projectedTuitionSubtotal = projectedRenewalNet + projectedNewAdmNet;

  // New Admission Fees (one-time, only for new students)
  const newAdmFeePerStudent = 25000;
  const currentNewAdmissionFees = currentNewStudents * newAdmFeePerStudent;
  const projectedNewAdmissionFees = projectedNewStudents * newAdmFeePerStudent;

  // Annual Fees (only if applicable for this campus)
  const currentAnnualFees = campus.annualFeeApplicable ? currentTotalStudents * globalSettings.schoolAnnualFee : 0;
  const projectedAnnualFees = campus.annualFeeApplicable ? projectedTotalStudents * globalSettings.schoolAnnualFee : 0;

  // DCP
  const currentDCP = currentTotalStudents * globalSettings.schoolDCP;
  const projectedDCP = projectedTotalStudents * globalSettings.schoolDCP;

  // Grand Total
  const currentGrandTotal = currentTuitionSubtotal + currentNewAdmissionFees + currentAnnualFees + currentDCP;
  const projectedGrandTotal = projectedTuitionSubtotal + projectedNewAdmissionFees + projectedAnnualFees + projectedDCP;

  const grandTotalDelta = projectedGrandTotal - currentGrandTotal;
  const grandTotalChangePercent = currentGrandTotal > 0 ? (grandTotalDelta / currentGrandTotal) * 100 : 0;

  // Deltas
  const renewalDelta = projectedRenewalNet - currentRenewalNet;
  const newAdmDelta = projectedNewAdmNet - currentNewAdmNet;
  const tuitionDelta = projectedTuitionSubtotal - currentTuitionSubtotal;
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
                      <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentRenewalNet)}</td>
                      <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedRenewalNet)}</td>
                      <td className={`text-right py-2 font-mono ${renewalDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {renewalDelta >= 0 ? '+' : ''}{formatCurrency(renewalDelta)}
                      </td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 pl-2 text-muted-foreground">Tuition - New Admission Students</td>
                      <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentNewAdmNet)}</td>
                      <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedNewAdmNet)}</td>
                      <td className={`text-right py-2 font-mono ${newAdmDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {newAdmDelta >= 0 ? '+' : ''}{formatCurrency(newAdmDelta)}
                      </td>
                    </tr>
                    <tr className="border-b border-border bg-muted/20">
                      <td className="py-2 pl-2 font-semibold">Tuition Fees Subtotal</td>
                      <td className="text-right py-2 font-mono font-semibold">{formatCurrency(currentTuitionSubtotal)}</td>
                      <td className="text-right py-2 font-mono font-semibold">{formatCurrency(projectedTuitionSubtotal)}</td>
                      <td className={`text-right py-2 font-mono font-semibold ${tuitionDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {tuitionDelta >= 0 ? '+' : ''}{formatCurrency(tuitionDelta)}
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
                      <td className="py-2 pl-2 text-muted-foreground">DCP (All Students)</td>
                      <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentDCP)}</td>
                      <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedDCP)}</td>
                      <td className={`text-right py-2 font-mono ${dcpDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                        {dcpDelta >= 0 ? '+' : ''}{formatCurrency(dcpDelta)}
                      </td>
                    </tr>
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

export function CalculationBreakdown({ campuses, calculations, globalSettings }: CalculationBreakdownProps) {
  // Calculate grand totals matching the same logic as CampusBreakdownRow
  const calculateCampusGrandTotal = (campus: CampusData) => {
    const discountRate = campus.discountRate / 100;
    const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
    const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
    const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
    const effectiveNewGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;

    let currentRenewalRevenue = 0;
    let currentNewAdmRevenue = 0;
    let currentTotalStudents = 0;
    let currentNewStudents = 0;

    campus.classes.forEach(cls => {
      currentRenewalRevenue += cls.renewalCount * cls.renewalFee;
      currentNewAdmRevenue += cls.newAdmissionCount * cls.newAdmissionFee;
      currentTotalStudents += cls.renewalCount + cls.newAdmissionCount;
      currentNewStudents += cls.newAdmissionCount;
    });

    const currentRenewalNet = currentRenewalRevenue * (1 - discountRate);
    const currentNewAdmNet = currentNewAdmRevenue * (1 - discountRate);
    const currentTuitionSubtotal = currentRenewalNet + currentNewAdmNet;

    let projectedRenewalRevenue = 0;
    let projectedNewAdmRevenue = 0;
    let projectedTotalStudents = 0;
    let projectedNewStudents = 0;

    campus.classes.forEach(cls => {
      const projRenewal = Math.round(cls.renewalCount * (1 + effectiveRenewalGrowth));
      const projNew = Math.round(cls.newAdmissionCount * (1 + effectiveNewGrowth));
      const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
      const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);
      
      projectedRenewalRevenue += projRenewal * hikedRenewalFee;
      projectedNewAdmRevenue += projNew * hikedNewFee;
      projectedTotalStudents += projRenewal + projNew;
      projectedNewStudents += projNew;
    });

    const projectedRenewalNet = projectedRenewalRevenue * (1 - discountRate);
    const projectedNewAdmNet = projectedNewAdmRevenue * (1 - discountRate);
    const projectedTuitionSubtotal = projectedRenewalNet + projectedNewAdmNet;

    const newAdmFeePerStudent = 25000;
    const currentNewAdmissionFees = currentNewStudents * newAdmFeePerStudent;
    const projectedNewAdmissionFees = projectedNewStudents * newAdmFeePerStudent;

    const currentAnnualFees = campus.annualFeeApplicable ? currentTotalStudents * globalSettings.schoolAnnualFee : 0;
    const projectedAnnualFees = campus.annualFeeApplicable ? projectedTotalStudents * globalSettings.schoolAnnualFee : 0;

    const currentDCP = currentTotalStudents * globalSettings.schoolDCP;
    const projectedDCP = projectedTotalStudents * globalSettings.schoolDCP;

    const currentGrandTotal = currentTuitionSubtotal + currentNewAdmissionFees + currentAnnualFees + currentDCP;
    const projectedGrandTotal = projectedTuitionSubtotal + projectedNewAdmissionFees + projectedAnnualFees + projectedDCP;

    return { currentTotalStudents, projectedTotalStudents, currentGrandTotal, projectedGrandTotal };
  };

  const grandTotals = campuses.reduce(
    (acc, campus) => {
      const campusTotals = calculateCampusGrandTotal(campus);
      return {
        currentStudents: acc.currentStudents + campusTotals.currentTotalStudents,
        projectedStudents: acc.projectedStudents + campusTotals.projectedTotalStudents,
        currentRevenue: acc.currentRevenue + campusTotals.currentGrandTotal,
        projectedRevenue: acc.projectedRevenue + campusTotals.projectedGrandTotal,
      };
    },
    { currentStudents: 0, projectedStudents: 0, currentRevenue: 0, projectedRevenue: 0 }
  );

  const revenueChange = grandTotals.projectedRevenue - grandTotals.currentRevenue;
  const changePercent = grandTotals.currentRevenue > 0 ? (revenueChange / grandTotals.currentRevenue) * 100 : 0;

  return (
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
            {campuses.map((campus, index) => (
              <CampusBreakdownRow
                key={campus.id}
                campus={campus}
                calculation={calculations[index]}
                globalSettings={globalSettings}
              />
            ))}
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
  );
}
