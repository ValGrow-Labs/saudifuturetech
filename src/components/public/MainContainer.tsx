import React from 'react';
import { cn } from '@/lib/utils';

interface MainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'wide' | 'narrow';
  children: React.ReactNode;
}

export const MainContainer: React.FC<MainContainerProps> = ({
  size = 'default',
  className,
  children,
  ...props
}) => {
  const maxSizes = {
    default: 'max-w-7xl',      // 1280px standard editorial container
    wide: 'max-w-[90rem]',     // 1440px wide showcase container
    narrow: 'max-w-4xl',       // 896px reading container
  };

  return (
    <div
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        maxSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

