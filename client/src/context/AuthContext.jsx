import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api/v1';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jl_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('jl_token') || null);
  const [loading, setLoading] = useState(false);

  // Persist to localStorage whenever user/token changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('jl_user', JSON.stringify(user));
      localStorage.setItem('jl_token', token);
    } else {
      localStorage.removeItem('jl_user');
      localStorage.removeItem('jl_token');
    }
  }, [user, token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || 'Invalid credentials');
      }

      const { accessToken, ...userData } = data.data;
      setUser(userData);
      setToken(accessToken);
      return userData; // returns { _id, name, email, role }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch { /* silent */ }
    setUser(null);
    setToken(null);
  }, []);

  // Returns auth header object for API calls
  const authHeader = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const isRole = useCallback((...roles) => {
    return user && roles.includes(user.role);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authHeader, isRole }}>
      {children}
    </AuthContext.Provider>
  );
};
