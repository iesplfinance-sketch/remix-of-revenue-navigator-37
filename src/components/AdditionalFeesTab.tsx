import { GlobalSettings } from '@/data/schoolData';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import { DollarSign, GraduationCap, Building } from 'lucide-react';

interface AdditionalFeesTabProps {
  globalSettings: GlobalSettings;
  schoolStudents: number;
  hostelStudents: number;
  onUpdateGlobalSettings: (updates: Partial<GlobalSettings>) => void;
}

export function AdditionalFeesTab({ 
  globalSettings, 
  schoolStudents, 
  hostelStudents,
  onUpdateGlobalSettings 
}: AdditionalFeesTabProps) {
  // Safe defaults for fee values
  const schoolAnnualFee = globalSettings?.schoolAnnualFee ?? 25000;
  const hostelAnnualFee = globalSettings?.hostelAnnualFee ?? 15000;
  const schoolDCP = globalSettings?.schoolDCP ?? 10000;
  const hostelDCP = globalSettings?.hostelDCP ?? 5000;

  // Calculate totals
  const schoolAnnualTotal = schoolStudents * schoolAnnualFee;
  const hostelAnnualTotal = hostelStudents * hostelAnnualFee;
  const totalAnnualFee = schoolAnnualTotal + hostelAnnualTotal;

  const schoolDCPTotal = schoolStudents * schoolDCP;
  const hostelDCPTotal = hostelStudents * hostelDCP;
  const totalDCP = schoolDCPTotal + hostelDCPTotal;

  const grandTotal = totalAnnualFee + totalDCP;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="campus-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Total Annual Fee Revenue</h3>
          </div>
          <div className="font-mono text-2xl text-primary">{formatCurrency(totalAnnualFee)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            School: {formatCurrency(schoolAnnualTotal)} | Hostel: {formatCurrency(hostelAnnualTotal)}
          </div>
        </div>

        <div className="campus-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-warning" />
            <h3 className="text-sm font-medium text-foreground">Total DCP Revenue</h3>
          </div>
          <div className="font-mono text-2xl text-warning">{formatCurrency(totalDCP)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            School: {formatCurrency(schoolDCPTotal)} | Hostel: {formatCurrency(hostelDCPTotal)}
          </div>
        </div>

        <div className="campus-card p-5 border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-positive" />
            <h3 className="text-sm font-medium text-foreground">Combined Additional Revenue</h3>
          </div>
          <div className="font-mono text-2xl text-positive">{formatCurrency(grandTotal)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Annual Fee + DCP
          </div>
        </div>
      </div>

      {/* Fee Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Annual Fee Configuration */}
        <div className="campus-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            Annual Fee Configuration
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Annual fee is charged once per year to every student. This covers administrative costs, facilities, and other school services.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">School Students</p>
                <p className="text-xs text-muted-foreground">{formatNumber(schoolStudents)} students</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">₨</span>
                <Input
                  type="number"
                  value={schoolAnnualFee}
                  onChange={(e) => onUpdateGlobalSettings({ schoolAnnualFee: parseInt(e.target.value) || 0 })}
                  className="w-32 font-mono bg-surface-1 border-border text-right"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Hostel Students</p>
                <p className="text-xs text-muted-foreground">{formatNumber(hostelStudents)} students</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">₨</span>
                <Input
                  type="number"
                  value={hostelAnnualFee}
                  onChange={(e) => onUpdateGlobalSettings({ hostelAnnualFee: parseInt(e.target.value) || 0 })}
                  className="w-32 font-mono bg-surface-1 border-border text-right"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Annual Fee Revenue</span>
                <span className="font-mono text-primary font-semibold">{formatCurrency(totalAnnualFee)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DCP Configuration */}
        <div className="campus-card p-5">
          <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-warning" />
            DCP (Development Charges) Configuration
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            DCP is a one-time development charge for infrastructure improvements, new facilities, and campus development projects.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">School Students</p>
                <p className="text-xs text-muted-foreground">{formatNumber(schoolStudents)} students</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">₨</span>
                <Input
                  type="number"
                  value={schoolDCP}
                  onChange={(e) => onUpdateGlobalSettings({ schoolDCP: parseInt(e.target.value) || 0 })}
                  className="w-32 font-mono bg-surface-1 border-border text-right"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Hostel Students</p>
                <p className="text-xs text-muted-foreground">{formatNumber(hostelStudents)} students</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">₨</span>
                <Input
                  type="number"
                  value={hostelDCP}
                  onChange={(e) => onUpdateGlobalSettings({ hostelDCP: parseInt(e.target.value) || 0 })}
                  className="w-32 font-mono bg-surface-1 border-border text-right"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total DCP Revenue</span>
                <span className="font-mono text-warning font-semibold">{formatCurrency(totalDCP)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It's Added to Total */}
      <div className="campus-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">How Additional Fees Add to Total Revenue</h3>
        <div className="bg-surface-2 rounded-lg p-4 font-mono text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-2">School Students:</p>
              <p className="text-foreground">
                {formatNumber(schoolStudents)} × ₨{schoolAnnualFee.toLocaleString()} = <span className="text-primary">{formatCurrency(schoolAnnualTotal)}</span> (Annual)
              </p>
              <p className="text-foreground">
                {formatNumber(schoolStudents)} × ₨{schoolDCP.toLocaleString()} = <span className="text-warning">{formatCurrency(schoolDCPTotal)}</span> (DCP)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Hostel Students:</p>
              <p className="text-foreground">
                {formatNumber(hostelStudents)} × ₨{hostelAnnualFee.toLocaleString()} = <span className="text-primary">{formatCurrency(hostelAnnualTotal)}</span> (Annual)
              </p>
              <p className="text-foreground">
                {formatNumber(hostelStudents)} × ₨{hostelDCP.toLocaleString()} = <span className="text-warning">{formatCurrency(hostelDCPTotal)}</span> (DCP)
              </p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-positive font-semibold">
              Total Additional Revenue = {formatCurrency(grandTotal)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
