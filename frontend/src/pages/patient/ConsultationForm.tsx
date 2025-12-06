import React, { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Grid,
  Checkbox
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import QRCode from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Doctor } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const steps = ['Current Illness History', 'Family Medical History', 'Payment'];

interface FormData {
  currentIllnessHistory: string;
  recentSurgery: string;
  surgeryTimeSpan: string;
  familyMedicalHistory: {
    diabetics: 'Diabetics' | 'Non-Diabetics';
    allergies: string;
    others: string;
  };
  transactionId: string;
  consentAccepted: boolean;
}

const ConsultationForm: React.FC = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const { logout } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<FormData>({
    currentIllnessHistory: '',
    recentSurgery: '',
    surgeryTimeSpan: '',
    familyMedicalHistory: {
      diabetics: 'Non-Diabetics',
      allergies: '',
      others: ''
    },
    transactionId: '',
    consentAccepted: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    if (!doctorId) return;
    try {
      const response = await axios.get(`${API_URL}/doctors/${doctorId}`);
      setDoctor(response.data);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      setError('Failed to load doctor information');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.currentIllnessHistory.trim()) {
        setError('Current illness history is required');
        return;
      }
    }
    if (activeStep === 2) {
      if (!formData.transactionId.trim()) {
        setError('Transaction ID is required');
        return;
      }
      if (!formData.consentAccepted) {
        setError('Please accept the consent for online consultation');
        return;
      }
      handleSubmit();
      return;
    }
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name.startsWith('familyMedicalHistory.')) {
      const field = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        familyMedicalHistory: {
          ...formData.familyMedicalHistory,
          [field]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, consentAccepted: e.target.checked });
  };

  const handleSubmit = async () => {
    if (!doctorId) return;
    setError('');
    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/consultations`, {
        doctor: doctorId,
        ...formData
      });
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit consultation');
      setSubmitting(false);
    }
  };

  const renderStepContent = (step: number): JSX.Element | null => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              fullWidth
              label="Current Illness History"
              name="currentIllnessHistory"
              value={formData.currentIllnessHistory}
              onChange={handleChange}
              required
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Recent Surgery (if any)"
              name="recentSurgery"
              value={formData.recentSurgery}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Surgery Time Span"
              name="surgeryTimeSpan"
              value={formData.surgeryTimeSpan}
              onChange={handleChange}
              margin="normal"
              placeholder="e.g., 2 months ago"
            />
          </Box>
        );
      case 1:
        return (
          <Box>
            <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
              <FormLabel component="legend">Diabetics or Non-Diabetics</FormLabel>
              <RadioGroup
                row
                name="familyMedicalHistory.diabetics"
                value={formData.familyMedicalHistory.diabetics}
                onChange={handleChange}
              >
                <FormControlLabel value="Diabetics" control={<Radio />} label="Diabetics" />
                <FormControlLabel value="Non-Diabetics" control={<Radio />} label="Non-Diabetics" />
              </RadioGroup>
            </FormControl>
            <TextField
              fullWidth
              label="Any Allergies"
              name="familyMedicalHistory.allergies"
              value={formData.familyMedicalHistory.allergies}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Others"
              name="familyMedicalHistory.others"
              value={formData.familyMedicalHistory.others}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        );
      case 2:
        return (
          <Box>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Scan and Pay using UPI App
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <QRCode 
                        value={`upi://pay?pa=doctor@upi&pn=Doctor Consultation&am=600&cu=INR`} 
                        size={200} 
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Pay Using Any App
                    </Typography>
                    <Typography variant="h4" sx={{ color: 'primary.main', my: 2 }}>
                      ₹ 600
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 3, display: 'block' }}>
                      (After Payment)
                    </Typography>
                    <TextField
                      fullWidth
                      label="Enter Transaction ID*"
                      name="transactionId"
                      value={formData.transactionId}
                      onChange={handleChange}
                      required
                      margin="normal"
                      placeholder="Enter your payment transaction ID"
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Card sx={{ mb: 3, p: 3, bgcolor: '#f5f5f5' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textTransform: 'uppercase', mb: 2 }}>
                  CONSENT FOR ONLINE CONSULTATION
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
                  I HAVE UNDERSTOOD THAT THIS IS AN ONLINE CONSULTATION WITHOUT A PHYSICAL CHECKUP OF MY SYMPTOMS. 
                  THE DOCTOR HENCE RELIES ON MY DESCRIPTION OF THE PROBLEM OR SCANNED REPORTS PROVIDED BY ME. 
                  WITH THIS UNDERSTANDING, I HEREBY GIVE MY CONSENT FOR ONLINE CONSULTATION.
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.consentAccepted}
                      onChange={handleCheckboxChange}
                      required
                    />
                  }
                  label="YES, I ACCEPT"
                />
              </CardContent>
            </Card>
          </Box>
        );
      default:
        return null;
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
              onClick={() => navigate('/patient/doctors')}
            >
              Back
            </Button>
            <Button variant="outlined" onClick={logout}>
              Logout
            </Button>
          </Box>

          {doctor && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Consulting with: {doctor.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Specialty: {doctor.specialty}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Typography variant="h4" component="h1" gutterBottom>
            Consultation Form
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mt: 3, mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={submitting}
              sx={{
                bgcolor: '#4caf50',
                '&:hover': { bgcolor: '#45a049' },
                minWidth: 200
              }}
            >
              {activeStep === steps.length - 1
                ? submitting
                  ? 'Submitting...'
                  : 'Submit Appointment'
                : 'Next'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ConsultationForm;

