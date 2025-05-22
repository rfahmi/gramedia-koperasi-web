'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Avatar, 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  Paper, 
  TextField, 
  Typography 
} from '@mui/material';
import { toast } from 'react-toastify';
import { RootState } from '@/configs/redux/store';
import { AuthState, setUserData } from '@/configs/redux/authSlice';
import { API } from '@/configs/api';
import { KaryawanData, SaldoResponse } from '@/configs/api.type';
import ScreenContainer from '@/components/ScreenContainer';
import Title from '@/components/Title';
import SliderBanner from '@/components/SliderBanner';
import Menu from '@/components/Menu';

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth as AuthState);
  const { userData } = auth;

  const [isCreatePinModalOpen, setCreatePinModalOpen] = useState<boolean>(false);
  const [newPin, setNewPin] = useState('');
  const [isRefreshing, setRefreshing] = useState(false);
  const [saldo, setSaldo] = useState<SaldoResponse | null>(null);

  const BANNER_DUMMY_DATA = [
    {
      imageUri: 'https://picsum.photos/400/100',
      caption: 'Promo Pinjaman Bunga Rendah',
    },
    {
      imageUri: 'https://picsum.photos/400/100',
      caption: 'Reward Point Untuk Nasabah Setia',
    },
  ];

  const MENU_NASABAH = [
    {
      icon: 'credit-card-plus',
      label: 'Pengajuan Pinjaman',
      onPress: () => router.push('/pengajuan-pinjam'),
      href: '/pengajuan-pinjam',
    },
    {
      icon: 'credit-card-refund',
      label: 'Tarik Simpanan',
      onPress: () => router.push('/tarik-simpanan'),
      href: '/tarik-simpanan',
    },
    {
      icon: 'eye-refresh',
      label: 'Simulasi Angsuran',
      onPress: () => router.push('/simulasi-angsuran'),
      href: '/simulasi-angsuran',
    },
  ];

  const MENU_ADMIN = [
    {
      icon: 'check-decagram',
      label: 'Approval Pinjaman',
      onPress: () => router.push('/approval-pinjaman'),
      href: '/approval-pinjaman',
    },
    {
      icon: 'clipboard-list',
      label: 'List Pinjaman',
      onPress: () => router.push('/list-pinjaman'),
      href: '/list-pinjaman',
    },
  ];

  const handleCreatePin = async () => {
    if (newPin.length === 6) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('Authentication error. Please login again.');
          router.push('/login');
          return;
        }

        await API(
          'karyawan/:noba/change-pin',
          'POST',
          {
            noba: userData?.noba,
            pin: newPin,
          },
          token,
        );

        // Update user data with the new PIN
        dispatch(setUserData({ ...userData, pin: Number(newPin) }));
        localStorage.setItem('pin', newPin);
        setCreatePinModalOpen(false);
        toast.success('PIN successfully created');
      } catch (err) {
        console.error(err);
        toast.error('Failed to create PIN. Please try again.');
      }
    } else {
      toast.error('PIN must be 6 digits');
    }
  };

  const handleCancel = async () => {
    localStorage.clear();
    router.push('/login');
  };

  const getDataSaldo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await API<SaldoResponse>(
        'karyawan/:noba/saldo',
        'GET',
        {
          noba: userData?.noba,
        },
        token,
      );

      setSaldo(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to get saldo data');
    }
  };

  const getDataKaryawan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await API<KaryawanData>(
        'karyawan/:noba',
        'GET',
        {
          noba: userData?.noba,
        },
        token,
      );

      const pin = response.data.pin;
      if (pin) {
        setCreatePinModalOpen(false);
        if (!userData?.pin) {
          localStorage.setItem('pin', String(pin));
          dispatch(setUserData({ ...userData, pin }));
        }
      } else {
        setCreatePinModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to get employee data');
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([getDataKaryawan(), getDataSaldo()])
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    if (!userData.noba) {
      router.push('/login');
      return;
    }

    getDataKaryawan();
    getDataSaldo();
  }, [userData]);

  return (
    <ScreenContainer>
      <Box className="profile-container">
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {userData.nama?.charAt(0) || 'U'}
        </Avatar>
        <Typography className="profile-text">{`Hi, ${userData.nama || 'User'}!`}</Typography>
      </Box>

      <Box className="balance-container">
        <Paper className="balance-card">
          <Box className="balance-icon">
            <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>account_balance</span>
            </Avatar>
          </Box>
          <Box className="balance-info">
            <Typography className="balance-value">{saldo?.saldo_simpan || '0'}</Typography>
            <Typography className="balance-description">Saldo Simpanan</Typography>
          </Box>
        </Paper>
        <Paper className="balance-card">
          <Box className="balance-icon">
            <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>credit_card</span>
            </Avatar>
          </Box>
          <Box className="balance-info">
            <Typography className="balance-value">{saldo?.saldo_pinjaman || '0'}</Typography>
            <Typography className="balance-description">Saldo Pinjam</Typography>
          </Box>
        </Paper>
      </Box>

      <Title text="Info Terbaru" />
      <SliderBanner data={BANNER_DUMMY_DATA} />

      <Title text="Menu Utama" />
      <Menu data={auth.userData.role === 'ADMIN' ? MENU_ADMIN : MENU_NASABAH} />

      {/* Modal for creating a new PIN */}
      <Dialog open={isCreatePinModalOpen} onClose={() => {}} disableEscapeKeyDown>
        <DialogTitle>Buat PIN Baru</DialogTitle>
        <DialogContent>
          <TextField
            label="6 digit PIN"
            type="password"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
            fullWidth
            margin="dense"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.slice(0, 6))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="error">
            Batal
          </Button>
          <Button onClick={handleCreatePin} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenContainer>
  );
}