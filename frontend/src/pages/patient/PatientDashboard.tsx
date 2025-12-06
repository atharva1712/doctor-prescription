import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  TextField,
  Alert
} from '@mui/material';
import { Edit, Save, Cancel } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Patient } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    historyOfSurgery: '',
    historyOfIllness: '',
    password: '',
    profilePicture: null as File | null
  });
  const [illnessList, setIllnessList] = useState<string[]>([]);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/patients/profile/me`);
      setPatient(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        age: response.data.age?.toString() || '',
        historyOfSurgery: response.data.historyOfSurgery || '',
        historyOfIllness: response.data.historyOfIllness?.join(', ') || '',
        password: '',
        profilePicture: null
      });
      setIllnessList(response.data.historyOfIllness || []);
    } catch (error) {
      console.error('Error fetching patient profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'profilePicture' && e.target.files) {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    } else if (e.target.name === 'historyOfIllness') {
      const value = e.target.value;
      setFormData({ ...formData, historyOfIllness: value });
      const items = value.split(',').map(item => item.trim()).filter(item => item);
      setIllnessList(items);
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('phone', formData.phone);
      submitData.append('age', formData.age);
      submitData.append('historyOfSurgery', formData.historyOfSurgery);
      submitData.append('historyOfIllness', formData.historyOfIllness);
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      const response = await axios.put(`${API_URL}/patients/profile/me`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPatient(response.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setFormData({ ...formData, password: '', profilePicture: null });
      setIllnessList(response.data.historyOfIllness || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (patient) {
      setFormData({
        name: patient.name || '',
        phone: patient.phone || '',
        age: patient.age?.toString() || '',
        historyOfSurgery: patient.historyOfSurgery || '',
        historyOfIllness: patient.historyOfIllness?.join(', ') || '',
        password: '',
        profilePicture: null
      });
      setIllnessList(patient.historyOfIllness || []);
    }
    setEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <Container><Typography>Loading...</Typography></Container>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Patient Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {!editing ? (
                <Button variant="contained" startIcon={<Edit />} onClick={() => setEditing(true)}>
                  Edit Profile
                </Button>
              ) : null}
              <Button variant="outlined" onClick={logout}>
                Logout
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={patient?.profilePicture ? `${API_URL.replace('/api', '')}/${patient.profilePicture}` : ''}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                <Typography variant="h5">{patient?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Age: {patient?.age}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              {editing ? (
                <Card>
                  <CardContent>
                    <form onSubmit={handleSubmit}>
                      <TextField
                        fullWidth
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        margin="normal"
                        inputProps={{ min: '0' }}
                      />
                      <TextField
                        fullWidth
                        label="History of Surgery"
                        name="historyOfSurgery"
                        value={formData.historyOfSurgery}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={2}
                      />
                      <TextField
                        fullWidth
                        label="History of Illness (comma separated)"
                        name="historyOfIllness"
                        value={formData.historyOfIllness}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={3}
                        helperText="Separate multiple illnesses with commas"
                      />
                      {illnessList.length > 0 && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                          <Typography variant="body2" gutterBottom>Preview:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {illnessList.map((illness, index) => (
                              <Typography key={index} variant="body2" sx={{ 
                                bgcolor: 'primary.light', 
                                color: 'white', 
                                px: 1, 
                                py: 0.5, 
                                borderRadius: 1 
                              }}>
                                {illness}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      )}
                      <TextField
                        fullWidth
                        label="New Password (leave blank to keep current)"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        margin="normal"
                      />
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <input
                          accept="image/*"
                          style={{ display: 'none' }}
                          id="profile-picture-upload-patient"
                          type="file"
                          name="profilePicture"
                          onChange={handleChange}
                        />
                        <label htmlFor="profile-picture-upload-patient">
                          <Button variant="outlined" component="span" fullWidth>
                            {formData.profilePicture ? 'Change Profile Picture' : 'Upload Profile Picture'}
                          </Button>
                        </label>
                        {formData.profilePicture && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Selected: {formData.profilePicture.name}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<Save />}
                          disabled={saving}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                          disabled={saving}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </form>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Profile Information</Typography>
                    <Typography><strong>Email:</strong> {patient?.email}</Typography>
                    <Typography><strong>Phone:</strong> {patient?.phone}</Typography>
                    {patient?.historyOfSurgery && (
                      <Typography><strong>History of Surgery:</strong> {patient.historyOfSurgery}</Typography>
                    )}
                    {patient?.historyOfIllness && patient.historyOfIllness.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography><strong>History of Illness:</strong></Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                          {patient.historyOfIllness.map((illness, index) => (
                            <Typography key={index} variant="body2" sx={{ 
                              bgcolor: 'primary.light', 
                              color: 'white', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1 
                            }}>
                              {illness}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/patient/doctors')}
            >
              View Doctors
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/patient/consultations')}
            >
              My Consultations & Prescriptions
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PatientDashboard;

