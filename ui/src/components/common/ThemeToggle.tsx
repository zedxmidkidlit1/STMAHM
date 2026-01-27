import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-bg-tertiary border border-theme transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Track background */}
      <motion.div
        className="absolute inset-0.5 rounded-full"
        animate={{
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(251, 191, 36, 0.2)',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Sliding knob */}
      <motion.div
        className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center"
        animate={{
          x: isDark ? 24 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-accent-blue" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-accent-amber" />
        )}
      </motion.div>
    </button>
  );
}
