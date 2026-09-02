update public.players
set photo_url = 'assets/machilas.png'
where lower(trim(name)) = lower('Machilas');
