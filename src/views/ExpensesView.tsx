import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, DollarSign, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Expense, EXPENSE_CATEGORIES } from '@/hooks/useExpenses';
import { Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ExpensesViewProps {
  expenses: Expense[];
  properties: Property[];
  onAddExpense: (data: { category: string; description: string; amount: number; expense_date: string; property_id?: string | null }) => void;
  onDeleteExpense: (id: string) => void;
  onBack: () => void;
  isAdding: boolean;
}

export const ExpensesView = ({ expenses, properties, onAddExpense, onDeleteExpense, onBack, isAdding }: ExpensesViewProps) => {
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('supplies');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [propertyId, setPropertyId] = useState<string>('');

  const handleSubmit = () => {
    if (!description || !amount) return;
    onAddExpense({
      category,
      description,
      amount: parseFloat(amount),
      expense_date: expenseDate,
      property_id: propertyId || null,
    });
    setDescription('');
    setAmount('');
    setShowForm(false);
  };

  const monthlyTotal = expenses
    .filter(e => e.expense_date.startsWith(format(new Date(), 'yyyy-MM')))
    .reduce((sum, e) => sum + e.amount, 0);

  const grouped = expenses.reduce<Record<string, Expense[]>>((acc, e) => {
    const month = e.expense_date.slice(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(e);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <PageHeader
        title="Expenses"
        subtitle="Cost Tracking"
        leftElement={
          <button onClick={onBack} className="liquid-btn p-2">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
        }
        rightElement={
          <Button size="sm" onClick={() => setShowForm(true)} className="rounded-xl">
            <Plus size={16} className="mr-1" /> Add
          </Button>
        }
      />

      <div className="px-6 pt-2 space-y-6">
        {/* Monthly Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <DollarSign size={20} className="text-destructive" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">This Month</p>
              <p className="text-3xl font-light text-destructive">${monthlyTotal.toFixed(2)}</p>
            </div>
          </div>
        </motion.div>

        {/* Expense List */}
        {Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a)).map(([month, items]) => (
          <div key={month}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {format(parseISO(month + '-01'), 'MMMM yyyy')}
            </h3>
            <div className="space-y-2">
              {items.map((expense, i) => {
                const cat = EXPENSE_CATEGORIES.find(c => c.value === expense.category);
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass-panel p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat?.icon || '📦'}</span>
                      <div>
                        <p className="font-medium text-foreground text-sm">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(expense.expense_date), 'MMM d')} • {cat?.label || expense.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-destructive">${expense.amount.toFixed(2)}</span>
                      <button onClick={() => onDeleteExpense(expense.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {expenses.length === 0 && (
          <div className="glass-panel p-8 text-center">
            <p className="text-muted-foreground">No expenses recorded yet</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-panel border-0 max-w-[95%] sm:max-w-[380px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-destructive/70 flex items-center justify-center">
                <DollarSign size={20} className="text-white" />
              </div>
              New Expense
            </DialogTitle>
            <DialogDescription>Track a business expense</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="rounded-xl"
            />

            <Input
              type="number"
              placeholder="Amount ($)"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="rounded-xl"
              step="0.01"
              min="0"
            />

            <Input
              type="date"
              value={expenseDate}
              onChange={e => setExpenseDate(e.target.value)}
              className="rounded-xl"
            />

            <Select value={propertyId} onValueChange={setPropertyId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Property (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No property</SelectItem>
                {properties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowForm(false)}>
                <X size={16} className="mr-1" /> Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={handleSubmit}
                disabled={!description || !amount || isAdding}
              >
                <Plus size={16} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
