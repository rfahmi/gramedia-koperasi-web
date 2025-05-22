'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { RootState } from '@/configs/redux/store';
import { API } from '@/configs/api';
import ScreenContainer from '@/components/ScreenContainer';
import Title from '@/components/Title';

export default function PengajuanPinjam() {
  const router = useRouter();
  const userData = useSelector((state: RootState) => state.auth.userData);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState(500000);
  const [tenor, setTenor] = useState(6);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Format number as Indonesian Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate estimated monthly payment
  const calculateMonthlyPayment = () => {
    // Simple calculation (could be refined with actual interest rate logic)
    const interestRate = 0.01; // 1% per month
    const principal = amount;
    const monthlyInterest = principal * interestRate;
    const principalPerMonth = principal / tenor;
    
    return principalPerMonth + monthlyInterest;
  };

  const handleConfirm = () => {
    if (!pin) {
      setErrorMessage('PIN is required');
      return;
    }

    if (pin.length !== 6) {
      setErrorMessage('PIN must be 6 digits');
      return;
    }

    // Validate PIN
    const storedPin = userData.pin?.toString();
    if (pin !== storedPin) {
      setErrorMessage('Invalid PIN');
      return;
    }

    setErrorMessage('');
    handleSubmitPinjaman();
  };

  const handleSubmitPinjaman = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication error. Please login again.');
        router.push('/login');
        return;
      }

      await API(
        'pinjaman',
        'POST',
        {
          noba: userData.noba,
          nilai: amount,
          jangka_waktu: tenor,
        },
        token,
      );

      setConfirmModalOpen(false);
      toast.success('Loan application submitted successfully');
      router.push('/');
    } catch (error) {
      console.error('Error submitting loan:', error);
      toast.error('Failed to submit loan application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated
    if (!userData.noba) {
      router.push('/login');
    }
  }, [userData, router]);

  return (
    <ScreenContainer>
      <Title text="Pengajuan Pinjaman" />
      
      <Box className="mb-6">
        <Typography gutterBottom>Jumlah Pinjaman</Typography>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {formatRupiah(amount)}
        </Typography>
        <Slider
          min={500000}
          max={20000000}
          step={500000}
          value={amount}
          onChange={(_, newValue) => setAmount(newValue as number)}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => formatRupiah(value)}
        />
        <Box className="flex justify-between text-xs text-gray-500">
          <Typography variant="caption">Rp 500.000</Typography>
          <Typography variant="caption">Rp 20.000.000</Typography>
        </Box>
      </Box>

      <Box className="mb-6">
        <Typography gutterBottom>Jangka Waktu (bulan)</Typography>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {tenor} bulan
        </Typography>
        <Slider
          min={1}
          max={24}
          step={1}
          value={tenor}
          onChange={(_, newValue) => setTenor(newValue as number)}
          valueLabelDisplay="auto"
        />
        <Box className="flex justify-between text-xs text-gray-500">
          <Typography variant="caption">1 bulan</Typography>
          <Typography variant="caption">24 bulan</Typography>
        </Box>
      </Box>

      <Box className="bg-blue-50 p-4 rounded-lg mb-6">
        <Typography variant="subtitle2" color="primary" fontWeight="bold">
          Estimasi Cicilan Bulanan
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {formatRupiah(calculateMonthlyPayment())}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          *Besar cicilan aktual dapat berbeda, tergantung persetujuan
        </Typography>
      </Box>

      <Button
        variant="contained"
        fullWidth
        color="primary"
        onClick={() => setConfirmModalOpen(true)}
        disabled={isLoading}
      >
        Ajukan Pinjaman
      </Button>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onClose={() => !isLoading && setConfirmModalOpen(false)}>
        <DialogTitle>Konfirmasi Pengajuan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Anda akan mengajukan pinjaman sebesar {formatRupiah(amount)} dengan jangka waktu {tenor} bulan.
          </DialogContentText>
          <Box className="mt-4">
            <TextField
              label="Masukkan PIN"
              type="password"
              inputProps={{ 
                inputMode: 'numeric', 
                pattern: '[0-9]*',
                maxLength: 6 
              }}
              fullWidth
              value={pin}
              onChange={(e) => setPin(e.target.value.slice(0, 6))}
              error={!!errorMessage}
              helperText={errorMessage}
              disabled={isLoading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmModalOpen(false)} 
            color="inherit"
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button 
            onClick={handleConfirm} 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Konfirmasi'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenContainer>
  );
}