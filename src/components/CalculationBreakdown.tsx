import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Calculator, Plus, Minus } from 'lucide-react';
import { CampusData, GlobalSettings } from '@/data/schoolData';
import { CampusCalculation, formatCurrency, formatNumber } from '@/lib/calculations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface CalculationBreakdownProps {
  campuses: CampusData[];
  calculations: CampusCalculation[];
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
  // Grand totals per class
  currentGrandTotal: number;
  forecastedGrandTotal: number;
}

interface CampusSummary {
  id: string;
  name: string;
  shortName: string;
  // Current
  currentNewAdmCount: number;
  currentNewAdmRevenue: number;
  currentRenewalCount: number;
  currentRenewalRevenue: number;
  currentDCP: number;
  currentAnnualFee: number;
  currentAdmissionFee: number;
  currentTotalRevenue: number;
  // Forecasted
  forecastedNewAdmCount: number;
  forecastedNewAdmRevenue: number;
  forecastedRenewalCount: number;
  forecastedRenewalRevenue: number;
  forecastedDCP: number;
  forecastedAnnualFee: number;
  forecastedAdmissionFee: number;
  forecastedTotalRevenue: number;
}

function useClassRows(campus: CampusData, globalSettings: GlobalSettings) {
  const effectiveNewAdmissionFeeHike = campus.newAdmissionFeeHike + globalSettings.globalNewAdmissionFeeHike;
  const effectiveRenewalFeeHike = campus.renewalFeeHike + globalSettings.globalRenewalFeeHike;
  const effectiveNewStudentGrowth = campus.newStudentGrowth + globalSettings.globalNewStudentGrowth;
  const effectiveRenewalGrowth = campus.renewalGrowth + globalSettings.globalRenewalGrowth;

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
      const currentAdmissionTotal = currentNewAdmission * admissionFee;

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

      // Grand totals
      const currentGrandTotal = currentNewTotal + currentRenewalTotal + currentDCPTotal + currentAnnualTotal + currentAdmissionTotal;
      const forecastedGrandTotal = forecastedNewTotal + forecastedRenewalTotal + forecastedDCPTotal + forecastedAnnualTotal + forecastedAdmissionTotal;

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
        currentGrandTotal,
        forecastedGrandTotal,
      };
    });

  const totals = {
    currentNewAdmission: classRows.reduce((sum, r) => sum + r.currentNewAdmission, 0),
    currentNewTotal: classRows.reduce((sum, r) => sum + r.currentNewTotal, 0),
    currentRenewal: classRows.reduce((sum, r) => sum + r.currentRenewal, 0),
    currentRenewalTotal: classRows.reduce((sum, r) => sum + r.currentRenewalTotal, 0),
    currentDCPTotal: classRows.reduce((sum, r) => sum + r.currentDCPTotal, 0),
    currentAnnualTotal: classRows.reduce((sum, r) => sum + r.currentAnnualTotal, 0),
    currentAdmissionTotal: classRows.reduce((sum, r) => sum + r.currentAdmissionTotal, 0),
    currentGrandTotal: classRows.reduce((sum, r) => sum + r.currentGrandTotal, 0),
    forecastedNewAdmission: classRows.reduce((sum, r) => sum + r.forecastedNewAdmission, 0),
    forecastedNewTotal: classRows.reduce((sum, r) => sum + r.forecastedNewTotal, 0),
    forecastedRenewal: classRows.reduce((sum, r) => sum + r.forecastedRenewal, 0),
    forecastedRenewalTotal: classRows.reduce((sum, r) => sum + r.forecastedRenewalTotal, 0),
    forecastedDCPTotal: classRows.reduce((sum, r) => sum + r.forecastedDCPTotal, 0),
    forecastedAnnualTotal: classRows.reduce((sum, r) => sum + r.forecastedAnnualTotal, 0),
    forecastedAdmissionTotal: classRows.reduce((sum, r) => sum + r.forecastedAdmissionTotal, 0),
    forecastedGrandTotal: classRows.reduce((sum, r) => sum + r.forecastedGrandTotal, 0),
  };

  return { classRows, totals, effectiveNewAdmissionFeeHike, effectiveRenewalFeeHike, effectiveNewStudentGrowth, effectiveRenewalGrowth };
}

// Main Table with expandable Total Fee column (like Excel group/ungroup)
function MainTable({ 
  summaries, 
  grandTotals,
  isTotalExpanded,
  onToggleTotalExpand
}: { 
  summaries: CampusSummary[];
  grandTotals: {
    currentNewAdmCount: number;
    currentNewAdmRevenue: number;
    currentRenewalCount: number;
    currentRenewalRevenue: number;
    currentDCP: number;
    currentAnnualFee: number;
    currentAdmissionFee: number;
    currentTotalRevenue: number;
    forecastedNewAdmCount: number;
    forecastedNewAdmRevenue: number;
    forecastedRenewalCount: number;
    forecastedRenewalRevenue: number;
    forecastedDCP: number;
    forecastedAnnualFee: number;
    forecastedAdmissionFee: number;
    forecastedTotalRevenue: number;
  };
  isTotalExpanded: boolean;
  onToggleTotalExpand: () => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-surface-1">
            <th rowSpan={2} className="border border-border p-2 text-left font-semibold sticky left-0 bg-surface-1 z-10">Campus</th>
            {/* Current Session */}
            <th 
              colSpan={isTotalExpanded ? 6 : 1} 
              className="border border-border p-2 text-center font-semibold bg-muted/30"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Current Session</span>
                <button 
                  onClick={onToggleTotalExpand}
                  className="p-1 hover:bg-surface-2 rounded transition-colors"
                  title={isTotalExpanded ? "Collapse to show only Total" : "Expand to show breakdown"}
                >
                  {isTotalExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
              </div>
            </th>
            {/* Forecasted Session */}
            <th 
              colSpan={isTotalExpanded ? 6 : 1} 
              className="border border-border p-2 text-center font-semibold bg-primary/10"
            >
              <div className="flex items-center justify-center gap-2">
                <span>Forecasted Session</span>
              </div>
            </th>
            <th rowSpan={2} className="border border-border p-2 text-center font-semibold bg-positive/20 text-positive">Change</th>
          </tr>
          <tr className="bg-surface-2">
            {/* Current Sub-headers */}
            {isTotalExpanded ? (
              <>
                <th className="border border-border p-2 text-right text-cyan-400 text-[10px]">New Adm</th>
                <th className="border border-border p-2 text-right text-green-400 text-[10px]">Renewal</th>
                <th className="border border-border p-2 text-right text-warning text-[10px]">DCP</th>
                <th className="border border-border p-2 text-right text-positive text-[10px]">Annual</th>
                <th className="border border-border p-2 text-right text-blue-500 text-[10px]">Adm Fee</th>
                <th className="border border-border p-2 text-right text-primary font-bold">Total</th>
              </>
            ) : (
              <th className="border border-border p-2 text-right text-primary font-bold">Total Revenue</th>
            )}
            {/* Forecasted Sub-headers */}
            {isTotalExpanded ? (
              <>
                <th className="border border-border p-2 text-right text-cyan-400 text-[10px]">New Adm</th>
                <th className="border border-border p-2 text-right text-green-400 text-[10px]">Renewal</th>
                <th className="border border-border p-2 text-right text-warning text-[10px]">DCP</th>
                <th className="border border-border p-2 text-right text-positive text-[10px]">Annual</th>
                <th className="border border-border p-2 text-right text-blue-500 text-[10px]">Adm Fee</th>
                <th className="border border-border p-2 text-right text-primary font-bold">Total</th>
              </>
            ) : (
              <th className="border border-border p-2 text-right text-primary font-bold">Total Revenue</th>
            )}
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary, idx) => {
            const change = summary.forecastedTotalRevenue - summary.currentTotalRevenue;
            return (
              <tr key={summary.id} className={idx % 2 === 0 ? 'bg-surface-0' : 'bg-surface-1/50'}>
                <td className="border border-border p-2 font-medium sticky left-0 bg-inherit">{summary.shortName}</td>
                {/* Current */}
                {isTotalExpanded ? (
                  <>
                    <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatNumber(summary.currentNewAdmRevenue)}</td>
                    <td className="border border-border p-2 text-right font-mono text-green-400">{formatNumber(summary.currentRenewalRevenue)}</td>
                    <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(summary.currentDCP)}</td>
                    <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(summary.currentAnnualFee)}</td>
                    <td className="border border-border p-2 text-right font-mono text-blue-500">{formatNumber(summary.currentAdmissionFee)}</td>
                    <td className="border border-border p-2 text-right font-mono text-primary font-semibold">{formatNumber(summary.currentTotalRevenue)}</td>
                  </>
                ) : (
                  <td className="border border-border p-2 text-right font-mono text-primary font-semibold">{formatNumber(summary.currentTotalRevenue)}</td>
                )}
                {/* Forecasted */}
                {isTotalExpanded ? (
                  <>
                    <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatNumber(summary.forecastedNewAdmRevenue)}</td>
                    <td className="border border-border p-2 text-right font-mono text-green-400">{formatNumber(summary.forecastedRenewalRevenue)}</td>
                    <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(summary.forecastedDCP)}</td>
                    <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(summary.forecastedAnnualFee)}</td>
                    <td className="border border-border p-2 text-right font-mono text-blue-500">{formatNumber(summary.forecastedAdmissionFee)}</td>
                    <td className="border border-border p-2 text-right font-mono text-primary font-semibold">{formatNumber(summary.forecastedTotalRevenue)}</td>
                  </>
                ) : (
                  <td className="border border-border p-2 text-right font-mono text-primary font-semibold">{formatNumber(summary.forecastedTotalRevenue)}</td>
                )}
                <td className={`border border-border p-2 text-right font-mono font-semibold ${change >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {change >= 0 ? '+' : ''}{formatNumber(change)}
                </td>
              </tr>
            );
          })}
          {/* Grand Total Row */}
          <tr className="bg-primary/20 font-bold">
            <td className="border border-border p-2 sticky left-0 bg-primary/20">TOTAL</td>
            {/* Current */}
            {isTotalExpanded ? (
              <>
                <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatCurrency(grandTotals.currentNewAdmRevenue)}</td>
                <td className="border border-border p-2 text-right font-mono text-green-400">{formatCurrency(grandTotals.currentRenewalRevenue)}</td>
                <td className="border border-border p-2 text-right font-mono text-warning">{formatCurrency(grandTotals.currentDCP)}</td>
                <td className="border border-border p-2 text-right font-mono text-positive">{formatCurrency(grandTotals.currentAnnualFee)}</td>
                <td className="border border-border p-2 text-right font-mono text-blue-500">{formatCurrency(grandTotals.currentAdmissionFee)}</td>
                <td className="border border-border p-2 text-right font-mono text-primary">{formatCurrency(grandTotals.currentTotalRevenue)}</td>
              </>
            ) : (
              <td className="border border-border p-2 text-right font-mono text-primary">{formatCurrency(grandTotals.currentTotalRevenue)}</td>
            )}
            {/* Forecasted */}
            {isTotalExpanded ? (
              <>
                <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatCurrency(grandTotals.forecastedNewAdmRevenue)}</td>
                <td className="border border-border p-2 text-right font-mono text-green-400">{formatCurrency(grandTotals.forecastedRenewalRevenue)}</td>
                <td className="border border-border p-2 text-right font-mono text-warning">{formatCurrency(grandTotals.forecastedDCP)}</td>
                <td className="border border-border p-2 text-right font-mono text-positive">{formatCurrency(grandTotals.forecastedAnnualFee)}</td>
                <td className="border border-border p-2 text-right font-mono text-blue-500">{formatCurrency(grandTotals.forecastedAdmissionFee)}</td>
                <td className="border border-border p-2 text-right font-mono text-primary">{formatCurrency(grandTotals.forecastedTotalRevenue)}</td>
              </>
            ) : (
              <td className="border border-border p-2 text-right font-mono text-primary">{formatCurrency(grandTotals.forecastedTotalRevenue)}</td>
            )}
            <td className={`border border-border p-2 text-right font-mono ${grandTotals.forecastedTotalRevenue - grandTotals.currentTotalRevenue >= 0 ? 'text-positive' : 'text-negative'}`}>
              {grandTotals.forecastedTotalRevenue - grandTotals.currentTotalRevenue >= 0 ? '+' : ''}
              {formatCurrency(grandTotals.forecastedTotalRevenue - grandTotals.currentTotalRevenue)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface CampusBreakdownRowProps {
  campus: CampusData;
  calculation: CampusCalculation;
  globalSettings: GlobalSettings;
}

function CampusBreakdownRow({ campus, calculation, globalSettings }: CampusBreakdownRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { classRows, totals, effectiveNewAdmissionFeeHike, effectiveRenewalFeeHike, effectiveNewStudentGrowth, effectiveRenewalGrowth } = 
    useClassRows(campus, globalSettings);

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
              {/* Settings Info */}
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

              {/* Tabbed View */}
              <Tabs defaultValue="comparison" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="comparison">Side by Side</TabsTrigger>
                  <TabsTrigger value="current">Current Session</TabsTrigger>
                  <TabsTrigger value="forecasted">Forecasted Session</TabsTrigger>
                </TabsList>

                <TabsContent value="comparison">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-surface-1">
                          <th rowSpan={2} className="border border-border p-2 text-left font-semibold sticky left-0 bg-surface-1 z-10">{campus.shortName}</th>
                          <th colSpan={9} className="border border-border p-2 text-center font-semibold bg-muted/30">Current</th>
                          <th colSpan={9} className="border border-border p-2 text-center font-semibold bg-primary/10">Forecasted</th>
                        </tr>
                        <tr className="bg-surface-2">
                          {/* Current Headers */}
                          <th className="border border-border p-2 text-right text-cyan-400">New Adm</th>
                          <th className="border border-border p-2 text-right text-muted-foreground">Fees</th>
                          <th className="border border-border p-2 text-right text-cyan-400">Total</th>
                          <th className="border border-border p-2 text-right text-green-400">Renewal</th>
                          <th className="border border-border p-2 text-right text-muted-foreground">Fees</th>
                          <th className="border border-border p-2 text-right text-green-400">Total</th>
                          <th className="border border-border p-2 text-right text-warning">DCP</th>
                          <th className="border border-border p-2 text-right text-positive">Annual</th>
                          <th className="border border-border p-2 text-right text-primary font-bold">Grand Total</th>
                          {/* Forecasted Headers */}
                          <th className="border border-border p-2 text-right text-cyan-400">New Adm</th>
                          <th className="border border-border p-2 text-right text-primary">Fees</th>
                          <th className="border border-border p-2 text-right text-cyan-400">Total</th>
                          <th className="border border-border p-2 text-right text-green-400">Renewal</th>
                          <th className="border border-border p-2 text-right text-primary">Fees</th>
                          <th className="border border-border p-2 text-right text-green-400">Total</th>
                          <th className="border border-border p-2 text-right text-warning">DCP</th>
                          <th className="border border-border p-2 text-right text-positive">Annual</th>
                          <th className="border border-border p-2 text-right text-primary font-bold">Grand Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classRows.map((row, idx) => (
                          <tr key={row.className} className={idx % 2 === 0 ? 'bg-surface-0' : 'bg-surface-1/50'}>
                            <td className="border border-border p-2 font-medium sticky left-0 bg-inherit">{row.className}</td>
                            {/* Current */}
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.currentNewAdmission > 0 ? row.currentNewAdmission : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono">
                              {row.currentNewFee > 0 ? formatNumber(row.currentNewFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.currentNewTotal > 0 ? formatNumber(row.currentNewTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.currentRenewal > 0 ? row.currentRenewal : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono">
                              {row.currentRenewalFee > 0 ? formatNumber(row.currentRenewalFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.currentRenewalTotal > 0 ? formatNumber(row.currentRenewalTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-warning">
                              {row.currentDCPTotal > 0 ? formatNumber(row.currentDCPTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-positive">
                              {row.currentAnnualTotal > 0 ? formatNumber(row.currentAnnualTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono font-semibold">
                              {formatNumber(row.currentGrandTotal)}
                            </td>
                            {/* Forecasted */}
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.forecastedNewAdmission > 0 ? row.forecastedNewAdmission : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-primary">
                              {row.forecastedNewFee > 0 ? formatNumber(row.forecastedNewFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.forecastedNewTotal > 0 ? formatNumber(row.forecastedNewTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.forecastedRenewal > 0 ? row.forecastedRenewal : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-primary">
                              {row.forecastedRenewalFee > 0 ? formatNumber(row.forecastedRenewalFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.forecastedRenewalTotal > 0 ? formatNumber(row.forecastedRenewalTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-warning">
                              {row.forecastedDCPTotal > 0 ? formatNumber(row.forecastedDCPTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-positive">
                              {row.forecastedAnnualTotal > 0 ? formatNumber(row.forecastedAnnualTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-primary font-semibold">
                              {formatNumber(row.forecastedGrandTotal)}
                            </td>
                          </tr>
                        ))}
                        {/* Totals Row */}
                        <tr className="bg-surface-1 font-semibold">
                          <td className="border border-border p-2 sticky left-0 bg-surface-1">TOTAL</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{totals.currentNewAdmission}</td>
                          <td className="border border-border p-2 text-right font-mono">-</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatNumber(totals.currentNewTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{totals.currentRenewal}</td>
                          <td className="border border-border p-2 text-right font-mono">-</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{formatNumber(totals.currentRenewalTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(totals.currentDCPTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(totals.currentAnnualTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono font-bold">{formatCurrency(totals.currentGrandTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{totals.forecastedNewAdmission}</td>
                          <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatNumber(totals.forecastedNewTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{totals.forecastedRenewal}</td>
                          <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{formatNumber(totals.forecastedRenewalTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(totals.forecastedDCPTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(totals.forecastedAnnualTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-primary font-bold">{formatCurrency(totals.forecastedGrandTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="current">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-surface-2">
                          <th className="border border-border p-2 text-left font-semibold sticky left-0 bg-surface-2 z-10">Class</th>
                          <th className="border border-border p-2 text-right text-cyan-400">New Adm</th>
                          <th className="border border-border p-2 text-right text-cyan-400">Fees</th>
                          <th className="border border-border p-2 text-right text-cyan-400">Total</th>
                          <th className="border border-border p-2 text-right text-green-400">Renewal</th>
                          <th className="border border-border p-2 text-right text-green-400">Fees</th>
                          <th className="border border-border p-2 text-right text-green-400">Total</th>
                          <th className="border border-border p-2 text-right text-warning">DCP</th>
                          <th className="border border-border p-2 text-right text-positive">Annual</th>
                          <th className="border border-border p-2 text-right text-primary font-bold">Grand Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classRows.map((row, idx) => (
                          <tr key={row.className} className={idx % 2 === 0 ? 'bg-surface-0' : 'bg-surface-1/50'}>
                            <td className="border border-border p-2 font-medium sticky left-0 bg-inherit">{row.className}</td>
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.currentNewAdmission > 0 ? row.currentNewAdmission : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono">
                              {row.currentNewFee > 0 ? formatNumber(row.currentNewFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.currentNewTotal > 0 ? formatNumber(row.currentNewTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.currentRenewal > 0 ? row.currentRenewal : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono">
                              {row.currentRenewalFee > 0 ? formatNumber(row.currentRenewalFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.currentRenewalTotal > 0 ? formatNumber(row.currentRenewalTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-warning">
                              {row.currentDCPTotal > 0 ? formatNumber(row.currentDCPTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-positive">
                              {row.currentAnnualTotal > 0 ? formatNumber(row.currentAnnualTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono font-semibold">
                              {formatNumber(row.currentGrandTotal)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-surface-1 font-semibold">
                          <td className="border border-border p-2 sticky left-0 bg-surface-1">TOTAL</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{totals.currentNewAdmission}</td>
                          <td className="border border-border p-2 text-right font-mono">-</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatNumber(totals.currentNewTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{totals.currentRenewal}</td>
                          <td className="border border-border p-2 text-right font-mono">-</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{formatNumber(totals.currentRenewalTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(totals.currentDCPTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(totals.currentAnnualTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono font-bold">{formatCurrency(totals.currentGrandTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>

                <TabsContent value="forecasted">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-surface-2">
                          <th className="border border-border p-2 text-left font-semibold sticky left-0 bg-surface-2 z-10">Class</th>
                          <th className="border border-border p-2 text-right text-cyan-400">New Adm</th>
                          <th className="border border-border p-2 text-right text-primary">Fees</th>
                          <th className="border border-border p-2 text-right text-cyan-400">Total</th>
                          <th className="border border-border p-2 text-right text-green-400">Renewal</th>
                          <th className="border border-border p-2 text-right text-primary">Fees</th>
                          <th className="border border-border p-2 text-right text-green-400">Total</th>
                          <th className="border border-border p-2 text-right text-warning">DCP</th>
                          <th className="border border-border p-2 text-right text-positive">Annual</th>
                          <th className="border border-border p-2 text-right text-primary font-bold">Grand Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classRows.map((row, idx) => (
                          <tr key={row.className} className={idx % 2 === 0 ? 'bg-surface-0' : 'bg-surface-1/50'}>
                            <td className="border border-border p-2 font-medium sticky left-0 bg-inherit">{row.className}</td>
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.forecastedNewAdmission > 0 ? row.forecastedNewAdmission : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-primary">
                              {row.forecastedNewFee > 0 ? formatNumber(row.forecastedNewFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-cyan-400">
                              {row.forecastedNewTotal > 0 ? formatNumber(row.forecastedNewTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.forecastedRenewal > 0 ? row.forecastedRenewal : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-primary">
                              {row.forecastedRenewalFee > 0 ? formatNumber(row.forecastedRenewalFee) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-green-400">
                              {row.forecastedRenewalTotal > 0 ? formatNumber(row.forecastedRenewalTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-warning">
                              {row.forecastedDCPTotal > 0 ? formatNumber(row.forecastedDCPTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-positive">
                              {row.forecastedAnnualTotal > 0 ? formatNumber(row.forecastedAnnualTotal) : '-'}
                            </td>
                            <td className="border border-border p-2 text-right font-mono text-primary font-semibold">
                              {formatNumber(row.forecastedGrandTotal)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-surface-1 font-semibold">
                          <td className="border border-border p-2 sticky left-0 bg-surface-1">TOTAL</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{totals.forecastedNewAdmission}</td>
                          <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                          <td className="border border-border p-2 text-right font-mono text-cyan-400">{formatNumber(totals.forecastedNewTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{totals.forecastedRenewal}</td>
                          <td className="border border-border p-2 text-right font-mono text-primary">-</td>
                          <td className="border border-border p-2 text-right font-mono text-green-400">{formatNumber(totals.forecastedRenewalTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-warning">{formatNumber(totals.forecastedDCPTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-positive">{formatNumber(totals.forecastedAnnualTotal)}</td>
                          <td className="border border-border p-2 text-right font-mono text-primary font-bold">{formatCurrency(totals.forecastedGrandTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export function CalculationBreakdown({ campuses, calculations, globalSettings }: CalculationBreakdownProps) {
  const [isTotalExpanded, setIsTotalExpanded] = useState(false);

  // Calculate campus summaries for the main table
  const { summaries, grandTotals } = useMemo(() => {
    const summaries: CampusSummary[] = campuses.map((campus) => {
      const effectiveNewAdmissionFeeHike = campus.newAdmissionFeeHike + globalSettings.globalNewAdmissionFeeHike;
      const effectiveRenewalFeeHike = campus.renewalFeeHike + globalSettings.globalRenewalFeeHike;
      const effectiveNewStudentGrowth = campus.newStudentGrowth + globalSettings.globalNewStudentGrowth;
      const effectiveRenewalGrowth = campus.renewalGrowth + globalSettings.globalRenewalGrowth;

      let currentNewAdmCount = 0;
      let currentNewAdmRevenue = 0;
      let currentRenewalCount = 0;
      let currentRenewalRevenue = 0;
      let forecastedNewAdmCount = 0;
      let forecastedNewAdmRevenue = 0;
      let forecastedRenewalCount = 0;
      let forecastedRenewalRevenue = 0;

      campus.classes.forEach(cls => {
        // Current
        currentNewAdmCount += cls.newAdmissionCount;
        currentNewAdmRevenue += cls.newAdmissionCount * cls.newAdmissionFee;
        currentRenewalCount += cls.renewalCount;
        currentRenewalRevenue += cls.renewalCount * cls.renewalFee;

        // Forecasted
        const newStudentGrowthMultiplier = 1 + (effectiveNewStudentGrowth / 100);
        const renewalGrowthMultiplier = 1 + (effectiveRenewalGrowth / 100);
        const newAdmFeeMultiplier = 1 + (effectiveNewAdmissionFeeHike / 100);
        const renewalFeeMultiplier = 1 + (effectiveRenewalFeeHike / 100);

        const fNewAdmCount = Math.round(cls.newAdmissionCount * newStudentGrowthMultiplier);
        const fNewAdmFee = Math.round(cls.newAdmissionFee * newAdmFeeMultiplier);
        const fRenewalCount = Math.round(cls.renewalCount * renewalGrowthMultiplier);
        const fRenewalFee = Math.round(cls.renewalFee * renewalFeeMultiplier);

        forecastedNewAdmCount += fNewAdmCount;
        forecastedNewAdmRevenue += fNewAdmCount * fNewAdmFee;
        forecastedRenewalCount += fRenewalCount;
        forecastedRenewalRevenue += fRenewalCount * fRenewalFee;
      });

      const totalCurrentStudents = currentNewAdmCount + currentRenewalCount;
      const totalForecastedStudents = forecastedNewAdmCount + forecastedRenewalCount;

      const currentDCP = totalCurrentStudents * globalSettings.schoolDCP;
      const currentAnnualFee = totalCurrentStudents * globalSettings.schoolAnnualFee;
      const currentAdmissionFee = currentNewAdmCount * globalSettings.admissionFee;

      const forecastedDCP = totalForecastedStudents * globalSettings.schoolDCP;
      const forecastedAnnualFee = totalForecastedStudents * globalSettings.schoolAnnualFee;
      const forecastedAdmissionFee = forecastedNewAdmCount * globalSettings.admissionFee;

      const currentTotalRevenue = currentNewAdmRevenue + currentRenewalRevenue + currentDCP + currentAnnualFee + currentAdmissionFee;
      const forecastedTotalRevenue = forecastedNewAdmRevenue + forecastedRenewalRevenue + forecastedDCP + forecastedAnnualFee + forecastedAdmissionFee;

      return {
        id: campus.id,
        name: campus.name,
        shortName: campus.shortName,
        currentNewAdmCount,
        currentNewAdmRevenue,
        currentRenewalCount,
        currentRenewalRevenue,
        currentDCP,
        currentAnnualFee,
        currentAdmissionFee,
        currentTotalRevenue,
        forecastedNewAdmCount,
        forecastedNewAdmRevenue,
        forecastedRenewalCount,
        forecastedRenewalRevenue,
        forecastedDCP,
        forecastedAnnualFee,
        forecastedAdmissionFee,
        forecastedTotalRevenue,
      };
    });

    const grandTotals = summaries.reduce((acc, s) => ({
      currentNewAdmCount: acc.currentNewAdmCount + s.currentNewAdmCount,
      currentNewAdmRevenue: acc.currentNewAdmRevenue + s.currentNewAdmRevenue,
      currentRenewalCount: acc.currentRenewalCount + s.currentRenewalCount,
      currentRenewalRevenue: acc.currentRenewalRevenue + s.currentRenewalRevenue,
      currentDCP: acc.currentDCP + s.currentDCP,
      currentAnnualFee: acc.currentAnnualFee + s.currentAnnualFee,
      currentAdmissionFee: acc.currentAdmissionFee + s.currentAdmissionFee,
      currentTotalRevenue: acc.currentTotalRevenue + s.currentTotalRevenue,
      forecastedNewAdmCount: acc.forecastedNewAdmCount + s.forecastedNewAdmCount,
      forecastedNewAdmRevenue: acc.forecastedNewAdmRevenue + s.forecastedNewAdmRevenue,
      forecastedRenewalCount: acc.forecastedRenewalCount + s.forecastedRenewalCount,
      forecastedRenewalRevenue: acc.forecastedRenewalRevenue + s.forecastedRenewalRevenue,
      forecastedDCP: acc.forecastedDCP + s.forecastedDCP,
      forecastedAnnualFee: acc.forecastedAnnualFee + s.forecastedAnnualFee,
      forecastedAdmissionFee: acc.forecastedAdmissionFee + s.forecastedAdmissionFee,
      forecastedTotalRevenue: acc.forecastedTotalRevenue + s.forecastedTotalRevenue,
    }), {
      currentNewAdmCount: 0,
      currentNewAdmRevenue: 0,
      currentRenewalCount: 0,
      currentRenewalRevenue: 0,
      currentDCP: 0,
      currentAnnualFee: 0,
      currentAdmissionFee: 0,
      currentTotalRevenue: 0,
      forecastedNewAdmCount: 0,
      forecastedNewAdmRevenue: 0,
      forecastedRenewalCount: 0,
      forecastedRenewalRevenue: 0,
      forecastedDCP: 0,
      forecastedAnnualFee: 0,
      forecastedAdmissionFee: 0,
      forecastedTotalRevenue: 0,
    });

    return { summaries, grandTotals };
  }, [campuses, globalSettings]);

  return (
    <div className="card-base p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Revenue Breakdown</h2>
            <p className="text-xs text-muted-foreground">
              Click +/- to expand Total Fee breakdown • Click campus row below for class details
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTotalExpanded(!isTotalExpanded)}
          className="gap-2"
        >
          {isTotalExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isTotalExpanded ? 'Collapse Breakdown' : 'Expand Breakdown'}
        </Button>
      </div>

      {/* Main Table with expandable Total Fee */}
      <MainTable 
        summaries={summaries} 
        grandTotals={grandTotals}
        isTotalExpanded={isTotalExpanded}
        onToggleTotalExpand={() => setIsTotalExpanded(!isTotalExpanded)}
      />

      {/* Detailed Breakdown - Campus rows that expand to show class details */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Click a campus to see class-wise breakdown:</h3>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full">
            <thead className="bg-surface-1">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Campus</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Current Students</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Forecasted Students</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Current Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-primary">Forecasted Revenue</th>
                <th className="text-right py-3 px-4 font-semibold text-foreground">Change</th>
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
    </div>
  );
}
