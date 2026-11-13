-- CreateTable
CREATE TABLE "BacktestRun" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL DEFAULT '1D',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "strategyType" TEXT NOT NULL DEFAULT 'SMA_CROSSOVER',
    "strategyConfig" JSONB NOT NULL,
    "initialCapital" DECIMAL(18,2) NOT NULL,
    "finalCapital" DECIMAL(18,2) NOT NULL,
    "totalPnl" DECIMAL(18,2) NOT NULL,
    "totalReturn" DECIMAL(18,4) NOT NULL,
    "metrics" JSONB NOT NULL,
    "trades" JSONB NOT NULL,
    "equityCurve" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacktestRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BacktestRun_userId_createdAt_idx" ON "BacktestRun"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "BacktestRun" ADD CONSTRAINT "BacktestRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
