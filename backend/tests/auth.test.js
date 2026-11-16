import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_URL } from './helpers.js';

test('Authentication Test Suite', async (t) => {
  const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
  const testEmail = `authtest_${uniqueSuffix}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Auth Test User';
  let authToken = null;
  let userId = null;

  await t.test('1. Register a new user and create 100k wallet', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Expected HTTP 201, got ${res.status}: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.equal(data.user.email, testEmail);
    assert.equal(Number(data.user.wallet.cash), 100000, 'Initial wallet cash must be 100,000 INR');
    userId = data.user.id;
  });

  await t.test('2. Reject registration with duplicate email', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: testEmail,
        password: testPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 409, 'Duplicate email must return HTTP 409');
    assert.equal(data.success, false);
    assert.match(data.message, /already registered/i);
  });

  await t.test('3. Login with correct credentials', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 200, 'Login must return HTTP 200');
    assert.equal(data.success, true);
    assert.ok(data.token, 'Login must return JWT token');
    assert.equal(data.user.id, userId);
    authToken = data.token;
  });

  await t.test('4. Reject login with invalid password', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 401, 'Invalid password must return HTTP 401');
    assert.equal(data.success, false);
  });

  await t.test('5. Verify authenticated session via /api/auth/me', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.user.id, userId);
    assert.equal(data.user.email, testEmail);
  });

  await t.test('6. Reject unauthenticated access to /api/auth/me', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid_or_missing_token' },
    });

    assert.equal(res.status, 401, 'Unauthenticated request must return HTTP 401');
  });
});
