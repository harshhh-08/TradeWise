import { BrowserRouter, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-4 px-6">
      <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
        TradeWise
      </h1>
      <p className="text-lg text-[var(--color-text-muted)]">
        Your educational stock-market learning and paper-trading platform.
      </p>
      <div className="flex gap-3 mt-4">
        <a
          href="/register"
          className="px-6 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-brand)] text-[var(--color-brand-text)] font-medium hover:bg-[var(--color-brand-hover)] transition-colors"
        >
          Get Started
        </a>
        <a
          href="/login"
          className="px-6 py-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium hover:bg-[var(--color-bg-raised)] transition-colors"
        >
          Login
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
