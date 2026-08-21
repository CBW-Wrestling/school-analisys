-- =====================================================================
-- get_athlete_detail(p_entry_id)
-- Retorna todos os dados de um atleta numa entry específica:
-- dados da competição, resultado, perfil social, físico e motor.
-- SECURITY DEFINER: acessa tabelas protegidas por RLS como o dono.
-- Bloqueado para usuários não autenticados.
-- =====================================================================
create or replace function get_athlete_detail(p_entry_id uuid)
returns table(
  athlete_name          text,
  birth_date            date,
  school                text,
  style                 text,
  weight                numeric,
  state                 text,
  gender                text,
  age_category_code     text,
  competition_code      text,
  competition_name      text,
  -- resultado
  rank                  integer,
  wins                  integer,
  losses                integer,
  technical_points_for  integer,
  technical_points_against integer,
  technical_points_diff integer,
  count_fights          integer,
  is_finalist_gold      boolean,
  is_not_ranked         boolean,
  -- perfil social
  practice_time         text,
  practice_location     text,
  practice_location_name text,
  weekly_frequency      text,
  practices_other_sport boolean,
  other_sports          text[],
  started_in_wrestling  boolean,
  -- físico
  arm_span_cm           numeric,
  height_cm             numeric,
  hand_grip_right       numeric,
  hand_grip_left        numeric,
  base_cm               numeric,
  forearm_right_cm      numeric,
  forearm_left_cm       numeric,
  placement             integer,
  -- motor (array json)
  motor_data            jsonb
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
    a.name::text                              as athlete_name,
    a.birth_date                              as birth_date,
    a.school::text                            as school,
    st.code::text                             as style,
    coalesce(wc.weight_kg, 0)                as weight,
    coalesce(s.code::text, '')               as state,
    cc.gender::text                           as gender,
    ac.code::text                             as age_category_code,
    c.code::text                              as competition_code,
    c.name::text                              as competition_name,
    er.rank,
    er.wins,
    er.losses,
    er.technical_points_for,
    er.technical_points_against,
    er.technical_points_diff,
    er.count_fights,
    er.is_finalist_gold,
    er.is_not_ranked,
    ap.practice_time,
    ap.practice_location,
    ap.practice_location_name,
    ap.weekly_frequency,
    ap.practices_other_sport,
    ap.other_sports,
    ap.started_in_wrestling,
    pa.arm_span_cm,
    pa.height_cm,
    pa.hand_grip_right,
    pa.hand_grip_left,
    pa.base_cm,
    pa.forearm_right_cm,
    pa.forearm_left_cm,
    pa.placement,
    (
      select jsonb_agg(
        jsonb_build_object(
          'competency', mc.name,
          'movement',   mm.name,
          'result',     mr.result
        ) order by mc.name, mm.name
      )
      from motor_assessments ma
      join motor_results mr       on mr.motor_assessment_id = ma.id
      join motor_movements mm     on mm.id = mr.movement_id
      join motor_competencies mc  on mc.id = mm.competency_id
      where ma.athlete_entry_id = p_entry_id
    )                                         as motor_data
  from athlete_entries ae
  join competition_categories cc    on cc.id  = ae.competition_category_id
  join competitions c               on c.id   = cc.competition_id
  join styles st                    on st.id  = cc.style_id
  join age_categories ac            on ac.id  = cc.age_category_id
  join athletes a                   on a.id   = ae.athlete_id
  left join weight_categories wc    on wc.id  = ae.weight_category_id
  left join states s                on s.id   = ae.state_id
  left join entry_results er        on er.athlete_entry_id = ae.id
  left join athlete_profiles ap     on ap.athlete_entry_id = ae.id
  left join physical_assessments pa on pa.athlete_entry_id = ae.id
  where ae.id = p_entry_id;
end;
$$;

revoke all on function get_athlete_detail(uuid) from public;
grant execute on function get_athlete_detail(uuid) to authenticated;
