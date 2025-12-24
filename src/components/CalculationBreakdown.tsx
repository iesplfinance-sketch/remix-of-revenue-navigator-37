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

  const effectiveFeeHike = campus.feeHike + globalSettings.globalFeeHike;
  const effectiveGrowth = campus.studentGrowth + globalSettings.globalStudentGrowth;

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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Fee Calculation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-muted-foreground" />
                    Current Fee Calculation
                  </h4>
                  <div className="bg-surface-1 rounded-lg p-4 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renewal Students:</span>
                      <span className="text-foreground">{formatNumber(calculation.currentRenewalStudents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Admission Students:</span>
                      <span className="text-foreground">{formatNumber(calculation.currentNewStudents)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground">Total Students:</span>
                      <span className="text-foreground font-semibold">{formatNumber(calculation.currentTotalStudents)}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renewal Revenue:</span>
                      <span className="text-foreground">{formatCurrency(calculation.currentRenewalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">New Admission Revenue:</span>
                      <span className="text-foreground">{formatCurrency(calculation.currentNewRevenue)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground">Gross Revenue:</span>
                      <span className="text-foreground">{formatCurrency(calculation.currentGrossRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-warning">
                      <span>Discount ({campus.discountRate}%):</span>
                      <span>-{formatCurrency(calculation.currentGrossRevenue * (campus.discountRate / 100))}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-primary font-semibold">
                      <span>Net Revenue:</span>
                      <span>{formatCurrency(calculation.currentNetRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Projected Fee Calculation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-primary" />
                    Projected Fee Calculation
                  </h4>
                  <div className="bg-surface-1 rounded-lg p-4 text-xs font-mono space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Renewal Students:</span>
                      <span className="text-foreground">{formatNumber(calculation.currentRenewalStudents)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>+ Growth ({effectiveGrowth}%):</span>
                      <span>+{formatNumber(calculation.projectedRenewalStudents - calculation.currentRenewalStudents)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projected Renewal:</span>
                      <span className="text-foreground">{formatNumber(calculation.projectedRenewalStudents)}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base New Students:</span>
                      <span className="text-foreground">{formatNumber(calculation.currentNewStudents)}</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>+ Growth ({effectiveGrowth}%):</span>
                      <span>+{formatNumber(calculation.projectedNewStudents - calculation.currentNewStudents)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2">
                      <span className="text-muted-foreground">Total Projected Students:</span>
                      <span className="text-foreground font-semibold">{formatNumber(calculation.projectedTotalStudents)}</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Projected Gross Revenue:</span>
                      <span className="text-foreground">{formatCurrency(calculation.projectedGrossRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-info">
                      <span>Fee Hike Applied ({effectiveFeeHike}%):</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between text-warning">
                      <span>Discount ({campus.discountRate}%):</span>
                      <span>-{formatCurrency(calculation.projectedGrossRevenue * (campus.discountRate / 100))}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 text-positive font-semibold">
                      <span>Net Projected Revenue:</span>
                      <span>{formatCurrency(calculation.projectedNetRevenue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formula Summary */}
              <div className="mt-4 p-3 bg-surface-1 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Formula:</strong> Net Revenue = (Renewal Students × Renewal Fee + New Students × New Fee) × (1 + Fee Hike%) × (1 - Discount%)
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
  return (
    <div className="campus-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Calculator className="w-4 h-4 text-primary" />
          Detailed Calculation Breakdown
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Click on any campus to expand and see the complete calculation math
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
        </table>
      </div>
    </div>
  );
}
