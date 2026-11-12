import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './config/prisma.js';
import authRoutes from './routes/auth.routes.js';
import stockRoutes from './routes/stock_routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);

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

app.listen(PORT, () => {
  console.log(`TradeWise backend running on http://localhost:${PORT}`);
});
