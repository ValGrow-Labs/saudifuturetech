import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

/**
 * primary   — ink, turns clay on hover. One per view.
 * secondary — outlined ink (same as .btn-quiet).
 * outline   — hairline border, ink text.
 * ghost     — text only.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium rounded-sm transition-colors duration-200 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 select-none';

    const variants = {
      primary: 'bg-clay text-night font-semibold hover:bg-gold',
      secondary: 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-night',
      outline: 'bg-transparent text-ink border border-rule hover:border-ink',
      ghost: 'bg-transparent text-ink-2 hover:text-clay',
    };

    const sizes = {
      sm: 'text-[0.8125rem] px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-[0.9375rem] px-5 py-2.5 gap-2.5',
    };

    return (
      <button ref={ref} className={cn(baseStyles, variants[variant], sizes[size], className)} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export const PrimaryButton: React.FC<ButtonProps> = (props) => <Button variant="primary" {...props} />;
export const SecondaryButton: React.FC<ButtonProps> = (props) => <Button variant="secondary" {...props} />;
