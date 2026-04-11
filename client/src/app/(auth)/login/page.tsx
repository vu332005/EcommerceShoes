"use client";

import React, { useState } from "react";
import { Form, Input, Button, Typography, ConfigProvider } from "antd";
import { MailOutlined, LockOutlined, FacebookFilled } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAppDispatch } from "@/redux/hooks";
import { loginSuccess } from "@/redux/features/authSlice";
import toast, { Toaster } from "react-hot-toast";
// Thư viện Facebook
import FacebookLogin from "@greatsumini/react-facebook-login";

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  // 1. Xử lý Đăng nhập thường (Email/Pass)
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await authService.login(values);
      handleLoginResponse(res, "Đăng nhập thành công!");
    } catch (error: any) {
      console.error("Login Error:", error);
      const message =
        error.response?.data?.message || "Email hoặc mật khẩu không đúng";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý Đăng nhập Facebook
  const handleFacebookSuccess = async (response: any) => {
    try {
      if (response.accessToken) {
        toast.loading("Đang kết nối Facebook...", { id: "fb-loading" });

        // Gọi API Backend
        const res = await authService.loginFacebook(response.accessToken);

        toast.dismiss("fb-loading");
        handleLoginResponse(res, "Đăng nhập Facebook thành công!");
      }
    } catch (error: any) {
      toast.dismiss("fb-loading");
      console.error("FB Login Error:", error);
      toast.error("Lỗi đăng nhập Facebook");
    }
  };

  // Hàm chung để xử lý dữ liệu sau khi login thành công
  const handleLoginResponse = (res: any, successMessage: string) => {
    const loginData = res.data || res;
    const user = loginData.user || loginData.user_info;
    const accessToken = loginData.accessToken || loginData.token;
    const refreshToken = loginData.refreshToken;

    if (!user || !accessToken) {
      toast.error("Lỗi xác thực: Server không trả về Token.");
      return;
    }

    // Lưu vào Redux
    dispatch(
      loginSuccess({
        user: user,
        accessToken: accessToken,
        refreshToken: refreshToken,
      }),
    );

    toast.success(successMessage);
    router.push("/");
  };

  return (
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

        {/* Form Login Chính */}
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {/* Input Email */}
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

          {/* Input Password */}
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

          <div className="flex justify-end items-center mb-6">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#E31D2B] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Nút Đăng nhập thường */}
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

          {/*  KHU VỰC LOGIN FACEBOOK  */}
          <div className="mb-6">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">
                Hoặc đăng nhập bằng
              </span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="mt-4">
              <FacebookLogin
                appId="861770790178747" // App ID -> id này cho biết là web nào đang ycau đăng nhập
                onSuccess={handleFacebookSuccess}
                onFail={(error) => console.log("FB Login Failed!", error)}
                style={{ width: "100%" }}
                render={({ onClick }) => (
                  <Button
                    block
                    size="large"
                    icon={<FacebookFilled />}
                    onClick={onClick}
                    className="!bg-[#1877F2] hover:bg-[#166fe5] text-white border-none font-bold h-10 flex items-center justify-center"
                    style={{ color: "white" }}
                  >
                    Facebook
                  </Button>
                )}
              />
            </div>
          </div>

          {/* Link Đăng ký */}
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
