"use client";

import React, { useState } from "react";
import { Layout, Menu, ConfigProvider, Avatar, Button, Tooltip } from "antd";
import { AppstoreOutlined, ShoppingOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

const { Sider, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();

  const menuItems = [
    {
      key: "/admin/products",
      icon: <AppstoreOutlined />,
      label: "Sản phẩm",
      onClick: () => router.push("/admin/products"),
    },
    {
      key: "/admin/orders",
      icon: <ShoppingOutlined />,
      label: "Đơn hàng",
      onClick: () => router.push("/admin/orders"),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#E31D2B",
        },
      }}
    >
      <Layout style={{ minHeight: "200px" }}>
        {/* --- SIDEBAR --- */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          width={260}
          className="mt-[24px] rounded-[10px]"
          theme="light"
          style={{
            borderRight: "1px solid #f0f0f0",
            position: "sticky",
            top: 0,
            height: "100vh",
            left: 0,
            overflow: "auto",
          }}
          trigger={null}
        >
          {/* 2. MENU CHÍNH */}
          <Menu
            mode="inline"
            defaultSelectedKeys={[pathname]}
            selectedKeys={[pathname]}
            items={menuItems}
            style={{ borderRight: 0 }}
            className="text-[15px] font-medium"
          />
        </Sider>

        {/* --- NỘI DUNG CHÍNH (Không còn Header) --- */}
        <Content
          style={{
            margin: "24px",
            padding: 24,
            background: "#fff",
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </ConfigProvider>
  );
}

/*
export default withAdmin(AdminLayout);
Thực chất là cách viết tắt của 2 bước này:

// Bước 1: Gọi hàm HOC để tạo ra một Component MỚI (đã có logic check admin)
const ProtectedAdminLayout = withAdmin(AdminLayout);

// Bước 2: Export cái component MỚI đó ra cho Next.js dùng
export default ProtectedAdminLayout;
*/
