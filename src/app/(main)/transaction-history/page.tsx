'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material';
import moment from 'moment';
import { toast } from 'react-toastify';
import { RootState } from '@/configs/redux/store';
import { API } from '@/configs/api';
import { Transaction } from '@/configs/api.type';
import ScreenContainer from '@/components/ScreenContainer';
import Title from '@/components/Title';

export default function TransactionHistory() {
  const router = useRouter();
  const userData = useSelector((state: RootState) => state.auth.userData);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Format number as Indonesian Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTransactionData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !userData.noba) {
        toast.error('Authentication error. Please login again.');
        router.push('/login');
        return;
      }

      const response = await API<Transaction[]>(
        'karyawan/:noba/transaksi',
        'GET',
        {
          noba: userData.noba,
        },
        token,
      );

      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transaction history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userData.noba) {
      router.push('/login');
      return;
    }
    
    getTransactionData();
  }, [userData, router]);

  const getTransactionIcon = (type: string, crdb: string) => {
    if (type.includes('PINJAM')) {
      return <span className="material-icons text-blue-500">credit_card</span>;
    } else if (type.includes('SIMPAN')) {
      return <span className="material-icons text-green-500">savings</span>;
    } else if (type.includes('TARIK')) {
      return <span className="material-icons text-amber-500">account_balance_wallet</span>;
    } else {
      return <span className="material-icons text-gray-500">receipt</span>;
    }
  };

  return (
    <ScreenContainer>
      <Box className="flex items-center mb-2">
        <IconButton onClick={() => router.back()} edge="start">
          <span className="material-icons">arrow_back</span>
        </IconButton>
        <Title text="Transaction History" />
      </Box>

      {isLoading ? (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      ) : transactions.length === 0 ? (
        <Box className="flex justify-center items-center h-64 text-center">
          <Typography variant="body1" color="text.secondary">
            No transaction history available
          </Typography>
        </Box>
      ) : (
        <Card>
          <List>
            {transactions.map((transaction, index) => (
              <Box key={transaction.recid || index}>
                {index > 0 && <Divider />}
                <ListItem>
                  <Box className="mr-3">
                    {getTransactionIcon(transaction.jenistrx, transaction.crdb)}
                  </Box>
                  <ListItemText
                    primary={transaction.jenistrx}
                    secondary={moment(transaction.Tanggal).format('DD MMM YYYY')}
                  />
                  <Typography
                    variant="body1"
                    color={transaction.crdb === 'C' ? 'success.main' : 'error.main'}
                    fontWeight="medium"
                  >
                    {transaction.crdb === 'C' ? '+ ' : '- '}
                    {formatRupiah(transaction.nilai)}
                  </Typography>
                </ListItem>
              </Box>
            ))}
          </List>
        </Card>
      )}
    </ScreenContainer>
  );
}