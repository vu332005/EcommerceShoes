import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie"; // 

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
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

      // --- THÊM PHẦN NÀY CHO MIDDLEWARE ---
        // Lưu AccessToken vào Cookie để Middleware đọc được
        Cookies.set("accessToken", action.payload.accessToken, { 
            expires: 15/86400, // 1 ngày
            path: "/",
            secure: process.env.NODE_ENV === "production" // Chỉ https nếu ở production
        });
        // Middleware cần cái này để xin cấp lại token mới
        Cookies.set("refreshToken", action.payload.refreshToken, { 
            expires: 7,
            path: "/", 
            secure: process.env.NODE_ENV === "production" 
    });
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        if (typeof window !== "undefined") { // Kiểm tra để tránh lỗi nếu code này chạy trên Server (Next.js SSR).
          localStorage.setItem("user", JSON.stringify(state.user)); // lưu vào ls -> để tránh khi reload -> Redux (state.user) chỉ sống trên RAM. Nếu sửa tên xong, Redux đã cập nhật, giao diện đã đổi. Nhưng nếu F5 (tải lại trang), Redux bị reset.
        }
      }
    },

    // Action này dùng để cập nhật lại accessToken mới sau khi refresh thành công
    updateAccessToken: (state, action: PayloadAction<string>) => {
        state.accessToken = action.payload;
        if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", action.payload);
            Cookies.set("accessToken", state.accessToken, { expires: 15/86400, path: "/" });
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

        //  Xóa sạch Cookie 
        Cookies.remove("accessToken", { path: '/' }); // Nhớ remove đúng path
        Cookies.remove("refreshToken", { path: '/' });
      }
    },
    hydrateAuth: (state) => {
      if (typeof window !== "undefined") {
        const localToken = localStorage.getItem("accessToken");
        const cookieToken = Cookies.get("accessToken"); 
        const userStr = localStorage.getItem("user");

        // Ưu tiên Token từ Cookie (vì Middleware có thể vừa refresh xong)
        let finalToken = localToken;
        if (cookieToken && cookieToken !== localToken) {
             finalToken = cookieToken;
             localStorage.setItem("accessToken", finalToken || "");
        }

        if (finalToken && userStr) {
          try {
            state.accessToken = finalToken;
            state.refreshToken = localStorage.getItem("refreshToken"); 
            state.user = JSON.parse(userStr);
            state.isAuthenticated = true;
          } catch (e) {
            console.error("Hydrate error", e);
          }
        }
      }
    },
  },
});

export const { loginSuccess, logout, hydrateAuth, updateAccessToken, updateUser } = authSlice.actions;
export default authSlice.reducer;