import { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Clock, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';
import { toast } from 'sonner';

const STORAGE_KEY = 'school-revenue-simulations';

interface SavedSimulation {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  campuses: CampusData[];
  hostels: HostelData[];
  global_settings: GlobalSettings;
}

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: CampusData[];
  hostels: HostelData[];
  globalSettings: GlobalSettings;
  onLoad: (campuses: CampusData[], hostels: HostelData[], globalSettings: GlobalSettings) => void;
}

// Helper functions for localStorage
const getSimulations = (): SavedSimulation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveSimulations = (simulations: SavedSimulation[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
};

export function SaveLoadModal({
  isOpen,
  onClose,
  campuses,
  hostels,
  globalSettings,
  onLoad,
}: SaveLoadModalProps) {
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSavedSimulations(getSimulations());
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for the simulation');
      return;
    }

    const now = new Date().toISOString();
    const newSimulation: SavedSimulation = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      description: saveDescription.trim() || null,
      created_at: now,
      updated_at: now,
      campuses: JSON.parse(JSON.stringify(campuses)),
      hostels: JSON.parse(JSON.stringify(hostels)),
      global_settings: JSON.parse(JSON.stringify(globalSettings)),
    };

    const simulations = getSimulations();
    simulations.unshift(newSimulation);
    saveSimulations(simulations);

    toast.success('Simulation saved successfully!');
    setSaveName('');
    setSaveDescription('');
    setSavedSimulations(simulations);
  };

  const handleLoad = (id: string) => {
    const simulations = getSimulations();
    const simulation = simulations.find(s => s.id === id);

    if (!simulation) {
      toast.error('Simulation not found');
      return;
    }

    onLoad(simulation.campuses, simulation.hostels, simulation.global_settings);
    toast.success(`Loaded "${simulation.name}" successfully!`);
    onClose();
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    const simulations = getSimulations().filter(s => s.id !== id);
    saveSimulations(simulations);
    setSavedSimulations(simulations);
    toast.success('Simulation deleted successfully!');
  };

  const handleExportBackup = () => {
    const simulations = getSimulations();
    if (simulations.length === 0) {
      toast.error('No simulations to export');
      return;
    }

    const blob = new Blob([JSON.stringify(simulations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `school-simulations-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup exported successfully!');
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
            <Button onClick={handleSave} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Current State
            </Button>
          </TabsContent>

          <TabsContent value="load" className="flex-1 overflow-hidden flex flex-col mt-4">
            {savedSimulations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No saved simulations yet</p>
                <p className="text-sm">Save your current state to get started</p>
              </div>
            ) : (
              <>
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
                <div className="pt-4 border-t border-border mt-4">
                  <Button variant="outline" size="sm" onClick={handleExportBackup} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export All as Backup
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
