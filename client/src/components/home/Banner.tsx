"use client";

import React, { useRef } from "react";
import { Carousel, ConfigProvider } from "antd";
import type { CarouselRef } from "antd/es/carousel";
import Image from "next/image";
import Link from "next/link";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const SLIDE_IMAGES = [
  {
    id: 1,
    image: "/images/banner-1.jpg",
    title: "SHUT UP AND DRIBBLE",
    subtitle:
      "Only one King can turn a televised moment into a stand for activism.",
    btnText: "Shop Now",
    btnLink: "/products/lebron",
  },
  {
    id: 2,
    image: "/images/banner-2.jpg",
    title: "ATTACK PACK",
    subtitle:
      "Tiempo joins the attack. Score the boot that lets you find the back of the net.",
    btnText: "Buy Now",
    btnLink: "/products/football",
  },
];

export default function Banner() {
  const carouselRef = useRef<CarouselRef>(null);

  const handlePrev = () => carouselRef.current?.prev();
  const handleNext = () => carouselRef.current?.next();

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
      <div className="relative w-full group">
        <Carousel
          ref={carouselRef}
          autoplay
          autoplaySpeed={3000}
          effect="fade"
          infinite
          dots={true} // Ẩn dấu chấm tròn vì đã có nút điều hướng
        >
          {SLIDE_IMAGES.map((slide) => (
            <div key={slide.id} className="relative w-full">
              {/* Ảnh Banner */}
              <Image
                src={slide.image}
                alt={`Banner ${slide.id}`}
                width={1920}
                height={800}
                className="w-full h-auto"
                priority={slide.id === 1}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              {/* Lớp phủ màu tối dần từ dưới lên */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Nội dung chữ */}
              <div className="absolute inset-0 flex flex-col justify-end items-center text-center text-white px-4 pb-12 md:pb-20">
                <h2 className="text-2xl md:text-5xl font-black uppercase tracking-wider mb-2 drop-shadow-2xl">
                  {slide.title}
                </h2>
                <p className="text-xs md:text-lg font-medium max-w-lg md:max-w-2xl mb-6 drop-shadow-md opacity-90">
                  {slide.subtitle}
                </p>
                <Link
                  href={slide.btnLink}
                  className="bg-white text-black px-6 py-2 md:px-8 md:py-3 rounded-full font-bold text-xs md:text-base hover:bg-gray-200 transition-all shadow-xl hover:scale-105"
                >
                  {slide.btnText}
                </Link>
              </div>
            </div>
          ))}
        </Carousel>

        {/* --- CỤM ĐIỀU HƯỚNG GÓC PHẢI (CHỈ CÒN PREV & NEXT) --- */}
        <div className="absolute bottom-4 right-4 md:bottom-10 md:right-10 z-30 flex items-center gap-3">
          {/* Nút Previous */}
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-black border border-white/50 transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            <LeftOutlined className="text-lg" />
          </button>

          {/* Nút Next */}
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md hover:bg-white text-white hover:text-black border border-white/50 transition-all duration-300 flex items-center justify-center shadow-lg"
          >
            <RightOutlined className="text-lg" />
          </button>
        </div>
      </div>
    </ConfigProvider>
  );
}
