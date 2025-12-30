import { useState } from 'react';
import { GlobalSettings, CustomFee } from '@/data/schoolData';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DollarSign, GraduationCap, Building, Plus, Trash2, Package } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeAmount, setNewFeeAmount] = useState(0);

  // Safe defaults for fee values
  const schoolAnnualFee = globalSettings?.schoolAnnualFee ?? 25000;
  const hostelAnnualFee = globalSettings?.hostelAnnualFee ?? 15000;
  const schoolDCP = globalSettings?.schoolDCP ?? 10000;
  const newAdmissionFeePerStudent = globalSettings?.newAdmissionFeePerStudent ?? 25000;
  const customFees = globalSettings?.customFees ?? [];

  // Calculate totals
  const schoolAnnualTotal = schoolStudents * schoolAnnualFee;
  const hostelAnnualTotal = hostelStudents * hostelAnnualFee;
  const totalAnnualFee = schoolAnnualTotal + hostelAnnualTotal;

  // DCP only applies to school students, not hostels
  const totalDCP = schoolStudents * schoolDCP;

  // Calculate custom fees totals
  const totalCustomFees = customFees.reduce((sum, fee) => {
    let feeTotal = 0;
    if (fee.appliesToSchool) feeTotal += schoolStudents * fee.amountPerStudent;
    if (fee.appliesToHostel) feeTotal += hostelStudents * fee.amountPerStudent;
    return sum + feeTotal;
  }, 0);

  const grandTotal = totalAnnualFee + totalDCP + totalCustomFees;

  const addCustomFee = () => {
    if (!newFeeName.trim() || newFeeAmount <= 0) return;
    
    const newFee: CustomFee = {
      id: `custom-${Date.now()}`,
      name: newFeeName.trim(),
      amountPerStudent: newFeeAmount,
      appliesToSchool: true,
      appliesToHostel: false,
    };
    
    onUpdateGlobalSettings({
      customFees: [...customFees, newFee]
    });
    
    setNewFeeName('');
    setNewFeeAmount(0);
  };

  const removeCustomFee = (feeId: string) => {
    onUpdateGlobalSettings({
      customFees: customFees.filter(f => f.id !== feeId)
    });
  };

  const updateCustomFee = (feeId: string, updates: Partial<CustomFee>) => {
    onUpdateGlobalSettings({
      customFees: customFees.map(f => f.id === feeId ? { ...f, ...updates } : f)
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="campus-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-medium text-foreground">Annual Fee Revenue</h3>
          </div>
          <div className="font-mono text-2xl text-primary">{formatCurrency(totalAnnualFee)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            School: {formatCurrency(schoolAnnualTotal)} | Hostel: {formatCurrency(hostelAnnualTotal)}
          </div>
        </div>

        <div className="campus-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-warning" />
            <h3 className="text-sm font-medium text-foreground">Digital Companion Pack</h3>
          </div>
          <div className="font-mono text-2xl text-warning">{formatCurrency(totalDCP)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            School students only
          </div>
        </div>

        <div className="campus-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-info" />
            <h3 className="text-sm font-medium text-foreground">Custom Fees</h3>
          </div>
          <div className="font-mono text-2xl text-info">{formatCurrency(totalCustomFees)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {customFees.length} custom fee(s) configured
          </div>
        </div>

        <div className="campus-card p-5 border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-positive" />
            <h3 className="text-sm font-medium text-foreground">Combined Revenue</h3>
          </div>
          <div className="font-mono text-2xl text-positive">{formatCurrency(grandTotal)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            All Additional Fees
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
            <Package className="w-4 h-4 text-warning" />
            DCP (Digital Companion Pack) Configuration
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            DCP provides students with digital learning resources, educational software licenses, and technology support for enhanced learning. 
            <span className="text-warning font-medium"> Note: DCP is only applicable to school students, not hostel students.</span>
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

            <div className="pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total DCP Revenue (School Only)</span>
                <span className="font-mono text-warning font-semibold">{formatCurrency(totalDCP)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Admission Fee Configuration */}
      <div className="campus-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-info" />
          New Admission Fee Configuration
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          One-time fee charged to new students at the time of admission. This is applied only to new admission students, not renewals.
          <span className="text-info font-medium"> Note: This fee is charged to all new students across school and hostel.</span>
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
            <div>
              <p className="text-sm font-medium text-foreground">Fee Per New Student</p>
              <p className="text-xs text-muted-foreground">Applied at admission</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">₨</span>
              <Input
                type="number"
                value={newAdmissionFeePerStudent}
                onChange={(e) => onUpdateGlobalSettings({ newAdmissionFeePerStudent: parseInt(e.target.value) || 0 })}
                className="w-32 font-mono bg-surface-1 border-border text-right"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total New Admission Fee Revenue</span>
              <span className="font-mono text-info font-semibold">Calculated from new students projection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Fees Section */}
      <div className="campus-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-positive" />
          Custom Fees
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Add additional fees like Stationery Charges, Lab Fees, Sports Fees, etc. These will be reflected in campus summaries and the main dashboard.
        </p>

        {/* Add New Fee Form */}
        <div className="flex items-end gap-4 p-4 bg-surface-2 rounded-lg mb-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Fee Name</label>
            <Input
              type="text"
              value={newFeeName}
              onChange={(e) => setNewFeeName(e.target.value)}
              placeholder="e.g., Stationery Charges"
              className="bg-surface-1 border-border"
            />
          </div>
          <div className="w-40">
            <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">Amount (₨)</label>
            <Input
              type="number"
              value={newFeeAmount || ''}
              onChange={(e) => setNewFeeAmount(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="bg-surface-1 border-border text-right font-mono"
            />
          </div>
          <Button 
            onClick={addCustomFee}
            disabled={!newFeeName.trim() || newFeeAmount <= 0}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Fee
          </Button>
        </div>

        {/* Existing Custom Fees */}
        {customFees.length > 0 ? (
          <div className="space-y-3">
            {customFees.map(fee => {
              const schoolFeeTotal = fee.appliesToSchool ? schoolStudents * fee.amountPerStudent : 0;
              const hostelFeeTotal = fee.appliesToHostel ? hostelStudents * fee.amountPerStudent : 0;
              const feeTotal = schoolFeeTotal + hostelFeeTotal;

              return (
                <div key={fee.id} className="flex items-center gap-4 p-4 bg-surface-2 rounded-lg">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={fee.name}
                      onChange={(e) => updateCustomFee(fee.id, { name: e.target.value })}
                      className="bg-surface-1 border-border font-medium"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      value={fee.amountPerStudent}
                      onChange={(e) => updateCustomFee(fee.id, { amountPerStudent: parseInt(e.target.value) || 0 })}
                      className="bg-surface-1 border-border text-right font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">School</span>
                    <Switch
                      checked={fee.appliesToSchool}
                      onCheckedChange={(checked) => updateCustomFee(fee.id, { appliesToSchool: checked })}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Hostel</span>
                    <Switch
                      checked={fee.appliesToHostel}
                      onCheckedChange={(checked) => updateCustomFee(fee.id, { appliesToHostel: checked })}
                    />
                  </div>
                  <div className="w-24 text-right">
                    <span className="font-mono text-sm text-primary">{formatCurrency(feeTotal)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCustomFee(fee.id)}
                    className="text-negative hover:text-negative hover:bg-negative/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No custom fees configured. Add a fee above to get started.
          </div>
        )}
      </div>

      {/* How It's Added to Total */}
      <div className="campus-card p-5">
        <h3 className="text-sm font-medium text-foreground mb-4">How Additional Fees Add to Total Revenue</h3>
        <div className="bg-surface-2 rounded-lg p-4 font-mono text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground mb-2">School Students ({formatNumber(schoolStudents)}):</p>
              <p className="text-foreground">
                Annual Fee: <span className="text-primary">{formatCurrency(schoolAnnualTotal)}</span>
              </p>
              <p className="text-foreground">
                DCP: <span className="text-warning">{formatCurrency(totalDCP)}</span>
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Hostel Students ({formatNumber(hostelStudents)}):</p>
              <p className="text-foreground">
                Annual Fee: <span className="text-primary">{formatCurrency(hostelAnnualTotal)}</span>
              </p>
              <p className="text-muted-foreground text-xs">
                (DCP not applicable)
              </p>
            </div>
          </div>
          {customFees.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-muted-foreground mb-2">Custom Fees:</p>
              {customFees.map(fee => {
                const schoolFeeTotal = fee.appliesToSchool ? schoolStudents * fee.amountPerStudent : 0;
                const hostelFeeTotal = fee.appliesToHostel ? hostelStudents * fee.amountPerStudent : 0;
                return (
                  <p key={fee.id} className="text-foreground">
                    {fee.name}: <span className="text-info">{formatCurrency(schoolFeeTotal + hostelFeeTotal)}</span>
                  </p>
                );
              })}
            </div>
          )}
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