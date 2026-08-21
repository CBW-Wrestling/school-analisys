-- =====================================================================
-- vw_competition_athletes — atletas inscritos por competição
-- Usado no formulário de coleta para seleção sem digitação manual.
-- =====================================================================
create or replace view vw_competition_athletes as
select
  c.code                           as competition_code,
  c.name                           as competition_name,
  a.name                           as athlete_name,
  st.code                          as style,
  coalesce(wc.weight_kg, 0)        as weight,
  coalesce(s.code, '')             as state,
  cc.gender,
  ac.code                          as age_category_code,
  ae.id                            as entry_id
from athlete_entries ae
join competition_categories cc     on cc.id  = ae.competition_category_id
join competitions c                on c.id   = cc.competition_id
join styles st                     on st.id  = cc.style_id
join age_categories ac             on ac.id  = cc.age_category_id
join athletes a                    on a.id   = ae.athlete_id
left join weight_categories wc     on wc.id  = ae.weight_category_id
left join states s                 on s.id   = ae.state_id
order by c.year desc nulls last, c.name, a.name;

revoke all on vw_competition_athletes from anon;
grant select on vw_competition_athletes to authenticated;
