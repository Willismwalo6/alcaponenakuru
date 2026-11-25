import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { getCurrentAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Staff login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
  const { error } = await searchParams;
  const showDevHint = process.env.NODE_ENV !== "production" && !process.env.ADMIN_PASSWORD;

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link href="/" className="font-display text-3xl tracking-[0.18em] text-champagne">
            AL CAPONE
          </Link>
          <p className="mt-2 text-[0.5625rem] uppercase tracking-[0.32em] text-ash">Staff dashboard</p>
        </div>

        <form action={loginAction} className="mt-10 border border-champagne/15 bg-ink-soft p-7">
          <h1 className="font-display text-2xl tracking-wide text-champagne">Sign in</h1>
          <p className="mt-2 text-xs text-ash">Authorised staff only.</p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className="field"
                required
                autoComplete="username"
                defaultValue=""
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="field"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-5 border border-crimson/50 bg-crimson/15 px-3 py-2 text-xs text-champagne">
              {error === "rate"
                ? "Too many sign-in attempts. Wait a few minutes and try again."
                : "Those credentials were not accepted."}
            </p>
          ) : null}

          <button type="submit" className="btn btn-solid mt-6 w-full">
            Sign in
          </button>

          {showDevHint ? (
            <p className="mt-5 border border-champagne/10 bg-graphite/40 px-3 py-2 text-[0.6875rem] leading-relaxed text-ash">
              No admin account exists yet. Set <code>ADMIN_EMAIL</code> and{" "}
              <code>ADMIN_PASSWORD</code> in <code>.env.local</code>, restart the server, then sign in
              with those details.
            </p>
          ) : null}
        </form>

        <p className="mt-6 text-center text-[0.625rem] uppercase tracking-[0.2em] text-ash">
          <Link href="/" className="hover:text-champagne">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
