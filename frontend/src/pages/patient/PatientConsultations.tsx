import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';
import { ArrowBack, Download, Visibility } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Consultation, Prescription } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const PatientConsultations: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [consultationsRes, prescriptionsRes] = await Promise.all([
        axios.get(`${API_URL}/consultations/patient`),
        axios.get(`${API_URL}/prescriptions/patient`)
      ]);
      setConsultations(consultationsRes.data);
      setPrescriptions(prescriptionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleViewPDF = (pdfPath: string) => {
    if (!pdfPath) return;
    let fileName = pdfPath.split('/').pop() || pdfPath;
    if (fileName.includes('\\')) {
      fileName = fileName.split('\\').pop() || fileName;
    }
    window.open(`${BASE_URL}/prescriptions/${fileName}`, '_blank');
  };

  const handleDownloadPDF = (pdfPath: string, prescriptionId: string) => {
    if (!pdfPath) return;
    let fileName = pdfPath.split('/').pop() || pdfPath;
    if (fileName.includes('\\')) {
      fileName = fileName.split('\\').pop() || fileName;
    }
    const link = document.createElement('a');
    link.href = `${BASE_URL}/prescriptions/${fileName}`;
    link.download = `prescription-${prescriptionId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const prescriptionsByConsultation = prescriptions.reduce((acc, prescription) => {
    const consultationId = prescription.consultation._id;
    if (!acc[consultationId]) {
      acc[consultationId] = [];
    }
    acc[consultationId].push(prescription);
    return acc;
  }, {} as Record<string, Prescription[]>);

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

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
                My Consultations & Prescriptions
              </Typography>
            </Box>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Box>

          {consultations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No consultations yet
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/patient/doctors')}
                sx={{ mt: 2 }}
              >
                Find a Doctor
              </Button>
            </Box>
          ) : (
            <Box>
              {consultations.map((consultation) => {
                const consultationPrescriptions = prescriptionsByConsultation[consultation._id] || [];
                return (
                  <Card key={consultation._id} sx={{ mb: 3 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                              src={consultation.doctor?.profilePicture ? `${BASE_URL}/${consultation.doctor.profilePicture}` : ''}
                              sx={{ width: 60, height: 60 }}
                            />
                            <Box>
                              <Typography variant="h6">
                                Dr. {consultation.doctor?.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {consultation.doctor?.specialty}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Consultation Date:</strong>{' '}
                            {new Date(consultation.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Current Illness:</strong> {consultation.currentIllnessHistory}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={consultation.status}
                              color={getStatusColor(consultation.status)}
                              size="small"
                            />
                          </Box>
                        </Grid>
                      </Grid>
                      {consultationPrescriptions.length > 0 && (
                        <Box sx={{ mt: 3 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="h6" gutterBottom>
                            Prescriptions
                          </Typography>
                          {consultationPrescriptions.map((prescription) => (
                            <Card key={prescription._id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Prescribed on:</strong>{' '}
                                    {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Care Instructions:</strong> {prescription.careToBeTaken.substring(0, 100)}
                                    {prescription.careToBeTaken.length > 100 ? '...' : ''}
                                  </Typography>
                                  {prescription.medicines && (
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                      <strong>Medicines:</strong> {prescription.medicines.substring(0, 100)}
                                      {prescription.medicines.length > 100 ? '...' : ''}
                                    </Typography>
                                  )}
                                </Grid>
                                <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                  {prescription.pdfPath ? (
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                      <Button
                                        variant="outlined"
                                        startIcon={<Visibility />}
                                        onClick={() => handleViewPDF(prescription.pdfPath!)}
                                        size="small"
                                      >
                                        View PDF
                                      </Button>
                                      <Button
                                        variant="contained"
                                        startIcon={<Download />}
                                        onClick={() => handleDownloadPDF(prescription.pdfPath!, prescription._id)}
                                        size="small"
                                      >
                                        Download
                                      </Button>
                                    </Box>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      PDF not available
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>
                            </Card>
                          ))}
                        </Box>
                      )}

                      {consultationPrescriptions.length === 0 && consultation.status === 'prescribed' && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Prescription is being prepared...
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default PatientConsultations;

