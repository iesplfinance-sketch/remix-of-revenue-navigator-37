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

// Simplified Header metrics row - fewer, more impactful KPIs
interface HeaderMetricsProps {
  schoolRevenue: number;
  hostelRevenue: number;
  totalStudents: number;
  hostelStudents: number;
  annualFeeRevenue: number;
  dcpRevenue: number;
  grandTotalRevenue: number;
  newAdmissionFeeRevenue: number;
}

export function HeaderMetrics({
  schoolRevenue,
  hostelRevenue,
  totalStudents,
  hostelStudents,
  grandTotalRevenue,
}: HeaderMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      <MetricCard
        title="Grand Total"
        value={formatCurrency(grandTotalRevenue)}
        subtitle="All Revenue Streams"
        variant="positive"
      />
      <MetricCard
        title="Tuition (Net)"
        value={formatCurrency(schoolRevenue)}
        subtitle="After Discounts"
        variant="primary"
      />
      <MetricCard
        title="Hostel"
        value={formatCurrency(hostelRevenue)}
        subtitle="Residential"
      />
      <MetricCard
        title="School"
        value={formatNumber(totalStudents)}
        subtitle="Total Students"
      />
      <MetricCard
        title="Hostel"
        value={formatNumber(hostelStudents)}
        subtitle="Boarders"
      />
    </div>
  );
}
