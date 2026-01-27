import {
  LayoutDashboard,
  Network,
  Smartphone,
  Shield,
  Bell,
  Wrench,
  ChartBar,
  Settings,
  Scan,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type Page = 'dashboard' | 'topology' | 'devices' | 'vulnerabilities' | 'alerts' | 'tools' | 'reports' | 'settings' | 'profile' | 'demo';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onScan?: () => void;
  isScanning?: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface NavItem {
  id: Page;
  label: string;
  icon: any;
}

const navGroups: NavGroup[] = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'topology', label: 'Topology', icon: Network },
      { id: 'devices', label: 'Devices', icon: Smartphone },
    ],
  },
  {
    title: 'SECURITY',
    items: [
      { id: 'vulnerabilities', label: 'Vulnerabilities', icon: Shield },
      { id: 'alerts', label: 'Alerts', icon: Bell },
    ],
  },
  {
    title: 'UTILITIES',
    items: [
      { id: 'tools', label: 'Tools', icon: Wrench },
      { id: 'reports', label: 'Reports', icon: ChartBar },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ 
  currentPage, 
  onNavigate, 
  onScan, 
  isScanning = false,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? 72 : 260 
      }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }}
      className="relative glass border-r border-theme flex flex-col noise-texture"
    >
      {/* Logo */}
      <div className="p-4 border-b border-theme flex items-center justify-between">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 flex-1"
            >
              <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center shrink-0">
                <Network className="w-6 h-6 text-accent-blue" />
              </div>
              <div className="overflow-hidden">
                <h1 className="font-semibold text-text-primary whitespace-nowrap">NetMapper</h1>
                <p className="text-xs text-text-muted whitespace-nowrap">Topology Monitor</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {isCollapsed && (
          <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center mx-auto">
            <Network className="w-6 h-6 text-accent-blue" />
          </div>
        )}
      </div>

      {/* Scan Button - Unique Square/Rectangular Design */}
      {onScan && (
        <div className="px-3 pt-4 pb-3">
          <motion.button
            onClick={onScan}
            disabled={isScanning}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={clsx(
              'w-full flex items-center justify-center gap-3 px-4 py-4 rounded-lg transition-all duration-300 relative overflow-hidden group',
              'bg-gradient-to-br from-accent-purple via-accent-blue to-accent-purple text-white font-bold shadow-2xl',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
              !isScanning && 'hover:shadow-accent-purple/60'
            )}
            style={{
              boxShadow: isScanning 
                ? '0 8px 32px rgba(139, 92, 246, 0.4)' 
                : '0 8px 32px rgba(139, 92, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)',
            }}
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: isScanning ? ['-100%', '200%'] : ['0%', '0%'],
              }}
              transition={{
                duration: 1.5,
                repeat: isScanning ? Infinity : 0,
                ease: 'linear',
              }}
            />

            {/* Pulse ring animation when not scanning */}
            {!isScanning && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-white/50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center gap-3">
              {isScanning ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Scan className="w-5 h-5" />
              )}
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="font-bold text-base tracking-wide"
                  >
                    {isScanning ? 'Scanning...' : 'START SCAN'}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        </div>
      )}

      {/* Navigation - Grouped */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {navGroups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? 'mt-6' : ''}>
            {/* Group Title */}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="px-3 py-2 mb-1"
                >
                  <p className="text-xs font-semibold text-text-muted tracking-wider">
                    {group.title}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                      'group relative',
                      isActive
                        ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/25'
                        : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                    )}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-accent-blue rounded-lg"
                        initial={false}
                        transition={{
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <Icon className={clsx('w-5 h-5 shrink-0 relative z-10')} />

                    {/* Label */}
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -5 }}
                          transition={{ duration: 0.15 }}
                          className="font-medium whitespace-nowrap overflow-hidden text-ellipsis relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-2 bg-bg-tertiary border border-theme rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        <span className="text-sm text-text-primary">{item.label}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions - Only collapse toggle */}
      <div className="p-3 border-t border-theme">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center px-3 py-2.5 rounded-lg text-text-muted hover:bg-bg-hover hover:text-text-primary transition-all duration-200"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Collapse</span>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
