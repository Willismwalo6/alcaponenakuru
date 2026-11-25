# Al Capone Nakuru

Nightlife site for Al Capone, Nakuru: events, ticket requests, table reservations and an admin
dashboard. Bookings are requests — the club confirms them and payment is handled offline. There is
no payment gateway in this project.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Supabase Postgres (`postgres`), Supabase Storage
(`@supabase/supabase-js`). Everything runs on serverless hosting (for example Vercel) with no local
disk or SQLite.

## Setup with Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com) and wait for it to finish
   provisioning.
2. **Create the schema.** Open Dashboard → SQL → New query, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) and run it. It creates every table, index and the
   RLS policies (RLS is enabled with no public policies, so only the server can read/write).
3. **Create the media bucket.** Dashboard → Storage → New bucket, name it `media`, and mark it
   **public**. Images and the hero video are uploaded here by the admin dashboard.
4. **Copy the connection details** into `.env.local` (see `.env.example`):
   - `DATABASE_URL` — Project Settings → Database → Connection string → **Transaction pooler**
     (port `6543`). Transaction mode needs `prepare: false`, which the client already sets.
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — Project Settings → API. The service role key is
     server-only; never expose it to the browser.
   - `SUPABASE_STORAGE_BUCKET=media`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
     `ADMIN_NAME`, `SESSION_SECRET`.
5. **Install and run.**

   ```bash
   npm install
   npm run dev
   ```

6. **Sign in at `/admin`** with `ADMIN_EMAIL` / `ADMIN_PASSWORD`. The first server start creates that
   admin account and the default site settings. Then upload photography and the hero video from
   **Gallery**, and set the hero video and poster from **Content & settings**.

`npm run lint` type-checks the project and `npm run build` produces the production build.

In production, the app refuses to start without `DATABASE_URL`, `SESSION_SECRET` and
`ADMIN_PASSWORD`. There is no default password in the code.
