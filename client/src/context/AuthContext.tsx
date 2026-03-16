import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import * as api from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, businessName: string, trade: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(api.getStoredUser());
  const [token, setToken] = useState<string | null>(api.getStoredToken());
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  // Validate token on mount
  useEffect(() => {
    async function validateToken() {
      const storedToken = api.getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.getMe();
        setUser(me);
        setToken(storedToken);
        api.storeAuth(storedToken, me);
      } catch {
        // Token invalid — clear everything
        api.clearAuth();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    validateToken();
  }, []);

  const loginFn = useCallback(async (email: string, password: string) => {
    const result = await api.login(email, password);
    api.storeAuth(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const registerFn = useCallback(async (email: string, password: string, businessName: string, trade: string) => {
    const result = await api.register(email, password, businessName, trade);
    api.storeAuth(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    api.clearAuth();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login: loginFn, register: registerFn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
