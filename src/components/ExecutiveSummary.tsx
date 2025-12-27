import { FileText, TrendingUp, TrendingDown, Users, Building, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';
import { CampusCalculation, formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { generatePDFExport } from '@/lib/exportUtils';

interface ExecutiveSummaryProps {
  campuses: CampusData[];
  hostels: HostelData[];
  globalSettings: GlobalSettings;
  totals: {
    schoolRevenue: number;
    hostelRevenue: number;
    schoolStudents: number;
    hostelStudents: number;
    annualFeeRevenue: number;
    dcpRevenue: number;
    grandTotalRevenue: number;
    newAdmissionFeeRevenue: number;
    totalRevenue: number;
    currentTotalRevenue: number;
  };
  campusCalculations: CampusCalculation[];
}

export function ExecutiveSummary({
  campuses,
  hostels,
  globalSettings,
  totals,
  campusCalculations,
}: ExecutiveSummaryProps) {
  // Calculate key metrics
  const totalCurrentRevenue = campusCalculations.reduce((sum, c) => sum + c.currentNetRevenue, 0);
  const totalProjectedRevenue = campusCalculations.reduce((sum, c) => sum + c.projectedNetRevenue, 0);
  const revenueGrowth = totalCurrentRevenue > 0 ? ((totalProjectedRevenue - totalCurrentRevenue) / totalCurrentRevenue) * 100 : 0;
  
  const currentStudents = campusCalculations.reduce((sum, c) => sum + c.currentTotalStudents, 0);
  const projectedStudents = campusCalculations.reduce((sum, c) => sum + c.projectedTotalStudents, 0);
  const studentGrowth = currentStudents > 0 ? ((projectedStudents - currentStudents) / currentStudents) * 100 : 0;

  // Top 5 campuses by revenue
  const topCampuses = [...campusCalculations]
    .sort((a, b) => b.projectedNetRevenue - a.projectedNetRevenue)
    .slice(0, 5);

  // Campuses over capacity
  const overCapacityCampuses = campuses.filter((campus, idx) => campusCalculations[idx]?.isOverCapacity);

  const handleExportPDF = () => {
    generatePDFExport(campuses, hostels, globalSettings);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Executive Summary</h2>
          <p className="text-xs text-muted-foreground">Board-ready overview • {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <Button onClick={handleExportPDF} variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Key KPIs - Large Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="campus-card p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Revenue</div>
          <div className="font-mono text-2xl font-bold text-foreground">{formatCurrency(totals.grandTotalRevenue)}</div>
          <div className={`text-sm font-mono flex items-center justify-center gap-1 mt-1 ${revenueGrowth >= 0 ? 'text-positive' : 'text-negative'}`}>
            {revenueGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatPercent(revenueGrowth)} vs current
          </div>
        </div>
        
        <div className="campus-card p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total Students</div>
          <div className="font-mono text-2xl font-bold text-foreground">{formatNumber(projectedStudents)}</div>
          <div className={`text-sm font-mono flex items-center justify-center gap-1 mt-1 ${studentGrowth >= 0 ? 'text-positive' : 'text-negative'}`}>
            {studentGrowth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatPercent(studentGrowth)} growth
          </div>
        </div>
        
        <div className="campus-card p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Campuses</div>
          <div className="font-mono text-2xl font-bold text-foreground">{campuses.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Active locations</div>
        </div>
        
        <div className="campus-card p-4 text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Hostel Capacity</div>
          <div className="font-mono text-2xl font-bold text-foreground">{formatNumber(totals.hostelStudents)}</div>
          <div className="text-sm text-muted-foreground mt-1">{formatCurrency(totals.hostelRevenue)} revenue</div>
        </div>
      </div>

      {/* Revenue Breakdown Summary */}
      <div className="campus-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          Revenue Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Tuition (Net)</div>
            <div className="font-mono text-lg font-semibold text-foreground">{formatCurrency(totals.schoolRevenue)}</div>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Admission Fees</div>
            <div className="font-mono text-lg font-semibold text-foreground">{formatCurrency(totals.newAdmissionFeeRevenue)}</div>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Annual + DCP</div>
            <div className="font-mono text-lg font-semibold text-foreground">{formatCurrency(totals.annualFeeRevenue + totals.dcpRevenue)}</div>
          </div>
          <div className="p-3 bg-surface-2 rounded-lg">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Hostel</div>
            <div className="font-mono text-lg font-semibold text-foreground">{formatCurrency(totals.hostelRevenue)}</div>
          </div>
        </div>
      </div>

      {/* Settings Applied */}
      <div className="campus-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Assumptions Applied
        </h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-xs text-muted-foreground uppercase">Global Fee Hike</div>
            <div className="font-mono text-lg font-bold text-primary">+{globalSettings.globalFeeHike}%</div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-xs text-muted-foreground uppercase">Student Growth</div>
            <div className="font-mono text-lg font-bold text-primary">{globalSettings.globalStudentGrowth >= 0 ? '+' : ''}{globalSettings.globalStudentGrowth}%</div>
          </div>
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-xs text-muted-foreground uppercase">Global Discount</div>
            <div className="font-mono text-lg font-bold text-warning">{globalSettings.globalDiscount}%</div>
          </div>
        </div>
      </div>

      {/* Top 5 Campuses Table */}
      <div className="campus-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Building className="w-4 h-4 text-primary" />
            Top 5 Campuses by Revenue
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Rank</th>
              <th className="text-left py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Campus</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Students</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Revenue</th>
              <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-muted-foreground font-medium">Growth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {topCampuses.map((calc, idx) => (
              <tr key={calc.campusName} className="hover:bg-surface-2/50">
                <td className="py-3 px-4 font-mono text-primary font-bold">#{idx + 1}</td>
                <td className="py-3 px-4 font-medium text-foreground">{calc.campusName}</td>
                <td className="py-3 px-4 text-right font-mono">{formatNumber(calc.projectedTotalStudents)}</td>
                <td className="py-3 px-4 text-right font-mono font-semibold">{formatCurrency(calc.projectedNetRevenue)}</td>
                <td className={`py-3 px-4 text-right font-mono ${calc.revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {calc.revenueChange >= 0 ? '+' : ''}{formatPercent(calc.currentNetRevenue > 0 ? (calc.revenueChange / calc.currentNetRevenue) * 100 : 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alerts */}
      {overCapacityCampuses.length > 0 && (
        <div className="campus-card border-warning/50 bg-warning/5 p-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            Capacity Warnings
          </h3>
          <p className="text-sm text-muted-foreground">
            {overCapacityCampuses.length} campus{overCapacityCampuses.length > 1 ? 'es' : ''} projected to exceed capacity: {' '}
            <span className="font-medium text-foreground">{overCapacityCampuses.map(c => c.shortName).join(', ')}</span>
          </p>
        </div>
      )}
    </div>
  );
}