import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';

export interface Alert {
  id: number;
  created_at: string;
  alert_type: string;
  device_mac: string | null;
  device_ip: string | null;
  message: string;
  severity: string;
  is_read: boolean;
}

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
      const alerts = await invoke<Alert[]>('get_unread_alerts');
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
