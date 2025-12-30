import { formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'primary' | 'positive' | 'warning';
}

export function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendLabel,
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
      <div className="metric-label">{title}</div>
      <div className="metric-value text-foreground">{value}</div>
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
  lastYearDiscountPercent: number;
  projectedDiscountPercent: number;
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
  lastYearDiscountPercent,
  projectedDiscountPercent,
}: HeaderMetricsProps) {
  const studentChange = projectedStudents - totalStudents;
  const studentChangePercent = totalStudents > 0 ? (studentChange / totalStudents) * 100 : 0;
  const discountChange = projectedDiscountAmount - currentDiscountAmount;

  return (
    <div className="space-y-2">
      {/* Main Revenue Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <MetricCard
          title="Grand Total"
          value={formatCurrency(grandTotalRevenue)}
          subtitle="Tuition + Annual + DCP + Admission"
          variant="positive"
        />
        <MetricCard
          title="School Revenue"
          value={formatCurrency(schoolRevenue)}
          subtitle="Projected Net Tuition"
          variant="primary"
        />
        <MetricCard
          title="Hostel Revenue"
          value={formatCurrency(hostelRevenue)}
          subtitle="Residential Revenue"
        />
        <MetricCard
          title="Current Students"
          value={formatNumber(totalStudents)}
          subtitle="All Campuses"
        />
        <MetricCard
          title="Forecasted Students"
          value={formatNumber(projectedStudents)}
          subtitle={`${studentChange >= 0 ? '+' : ''}${formatNumber(studentChange)} (${studentChangePercent >= 0 ? '+' : ''}${studentChangePercent.toFixed(1)}%)`}
          variant="primary"
        />
        <MetricCard
          title="Hostel Students"
          value={formatNumber(hostelStudents)}
          subtitle="All Hostels"
        />
      </div>
      
      {/* Additional Fees & Discount Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <MetricCard
          title="Admission Fees"
          value={formatCurrency(newAdmissionFeeRevenue)}
          subtitle="New Students Only"
        />
        <MetricCard
          title="Annual Fee"
          value={formatCurrency(annualFeeRevenue)}
          subtitle="All Students"
        />
        <MetricCard
          title="DCP Revenue"
          value={formatCurrency(dcpRevenue)}
          subtitle="Digital Companion Pack"
        />
        <MetricCard
          title="Last Year Discount"
          value={formatCurrency(currentDiscountAmount)}
          subtitle={`${lastYearDiscountPercent.toFixed(1)}% avg rate`}
          variant="warning"
        />
        <MetricCard
          title="Projected Discount"
          value={formatCurrency(projectedDiscountAmount)}
          subtitle={`${projectedDiscountPercent.toFixed(1)}% avg rate | Δ ${discountChange >= 0 ? '+' : ''}${formatCurrency(discountChange)}`}
          variant="warning"
        />
      </div>
    </div>
  );
}
