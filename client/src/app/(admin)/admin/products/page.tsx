"use client";

import React, { useState, useEffect } from "react";
import { Button, Typography, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { productService } from "@/services/productService";
import { masterService } from "@/services/masterService";
import ProductTable from "@/components/admin/product/ProductTable";
import ProductFormModal from "@/components/admin/product/ProductFormModal";
import VariantManager from "@/components/admin/variant/VariantManager";

const { Title } = Typography;

export default function AdminProductPage() {
  // State Data
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null); // Lưu sản phẩm đang sửa (nếu null -> Thêm mới)

  // State Drawer Variant
  const [variantDrawerOpen, setVariantDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>( // Lưu ID sản phẩm đang xem biến thể
    null,
  );

  // Logic Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesData] = await Promise.all([
        productService.getAllProductsAdmin(),
        masterService.getCategories(),
      ]);
      setProducts(productsRes.data || []);
      setCategories(categoriesData || []);
    } catch (error) {
      message.error("Lỗi tải dữ liệu hệ thống");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logic Xử lý Sự kiện từ Component Con

  // Xử lý mở Modal
  const handleOpenCreate = () => {
    // mở modal thêm mới
    setEditingProduct(null); // Quan trọng: Set null để Modal biết đây là mode "Thêm mới" (Form trắng)
    setIsModalOpen(true); // mở modal lên
  };

  const handleOpenEdit = (product: any) => {
    // mở modal chỉnh sửa
    setEditingProduct(product); // lưu spham cần sửa để modal điền dlieu cũ vào form
    setIsModalOpen(true);
  };

  // Xử lý khi Form con lưu thành công
  const handleFormSuccess = () => {
    setIsModalOpen(false);
    fetchData(); // Load lại bảng
  };

  // Xử lý Xóa
  const handleDelete = async (id: number) => {
    try {
      await productService.deleteProduct(id);
      message.success("Đã xóa sản phẩm");
      fetchData();
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  // Xử lý Biến thể
  const handleOpenVariants = (id: number) => {
    setSelectedProductId(id);
    setVariantDrawerOpen(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={3} style={{ margin: 0 }}>
          QUẢN LÝ SẢN PHẨM
        </Title>

        {/* nút thêm */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="bg-[#E31D2B]"
        >
          Thêm SP Gốc
        </Button>
      </div>

      {/* Component Bảng */}
      <ProductTable
        products={products}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        onOpenVariants={handleOpenVariants}
      />

      {/* Component Modal Form  */}
      <ProductFormModal
        open={isModalOpen}
        initialData={editingProduct}
        categories={categories}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={handleFormSuccess}
      />

      {/* Component Drawer Biến thể */}
      <VariantManager
        productId={selectedProductId}
        visible={variantDrawerOpen}
        onClose={() => setVariantDrawerOpen(false)}
      />
    </div>
  );
}
/*
Điểm hay: Component cha (AdminProductPage) hoàn toàn không biết chi tiết về việc Upload ảnh hay Validate form như thế nào. Nó chỉ quan tâm: "Mở modal lên, đưa dữ liệu vào, chờ modal báo xong thì tải lại trang". Đây là nguyên lý Separation of Concerns (Phân tách mối quan tâm).
Tổng kết luồng đi (Flow)
  - Vào trang: useEffect -> fetchData -> State products & categories có dữ liệu -> ProductTable hiển thị danh sách.
  - Bấm Thêm: Gọi handleOpenCreate -> isModalOpen = true -> ProductFormModal hiện ra (trống trơn).
  - Bấm Sửa: Gọi handleOpenEdit -> editingProduct = product A -> ProductFormModal hiện ra (có điền sẵn thông tin A).
  - Bấm Lưu (trong Modal): Modal tự xử lý API -> Gọi handleFormSuccess -> Cha đóng Modal và gọi fetchData -> Bảng cập nhật.
*/
