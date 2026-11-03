# TradeWise

An educational stock-market learning and paper-trading platform.

## Technology Stack

| Layer          | Technology                |
| -------------- | ------------------------- |
| Frontend       | React + Vite              |
| Backend        | Node.js + Express.js      |
| Database       | PostgreSQL                |
| ORM            | Prisma 7                  |
| Auth (planned) | JWT + bcrypt              |
| Routing        | React Router              |
| HTTP Client    | Axios                     |

## Data Model

- `User`: Platform user account with email credentials, profile information, wallet, and trading/learning relations.
- `Wallet`: Paper-trading cash balance linked one-to-one with a User.
- `Candle`: Historical/daily OHLCV stock market price records indexed by symbol and date.
- `ReplaySession`: Historical market simulation/replay session with independent cash and timeline.
- `Position`: Stock holdings and average cost basis for live paper trading or replay sessions.
- `Order`: Buy/sell order submissions with status, quantity, and market/limit type.
- `Trade`: Executed fill record for an order with execution price and realized PnL.
- `Lesson`: Educational learning unit with ordering, title, slug, and markdown content.
- `QuizResult`: User performance score and question count for completed lesson quizzes.

## Folder Structure

```text
TradeWise/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── prisma7.config.js
│
├── .gitignore
└── README.md
```

## Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (running locally on port 5432)

### 1. Database Setup

Ensure PostgreSQL is running, then create the `tradewise` database:

```bash
createdb tradewise
# or via psql:
# CREATE DATABASE tradewise;
```

### 2. Environment Configuration

Copy the example environment files for both backend and frontend:

```bash
# In backend/
cp backend/.env.example backend/.env

# In frontend/
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your PostgreSQL username, password, and port:

```env
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/tradewise?schema=public"
PORT=5001
```

### 3. Install Dependencies

Install packages in both directories:

```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Run Database Migrations

Apply the initial Prisma schema migration to your local PostgreSQL database:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Running the Application

Start the backend server:

```bash
cd backend
npm run dev
```

Backend will run at: `http://localhost:5001`

Verify the backend and database health check:
- **Health check URL**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- Returns: `{"status":"ok","message":"Server is running and database is connected", ...}`

Start the frontend development server:

```bash
cd frontend
npm run dev
```

Frontend will run at: `http://localhost:5173`
