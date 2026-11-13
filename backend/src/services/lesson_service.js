import prisma from '../config/prisma.js';

export async function getAllLessons({ page = 1, limit = 10 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  const [total, lessons] = await Promise.all([
    prisma.lesson.count(),
    prisma.lesson.findMany({
      orderBy: { order: 'asc' },
      skip,
      take: l,
      include: {
        _count: {
          select: { quizzes: true },
        },
      },
    }),
  ]);

  return {
    lessons: lessons.map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      order: lesson.order,
      quizCount: lesson._count.quizzes,
    })),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

export async function getLessonById(lessonId) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id <= 0) {
    return null;
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quizzes: {
        select: {
          id: true,
          question: true,
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    order: lesson.order,
    content: lesson.content,
    quizCount: lesson.quizzes.length,
    quizzes: lesson.quizzes.map((q) => ({
      id: q.id,
      question: q.question,
    })),
  };
}

export async function getQuizForLesson(lessonId) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id <= 0) {
    return null;
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quizzes: {
        select: {
          id: true,
          question: true,
          options: true,
        },
      },
    },
  });

  if (!lesson) {
    return null;
  }

  if (lesson.quizzes.length === 0) {
    return { lessonId: lesson.id, lessonTitle: lesson.title, questions: [] };
  }

  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    questions: lesson.quizzes.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
    })),
  };
}

export async function submitQuiz(userId, lessonId, answers) {
  const id = parseInt(lessonId, 10);
  if (isNaN(id) || id <= 0) {
    const err = new Error('Invalid lesson ID');
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    const err = new Error('Answers array is required and must not be empty');
    err.statusCode = 400;
    throw err;
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      quizzes: true,
    },
  });

  if (!lesson) {
    const err = new Error(`Lesson with ID ${id} not found`);
    err.statusCode = 404;
    throw err;
  }

  if (lesson.quizzes.length === 0) {
    const err = new Error('This lesson does not have any quiz questions');
    err.statusCode = 404;
    throw err;
  }

  const quizMap = new Map();
  for (const quiz of lesson.quizzes) {
    quizMap.set(quiz.id, quiz);
  }

  const seenQuestionIds = new Set();
  for (const answer of answers) {
    if (!answer.questionId || answer.selectedOption === undefined || answer.selectedOption === null) {
      const err = new Error('Each answer must have questionId and selectedOption');
      err.statusCode = 400;
      throw err;
    }

    const qId = parseInt(answer.questionId, 10);
    if (isNaN(qId)) {
      const err = new Error(`Invalid questionId: ${answer.questionId}`);
      err.statusCode = 400;
      throw err;
    }

    if (seenQuestionIds.has(qId)) {
      const err = new Error(`Duplicate questionId: ${qId}`);
      err.statusCode = 400;
      throw err;
    }
    seenQuestionIds.add(qId);

    if (!quizMap.has(qId)) {
      const err = new Error(`Question ID ${qId} does not belong to this lesson`);
      err.statusCode = 400;
      throw err;
    }

    const selectedIdx = parseInt(answer.selectedOption, 10);
    if (isNaN(selectedIdx) || selectedIdx < 0) {
      const err = new Error(`Invalid selectedOption for question ${qId}: must be a non-negative integer`);
      err.statusCode = 400;
      throw err;
    }

    const quiz = quizMap.get(qId);
    const optionsArray = Array.isArray(quiz.options) ? quiz.options : [];
    if (selectedIdx >= optionsArray.length) {
      const err = new Error(`selectedOption ${selectedIdx} is out of range for question ${qId} (${optionsArray.length} options available)`);
      err.statusCode = 400;
      throw err;
    }
  }

  let correctCount = 0;
  const totalQuestions = lesson.quizzes.length;
  const details = [];

  for (const quiz of lesson.quizzes) {
    const userAnswer = answers.find((a) => parseInt(a.questionId, 10) === quiz.id);
    const selectedIdx = userAnswer ? parseInt(userAnswer.selectedOption, 10) : -1;
    const isCorrect = selectedIdx === quiz.correctAnswer;
    if (isCorrect) correctCount++;

    const optionsArray = Array.isArray(quiz.options) ? quiz.options : [];

    details.push({
      questionId: quiz.id,
      question: quiz.question,
      options: optionsArray,
      selectedOption: selectedIdx,
      correctAnswer: quiz.correctAnswer,
      isCorrect,
      explanation: quiz.explanation,
    });
  }

  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const quizResult = await prisma.quizResult.create({
    data: {
      userId,
      lessonId: id,
      score: correctCount,
      total: totalQuestions,
    },
  });

  return {
    resultId: quizResult.id,
    lessonId: id,
    lessonTitle: lesson.title,
    score: correctCount,
    total: totalQuestions,
    incorrect: totalQuestions - correctCount,
    percentage,
    submittedAt: quizResult.createdAt,
    details,
  };
}

export async function getUserProgress(userId) {
  const results = await prisma.quizResult.findMany({
    where: { userId },
    include: {
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          order: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalLessons = await prisma.lesson.count();

  const lessonBestScores = new Map();
  for (const result of results) {
    const lid = result.lessonId;
    if (!lessonBestScores.has(lid)) {
      lessonBestScores.set(lid, {
        lessonId: lid,
        lessonTitle: result.lesson.title,
        lessonSlug: result.lesson.slug,
        lessonOrder: result.lesson.order,
        bestScore: result.score,
        bestTotal: result.total,
        bestPercentage: result.total > 0 ? Math.round((result.score / result.total) * 100) : 0,
        attempts: 1,
        lastAttemptAt: result.createdAt,
      });
    } else {
      const existing = lessonBestScores.get(lid);
      existing.attempts += 1;
      const existingPct = existing.bestTotal > 0 ? existing.bestScore / existing.bestTotal : 0;
      const currentPct = result.total > 0 ? result.score / result.total : 0;
      if (currentPct > existingPct) {
        existing.bestScore = result.score;
        existing.bestTotal = result.total;
        existing.bestPercentage = Math.round(currentPct * 100);
      }
    }
  }

  const lessonsAttempted = lessonBestScores.size;
  const lessonProgress = Array.from(lessonBestScores.values()).sort((a, b) => a.lessonOrder - b.lessonOrder);
  const totalAttempts = results.length;
  const overallAverage = totalAttempts > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / totalAttempts)
    : 0;

  return {
    totalLessons,
    lessonsAttempted,
    totalAttempts,
    overallAveragePercentage: overallAverage,
    lessonProgress,
  };
}

export async function getQuizResults(userId, { page = 1, limit = 10 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (p - 1) * l;

  const [total, results] = await Promise.all([
    prisma.quizResult.count({ where: { userId } }),
    prisma.quizResult.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: l,
    }),
  ]);

  return {
    results: results.map((r) => ({
      id: r.id,
      lessonId: r.lessonId,
      lessonTitle: r.lesson.title,
      lessonSlug: r.lesson.slug,
      score: r.score,
      total: r.total,
      percentage: r.total > 0 ? Math.round((r.score / r.total) * 100) : 0,
      submittedAt: r.createdAt,
    })),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

