import { AppDataSource } from "../config/db";
import { Payment } from "../models/Payment";
import { PaymentHistory } from "../models/PaymentHistory";
import { Order } from "../models/Order";
import { AppError } from "../utils/AppError";
import Stripe from "stripe";

// Khởi tạo Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-12-18.acacia" as any, 
});

const paymentRepo = AppDataSource.getRepository(Payment);
const historyRepo = AppDataSource.getRepository(PaymentHistory);
const orderRepo = AppDataSource.getRepository(Order);

// Tạo Payment Intent (Dùng khi checkout)
export const createStripePaymentIntent = async (amount: number, orderId: number) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "vnd",

        // gắn thẻ dlieu 
        /*
        metadate cho phép gửi kèm bki dlieu gì lên stripe - ở đây ta gửi orderid lên
        - vì khi thanh toán xong -> stripe chỉ bt thu dc bnh tiền chứ kbt của đơn hàng nào để cập nhật
        -> Khi Webhook payment_intent.succeeded được gửi về, nó sẽ trả lại nguyên vẹn cái metadata.orderId này
        -> Nhờ đó, hàm processStripeWebhook mới biết đường tìm đơn hàng trong DB để update.
        */ 
        metadata: {
            orderId: orderId.toString(),
        },
        automatic_payment_methods: {
            enabled: true,
        },
    });

    //
    return {
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentIntent.id // dùng để tra cứu mã giao dịch cho stripe sinh ra
    };
};

/*
- sau khi chạy stripe.confirmPayment thành công -> thẻ hợp lệ và tiền đã trừ
- khi đó server của stripe sẽ POST request đến /api/v1/order/webhook/stripe. (đây là đchi mà ta đăng ký nhận res của stripe)
    + Nhận gói tin, kiểm tra chữ ký bảo mật.
    + Hàm processStripeWebhook chạy.
    + Nó nhận sự kiện payment_intent.succeeded.
    + Nó lấy orderId từ metadata.
    - Nó tìm vào Database:
        + Sửa trạng thái Payment từ pending -> success.
        + Sửa trạng thái Order từ pending -> confirmed.
*/
export const processStripeWebhook = async (signature: string, rawBody: any) => {
    let event;

    //check đúng gói tin do stripe gửi
    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        throw new AppError(`Webhook Error: ${err.message}`, 400);
    }

    //chạy khi giao dịch thành công
    if (event.type === "payment_intent.succeeded") {
        //trích xuất dlieu 
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = Number(paymentIntent.metadata.orderId);
        const transactionId = paymentIntent.id;

        console.log(`Stripe: Thanh toán thành công đơn hàng #${orderId}`);

        // cập nhật db
        // Tìm payment
        const payment = await paymentRepo.findOne({ where: { orderId } });

        if (payment) {
            // Lưu history -> lưu payload stripe gửi để nếu cần check lại
            const history = historyRepo.create({
                paymentId: payment.id,
                status: "success",
                payload: paymentIntent as any
            });
            await historyRepo.save(history);

            // Update Payment
            payment.status = "success";
            payment.amount = paymentIntent.amount;
            payment.transactionId = transactionId;
            await paymentRepo.save(payment); //

            // Update Order
            await orderRepo.update(orderId, { status: "confirmed" });
        }
    }

    return { received: true }; //xác nhận là ok vs stripe
};

