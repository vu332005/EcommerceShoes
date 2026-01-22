import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null; 
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken; 
      state.isAuthenticated = true;

      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken); 
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    // Action này dùng để cập nhật lại accessToken mới sau khi refresh thành công
    updateAccessToken: (state, action: PayloadAction<string>) => {
        state.accessToken = action.payload;
        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", action.payload);
        }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken"); 
        localStorage.removeItem("user");
      }
    },
    hydrateAuth: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("accessToken");
        const rToken = localStorage.getItem("refreshToken"); 
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser && typeof parsedUser === "object") {
              state.accessToken = token;
              state.refreshToken = rToken; 
              state.user = parsedUser;
              state.isAuthenticated = true;
            }
          } catch (error) {
            console.error("Lỗi dữ liệu LocalStorage:", error);
            localStorage.clear();
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
          }
        }
      }
    },
  },
});

export const { loginSuccess, logout, hydrateAuth, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;