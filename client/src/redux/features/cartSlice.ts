import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { cartService, CartItem } from "@/services/cart.service";

// Thunks
export const fetchCart = createAsyncThunk("cart/fetchCart", async () => {
  return await cartService.getCart();
});

export const addItemToCart = createAsyncThunk("cart/add", async (item: CartItem) => {
  return await cartService.addToCart(item);
});

export const updateItemQuantity = createAsyncThunk(
  "cart/update",
  async ({ variantId, quantity, itemId }: { variantId: number; quantity: number; itemId?: number }) => {
    return await cartService.updateQuantity(variantId, quantity, itemId);
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/remove",
  async ({ variantId, itemId }: { variantId: number; itemId?: number }) => {
    return await cartService.removeItem(variantId, itemId);
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [] as CartItem[],
    loading: false,
    checkoutInfo: {
      subTotal: 0,
      shippingFee: 0,
      finalTotal: 0,
    },
  },
  reducers: {
    // Action để reset giỏ hàng khi logout
    clearCartState: (state) => {
      state.items = [];
    },
    setCheckoutInfo: (state, action) => {
      state.checkoutInfo = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearCartState, setCheckoutInfo } = cartSlice.actions;
export default cartSlice.reducer;