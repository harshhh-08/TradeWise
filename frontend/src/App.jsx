import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';

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
      <Routes>
        {/* Public Landing */}
        <Route path="/" element={<Landing />} />

        {/* Public Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Authenticated / App Shell routes */}
        <Route element={<AppShell />}>
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
    </BrowserRouter>
  );
}
