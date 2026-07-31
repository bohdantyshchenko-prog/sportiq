create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  language text not null default 'en' check (language in ('en','ru','ua')),
  theme text not null default 'dark' check (theme in ('dark','light')),
  sports_iq integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.match_theses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  external_match_id text not null,
  outcome text not null,
  scenario text not null,
  reasoning jsonb not null default '{}'::jsonb,
  risk text not null default '',
  alternative_scenario text not null default '',
  change_trigger text not null default '',
  confidence smallint not null check (confidence between 0 and 100),
  sources jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft','locked','replayed')),
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.thesis_versions (
  id bigint generated always as identity primary key,
  thesis_id uuid not null references public.match_theses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.live_observations (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  thesis_id uuid not null references public.match_theses(id) on delete cascade,
  match_minute smallint,
  observation text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.decision_replays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  thesis_id uuid not null unique references public.match_theses(id) on delete cascade,
  scores jsonb not null default '{}'::jsonb,
  confirmed_assumptions jsonb not null default '[]'::jsonb,
  broken_assumptions jsonb not null default '[]'::jsonb,
  reflection text not null default '',
  sports_iq_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sports_memory_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pattern_key text not null,
  summary text not null,
  evidence jsonb not null default '[]'::jsonb,
  confidence smallint not null check (confidence between 0 and 100),
  status text not null default 'active' check (status in ('active','disputed','resolved')),
  updated_at timestamptz not null default now(),
  unique(user_id, pattern_key)
);

alter table public.profiles enable row level security;
alter table public.match_theses enable row level security;
alter table public.thesis_versions enable row level security;
alter table public.live_observations enable row level security;
alter table public.decision_replays enable row level security;
alter table public.sports_memory_patterns enable row level security;

create policy "profiles own rows" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "theses own rows" on public.match_theses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "versions own rows" on public.thesis_versions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "observations own rows" on public.live_observations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "replays own rows" on public.decision_replays for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "memory own rows" on public.sports_memory_patterns for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
