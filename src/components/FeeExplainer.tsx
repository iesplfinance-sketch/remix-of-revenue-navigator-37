import { HelpCircle, Calculator, TrendingUp, Percent, Users } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/calculations';

interface FeeExplainerProps {
  globalNewAdmissionFeeHike: number;
  globalRenewalFeeHike: number;
  globalNewStudentGrowth: number;
  globalRenewalGrowth: number;
  globalDiscount: number;
}

export function FeeExplainer({ globalNewAdmissionFeeHike, globalRenewalFeeHike, globalNewStudentGrowth, globalRenewalGrowth, globalDiscount }: FeeExplainerProps) {
  // Example calculation for new admission
  const exampleNewAdmFee = 350000;
  const exampleRenewalFee = 300000;
  const exampleNewAdmStudents = 30;
  const exampleRenewalStudents = 70;
  
  const newAdmFeeAfterHike = exampleNewAdmFee * (1 + globalNewAdmissionFeeHike / 100);
  const renewalFeeAfterHike = exampleRenewalFee * (1 + globalRenewalFeeHike / 100);
  const newAdmStudentsAfterGrowth = Math.round(exampleNewAdmStudents * (1 + globalNewStudentGrowth / 100));
  const renewalStudentsAfterGrowth = Math.round(exampleRenewalStudents * (1 + globalRenewalGrowth / 100));
  const grossRevenue = (newAdmFeeAfterHike * newAdmStudentsAfterGrowth) + (renewalFeeAfterHike * renewalStudentsAfterGrowth);
  const netRevenue = grossRevenue * (1 - globalDiscount / 100);

  return (
    <div className="campus-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-medium text-foreground">How Revenue is Calculated</h3>
      </div>

      {/* Simple Explanation */}
      <div className="bg-surface-2 rounded-lg p-4 mb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Simple Formula:</strong><br />
          Net Revenue = [(New Adm Fee × Fee Hike) × New Students] + [(Renewal Fee × Fee Hike) × Renewal Students] - Discount + DCP + Annual Fee + Admission Fee
        </p>
      </div>

      {/* Step by Step */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">1</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Apply Fee Hike (New Admission)</p>
            <p className="text-xs text-muted-foreground">
              Base Fee ₨{exampleNewAdmFee.toLocaleString()} + {globalNewAdmissionFeeHike}% = <span className="text-primary font-mono">₨{newAdmFeeAfterHike.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">2</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Apply Fee Hike (Renewal)</p>
            <p className="text-xs text-muted-foreground">
              Base Fee ₨{exampleRenewalFee.toLocaleString()} + {globalRenewalFeeHike}% = <span className="text-primary font-mono">₨{renewalFeeAfterHike.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">3</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Apply Student Growth (Separate)</p>
            <p className="text-xs text-muted-foreground">
              New Adm: {exampleNewAdmStudents} + {globalNewStudentGrowth}% = <span className="text-primary font-mono">{newAdmStudentsAfterGrowth}</span> | 
              Renewal: {exampleRenewalStudents} + {globalRenewalGrowth}% = <span className="text-primary font-mono">{renewalStudentsAfterGrowth}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-primary">4</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Calculate Gross Revenue</p>
            <p className="text-xs text-muted-foreground">
              (₨{newAdmFeeAfterHike.toLocaleString()} × {newAdmStudentsAfterGrowth}) + (₨{renewalFeeAfterHike.toLocaleString()} × {renewalStudentsAfterGrowth}) = <span className="text-primary font-mono">{formatCurrency(grossRevenue)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-warning">5</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Apply Society Discount</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(grossRevenue)} - {globalDiscount}% discount = <span className="text-positive font-mono font-semibold">{formatCurrency(netRevenue)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-positive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-positive">6</span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Add Additional Fees</p>
            <p className="text-xs text-muted-foreground">
              + DCP (per student) + Annual Fee (per student) + Admission Fee (new students only)
            </p>
          </div>
        </div>
      </div>
      {/* Key Terms */}
      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Key Terms</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground"><strong className="text-foreground">Fee Hike:</strong> Annual fee increase %</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground"><strong className="text-foreground">Growth:</strong> Student enrollment change</span>
          </div>
          <div className="flex items-center gap-2">
            <Percent className="w-3 h-3 text-warning" />
            <span className="text-muted-foreground"><strong className="text-foreground">Discount:</strong> Society member discount</span>
          </div>
          <div className="flex items-center gap-2">
            <Calculator className="w-3 h-3 text-positive" />
            <span className="text-muted-foreground"><strong className="text-foreground">Net:</strong> Actual revenue received</span>
          </div>
        </div>
      </div>
    </div>
  );
}