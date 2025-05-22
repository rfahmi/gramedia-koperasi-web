'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import moment from 'moment';
import { toast } from 'react-toastify';
import { RootState } from '@/configs/redux/store';
import { API } from '@/configs/api';
import { SaldoResponse, Transaction } from '@/configs/api.type';
import ScreenContainer from '@/components/ScreenContainer';
import Title from '@/components/Title';

export default function Pinjaman() {
  const router = useRouter();
  const userData = useSelector((state: RootState) => state.auth.userData);
  const [isLoading, setIsLoading] = useState(true);
  const [saldo, setSaldo] = useState<SaldoResponse | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Format number as Indonesian Rupiah
  const formatRupiah = (value: number | string) => {
    const numberValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(numberValue);
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token || !userData.noba) {
        toast.error('Authentication error. Please login again.');
        router.push('/login');
        return;
      }

      // Fetch balance data
      const saldoResponse = await API<SaldoResponse>(
        'karyawan/:noba/saldo',
        'GET',
        {
          noba: userData.noba,
        },
        token,
      );

      setSaldo(saldoResponse.data);

      // Fetch transaction data
      const transactionsResponse = await API<Transaction[]>(
        'karyawan/:noba/transaksi',
        'GET',
        {
          noba: userData.noba,
        },
        token,
      );

      // Filter only loan-related transactions
      const loanTransactions = transactionsResponse.data.filter(
        transaction => transaction.jenistrx.includes('PINJAM') || transaction.jenistrx.includes('ANGSUR')
      );

      setTransactions(loanTransactions);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load loan data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userData.noba) {
      router.push('/login');
      return;
    }
    
    fetchData();
  }, [userData, router]);

  return (
    <ScreenContainer>
      <Title text="Pinjaman" />

      {isLoading ? (
        <Box className="flex justify-center items-center h-64">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Paper className="p-4 mb-4 rounded-lg bg-blue-50">
            <Typography variant="subtitle2" color="text.secondary">
              Total Pinjaman
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary" className="mb-2">
              {saldo ? formatRupiah(saldo.saldo_pinjaman) : 'Rp 0'}
            </Typography>
            <Button
              variant="contained"
              size="small"
              color="primary"
              onClick={() => router.push('/pengajuan-pinjam')}
              startIcon={<span className="material-icons">credit_card</span>}
            >
              Ajukan Pinjaman
            </Button>
          </Paper>

          <Box className="mb-4">
            <Typography variant="subtitle1" fontWeight="medium" className="mb-2">
              Riwayat Transaksi Pinjaman
            </Typography>

            {transactions.length === 0 ? (
              <Card className="p-4 text-center">
                <Typography variant="body2" color="text.secondary">
                  No loan transaction history available
                </Typography>
              </Card>
            ) : (
              <Card>
                <List>
                  {transactions.map((transaction, index) => (
                    <Box key={transaction.recid || index}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <Box className="mr-3">
                          {transaction.jenistrx.includes('PINJAM') ? (
                            <span className="material-icons text-blue-500">credit_card</span>
                          ) : (
                            <span className="material-icons text-green-500">payments</span>
                          )}
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
          </Box>

          <Box className="mb-2">
            <Button
              variant="outlined"
              fullWidth
              color="primary"
              onClick={() => router.push('/simulasi-angsuran')}
              startIcon={<span className="material-icons">calculate</span>}
            >
              Simulasi Angsuran
            </Button>
          </Box>
        </>
      )}
    </ScreenContainer>
  );
}