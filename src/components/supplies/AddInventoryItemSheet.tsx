import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InventoryItem } from '@/types';

interface Values {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSubmit: (v: Values) => void;
  initial?: InventoryItem;
}

const CATEGORIES = ['Bathroom', 'Kitchen', 'Bedroom', 'Cleaning', 'Laundry', 'General'];
const UNITS = ['units', 'rolls', 'bottles', 'packs', 'pieces'];

export const AddInventoryItemSheet = ({ open, onOpenChange, onSubmit, initial }: Props) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState('units');
  const [threshold, setThreshold] = useState(2);

  useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setCategory(initial?.category || 'General');
      setQuantity(initial?.quantity ?? 0);
      setUnit(initial?.unit || 'units');
      setThreshold(initial?.threshold ?? 2);
    }
  }, [open, initial]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), category, quantity, unit, threshold });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{initial ? 'Edit item' : 'Add inventory item'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-4 pb-6">
          <div>
            <Label className="text-xs">Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Toilet paper" required className="h-10" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Unit</Label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Current qty</Label>
              <Input type="number" min={0} value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 0)} className="h-10" />
            </div>
            <div>
              <Label className="text-xs">Low-stock threshold</Label>
              <Input type="number" min={0} value={threshold} onChange={e => setThreshold(parseInt(e.target.value) || 0)} className="h-10" />
            </div>
          </div>

          <Button type="submit" className="w-full h-10 rounded-lg">{initial ? 'Save changes' : 'Add item'}</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};
