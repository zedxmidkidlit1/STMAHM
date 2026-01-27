/**
 * BentoCard - Apple-style Bento Grid card component
 * 
 * Reusable card with glassmorphism effect and hover animations
 */

import { ReactNode } from 'react';
import clsx from 'clsx';

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  /** Span columns (default 1) */
  colSpan?: 1 | 2 | 3 | 4;
  /** Span rows (default 1) */
  rowSpan?: 1 | 2 | 3;
  /** Card variant */
  variant?: 'default' | 'gradient' | 'glass';
  /** Optional icon in top-right */
  icon?: ReactNode;
  /** Optional title */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Click handler */
  onClick?: () => void;
  /** Loading state */
  isLoading?: boolean;
}

const colSpanClasses = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
};

const rowSpanClasses = {
  1: 'row-span-1',
  2: 'row-span-2',
  3: 'row-span-3',
};

export default function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  variant = 'default',
  icon,
  title,
  subtitle,
  onClick,
  isLoading = false,
}: BentoCardProps) {
  const baseStyles = clsx(
    'relative overflow-hidden rounded-2xl p-6 transition-all duration-300',
    'border border-[var(--color-border)]',
    onClick && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]',
    colSpanClasses[colSpan],
    rowSpanClasses[rowSpan],
  );

  const variantStyles = {
    default: 'bg-[var(--color-card-bg)] hover:bg-[var(--color-bg-hover)]/50',
    gradient: 'bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 hover:from-accent-blue/30 hover:to-accent-purple/30',
    glass: 'glass',
  };

  return (
    <div
      className={clsx(baseStyles, variantStyles[variant], className)}
      onClick={onClick}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--color-bg-primary)]/80 flex items-center justify-center z-10 rounded-2xl">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Header */}
      {(title || icon) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {children}

      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none rounded-2xl" />
    </div>
  );
}
