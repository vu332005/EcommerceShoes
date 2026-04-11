import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // thay cho jwt

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

  // 2. Kiểm tra xác thực -> check accessToken
  let isAuthenticated = await verifyToken(accessToken);

  // 3. refresh token
  if (!isAuthenticated && refreshToken) {
    // -> chạy khi accestoken hết hạn / k có nhưng ng dùng vẫn còn refreshToken
    try {
      console.log("Middleware: Token hết hạn -> đang gọi refresh");

      const res = await fetch(`http://localhost:4001/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (res.ok) {
        const responseJson = await res.json();
        // Backend trả về: { status: "success", data: { accessToken: "..." } }
        const newAccessToken = responseJson.data?.accessToken;

        if (newAccessToken) {
          console.log(" Refresh thành công!");

          // A&B -> ép token mới vào req gửi đi tiếp
          // A. Cập nhật vào REQUEST (Để Layout nhận được ngay lập tức)
          request.cookies.set("accessToken", newAccessToken);
          // Override Header Cookie để chắc chắn Server Component đọc được
          const requestHeaders = new Headers(request.headers);
          requestHeaders.set(
            "cookie",
            `accessToken=${newAccessToken}; refreshToken=${refreshToken}`,
          );

          // B. Tạo Response và chuyển tiếp Request đã sửa
          const response = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });

          // C. Cập nhật vào BROWSER (Set-Cookie)
          response.cookies.set("accessToken", newAccessToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 15 * 60, //
          });

          return response; // Trả về ngay để Layout render tiếp
        }
      }
    } catch (error) {
      console.error(" Lỗi Refresh Token Middleware:", error);
    }
  }

  // 4. logic protected (Redirect)
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
    "/profile/:path*",
  ],
};
