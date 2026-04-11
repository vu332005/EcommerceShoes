import { AppDataSource } from "../config/db";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Payment } from "../models/Payment";
import { ProductVariant } from "../models/ProductVariant";
import { AppError } from "../utils/AppError";
import { createStripePaymentIntent } from "./paymentService";
import redis from "../config/redis"; // Import Redis

const getCartKey = (userId: number) => `cart:${userId}`;

export const getMyOrdersService = async (userId: number) => {
  const orderRepo = AppDataSource.getRepository(Order);

  const orders = await orderRepo.find({
    where: { userId },
    relations: [
      "items",
      "items.variant",
      "items.variant.product",
      "items.variant.images",
      "payments",
    ],
    order: { createdAt: "DESC" },
  });

  return orders;
};

export const createOrderService = async (
  userId: number,
  shippingData: { name: string; phone: string; address: string },
  paymentMethod: string,
) => {
  const key = getCartKey(userId);
  const cartHash = await redis.hgetall(key);

  if (!cartHash || Object.keys(cartHash).length === 0) {
    throw new AppError("Giỏ hàng trống", 400);
  }

  const cartItemsRedis = Object.entries(cartHash).map(([vId, qty]) => ({
    variantId: Number(vId),
    quantity: Number(qty),
  }));

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  let totalAmount = 0;
  let savedOrder: Order;
  const variantsToInvalidateCache: number[] = [];

  try {
    const orderItems: OrderItem[] = [];
    for (const item of cartItemsRedis) {
      //  1: TÌM VÀ KHÓA DUY NHẤT BẢNG VARIANT
      const variantInfo = await queryRunner.manager.findOne(ProductVariant, {
        where: { id: item.variantId },
        lock: { mode: "pessimistic_write" }, // k đc để relations ở đây
      });

      if (!variantInfo)
        throw new AppError(`Sản phẩm ID ${item.variantId} không tồn tại`, 404);

      // Kiểm tra tồn kho ngay lập tức
      if (variantInfo.stockQuantity < item.quantity) {
        throw new AppError(
          `Sản phẩm ID ${item.variantId} không đủ số lượng (Chỉ còn ${variantInfo.stockQuantity})`,
          400,
        );
      }

      //  2: LẤY THÊM DỮ LIỆU PRODUCT & TAGS (Không dùng Lock)
      const variantRelations = await queryRunner.manager.findOne(
        ProductVariant,
        {
          where: { id: item.variantId },
          relations: ["product", "tags"],
        },
      );

      // Trừ tồn kho và Lưu lại (variantInfo lúc này đang bị khóa, ghi đè an toàn)
      variantInfo.stockQuantity -= item.quantity;
      await queryRunner.manager.save(variantInfo);
      variantsToInvalidateCache.push(variantInfo.id);
      //  3: TÍNH TIỀN VÀ TẠO ORDER ITEM TỪ DỮ LIỆU ĐÃ NỐI
      const unitPrice = Number(
        variantInfo.priceOverride || variantRelations!.product.basePrice,
      );
      totalAmount += unitPrice * item.quantity;

      const attributes = variantRelations!.tags
        .filter((t) => t.type === "color" || t.type === "size")
        .map((t) => t.name)
        .join(" / ");

      const orderItem = new OrderItem();
      orderItem.variantId = item.variantId;
      orderItem.productName = variantRelations!.product.name;
      orderItem.variantDescription = attributes;
      orderItem.quantity = item.quantity;
      orderItem.priceAtPurchase = unitPrice;
      orderItems.push(orderItem);
    }

    const order = new Order();
    order.userId = userId;
    order.totalAmount = totalAmount; // Gán totalAmount
    order.shippingFee = 0; // Gán shippingFee
    order.shippingName = shippingData.name;
    order.shippingPhone = shippingData.phone;
    order.shippingAddress = shippingData.address;
    order.status = "pending";
    order.items = orderItems;

    savedOrder = await queryRunner.manager.save(order);

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }

  // B2: XỬ LÝ API BÊN NGOÀI (SAU KHI DB ĐÃ AN TOÀN)

  let clientSecret: string | undefined = undefined;
  let transactionId: string | undefined = undefined;

  try {
    if (paymentMethod === "STRIPE") {
      const intent = await createStripePaymentIntent(
        totalAmount,
        savedOrder!.id, // Thêm ! để đảm bảo lúc này order đã được lưu
      );
      clientSecret = intent.clientSecret ?? undefined;
      transactionId = intent.transactionId ?? undefined;
    }

    const paymentRepo = AppDataSource.getRepository(Payment);
    const payment = paymentRepo.create({
      order: { id: savedOrder!.id }, // Gán qua relation 'order' thay vì 'orderId'
      paymentMethod,
      amount: totalAmount,
      status: "pending",
      transactionId, // Type lúc này là string | undefined, Entity sẽ cho qua
    });

    await paymentRepo.save(payment);
  } catch (paymentError) {
    console.error("Lỗi tạo thanh toán Stripe:", paymentError);
  }

  // B3: DỌN DẸP CACHE (LAZY LOADING)

  await redis.del(key);

  if (variantsToInvalidateCache.length > 0) {
    const pipeline = redis.pipeline();
    variantsToInvalidateCache.forEach((vId) => {
      pipeline.del(`product_info:${vId}`);
    });
    await pipeline.exec();
  }

  return {
    orderId: savedOrder!.id,
    totalAmount,
    clientSecret,
    message: "Tạo đơn hàng thành công",
  };
};

/**
+ lock: { mode: "pessimistic_write" }: Mình chuyển DB Query từ lấy toàn bộ mảng ID sang findOne với Lock cho từng Item. 
-> Cách này dễ kiểm soát tồn kho hơn và chắc chắn không thằng B nào xen vào mua đè lên lúc thằng A đang thanh toán.

+ variantInfo.stockQuantity -= item.quantity: Đã khắc phục lỗi quên trừ tồn kho.

+ Chuyển Stripe ra ngoài Transaction: Giao dịch DB đóng lại cực nhanh. 
-> Hệ thống chịu tải cao hơn rất nhiều. Lỡ Stripe sập, dữ liệu đơn hàng (Order) vẫn được bảo toàn để khách thử thanh toán lại.

+ Xóa Cache hàng loạt bằng Pipeline: Những đôi giày nào vừa bị khách mua mất, ta gọi pipeline.del xóa key cache của nó.
->  Người mua tiếp theo load trang giày sẽ nhận được dữ liệu tồn kho mới nhất. 

 */
