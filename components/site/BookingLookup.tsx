"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingLookup() {
  const router = useRouter();
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ reference: reference.trim(), phone: phone.trim() });
      const res = await fetch(`/api/bookings/lookup?${params.toString()}`);
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) {
        setError(data.error || "We could not find a booking with those details.");
        setLoading(false);
        return;
      }
      router.push(`/bookings/${data.reference}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="surface max-w-xl p-6 md:p-8">
      <div className="grid gap-5">
        <div>
          <label className="label" htmlFor="lookup-booking-ref">Booking reference</label>
          <input
            id="lookup-booking-ref"
            className="field"
            required
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="AC-XXXXXX"
          />
        </div>
        <div>
          <label className="label" htmlFor="lookup-booking-phone">Phone used on the booking</label>
          <input
            id="lookup-booking-phone"
            type="tel"
            className="field"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-5 border border-crimson/40 bg-crimson/10 px-3 py-2 text-xs text-champagne">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-solid mt-6 w-full" disabled={loading}>
        {loading ? "Looking up…" : "Open my booking"}
      </button>
    </form>
  );
}
