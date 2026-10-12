import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const getAuthErrorMessage = (err, fallback) => {
  const responseMessage = err?.response?.data?.message;
  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }
  if (err?.request) {
    return 'Cannot connect to the server. Check that the backend is running and the frontend API URL is configured.';
  }
  return fallback;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (!sessionStorage.getItem('ecommerce_access_token')) {
      localStorage.removeItem('ecommerce_user');
      return null;
    }
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
      const { accessToken, ...userData } = response.data;
      if (!accessToken) {
        throw new Error('The server did not return an access token.');
      }
      sessionStorage.setItem('ecommerce_access_token', accessToken);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Login failed. Please check your credentials.');
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password);
      const { accessToken, ...userData } = response.data;
      if (!accessToken) {
        throw new Error('The server did not return an access token.');
      }
      sessionStorage.setItem('ecommerce_access_token', accessToken);
      setUser(userData);
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Registration failed. Please check your details and try again.');
      setError(message);
      setLoading(false);
      return { success: false, message };
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ecommerce_access_token');
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
