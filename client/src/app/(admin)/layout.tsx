import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth"; // Hàm verify ở trên

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const session = await verifySession(token);

  if (!session) {
    redirect("/login"); // Token không hợp lệ
  }

  if (session.role !== "admin") {
    redirect("/"); // Login rồi nhưng không phải admin
  }

  return (
    <div className="admin-layout-wrapper">
      <main>{children}</main>
    </div>
  );
}
