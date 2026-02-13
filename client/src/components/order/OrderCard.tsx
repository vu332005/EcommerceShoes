"use client";

import Image from "next/image";
import { Card, Tag, Typography, Divider, Button, Space } from "antd";
import { ShopOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

// Map trạng thái sang màu sắc chuẩn của Ant Design
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Chờ xác nhận", color: "orange" },
  confirmed: { label: "Đã xác nhận", color: "blue" },
  shipping: { label: "Đang giao", color: "purple" },
  completed: { label: "Hoàn thành", color: "green" },
  cancelled: { label: "Đã hủy", color: "red" },
};

interface OrderCardProps {
  order: any;
}

export default function OrderCard({ order }: OrderCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  // Fallback nếu status lạ
  const statusInfo = STATUS_MAP[order.status] || {
    label: order.status,
    color: "default",
  };

  return (
    <Card
      className="shadow-sm border-none mb-4 hover:shadow-md transition-shadow bg-white"
      styles={{ body: { padding: "20px" } }}
    >
      {/*Header: Tên Shop & Trạng thái */}
      <div className="flex justify-between items-center mb-4">
        <Space>
          <ShopOutlined />
          <Text strong>Shoes Shop</Text>
          <Divider type="vertical" />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Mã đơn: #{order.id}
          </Text>
        </Space>

        <Tag
          color={statusInfo.color}
          style={{ marginRight: 0, border: "none" }}
        >
          {statusInfo.label.toUpperCase()}
        </Tag>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/*Body: Danh sách sản phẩm */}
      <div className="space-y-4">
        {order.items.map((item: any) => {
          // Logic xử lý ảnh
          const rawImgUrl =
            item.variant?.images?.[0]?.imageUrl || // ưu tiên lấy ảnh biến thể -> ảnh product chung -> ảnh rỗng
            item.variant?.product?.thumbnailUrl ||
            "/images/placeholder.png";

          const fullImgUrl = rawImgUrl.startsWith("http")
            ? rawImgUrl
            : `/images/${rawImgUrl.replace("/images/", "")}`;

          return (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-20 w-20 border border-gray-200 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={fullImgUrl}
                  alt={item.productName}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <Title
                  level={5}
                  ellipsis={{ rows: 1 }}
                  style={{ margin: 0, fontSize: 16 }}
                >
                  {item.productName}
                </Title>
                <div className="text-gray-500 text-sm mt-1">
                  Phân loại:{" "}
                  <Tag style={{ border: "none", background: "#f5f5f5" }}>
                    {item.variantDescription || "Mặc định"}
                  </Tag>
                </div>
                <div className="mt-1">
                  <Text>x{item.quantity}</Text>
                </div>
              </div>
              <div className="text-right">
                <Text type="secondary">
                  {formatPrice(item.priceAtPurchase)}
                </Text>
              </div>
            </div>
          );
        })}
      </div>

      <Divider style={{ margin: "16px 0" }} />

      {/* 3. Footer: Tổng tiền & Nút hành động */}
      <div className="flex flex-col items-end gap-4">
        <Space align="center">
          <Text type="secondary">Thành tiền:</Text>
          <Title
            level={4}
            style={{ margin: 0, color: "lab(33.7174% 55.8993 41.0293)" }}
          >
            {formatPrice(order.totalAmount)}
          </Title>
        </Space>

        {/* <Space>
          {order.status === "pending" && <Button danger>Hủy đơn hàng</Button>}
          {order.status === "confirmed" && (
            <Button type="primary">Mua lại</Button>
          )}
          <Button>Xem chi tiết</Button>
        </Space> */}
      </div>
    </Card>
  );
}
