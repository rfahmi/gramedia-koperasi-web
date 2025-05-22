'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Avatar, 
  Box, 
  Button, 
  Card, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle, 
  Divider, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography 
} from '@mui/material';
import { toast } from 'react-toastify';
import { RootState } from '@/configs/redux/store';
import { setAuthenticated, setUserData } from '@/configs/redux/authSlice';
import ScreenContainer from '@/components/ScreenContainer';

export default function Profile() {
  const router = useRouter();
  const dispatch = useDispatch();
  const userData = useSelector((state: RootState) => state.auth.userData);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('pin');
    
    // Reset auth state
    dispatch(setAuthenticated(false));
    dispatch(setUserData({
      nama: null,
      nik: null,
      noba: null,
      pin: null,
      role: null
    }));
    
    // Close logout modal
    setLogoutModalOpen(false);
    
    // Navigate to login page
    router.push('/login');
    toast.info('You have been logged out');
  };

  return (
    <ScreenContainer>
      <Box className="flex flex-col items-center pt-4 pb-8">
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: 'primary.main',
            fontSize: '2rem',
            mb: 2
          }}
        >
          {userData.nama?.charAt(0) || 'U'}
        </Avatar>
        <Typography variant="h5" fontWeight="bold">
          {userData.nama || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          NIK: {userData.nik || '-'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          NOBA: {userData.noba || '-'}
        </Typography>
      </Box>

      <Card>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => router.push('/change-pin')}>
              <ListItemIcon>
                <span className="material-icons">pin</span>
              </ListItemIcon>
              <ListItemText primary="Change PIN" />
            </ListItemButton>
          </ListItem>
          
          <Divider />
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => router.push('/transaction-history')}>
              <ListItemIcon>
                <span className="material-icons">history</span>
              </ListItemIcon>
              <ListItemText primary="Transaction History" />
            </ListItemButton>
          </ListItem>
          
          <Divider />
          
          <ListItem disablePadding>
            <ListItemButton onClick={() => setLogoutModalOpen(true)}>
              <ListItemIcon>
                <span className="material-icons text-red-500">logout</span>
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ color: 'error' }} />
            </ListItemButton>
          </ListItem>
        </List>
      </Card>

      {/* Logout confirmation dialog */}
      <Dialog
        open={isLogoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      >
        <DialogTitle>Logout Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout from your account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </ScreenContainer>
  );
}