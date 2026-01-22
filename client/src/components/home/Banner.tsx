"use client";

import React from "react";
import { Carousel, ConfigProvider } from "antd";
import Image from "next/image";

// Dữ liệu Slide (Đã bỏ link)
const SLIDE_IMAGES = [
  {
    id: 1,
    image: "/images/banner-1.jpg",
  },
  {
    id: 2,
    image: "/images/banner-2.jpg",
  },
  {
    id: 3,
    image: "/images/banner-3.jpg",
  },
];

export default function Banner() {
  return (
    <ConfigProvider
      theme={{
        components: {
          Carousel: {
            dotWidth: 40,
            dotHeight: 4,
            dotActiveWidth: 60,
          },
        },
      }}
    >
      {/* Container chính: Bỏ class h-[400px] để chiều cao tự động theo ảnh */}
      <div className="relative w-full">
        <Carousel autoplay autoplaySpeed={5000} effect="fade" infinite>
          {SLIDE_IMAGES.map((slide) => (
            <div key={slide.id} className="w-full">
              {/* Thay đổi quan trọng:
                1. Bỏ thẻ <Link> bao ngoài.
                2. Bỏ prop "fill" và "object-cover".
                3. Thêm width/height tượng trưng (tỉ lệ chuẩn 16:9 hoặc theo ảnh thật của bạn).
                4. style={{ width: '100%', height: 'auto' }}: Giúp ảnh luôn full màn hình chiều ngang, 
                   chiều dọc tự co giãn -> Không bao giờ bị cắt ảnh.
              */}
              <Image
                src={slide.image}
                alt={`Banner ${slide.id}`}
                width={1920} // Chiều rộng gốc của ảnh banner (ví dụ 1920px)
                height={800} // Chiều cao gốc của ảnh banner (ví dụ 800px)
                className="w-full h-auto" // Tailwind: width 100%, height auto
                priority={slide.id === 1}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>
    </ConfigProvider>
  );
}
