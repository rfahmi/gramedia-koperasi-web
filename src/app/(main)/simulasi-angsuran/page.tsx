'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  IconButton,
  Paper,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ScreenContainer from '@/components/ScreenContainer';
import Title from '@/components/Title';

export default function SimulasiAngsuran() {
  const router = useRouter();
  const [amount, setAmount] = useState(5000000);
  const [tenor, setTenor] = useState(6);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [interestAmount, setInterestAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentSchedule, setPaymentSchedule] = useState<Array<{month: number; remaining: number; principal: number; interest: number; total: number}>>([]);

  // Format number as Indonesian Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate loan details
  const calculateLoan = () => {
    // Interest rate (1% per month)
    const interestRate = 0.01;
    
    // Calculate monthly interest
    const monthlyInterest = amount * interestRate;
    
    // Calculate principal per month
    const principalPerMonth = amount / tenor;
    
    // Calculate monthly payment (principal + interest)
    const monthly = principalPerMonth + monthlyInterest;
    
    // Calculate total interest over loan period
    const totalInterest = monthlyInterest * tenor;
    
    // Calculate total amount to be paid
    const total = amount + totalInterest;
    
    setMonthlyPayment(monthly);
    setInterestAmount(totalInterest);
    setTotalAmount(total);
    
    // Generate payment schedule
    const schedule = [];
    let remainingBalance = amount;
    
    for (let i = 1; i <= tenor; i++) {
      const interest = remainingBalance * interestRate;
      const principal = principalPerMonth;
      const payment = principal + interest;
      remainingBalance -= principal;
      
      schedule.push({
        month: i,
        principal,
        interest,
        total: payment,
        remaining: remainingBalance > 0 ? remainingBalance : 0,
      });
    }
    
    setPaymentSchedule(schedule);
  };

  // Recalculate loan details when amount or tenor changes
  useEffect(() => {
    calculateLoan();
  }, [amount, tenor]);

  return (
    <ScreenContainer>
      <Box className="flex items-center mb-4">
        <IconButton onClick={() => router.back()} edge="start">
          <span className="material-icons">arrow_back</span>
        </IconButton>
        <Title text="Simulasi Angsuran" />
      </Box>

      <Typography variant="body2" color="text.secondary" className="mb-4">
        Simulasikan pinjaman Anda dan lihat estimasi cicilan bulanan.
      </Typography>

      <Card className="p-4 mb-6">
        <Box className="mb-5">
          <Typography gutterBottom>Jumlah Pinjaman</Typography>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {formatRupiah(amount)}
          </Typography>
          <Slider
            min={1000000}
            max={20000000}
            step={500000}
            value={amount}
            onChange={(_, newValue) => setAmount(newValue as number)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => formatRupiah(value)}
          />
          <Box className="flex justify-between text-xs text-gray-500">
            <Typography variant="caption">Rp 1.000.000</Typography>
            <Typography variant="caption">Rp 20.000.000</Typography>
          </Box>
        </Box>

        <Box className="mb-3">
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
      </Card>

      <Paper className="p-4 mb-6">
        <Typography variant="subtitle2" color="text.secondary" className="mb-2">
          Ringkasan Pinjaman
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Pokok Pinjaman
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatRupiah(amount)}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Jangka Waktu
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {tenor} bulan
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Total Bunga
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {formatRupiah(interestAmount)}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Suku Bunga
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              1% / bulan
            </Typography>
          </Grid>
        </Grid>
        
        <Divider className="my-3" />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Cicilan per Bulan
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {formatRupiah(monthlyPayment)}
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Total Pembayaran
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              {formatRupiah(totalAmount)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="subtitle1" fontWeight="medium" className="mb-2">
        Jadwal Angsuran
      </Typography>
      
      <TableContainer component={Paper} className="mb-4">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Bulan</TableCell>
              <TableCell align="right">Pokok</TableCell>
              <TableCell align="right">Bunga</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Sisa</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentSchedule.map((row) => (
              <TableRow key={row.month}>
                <TableCell component="th" scope="row">
                  {row.month}
                </TableCell>
                <TableCell align="right">{formatRupiah(row.principal)}</TableCell>
                <TableCell align="right">{formatRupiah(row.interest)}</TableCell>
                <TableCell align="right">{formatRupiah(row.total)}</TableCell>
                <TableCell align="right">{formatRupiah(row.remaining)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Button
        variant="contained"
        fullWidth
        color="primary"
        onClick={() => router.push('/pengajuan-pinjam')}
        startIcon={<span className="material-icons">credit_card</span>}
        className="mb-4"
      >
        Ajukan Pinjaman
      </Button>
    </ScreenContainer>
  );
}