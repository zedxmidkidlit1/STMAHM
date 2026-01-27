import { X, AlertTriangle, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import clsx from 'clsx';
import type { Alert } from './AlertBadge';

interface AlertPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertPanel({ isOpen, onClose }: AlertPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const data = await invoke<Alert[]>('get_unread_alerts');
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
    }
  }, [isOpen]);

  const markAsRead = async (alertId: number) => {
    try {
      await invoke('mark_alert_read', { alertId });
      setAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await invoke('mark_all_alerts_read');
      setAlerts([]);
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'border-l-status-error bg-status-error/5 text-status-error';
      case 'HIGH':
        return 'border-l-accent-amber bg-accent-amber/5 text-accent-amber';
      case 'MEDIUM':
        return 'border-l-accent-blue bg-accent-blue/5 text-accent-blue';
      case 'LOW':
      default:
        return 'border-l-status-online bg-status-online/5 text-status-online';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'NEW_DEVICE':
        return <CheckCircle className="w-5 h-5" />;
      case 'HIGH_RISK':
        return <AlertTriangle className="w-5 h-5" />;
      case 'DEVICE_OFFLINE':
        return <AlertCircle className="w-5 h-5" />;
      case 'UNUSUAL_PORT':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />

      {/* Panel - positioned relative to sidebar */}
      <div className="absolute left-0 right-0 top-20 bottom-0 bg-bg-primary border-t border-theme z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-theme bg-bg-secondary">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-text-primary" />
            <h3 className="font-semibold text-text-primary">Alerts</h3>
            {alerts.length > 0 && (
              <span className="px-2 py-0.5 bg-status-error text-white text-xs font-bold rounded-full">
                {alerts.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {alerts.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-accent-blue hover:underline"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-bg-tertiary rounded transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-text-muted">
              Loading alerts...
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
              <p className="text-text-primary font-medium">No new alerts</p>
              <p className="text-xs text-text-muted mt-1">You're all caught up! 👍</p>
            </div>
          ) : (
            <div className="divide-y divide-theme">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={clsx(
                    'p-4 border-l-4 transition-colors hover:bg-bg-tertiary cursor-pointer',
                    getSeverityColor(alert.severity)
                  )}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary mb-1">
                        {alert.message}
                      </p>
                      {alert.device_ip && (
                        <p className="text-xs text-text-muted">
                          Device: {alert.device_ip}
                        </p>
                      )}
                      <p className="text-xs text-text-muted mt-1">
                        {formatTime(alert.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
