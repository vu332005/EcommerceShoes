"use client";

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  ConfigProvider,
  Row,
  Col,
  Typography,
  Avatar,
  message,
} from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { authService } from "@/services/authService";
import { updateUser } from "@/redux/features/authSlice";
import toast from "react-hot-toast";
import type { RcFile } from "antd/es/upload/interface";

const { Title, Text } = Typography;

export default function ProfilePage() {
  // khởi tạo + lấy dlieu
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [form] = Form.useForm(); // hook qly form của antd
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>(""); // State để hiển thị ảnh xem trước

  // Load dữ liệu từ Redux vào Form
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        // form.setFieldsValue(...)-> đây là 1 hàm của antd / nó tìm các <Form.Item name="full_name"> và gán gtri user.full_name vào form đó
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        district: user.district,
        avatar_url: user.avatar_url, // Bind avatar vào form
      });
      if (user.avatar_url) {
        // check xem có ava cũ trên server k để hiện
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user, form]);

  // Xử lý khi chọn ảnh (Chuyển sang Base64)
  const handleBeforeUpload = (file: RcFile) => {
    //check định dạng
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
      return Upload.LIST_IGNORE;
    }

    //check kích thước
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Ảnh phải nhỏ hơn 2MB!");
      return Upload.LIST_IGNORE;
    }

    // vì trình duyệt k thể trực tiếp hiện 1 ảnh trong ổ cứng lên thẻ img -> ta chuyển ảnh thành chuỗi base64 -> trình duyệt có thể hiểu chuỗi này và vẽ ra luôn đc mà không cần tải lên server
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64Str = reader.result as string;
      setAvatarPreview(base64Str); // Hiện ảnh
      form.setFieldValue("avatar_url", base64Str); // Lưu vào form !!!
    };

    return false; // Ngăn không cho Antd tự upload
  };

  // gửi dlieu -> be
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Gọi API cập nhật
      const res = await authService.updateProfile(values);
      const updatedUserInfo = res.data;

      // Cập nhật Redux
      dispatch(updateUser(updatedUserInfo));

      toast.success("Cập nhật hồ sơ thành công!");
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi cập nhật hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider // config chung cho các antd ở trong - Global config cho antd
      theme={{
        token: {
          colorPrimary: "#E31D2B",
          borderRadius: 4,
        },
      }}
    >
      <div className="bg-white p-6 md:p-8 rounded-sm shadow-sm border border-gray-100 min-h-[500px]">
        <div className="mb-6 border-b pb-4">
          <Title level={4} style={{ margin: 0 }}>
            Hồ Sơ Của Tôi
          </Title>
        </div>

        {/* 
        form={form}: Gắn kết giao diện này với biến form (từ hook useForm ở trên) để bạn có thể dùng code điều khiển nó (set dữ liệu, reset, validate).
        onFinish={onFinish}: Khi người dùng bấm nút Submit và không có lỗi, hàm onFinish sẽ được gọi tự động với toàn bộ dữ liệu người dùng đã nhập. */}
        <Form form={form} layout="vertical" onFinish={onFinish} size="large">
          <Row gutter={24}>
            {/* CỘT TRÁI: Nhập liệu */}
            <Col xs={24} md={16}>
              <Form.Item label="Email" name="email">
                <Input disabled className="bg-gray-50 text-gray-500" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Họ và tên"
                    name="full_name"
                    rules={[{ required: true, message: "Nhập họ tên" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[{ required: true, message: "Nhập SĐT" }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              {/* Input ẩn để chứa chuỗi base64 avatar -> vì ta sẽ chỉ upload các cái có trong input -> dlieu ảnh đc gán ở hàm handleBeforeUpload */}
              <Form.Item name="avatar_url" hidden>
                <Input />
              </Form.Item>

              {/* ĐỊA CHỈ */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-gray-700 mb-3">
                  Địa chỉ giao hàng
                </h4>

                <Form.Item label="Địa chỉ cụ thể" name="address">
                  <Input placeholder="Số nhà, tên đường, phường/xã..." />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Tỉnh/Thành" name="city">
                      <Input placeholder="Hà Nội" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Quận/Huyện" name="district">
                      <Input placeholder="Cầu Giấy" />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <Button
                type="primary"
                htmlType="submit" // giúp nút này thành nút kích hoạt sự kiện onfinish của form
                loading={loading}
                className="px-8 mt-2 bg-[#E31D2B] font-medium"
              >
                LƯU THAY ĐỔI
              </Button>
            </Col>

            {/* CỘT PHẢI: Avatar */}
            <Col
              xs={24}
              md={8}
              className="flex flex-col items-center border-l border-gray-100 pl-0 md:pl-6 pt-6 md:pt-0"
            >
              <div className="mb-4">
                {avatarPreview ? (
                  <Avatar src={avatarPreview} size={100} />
                ) : (
                  // nếu kco ava -> mặc định là hình ng
                  <Avatar
                    icon={<UserOutlined />}
                    size={100}
                    className="bg-gray-200"
                  />
                )}
              </div>

              {/* hàm upload -> mở file explorer */}
              <Upload
                showUploadList={false}
                beforeUpload={handleBeforeUpload} // thường khi chọn xong ảnh ở component Upload -> tự động gửi -> hàm này giúp xly trc khi gửi
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Chọn Ảnh</Button>
              </Upload>

              <div className="text-xs text-gray-400 mt-3 text-center">
                <p>Dụng lượng file tối đa 2 MB</p>
                <p>Định dạng: .JPEG, .PNG</p>
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </ConfigProvider>
  );
}
