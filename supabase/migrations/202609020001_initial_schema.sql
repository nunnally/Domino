create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  photo_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists players_name_unique
  on public.players (lower(trim(name)));

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  played_at timestamptz not null,
  winner_ids text[] not null,
  loser_ids text[] not null,
  winner_score integer,
  loser_score integer,
  created_at timestamptz not null default now(),
  constraint games_two_winners check (cardinality(winner_ids) = 2),
  constraint games_two_losers check (cardinality(loser_ids) = 2),
  constraint games_distinct_winners check (winner_ids[1] <> winner_ids[2]),
  constraint games_distinct_losers check (loser_ids[1] <> loser_ids[2]),
  constraint games_distinct_teams check (not (winner_ids && loser_ids)),
  constraint games_valid_score check (
    (winner_score is null and loser_score is null)
    or (winner_score is not null and loser_score is not null and winner_score > loser_score and loser_score >= 0)
  )
);

alter table public.players enable row level security;
alter table public.games enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.players to anon, authenticated;
grant select, insert on public.games to anon, authenticated;

create policy "public can read players" on public.players for select to anon, authenticated using (true);
create policy "public can add players" on public.players for insert to anon, authenticated with check (true);
create policy "public can update players" on public.players for update to anon, authenticated using (true) with check (true);
create policy "public can read games" on public.games for select to anon, authenticated using (true);
create policy "public can add games" on public.games for insert to anon, authenticated with check (true);

insert into public.players (id, name, photo_url, active, created_at) values
  ('00000000-0000-4000-8000-000000000001', 'César', 'https://api.dicebear.com/9.x/thumbs/svg?seed=Cesar', true, '2026-09-02T08:00:00-03:00'),
  ('00000000-0000-4000-8000-000000000002', 'Vinícius', 'https://api.dicebear.com/9.x/thumbs/svg?seed=Vinicius', true, '2026-09-02T08:00:00-03:00'),
  ('00000000-0000-4000-8000-000000000003', 'Machilas', 'https://api.dicebear.com/9.x/thumbs/svg?seed=Machilas', true, '2026-09-02T08:00:00-03:00'),
  ('00000000-0000-4000-8000-000000000004', 'Gustavo', 'https://api.dicebear.com/9.x/thumbs/svg?seed=Gustavo', true, '2026-09-02T08:00:00-03:00'),
  ('00000000-0000-4000-8000-000000000005', 'David', 'https://api.dicebear.com/9.x/thumbs/svg?seed=David', true, '2026-09-02T08:00:00-03:00'),
  ('00000000-0000-4000-8000-000000000006', 'Emanoel', 'https://api.dicebear.com/9.x/thumbs/svg?seed=Emanoel', true, '2026-09-02T08:00:00-03:00')
on conflict (id) do nothing;

insert into public.games (id, played_at, winner_ids, loser_ids, created_at) values
  ('10000000-0000-4000-8000-000000000001', '2026-09-02T09:00:00-03:00', array['00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004'], array['00000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000006'], '2026-09-02T08:00:00-03:00'),
  ('10000000-0000-4000-8000-000000000002', '2026-09-02T09:30:00-03:00', array['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'], array['00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004'], '2026-09-02T08:00:00-03:00'),
  ('10000000-0000-4000-8000-000000000003', '2026-09-02T10:00:00-03:00', array['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'], array['00000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000006'], '2026-09-02T08:00:00-03:00'),
  ('10000000-0000-4000-8000-000000000004', '2026-09-02T10:30:00-03:00', array['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'], array['00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004'], '2026-09-02T08:00:00-03:00'),
  ('10000000-0000-4000-8000-000000000005', '2026-09-02T11:00:00-03:00', array['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'], array['00000000-0000-4000-8000-000000000005','00000000-0000-4000-8000-000000000006'], '2026-09-02T08:00:00-03:00'),
  ('10000000-0000-4000-8000-000000000006', '2026-09-02T11:30:00-03:00', array['00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004'], array['00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002'], '2026-09-02T08:00:00-03:00'),
  ('10000000-0000-4000-8000-000000000007', '2026-09-02T12:00:00-03:00', array['00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000004'], array['00000000-0000-4000-8000-000000000006','00000000-0000-4000-8000-000000000002'], '2026-09-02T08:00:00-03:00')
on conflict (id) do nothing;
