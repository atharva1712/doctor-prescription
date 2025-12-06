import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  userType?: 'doctor' | 'patient';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, userType }) => {
  const { user, userType: currentUserType, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    if (userType === 'doctor') {
      return <Navigate to="/doctor/signin" replace />;
    }
    return <Navigate to="/patient/signin" replace />;
  }

  if (userType && currentUserType !== userType) {
    if (currentUserType === 'doctor') {
      return <Navigate to="/doctor/profile" replace />;
    }
    return <Navigate to="/patient/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

