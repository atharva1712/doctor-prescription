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
  IconButton
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
  specialty: string;
  yearsOfExperience: string;
  address: string;
  profilePicture: File | null;
}

const DoctorSignUp: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    specialty: '',
    yearsOfExperience: '',
    address: '',
    profilePicture: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof FormData];
        if (value !== null && value !== '') {
          data.append(key, value as string | Blob);
        }
      });

      const response = await axios.post(`${API_URL}/auth/doctor/signup`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      login(response.data.user, 'doctor', response.data.token);
      navigate('/doctor/profile');
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
            Doctor Sign Up
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
              inputProps={{ step: "0.1", min: "0" }}
              value={formData.yearsOfExperience}
              onChange={handleChange}
              required
              margin="normal"
              helperText="Can be decimal (e.g., 1.5)"
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
              Already have an account? <Link to="/doctor/signin">Sign In</Link>
            </Typography>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default DoctorSignUp;

