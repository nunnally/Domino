alter table public.players
  add column catchphrase text,
  add constraint players_catchphrase_length
    check (catchphrase is null or char_length(trim(catchphrase)) between 1 and 120);

alter table public.games
  add column latitude double precision,
  add column longitude double precision,
  add constraint games_location_complete
    check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null)),
  add constraint games_latitude_range
    check (latitude is null or latitude between -90 and 90),
  add constraint games_longitude_range
    check (longitude is null or longitude between -180 and 180);

update public.players
set catchphrase = 'O bem prevalece.'
where lower(trim(name)) = lower('César')
  and catchphrase is null;
