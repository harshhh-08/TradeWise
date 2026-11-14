# TradeWise

An institutional-grade educational stock market simulator, market replay engine, and paper-trading platform built with a high-density financial terminal interface.

---

## 1. Project Overview & Features

TradeWise provides an authentic paper-trading and quantitative learning environment designed for students and algorithmic traders:

- **Institutional Financial Terminal**: High-density Obsidian Pro design palette, tabular numerical alignment (`tabular-nums font-mono`), benchmark index ticker strip (NIFTY 50, SENSEX, S&P 500, NASDAQ), and real-time market status indicators.
- **Market Discovery & Analytics**: Real-time price tracking via Yahoo Finance, interactive area and volume charts across multiple intervals (1D, 1W, 1M, 1Y, ALL), and 52-week high/low valuation bars.
- **Paper Trading Engine**: Virtual cash allocation (₹100,000 INR), market order execution (BUY and SELL), live positions tracking, portfolio valuation, and immutable transaction ledger with realized and unrealized P&L.
- **Interactive Learning Center**: 5 structured trading modules (Market Foundations, Exchange Mechanics, Order Types, Diversification, Risk Management) paired with anti-cheat server-graded quizzes, immediate feedback, and progress tracking.
- **Historical Market Replay Simulator**: Candle-by-candle playback of historical NSE market data from Yahoo Finance with step controls, timeline scrubbing, autoplay, virtual trade placement, and session-specific balance tracking.
- **Algorithmic Strategy Backtesting**: Moving Average Crossover (SMA) backtesting engine evaluating historical performance, total returns, win rate, maximum drawdown, and daily equity curves against NSE historical candles.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 19, Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`), CSS Custom Properties
- **Data Visualization**: Recharts 3
- **Animations**: Framer Motion 14
- **Icons**: Lucide React
- **Routing**: React Router 7
- **HTTP Client**: Axios (configured with bearer token interceptors and 401 handling)
- **Toasts**: React Hot Toast

### Backend
- **Runtime**: Node.js 20+ (ES Modules), Express.js 5
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`)
- **Market Data**: `yahoo-finance2`, Twelve Data API
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), Bcrypt password hashing (`bcryptjs`)
- **Concurrency Control**: PostgreSQL pessimistic row-level locking (`SELECT ... FOR UPDATE`)
- **Test Runner**: Native Node.js Test Runner (`node:test`), Strict Assertions (`node:assert/strict`)

---

## 3. Architecture & Financial Engineering Principles

### 3.1. Zero-Client Financial Mutation
All financial calculations, wallet updates, position modifications, and P&L evaluations are computed strictly on the backend. Client components display server-verified numbers and cannot alter account balances via browser storage or client-side simulation.

### 3.2. Concurrency & Double-Spend Prevention
To prevent race conditions during high-frequency order placement, order execution runs inside atomic database transactions (`prisma.$transaction`) with PostgreSQL row-level locks:

- Exclusive write lock on the user's `Wallet` row prevents double-spending across concurrent BUY orders.
- Exclusive write lock on the corresponding `Position` row prevents overselling across concurrent SELL orders.

### 3.3. Exact Decimal Precision
All monetary attributes (`cash`, `price`, `avgCost`, `realizedPnl`, `totalReturn`) are persisted using exact SQL `DECIMAL(18, 2)` or `DECIMAL(18, 4)` types and handled in code via `Prisma.Decimal` to avoid IEEE 754 binary floating-point rounding errors.

### 3.4. Mathematical Models
- **Volume-Weighted Average Cost (VWAC)**:
  $$\text{AvgCost}_{\text{new}} = \frac{(Q_{\text{existing}} \times \text{AvgCost}_{\text{existing}}) + (Q_{\text{new}} \times P_{\text{executed}})}{Q_{\text{existing}} + Q_{\text{new}}}$$
- **Realized P&L**:
  $$\text{Realized PnL} = Q_{\text{sold}} \times (P_{\text{executed}} - \text{AvgCost})$$
- **Unrealized P&L**:
  $$\text{Unrealized PnL} = Q_{\text{held}} \times (P_{\text{market}} - \text{AvgCost})$$
- **SMA Crossover Backtesting**: Signals are evaluated at bar $i$ close and filled on bar $i+1$ open to eliminate lookahead bias.

---

## 4. Entity Relationship (ER) Model

```mermaid
erDiagram
    User ||--o| Wallet : "owns (1:1)"
    User ||--o{ Position : "holds (1:N)"
    User ||--o{ Order : "places (1:N)"
    User ||--o{ Trade : "records (1:N)"
    User ||--o{ QuizResult : "submits (1:N)"
    User ||--o{ ReplaySession : "creates (1:N)"
    User ||--o{ BacktestRun : "executes (1:N)"

    Order ||--o| Trade : "fulfills (1:1)"
    ReplaySession ||--o{ Order : "scopes (0:N)"
    ReplaySession ||--o{ Trade : "scopes (0:N)"
    ReplaySession ||--o{ Position : "scopes (0:N)"

    Lesson ||--o{ Quiz : "contains (1:N)"
    Lesson ||--o{ QuizResult : "tracks (1:N)"

    User {
        Int id PK
        String email UK
        String name
        String passwordHash
        DateTime createdAt
    }

    Wallet {
        Int id PK
        Int userId FK,UK
        Decimal cash
    }

    Position {
        Int id PK
        Int userId FK
        Int replaySessionId FK
        String symbol
        Int quantity
        Decimal avgCost
    }

    Order {
        Int id PK
        Int userId FK
        Int replaySessionId FK
        String symbol
        String side
        String type
        Int quantity
        String status
        DateTime createdAt
    }

    Trade {
        Int id PK
        Int userId FK
        Int orderId FK,UK
        Int replaySessionId FK
        String symbol
        String side
        Int quantity
        Decimal price
        Decimal realizedPnl
        DateTime executedAt
    }

    Candle {
        Int id PK
        String symbol
        String timeframe
        DateTime date
        Decimal open
        Decimal high
        Decimal low
        Decimal close
        BigInt volume
    }

    Lesson {
        Int id PK
        String slug UK
        String title
        Int order
        String content
    }

    Quiz {
        Int id PK
        Int lessonId FK
        String question
        Json options
        Int correctAnswer
        String explanation
    }

    QuizResult {
        Int id PK
        Int userId FK
        Int lessonId FK
        Int score
        Int total
        DateTime createdAt
    }

    ReplaySession {
        Int id PK
        Int userId FK
        String symbol
        String timeframe
        DateTime startDate
        DateTime endDate
        DateTime currentDate
        Int currentIndex
        Int totalCandles
        String status
        DateTime createdAt
    }

    BacktestRun {
        Int id PK
        Int userId FK
        String symbol
        String timeframe
        DateTime startDate
        DateTime endDate
        String strategyType
        Json strategyConfig
        Decimal initialCapital
        Decimal finalCapital
        Decimal totalPnl
        Decimal totalReturn
        Json metrics
        Json trades
        Json equityCurve
        DateTime createdAt
    }
```

---

## 5. Prerequisites & Environment Setup

### Prerequisites
- Node.js v20+ or v22+
- PostgreSQL v14+ running locally or in a container (port 5432)
- npm v10+

### Backend Environment (`backend/.env`)
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/tradewise"
PORT=3000
JWT_SECRET="your-secure-jwt-secret-key-min-32-chars"
JWT_EXPIRES_IN=7d
TWELVE_DATA_API_KEY="your-twelve-data-api-key"
```

### Frontend Environment (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:3000
```

---

## 6. Local Installation & Development Commands

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed_lessons.js
npm run dev
```

The backend server runs on `http://localhost:3000`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend application runs on `http://localhost:5173`.

---

## 7. Automated Testing

The backend includes 33 integration tests using Node's native test runner (`node:test`) and strict assertions:

```bash
cd backend
npm test
```

### Test Suites Covered
- `tests/auth.test.js`: Registration, 100k wallet initialization, duplicate email rejection (409), password hashing, JWT login, session validation.
- `tests/trading.test.js`: USD stock rejection, wallet cash enforcement, BUY order execution, short-selling rejection, partial SELL, trade ledger logging.
- `tests/portfolio.test.js`: Baseline state, live equity synchronization, weighted average cost validation.
- `tests/lessons.test.js`: Curriculum discovery, slug and ID lookup, answer key privacy, server-side grading, progress tracking.
- `tests/backtest.test.js`: Parameter guardrails, SMA crossover simulation, performance metrics, run history, run deletion.

---

## 8. Production Build & Execution

### Production Build
Compile optimized frontend assets:
```bash
cd frontend
npm run build
```

### Production Server Startup
```bash
cd backend
npm ci
npx prisma generate
npx prisma db push
pm2 start src/server.js --name tradewise-backend
```

---

## 9. API Documentation

Detailed endpoint schemas, request parameters, response structures, and error codes are maintained in:

📄 **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

---