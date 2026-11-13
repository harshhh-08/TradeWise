import { Prisma } from '@prisma/client';
import prisma from '../config/prisma.js';
import { getStockQuote } from './stock_service.js';

export async function executeOrder({ userId, symbol, side, type = 'MARKET', quantity, limitPrice }) {
  if (!symbol || typeof symbol !== 'string') {
    const err = new Error('Stock symbol is required');
    err.statusCode = 400;
    throw err;
  }

  const normalizedSide = String(side || '').toUpperCase().trim();
  if (normalizedSide !== 'BUY' && normalizedSide !== 'SELL') {
    const err = new Error("Order side must be 'BUY' or 'SELL'");
    err.statusCode = 400;
    throw err;
  }

  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) {
    const err = new Error('Quantity must be a positive integer greater than 0');
    err.statusCode = 400;
    throw err;
  }

  const normalizedType = String(type || 'MARKET').toUpperCase().trim();
  if (normalizedType !== 'MARKET' && normalizedType !== 'LIMIT') {
    const err = new Error("Order type must be 'MARKET' or 'LIMIT'");
    err.statusCode = 400;
    throw err;
  }

  if (normalizedType === 'LIMIT') {
    const err = new Error('LIMIT orders are not supported yet. Please use MARKET orders.');
    err.statusCode = 400;
    throw err;
  }

  const quote = await getStockQuote(symbol);
  if (!quote || !quote.price || isNaN(quote.price) || quote.price <= 0) {
    const err = new Error(`Unable to fetch valid market price for symbol '${symbol.toUpperCase()}'`);
    err.statusCode = 400;
    throw err;
  }

  if (quote.currency && quote.currency.toUpperCase() !== 'INR') {
    const err = new Error('Trading in USD stocks is not supported yet. Only Indian NSE stocks in INR are supported for paper trading.');
    err.statusCode = 400;
    throw err;
  }

  const currentPrice = Number(quote.price);
  const canonicalSymbol = quote.symbol || symbol.toUpperCase().trim();
  const executionPrice = new Prisma.Decimal(currentPrice.toFixed(4));

  return await prisma.$transaction(async (tx) => {
    const lockedWallets = await tx.$queryRaw`
      SELECT id, cash FROM "Wallet" WHERE "userId" = ${userId} FOR UPDATE
    `;

    if (!lockedWallets || lockedWallets.length === 0) {
      const err = new Error('User wallet not found');
      err.statusCode = 404;
      throw err;
    }

    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (normalizedSide === 'BUY') {
      const totalCost = new Prisma.Decimal(executionPrice.mul(qty).toFixed(2));

      if (wallet.cash.lessThan(totalCost)) {
        const err = new Error(
          `Insufficient funds: Required ₹${totalCost.toFixed(2)}, Available ₹${wallet.cash.toFixed(2)}`
        );
        err.statusCode = 400;
        throw err;
      }

      await tx.$queryRaw`
        SELECT id FROM "Position" WHERE "userId" = ${userId} AND symbol = ${canonicalSymbol} AND "replaySessionId" IS NULL FOR UPDATE
      `;

      const existingPosition = await tx.position.findFirst({
        where: {
          userId,
          symbol: canonicalSymbol,
          replaySessionId: null,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          cash: wallet.cash.sub(totalCost),
        },
      });

      let updatedPosition;
      if (existingPosition) {
        const oldQty = existingPosition.quantity;
        const newQty = oldQty + qty;
        const oldTotalCost = existingPosition.avgCost.mul(oldQty);
        const combinedTotal = oldTotalCost.add(totalCost);
        const newAvgCost = new Prisma.Decimal(combinedTotal.div(newQty).toFixed(4));

        updatedPosition = await tx.position.update({
          where: { id: existingPosition.id },
          data: {
            quantity: newQty,
            avgCost: newAvgCost,
          },
        });
      } else {
        updatedPosition = await tx.position.create({
          data: {
            userId,
            symbol: canonicalSymbol,
            quantity: qty,
            avgCost: executionPrice,
            replaySessionId: null,
          },
        });
      }

      const order = await tx.order.create({
        data: {
          userId,
          symbol: canonicalSymbol,
          side: 'BUY',
          type: normalizedType,
          quantity: qty,
          status: 'FILLED',
          replaySessionId: null,
        },
      });

      const trade = await tx.trade.create({
        data: {
          userId,
          orderId: order.id,
          symbol: canonicalSymbol,
          side: 'BUY',
          quantity: qty,
          price: executionPrice,
          realizedPnl: new Prisma.Decimal(0),
          replaySessionId: null,
        },
      });

      return {
        success: true,
        message: `Successfully purchased ${qty} shares of ${canonicalSymbol} at ₹${executionPrice.toFixed(2)}`,
        order: {
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          quantity: order.quantity,
          status: order.status,
          createdAt: order.createdAt,
        },
        trade: {
          id: trade.id,
          price: Number(trade.price),
          quantity: trade.quantity,
          realizedPnl: Number(trade.realizedPnl || 0),
          executedAt: trade.executedAt,
        },
        position: {
          id: updatedPosition.id,
          symbol: updatedPosition.symbol,
          quantity: updatedPosition.quantity,
          avgCost: Number(updatedPosition.avgCost),
        },
        wallet: {
          cash: Number(updatedWallet.cash),
        },
      };
    } else {
      await tx.$queryRaw`
        SELECT id FROM "Position" WHERE "userId" = ${userId} AND symbol = ${canonicalSymbol} AND "replaySessionId" IS NULL FOR UPDATE
      `;

      const position = await tx.position.findFirst({
        where: {
          userId,
          symbol: canonicalSymbol,
          replaySessionId: null,
        },
      });

      if (!position || position.quantity < qty) {
        const available = position ? position.quantity : 0;
        const err = new Error(
          `Insufficient holdings: Cannot sell ${qty} shares of ${canonicalSymbol}. You hold ${available} shares.`
        );
        err.statusCode = 400;
        throw err;
      }

      const saleProceeds = new Prisma.Decimal(executionPrice.mul(qty).toFixed(2));
      const costBasis = new Prisma.Decimal(position.avgCost.mul(qty).toFixed(2));
      const realizedPnl = saleProceeds.sub(costBasis);

      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          cash: wallet.cash.add(saleProceeds),
        },
      });

      let updatedPosition = null;
      if (position.quantity === qty) {
        await tx.position.delete({
          where: { id: position.id },
        });
      } else {
        updatedPosition = await tx.position.update({
          where: { id: position.id },
          data: {
            quantity: position.quantity - qty,
          },
        });
      }

      const order = await tx.order.create({
        data: {
          userId,
          symbol: canonicalSymbol,
          side: 'SELL',
          type: normalizedType,
          quantity: qty,
          status: 'FILLED',
          replaySessionId: null,
        },
      });

      const trade = await tx.trade.create({
        data: {
          userId,
          orderId: order.id,
          symbol: canonicalSymbol,
          side: 'SELL',
          quantity: qty,
          price: executionPrice,
          realizedPnl,
          replaySessionId: null,
        },
      });

      return {
        success: true,
        message: `Successfully sold ${qty} shares of ${canonicalSymbol} at ₹${executionPrice.toFixed(2)}`,
        order: {
          id: order.id,
          symbol: order.symbol,
          side: order.side,
          type: order.type,
          quantity: order.quantity,
          status: order.status,
          createdAt: order.createdAt,
        },
        trade: {
          id: trade.id,
          price: Number(trade.price),
          quantity: trade.quantity,
          realizedPnl: Number(trade.realizedPnl || 0),
          executedAt: trade.executedAt,
        },
        position: updatedPosition
          ? {
              id: updatedPosition.id,
              symbol: updatedPosition.symbol,
              quantity: updatedPosition.quantity,
              avgCost: Number(updatedPosition.avgCost),
            }
          : null,
        wallet: {
          cash: Number(updatedWallet.cash),
        },
      };
    }
  });
}

export async function getUserOrders({ userId, page = 1, limit = 20 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const [total, orders] = await Promise.all([
    prisma.order.count({
      where: { userId, replaySessionId: null },
    }),
    prisma.order.findMany({
      where: { userId, replaySessionId: null },
      include: { trade: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: l,
    }),
  ]);

  return {
    orders: orders.map((o) => ({
      id: o.id,
      symbol: o.symbol,
      side: o.side,
      type: o.type,
      quantity: o.quantity,
      status: o.status,
      createdAt: o.createdAt,
      trade: o.trade
        ? {
            id: o.trade.id,
            price: Number(o.trade.price),
            quantity: o.trade.quantity,
            realizedPnl: Number(o.trade.realizedPnl || 0),
            executedAt: o.trade.executedAt,
          }
        : null,
    })),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}

export async function getUserTrades({ userId, page = 1, limit = 20 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const [total, trades] = await Promise.all([
    prisma.trade.count({
      where: { userId, replaySessionId: null },
    }),
    prisma.trade.findMany({
      where: { userId, replaySessionId: null },
      include: { order: true },
      orderBy: { executedAt: 'desc' },
      skip,
      take: l,
    }),
  ]);

  return {
    trades: trades.map((t) => ({
      id: t.id,
      orderId: t.orderId,
      symbol: t.symbol,
      side: t.side,
      quantity: t.quantity,
      price: Number(t.price),
      realizedPnl: Number(t.realizedPnl || 0),
      executedAt: t.executedAt,
      orderType: t.order?.type || 'MARKET',
    })),
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages: Math.ceil(total / l) || 1,
    },
  };
}
