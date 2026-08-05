# Cloud Account Setup (Discord OAuth2 + Supabase)

PlayTools' optional Cloud Account feature (see `DD/CloudSync_DD.md`) needs a
Supabase project with Discord enabled as an Auth provider. This is a one-time
setup the project owner does — the code ships against placeholder config and
does nothing until these steps are done and two values are pasted in.

Nothing in this feature requires touching `main` or redeploying blind: you
can do all of the setup below, hand back the two values in step 5, and the
app stays fully anonymous/local-only for every player until then.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (any
   name/region).
2. Wait for provisioning to finish, then open **Project Settings → API**.
   You'll need two values from this page in step 5: the **Project URL** and
   the **anon / public** API key. (The anon key is safe to paste into a
   public web page — Supabase's security model is Row Level Security on the
   database, not secrecy of this key. Do **not** use the `service_role` key
   anywhere client-side.)

## 2. Register a Discord application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   and create a new application (e.g. "PlayTools").
2. Under **OAuth2 → General**, note the **Client ID** and **Client Secret**
   (regenerate if you don't have the secret handy — you'll paste it into
   Supabase, never into this repo).
3. Under **OAuth2 → Redirects**, add the callback URL Supabase's dashboard
   shows you in the next step (format:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`).

## 3. Enable Discord as a Supabase Auth provider

1. In the Supabase dashboard: **Authentication → Providers → Discord**.
2. Toggle it on, paste in the Discord **Client ID** and **Client Secret**
   from step 2, and save. Supabase shows the exact redirect URL to put in
   Discord here too — make sure it matches what you added in step 2.3.

## 4. Set the Site URL and allowed redirect URLs

1. **Authentication → URL Configuration**.
2. **Site URL**: the exact origin players actually use to reach PlayTools
   (check your address bar / bookmarks — `www` and bare-domain are two
   *different* origins with two different local saves, so pick the one
   that's actually canonical for you, e.g.
   `https://www.playologyentertainment.com/PlayTools/PlayTools.html`).
3. **Redirect URLs**: add a wildcard for that same origin, e.g.
   `https://www.playologyentertainment.com/PlayTools/**` (PlayTools
   reconstructs the redirect as `location.origin + location.pathname` — see
   `Auth.signInWithDiscord()` in `PlayTools.html`; it deliberately does
   **not** append `#/account` here, since Supabase's own callback also uses
   the URL hash/query to deliver the session — the app hops to `#/account`
   itself client-side once sign-in actually completes). If you test locally
   via `npm run serve`, also add that local origin (e.g.
   `http://localhost:8080/**`) here while testing.

## 5. Run the database migration

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste in the full contents of
   `supabase/migrations/20260805000000_cloud_sync_and_friends.sql` from this
   repo and run it. This creates the `profiles`, `dna_states`, and
   `friend_links` tables, their Row Level Security policies, and the
   `get_friend_dna` function — see `DD/CloudSync_DD.md` for what each piece
   does and why.
3. If Cloud Account was already live before you ran the migration above (any
   player already signed in with Discord), also run
   `supabase/migrations/20260805190000_backfill_profiles_for_existing_users.sql`.
   The `profiles` row for each player is only created by a trigger on *new*
   sign-ins — anyone who signed in earlier has a real account but no
   `profiles` row, which makes Friends v2 search silently find nothing for
   them even though their username is typed correctly. This migration
   backfills those rows once; it's a no-op for anyone the trigger already
   covered. Safe to run any time, and safe to re-run.

## 6. Hand back two values

Once steps 1-5 are done, the only thing left is pasting two values into
`PlayTools.html`'s `Auth` module (near the top, look for
`SUPABASE_URL`/`SUPABASE_ANON_KEY`):

- **Project URL** (from step 1) → `SUPABASE_URL`
- **anon / public API key** (from step 1) → `SUPABASE_ANON_KEY`

Both are safe to commit — neither is a secret by Supabase's own design (the
Discord Client Secret, which *is* sensitive, never leaves the Supabase
dashboard and is never pasted into this repo).

## 7. Verify

After filling in the two values and deploying:
1. Load PlayTools — the rail should now show a "🔑 Sign In" entry.
2. Visit `#/account` and click **Sign in with Discord** — you should land
   back on `#/account` signed in after the Discord consent screen.
3. Make some progress (complete a tool, claim a Rig daily), confirm the
   sync status shows "Synced …".
4. Open the same account in a second browser/profile, sign in, and confirm
   the progress appears there too.
5. Friends v2 is wired in: sign in as a second account, go to `#/friends`,
   search for the first account's Discord username under "☁️ Discord
   Friends" and send a request. Back on the first account, accept it from
   the incoming-requests list — both accounts should now show each other
   in their roster with live (redacted) stats (see `DD/CloudSync_DD.md` §7).
   This exact round trip is also covered by an automated (mocked-transport)
   smoke test — `playtools-friends` in `test/smoke.mjs` — but that test
   fakes out Supabase entirely, so it can't confirm your real project's
   OAuth setup or RLS policies actually work; step 5 here is the one check
   only a live project + real Discord accounts can do.

If anything in steps 1-5 doesn't match what's described (dashboard layout
changes, a renamed setting, etc.), the Supabase and Discord docs are the
source of truth — this file just says *where* to configure PlayTools'
specific pieces, not how those dashboards work in general.
