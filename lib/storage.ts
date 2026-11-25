import crypto from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase Storage helpers.
 *
 * Uploads go to a public bucket (default `media`) with the service role key.
 * The key is never sent to the browser: these functions are only imported by
 * server actions.
 */

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "media";

let client: SupabaseClient | null = null;

function adminClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to upload media.");
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

export async function uploadObject(opts: {
  data: ArrayBuffer;
  contentType: string;
  extension: string;
  kind: "image" | "video";
}): Promise<string> {
  const supabase = adminClient();
  const path = `${opts.kind}/${crypto.randomUUID()}.${opts.extension}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, opts.data, {
    contentType: opts.contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deleteObjectByUrl(url: string): Promise<void> {
  const path = storagePath(url);
  if (!path) return;
  const supabase = adminClient();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) console.warn("[al-capone] Could not delete media object:", error.message);
}

function storagePath(url: string): string | null {
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length));
}
