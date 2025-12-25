import { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Clock, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';
import { toast } from 'sonner';

interface SavedSimulation {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: CampusData[];
  hostels: HostelData[];
  globalSettings: GlobalSettings;
  onLoad: (campuses: CampusData[], hostels: HostelData[], globalSettings: GlobalSettings) => void;
}

export function SaveLoadModal({
  isOpen,
  onClose,
  campuses,
  hostels,
  globalSettings,
  onLoad,
}: SaveLoadModalProps) {
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSavedSimulations();
    }
  }, [isOpen]);

  const fetchSavedSimulations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('simulation_states')
        .select('id, name, description, created_at, updated_at')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedSimulations(data || []);
    } catch (error) {
      console.error('Error fetching simulations:', error);
      toast.error('Failed to fetch saved simulations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for the simulation');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('simulation_states').insert([{
        name: saveName.trim(),
        description: saveDescription.trim() || null,
        campuses: JSON.parse(JSON.stringify(campuses)),
        hostels: JSON.parse(JSON.stringify(hostels)),
        global_settings: JSON.parse(JSON.stringify(globalSettings)),
      }]);

      if (error) throw error;

      toast.success('Simulation saved successfully!');
      setSaveName('');
      setSaveDescription('');
      fetchSavedSimulations();
    } catch (error) {
      console.error('Error saving simulation:', error);
      toast.error('Failed to save simulation');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('simulation_states')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const loadedCampuses = data.campuses as unknown as CampusData[];
      const loadedHostels = data.hostels as unknown as HostelData[];
      const loadedSettings = data.global_settings as unknown as GlobalSettings;

      onLoad(loadedCampuses, loadedHostels, loadedSettings);
      toast.success(`Loaded "${data.name}" successfully!`);
      onClose();
    } catch (error) {
      console.error('Error loading simulation:', error);
      toast.error('Failed to load simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('simulation_states')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Simulation deleted successfully!');
      fetchSavedSimulations();
    } catch (error) {
      console.error('Error deleting simulation:', error);
      toast.error('Failed to delete simulation');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Save / Load Simulation</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="save" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save">
              <Save className="w-4 h-4 mr-2" />
              Save New
            </TabsTrigger>
            <TabsTrigger value="load">
              <FolderOpen className="w-4 h-4 mr-2" />
              Load Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="save" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Simulation Name *</label>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Q4 2024 Forecast"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder="Add notes about this simulation..."
                rows={3}
              />
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Current State
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="load" className="flex-1 overflow-hidden flex flex-col mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : savedSimulations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No saved simulations yet</p>
                <p className="text-sm">Save your current state to get started</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {savedSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="p-4 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{sim.name}</h4>
                        {sim.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {sim.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(sim.updated_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleLoad(sim.id)}
                        >
                          Load
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(sim.id, sim.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
