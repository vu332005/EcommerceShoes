"use client";

import React, { useEffect, useState } from "react";
import { Modal, Form, Input, InputNumber, Button, message, Upload } from "antd";
import {
  UploadOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { productService } from "@/services/productService";

interface VariantFormModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void; // Gọi để cha load lại list
  initialData: any | null; // Dữ liệu sửa
  productId: number | null;
}

export default function VariantFormModal({
  open,
  onCancel,
  onSuccess,
  initialData,
  productId,
}: VariantFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Reset form khi mở modal
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Mode: Edit
        form.setFieldsValue({
          sku: initialData.sku,
          price: initialData.priceOverride,
          stock: initialData.stockQuantity,
          color: initialData.color?.value || "",
          size: initialData.size?.value || "",
          brand: initialData.brand?.value || "",
          // Map ảnh từ object sang mảng URL
          images: initialData.images?.map((img: any) => img.imageUrl) || [],
        });
      } else {
        // Mode: Create
        form.resetFields();
        form.setFieldsValue({ images: [""] }); // Mặc định 1 dòng ảnh trống
      }
    }
  }, [open, initialData, form]);

  const handleFinish = async (values: any) => {
    if (!productId) return;
    setLoading(true);

    // Lọc bỏ link rỗng
    const validImages = (values.images || []).filter(
      (url: string) => url && url.trim() !== "",
    );

    const payload = {
      sku: values.sku,
      price: values.price,
      stock: values.stock,
      color: values.color,
      size: values.size,
      brand: values.brand,
      images: validImages,
    };

    try {
      if (initialData) {
        await productService.updateVariant(initialData.id, payload);
        message.success("Cập nhật thành công!");
      } else {
        await productService.createVariant(productId, payload);
        message.success("Thêm mới thành công!");
      }
      onSuccess(); // Báo cha reload
      onCancel(); // Đóng modal
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Cập nhật Biến thể" : "Thêm Biến thể Mới"}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="sku"
            label="Mã SKU (Duy nhất)"
            rules={[{ required: true, message: "Nhập SKU" }]}
          >
            <Input placeholder="VD: NIK-RED-42" />
          </Form.Item>
          <Form.Item
            name="stock"
            label="Tồn kho"
            rules={[{ required: true, message: "Nhập số lượng" }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="brand" label="Thương hiệu">
            <Input placeholder="VD: Nike, Adidas..." />
          </Form.Item>
          <Form.Item name="color" label="Màu sắc">
            <Input placeholder="VD: Đỏ, Xanh..." />
          </Form.Item>
          <Form.Item name="size" label="Kích cỡ">
            <Input placeholder="VD: XL, 42..." />
          </Form.Item>
        </div>

        <Form.Item name="price" label="Giá riêng (VNĐ)">
          <InputNumber
            className="w-full"
            min={0}
            placeholder="Để trống nếu dùng giá gốc"
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
          />
        </Form.Item>

        <div className="mb-2 font-semibold">Danh sách ảnh:</div>
        <Form.List name="images">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Form.Item key={field.key} style={{ marginBottom: 12 }}>
                  <div className="flex gap-4 items-start">
                    <Form.Item
                      {...field}
                      noStyle
                      rules={[{ required: true, message: "Cần upload ảnh" }]}
                    >
                      <Input type="hidden" />
                    </Form.Item>

                    <div className="flex-1">
                      <Upload
                        listType="picture"
                        maxCount={1}
                        showUploadList={{ showRemoveIcon: false }}
                        customRequest={async ({
                          file,
                          onSuccess,
                          onError,
                        }: any) => {
                          try {
                            const url =
                              await productService.uploadImageService(file);
                            // Cập nhật URL vào ô input của dòng này
                            const currentImages =
                              form.getFieldValue("images") || [];
                            currentImages[field.name] = url;
                            form.setFieldsValue({ images: currentImages });

                            onSuccess("ok");
                            message.success("Upload xong!");
                          } catch (err) {
                            onError(err);
                            message.error("Lỗi upload");
                          }
                        }}
                      >
                        <Button icon={<UploadOutlined />}>Upload</Button>
                      </Upload>

                      {/* Preview Ảnh */}
                      <Form.Item shouldUpdate noStyle>
                        {() => {
                          const images = form.getFieldValue("images");
                          const url = images?.[field.name];
                          return url ? (
                            <img
                              src={
                                url.startsWith("http") ? url : `/images/${url}`
                              }
                              className="mt-2 h-16 w-16 object-cover rounded border"
                              alt="preview"
                            />
                          ) : null;
                        }}
                      </Form.Item>
                    </div>

                    <MinusCircleOutlined
                      className="text-red-500 cursor-pointer pt-2 text-xl"
                      onClick={() => remove(field.name)}
                    />
                  </div>
                </Form.Item>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  Thêm ảnh khác
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button onClick={onCancel}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="bg-[#E31D2B]"
          >
            Lưu lại
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
