import { useState } from 'react';
import { X, Users, DollarSign, Building2, Percent, Receipt, Home } from 'lucide-react';
import { CampusData, ClassData, GlobalSettings, HostelData } from '@/data/schoolData';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: CampusData[];
  hostels: HostelData[];
  globalSettings: GlobalSettings;
  onUpdateCampus: (campusId: string, updates: Partial<CampusData>) => void;
  onUpdateCampusClass: (campusId: string, classIndex: number, updates: Partial<ClassData>) => void;
  onUpdateGlobalSettings: (updates: Partial<GlobalSettings>) => void;
  onUpdateHostel: (hostelId: string, updates: Partial<HostelData>) => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  campuses, 
  hostels,
  globalSettings,
  onUpdateCampus, 
  onUpdateCampusClass,
  onUpdateGlobalSettings,
  onUpdateHostel
}: SettingsModalProps) {
  const [selectedCampus, setSelectedCampus] = useState(campuses[0]?.id || '');
  const [activeTab, setActiveTab] = useState('students');
  const [settingsMode, setSettingsMode] = useState<'campus' | 'global'>('campus');

  if (!isOpen) return null;

  const campus = campuses.find(c => c.id === selectedCampus);
  const totalHostelStudents = hostels.reduce((sum, h) => sum + h.currentOccupancy, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-surface-1 border border-border rounded-xl shadow-2xl w-[95vw] max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">Settings - Base Data Editor</h2>
            <div className="flex gap-1 bg-surface-2 rounded-lg p-1">
              <button
                onClick={() => setSettingsMode('campus')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  settingsMode === 'campus' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Campus Data
              </button>
              <button
                onClick={() => setSettingsMode('global')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  settingsMode === 'global' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Last Year Fees
              </button>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {settingsMode === 'campus' ? (
          <div className="flex flex-1 min-h-0">
            {/* Campus Selector Sidebar */}
            <div className="w-56 border-r border-border bg-surface-0 flex flex-col min-h-0">
              <div className="p-3 border-b border-border flex-shrink-0">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Select Campus</p>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {campuses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCampus(c.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCampus === c.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-foreground hover:bg-surface-2'
                      }`}
                    >
                      {c.shortName}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
              {campus && (
                <>
                  <div className="p-4 border-b border-border flex-shrink-0">
                    <h3 className="font-medium text-foreground">{campus.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Capacity: {campus.maxCapacity} | Last Year Discount: {campus.lastYearDiscount}% | Forecasted Discount: {campus.discountRate}%
                    </p>
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 pt-2 flex-shrink-0">
                      <TabsList className="bg-surface-2">
                        <TabsTrigger value="students">
                          <Users className="w-4 h-4 mr-2" />
                          Student Counts
                        </TabsTrigger>
                        <TabsTrigger value="fees">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Fee Structure
                        </TabsTrigger>
                        <TabsTrigger value="capacity">
                          <Building2 className="w-4 h-4 mr-2" />
                          Capacity
                        </TabsTrigger>
                        <TabsTrigger value="discounts">
                          <Percent className="w-4 h-4 mr-2" />
                          Discounts
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                      <ScrollArea className="h-full p-4">
                        <TabsContent value="students" className="mt-0 pb-4">
                          <table className="data-grid w-full text-xs">
                            <thead>
                              <tr>
                                <th>Class</th>
                                <th className="text-right">Renewal Students</th>
                                <th className="text-right">New Admission</th>
                                <th className="text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {campus.classes.filter(c => c.renewalCount > 0 || c.newAdmissionCount > 0 || c.renewalFee > 0).map((cls) => (
                                <tr key={cls.className}>
                                  <td className="font-medium">{cls.className}</td>
                                  <td className="text-right">
                                    <Input
                                      type="number"
                                      value={cls.renewalCount}
                                      onChange={(e) => {
                                        const classIndex = campus.classes.findIndex(c => c.className === cls.className);
                                        onUpdateCampusClass(campus.id, classIndex, { renewalCount: parseInt(e.target.value) || 0 });
                                      }}
                                      className="w-20 h-7 text-xs font-mono bg-surface-2 border-border text-right"
                                    />
                                  </td>
                                  <td className="text-right">
                                    <Input
                                      type="number"
                                      value={cls.newAdmissionCount}
                                      onChange={(e) => {
                                        const classIndex = campus.classes.findIndex(c => c.className === cls.className);
                                        onUpdateCampusClass(campus.id, classIndex, { newAdmissionCount: parseInt(e.target.value) || 0 });
                                      }}
                                      className="w-20 h-7 text-xs font-mono bg-surface-2 border-border text-right"
                                    />
                                  </td>
                                  <td className="text-right font-mono text-muted-foreground">
                                    {cls.renewalCount + cls.newAdmissionCount}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </TabsContent>

                        <TabsContent value="fees" className="mt-0 pb-4">
                          <table className="data-grid w-full text-xs">
                            <thead>
                              <tr>
                                <th>Class</th>
                                <th className="text-right">Renewal Fee (₨)</th>
                                <th className="text-right">New Admission Fee (₨)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {campus.classes.filter(c => c.renewalCount > 0 || c.newAdmissionCount > 0 || c.renewalFee > 0).map((cls) => (
                                <tr key={cls.className}>
                                  <td className="font-medium">{cls.className}</td>
                                  <td className="text-right">
                                    <Input
                                      type="number"
                                      value={cls.renewalFee}
                                      onChange={(e) => {
                                        const classIndex = campus.classes.findIndex(c => c.className === cls.className);
                                        onUpdateCampusClass(campus.id, classIndex, { renewalFee: parseInt(e.target.value) || 0 });
                                      }}
                                      className="w-28 h-7 text-xs font-mono bg-surface-2 border-border text-right"
                                    />
                                  </td>
                                  <td className="text-right">
                                    <Input
                                      type="number"
                                      value={cls.newAdmissionFee}
                                      onChange={(e) => {
                                        const classIndex = campus.classes.findIndex(c => c.className === cls.className);
                                        onUpdateCampusClass(campus.id, classIndex, { newAdmissionFee: parseInt(e.target.value) || 0 });
                                      }}
                                      className="w-28 h-7 text-xs font-mono bg-surface-2 border-border text-right"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </TabsContent>

                        <TabsContent value="capacity" className="mt-0 pb-4">
                          <div className="space-y-6">
                            <div className="campus-card p-4">
                              <h4 className="text-sm font-medium text-foreground mb-4">Maximum Student Capacity</h4>
                              <div className="flex items-center gap-4">
                                <label className="text-xs text-muted-foreground uppercase tracking-wide min-w-32">
                                  Max Strength:
                                </label>
                                <Input
                                  type="number"
                                  value={campus.maxCapacity}
                                  onChange={(e) => onUpdateCampus(campus.id, { maxCapacity: parseInt(e.target.value) || 0 })}
                                  className="w-32 h-9 text-sm font-mono bg-surface-2 border-border text-right"
                                />
                                <span className="text-xs text-muted-foreground">students</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-3">
                                This sets the maximum capacity for this campus. If projected students exceed this, a warning will be shown.
                              </p>
                            </div>

                            <div className="campus-card p-4">
                              <h4 className="text-sm font-medium text-foreground mb-2">Current Statistics</h4>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Current Students:</span>
                                  <span className="ml-2 font-mono text-foreground">
                                    {campus.classes.reduce((sum, c) => sum + c.renewalCount + c.newAdmissionCount, 0)}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Max Capacity:</span>
                                  <span className="ml-2 font-mono text-foreground">{campus.maxCapacity}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Utilization:</span>
                                  <span className="ml-2 font-mono text-foreground">
                                    {((campus.classes.reduce((sum, c) => sum + c.renewalCount + c.newAdmissionCount, 0) / campus.maxCapacity) * 100).toFixed(1)}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Available Seats:</span>
                                  <span className="ml-2 font-mono text-positive">
                                    {campus.maxCapacity - campus.classes.reduce((sum, c) => sum + c.renewalCount + c.newAdmissionCount, 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="discounts" className="mt-0 pb-4">
                          <div className="space-y-6">
                            <div className="campus-card p-4">
                              <h4 className="text-sm font-medium text-foreground mb-4">Last Year Discount Rate</h4>
                              <p className="text-xs text-muted-foreground mb-4">
                                This discount was applied to last year's (Session 25-26) fee calculations. It is used to calculate current year revenue for comparison.
                              </p>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm text-muted-foreground">Last Year Discount</label>
                                  <span className="font-mono text-lg text-warning">{campus.lastYearDiscount}%</span>
                                </div>
                                <Slider
                                  value={[campus.lastYearDiscount]}
                                  onValueChange={([value]) => onUpdateCampus(campus.id, { lastYearDiscount: value })}
                                  min={0}
                                  max={40}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>0%</span>
                                  <span>40%</span>
                                </div>
                              </div>
                            </div>

                            <div className="campus-card p-4">
                              <h4 className="text-sm font-medium text-foreground mb-4">Forecasted Discount Rate</h4>
                              <p className="text-xs text-muted-foreground mb-4">
                                This discount will be applied to next year's (Forecast 26-27) fee calculations. Adjust using the slider in the campus card.
                              </p>
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm text-muted-foreground">Forecasted Discount</label>
                                  <span className="font-mono text-lg text-primary">{campus.discountRate}%</span>
                                </div>
                                <Slider
                                  value={[campus.discountRate]}
                                  onValueChange={([value]) => onUpdateCampus(campus.id, { discountRate: value })}
                                  min={0}
                                  max={40}
                                  step={1}
                                  className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>0%</span>
                                  <span>40%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </TabsContent>
                      </ScrollArea>
                    </div>
                  </Tabs>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Global Settings - Last Year Fees */
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                  <p className="text-sm text-warning">
                    <strong>Last Year Fees (Session 25-26)</strong> - These values are used to calculate current year revenue for comparison with forecasted values.
                  </p>
                </div>

                {/* Annual Fee - Last Year */}
                <div className="campus-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    Last Year Annual Fee (Session 25-26)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">School Students</p>
                        <p className="text-xs text-muted-foreground">Per student annual fee</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">₨</span>
                        <Input
                          type="number"
                          value={globalSettings.lastYearSchoolAnnualFee}
                          onChange={(e) => onUpdateGlobalSettings({ lastYearSchoolAnnualFee: parseInt(e.target.value) || 0 })}
                          className="w-28 font-mono bg-surface-1 border-border text-right"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">Hostel Students</p>
                        <p className="text-xs text-muted-foreground">Per student annual fee</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">₨</span>
                        <Input
                          type="number"
                          value={globalSettings.lastYearHostelAnnualFee}
                          onChange={(e) => onUpdateGlobalSettings({ lastYearHostelAnnualFee: parseInt(e.target.value) || 0 })}
                          className="w-28 font-mono bg-surface-1 border-border text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DCP - Last Year */}
                <div className="campus-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-warning" />
                    Last Year DCP (Session 25-26)
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Digital Companion Pack - <span className="text-warning font-medium">School students only</span>
                  </p>
                  <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">School Students</p>
                      <p className="text-xs text-muted-foreground">Per student DCP fee</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">₨</span>
                      <Input
                        type="number"
                        value={globalSettings.lastYearSchoolDCP}
                        onChange={(e) => onUpdateGlobalSettings({ lastYearSchoolDCP: parseInt(e.target.value) || 0 })}
                        className="w-28 font-mono bg-surface-1 border-border text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* New Admission Fee - Last Year */}
                <div className="campus-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-info" />
                    Last Year New Admission Fee (Session 25-26)
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    One-time admission fee - <span className="text-info font-medium">School students only</span>
                  </p>
                  <div className="flex items-center justify-between p-4 bg-surface-2 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-foreground">School Students</p>
                      <p className="text-xs text-muted-foreground">Per new student admission fee</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">₨</span>
                      <Input
                        type="number"
                        value={globalSettings.lastYearNewAdmissionFee}
                        onChange={(e) => onUpdateGlobalSettings({ lastYearNewAdmissionFee: parseInt(e.target.value) || 0 })}
                        className="w-28 font-mono bg-surface-1 border-border text-right"
                      />
                    </div>
                  </div>
                </div>

                {/* Hostel Fee Configuration */}
                <div className="campus-card p-5">
                  <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                    <Home className="w-4 h-4 text-accent" />
                    Hostel Fee Per Student
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Configure hostel fee for last year and current/forecasted year. Total hostel students: <span className="text-accent font-medium">{formatNumber(totalHostelStudents)}</span>
                  </p>
                  
                  <div className="space-y-4">
                    {hostels.map(hostel => (
                      <div key={hostel.id} className="p-4 bg-surface-2 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{hostel.name}</p>
                            <p className="text-xs text-muted-foreground">{hostel.currentOccupancy} students</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                            <span className="text-xs text-warning">Last Year (25-26)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">₨</span>
                              <Input
                                type="number"
                                value={hostel.lastYearFeePerStudent}
                                onChange={(e) => onUpdateHostel(hostel.id, { lastYearFeePerStudent: parseInt(e.target.value) || 0 })}
                                className="w-28 h-8 text-sm font-mono bg-surface-2 border-border text-right"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-surface-1 rounded-lg">
                            <span className="text-xs text-primary">Forecasted (26-27)</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground text-xs">₨</span>
                              <Input
                                type="number"
                                value={hostel.feePerStudent}
                                onChange={(e) => onUpdateHostel(hostel.id, { feePerStudent: parseInt(e.target.value) || 0 })}
                                className="w-28 h-8 text-sm font-mono bg-surface-2 border-border text-right"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="campus-card p-5 border-primary/30">
                  <h3 className="text-sm font-medium text-foreground mb-4">Fee Comparison Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Last Year (Session 25-26)</p>
                      <div className="space-y-1">
                        <p className="text-foreground">School Annual: <span className="font-mono text-warning">{formatCurrency(globalSettings.lastYearSchoolAnnualFee)}</span></p>
                        <p className="text-foreground">Hostel Annual: <span className="font-mono text-warning">{formatCurrency(globalSettings.lastYearHostelAnnualFee)}</span></p>
                        <p className="text-foreground">School DCP: <span className="font-mono text-warning">{formatCurrency(globalSettings.lastYearSchoolDCP)}</span></p>
                        <p className="text-foreground">Admission Fee: <span className="font-mono text-warning">{formatCurrency(globalSettings.lastYearNewAdmissionFee)}</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Forecasted (Session 26-27)</p>
                      <div className="space-y-1">
                        <p className="text-foreground">School Annual: <span className="font-mono text-primary">{formatCurrency(globalSettings.schoolAnnualFee)}</span></p>
                        <p className="text-foreground">Hostel Annual: <span className="font-mono text-primary">{formatCurrency(globalSettings.hostelAnnualFee)}</span></p>
                        <p className="text-foreground">School DCP: <span className="font-mono text-primary">{formatCurrency(globalSettings.schoolDCP)}</span></p>
                        <p className="text-foreground">Admission Fee: <span className="font-mono text-primary">{formatCurrency(globalSettings.newAdmissionFeePerStudent)}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}