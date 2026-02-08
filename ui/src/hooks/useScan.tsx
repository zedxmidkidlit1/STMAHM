/**
 * React hook for managing network scan state and Tauri integration
 */

import {
  useState,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  useRef,
} from "react";
import { tauriClient } from "../lib/api/tauri-client";
import type {
  HostInfo,
  PortWarning,
  ScanResult,
  VulnerabilityInfo,
} from "../lib/api/types";
import { isTauri } from "../lib/runtime/is-tauri";

export type { HostInfo, PortWarning, ScanResult, VulnerabilityInfo };

export type ScanStatus = 'ready' | 'scanning' | 'complete';

export interface ScanState {
  isScanning: boolean;
  scanStatus: ScanStatus;
  scanResult: ScanResult | null;
  error: string | null;
  lastScanTime: Date | null;
}

/**
 * Hook for managing network scan state
 */
export function useScan() {
  const [state, setState] = useState<ScanState>({
    isScanning: false,
    scanStatus: 'ready',
    scanResult: null,
    error: null,
    lastScanTime: null,
  });
  const activeScanIdRef = useRef(0);
  const tauriAvailable = isTauri();

  // Perform a network scan
  const scan = useCallback(async () => {
    if (state.isScanning) {
      return;
    }

    activeScanIdRef.current += 1;
    const currentScanId = activeScanIdRef.current;

    // Check if demo mode is enabled
    const isDemoMode = localStorage.getItem("demo-mode-enabled") === "true";

    setState((prev) => ({
      ...prev,
      isScanning: true,
      scanStatus: "scanning",
      error: null,
    }));

    try {
      const result = isDemoMode
        ? await tauriClient.mockScanNetwork()
        : await tauriClient.scanNetwork();

      if (currentScanId !== activeScanIdRef.current) {
        return;
      }

      setState({
        isScanning: false,
        scanStatus: "complete",
        scanResult: result,
        error: null,
        lastScanTime: new Date(),
      });

      setTimeout(() => {
        if (currentScanId !== activeScanIdRef.current) {
          return;
        }

        setState((prev) => ({
          ...prev,
          scanStatus: "ready",
        }));
      }, 1000);
    } catch (err) {
      if (currentScanId !== activeScanIdRef.current) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : String(err);
      setState((prev) => ({
        ...prev,
        isScanning: false,
        scanStatus: "ready",
        error: tauriAvailable
          ? errorMessage
          : "Not running in Tauri environment. Please run with `npm run tauri dev`.",
      }));
    }
  }, [state.isScanning, tauriAvailable]);

  const stopScan = useCallback(() => {
    if (!state.isScanning) {
      return;
    }

    // Backend scan command is currently non-cancellable.
    // We cancel the active UI request and ignore stale results.
    activeScanIdRef.current += 1;
    setState((prev) => ({
      ...prev,
      isScanning: false,
      scanStatus: "ready",
      error: null,
    }));
  }, [state.isScanning]);

  return {
    ...state,
    scan,
    stopScan,
    tauriAvailable,
  };
}

/**
 * Global scan context
 */
interface ScanContextType extends ScanState {
  scan: () => Promise<void>;
  stopScan: () => void;
  tauriAvailable: boolean;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

export function ScanProvider({ children }: { children: ReactNode }) {
  const scanState = useScan();

  return (
    <ScanContext.Provider value={scanState}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
}
