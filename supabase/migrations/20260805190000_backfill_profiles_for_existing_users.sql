-- Backfill public.profiles for pre-existing Discord sign-ins.
--
-- Applied by the project owner via the Supabase dashboard SQL editor (or the
-- Supabase CLI), same as 20260805000000_cloud_sync_and_friends.sql. Run this
-- once, any time after that migration.
--
-- Why this is needed: public.handle_new_user() only runs via a trigger on
-- INSERT into auth.users (on_auth_user_created), which was created by
-- 20260805000000_cloud_sync_and_friends.sql. Cloud Account (Discord sign-in)
-- shipped a day earlier, so anyone who signed in with Discord before that
-- migration was actually run in this project has a real auth.users row and a
-- working synced account, but no public.profiles row — the trigger never
-- fired for them retroactively. Friends v2's search
-- (Cloud.searchProfiles(), PlayTools.html) only reads profiles.discord_username,
-- so those players are invisible to friend search even though their account
-- and Discord identity are completely real. This is a one-time catch-up
-- insert for exactly that gap — safe to re-run, and a no-op for anyone who
-- already has a profiles row (including everyone who signs in from now on,
-- since the trigger already covers them).
insert into public.profiles (id, discord_id, discord_username, discord_avatar_url)
select
  u.id,
  u.raw_user_meta_data ->> 'provider_id',
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
