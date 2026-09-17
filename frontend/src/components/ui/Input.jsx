import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({
  className, label, error, hint,
  leftIcon, rightIcon, id, ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 8)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors duration-150">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={twMerge(clsx(
            "block w-full rounded-xl text-text-primary text-sm transition-all duration-150",
            "bg-transparent border border-border",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60",
            "hover:border-border-strong",
            leftIcon ? "pl-10" : "pl-4",
            rightIcon ? "pr-10" : "pr-4",
            "py-2.5",
            "shadow-sm",
            error && "border-danger focus:ring-danger/20 focus:border-danger",
            className
          ))}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-text-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
          <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
