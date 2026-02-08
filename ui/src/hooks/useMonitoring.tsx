/**
 * React hook for real-time network monitoring
 *
 * Handles start/stop monitoring and listens for network events
 */

import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { isTauri } from "../lib/runtime/is-tauri";
import type { MonitoringStatus, NetworkEventType } from "../lib/api/types";

export type { MonitoringStatus, NetworkEventType };

async function safeInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T | null> {
  if (!isTauri()) {
    return null;
  }
  return invoke<T>(command, args);
}

async function safeListen<T>(
  event: string,
  handler: (event: { payload: T }) => void,
): Promise<UnlistenFn> {
  if (!isTauri()) {
    return () => {};
  }
  return listen<T>(event, handler);
}

export interface MonitoringState {
  status: MonitoringStatus;
  isLoading: boolean;
  error: string | null;
  events: NetworkEventType[];
  currentPhase: string | null;
  currentProgress: number;
}

const initialStatus: MonitoringStatus = {
  is_running: false,
  interval_seconds: 60,
  scan_count: 0,
  devices_online: 0,
  devices_total: 0,
};

/**
 * Options for useMonitoring hook
 */
export interface UseMonitoringOptions {
  maxEvents?: number;
  /** Callback fired when a scan completes - use for Dashboard refresh */
  onScanComplete?: (hostsFound: number, durationMs: number) => void;
  /** Callback fired when a new device is discovered */
  onNewDevice?: (device: {
    ip: string;
    mac: string;
    hostname?: string;
    device_type: string;
  }) => void;
}

/**
 * Hook for controlling and monitoring network scanning
 */
export function useMonitoring(options: UseMonitoringOptions = {}) {
  const { maxEvents = 50, onScanComplete, onNewDevice } = options;

  const [state, setState] = useState<MonitoringState>({
    status: initialStatus,
    isLoading: false,
    error: null,
    events: [],
    currentPhase: null,
    currentProgress: 0,
  });

  // Fetch current monitoring status
  const fetchStatus = useCallback(async () => {
    try {
      const status = await safeInvoke<MonitoringStatus>(
        "get_monitoring_status",
      );
      if (status) {
        setState((prev) => ({ ...prev, status, error: null }));
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(
    async (intervalSeconds?: number) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await safeInvoke("start_monitoring", { intervalSeconds });
        await fetchStatus();
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    },
    [fetchStatus],
  );

  // Stop monitoring
  const stopMonitoring = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await safeInvoke("stop_monitoring");
      await fetchStatus();
      setState((prev) => ({
        ...prev,
        isLoading: false,
        currentPhase: null,
        currentProgress: 0,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, [fetchStatus]);

  // Clear events
  const clearEvents = useCallback(() => {
    setState((prev) => ({ ...prev, events: [] }));
  }, []);

  // Listen for network events
  useEffect(() => {
    let unlisten: UnlistenFn | null = null;

    const setupListener = async () => {
      unlisten = await safeListen<NetworkEventType>(
        "network-event",
        (event) => {
          const networkEvent = event.payload;

          setState((prev) => {
            // Update events list (keep last maxEvents)
            const newEvents = [networkEvent, ...prev.events].slice(
              0,
              maxEvents,
            );

            // Update progress if it's a progress event
            let currentPhase = prev.currentPhase;
            let currentProgress = prev.currentProgress;

            if (networkEvent.type === "ScanProgress") {
              currentPhase = networkEvent.data.phase;
              currentProgress = networkEvent.data.percent;
            } else if (networkEvent.type === "ScanCompleted") {
              currentPhase = null;
              currentProgress = 0;
            } else if (networkEvent.type === "ScanStarted") {
              currentPhase = "Starting...";
              currentProgress = 0;
            }

            // Update status for certain events
            let status = prev.status;
            if (networkEvent.type === "MonitoringStarted") {
              status = {
                ...status,
                is_running: true,
                interval_seconds: networkEvent.data.interval_seconds,
              };
            } else if (networkEvent.type === "MonitoringStopped") {
              status = { ...status, is_running: false };
            } else if (networkEvent.type === "ScanCompleted") {
              status = {
                ...status,
                scan_count: status.scan_count + 1,
                devices_total: networkEvent.data.hosts_found,
              };
              // Call onScanComplete callback for Dashboard refresh
              if (onScanComplete) {
                onScanComplete(
                  networkEvent.data.hosts_found,
                  networkEvent.data.duration_ms,
                );
              }
            } else if (networkEvent.type === "NewDeviceDiscovered") {
              // Call onNewDevice callback
              if (onNewDevice) {
                onNewDevice(networkEvent.data);
              }
            }

            return {
              ...prev,
              events: newEvents,
              currentPhase,
              currentProgress,
              status,
            };
          });
        },
      );
    };

    setupListener();

    // Fetch initial status
    fetchStatus();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [fetchStatus, maxEvents, onNewDevice, onScanComplete]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    fetchStatus,
    clearEvents,
  };
}

/**
 * Helper to get event icon and color
 */
export function getEventStyle(eventType: string): {
  icon: string;
  color: string;
} {
  switch (eventType) {
    case "MonitoringStarted":
      return { icon: "▶️", color: "text-green-500" };
    case "MonitoringStopped":
      return { icon: "⏹️", color: "text-red-500" };
    case "ScanStarted":
      return { icon: "🔍", color: "text-blue-500" };
    case "ScanProgress":
      return { icon: "⏳", color: "text-yellow-500" };
    case "ScanCompleted":
      return { icon: "✅", color: "text-green-500" };
    case "NewDeviceDiscovered":
      return { icon: "🆕", color: "text-cyan-500" };
    case "DeviceWentOffline":
      return { icon: "📴", color: "text-red-500" };
    case "DeviceCameOnline":
      return { icon: "📶", color: "text-green-500" };
    case "DeviceIpChanged":
      return { icon: "🔄", color: "text-orange-500" };
    case "MonitoringError":
      return { icon: "❌", color: "text-red-500" };
    default:
      return { icon: "📌", color: "text-gray-500" };
  }
}

/**
 * Helper to format event message
 */
export function formatEventMessage(event: NetworkEventType): string {
  switch (event.type) {
    case "MonitoringStarted":
      return `Monitoring started (interval: ${event.data.interval_seconds}s)`;
    case "MonitoringStopped":
      return "Monitoring stopped";
    case "ScanStarted":
      return `Scan #${event.data.scan_number} started`;
    case "ScanProgress":
      return `${event.data.phase}: ${event.data.message}`;
    case "ScanCompleted":
      return `Scan #${event.data.scan_number} complete: ${event.data.hosts_found} hosts (${(event.data.duration_ms / 1000).toFixed(1)}s)`;
    case "NewDeviceDiscovered":
      return `New device: ${event.data.hostname || event.data.ip} (${event.data.device_type})`;
    case "DeviceWentOffline":
      return `Offline: ${event.data.hostname || event.data.last_ip}`;
    case "DeviceCameOnline":
      return `Online: ${event.data.hostname || event.data.ip}`;
    case "DeviceIpChanged":
      return `IP changed: ${event.data.old_ip} → ${event.data.new_ip}`;
    case "MonitoringError":
      return `Error: ${event.data.message}`;
    default:
      return "Unknown event";
  }
}
