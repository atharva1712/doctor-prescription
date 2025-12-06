import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Chip
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface FormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  age: string;
  historyOfSurgery: string;
  historyOfIllness: string;
  profilePicture: File | null;
}

const PatientSignUp: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: '',
    historyOfSurgery: '',
    historyOfIllness: '',
    profilePicture: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [illnessList, setIllnessList] = useState<string[]>([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'profilePicture' && e.target.files) {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    } else if (e.target.name === 'phone') {
      const value = e.target.value.replace(/\D/g, '');
      if (value.length <= 10) {
        setFormData({ ...formData, phone: value });
      }
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
    setLoading(true);

    if (formData.phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof FormData];
        if (value !== null && value !== '') {
          data.append(key, value as string | Blob);
        }
      });

      const response = await axios.post(`${API_URL}/auth/patient/signup`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      login(response.data.user, 'patient', response.data.token);
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Patient Sign Up
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

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
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              margin="normal"
              inputProps={{ maxLength: 10 }}
              helperText="Must be exactly 10 digits"
              error={formData.phone.length > 0 && formData.phone.length !== 10}
            />
            <TextField
              fullWidth
              label="Age"
              name="age"
              type="number"
              inputProps={{ min: "0" }}
              value={formData.age}
              onChange={handleChange}
              required
              margin="normal"
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
              label="History of Illness (comma-separated)"
              name="historyOfIllness"
              value={formData.historyOfIllness}
              onChange={handleChange}
              margin="normal"
              helperText="Separate multiple illnesses with commas"
            />
            {illnessList.length > 0 && (
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography variant="body2" gutterBottom>Illness List:</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {illnessList.map((illness, index) => (
                    <Chip key={index} label={illness} size="small" />
                  ))}
                </Box>
              </Box>
            )}
            <TextField
              fullWidth
              type="file"
              name="profilePicture"
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              inputProps={{ accept: 'image/*' }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
            
            <Typography align="center">
              Already have an account? <Link to="/patient/signin">Sign In</Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PatientSignUp;

