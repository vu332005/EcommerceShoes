"use client";

import React from "react";
import { Table, Tag, Select, Button, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { STATUS_MAP } from "@/constants/order";
import dayjs from "dayjs";

const { Option } = Select;

interface OrderTableProps {
  orders: any[];
  loading: boolean;
  pagination: any;
  fetchOrders: (page: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onOpenDetail: (id: number) => void;
}

export default function OrderTable({
  orders,
  loading,
  pagination,
  fetchOrders,
  onStatusChange,
  onOpenDetail,
}: OrderTableProps) {
  const columns = [
    {
      title: "Mã Đơn",
      dataIndex: "id",
      width: 80,
      render: (id: number) => <span className="font-bold">#{id}</span>,
    },
    {
      title: "Khách hàng",
      render: (_: any, record: any) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.shippingName}</span>
          <span className="text-xs text-gray-500">{record.shippingPhone}</span>
        </div>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (amount: number) => (
        <span className="text-[#E31D2B] font-semibold">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount)}
        </span>
      ),
    },
    {
      title: "Thanh toán",
      dataIndex: "payments",
      render: (payments: any[]) => {
        const pm = payments && payments.length > 0 ? payments[0] : null;
        return (
          <div className="flex flex-col text-xs">
            <span>{pm ? pm.paymentMethod : "N/A"}</span>
          </div>
        );
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 160,
      render: (status: string, record: any) => (
        <Select
          defaultValue={status}
          style={{ width: "100%" }}
          onChange={(val) => onStatusChange(record.id, val)}
          //   disabled={status === "completed" || status === "cancelled"}
        >
          {Object.keys(STATUS_MAP).map((key) => (
            <Option key={key} value={key}>
              <Tag color={STATUS_MAP[key].color}>{STATUS_MAP[key].label}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          icon={<EyeOutlined />}
          size="small"
          onClick={() => onOpenDetail(record.id)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      // config phân trang
      pagination={{
        ...pagination,
        onChange: (page) => fetchOrders(page), // Khi bấm trang 2 -> gọi fetchOrders(2)
      }}
      bordered
      scroll={{ x: 800 }}
    />
  );
}
