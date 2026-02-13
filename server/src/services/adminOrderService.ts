import { AppDataSource } from "../config/db";
import { Order } from "../models/Order";
import { AppError } from "../utils/AppError";

const orderRepo = AppDataSource.getRepository(Order);

export const getAllOrders = async (params: any) => {
  const { page = 1, limit = 10, status, keyword } = params;

  const query = orderRepo.createQueryBuilder("order")
    .leftJoinAndSelect("order.user", "user") // Join bảng User để lấy email/tên
    .leftJoinAndSelect("order.items", "items") // Join items để xem chi tiết
    .leftJoinAndSelect("order.payments", "payment") // Join payment để xem đã trả tiền chưa
    .orderBy("order.createdAt", "DESC");

  // Filter status
  if (status) {
    query.andWhere("order.status = :status", { status });
  }

  // Filter -> search 
  if (keyword) {
    query.andWhere(
      "(order.id::text ILIKE :keyword OR order.shippingName ILIKE :keyword OR order.shippingPhone ILIKE :keyword)", 
      { keyword: `%${keyword}%` }
    );
  }

  const skip = (page - 1) * limit;
  const [data, total] = await query.skip(skip).take(limit).getManyAndCount();

  return { 
    data, 
    total, 
    page, 
    totalPages: Math.ceil(total / limit) 
  };
};

export const updateOrderStatus = async (orderId: number, status: string) => {
  const order = await orderRepo.findOneBy({ id: orderId });
  if (!order) throw new AppError("Đơn hàng không tồn tại", 404);

  order.status = status;
  
  return await orderRepo.save(order);
};

export const getOrderDetail = async (orderId: number) => {
    return await orderRepo.findOne({
        where: { id: orderId },
        relations: ["items", "items.variant", "items.variant.product", "payments", "user"]
    });
};