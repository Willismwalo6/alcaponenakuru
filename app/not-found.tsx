import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70svh] items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="eyebrow justify-center">404</p>
        <h1 className="display-lg mt-4 text-champagne">This page left the party</h1>
        <p className="mt-4 text-sm leading-relaxed text-ash">
          The page you were looking for doesn&apos;t exist — or the event has been taken down. Try the
          programme instead.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-solid">
            Back home
          </Link>
          <Link href="/events" className="btn btn-outline">
            View events
          </Link>
        </div>
      </div>
    </main>
  );
}
