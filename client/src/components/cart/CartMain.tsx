"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchCart,
  updateItemQuantity,
  removeItemFromCart,
} from "@/redux/features/cartSlice";
import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartMain() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.cart); //

  // Fetch cart khi component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (loading && items.length === 0) {
    // trạng thái loading
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    // trạng thái giỏ hàng trống
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
        <div className="rounded-full bg-gray-50 p-6 mb-4">
          <ShoppingBag className="h-12 w-12 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Giỏ hàng trống</h2>
        <p className="mt-2 text-gray-500 mb-8">
          Bạn chưa thêm sản phẩm nào vào giỏ hàng.
        </p>
        <Link
          href="/products"
          className="rounded-full bg-blue-600 px-8 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          TIẾP TỤC MUA SẮM
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Cột trái: Danh sách sản phẩm (8 phần) */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h1 className="text-xl font-bold text-gray-900">
              Giỏ hàng của bạn{" "}
              <span className="text-gray-500 font-normal">
                ({items.length} sản phẩm)
              </span>
            </h1>
          </div>
          <div className="px-6">
            {items.map(
              (
                item // loop để in ra các cartItem
              ) => (
                <CartItem
                  key={`${item.variantId}-${item.id || "local"}`} // dùng variantId(luôn có) + item.id(nếu có) / local
                  item={item}
                  onUpdateQty={(
                    qty //
                  ) =>
                    dispatch(
                      updateItemQuantity({
                        variantId: item.variantId,
                        quantity: qty,
                        itemId: item.id,
                      })
                    )
                  }
                  onRemove={() =>
                    dispatch(
                      removeItemFromCart({
                        variantId: item.variantId,
                        itemId: item.id,
                      })
                    )
                  }
                />
              )
            )}
          </div>
        </div>

        <div className="mt-6">
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 group"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>

      {/* Cột phải: Tổng tiền*/}
      <div className="lg:col-span-4">
        <CartSummary items={items} />
      </div>
    </div>
  );
}
