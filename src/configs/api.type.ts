export type LoginResponse = {
  nik: string;
  noba: string;
  nama: string;
  pin: number;
  token: string;
};

export type SaldoResponse = {
  saldo_pinjaman: string;
  saldo_simpan: string;
};

export type KaryawanData = {
  recid: number;
  nik: string;
  noba: string;
  nama: string;
  pin: number;
  lokasi: string | null;
};

export type Transaction = {
  recid: number;
  Tanggal: string;
  jenistrx: string;
  nilai: number;
  crdb: string;
};