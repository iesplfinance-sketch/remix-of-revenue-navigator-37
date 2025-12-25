import { useState, useCallback, useMemo } from 'react';
import { 
  CampusData, 
  HostelData, 
  GlobalSettings,
  ClassData,
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

  // Update a single class within a campus
  const updateCampusClass = useCallback((campusId: string, classIndex: number, updates: Partial<ClassData>) => {
    setCampuses(prev => prev.map(campus => {
      if (campus.id !== campusId) return campus;
      const newClasses = [...campus.classes];
      newClasses[classIndex] = { ...newClasses[classIndex], ...updates };
      return { ...campus, classes: newClasses };
    }));
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

  // Apply global discount to all campuses
  const applyGlobalDiscount = useCallback((discount: number) => {
    setCampuses(prev => prev.map(campus => ({ ...campus, discountRate: discount })));
    setGlobalSettings(prev => ({ ...prev, globalDiscount: discount }));
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

  // Load a saved simulation state
  const loadSimulationState = useCallback((
    loadedCampuses: CampusData[],
    loadedHostels: HostelData[],
    loadedGlobalSettings: GlobalSettings
  ) => {
    setCampuses(loadedCampuses);
    setHostels(loadedHostels);
    setGlobalSettings(loadedGlobalSettings);
  }, []);

  return {
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
    setCampuses,
    setHostels,
    loadSimulationState,
  };
}
