"use client";

import React, { useState, useEffect } from "react";
import { Drawer, Button, Space, message } from "antd";
import { PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { productService } from "@/services/productService";

// Import 2 component con
import VariantTable from "./VariantTable";
import VariantFormModal from "./VariantFormModal";

interface VariantManagerProps {
  productId: number | null;
  visible: boolean;
  onClose: () => void;
}

export default function VariantManager({
  productId,
  visible,
  onClose,
}: VariantManagerProps) {
  const [variants, setVariants] = useState<any[]>([]);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(false);

  // State quản lý Modal con
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any | null>(null);

  // Fetch Dữ liệu
  const fetchVariants = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const product = await productService.getProductDetail(productId);
      if (product) {
        setVariants(product.variants || []);
        setProductName(product.name);
      }
    } catch (error) {
      message.error("Lỗi tải biến thể");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && productId) {
      fetchVariants();
    }
  }, [visible, productId]);

  // Logic Xóa
  const handleDelete = async (id: number) => {
    try {
      await productService.deleteVariant(id);
      message.success("Đã xóa biến thể");
      fetchVariants();
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  // Logic mở Modal Thêm/Sửa
  const openCreate = () => {
    setEditingVariant(null);
    setIsModalOpen(true);
  };

  const openEdit = (variant: any) => {
    setEditingVariant(variant);
    setIsModalOpen(true);
  };

  return (
    <>
      <Drawer
        title={`Biến thể: ${productName}`}
        width={800}
        onClose={onClose}
        open={visible}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchVariants} />
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Thêm Biến thể
            </Button>
          </Space>
        }
      >
        {/* Component Bảng */}
        <VariantTable
          variants={variants}
          loading={loading}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </Drawer>

      {/* Component Form Modal */}
      <VariantFormModal
        open={isModalOpen}
        productId={productId}
        initialData={editingVariant}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={fetchVariants} // Load lại bảng khi lưu xong
      />
    </>
  );
}
