import { useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export function ReplayControls({
  current = 1,
  total = 60,
  onStep,
  onPlay,
  isPlaying = false,
  className,
}) {
  // Autoplay reveals one candle per second (1000ms)
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (current >= total) {
        if (onPlay) onPlay(false);
      } else {
        if (onStep) onStep(current + 1);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, current, total, onPlay, onStep]);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && onStep) {
      onStep(Math.max(1, Math.min(total, val)));
    }
  };

  const handleGoToStart = () => onStep?.(1);
  const handleBackward5 = () => onStep?.(Math.max(1, current - 5));
  const handleStepBackward = () => onStep?.(Math.max(1, current - 1));
  const handleTogglePlay = () => onPlay?.(!isPlaying);
  const handleStepForward = () => onStep?.(Math.min(total, current + 1));
  const handleForward5 = () => onStep?.(Math.min(total, current + 5));
  const handleGoToEnd = () => onStep?.(total);

  const progressPercent = total > 1 ? ((current - 1) / (total - 1)) * 100 : 100;

  return (
    <Card className={cn('p-4 bg-[var(--color-bg-subtle)] border-[var(--color-border)] space-y-4 font-mono', className)}>
      {/* Top telemetry & Day indicator */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse" />
          <span className="text-[var(--color-text-primary)] font-bold text-sm">
            Day {current} of {total}
          </span>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            ({Math.round(progressPercent)}% revealed)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
          <span className="hidden sm:inline">Speed: 1 candle/sec</span>
          <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', isPlaying ? 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border border-[var(--color-success)]/30' : 'bg-[var(--color-bg-raised)] text-[var(--color-text-muted)]')}>
            {isPlaying ? 'RUNNING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Progress timeline slider */}
      <div className="space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min="1"
            max={total || 60}
            value={current}
            onChange={handleSliderChange}
            aria-label="Replay timeline progress"
            className="w-full h-2 bg-[var(--color-bg-raised)] rounded-lg appearance-none cursor-pointer accent-[var(--color-brand)] focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-[10px] text-[var(--color-text-muted)]">
          <span>Day 1 (Start)</span>
          <span>Day {Math.round(total / 2)}</span>
          <span>Day {total} (Latest)</span>
        </div>
      </div>

      {/* Replay action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]">
        {/* Left: Rewind controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGoToStart}
            disabled={current <= 1}
            title="Go to Start (Day 1)"
            className="px-2"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBackward5}
            disabled={current <= 1}
            title="Backward 5 Candles"
            className="px-2"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">-5</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStepBackward}
            disabled={current <= 1}
            title="Step Back 1 Candle"
            className="px-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Center: Play / Pause toggle */}
        <div>
          <Button
            variant={isPlaying ? 'danger' : 'primary'}
            size="md"
            onClick={handleTogglePlay}
            leftIcon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            className="min-w-28 font-bold text-xs"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
        </div>

        {/* Right: Forward controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStepForward}
            disabled={current >= total}
            title="Step Forward 1 Candle"
            className="px-2"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleForward5}
            disabled={current >= total}
            title="Forward 5 Candles"
            className="px-2"
          >
            <span className="text-[10px] font-bold">+5</span>
            <ChevronsRight className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleGoToEnd}
            disabled={current >= total}
            title="Go to End"
            className="px-2"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ReplayControls;
