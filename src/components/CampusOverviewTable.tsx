import { CampusCalculation, formatCurrency, formatNumber, formatPercent } from '@/lib/calculations';

interface CampusOverviewTableProps {
  calculations: CampusCalculation[];
}

export function CampusOverviewTable({ calculations }: CampusOverviewTableProps) {
  // Sort by projected revenue descending
  const sorted = [...calculations].sort((a, b) => b.projectedNetRevenue - a.projectedNetRevenue);

  return (
    <div className="overflow-x-auto">
      <table className="data-grid w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Campus</th>
            <th className="text-right">Current Students</th>
            <th className="text-right">Projected Students</th>
            <th className="text-right">Current Revenue</th>
            <th className="text-right">Projected Revenue</th>
            <th className="text-right">Change</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((calc) => {
            const changePercent = calc.currentNetRevenue > 0 
              ? ((calc.projectedNetRevenue - calc.currentNetRevenue) / calc.currentNetRevenue) * 100 
              : 0;
            
            return (
              <tr key={calc.campusId}>
                <td className="font-medium text-foreground">
                  {calc.campusName.replace(' Campus', '').replace(' Boys', '').replace(' Girls', '')}
                </td>
                <td className="text-right font-mono">{formatNumber(calc.currentTotalStudents)}</td>
                <td className={`text-right font-mono ${calc.projectedTotalStudents > calc.currentTotalStudents ? 'text-positive' : calc.projectedTotalStudents < calc.currentTotalStudents ? 'text-negative' : ''}`}>
                  {formatNumber(calc.projectedTotalStudents)}
                </td>
                <td className="text-right font-mono text-muted-foreground">{formatCurrency(calc.currentNetRevenue)}</td>
                <td className="text-right font-mono text-foreground">{formatCurrency(calc.projectedNetRevenue)}</td>
                <td className={`text-right font-mono ${calc.revenueChange >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {formatPercent(changePercent)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
