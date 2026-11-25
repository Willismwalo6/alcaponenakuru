"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatKes } from "@/lib/format";

type TicketType = {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  sold: number;
  active: boolean;
};

type Props = {
  event: { id: number; title: string; slug: string };
  ticketTypes: TicketType[];
  notice: string;
};

const MAX_PER_CATEGORY = 12;

export default function BookingForm({ event, ticketTypes, notice }: Props) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const available = (t: TicketType) => (t.capacity ? Math.max(0, t.capacity - t.sold) : MAX_PER_CATEGORY);

  const total = useMemo(
    () =>
      ticketTypes.reduce((sum, t) => sum + (quantities[t.id] ?? 0) * t.price, 0),
    [quantities, ticketTypes],
  );

  const count = useMemo(
    () => Object.values(quantities).reduce((a, b) => a + b, 0),
    [quantities],
  );

  function setQuantity(t: TicketType, next: number) {
    const remaining = Math.min(available(t), MAX_PER_CATEGORY);
    const clamped = Math.max(0, Math.min(remaining, next));
    setQuantities((prev) => ({ ...prev, [t.id]: clamped }));
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!count) {
      setError("Select at least one ticket.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          name,
          email,
          phone,
          notes,
          lines: Object.entries(quantities)
            .filter(([, q]) => q > 0)
            .map(([id, quantity]) => ({ ticketTypeId: Number(id), quantity })),
        }),
      });
      const data = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok || !data.reference) {
        setError(data.error || "We could not submit your request. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/bookings/${data.reference}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      <div>
        <h2 className="display-md text-champagne">Ticket categories</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-ash">
          Choose your categories and quantities. Submitting a request does not charge you — the club
          confirms availability and collects payment directly.
        </p>

        <ul className="mt-8 divide-y divide-champagne/10 border-y border-champagne/10">
          {ticketTypes.map((t) => {
            const remaining = available(t);
            const soldOut = remaining === 0;
            const qty = quantities[t.id] ?? 0;
            return (
              <li key={t.id} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-display text-2xl tracking-wide text-champagne">{t.name}</h3>
                    {soldOut ? <span className="tag">Sold out</span> : null}
                    {!soldOut && t.capacity > 0 && remaining <= 10 ? (
                      <span className="tag tag-live">{remaining} left</span>
                    ) : null}
                  </div>
                  {t.description ? (
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ash">{t.description}</p>
                  ) : null}
                  <p className="mt-3 text-sm font-semibold text-champagne">{formatKes(t.price)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(t, qty - 1)}
                    disabled={qty === 0}
                    aria-label={`Remove one ${t.name}`}
                    className="flex h-10 w-10 items-center justify-center border border-champagne/25 text-lg text-champagne transition-colors hover:border-champagne/70 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-champagne">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(t, qty + 1)}
                    disabled={soldOut || qty >= Math.min(remaining, MAX_PER_CATEGORY)}
                    aria-label={`Add one ${t.name}`}
                    className="flex h-10 w-10 items-center justify-center border border-champagne/25 text-lg text-champagne transition-colors hover:border-champagne/70 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8">
          <h2 className="display-md text-champagne">Your details</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="booking-name">
                Full name
              </label>
              <input
                id="booking-name"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="label" htmlFor="booking-email">
                Email
              </label>
              <input
                id="booking-email"
                type="email"
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label" htmlFor="booking-phone">
                Phone
              </label>
              <input
                id="booking-phone"
                type="tel"
                className="field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoComplete="tel"
                placeholder="07XX XXX XXX"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="booking-notes">
                Notes (optional)
              </label>
              <textarea
                id="booking-notes"
                className="field min-h-24 resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Birthday, group name, accessibility needs…"
              />
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-8 lg:self-start">
        <div className="surface p-6">
          <h2 className="font-display text-2xl tracking-wide text-champagne">Booking summary</h2>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-ash">{event.title}</p>

          <ul className="mt-5 space-y-3 text-sm">
            {ticketTypes
              .filter((t) => (quantities[t.id] ?? 0) > 0)
              .map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-4 text-ash">
                  <span>
                    {t.name} <span className="text-ash/60">× {quantities[t.id]}</span>
                  </span>
                  <span className="text-champagne">{formatKes(t.price * (quantities[t.id] ?? 0))}</span>
                </li>
              ))}
            {count === 0 ? <li className="text-ash/70">No tickets selected yet.</li> : null}
          </ul>

          <div className="mt-5 flex items-end justify-between border-t border-champagne/10 pt-4">
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-ash">
              Total
            </span>
            <span className="font-display text-3xl leading-none text-champagne">{formatKes(total)}</span>
          </div>

          {error ? (
            <p role="alert" className="mt-4 border border-crimson/50 bg-crimson/15 px-3 py-2 text-xs text-champagne">
              {error}
            </p>
          ) : null}

          <button type="submit" className="btn btn-solid mt-6 w-full" disabled={submitting || count === 0}>
            {submitting ? "Submitting…" : "Submit booking request"}
          </button>

          <p className="mt-4 text-xs leading-relaxed text-ash">{notice}</p>
          <p className="mt-2 text-xs leading-relaxed text-ash/70">
            No online payment is taken on this site. Tickets are issued only after the club confirms
            your booking.
          </p>
        </div>
      </aside>
    </form>
  );
}
