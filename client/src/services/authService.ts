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
    return response.data; // renturn response.data -> vì thg axios nó luôn trả về 1 object chứa rất nhiều thông tin kỹ thuật (status code 200, headers, config...), và nội dung thực sự mà Server trả về sẽ luôn luôn nằm trong thuộc tính .data.
  },

  updateProfile: async (data: any) => {
    const response = await axiosInstance.put("/auth/me", data);
    return response.data;
  },

  loginFacebook: async (accessToken: string) => {
    // Gửi token sang backend của mình
    const response = await axiosInstance.post("/auth/facebook", { accessToken });
    return response.data;
  },
};