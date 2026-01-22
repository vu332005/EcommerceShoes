"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Đặt hàng thành công!
        </h1>
        <p className="text-gray-600 mb-8">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ sớm
          được giao đến bạn.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/products"
            className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Tiếp tục mua sắm
          </Link>
          <Link
            href="/"
            className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
