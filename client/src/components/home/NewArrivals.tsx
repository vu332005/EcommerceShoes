"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { productService } from "@/services/productService";
import { Product } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";
import { Spin } from "antd";
import { ArrowRight } from "lucide-react";

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        // Gọi API lấy 8 sản phẩm mới nhất
        const res = await productService.getProducts({
          page: 1,
          limit: 8,
        });

        // Safe check:
        const productList = Array.isArray(res) ? res : (res as any).data || [];
        setProducts(productList);
      } catch (error) {
        console.error("Lỗi lấy sản phẩm mới:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) {
    return (
      <div className="flex h-80 flex-col items-center justify-center bg-gray-50 gap-3">
        <Spin size="large" />
        <span className="text-gray-500 font-medium">
          Đang tìm sản phẩm mới...
        </span>
      </div>
    );
  }

  // Nếu không có sản phẩm nào thì ẩn section
  if (products.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tight text-gray-900">
              Sản phẩm mới
            </h2>
            <p className="mt-2 text-gray-500">
              Cập nhật những mẫu giày hot nhất vừa lên kệ
            </p>
          </div>

          <Link
            href="/products"
            className="group flex items-center gap-2 font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Xem tất cả{" "}
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
