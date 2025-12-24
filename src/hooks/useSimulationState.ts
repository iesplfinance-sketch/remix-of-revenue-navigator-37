import { useState, useCallback, useMemo } from 'react';
import { 
  CampusData, 
  HostelData, 
  GlobalSettings,
  initialCampusData, 
  initialHostelData,
  initialGlobalSettings 
} from '@/data/schoolData';
import { 
  calculateTotals, 
  calculateCampusRevenue, 
  TotalCalculation,
  CampusCalculation 
} from '@/lib/calculations';

export function useSimulationState() {
  const [campuses, setCampuses] = useState<CampusData[]>(initialCampusData);
  const [hostels, setHostels] = useState<HostelData[]>(initialHostelData);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(initialGlobalSettings);

  // Update a single campus
  const updateCampus = useCallback((campusId: string, updates: Partial<CampusData>) => {
    setCampuses(prev => prev.map(campus => 
      campus.id === campusId ? { ...campus, ...updates } : campus
    ));
  }, []);

  // Update a single hostel
  const updateHostel = useCallback((hostelId: string, updates: Partial<HostelData>) => {
    setHostels(prev => prev.map(hostel => 
      hostel.id === hostelId ? { ...hostel, ...updates } : hostel
    ));
  }, []);

  // Update global settings
  const updateGlobalSettings = useCallback((updates: Partial<GlobalSettings>) => {
    setGlobalSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Calculate totals
  const totals: TotalCalculation = useMemo(() => {
    return calculateTotals(campuses, hostels, globalSettings);
  }, [campuses, hostels, globalSettings]);

  // Get campus calculations
  const campusCalculations: CampusCalculation[] = useMemo(() => {
    return campuses.map(campus => calculateCampusRevenue(campus, globalSettings));
  }, [campuses, globalSettings]);

  // Get top campuses by revenue
  const topCampuses = useMemo(() => {
    return [...campusCalculations]
      .sort((a, b) => b.projectedNetRevenue - a.projectedNetRevenue)
      .slice(0, 5);
  }, [campusCalculations]);

  // Reset all to defaults
  const resetToDefaults = useCallback(() => {
    setCampuses(initialCampusData);
    setHostels(initialHostelData);
    setGlobalSettings(initialGlobalSettings);
  }, []);

  return {
    campuses,
    hostels,
    globalSettings,
    totals,
    campusCalculations,
    topCampuses,
    updateCampus,
    updateHostel,
    updateGlobalSettings,
    resetToDefaults,
    setCampuses,
    setHostels,
  };
}
