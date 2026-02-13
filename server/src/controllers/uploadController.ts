import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { AppError } from "../utils/AppError";

export const uploadImage = async (req: Request, res: Response) => {
  // check xem ng dùng gửi file ch
  if (!req.file) {
    throw new AppError("Vui lòng chọn file ảnh", 400);
  }

  try {
    // Convert buffer sang base64 để upload
    /*
    Vấn đề: cloudinary.uploader.upload() thường mong đợi một đường dẫn file (ví dụ: /uploads/anh.jpg) hoặc một URL. Nhưng file đang nằm trong RAM (dạng Buffer - dãy số nhị phân 010101...), nó không có đường dẫn file trên ổ cứng.
    Giải pháp: biến dãy nhị phân đó thành một chuỗi ký tự đặc biệt gọi là Data URI.
    */
    const b64 = Buffer.from(req.file.buffer).toString("base64");   // -> biển dlieu ảnh thô (binary) -> chuỗi base 64
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64; // ghép chuỗi -> tạo thành 1 chuỗi dataurl hoàn chỉnh mà cloudinary có thể hiểu đc như 1 file ảnh

    // gửi lên cloudinary -> sau khi gửi xong -> cld trả về 1 obj đầy đủ ttin -> result.secure_url chính link của ảnh mà mình ms upload lên
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "shoes-shop-products", // Tên thư mục trên Cloudinary
    });

    res.status(200).json({
      status: "success",
      message: "Upload thành công",
      url: result.secure_url, // Link ảnh HTTPS
    });
  } catch (error) {
    console.error(error);
    throw new AppError("Lỗi upload ảnh lên Cloudinary", 500);
  }
};