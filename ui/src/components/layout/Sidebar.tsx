import {
  LayoutDashboard,
  Network,
  List,
  Settings,
  Scan,
  Activity,
  Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import ThemeToggle from '../common/ThemeToggle';

type Page = 'dashboard' | 'topology' | 'devices' | 'settings';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onScan?: () => void;
  isScanning?: boolean;
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'topology' as Page, label: 'Topology', icon: Network },
  { id: 'devices' as Page, label: 'Devices', icon: List },
  { id: 'settings' as Page, label: 'Settings', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate, onScan, isScanning = false }: SidebarProps) {
  return (
    <aside className="w-64 bg-bg-secondary border-r border-theme flex flex-col transition-colors duration-300">
      {/* Logo */}
      <div className="p-6 border-b border-theme">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-blue/20 flex items-center justify-center">
            <Network className="w-6 h-6 text-accent-blue" />
          </div>
          <div>
            <h1 className="font-semibold text-text-primary">NetMapper</h1>
            <p className="text-xs text-text-muted">Topology Monitor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-accent-blue/20 text-accent-blue'
                  : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="px-4 py-3 border-t border-theme">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Theme</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Scan Button */}
      <div className="p-4 border-t border-theme">
        <button 
          onClick={onScan}
          disabled={isScanning}
          className={clsx(
            'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all',
            isScanning
              ? 'bg-accent-blue/50 cursor-not-allowed text-white/70'
              : 'bg-accent-blue hover:bg-accent-blue/80 text-white'
          )}
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Scan className="w-5 h-5" />
              <span>Start Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Status */}
      <div className="p-4 border-t border-theme">
        <div className="flex items-center gap-2 text-sm">
          <Activity className={clsx(
            'w-4 h-4',
            isScanning ? 'text-accent-amber animate-pulse' : 'text-status-online'
          )} />
          <span className="text-text-muted">
            {isScanning ? 'Scanning network...' : 'Scanner Ready'}
          </span>
        </div>
      </div>
    </aside>
  );
}
