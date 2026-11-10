# TradeWise — Project Scope

**Project type:** Educational stock-market learning and paper-trading platform  
**Document owner:** Entrepreneurship (E)  
**Status:** Day 1 draft for team review  
**Technology stack:** React (Vite), FastAPI, SQLite (SQLAlchemy), pandas, TradingView Lightweight Charts, pytest

## 1. Project overview

TradeWise is an educational stock-market learning and paper-trading platform designed to help students and beginners understand how stock-market trading works in a simulated environment. Users can learn core market concepts, practice placing virtual trades, explore historical market movements through replay, and evaluate rule-based strategies using backtesting.

The platform is intended for learning and practice. It does not execute real-money trades or provide personalized investment advice.

## 2. Problem statement

Students and beginner traders may be interested in the stock market but lack a safe, practical environment in which to learn order execution, portfolio management, market behaviour and risk management. Learning only through theory can make it difficult to understand how decisions affect a portfolio. Trading with real money while inexperienced can expose learners to avoidable financial risk.

TradeWise addresses this learning gap by combining structured educational lessons with simulated trading, historical replay and strategy backtesting.

## 3. Objectives

- Explain foundational stock-market concepts in accessible language.
- Provide a simulated environment to practice buying and selling stocks.
- Help learners understand portfolio value, holdings and profit/loss.
- Allow learners to explore historical price movements through replay.
- Introduce rule-based strategy testing using historical data.
- Reinforce learning through quizzes and progress tracking.

## 4. Target users

### Primary users
- College students exploring financial markets.
- Beginners learning stock-market terminology and trading mechanics.
- Aspiring traders who want a practice environment before considering real-money activity.

### User needs
- Simple explanations of market concepts.
- A clear and safe way to practice trades using virtual money.
- Understandable portfolio and performance summaries.
- A way to learn from historical market data.
- Short quizzes and visible learning progress.

## 5. Scope: must-have features

1. **User registration and login** — account access for each learner.
2. **Stock list and historical prices** — browse supported stocks and their available price history.
3. **Paper trading** — simulated buy/sell orders using virtual funds.
4. **Portfolio and trade history** — view holdings, values and trade records.
5. **Historical market replay** — reveal historical data step by step for practice.
6. **Strategy backtesting** — run supported rule-based strategies on historical data and view results.
7. **Lessons and quizzes** — educational material, MCQs, explanations and scores.
8. **Learning progress** — track completed lessons and quiz performance.

## 6. Nice-to-have features

- Leaderboard ranked by simulated portfolio return.
- Watchlist customization.
- Limit orders, if core functionality is stable.
- Strategy comparison.
- Additional strategies and indicators.
- Expanded lesson library and more quizzes.
- Live market data or broker integration (future scope only; not part of the current simulated MVP).

## 7. Product boundaries and assumptions

- The platform is for education and simulation, not live brokerage.
- The starting virtual wallet is ₹10,00,000, as specified in the team task plan.
- The initial universe is planned as 25 Indian listed stocks, subject to confirmation with the Applied Maths (M) teammate.
- The task plan specifies historical daily OHLCV data, with no fees or slippage assumptions noted for the backtest methodology to be documented by M.
- Data availability, API behaviour and final feature scope depend on integration with A and M.
- No claim of investment returns or trading accuracy should be made.

## 8. User journey

1. Register or log in.
2. Open the dashboard and review virtual cash and learning progress.
3. Complete a lesson about markets, orders or risk.
4. Take the associated quiz and review explanations.
5. Select a stock and place a simulated trade.
6. Review holdings and trade history in the portfolio.
7. Use replay to practice decisions against historical prices.
8. Run a backtest using a supported strategy and inspect its metrics.
9. Review learning progress and continue practicing.

## 9. Day 1 screen inventory

1. Login / Register
2. Dashboard
3. Trade
4. Portfolio
5. Market Replay
6. Backtesting
7. Lessons & Quizzes

See `wireframes/` for low-fidelity screen references. These are design references for recreating or refining in Figma, not exported native Figma files.

## 10. Team dependencies

- **A — App Development:** authentication, API endpoints, trading, portfolio, replay, quiz submission and progress endpoint; frontend integration and routing.
- **M — Applied Maths:** stock data, indicators, backtesting, strategy logic, replay engine and verification.
- **E — Entrepreneurship:** scope, user journey, educational content, quizzes, lessons UI, progress UI, user testing, report, presentation and demo preparation.

## 11. Six problem-statement deliverables

The Day 1 task sheet asks E to identify six deliverables from the original problem statement, but the original problem statement / rubric was not included in the supplied task sheet. This section must be reconciled against the official problem statement before submission; do not treat the feature list above as a confirmed six-item rubric.

## 12. Success criteria for the project

- A learner can register and access the platform.
- A learner can access the educational lessons and complete quizzes.
- A learner can place simulated trades without using real money.
- Portfolio and trade history reflect simulated activity.
- Replay reveals historical data step by step without exposing future data.
- Backtesting returns the agreed metrics, equity curve and trades.
- The team can demonstrate the end-to-end learning and practice journey.
