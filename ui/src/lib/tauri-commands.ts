/**
 * Compatibility wrappers.
 * Prefer using `tauriClient` directly in new code.
 */

import { tauriClient } from "./api/tauri-client";
import type { ScanResult } from "./api/types";
import { isTauri } from "./runtime/is-tauri";

export async function scanNetwork(): Promise<ScanResult> {
  return tauriClient.scanNetwork();
}

export async function getInterfaces(): Promise<string[]> {
  return tauriClient.getInterfaces();
}

export { isTauri };
