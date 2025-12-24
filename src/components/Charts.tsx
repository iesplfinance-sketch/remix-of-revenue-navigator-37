import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CampusCalculation, formatCurrency } from '@/lib/calculations';

interface RevenuePieChartProps {
  schoolRevenue: number;
  hostelRevenue: number;
}

const COLORS = ['hsl(165, 100%, 42%)', 'hsl(200, 100%, 50%)'];

export function RevenuePieChart({ schoolRevenue, hostelRevenue }: RevenuePieChartProps) {
  const data = [
    { name: 'School', value: schoolRevenue },
    { name: 'Hostel', value: hostelRevenue },
  ];

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            labelLine={{ stroke: 'hsl(215, 15%, 55%)', strokeWidth: 1 }}
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: 'hsl(230, 20%, 10%)', 
              border: '1px solid hsl(230, 15%, 18%)',
              borderRadius: '8px',
              color: 'hsl(210, 20%, 92%)'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            formatter={(value) => <span className="text-foreground text-sm">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface TopCampusesChartProps {
  campuses: CampusCalculation[];
}

export function TopCampusesChart({ campuses }: TopCampusesChartProps) {
  const data = campuses.map(c => ({
    name: c.campusName.split(' ').slice(0, 2).join(' '),
    revenue: c.projectedNetRevenue,
    shortName: c.campusName.split(' ')[0],
  }));

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis 
            type="number" 
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(230, 15%, 18%)' }}
          />
          <YAxis 
            type="category" 
            dataKey="shortName"
            tick={{ fill: 'hsl(210, 20%, 92%)', fontSize: 11 }}
            axisLine={{ stroke: 'hsl(230, 15%, 18%)' }}
            width={80}
          />
          <Tooltip 
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
            contentStyle={{ 
              backgroundColor: 'hsl(230, 20%, 10%)', 
              border: '1px solid hsl(230, 15%, 18%)',
              borderRadius: '8px',
              color: 'hsl(210, 20%, 92%)'
            }}
          />
          <Bar 
            dataKey="revenue" 
            fill="url(#barGradient)"
            radius={[0, 4, 4, 0]}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(165, 100%, 42%)" />
              <stop offset="100%" stopColor="hsl(200, 100%, 50%)" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RevenueComparisonProps {
  currentRevenue: number;
  projectedRevenue: number;
}

export function RevenueComparison({ currentRevenue, projectedRevenue }: RevenueComparisonProps) {
  const data = [
    { name: 'Current', value: currentRevenue },
    { name: 'Projected', value: projectedRevenue },
  ];

  const change = projectedRevenue - currentRevenue;
  const changePercent = ((change / currentRevenue) * 100).toFixed(1);

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: 'hsl(210, 20%, 92%)', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(230, 15%, 18%)' }}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: 10 }}
            axisLine={{ stroke: 'hsl(230, 15%, 18%)' }}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ 
              backgroundColor: 'hsl(230, 20%, 10%)', 
              border: '1px solid hsl(230, 15%, 18%)',
              borderRadius: '8px',
              color: 'hsl(210, 20%, 92%)'
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? 'hsl(230, 15%, 25%)' : 'hsl(165, 100%, 42%)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center mt-2">
        <span className={`font-mono text-sm ${change >= 0 ? 'text-positive' : 'text-negative'}`}>
          {change >= 0 ? '+' : ''}{formatCurrency(change)} ({changePercent}%)
        </span>
      </div>
    </div>
  );
}
