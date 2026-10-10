import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ecommerce_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('ecommerce_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ecommerce_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const userData = response.data;
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  const register = async (name, email, password, role = 'USER') => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password, role);
      const userData = response.data;
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Email might already exist.';
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ecommerce_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        error,
        login,
        register,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
