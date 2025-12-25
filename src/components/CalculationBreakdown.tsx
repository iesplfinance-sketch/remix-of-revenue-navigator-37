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
  // Forecasted
  forecastedNewAdmission: number;
  forecastedNewFee: number;
  forecastedNewTotal: number;
  forecastedRenewal: number;
  forecastedRenewalFee: number;
  forecastedRenewalTotal: number;
}

function CampusBreakdownRow({ campus, calculation, globalSettings }: CampusBreakdownRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const effectiveNewFeeHike = campus.newAdmissionFeeHike + globalSettings.globalFeeHike;
  const effectiveRenewalFeeHike = campus.renewalFeeHike + globalSettings.globalFeeHike;
  const effectiveNewGrowth = campus.newStudentGrowth + globalSettings.globalStudentGrowth;
  const effectiveRenewalGrowth = campus.renewalGrowth + globalSettings.globalStudentGrowth;

  // Calculate class-level breakdown matching Excel format
  const classRows: ClassRowData[] = campus.classes
    .filter(cls => cls.renewalCount > 0 || cls.newAdmissionCount > 0 || cls.renewalFee > 0 || cls.newAdmissionFee > 0)
    .map(cls => {
      const newGrowthMultiplier = 1 + (effectiveNewGrowth / 100);
      const renewalGrowthMultiplier = 1 + (effectiveRenewalGrowth / 100);
      const newFeeMultiplier = 1 + (effectiveNewFeeHike / 100);
      const renewalFeeMultiplier = 1 + (effectiveRenewalFeeHike / 100);

      // Current values
      const currentNewAdmission = cls.newAdmissionCount;
      const currentNewFee = cls.newAdmissionFee;
      const currentNewTotal = currentNewAdmission * currentNewFee;
      const currentRenewal = cls.renewalCount;
      const currentRenewalFee = cls.renewalFee;
      const currentRenewalTotal = currentRenewal * currentRenewalFee;

      // Forecasted values with separate growth and fee hike rates
      const forecastedNewAdmission = Math.round(currentNewAdmission * newGrowthMultiplier);
      const forecastedNewFee = Math.round(currentNewFee * newFeeMultiplier);
      const forecastedNewTotal = forecastedNewAdmission * forecastedNewFee;
      const forecastedRenewal = Math.round(currentRenewal * renewalGrowthMultiplier);
      const forecastedRenewalFee = Math.round(currentRenewalFee * renewalFeeMultiplier);
      const forecastedRenewalTotal = forecastedRenewal * forecastedRenewalFee;

      return {
        className: cls.className,
        currentNewAdmission,
        currentNewFee,
        currentNewTotal,
        currentRenewal,
        currentRenewalFee,
        currentRenewalTotal,
        forecastedNewAdmission,
        forecastedNewFee,
        forecastedNewTotal,
        forecastedRenewal,
        forecastedRenewalFee,
        forecastedRenewalTotal,
      };
    });

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
                  New Adm Fee: {effectiveNewFeeHike}% | Renewal Fee: {effectiveRenewalFeeHike}% | New Growth: {effectiveNewGrowth}% | Renewal Growth: {effectiveRenewalGrowth}% | Discount: {campus.discountRate}%
                </p>
              </div>

              {/* Detailed Calculation Table - Excel Format */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-1">
                      <th rowSpan={2} className="border border-border p-2 text-left font-semibold">{campus.shortName}</th>
                      <th colSpan={6} className="border border-border p-2 text-center font-semibold bg-muted/30">Current</th>
                      <th colSpan={6} className="border border-border p-2 text-center font-semibold bg-primary/10">Forecasted</th>
                    </tr>
                    <tr className="bg-surface-2">
                      <th className="border border-border p-2 text-right text-muted-foreground">New Adm (A)</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Fees (B)</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Total (A×B)</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Renewal (C)</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Fees (D)</th>
                      <th className="border border-border p-2 text-right text-muted-foreground">Total (C×D)</th>
                      <th className="border border-border p-2 text-right text-primary">New Adm (A)</th>
                      <th className="border border-border p-2 text-right text-primary">Fees (B)</th>
                      <th className="border border-border p-2 text-right text-primary">Total (A×B)</th>
                      <th className="border border-border p-2 text-right text-primary">Renewal (C)</th>
                      <th className="border border-border p-2 text-right text-primary">Fees (D)</th>
                      <th className="border border-border p-2 text-right text-primary">Total (C×D)</th>
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
                      </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-surface-1 font-semibold">
                      <td className="border border-border p-2">TOTAL</td>
                      <td className="border border-border p-2 text-right font-mono">
                        {classRows.reduce((sum, r) => sum + r.currentNewAdmission, 0)}
                      </td>
                      <td className="border border-border p-2 text-right font-mono">-</td>
                      <td className="border border-border p-2 text-right font-mono">
                        {formatNumber(classRows.reduce((sum, r) => sum + r.currentNewTotal, 0))}
                      </td>
                      <td className="border border-border p-2 text-right font-mono">
                        {classRows.reduce((sum, r) => sum + r.currentRenewal, 0)}
                      </td>
                      <td className="border border-border p-2 text-right font-mono">-</td>
                      <td className="border border-border p-2 text-right font-mono">
                        {formatNumber(classRows.reduce((sum, r) => sum + r.currentRenewalTotal, 0))}
                      </td>
                      <td className="border border-border p-2 text-right font-mono text-primary">
                        {classRows.reduce((sum, r) => sum + r.forecastedNewAdmission, 0)}
                      </td>
                      <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">
                        {formatNumber(classRows.reduce((sum, r) => sum + r.forecastedNewTotal, 0))}
                      </td>
                      <td className="border border-border p-2 text-right font-mono text-primary">
                        {classRows.reduce((sum, r) => sum + r.forecastedRenewal, 0)}
                      </td>
                      <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                      <td className="border border-border p-2 text-right font-mono text-primary">
                        {formatNumber(classRows.reduce((sum, r) => sum + r.forecastedRenewalTotal, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Formula Summary */}
              <div className="mt-4 p-3 bg-surface-1 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Formula:</strong> Total Fees New Admission = Students (A) × Fees (B) | 
                  Total Fees Renewal = Students (C) × Fees (D) | 
                  Net Revenue = (Total New + Total Renewal) × (1 - {campus.discountRate}% Discount)
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
          Click on any campus to expand and see the complete calculation math (like Excel format)
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
