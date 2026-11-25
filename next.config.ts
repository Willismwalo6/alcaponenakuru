import type { NextConfig } from "next";

// Only the project's own Supabase Storage host may serve remote images.
const supabaseHostname = (() => {
  const url = process.env.SUPABASE_URL;
  if (url) {
    try {
      return new URL(url).hostname;
    } catch {
      // fall through to the generic Supabase host below
    }
  }
  return "*.supabase.co";
})();

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  serverExternalPackages: ["bcryptjs", "qrcode"],
  experimental: {
    serverActions: {
      // Media uploads (posters, gallery photos, hero video) can be large.
      bodySizeLimit: "60mb",
    },
  },
};

export default nextConfig;
