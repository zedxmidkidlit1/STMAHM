/**
 * React hook for database operations - history, devices, alerts, stats
 */

import { useState, useCallback, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

// Types matching Rust database models
export interface ScanRecord {
  id: number;
  scan_time: string;
  interface_name: string;
  local_ip: string;
  local_mac: string;
  subnet: string;
  scan_method: string;
  arp_discovered: number;
  icmp_discovered: number;
  total_hosts: number;
  duration_ms: number;
}

export interface DeviceRecord {
  id: number;
  mac: string;
  first_seen: string;
  last_seen: string;
  last_ip?: string;
  vendor?: string;
  device_type?: string;
  hostname?: string;
  os_guess?: string;
  custom_name?: string;
  notes?: string;
}

export interface AlertRecord {
  id: number;
  created_at: string;
  alert_type: string;
  device_id?: number;
  device_mac?: string;
  device_ip?: string;
  message: string;
  severity: string;
  is_read: boolean;
}

export interface NetworkStats {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  new_devices_24h: number;
  high_risk_devices: number;
  total_scans: number;
  last_scan_time?: string;
}

/**
 * Hook for fetching network statistics
 */
export function useNetworkStats() {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<NetworkStats>("get_network_stats");
      setStats(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

/**
 * Hook for fetching scan history
 */
export function useScanHistory(limit: number = 20) {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<ScanRecord[]>("get_scan_history", { limit });
      setHistory(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}

/**
 * Hook for fetching all devices
 */
export function useDevices() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<DeviceRecord[]>("get_all_devices");
      setDevices(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDeviceName = useCallback(
    async (mac: string, name: string) => {
      try {
        await invoke("update_device_name", { mac, name });
        await fetchDevices(); // Refresh list
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchDevices],
  );

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return { devices, loading, error, refetch: fetchDevices, updateDeviceName };
}

/**
 * Hook for fetching alerts
 */
export function useAlerts() {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<AlertRecord[]>("get_unread_alerts");
      setAlerts(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (alertId: number) => {
      try {
        await invoke("mark_alert_read", { alertId });
        await fetchAlerts();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchAlerts],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await invoke("mark_all_alerts_read");
      await fetchAlerts();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : String(err));
    }
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    loading,
    error,
    refetch: fetchAlerts,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Hook for getting database path (debug)
 */
export function useDatabasePath() {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    invoke<string>("get_database_path")
      .then(setPath)
      .catch(() => setPath(null));
  }, []);

  return path;
}
