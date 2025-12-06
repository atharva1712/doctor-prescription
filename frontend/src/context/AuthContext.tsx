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
    try {
      try {
        const response = await axios.get(`${apiUrl}/doctors/profile/me`, { timeout: 5000 });
        setUser(response.data);
        setUserType('doctor');
        setLoading(false);
        return;
      } catch (err: any) {
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          console.error('Backend server is not running or not accessible');
          setLoading(false);
          logout();
          return;
        }
      }

      try {
        const response = await axios.get(`${apiUrl}/patients/profile/me`, { timeout: 5000 });
        setUser(response.data);
        setUserType('patient');
        setLoading(false);
        return;
      } catch (err: any) {
        if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
          console.error('Backend server is not running or not accessible');
        }
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
    } else {
      setLoading(false);
    }
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

