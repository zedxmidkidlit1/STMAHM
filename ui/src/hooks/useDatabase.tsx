/**
 * React hook for database operations - history, devices, alerts, stats
 */

import { useState, useCallback, useEffect } from "react";
import { tauriClient } from "../lib/api/tauri-client";
import type {
  AlertRecord,
  DeviceRecord,
  NetworkStats,
  ScanRecord,
} from "../lib/api/types";

export type { AlertRecord, DeviceRecord, NetworkStats, ScanRecord };

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
      const result = await tauriClient.getNetworkStats();
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
      const result = await tauriClient.getScanHistory(limit);
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
      const result = await tauriClient.getAllDevices();
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
        await tauriClient.updateDeviceName(mac, name);
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
      const result = await tauriClient.getUnreadAlerts();
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
        await tauriClient.markAlertRead(alertId);
        await fetchAlerts();
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchAlerts],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await tauriClient.markAllAlertsRead();
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
    tauriClient
      .getDatabasePath()
      .then(setPath)
      .catch(() => setPath(null));
  }, []);

  return path;
}
