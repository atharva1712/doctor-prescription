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
    
    // Log API URL in production to help debug
    if (process.env.NODE_ENV === 'production') {
      console.log('API URL:', apiUrl);
      if (apiUrl.includes('localhost')) {
        console.error('⚠️ WARNING: API URL is localhost in production!');
        console.error('⚠️ Set REACT_APP_API_URL in Railway environment variables');
        setLoading(false);
        return;
      }
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
        // If it's a 401/403, token is invalid - continue to check patient
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Continue to try patient endpoint
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message?.includes('Network Error') || err.message?.includes('timeout')) {
          // Network error or timeout - clear loading and logout
          console.error('Network error or timeout:', err.message);
          setLoading(false);
          logout();
          return;
        } else {
          // Other error - continue to try patient endpoint
        }
      }

      try {
        const response = await axios.get(`${apiUrl}/patients/profile/me`, { timeout });
        setUser(response.data);
        setUserType('patient');
        setLoading(false);
        return;
      } catch (err: any) {
        // If 401/403, token is invalid - logout
        if (err.response?.status === 401 || err.response?.status === 403) {
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
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
      
      // Set safety timeout only when verifying token
      safetyTimeout = setTimeout(() => {
        setLoading(false);
        console.warn('Token verification timeout - clearing loading state');
      }, 30000); // 30 second safety timeout
    } else {
      setLoading(false);
    }

    return () => {
      if (safetyTimeout) {
        clearTimeout(safetyTimeout);
      }
    };
  }, [token, verifyToken]);

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

