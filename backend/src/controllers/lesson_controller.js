import {
  getAllLessons,
  getLessonById,
  getQuizForLesson,
  submitQuiz,
  getUserProgress,
  getQuizResults,
} from '../services/lesson_service.js';

export const listLessons = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getAllLessons({ page, limit });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List lessons error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve lessons',
    });
  }
};

export const getLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await getLessonById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: `Lesson with ID ${lessonId} not found`,
      });
    }
    return res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error('Get lesson error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve lesson',
    });
  }
};

export const getLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const quiz = await getQuizForLesson(lessonId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: `Lesson with ID ${lessonId} not found`,
      });
    }
    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error('Get quiz error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz',
    });
  }
};

export const submitLessonQuiz = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { answers } = req.body || {};
    const result = await submitQuiz(req.user.id, lessonId, answers);
    return res.status(201).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Submit quiz error:', error.message);
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Failed to submit quiz',
    });
  }
};

export const getLessonProgress = async (req, res) => {
  try {
    const progress = await getUserProgress(req.user.id);
    return res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Get progress error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve progress',
    });
  }
};

export const getQuizResultHistory = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const result = await getQuizResults(req.user.id, { page, limit });
    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Get quiz results error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve quiz results',
    });
  }
};

