import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('tradewise_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tradewise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [wallet, setWallet] = useState(() => {
    const saved = localStorage.getItem('tradewise_wallet');
    return saved ? JSON.parse(saved) : { cash: 100000 };
  });
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('tradewise_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/api/auth/me');
      if (res.data?.success && res.data.user) {
        setUser(res.data.user);
        localStorage.setItem('tradewise_user', JSON.stringify(res.data.user));
        if (res.data.user.wallet) {
          const w = { cash: parseFloat(res.data.user.wallet.cash) || 100000 };
          setWallet(w);
          localStorage.setItem('tradewise_wallet', JSON.stringify(w));
        }
      }
    } catch (err) {
      console.warn('Could not refresh session:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data?.token) {
        const receivedToken = res.data.token;
        const receivedUser = res.data.user;

        localStorage.setItem('tradewise_token', receivedToken);
        localStorage.setItem('tradewise_user', JSON.stringify(receivedUser));
        setToken(receivedToken);
        setUser(receivedUser);

        // Fetch wallet details
        try {
          const meRes = await api.get('/api/auth/me', {
            headers: { Authorization: `Bearer ${receivedToken}` },
          });
          if (meRes.data?.user?.wallet) {
            const w = { cash: parseFloat(meRes.data.user.wallet.cash) || 100000 };
            setWallet(w);
            localStorage.setItem('tradewise_wallet', JSON.stringify(w));
          }
        } catch (_) {}

        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      if (res.data?.success) {
        // Auto-login right after registration
        return await login(email, password);
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('tradewise_token');
    localStorage.removeItem('tradewise_user');
    localStorage.removeItem('tradewise_wallet');
    setToken(null);
    setUser(null);
    setWallet({ cash: 100000 });
  };

  const updateWalletCash = (newCash) => {
    const updated = { cash: Number(newCash) };
    setWallet(updated);
    localStorage.setItem('tradewise_wallet', JSON.stringify(updated));
  };

  const value = {
    user,
    token,
    wallet,
    walletBalance: wallet?.cash ?? 100000,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    register,
    logout,
    refreshUser,
    updateWalletCash,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

