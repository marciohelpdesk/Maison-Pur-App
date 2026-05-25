import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { PropertySuppliesPanel } from '@/components/supplies/PropertySuppliesPanel';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'supplies:lastPropertyId';

export const SuppliesView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, isLoading } = useProperties(user?.id);
  const [selectedId, setSelectedId] = useState<string | null>(() =>
    typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Auto-select first property if none picked
  useEffect(() => {
    if (!selectedId && properties.length > 0) {
      setSelectedId(properties[0].id);
    }
  }, [properties, selectedId]);

  useEffect(() => {
    if (selectedId) localStorage.setItem(STORAGE_KEY, selectedId);
  }, [selectedId]);

  const selected = properties.find(p => p.id === selectedId) || null;

  const filtered = useMemo(
    () =>
      properties.filter(
        p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.address.toLowerCase().includes(search.toLowerCase()),
      ),
    [properties, search],
  );

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 lg:px-6 py-4 bg-transparent"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              Management
            </p>
            <h1 className="font-bold text-foreground text-2xl">Supplies & Inventory</h1>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 space-y-3">
        {/* Property selector */}
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full rounded-2xl border border-border bg-card/40 p-3 flex items-center gap-3 hover:bg-card/60 transition-colors text-left"
        >
          {selected?.photo ? (
            <img src={selected.photo} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-muted-foreground" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Property
            </p>
            <p className="text-sm font-semibold text-foreground truncate">
              {selected?.name || (isLoading ? 'Loading…' : 'Select a property')}
            </p>
            {selected && (
              <p className="text-[11px] text-muted-foreground truncate">{selected.address}</p>
            )}
          </div>
          <ChevronDown size={18} className="text-muted-foreground shrink-0" />
        </button>

        {/* Panel */}
        {selected ? (
          <PropertySuppliesPanel property={selected} userId={user?.id} />
        ) : (
          !isLoading && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No properties yet. Add one in Properties to start tracking supplies.
            </div>
          )
        )}
      </div>

      {/* Property picker sheet */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Choose property</SheetTitle>
          </SheetHeader>
          <div className="relative my-3">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search property…"
              className="pl-9 h-10 text-sm"
            />
          </div>
          <div className="space-y-1 pb-4">
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No properties found
              </p>
            )}
            {filtered.map(p => {
              const active = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedId(p.id);
                    setPickerOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-left transition-colors',
                    active ? 'bg-primary/15' : 'hover:bg-muted/60',
                  )}
                >
                  {p.photo ? (
                    <img src={p.photo} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Building2 size={16} className="text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{p.address}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
