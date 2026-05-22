import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

// Import tất cả Models
import { User } from "../models/User";
import { Address } from "../models/Address";
import { Category } from "../models/Category";
import { Product } from "../models/Product";
import { ProductVariant } from "../models/ProductVariant";
import { ProductImage } from "../models/ProductImage";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";
import { Payment } from "../models/Payment";
import { PaymentHistory } from "../models/PaymentHistory";
import { Tag } from "../models/Tag";
import { ChatMessage } from "../models/ChatMessage";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "5433"),
  username: process.env.DB_USERNAME || "admin",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "shoes_shop_db",

  // Bắt buộc cho Supabase — kết nối SSL
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,

  // QUAN TRỌNG: synchronize = false trên production,
  // dùng migrations để quản lý schema an toàn
  synchronize: false,

  // Chỉ log queries trong môi trường development
  logging: process.env.NODE_ENV !== "production",

  entities: [
    User, Address, Category,
    Product, ProductVariant, ProductImage,
    Cart, CartItem, Order, OrderItem, Tag, Payment,
    PaymentHistory, ChatMessage
  ],
  subscribers: [],

  // Chỉ load files migration khi chạy lệnh typeorm CLI, tránh lỗi import lúc chạy server
  migrations: process.argv.join(" ").includes("typeorm")
    ? ["src/migrations/*.ts"]
    : [],
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(" PostgreSQL Connected Successfully!");
  } catch (error) {
    console.error(" KẾT NỐI THẤT BẠI:", error);
    process.exit(1);
  }
};