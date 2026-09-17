import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({
  children, className, variant = 'primary', size = 'md',
  isLoading, leftIcon, rightIcon, ...props
}, ref) => {

  const base = [
    "inline-flex items-center justify-center font-medium transition-all duration-150",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-40 disabled:pointer-events-none rounded-xl",
    "active:scale-[0.98]",
  ].join(' ');

  const variants = {
    primary: [
      "bg-primary text-white shadow-sm",
      "hover:bg-primary-dark hover:shadow-md",
      "focus:ring-primary/40 focus:ring-offset-white",
      "border border-primary/20",
    ].join(' '),

    secondary: [
      "bg-transparent text-text-primary border border-border",
      "hover:bg-hover hover:border-border-strong",
      "focus:ring-border/60 focus:ring-offset-white",
      "shadow-sm",
    ].join(' '),

    accent: [
      "bg-accent text-white shadow-sm",
      "hover:bg-accent-dark hover:shadow-md",
      "focus:ring-accent/40 focus:ring-offset-white",
      "border border-accent/20",
    ].join(' '),

    danger: [
      "bg-danger text-white shadow-sm",
      "hover:brightness-110 hover:shadow-md",
      "focus:ring-danger/40 focus:ring-offset-white",
      "border border-danger/20",
    ].join(' '),

    success: [
      "bg-success text-white shadow-sm",
      "hover:brightness-110 hover:shadow-md",
      "focus:ring-success/40 focus:ring-offset-white",
      "border border-success/20",
    ].join(' '),

    ghost: [
      "bg-transparent text-text-secondary border border-transparent",
      "hover:text-text-primary hover:bg-hover",
      "focus:ring-border/60 focus:ring-offset-white",
    ].join(' '),

    muted: [
      "bg-muted text-text-secondary border border-border-light",
      "hover:bg-hover hover:border-border hover:text-text-primary",
      "focus:ring-border/60 focus:ring-offset-white",
    ].join(' '),

    outline: [
      "bg-transparent text-primary border border-primary/40",
      "hover:bg-primary/5 hover:border-primary",
      "focus:ring-primary/40 focus:ring-offset-white",
    ].join(' '),
  };

  const sizes = {
    xs:   "h-7 px-3 text-xs gap-1.5",
    sm:   "h-9 px-4 text-sm gap-2",
    md:   "h-10 px-5 text-sm gap-2",
    lg:   "h-12 px-7 text-base gap-2.5",
    xl:   "h-14 px-9 text-lg gap-3",
    icon: "h-10 w-10 p-0",
  };

  return (
    <button
      ref={ref}
      className={twMerge(clsx(base, variants[variant], sizes[size], className))}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
