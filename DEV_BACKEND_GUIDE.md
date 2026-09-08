# Guia de preparação do backend e banco para desenvolvimento

Este guia é o handoff entre este frontend e `school-analysis-backend` (Kotlin/Spring Boot).
Ele enumera o contrato que o frontend consome e o que precisa existir no banco para subir um
ambiente de desenvolvimento funcional. Os scripts em `sql/` descrevem objetos PostgreSQL/
Supabase; eles não criam os controllers HTTP do backend.

## 1. Antes de iniciar

1. Configure o frontend com `VITE_API_URL=http://localhost:8082` (ajuste a porta se necessário).
2. Suba o backend com CORS liberado para `http://localhost:5173` e suporte a
   `Authorization: Bearer <access-token>`.
3. Crie ao menos um usuário autenticável e dados de referência: estilos `FS`, `GR`, `WW`, UFs,
   categorias de idade, uma competição, categorias da competição e categorias de peso.
4. Cadastre pelo menos um atleta/entry com perfil, avaliação física, avaliação técnica e resultado.
   Isso torna todos os dashboards verificáveis.

## 2. Banco de dados

### Ordem recomendada dos scripts existentes

Execute em um banco que já tenha o schema-base (tabelas como `athletes`, `athlete_entries`,
`competitions`, `athlete_profiles`, `physical_assessments` e as tabelas de motor):

1. `sql/08_schema_fix.sql`
2. `sql/01_views.sql`
3. `sql/04_competitions_view.sql`
4. `sql/05_competition_athletes_view.sql`
5. `sql/02_rpc_submit.sql`
6. `sql/07_get_competition_athletes_rpc.sql`
7. `sql/09_athlete_detail_rpc.sql`
8. `sql/10_imports_table.sql`
9. `sql/03_rls.sql`
10. `sql/06_collection_form_grants.sql`

Rode primeiro em um banco vazio de desenvolvimento. Os scripts de policies não são idempotentes:
antes de reaplicá-los, verifique se a policy já existe para evitar falha. Não conceda acesso de
leitura às tabelas pessoais ao papel `anon`.

### Importações de resultados

O frontend possui dois fluxos de importação. `imports` cobre arquivos de atletas; resultados
precisam de uma persistência equivalente. A opção mais simples é criar `results_imports` com o
mesmo formato de `imports`:

```sql
create table if not exists results_imports (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  status text not null default 'RECEIVED',
  selected_competition_id text,
  competitions_json text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by text,
  updated_by text
);
```

Use os estados `RECEIVED`, `ANALYZING`, `WAITING_COMPETITION`, `PROCESSING`, `COMPLETED` e
`FAILED`. O serviço deve persistir `error_message` em qualquer falha de parse ou importação.
Alternativamente, generalize `imports` com uma coluna `kind`; nesse caso mantenha os dois grupos
de endpoints abaixo para não quebrar o frontend.

## 3. Contratos HTTP obrigatórios

Todos os endpoints listados, exceto login, registro, refresh e callback Google, são consumidos
com bearer token. Respostas devem ser JSON; listas precisam retornar `[]`, não `null`.

### Autenticação

| Método e rota | Corpo ou retorno mínimo |
| --- | --- |
| `POST /api/auth/login` | Entrada `{ email, password }`; saída `{ accessToken, refreshToken }` |
| `POST /api/auth/register` | Entrada `{ email, password, name? }` |
| `POST /api/auth/refresh` | Entrada `{ refreshToken }`; saída `{ accessToken, refreshToken }` |
| `POST /api/auth/logout` | Entrada `{ refreshToken }` e bearer token |
| `GET /api/auth/me` | `{ email, name, photoUrl, provider }` |
| `GET /api/auth/google` | Inicia o callback OAuth; o retorno ao frontend deve trazer `accessToken` e `refreshToken` na query string |

### Catálogos, coleta e atletas

| Método e rota | Contrato mínimo |
| --- | --- |
| `GET /api/competitions` | `CompetitionRow[]`: `id`, `code`, `name`, `year`, `arenaId` |
| `GET /api/competitions/{code}/athletes` | `CompetitionAthlete[]`: `entryId`, `athleteName`, `style`, `weight`, `state`, `gender`, `ageCategoryCode`, `competitionCode`, `competitionName` |
| `POST /api/assessments` | Recebe os payloads de perfil, físico ou técnico descritos em `AssessmentWizard.tsx`; retorna sucesso e, idealmente, `entry_id` |
| `GET /api/athletes/entries/{entryId}` | `AthleteDetail`: `athleteName`, `competitionName`, `tags`, `rank`, `sections[]`; cada seção tem `code`, `title`, `icon`, `items[]` |
| `GET /api/motor/movements?style={FS|GR|WW}` | `MotorMovementGroup[]`: `id`, `code`, `name`, `movements[]` |
| `GET /api/enums/motor-results` | `EnumOption[]`: `code`, `label` |
| `GET /api/enums/practice-times` | `EnumOption[]`: `code`, `label` |
| `GET /api/enums/practice-locations` | `EnumOption[]`: `code`, `label` |
| `GET /api/enums/weekly-frequencies` | `EnumOption[]`: `code`, `label` |
| `GET /api/enums/other-sports` | `EnumOption[]`: `code`, `label` |
| `GET /api/physical/fields` | `PhysicalField[]`: `key`, `label`, `required` |
| `GET /api/physical/placement-options` | `PlacementOption[]`: `code`, `label` |

O RPC `submit_assessment(payload jsonb)` em `sql/02_rpc_submit.sql` documenta as colunas
gravadas e é uma referência útil para a camada Kotlin. Para evitar associação errada entre
homônimos, o backend deve priorizar `entry_id` enviado pelo frontend.

### Dashboards e resultados

| Método e rota | Contrato mínimo |
| --- | --- |
| `GET /api/dashboard/profiles` | `ProfileRow[]`: `estado`, `estilo`, `peso`, `tempoPratica`, `localPratica`, `frequenciaSemanal`, `flagOutraModalidade`, `iniciouNaLuta`, `eventIdentifier` |
| `GET /api/dashboard/profiles/summary` | `ProfileSummary`: totais e `byPracticeTime`, `byPracticeLocation`, `byWeeklyFrequency` |
| `GET /api/dashboard/physical` | `PhysicalRow[]`: `estado`, `estilo`, `peso`, `enverguturaCm`, `estaturaCm`, `prensaoManualD`, `prensaoManualE`, `eventIdentifier` |
| `GET /api/dashboard/physical/summary` | `PhysicalSummary`: totais, médias e `byState`, `byStyle` |
| `GET /api/dashboard/motor` | `MotorRow[]`: `estado`, `estilo`, `peso`, `avaliacao`, `resultado`, `competencia`, `eventIdentifier` |
| `GET /api/dashboard/motor/summary` | `MotorSummary`: totais e `byResult`, `byCompetency` |
| `GET /api/results?competitionId={uuid}` | `ResultRow[]`: `entryId`, `fullName`, `teamAlternateName`, `weightCategoryShortName`, `rank`, `wins`, `losses`, `technicalPointsFor`, `technicalPointsDiff`, `countFights`, `isNotRanked` |

As views em `sql/01_views.sql` são a fonte SQL de referência para os três endpoints de linhas.
Faça o mapeamento de nomes de coluna para os campos camelCase acima no backend. O typo público
`enverguturaCm` já existe no frontend; preserve-o até uma migração de contrato coordenada.

### Importações

| Método e rota | Contrato mínimo |
| --- | --- |
| `POST /api/imports` | Multipart `file`; saída `ImportResponse`: `importId`, `status`, `competitions[]` |
| `POST /api/imports/{id}/competition` | `{ competitionId }`; saída `ImportStatus` |
| `GET /api/imports/{id}` | `ImportStatus`: `importId`, `status`, `selectedCompetitionId`, `errorMessage` |
| `POST /api/results-imports` | Mesmo contrato de upload de `imports` |
| `POST /api/results-imports/{id}/competition` | Mesmo contrato de seleção de `imports` |
| `GET /api/results-imports/{id}` | Mesmo contrato de status de `imports` |

## 4. Dados ainda simulados no frontend

Estes itens estão isolados em `src/mocks/dashboard-gaps.ts`. Não remova um mock até o endpoint ou
campo real estar entregue, mapeado no `src/types.ts` e validado na tela correspondente.

1. **Pontuação técnica por atleta**: criar `GET /api/dashboard/motor/athlete-scores?competitionId={uuid}`
   retornando `{ entryId, averageScore }[]`. Agregar `motor_results` por
   `motor_assessments.athlete_entry_id` com a regra de pontuação do domínio. Substitui o mock das
   correlações técnicas.
2. **Tier de peso**: adicionar `weightTier: LEVE | MEDIO | PESADO` às linhas físicas. A regra deve
   vir da categoria de peso, idade e gênero, não de percentis no frontend. Substitui a heurística
   usada na tabela física.
3. **Antebraço**: expor `forearmRightCm` e `forearmLeftCm` em `/api/dashboard/physical`, usando
   `physical_assessments.forearm_right_cm` e `forearm_left_cm`. Os dados já são gravados pelo RPC.
4. **Outra modalidade**: adicionar `byOtherSport: CountByCode[]` a
   `/api/dashboard/profiles/summary`, agrupando `athlete_profiles.other_sports` por valor. Isso
   substitui a distribuição ponderada exibida em Atletas.

Os detalhes e o impacto de cada item estão em `BACKEND_GAPS.md`.

## 5. Checklist de smoke test

1. Autentique um usuário e confirme `GET /api/auth/me`.
2. Confirme que `/api/competitions` retorna uma competição e que
   `/api/competitions/{code}/athletes` retorna entries com UUID válido.
3. Envie uma coleta de cada tipo e verifique a atualização da entry sem duplicar atleta.
4. Abra Painel: `FS`, `GR` e `WW` devem iniciar marcados no filtro; ao limpar, todos devem ser
   selecionados novamente.
5. Abra Técnico, Físico, Atletas, Resultados e Inferências; verifique dados, vazio e erro de API.
6. Abra o detalhe de um atleta e valide as abas Resultado, Perfil, Físico e Técnico que tiverem
   dados.
7. Envie um arquivo de atletas e um de resultados; acompanhe cada status até `COMPLETED` ou uma
   mensagem persistida de `FAILED`.
8. Com usuário anônimo, confirme que dashboards, dados pessoais, views e RPCs protegidos não são
   expostos.

## 6. Antes do deploy dev

- Confirme no repositório Kotlin os controllers, DTOs, mapeamentos de coluna e queries para cada
  rota da seção 3.
- Execute as migrações em uma cópia do banco dev e registre a versão aplicada.
- Valide CORS, JWT e permissões de `authenticated`/`anon` depois de aplicar RLS.
- Rode `npm run build` e `npm run lint` neste frontend, então execute o checklist de smoke test
  contra o backend dev.