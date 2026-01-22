import { AppDataSource } from "../config/db";
import { Cart } from "../models/Cart";
import { CartItem } from "../models/CartItem";
import { ProductVariant } from "../models/ProductVariant";
import { AppError } from "../utils/AppError";

const cartRepo = AppDataSource.getRepository(Cart);
const cartItemRepo = AppDataSource.getRepository(CartItem);
const variantRepo = AppDataSource.getRepository(ProductVariant);

// lấy dsach item trong cart
export const getCartService = async (userId: number) => {
  let cart = await cartRepo.findOne({
    where: { userId },
    relations: [ // left join
      "items",                  
      "items.variant", 
      "items.variant.product", 
      "items.variant.images", 
      "items.variant.tags"
    ],
    order: {
      items: { id: "ASC" }     
    }
  });

  // tạo cart nếu ng dùng chưa có
  if (!cart) {
    cart = cartRepo.create({ userId });
    await cartRepo.save(cart);
    cart.items = [];          
  }

  return cart;
};

// thêm item vào cart
export const addToCartService = async (userId: number, variantId: number, quantity: number) => {
  
  // Check sản phẩm
  const variant = await variantRepo.findOneBy({ id: variantId });
  if (!variant) throw new AppError("Sản phẩm không tồn tại", 404);

  // Lấy Cart - nếu có r thì tìm trên user id - nếu chưa có thì tạo (lazy creation)
  let cart = await cartRepo.findOne({ where: { userId } });
  if (!cart) {
    cart = cartRepo.create({ userId });
    await cartRepo.save(cart);
  }

  // Check Item / nếu có r -> chỉ tăng số lượng / nếu chưa có -> tạo 1 cart item mới
  const existingItem = await cartItemRepo.findOne({
    where: { cartId: cart.id, variantId: variantId } 
  });

  if (existingItem) {
    existingItem.quantity += quantity;
    await cartItemRepo.save(existingItem);
  } else {
    const newItem = cartItemRepo.create({
      cartId: cart.id,
      variantId: variantId,     
      quantity: quantity
    });
    await cartItemRepo.save(newItem);
  }

  return await getCartService(userId); //  trả về toàn bộ giỏ hàng sau khi đã thêm
};

// cập nhật item trong cart
export const updateCartItemService = async (userId: number, itemId: number, quantity: number) => {
  if (quantity <= 0) throw new AppError("Số lượng phải lớn hơn 0", 400);

  const item = await cartItemRepo.findOne({
    where: { id: itemId },
    relations: ["cart"]
  });

  // kiểm tra quyền sở hữu - tránh IDOR
  if (!item || item.cart.userId !== userId) {
    throw new AppError("Item không tồn tại", 404);
  }

  item.quantity = quantity;
  await cartItemRepo.save(item);

  return await getCartService(userId);
};

// xóa item khỏi cart
export const removeCartItemService = async (userId: number, itemId: number) => {
  const item = await cartItemRepo.findOne({
    where: { id: itemId },
    relations: ["cart"]
  });

  if (!item || item.cart.userId !== userId) {
    throw new AppError("Item không tồn tại", 404);
  }

  await cartItemRepo.remove(item);
  return await getCartService(userId);
};

// đồng bộ
export const syncCartService = async (userId: number, items: { variantId: number, quantity: number }[]) => {
  if (!items || items.length === 0) return await getCartService(userId);

  await Promise.all(items.map(async (item) => {
    try {
      await addToCartService(userId, item.variantId, item.quantity);
    } catch (e) {
      console.error(`Lỗi sync item ${item.variantId}`, e);
    }
  }));

  return await getCartService(userId);
};