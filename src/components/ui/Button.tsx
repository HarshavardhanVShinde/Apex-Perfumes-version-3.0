import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  asChild?: boolean;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  asChild = false,
  ...props 
}: ButtonProps) {
  const classes = cn(
    'btn transition-all duration-200',
    {
      'btn-primary': variant === 'primary',
      'btn-secondary': variant === 'secondary',
      'btn-accent': variant === 'accent',
      'hover:bg-primary-50 dark:hover:bg-primary-900': variant === 'ghost',
    },
    {
      'px-3 py-1.5 text-sm': size === 'sm',
      'px-4 py-2': size === 'md',
      'px-6 py-3 text-lg': size === 'lg',
    },
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn((children as any).props?.className, classes),
    });
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}