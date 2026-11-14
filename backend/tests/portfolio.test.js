import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_URL, registerAndLogin } from './helpers.js';

test('Portfolio & Holdings Test Suite', async (t) => {
  const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
  const testEmail = `portfoliotest_${uniqueSuffix}@example.com`;
  let token = null;

  await t.test('Setup: Register and login portfolio user', async () => {
    const session = await registerAndLogin(testEmail, 'Password123!', 'Portfolio User');
    assert.ok(session.token);
    token = session.token;
  });

  await t.test('1. Initial portfolio is cash-only with 0 holdings', async () => {
    const res = await fetch(`${BASE_URL}/api/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.portfolio.availableCash, 100000);
    assert.equal(data.portfolio.holdings.length, 0);
    assert.equal(data.portfolio.totalInvestedValue, 0);
    assert.equal(data.portfolio.totalPortfolioValue, 100000);
  });

  await t.test('2. Portfolio updates after BUY order execution', async () => {
    const buyRes = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'TCS.NS',
        side: 'BUY',
        type: 'MARKET',
        quantity: 5,
      }),
    });
    assert.equal(buyRes.status, 201);

    const portRes = await fetch(`${BASE_URL}/api/portfolio`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await portRes.json();

    assert.equal(portRes.status, 200);
    assert.equal(data.portfolio.holdings.length, 1);
    const holding = data.portfolio.holdings[0];
    assert.equal(holding.symbol, 'TCS.NS');
    assert.equal(holding.quantity, 5);
    assert.ok(holding.currentPrice > 0);
    assert.ok(holding.currentMarketValue > 0);
    assert.ok(holding.investedValue > 0);
    assert.equal(
      data.portfolio.totalPortfolioValue,
      Number((data.portfolio.availableCash + holding.currentMarketValue).toFixed(2))
    );
  });
});
