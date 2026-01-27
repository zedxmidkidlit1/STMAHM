/**
 * Modern Toggle/Switch Component
 * iOS/macOS inspired toggle with smooth animations
 */

import { motion } from 'framer-motion';
import clsx from 'clsx';
import { usePlatform } from '../../hooks/usePlatform';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    container: 'w-9 h-5',
    thumb: 'w-4 h-4',
    translate: 'translate-x-4',
  },
  md: {
    container: 'w-11 h-6',
    thumb: 'w-5 h-5',
    translate: 'translate-x-5',
  },
  lg: {
    container: 'w-14 h-7',
    thumb: 'w-6 h-6',
    translate: 'translate-x-7',
  },
};

export default function Toggle({
  enabled,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
}: ToggleProps) {
  const { isMacOS } = usePlatform();
  const config = sizeConfig[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={clsx('flex items-center gap-3', disabled && 'opacity-50 cursor-not-allowed')}>
      {/* Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={label || 'Toggle'}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={clsx(
          'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
          config.container,
          enabled ? 'bg-accent-blue' : 'bg-bg-tertiary',
          !disabled && 'cursor-pointer',
          disabled && 'cursor-not-allowed'
        )}
      >
        <motion.span
          layout
          transition={{
            type: 'spring',
            stiffness: isMacOS ? 500 : 700, // macOS smoother
            damping: isMacOS ? 30 : 40,
          }}
          className={clsx(
            'inline-block rounded-full bg-white shadow-md',
            config.thumb,
            enabled ? config.translate : 'translate-x-0.5'
          )}
        />
      </button>

      {/* Label & Description */}
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <p className="text-sm font-medium text-text-primary">{label}</p>
          )}
          {description && (
            <p className="text-xs text-text-muted mt-0.5">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
