/**
 * Tauri API hooks for communicating with the Rust backend
 */

import { invoke } from '@tauri-apps/api/core';
import type { ScanResult } from '../hooks/useScan';

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
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  return '__TAURI__' in window;
}
