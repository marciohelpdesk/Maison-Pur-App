import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EstimateSection } from '@/components/EstimateSection';
import { useAuth } from '@/hooks/useAuth';
import EstimateHistoryContent from '@/components/EstimateHistoryContent';

export default function Estimates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  const tabs = [
    { id: 'new' as const, label: 'New Estimate', icon: ClipboardList },
    { id: 'history' as const, label: 'History', icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full relative z-10 pb-8">
      <div className="sticky top-0 z-20 px-6 py-4" style={{ background: 'transparent' }}>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Management</p>
            <h1 className="font-bold text-foreground text-2xl">Estimates</h1>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
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
          <motion.div key="new" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <EstimateSection userId={user?.id} />
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <EstimateHistoryContent userId={user?.id} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
