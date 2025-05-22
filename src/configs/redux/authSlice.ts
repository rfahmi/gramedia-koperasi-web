// authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserData {
  pin?: number | null;
  role?: 'NASABAH' | 'ADMIN' | null;
  nama: string | null;
  nik: string | null;
  noba: string | null;
}

export interface AuthState {
  authenticated: boolean;
  userData: UserData;
}

const initialState: AuthState = {
  authenticated: false,
  userData: {
    pin: null,
    role: null,
    nama: null,
    nik: null,
    noba: null,
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.authenticated = action.payload;
    },
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
  },
});

export const { setAuthenticated, setUserData } = authSlice.actions;
export default authSlice.reducer;