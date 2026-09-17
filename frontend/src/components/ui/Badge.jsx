import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Badge = ({ children, variant = 'default', dot = false, className }) => {
  const variants = {
    default:  'bg-muted text-text-secondary border border-border-light',
    primary:  'bg-primary/10 text-primary-dark border border-primary/20',
    accent:   'bg-accent/15 text-accent-dark border border-accent/25',
    danger:   'bg-danger/10 text-danger border border-danger/20',
    success:  'bg-success/10 text-success border border-success/20',
    warning:  'bg-warning/10 text-warning border border-warning/20',
    muted:    'bg-muted text-text-muted border border-border-light',
    outline:  'bg-transparent text-text-secondary border border-border',
    white:    'bg-[var(--color-card-bg)] text-text-primary border border-border shadow-sm',
  };

  const dotColors = {
    default: 'bg-text-muted',
    primary: 'bg-primary',
    accent:  'bg-accent',
    danger:  'bg-danger',
    success: 'bg-success',
    warning: 'bg-warning',
    muted:   'bg-text-muted',
    outline: 'bg-text-secondary',
    white:   'bg-text-secondary',
  };

  return (
    <span className={twMerge(clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium",
      variants[variant],
      className
    ))}>
      {dot && <span className={clsx("h-1.5 w-1.5 rounded-full flex-shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
};

export default Badge;
