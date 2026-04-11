"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, ConfigProvider } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text } = Typography;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Loại bỏ field 'confirm' trước khi gửi API
      const { confirm, ...registerData } = values;

      // Gọi API đăng ký
      await authService.register(registerData);

      toast.success("Đăng ký thành công! Đang chuyển hướng...");

      // Chuyển hướng sang trang login sau 1.5s
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error: any) {
      console.error(error);
      // Lấy message lỗi từ backend trả về
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#E31D2B", // Màu đỏ của Shoes Shop
          borderRadius: 6,
        },
      }}
    >
      <Toaster />
      <div className="w-full">
        <div className="text-center mb-8">
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Đăng ký thành viên
          </Title>
          <Text type="secondary">
            Trở thành thành viên của Shoes Shop để nhận ưu đãi
          </Text>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          scrollToFirstError
        >
          {/* 1. Họ và tên */}
          <Form.Item
            name="full_name"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { min: 2, message: "Tên quá ngắn" },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Họ và tên"
            />
          </Form.Item>

          {/* 2. Email */}
          <Form.Item
            name="email"
            rules={[
              { type: "email", message: "Email không hợp lệ!" },
              { required: true, message: "Vui lòng nhập email!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Email"
            />
          </Form.Item>

          {/* 3. Số điện thoại */}
          <Form.Item
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
              {
                pattern: /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
                message: "Số điện thoại không đúng định dạng VN",
              },
            ]}
          >
            <Input
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Số điện thoại"
            />
          </Form.Item>

          {/* 4. Mật khẩu */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          {/* 5. Nhập lại mật khẩu */}
          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!"),
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          {/* Nút Submit */}
          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="font-bold uppercase shadow-md h-12"
            >
              Đăng ký ngay
            </Button>
          </Form.Item>

          {/* Link chuyển sang Login */}
          <div className="text-center">
            <Text type="secondary">Bạn đã có tài khoản? </Text>
            <Link
              href="/login"
              className="font-semibold text-[#E31D2B] hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  );
}
