"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Spin } from "antd";

export default function withAdmin(Component: any) {
  return function IsAdmin(props: any) {
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
      if (!isAuthenticated) {
        // Chưa đăng nhập -> về login
        router.push("/login");
      } else if (user?.role !== "admin") {
        // Đã đăng nhập nhưng ko phải admin -> về home
        router.push("/");
      } else {
        // Ok -> Dừng loading
        setChecking(false);
      }
    }, [isAuthenticated, user, router]);

    if (checking) {
      return (
        <div className="h-screen w-full flex items-center justify-center">
          <Spin size="large" tip="Checking Admin permission..." />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
