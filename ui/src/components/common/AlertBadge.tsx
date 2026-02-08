import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { tauriClient } from '../../lib/api/tauri-client';
import type { AlertRecord } from '../../lib/api/types';

export type Alert = AlertRecord;

interface AlertBadgeProps {
  onClick: () => void;
  className?: string;
}

export default function AlertBadge({ onClick, className }: AlertBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const loadAlerts = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const alerts = await tauriClient.getUnreadAlerts();
      setUnreadCount(alerts.length);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadAlerts();

    // Poll every 5 seconds for new alerts
    const interval = setInterval(loadAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative p-2 rounded-lg transition-colors',
        'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary',
        className
      )}
      title="Alerts"
    >
      <Bell className="w-5 h-5" />
      
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
