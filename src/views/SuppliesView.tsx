import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { PropertySuppliesPanel } from '@/components/supplies/PropertySuppliesPanel';
import { cn } from '@/lib/utils';

export const SuppliesView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, isLoading } = useProperties(user?.id);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      properties.filter(
        p =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.address.toLowerCase().includes(search.toLowerCase()),
      ),
    [properties, search],
  );

  const selected = properties.find(p => p.id === selectedId) || filtered[0] || null;

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4 bg-transparent">
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

      <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        {/* Property list */}
        <aside className="rounded-2xl border border-border bg-card/40 p-3 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
          <div className="relative mb-2">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search property…"
              className="pl-9 h-9 text-sm"
            />
          </div>

          {isLoading && (
            <p className="text-xs text-muted-foreground py-4 text-center">Loading…</p>
          )}

          {!isLoading && filtered.length === 0 && (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No properties found
            </p>
          )}

          <div className="space-y-1">
            {filtered.map(p => {
              const active = selected?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors',
                    active
                      ? 'bg-primary/15 text-foreground'
                      : 'hover:bg-muted/60 text-muted-foreground',
                  )}
                >
                  {p.photo ? (
                    <img
                      src={p.photo}
                      alt=""
                      className="w-9 h-9 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-muted-foreground" />
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
        </aside>

        {/* Selected property panel */}
        <main className="min-w-0">
          {selected ? (
            <PropertySuppliesPanel property={selected} userId={user?.id} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Select a property to manage its supplies.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
