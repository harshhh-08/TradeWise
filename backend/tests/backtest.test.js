import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_URL, registerAndLogin } from './helpers.js';

test('Strategy Backtesting Test Suite', async (t) => {
  const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
  const testEmail = `backtest_${uniqueSuffix}@example.com`;
  let token = null;

  await t.test('Setup: Register and login backtest user', async () => {
    const session = await registerAndLogin(testEmail, 'Password123!', 'Algo Trader');
    assert.ok(session.token);
    token = session.token;
  });

  await t.test('1. Reject invalid strategy parameters (slowPeriod <= fastPeriod)', async () => {
    const res = await fetch(`${BASE_URL}/api/backtests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'RELIANCE.NS',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        strategy: {
          type: 'SMA_CROSSOVER',
          fastPeriod: 30,
          slowPeriod: 10,
        },
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.match(data.message, /slowPeriod must be greater than fastPeriod/i);
  });

  let backtestId = null;

  await t.test('2. Execute valid SMA Crossover backtest', async () => {
    const res = await fetch(`${BASE_URL}/api/backtests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'RELIANCE.NS',
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        strategy: {
          type: 'SMA_CROSSOVER',
          fastPeriod: 10,
          slowPeriod: 30,
        },
        initialCapital: 100000,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Backtest failed: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.ok(data.backtest.id);
    backtestId = data.backtest.id;

    const m = data.backtest.metrics;
    assert.equal(m.initialCapital, 100000);
    assert.ok(typeof m.finalPortfolioValue === 'number');
    assert.ok(typeof m.totalReturnPercent === 'number');
    assert.ok(typeof m.winRate === 'number');
    assert.ok(typeof m.maxDrawdownPercent === 'number');
    assert.ok(Array.isArray(data.backtest.equityCurve));
    assert.ok(data.backtest.equityCurve.length > 0);
  });

  await t.test('3. Retrieve user backtest history', async () => {
    const res = await fetch(`${BASE_URL}/api/backtests`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.backtests));
    assert.ok(data.backtests.some((b) => b.id === backtestId));
  });

  await t.test('4. Delete backtest run', async () => {
    const res = await fetch(`${BASE_URL}/api/backtests/${backtestId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
  });
});
