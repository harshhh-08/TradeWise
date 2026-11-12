import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-lg',
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog surface */}
      <div
        className={cn(
          'relative w-full rounded-2xl bg-[var(--color-bg-base)] border border-[var(--color-border)] p-6 shadow-2xl z-10 space-y-4 max-h-[90svh] overflow-y-auto',
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-lg font-bold tracking-tight text-[var(--color-text-primary)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-raised)] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

