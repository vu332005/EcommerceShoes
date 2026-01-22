export class AppError extends Error {
  
  // các thuộc tính bổ sung mà error k có
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  // hàm khởi tạo
  constructor(message: string, statusCode: number) {

    super(message);
    
    // gán status code 
    this.statusCode = statusCode;
    
    /*
    tự động tạo status dựa trên status code
    - lỗi bdau = 4 eg: 404, 401 -> fail -> lỗi ng dùng
    - lỗi bdau = 5 -> error -> lỗi server
    */
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    
    // đánh dáu đây là lỗi đã lường trc đc kph bug crash app
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/*
- class này giúp phân tích rõ lỗi thay chgo Error mặc định của js
  + gắn mã lỗi
  + phân loại lỗi
  + chuẩn hóa phản hồi

 note:
 - lý do cần isOperation
  + nếu lỗi từ người dùng(nhập sai,..) -> gửi lỗi chi tiết cho ng dùng(vì nó an toàn)
  + nếu lỗi lạ(có thể do bug code) -> không đc gửi chi tiết cho client (lộ thông tin..)
 
 - khi nào là lỗi lạ
  - khi có những lỗi mà ta không bắt bằng AppError -> kh lường trc đc
    -> nó sẽ tự throw new Error -> khi đó sẽ kh có thuộc tính isOperation -> sẽ là lỗi lạ

 - luồng chạy
  + được thg catchAsynx ném vào hàm next về middleware error handle ở cuối 
*/