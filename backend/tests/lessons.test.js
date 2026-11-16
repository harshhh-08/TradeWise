import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_URL, registerAndLogin } from './helpers.js';

test('Educational Lessons & Quiz Test Suite', async (t) => {
  const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
  const testEmail = `lessontest_${uniqueSuffix}@example.com`;
  let token = null;

  await t.test('Setup: Register and login learning user', async () => {
    const session = await registerAndLogin(testEmail, 'Password123!', 'Student User');
    assert.ok(session.token);
    token = session.token;
  });

  let firstLessonSlug = 'introduction-to-the-stock-market';
  let firstLessonId = null;

  await t.test('1. List all lessons via GET /api/lessons', async () => {
    const res = await fetch(`${BASE_URL}/api/lessons`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.lessons));
    assert.ok(data.lessons.length >= 5, 'Must have at least 5 curriculum lessons');
    firstLessonId = data.lessons[0].id;
    firstLessonSlug = data.lessons[0].slug;
  });

  await t.test('2. Retrieve lesson by string slug', async () => {
    const res = await fetch(`${BASE_URL}/api/lessons/${firstLessonSlug}`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.lesson.slug, firstLessonSlug);
    assert.ok(data.lesson.content.length > 50);
  });

  await t.test('3. Retrieve lesson by numeric ID', async () => {
    const res = await fetch(`${BASE_URL}/api/lessons/${firstLessonId}`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.lesson.id, firstLessonId);
  });

  let quizQuestions = [];

  await t.test('4. Fetch lesson quiz without revealing answers', async () => {
    const res = await fetch(`${BASE_URL}/api/lessons/${firstLessonSlug}/quiz`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.quiz.questions));
    assert.ok(data.quiz.questions.length > 0);

    quizQuestions = data.quiz.questions;
    for (const q of quizQuestions) {
      assert.equal(q.correctAnswer, undefined, 'API must never leak correctAnswer to client');
      assert.equal(q.explanation, undefined, 'API must never leak explanation before submission');
      assert.ok(Array.isArray(q.options) && q.options.length >= 2);
    }
  });

  await t.test('5. Submit quiz and verify server-side grading', async () => {
    const answers = quizQuestions.map((q) => ({
      questionId: q.id,
      selectedOption: 1,
    }));

    const res = await fetch(`${BASE_URL}/api/lessons/${firstLessonSlug}/quiz/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Quiz submission failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.ok(data.result.total === quizQuestions.length);
    assert.ok(typeof data.result.score === 'number');
    assert.ok(Array.isArray(data.result.details));

    for (const d of data.result.details) {
      assert.ok(typeof d.isCorrect === 'boolean');
      assert.ok(typeof d.correctAnswer === 'number');
      assert.ok(typeof d.explanation === 'string');
    }
  });

  await t.test('6. Verify updated user learning progress', async () => {
    const res = await fetch(`${BASE_URL}/api/lessons/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.progress.lessonsAttempted >= 1);
    assert.ok(data.progress.totalAttempts >= 1);
  });
});
