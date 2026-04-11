"use client";

import React from "react";
import { Input, Radio, Card, Row, Col, Typography, Space, Form } from "antd";
import type { RadioChangeEvent } from "antd";

const { Title, Text } = Typography;

interface CheckoutFormProps {
  user: any;
  formData: {
    email: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    note: string;
  };
  errors?: {
    email?: string;
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    district?: string;
  };
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

export default function CheckoutForm({
  user,
  formData,
  errors = {}, //
  handleInputChange,
  paymentMethod,
  setPaymentMethod,
}: CheckoutFormProps) {
  const onPaymentChange = (e: RadioChangeEvent) => {
    setPaymentMethod(e.target.value);
  };

  // Safe check: đảm bảo errors luôn là object để tránh lỗi tương tự với các trường khác
  const safeErrors = errors || {};

  return (
    <Form layout="vertical" className="space-y-1">
      {/* 1. Thông tin nhận hàng */}
      <Card
        variant="borderless"
        className="shadow-sm "
        title={
          <div className="flex items-center gap-2">
            <Title level={4} style={{ margin: 0 }}>
              Thông tin nhận hàng
            </Title>
            {!user && (
              <Text
                type="secondary"
                className="cursor-pointer text-xs font-normal text-blue-600 hover:underline"
              >
                (Đăng nhập để điền nhanh hơn)
              </Text>
            )}
          </div>
        }
      >
        {/* Email */}
        <Form.Item
          label="Email"
          validateStatus={safeErrors.email ? "error" : ""}
          required
          help={safeErrors.email}
        >
          <Input
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email (Tùy chọn)"
            size="large"
          />
        </Form.Item>

        {/* Họ tên & SĐT */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ và tên"
              required
              validateStatus={safeErrors.fullName ? "error" : ""}
              help={safeErrors.fullName}
            >
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Nguyễn Văn A"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số điện thoại"
              required
              validateStatus={safeErrors.phone ? "error" : ""}
              help={safeErrors.phone}
            >
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0912xxxxxx"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Địa chỉ */}
        <Form.Item
          label="Địa chỉ chi tiết"
          required
          validateStatus={safeErrors.address ? "error" : ""}
          help={safeErrors.address}
        >
          <Input
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Số nhà, tên đường..."
            size="large"
          />
        </Form.Item>

        {/* Tỉnh/Huyện/Xã */}
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Tỉnh/Thành"
              validateStatus={safeErrors.city ? "error" : ""}
              help={safeErrors.city}
            >
              <Input
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Hà Nội"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Quận/Huyện"
              validateStatus={safeErrors.district ? "error" : ""}
              help={safeErrors.district}
            >
              <Input
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Cầu Giấy"
              />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      {/* 2. Phương thức thanh toán */}
      <Card
        variant="borderless"
        className="shadow-sm"
        title={
          <Title level={4} style={{ margin: 0 }}>
            Thanh toán
          </Title>
        }
      >
        <Radio.Group
          onChange={onPaymentChange}
          value={paymentMethod}
          style={{ width: "100%" }}
        >
          <Space orientation="vertical" style={{ width: "100%" }}>
            {/* VNPAY Option */}
            <div
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === "VNPAY"
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setPaymentMethod("VNPAY")}
            >
              <div className="flex items-center gap-3">
                <Radio value="VNPAY" />
                <Text strong style={{ fontSize: 15 }}>
                  Thanh toán bằng Stripe
                </Text>
              </div>
              <div
                className="h-6 w-16 bg-contain bg-no-repeat bg-right"
                style={{
                  backgroundImage:
                    "url('https://vnpay.vn/s1/statics.vnpay.vn/2023/6/0oxhzjmxbksr1686814746013_1566974682986-01.png')",
                }}
              />
            </div>

            {/* COD Option */}
            <div
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === "COD"
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => setPaymentMethod("COD")}
            >
              <div className="flex items-center gap-3">
                <Radio value="COD" />
                <Text strong style={{ fontSize: 15 }}>
                  Thanh toán khi giao hàng (COD){" "}
                </Text>
              </div>
            </div>
          </Space>
        </Radio.Group>
      </Card>
    </Form>
  );
}
