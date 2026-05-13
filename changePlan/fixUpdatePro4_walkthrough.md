# Walkthrough - Sửa lỗi mất dữ liệu địa chỉ khi đăng nhập

Tôi đã hoàn tất việc sửa lỗi mất thông tin địa chỉ sau khi đăng nhập lại. Dưới đây là tóm tắt các thay đổi:

## Các thay đổi chính

### 1. Backend: Cập nhật `authService.ts`

Tôi đã bổ sung logic để lấy thông tin từ bảng `Address` mỗi khi người dùng đăng nhập hoặc yêu cầu thông tin cá nhân.

- **Thêm helper `mapUserWithAddress`**: Hàm này tập trung logic tìm địa chỉ mặc định (`isDefault: true`) và trích xuất các trường `address`, `city`, `district` để trả về cho Frontend theo đúng định dạng yêu cầu.
- **Cập nhật `loginService` & `getMeService`**: Sử dụng `relations: ["addresses"]` của TypeORM để tự động join bảng địa chỉ khi truy vấn User.
- **Cập nhật `loginFacebookService`**: Đảm bảo người dùng đăng nhập qua Facebook cũng nhận được đầy đủ thông tin địa chỉ nếu họ đã từng cập nhật trước đó.

### 2. Frontend: Đồng bộ hóa dữ liệu

Vì Frontend (Redux) đã có sẵn các trường dữ liệu này trong `authSlice.ts`, nên khi Backend trả về đầy đủ các trường `address`, `city`, `district`, Redux sẽ tự động lưu vào `localStorage`. Khi bạn tải lại trang hoặc đăng nhập mới, thông tin này sẽ luôn được bảo toàn.

## Kết quả kiểm tra

- **Backend**: Các hàm đã được cập nhật và không có lỗi biên dịch.
- **Luồng hoạt động**: 
    1. Khi bạn login -> Server trả về thông tin User kèm địa chỉ mặc định.
    2. Redux lưu thông tin này vào RAM và LocalStorage.
    3. Trang Profile lấy dữ liệu từ Redux để hiển thị lên Form.

> [!TIP]
> Bây giờ bạn có thể thử cập nhật địa chỉ ở trang Profile, đăng xuất và đăng nhập lại để tận hưởng thành quả!

## Các file đã thay đổi
- [authService.ts](file:///d:/demo-practice/EcommerceShoes/server/src/services/authService.ts)
