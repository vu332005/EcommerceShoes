"use client";

import Image from "next/image";
import { CartItem } from "@/services/cart.service";

interface OrderSummaryProps {
  items: CartItem[];
  // Nhận giá trị từ cha truyền vào
  subTotal: number;
  shippingFee: number;
  finalTotal: number;

  loading: boolean;
  handlePlaceOrder: () => void;
}

export default function OrderSummary({
  items,
  subTotal,
  shippingFee,
  finalTotal,
  loading,
  handlePlaceOrder,
}: OrderSummaryProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Đơn hàng ({items.length} sản phẩm)
      </h3>

      {/* List items */}
      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {items.map((item) => (
          <div key={`${item.variantId}`} className="flex gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              <Image
                src={
                  // Xử lý ảnh an toàn
                  item.thumbnailUrl && item.thumbnailUrl.startsWith("http")
                    ? item.thumbnailUrl
                    : item.thumbnailUrl
                    ? `/images/${item.thumbnailUrl.replace("/images/", "")}`
                    : "/images/placeholder.png"
                }
                alt={item.productName}
                fill
                className="object-cover"
              />
              <span className="absolute -top-0 -right-0 h-5 w-5 bg-gray-500 text-white text-[10px] flex items-center justify-center rounded-bl-md">
                x{item.quantity}
              </span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                {item.productName}
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                {item.color} / {item.size}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 space-y-3">
        {/* Tạm tính */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Tạm tính</span>
          <span>{formatPrice(subTotal)}</span>
        </div>

        {/* Phí vận chuyển */}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Phí vận chuyển</span>
          <span
            className={`font-medium ${
              shippingFee === 0 ? "text-green-600" : ""
            }`}
          >
            {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>

        {/* Tổng cộng */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-bold text-gray-900">Tổng cộng</span>
          <span className="text-xl font-bold text-red-600">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={loading || items.length === 0}
        className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 rounded-md uppercase transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
            Đang xử lý...
          </span>
        ) : (
          "ĐẶT HÀNG"
        )}
      </button>
    </div>
  );
}
