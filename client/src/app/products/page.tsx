import { masterService } from "@/services/masterService";
import { productService } from "@/services/productService";
import ProductFilter from "@/components/products/ProductFilter";
import ProductCard from "@/components/products/ProductCard";
import ProductSearch from "@/components/products/ProductSearch";
import { Suspense } from "react";
import { Search } from "lucide-react";
import { Product, Brand, Category } from "@/types/product";

interface PageProps {
  searchParams: Promise<{
    // param là promise - next 15+
    page?: string;
    keyword?: string;
    sort?: string;
    tag_ids?: string; // Backend dùng tag_ids để lọc Brand/Size/Color
    category_id?: string;
    min_price?: string;
    max_price?: string;
  }>;
}

export default async function ProductsPage(props: PageProps) {
  const searchParams = await props.searchParams; // tham số trên url

  // tham số để gọi api
  const filters = {
    page: Number(searchParams.page) || 1,
    limit: 12,
    keyword: searchParams.keyword || "",
    sort: searchParams.sort || "newest",

    tag_ids: searchParams.tag_ids || undefined,

    category_id: searchParams.category_id
      ? Number(searchParams.category_id)
      : undefined,
    min_price: searchParams.min_price
      ? Number(searchParams.min_price)
      : undefined,
    max_price: searchParams.max_price
      ? Number(searchParams.max_price)
      : undefined,
  };

  // Khởi tạo biến dữ liệu -> tránh trg hợp call API lỗi -> vẫn chạy chứ kh bị crash
  let products: Product[] = [];
  let brands: Brand[] = [];
  let categories: Category[] = [];

  try {
    console.log("🔍 Đang gọi API lấy sản phẩm với filters:", filters);

    // dùng promise all để gọi song song 3 api
    const result = await Promise.all([
      productService.getProducts(filters),
      masterService.getBrands(),
      masterService.getCategories(),
    ]);

    // Gán dữ liệu từ kết quả trả về
    products = result[0] || [];
    brands = result[1] || [];
    categories = result[2] || [];

    console.log(`Lấy thành công: ${products.length} sản phẩm`);
  } catch (error) {
    console.error(" Lỗi khi gọi API tại ProductsPage:", error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* header : tiêu đề + tìm kiếm */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tất cả sản phẩm
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Hiển thị {products.length} kết quả
            </p>
          </div>
          <Suspense
            fallback={
              // fallback giao diện thay thế
              <div className="h-10 w-96 bg-gray-200 rounded-full animate-pulse" />
            }
          >
            <ProductSearch />
            {/* lý do dùng suspense
            + tại thời điểm build (tĩnh) -> kh có ng dùng / k có url nào cả
              -> vấn đề : trong productSearch -> dùng useSearchParam -> nó ycau đọc url để render
              -> không thể tạo khung html cho trang này lúc build -> chuyển sang render khi vào(dynamic)
            + Hiệu ứng "Lây lan" (The De-opt Boundary)
              - Trong Next.js -> Nếu một Component con bị "động", nó sẽ kéo cả Component cha bị "động" theo.
                + Không có Suspense: ProductSearch (dùng URL) -> làm Page (Cha) phải chờ -> Server không thể gửi bất kỳ HTML nào về cho khách cho đến khi nó xử lý xong toàn bộ logic URL.
                + Có Suspense: Bạn đặt ProductSearch vào "phòng cách ly" (Suspense). Next.js sẽ bảo: "Ok, cái ô tìm kiếm này cần URL, cho nó vào phòng chờ. Còn cái Tiêu đề, cái Footer, cái Layout xung quanh thì không cần URL, ta cứ gửi HTML mấy cái đó về cho người dùng xem trước đã!".
            + server-side Streaming (gửi html từng phần)
                - Khi bạn truy cập vào trang Product, Server không gửi cái "Bùm" một cục HTML khổng lồ về ngay. Nó dùng kỹ thuật Streaming:
                  + Mili-giây 0-100: Server gửi cái khung trang (Logo, Menu, Footer) -> Người dùng thấy trang web hiện ra (dù chưa có nội dung chính).
                  + Mili-giây 100-300: Server xử lý xong dữ liệu sản phẩm -> Gửi tiếp phần danh sách sản phẩm lấp vào chỗ trống.
                - Nếu bạn dùng useSearchParams mà KHÔNG bọc Suspense:
                  + Component này sẽ chặn đứng dòng chảy Streaming.
                  + Server buộc phải tính toán xong cái ô tìm kiếm đó (đợi Client hydrate xong logic URL) thì mới dám gửi HTML về.
                  -> Người dùng sẽ thấy màn hình trắng trơn lâu hơn.

             */}
          </Suspense>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* sidebar: bộ lọc*/}
          <aside className="lg:col-span-1">
            <Suspense
              fallback={
                <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
              }
            >
              <ProductFilter brands={brands} categories={categories} />
            </Suspense>
          </aside>

          {/* Main: Danh sách sản phẩm */}
          <div className="lg:col-span-3">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              //  UI khi không tìm thấy sản phẩm
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-white py-20 text-center shadow-sm">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="mt-1 text-sm text-gray-500 max-w-xs mx-auto">
                  Thử thay đổi bộ lọc, tìm kiếm từ khóa khác hoặc quay lại trang
                  chủ.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
