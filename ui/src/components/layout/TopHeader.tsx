import { Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ThemeToggle from '../common/ThemeToggle';

interface TopHeaderProps {
  onSearch?: (query: string) => void;
}

export default function TopHeader({ onSearch }: TopHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3); // Static for now

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <motion.header 
      className="h-16 bg-bg-secondary border-b border-theme flex items-center justify-between px-6 gap-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search devices..."
            className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-theme rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notification Bell */}
        <motion.button
          className="relative p-2 rounded-lg hover:bg-bg-hover transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-text-secondary" />
          {notificationCount > 0 && (
            <motion.span 
              className="absolute -top-1 -right-1 w-5 h-5 bg-accent-blue text-white text-xs font-semibold rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            >
              {notificationCount}
            </motion.span>
          )}
        </motion.button>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
