import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_URL, registerAndLogin } from './helpers.js';

test('Trading & Order Execution Test Suite', async (t) => {
  const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
  const testEmail = `tradetest_${uniqueSuffix}@example.com`;
  let token = null;

  await t.test('Setup: Register and login trading user', async () => {
    const session = await registerAndLogin(testEmail, 'Password123!', 'Trader Test');
    assert.ok(session.token, 'Expected auth token');
    token = session.token;
  });

  await t.test('1. Reject order on USD stock (AAPL)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'AAPL',
        side: 'BUY',
        type: 'MARKET',
        quantity: 1,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.match(data.message, /USD stocks is not supported/i);
  });

  await t.test('2. Reject BUY order exceeding wallet cash', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'RELIANCE.NS',
        side: 'BUY',
        type: 'MARKET',
        quantity: 100000,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.match(data.message, /Insufficient funds/i);
  });

  let initialCash = 100000;
  let buy1Qty = 10;

  await t.test('3. Execute valid BUY order for RELIANCE.NS', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'RELIANCE.NS',
        side: 'BUY',
        type: 'MARKET',
        quantity: buy1Qty,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Failed to execute BUY: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.equal(data.order.side, 'BUY');
    assert.equal(data.order.symbol, 'RELIANCE.NS');
    assert.equal(data.order.quantity, buy1Qty);
    assert.ok(data.trade.price > 0);
    assert.ok(data.wallet.cash < initialCash);
  });

  await t.test('4. Reject SELL order when exceeding owned quantity', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'RELIANCE.NS',
        side: 'SELL',
        type: 'MARKET',
        quantity: buy1Qty + 5,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 400);
    assert.match(data.message, /Insufficient (holdings|shares)/i);
  });

  await t.test('5. Execute partial SELL order for RELIANCE.NS', async () => {
    const sellQty = 4;
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        symbol: 'RELIANCE.NS',
        side: 'SELL',
        type: 'MARKET',
        quantity: sellQty,
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 201, `Failed to execute SELL: ${JSON.stringify(data)}`);
    assert.equal(data.success, true);
    assert.equal(data.order.side, 'SELL');
    assert.equal(data.order.quantity, sellQty);
    assert.ok(data.trade.realizedPnl !== undefined);
  });

  await t.test('6. Retrieve user trade ledger via GET /api/trades', async () => {
    const res = await fetch(`${BASE_URL}/api/trades`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.trades));
    assert.equal(data.trades.length, 2, 'Must have recorded 1 BUY and 1 SELL trade');
    assert.equal(data.trades[0].symbol, 'RELIANCE.NS');
  });
});
