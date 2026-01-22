import axiosInstance from "@/lib/axios";

// Kiểu dữ liệu gửi lên Backend
interface CreateOrderPayload {
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  items: any[]; 
}

export const orderService = {
  createOrder: async (data: CreateOrderPayload) => {
    const res = await axiosInstance.post("/order/checkout", data);
    return res.data; 
  },
  getMyOrders: async () => {
    const res = await axiosInstance.get("/order/my-orders");
    return res.data.data;
  },
};