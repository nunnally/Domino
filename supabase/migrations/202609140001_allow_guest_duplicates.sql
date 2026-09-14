-- O convidado representa uma pessoa aleatória e pode ocupar mais de um slot
-- na mesma partida. A validação da aplicação continua impedindo duplicatas
-- de jogadores reais; estas constraints antigas impediam também o convidado.
alter table public.games
  drop constraint if exists games_distinct_winners,
  drop constraint if exists games_distinct_losers,
  drop constraint if exists games_distinct_teams;
