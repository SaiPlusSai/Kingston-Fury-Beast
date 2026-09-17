import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ className, children, hover = false, ...props }) => (
  <div
    className={twMerge(clsx(
      "rounded-2xl overflow-hidden transition-all duration-150",
      "surface-card",
      hover && "hover:shadow-md hover:-translate-y-0.5 hover:border-border-strong cursor-pointer",
      className
    ))}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ className, children, ...props }) => (
  <div className={twMerge(clsx(
    "px-5 py-4 border-b border-border-light flex flex-col gap-0.5",
    className
  ))} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={twMerge(clsx(
    "text-base font-semibold text-text-primary font-display tracking-tight",
    className
  ))} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }) => (
  <p className={twMerge(clsx("text-sm text-text-secondary", className))} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }) => (
  <div className={twMerge(clsx("p-5", className))} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }) => (
  <div className={twMerge(clsx(
    "px-5 py-3.5 border-t border-border-light bg-muted/60 flex items-center",
    className
  ))} {...props}>
    {children}
  </div>
);

export default Card;
