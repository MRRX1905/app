import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200">
        <nav className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3 text-sm">
          <Link href="/dashboard" className="font-bold">
            UTBK Prep
          </Link>
          <Link href="/latihan" className="text-gray-600 hover:text-black">
            Latihan
          </Link>
          <Link href="/simulasi" className="text-gray-600 hover:text-black">
            Simulasi
          </Link>
          <Link href="/profil" className="ml-auto text-gray-600 hover:text-black">
            Profil
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
    </div>
  );
}
