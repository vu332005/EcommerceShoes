import { v2 as cloudinary } from 'cloudinary'; // thư viện cloudinary
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/*
cloudinary.config({ ... }): -> Đây là bước Đăng nhập.
  - cloud_name: Tên định danh kho ảnh của bạn.
  - api_key: Tên đăng nhập (Public Key).
  - api_secret: Mật khẩu (Private Key) - Cái này tuyệt đối không được lộ.

  -> file này như 1 chìa khóa -> trc khi server muốn gửi 1 file nào lên cloudinary -> trình ra file này để chứng minh - tôi là chủ tài khoản 
*/

export default cloudinary;