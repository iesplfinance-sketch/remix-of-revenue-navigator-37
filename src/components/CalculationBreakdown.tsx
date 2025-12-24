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

interface ClassRowData {
  className: string;
  // Current
  currentNewAdmission: number;
  currentNewFee: number;
  currentNewTotal: number;
  currentRenewal: number;
  currentRenewalFee: number;
  currentRenewalTotal: number;
  // Additional fees
  dcpFee: number;
  annualFee: number;
  admissionFee: number;
  currentDCPTotal: number;
  currentAnnualTotal: number;
  currentAdmissionTotal: number;
  // Forecasted
  forecastedNewAdmission: number;
  forecastedNewFee: number;
  forecastedNewTotal: number;
  forecastedRenewal: number;
  forecastedRenewalFee: number;
  forecastedRenewalTotal: number;
  forecastedDCPTotal: number;
  forecastedAnnualTotal: number;
  forecastedAdmissionTotal: number;
}

function CampusBreakdownRow({ campus, calculation, globalSettings }: CampusBreakdownRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const effectiveNewAdmissionFeeHike = campus.newAdmissionFeeHike + globalSettings.globalNewAdmissionFeeHike;
  const effectiveRenewalFeeHike = campus.renewalFeeHike + globalSettings.globalRenewalFeeHike;
  const effectiveNewStudentGrowth = campus.newStudentGrowth + globalSettings.globalNewStudentGrowth;
  const effectiveRenewalGrowth = campus.renewalGrowth + globalSettings.globalRenewalGrowth;

  // Calculate class-level breakdown matching Excel format
  const classRows: ClassRowData[] = campus.classes
    .filter(cls => cls.renewalCount > 0 || cls.newAdmissionCount > 0 || cls.renewalFee > 0 || cls.newAdmissionFee > 0)
    .map(cls => {
      const newStudentGrowthMultiplier = 1 + (effectiveNewStudentGrowth / 100);
      const renewalGrowthMultiplier = 1 + (effectiveRenewalGrowth / 100);
      const newAdmFeeMultiplier = 1 + (effectiveNewAdmissionFeeHike / 100);
      const renewalFeeMultiplier = 1 + (effectiveRenewalFeeHike / 100);

      // Current values
      const currentNewAdmission = cls.newAdmissionCount;
      const currentNewFee = cls.newAdmissionFee;
      const currentNewTotal = currentNewAdmission * currentNewFee;
      const currentRenewal = cls.renewalCount;
      const currentRenewalFee = cls.renewalFee;
      const currentRenewalTotal = currentRenewal * currentRenewalFee;
      
      // Additional fees per student
      const dcpFee = globalSettings.schoolDCP;
      const annualFee = globalSettings.schoolAnnualFee;
      const admissionFee = globalSettings.admissionFee;
      
      // Current additional fees
      const currentDCPTotal = (currentNewAdmission + currentRenewal) * dcpFee;
      const currentAnnualTotal = (currentNewAdmission + currentRenewal) * annualFee;
      const currentAdmissionTotal = currentNewAdmission * admissionFee; // Only new students pay admission

      // Forecasted values
      const forecastedNewAdmission = Math.round(currentNewAdmission * newStudentGrowthMultiplier);
      const forecastedNewFee = Math.round(currentNewFee * newAdmFeeMultiplier);
      const forecastedNewTotal = forecastedNewAdmission * forecastedNewFee;
      const forecastedRenewal = Math.round(currentRenewal * renewalGrowthMultiplier);
      const forecastedRenewalFee = Math.round(currentRenewalFee * renewalFeeMultiplier);
      const forecastedRenewalTotal = forecastedRenewal * forecastedRenewalFee;
      
      // Forecasted additional fees
      const forecastedDCPTotal = (forecastedNewAdmission + forecastedRenewal) * dcpFee;
      const forecastedAnnualTotal = (forecastedNewAdmission + forecastedRenewal) * annualFee;
      const forecastedAdmissionTotal = forecastedNewAdmission * admissionFee;

      return {
        className: cls.className,
        currentNewAdmission,
        currentNewFee,
        currentNewTotal,
        currentRenewal,
        currentRenewalFee,
        currentRenewalTotal,
        dcpFee,
        annualFee,
        admissionFee,
        currentDCPTotal,
        currentAnnualTotal,
        currentAdmissionTotal,
        forecastedNewAdmission,
        forecastedNewFee,
        forecastedNewTotal,
        forecastedRenewal,
        forecastedRenewalFee,
        forecastedRenewalTotal,
        forecastedDCPTotal,
        forecastedAnnualTotal,
        forecastedAdmissionTotal,
      };
    });

  // Calculate totals
  const totals = {
    currentNewAdmission: classRows.reduce((sum, r) => sum + r.currentNewAdmission, 0),
    currentNewTotal: classRows.reduce((sum, r) => sum + r.currentNewTotal, 0),
    currentRenewal: classRows.reduce((sum, r) => sum + r.currentRenewal, 0),
    currentRenewalTotal: classRows.reduce((sum, r) => sum + r.currentRenewalTotal, 0),
    currentDCPTotal: classRows.reduce((sum, r) => sum + r.currentDCPTotal, 0),
    currentAnnualTotal: classRows.reduce((sum, r) => sum + r.currentAnnualTotal, 0),
    currentAdmissionTotal: classRows.reduce((sum, r) => sum + r.currentAdmissionTotal, 0),
    forecastedNewAdmission: classRows.reduce((sum, r) => sum + r.forecastedNewAdmission, 0),
    forecastedNewTotal: classRows.reduce((sum, r) => sum + r.forecastedNewTotal, 0),
    forecastedRenewal: classRows.reduce((sum, r) => sum + r.forecastedRenewal, 0),
    forecastedRenewalTotal: classRows.reduce((sum, r) => sum + r.forecastedRenewalTotal, 0),
    forecastedDCPTotal: classRows.reduce((sum, r) => sum + r.forecastedDCPTotal, 0),
    forecastedAnnualTotal: classRows.reduce((sum, r) => sum + r.forecastedAnnualTotal, 0),
    forecastedAdmissionTotal: classRows.reduce((sum, r) => sum + r.forecastedAdmissionTotal, 0),
  };

  // Grand totals including all fees
  const currentGrandTotal = totals.currentNewTotal + totals.currentRenewalTotal + totals.currentDCPTotal + totals.currentAnnualTotal + totals.currentAdmissionTotal;
  const forecastedGrandTotal = totals.forecastedNewTotal + totals.forecastedRenewalTotal + totals.forecastedDCPTotal + totals.forecastedAnnualTotal + totals.forecastedAdmissionTotal;

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
        <td className="text-right font-mono py-3 px-4">{formatNumber(calculation.currentTotalStudents)}</td>
        <td className="text-right font-mono py-3 px-4 text-primary">{formatNumber(calculation.projectedTotalStudents)}</td>
        <td className="text-right font-mono py-3 px-4">{formatCurrency(calculation.currentNetRevenue)}</td>
        <td className="text-right font-mono py-3 px-4 text-primary">{formatCurrency(calculation.projectedNetRevenue)}</td>
        <td className={`text-right font-mono py-3 px-4 ${calculation.revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
          {calculation.revenueChange >= 0 ? '+' : ''}{formatCurrency(calculation.revenueChange)}
        </td>
      </tr>
      
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
            <div className="bg-surface-2/30 p-4 border-y border-border/50 animate-fade-in">
              {/* Fee Hike Info */}
              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-sm font-medium text-foreground">
                  New Adm Fee: {effectiveNewAdmissionFeeHike > 0 ? '+' : ''}{effectiveNewAdmissionFeeHike}% | 
                  Renewal Fee: {effectiveRenewalFeeHike > 0 ? '+' : ''}{effectiveRenewalFeeHike}% | 
                  New Student Growth: {effectiveNewStudentGrowth > 0 ? '+' : ''}{effectiveNewStudentGrowth}% | 
                  Renewal Growth: {effectiveRenewalGrowth > 0 ? '+' : ''}{effectiveRenewalGrowth}% | 
                  Discount: {campus.discountRate}% | 
                  Admission Fee: ₨{globalSettings.admissionFee.toLocaleString()}/student
                </p>
              </div>

              {/* Detailed Calculation Table - Excel Format */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-1">
                      <th rowSpan={2} className="border border-border p-2 text-left font-semibold">{campus.shortName}</th>
                      <th colSpan={9} className="border border-border p-2 text-center font-semibold bg-muted/30">Current</th>
                      <th colSpan={9} className="border border-border p-2 text-center font-semibold bg-primary/10">Forecasted</th>
                    </tr>
                    <tr className="bg-surface-2">
                      <th className="border border-border p-2 text-right text-muted-foreground">New Adm</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Fees</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Total</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Renewal</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Fees</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Total</th>
                      <th className="border border-border p-2 text-right text-warning">DCP</th>
                      <th className="border border-border p-2 text-right text-positive">Annual</th>
                      <th className="border border-border p-2 text-right text-blue-500">Adm Fee</th>
                      <th className="border border-border p-2 text-right text-primary">New Adm</th>
                      <th className="border border-border p-2 text-right text-primary">Fees</th>
                      <th className="border border-border p-2 text-right text-primary">Total</th>
                      <th className="border border-border p-2 text-right text-primary">Renewal</th>
                      <th className="border border-border p-2 text-right text-primary">Fees</th>
                      <th className="border border-border p-2 text-right text-primary">Total</th>
                      <th className="border border-border p-2 text-right text-warning">DCP</th>
                      <th className="border border-border p-2 text-right text-positive">Annual</th>
                      <th className="border border-border p-2 text-right text-blue-500">Adm Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classRows.map((row, idx) => (
                      <tr key={row.className} className={idx % 2 === 0 ? 'bg-surface-0' : 'bg-surface-1/50'}>
                        <td className="border border-border p-2 font-medium">{row.className}</td>
                        {/* Current */}
                        <td className="border border-border p-2 text-right font-mono">
                          {row.currentNewAdmission > 0 ? row.currentNewAdmission : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono">
                          {row.currentNewFee > 0 ? formatNumber(row.currentNewFee) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono">
                          {row.currentNewTotal > 0 ? formatNumber(row.currentNewTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono">
                          {row.currentRenewal > 0 ? row.currentRenewal : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono">
                          {row.currentRenewalFee > 0 ? formatNumber(row.currentRenewalFee) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono">
                          {row.currentRenewalTotal > 0 ? formatNumber(row.currentRenewalTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-warning">
                          {row.currentDCPTotal > 0 ? formatNumber(row.currentDCPTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-positive">
                          {row.currentAnnualTotal > 0 ? formatNumber(row.currentAnnualTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-blue-500">
                          {row.currentAdmissionTotal > 0 ? formatNumber(row.currentAdmissionTotal) : '-'}
                        </td>
                        {/* Forecasted */}
                        <td className="border border-border p-2 text-right font-mono text-primary">
                          {row.forecastedNewAdmission > 0 ? row.forecastedNewAdmission : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-primary">
                          {row.forecastedNewFee > 0 ? formatNumber(row.forecastedNewFee) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-primary">
                          {row.forecastedNewTotal > 0 ? formatNumber(row.forecastedNewTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-primary">
                          {row.forecastedRenewal > 0 ? row.forecastedRenewal : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-primary">
                          {row.forecastedRenewalFee > 0 ? formatNumber(row.forecastedRenewalFee) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-primary">
                          {row.forecastedRenewalTotal > 0 ? formatNumber(row.forecastedRenewalTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-warning">
                          {row.forecastedDCPTotal > 0 ? formatNumber(row.forecastedDCPTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-positive">
                          {row.forecastedAnnualTotal > 0 ? formatNumber(row.forecastedAnnualTotal) : '-'}
                        </td>
                        <td className="border border-border p-2 text-right font-mono text-blue-500">
                          {row.forecastedAdmissionTotal > 0 ? formatNumber(row.forecastedAdmissionTotal) : '-'}
                        </td>
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-surface-1 font-semibold">
                      <td className="border border-border p-2">TOTAL</td>
                      <td className="border border-border p-2 text-right font-mono">{totals.currentNewAdmission}</td>
                      <td className="border border-border p-2 text-right font-mono">-</td>
                      <td className="border border-border p-2 text-right font-mono">{formatNumber(totals.currentNewTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono">{totals.currentRenewal}</td>
                      <td className="border border-border p-2 text-right font-mono">-</td>
                      <td className="border border-border p-2 text-right font-mono">{formatNumber(totals.currentRenewalTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(totals.currentDCPTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(totals.currentAnnualTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-blue-500">{formatNumber(totals.currentAdmissionTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">{totals.forecastedNewAdmission}</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">{formatNumber(totals.forecastedNewTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">{totals.forecastedRenewal}</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">{formatNumber(totals.forecastedRenewalTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(totals.forecastedDCPTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(totals.forecastedAnnualTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-blue-500">{formatNumber(totals.forecastedAdmissionTotal)}</td>
                    </tr>
                    {/* Grand Total Row */}
                    <tr className="bg-primary/20 font-bold">
                      <td className="border border-border p-2" colSpan={7}>GRAND TOTAL (All Revenue)</td>
                      <td className="border border-border p-2 text-right font-mono" colSpan={3}>{formatCurrency(currentGrandTotal)}</td>
                      <td className="border border-border p-2 text-right font-mono text-primary" colSpan={6}></td>
                      <td className="border border-border p-2 text-right font-mono text-primary" colSpan={3}>{formatCurrency(forecastedGrandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Formula Summary */}
              <div className="mt-4 p-3 bg-surface-1 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Formula:</strong> 
                  Total Revenue = (New Adm × Fee) + (Renewal × Fee) + DCP + Annual Fee + Admission Fee | 
                  Net Revenue = Total × (1 - {campus.discountRate}% Discount)
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CalculationBreakdown({ campuses, calculations, globalSettings }: CalculationBreakdownProps) {
  // Calculate grand totals
  const grandTotals = {
    currentStudents: calculations.reduce((sum, c) => sum + c.currentTotalStudents, 0),
    projectedStudents: calculations.reduce((sum, c) => sum + c.projectedTotalStudents, 0),
    currentRevenue: calculations.reduce((sum, c) => sum + c.currentNetRevenue, 0),
    projectedRevenue: calculations.reduce((sum, c) => sum + c.projectedNetRevenue, 0),
    revenueChange: calculations.reduce((sum, c) => sum + c.revenueChange, 0),
  };

  return (
    <div className="campus-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          Detailed Calculation Breakdown
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Click on any campus to expand and see the complete calculation with DCP, Annual Fee, and Admission Fee columns
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Campus</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Current Students</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Projected Students</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Current Revenue</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Projected Revenue</th>
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
              <td className={`text-right font-mono py-3 px-4 ${grandTotals.revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                {grandTotals.revenueChange >= 0 ? '+' : ''}{formatCurrency(grandTotals.revenueChange)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}