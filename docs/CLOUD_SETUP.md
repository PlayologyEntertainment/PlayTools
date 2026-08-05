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
2. **Site URL**: the production origin PlayTools is served from (see
   `.github/workflows/deploy.yml` — currently
   `https://playologyentertainment.com/PlayTools/`, adjust if that changes).
3. **Redirect URLs**: add that same origin (PlayTools reconstructs the
   redirect as `location.origin + location.pathname + '#/account'` — see
   `Auth.signInWithDiscord()` in `PlayTools.html`). If you test locally via
   `npm run serve`, also add that local origin (e.g. `http://localhost:8080`)
   here while testing.

## 5. Run the database migration

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste in the full contents of
   `supabase/migrations/20260805000000_cloud_sync_and_friends.sql` from this
   repo and run it. This creates the `profiles`, `dna_states`, and
   `friend_links` tables, their Row Level Security policies, and the
   `get_friend_dna` function — see `DD/CloudSync_DD.md` for what each piece
   does and why.

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
5. Manual friend-request round trip is a **later step** — Friends v2 isn't
   wired into the client yet (see `DD/CloudSync_DD.md` §7).

If anything in steps 1-5 doesn't match what's described (dashboard layout
changes, a renamed setting, etc.), the Supabase and Discord docs are the
source of truth — this file just says *where* to configure PlayTools'
specific pieces, not how those dashboards work in general.
