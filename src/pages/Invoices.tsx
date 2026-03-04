import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoiceSection } from '@/components/InvoiceSection';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

// Lazy-import the history content from InvoiceHistory internals
import InvoiceHistoryContent from '@/components/InvoiceHistoryContent';

export default function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const tabs = [
    { id: 'new' as const, label: 'New Invoice', icon: Receipt },
    { id: 'history' as const, label: 'History', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: 'linear-gradient(to bottom, hsl(160 35% 18%) 0%, hsl(160 40% 30%) 60%, transparent 100%)' }}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <p className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Management</p>
            <h1 className="font-bold text-white text-2xl">Invoices</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-white/20 text-white backdrop-blur-sm'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pt-2 relative z-10">
        {activeTab === 'new' ? (
          <motion.div
            key="new"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <InvoiceSection userId={user?.id} />
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <InvoiceHistoryContent userId={user?.id} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
