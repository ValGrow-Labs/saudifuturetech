import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold tracking-tight rounded-none transition-editorial focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-high focus-visible:ring-offset-2 focus-visible:ring-offset-editorial-paper disabled:opacity-50 disabled:cursor-not-allowed select-none font-sans';

    const variants = {
      primary:
        'bg-brand-yellow text-ink-high hover:bg-brand-yellow/90 border border-ink-high/20 active:translate-y-px shadow-xs',
      secondary:
        'bg-editorial-pure text-ink-high hover:bg-editorial-sand border border-editorial-hairline active:translate-y-px shadow-xs',
      outline:
        'bg-transparent text-ink-high border border-editorial-hairline hover:border-ink-high hover:bg-editorial-sand active:translate-y-px',
      ghost:
        'bg-transparent text-ink-body hover:text-ink-high hover:bg-editorial-sand',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2 gap-2',
      lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const PrimaryButton: React.FC<ButtonProps> = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton: React.FC<ButtonProps> = (props) => <Button variant="secondary" {...props} />;
