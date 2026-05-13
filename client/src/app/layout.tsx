import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { Toaster } from "react-hot-toast"; // Thêm cái này để hiện thông báo toàn app
import ChatWidget from "@/components/chat/ChatWidget";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shoes Shop E-commerce",
  description: "Cửa hàng giày chính hãng",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ReduxProvider>
          {/*  Đặt Toaster ở đây để thông báo hiện mọi nơi */}
          <Toaster position="top-right" />

          <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex-1 bg-gray-50">{children}</main>

            <Footer />
          </div>

          {/* Chat Widget - floating, hiện cho user đã đăng nhập */}
          <ChatWidget />
        </ReduxProvider>
      </body>
    </html>
  );
}
