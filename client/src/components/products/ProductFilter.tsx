"use client";

import { useState } from "react"; // Thêm useState
import { Brand, Category } from "@/types/product";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Collapse,
  Checkbox,
  ConfigProvider,
  Typography,
  Drawer,
  Button,
} from "antd"; // Import thêm Drawer, Button
import { Filter, X, SlidersHorizontal } from "lucide-react"; // Import icon

const { Title } = Typography;
const { Panel } = Collapse;

interface FilterProps {
  brands: Brand[];
  categories: Category[];
}

// Các khoảng giá cố định
const PRICE_RANGES = [
  { label: "Dưới 500,000đ", min: 0, max: 500000 },
  { label: "500,000đ - 1,000,000đ", min: 500000, max: 1000000 },
  { label: "1,000,000đ - 2,000,000đ", min: 1000000, max: 2000000 },
  { label: "2,000,000đ - 3,000,000đ", min: 2000000, max: 3000000 },
  { label: "Trên 3,000,000đ", min: 3000000, max: null },
];

export default function ProductFilter({ brands, categories }: FilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // State quản lý mở Drawer trên Mobile (Mới thêm)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // xử lý url (Giữ nguyên logic của bạn)
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams);

    params.set("page", "1"); // Reset về trang 1

    // cập nhật url mới
    /*
      - Object.entries -> chuyển obj thành 1 mảng các cặp key,value
      vd : { category_id: "5", min_price: null, max_price: null }
      -> [ ["category_id", "5"], ["min_price", null], ["max_price", null] ]
      */
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== null) {
        // nếu có giá trị truyền vào -> ng dùng chọn bộ lọc mới -> set lại key và value mới
        params.set(key, value);
      } else {
        // nếu null -> theo quy ước value null -> bỏ chọn -> xóa key của nó trên url
        params.delete(key);
      }
    });

    // đẩy url mới lên trình duyệt
    replace(`${pathname}?${params.toString()}`);
  };

  // lấy giá trị hiện tại từ url
  const selectedCatId = searchParams.get("category_id");
  const selectedBrandId = searchParams.get("tag_ids");
  const currentSort = searchParams.get("sort") || "";
  const currentMinPrice = searchParams.get("min_price");

  // Tìm range giá đang active -> trả về idx của price range đang được chọn
  const selectedPriceIndex = PRICE_RANGES.findIndex(
    (r) => String(r.min) === currentMinPrice,
  );

  // handle event

  // sort
  const handleSortCheck = (value: string, checked: boolean) => {
    // Nếu checked = true -> Chọn giá trị đó
    // Nếu checked = false (bỏ tick) -> Xóa sort (về mặc định)
    // Nếu đang tick cái A mà bấm cái B -> checked=true của B sẽ đè lên A
    updateParams({ sort: checked ? value : null });
  };

  // 2. Danh mục (Category)
  const handleCategoryCheck = (catId: number, checked: boolean) => {
    updateParams({ category_id: checked ? String(catId) : null });
  };

  // 3. Thương hiệu (Brand)
  const handleBrandCheck = (brandId: number, checked: boolean) => {
    updateParams({ tag_ids: checked ? String(brandId) : null });
  };

  // 4. Giá (Price)
  const handlePriceCheck = (index: number, checked: boolean) => {
    if (checked) {
      const range = PRICE_RANGES[index];
      updateParams({
        min_price: String(range.min),
        max_price: range.max ? String(range.max) : null,
      });
    } else {
      updateParams({ min_price: null, max_price: null });
    }
  };

  // Tách phần render nội dung filter ra để dùng chung (tránh lặp code)
  const renderFilterContent = () => (
    <Collapse
      defaultActiveKey={["sort", "cat", "brand", "price"]} // mặc định mở ở tất cả các mục này
      ghost
      expandIconPlacement="end" // Đổi icon sang phải giống Nike
    >
      {/* sort */}
      <Panel
        header={
          <Title level={5} style={{ margin: 0 }}>
            Sắp xếp theo
          </Title>
        }
        key="sort"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center">
            <Checkbox
              checked={currentSort === ""} //ô này chỉ được chọn khi currentSort lấy từ url là chuỗi rỗng -> đây là lựa chọn mặc định
              onChange={(e) => handleSortCheck("", e.target.checked)}
              className="text-gray-600 text-sm hover:text-black w-full"
            >
              Mới nhất
            </Checkbox>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={currentSort === "price_asc"}
              onChange={(e) => handleSortCheck("price_asc", e.target.checked)}
              className="text-gray-600 text-sm hover:text-black w-full"
            >
              Giá: Thấp đến Cao
            </Checkbox>
          </div>
          <div className="flex items-center">
            <Checkbox
              checked={currentSort === "price_desc"}
              onChange={(e) => handleSortCheck("price_desc", e.target.checked)}
              className="text-gray-600 text-sm hover:text-black w-full"
            >
              Giá: Cao đến Thấp
            </Checkbox>
          </div>
        </div>
      </Panel>

      {/* danh mục */}
      <Panel
        header={
          <Title level={5} style={{ margin: 0 }}>
            Danh mục
          </Title>
        }
        key="cat"
      >
        <div className="flex flex-col gap-3">
          {categories.map((cat) => (
            <div key={cat.id}>
              <Checkbox
                checked={String(cat.id) === selectedCatId}
                onChange={(e) => handleCategoryCheck(cat.id, e.target.checked)}
                className="text-gray-600 text-sm hover:text-black w-full"
              >
                {cat.name}
              </Checkbox>
            </div>
          ))}
        </div>
      </Panel>

      {/* brand */}
      <Panel
        header={
          <Title level={5} style={{ margin: 0 }}>
            Thương hiệu
          </Title>
        }
        key="brand"
      >
        <div className="flex flex-col gap-3">
          {/* Tùy chọn tất cả (để reset filter brand) */}
          <div>
            <Checkbox
              checked={!selectedBrandId} // Nếu không có brand nào trên URL thì tick cái này
              onChange={(e) => updateParams({ tag_ids: null })} // Luôn reset khi bấm
              className="text-gray-600 text-sm hover:text-black w-full"
            >
              Tất cả
            </Checkbox>
          </div>

          {brands.map((brand) => (
            <div key={brand.id}>
              <Checkbox
                checked={String(brand.id) === selectedBrandId}
                onChange={(e) => handleBrandCheck(brand.id, e.target.checked)}
                className="text-gray-600 text-sm hover:text-black w-full"
              >
                {brand.name}
              </Checkbox>
            </div>
          ))}
        </div>
      </Panel>

      {/* lọc giá */}
      <Panel
        header={
          <Title level={5} style={{ margin: 0 }}>
            Khoảng giá
          </Title>
        }
        key="price"
      >
        <div className="flex flex-col gap-3">
          {PRICE_RANGES.map((range, index) => (
            <div key={index}>
              <Checkbox
                checked={index === selectedPriceIndex}
                onChange={(e) => handlePriceCheck(index, e.target.checked)}
                className="text-gray-600 text-sm hover:text-black w-full"
              >
                {range.label}
              </Checkbox>
            </div>
          ))}
        </div>
      </Panel>
    </Collapse>
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Collapse: {
            headerPadding: "12px 0",
            contentPadding: "0 0 16px 0",
            colorBorder: "transparent",
            headerBg: "#fff",
          },
          Checkbox: { colorPrimary: "#000", borderRadius: 2 }, // Vuông vắn, màu đen
        },
      }}
    >
      {/* 1. GIAO DIỆN MOBILE: Nút mở Drawer */}
      <div className="lg:hidden mb-4 flex justify-end">
        <Button
          onClick={() => setMobileFilterOpen(true)}
          className=" flex items-center gap-2 rounded-4xl border border-gray-300 bg-white px-5 py-1.5 text-sm !font-medium text-gray-900 shadow-sm hover:border-black hover:bg-gray-50 transition-all"
        >
          <SlidersHorizontal size={18} />
          Bộ lọc & Sắp xếp
        </Button>
      </div>

      {/* Drawer cho Mobile */}
      <Drawer
        title="Bộ lọc sản phẩm"
        placement="right"
        onClose={() => setMobileFilterOpen(false)}
        open={mobileFilterOpen}
        size="default"
        closeIcon={<X size={24} />}
        styles={{
          header: { borderBottom: "1px solid #f0f0f0" },
          body: { paddingBottom: 80 },
        }}
      >
        {renderFilterContent()}

        <div className="absolute bottom-0 left-0 w-full p-4 border-t bg-white">
          <Button
            type="primary"
            block
            size="large"
            className="!bg-black hover:bg-gray-800 font-bold h-12"
            onClick={() => setMobileFilterOpen(false)}
          >
            Xem kết quả
          </Button>
        </div>
      </Drawer>

      {/* 2. GIAO DIỆN DESKTOP: Sidebar cố định (Giữ nguyên như cũ) */}
      <div className="hidden lg:block bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        {renderFilterContent()}
      </div>
    </ConfigProvider>
  );
}
