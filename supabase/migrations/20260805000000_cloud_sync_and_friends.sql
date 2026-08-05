-- PlayTools Cloud Sync + Friends v2
--
-- Applied by the project owner via the Supabase dashboard SQL editor (or the
-- Supabase CLI) against a Supabase project that already has Discord enabled
-- as an Auth provider under Authentication > Providers > Discord. See
-- docs/CLOUD_SETUP.md for the full walkthrough.
--
-- This whole feature is opt-in and additive (see DD/CloudSync_DD.md) — none
-- of this is required for PlayTools to keep working exactly as it does
-- today for anonymous, local-only players.

-- =========================================================================
-- 1. PROFILES — a public-safe mirror of Discord identity, auto-created on
--    signup. Lets a signed-in user look another user up by Discord username
--    to send a friend request, without exposing auth.users directly.
-- =========================================================================
create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  discord_id         text,
  discord_username   text,
  discord_avatar_url text,
  gamer_tag          text,              -- best-effort mirror of dna.profile.gamerTag, refreshed on each sync push
  updated_at         timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Any signed-in user may look up any other user's public profile row (needed
-- to find a friend by Discord username). Only non-sensitive columns live here
-- (no email, no phone, no raw dna).
drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "user can insert own profile" on public.profiles;
create policy "user can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "user can update own profile" on public.profiles;
create policy "user can update own profile"
  on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "user can delete own profile" on public.profiles;
create policy "user can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

-- Auto-populate profiles on first Discord sign-in from the OAuth identity
-- metadata Supabase stores on auth.users.raw_user_meta_data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, discord_id, discord_username, discord_avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'provider_id',
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- 2. DNA STATE — one row per user holding the whitelisted sync-scope subset
--    of the client `dna` blob (Store.get() shape, PlayTools.html Store
--    module ~line 1933). Kept as a single jsonb column rather than
--    re-normalized into many tables, matching the client's existing shape.
--    See DD/CloudSync_DD.md for exactly which fields are/aren't included.
-- =========================================================================
create table if not exists public.dna_states (
  user_id           uuid primary key references auth.users(id) on delete cascade,
  dna               jsonb not null,
  client_updated_at timestamptz not null,  -- echoes the pushed dna.updatedAt, drives last-write-wins merge
  updated_at        timestamptz not null default now()
);

alter table public.dna_states enable row level security;

drop policy if exists "select own dna_state" on public.dna_states;
create policy "select own dna_state"
  on public.dna_states for select using (auth.uid() = user_id);

drop policy if exists "insert own dna_state" on public.dna_states;
create policy "insert own dna_state"
  on public.dna_states for insert with check (auth.uid() = user_id);

drop policy if exists "update own dna_state" on public.dna_states;
create policy "update own dna_state"
  on public.dna_states for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "delete own dna_state" on public.dna_states;
create policy "delete own dna_state"
  on public.dna_states for delete using (auth.uid() = user_id);

-- =========================================================================
-- 3. FRIEND LINKS — request/accept state between two Discord-identified
--    users. Shipped in the schema now so the owner only has to run this
--    migration once; the friend-request UI/client code lands in a later PR
--    (see DD/CloudSync_DD.md "Friends v2").
-- =========================================================================
create table if not exists public.friend_links (
  id            bigint generated always as identity primary key,
  requester_id  uuid not null references auth.users(id) on delete cascade,
  addressee_id  uuid not null references auth.users(id) on delete cascade,
  status        text not null default 'pending' check (status in ('pending','accepted','declined','blocked')),
  created_at    timestamptz not null default now(),
  responded_at  timestamptz,
  constraint no_self_friend check (requester_id <> addressee_id),
  constraint unique_pair unique (requester_id, addressee_id)
);
-- NOTE: unique_pair only blocks an exact duplicate (A->B twice); it does not
-- block A->B and B->A both existing as separate pending rows. Handled
-- client-side (Cloud.sendFriendRequest checks both directions before
-- inserting) rather than adding a normalized-pair generated column —
-- acceptable at this scale and documented as a known v1 gap.

alter table public.friend_links enable row level security;

drop policy if exists "select own friend links" on public.friend_links;
create policy "select own friend links"
  on public.friend_links for select
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "insert own friend request" on public.friend_links;
create policy "insert own friend request"
  on public.friend_links for insert
  with check (auth.uid() = requester_id);

drop policy if exists "update own side of friend link" on public.friend_links;
create policy "update own side of friend link"
  on public.friend_links for update
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "delete own friend link" on public.friend_links;
create policy "delete own friend link"
  on public.friend_links for delete
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- =========================================================================
-- 4. FRIEND-SAFE DNA READ — a SECURITY DEFINER RPC, not a raw select policy.
--    dna_states.dna.profile contains contacts{discord,email,phone} (see
--    Store.defaultDNA() in PlayTools.html) — a friend-of-friend RLS policy on
--    the raw jsonb column would leak those. This function strips profile
--    down to the fields the Friends compare UI actually renders and returns
--    null unless the caller and friend_id are mutually accepted friends.
-- =========================================================================
create or replace function public.get_friend_dna(friend_id uuid)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  is_friend boolean;
  result    jsonb;
begin
  select exists (
    select 1 from public.friend_links
    where status = 'accepted'
      and ((requester_id = auth.uid() and addressee_id = friend_id)
        or (requester_id = friend_id and addressee_id = auth.uid()))
  ) into is_friend;

  if not is_friend then
    return null;
  end if;

  select (dna - 'profile') || jsonb_build_object(
    'profile', jsonb_build_object(
      'gamerTag',   dna -> 'profile' ->> 'gamerTag',
      'accent',     dna -> 'profile' ->> 'accent',
      'avatar',     dna -> 'profile' -> 'avatar',
      'archetype',  dna -> 'profile' -> 'archetype'
    )
  )
  into result
  from public.dna_states
  where user_id = friend_id;

  return result;
end;
$$;

revoke all on function public.get_friend_dna(uuid) from public;
grant execute on function public.get_friend_dna(uuid) to authenticated;
