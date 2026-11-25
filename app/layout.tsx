import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import "./globals.css";
import { SITE, siteUrl } from "@/lib/site";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE.legalName} | Nightlife in Nakuru`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.legalName,
  keywords: [
    "Al Capone Nakuru",
    "Nakuru nightclub",
    "nightlife Nakuru",
    "Nakuru events",
    "VIP table Nakuru",
    "club reservations Nakuru",
  ],
  authors: [{ name: SITE.legalName }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.legalName,
    title: `${SITE.legalName} | Nightlife in Nakuru`,
    description: SITE.description,
    url: "/",
    locale: "en_KE",
    images: [{ url: "/images/hero-1.jpg", width: 1392, height: 752, alt: "Al Capone Nakuru" }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.legalName} | Nightlife in Nakuru`,
    description: SITE.description,
    images: ["/images/hero-1.jpg"],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#101010",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-KE" className={`${bebas.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
