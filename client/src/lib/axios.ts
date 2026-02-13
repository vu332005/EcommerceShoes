import axios from "axios";
import Cookies from "js-cookie";
import { store } from "@/redux/store"; 
import { updateAccessToken, logout } from "@/redux/features/authSlice";

// Tạo instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Request Interceptor ---
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa từng thử retry (để tránh vòng lặp vô hạn)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử retry

      try {
        // 1. Lấy refreshToken từ storage
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // Không có refresh token thì logout luôn
          throw new Error("No refresh token available");
        }

        // 2. Gọi API refresh token
        // Lưu ý: Dùng axios gốc để tránh bị interceptor của axiosInstance chặn lại nếu call này cũng lỗi
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          { refreshToken }
        );

        // 3. Lấy token mới từ response (Backend trả về: { data: { newAccessToken: "..." } })
        const { accessToken } = response.data.data;

        store.dispatch(updateAccessToken(accessToken));

        // 4. Lưu token mới vào LocalStorage
        localStorage.setItem("accessToken", accessToken);

        Cookies.set("accessToken", accessToken, { 
            expires: 15/86400, // 1 ngày (hoặc setup theo logic của bạn)
            path: "/" 
        });

        // 5. Cập nhật header cho request đang bị lỗi
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Cập nhật default header cho các request sau này
        if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        } else {
            originalRequest.headers = { Authorization: `Bearer ${accessToken}` };
        }
        // 6. Thực hiện lại request ban đầu
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
        
        // Xóa sạch storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Điều hướng về trang login
        window.location.href = "/login";
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;