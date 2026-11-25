import Link from "next/link";
import EventForm from "@/components/admin/EventForm";
import { PageHeader } from "@/components/admin/ui";
import { listMedia } from "@/lib/db";

export default async function NewEventPage() {
  const media = await listMedia("image");

  return (
    <>
      <PageHeader
        title="New event"
        subtitle="Add a night to the programme. You can add ticket categories once the event exists."
      />
      <div className="mb-6">
        <Link href="/admin/events" className="text-[0.625rem] uppercase tracking-[0.18em] text-ash hover:text-champagne">
          ← All events
        </Link>
      </div>
      <EventForm media={media} />
    </>
  );
}
