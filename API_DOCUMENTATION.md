# TradeWise Backend API Documentation

Complete API specification and developer reference for the TradeWise backend engine.

---

## 1. System Setup & Environment

### Prerequisites
- Node.js (v20+ or v22+)
- PostgreSQL (v14+)
- npm

### Installation
```bash
cd backend
npm install
```

### Environment Variables (.env)
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/tradewise?schema=public
JWT_SECRET=<your_secure_jwt_secret>
JWT_EXPIRES_IN=7d
TWELVE_DATA_API_KEY=<optional_twelve_data_key>
```

### Database Migration & Seed
```bash
npx prisma db push
node prisma/seed_lessons.js
```

### Running the Server
```bash
npm run dev
npm start
```

---

## 2. Authentication APIs

Base path: `/api/auth`

### 2.1 Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `201 Created`: User registered and wallet initialized with ₹100,000.
    ```json
    {
      "success": true,
      "message": "User registered successfully",
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-11-13T06:00:00.000Z",
        "wallet": {
          "id": 1,
          "cash": "100000.00"
        }
      }
    }
    ```
  - `400 Bad Request`: Validation failure (name/email/password missing or password < 8 chars).
  - `409 Conflict`: Email already registered.

### 2.2 Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    }
    ```
  - `401 Unauthorized`: Invalid credentials.

### 2.3 Current User Profile
- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Auth Required:** Yes (`Bearer <token>`)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "user": {
        "id": 1,
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-11-13T06:00:00.000Z",
        "wallet": {
          "id": 1,
          "cash": "100000.00"
        }
      }
    }
    ```
  - `401 Unauthorized`: Missing or invalid token.

---

## 3. Market Data APIs

Base path: `/api/stocks`

### 3.1 List Stocks
- **Method:** `GET`
- **URL:** `/api/stocks`
- **Auth Required:** No
- **Query Parameters:**
  - `search` (optional): Filter by ticker symbol or company name.
  - `page` (optional, default: 1): Page number.
  - `limit` (optional, default: 20): Items per page.
- **Response:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "source": "multiprovider",
      "stocks": [
        {
          "symbol": "RELIANCE.NS",
          "name": "Reliance Industries Ltd",
          "exchange": "NSE",
          "currency": "INR",
          "type": "Common Stock"
        }
      ],
      "pagination": { "page": 1, "limit": 20, "total": 15, "totalPages": 1 }
    }
    ```

### 3.2 Stock Details & Quote
- **Method:** `GET`
- **URL:** `/api/stocks/:symbol`
- **Auth Required:** No
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "stock": {
        "source": "yahoo-finance",
        "symbol": "RELIANCE.NS",
        "name": "Reliance Industries Limited",
        "exchange": "NSE",
        "currency": "INR",
        "price": 1340.2,
        "open": 1335.0,
        "high": 1345.5,
        "low": 1330.0,
        "previousClose": 1338.0,
        "change": 2.2,
        "changePercent": 0.16,
        "volume": 6542100,
        "timestamp": "2026-11-13T06:00:00.000Z"
      }
    }
    ```
  - `404 Not Found`: Symbol not found.

### 3.3 Historical Candles
- **Method:** `GET`
- **URL:** `/api/stocks/:symbol/candles`
- **Auth Required:** No
- **Query Parameters:**
  - `start_date` (optional): Filter start date (`YYYY-MM-DD`).
  - `end_date` (optional): Filter end date (`YYYY-MM-DD`).
  - `timeframe` (optional, default: `'1day'`): `'1min'`, `'5min'`, `'15min'`, `'30min'`, `'1h'`, `'4h'`, `'1day'`, `'1D'`, `'1week'`, `'1month'`.
  - `limit` (optional, default: 30): Max candles to return.
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "source": "database",
      "symbol": "RELIANCE.NS",
      "count": 30,
      "candles": [
        {
          "date": "2026-10-01T00:00:00.000Z",
          "open": 1320.0,
          "high": 1335.0,
          "low": 1315.0,
          "close": 1330.0,
          "volume": 5214000
        }
      ]
    }
    ```

---

## 4. Paper Trading APIs

Base paths: `/api/orders`, `/api/trades`, `/api/portfolio`

### 4.1 Place Order
- **Method:** `POST`
- **URL:** `/api/orders`
- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "symbol": "RELIANCE.NS",
    "side": "BUY",
    "quantity": 2,
    "type": "MARKET"
  }
  ```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "message": "Successfully purchased 2 shares of RELIANCE.NS at ₹1340.20",
      "order": {
        "id": 1,
        "symbol": "RELIANCE.NS",
        "side": "BUY",
        "type": "MARKET",
        "quantity": 2,
        "status": "FILLED",
        "createdAt": "2026-11-13T06:10:00.000Z"
      },
      "trade": {
        "id": 1,
        "price": 1340.2,
        "quantity": 2,
        "realizedPnl": 0,
        "executedAt": "2026-11-13T06:10:00.000Z"
      },
      "position": {
        "id": 1,
        "symbol": "RELIANCE.NS",
        "quantity": 2,
        "avgCost": 1340.2
      },
      "wallet": {
        "cash": 97319.6
      }
    }
    ```
  - `400 Bad Request`:
    - Currency check: Non-INR stocks rejected.
    - Order type: `LIMIT` rejected with message to use `MARKET`.
    - Insufficient funds or insufficient holdings.

### 4.2 List Orders
- **Method:** `GET`
- **URL:** `/api/orders`
- **Auth Required:** Yes (`Bearer <token>`)
- **Query Parameters:** `page`, `limit`.

### 4.3 List Trades
- **Method:** `GET`
- **URL:** `/api/trades`
- **Auth Required:** Yes (`Bearer <token>`)
- **Query Parameters:** `page`, `limit`.

### 4.4 Get Portfolio
- **Method:** `GET`
- **URL:** `/api/portfolio`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "portfolio": {
        "currency": "INR",
        "availableCash": 97319.6,
        "totalInvestedValue": 2680.4,
        "totalStockValue": 2680.4,
        "totalPortfolioValue": 100000.0,
        "totalUnrealizedPnl": 0.0,
        "totalUnrealizedPnlPercent": 0.0,
        "totalRealizedPnl": 0.0,
        "holdingsCount": 1,
        "holdings": [
          {
            "id": 1,
            "symbol": "RELIANCE.NS",
            "name": "Reliance Industries Limited",
            "currency": "INR",
            "quantity": 2,
            "avgCost": 1340.2,
            "investedValue": 2680.4,
            "currentPrice": 1340.2,
            "currentMarketValue": 2680.4,
            "unrealizedPnl": 0.0,
            "unrealizedPnlPercent": 0.0,
            "isPriceLive": true
          }
        ]
      }
    }
    ```

---

## 5. Lessons & Quizzes APIs

Base path: `/api/lessons`

### 5.1 List Lessons
- **Method:** `GET`
- **URL:** `/api/lessons`
- **Auth Required:** No
- **Query Parameters:** `page`, `limit`.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "lessons": [
      {
        "id": 1,
        "slug": "introduction-to-the-stock-market",
        "title": "Introduction to the Stock Market",
        "order": 1,
        "quizCount": 5
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "totalPages": 1 }
  }
  ```

### 5.2 Get User Progress
- **Method:** `GET`
- **URL:** `/api/lessons/progress`
- **Auth Required:** Yes (`Bearer <token>`)

### 5.3 Quiz Results History
- **Method:** `GET`
- **URL:** `/api/lessons/quiz-results`
- **Auth Required:** Yes (`Bearer <token>`)

### 5.4 Get Lesson Content
- **Method:** `GET`
- **URL:** `/api/lessons/:lessonId`
- **Auth Required:** No

### 5.5 Get Lesson Quiz Questions
- **Method:** `GET`
- **URL:** `/api/lessons/:lessonId/quiz`
- **Auth Required:** No
- **Response (200 OK):** Questions and options only (never exposes answers).

### 5.6 Submit Quiz Answers
- **Method:** `POST`
- **URL:** `/api/lessons/:lessonId/quiz/submit`
- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "answers": [
      { "questionId": "1", "selectedOption": "1" },
      { "questionId": "2", "selectedOption": "2" },
      { "questionId": "3", "selectedOption": "1" },
      { "questionId": "4", "selectedOption": "1" },
      { "questionId": "5", "selectedOption": "2" }
    ]
  }
  ```
- **Response (201 Created):** Server-calculated score, percentage, and explanations.

---

## 6. Historical Market Replay APIs

Base path: `/api/replay`

### 6.1 Create Replay Session
- **Method:** `POST`
- **URL:** `/api/replay/sessions`
- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "symbol": "RELIANCE",
    "timeframe": "1d",
    "startDate": "2025-01-01",
    "endDate": "2025-01-31"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "session": {
      "id": 1,
      "symbol": "RELIANCE.NS",
      "timeframe": "1D",
      "startDate": "2025-01-01T00:00:00.000Z",
      "endDate": "2025-01-31T00:00:00.000Z",
      "currentDate": "2025-01-01T00:00:00.000Z",
      "currentIndex": 0,
      "totalCandles": 22,
      "status": "INITIALIZED",
      "createdAt": "2026-11-13T06:00:00.000Z"
    }
  }
  ```

### 6.2 List Replay Sessions
- **Method:** `GET`
- **URL:** `/api/replay/sessions`
- **Auth Required:** Yes (`Bearer <token>`)

### 6.3 Get Session Details
- **Method:** `GET`
- **URL:** `/api/replay/sessions/:sessionId`
- **Auth Required:** Yes (`Bearer <token>`)

### 6.4 Start Replay Session
- **Method:** `POST`
- **URL:** `/api/replay/sessions/:sessionId/start`
- **Auth Required:** Yes (`Bearer <token>`)

### 6.5 Advance Replay (Next Candle)
- **Method:** `POST`
- **URL:** `/api/replay/sessions/:sessionId/next`
- **Auth Required:** Yes (`Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "candle": {
      "timestamp": "2025-01-02T03:45:00.000Z",
      "open": 1238.5,
      "high": 1251.2,
      "low": 1234.1,
      "close": 1247.8,
      "volume": 7824190
    },
    "replay": {
      "sessionId": 1,
      "currentIndex": 2,
      "totalCandles": 22,
      "status": "RUNNING",
      "hasNext": true
    }
  }
  ```

### 6.6 Pause Replay Session
- **Method:** `POST`
- **URL:** `/api/replay/sessions/:sessionId/pause`
- **Auth Required:** Yes (`Bearer <token>`)

### 6.7 Get Revealed Candles
- **Method:** `GET`
- **URL:** `/api/replay/sessions/:sessionId/candles`
- **Auth Required:** Yes (`Bearer <token>`)

### 6.8 Complete Replay Session
- **Method:** `POST`
- **URL:** `/api/replay/sessions/:sessionId/complete`
- **Auth Required:** Yes (`Bearer <token>`)

---

## 7. Strategy Backtesting APIs

Base path: `/api/backtests`

### 7.1 Execute Backtest
- **Method:** `POST`
- **URL:** `/api/backtests`
- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "symbol": "RELIANCE",
    "timeframe": "1D",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "strategy": {
      "type": "SMA_CROSSOVER",
      "fastPeriod": 10,
      "slowPeriod": 30
    },
    "initialCapital": 100000
  }
  ```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "success": true,
      "backtest": {
        "id": 1,
        "symbol": "RELIANCE.NS",
        "timeframe": "1D",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-12-31T00:00:00.000Z",
        "strategy": {
          "type": "SMA_CROSSOVER",
          "fastPeriod": 10,
          "slowPeriod": 30
        },
        "metrics": {
          "initialCapital": 100000,
          "finalPortfolioValue": 108420.5,
          "totalPnl": 8420.5,
          "totalReturnPercent": 8.42,
          "totalTrades": 6,
          "winningTrades": 4,
          "losingTrades": 2,
          "winRate": 66.67,
          "maxDrawdownPercent": 5.4,
          "buyAndHoldReturnPercent": 14.2,
          "unrealizedPosition": null
        },
        "trades": [
          {
            "tradeNumber": 1,
            "entryDate": "2024-02-15T00:00:00.000Z",
            "entryPrice": 1250.0,
            "exitDate": "2024-04-10T00:00:00.000Z",
            "exitPrice": 1320.0,
            "quantity": 80,
            "pnl": 5600.0,
            "returnPercent": 5.6
          }
        ],
        "equityCurve": [
          {
            "date": "2024-01-01T00:00:00.000Z",
            "portfolioValue": 100000.0,
            "cash": 100000.0,
            "positionValue": 0.0
          }
        ],
        "createdAt": "2026-11-13T06:20:00.000Z"
      }
    }
    ```
  - `400 Bad Request`: Validation failure (fastPeriod >= slowPeriod, non-positive capital, insufficient candles, or invalid symbol/dates).

### 7.2 List User Backtests
- **Method:** `GET`
- **URL:** `/api/backtests`
- **Auth Required:** Yes (`Bearer <token>`)
- **Query Parameters:** `page`, `limit`.

### 7.3 Get Backtest by ID
- **Method:** `GET`
- **URL:** `/api/backtests/:backtestId`
- **Auth Required:** Yes (`Bearer <token>`)

### 7.4 Delete Backtest
- **Method:** `DELETE`
- **URL:** `/api/backtests/:backtestId`
- **Auth Required:** Yes (`Bearer <token>`)
- **Responses:**
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "Backtest deleted successfully",
      "id": 1,
      "deleted": true
    }
    ```
  - `404 Not Found`: Backtest not found or owned by another user.
