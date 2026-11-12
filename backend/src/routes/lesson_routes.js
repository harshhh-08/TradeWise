import { Router } from 'express';
import {
  listLessons,
  getLesson,
  getLessonQuiz,
  submitLessonQuiz,
  getLessonProgress,
  getQuizResultHistory,
} from '../controllers/lesson_controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/progress', authenticate, getLessonProgress);
router.get('/quiz-results', authenticate, getQuizResultHistory);
router.get('/', listLessons);
router.get('/:lessonId', getLesson);
router.get('/:lessonId/quiz', getLessonQuiz);
router.post('/:lessonId/quiz/submit', authenticate, submitLessonQuiz);

export default router;

