-- =====================================================================
-- vw_competitions_overview — lista de competições para o front
-- Agrega, por competição: nº de atletas, nº de participações (entries),
-- nº de resultados, categorias de idade e estilos presentes, e a origem
-- (arena, xlsx ou avaliação) inferida.
-- =====================================================================

create or replace view vw_competitions_overview as
select
  c.id,
  c.code,
  c.name,
  c.year,
  c.arena_id is not null                       as from_arena,
  count(distinct ae.athlete_id)                as athletes,
  count(distinct ae.id)                        as entries,
  count(distinct er.id)                        as results,
  count(distinct ac.code)                      as age_categories,
  count(distinct st.code)                      as styles,
  count(distinct s.code)                       as states
from competitions c
left join competition_categories cc on cc.competition_id = c.id
left join athlete_entries ae        on ae.competition_category_id = cc.id
left join entry_results er          on er.athlete_entry_id = ae.id
left join age_categories ac         on ac.id = cc.age_category_id
left join styles st                 on st.id = cc.style_id
left join states s                  on s.id = ae.state_id
group by c.id, c.code, c.name, c.year, c.arena_id
order by c.year desc nulls last, c.name;

-- RLS: leitura para autenticados
revoke all on vw_competitions_overview from anon;
grant select on vw_competitions_overview to authenticated;