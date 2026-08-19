-- =====================================================================
-- VIEWS DE DASHBOARD
-- Achatam os JOINs do modelo normalizado e devolvem exatamente as colunas
-- que o front (App.tsx) já consome — para não quebrar nenhuma tela.
--
-- Importante (privacidade): estas views NÃO expõem nome, nascimento, e-mail
-- ou escola. Servem só para os dashboards de análise, que usam dados
-- agregados. Dados pessoais ficam nas tabelas base, protegidas por RLS.
-- =====================================================================

-- ---------- PERFIL (tipo ProfileRow) ----------
-- ProfileRow: Estado, Estilo, Peso, tempo_pratica, local_pratica,
--             frequencia_semanal, flag_outra_modalidade, event_identifier
create or replace view vw_profile_dashboard as
select
  s.code                          as "Estado",
  st.code                         as "Estilo",
  wc.weight_kg::text              as "Peso",
  ap.practice_time                as tempo_pratica,
  ap.practice_location            as local_pratica,
  case when ap.practices_other_sport then 'sim' else 'nao' end
                                  as flag_outra_modalidade,
  c.code                          as event_identifier
from athlete_profiles ap
join athlete_entries ae            on ae.id = ap.athlete_entry_id
join competition_categories cc     on cc.id = ae.competition_category_id
join competitions c                on c.id  = cc.competition_id
join styles st                     on st.id = cc.style_id
left join states s                 on s.id  = ae.state_id
left join weight_categories wc     on wc.id = ae.weight_category_id;

-- ---------- FÍSICA (tipo PhysicalRow) ----------
-- PhysicalRow: Estado, Estilo, Peso, 'Envergadura (cm)', 'Estatura (cm)',
--              'Prensão manual (D)', 'Prensão manual (E)', event_identifier
create or replace view vw_physical_dashboard as
select
  s.code                          as "Estado",
  st.code                         as "Estilo",
  wc.weight_kg::text              as "Peso",
  pa.arm_span_cm::text            as "Envergadura (cm)",
  pa.height_cm::text              as "Estatura (cm)",
  pa.hand_grip_right::text        as "Prensão manual (D)",
  pa.hand_grip_left::text         as "Prensão manual (E)",
  c.code                          as event_identifier
from physical_assessments pa
join athlete_entries ae            on ae.id = pa.athlete_entry_id
join competition_categories cc     on cc.id = ae.competition_category_id
join competitions c                on c.id  = cc.competition_id
join styles st                     on st.id = cc.style_id
left join states s                 on s.id  = ae.state_id
left join weight_categories wc     on wc.id = ae.weight_category_id;

-- ---------- MOTORA (tipo MotorRow) ----------
-- MotorRow: Estado, Estilo, Peso, Avaliação, Resultado, Competência,
--           event_identifier  (uma linha por movimento avaliado)
create or replace view vw_motor_dashboard as
select
  s.code                          as "Estado",
  st.code                         as "Estilo",
  wc.weight_kg::text              as "Peso",
  mm.name                         as "Avaliação",
  mr.result                       as "Resultado",
  mc.name                         as "Competência",
  c.code                          as event_identifier
from motor_results mr
join motor_movements mm            on mm.id = mr.movement_id
join motor_competencies mc         on mc.id = mm.competency_id
join motor_assessments ma          on ma.id = mr.motor_assessment_id
join athlete_entries ae            on ae.id = ma.athlete_entry_id
join competition_categories cc     on cc.id = ae.competition_category_id
join competitions c                on c.id  = cc.competition_id
join styles st                     on st.id = cc.style_id
left join states s                 on s.id  = ae.state_id
left join weight_categories wc     on wc.id = ae.weight_category_id;