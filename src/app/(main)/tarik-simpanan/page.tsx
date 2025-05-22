'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { RootState } from '@/configs/redux/store';
import { API } from '@/configs/api';
import { SaldoResponse } from '@/configs/api.type';
import ScreenContainer from '@/components/ScreenContainer';
import Title from '@/components/Title';

export default function TarikSimpanan() {
  const router = useRouter();
  const userData = useSelector((state: RootState) => state.auth.userData);
  const [isLoading, setIsLoading] = useState(true);
  const [saldo, setSaldo] = useState<SaldoResponse | null>(null);
  const [amount, setAmount] = useState(500000);
  const [maxAmount, setMaxAmount] = useState(500000);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Format number as Indonesian Rupiah
  const formatRupiah = (value: number | string) => {
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numberValue);
  };

  const getSaldo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication error. Please login again.');
        router.push('/login');
        return;
      }

      const response = await API<SaldoResponse>(
        'karyawan/:noba/saldo',
        'GET',
        {
          noba: userData.noba,
        },
        token,
      );

      setSaldo(response.data);
      
      // Set max amount based on available balance
      const availableBalance = parseFloat(response.data.saldo_simpan);
      setMaxAmount(availableBalance);
      
      // Initialize amount to minimum of 500,000 or available balance
      setAmount(Math.min(500000, availableBalance));
    } catch (error) {
      console.error('Error getting balance:', error);
      toast.error('Failed to get balance information');
    } finally {
      setIsLoading(false);
    }
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
    handleSubmit();
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication error. Please login again.');
        router.push('/login');
        return;
      }

      await API(
        'tarik',
        'POST',
        {
          noba: userData.noba,
          nilai: amount,
        },
        token,
      );

      setConfirmModalOpen(false);
      toast.success('Withdrawal request submitted successfully');
      router.push('/simpanan');
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!userData.noba) {
      router.push('/login');
      return;
    }
    
    getSaldo();
  }, [userData, router]);

  return (
    <ScreenContainer>
      <Box className="flex items-center mb-4">
        <IconButton onClick={() => router.back()} edge="start">
          <span className="material-icons">arrow_back</span>
        </IconButton>
        <Title text="Tarik Simpanan" />
      </Box>

      {isLoading ? (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card className="p-4 mb-6">
            <Typography variant="subtitle2" color="text.secondary">
              Saldo Simpanan Tersedia
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {saldo ? formatRupiah(saldo.saldo_simpan) : 'Rp 0'}
            </Typography>
          </Card>

          <Box className="mb-6">
            <Typography gutterBottom>Jumlah Penarikan</Typography>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {formatRupiah(amount)}
            </Typography>
            <Slider
              min={100000}
              max={maxAmount}
              step={100000}
              value={amount}
              onChange={(_, newValue) => setAmount(newValue as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatRupiah(value)}
              disabled={maxAmount < 100000}
            />
            <Box className="flex justify-between text-xs text-gray-500">
              <Typography variant="caption">Rp 100.000</Typography>
              <Typography variant="caption">{formatRupiah(maxAmount)}</Typography>
            </Box>
          </Box>

          <Box className="mt-4">
            <Typography variant="body2" color="text.secondary" className="mb-4">
              Tarik simpanan akan memotong saldo simpanan Anda. Penarikan akan diproses dalam waktu 1-3 hari kerja.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              color="primary"
              onClick={() => setConfirmModalOpen(true)}
              disabled={isLoading || amount > maxAmount || amount < 100000}
            >
              Tarik Simpanan
            </Button>
          </Box>

          {/* Confirmation Modal */}
          <Dialog open={isConfirmModalOpen} onClose={() => !isProcessing && setConfirmModalOpen(false)}>
            <DialogTitle>Konfirmasi Penarikan</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Anda akan menarik simpanan sebesar {formatRupiah(amount)}. Penarikan ini akan memotong saldo simpanan Anda.
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
                  disabled={isProcessing}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button 
                onClick={() => setConfirmModalOpen(false)} 
                color="inherit"
                disabled={isProcessing}
              >
                Batal
              </Button>
              <Button 
                onClick={handleConfirm} 
                color="primary"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Konfirmasi'
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </ScreenContainer>
  );
}