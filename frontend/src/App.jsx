import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { ProtectedRoute } from '@/components/features/ProtectedRoute';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Markets from '@/pages/Markets';
import StockDetail from '@/pages/StockDetail';
import Portfolio from '@/pages/Portfolio';
import Trade from '@/pages/Trade';
import Learn from '@/pages/Learn';
import LessonDetail from '@/pages/LessonDetail';
import Replay from '@/pages/Replay';
import Backtest from '@/pages/Backtest';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-bg-raised-val)',
              color: 'var(--color-text-primary-val)',
              border: '1px solid var(--color-border-val)',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'Inter, system-ui, sans-serif',
              boxShadow: 'var(--shadow-md-val)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'var(--color-bg-raised-val)',
              },
            },
            error: {
              iconTheme: {
                primary: '#f43f5e',
                secondary: 'var(--color-bg-raised-val)',
              },
            },
          }}
        />

        <Routes>
          {/* Public Landing */}
          <Route path="/" element={<Landing />} />

          {/* Public Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Authenticated / App Shell routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/stocks/:symbol" element={<StockDetail />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/learn/:slug" element={<LessonDetail />} />
            <Route path="/replay" element={<Replay />} />
            <Route path="/backtest" element={<Backtest />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
