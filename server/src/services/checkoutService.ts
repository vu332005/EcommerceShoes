
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
            "payments"
        ],
        order: { createdAt: "DESC" }
    });

    return orders;
};

export const createOrderService = async (
    userId: number,
    shippingData: { name: string; phone: string; address: string },
    paymentMethod: string
) => {
    const key = getCartKey(userId);

    const cartHash = await redis.hgetall(key);
    // Kiểm tra rỗng
    if (!cartHash || Object.keys(cartHash).length === 0) {
        throw new AppError("Giỏ hàng trống", 400);
    }
    // Convert từ Hash { "101": "2" } sang Array [{ variantId: 101, quantity: 2 }]
    const cartItemsRedis = Object.entries(cartHash).map(([vId, qty]) => ({
        variantId: Number(vId),
        quantity: Number(qty)
    }));

    // Lấy thông tin giá từ DB (để bảo mật giá)
    const variantRepo = AppDataSource.getRepository(ProductVariant);
    const variantIds = cartItemsRedis.map(i => i.variantId);
    
    const dbVariants = await variantRepo.find({
        where: { id: require("typeorm").In(variantIds) },
        relations: ["product", "tags"]
    });

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        // Duyệt qua Redis items để tạo OrderItems
        for (const item of cartItemsRedis) {
            const variantInfo = dbVariants.find(v => v.id === item.variantId);
            if (!variantInfo) continue; 

            const unitPrice = Number(variantInfo.priceOverride || variantInfo.product.basePrice);
            totalAmount += unitPrice * item.quantity;

            const attributes = variantInfo.tags
                .filter(t => t.type === 'color' || t.type === 'size')
                .map(t => t.name).join(" / ");

            const orderItem = new OrderItem();
            orderItem.variantId = item.variantId;
            orderItem.productName = variantInfo.product.name;
            orderItem.variantDescription = attributes;
            orderItem.quantity = item.quantity;
            orderItem.priceAtPurchase = unitPrice;
            orderItems.push(orderItem);
        }

        if (orderItems.length === 0) throw new AppError("Sản phẩm không khả dụng", 400);

        // Tạo Order
        const order = new Order();
        order.userId = userId;
        order.totalAmount = totalAmount;
        order.shippingFee = 0;
        order.shippingName = shippingData.name;
        order.shippingPhone = shippingData.phone;
        order.shippingAddress = shippingData.address;
        order.status = "pending";
        order.items = orderItems; // TypeORM sẽ tự save items

        const savedOrder = await queryRunner.manager.save(order);

        // Tạo Payment
        const payment = new Payment();
        payment.orderId = savedOrder.id;
        payment.paymentMethod = paymentMethod;
        payment.amount = totalAmount;
        payment.status = "pending";

        let clientSecret = null;
        if (paymentMethod === "STRIPE") {
            const intent = await createStripePaymentIntent(totalAmount, savedOrder.id);
            payment.transactionId = intent.transactionId;
            clientSecret = intent.clientSecret;
        }

        await queryRunner.manager.save(payment);

        await queryRunner.commitTransaction();

        // QUAN TRỌNG: Xóa giỏ hàng trong REDIS sau khi đặt thành công
        await redis.del(key);

        return {
            orderId: savedOrder.id,
            totalAmount,
            clientSecret,
            message: "Tạo đơn hàng thành công"
        };

    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};
