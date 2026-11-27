-- Avishkaar: 5-Table Schema, Storage Bucket, RLS & Atomic Vouch/Check-in/Badge RPCs

create extension if not exists "pgcrypto";

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  trailblazer_score integer not null default 0,
  tier text generated always as (
    case
      when trailblazer_score >= 300 then 'Local Legend'
      when trailblazer_score >= 100 then 'Pathfinder'
      else 'Wanderer'
    end
  ) stored,
  is_guide boolean not null default false,
  is_verified_local boolean not null default false,
  guide_region text,
  languages text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 2. PLACES
create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  region text not null,
  category text not null,
  raw_description text not null,
  lat double precision not null,
  lng double precision not null,
  media jsonb not null default '[]'::jsonb,
  structured_cards jsonb not null default '{}'::jsonb,
  local_vendors jsonb not null default '[]'::jsonb,
  safety_alerts jsonb not null default '[]'::jsonb,
  mainstream_popularity_index integer not null default 10 check (mainstream_popularity_index >= 0),
  vouches_count integer not null default 0 check (vouches_count >= 0),
  verified_checkins_count integer not null default 0 check (verified_checkins_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_places_region_category on public.places (region, category);
create index if not exists idx_places_coords on public.places (lat, lng);

-- 3. VOUCHES (also tracks per-user check-in state to keep schema at 5 tables)
create table if not exists public.vouches (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  checked_in_at timestamptz,
  vouched_at timestamptz,
  is_verified_visit boolean not null default false,
  points_awarded integer not null default 0,
  created_at timestamptz not null default now(),
  unique (place_id, user_id)
);

-- 4. USER BADGES
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null,
  badge_name text not null,
  description text not null,
  awarded_at timestamptz not null default now(),
  unique (user_id, badge_key)
);

-- 5. GUIDE REQUESTS
create table if not exists public.guide_requests (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.places(id) on delete cascade,
  guide_id uuid not null references public.profiles(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  preferred_date date,
  notes text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Accepted')),
  created_at timestamptz not null default now()
);

-- STORAGE BUCKET FOR PHOTOS & SHORT CLIPS
insert into storage.buckets (id, name, public)
values ('place-media', 'place-media', true)
on conflict (id) do nothing;

-- HELPER: AWARD MILESTONE BADGES
create or replace function public.award_milestone_badges(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_score integer;
  v_places_count integer;
  v_food_activity_count integer;
begin
  select trailblazer_score into v_score from public.profiles where id = p_user_id;
  select count(*) into v_places_count from public.places where author_id = p_user_id;
  select count(*) into v_food_activity_count
  from public.vouches v
  join public.places p on p.id = v.place_id
  where v.user_id = p_user_id
    and v.vouched_at is not null
    and (p.category ilike '%Cuisine%' or jsonb_array_length(coalesce(p.structured_cards->'food', '[]'::jsonb)) >= 2);

  if v_places_count >= 1 then
    insert into public.user_badges (user_id, badge_key, badge_name, description)
    values (p_user_id, 'first_discovery', 'First Discovery', 'Shared your first offbeat hidden gem with the community.')
    on conflict (user_id, badge_key) do nothing;
  end if;

  if v_food_activity_count >= 2 then
    insert into public.user_badges (user_id, badge_key, badge_name, description)
    values (p_user_id, 'foodie_scout', 'Foodie Scout', 'Vouched for at least 2 regional food & heritage experiences.')
    on conflict (user_id, badge_key) do nothing;
  end if;

  if coalesce(v_score, 0) >= 300 then
    insert into public.user_badges (user_id, badge_key, badge_name, description)
    values (p_user_id, 'local_legend', 'Local Legend', 'Reached 300+ Trailblazer Points and unlocked priority visibility.')
    on conflict (user_id, badge_key) do nothing;
  end if;
end;
$$;

-- ATOMIC CHECK-IN RPC
create or replace function public.check_in_place(p_place_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing public.vouches%rowtype;
  v_author_id uuid;
  v_delta integer := 0;
begin
  select author_id into v_author_id from public.places where id = p_place_id;
  if v_author_id is null then
    raise exception 'Place not found';
  end if;

  select * into v_existing from public.vouches where place_id = p_place_id and user_id = p_user_id;

  if v_existing.id is null then
    insert into public.vouches (place_id, user_id, checked_in_at, is_verified_visit, points_awarded)
    values (p_place_id, p_user_id, now(), true, 0);

    update public.places
    set verified_checkins_count = verified_checkins_count + 1
    where id = p_place_id;
  elsif v_existing.checked_in_at is null then
    -- If user already vouched before checking in, upgrade vouch from +10 to +25 (+15 delta)
    if v_existing.vouched_at is not null and v_existing.points_awarded < 25 then
      v_delta := 25 - v_existing.points_awarded;
    end if;

    update public.vouches
    set checked_in_at = now(),
        is_verified_visit = true,
        points_awarded = points_awarded + v_delta
    where id = v_existing.id;

    update public.places
    set verified_checkins_count = verified_checkins_count + 1
    where id = p_place_id;

    if v_delta > 0 then
      update public.profiles
      set trailblazer_score = trailblazer_score + v_delta
      where id = v_author_id;
      perform public.award_milestone_badges(v_author_id);
    end if;
  end if;

  return jsonb_build_object('checked_in', true, 'bonus_delta', v_delta);
end;
$$;

-- ATOMIC VOUCH RPC (+10 standard, +25 verified visit)
create or replace function public.vouch_place(p_place_id uuid, p_user_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing public.vouches%rowtype;
  v_author_id uuid;
  v_points integer := 0;
begin
  select author_id into v_author_id from public.places where id = p_place_id;
  if v_author_id is null then
    raise exception 'Place not found';
  end if;

  select * into v_existing from public.vouches where place_id = p_place_id and user_id = p_user_id;

  if v_existing.id is null then
    v_points := 10;
    insert into public.vouches (place_id, user_id, vouched_at, is_verified_visit, points_awarded)
    values (p_place_id, p_user_id, now(), false, v_points);

    update public.places set vouches_count = vouches_count + 1 where id = p_place_id;
  elsif v_existing.vouched_at is null then
    v_points := case when v_existing.checked_in_at is not null then 25 else 10 end;
    update public.vouches
    set vouched_at = now(),
        is_verified_visit = (v_existing.checked_in_at is not null),
        points_awarded = v_points
    where id = v_existing.id;

    update public.places set vouches_count = vouches_count + 1 where id = p_place_id;
  elsif v_existing.checked_in_at is not null and v_existing.points_awarded < 25 then
    v_points := 25 - v_existing.points_awarded;
    update public.vouches
    set is_verified_visit = true,
        points_awarded = 25
    where id = v_existing.id;
  end if;

  if v_points > 0 then
    update public.profiles
    set trailblazer_score = trailblazer_score + v_points
    where id = v_author_id;

    perform public.award_milestone_badges(v_author_id);
    perform public.award_milestone_badges(p_user_id);
  end if;

  return jsonb_build_object('vouched', true, 'points_awarded', v_points);
end;
$$;

-- RLS POLICIES
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.vouches enable row level security;
alter table public.user_badges enable row level security;
alter table public.guide_requests enable row level security;

create policy "Public read profiles" on public.profiles for select using (true);
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id);

create policy "Public read places" on public.places for select using (true);
create policy "Authenticated insert places" on public.places for insert with check (auth.uid() = author_id);
create policy "Authors update own places" on public.places for update using (auth.uid() = author_id);

create policy "Public read vouches" on public.vouches for select using (true);
create policy "Users manage own vouches" on public.vouches for all using (auth.uid() = user_id);

create policy "Public read badges" on public.user_badges for select using (true);

create policy "Requester or guide read requests" on public.guide_requests
  for select using (auth.uid() = requester_id or auth.uid() = guide_id);
create policy "Authenticated create guide request" on public.guide_requests
  for insert with check (auth.uid() = requester_id);
create policy "Guide updates request status" on public.guide_requests
  for update using (auth.uid() = guide_id);
