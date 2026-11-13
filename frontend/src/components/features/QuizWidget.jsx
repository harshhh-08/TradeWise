import { useState } from 'react';
import { CheckCircle2, XCircle, HelpCircle, RotateCcw, Award, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export function QuizWidget({
  questions = [],
  onSubmit,
  initialResult = null,
  className,
}) {
  const [selectedAnswers, setSelectedAnswers] = useState(() => initialResult?.userAnswers || {});
  const [isSubmitted, setIsSubmitted] = useState(() => Boolean(initialResult?.completed));
  const [score, setScore] = useState(() => initialResult?.score ?? 0);

  if (!questions || questions.length === 0) {
    return (
      <Card className={cn('p-6 text-center text-xs text-(--color-text-muted)', className)}>
        No quiz questions available for this module.
      </Card>
    );
  }

  const allAnswered = questions.length > 0 && questions.every((_, idx) => selectedAnswers[idx] !== undefined);
  const totalQuestions = questions.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassed = percentage >= 60;

  const handleSelectOption = (questionIndex, optionIndex) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!allAnswered || isSubmitted) return;

    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        calculatedScore += 1;
      }
    });

    setScore(calculatedScore);
    setIsSubmitted(true);

    const resultPayload = {
      score: calculatedScore,
      total: totalQuestions,
      percentage: Math.round((calculatedScore / totalQuestions) * 100),
      passed: (calculatedScore / totalQuestions) >= 0.6,
      completed: true,
      userAnswers: selectedAnswers,
      submittedAt: new Date().toISOString(),
    };

    if (onSubmit) {
      onSubmit(resultPayload);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setScore(0);
  };

  return (
    <Card className={cn('border-(--color-border) bg-(--color-bg-subtle) space-y-6 p-6', className)}>
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-(--color-border)">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-(--color-brand-subtle) text-(--color-brand)">
              <HelpCircle className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-(--color-brand) font-semibold">
              Module Assessment
            </span>
          </div>
          <CardTitle className="text-base font-bold text-(--color-text-primary)">
            Knowledge Check Quiz
          </CardTitle>
          <p className="text-xs text-(--color-text-muted) mt-0.5">
            Answer all {totalQuestions} questions to test your comprehension and mark this lesson completed.
          </p>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-2">
            <Badge variant={isPassed ? 'success' : 'error'} size="md">
              {isPassed ? 'Passed' : 'Needs Review'}
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRetake}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake Quiz
            </Button>
          </div>
        )}
      </CardHeader>

      {/* Score overview banner when submitted */}
      {isSubmitted && (
        <div
          className={cn(
            'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3',
            isPassed
              ? 'bg-(--color-success-subtle) border-(--color-success)/30 text-(--color-success)'
              : 'bg-(--color-error-subtle) border-(--color-error)/30 text-(--color-error)'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-(--color-bg-base) flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-(--color-text-primary)">
                {isPassed ? 'Great Job! Assessment Complete.' : 'Quiz Completed — Review Concepts'}
              </h4>
              <p className="text-xs text-(--color-text-muted)">
                You correctly answered {score} out of {totalQuestions} questions ({percentage}%).
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-mono font-bold tracking-tight text-(--color-text-primary)">
              {score}/{totalQuestions}
            </span>
            <span className="block text-[10px] font-mono uppercase text-(--color-text-muted)">
              Final Score
            </span>
          </div>
        </div>
      )}

      {/* Question list */}
      <CardContent className="p-0 space-y-6">
        {questions.map((questionItem, qIndex) => {
          const selectedOption = selectedAnswers[qIndex];
          const isCorrectChoice = selectedOption === questionItem.correctAnswer;

          return (
            <div
              key={questionItem.id || qIndex}
              className="p-4 rounded-xl border border-(--color-border) bg-(--color-bg-base)/50 space-y-3"
            >
              {/* Question header */}
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-mono text-(--color-brand) font-semibold shrink-0 mt-0.5">
                  Q{qIndex + 1}.
                </span>
                <p className="text-sm font-medium text-(--color-text-primary) flex-1 leading-snug">
                  {questionItem.question}
                </p>
                {isSubmitted && (
                  <span className="shrink-0">
                    {isCorrectChoice ? (
                      <CheckCircle2 className="w-4 h-4 text-(--color-success)" />
                    ) : (
                      <XCircle className="w-4 h-4 text-(--color-error)" />
                    )}
                  </span>
                )}
              </div>

              {/* Options list */}
              <div className="space-y-2 pt-1">
                {questionItem.options.map((optionText, optIndex) => {
                  const isSelected = selectedOption === optIndex;
                  const isCorrectAnswer = optIndex === questionItem.correctAnswer;

                  let optionStyle = 'border-(--color-border) hover:bg-(--color-bg-raised) text-(--color-text-secondary)';

                  if (isSubmitted) {
                    if (isCorrectAnswer) {
                      optionStyle = 'border-(--color-success) bg-(--color-success-subtle) text-(--color-success) font-medium';
                    } else if (isSelected && !isCorrectAnswer) {
                      optionStyle = 'border-(--color-error) bg-(--color-error-subtle) text-(--color-error) font-medium';
                    } else {
                      optionStyle = 'border-(--color-border) opacity-60 text-(--color-text-muted)';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-(--color-brand) bg-(--color-brand-subtle) text-(--color-brand) font-medium';
                  }

                  return (
                    <label
                      key={optIndex}
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-colors',
                        optionStyle,
                        isSubmitted && 'cursor-default'
                      )}
                    >
                      <input
                        type="radio"
                        name={`question-${qIndex}`}
                        checked={isSelected}
                        onChange={() => handleSelectOption(qIndex, optIndex)}
                        disabled={isSubmitted}
                        className="sr-only"
                      />
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                          isSelected
                            ? 'border-current bg-current/20'
                            : 'border-(--color-border-strong) bg-transparent'
                        )}
                      >
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        )}
                      </div>
                      <span className="flex-1 leading-relaxed">{optionText}</span>
                      {isSubmitted && isCorrectAnswer && (
                        <Check className="w-3.5 h-3.5 shrink-0 text-(--color-success)" />
                      )}
                    </label>
                  );
                })}
              </div>

              {/* Explanation after submission */}
              {isSubmitted && questionItem.explanation && (
                <div className="mt-3 p-3 rounded-lg bg-(--color-bg-raised) border border-(--color-border) text-xs text-(--color-text-secondary) leading-relaxed">
                  <span className="font-semibold text-(--color-text-primary)">Explanation: </span>
                  {questionItem.explanation}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      {/* Action footer */}
      {!isSubmitted ? (
        <div className="pt-4 border-t border-(--color-border) flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-mono text-(--color-text-muted)">
            {Object.keys(selectedAnswers).length} of {totalQuestions} answered
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full sm:w-auto"
          >
            Submit Quiz
          </Button>
        </div>
      ) : (
        <div className="pt-4 border-t border-(--color-border) flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetake}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Retake Quiz
          </Button>
        </div>
      )}
    </Card>
  );
}

export default QuizWidget;
