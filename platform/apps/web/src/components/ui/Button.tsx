import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from './cn';

type Variant = 'primary' | 'dark' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-crimson-600 hover:bg-crimson-700 text-white shadow-sm shadow-crimson-900/10 btn-glow-crimson',
  dark: 'bg-navy-950 hover:bg-navy-900 text-white shadow-sm shadow-navy-950/20 btn-glow-navy',
  secondary: 'bg-black/[0.04] hover:bg-black/[0.07] text-navy-900 btn-glow-neutral',
  outline: 'border border-navy-950/12 hover:border-crimson-400 text-navy-900 bg-white btn-glow-neutral',
  ghost: 'text-navy-700 hover:bg-black/[0.04] btn-glow-neutral shadow-none',
  danger: 'bg-crimson-700 hover:bg-crimson-800 text-white shadow-sm shadow-crimson-900/20 btn-glow-crimson',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg',
  md: 'px-4.5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'btn-liquid inline-flex items-center justify-center gap-1.5 font-semibold tracking-tight cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-crimson-500/50 focus-visible:ring-offset-2',
          'disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-none',
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      >
        {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
