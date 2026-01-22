"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  ConfigProvider,
} from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess } from "@/redux/features/authSlice";
import toast, { Toaster } from "react-hot-toast";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Gọi API đăng nhập
      const res = await authService.login(values);

      console.log("LOGIN SUCCESS:", res);

      // Lấy dữ liệu từ response (Tùy cấu trúc backend của bạn)
      const loginData = res.data || res;
      const user = loginData.user || loginData.user_info;
      const accessToken = loginData.accessToken || loginData.token;
      const refreshToken = loginData.refreshToken;

      if (!user || !accessToken) {
        toast.error("Phản hồi từ server thiếu thông tin xác thực!");
        return;
      }

      // Lưu vào Redux Store
      dispatch(
        loginSuccess({
          user: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        })
      );

      toast.success("Đăng nhập thành công!");

      // Chuyển hướng về trang chủ
      router.push("/");
    } catch (error: any) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.message || "Email hoặc mật khẩu không đúng";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Cấu hình Theme màu ĐỎ (#E31D2B) để đồng bộ
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#E31D2B",
          borderRadius: 6,
        },
      }}
    >
      <Toaster />
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: "bold",
              textTransform: "uppercase",
            }}
          >
            Đăng nhập
          </Title>
          <Text type="secondary">
            Chào mừng bạn quay trở lại với Shoes Shop
          </Text>
        </div>

        {/* Form Login */}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {/* 1. Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập Email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Email của bạn"
            />
          </Form.Item>

          {/* 2. Password */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 1, message: "Mật khẩu không được để trống" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          {/* 3. Remember Me & Forgot Password */}
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#E31D2B] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* 4. Submit Button */}
          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="font-bold uppercase shadow-md h-12"
            >
              Đăng nhập
            </Button>
          </Form.Item>

          {/* 5. Link Register */}
          <div className="text-center">
            <Text type="secondary">Bạn chưa có tài khoản? </Text>
            <Link
              href="/register"
              className="font-semibold text-[#E31D2B] hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </Form>
      </div>
    </ConfigProvider>
  );
}
