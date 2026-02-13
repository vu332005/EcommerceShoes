import multer from "multer";
import path from "path";
// middleware này tác dụng: lọc file (size ,type,..) + lưu ảnh vào ram

// Lưu file tạm vào bộ nhớ RAM (MemoryStorage) để upload thẳng lên Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Chỉ chấp nhận file ảnh (jpg, png, webp)!"));
  },
});

export default upload;