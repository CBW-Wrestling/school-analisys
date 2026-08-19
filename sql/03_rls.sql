-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- Modelo escolhido: equipe interna com login.
--   - Leitura das VIEWS de dashboard: liberada a usuários AUTENTICADOS.
--   - Escrita: NINGUÉM escreve direto; só via a RPC submit_assessment
--     (que roda como SECURITY DEFINER).
--   - Tabelas com dados pessoais (athletes): sem acesso direto pela anon.
--
-- Observação sobre views: no Postgres/Supabase, uma view roda com os
-- privilégios de quem a criou. Para controlar o acesso via login,
-- concedemos SELECT das views apenas ao papel 'authenticated'.
-- =====================================================================

-- 1) Ativa RLS nas tabelas base (bloqueia tudo por padrão).
alter table athletes                enable row level security;
alter table athlete_entries         enable row level security;
alter table athlete_profiles        enable row level security;
alter table physical_assessments    enable row level security;
alter table motor_assessments       enable row level security;
alter table motor_results           enable row level security;
alter table competition_categories  enable row level security;
alter table weight_categories       enable row level security;
alter table athletes                enable row level security;

-- (tabelas de referência podem permanecer legíveis a autenticados)
alter table competitions      enable row level security;
alter table age_categories    enable row level security;
alter table styles            enable row level security;
alter table states            enable row level security;
alter table motor_competencies enable row level security;
alter table motor_movements   enable row level security;

-- 2) Sem policies de INSERT/UPDATE/DELETE para anon/authenticated nas tabelas
--    base: a escrita acontece apenas pela função submit_assessment
--    (SECURITY DEFINER). Não criamos policies de escrita de propósito.

-- 3) Leitura das tabelas de referência para autenticados (a RPC precisa e
--    telas podem precisar). Ajuste se quiser restringir mais.
create policy ref_read_competitions      on competitions       for select to authenticated using (true);
create policy ref_read_age               on age_categories     for select to authenticated using (true);
create policy ref_read_styles            on styles             for select to authenticated using (true);
create policy ref_read_states            on states             for select to authenticated using (true);
create policy ref_read_competencies      on motor_competencies for select to authenticated using (true);
create policy ref_read_movements         on motor_movements    for select to authenticated using (true);

-- 4) VIEWS de dashboard: concede SELECT só a autenticados.
--    (revoga do anon para não vazar nada sem login)
revoke all on vw_profile_dashboard  from anon;
revoke all on vw_physical_dashboard from anon;
revoke all on vw_motor_dashboard    from anon;
grant select on vw_profile_dashboard  to authenticated;
grant select on vw_physical_dashboard to authenticated;
grant select on vw_motor_dashboard    to authenticated;

-- =====================================================================
-- RESULTADO:
--   * Sem login (anon): não lê dados nem escreve. Nada exposto.
--   * Com login (authenticated): lê as 3 views de dashboard e chama a RPC
--     para enviar formulários. Não acessa tabelas base diretamente.
--   * Dados pessoais (nome/nascimento/escola em athletes): nunca saem pela
--     anon e não aparecem nas views. Só a RPC os grava.
-- =====================================================================