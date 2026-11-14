import { cn } from '@/lib/utils';

export function Tabs({ tabs, activeTab, onChange, className }) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 border-b border-border-subtle overflow-x-auto no-scrollbar font-sans',
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
              'px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors -mb-px flex items-center gap-1.5 cursor-pointer',
              isActive
                ? 'border-ink-primary text-ink-primary'
                : 'border-transparent text-ink-secondary hover:text-ink-primary hover:border-border-strong'
            )}
          >
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.2 rounded-sm text-[10px] font-mono',
                  isActive
                    ? 'bg-elevated text-ink-primary border border-border-subtle'
                    : 'bg-elevated text-ink-muted'
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
