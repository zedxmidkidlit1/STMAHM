/**
 * Monitoring Panel Component
 * 
 * Shows monitoring controls and live event feed
 */

import { useState } from 'react';
import {
  Play,
  Square,
  Activity,
  Clock,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
} from 'lucide-react';
import {
  useMonitoring,
  NetworkEventType,
  getEventStyle,
  formatEventMessage,
} from '../hooks/useMonitoring';
import CustomSelect from './common/CustomSelect';

interface MonitoringPanelProps {
  /** Called when a scan completes - trigger Dashboard refresh */
  onScanComplete?: () => void;
}

export default function MonitoringPanel({ onScanComplete }: MonitoringPanelProps) {
  const {
    status,
    isLoading,
    error,
    events,
    currentPhase,
    currentProgress,
    startMonitoring,
    stopMonitoring,
    clearEvents,
  } = useMonitoring({
    onScanComplete: () => {
      // Trigger Dashboard data refresh when scan completes
      if (onScanComplete) {
        onScanComplete();
      }
    },
  });

  const [interval, setInterval] = useState(60);
  const [showEvents, setShowEvents] = useState(true);

  return (
    <div className="glass-card p-3 noise-texture relative overflow-hidden min-h-[280px]">
      {/* Subtle glow background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, #8B5CF620, transparent 60%)'
        }}
      />
      
      <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-purple" />
          Real-time Monitoring
        </h2>
        <div className="flex items-center gap-2">
          {status.is_running && (
            <span className="flex items-center gap-1 text-xs text-accent-green">
              <span className="w-1.5 h-1.5 bg-accent-green rounded-full animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-3 p-2 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Interval selector */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-text-muted" />
          <CustomSelect
            options={[
              { value: 10, label: '10 seconds' },
              { value: 30, label: '30 seconds' },
              { value: 60, label: '1 minute' },
              { value: 120, label: '2 minutes' },
              { value: 300, label: '5 minutes' },
            ]}
            value={interval}
            onChange={setInterval}
            disabled={status.is_running || isLoading}
          />
        </div>

        {/* Start/Stop button */}
        {status.is_running ? (
          <button
            onClick={() => stopMonitoring()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-red hover:bg-accent-red/80 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Square className="w-3.5 h-3.5" />
            )}
            Stop Monitoring
          </button>
        ) : (
          <button
            onClick={() => startMonitoring(interval)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-green hover:bg-accent-green/80 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
            Start Monitoring
          </button>
        )}
      </div>

      {/* Progress bar */}
      {currentPhase && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-text-muted mb-1">
            <span>{currentPhase}</span>
            <span>{currentProgress}%</span>
          </div>
          <div className="h-1 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-blue transition-all duration-300"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-bg-tertiary/30 backdrop-blur-sm rounded-lg">
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{status.scan_count}</p>
          <p className="text-xs text-text-muted">Scans</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{status.devices_online}</p>
          <p className="text-xs text-text-muted">Online</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{status.devices_total}</p>
          <p className="text-xs text-text-muted">Total</p>
        </div>
      </div>

      {/* Events toggle */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setShowEvents(!showEvents)}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          {showEvents ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          Recent Events ({events.length})
        </button>
        {events.length > 0 && (
          <button
            onClick={clearEvents}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-red transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Events list */}
      {showEvents && (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-center text-text-muted text-xs py-3">
              No events yet. Start monitoring to see live updates.
            </p>
          ) : (
            events.map((event, index) => (
              <EventItem key={index} event={event} />
            ))
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function EventItem({ event }: { event: NetworkEventType }) {
  const { icon, color } = getEventStyle(event.type);
  const message = formatEventMessage(event);

  return (
    <div className="flex items-start gap-1.5 p-1.5 bg-bg-tertiary/20 backdrop-blur-sm rounded text-xs border border-white/5 hover:border-white/10 transition-colors">
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`${color} truncate`}>{message}</p>
        <p className="text-xs text-text-muted opacity-70">
          {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
