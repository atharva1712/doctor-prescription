import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  userType: 'doctor' | 'patient' | null;
  token: string | null;
  login: (userData: User, type: 'doctor' | 'patient', authToken: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'doctor' | 'patient' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const logout = useCallback(() => {
    setUser(null);
    setUserType(null);
    setToken(null);
    setLoading(false);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const verifyToken = useCallback(async () => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    // Validate API URL
    if (!apiUrl || apiUrl.trim() === '') {
      console.error('⚠️ ERROR: REACT_APP_API_URL is not set!');
      console.error('⚠️ Set REACT_APP_API_URL in Railway environment variables');
      setLoading(false);
      return;
    }
    
    // Log API URL in production to help debug
    console.log('API URL:', apiUrl);
    if (process.env.NODE_ENV === 'production' && apiUrl.includes('localhost')) {
      console.error('⚠️ WARNING: API URL is localhost in production!');
      console.error('⚠️ Set REACT_APP_API_URL in Railway environment variables');
      setLoading(false);
      return;
    }
    
    // Increase timeout for mobile networks (20 seconds)
    const timeout = 20000;
    
    try {
      try {
        const response = await axios.get(`${apiUrl}/doctors/profile/me`, { timeout });
        setUser(response.data);
        setUserType('doctor');
        setLoading(false);
        return;
      } catch (err: any) {
        // If it's a 401, token is invalid - continue to check patient
        // If it's a 403, user might be a patient, not a doctor - continue to check patient
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Continue to try patient endpoint - this is expected if user is a patient
          console.log('Doctor endpoint returned', err.response?.status, '- trying patient endpoint');
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message?.includes('Network Error') || err.message?.includes('timeout')) {
          // Network error or timeout - clear loading and logout
          console.error('Network error or timeout:', err.message);
          setLoading(false);
          logout();
          return;
        } else {
          // Other error - continue to try patient endpoint
          console.log('Doctor endpoint error:', err.response?.status || err.message, '- trying patient endpoint');
        }
      }

      try {
        const response = await axios.get(`${apiUrl}/patients/profile/me`, { timeout });
        setUser(response.data);
        setUserType('patient');
        setLoading(false);
        return;
      } catch (err: any) {
        // If 401, token is invalid - logout
        // If 403, user might be a doctor trying patient endpoint - but we already tried doctor, so logout
        if (err.response?.status === 401) {
          console.log('Patient endpoint returned 401 - token invalid, logging out');
          setLoading(false);
          logout();
          return;
        } else if (err.response?.status === 403) {
          // Both doctor and patient endpoints returned 403 - token might be invalid or user doesn't exist
          console.log('Both endpoints returned 403 - logging out');
          setLoading(false);
          logout();
          return;
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message?.includes('Network Error') || err.message?.includes('timeout')) {
          console.error('Network error or timeout:', err.message);
          setLoading(false);
          logout();
          return;
        } else {
          // Other error - logout anyway
          console.log('Patient endpoint error:', err.response?.status || err.message, '- logging out');
          setLoading(false);
          logout();
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setLoading(false);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    // Safety timeout - ensure loading never stays true forever
    let safetyTimeout: NodeJS.Timeout;
    
    // Check if token exists and is not empty
    if (token && token.trim() !== '') {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
      
      // Set safety timeout only when verifying token
      safetyTimeout = setTimeout(() => {
        if (loading) {
          console.warn('Token verification timeout - clearing loading state');
          setLoading(false);
          logout();
        }
      }, 30000); // 30 second safety timeout
    } else {
      // No token - clear loading immediately
      setLoading(false);
    }

    return () => {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
    };
  }, [token, verifyToken, loading, logout]);

  const login = (userData: User, type: 'doctor' | 'patient', authToken: string) => {
    setUser(userData);
    setUserType(type);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const value = {
    user,
    userType,
    token,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

