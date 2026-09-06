alter table public.games
  add column if not exists gabuada_ids text[] not null default '{}',
  add column if not exists sena_ids text[] not null default '{}';

do $$
declare
  joice_id text;
  cesar_id text;
  vinicius_id text;
  machilas_id text;
  gustavo_id text;
  david_id text;
  emanoel_id text;
begin
  select id::text into joice_id from public.players where lower(trim(name)) = 'joice' limit 1;
  if joice_id is null then
    insert into public.players (id, name, photo_url, active, created_at)
    values (
      '00000000-0000-4000-8000-000000000007',
      'Joice',
      'https://api.dicebear.com/10.x/thumbs/svg?seed=Joice',
      true,
      '2026-09-02T08:00:00-03:00'
    )
    returning id::text into joice_id;
  end if;

  select id::text into cesar_id from public.players where lower(trim(name)) = 'césar' limit 1;
  select id::text into vinicius_id from public.players where lower(trim(name)) = 'vinícius' limit 1;
  select id::text into machilas_id from public.players where lower(trim(name)) = 'machilas' limit 1;
  select id::text into gustavo_id from public.players where lower(trim(name)) = 'gustavo' limit 1;
  select id::text into david_id from public.players where lower(trim(name)) = 'david' limit 1;
  select id::text into emanoel_id from public.players where lower(trim(name)) = 'emanoel' limit 1;

  update public.games
  set sena_ids = array[emanoel_id]::text[]
  where id in (
    '10000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000007'
  );

  insert into public.games (
    id, played_at, winner_ids, loser_ids, gabuada_ids, sena_ids, created_at
  )
  values
    (
      '10000000-0000-4000-8000-000000000008',
      '2026-09-02T12:30:00-03:00',
      array[joice_id, cesar_id]::text[],
      array[david_id, emanoel_id]::text[],
      array[joice_id]::text[],
      '{}',
      '2026-09-02T08:00:00-03:00'
    ),
    (
      '10000000-0000-4000-8000-000000000009',
      '2026-09-02T13:00:00-03:00',
      array[joice_id, vinicius_id]::text[],
      array[machilas_id, gustavo_id]::text[],
      array[joice_id]::text[],
      '{}',
      '2026-09-02T08:00:00-03:00'
    )
  on conflict (id) do nothing;
end $$;
