import {
  TrendingUp,
  Building2,
  ArrowLeftRight,
  PieChart,
  ShieldCheck,
  BookOpen,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const ICON_COMPONENTS = {
  TrendingUp,
  Building2,
  ArrowLeftRight,
  PieChart,
  ShieldCheck,
  BookOpen,
};

export function LessonCard({ lesson, quizResult, className, onClick }) {
  if (!lesson) return null;

  const IconComponent = ICON_COMPONENTS[lesson.icon] || BookOpen;

  // Determine lesson status
  const isCompleted = Boolean(quizResult?.completed || (quizResult?.score !== undefined && quizResult.score !== null));
  const isInProgress = Boolean(!isCompleted && (quizResult?.inProgress || lesson.order === 1));

  let badgeVariant = 'default';
  let badgeLabel = 'New';

  if (isCompleted) {
    badgeVariant = 'success';
    badgeLabel = 'Completed';
  } else if (isInProgress) {
    badgeVariant = 'brand';
    badgeLabel = 'In Progress';
  }

  const scoreText = quizResult && typeof quizResult.score === 'number'
    ? `${quizResult.score}/${quizResult.total || 5}`
    : null;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'group flex flex-col justify-between transition-all duration-200',
        'hover:-translate-y-1 hover:border-(--color-border-strong) hover:shadow-md cursor-pointer',
        isCompleted && 'border-(--color-success)/20',
        className
      )}
    >
      <div>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div className="w-10 h-10 rounded-lg bg-(--color-brand-subtle) border border-(--color-brand)/20 flex items-center justify-center text-(--color-brand) transition-transform duration-200 group-hover:scale-105">
            <IconComponent className="w-5 h-5" />
          </div>
          <Badge variant={badgeVariant} size="sm">
            {badgeLabel}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-2 pt-0">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-(--color-text-muted)">
            <span>Lesson {lesson.order ?? 1}</span>
            {lesson.category && (
              <>
                <span>&bull;</span>
                <span>{lesson.category}</span>
              </>
            )}
          </div>
          <CardTitle className="text-sm font-semibold text-(--color-text-primary) group-hover:text-(--color-brand) transition-colors">
            {lesson.title}
          </CardTitle>
          <CardDescription className="text-xs text-(--color-text-muted) line-clamp-3 leading-relaxed">
            {lesson.description || lesson.summary}
          </CardDescription>
        </CardContent>
      </div>

      <CardFooter className="pt-3 pb-4 border-t border-(--color-border) flex items-center justify-between text-[11px] font-mono text-(--color-text-muted)">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min` : '10 min'}</span>
        </div>

        {scoreText ? (
          <div className="flex items-center gap-1 text-(--color-success) font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Score: {scoreText}</span>
          </div>
        ) : (
          <span className="text-(--color-text-muted)">
            {lesson.quizCount || 5} Questions
          </span>
        )}
      </CardFooter>
    </Card>
  );
}

export default LessonCard;
