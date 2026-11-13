import { cn } from '@/lib/utils';

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-(--color-border) overflow-x-auto no-scrollbar',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3.5 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors -mb-px flex items-center gap-1.5',
              isActive
                ? 'border-(--color-brand) text-(--color-brand)'
                : 'border-transparent text-(--color-text-muted) hover:text-(--color-text-primary) hover:border-(--color-border-strong)'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-full text-[10px]',
                  isActive
                    ? 'bg-(--color-brand-subtle) text-(--color-brand)'
                    : 'bg-(--color-bg-raised) text-(--color-text-muted)'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

