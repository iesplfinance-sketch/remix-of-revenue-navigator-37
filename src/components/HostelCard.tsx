import { HostelData } from '@/data/schoolData';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Building, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HostelCardProps {
  hostel: HostelData;
  onUpdate: (updates: Partial<HostelData>) => void;
}

export function HostelCard({ hostel, onUpdate }: HostelCardProps) {
  const revenue = hostel.currentOccupancy * hostel.feePerStudent;
  const utilizationPercent = (hostel.currentOccupancy / hostel.maxCapacity) * 100;

  return (
    <div className="campus-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{hostel.name}</h3>
            <Badge variant="secondary" className="font-mono text-xs mt-1">
              <Users className="w-3 h-3 mr-1" />
              {hostel.currentOccupancy} / {hostel.maxCapacity}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-lg text-foreground">{formatCurrency(revenue)}</div>
          <div className="text-xs text-muted-foreground">Annual Revenue</div>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mb-5">
        <div className="flex justify-between mb-1 text-xs">
          <span className="text-muted-foreground">Capacity Utilization</span>
          <span className="font-mono text-primary">{utilizationPercent.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Student Occupancy
            </label>
            <span className="font-mono text-sm text-foreground">
              {hostel.currentOccupancy} students
            </span>
          </div>
          <Slider
            value={[hostel.currentOccupancy]}
            onValueChange={([value]) => onUpdate({ currentOccupancy: value })}
            min={0}
            max={hostel.maxCapacity}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>0</span>
            <span>{hostel.maxCapacity}</span>
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-2">
            Annual Fee per Student
          </label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">₨</span>
            <Input
              type="number"
              value={hostel.feePerStudent}
              onChange={(e) => onUpdate({ feePerStudent: parseInt(e.target.value) || 0 })}
              className="font-mono bg-surface-2 border-border"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
