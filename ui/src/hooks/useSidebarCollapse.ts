/**
 * useSidebarCollapse Hook
 * Manages sidebar collapsed state with localStorage persistence
 */

import { useState, useEffect } from 'react';

const SIDEBAR_STORAGE_KEY = 'netmapper-sidebar-collapsed';

export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load from localStorage on init
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Persist to localStorage when changed
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  }, [isCollapsed]);

  const toggle = () => setIsCollapsed((prev) => !prev);

  return { isCollapsed, toggle };
}
