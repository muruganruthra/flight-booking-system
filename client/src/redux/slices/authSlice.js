import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import authService from "../../services/authService";

// Register
export const register = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Registration failed";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Login failed";

      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async () => {
    authService.logout();
  }
);

const savedUser = authService.getCurrentUser();

const initialState = {
  user: savedUser,
  token: authService.getToken(),
  isAuthenticated: !!savedUser,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    clearAuthMessage: (state) => {
      state.message = "";
      state.isError = false;
      state.isSuccess = false;
    },
  },

  extraReducers: (builder) => {
    builder

      // REGISTER
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
      })

      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGIN
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = "";
      })

      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.message = action.payload.message;
      })

      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      });
  },
});

export const { clearAuthMessage } = authSlice.actions;

export default authSlice.reducer;