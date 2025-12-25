import { ChevronDown, ChevronUp, AlertTriangle, Users } from 'lucide-react';
import { CampusData } from '@/data/schoolData';
import { CampusCalculation, calculateClassBreakdown, formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';
import { GlobalSettings } from '@/data/schoolData';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface CampusCardProps {
  campus: CampusData;
  calculation: CampusCalculation;
  globalSettings: GlobalSettings;
  onUpdate: (updates: Partial<CampusData>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function CampusCard({ campus, calculation, globalSettings, onUpdate, isExpanded, onToggleExpand }: CampusCardProps) {
  const classBreakdown = calculateClassBreakdown(campus, globalSettings);

  const cardClasses = `campus-card transition-all duration-300 ${isExpanded ? 'campus-card-expanded col-span-1 lg:col-span-2 xl:col-span-3' : ''} ${calculation.isOverCapacity ? 'campus-card-warning' : ''}`;

  return (
    <div className={cardClasses}>
      {/* Card Header */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-surface-2/50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-foreground truncate">{campus.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={calculation.isOverCapacity ? 'destructive' : 'secondary'}
              className="font-mono text-xs"
            >
              <Users className="w-3 h-3 mr-1" />
              {formatNumber(calculation.projectedTotalStudents)} / {formatNumber(campus.maxCapacity)}
            </Badge>
            {calculation.isOverCapacity && (
              <AlertTriangle className="w-4 h-4 text-negative animate-pulse" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-mono text-sm text-foreground">{formatCurrency(calculation.projectedNetRevenue)}</div>
            <div className={`font-mono text-xs ${calculation.revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatPercent(calculation.revenueChangePercent)}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border animate-fade-in">
          <div className="p-4 space-y-6">
            {/* Top: Fee Hike Sliders - Horizontal Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    New Student Growth
                  </label>
                  <span className="font-mono text-sm text-primary">
                    {campus.newStudentGrowth > 0 ? '+' : ''}{campus.newStudentGrowth}%
                  </span>
                </div>
                <Slider
                  value={[campus.newStudentGrowth]}
                  onValueChange={([value]) => onUpdate({ newStudentGrowth: value })}
                  min={-15}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>-15%</span>
                  <span>+40%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Renewal Growth
                  </label>
                  <span className="font-mono text-sm text-primary">
                    {campus.renewalGrowth > 0 ? '+' : ''}{campus.renewalGrowth}%
                  </span>
                </div>
                <Slider
                  value={[campus.renewalGrowth]}
                  onValueChange={([value]) => onUpdate({ renewalGrowth: value })}
                  min={-15}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>-15%</span>
                  <span>+40%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    New Adm. Fee Hike
                  </label>
                  <span className="font-mono text-sm text-primary">
                    {campus.newAdmissionFeeHike > 0 ? '+' : ''}{campus.newAdmissionFeeHike}%
                  </span>
                </div>
                <Slider
                  value={[campus.newAdmissionFeeHike]}
                  onValueChange={([value]) => onUpdate({ newAdmissionFeeHike: value })}
                  min={-15}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>-15%</span>
                  <span>+40%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Renewal Fee Hike
                  </label>
                  <span className="font-mono text-sm text-primary">
                    {campus.renewalFeeHike > 0 ? '+' : ''}{campus.renewalFeeHike}%
                  </span>
                </div>
                <Slider
                  value={[campus.renewalFeeHike]}
                  onValueChange={([value]) => onUpdate({ renewalFeeHike: value })}
                  min={-15}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>-15%</span>
                  <span>+40%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Discount Rate
                  </label>
                  <span className="font-mono text-sm text-warning">
                    {campus.discountRate}%
                  </span>
                </div>
                <Slider
                  value={[campus.discountRate]}
                  onValueChange={([value]) => onUpdate({ discountRate: value })}
                  min={0}
                  max={40}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>40%</span>
                </div>
              </div>
            </div>

            {/* Data Table - Current vs Forecasted */}
            <div className="overflow-x-auto">
              <table className="data-grid w-full text-xs">
                <thead>
                  <tr>
                    <th rowSpan={2} className="align-bottom">Class</th>
                    <th colSpan={4} className="text-center bg-muted/30 border-b border-border">Current Year</th>
                    <th colSpan={4} className="text-center bg-primary/10 border-b border-border">Forecasted Year</th>
                    <th rowSpan={2} className="text-right align-bottom">Delta</th>
                  </tr>
                  <tr>
                    <th className="text-right bg-muted/30">Students</th>
                    <th className="text-right bg-muted/30">Renewal Fee</th>
                    <th className="text-right bg-muted/30">New Adm. Fee</th>
                    <th className="text-right bg-muted/30">Revenue</th>
                    <th className="text-right bg-primary/10">Students</th>
                    <th className="text-right bg-primary/10">Renewal Fee</th>
                    <th className="text-right bg-primary/10">New Adm. Fee</th>
                    <th className="text-right bg-primary/10">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {classBreakdown.map(cls => {
                    const classData = campus.classes.find(c => c.className === cls.className);
                    const currentRenewalFee = classData?.renewalFee || 0;
                    const currentNewAdmFee = classData?.newAdmissionFee || 0;
                    const projectedRenewalFee = currentRenewalFee * (1 + campus.renewalFeeHike / 100);
                    const projectedNewAdmFee = currentNewAdmFee * (1 + campus.newAdmissionFeeHike / 100);
                    
                    return (
                      <tr key={cls.className}>
                        <td className="font-medium">{cls.className}</td>
                        {/* Current Year - muted background */}
                        <td className="text-right font-mono bg-muted/20">{cls.currentTotalStudents}</td>
                        <td className="text-right font-mono bg-muted/20">{formatCurrency(currentRenewalFee)}</td>
                        <td className="text-right font-mono bg-muted/20">{formatCurrency(currentNewAdmFee)}</td>
                        <td className="text-right font-mono bg-muted/20">{formatCurrency(cls.currentRevenue)}</td>
                        {/* Forecasted Year - primary tint */}
                        <td className="text-right font-mono bg-primary/5">{cls.projectedTotalStudents}</td>
                        <td className="text-right font-mono bg-primary/5">{formatCurrency(projectedRenewalFee)}</td>
                        <td className="text-right font-mono bg-primary/5">{formatCurrency(projectedNewAdmFee)}</td>
                        <td className="text-right font-mono bg-primary/5">{formatCurrency(cls.projectedRevenue)}</td>
                        {/* Delta */}
                        <td className={`text-right font-mono font-semibold ${cls.revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {cls.revenueChange >= 0 ? '+' : ''}{formatCurrency(cls.revenueChange)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
