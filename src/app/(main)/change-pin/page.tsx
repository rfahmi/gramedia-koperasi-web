'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { RootState } from '@/configs/redux/store';
import { setUserData } from '@/configs/redux/authSlice';
import { API } from '@/configs/api';
import ScreenContainer from '@/components/ScreenContainer';
import Title from '@/components/Title';

export default function ChangePin() {
  const router = useRouter();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.auth.userData);
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [currentPinError, setCurrentPinError] = useState('');
  const [newPinError, setNewPinError] = useState('');
  const [confirmPinError, setConfirmPinError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    let isValid = true;
    
    // Validate current PIN
    if (!currentPin) {
      setCurrentPinError('Current PIN is required');
      isValid = false;
    } else if (currentPin.length !== 6) {
      setCurrentPinError('PIN must be 6 digits');
      isValid = false;
    } else if (currentPin !== userData.pin?.toString()) {
      setCurrentPinError('Current PIN is incorrect');
      isValid = false;
    } else {
      setCurrentPinError('');
    }
    
    // Validate new PIN
    if (!newPin) {
      setNewPinError('New PIN is required');
      isValid = false;
    } else if (newPin.length !== 6) {
      setNewPinError('PIN must be 6 digits');
      isValid = false;
    } else if (newPin === currentPin) {
      setNewPinError('New PIN cannot be the same as current PIN');
      isValid = false;
    } else {
      setNewPinError('');
    }
    
    // Validate confirmation PIN
    if (!confirmPin) {
      setConfirmPinError('Please confirm your new PIN');
      isValid = false;
    } else if (confirmPin !== newPin) {
      setConfirmPinError('PINs do not match');
      isValid = false;
    } else {
      setConfirmPinError('');
    }
    
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !userData.noba) {
        toast.error('Authentication error. Please login again.');
        router.push('/login');
        return;
      }

      await API(
        'karyawan/:noba/change-pin',
        'POST',
        {
          noba: userData.noba,
          pin: newPin,
        },
        token,
      );

      // Update user data with the new PIN
      dispatch(setUserData({
        ...userData,
        pin: Number(newPin),
      }));
      
      localStorage.setItem('pin', newPin);
      toast.success('PIN successfully changed');
      router.push('/profile');
    } catch (error) {
      console.error('Error changing PIN:', error);
      toast.error('Failed to change PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userData.noba) {
      router.push('/login');
    }
  }, [userData, router]);

  return (
    <ScreenContainer>
      <Box className="flex items-center mb-4">
        <IconButton onClick={() => router.back()} edge="start">
          <span className="material-icons">arrow_back</span>
        </IconButton>
        <Title text="Change PIN" />
      </Box>

      <Card className="p-4">
        <Typography variant="body2" color="text.secondary" className="mb-4">
          Please enter your current PIN and a new 6-digit PIN.
        </Typography>

        <TextField
          label="Current PIN"
          type="password"
          inputProps={{ 
            inputMode: 'numeric', 
            pattern: '[0-9]*',
            maxLength: 6 
          }}
          fullWidth
          margin="normal"
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value.slice(0, 6))}
          error={!!currentPinError}
          helperText={currentPinError}
          disabled={isLoading}
        />

        <TextField
          label="New PIN"
          type="password"
          inputProps={{ 
            inputMode: 'numeric', 
            pattern: '[0-9]*',
            maxLength: 6 
          }}
          fullWidth
          margin="normal"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value.slice(0, 6))}
          error={!!newPinError}
          helperText={newPinError}
          disabled={isLoading}
        />

        <TextField
          label="Confirm New PIN"
          type="password"
          inputProps={{ 
            inputMode: 'numeric', 
            pattern: '[0-9]*',
            maxLength: 6 
          }}
          fullWidth
          margin="normal"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.slice(0, 6))}
          error={!!confirmPinError}
          helperText={confirmPinError}
          disabled={isLoading}
        />

        <Box className="mt-4">
          <Button
            variant="contained"
            fullWidth
            color="primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Change PIN'
            )}
          </Button>
        </Box>
      </Card>
    </ScreenContainer>
  );
}