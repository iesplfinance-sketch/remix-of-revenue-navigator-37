import { useState } from 'react';
import { Save, FolderOpen, Trash2, Clock, FileText, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CampusData, HostelData, GlobalSettings } from '@/data/schoolData';
import { SavedSimulation, useSavedSimulations } from '@/hooks/useSavedSimulations';
import { formatDistanceToNow } from 'date-fns';

interface SaveLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
  campuses: CampusData[];
  hostels: HostelData[];
  globalSettings: GlobalSettings;
  onLoadSimulation: (campuses: CampusData[], hostels: HostelData[], globalSettings: GlobalSettings) => void;
}

export function SaveLoadModal({
  isOpen,
  onClose,
  campuses,
  hostels,
  globalSettings,
  onLoadSimulation,
}: SaveLoadModalProps) {
  const { savedSimulations, isLoading, saveSimulation, deleteSimulation } = useSavedSimulations();
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    
    setIsSaving(true);
    const success = await saveSimulation(saveName, saveDescription, campuses, hostels, globalSettings);
    if (success) {
      setSaveName('');
      setSaveDescription('');
    }
    setIsSaving(false);
  };

  const handleLoad = (simulation: SavedSimulation) => {
    onLoadSimulation(simulation.campuses, simulation.hostels, simulation.global_settings);
    onClose();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved simulation?')) {
      await deleteSimulation(id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            Save / Load Simulation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="save" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="save" className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Save Current
            </TabsTrigger>
            <TabsTrigger value="load" className="flex-1 gap-2">
              <FolderOpen className="w-4 h-4" />
              Load Saved ({savedSimulations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="save" className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Simulation Name *
              </label>
              <Input
                placeholder="e.g., Q1 2025 Forecast, 10% Growth Scenario..."
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description (Optional)
              </label>
              <Textarea
                placeholder="Add notes about this simulation..."
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                rows={3}
              />
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!saveName.trim() || isSaving}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Simulation'}
            </Button>
          </TabsContent>

          <TabsContent value="load" className="mt-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading saved simulations...
              </div>
            ) : savedSimulations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No saved simulations yet</p>
                <p className="text-sm mt-1">Save your current simulation to get started</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {savedSimulations.map((sim) => (
                    <div
                      key={sim.id}
                      className="p-4 rounded-lg border border-border bg-surface-1 hover:bg-surface-2 cursor-pointer transition-colors group"
                      onClick={() => handleLoad(sim)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{sim.name}</h4>
                          {sim.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {sim.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>
                              Saved {formatDistanceToNow(new Date(sim.updated_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDelete(sim.id, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
