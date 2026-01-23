import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import clsx from 'clsx';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 bg-bg-tertiary rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={clsx(
          'p-2 rounded-md transition-all duration-200',
          theme === 'light'
            ? 'bg-accent-amber/20 text-accent-amber'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
        )}
        title="Light mode"
      >
        <Sun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={clsx(
          'p-2 rounded-md transition-all duration-200',
          theme === 'dark'
            ? 'bg-accent-blue/20 text-accent-blue'
            : 'text-text-muted hover:text-text-primary hover:bg-bg-hover'
        )}
        title="Dark mode"
      >
        <Moon className="w-4 h-4" />
      </button>
    </div>
  );
}
