create or replace function increment_score(player_id uuid, increment_amount int)
returns void as $$
begin
  update players
  set score = score + increment_amount
  where id = player_id;
end;
$$ language plpgsql;

