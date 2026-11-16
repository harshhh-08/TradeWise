import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    id,
    className,
    containerClassName,
    type = 'text',
    disabled,
    ...props
  },
  ref
) {
  const inputId = id || props.name;

  return (
    <div className={cn('w-full space-y-1.5 text-left font-sans', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-ink-secondary"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-ink-muted pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full h-8.5 rounded bg-canvas border border-border-subtle px-3 text-xs text-ink-primary placeholder:text-ink-muted transition-colors',
            'focus:outline-none focus:border-border-strong',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-trade-down focus:border-trade-down',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 text-ink-muted flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-trade-down">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-ink-muted">{helperText}</p>
      ) : null}
    </div>
  );
});
