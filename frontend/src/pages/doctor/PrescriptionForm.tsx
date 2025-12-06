import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { ArrowBack, Save, Send } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Consultation, Prescription } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface FormData {
  careToBeTaken: string;
  medicines: string;
}

const PrescriptionForm: React.FC = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams<{ consultationId: string }>();
  const { logout } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState<FormData>({
    careToBeTaken: '',
    medicines: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchConsultation = useCallback(async () => {
    if (!consultationId) return;
    try {
      const response = await axios.get(`${API_URL}/consultations/${consultationId}`);
      setConsultation(response.data);
    } catch (error) {
      console.error('Error fetching consultation:', error);
      setError('Failed to load consultation details');
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  const checkExistingPrescription = useCallback(async () => {
    if (!consultationId) return;
    try {
      const response = await axios.get(`${API_URL}/prescriptions/doctor`);
      const existing = response.data.find((p: Prescription) => p.consultation._id === consultationId);
      if (existing) {
        setPrescription(existing);
        setFormData({
          careToBeTaken: existing.careToBeTaken,
          medicines: existing.medicines || ''
        });
      }
    } catch (error) {
      console.error('Error checking prescription:', error);
    }
  }, [consultationId]);

  useEffect(() => {
    if (consultationId) {
      fetchConsultation();
      checkExistingPrescription();
    }
  }, [consultationId, fetchConsultation, checkExistingPrescription]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consultationId) return;
    
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (prescription) {
        await axios.put(`${API_URL}/prescriptions/${prescription._id}`, formData);
        setSuccess('Prescription updated and sent successfully!');
      } else {
        await axios.post(`${API_URL}/prescriptions`, {
          consultation: consultationId,
          ...formData
        });
        setSuccess('Prescription created and sent successfully!');
      }
      setTimeout(() => {
        navigate('/doctor/prescriptions');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/doctor/prescriptions')}
            >
              Back
            </Button>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Box>

          <Typography variant="h4" component="h1" gutterBottom>
            {prescription ? 'Edit Prescription' : 'Write Prescription'}
          </Typography>

          {consultation && (
            <Card sx={{ mb: 3, mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Consultation Details</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Patient:</strong> {consultation.patient?.name}</Typography>
                    <Typography variant="body2"><strong>Age:</strong> {consultation.patient?.age}</Typography>
                    <Typography variant="body2"><strong>Email:</strong> {consultation.patient?.email}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2"><strong>Current Illness:</strong> {consultation.currentIllnessHistory}</Typography>
                    {consultation.recentSurgery && (
                      <Typography variant="body2"><strong>Recent Surgery:</strong> {consultation.recentSurgery} ({consultation.surgeryTimeSpan})</Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Care to be Taken"
              name="careToBeTaken"
              value={formData.careToBeTaken}
              onChange={handleChange}
              required
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Medicines"
              name="medicines"
              value={formData.medicines}
              onChange={handleChange}
              multiline
              rows={4}
              margin="normal"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                startIcon={prescription ? <Send /> : <Save />}
                disabled={saving}
              >
                {saving ? 'Saving...' : prescription ? 'Update & Resend' : 'Save & Send'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PrescriptionForm;

