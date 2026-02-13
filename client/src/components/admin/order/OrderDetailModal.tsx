"use client";

import React from "react";
import { Modal, Button, Card, Typography, Divider } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

export default function OrderDetailModal({
  open,
  onClose,
  order,
}: OrderDetailModalProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ShoppingOutlined />
          <span>Chi tiết đơn hàng #{order?.id}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      width={700}
    >
      {order && (
        <div className="space-y-4">
          {/* Thông tin giao hàng */}
          <Card size="small" title="Thông tin giao hàng" className="bg-gray-50">
            <p>
              <strong>Người nhận:</strong> {order.shippingName}
            </p>
            <p>
              <strong>SĐT:</strong> {order.shippingPhone}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {order.shippingAddress}
            </p>
          </Card>

          {/* Danh sách sản phẩm */}
          <div>
            <Text strong>Sản phẩm đã đặt:</Text>
            <div className="mt-2 border rounded-md overflow-hidden">
              {order.items.map((item: any, idx: number) => (
                <div
                  key={item.id}
                  className={`flex justify-between items-center p-3 ${
                    idx !== order.items.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-100 rounded border overflow-hidden">
                      {/* 1. Tại sao không viết if/else trực tiếp vào src={...} được?
                        Trong JSX (React), dấu ngoặc nhọn { ... } chỉ chấp nhận một Biểu thức (Expression) (thứ trả về giá trị), chứ không chấp nhận Câu lệnh (Statement) (như if, for, const).

                        JavaScript
                        // ❌ SAI: Code này sẽ báo lỗi cú pháp ngay lập tức
                        <img src={
                        const url = item.abc;  // ❌ Khai báo biến: Lỗi
                        if (url) return url;   // ❌ Dùng if: Lỗi
                        } />
                        Muốn dùng if/else hay khai báo biến trong {} thì phải bọc nó vào một hàm và gọi ngay lập tức (IIFE) để nó biến thành một "kết quả".
                        
                        Tóm tắt sự khác biệtChỉ bọc hàm: src={ () => { ... } } $\rightarrow$ SAI (Gửi nguyên cái máy xay sinh tố cho người uống).
                        IIFE (Bọc và gọi ngay): src={ (() => { ... })() } $\rightarrow$ ĐÚNG (Xay xong, đưa cốc nước ép cho người uống).
                        Hàm tách rời (Helper func): src={ getUrl() } $\rightarrow$ ĐÚNG & ĐẸP (Gọi nhân viên pha chế làm xong rồi đưa cốc nước ra).

                        * Bọc hàm không "tự trả về giá trị" trừ khi có ai đó gọi nó. Trong thuộc tính src, React không gọi hàm hộ bạn, nên bạn phải dùng IIFE hoặc Helper Function để tự lấy ra giá trị cuối cùng.
                        */}
                      <img
                        src={(() => {
                          // Lấy URL ưu tiên: Ảnh biến thể -> Ảnh gốc
                          const url =
                            item.variant?.images?.[0]?.imageUrl ||
                            item.variant?.product?.thumbnailUrl;

                          // Nếu không có ảnh nào -> Placeholder
                          if (!url) return "/images/placeholder.png";

                          // Nếu link bắt đầu bằng http (ảnh online) -> Dùng luôn
                          // Nếu không (ảnh local) -> Thêm tiền tố /images/
                          return url.startsWith("http")
                            ? url
                            : `/images/${url}`;
                        })()}
                        className="w-full h-full object-cover"
                        alt={item.productName}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        {item.variantDescription} | x{item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(item.priceAtPurchase)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          {/* Tổng kết */}
          <div className="flex justify-between items-center">
            <Text>Phí vận chuyển:</Text>
            <Text>{formatCurrency(order.shippingFee)}</Text>
          </div>
          <div className="flex justify-between items-center text-lg">
            <Text strong>TỔNG CỘNG:</Text>
            <Text type="danger" strong>
              {formatCurrency(order.totalAmount)}
            </Text>
          </div>
        </div>
      )}
    </Modal>
  );
}
