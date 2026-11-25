import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import WhatsAppFloat from "@/components/site/WhatsAppFloat";
import { getSettings } from "@/lib/db";
import { SITE, siteUrl, telLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const phone = settings.phone || SITE.defaultPhone;
  const whatsapp = settings.whatsapp || SITE.defaultWhatsapp;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NightClub",
    name: SITE.legalName,
    description: SITE.description,
    url: siteUrl(),
    telephone: phone,
    image: `${siteUrl()}/images/hero-1.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.address || "Nakuru",
      addressCountry: "KE",
    },
    areaServed: "Nakuru, Kenya",
    sameAs: [settings.instagram, settings.tiktok].filter(Boolean),
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-crimson focus:px-4 focus:py-2 focus:text-xs focus:uppercase focus:tracking-widest focus:text-white"
      >
        Skip to content
      </a>
      <Header phone={phone} whatsapp={whatsapp} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloat whatsapp={whatsapp} />
      <a className="sr-only" href={telLink(phone)}>
        Call Al Capone
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
