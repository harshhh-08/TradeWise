import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, RefreshCw, BookOpen } from 'lucide-react';
import api from '@/services/api';
import { LessonCard } from '@/components/features/LessonCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const DEFAULT_LESSONS = [
  {
    id: 1,
    slug: 'introduction-to-the-stock-market',
    title: 'Introduction to the Stock Market',
    order: 1,
    description: 'Understand the fundamentals of stock exchanges, equity ownership, market participants, and how share prices are determined by supply and demand.',
    estimatedMinutes: 8,
    category: 'Foundations',
    icon: 'TrendingUp',
    quizCount: 5,
  },
  {
    id: 2,
    slug: 'stock-exchanges-and-how-they-work',
    title: 'Stock Exchanges and How They Work',
    order: 2,
    description: 'Explore how modern electronic order matching operates, major exchanges like NSE and BSE, and key indices such as SENSEX and NIFTY 50.',
    estimatedMinutes: 10,
    category: 'Market Mechanics',
    icon: 'Building2',
    quizCount: 5,
  },
  {
    id: 3,
    slug: 'market-orders-and-basic-trading',
    title: 'Market Orders and Basic Trading',
    order: 3,
    description: 'Learn the mechanics of market orders vs. limit orders, bid-ask spreads, and how paper trading builds foundational execution skills.',
    estimatedMinutes: 12,
    category: 'Execution',
    icon: 'ArrowLeftRight',
    quizCount: 5,
  },
  {
    id: 4,
    slug: 'portfolio-diversification',
    title: 'Portfolio Diversification',
    order: 4,
    description: 'Master risk mitigation across asset classes and industry sectors while avoiding common concentration and correlation pitfalls.',
    estimatedMinutes: 10,
    category: 'Portfolio Management',
    icon: 'PieChart',
    quizCount: 5,
  },
  {
    id: 5,
    slug: 'risk-management-in-stock-trading',
    title: 'Risk Management in Stock Trading',
    order: 5,
    description: 'Implement position sizing rules, calculate risk-reward ratios, set stop-losses, and cultivate emotional discipline for long-term consistency.',
    estimatedMinutes: 15,
    category: 'Risk Control',
    icon: 'ShieldCheck',
    quizCount: 5,
  },
];

function readSavedQuizResults() {
  try {
    const storedResults = localStorage.getItem('tradewise_quiz_results');
    return storedResults ? JSON.parse(storedResults) : {};
  } catch {
    return {};
  }
}

export default function Learn({ className }) {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState(DEFAULT_LESSONS);
  const [quizResults, setQuizResults] = useState(readSavedQuizResults);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reloadLessons = async () => {
    setIsLoading(true);
    setError(null);
    setQuizResults(readSavedQuizResults());

    try {
      const response = await api.get('/api/lessons');
      if (response.data?.success && Array.isArray(response.data.lessons) && response.data.lessons.length > 0) {
        const merged = response.data.lessons.map((item) => {
          const match = DEFAULT_LESSONS.find((d) => d.slug === item.slug || d.id === item.id);
          return {
            ...match,
            ...item,
            icon: item.icon || match?.icon || 'BookOpen',
            description: item.description || match?.description || '',
            category: item.category || match?.category || 'Trading Foundations',
            estimatedMinutes: item.estimatedMinutes || match?.estimatedMinutes || 10,
          };
        });
        setLessons(merged);
      } else {
        setLessons(DEFAULT_LESSONS);
      }
    } catch {
      setLessons(DEFAULT_LESSONS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      try {
        const response = await api.get('/api/lessons');
        if (isCurrent && response.data?.success && Array.isArray(response.data.lessons) && response.data.lessons.length > 0) {
          const merged = response.data.lessons.map((item) => {
            const match = DEFAULT_LESSONS.find((d) => d.slug === item.slug || d.id === item.id);
            return {
              ...match,
              ...item,
              icon: item.icon || match?.icon || 'BookOpen',
              description: item.description || match?.description || '',
              category: item.category || match?.category || 'Trading Foundations',
              estimatedMinutes: item.estimatedMinutes || match?.estimatedMinutes || 10,
            };
          });
          setLessons(merged);
        }
      } catch {
        // Fall back gracefully to DEFAULT_LESSONS initialized in state
      }
    }

    loadData();

    return () => {
      isCurrent = false;
    };
  }, []);

  // Calculate overall progress
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) => {
    const res = quizResults[lesson.slug] || quizResults[lesson.id];
    return res?.completed || (res?.score !== undefined && res.score !== null);
  }).length;

  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header section */}
      <div className="pb-4 border-b border-[var(--color-border)] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[var(--color-brand-subtle)] text-[var(--color-brand)]">
              <GraduationCap className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-brand)] font-semibold">
              Curriculum &amp; Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            Lessons
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Learn the fundamentals of trading.
          </p>
        </div>

        {/* Progress tracker widget */}
        {!isLoading && totalLessons > 0 && (
          <div className="bg-[var(--color-bg-subtle)] border border-[var(--color-border)] rounded-lg p-3.5 w-full md:w-80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[var(--color-text-secondary)] font-medium">Curriculum Progress</span>
              <span className="text-[var(--color-text-primary)] font-bold">
                {completedLessons} of {totalLessons} completed ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-[var(--color-bg-raised)] h-2 rounded-full overflow-hidden border border-[var(--color-border)]">
              <div
                className="bg-[var(--color-brand)] h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading state with Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <div className="h-4 w-48">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="pt-3 border-t border-[var(--color-border)] flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <Card className="border-[var(--color-error)]/30 bg-[var(--color-error-subtle)] p-6">
          <CardContent className="p-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-[var(--color-error)] shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Unable to load trading lessons
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {error}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={reloadLessons}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && !error && lessons.length === 0 && (
        <div className="text-center py-16 px-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-subtle)]/50 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[var(--color-bg-raised)] flex items-center justify-center text-[var(--color-text-muted)]">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            No lessons available yet
          </h3>
          <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
            Interactive modules and trading quizzes will appear here as soon as the curriculum is published.
          </p>
        </div>
      )}

      {/* Responsive Lesson Grid: 1 col on mobile, 2 cols on md, 3 cols on lg */}
      {!isLoading && !error && lessons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.slug || lesson.id}
              lesson={lesson}
              quizResult={quizResults[lesson.slug] || quizResults[lesson.id]}
              onClick={() => navigate(`/learn/${lesson.slug}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
