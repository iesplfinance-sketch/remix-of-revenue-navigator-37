import { ChevronDown, ChevronUp, AlertTriangle, Users } from 'lucide-react';
import { CampusData, ClassData } from '@/data/schoolData';
import { CampusCalculation, calculateClassBreakdown, formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';
import { GlobalSettings } from '@/data/schoolData';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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

  const handleClassUpdate = (className: string, field: keyof ClassData, value: number) => {
    const updatedClasses = campus.classes.map(cls => 
      cls.className === className ? { ...cls, [field]: value } : cls
    );
    onUpdate({ classes: updatedClasses });
  };

  const formatFeeInput = (value: number) => {
    return Math.round(value / 1000);
  };

  const parseFeeInput = (value: string) => {
    const num = parseInt(value) || 0;
    return num * 1000;
  };

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
          <div className="p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left: Controls */}
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Student Growth %
                  </label>
                  <span className="font-mono text-sm text-primary">
                    {campus.studentGrowth > 0 ? '+' : ''}{campus.studentGrowth}%
                  </span>
                </div>
                <Slider
                  value={[campus.studentGrowth]}
                  onValueChange={([value]) => onUpdate({ studentGrowth: value })}
                  min={-20}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>-20%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Fee Hike %
                  </label>
                  <span className="font-mono text-sm text-primary">
                    +{campus.feeHike}%
                  </span>
                </div>
                <Slider
                  value={[campus.feeHike]}
                  onValueChange={([value]) => onUpdate({ feeHike: value })}
                  min={0}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>+50%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Effective Discount (Society Logic)
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

            {/* Right: Data Table with editable fees - spans 3 columns */}
            <div className="lg:col-span-3 overflow-x-auto">
              <table className="data-grid w-full text-xs">
                <thead>
                  <tr>
                    <th>Class</th>
                    <th className="text-center">Renewal</th>
                    <th className="text-center">Renewal Fee (K)</th>
                    <th className="text-center">New Adm.</th>
                    <th className="text-center">New Fee (K)</th>
                    <th className="text-right">Current Rev</th>
                    <th className="text-right">Proj. Rev</th>
                    <th className="text-right">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {classBreakdown.map((cls, idx) => {
                    const classData = campus.classes[idx];
                    if (classData.renewalCount === 0 && classData.newAdmissionCount === 0 && classData.renewalFee === 0) {
                      return null;
                    }
                    return (
                      <tr key={cls.className}>
                        <td className="font-medium">{cls.className}</td>
                        <td className="text-center">
                          <Input
                            type="number"
                            value={classData.renewalCount}
                            onChange={(e) => handleClassUpdate(cls.className, 'renewalCount', parseInt(e.target.value) || 0)}
                            className="w-14 h-6 text-xs text-center p-1 font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="text-center">
                          <Input
                            type="number"
                            value={formatFeeInput(classData.renewalFee)}
                            onChange={(e) => handleClassUpdate(cls.className, 'renewalFee', parseFeeInput(e.target.value))}
                            className="w-16 h-6 text-xs text-center p-1 font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="text-center">
                          <Input
                            type="number"
                            value={classData.newAdmissionCount}
                            onChange={(e) => handleClassUpdate(cls.className, 'newAdmissionCount', parseInt(e.target.value) || 0)}
                            className="w-14 h-6 text-xs text-center p-1 font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="text-center">
                          <Input
                            type="number"
                            value={formatFeeInput(classData.newAdmissionFee)}
                            onChange={(e) => handleClassUpdate(cls.className, 'newAdmissionFee', parseFeeInput(e.target.value))}
                            className="w-16 h-6 text-xs text-center p-1 font-mono"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="text-right font-mono">{formatCurrency(cls.currentRevenue)}</td>
                        <td className="text-right font-mono">{formatCurrency(cls.projectedRevenue)}</td>
                        <td className={`text-right font-mono ${cls.revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
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
