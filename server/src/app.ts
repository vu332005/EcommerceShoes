import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import rootRouter from "./routes"; 
import { stripeWebhook } from "./controllers/orderController"; 

const app: Express = express();

// 1. Middlewares
app.use(helmet());

// CORS — Chỉ cho phép domain được cấu hình trong FRONTEND_URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "stripe-signature"],
  })
);

//  QUAN TRỌNG: Route Webhook Stripe phải đặt TRƯỚC express.json()
/*
- Khi Stripe gửi Webhook (thông báo thanh toán thành công) đến server -> họ gửi kèm một chữ ký điện tử (stripe-signature header).
Quy tắc: Để xác thực chữ ký này -> phải dùng chính xác dữ liệu thô (Raw Body) mà Stripe gửi đến để băm (hash) và so sánh.
    -> nếu để sau express.json() -> nó sẽ tự động biến dlieu thô -> obj -> kh dc
*/
app.post(
  "/api/v1/order/webhook/stripe",
  express.raw({ type: "application/json" }), // 
  stripeWebhook // Gọi trực tiếp controller
);

// Tăng giới hạn lên 50MB (hoặc tuỳ ý) để chấp nhận ảnh Base64 **!
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware — chỉ chạy khi không ở môi trường production
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
  });
}

// 2. Routes
app.use("/api/v1", rootRouter);

// 3. Health Check
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running " });
});

// XỬ LÝ LỖI TỔNG
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(" ERROR LOG:", err);
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';

    if (err.isOperational) {
        return res.status(statusCode).json({
            status: status,
            message: err.message,
        });
    }

    // Production: KHÔNG trả stack trace ra client để tránh lộ thông tin hệ thống
    return res.status(500).json({
        status: "error",
        message: process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : err.message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
});

export default app;