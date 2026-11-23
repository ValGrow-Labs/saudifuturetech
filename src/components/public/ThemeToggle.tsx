'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'hero' | 'standard' | 'mobile';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'standard',
  className,
}) => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Avoid hydration mismatch by rendering a neutral placeholder until mounted
  const isDark = mounted ? theme === 'dark' : false;

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
          isDark
            ? 'bg-[#132B3D] text-[#FAF9F6] border border-[#1E3A4C] hover:bg-[#1A374D]'
            : 'bg-[#F1F5F2] text-[#111827] border border-[#E2E8E4] hover:bg-[#E8F5EF]',
          className
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <div className="flex items-center gap-2.5">
          {isDark ? (
            <Sun className="w-4 h-4 text-[#C9A227] animate-in spin-in-180 duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-[#0B6E4F] animate-in spin-in-180 duration-300" />
          )}
          <span>Appearance</span>
        </div>
        <span
          className={cn(
            'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md',
            isDark ? 'bg-[#0A1F2C] text-[#C9A227]' : 'bg-white text-[#0B6E4F] border border-[#E2E8E4]'
          )}
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
    );
  }

  if (variant === 'hero') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={cn(
          'relative p-2 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0',
          'bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md hover:border-[#C9A227]/60 shadow-xs',
          className
        )}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-[#F4C542] animate-in spin-in-180 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-white/90 group-hover:text-white animate-in spin-in-180 duration-300" />
        )}
      </button>
    );
  }

  // Standard Header variant
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={cn(
        'relative p-2 rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0',
        isDark
          ? 'bg-[#102433] hover:bg-[#132B3D] border-[#1E3A4C] hover:border-[#C9A227]/60 text-[#C9A227]'
          : 'bg-[#F1F5F2] hover:bg-[#E8F5EF] border-[#E2E8E4] hover:border-[#0B6E4F]/40 text-[#4B5563] hover:text-[#0B6E4F]',
        className
      )}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#C9A227] animate-in spin-in-180 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-[#0B6E4F] animate-in spin-in-180 duration-300" />
      )}
    </button>
  );
};
