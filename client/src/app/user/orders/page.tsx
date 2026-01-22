"use client";

import { useEffect, useState, useMemo } from "react";
import { orderService } from "@/services/order.service";
import Link from "next/link";
import { Spin, Empty, Button, ConfigProvider, Tabs } from "antd";
import type { TabsProps } from "antd";
import OrderCard from "@/components/order/OrderCard";

const tabItems: TabsProps["items"] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderService.getMyOrders();
        // Sắp xếp đơn mới nhất lên đầu
        const sortedData = Array.isArray(data)
          ? data.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
          : [];
        setOrders(sortedData);
      } catch (error) {
        console.error("Lỗi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  //lọc các order
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    // Lọc chính xác theo trạng thái status
    return orders.filter((order) => order.status === activeTab);
  }, [orders, activeTab]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        {/* Xóa prop tip ở đây */}
        <Spin size="large" />

        {/* Thêm dòng text thủ công bên dưới */}
        <span className="text-gray-500 font-medium">Đang tải đơn hàng...</span>
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#E31D2B",
        },
      }}
    >
      <div className="max-w-5xl mx-auto pb-10 space-y-6">
        <div className="bg-white px-4 pt-2 rounded-t-md shadow-sm border-b sticky top-0 z-10">
          <Tabs
            defaultActiveKey="all"
            activeKey={activeTab}
            onChange={setActiveTab} // update active tab khi bấm
            items={tabItems}
            size="large"
            tabBarStyle={{ marginBottom: 0 }}
          />
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-md shadow-sm min-h-[400px] flex flex-col items-center justify-center border border-gray-100">
            {/* trg hợp k có đơn hàng nào  */}
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-gray-500">
                  {activeTab === "all"
                    ? "Bạn chưa có đơn hàng nào"
                    : "Không tìm thấy đơn hàng phù hợp"}
                </span>
              }
            >
              <Link href="/products">
                <Button type="primary" size="large">
                  Mua sắm ngay
                </Button>
              </Link>
            </Empty>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </ConfigProvider>
  );
}
