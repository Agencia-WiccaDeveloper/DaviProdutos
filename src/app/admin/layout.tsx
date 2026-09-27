import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { SidebarAdmin } from "./sidebar-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) redirect("/entrar");

  return (
    <div className="min-h-dvh bg-slate-100">
      <div className="flex">
        <SidebarAdmin adminNome={admin.nome} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
