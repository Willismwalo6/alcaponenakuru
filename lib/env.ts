/**
 * Startup guard for production.
 *
 * Imported by lib/db.ts and lib/auth.ts, so it runs the first time either module
 * loads on the server. During `next build` the check is skipped: builds often run
 * without runtime secrets and every page reads the database on request instead.
 */
let checked = false;

export function assertProductionEnv() {
  if (checked) return;
  checked = true;

  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const required = ["DATABASE_URL", "SESSION_SECRET", "ADMIN_PASSWORD"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(
      `Missing required environment variable${missing.length === 1 ? "" : "s"} in production: ${missing.join(", ")}.`,
    );
  }
}
