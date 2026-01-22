// components/shared/Footer.tsx
"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white pt-12 pb-6">
      {/* Container chính */}
      <div className="container mx-auto px-4">
        {/* Phần nội dung chính (4 cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Cột 1: Thông tin Shop */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-4">
              SHOES SHOP
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Shoes Shop được định hướng trở thành hệ thống thương mại điện tử
              bán giày chính hãng hàng đầu Việt Nam.
            </p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>Showroom: Lĩnh Nam, Hà Nội</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} />
                <span>Hotline: 1900.0000</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} />
                <span>Email: contact@shoesshop.vn</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Về chúng tôi */}
          <div>
            <h3 className="text-md font-bold uppercase mb-4 text-gray-100">
              Về chúng tôi
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="hover:text-white transition-colors"
                >
                  Tin tức Shoes Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-white transition-colors"
                >
                  Cơ hội việc làm
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Khách hàng */}
          <div>
            <h3 className="text-md font-bold uppercase mb-4 text-gray-100">
              Khách hàng
            </h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link
                  href="/guide"
                  className="hover:text-white transition-colors"
                >
                  Hướng dẫn mua hàng
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="hover:text-white transition-colors"
                >
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link
                  href="/warranty"
                  className="hover:text-white transition-colors"
                >
                  Chính sách bảo hành
                </Link>
              </li>
              <li>
                <Link
                  href="/membership"
                  className="hover:text-white transition-colors"
                >
                  Khách hàng thân thiết
                </Link>
              </li>
              <li>
                <Link
                  href="/size-guide"
                  className="hover:text-white transition-colors"
                >
                  Hướng dẫn chọn size
                </Link>
              </li>
              <li>
                <Link
                  href="/promotion"
                  className="hover:text-white transition-colors"
                >
                  Chương trình khuyến mại
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Chứng nhận */}
          <div>
            <h3 className="text-md font-bold uppercase mb-4 text-gray-100">
              Chứng nhận
            </h3>
            <div className="space-y-4">
              {/* Thay thế src bằng ảnh thật của bạn */}
              <div className="bg-white/10 p-2 rounded w-fit">
                <img
                  src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=YOUR_ID"
                  alt="DMCA Protected"
                  className="h-8"
                />
              </div>
              <div className="bg-white/10 p-2 rounded w-fit">
                <img
                  src="http://online.gov.vn/Content/EndUser/LogoCCDVSaleNoti/logoSaleNoti.png"
                  alt="Đã thông báo bộ công thương"
                  className="h-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Đường kẻ phân cách */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Phần Bottom: Copyright & Social & Payment */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm text-gray-400">
          <div className="flex gap-4">
            <Link
              href="https://www.facebook.com/"
              className="hover:text-blue-500 transition-colors"
            >
              <Facebook size={24} />
            </Link>
            <Link
              href="https://www.instagram.com/"
              className="hover:text-red-500 transition-colors"
            >
              <Youtube size={24} />
            </Link>
            <Link href="#" className="hover:text-pink-500 transition-colors">
              <Instagram size={24} />
            </Link>
            <Link href="#" className="hover:text-blue-400 transition-colors">
              <Twitter size={24} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
