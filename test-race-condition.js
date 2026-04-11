// Dùng fetch (có sẵn trong Node.js >= 18)
const API_URL = "http://localhost:4001/api/v1/order/checkout"; // Đổi port cho đúng với server của bạn

// Giả sử bạn cần token để auth, hãy paste 1 token hợp lệ vào đây
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NTIxMzI2MiwiZXhwIjoxNzc1MjE0MTYyfQ.zEMhjOHXfecv0Cc95O2jj_AZBUnO65O5t_2kd6ISNkI";

const testRaceCondition = async () => {
  console.log("🚀 Bắt đầu bắn 10 request cùng lúc...");

  // Tạo mảng chứa 10 promises (10 requests)
  const requests = Array.from({ length: 10 }).map((_, index) => {
    return fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      // Chú ý: Đảm bảo trong giỏ hàng (Redis) của User test này đang có sản phẩm ID = 1
      body: JSON.stringify({
        shippingName: `Test ${index}`,
        shippingPhone: "0123456789",
        shippingAddress: "Địa chỉ test ABC",
        paymentMethod: "COD",
      }),
    })
      .then((res) => res.json())
      .then((data) => ({ reqId: index, status: "Thành công", data }))
      .catch((err) => ({ reqId: index, status: "Lỗi mạng", err }));
  });

  // Bắn đồng loạt toàn bộ request đi CÙNG MỘT LÚC
  const results = await Promise.all(requests);

  // Thống kê kết quả
  let successCount = 0;
  let failCount = 0;

  results.forEach((res) => {
    if (res.data && res.data.orderId) {
      // Check điều kiện thành công theo API của bạn
      successCount++;
      console.log(`✅ [Req ${res.reqId}] Thành công - Mua được!`);
    } else {
      failCount++;
      console.log(
        `❌ [Req ${res.reqId}] Thất bại - ${res.data?.message || "Lỗi"}`,
      );
    }
  });

  console.log("\n=============================");
  console.log(`TỔNG KẾT:`);
  console.log(`- Thành công: ${successCount}`);
  console.log(`- Thất bại: ${failCount}`);
  console.log("=============================");
  console.log(
    "Bây giờ hãy vào Database kiểm tra tồn kho xem có phải là 0 không nhé!",
  );
};

testRaceCondition();
