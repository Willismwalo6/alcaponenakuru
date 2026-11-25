import type { Metadata } from "next";
import BookingLookup from "@/components/site/BookingLookup";

export const metadata: Metadata = {
  title: "Find my booking",
  robots: { index: false, follow: false },
};

export default function BookingLookupPage() {
  return (
    <section className="shell py-16 md:py-24">
      <p className="eyebrow">Bookings</p>
      <h1 className="display-lg mt-4 text-champagne">Find my booking</h1>
      <p className="mt-4 max-w-xl text-sm leading-relaxed text-ash">
        Enter your booking reference and the phone number you used. We&apos;ll open your booking page
        with its status and any QR tickets.
      </p>
      <div className="mt-8">
        <BookingLookup />
      </div>
    </section>
  );
}
