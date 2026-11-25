import type { MetadataRoute } from "next";
import { listEvents } from "@/lib/db";
import { siteUrl } from "@/lib/site";

// Events come from the database, so refresh the sitemap instead of freezing it at build time.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes = ["", "/about", "/events", "/gallery", "/reservations", "/tickets", "/contact"].map(
    (route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }),
  );

  let eventRoutes: MetadataRoute.Sitemap = [];
  try {
    eventRoutes = (await listEvents({ publishedOnly: true })).map((event) => ({
      url: `${base}/events/${event.slug}`,
      lastModified: new Date(event.updated_at || event.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    eventRoutes = [];
  }

  return [...staticRoutes, ...eventRoutes];
}
