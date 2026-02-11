import { formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  lastYearValue?: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  changePercent?: number;
  variant?: 'default' | 'primary' | 'positive' | 'warning';
}

export function MetricCard({ 
  title, 
  value,
  lastYearValue, 
  subtitle, 
  trend, 
  trendLabel,
  changePercent,
  variant = 'default' 
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === undefined) return null;
    if (trend > 0) return <TrendingUp className="w-3 h-3" />;
    if (trend < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return '';
    if (trend > 0) return 'text-positive';
    if (trend < 0) return 'text-negative';
    return 'text-muted-foreground';
  };

  const getChangeIcon = () => {
    if (changePercent === undefined) return null;
    if (changePercent > 0) return <TrendingUp className="w-3 h-3" />;
    if (changePercent < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getChangeColor = () => {
    if (changePercent === undefined) return '';
    if (changePercent > 0) return 'text-positive';
    if (changePercent < 0) return 'text-negative';
    return 'text-muted-foreground';
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'border-primary/30 bg-primary/5';
      case 'positive':
        return 'border-positive/30 bg-positive/5';
      case 'warning':
        return 'border-warning/30 bg-warning/5';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <div className={`metric-card ${getVariantStyles()}`}>
      <div className="flex items-center justify-between">
        <div className="metric-label">{title}</div>
        {changePercent !== undefined && (
          <div className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${getChangeColor()} ${changePercent > 0 ? 'bg-positive/10' : changePercent < 0 ? 'bg-negative/10' : 'bg-muted'}`}>
            {getChangeIcon()}
            <span className="font-mono">{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="metric-value text-foreground">{value}</div>
        {lastYearValue && (
          <div className="text-xs text-muted-foreground font-mono">
            (LY: {lastYearValue})
          </div>
        )}
      </div>
      {subtitle && (
        <div className="text-[10px] text-muted-foreground">{subtitle}</div>
      )}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-[10px] ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="font-mono">{formatPercent(trend)}</span>
          {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

// Header metrics row
interface HeaderMetricsProps {
  schoolRevenue: number;
  hostelRevenue: number;
  totalStudents: number;
  projectedStudents: number;
  hostelStudents: number;
  annualFeeRevenue: number;
  dcpRevenue: number;
  grandTotalRevenue: number;
  newAdmissionFeeRevenue: number;
  currentDiscountAmount: number;
  projectedDiscountAmount: number;
  projectedDiscountPercent: number;
  currentSchoolRevenue?: number;
  currentHostelRevenue?: number;
  currentGrandTotal?: number;
  currentAnnualFeeRevenue?: number;
  currentDcpRevenue?: number;
  currentAdmissionFeeRevenue?: number;
  fullCapacityRevenue?: number;
}

export function HeaderMetrics({
  schoolRevenue,
  hostelRevenue,
  totalStudents,
  projectedStudents,
  hostelStudents,
  annualFeeRevenue,
  dcpRevenue,
  grandTotalRevenue,
  newAdmissionFeeRevenue,
  currentDiscountAmount,
  projectedDiscountAmount,
  projectedDiscountPercent,
  currentSchoolRevenue = 0,
  currentHostelRevenue = 0,
  currentGrandTotal = 0,
  currentAnnualFeeRevenue = 0,
  currentDcpRevenue = 0,
  currentAdmissionFeeRevenue = 0,
  fullCapacityRevenue = 0,
}: HeaderMetricsProps) {
  const studentChange = projectedStudents - totalStudents;
  const studentChangePercent = totalStudents > 0 ? (studentChange / totalStudents) * 100 : 0;
  const discountChange = projectedDiscountAmount - currentDiscountAmount;

  // Calculate percentage changes for each metric
  const grandTotalChangePercent = currentGrandTotal > 0 ? ((grandTotalRevenue - currentGrandTotal) / currentGrandTotal) * 100 : 0;
  const schoolRevenueChangePercent = currentSchoolRevenue > 0 ? ((schoolRevenue - currentSchoolRevenue) / currentSchoolRevenue) * 100 : 0;
  const hostelRevenueChangePercent = currentHostelRevenue > 0 ? ((hostelRevenue - currentHostelRevenue) / currentHostelRevenue) * 100 : 0;
  const admissionFeeChangePercent = currentAdmissionFeeRevenue > 0 ? ((newAdmissionFeeRevenue - currentAdmissionFeeRevenue) / currentAdmissionFeeRevenue) * 100 : 0;
  const annualFeeChangePercent = currentAnnualFeeRevenue > 0 ? ((annualFeeRevenue - currentAnnualFeeRevenue) / currentAnnualFeeRevenue) * 100 : 0;
  const dcpChangePercent = currentDcpRevenue > 0 ? ((dcpRevenue - currentDcpRevenue) / currentDcpRevenue) * 100 : 0;
  const discountChangePercent = currentDiscountAmount > 0 ? ((projectedDiscountAmount - currentDiscountAmount) / currentDiscountAmount) * 100 : 0;

  return (
    <div className="space-y-2">
      {/* Main Revenue Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <MetricCard
          title="Grand Total"
          value={formatCurrency(grandTotalRevenue)}
          lastYearValue={formatCurrency(currentGrandTotal)}
          subtitle="Tuition + Annual + DCP + Admission"
          changePercent={grandTotalChangePercent}
          variant="positive"
        />
        <MetricCard
          title="Full Capacity Revenue"
          value={formatCurrency(fullCapacityRevenue)}
          subtitle="If all seats filled at new adm. rate"
          variant="warning"
        />
        <MetricCard
          title="School Revenue"
          value={formatCurrency(schoolRevenue)}
          lastYearValue={formatCurrency(currentSchoolRevenue)}
          subtitle="Projected Net Tuition"
          changePercent={schoolRevenueChangePercent}
          variant="primary"
        />
        <MetricCard
          title="Hostel Revenue"
          value={formatCurrency(hostelRevenue)}
          lastYearValue={formatCurrency(currentHostelRevenue)}
          subtitle="Residential Revenue"
          changePercent={hostelRevenueChangePercent}
        />
        <MetricCard
          title="Forecasted Students"
          value={formatNumber(projectedStudents)}
          lastYearValue={formatNumber(totalStudents)}
          subtitle={`${studentChange >= 0 ? '+' : ''}${formatNumber(studentChange)} from current`}
          changePercent={studentChangePercent}
          variant="primary"
        />
        <MetricCard
          title="Hostel Students"
          value={formatNumber(hostelStudents)}
          subtitle="All Hostels"
        />
      </div>
      
      {/* Additional Fees & Discount Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <MetricCard
          title="Admission Fees"
          value={formatCurrency(newAdmissionFeeRevenue)}
          lastYearValue={formatCurrency(currentAdmissionFeeRevenue)}
          subtitle="New Students Only"
          changePercent={admissionFeeChangePercent}
        />
        <MetricCard
          title="Annual Fee"
          value={formatCurrency(annualFeeRevenue)}
          lastYearValue={formatCurrency(currentAnnualFeeRevenue)}
          subtitle="All Students"
          changePercent={annualFeeChangePercent}
        />
        <MetricCard
          title="DCP Revenue"
          value={formatCurrency(dcpRevenue)}
          lastYearValue={formatCurrency(currentDcpRevenue)}
          subtitle="Digital Companion Pack"
          changePercent={dcpChangePercent}
        />
        <MetricCard
          title="Discount"
          value={formatCurrency(projectedDiscountAmount)}
          lastYearValue={formatCurrency(currentDiscountAmount)}
          subtitle={`${projectedDiscountPercent.toFixed(1)}% avg rate | Δ ${discountChange >= 0 ? '+' : ''}${formatCurrency(discountChange)}`}
          changePercent={discountChangePercent}
          variant="warning"
        />
      </div>
    </div>
  );
}
