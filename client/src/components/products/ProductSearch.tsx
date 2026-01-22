"use client";

import { Search } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
//next/navigation -> hook của next để tương tác với url
import { useDebouncedCallback } from "use-debounce";

export default function ProductSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname(); // lấy đường dẫn hiện tại
  const { replace } = useRouter(); //replace -> giúp thay đổi url mà không reload trang

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);

    // Khi tìm kiếm mới thì reset về trang 1
    params.set("page", "1");

    if (term) {
      params.set("keyword", term);
    } else {
      // nếu xóa hết trên input -> xóa luôn keyword khỏi url cho gọn
      params.delete("keyword");
    }

    // Cập nhật URL mà không reload trang
    replace(`${pathname}?${params.toString()}`);
  }, 500);

  return (
    <div className="relative w-full md:w-96">
      <input
        type="text"
        placeholder="Tìm kiếm tên giày..."
        className="text-black w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        defaultValue={searchParams.get("keyword")?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
    </div>
  );
}

/*
Tổng kết luồng hoạt động
Người dùng gõ "Nike".
handleSearch chờ 500ms.
Tạo URL mới: /products?page=1&keyword=Nike.
Dùng replace cập nhật thanh địa chỉ trình duyệt.
URL thay đổi -> Kích hoạt page.tsx (Server Component) chạy lại.
Server lấy dữ liệu mới theo từ khóa "Nike" và trả về danh sách sản phẩm mới.


- uncontroll component
- controll component
*/
