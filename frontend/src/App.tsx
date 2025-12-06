import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import DoctorSignUp from './pages/auth/DoctorSignUp';
import DoctorSignIn from './pages/auth/DoctorSignIn';
import PatientSignUp from './pages/auth/PatientSignUp';
import PatientSignIn from './pages/auth/PatientSignIn';
import DoctorProfile from './pages/doctor/DoctorProfile';
import PrescriptionPage from './pages/doctor/PrescriptionPage';
import PrescriptionForm from './pages/doctor/PrescriptionForm';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorsList from './pages/patient/DoctorsList';
import ConsultationForm from './pages/patient/ConsultationForm';
import PatientConsultations from './pages/patient/PatientConsultations';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App(): JSX.Element {
  // Show API URL in console for debugging
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    console.log('App loaded. API URL:', apiUrl);
    console.log('Environment:', process.env.NODE_ENV);
    
    if (process.env.NODE_ENV === 'production' && apiUrl.includes('localhost')) {
      console.error('❌ CRITICAL: API URL is set to localhost in production!');
      console.error('❌ The app will not work. Set REACT_APP_API_URL in Railway.');
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/doctor/signup" element={<DoctorSignUp />} />
            <Route path="/doctor/signin" element={<DoctorSignIn />} />
            <Route path="/patient/signup" element={<PatientSignUp />} />
            <Route path="/patient/signin" element={<PatientSignIn />} />
            <Route path="/doctor/profile" element={<ProtectedRoute userType="doctor"><DoctorProfile /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute userType="doctor"><PrescriptionPage /></ProtectedRoute>} />
            <Route path="/doctor/prescription/:consultationId" element={<ProtectedRoute userType="doctor"><PrescriptionForm /></ProtectedRoute>} />
            <Route path="/patient/dashboard" element={<ProtectedRoute userType="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/doctors" element={<ProtectedRoute userType="patient"><DoctorsList /></ProtectedRoute>} />
            <Route path="/patient/consult/:doctorId" element={<ProtectedRoute userType="patient"><ConsultationForm /></ProtectedRoute>} />
            <Route path="/patient/consultations" element={<ProtectedRoute userType="patient"><PatientConsultations /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/patient/signin" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

