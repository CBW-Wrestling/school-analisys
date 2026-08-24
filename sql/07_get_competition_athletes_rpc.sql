-- =====================================================================
-- get_competition_athletes(p_competition_code)
-- Retorna todos os atletas inscritos em uma competição.
-- SECURITY DEFINER: roda como o dono e ignora RLS nas tabelas base.
-- Concedida a anon para aparecer no schema cache do PostgREST; acesso
-- real é bloqueado dentro da função para usuários não autenticados.
-- =====================================================================
create or replace function get_competition_athletes(p_competition_code text)
returns table(
  entry_id          uuid,
  athlete_name      text,
  style             text,
  weight            numeric,
  state             text,
  gender            text,
  age_category_code text,
  competition_code  text,
  competition_name  text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'anon' then
    raise exception 'Não autorizado';
  end if;

  return query
  select
    ae.id                               as entry_id,
    a.name::text                        as athlete_name,
    st.code::text                       as style,
    coalesce(wc.weight_kg, 0)           as weight,
    coalesce(s.code::text, '')          as state,
    cc.gender::text                     as gender,
    ac.code::text                       as age_category_code,
    c.code::text                        as competition_code,
    c.name::text                        as competition_name
  from athlete_entries ae
  join competition_categories cc   on cc.id  = ae.competition_category_id
  join competitions c              on c.id   = cc.competition_id
  join styles st                   on st.id  = cc.style_id
  join age_categories ac           on ac.id  = cc.age_category_id
  join athletes a                  on a.id   = ae.athlete_id
  left join weight_categories wc   on wc.id  = ae.weight_category_id
  left join states s               on s.id   = ae.state_id
  where c.code = p_competition_code
  order by a.name;
end;
$$;

-- anon precisa de EXECUTE para o PostgREST incluir no schema cache.
-- A guarda auth.role() acima impede uso real sem login.
revoke all on function get_competition_athletes(text) from public;
grant execute on function get_competition_athletes(text) to anon, authenticated;
