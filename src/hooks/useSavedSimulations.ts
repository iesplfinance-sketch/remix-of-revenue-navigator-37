import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export interface SavedSimulation {
  id: string;
  name: string;
  description: string | null;
  campuses: CampusData[];
  hostels: HostelData[];
  global_settings: GlobalSettings;
  created_at: string;
  updated_at: string;
}

export function useSavedSimulations() {
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSimulations = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('simulation_states')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Parse the JSONB fields
      const parsed = (data || []).map(item => ({
        ...item,
        campuses: item.campuses as unknown as CampusData[],
        hostels: item.hostels as unknown as HostelData[],
        global_settings: item.global_settings as unknown as GlobalSettings,
      }));
      
      setSavedSimulations(parsed);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      toast.error('Failed to load saved simulations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSimulation = useCallback(async (
    name: string,
    description: string,
    campuses: CampusData[],
    hostels: HostelData[],
    globalSettings: GlobalSettings
  ) => {
    try {
      const { error } = await supabase
        .from('simulation_states')
        .insert({
          name,
          description: description || null,
          campuses: JSON.parse(JSON.stringify(campuses)) as Json,
          hostels: JSON.parse(JSON.stringify(hostels)) as Json,
          global_settings: JSON.parse(JSON.stringify(globalSettings)) as Json,
        });

      if (error) throw error;
      
      toast.success('Simulation saved successfully!');
      await fetchSimulations();
      return true;
    } catch (error) {
      console.error('Error saving simulation:', error);
      toast.error('Failed to save simulation');
      return false;
    }
  }, [fetchSimulations]);

  const updateSimulation = useCallback(async (
    id: string,
    name: string,
    description: string,
    campuses: CampusData[],
    hostels: HostelData[],
    globalSettings: GlobalSettings
  ) => {
    try {
      const { error } = await supabase
        .from('simulation_states')
        .update({
          name,
          description: description || null,
          campuses: JSON.parse(JSON.stringify(campuses)) as Json,
          hostels: JSON.parse(JSON.stringify(hostels)) as Json,
          global_settings: JSON.parse(JSON.stringify(globalSettings)) as Json,
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Simulation updated successfully!');
      await fetchSimulations();
      return true;
    } catch (error) {
      console.error('Error updating simulation:', error);
      toast.error('Failed to update simulation');
      return false;
    }
  }, [fetchSimulations]);

  const deleteSimulation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('simulation_states')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Simulation deleted');
      await fetchSimulations();
      return true;
    } catch (error) {
      console.error('Error deleting simulation:', error);
      toast.error('Failed to delete simulation');
      return false;
    }
  }, [fetchSimulations]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  return {
    savedSimulations,
    isLoading,
    saveSimulation,
    updateSimulation,
    deleteSimulation,
    refreshSimulations: fetchSimulations,
  };
}
