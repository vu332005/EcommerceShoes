import { productService } from "@/services/productService";
import ProductDetailClient from "@/components/products/ProductDetailClient"; // Dùng Client Component mới
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface DetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage(props: DetailPageProps) {
  const params = await props.params;
  const { id } = params;

  let product = null;

  try {
    product = await productService.getProductDetail(Number(id));
  } catch (error) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Không tìm thấy sản phẩm
        </h1>
        <Link
          href="/products"
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-900">
            Trang chủ
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/products" className="hover:text-gray-900">
            Sản phẩm
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="font-medium text-gray-900 line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Gọi Component Client Wrapper */}
        <ProductDetailClient product={product} />
      </div>
    </div>
  );
}
