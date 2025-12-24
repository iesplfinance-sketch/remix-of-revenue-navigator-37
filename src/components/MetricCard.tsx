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
      <div className="metric-label mb-1">{title}</div>
      <div className="metric-value text-foreground">{value}</div>
      {subtitle && (
        <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
      )}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${getTrendColor()}`}>
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
  totalRevenue: number;
  schoolStudents: number;
  hostelStudents: number;
  totalStudents: number;
  currentTotalRevenue: number;
  annualFeeRevenue: number;
  dcpRevenue: number;
  grandTotalRevenue: number;
}

export function HeaderMetrics({
  schoolRevenue,
  hostelRevenue,
  totalRevenue,
  schoolStudents,
  hostelStudents,
  totalStudents,
  currentTotalRevenue,
  annualFeeRevenue,
  dcpRevenue,
  grandTotalRevenue,
}: HeaderMetricsProps) {
  const revenueChange = ((totalRevenue - currentTotalRevenue) / currentTotalRevenue) * 100;

  return (
    <div className="space-y-3">
      {/* Main Revenue Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
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
          title="Tuition Revenue"
          value={formatCurrency(totalRevenue)}
          trend={revenueChange}
          trendLabel="vs current"
          variant={revenueChange > 0 ? 'positive' : 'default'}
        />
        <MetricCard
          title="Student Breakdown"
          value={`${formatNumber(schoolStudents)} | ${formatNumber(hostelStudents)}`}
          subtitle="School | Hostel"
        />
        <MetricCard
          title="Total Students"
          value={formatNumber(totalStudents)}
          subtitle="All Campuses"
        />
      </div>
      
      {/* Additional Fees Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
          title="Grand Total"
          value={formatCurrency(grandTotalRevenue)}
          subtitle="Tuition + Annual + DCP"
          variant="positive"
        />
      </div>
    </div>
  );
}
