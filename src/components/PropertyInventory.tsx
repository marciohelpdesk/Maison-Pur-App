import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Minus, Trash2, AlertTriangle, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '@/hooks/useInventory';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/types';
import { toast } from 'sonner';

interface PropertyInventoryProps {
  propertyId: string;
  userId: string;
  isEditing: boolean;
}

const CATEGORIES = ['Cleaning', 'Bathroom', 'Kitchen', 'Laundry', 'General'];

export const PropertyInventory = ({ propertyId, userId, isEditing }: PropertyInventoryProps) => {
  const { t } = useLanguage();
  const { inventory, addItem, updateItem, deleteItem, copyFromProperty, isAdding, isCopying } = useInventory(userId, propertyId);
  const { properties } = useProperties(userId);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 10, unit: 'units', threshold: 3, category: 'General' });

  const otherProperties = properties.filter(p => p.id !== propertyId);

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;
    addItem(newItem);
    setNewItem({ name: '', quantity: 10, unit: 'units', threshold: 3, category: 'General' });
    setShowAddForm(false);
    toast.success(t('inventory.itemAdded'));
  };

  const handleCopyFrom = (sourceId: string) => {
    copyFromProperty(sourceId);
    setShowCopyMenu(false);
    toast.success(t('inventory.copied'));
  };

  const handleQuantityChange = (item: typeof inventory[0], delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    updateItem({ ...item, quantity: newQty });
  };

  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof inventory>);

  const lowStockItems = inventory.filter(i => i.quantity <= i.threshold);

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Package size={20} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t('inventory.title')}</h3>
            <p className="text-xs text-muted-foreground">{t('inventory.subtitle')}</p>
          </div>
        </div>
        {isEditing && (
          <div className="flex gap-2">
            {otherProperties.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCopyMenu(!showCopyMenu)}
                className="gap-1 text-xs"
              >
                <Copy size={14} />
                {t('inventory.copyFrom')}
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
              className="gap-1 text-xs"
            >
              <Plus size={14} />
              {t('common.add')}
            </Button>
          </div>
        )}
      </div>

      {/* Copy from property menu */}
      <AnimatePresence>
        {showCopyMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 glass-panel p-3 border border-border rounded-xl"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-foreground">{t('inventory.selectProperty')}</p>
              <button onClick={() => setShowCopyMenu(false)}>
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-1">
              {otherProperties.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleCopyFrom(p.id)}
                  disabled={isCopying}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm text-foreground"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add item form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 glass-panel p-3 border border-border rounded-xl space-y-3"
          >
            <Input
              placeholder={t('inventory.itemName')}
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">{t('inventory.qty')}</label>
                <Input
                  type="number"
                  min="0"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('inventory.unit')}</label>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t('inventory.threshold')}</label>
                <Input
                  type="number"
                  min="0"
                  value={newItem.threshold}
                  onChange={(e) => setNewItem({ ...newItem, threshold: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t('inventory.category')}</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full bg-background rounded-md border border-input px-3 py-2 text-sm"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)} className="flex-1">
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleAddItem} disabled={!newItem.name.trim() || isAdding} className="flex-1">
                {t('common.add')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low stock warning */}
      {lowStockItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{t('inventory.lowStock')}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {lowStockItems.map(item => (
              <span key={item.id} className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                {item.name}: {item.quantity} {item.unit}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Inventory list */}
      {Object.entries(groupedInventory).map(([category, items]) => (
        <div key={category} className="mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">{category}</h4>
          <div className="divide-y divide-border">
            {items.map(item => {
              const isLow = item.quantity <= item.threshold;
              return (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className={`text-xs ${isLow ? 'text-amber-400' : 'text-muted-foreground'}`}>
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                  {isEditing && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity === 0}
                        className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center disabled:opacity-30"
                      >
                        <Minus size={14} className="text-foreground" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item, 1)}
                        className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center"
                      >
                        <Plus size={14} className="text-foreground" />
                      </button>
                      <button
                        onClick={() => { deleteItem(item.id); toast.success(t('inventory.itemDeleted')); }}
                        className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center ml-1"
                      >
                        <Trash2 size={14} className="text-destructive" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {inventory.length === 0 && (
        <div className="text-center py-6">
          <Package size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t('inventory.empty')}</p>
        </div>
      )}
    </div>
  );
};
