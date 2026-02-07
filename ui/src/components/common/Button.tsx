import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: clsx(
    'bg-accent-blue text-white',
    'hover:bg-accent-blue/80',
    'active:bg-accent-blue/90',
    'disabled:bg-accent-blue/50'
  ),
  secondary: clsx(
    'bg-bg-tertiary text-text-primary',
    'hover:bg-bg-hover',
    'active:bg-bg-tertiary',
    'border border-theme'
  ),
  ghost: clsx(
    'bg-transparent text-text-secondary',
    'hover:bg-bg-tertiary hover:text-text-primary',
    'active:bg-bg-tertiary/70'
  ),
  danger: clsx(
    'bg-accent-red text-white',
    'hover:bg-accent-red/80',
    'active:bg-accent-red/90',
    'disabled:bg-accent-red/50'
  ),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading =false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      fullWidth,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'font-medium rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !isDisabled && 'active:scale-95 hover:scale-[1.02]',
          // Variant & size
          variantStyles[variant],
          sizeStyles[size],
          // Width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Left Icon or Loading Spinner */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        {/* Content */}
        {children}

        {/* Right Icon */}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
