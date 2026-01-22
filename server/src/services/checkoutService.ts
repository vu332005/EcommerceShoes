import { AppDataSource } from "../config/db";
import { Cart } from "../models/Cart";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Payment } from "../models/Payment";
import { AppError } from "../utils/AppError";
import { createStripePaymentIntent } from "./paymentService"; 

export const createOrderService = async (
    userId: number,
    shippingData: { name: string; phone: string; address: string },
    paymentMethod: string
) => {
    /*
    - dùng createQueryRunner -> để khi bị lỗi 1 trong bất kì bước nào khi tạo đơn hàng -> sẽ kh bị lưu phải đơn hàng lỗi
    vd : - khi lưu order thành công -> đến khi gọi stripe bị lỗi -> code văng lỗi -> hậu quả ta lưu 1 đơn hàng mà k có thông tin thanh toán -> đơn hàng lỗi
    
    await queryRunner.startTransaction():
        + nó gửi tín hiệu begin tới db
        + thông báo các cái gửi lên (lưu đơn, thanh toán, ...) -> không lưu vĩnh viễn vội
        -> khi nào commit thì mới lưu - còn rollback thì xóa sạch
    */
    const queryRunner = AppDataSource.createQueryRunner();// tạo ra 1 ng vận chuyển riêng biệt
    await queryRunner.connect(); // thiết lập dg dây kết nối riêng với db
    await queryRunner.startTransaction(); // bắt đầu transaction

    try {
        // Lấy Cart
        const cart = await queryRunner.manager.findOne(Cart, {
            where: { userId },
            relations: ["items", "items.variant", "items.variant.product", "items.variant.tags"]
        });

        if (!cart || cart.items.length === 0) {
            throw new AppError("Giỏ hàng trống", 400);
        }

        // Tính tổng tiền & Tạo snapshottting để lưu lịch sử dlieu
        let totalAmount = 0;
        const orderItems: OrderItem[] = [];

        for (const cartItem of cart.items) {
            const unitPrice = Number(cartItem.variant.priceOverride || cartItem.variant.product.basePrice); // giá ưu tiên nếu có
            totalAmount += unitPrice * cartItem.quantity;

            // tạo ra 1 chuỗi mô tả ngắn để lưu vào hóa đơn
            const attributes = cartItem.variant.tags
                .filter(t => t.type === 'color' || t.type === 'size')
                .map(t => t.name).join(" / ");

            // data snapshotting
            const orderItem = new OrderItem();
            orderItem.variantId = cartItem.variantId;
            orderItem.productName = cartItem.variant.product.name;
            orderItem.variantDescription = attributes;
            orderItem.quantity = cartItem.quantity;
            orderItem.priceAtPurchase = unitPrice;
            orderItems.push(orderItem);
        }

        // Tạo Order - lưu order vào db
        const order = new Order();
        order.userId = userId;
        order.totalAmount = totalAmount;
        order.shippingFee = 0; // 
        order.shippingName = shippingData.name;
        order.shippingPhone = shippingData.phone;
        order.shippingAddress = shippingData.address;
        order.status = "pending";
        order.items = orderItems;
        // lưu tạm
        const savedOrder = await queryRunner.manager.save(order); 
        /*
        Gán quan hệ (order.items = orderItems):
            orderItems là mảng các món hàng bạn vừa tạo trong vòng lặp trước đó (new OrderItem()...).
            Lúc này, các orderItem này chưa hề có orderId (vì Order đã được lưu đâu mà có ID?).
        queryRunner.manager.save(order):
        - Khi bạn lưu order, TypeORM đủ thông minh để thấy bên trong nó có chứa danh sách items.
            + Bước A: Lưu Order vào DB trước -> Sinh ra order.id (ví dụ: ID = 100).
            + Bước B: Tự động lấy ID = 100 đó, điền vào trường orderId của tất cả các orderItem trong mảng, rồi lưu tiếp danh sách items vào bảng order_items.
        -> Kết quả: Bạn không cần phải viết code lưu Order rồi thủ công lưu từng Item. TypeORM làm hộ bạn nhờ tính năng Cascade.
        */

        // Tạo Payment Record
        const payment = new Payment();
        payment.orderId = savedOrder.id; // lkien với order ms lưu ở trên
        payment.paymentMethod = paymentMethod;
        payment.amount = totalAmount;
        payment.status = "pending";
        
        // logic stripe -> tạo paymentItent - với số tiền cần ttoan và mã đơn hàng trong db
        let clientSecret = null;
        if (paymentMethod === "STRIPE") {
            const intent = await createStripePaymentIntent(totalAmount, savedOrder.id); 
            payment.transactionId = intent.transactionId; // Lưu transactionId 
            clientSecret = intent.clientSecret;
        }

        await queryRunner.manager.save(payment); //save payment

        // Xóa Cart
        await queryRunner.manager.delete("cart_items", { cartId: cart.id });

        await queryRunner.commitTransaction(); // chính thức save dlieu xuống db

        return {
            orderId: savedOrder.id,
            paymentId: payment.id,
            totalAmount: totalAmount,
            clientSecret: clientSecret, // Trả clientSecret cho frontend để tạo thanh toán stripe
            message: "Tạo đơn hàng thành công"
        };

    } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    } finally {
        await queryRunner.release();
    }
};

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