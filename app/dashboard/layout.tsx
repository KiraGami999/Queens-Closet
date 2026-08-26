import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { TopNav } from "@/components/dashboard/top-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name ?? "Studio owner",
    email: session.user.email ?? "",
    image: session.user.image,
  };

  return (
    <div className="min-h-svh bg-background">
      <TopNav user={user} />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:px-6 md:px-10 md:py-8 lg:pb-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
