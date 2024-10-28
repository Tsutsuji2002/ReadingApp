import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,  // Default user state
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    }
  }
});

export const { setUser, setLoading, setError, clearUser } = authSlice.actions;

export default authSlice.reducer;
