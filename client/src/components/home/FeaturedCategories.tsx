"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const FEATURED_CATS = [
  {
    id: 1,
    name: "GIÀY CHẠY BỘ",
    image: "/images/cat-running.jpg",
    description: "Êm ái trên từng bước chạy",
  },
  {
    id: 2,
    name: "GIÀY BÓNG RỔ",
    image: "/images/cat-basketball.jpg",
    description: "Bứt phá mọi giới hạn",
  },
  {
    id: 3,
    name: "THỜI TRANG",
    image: "/images/cat-lifestyle.jpg",
    description: "Phong cách đường phố & Daily wear",
  },
];

export default function FeaturedCategories() {
  return (
    <section className="container mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tight">
          Danh mục nổi bật
        </h2>
        <p className="mt-2 text-gray-500">
          Khám phá các dòng sản phẩm chủ đạo của chúng tôi
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {FEATURED_CATS.map((cat) => (
          <Link
            key={cat.id}
            // QUAN TRỌNG: Đường dẫn này sẽ kích hoạt bộ lọc bên trang Products
            href={`/products?category_id=${cat.id}`}
            className="group relative h-[450px] w-full overflow-hidden rounded-2xl shadow-lg cursor-pointer block"
          >
            {/* Hình ảnh nền */}
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 33vw"
              onError={(e) => {
                // Fallback nếu thiếu ảnh (Dùng placeholder online)
                (e.target as HTMLImageElement).src =
                  "https://placehold.co/600x800/EEE/31343C?text=" + cat.name;
              }}
            />

            {/* Lớp phủ gradient để làm nổi chữ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

            {/* Nội dung chữ */}
            <div className="absolute inset-0 flex flex-col items-center justify-end p-8 text-center text-white pb-12">
              <h3 className="text-2xl font-bold uppercase tracking-wider mb-2 transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                {cat.name}
              </h3>

              <p className="text-sm font-light text-gray-200 opacity-0 transform translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 mb-6">
                {cat.description}
              </p>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-2 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white hover:text-black transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 duration-500">
                Xem sản phẩm <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
