import { Router } from "express";
import { uploadImage } from "../controllers/uploadController";
import upload from "../middlewares/uploadMiddleware";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// Chỉ Admin mới được upload
router.post("/", protect("admin"), upload.single("image"), uploadImage);

/*
upload.single("image")
    + upload: Là biến cấu hình Multer mà bạn đã tạo ở file trước (biến có chứa limits, fileFilter, storage...). Nó chứa toàn bộ luật lệ về việc file nào được phép qua.
    + .single(...): Là phương thức bảo với Multer rằng: "Trong request này, tôi chỉ chấp nhận DUY NHẤT 1 file mà thôi".
    + "image": Đây là Tên trường (Field Name). Đây là từ khóa quan trọng nhất để Server và Client "nhìn thấy nhau".

    Khi request đi qua hàm upload.single("image"), nó sẽ thực hiện các việc sau:
        + Tìm file: Nó lục trong gói tin gửi lên, tìm xem có file nào được gắn mác là "image" không.
        + Kiểm tra luật: Nó check xem file đó có thỏa mãn các điều kiện bạn đã cài đặt không (có phải đuôi .jpg/.png không? có dưới 5MB không?).
        Xử lý:
            + Nếu file hợp lệ: Nó lấy dữ liệu file đó và nhét vào biến req.file.
            + Nếu có các trường văn bản khác (ví dụ name, price gửi kèm): Nó nhét vào biến req.body.
            -> Chuyển tiếp: Sau khi xong, nó gọi next() để chuyển sang hàm tiếp theo ( controller uploadImage ).
*/
export default router;