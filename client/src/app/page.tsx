import Banner from "@/components/home/Banner";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import NewArrivals from "@/components/home/NewArrivals"; // <--- Import mới
import { Truck, ShieldCheck, Headphones } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. BANNER SLIDER */}
      <Banner />

      {/* 2. POLICY SECTION */}
      <section className="border-b bg-gray-50 py-10">
        <div className="container mx-auto grid grid-cols-1 gap-8 px-4 sm:grid-cols-3">
          <div className="flex items-center justify-center gap-4 text-center sm:text-left">
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Miễn phí vận chuyển</h4>
              <p className="text-sm text-gray-500">Cho đơn hàng từ 500k</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center sm:text-left">
            <div className="rounded-full bg-green-100 p-3 text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Cam kết chính hãng</h4>
              <p className="text-sm text-gray-500">Hoàn tiền 100% nếu fake</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 text-center sm:text-left">
            <div className="rounded-full bg-purple-100 p-3 text-purple-600">
              <Headphones size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Hỗ trợ 24/7</h4>
              <p className="text-sm text-gray-500">Hotline: 1900 0000</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DANH MỤC NỔI BẬT */}
      <FeaturedCategories />

      {/* 4. SẢN PHẨM MỚI (Component riêng) */}
      <NewArrivals />
    </main>
  );
}
