/**
 * Modern Input Component
 * Form input with validation states and icons
 */

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check } from 'lucide-react';
import clsx from 'clsx';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3 text-lg',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      inputSize = 'md',
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;

    return (
      <div className={clsx('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-text-primary">
            {label}
            {props.required && <span className="text-accent-red ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            disabled={disabled}
            className={clsx(
              'w-full rounded-lg transition-all duration-200',
              'bg-bg-tertiary text-text-primary placeholder:text-text-muted',
              'border',
              'focus:outline-none focus:ring-2',
              // Size
              sizeStyles[inputSize],
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              // States
              hasError && 'border-accent-red focus:ring-accent-red',
              hasSuccess && 'border-accent-green focus:ring-accent-green',
              !hasError && !hasSuccess && 'border-theme focus:ring-accent-blue focus:border-accent-blue',
              disabled && 'opacity-50 cursor-not-allowed bg-bg-secondary',
              className
            )}
            {...props}
          />

          {/* Right Icon or Status Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && (
              <AlertCircle className="w-5 h-5 text-accent-red" />
            )}
            {hasSuccess && (
              <Check className="w-5 h-5 text-accent-green" />
            )}
            {!hasError && !hasSuccess && rightIcon && (
              <span className="text-text-muted">{rightIcon}</span>
            )}
          </div>
        </div>

        {/* Helper/Error/Success Text */}
        <AnimatePresence mode="wait">
          {(error || success || helperText) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className={clsx(
                'text-xs',
                hasError && 'text-accent-red',
                hasSuccess && 'text-accent-green',
                !hasError && !hasSuccess && 'text-text-muted'
              )}
            >
              {error || success || helperText}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
