/**
 * Tauri API hooks for communicating with the Rust backend
 */

import { invoke } from '@tauri-apps/api/core';
import type { ScanResult } from '../hooks/useScan';

export interface AppConfig {
  scan_interval_seconds: number;
  tcp_ports: number[];
  snmp_enabled: boolean;
  snmp_community: string;
}

/**
 * Perform a network scan
 * Calls the Rust scanner via Tauri
 */
export async function scanNetwork(): Promise<ScanResult> {
  return invoke<ScanResult>('scan_network');
}

/**
 * Get available network interfaces
 */
export async function getInterfaces(): Promise<string[]> {
  return invoke<string[]>('get_interfaces');
}

/**
 * Get current app configuration
 */
export async function getConfig(): Promise<AppConfig> {
  return invoke<AppConfig>('get_config');
}

/**
 * Update app configuration
 */
export async function setConfig(config: AppConfig): Promise<void> {
  return invoke<void>('set_config', { newConfig: config });
}

/**
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  return '__TAURI__' in window;
}
