'use client';

import { useEffect, useState, startTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Button, Paper, Typography, Box } from '@mui/material';
import { toast } from 'react-toastify';
import { setAuthenticated, setUserData } from '@/configs/redux/authSlice';
import { API } from '@/configs/api';
import { LoginResponse } from '@/configs/api.type';
import { RootState } from '@/configs/redux/store';

export default function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state: RootState) => state.auth.authenticated);
  const [nik, setNik] = useState('004249');
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  // If already authenticated, redirect to main page
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleRequestOtp = async () => {
    if (!nik) {
      toast.error('NIK is required');
      return;
    }

    try {
      setIsLoading(true);
      await API('auth/request-otp', 'POST', {
        nik,
      });
      setShowOtpInput(true);
      toast.success('OTP has been sent');
    } catch (error) {
      console.error('Request OTP error:', error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!nik || !otp) {
      toast.error('NIK and OTP are required');
      return;
    }

    try {
      setIsLoading(true);
      const response = await API<LoginResponse>('auth/login', 'POST', {
        nik,
        otp: parseInt(otp, 10),
      });

      // Navigate immediately after successful API response
      startTransition(() => {
        router.replace('/');
      });

      // Update state asynchronously after navigation
      const userData = {
        nama: response.data.nama,
        nik: response.data.nik,
        noba: response.data.noba,
        pin: response.data.pin,
        role: 'NASABAH' as const,
      };

      // Update localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('nama', response.data.nama);
      localStorage.setItem('nik', response.data.nik);
      localStorage.setItem('noba', response.data.noba);
      localStorage.setItem('pin', response.data.pin?.toString() || '');
      localStorage.setItem('role', 'NASABAH');
      
      // Update Redux state
      dispatch(setUserData(userData));
      dispatch(setAuthenticated(true));
      
      // Show success message after everything is done
      setTimeout(() => {
        toast.success('Login successful');
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your OTP.');
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
          disabled={showOtpInput}
          sx={{ mb: 2 }}
        />

        {!showOtpInput ? (
          <Button
            fullWidth
            variant="contained"
            onClick={handleRequestOtp}
            disabled={isLoading}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
            }}
          >
            {isLoading ? 'Requesting OTP...' : 'Request OTP'}
          </Button>
        ) : (
          <>
            <TextField
              fullWidth
              label="OTP"
              variant="outlined"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="number"
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleLogin}
              disabled={isLoading}
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                mb: 2,
              }}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setShowOtpInput(false);
                setOtp('');
              }}
              disabled={isLoading}
            >
              Change NIK
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}