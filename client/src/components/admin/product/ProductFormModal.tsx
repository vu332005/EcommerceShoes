// hiển thị - xử lý logic form thêm mới/ cập nhật spham + xly logic upload ảnh preview
"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Upload,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload/interface";
import { productService } from "@/services/productService";

interface ProductFormModalProps {
  open: boolean; // status bật tắt modal
  onCancel: () => void; // func đóng mocal
  onSuccess: () => void; // Gọi khi lưu thành công để cha reload data
  initialData?: any | null; // Dữ liệu sản phẩm cần sửa (nếu có)
  categories: any[];
}

export default function ProductFormModal({
  open,
  onCancel,
  onSuccess,
  initialData,
  categories,
}: ProductFormModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // State xử lý ảnh
  const [previewImage, setPreviewImage] = useState<string>(""); // dùng hiển thị ảnh luôn cho ng xem
  const [fileToUpload, setFileToUpload] = useState<RcFile | null>(null); // lưu trữ file gốc ng dùng chọn -> gửi khi bấm btn lưu lại

  // chạy khi form mở ra -> nếu sửa -> prefill dlieu có lên form / thêm mới -> xóa trắng form
  useEffect(() => {
    if (open) {
      // case edit
      if (initialData) {
        // hiển thị ảnh đang có -> ch chọn ảnh mới nên setFileToUpload null
        const url = initialData.thumbnailUrl;
        const displayUrl = url?.startsWith("http") ? url : `/images/${url}`;
        setPreviewImage(displayUrl);
        setFileToUpload(null);

        // đổ dlieu cũ vào các ô input
        form.setFieldsValue({
          ...initialData,
          categoryId: initialData.category?.id,
        });
      }
      // case create
      else {
        // xóa trắng form
        resetState();
      }
    }
  }, [open, initialData, form]);

  //
  const resetState = () => {
    form.resetFields();
    setPreviewImage("");
    setFileToUpload(null);
  };

  // Logic chọn ảnh -> chuyển file sang base64 -> để hiện thị cho ng xem luôn + lưu file gốc vào state để lưu về db
  const handleBeforeUpload = (file: RcFile) => {
    // check type
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Chỉ chấp nhận file JPG/PNG!");
      return Upload.LIST_IGNORE;
    }

    // check size
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }

    // chuyển sang base 64 -> cho user preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => setPreviewImage(reader.result as string);

    // lưu file gốc
    setFileToUpload(file);
    form.setFieldValue("thumbnailUrl", "file_selected"); // Fake value để pass validate
    return false;
  };

  // Logic Submit (Upload -> API Save)
  // luồng : Bật Loading -> Upload ảnh (nếu cần) -> Gửi dữ liệu xuống Backend -> Dọn dẹp -> Tắt Loading
  const handleFinish = async (values: any) => {
    // values là obj chứa dlieu ng dùng nhập trong form
    setLoading(true);
    try {
      let finalThumbnailUrl = values.thumbnailUrl;

      // Upload ảnh nếu có file mới
      if (fileToUpload) {
        //upload file gốc lên server -> server trả về url(cái mà link ảnh cdn trả) ảnh thật -> gắn nó vào thumbnail
        finalThumbnailUrl =
          await productService.uploadImageService(fileToUpload);
      }

      const payload = { ...values, thumbnailUrl: finalThumbnailUrl };

      // Gọi API tương ứng
      if (initialData) {
        await productService.updateProduct(initialData.id, payload);
        message.success("Cập nhật thành công!");
      } else {
        await productService.createProduct(payload);
        message.success("Thêm mới thành công!");
      }

      onSuccess(); // Báo cho cha biết xong rồi
      resetState(); // dọn
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
      open={open} // quyết định xem modal mở hay đóng
      onCancel={() => {
        //khi bấm x/ click ra ngoài -> reset form và đóng
        resetState();
        onCancel();
      }}
      footer={null} // ẩn nút ok/cancel mặc định của modal
    >
      {/* chạy hàm handleFinish khi ng dùng ấn submit  */}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: "Nhập tên sản phẩm" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="handle"
          label="Slug (URL)"
          rules={[{ required: true, message: "Nhập slug" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Danh mục"
          rules={[{ required: true, message: "Chọn danh mục" }]}
        >
          <Select placeholder="Chọn danh mục">
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="basePrice"
          label="Giá gốc"
          rules={[{ required: true, message: "Nhập giá" }]}
        >
          {/* 
          formatter: Khi người dùng nhập 1000000, nó hiển thị thành 1,000,000 (Thêm dấu phẩy).
          parser: Khi gửi dữ liệu đi, nó gỡ bỏ dấu phẩy để biến thành số 1000000 thuần túy (Database chỉ hiểu số, không hiểu dấu phẩy). 
          */}
          <InputNumber
            className="w-full"
            min={0}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as any}
          />
        </Form.Item>

        {/* Khối Upload Ảnh */}
        <Form.Item label="Ảnh đại diện" required>
          {/* input ẩn để validate */}
          <Form.Item
            name="thumbnailUrl"
            noStyle
            rules={[{ required: true, message: "Vui lòng chọn ảnh" }]}
          >
            <Input type="hidden" />
          </Form.Item>

          {/* giao diện upload + nút bấm upload */}
          <div className="flex flex-col items-center gap-3 p-4 ">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className="w-32 h-32 object-cover rounded"
              />
            ) : (
              <div className="text-gray-400 text-sm">Chưa có ảnh</div>
            )}

            <Upload
              showUploadList={false}
              beforeUpload={handleBeforeUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>
                {previewImage ? "Đổi ảnh khác" : "Chọn ảnh"}
              </Button>
            </Upload>
          </div>
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* action btn */}
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
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
