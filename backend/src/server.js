import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './config/prisma.js';
import authRoutes from './routes/auth.routes.js';
import stockRoutes from './routes/stock_routes.js';
import orderRoutes from './routes/order_routes.js';
import tradeRoutes from './routes/trade_routes.js';
import portfolioRoutes from './routes/portfolio_routes.js';
import lessonRoutes from './routes/lesson_routes.js';
import replayRoutes from './routes/replay_routes.js';
import backtestRoutes from './routes/backtest_routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
]
  .filter(Boolean)
  .flatMap((url) => url.split(',').map((u) => u.trim().replace(/\/$/, '')));

const isDevelopment = process.env.NODE_ENV !== 'production';

const developmentOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const allowedOrigins = [
  ...configuredOrigins,
  ...(isDevelopment ? developmentOrigins : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (isDevelopment && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/replay', replayRoutes);
app.use('/api/backtests', backtestRoutes);

app.get('/health', (req, res) => res.redirect('/api/health'));

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      message: 'Server is running and database is connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Server is running but database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  if (err.message && err.message.includes('CORS')) {
    statusCode = 403;
  }
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500 ? 'Internal Server Error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`TradeWise backend running on http://localhost:${PORT}`);
  });
}

export default app;
export { app };
