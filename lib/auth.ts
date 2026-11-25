import crypto from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getAdminByEmail, getAdminById } from "./db";
import { assertProductionEnv } from "./env";
import type { Admin } from "./types";

assertProductionEnv();

const COOKIE_NAME = "ac_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

// In production an unset SESSION_SECRET falls back to a per-process random key
// rather than a public constant, so cookies cannot be forged. Set SESSION_SECRET
// to keep sessions valid across restarts.
const FALLBACK_SECRET =
  process.env.NODE_ENV === "production"
    ? crypto.randomBytes(32).toString("hex")
    : "alcapone-development-secret-change-before-deploy";

function secret() {
  return process.env.SESSION_SECRET || FALLBACK_SECRET;
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionValue(adminId: number) {
  const expires = Date.now() + MAX_AGE * 1000;
  const payload = `${adminId}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionValue(value: string | undefined): number | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [id, expires, signature] = parts;
  const expected = sign(`${id}.${expires}`);
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  if (Number(expires) < Date.now()) return null;
  const adminId = Number(id);
  return Number.isFinite(adminId) ? adminId : null;
}

export async function verifyCredentials(email: string, password: string): Promise<Admin | null> {
  const admin = await getAdminByEmail(email.trim());
  if (!admin) return null;
  return bcrypt.compareSync(password, admin.password_hash) ? admin : null;
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const store = await cookies();
  const adminId = verifySessionValue(store.get(COOKIE_NAME)?.value);
  if (!adminId) return null;
  return (await getAdminById(adminId)) ?? null;
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}

export async function setSessionCookie(adminId: number) {
  const store = await cookies();
  store.set(COOKIE_NAME, createSessionValue(adminId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
