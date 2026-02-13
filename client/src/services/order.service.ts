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

  // Lấy tất cả đơn hàng (có phân trang, lọc trạng thái, tìm kiếm)
  getAllOrdersAdmin: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    keyword?: string;
  }) => {
    const res = await axiosInstance.get("/order/admin/all", { params });
    return res.data;
  },

  // Cập nhật trạng thái đơn hàng 
  updateOrderStatus: async (id: number, status: string) => {
    const res = await axiosInstance.put(`/order/admin/${id}/status`, {
      status,
    });
    return res.data;
  },

  // Xem chi tiết đơn hàng (Admin xem)
  getOrderDetailAdmin: async (id: number) => {
    const res = await axiosInstance.get(`/order/admin/${id}`);
    return res.data;
  },
};