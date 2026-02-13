"use client";

import React, { useState, useEffect } from "react";
import { message, Typography } from "antd";
import { orderService } from "@/services/order.service";

// Import components con
import OrderFilter from "@/components/admin/order/OrderFilter";
import OrderTable from "@/components/admin/order/OrderTable";
import OrderDetailModal from "@/components/admin/order/OrderDetailModal";

const { Title } = Typography;

export default function AdminOrderPage() {
  // State
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined,
  );
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Fetch Orders
  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrdersAdmin({
        page,
        limit: pagination.pageSize,
        keyword,
        status: statusFilter,
      });

      setOrders(res.data.data);
      setPagination({
        ...pagination,
        current: res.data.page,
        total: res.data.total,
      });
    } catch (error) {
      message.error("Lỗi tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, [statusFilter]);

  // Actions
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      message.success(`Đã cập nhật đơn #${orderId} thành công`);
      fetchOrders(pagination.current);
    } catch (error) {
      message.error("Cập nhật thất bại");
    }
  };

  const openDetail = async (orderId: number) => {
    try {
      const res = await orderService.getOrderDetailAdmin(orderId);
      setSelectedOrder(res.data);
      setIsModalOpen(true);
    } catch (error) {
      message.error("Không lấy được chi tiết đơn hàng");
    }
  };

  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-6">
        <Title level={3} style={{ margin: 0 }}>
          QUẢN LÝ ĐƠN HÀNG
        </Title>
      </div>

      {/* Component Thanh Lọc */}
      <OrderFilter
        keyword={keyword}
        setKeyword={setKeyword}
        setStatusFilter={setStatusFilter}
        onSearch={() => fetchOrders(1)}
      />

      {/* Component Bảng */}
      <OrderTable
        orders={orders}
        loading={loading}
        pagination={pagination}
        fetchOrders={fetchOrders}
        onStatusChange={handleStatusChange}
        onOpenDetail={openDetail}
      />

      {/* Component Modal */}
      <OrderDetailModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
