import React from 'react';
import { cn } from '@/lib/utils';

interface MainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'wide' | 'narrow';
  children: React.ReactNode;
}

/** Page container. `default` matches the masthead width; `narrow` is a reading column. */
export const MainContainer: React.FC<MainContainerProps> = ({ size = 'default', className, children, ...props }) => {
  const widths = {
    default: 'max-w-[112rem] px-4 sm:px-6 lg:px-10',
    wide: 'max-w-[90rem] px-4 sm:px-6 lg:px-10',
    narrow: 'max-w-3xl px-4 sm:px-6',
  };
  return (
    <div className={cn('w-full mx-auto', widths[size], className)} {...props}>
      {children}
    </div>
  );
};
