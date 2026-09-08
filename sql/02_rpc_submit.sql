-- =====================================================================
-- RPC: submit_assessment
-- Recebe UM formulário do front e faz toda a resolução no banco, numa
-- transação: resolve/cria atleta, competition_category, weight_category,
-- athlete_entry e então grava profile/physical/motor.
--
-- Roda com SECURITY DEFINER: executa com os privilégios do dono (que pode
-- escrever nas tabelas base), enquanto a chave anon NÃO tem escrita direta.
-- Assim a única forma de gravar é através desta função controlada.
--
-- Gênero é derivado do estilo quando não vier (WW->W, FS/GR->M), mantendo a
-- mesma regra da migração. Ajuste se seu cadastro usar outro código.
-- =====================================================================

create or replace function submit_assessment(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_kind        text := payload->>'kind';          -- 'profile'|'physical'|'motor'
  v_event       text := payload->>'event';         -- '24_jebs' | '25_jejs'
  v_name        text := nullif(trim(payload->>'name'), '');
  v_state       text := upper(nullif(trim(payload->>'state'), ''));
  v_style       text := upper(nullif(trim(payload->>'style'), ''));
  v_gender      text := nullif(trim(payload->>'gender'), '');
  v_weight      numeric := nullif(payload->>'weight','')::numeric;
  v_age_code    text := coalesce(payload->>'age_code', 'U17');

  v_competition_id uuid;
  v_age_id        uuid;
  v_style_id      uuid;
  v_state_id      uuid;
  v_cc_id         uuid;
  v_wc_id         uuid;
  v_athlete_id    uuid;
  v_entry_id      uuid;
  v_payload_entry_id uuid := nullif(payload->>'entry_id','')::uuid;
  v_ma_id         uuid;
  v_mov record;
begin
  -- validações mínimas
  if v_kind is null or v_event is null or v_name is null
     or v_state is null or v_style is null or v_weight is null then
    raise exception 'Campos obrigatórios ausentes (kind, event, name, state, style, weight).';
  end if;

  -- gênero derivado do estilo se não vier
  if v_gender is null then
    v_gender := case when v_style = 'WW' then 'W'
                     when v_style in ('FS','GR') then 'M' end;
  end if;
  if v_gender is null then
    raise exception 'Não foi possível determinar o gênero para o estilo %', v_style;
  end if;

  -- resolver referências (devem existir; senão erro claro)
  select id into v_competition_id from competitions   where code = v_event;
  if v_competition_id is null then raise exception 'Competição % inexistente', v_event; end if;

  select id into v_age_id from age_categories where code = v_age_code;
  if v_age_id is null then raise exception 'Categoria de idade % inexistente', v_age_code; end if;

  select id into v_style_id from styles where code = v_style;
  if v_style_id is null then raise exception 'Estilo % inexistente', v_style; end if;

  select id into v_state_id from states where code = v_state;
  -- state_id é nullable; se não achar, segue null

  if v_payload_entry_id is not null then
    -- entry_id veio do front: usa a participação já selecionada pelo
    -- usuário em vez de resolver o atleta de novo por nome (nome não é
    -- identificador único — homônimos causariam associação incorreta).
    select ae.id, ae.athlete_id, ae.competition_category_id, ae.weight_category_id
      into v_entry_id, v_athlete_id, v_cc_id, v_wc_id
      from athlete_entries ae
     where ae.id = v_payload_entry_id;

    if v_entry_id is null then
      raise exception 'Entry % inexistente', v_payload_entry_id;
    end if;
  else
    -- sem entry_id no payload: comportamento legado, resolve/cria por nome
    -- e categorias (mantido para não quebrar chamadores que não enviam
    -- entry_id).

    -- competition_category (cria se não existir)
    select id into v_cc_id from competition_categories
     where competition_id = v_competition_id and age_category_id = v_age_id
       and style_id = v_style_id and gender = v_gender;
    if v_cc_id is null then
      insert into competition_categories (competition_id, age_category_id, style_id, gender)
      values (v_competition_id, v_age_id, v_style_id, v_gender)
      returning id into v_cc_id;
    end if;

    -- weight_category (cria se não existir, respeitando a FK composta)
    select id into v_wc_id from weight_categories
     where competition_category_id = v_cc_id and weight_kg = v_weight;
    if v_wc_id is null then
      insert into weight_categories (competition_category_id, weight_kg)
      values (v_cc_id, v_weight)
      returning id into v_wc_id;
    end if;

    -- atleta (cria se não existir por nome; dados pessoais opcionais)
    select id into v_athlete_id from athletes where name = v_name limit 1;
    if v_athlete_id is null then
      insert into athletes (name, birth_date, email, school)
      values (
        v_name,
        nullif(payload->>'birth','')::date,
        nullif(payload->>'email',''),
        nullif(payload->>'school','')   -- só grava se vier; trate base legal!
      )
      returning id into v_athlete_id;
    end if;

    -- entry (participação) — cria se não existir
    select id into v_entry_id from athlete_entries
     where athlete_id = v_athlete_id and competition_category_id = v_cc_id
       and weight_category_id = v_wc_id;
    if v_entry_id is null then
      insert into athlete_entries (athlete_id, competition_category_id, weight_category_id, state_id)
      values (v_athlete_id, v_cc_id, v_wc_id, v_state_id)
      returning id into v_entry_id;
    end if;
  end if;

  -- ---------- grava conforme o tipo ----------
  if v_kind = 'profile' then
    insert into athlete_profiles (
      athlete_entry_id, practice_time, practice_location,
      practice_location_name, weekly_frequency,
      practices_other_sport, other_sports, started_in_wrestling
    ) values (
      v_entry_id,
      payload->>'practice_time',
      payload->>'practice_location',
      payload->>'practice_location_name',
      payload->>'weekly_frequency',
      (payload->>'practices_other_sport')::boolean,
      case when payload ? 'other_sports'
           then array(select jsonb_array_elements_text(payload->'other_sports'))
           else null end,
      (payload->>'started_in_wrestling')::boolean
    )
    on conflict (athlete_entry_id) do update set
      practice_time = excluded.practice_time,
      practice_location = excluded.practice_location,
      practice_location_name = excluded.practice_location_name,
      weekly_frequency = excluded.weekly_frequency,
      practices_other_sport = excluded.practices_other_sport,
      other_sports = excluded.other_sports,
      started_in_wrestling = excluded.started_in_wrestling,
      updated_at = now();

  elsif v_kind = 'physical' then
    insert into physical_assessments (
      athlete_entry_id, arm_span_cm, height_cm, hand_grip_right,
      hand_grip_left, base_cm, forearm_right_cm, forearm_left_cm, placement
    ) values (
      v_entry_id,
      nullif(payload->>'arm_span_cm','')::numeric,
      nullif(payload->>'height_cm','')::numeric,
      nullif(payload->>'hand_grip_right','')::numeric,
      nullif(payload->>'hand_grip_left','')::numeric,
      nullif(payload->>'base_cm','')::numeric,
      nullif(payload->>'forearm_right_cm','')::numeric,
      nullif(payload->>'forearm_left_cm','')::numeric,
      nullif(payload->>'placement','')::int
    )
    on conflict (athlete_entry_id) do update set
      arm_span_cm = excluded.arm_span_cm,
      height_cm = excluded.height_cm,
      hand_grip_right = excluded.hand_grip_right,
      hand_grip_left = excluded.hand_grip_left,
      base_cm = excluded.base_cm,
      forearm_right_cm = excluded.forearm_right_cm,
      forearm_left_cm = excluded.forearm_left_cm,
      placement = excluded.placement,
      updated_at = now();

  elsif v_kind = 'motor' then
    -- garante um motor_assessment por entry
    select id into v_ma_id from motor_assessments where athlete_entry_id = v_entry_id;
    if v_ma_id is null then
      insert into motor_assessments (athlete_entry_id, started_at)
      values (v_entry_id, now())
      returning id into v_ma_id;
    end if;

    -- results: payload->'results' = [{movement, result}, ...]
    for v_mov in
      select value->>'movement' as movement, value->>'result' as result
      from jsonb_array_elements(payload->'results')
    loop
      insert into motor_results (motor_assessment_id, movement_id, result)
      select v_ma_id, mm.id, v_mov.result
      from motor_movements mm
      where mm.name = v_mov.movement
      on conflict do nothing;  -- evita duplicar mesmo movimento
    end loop;

  else
    raise exception 'kind inválido: %', v_kind;
  end if;

  return jsonb_build_object('ok', true, 'entry_id', v_entry_id);
end;
$$;

-- Permite que apenas usuários AUTENTICADOS chamem a função.
revoke all on function submit_assessment(jsonb) from public, anon;
grant execute on function submit_assessment(jsonb) to authenticated;