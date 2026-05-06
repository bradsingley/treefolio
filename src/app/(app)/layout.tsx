import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/lib/server-auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
