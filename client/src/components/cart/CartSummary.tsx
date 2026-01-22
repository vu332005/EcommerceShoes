"use client";

import { CartItem } from "@/services/cart.service";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { setCheckoutInfo } from "@/redux/features/cartSlice";

interface Props {
  items: CartItem[];
}

export default function CartSummary({ items }: Props) {
  const router = useRouter(); //
  const dispatch = useAppDispatch();

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shippingFee = 35000;
  const finalPrice = totalPrice + shippingFee;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handleCheckout = () => {
    if (items.length === 0) return;

    // lưu vào redux trc khi sang checkout
    dispatch(
      setCheckoutInfo({
        subTotal: totalPrice,
        shippingFee: shippingFee,
        finalTotal: finalPrice,
      })
    );

    router.push("/checkout");
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm sticky top-20">
      <h2 className="text-lg font-bold text-gray-900 mb-6">
        Thông tin đơn hàng
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between text-base text-gray-600">
          <span>Tạm tính ({items.length} sản phẩm)</span>
          <span className="font-medium">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-base text-gray-600">
          <span>Phí vận chuyển</span>
          <span className="text-green-600 font-medium">
            {totalPrice > 5000000 ? "Miễn phí" : formatPrice(shippingFee)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
          <div className="text-right">
            <p className="text-xl font-bold text-red-600">
              {formatPrice(finalPrice)}
            </p>
            <p className="text-xs text-gray-400">(Đã bao gồm VAT)</p>
          </div>
        </div>
      </div>

      {/*  */}
      <button
        onClick={handleCheckout}
        disabled={items.length === 0}
        className="w-full mt-6 rounded-md bg-black px-6 py-4 text-base font-bold text-white shadow-md hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        THANH TOÁN NGAY
      </button>
    </div>
  );
}
