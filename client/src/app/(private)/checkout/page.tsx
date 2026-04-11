"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { fetchCart } from "@/redux/features/cartSlice";
import { orderService } from "@/services/order.service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";

export default function CheckoutPage() {
  const { items, checkoutInfo } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth); // lấy
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [formData, setFormData] = useState({
    fullName: user?.full_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: user?.address || "",
    city: user?.city || "",
    district: user?.district || "",
    note: "",
  });

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  // logic tính giá

  // backup khi f5 mất state
  const fallbackSubTotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const SHIPPING_THRESHOLD = 5000000;
  const fallbackShipping = fallbackSubTotal >= SHIPPING_THRESHOLD ? 0 : 35000;
  const fallbackFinalTotal = fallbackSubTotal + fallbackShipping;

  // quyết định dùng từ redux hay backup
  const currentSubTotal =
    checkoutInfo.subTotal > 0 ? checkoutInfo.subTotal : fallbackSubTotal;
  const currentShipping =
    checkoutInfo.subTotal > 0 ? checkoutInfo.shippingFee : fallbackShipping;
  const currentFinalTotal =
    checkoutInfo.subTotal > 0 ? checkoutInfo.finalTotal : fallbackFinalTotal;

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    // validate dlieu
    if (!formData.fullName || !formData.phone || !formData.address) {
      return toast.error("Vui lòng điền đầy đủ thông tin nhận hàng");
    }

    // xử lý địa chỉ
    try {
      setLoading(true);
      const fullAddress = [formData.address, formData.district, formData.city]
        .filter(Boolean) // loại bỏ các gtri rỗng
        .join(", "); // nối lại bằng các dấu ,

      //map pthuc thanh toán
      const methodToSend = paymentMethod === "COD" ? "COD" : "STRIPE";

      // Gửi backend
      const payload = {
        shippingName: formData.fullName,
        shippingPhone: formData.phone,
        shippingAddress: fullAddress, // dchi đã gộp
        paymentMethod: methodToSend,
        items: items,
      };

      const res = await orderService.createOrder(payload); // gửi dlieu

      // xử lý res
      const orderData = res.data || res;
      const clientSecret = orderData.clientSecret; // mã bmat để ttoan stripe
      const orderId = orderData.orderId;

      // Refresh giỏ hàng
      dispatch(fetchCart());

      if (methodToSend === "STRIPE") {
        // Stripe
        if (clientSecret) {
          toast.loading("Đang chuyển đến cổng thanh toán...");
          router.push(
            // chuyển sang trang nhập thẻ kèm key
            `/payment/stripe?clientSecret=${clientSecret}&orderId=${orderId}`,
          );
        } else {
          toast.error("Lỗi khởi tạo thanh toán.");
        }
      } else {
        // COD
        toast.success("Đặt hàng thành công!");
        router.push("/checkout/success");
      }
    } catch (error: any) {
      console.error("Lỗi đặt hàng:", error);
      toast.error(error?.response?.data?.message || "Lỗi tạo đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/cart"
            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1"
          >
            <ArrowLeft size={16} /> Quay lại giỏ hàng
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <CheckoutForm
              user={user}
              formData={formData}
              handleInputChange={handleInputChange}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </div>
          <div className="lg:col-span-5">
            <OrderSummary
              items={items}
              subTotal={currentSubTotal}
              shippingFee={currentShipping}
              finalTotal={currentFinalTotal}
              loading={loading}
              handlePlaceOrder={handlePlaceOrder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
