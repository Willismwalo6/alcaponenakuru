"use client";

import { useState } from "react";
import { RESERVATION_CATEGORIES, SEATING_AREAS, whatsappLink } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { todayInput } from "@/lib/format";

type Success = {
  reference: string;
  date: string;
  guests: number;
  category: string;
};

export default function ReservationForm({ whatsapp }: { whatsapp: string }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    arrival_time: "",
    guests: "2",
    category: "VIP Table",
    seating: "No preference",
    requests: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, guests: Number(form.guests) }),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) {
        setError(data.error || "We could not submit your enquiry. Please try again.");
        setSubmitting(false);
        return;
      }
      setSuccess({
        reference: data.reference,
        date: form.date,
        guests: Number(form.guests),
        category: form.category,
      });
      setSubmitting(false);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (success) {
    const message = [
      "Hello Al Capone, I have submitted a reservation enquiry.",
      "",
      `Reference: ${success.reference}`,
      `Category: ${success.category}`,
      `Date: ${success.date}`,
      `Guests: ${success.guests}`,
    ].join("\n");

    return (
      <div className="surface p-8 md:p-10">
        <span className="tag tag-live">Enquiry received</span>
        <h2 className="display-md mt-5 text-champagne">We have your request</h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ash">
          Your enquiry has been logged. Our team will review availability and contact you to confirm.
          A table is only booked once we confirm it with you — this enquiry is not a confirmation.
        </p>

        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="label mb-1">Reference</dt>
            <dd className="font-display text-2xl tracking-wider text-champagne">{success.reference}</dd>
          </div>
          <div>
            <dt className="label mb-1">Requested date</dt>
            <dd className="text-sm text-champagne">{formatDate(success.date)}</dd>
          </div>
          <div>
            <dt className="label mb-1">Guest count</dt>
            <dd className="text-sm text-champagne">{success.guests}</dd>
          </div>
          <div>
            <dt className="label mb-1">Category</dt>
            <dd className="text-sm text-champagne">{success.category}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={whatsappLink(whatsapp, message)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-solid"
          >
            Send on WhatsApp
          </a>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setSuccess(null);
              setForm((prev) => ({ ...prev, requests: "" }));
            }}
          >
            Submit another enquiry
          </button>
        </div>
        <p className="mt-4 text-xs text-ash">
          Keep your reference — you can check the status any time with your reference and phone number.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="surface p-6 md:p-8">
      <h2 className="display-md text-champagne">Request a table</h2>
      <p className="mt-3 text-sm leading-relaxed text-ash">
        Send us your details and the team will confirm availability with you. Enquiries are not
        automatic confirmations.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="res-name">Full name</label>
          <input
            id="res-name"
            className="field"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="label" htmlFor="res-phone">Phone / WhatsApp</label>
          <input
            id="res-phone"
            type="tel"
            className="field"
            required
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="07XX XXX XXX"
          />
        </div>

        <div>
          <label className="label" htmlFor="res-email">Email (optional)</label>
          <input
            id="res-email"
            type="email"
            className="field"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="label" htmlFor="res-date">Preferred date</label>
          <input
            id="res-date"
            type="date"
            className="field"
            required
            min={todayInput()}
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="res-time">Arrival time (optional)</label>
          <input
            id="res-time"
            type="time"
            className="field"
            value={form.arrival_time}
            onChange={(e) => update("arrival_time", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="res-guests">Guests</label>
          <input
            id="res-guests"
            type="number"
            min={1}
            max={200}
            className="field"
            required
            value={form.guests}
            onChange={(e) => update("guests", e.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="res-category">Category</label>
          <select
            id="res-category"
            className="field"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          >
            {RESERVATION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="res-seating">Seating area</label>
          <select
            id="res-seating"
            className="field"
            value={form.seating}
            onChange={(e) => update("seating", e.target.value)}
          >
            {SEATING_AREAS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="res-requests">Special requests</label>
          <textarea
            id="res-requests"
            className="field min-h-28 resize-y"
            value={form.requests}
            onChange={(e) => update("requests", e.target.value)}
            placeholder="Birthday setup, dietary needs, table placement…"
          />
        </div>
      </div>

      {error ? (
        <p role="alert" className="mt-5 border border-crimson/50 bg-crimson/15 px-3 py-2 text-xs text-champagne">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn btn-solid mt-7 w-full sm:w-auto" disabled={submitting}>
        {submitting ? "Sending…" : "Send reservation enquiry"}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-ash/70">
        Submitting this form does not confirm a table. We will contact you on the number provided.
      </p>
    </form>
  );
}
