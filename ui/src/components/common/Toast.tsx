/**
 * Toast Notification Wrapper
 * Sonner toast configuration and utilities
 */

import { Toaster } from 'sonner';
import { useTheme } from '../../hooks/useTheme';

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
        },
      }}
      richColors
      closeButton
    />
  );
}

export { toast } from 'sonner';
