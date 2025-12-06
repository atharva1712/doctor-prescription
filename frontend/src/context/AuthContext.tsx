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
    
    // Increase timeout for mobile networks (15 seconds)
    const timeout = 15000;
    
    try {
      // Try doctor profile first
      try {
        const response = await axios.get(`${apiUrl}/doctors/profile/me`, { timeout });
        setUser(response.data);
        setUserType('doctor');
        setLoading(false);
        return;
      } catch (err: any) {
        // If it's a network error, stop immediately
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message?.includes('Network Error') || err.message?.includes('timeout')) {
          console.error('Backend server is not accessible:', err.message);
          setLoading(false);
          logout();
          return;
        }
        // If it's 401/403, token is invalid, try patient or logout
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Token invalid for doctor, try patient
        } else {
          // Other error, stop trying
          console.error('Error verifying doctor token:', err.message);
          setLoading(false);
          logout();
          return;
        }
      }

      // Try patient profile
      try {
        const response = await axios.get(`${apiUrl}/patients/profile/me`, { timeout });
        setUser(response.data);
        setUserType('patient');
        setLoading(false);
        return;
      } catch (err: any) {
        // Any error means token is invalid or server is unreachable
        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message?.includes('Network Error') || err.message?.includes('timeout')) {
          console.error('Backend server is not accessible:', err.message);
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          console.log('Token is invalid or expired');
        } else {
          console.error('Error verifying patient token:', err.message);
        }
        setLoading(false);
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setLoading(false);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      verifyToken();
      
      // Safety timeout: if loading takes more than 20 seconds, force stop
      const safetyTimeout = setTimeout(() => {
        console.warn('Token verification timeout - forcing stop');
        setLoading(false);
        logout();
      }, 20000);
      
      return () => clearTimeout(safetyTimeout);
    } else {
      setLoading(false);
    }
  }, [token, verifyToken, logout]);

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

