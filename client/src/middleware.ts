import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; 

const protectedPaths = ["/admin", "/profile", "/checkout", "/user"];
const authPaths = ["/login", "/register"];

// Hàm verify token
async function verifyToken(token: string | undefined) {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret");
    await jwtVerify(token, secret);
    return true; 
  } catch (error) {
    return false; 
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Lấy token
  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 2. Kiểm tra xác thực
  let isAuthenticated = await verifyToken(accessToken);

  // 3. LOGIC REFRESH TOKEN (Tự động cứu vớt khi AccessToken hết hạn)
  if (!isAuthenticated && refreshToken) {
    try {
      console.log("🔄 Middleware: Token hết hạn. Đang gọi Refresh...");

      const res = await fetch(`http://localhost:4001/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const responseJson = await res.json();
        
        // --- SỬA QUAN TRỌNG: Lấy đúng đường dẫn trong JSON ---
        // Backend trả về: { status: "success", data: { accessToken: "..." } }
        const newAccessToken = responseJson.data?.accessToken;

        if (newAccessToken) {
            console.log("✅ Refresh thành công!");

            // A. Cập nhật vào REQUEST (Để Layout nhận được ngay lập tức)
            request.cookies.set("accessToken", newAccessToken);
            
            // Mẹo: Override Header Cookie để chắc chắn Server Component đọc được
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('cookie', `accessToken=${newAccessToken}; refreshToken=${refreshToken}`);

            // B. Tạo Response và chuyển tiếp Request đã sửa
            const response = NextResponse.next({
                request: {
                    headers: requestHeaders,
                },
            });

            // C. Cập nhật vào BROWSER (Set-Cookie) - 15 GIÂY ĐỂ TEST
            response.cookies.set("accessToken", newAccessToken, {
                httpOnly: false, 
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 15, // Test 15s (15 giây)
            });

            return response; // Trả về ngay để Layout render tiếp
        }
      }
    } catch (error) {
      console.error("❌ Lỗi Refresh Token Middleware:", error);
    }
  }

  // 4. LOGIC CHẶN CỬA (Redirect)
  if (authPaths.some((path) => pathname.startsWith(path))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
    "/user/:path*",
    "/profile/:path*"
  ],
};