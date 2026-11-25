import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";
import { getCurrentAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[110rem] flex-col lg:flex-row">
        <aside className="border-b border-champagne/10 bg-ink-soft lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-5 py-5 lg:block">
            <Link href="/admin" className="block">
              <span className="font-display text-2xl tracking-[0.16em] text-champagne">AL CAPONE</span>
              <span className="mt-1 block text-[0.5rem] uppercase tracking-[0.3em] text-ash">
                Dashboard
              </span>
            </Link>
            <form action={logoutAction} className="lg:hidden">
              <button type="submit" className="text-[0.625rem] uppercase tracking-[0.18em] text-ash">
                Sign out
              </button>
            </form>
          </div>

          <AdminNav />

          <div className="hidden border-t border-champagne/10 px-5 py-5 lg:block">
            <p className="text-[0.5625rem] uppercase tracking-[0.22em] text-ash">Signed in</p>
            <p className="mt-1 truncate text-sm text-champagne">{admin.name}</p>
            <p className="truncate text-[0.6875rem] text-ash">{admin.email}</p>
            <form action={logoutAction} className="mt-4">
              <button
                type="submit"
                className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ash transition-colors hover:text-champagne"
              >
                Sign out
              </button>
            </form>
            <Link
              href="/"
              className="mt-3 block text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ash transition-colors hover:text-champagne"
            >
              View website →
            </Link>
          </div>
        </aside>

        <main className="flex-1 px-5 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
