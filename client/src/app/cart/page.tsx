import CartMain from "@/components/cart/CartMain";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giỏ hàng | Shoes Shop",
  description: "Xem và thanh toán giỏ hàng của bạn",
};

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <CartMain />
      </div>
    </div>
  );
}
