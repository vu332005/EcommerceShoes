"use client";
import { Table, Button, Space, Popconfirm, Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";

interface ProductTableProps {
  products: any[];
  loading: boolean;
  onEdit: (product: any) => void; // callback gọi khi bấm nút sửa
  onDelete: (id: number) => void; // callback gọi khi bấm nút xóa
  onOpenVariants: (id: number) => void; // callback gọi khi bấm nút biến thể
}

export default function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
  onOpenVariants,
}: ProductTableProps) {
  // config các cột của bảng columns - (bảng có bnh cột/ tiêu đề/ hiển thị dlieu như nào)
  const columns = [
    /*
    title: Tên cột hiển thị
    dataIndex: Tên trường trong database (ví dụ: product.id)
    width: Độ rộng cố định 60px
    */
    { title: "ID", dataIndex: "id", width: 60 },
    {
      title: "Ảnh",
      dataIndex: "thumbnailUrl",
      render: (url: string) => {
        // hàm render -> tùy chỉnh giao diện cho cột này
        const imgSrc = url?.startsWith("http") ? url : `/images/${url}`;
        return (
          <img
            src={imgSrc}
            className="w-10 h-10 object-cover border rounded"
            alt="thumbnail"
            onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
          />
        );
      },
    },
    { title: "Tên SP", dataIndex: "name" },
    {
      title: "Danh mục",
      dataIndex: "category",
      render: (cat: any) =>
        cat?.name || <span className="text-gray-400">Chưa có</span>,
    },
    { title: "Slug", dataIndex: "handle" },
    {
      title: "Giá gốc",
      dataIndex: "basePrice",
      render: (val: number) =>
        // Sử dụng Intl.NumberFormat để định dạng số thành tiền Việt Nam
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(val),
    },
    {
      title: "Hành động",
      width: 200,
      render: (
        _: any,
        record: any, // record -> obj spham của dòng htai
      ) => (
        /*
        <Space> -> giúp xếp các nút bấm nằm ngang hàng nhau và tự động tạo khoảng cách đều (gap) giữa chúng.
        <Tooltip>: Khi người dùng di chuột vào nút, nó hiện dòng chữ nhỏ "Quản lý Size/Màu/Kho
        */
        <Space>
          <Tooltip title="Quản lý Size/Màu/Kho">
            <Button
              icon={<AppstoreOutlined />}
              onClick={() => onOpenVariants(record.id)} // -> mở variant drawer của product id click vào
              style={{ color: "#1890ff", borderColor: "#1890ff" }}
            >
              Biến thể
            </Button>
          </Tooltip>

          <Button icon={<EditOutlined />} onClick={() => onEdit(record)} />
          {/* 
          <Popconfirm> (Popup Confirm): Đây là lớp bảo vệ an toàn.
            - Khi bấm nút Thùng rác, nó chưa xóa ngay.
            - Nó hiện một bong bóng nhỏ hỏi: "Xóa?" kèm nút Yes/No.
            -> onConfirm: Hàm này chỉ chạy khi người dùng gan dạ bấm nút "Yes" trong bong bóng Popconfirm.
            -> Lúc này nó mới gọi onDelete(record.id) để báo cho cha xóa sản phẩm có ID này đi. */}
          <Popconfirm title="Xóa?" onConfirm={() => onDelete(record.id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns} // nạp config cột tạo ở trên
      dataSource={products} // nạp dlieu spham lấy từ propss
      rowKey="id"
      loading={loading}
      bordered
    />
  );
}
