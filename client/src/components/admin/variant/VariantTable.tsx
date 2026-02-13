"use client";

import React from "react";
import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface VariantTableProps {
  variants: any[];
  loading: boolean;
  onEdit: (record: any) => void;
  onDelete: (id: number) => void;
}

export default function VariantTable({
  variants,
  loading,
  onEdit,
  onDelete,
}: VariantTableProps) {
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "images",
      render: (images: any[]) => (
        <Space>
          {images && images.length > 0 ? (
            images
              .slice(0, 3)
              .map((img, idx) => (
                <img
                  key={idx}
                  src={
                    img.imageUrl?.startsWith("http")
                      ? img.imageUrl
                      : `/images/${img.imageUrl}`
                  }
                  alt="var"
                  className="w-8 h-8 object-cover border rounded"
                  onError={(e) =>
                    (e.currentTarget.src = "/images/placeholder.png")
                  }
                />
              ))
          ) : (
            <span className="text-gray-400 text-xs">No img</span>
          )}
          {images && images.length > 3 && (
            <span className="text-xs">+{images.length - 3}</span>
          )}
        </Space>
      ),
    },
    { title: "SKU", dataIndex: "sku", width: 120 },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      render: (b: any) => (b ? <Tag color="green">{b.value}</Tag> : "-"),
    },
    {
      title: "Màu",
      dataIndex: "color",
      render: (c: any) => (c ? <Tag color="blue">{c.value}</Tag> : "-"),
    },
    {
      title: "Size",
      dataIndex: "size",
      render: (s: any) => (s ? <Tag color="orange">{s.value}</Tag> : "-"),
    },
    {
      title: "Giá riêng",
      dataIndex: "priceOverride",
      render: (p: number) =>
        p ? (
          new Intl.NumberFormat("vi-VN").format(p)
        ) : (
          <span className="text-gray-400 text-xs">Theo SP gốc</span>
        ),
    },
    { title: "Kho", dataIndex: "stockQuantity", width: 80 },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
          />
          <Popconfirm
            title="Xóa biến thể này?"
            onConfirm={() => onDelete(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={variants}
      rowKey="id"
      loading={loading}
      pagination={false}
      size="small"
      bordered
    />
  );
}
