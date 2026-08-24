-- =====================================================================
-- 08_schema_fix.sql
-- Adiciona a coluna weekly_frequency que submit_assessment referencia
-- mas não existe em athlete_profiles.
-- Todas as outras colunas do schema já existem no banco.
-- =====================================================================

alter table athlete_profiles
  add column if not exists weekly_frequency text;
