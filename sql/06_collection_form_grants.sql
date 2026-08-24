-- =====================================================================
-- 06_collection_form_grants.sql
-- Concede leitura das tabelas de dados ao papel 'authenticated' para
-- que o formulário de coleta possa exibir atletas e categorias.
--
-- Segurança mantida: anon continua sem acesso. Só usuários com login
-- (coordenadores, avaliadores) vêem os dados.
-- =====================================================================

-- Políticas de leitura (authenticated)
create policy ae_read         on athlete_entries        for select to authenticated using (true);
create policy cc_read         on competition_categories for select to authenticated using (true);
create policy athl_read       on athletes               for select to authenticated using (true);
create policy wc_read         on weight_categories      for select to authenticated using (true);

-- Grants de coluna
grant select on athlete_entries        to authenticated;
grant select on competition_categories to authenticated;
grant select on athletes               to authenticated;
grant select on weight_categories      to authenticated;

-- View de atletas por competição
revoke all on vw_competition_athletes from anon;
grant select on vw_competition_athletes to authenticated;
