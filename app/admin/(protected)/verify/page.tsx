import Link from "next/link";
import { checkTicketAction, redeemTicketAction } from "@/app/admin/actions";
import { Label, Notice, PageHeader, Pill } from "@/components/admin/ui";
import { getBookingReferenceForTicket, getEventById, getTicketByCode } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { qrDataUrl } from "@/lib/bookings";
import { siteUrl } from "@/lib/site";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; result?: string }>;
}) {
  const { code, result } = await searchParams;
  const ticket = code ? await getTicketByCode(code) : undefined;
  const event = ticket ? await getEventById(ticket.event_id) : undefined;
  const bookingRef = ticket ? await getBookingReferenceForTicket(ticket.booking_id) : undefined;
  const qr = ticket ? await qrDataUrl(`${siteUrl()}/tickets/${ticket.code}`) : null;

  return (
    <>
      <PageHeader
        title="Door check-in"
        subtitle="Scan a ticket QR to open its page, or type the ticket code. A ticket can only be checked in once."
      />

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <form action={checkTicketAction} className="border border-champagne/10 bg-ink-soft p-5">
            <label className="label" htmlFor="code">Ticket code</label>
            <input
              id="code"
              name="code"
              className="field font-mono uppercase tracking-[0.14em]"
              placeholder="ACT-XXXXXXXX"
              defaultValue={code ?? ""}
              required
            />
            <button type="submit" className="btn btn-solid mt-4 w-full">
              Look up ticket
            </button>
          </form>

          {result === "ok" ? <Notice tone="success">Checked in successfully.</Notice> : null}
          {result === "fail" ? <Notice tone="error">That ticket could not be checked in.</Notice> : null}

          <div className="border border-champagne/10 p-5 text-xs leading-relaxed text-ash">
            <p className="text-[0.5625rem] font-semibold uppercase tracking-[0.22em] text-champagne">
              How it works
            </p>
            <ul className="mt-3 space-y-2">
              <li>Each QR opens a public ticket page at /tickets/&lt;code&gt;.</li>
              <li>Paste or type the code here and confirm check-in at the door.</li>
              <li>Redeemed tickets cannot be redeemed again — the second attempt is rejected.</li>
              <li>Tickets only exist for confirmed bookings.</li>
            </ul>
          </div>
        </div>

        <div>
          {ticket ? (
            <div className="border border-champagne/15 bg-ink-soft p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Pill
                  status={ticket.status}
                  label={ticket.status === "valid" ? "valid" : ticket.status === "redeemed" ? "checked in" : "void"}
                />
                <span className="font-mono text-xs tracking-[0.12em] text-ash">{ticket.code}</span>
              </div>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row">
                {qr ? (
                  <img src={qr} alt="" className="h-32 w-32 shrink-0 bg-champagne p-1" />
                ) : null}
                <dl className="grid flex-1 gap-3 text-sm">
                  <div>
                    <Label>Holder</Label>
                    <p className="mt-1 text-champagne">{ticket.holder_name}</p>
                  </div>
                  <div>
                    <Label>Event</Label>
                    <p className="mt-1 text-champagne">{event?.title ?? "—"}</p>
                  </div>
                  <div>
                    <Label>Booking</Label>
                    <Link href={`/bookings/${bookingRef ?? ""}`} className="mt-1 block text-champagne underline decoration-champagne/30">
                      {bookingRef ?? "—"}
                    </Link>
                  </div>
                  <div>
                    <Label>Issued</Label>
                    <p className="mt-1 text-ash">{formatDateTime(ticket.created_at)}</p>
                  </div>
                  {ticket.redeemed_at ? (
                    <div>
                      <Label>Checked in</Label>
                      <p className="mt-1 text-ash">{formatDateTime(ticket.redeemed_at)}</p>
                    </div>
                  ) : null}
                </dl>
              </div>

              {ticket.status === "valid" ? (
                <form action={redeemTicketAction} className="mt-6">
                  <input type="hidden" name="code" value={ticket.code} />
                  <button type="submit" className="btn btn-solid w-full">
                    Check in this ticket
                  </button>
                </form>
              ) : (
                <p className="mt-6 border border-crimson/40 bg-crimson/10 px-4 py-3 text-xs text-champagne">
                  {ticket.status === "redeemed"
                    ? "This ticket has already been used and cannot be checked in again."
                    : "This ticket is void — admission is not valid."}
                </p>
              )}
            </div>
          ) : (
            <div className="border border-dashed border-champagne/20 p-10 text-center text-sm text-ash">
              {code ? "No ticket matches that code." : "Enter a ticket code to begin."}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
