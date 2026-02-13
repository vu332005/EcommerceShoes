"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, FileText, Lock, Bell } from "lucide-react";
import { useAppSelector } from "@/redux/hooks";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = [
    { label: "Hồ sơ của tôi", href: "/user/profile", icon: User },
    { label: "Đơn mua", href: "/user/orders", icon: FileText },
    { label: "Đổi mật khẩu", href: "/user/password", icon: Lock },
    { label: "Thông báo", href: "/user/notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* SIDEBAR TRÁI (3 cols) */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                {/* Avatar User */}
                <img
                  src={user?.avatar_url || "https://github.com/shadcn.png"}
                  alt="User"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-gray-900 truncate max-w-[120px]">
                  {user?.full_name || "User Name"}
                </p>
                <Link
                  href="/user/profile"
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <User size={12} /> Sửa hồ sơ
                </Link>
              </div>
            </div>

            {/* render các item tab trái */}
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "text-blue-600 bg-white shadow-sm"
                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CONTENT PHẢI (9 cols) */}
          <div className="md:col-span-9">{children}</div>
        </div>
      </div>
    </div>
  );
}
