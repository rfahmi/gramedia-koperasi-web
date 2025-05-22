'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { TextField, Button, Paper, Typography, Box, InputAdornment, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { setAuthenticated, setUserData } from '@/configs/redux/authSlice';
import { API } from '@/configs/api';
import { LoginResponse } from '@/configs/api.type';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [nik, setNik] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');

  const handleLogin = async () => {
    if (!nik) {
      toast.error('NIK is required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await API<LoginResponse>('auth/login', 'POST', {
        nomor_karyawan: nik,
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);

      // Set up user data
      dispatch(setUserData({
        nama: response.data.nama,
        nik: response.data.nik,
        noba: response.data.noba,
        pin: response.data.pin,
        role: 'NASABAH', // Default role, can be updated later if needed
      }));
      
      dispatch(setAuthenticated(true));
      
      // Navigate to the home page
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 2,
        backgroundColor: '#f8fafc',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '400px',
          width: '100%',
        }}
      >
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Image
            src="/images/logo_mas.png"
            alt="Gramedia Koperasi"
            width={120}
            height={120}
            priority
          />
          <Typography variant="h5" component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Gramedia Koperasi
          </Typography>
        </Box>

        <TextField
          fullWidth
          label="NIK"
          variant="outlined"
          value={nik}
          onChange={(e) => setNik(e.target.value)}
          sx={{ mb: 2 }}
        />

        {pin !== '' && (
          <TextField
            fullWidth
            label="PIN"
            type={showPin ? 'text' : 'password'}
            variant="outlined"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPin(!showPin)}
                    edge="end"
                  >
                    <span className="material-icons">
                      {showPin ? 'visibility_off' : 'visibility'}
                    </span>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
        )}

        <Button
          variant="contained"
          fullWidth
          color="primary"
          onClick={handleLogin}
          disabled={isLoading}
          sx={{ py: 1.5 }}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </Paper>
    </Box>
  );
}