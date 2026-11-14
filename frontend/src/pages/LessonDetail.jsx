import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  GraduationCap,
  AlertCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import api from '@/services/api';
import { QuizWidget } from '@/components/features/QuizWidget';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';


const LESSON_NAV = [
  { slug: 'introduction-to-the-stock-market', title: 'Introduction to the Stock Market', order: 1, estimatedMinutes: 8, category: 'Foundations' },
  { slug: 'stock-exchanges-and-how-they-work', title: 'Stock Exchanges and How They Work', order: 2, estimatedMinutes: 10, category: 'Market Mechanics' },
  { slug: 'market-orders-and-basic-trading', title: 'Market Orders and Basic Trading', order: 3, estimatedMinutes: 12, category: 'Execution' },
  { slug: 'portfolio-diversification', title: 'Portfolio Diversification', order: 4, estimatedMinutes: 10, category: 'Portfolio Management' },
  { slug: 'risk-management-in-stock-trading', title: 'Risk Management in Stock Trading', order: 5, estimatedMinutes: 15, category: 'Risk Control' },
];

export default function LessonDetail({ className }) {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(localStorage.getItem('tradewise_token'));

  const loadLessonData = useCallback(async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    setQuizResult(null);

    try {
      const [lessonRes, quizRes] = await Promise.allSettled([
        api.get(`/api/lessons/${slug}`),
        api.get(`/api/lessons/${slug}/quiz`),
      ]);

      if (lessonRes.status === 'fulfilled' && lessonRes.value.data?.lesson) {
        const serverLesson = lessonRes.value.data.lesson;
        const navMeta = LESSON_NAV.find((l) => l.slug === slug);
        setLesson({
          ...serverLesson,
          estimatedMinutes: navMeta?.estimatedMinutes || 10,
          category: navMeta?.category || 'Trading Foundations',
          order: serverLesson.order ?? navMeta?.order ?? 1,
        });
      } else {
        setLesson(null);
        setError(`Lesson "${slug}" could not be found.`);
        setIsLoading(false);
        return;
      }

      if (quizRes.status === 'fulfilled' && quizRes.value.data?.quiz?.questions) {
        setQuizQuestions(quizRes.value.data.quiz.questions);
      } else {
        setQuizQuestions([]);
      }

      if (isAuthenticated) {
        try {
          const progressRes = await api.get('/api/lessons/progress');
          if (progressRes.data?.progress?.lessonProgress) {
            const lessonProgress = progressRes.data.progress.lessonProgress.find(
              (lp) => lp.lessonSlug === slug
            );
            if (lessonProgress) {
              setQuizResult({
                score: lessonProgress.bestScore,
                total: lessonProgress.bestTotal,
                percentage: lessonProgress.bestPercentage,
              });
            }
          }
        } catch {
        }
      }
    } catch (err) {
      setLesson(null);
      setError(err?.response?.data?.message || 'Failed to load lesson data.');
    } finally {
      setIsLoading(false);
    }
  }, [slug, isAuthenticated]);

  useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  
  const handleQuizSubmit = async (answers) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to submit quizzes and track your progress.');
    }

    const res = await api.post(`/api/lessons/${slug}/quiz/submit`, { answers });
    const serverResult = res.data?.result;

    if (!serverResult) {
      throw new Error('No result returned from server.');
    }

    setQuizResult(serverResult);
    return serverResult;
  };

  const currentIndex = LESSON_NAV.findIndex((l) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? LESSON_NAV[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < LESSON_NAV.length - 1 ? LESSON_NAV[currentIndex + 1] : null;
  const totalLessons = LESSON_NAV.length;

  if (isLoading) {
    return (
      <div className={cn('max-w-3xl mx-auto space-y-6 py-4', className)}>
        <Skeleton className="h-6 w-36" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="space-y-4 pt-4 border-t border-(--color-border)">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className={cn('max-w-3xl mx-auto py-12 px-4 text-center space-y-4', className)}>
        <div className="w-12 h-12 mx-auto rounded-full bg-(--color-error-subtle) text-(--color-error) flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-(--color-text-primary)">
          Lesson Not Found
        </h2>
        <p className="text-xs text-(--color-text-muted) max-w-md mx-auto">
          {error || `The requested lesson slug "${slug}" does not exist in our curriculum catalog.`}
        </p>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/learn')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Lessons
          </Button>
        </div>
      </div>
    );
  }

  const paragraphs = lesson.content ? lesson.content.split('\n\n') : [];
  const displayOrder = lesson.order ?? (currentIndex >= 0 ? currentIndex + 1 : 1);
  const isCompleted = quizResult?.score !== undefined && quizResult?.score !== null;

  return (
    <div className={cn('max-w-3xl mx-auto space-y-8 py-2 pb-12', className)}>
      
      <div className="flex items-center justify-between pb-3 border-b border-(--color-border)">
        <Link to="/learn">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Lessons
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            Lesson {displayOrder} of {totalLessons}
          </Badge>
          {isCompleted && (
            <Badge variant="success" size="sm">
              Completed
            </Badge>
          )}
        </div>
      </div>

      
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-(--color-brand) uppercase tracking-wider">
          <GraduationCap className="w-4 h-4" />
          <span>{lesson.category || 'Trading Foundations'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-(--color-text-primary) leading-tight">
          {lesson.title}
        </h1>

        <div className="flex items-center gap-4 text-xs font-mono text-(--color-text-muted) pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{lesson.estimatedMinutes || 10} min read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{quizQuestions.length || lesson.quizCount || 0} Quiz Questions</span>
          </div>
        </div>
      </div>

      
      <article className="space-y-5 text-sm text-(--color-text-secondary) leading-relaxed border-t border-(--color-border) pt-6">
        {paragraphs.map((para, index) => (
          <p key={index} className="text-sm leading-relaxed text-(--color-text-primary)/90">
            {para}
          </p>
        ))}
      </article>

      
      <section className="pt-6 border-t border-(--color-border) space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-(--color-brand)" />
          <h2 className="text-lg font-bold text-(--color-text-primary) tracking-tight">
            Assessment &amp; Knowledge Check
          </h2>
        </div>

        {!isAuthenticated && quizQuestions.length > 0 && (
          <div className="p-3 rounded-lg border border-(--color-brand)/30 bg-(--color-brand-subtle) text-xs text-(--color-text-secondary) flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-(--color-brand) shrink-0" />
            <span>
              <Link to="/login" className="text-(--color-brand) font-semibold underline">Log in</Link> to submit quizzes and track your learning progress.
            </span>
          </div>
        )}

        <QuizWidget
          questions={quizQuestions}
          initialResult={quizResult}
          onSubmit={handleQuizSubmit}
        />
      </section>

      
      <nav className="pt-6 border-t border-(--color-border) grid grid-cols-1 sm:grid-cols-2 gap-4">
        {prevLesson ? (
          <Link
            to={`/learn/${prevLesson.slug}`}
            className="group block p-4 rounded-xl border border-(--color-border) bg-(--color-bg-subtle) hover:bg-(--color-bg-raised) transition-colors"
          >
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-(--color-text-muted) mb-1">
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
              <span>Previous Lesson</span>
            </div>
            <div className="text-sm font-semibold text-(--color-text-primary) group-hover:text-(--color-brand) transition-colors line-clamp-1">
              {prevLesson.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-(--color-border)/50 text-[11px] font-mono text-(--color-text-muted) flex items-center justify-center">
            Beginning of curriculum
          </div>
        )}

        {nextLesson ? (
          <Link
            to={`/learn/${nextLesson.slug}`}
            className="group block p-4 rounded-xl border border-(--color-border) bg-(--color-bg-subtle) hover:bg-(--color-bg-raised) transition-colors text-right"
          >
            <div className="flex items-center justify-end gap-2 text-[11px] font-mono uppercase tracking-wider text-(--color-text-muted) mb-1">
              <span>Next Lesson</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="text-sm font-semibold text-(--color-text-primary) group-hover:text-(--color-brand) transition-colors line-clamp-1">
              {nextLesson.title}
            </div>
          </Link>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-(--color-border)/50 text-[11px] font-mono text-(--color-text-muted) flex items-center justify-center">
            You have reached the end of this track
          </div>
        )}
      </nav>
    </div>
  );
}
