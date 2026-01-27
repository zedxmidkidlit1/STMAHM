import { motion } from 'framer-motion';

interface TabFilterProps {
  tabs: {
    id: string;
    label: string;
    count?: number;
  }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function TabFilter({ tabs, activeTab, onTabChange }: TabFilterProps) {
  return (
    <div className="flex items-center gap-2 border-b border-theme pb-0 mb-6">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'text-accent-blue'
                : 'text-text-muted hover:text-text-primary'
            }`}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-md ${
                isActive 
                  ? 'bg-accent-blue/20 text-accent-blue' 
                  : 'bg-bg-tertiary text-text-muted'
              }`}>
                {tab.count}
              </span>
            )}
            
            {/* Active indicator */}
            {isActive && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-blue"
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
