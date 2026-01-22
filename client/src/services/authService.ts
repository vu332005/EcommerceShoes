import axiosInstance from "@/lib/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export const authService = {
  register: async (data: RegisterPayload) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginPayload) => {
    const response = await axiosInstance.post("/auth/login", data);
    // Backend trả về: { status: "success", data: { user, accessToken, refreshToken } }
    return response.data; 
  },

  getMe: async () => {
    const response = await axiosInstance.get("/auth/me");
    return response.data;
  },
};