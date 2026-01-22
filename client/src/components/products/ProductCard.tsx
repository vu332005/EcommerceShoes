"use client";
import { Product } from "@/types/product";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Safe check: Nếu không có product thì không render
  if (!product) return null;

  const formatPrice = (price: number) => {
    // Fallback về 0 nếu price bị NaN hoặc undefined
    const safePrice = price || 0;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(safePrice);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-square w-full overflow-hidden bg-gray-100"
      >
        <img
          // Fallback ảnh placeholder nếu không có link ảnh
          src={product.thumbnailUrl || "/images/placeholder.png"}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          // Xử lý lỗi khi ảnh không tải được
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/placeholder.png";
          }}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium text-gray-500">
          {/* Dùng Optional Chaining (?) để tránh crash nếu null */}
          {product.brand?.name || "No Brand"} •{" "}
          {product.category?.name || "Khác"}
        </p>

        <Link href={`/products/${product.id}`}>
          <h3 className="mt-2 text-base font-semibold text-gray-900 line-clamp-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-lg font-bold text-blue-600">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </div>
  );
}
