import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../middlewares/authMiddleware";
import * as checkoutService from "../services/checkoutService";
import * as paymentService from "../services/paymentService";
import { AppDataSource } from "../config/db";
import { Order } from "../models/Order";

// API: POST /api/v1/order/checkout
export const checkout = catchAsync(async (req: AuthRequest, res: Response) => {
    const { shippingName, shippingPhone, shippingAddress, paymentMethod } = req.body;

    if (!shippingName || !shippingPhone || !shippingAddress || !paymentMethod) {
        return res.status(400).json({ 
            status: "error", 
            message: "Vui lòng cung cấp đầy đủ thông tin giao hàng và phương thức thanh toán" 
        });
    }

    const result = await checkoutService.createOrderService(
        req.user.id,
        { 
            name: shippingName, 
            phone: shippingPhone, 
            address: shippingAddress 
        },
        paymentMethod
    );

    res.status(201).json({ status: "success", data: result });
});

// Webhook Stripe 
export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"];
    // req.body ở đây phải là Raw Buffer (cấu hình ở app.ts)
    await paymentService.processStripeWebhook(sig as string, req.body);
    res.status(200).json({ received: true });
});

export const getMyOrders = catchAsync(async (req: AuthRequest, res: Response) => {
    // Lấy input
    const userId = req.user.id;

    // Gọi Service xử lý
    const orders = await checkoutService.getMyOrdersService(userId);

    // Trả về kết quả
    res.status(200).json({ 
        status: "success", 
        data: orders 
    });
});