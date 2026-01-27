/**
 * Platform Detection Utilities
 * Detects OS platform for platform-specific styling and behaviors
 */

export type Platform = "windows" | "macos" | "linux" | "unknown";

/**
 * Detect the current operating system
 */
export async function getPlatform(): Promise<Platform> {
  // In Tauri, we can use the API to detect platform
  if (typeof window !== "undefined" && "__TAURI_INTERNALS__" in window) {
    try {
      const { platform } = await import("@tauri-apps/plugin-os");
      const platformType = await platform();

      if (platformType === "windows") return "windows";
      if (platformType === "macos") return "macos";
      if (platformType === "linux") return "linux";
    } catch (error) {
      // Silent fallback - this is expected in browser preview
      // Tauri API not available, will use user agent detection below
    }
  }

  // Fallback to user agent detection
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes("win")) return "windows";
  if (userAgent.includes("mac")) return "macos";
  if (userAgent.includes("linux")) return "linux";

  return "unknown";
}

/**
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

/**
 * Platform-specific class names
 */
export function getPlatformClass(platform: Platform): string {
  return `platform-${platform}`;
}

/**
 * Get platform-specific window control style
 */
export function getWindowControlStyle(
  platform: Platform,
): "windows" | "macos" | "default" {
  switch (platform) {
    case "windows":
      return "windows";
    case "macos":
      return "macos";
    default:
      return "default";
  }
}
