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
import { Doctor } from '../../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    yearsOfExperience: '',
    address: '',
    password: '',
    profilePicture: null as File | null
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/doctors/profile/me`);
      setDoctor(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        specialty: response.data.specialty || '',
        yearsOfExperience: response.data.yearsOfExperience?.toString() || '',
        address: response.data.address || '',
        password: '',
        profilePicture: null
      });
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'profilePicture' && e.target.files) {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
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
      submitData.append('specialty', formData.specialty);
      submitData.append('yearsOfExperience', formData.yearsOfExperience);
      submitData.append('address', formData.address);
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }

      const response = await axios.put(`${API_URL}/doctors/profile/me`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setDoctor(response.data);
      setSuccess('Profile updated successfully!');
      setEditing(false);
      setFormData({ ...formData, password: '', profilePicture: null });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (doctor) {
      setFormData({
        name: doctor.name || '',
        phone: doctor.phone || '',
        specialty: doctor.specialty || '',
        yearsOfExperience: doctor.yearsOfExperience?.toString() || '',
        address: doctor.address || '',
        password: '',
        profilePicture: null
      });
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
              Doctor Profile
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
                  src={doctor?.profilePicture ? `${API_URL.replace('/api', '')}/${doctor.profilePicture}` : ''}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                <Typography variant="h5">{doctor?.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {doctor?.specialty}
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
                        label="Specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleChange}
                        required
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Years of Experience"
                        name="yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        required
                        margin="normal"
                        inputProps={{ step: '0.1', min: '0' }}
                      />
                      <TextField
                        fullWidth
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={2}
                      />
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
                          id="profile-picture-upload"
                          type="file"
                          name="profilePicture"
                          onChange={handleChange}
                        />
                        <label htmlFor="profile-picture-upload">
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
                    <Typography><strong>Email:</strong> {doctor?.email}</Typography>
                    <Typography><strong>Phone:</strong> {doctor?.phone}</Typography>
                    <Typography><strong>Specialty:</strong> {doctor?.specialty}</Typography>
                    <Typography><strong>Years of Experience:</strong> {doctor?.yearsOfExperience}</Typography>
                    {doctor?.address && (
                      <Typography><strong>Address:</strong> {doctor.address}</Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/doctor/prescriptions')}
            >
              Go to Prescription Page
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default DoctorProfile;

