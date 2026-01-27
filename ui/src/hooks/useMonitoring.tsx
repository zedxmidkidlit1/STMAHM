/**
 * React hook for real-time network monitoring
 *
 * Handles start/stop monitoring and listens for network events
 */

import { useState, useEffect, useCallback } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";

// Check if running in Tauri environment (supports v1 and v2)
const isTauriAvailable = () => {
  if (typeof window === "undefined") return false;
  // Tauri v2 uses __TAURI_INTERNALS__, v1 uses __TAURI__
  return "__TAURI_INTERNALS__" in window || "__TAURI__" in window;
};

// Safe invoke that returns null if Tauri is not available
async function safeInvoke<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T | null> {
  if (!isTauriAvailable()) {
    console.warn(`Tauri not available, skipping invoke: ${command}`);
    return null;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<T>(command, args);
}

// Safe listen that returns noop if Tauri is not available
async function safeListen<T>(
  event: string,
  handler: (event: { payload: T }) => void,
): Promise<UnlistenFn> {
  if (!isTauriAvailable()) {
    console.warn(`Tauri not available, skipping listen: ${event}`);
    return () => {}; // Return noop unlisten function
  }
  const { listen } = await import("@tauri-apps/api/event");
  return listen<T>(event, handler);
}

// Event types matching Rust NetworkEvent
export interface MonitoringStatus {
  is_running: boolean;
  interval_seconds: number;
  scan_count: number;
  last_scan_time?: string;
  devices_online: number;
  devices_total: number;
}

export type NetworkEventType =
  | { type: "MonitoringStarted"; data: { interval_seconds: number } }
  | { type: "MonitoringStopped" }
  | { type: "ScanStarted"; data: { scan_number: number } }
  | {
      type: "ScanProgress";
      data: { phase: string; percent: number; message: string };
    }
  | {
      type: "ScanCompleted";
      data: { scan_number: number; hosts_found: number; duration_ms: number };
    }
  | {
      type: "NewDeviceDiscovered";
      data: { ip: string; mac: string; hostname?: string; device_type: string };
    }
  | {
      type: "DeviceWentOffline";
      data: { mac: string; last_ip: string; hostname?: string };
    }
  | {
      type: "DeviceCameOnline";
      data: { mac: string; ip: string; hostname?: string };
    }
  | {
      type: "DeviceIpChanged";
      data: { mac: string; old_ip: string; new_ip: string };
    }
  | { type: "MonitoringError"; data: { message: string } };

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
  }, [fetchStatus, maxEvents]);

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
      return { icon: "🆕", color: "text-purple-500" };
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
