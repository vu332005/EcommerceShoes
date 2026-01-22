"use client";

import { useState, useMemo, useEffect } from "react";
import { Product } from "@/types/product";
import { ShoppingCart, Minus, Plus, Ruler } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/redux/hooks";
import { addItemToCart } from "@/redux/features/cartSlice";

// Mapping màu sắc
const COLOR_MAP: Record<string, string> = {
  "Đen (Black)": "#000000",
  "Trắng (White)": "#FFFFFF",
  "Đỏ (Red)": "#DC2626",
  "Xanh (Blue)": "#2563EB",
  "Vàng (Yellow)": "#CA8A04",
  Xám: "#808080",
  Nâu: "#964B00",
};

interface ProductInfoProps {
  product: Product;
  onColorSelect?: (id: number) => void;
}

export default function ProductInfo({
  product,
  onColorSelect,
}: ProductInfoProps) {
  const dispatch = useAppDispatch();

  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);

  const variants = product.variants || []; // dsach các variants của product

  // Logic lọc màu
  const uniqueColors = useMemo(() => {
    //dùng map để không bị lọc trùng - vì map qua 3 variant màu đỏ -> hiện ra 3 nút màu đỏ * ta chỉ cần hiện 1 nút
    const colors = new Map();

    variants.forEach((v) => {
      if (v.color && v.color.id && !colors.has(v.color.id)) {
        // kiểm tra màu tồn tại k + màu chưa có trong map -> cho vào
        const colorName = v.color.name || "";
        const hexCode = COLOR_MAP[colorName] || "#CCCCCC";
        colors.set(v.color.id, { ...v.color, hexCode }); // lưu vào map : key là id màu - value là obj gồm (tên màu + hexcode)
      }
    });

    return Array.from(colors.values()); // chuyển các value trong map thành 1 mảng để dùng
  }, [variants]);

  // Tự động chọn màu đầu tiên
  useEffect(() => {
    if (uniqueColors.length > 0 && !selectedColorId) {
      setSelectedColorId(uniqueColors[0].id);
      if (onColorSelect) onColorSelect(uniqueColors[0].id);
    }
  }, [uniqueColors]);

  // Logic lọc size mà variant có
  const availableSizes = useMemo(() => {
    if (!selectedColorId) return []; // chưa chọn màu -> kco size
    return variants
      .filter((v) => v.color?.id === selectedColorId && v.size) // lọc ra các đôi đúng vs màu đang chọn và có thông tin size
      .map((v) => ({
        ...v.size,
        stock: v.stockQuantity,
        variantId: v.id,
      }))
      .sort((a, b) => Number(a.value) - Number(b.value)); // sort lại các size
  }, [variants, selectedColorId]);

  const handleColorClick = (id: number) => {
    setSelectedColorId(id);
    setSelectedSizeId(null);
    if (onColorSelect) onColorSelect(id);
  };

  // add to cart
  const handleAddToCart = () => {
    // validate
    if (uniqueColors.length > 0) {
      if (!selectedColorId) return toast.error("Vui lòng chọn màu sắc");
      if (!selectedSizeId) return toast.error("Vui lòng chọn kích cỡ");
    }

    // tìm variant ng dùng chọn
    const selectedVariant = variants.find(
      (v) => v.color?.id === selectedColorId && v.size?.id === selectedSizeId,
    );

    // Fallback: Nếu là sp đơn giản (không màu/size) thì lấy variant đầu tiên
    const variantToBuy = selectedVariant || variants[0];

    if (!variantToBuy)
      return toast.error("Có lỗi: Không tìm thấy phiên bản sản phẩm");

    // tìm chính xác ảnh của variant để lm cartItem (mua màu nào -> hiện ảnh màu đó)
    let correctImage = product.thumbnailUrl; // Mặc định là ảnh bìa

    // Cách 1: Nếu biến thể có ảnh riêng (backend trả về trong variant.images)
    if (variantToBuy.images && variantToBuy.images.length > 0) {
      // Lấy ảnh đầu tiên của variant đó (thường là ảnh thumbnail của màu đó)
      correctImage = variantToBuy.images[0].imageUrl;
    }
    // Cách 2: Nếu backend trả về tất cả ảnh trong product.images (kèm color_id)
    // else if (product.images && product.images.length > 0) {
    //   // Tìm ảnh nào có color_id trùng với màu đang chọn
    //   const colorImage = product.images.find(
    //     (img: any) => img.color?.id === selectedColorId
    //   );
    //   if (colorImage) {
    //     correctImage = colorImage.imageUrl;
    //   }
    // }

    // Tạo dữ liệu để lưu
    const itemPayload = {
      variantId: variantToBuy.id,
      quantity: quantity,
      productName: product.name,
      price: variantToBuy.priceOverride || product.price, // Ưu tiên giá riêng
      thumbnailUrl: correctImage, // lưu ảnh chọn để hiện thị
      size: variantToBuy.size?.value,
      color: variantToBuy.color?.name,
    };

    //
    dispatch(addItemToCart(itemPayload));

    toast.success("Đã thêm vào giỏ hàng!");
  };

  // check stock
  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.color?.id === selectedColorId && v.size?.id === selectedSizeId,
    );
  }, [variants, selectedColorId, selectedSizeId]);

  const maxStock = selectedVariant ? selectedVariant.stockQuantity : 999;

  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stockQuantity) {
      setQuantity(selectedVariant.stockQuantity);
      toast.error(
        `Chỉ còn ${selectedVariant.stockQuantity} sản phẩm trong kho!`,
      );
    }
  }, [selectedVariant?.id]); // Chỉ chạy khi ID biến thể thay đổi (đổi size/màu)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);

  return (
    <div className="mt-8 md:mt-0">
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <p className="mt-2 text-xl font-semibold text-blue-600">
        {formatPrice(product.price)}
      </p>

      {/* RENDER COLORS */}
      {uniqueColors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900">Màu sắc</h3>
          <div className="mt-2 flex items-center space-x-3">
            {uniqueColors.map(
              (
                color: any, // loop để in ra các ô màu
              ) => (
                <button
                  key={color.id}
                  onClick={() => handleColorClick(color.id)} //
                  className={cn(
                    "relative h-8 w-8 rounded-full border shadow-sm focus:outline-none transition-all",
                    "border-gray-300",
                    selectedColorId === color.id
                      ? "ring-2 ring-blue-500 ring-offset-2 scale-110 border-transparent" // selected
                      : "hover:scale-105", // ch chọn
                  )}
                  style={{ backgroundColor: color.hexCode }}
                  title={color.name}
                />
              ),
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Màu đang chọn:{" "}
            <span className="font-medium text-gray-900">
              {uniqueColors.find((c: any) => c.id === selectedColorId)?.name}
            </span>
          </p>
        </div>
      )}

      {/* RENDER SIZES */}
      {uniqueColors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-900">Kích cỡ</h3>
          <div className="mt-2 grid grid-cols-4 gap-4 sm:grid-cols-6">
            {selectedColorId ? (
              availableSizes.length > 0 ? (
                availableSizes.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSizeId(item.id)}
                    disabled={item.stock === 0} //
                    className={cn(
                      "flex items-center justify-center rounded-md border py-3 text-sm font-medium uppercase transition-colors",
                      item.stock === 0
                        ? "cursor-not-allowed bg-gray-100 text-gray-400 opacity-50" // nếu stock hết hàng -> kh cho bấm
                        : selectedSizeId === item.id
                          ? "border-blue-600 bg-blue-600 text-white shadow-md" // đc chọn
                          : "border-gray-200 bg-white text-gray-900 hover:border-blue-300 hover:bg-blue-50", // ch chọn
                    )}
                  >
                    {item.value}
                  </button>
                ))
              ) : (
                <p className="col-span-4 text-sm text-red-500">
                  Hết hàng màu này
                </p>
              )
            ) : (
              <div className="col-span-4 text-sm text-gray-400 italic">
                (Vui lòng chọn màu trước)
              </div>
            )}
          </div>
        </div>
      )}
      {/* graph TD
    A[Đã chọn màu chưa?] -->|Chưa| B[Hiện: Vui lòng chọn màu trước]
    A -->|Rồi| C[Màu này có size nào không?]
    C -->|Không| D[Hiện: Hết hàng màu này]
    C -->|Có| E[Vẽ danh sách nút Size] */}

      {/* QUANTITY & ACTIONS */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center rounded border border-gray-300">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))} // dùng max để k bị số lg về <=0
            className="p-2 hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-gray-500 ck font-medium">
            {quantity}
          </span>
          <button
            // Logic chặn: Dùng Math.min để không bao giờ vượt quá maxStock
            onClick={() => {
              if (quantity >= maxStock) {
                toast.error("Đã đạt giới hạn tồn kho!");
                return;
              }
              setQuantity(quantity + 1);
            }}
            // Disable nút nếu đã chạm trần (hoặc hết hàng)
            disabled={quantity >= maxStock || maxStock === 0}
            className={cn(
              "p-2 transition-colors",
              // Nếu disable thì hiện màu xám, con trỏ cấm
              quantity >= maxStock || maxStock === 0
                ? "cursor-not-allowed opacity-30 text-gray-400"
                : "hover:bg-gray-100 text-gray-900",
            )}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={handleAddToCart}
          className="flex flex-1 items-center justify-center rounded-md bg-black px-8 py-3 text-base font-medium text-white hover:bg-gray-700 shadow-lg active:scale-95 transition-transform"
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ
        </button>
      </div>

      <div className="mt-10 border-t pt-6">
        <h3 className="text-lg font-bold text-gray-900">Mô tả</h3>
        <div className="prose mt-4 text-gray-500 whitespace-pre-line">
          {product.description}
        </div>
      </div>
    </div>
  );
}
