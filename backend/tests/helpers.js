export const BASE_URL = process.env.API_URL || 'http://localhost:3000';

export async function registerAndLogin(email, password = 'Password123!', name = 'Test User') {
  await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  return { token: data.token, user: data.user };
}
