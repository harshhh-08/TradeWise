import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#131620',
              color: '#f1f3f9',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            success: {
              iconTheme: {
                primary: '#34d399',
                secondary: '#0c0e14',
              },
            },
            error: {
              iconTheme: {
                primary: '#f87171',
                secondary: '#0c0e14',
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
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
