"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Load Stripe key (Lấy từ biến môi trường)
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY! // khóa này tác dụng định danh web này của cửa hàng nào
);

//
function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe(); // dùng để gọi các hàm của stripe DSK
  const elements = useElements(); // lấy về các elements -> giúp truy cập dlieu trong khung nhập liệu của stripe mà k cần chạm vào DOM(an toàn)
  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return; // chặn nếu ch tải xong thư viện và elements

    setIsProcessing(true);

    //gửi ycau thanh toán lên server của stripe
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Thanh toán xong thì quay về trang success
        return_url: `${window.location.origin}/checkout/success`,
      },
    });

    if (error) setMessage(error.message || "Có lỗi xảy ra");
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <PaymentElement />
      {/* đây là ô nhập thẻ có sẵn của stripe */}
      {message && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {message}
        </div>
      )}
      <button
        disabled={isProcessing || !stripe || !elements}
        className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        {isProcessing ? "Đang xử lý..." : "Thanh toán ngay"}
      </button>
    </form>
  );
}

export default function StripePaymentPage() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get("clientSecret");
  const orderId = searchParams.get("orderId");

  //check - nếu ng dùng gõ trực tiếp URL /payment/stripe mà không qua bước Checkout (tức là không có clientSecret), ứng dụng sẽ bị lỗi vì Stripe không khởi tạo được.
  if (!clientSecret || !orderId)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Lỗi: Thiếu thông tin thanh toán
      </div>
    );

  //config stripe elements
  const options = {
    clientSecret,
    appearance: { theme: "stripe" as const },
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900 text-center">
          Thanh toán đơn hàng #{orderId}
        </h1>
        <p className="text-center text-gray-500 text-sm mb-6">
          Nhập thông tin thẻ để hoàn tất
        </p>
        {/* !khởi tạo ngữ cảnh stripe */}
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm orderId={orderId} />
        </Elements>
        {/* khi nằm trong cặp thẻ <Elements>...</Elements> -> component con CheckoutForm mới có thể dùng được các hook như useStripe(), useElements() hay vẽ được <PaymentElement />. */}
      </div>
    </div>
  );
}

/*
Tóm tắt luồng dữ liệu tại component này:
  Đọc URL: Lấy clientSecret và orderId.
  Kiểm tra: Nếu thiếu dữ liệu -> Báo lỗi.
  Cấu hình: Gói clientSecret vào object options.
  Kết nối: Nạp options vào <Elements> để kích hoạt Stripe.
  Hiển thị: Vẽ khung trắng và nhúng CheckoutForm vào giữa.
*/
