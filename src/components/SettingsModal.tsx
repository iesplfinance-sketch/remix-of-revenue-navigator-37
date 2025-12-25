import { useState } from 'react';
import { X, Users, DollarSign, Building2 } from 'lucide-react';
import { CampusData, ClassData } from '@/data/schoolData';
import { formatCurrency } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: CampusData[];
  onUpdateCampus: (campusId: string, updates: Partial<CampusData>) => void;
  onUpdateCampusClass: (campusId: string, classIndex: number, updates: Partial<ClassData>) => void;
}

export function SettingsModal({ isOpen, onClose, campuses, onUpdateCampus, onUpdateCampusClass }: SettingsModalProps) {
  const [selectedCampus, setSelectedCampus] = useState(campuses[0]?.id || '');
  const [activeTab, setActiveTab] = useState('students');

  if (!isOpen) return null;

  const campus = campuses.find(c => c.id === selectedCampus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-surface-1 border border-border rounded-xl shadow-2xl w-[95vw] max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Settings - Base Data Editor</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[70vh]">
          {/* Campus Selector Sidebar */}
          <div className="w-56 border-r border-border bg-surface-0">
            <div className="p-3 border-b border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Select Campus</p>
            </div>
            <ScrollArea className="h-[calc(70vh-45px)]">
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
          <div className="flex-1 flex flex-col">
            {campus && (
              <>
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-foreground">{campus.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Capacity: {campus.maxCapacity} | Current Discount: {campus.discountRate}%
                  </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="px-4 pt-2">
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
                    </TabsList>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4">
                    <TabsContent value="students" className="mt-0 data-[state=inactive]:hidden">
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
                          {campus.classes.filter(c => c.renewalCount > 0 || c.newAdmissionCount > 0 || c.renewalFee > 0).map((cls, idx) => (
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

                    <TabsContent value="fees" className="mt-0">
                      <table className="data-grid w-full text-xs">
                        <thead>
                          <tr>
                            <th>Class</th>
                            <th className="text-right">Renewal Fee (₨)</th>
                            <th className="text-right">New Admission Fee (₨)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {campus.classes.filter(c => c.renewalCount > 0 || c.newAdmissionCount > 0 || c.renewalFee > 0).map((cls, idx) => (
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

                    <TabsContent value="capacity" className="mt-0">
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
                    </div>
                  </ScrollArea>
                </Tabs>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
