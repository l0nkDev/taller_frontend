import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../api/usersApi";

interface AuthState {
  token: string | null;
  user: User | null; 
}

const initialAuthState: AuthState = { 
  token: localStorage.getItem('token') || null, 
  user: JSON.parse(localStorage.getItem('user') || 'null') 
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuthState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;