import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  CircularProgress
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Doctor } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DoctorsList: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/patient/dashboard')}
              >
                Back to Dashboard
              </Button>
              <Typography variant="h4" component="h1">
                Available Doctors
              </Typography>
            </Box>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : doctors.length === 0 ? (
            <Typography align="center" sx={{ mt: 4 }}>
              No doctors available.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {doctors.map((doctor) => (
                <Grid item xs={12} sm={6} md={4} key={doctor._id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
                      <Avatar
                        src={doctor.profilePicture ? `${API_URL.replace('/api', '')}/${doctor.profilePicture}` : ''}
                        sx={{ width: 120, height: 120 }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        {doctor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {doctor.specialty}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {doctor.yearsOfExperience} years of experience
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/patient/consult/${doctor._id}`)}
                      >
                        Consult
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default DoctorsList;

