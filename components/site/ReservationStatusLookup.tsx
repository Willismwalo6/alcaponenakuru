"use client";

import { useState } from "react";
import { formatDate } from "@/lib/format";
import { RESERVATION_STATUS_LABELS } from "@/lib/site";

type Result = {
  reference: string;
  status: string;
  date: string;
  guests: number;
  category: string;
  createdAt: string;
};

export default function ReservationStatusLookup() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ reference: reference.trim(), phone: phone.trim() });
      const res = await fetch(`/api/reservations/status?${params.toString()}`);
      const data = (await res.json()) as Result & { error?: string };
      if (!res.ok) {
        setError(data.error || "We could not find that enquiry.");
      } else {
        setResult(data);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-champagne/10 p-6">
      <h3 className="font-display text-2xl tracking-wide text-champagne">Check your enquiry</h3>
      <p className="mt-2 text-sm text-ash">Use the reference we gave you and the phone number on the booking.</p>

      <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <div>
          <label className="label" htmlFor="lookup-ref">Reference</label>
          <input
            id="lookup-ref"
            className="field"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="RS-XXXXXX"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="lookup-phone">Phone</label>
          <input
            id="lookup-phone"
            type="tel"
            className="field"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
            required
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn btn-outline w-full sm:w-auto" disabled={loading}>
            {loading ? "Checking…" : "Check"}
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="mt-4 border border-crimson/40 bg-crimson/10 px-3 py-2 text-xs text-champagne">
          {error}
        </p>
      ) : null}

      {result ? (
        <dl className="mt-5 grid gap-3 border border-champagne/10 bg-graphite/30 p-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[0.5625rem] uppercase tracking-[0.2em] text-ash">Status</dt>
            <dd className="mt-1 font-semibold text-champagne">
              {RESERVATION_STATUS_LABELS[result.status] ?? result.status}
            </dd>
          </div>
          <div>
            <dt className="text-[0.5625rem] uppercase tracking-[0.2em] text-ash">Reference</dt>
            <dd className="mt-1 font-semibold text-champagne">{result.reference}</dd>
          </div>
          <div>
            <dt className="text-[0.5625rem] uppercase tracking-[0.2em] text-ash">Date</dt>
            <dd className="mt-1 text-champagne">{formatDate(result.date)}</dd>
          </div>
          <div>
            <dt className="text-[0.5625rem] uppercase tracking-[0.2em] text-ash">Guests</dt>
            <dd className="mt-1 text-champagne">{result.guests}</dd>
          </div>
        </dl>
      ) : null}
    </div>
  );
}
