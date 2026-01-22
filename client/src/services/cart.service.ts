import axiosInstance from "@/lib/axios";

//kiểu dữ liệu cho Item trong giỏ (dùng chung cho cả Local và API)
export interface CartItem {
  id?: number; // ID của dòng trong DB (chỉ có khi login)
  variantId: number;
  quantity: number;
  // Các field để hiển thị khi ở chế độ LocalStorage (offline)
  productName: string;
  price: number;
  thumbnailUrl: string;
  size?: string;
  color?: string;
  slug?: string;
  stock?: number; // Để giới hạn số lượng max
}

const LOCAL_CART_KEY = "shoes_shop_cart";

export const cartService = {

  // Lấy danh sách giỏ hàng
  // nếu đã login -> lấy giỏ hàng từ db / chưa -> lấy từ ls
  getCart: async (): Promise<CartItem[]> => {
    // Check token từ localStorage (Client side only)
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

    // nếu login -> api
    if (token) {
      try {
        const res = await axiosInstance.get("/cart");

        return res.data.data.items.map((item: any) => ({
          id: item.id,
          variantId: item.variantId, 
          quantity: item.quantity,
          productName: item.variant?.product?.name || "Sản phẩm",
          price: Number(item.variant?.priceOverride || item.variant?.product?.basePrice || 0),
          thumbnailUrl: item.variant?.images?.[0]?.imageUrl || item.variant?.product?.thumbnailUrl || "",
          // Lọc tag để lấy size/color
          size: item.variant?.tags?.find((t: any) => t.type === 'size')?.name,
          color: item.variant?.tags?.find((t: any) => t.type === 'color')?.name,
          stock: item.variant?.stockQuantity || 0
        }));
      } catch (error) {
        console.error("Lỗi lấy giỏ hàng API", error);
        return [];
      }
    } else { // chưa login -> localstorage
      const localCart = localStorage.getItem(LOCAL_CART_KEY);
      return localCart ? JSON.parse(localCart) : []; // nếu lần đầu vào web -> trả về []
    }
  },

  // 2. Thêm vào giỏ
  addToCart: async (item: CartItem) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

    if (token) {
      // API: Backend sẽ tự cộng dồn nếu trùng
      await axiosInstance.post("/cart/add", {
        variantId: item.variantId,
        quantity: item.quantity
      });
    } else {
      // Local: Phải tự xử lý logic cộng dồn
      const cart = await cartService.getCart(); // lấy giỏ hàng htai
      const existingItemIndex = cart.findIndex((i) => i.variantId === item.variantId);// xem cái định thêm đã có trong giỏ hàng ch
      
      if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += item.quantity; // nếu có r -> chỉ cộng slg
      } else {
        cart.push(item); // ch có -> push item mới vào
      }
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    }
    return await cartService.getCart(); // !Trả về giỏ hàng mới nhất
  },

  // Cập nhật số lượng
  updateQuantity: async (variantId: number, quantity: number, itemId?: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

    if (token && itemId) {
      await axiosInstance.put("/cart/update", { itemId, quantity });
    } else {
      const cart = await cartService.getCart();
      const item = cart.find((i) => i.variantId === variantId);
      if (item) item.quantity = quantity;
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    }
    return await cartService.getCart();
  },

  // Xóa sản phẩm
  removeItem: async (variantId: number, itemId?: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

    if (token && itemId) {
      await axiosInstance.delete(`/cart/remove/${itemId}`);
    } else {
      let cart = await cartService.getCart();
      cart = cart.filter((i) => i.variantId !== variantId);
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
    }
    return await cartService.getCart();
  },

  // //  Đồng bộ
  // syncCart: async () => {
  //   const localCartRaw = localStorage.getItem(LOCAL_CART_KEY);
  //   if (!localCartRaw) return;

  //   const localCart: CartItem[] = JSON.parse(localCartRaw);
  //   if (localCart.length === 0) return;

  //   const itemsToSync = localCart.map(i => ({
  //     variantId: i.variantId,
  //     quantity: i.quantity
  //   }));

  //   try {
  //     await axiosInstance.post("/cart/sync", { items: itemsToSync });
  //     localStorage.removeItem(LOCAL_CART_KEY); // Xóa local sau khi sync xong
  //   } catch (error) {
  //     console.error("Sync cart failed", error);
  //   }
  // }
};