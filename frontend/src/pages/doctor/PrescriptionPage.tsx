import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar
} from '@mui/material';
import { ArrowBack, Visibility } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Consultation } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PrescriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await axios.get(`${API_URL}/consultations/doctor`);
      setConsultations(response.data);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'pending') return 'warning';
    if (status === 'prescribed') return 'success';
    if (status === 'completed') return 'info';
    return 'default';
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/doctor/profile')}
              >
                Back to Profile
              </Button>
              <Typography variant="h4" component="h1">
                Consultations
              </Typography>
            </Box>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Box>

          {loading ? (
            <Typography>Loading consultations...</Typography>
          ) : consultations.length === 0 ? (
            <Typography align="center" sx={{ mt: 4 }}>
              No consultations found.
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Current Illness</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {consultations.map((consultation) => (
                    <TableRow key={consultation._id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={consultation.patient?.profilePicture ? `${API_URL.replace('/api', '')}/${consultation.patient.profilePicture}` : ''}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography variant="body2">{consultation.patient?.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {consultation.patient?.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{consultation.currentIllnessHistory}</TableCell>
                      <TableCell>
                        {new Date(consultation.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={consultation.status}
                          color={getStatusColor(consultation.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/doctor/prescription/${consultation._id}`)}
                        >
                          {consultation.status === 'prescribed' ? 'View/Edit' : 'Write Prescription'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PrescriptionPage;

