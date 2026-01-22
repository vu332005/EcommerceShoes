"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, LogOut, Menu as MenuIcon } from "lucide-react";
import { Drawer, ConfigProvider, Avatar, Button } from "antd";

export default function Header() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  // Component NavLinks: Tái sử dụng cho cả Desktop và Mobile
  // Chỉ thay đổi CSS dựa trên prop isMobile
  const NavLinks = ({ isMobile = false }: { isMobile?: boolean }) => {
    // Class chung cho link Mobile để đẹp hơn
    const mobileClasses =
      "block py-4 px-0 border-b border-gray-100 text-base !text-gray-500 font-bold uppercase transition-all hover:text-[#E31D2B] hover:pl-2";
    // Class cho Desktop
    const desktopClasses =
      "text-sm font-bold uppercase text-white transition-colors hover:text-yellow-300";

    return (
      <>
        <Link
          href="/"
          onClick={closeMenu}
          className={isMobile ? mobileClasses : desktopClasses}
        >
          Trang chủ
        </Link>
        <Link
          href="/products"
          onClick={closeMenu}
          className={isMobile ? mobileClasses : desktopClasses}
        >
          Sản phẩm
        </Link>
      </>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#E31D2B",
        },
      }}
    >
      <header className="sticky top-0 z-50 w-full bg-[#E31D2B] text-white shadow-md font-sans">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* 1. LOGO */}
          <Link
            href="/"
            className="text-2xl font-black text-white uppercase tracking-wider italic"
          >
            SHOES SHOP
          </Link>

          {/* 2. DESKTOP MENU */}
          <nav className="hidden gap-6 lg:flex">
            <NavLinks />
          </nav>

          {/* 3. ACTIONS */}
          <div className="flex items-center gap-4">
            <Link
              href="/cart"
              className="relative p-2 text-white hover:text-yellow-300 transition-colors"
            >
              <ShoppingCart size={24} />
            </Link>

            {/* Nút Hamburger (Mobile) */}
            <button
              className="lg:hidden p-1 text-white hover:text-yellow-300 active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon size={28} />
            </button>

            {/* User Info (Desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/user/orders"
                    className="flex items-center gap-2 rounded-full bg-[#bf1622] px-3 py-1.5 border border-white/20 hover:bg-[#a3131d] transition-colors"
                  >
                    <Avatar
                      src={user.avatar_url}
                      icon={!user.avatar_url && <User />}
                      size="small"
                      className="bg-white/20"
                    />
                    <span className="text-xs font-bold text-white max-w-[100px] truncate uppercase">
                      {user.full_name || "Member"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-white/80 hover:text-white"
                    title="Đăng xuất"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-bold uppercase hover:bg-white/10 rounded-md transition-colors"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white text-[#E31D2B] px-4 py-2 text-sm font-bold uppercase rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. MOBILE DRAWER */}
        <Drawer
          title={
            <span className="text-xl font-black text-[#E31D2B] uppercase tracking-wider italic">
              SHOES SHOP
            </span>
          }
          placement="right"
          onClose={closeMenu}
          open={mobileMenuOpen}
          width={300}
          styles={{
            header: { borderBottom: "1px solid #f0f0f0" },
            body: { padding: "20px", display: "flex", flexDirection: "column" },
          }}
        >
          {/* USER INFO SECTION (Mobile) */}
          <div className="mb-6">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <Link
                  href="/user/orders"
                  onClick={closeMenu}
                  className="text-xs text-[#E31D2B] font-semibold hover:underline"
                >
                  <Avatar
                    src={user.avatar_url}
                    icon={<User />}
                    size={50}
                    style={{ backgroundColor: "#666666" }}
                  />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={closeMenu}>
                  <Button block className="font-bold uppercase">
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register" onClick={closeMenu}>
                  <Button type="primary" block className="font-bold uppercase">
                    Đăng ký
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* NAVIGATION LINKS (Mobile List) */}
          <div className="flex flex-col flex-1">
            <NavLinks isMobile={true} />
          </div>

          {/* LOGOUT (Mobile) */}
          {isAuthenticated && (
            <div className="mt-auto border-t pt-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-500 font-bold uppercase hover:text-[#E31D2B] transition-colors w-full"
              >
                <LogOut size={18} /> Đăng xuất
              </button>
            </div>
          )}
        </Drawer>
      </header>
    </ConfigProvider>
  );
}
