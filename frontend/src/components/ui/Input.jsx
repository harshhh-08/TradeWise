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
    <div className={cn('w-full space-y-1.5 text-left', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-(--color-text-secondary) tracking-tight"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-(--color-text-muted) pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={cn(
            'w-full h-9 rounded-(--radius-md) bg-(--color-bg-subtle) border border-(--color-border) px-3 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) transition-colors',
            'focus:outline-none focus:border-(--color-brand) focus:ring-1 focus:ring-(--color-brand)',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-(--color-error) focus:border-(--color-error) focus:ring-(--color-error)',
            className
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3 text-(--color-text-muted) flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-(--color-error)">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-(--color-text-muted)">{helperText}</p>
      ) : null}
    </div>
  );
});

