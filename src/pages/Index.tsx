import { useState } from 'react';
import { Download, Settings, RotateCcw, TrendingUp, Building, LayoutDashboard, DollarSign } from 'lucide-react';
import { useSimulationState } from '@/hooks/useSimulationState';
import { HeaderMetrics } from '@/components/MetricCard';
import { CampusCard } from '@/components/CampusCard';
import { HostelCard } from '@/components/HostelCard';
import { RevenuePieChart, TopCampusesChart, RevenueComparison } from '@/components/Charts';
import { CampusOverviewTable } from '@/components/CampusOverviewTable';
import { FeeExplainer } from '@/components/FeeExplainer';
import { SettingsModal } from '@/components/SettingsModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AdditionalFeesTab } from '@/components/AdditionalFeesTab';
import { CalculationBreakdown } from '@/components/CalculationBreakdown';
import { generateCSVExport, formatCurrency } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const {
    campuses,
    hostels,
    globalSettings,
    totals,
    campusCalculations,
    topCampuses,
    updateCampus,
    updateCampusClass,
    updateHostel,
    updateGlobalSettings,
    applyGlobalDiscount,
    resetToDefaults,
  } = useSimulationState();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [expandedCampusId, setExpandedCampusId] = useState<string | null>(null);

  const handleExport = () => {
    const csv = generateCSVExport(campuses, hostels, globalSettings);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-projection-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleCampusExpand = (campusId: string) => {
    setExpandedCampusId(prev => prev === campusId ? null : campusId);
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Sticky Header */}
      <header className="sticky-header px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Revenue Forecasting Engine</h1>
              <p className="text-xs text-muted-foreground">Real-time What-If Simulation Dashboard</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={resetToDefaults}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="default" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          <HeaderMetrics
            schoolRevenue={totals.schoolRevenue}
            hostelRevenue={totals.hostelRevenue}
            totalRevenue={totals.totalRevenue}
            schoolStudents={totals.schoolStudents}
            hostelStudents={totals.hostelStudents}
            totalStudents={totals.totalStudents}
            currentTotalRevenue={totals.currentTotalRevenue}
            annualFeeRevenue={totals.annualFeeRevenue}
            dcpRevenue={totals.dcpRevenue}
            grandTotalRevenue={totals.grandTotalRevenue}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="bg-surface-1 border border-border mb-6 flex-wrap">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="campuses" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Campuses
            </TabsTrigger>
            <TabsTrigger value="hostels" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Building className="w-4 h-4 mr-2" />
              Hostels
            </TabsTrigger>
            <TabsTrigger value="fees" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Annual Fee & DCP
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="animate-fade-in space-y-6">
            {/* Global Controls */}
            <div className="campus-card p-5">
              <h2 className="text-sm font-medium text-foreground mb-4">Master Control Panel</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">Global Fee Hike</label>
                    <span className="font-mono text-sm text-primary">+{globalSettings.globalFeeHike}%</span>
                  </div>
                  <Slider
                    value={[globalSettings.globalFeeHike]}
                    onValueChange={([value]) => updateGlobalSettings({ globalFeeHike: value })}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">Global Student Growth</label>
                    <span className="font-mono text-sm text-primary">{globalSettings.globalStudentGrowth > 0 ? '+' : ''}{globalSettings.globalStudentGrowth}%</span>
                  </div>
                  <Slider
                    value={[globalSettings.globalStudentGrowth]}
                    onValueChange={([value]) => updateGlobalSettings({ globalStudentGrowth: value })}
                    min={-20}
                    max={50}
                    step={1}
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">Global Discount (All Campuses)</label>
                    <span className="font-mono text-sm text-warning">{globalSettings.globalDiscount}%</span>
                  </div>
                  <Slider
                    value={[globalSettings.globalDiscount]}
                    onValueChange={([value]) => applyGlobalDiscount(value)}
                    min={0}
                    max={40}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="campus-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">Revenue Mix</h3>
                <RevenuePieChart schoolRevenue={totals.schoolRevenue} hostelRevenue={totals.hostelRevenue} />
              </div>
              <div className="campus-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">Top 5 Campuses</h3>
                <TopCampusesChart campuses={topCampuses} />
              </div>
              <div className="campus-card p-5">
                <h3 className="text-sm font-medium text-foreground mb-4">Revenue Comparison</h3>
                <RevenueComparison currentRevenue={totals.currentTotalRevenue} projectedRevenue={totals.totalRevenue} />
              </div>
            </div>

            {/* Calculation Breakdown Table */}
            <CalculationBreakdown
              campuses={campuses}
              calculations={campusCalculations}
              globalSettings={globalSettings}
            />

            {/* Fee Calculation Explainer */}
            <FeeExplainer 
              globalFeeHike={globalSettings.globalFeeHike}
              globalStudentGrowth={globalSettings.globalStudentGrowth}
              globalDiscount={globalSettings.globalDiscount}
            />
          </TabsContent>

          {/* Campuses Tab */}
          <TabsContent value="campuses" className="animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {campuses.map((campus, index) => (
                <CampusCard
                  key={campus.id}
                  campus={campus}
                  calculation={campusCalculations[index]}
                  globalSettings={globalSettings}
                  onUpdate={(updates) => updateCampus(campus.id, updates)}
                  isExpanded={expandedCampusId === campus.id}
                  onToggleExpand={() => handleToggleCampusExpand(campus.id)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Hostels Tab */}
          <TabsContent value="hostels" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hostels.map((hostel) => (
                <HostelCard
                  key={hostel.id}
                  hostel={hostel}
                  onUpdate={(updates) => updateHostel(hostel.id, updates)}
                />
              ))}
            </div>
          </TabsContent>

          {/* Annual Fee & DCP Tab */}
          <TabsContent value="fees">
            <AdditionalFeesTab
              globalSettings={globalSettings}
              schoolStudents={totals.schoolStudents}
              hostelStudents={totals.hostelStudents}
              onUpdateGlobalSettings={updateGlobalSettings}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        campuses={campuses}
        onUpdateCampus={updateCampus}
        onUpdateCampusClass={updateCampusClass}
      />
    </div>
  );
};

export default Index;
