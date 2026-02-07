/**
 * useKeyboardShortcuts Hook
 * Global keyboard shortcuts manager for the application
 */

import { useEffect } from 'react';

export type ShortcutHandler = (event: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Cmd on Mac, Win on Windows
  handler: ShortcutHandler;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey;
        const altMatch = shortcut.alt === undefined || shortcut.alt === event.altKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === event.shiftKey;
        const metaMatch = shortcut.meta === undefined || shortcut.meta === event.metaKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.handler(event);
          break; // Only trigger one shortcut
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [shortcuts]);
}

/**
 * Global shortcut definitions
 */
export const SHORTCUTS = {
  // Navigation
  DASHBOARD: { key: '1', meta: true, description: 'Go to Dashboard' },
  TOPOLOGY: { key: '2', meta: true, description: 'Go to Topology' },
  DEVICES: { key: '3', meta: true, description: 'Go to Devices' },
  SETTINGS: { key: '4', meta: true, description: 'Go to Settings' },
  
  // Actions
  SCAN: { key: 's', meta: true, description: 'Start Scan' },
  SEARCH: { key: 'f', meta: true, description: 'Focus Search' },
  COMMAND_PALETTE: { key: 'k', meta: true, description: 'Open Command Palette' },
  
  // Sidebar
  TOGGLE_SIDEBAR: { key: 'b', meta: true, description: 'Toggle Sidebar' },
  
  // Theme
  TOGGLE_THEME: { key: 't', meta: true, description: 'Toggle Theme' },
} as const;

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: { key: string; ctrl?: boolean; alt?: boolean; shift?: boolean; meta?: boolean }): string {
  const parts: string[] = [];
  
  // Detect platform
  const isMac = navigator.platform.toLowerCase().includes('mac');
  
  if (shortcut.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.meta) parts.push(isMac ? '⌘' : 'Win');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(isMac ? '' : '+');
}
