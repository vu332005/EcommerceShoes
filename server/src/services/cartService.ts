
import { AppDataSource } from "../config/db";
import { ProductVariant } from "../models/ProductVariant";
import { AppError } from "../utils/AppError";
import redis from "../config/redis";
import { In } from "typeorm"; // Import thêm In để query gọn hơn

const variantRepo = AppDataSource.getRepository(ProductVariant);
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7d
const TTL_PRODUCT_INFO = 60 * 60 * 24; // 1d

// Helper: Key Redis
const getCartKey = (userId: number) => `cart:${userId}`;
const getProductKey = (variantId: number) => `product_info:${variantId}`;

// // Lấy giỏ hàng (Redis + Hydrate Data từ DB) 
// // redis lưu key: userid value: variantID quantity
// // -> giúp lấy giỏ hàng nhanh (redis) - chính xác về giá cả/ tồn (postgresql) - lưu trữ dlieu nặng ở sql
// /*
// luồng : 

// */

export const getCartService = async (userId: number) => {
  const cartKey = getCartKey(userId);

  // 1. Lấy danh sách ID và Số lượng từ Redis (Cực nhanh)
  const cartHash = await redis.hgetall(cartKey);

  if (!cartHash || Object.keys(cartHash).length === 0) {
    return { id: `redis_${userId}`, userId, items: [] };
  }

  // Convert Hash sang Array
  const cartItems = Object.entries(cartHash).map(([vId, qty]) => ({
    variantId: Number(vId),
    quantity: Number(qty),
  }));

  const variantIds = cartItems.map((i) => i.variantId);

  // 2. Tạo danh sách key để MGET (Multi Get) từ Redis
  const productKeys = variantIds.map(id => getProductKey(id));
  
  // 3. Lấy hàng loạt thông tin từ Redis
  const cachedProductsJson = await redis.mget(productKeys);
  
  const variantsMap = new Map<number, any>();
  const missingIds: number[] = [];

  // 4. Phân loại: Cái nào có Cache, cái nào chưa
  cachedProductsJson.forEach((json, index) => {
    const vId = variantIds[index];
    if (json) {
      variantsMap.set(vId, JSON.parse(json)); // Hit Cache
    } else {
      missingIds.push(vId); // Miss Cache
    }
  });

  // 5. Nếu có món chưa có trong Cache -> Query SQL lấy bù
  if (missingIds.length > 0) {
    const dbVariants = await variantRepo.find({
      where: { id: In(missingIds) },
      relations: ["product", "images", "tags"] // Join đầy đủ như cũ
    });

    // 6. Lưu ngược những món vừa lấy được vào Redis (Pipeline để tối ưu mạng)
    if (dbVariants.length > 0) {
        const pipeline = redis.pipeline();
        
        dbVariants.forEach(v => {
            variantsMap.set(v.id, v); // Update Map để trả về cho user ngay
            // Lưu vào Redis + TTL
            pipeline.setex(getProductKey(v.id), TTL_PRODUCT_INFO, JSON.stringify(v));
        });
        
        await pipeline.exec(); // Thực thi lưu cache
    }
  }

  // 7. Ghép dữ liệu (Hydrate)
  const populatedItems = cartItems.map((item) => {
    const variantInfo = variantsMap.get(item.variantId);
    
    // Trường hợp hiếm: Redis có ID trong cart, nhưng SQL đã xóa sản phẩm đó
    if (!variantInfo) return null;

    return {
      id: `item_${item.variantId}`,
      variantId: item.variantId,
      quantity: item.quantity,
      variant: variantInfo,
    };
  }).filter(Boolean);

  return {
    id: `redis_${userId}`,
    userId,
    items: populatedItems,
  };
};

export const addToCartService = async (userId: number, variantId: number, quantity: number) => {
  // Check sản phẩm tồn tại (SQL)
  const variant = await variantRepo.findOneBy({ id: variantId });
  if (!variant) throw new AppError("Sản phẩm không tồn tại", 404);

  const key = getCartKey(userId);

  // HINCRBY: Tăng giá trị của field lên một khoảng `quantity`.
  // - Nếu field chưa có: Nó tự tạo field = 0 rồi cộng thêm.
  // - Nếu field đã có: Nó cộng dồn vào.
  // -> Logic cực gọn, không cần check if/else.
  await redis.hincrby(key, variantId.toString(), quantity);

  // Reset thời gian hết hạn (TTL) cho cả cái Key Hash này
  await redis.expire(key, TTL_SECONDS);

  return await getCartService(userId);
};

export const updateCartItemService = async (userId: number, itemId: number, quantity: number) => {
  if (quantity <= 0) throw new AppError("Số lượng phải lớn hơn 0", 400);

  const key = getCartKey(userId);
  const targetVariantId = itemId.toString(); 

  // Kiểm tra xem món này có trong giỏ không (HEXISTS)
  const exists = await redis.hexists(key, targetVariantId);
  if (!exists) throw new AppError("Item không tồn tại trong giỏ", 404);

  // HSET: Ghi đè giá trị mới (thay vì cộng dồn)
  await redis.hset(key, targetVariantId, quantity);

  // Reset TTL
  await redis.expire(key, TTL_SECONDS);

  return await getCartService(userId);
};

export const removeCartItemService = async (userId: number, itemId: number) => {
  const key = getCartKey(userId);
  const targetVariantId = itemId.toString();

  // HDEL: Xóa field khỏi Hash
  await redis.hdel(key, targetVariantId);

  // Reset TTL 
  await redis.expire(key, TTL_SECONDS);

  return await getCartService(userId);
};


// export const syncCartService = async (userId: number, items: { variantId: number, quantity: number }[]) => {
//   if (!items || items.length === 0) return await getCartService(userId);

//   const key = getCartKey(userId);

//   // Dùng Pipeline để thực thi nhiều lệnh cùng lúc (Tối ưu hiệu năng mạng)
//   const pipeline = redis.pipeline();

//   for (const item of items) {
//     // Với mỗi item, ta cộng dồn số lượng vào Hash
//     pipeline.hincrby(key, item.variantId.toString(), item.quantity);
//   }

//   // Set TTL
//   pipeline.expire(key, TTL_SECONDS);

//   // Thực thi tất cả
//   await pipeline.exec();

//   return await getCartService(userId);
// };