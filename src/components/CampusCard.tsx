import { ChevronDown, ChevronUp, AlertTriangle, Users } from 'lucide-react';
import { CampusData, HostelData } from '@/data/schoolData';
import { CampusCalculation, calculateClassBreakdown, formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';
import { GlobalSettings } from '@/data/schoolData';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface CampusCardProps {
  campus: CampusData;
  calculation: CampusCalculation;
  globalSettings: GlobalSettings;
  onUpdate: (updates: Partial<CampusData>) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hostel?: HostelData; // Optional hostel linked to this campus
}

export function CampusCard({ campus, calculation, globalSettings, onUpdate, isExpanded, onToggleExpand, hostel }: CampusCardProps) {
  const classBreakdown = calculateClassBreakdown(campus, globalSettings);

  // Calculate grand total for header display (including hostel if applicable)
  const calculateGrandTotal = () => {
    const discountRate = campus.discountRate / 100;
    const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
    const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
    const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
    const effectiveNewGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;

    let projectedTotalStudents = 0;
    let projectedNewStudents = 0;
    let projectedTuitionRevenue = 0;

    campus.classes.forEach(cls => {
      const projRenewal = Math.round(cls.renewalCount * (1 + effectiveRenewalGrowth));
      const projNew = Math.round(cls.newAdmissionCount * (1 + effectiveNewGrowth));
      const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
      const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);
      
      projectedTuitionRevenue += (projRenewal * hikedRenewalFee + projNew * hikedNewFee);
      projectedTotalStudents += projRenewal + projNew;
      projectedNewStudents += projNew;
    });

    const tuitionNet = projectedTuitionRevenue * (1 - discountRate);
    const newAdmissionFees = projectedNewStudents * 25000;
    const annualFees = campus.annualFeeApplicable ? projectedTotalStudents * globalSettings.schoolAnnualFee : 0;
    const dcp = projectedTotalStudents * globalSettings.schoolDCP;
    
    // Add hostel revenue if this campus has a hostel
    const hostelRevenue = hostel ? hostel.currentOccupancy * hostel.feePerStudent : 0;

    return tuitionNet + newAdmissionFees + annualFees + dcp + hostelRevenue;
  };

  const projectedGrandTotal = calculateGrandTotal();

  // Calculate current grand total for comparison (including hostel if applicable)
  const calculateCurrentGrandTotal = () => {
    const discountRate = campus.discountRate / 100;
    let currentTotalStudents = 0;
    let currentNewStudents = 0;
    let currentTuitionRevenue = 0;

    campus.classes.forEach(cls => {
      currentTuitionRevenue += (cls.renewalCount * cls.renewalFee + cls.newAdmissionCount * cls.newAdmissionFee);
      currentTotalStudents += cls.renewalCount + cls.newAdmissionCount;
      currentNewStudents += cls.newAdmissionCount;
    });

    const tuitionNet = currentTuitionRevenue * (1 - discountRate);
    const newAdmissionFees = currentNewStudents * 25000;
    const annualFees = campus.annualFeeApplicable ? currentTotalStudents * globalSettings.schoolAnnualFee : 0;
    const dcp = currentTotalStudents * globalSettings.schoolDCP;
    
    // Add hostel revenue if this campus has a hostel
    const hostelRevenue = hostel ? hostel.currentOccupancy * hostel.feePerStudent : 0;

    return tuitionNet + newAdmissionFees + annualFees + dcp + hostelRevenue;
  };

  const currentGrandTotal = calculateCurrentGrandTotal();
  const grandTotalChange = projectedGrandTotal - currentGrandTotal;
  const grandTotalChangePercent = currentGrandTotal > 0 ? ((grandTotalChange / currentGrandTotal) * 100) : 0;

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
            <div className="font-mono text-sm text-foreground">{formatCurrency(projectedGrandTotal)}</div>
            <div className={`font-mono text-xs ${grandTotalChange >= 0 ? 'text-positive' : 'text-negative'}`}>
              {formatPercent(grandTotalChangePercent)}
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

              {/* Annual Fee Toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Annual Fee Applicable
                  </label>
                  <Switch
                    checked={campus.annualFeeApplicable}
                    onCheckedChange={(checked) => onUpdate({ annualFeeApplicable: checked })}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {campus.annualFeeApplicable ? 'Rs. 25,000 per student' : 'Not charged at this campus'}
                </p>
              </div>
            </div>

            {/* Data Table - Current vs Forecasted */}
            {(() => {
              // Calculate totals for header row
              const discountRate = campus.discountRate / 100;
              const effectiveRenewalFeeHike = (campus.renewalFeeHike + globalSettings.globalFeeHike) / 100;
              const effectiveNewFeeHike = (campus.newAdmissionFeeHike + globalSettings.globalFeeHike) / 100;
              const effectiveRenewalGrowth = (campus.renewalGrowth + globalSettings.globalStudentGrowth) / 100;
              const effectiveNewGrowth = (campus.newStudentGrowth + globalSettings.globalStudentGrowth) / 100;

              let currentTotalNew = 0, currentTotalRenewal = 0, currentTotalRevenue = 0;
              let projectedTotalNew = 0, projectedTotalRenewal = 0, projectedTotalRevenue = 0;

              campus.classes.forEach(cls => {
                currentTotalNew += cls.newAdmissionCount;
                currentTotalRenewal += cls.renewalCount;
                currentTotalRevenue += (cls.renewalCount * cls.renewalFee + cls.newAdmissionCount * cls.newAdmissionFee);
                
                const projRenewal = Math.round(cls.renewalCount * (1 + effectiveRenewalGrowth));
                const projNew = Math.round(cls.newAdmissionCount * (1 + effectiveNewGrowth));
                const hikedRenewalFee = cls.renewalFee * (1 + effectiveRenewalFeeHike);
                const hikedNewFee = cls.newAdmissionFee * (1 + effectiveNewFeeHike);
                
                projectedTotalRenewal += projRenewal;
                projectedTotalNew += projNew;
                projectedTotalRevenue += (projRenewal * hikedRenewalFee + projNew * hikedNewFee);
              });

              const currentNetRevenue = currentTotalRevenue * (1 - discountRate);
              const projectedNetRevenue = projectedTotalRevenue * (1 - discountRate);
              const revenueDelta = projectedNetRevenue - currentNetRevenue;

              return (
                <div className="overflow-x-auto">
                  {/* Summary Parameters */}
                  <div className="text-xs text-muted-foreground mb-2 px-1">
                    New Adm Fee: {campus.newAdmissionFeeHike}% | Renewal Fee: {campus.renewalFeeHike}% | New Growth: {campus.newStudentGrowth}% | Renewal Growth: {campus.renewalGrowth}% | Discount: {campus.discountRate}%
                  </div>
                  
                  <table className="data-grid w-full text-xs">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="align-bottom">{campus.shortName || campus.name}</th>
                        <th colSpan={5} className="text-center bg-muted/30 border-b border-border">Current</th>
                        <th colSpan={5} className="text-center bg-primary/10 border-b border-border">Forecasted</th>
                        <th rowSpan={2} className="text-right align-bottom">Delta</th>
                      </tr>
                      <tr>
                        <th className="text-right bg-muted/30">New Adm (A)</th>
                        <th className="text-right bg-muted/30">Fees (B)</th>
                        <th className="text-right bg-muted/30">Total (A×B)</th>
                        <th className="text-right bg-muted/30">Renewal (C)</th>
                        <th className="text-right bg-muted/30">Fees (D)</th>
                        <th className="text-right bg-muted/30">Total (C×D)</th>
                        <th className="text-right bg-primary/10">New Adm (A)</th>
                        <th className="text-right bg-primary/10">Fees (B)</th>
                        <th className="text-right bg-primary/10">Total (A×B)</th>
                        <th className="text-right bg-primary/10">Renewal (C)</th>
                        <th className="text-right bg-primary/10">Fees (D)</th>
                        <th className="text-right bg-primary/10">Total (C×D)</th>
                      </tr>
                      {/* Summary Row in Header */}
                      <tr className="bg-surface-2 border-b-2 border-primary/30">
                        <th className="text-left font-bold py-2">TOTALS</th>
                        <th className="text-right font-mono bg-muted/30 py-2">{formatNumber(currentTotalNew)}</th>
                        <th className="text-right font-mono bg-muted/30 py-2">-</th>
                        <th className="text-right font-mono bg-muted/30 py-2">{formatCurrency(currentTotalNew * (campus.classes[0]?.newAdmissionFee || 0))}</th>
                        <th className="text-right font-mono bg-muted/30 py-2">{formatNumber(currentTotalRenewal)}</th>
                        <th className="text-right font-mono bg-muted/30 py-2">-</th>
                        <th className="text-right font-mono bg-muted/30 py-2">{formatCurrency(currentNetRevenue)}</th>
                        <th className="text-right font-mono bg-primary/10 py-2">{formatNumber(projectedTotalNew)}</th>
                        <th className="text-right font-mono bg-primary/10 py-2">-</th>
                        <th className="text-right font-mono bg-primary/10 py-2">{formatCurrency(projectedTotalNew * (campus.classes[0]?.newAdmissionFee || 0) * (1 + effectiveNewFeeHike))}</th>
                        <th className="text-right font-mono bg-primary/10 py-2">{formatNumber(projectedTotalRenewal)}</th>
                        <th className="text-right font-mono bg-primary/10 py-2">-</th>
                        <th className="text-right font-mono bg-primary/10 py-2">{formatCurrency(projectedNetRevenue)}</th>
                        <th className={`text-right font-mono font-bold py-2 ${revenueDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {revenueDelta >= 0 ? '+' : ''}{formatCurrency(revenueDelta)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {classBreakdown.map(cls => {
                        const classData = campus.classes.find(c => c.className === cls.className);
                        const currentRenewalFee = classData?.renewalFee || 0;
                        const currentNewAdmFee = classData?.newAdmissionFee || 0;
                        const projectedRenewalFee = currentRenewalFee * (1 + effectiveRenewalFeeHike);
                        const projectedNewAdmFee = currentNewAdmFee * (1 + effectiveNewFeeHike);
                        
                        const currentNewTotal = cls.currentNewStudents * currentNewAdmFee;
                        const currentRenewalTotal = cls.currentRenewalStudents * currentRenewalFee;
                        const projectedNewTotal = cls.projectedNewStudents * projectedNewAdmFee;
                        const projectedRenewalTotal = cls.projectedRenewalStudents * projectedRenewalFee;
                        
                        return (
                          <tr key={cls.className}>
                            <td className="font-medium">{cls.className}</td>
                            {/* Current Year */}
                            <td className="text-right font-mono bg-muted/20">{cls.currentNewStudents}</td>
                            <td className="text-right font-mono bg-muted/20">{formatNumber(currentNewAdmFee)}</td>
                            <td className="text-right font-mono bg-muted/20">{formatCurrency(currentNewTotal)}</td>
                            <td className="text-right font-mono bg-muted/20">{cls.currentRenewalStudents}</td>
                            <td className="text-right font-mono bg-muted/20">{formatNumber(currentRenewalFee)}</td>
                            <td className="text-right font-mono bg-muted/20">{formatCurrency(currentRenewalTotal)}</td>
                            {/* Forecasted Year */}
                            <td className="text-right font-mono bg-primary/5">{cls.projectedNewStudents}</td>
                            <td className="text-right font-mono bg-primary/5">{formatNumber(Math.round(projectedNewAdmFee))}</td>
                            <td className="text-right font-mono bg-primary/5">{formatCurrency(projectedNewTotal)}</td>
                            <td className="text-right font-mono bg-primary/5">{cls.projectedRenewalStudents}</td>
                            <td className="text-right font-mono bg-primary/5">{formatNumber(Math.round(projectedRenewalFee))}</td>
                            <td className="text-right font-mono bg-primary/5">{formatCurrency(projectedRenewalTotal)}</td>
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
              );
            })()}

            {/* Revenue Summary Section */}
            <div className="mt-6 p-4 bg-surface-2 rounded-lg border border-border">
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Revenue Summary</h4>
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
                    {/* Tuition Fees - Renewal */}
                    {(() => {
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
                      const newAdmFeePerStudent = 25000; // Placeholder - this could be a global setting
                      const currentNewAdmissionFees = currentNewStudents * newAdmFeePerStudent;
                      const projectedNewAdmissionFees = projectedNewStudents * newAdmFeePerStudent;

                      // Annual Fees
                      const currentAnnualFees = currentTotalStudents * globalSettings.schoolAnnualFee;
                      const projectedAnnualFees = projectedTotalStudents * globalSettings.schoolAnnualFee;

                      // DCP
                      const currentDCP = currentTotalStudents * globalSettings.schoolDCP;
                      const projectedDCP = projectedTotalStudents * globalSettings.schoolDCP;

                      // Hostel Revenue (if applicable)
                      const hostelRevenue = hostel ? hostel.currentOccupancy * hostel.feePerStudent : 0;

                      // Grand Total (including hostel)
                      const currentGrandTotal = currentTuitionSubtotal + currentNewAdmissionFees + currentAnnualFees + currentDCP + hostelRevenue;
                      const projectedGrandTotal = projectedTuitionSubtotal + projectedNewAdmissionFees + projectedAnnualFees + projectedDCP + hostelRevenue;

                      const renewalDelta = projectedRenewalNet - currentRenewalNet;
                      const newAdmDelta = projectedNewAdmNet - currentNewAdmNet;
                      const tuitionDelta = projectedTuitionSubtotal - currentTuitionSubtotal;
                      const newAdmissionFeesDelta = projectedNewAdmissionFees - currentNewAdmissionFees;
                      const annualFeesDelta = projectedAnnualFees - currentAnnualFees;
                      const dcpDelta = projectedDCP - currentDCP;
                      const grandTotalDelta = projectedGrandTotal - currentGrandTotal;

                      return (
                        <>
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
                          <tr className="border-b border-border/50">
                            <td className="py-2 pl-2 text-muted-foreground">Annual Fees (All Students)</td>
                            <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentAnnualFees)}</td>
                            <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedAnnualFees)}</td>
                            <td className={`text-right py-2 font-mono ${annualFeesDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {annualFeesDelta >= 0 ? '+' : ''}{formatCurrency(annualFeesDelta)}
                            </td>
                          </tr>
                          <tr className="border-b border-border/50">
                            <td className="py-2 pl-2 text-muted-foreground">DCP (All Students)</td>
                            <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(currentDCP)}</td>
                            <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(projectedDCP)}</td>
                            <td className={`text-right py-2 font-mono ${dcpDelta >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {dcpDelta >= 0 ? '+' : ''}{formatCurrency(dcpDelta)}
                            </td>
                          </tr>
                          {hostel && (
                            <tr className="border-b border-border/50">
                              <td className="py-2 pl-2 text-muted-foreground">Hostel Fees ({hostel.currentOccupancy} students)</td>
                              <td className="text-right py-2 font-mono bg-muted/10">{formatCurrency(hostelRevenue)}</td>
                              <td className="text-right py-2 font-mono bg-primary/5">{formatCurrency(hostelRevenue)}</td>
                              <td className="text-right py-2 font-mono text-muted-foreground">₨0</td>
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
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
